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
STATICTOP = STATIC_BASE + 15208;
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
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,80,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,96,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,3,0,0,0,1,0,0,0,1,0,0,0,4,0,0,0,8,0,0,0,2,0,0,0,1,0,0,0,3,0,0,0,4,0,0,0,2,0,0,0,1,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,3,0,0,0,2,0,0,0,2,0,0,0,2,0,0,0,9,0,0,0,8,0,0,0,3,0,0,0,8,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,3,0,0,0,3,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,8,0,0,0,8,0,0,0,9,0,0,0,4,0,0,0,4,0,0,0,4,0,0,0,5,0,0,0,9,0,0,0,8,0,0,0,1,0,0,0,8,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,74,117,108,0,0,0,0,0,74,117,110,0,0,0,0,0,65,112,114,0,0,0,0,0,77,97,114,0,0,0,0,0,70,101,98,0,0,0,0,0,74,97,110,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,79,99,116,111,98,101,114,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,0,65,117,103,117,115,116,0,0,74,117,108,121,0,0,0,0,74,117,110,101,0,0,0,0,77,97,121,0,0,0,0,0,65,112,114,105,108,0,0,0,77,97,114,99,104,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,78,111,32,67,80,85,32,100,101,118,105,99,101,32,102,111,117,110,100,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,99,108,71,101,116,68,101,118,105,99,101,73,68,115,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,99,108,71,101,116,80,108,97,116,102,111,114,109,73,68,115,0,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,80,77,0,0,0,0,0,0,65,77,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,67,80,85,0,0,0,0,0,41,0,0,0,0,0,0,0,71,80,85,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,32,40,0,0,0,0,0,0,69,82,82,79,82,58,32,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,37,72,58,37,77,58,37,83,0,0,0,0,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,37,109,47,37,100,47,37,121,0,0,0,0,0,0,0,0,80,97,114,97,109,101,116,101,114,32,100,101,116,101,99,116,32,37,115,32,100,101,118,105,99,101,10,0,0,0,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,114,0,0,0,0,0,0,0,102,97,108,115,101,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,116,114,117,101,0,0,0,0,69,120,101,99,117,116,101,100,32,112,114,111,103,114,97,109,32,115,117,99,99,101,115,102,117,108,108,121,46,0,0,0,32,0,0,0,0,0,0,0,58,32,0,0,0,0,0,0,99,108,69,110,113,117,101,117,101,82,101,97,100,66,117,102,102,101,114,0,0,0,0,0,99,108,69,110,113,117,101,117,101,78,68,82,97,110,103,101,75,101,114,110,101,108,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,99,108,83,101,116,75,101,114,110,101,108,65,114,103,0,0,37,112,0,0,0,0,0,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,111,117,116,112,117,116,83,105,103,110,97,108,41,0,0,0,0,103,112,117,0,0,0,0,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,109,97,115,107,41,0,0,0,0,99,108,67,114,101,97,116,101,66,117,102,102,101,114,40,105,110,112,117,116,83,105,103,110,97,108,41,0,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,67,0,0,0,0,0,0,0,99,108,67,114,101,97,116,101,67,111,109,109,97,110,100,81,117,101,117,101,0,0,0,0,118,101,99,116,111,114,0,0,99,108,67,114,101,97,116,101,75,101,114,110,101,108,0,0,37,46,48,76,102,0,0,0,99,111,110,118,111,108,118,101,0,0,0,0,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,99,108,66,117,105,108,100,80,114,111,103,114,97,109,0,0,83,97,116,0,0,0,0,0,70,114,105,0,0,0,0,0,84,104,117,0,0,0,0,0,37,76,102,0,0,0,0,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,87,101,100,0,0,0,0,0,84,117,101,0,0,0,0,0,69,114,114,111,114,32,105,110,32,107,101,114,110,101,108,58,32,0,0,0,0,0,0,0,77,111,110,0,0,0,0,0,83,117,110,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,77,111,110,100,97,121,0,0,83,117,110,100,97,121,0,0,99,108,67,114,101,97,116,101,80,114,111,103,114,97,109,87,105,116,104,83,111,117,114,99,101,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,114,101,97,100,105,110,103,32,99,111,110,118,111,108,117,116,105,111,110,46,99,108,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,78,111,118,0,0,0,0,0,79,99,116,0,0,0,0,0,83,101,112,0,0,0,0,0,65,117,103,0,0,0,0,0,99,111,110,118,111,108,117,116,105,111,110,95,107,101,114,110,101,108,46,99,108,0,0,0,99,112,117,0,0,0,0,0,69,114,114,111,114,32,111,99,99,117,114,101,100,32,100,117,114,105,110,103,32,99,111,110,116,101,120,116,32,117,115,101,58,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,36,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,72,36,0,0,72,0,0,0,68,1,0,0,70,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,36,0,0,40,2,0,0,190,1,0,0,214,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,36,0,0,196,0,0,0,4,3,0,0,226,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,36,0,0,0,1,0,0,16,0,0,0,112,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,36,0,0,0,1,0,0,42,0,0,0,112,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,36,0,0,198,1,0,0,230,0,0,0,126,0,0,0,236,1,0,0,52,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,36,0,0,186,2,0,0,244,1,0,0,126,0,0,0,214,2,0,0,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,36,0,0,188,1,0,0,248,1,0,0,126,0,0,0,238,1,0,0,234,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,0,0,252,2,0,0,136,1,0,0,126,0,0,0,224,1,0,0,48,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,37,0,0,242,2,0,0,38,0,0,0,126,0,0,0,130,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,37,0,0,186,1,0,0,52,1,0,0,126,0,0,0,180,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,37,0,0,92,0,0,0,54,1,0,0,126,0,0,0,154,2,0,0,20,0,0,0,250,1,0,0,30,0,0,0,210,0,0,0,156,2,0,0,236,0,0,0,248,255,255,255,224,37,0,0,122,0,0,0,48,0,0,0,188,0,0,0,80,0,0,0,8,0,0,0,174,0,0,0,188,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,38,0,0,226,2,0,0,166,2,0,0,126,0,0,0,118,0,0,0,134,0,0,0,190,2,0,0,148,1,0,0,172,0,0,0,14,0,0,0,134,2,0,0,248,255,255,255,8,38,0,0,124,1,0,0,84,2,0,0,136,2,0,0,174,2,0,0,74,1,0,0,246,0,0,0,30,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,38,0,0,220,0,0,0,0,2,0,0,126,0,0,0,12,1,0,0,234,0,0,0,124,0,0,0,128,1,0,0,208,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,38,0,0,160,0,0,0,182,0,0,0,126,0,0,0,240,0,0,0,242,1,0,0,166,0,0,0,230,1,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,80,38,0,0,230,2,0,0,2,0,0,0,126,0,0,0,160,1,0,0,246,2,0,0,64,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,38,0,0,120,0,0,0,128,2,0,0,126,0,0,0,164,2,0,0,218,0,0,0,192,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,144,38,0,0,146,2,0,0,64,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,152,38,0,0,66,0,0,0,134,1,0,0,226,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,38,0,0,12,0,0,0,204,1,0,0,126,0,0,0,106,0,0,0,90,0,0,0,84,0,0,0,88,0,0,0,82,0,0,0,100,0,0,0,98,0,0,0,158,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,38,0,0,8,1,0,0,40,0,0,0,126,0,0,0,34,2,0,0,38,2,0,0,26,2,0,0,36,2,0,0,6,1,0,0,30,2,0,0,28,2,0,0,206,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,38,0,0,94,0,0,0,50,0,0,0,126,0,0,0,94,2,0,0,92,2,0,0,82,2,0,0,86,2,0,0,240,1,0,0,90,2,0,0,80,2,0,0,100,2,0,0,98,2,0,0,96,2,0,0,108,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,39,0,0,138,0,0,0,4,0,0,0,126,0,0,0,222,2,0,0,212,2,0,0,206,2,0,0,208,2,0,0,184,2,0,0,210,2,0,0,204,2,0,0,220,2,0,0,218,2,0,0,216,2,0,0,88,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,39,0,0,208,0,0,0,248,0,0,0,126,0,0,0,104,1,0,0,22,2,0,0,56,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,39,0,0,64,0,0,0,210,1,0,0,126,0,0,0,14,2,0,0,122,2,0,0,46,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,39,0,0,176,2,0,0,116,1,0,0,126,0,0,0,16,2,0,0,144,0,0,0,12,2,0,0,104,0,0,0,72,1,0,0,116,0,0,0,154,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,39,0,0,218,1,0,0,164,0,0,0,126,0,0,0,56,0,0,0,48,1,0,0,176,0,0,0,102,2,0,0,62,2,0,0,226,1,0,0,58,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,39,0,0,218,1,0,0,122,1,0,0,126,0,0,0,244,2,0,0,146,0,0,0,74,0,0,0,248,2,0,0,252,0,0,0,254,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,39,0,0,218,1,0,0,164,1,0,0,126,0,0,0,88,1,0,0,92,1,0,0,46,2,0,0,202,0,0,0,150,1,0,0,152,0,0,0,90,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,39,0,0,218,1,0,0,78,0,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,39,0,0,154,0,0,0,96,1,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,39,0,0,218,1,0,0,224,0,0,0,126,0,0,0,140,1,0,0,194,0,0,0,86,1,0,0,238,2,0,0,198,0,0,0,50,2,0,0,4,2,0,0,60,0,0,0,128,0,0,0,140,2,0,0,34,1,0,0,200,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,40,0,0,2,3,0,0,86,0,0,0,126,0,0,0,24,0,0,0,54,0,0,0,110,1,0,0,130,2,0,0,148,0,0,0,114,1,0,0,192,1,0,0,146,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,40,0,0,186,0,0,0,158,2,0,0,178,1,0,0,56,2,0,0,76,1,0,0,124,2,0,0,114,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,40,0,0,218,1,0,0,232,0,0,0,126,0,0,0,88,1,0,0,92,1,0,0,46,2,0,0,202,0,0,0,150,1,0,0,152,0,0,0,90,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,40,0,0,218,1,0,0,194,1,0,0,126,0,0,0,88,1,0,0,92,1,0,0,46,2,0,0,202,0,0,0,150,1,0,0,152,0,0,0,90,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,40,0,0,100,1,0,0,196,2,0,0,204,0,0,0,158,1,0,0,2,1,0,0,234,1,0,0,6,2,0,0,74,2,0,0,106,2,0,0,156,0,0,0,140,0,0,0,250,2,0,0,254,2,0,0,252,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,112,40,0,0,18,0,0,0,70,1,0,0,2,2,0,0,178,2,0,0,172,2,0,0,58,1,0,0,14,1,0,0,246,1,0,0,106,1,0,0,34,0,0,0,62,0,0,0,198,2,0,0,80,1,0,0,162,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,40,0,0,18,1,0,0,24,2,0,0,254,1,0,0,56,2,0,0,76,1,0,0,124,2,0,0,254,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,128,40,0,0,174,1,0,0,216,1,0,0,148,255,255,255,148,255,255,255,128,40,0,0,36,1,0,0,68,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,176,40,0,0,112,0,0,0,118,2,0,0,252,255,255,255,252,255,255,255,176,40,0,0,144,1,0,0,98,1,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,200,40,0,0,148,2,0,0,200,2,0,0,252,255,255,255,252,255,255,255,200,40,0,0,50,1,0,0,52,2,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,224,40,0,0,238,0,0,0,6,3,0,0,248,255,255,255,248,255,255,255,224,40,0,0,220,1,0,0,194,2,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,248,40,0,0,46,1,0,0,78,2,0,0,248,255,255,255,248,255,255,255,248,40,0,0,130,1,0,0,136,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,41,0,0,132,2,0,0,170,0,0,0,162,1,0,0,170,1,0,0,94,1,0,0,20,2,0,0,10,1,0,0,246,1,0,0,106,1,0,0,32,2,0,0,62,0,0,0,82,1,0,0,80,1,0,0,182,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,41,0,0,68,2,0,0,222,1,0,0,226,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,41,0,0,232,2,0,0,170,2,0,0,36,0,0,0,158,1,0,0,2,1,0,0,234,1,0,0,40,1,0,0,74,2,0,0,106,2,0,0,156,0,0,0,140,0,0,0,250,2,0,0,254,2,0,0,202,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,88,41,0,0,166,1,0,0,110,2,0,0,60,1,0,0,178,2,0,0,172,2,0,0,58,1,0,0,8,2,0,0,246,1,0,0,106,1,0,0,34,0,0,0,62,0,0,0,198,2,0,0,80,1,0,0,184,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,41,0,0,160,2,0,0,142,1,0,0,126,0,0,0,118,1,0,0,142,2,0,0,120,1,0,0,240,2,0,0,58,0,0,0,26,1,0,0,24,1,0,0,222,0,0,0,112,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,41,0,0,42,1,0,0,150,0,0,0,126,0,0,0,120,2,0,0,10,0,0,0,72,2,0,0,162,2,0,0,180,2,0,0,242,0,0,0,126,2,0,0,212,1,0,0,142,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,41,0,0,168,2,0,0,66,1,0,0,126,0,0,0,102,0,0,0,62,1,0,0,184,1,0,0,168,1,0,0,192,2,0,0,214,1,0,0,44,2,0,0,232,1,0,0,44,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,41,0,0,216,0,0,0,202,1,0,0,126,0,0,0,76,2,0,0,104,2,0,0,20,1,0,0,138,2,0,0,250,0,0,0,206,0,0,0,180,1,0,0,116,2,0,0,108,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,42,0,0,18,2,0,0,190,0,0,0,54,2,0,0,158,1,0,0,2,1,0,0,234,1,0,0,6,2,0,0,74,2,0,0,106,2,0,0,132,1,0,0,228,1,0,0,178,0,0,0,254,2,0,0,252,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,42,0,0,28,0,0,0,150,2,0,0,66,2,0,0,178,2,0,0,172,2,0,0,58,1,0,0,14,1,0,0,246,1,0,0,106,1,0,0,38,1,0,0,132,0,0,0,32,0,0,0,80,1,0,0,162,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,42,0,0,236,2,0,0,42,2,0,0,168,0,0,0,156,1,0,0,212,0,0,0,70,0,0,0,144,2,0,0,28,1,0,0,0,0,0,0,0,0,0,0,132,20,0,0,140,42,0,0,160,42,0,0,152,20,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,98,97,115,105,99,95,105,102,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,102,105,108,101,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,0,0,0,0,48,24,0,0,0,0,0,0,64,24,0,0,0,0,0,0,80,24,0,0,64,36,0,0,0,0,0,0,0,0,0,0,96,24,0,0,64,36,0,0,0,0,0,0,0,0,0,0,112,24,0,0,64,36,0,0,0,0,0,0,0,0,0,0,136,24,0,0,136,36,0,0,0,0,0,0,0,0,0,0,160,24,0,0,64,36,0,0,0,0,0,0,0,0,0,0,176,24,0,0,248,23,0,0,200,24,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,104,41,0,0,0,0,0,0,248,23,0,0,16,25,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,112,41,0,0,0,0,0,0,248,23,0,0,88,25,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,120,41,0,0,0,0,0,0,248,23,0,0,160,25,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,128,41,0,0,0,0,0,0,0,0,0,0,232,25,0,0,144,38,0,0,0,0,0,0,0,0,0,0,24,26,0,0,144,38,0,0,0,0,0,0,248,23,0,0,72,26,0,0,0,0,0,0,1,0,0,0,152,40,0,0,0,0,0,0,248,23,0,0,96,26,0,0,0,0,0,0,1,0,0,0,152,40,0,0,0,0,0,0,248,23,0,0,120,26,0,0,0,0,0,0,1,0,0,0,160,40,0,0,0,0,0,0,248,23,0,0,144,26,0,0,0,0,0,0,1,0,0,0,160,40,0,0,0,0,0,0,248,23,0,0,168,26,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,24,42,0,0,0,8,0,0,248,23,0,0,240,26,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,24,42,0,0,0,8,0,0,248,23,0,0,56,27,0,0,0,0,0,0,3,0,0,0,200,39,0,0,2,0,0,0,152,36,0,0,2,0,0,0,40,40,0,0,0,8,0,0,248,23,0,0,128,27,0,0,0,0,0,0,3,0,0,0,200,39,0,0,2,0,0,0,152,36,0,0,2,0,0,0,48,40,0,0,0,8,0,0,0,0,0,0,200,27,0,0,200,39,0,0,0,0,0,0,0,0,0,0,224,27,0,0,200,39,0,0,0,0,0,0,248,23,0,0,248,27,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,168,40,0,0,2,0,0,0,248,23,0,0,16,28,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,168,40,0,0,2,0,0,0,0,0,0,0,40,28,0,0,0,0,0,0,64,28,0,0,32,41,0,0,0,0,0,0,248,23,0,0,96,28,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,64,37,0,0,0,0,0,0,248,23,0,0,168,28,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,88,37,0,0,0,0,0,0,248,23,0,0,240,28,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,112,37,0,0,0,0,0,0,248,23,0,0,56,29,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,136,37,0,0,0,0,0,0,0,0,0,0,128,29,0,0,200,39,0,0,0,0,0,0,0,0,0,0,152,29,0,0,200,39,0,0,0,0,0,0,248,23,0,0,176,29,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,48,41,0,0,2,0,0,0,248,23,0,0,216,29,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,48,41,0,0,2,0,0,0,248,23,0,0,0,30,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,48,41,0,0,2,0,0,0,248,23,0,0,40,30,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,48,41,0,0,2,0,0,0,0,0,0,0,80,30,0,0,144,40,0,0,0,0,0,0,0,0,0,0,104,30,0,0,200,39,0,0,0,0,0,0,248,23,0,0,128,30,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,16,42,0,0,2,0,0,0].concat([248,23,0,0,152,30,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,16,42,0,0,2,0,0,0,0,0,0,0,176,30,0,0,0,0,0,0,216,30,0,0,0,0,0,0,0,31,0,0,56,41,0,0,0,0,0,0,0,0,0,0,32,31,0,0,168,39,0,0,0,0,0,0,0,0,0,0,72,31,0,0,168,39,0,0,0,0,0,0,0,0,0,0,112,31,0,0,0,0,0,0,168,31,0,0,0,0,0,0,224,31,0,0,0,0,0,0,0,32,0,0,248,40,0,0,0,0,0,0,0,0,0,0,48,32,0,0,0,0,0,0,80,32,0,0,0,0,0,0,112,32,0,0,0,0,0,0,144,32,0,0,248,23,0,0,168,32,0,0,0,0,0,0,1,0,0,0,32,37,0,0,3,244,255,255,248,23,0,0,216,32,0,0,0,0,0,0,1,0,0,0,48,37,0,0,3,244,255,255,248,23,0,0,8,33,0,0,0,0,0,0,1,0,0,0,32,37,0,0,3,244,255,255,248,23,0,0,56,33,0,0,0,0,0,0,1,0,0,0,48,37,0,0,3,244,255,255,0,0,0,0,104,33,0,0,112,40,0,0,0,0,0,0,0,0,0,0,152,33,0,0,104,36,0,0,0,0,0,0,0,0,0,0,176,33,0,0,0,0,0,0,200,33,0,0,120,40,0,0,0,0,0,0,0,0,0,0,224,33,0,0,104,40,0,0,0,0,0,0,0,0,0,0,0,34,0,0,112,40,0,0,0,0,0,0,0,0,0,0,32,34,0,0,0,0,0,0,64,34,0,0,0,0,0,0,96,34,0,0,0,0,0,0,128,34,0,0,248,23,0,0,160,34,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,8,42,0,0,2,0,0,0,248,23,0,0,192,34,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,8,42,0,0,2,0,0,0,248,23,0,0,224,34,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,8,42,0,0,2,0,0,0,248,23,0,0,0,35,0,0,0,0,0,0,2,0,0,0,200,39,0,0,2,0,0,0,8,42,0,0,2,0,0,0,0,0,0,0,32,35,0,0,0,0,0,0,56,35,0,0,0,0,0,0,80,35,0,0,0,0,0,0,104,35,0,0,104,40,0,0,0,0,0,0,0,0,0,0,128,35,0,0,112,40,0,0,0,0,0,0,0,0,0,0,152,35,0,0,96,42,0,0,0,0,0,0,0,0,0,0,192,35,0,0,96,42,0,0,0,0,0,0,0,0,0,0,232,35,0,0,112,42,0,0,0,0,0,0,0,0,0,0,16,36,0,0,56,36,0,0,0,0,0,0,108,0,0,0,0,0,0,0,248,40,0,0,46,1,0,0,78,2,0,0,148,255,255,255,148,255,255,255,248,40,0,0,130,1,0,0,136,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0])
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
HEAP32[((9272)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9280)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9288)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9304)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9320)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9336)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9352)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9368)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9504)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9520)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9776)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9792)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((9872)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((9880)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10024)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10040)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10184)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10200)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10280)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10288)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10296)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10312)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10328)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10344)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10352)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10360)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10368)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10384)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10392)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10400)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10408)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10512)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10528)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10544)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10552)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10568)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10584)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10600)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10608)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10616)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10624)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10760)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10768)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10776)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((10784)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10800)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10816)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10832)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10848)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((10864)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
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
      Module.print('exit(' + status + ') called');
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
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
        Module.print("/!\\"+name+": "+e);
        return error;
      }};function _clGetPlatformIDs(num_entries,platform_ids,num_platforms) {
      if (CL.checkWebCL() < 0) {
        console.error(CL.errorMessage);
        Module.print("/!\\"+CL.errorMessage);
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
        Module.print("/!\\"+CL.errorMessage);
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
  //#if OPENCL_DEBUG
          var notfounddevice ="clGetDeviceIDs: It seems you don't have '"+CL.getDeviceName(device_type_i64_1)+"' device, use default device";
          console.error(notfounddevice);
          Module.print("/!\\"+notfounddevice);
  //#endif
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
        var opt = (options == 0) ? "" : Pointer_stringify(options);
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
  //       try {
  // #if OPENCL_DEBUG
  //         console.error("clEnqueueNDRangeKernel: enqueueNDRangeKernel catch an exception try with null value local work size");
  // #endif        
  //         // empty “localWS” sometime solve
  //         // \todo how add some event inside the array
  //         if (CL.webcl_mozilla == 1) {
  //           CL.cmdQueue[queue].enqueueNDRangeKernel(CL.kernels[ker],work_dim,/*global_work_offset*/[],value_global_work_size,[],[]);
  //         } else {
  //           CL.cmdQueue[queue].enqueueNDRangeKernel(CL.kernels[ker], /*global_work_offset*/ null, value_global_work_size, null);
  //         }
  //         return 0;/*CL_SUCCESS*/
  //       } catch(e) {
  //         return CL.catchError("clEnqueueNDRangeKernel",e);
  //       }
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
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      }
      stream = FS.getStream(stream);
      stream.eof = false;
      return 0;
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
      stream = FS.getStream(stream);
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
    }var _ftello=_ftell;
  function _close(fildes) {
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
        FS.handleFSError(e);;
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
  function _fgetc(stream) {
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
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
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
function __Z15contextCallbackPKcPKvjPv(r1,r2,r3,r4){r4=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r4;r4=__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14624,2824),r1);__ZNKSt3__18ios_base6getlocEv(r3,r4+HEAP32[HEAP32[r4>>2]-12>>2]|0);r1=__ZNKSt3__16locale9use_facetERNS0_2idE(r3,14528);r2=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1,10);__ZNSt3__16localeD2Ev(r3);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r4,r2);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r4);_exit(1)}function __ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r3=STACKTOP;STACKTOP=STACKTOP+32|0;r4=r3;r5=r3+8;r6=r3+16;r7=r3+24;__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_(r5,r1);do{if((HEAP8[r5|0]&1)!=0){r8=_strlen(r2);r9=r1;r10=HEAP32[HEAP32[r9>>2]-12>>2];r11=r1,r12=r11>>2;HEAP32[r6>>2]=HEAP32[(r10+24>>2)+r12];r13=r2+r8|0;r8=(HEAP32[(r10+4>>2)+r12]&176|0)==32?r13:r2;r14=r11+r10|0;r15=r10+(r11+76)|0;r10=HEAP32[r15>>2];if((r10|0)==-1){__ZNKSt3__18ios_base6getlocEv(r4,r14);r16=__ZNKSt3__16locale9use_facetERNS0_2idE(r4,14528);r17=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+28>>2]](r16,32);__ZNSt3__16localeD2Ev(r4);HEAP32[r15>>2]=r17<<24>>24;r18=r17}else{r18=r10&255}__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r7,r6,r2,r8,r13,r14,r18);if((HEAP32[r7>>2]|0)!=0){break}r14=HEAP32[HEAP32[r9>>2]-12>>2];__ZNSt3__18ios_base5clearEj(r11+r14|0,HEAP32[(r14+16>>2)+r12]|5)}}while(0);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev(r5);STACKTOP=r3;return r1}function _main(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r3=0;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+16728|0;r6=r5;r7=r5+8;r8=r5+16;r9=r5+24;r10=r5+32;r11=r5+40;r12=r5+48;r13=r5+56,r14=r13>>2;r15=r5+64,r16=r15>>2;r17=r5+72,r18=r17>>2;r19=r5+80;r20=r5+88;r21=r5+96;r22=r5+104;r23=r5+120,r24=r23>>2;r25=r5+312;r26=r5+328;r27=r5+336;r28=r5+344;if((r1|0)<1|(r2|0)==0){r29=1}else{r30=0;r31=1;while(1){r32=HEAP32[r2+(r30<<2)>>2];do{if((r32|0)==0){r33=r31}else{if((_strstr(r32,2816)|0)!=0){r33=0;break}r33=(_strstr(r32,1920)|0)==0?r31:1}}while(0);r32=r30+1|0;if((r32|0)<(r1|0)){r30=r32;r31=r33}else{r29=r33;break}}}_printf(1648,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=(r29|0)==1?1296:1280,r4));STACKTOP=r4;r4=_clGetPlatformIDs(0,0,r15);HEAP32[r14]=r4;if((r4|0)==0){r34=((HEAP32[r16]|0)==0)<<31>>31}else{r34=r4}__Z8checkErriPKc(r34,1112);r34=HEAP32[r16];r4=STACKTOP;STACKTOP=(r34<<2)+STACKTOP|0;STACKTOP=STACKTOP+7>>3<<3;r15=r4;r4=_clGetPlatformIDs(r34,r15,0);HEAP32[r14]=r4;if((r4|0)==0){r35=((HEAP32[r16]|0)==0)<<31>>31}else{r35=r4}__Z8checkErriPKc(r35,1112);L33:do{if((HEAP32[r16]|0)!=0){r35=(r29|0)!=0;r4=r35?4:2;r34=r35?0:0;r35=0;while(1){r36=((r35<<2)+r15|0)>>2;r33=_clGetDeviceIDs(HEAP32[r36],r4,r34,0,0,r17);HEAP32[r14]=r33;if((r33|0)==-1|(r33|0)==0){r37=HEAP32[r18];if((r37|0)!=0){break}}else{__Z8checkErriPKc(r33,824)}r33=r35+1|0;if(r33>>>0<HEAP32[r16]>>>0){r35=r33}else{break L33}}r35=STACKTOP;STACKTOP=(r37<<2)+STACKTOP|0;STACKTOP=STACKTOP+7>>3<<3;r33=r35;r35=_clGetDeviceIDs(HEAP32[r36],r4,r34,r37,r33,0);HEAP32[r14]=r35;__Z8checkErriPKc(r35,824);r35=r22|0;HEAP32[r35>>2]=4228;HEAP32[r22+4>>2]=HEAP32[r36];HEAP32[r22+8>>2]=0;r31=_clCreateContext(r35,HEAP32[r18],r33,22,0,r13);__Z8checkErriPKc(HEAP32[r14],520);r35=r23;r30=r23+108|0;r1=(r23|0)>>2;r2=r23;r32=r23+8|0;r38=r23;HEAP32[r1]=10892;r39=r23+108|0;HEAP32[r39>>2]=10912;HEAP32[r24+1]=0;__ZNSt3__18ios_base4initEPv(r23+108|0,r32);HEAP32[r24+45]=0;HEAP32[r24+46]=-1;HEAP32[r1]=5252;HEAP32[r30>>2]=5272;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEEC2Ev(r32);r40=(r23+72|0)>>2;do{if((HEAP32[r40]|0)==0){r41=_fopen(2792,1704);HEAP32[r40]=r41;if((r41|0)==0){r3=56;break}HEAP32[r24+24]=8;r42=r41}else{r3=56}}while(0);if(r3==56){r34=HEAP32[HEAP32[r38>>2]-12>>2];__ZNSt3__18ios_base5clearEj(r35+r34|0,HEAP32[r34+(r35+16)>>2]|4);r42=HEAP32[r40]}__Z8checkErriPKc(((r42|0)==0)<<31>>31,2592);HEAP32[r11>>2]=HEAP32[r35+HEAP32[HEAP32[r38>>2]-12>>2]+24>>2];HEAP32[r12>>2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initINS_19istreambuf_iteratorIcS2_EEEENS_9enable_ifIXaasr19__is_input_iteratorIT_EE5valuentsr21__is_forward_iteratorISA_EE5valueEvE4typeESA_SA_(r25,r11,r12);r34=HEAP8[r25];if((r34&1)==0){r43=r25+1|0}else{r43=HEAP32[r25+8>>2]}HEAP32[r26>>2]=r43;r4=r34&255;if((r4&1|0)==0){r44=r4>>>1}else{r44=HEAP32[r25+4>>2]}HEAP32[r27>>2]=r44;r4=_clCreateProgramWithSource(r31,1,r26,r27,r13);__Z8checkErriPKc(HEAP32[r14],2296);r34=_clBuildProgram(r4,HEAP32[r18],r33,0,0,0);HEAP32[r14]=r34;if((r34|0)!=0){r34=r28|0;_clGetProgramBuildInfo(r4,HEAP32[r33>>2],4483,16384,r34,0);r41=__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14800,2176);__ZNKSt3__18ios_base6getlocEv(r9,r41+HEAP32[HEAP32[r41>>2]-12>>2]|0);r45=__ZNKSt3__16locale9use_facetERNS0_2idE(r9,14528);r46=FUNCTION_TABLE[HEAP32[HEAP32[r45>>2]+28>>2]](r45,10);__ZNSt3__16localeD2Ev(r9);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r41,r46);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r41);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14800,r34);__Z8checkErriPKc(HEAP32[r14],2096)}r34=_clCreateKernel(r4,2064,r13);__Z8checkErriPKc(HEAP32[r14],2040);r4=_clCreateCommandQueue(r31,HEAP32[r33>>2],0,0,r13);__Z8checkErriPKc(HEAP32[r14],2008);r41=_clCreateBuffer(r31,36,0,256,120,r13);HEAP32[r19>>2]=r41;__Z8checkErriPKc(HEAP32[r14],1952);r41=_clCreateBuffer(r31,36,0,36,80,r13);HEAP32[r21>>2]=r41;__Z8checkErriPKc(HEAP32[r14],1928);r41=_clCreateBuffer(r31,2,0,144,0,r13);HEAP32[r20>>2]=r41;__Z8checkErriPKc(HEAP32[r14],1888);r41=_clSetKernelArg(r34,0,4,r19);HEAP32[r14]=r41;r41=_clSetKernelArg(r34,1,4,r21);HEAP32[r14]=HEAP32[r14]|r41;r41=_clSetKernelArg(r34,2,4,r20);HEAP32[r14]=HEAP32[r14]|r41;r41=_clSetKernelArg(r34,3,4,10984);HEAP32[r14]=HEAP32[r14]|r41;r41=_clSetKernelArg(r34,4,4,10976)|HEAP32[r14];HEAP32[r14]=r41;__Z8checkErriPKc(r41,1864);r41=_clEnqueueNDRangeKernel(r4,r34,1,0,3280,3288,0,0,0);HEAP32[r14]=r41;__Z8checkErriPKc(r41,1824);r41=_clEnqueueReadBuffer(r4,HEAP32[r20>>2],1,0,144,10992,0,0,0);HEAP32[r14]=r41;__Z8checkErriPKc(r41,1800);r41=0;while(1){__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14624,HEAP32[(r41<<2)+10992>>2]),1784);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14624,HEAP32[(r41<<2)+11016>>2]),1784);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14624,HEAP32[(r41<<2)+11040>>2]),1784);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14624,HEAP32[(r41<<2)+11064>>2]),1784);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14624,HEAP32[(r41<<2)+11088>>2]),1784);__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(14624,HEAP32[(r41<<2)+11112>>2]),1784);__ZNKSt3__18ios_base6getlocEv(r8,HEAP32[HEAP32[3656]-12>>2]+14624|0);r4=__ZNKSt3__16locale9use_facetERNS0_2idE(r8,14528);r34=FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+28>>2]](r4,10);__ZNSt3__16localeD2Ev(r8);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(14624,r34);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(14624);r34=r41+1|0;if(r34>>>0<6){r41=r34}else{break}}__ZNKSt3__18ios_base6getlocEv(r7,HEAP32[HEAP32[3656]-12>>2]+14624|0);r41=__ZNKSt3__16locale9use_facetERNS0_2idE(r7,14528);r31=FUNCTION_TABLE[HEAP32[HEAP32[r41>>2]+28>>2]](r41,10);__ZNSt3__16localeD2Ev(r7);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(14624,r31);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(14624);r31=__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14624,1752);__ZNKSt3__18ios_base6getlocEv(r6,r31+HEAP32[HEAP32[r31>>2]-12>>2]|0);r41=__ZNKSt3__16locale9use_facetERNS0_2idE(r6,14528);r33=FUNCTION_TABLE[HEAP32[HEAP32[r41>>2]+28>>2]](r41,10);__ZNSt3__16localeD2Ev(r6);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r31,r33);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r31);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r25);HEAP32[r1]=5252;HEAP32[r39>>2]=5272;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r32);__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r2,6180);__ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r30);STACKTOP=r5;return 0}}while(0);r5=__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14624,624);__ZNKSt3__18ios_base6getlocEv(r10,r5+HEAP32[HEAP32[r5>>2]-12>>2]|0);r25=__ZNKSt3__16locale9use_facetERNS0_2idE(r10,14528);r6=FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+28>>2]](r25,10);__ZNSt3__16localeD2Ev(r10);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r5,r6);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r5);_exit(-1)}function __Z8checkErriPKc(r1,r2){var r3,r4;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;if((r1|0)==0){STACKTOP=r3;return}r3=__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEi(__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(__ZNSt3__1lsINS_11char_traitsIcEEEERNS_13basic_ostreamIcT_EES6_PKc(14800,1336),r2),1328),r1),1288);__ZNKSt3__18ios_base6getlocEv(r4,r3+HEAP32[HEAP32[r3>>2]-12>>2]|0);r1=__ZNKSt3__16locale9use_facetERNS0_2idE(r4,14528);r2=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+28>>2]](r1,10);__ZNSt3__16localeD2Ev(r4);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r3,r2);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r3);_exit(1)}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r1);return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED0Ev(r1){__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r1);__ZdlPv(r1);return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE5imbueERKNS_6localeE(r1,r2){var r3,r4,r5,r6,r7,r8;r3=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r3]+24>>2]](r1);r4=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14224);r2=r4;HEAP32[r3+17]=r2;r5=r1+98|0;r6=HEAP8[r5]&1;r7=FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+28>>2]](r2);HEAP8[r5]=r7&1;if((r6&255|0)==(r7&1|0)){return}r6=r1+96|0;r5=(r1+8|0)>>2;HEAP32[r5]=0;HEAP32[r5+1]=0;HEAP32[r5+2]=0;HEAP32[r5+3]=0;HEAP32[r5+4]=0;HEAP32[r5+5]=0;r5=(HEAP8[r6]&1)!=0;if(r7){r7=r1+32|0;do{if(r5){r2=HEAP32[r7>>2];if((r2|0)==0){break}__ZdaPv(r2)}}while(0);r2=r1+97|0;HEAP8[r6]=HEAP8[r2]&1;r4=r1+60|0;HEAP32[r3+13]=HEAP32[r4>>2];r8=r1+56|0;HEAP32[r7>>2]=HEAP32[r8>>2];HEAP32[r4>>2]=0;HEAP32[r8>>2]=0;HEAP8[r2]=0;return}do{if(!r5){r2=r1+32|0;r8=HEAP32[r2>>2];if((r8|0)==(r1+44|0)){break}r4=HEAP32[r3+13];HEAP32[r3+15]=r4;HEAP32[r3+14]=r8;HEAP8[r1+97|0]=0;r8=__Znaj(r4);HEAP32[r2>>2]=r8;HEAP8[r6]=1;return}}while(0);r6=HEAP32[r3+13];HEAP32[r3+15]=r6;r5=__Znaj(r6);HEAP32[r3+14]=r5;HEAP8[r1+97|0]=1;return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE6setbufEPci(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=r1>>2;r5=r1|0;r6=r1+96|0;r7=(r1+8|0)>>2;HEAP32[r7]=0;HEAP32[r7+1]=0;HEAP32[r7+2]=0;HEAP32[r7+3]=0;HEAP32[r7+4]=0;HEAP32[r7+5]=0;do{if((HEAP8[r6]&1)!=0){r7=HEAP32[r4+8];if((r7|0)==0){break}__ZdaPv(r7)}}while(0);r7=r1+97|0;do{if((HEAP8[r7]&1)!=0){r8=HEAP32[r4+14];if((r8|0)==0){break}__ZdaPv(r8)}}while(0);r8=r1+52|0;HEAP32[r8>>2]=r3;do{if(r3>>>0>8){r9=HEAP8[r1+98|0];if((r9&1)==0|(r2|0)==0){r10=__Znaj(r3);HEAP32[r4+8]=r10;HEAP8[r6]=1;r11=r9;break}else{HEAP32[r4+8]=r2;HEAP8[r6]=0;r11=r9;break}}else{HEAP32[r4+8]=r1+44;HEAP32[r8>>2]=8;HEAP8[r6]=0;r11=HEAP8[r1+98|0]}}while(0);if((r11&1)!=0){HEAP32[r4+15]=0;HEAP32[r4+14]=0;HEAP8[r7]=0;return r5}r11=(r3|0)<8?8:r3;HEAP32[r4+15]=r11;if((r2|0)!=0&r11>>>0>7){HEAP32[r4+14]=r2;HEAP8[r7]=0;return r5}else{r2=__Znaj(r11);HEAP32[r4+14]=r2;HEAP8[r7]=1;return r5}}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE7seekposENS_4fposI10_mbstate_tEEj(r1,r2,r3,r4){var r5,r6,r7,r8;r4=STACKTOP;r5=r3>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;HEAP32[r3>>2]=HEAP32[r5];HEAP32[r3+4>>2]=HEAP32[r5+1];HEAP32[r3+8>>2]=HEAP32[r5+2];HEAP32[r3+12>>2]=HEAP32[r5+3];r5=r2+64|0;do{if((HEAP32[r5>>2]|0)!=0){if((FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2)|0)!=0){break}if((_fseek(HEAP32[r5>>2],HEAP32[r3+8>>2],0)|0)==0){r6=r3;r7=HEAP32[r6+4>>2];r8=r2+72|0;HEAP32[r8>>2]=HEAP32[r6>>2];HEAP32[r8+4>>2]=r7;r7=r1>>2;r8=r3>>2;HEAP32[r7]=HEAP32[r8];HEAP32[r7+1]=HEAP32[r8+1];HEAP32[r7+2]=HEAP32[r8+2];HEAP32[r7+3]=HEAP32[r8+3];STACKTOP=r4;return}else{r8=r1;HEAP32[r8>>2]=0;HEAP32[r8+4>>2]=0;r8=r1+8|0;HEAP32[r8>>2]=-1;HEAP32[r8+4>>2]=-1;STACKTOP=r4;return}}}while(0);r3=r1;HEAP32[r3>>2]=0;HEAP32[r3+4>>2]=0;r3=r1+8|0;HEAP32[r3>>2]=-1;HEAP32[r3+4>>2]=-1;STACKTOP=r4;return}function __ZNSt3__114basic_ifstreamIcNS_11char_traitsIcEEED1Ev(r1){HEAP32[r1>>2]=5252;HEAP32[r1+108>>2]=5272;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r1+8|0);__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r1,6180);__ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r1+108|0);return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initINS_19istreambuf_iteratorIcS2_EEEENS_9enable_ifIXaasr19__is_input_iteratorIT_EE5valuentsr21__is_forward_iteratorISA_EE5valueEvE4typeESA_SA_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r4=0;r5=STACKTOP;r6=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r6>>2];r6=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r6>>2];r6=r1>>2;HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;r6=r2|0;r2=r3|0;r3=HEAP32[r6>>2],r7=r3>>2;L203:while(1){do{if((r3|0)==0){r8=0}else{if((HEAP32[r7+3]|0)!=(HEAP32[r7+4]|0)){r8=r3;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r7]+36>>2]](r3)|0)!=-1){r8=r3;break}HEAP32[r6>>2]=0;r8=0}}while(0);r9=(r8|0)==0;r10=HEAP32[r2>>2],r11=r10>>2;do{if((r10|0)==0){r4=252}else{if((HEAP32[r11+3]|0)!=(HEAP32[r11+4]|0)){if(r9){break}else{r4=270;break L203}}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+36>>2]](r10)|0)==-1){HEAP32[r2>>2]=0;r4=252;break}else{if(r9^(r10|0)==0){break}else{r4=272;break L203}}}}while(0);if(r4==252){r4=0;if(r9){r4=271;break}}r10=(r8+12|0)>>2;r11=HEAP32[r10];r12=r8+16|0;if((r11|0)==(HEAP32[r12>>2]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+36>>2]](r8)&255}else{r13=HEAP8[r11]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r1,r13);r11=HEAP32[r10];if((r11|0)==(HEAP32[r12>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+40>>2]](r8);r3=r8,r7=r3>>2;continue}else{HEAP32[r10]=r11+1;r3=r8,r7=r3>>2;continue}}if(r4==272){STACKTOP=r5;return}else if(r4==270){STACKTOP=r5;return}else if(r4==271){STACKTOP=r5;return}}function __ZNSt3__114basic_ifstreamIcNS_11char_traitsIcEEED0Ev(r1){HEAP32[r1>>2]=5252;HEAP32[r1+108>>2]=5272;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r1+8|0);__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r1,6180);__ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r1+108|0);__ZdlPv(r1);return}function __ZTv0_n12_NSt3__114basic_ifstreamIcNS_11char_traitsIcEEED1Ev(r1){var r2,r3,r4;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];r1=r2+r3|0;HEAP32[r1>>2]=5252;r4=r3+(r2+108)|0;HEAP32[r4>>2]=5272;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r3+(r2+8)|0);__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r1,6180);__ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r4);return}function __ZTv0_n12_NSt3__114basic_ifstreamIcNS_11char_traitsIcEEED0Ev(r1){var r2,r3,r4;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];r1=r2+r3|0;HEAP32[r1>>2]=5252;r4=r3+(r2+108)|0;HEAP32[r4>>2]=5272;__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r3+(r2+8)|0);__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r1,6180);__ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r4);__ZdlPv(r1);return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEED2Ev(r1){var r2,r3;HEAP32[r1>>2]=5488;r2=r1+64|0;r3=HEAP32[r2>>2];do{if((r3|0)!=0){__ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE4syncEv(r1);if((_fclose(r3)|0)!=0){break}HEAP32[r2>>2]=0}}while(0);do{if((HEAP8[r1+96|0]&1)!=0){r2=HEAP32[r1+32>>2];if((r2|0)==0){break}__ZdaPv(r2)}}while(0);do{if((HEAP8[r1+97|0]&1)!=0){r2=HEAP32[r1+56>>2];if((r2|0)==0){break}__ZdaPv(r2)}}while(0);__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1|0);return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE7seekoffExNS_8ios_base7seekdirEj(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12;r6=HEAP32[r2+68>>2];if((r6|0)==0){r7=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r7);___cxa_throw(r7,9304,382)}r7=FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+24>>2]](r6);r6=(r2+64|0)>>2;do{if((HEAP32[r6]|0)!=0){r8=(r7|0)>0;if(!(r8|(r3|0)==0&(r4|0)==0)){break}if((FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+24>>2]](r2)|0)!=0){break}if(r5>>>0>=3){r9=r1;HEAP32[r9>>2]=0;HEAP32[r9+4>>2]=0;r9=r1+8|0;HEAP32[r9>>2]=-1;HEAP32[r9+4>>2]=-1;return}r9=HEAP32[r6];if(r8){r10=___muldi3(r7,(r7|0)<0?-1:0,r3,r4)}else{r10=0}if((_fseek(r9,r10,r5)|0)==0){r9=_ftell(HEAP32[r6]);r8=r2+72|0;r11=HEAP32[r8+4>>2];r12=r1;HEAP32[r12>>2]=HEAP32[r8>>2];HEAP32[r12+4>>2]=r11;r11=r1+8|0;HEAP32[r11>>2]=r9;HEAP32[r11+4>>2]=(r9|0)<0?-1:0;return}else{r9=r1;HEAP32[r9>>2]=0;HEAP32[r9+4>>2]=0;r9=r1+8|0;HEAP32[r9>>2]=-1;HEAP32[r9+4>>2]=-1;return}}}while(0);r2=r1;HEAP32[r2>>2]=0;HEAP32[r2+4>>2]=0;r2=r1+8|0;HEAP32[r2>>2]=-1;HEAP32[r2+4>>2]=-1;return}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE9pbackfailEi(r1,r2){var r3,r4,r5,r6;if((HEAP32[r1+64>>2]|0)==0){r3=-1;return r3}r4=(r1+12|0)>>2;r5=HEAP32[r4];if(HEAP32[r1+8>>2]>>>0>=r5>>>0){r3=-1;return r3}if((r2|0)==-1){HEAP32[r4]=r5-1;r3=0;return r3}r6=r5-1|0;do{if((HEAP32[r1+88>>2]&16|0)==0){if((r2<<24>>24|0)==(HEAP8[r6]|0)){break}else{r3=-1}return r3}}while(0);HEAP32[r4]=r6;HEAP8[r6]=r2&255;r3=r2;return r3}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE4syncEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r2=r1>>2;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+16|0;r5=r4;r6=r4+8,r7=r6>>2;r8=r6;r6=(r1+64|0)>>2;if((HEAP32[r6]|0)==0){r9=0;STACKTOP=r4;return r9}r10=(r1+68|0)>>2;r11=HEAP32[r10];if((r11|0)==0){r12=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r12);___cxa_throw(r12,9304,382)}r12=r1+92|0;r13=HEAP32[r12>>2];do{if((r13&16|0)==0){if((r13&8|0)==0){break}r14=r1+80|0;r15=HEAP32[r14+4>>2];HEAP32[r7]=HEAP32[r14>>2];HEAP32[r7+1]=r15;do{if((HEAP8[r1+98|0]&1)==0){r15=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+24>>2]](r11);r14=r1+36|0;r16=HEAP32[r14>>2];r17=HEAP32[r2+10]-r16|0;if((r15|0)>0){r18=Math.imul(HEAP32[r2+4]-HEAP32[r2+3]|0,r15)+r17|0;r19=0;break}r15=HEAP32[r2+3];if((r15|0)==(HEAP32[r2+4]|0)){r18=r17;r19=0;break}r20=HEAP32[r10];r21=r1+32|0;r18=r17-FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+32>>2]](r20,r8,HEAP32[r21>>2],r16,r15-HEAP32[r2+2]|0)+HEAP32[r14>>2]-HEAP32[r21>>2]|0;r19=1}else{r18=HEAP32[r2+4]-HEAP32[r2+3]|0;r19=0}}while(0);if((_fseek(HEAP32[r6],-r18|0,1)|0)!=0){r9=-1;STACKTOP=r4;return r9}if(r19){r21=r1+72|0;r14=HEAP32[r7+1];HEAP32[r21>>2]=HEAP32[r7];HEAP32[r21+4>>2]=r14}r14=HEAP32[r2+8];HEAP32[r2+10]=r14;HEAP32[r2+9]=r14;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r12>>2]=0}else{do{if((HEAP32[r2+6]|0)!=(HEAP32[r2+5]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r2]+52>>2]](r1,-1)|0)==-1){r9=-1}else{break}STACKTOP=r4;return r9}}while(0);r14=r1+72|0;r21=r1+32|0;r15=r1+52|0;while(1){r16=HEAP32[r10];r20=HEAP32[r21>>2];r17=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+20>>2]](r16,r14,r20,r20+HEAP32[r15>>2]|0,r5);r20=HEAP32[r21>>2];r16=HEAP32[r5>>2]-r20|0;if((_fwrite(r20,1,r16,HEAP32[r6])|0)!=(r16|0)){r9=-1;r3=374;break}if((r17|0)==2){r9=-1;r3=375;break}else if((r17|0)!=1){r3=359;break}}if(r3==359){if((_fflush(HEAP32[r6])|0)==0){break}else{r9=-1}STACKTOP=r4;return r9}else if(r3==374){STACKTOP=r4;return r9}else if(r3==375){STACKTOP=r4;return r9}}}while(0);r9=0;STACKTOP=r4;return r9}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE9underflowEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r2=r1>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3;r5=r3+8;r6=(r1+64|0)>>2;if((HEAP32[r6]|0)==0){r7=-1;STACKTOP=r3;return r7}r8=r1+92|0;if((HEAP32[r8>>2]&8|0)==0){HEAP32[r2+6]=0;HEAP32[r2+5]=0;HEAP32[r2+7]=0;if((HEAP8[r1+98|0]&1)==0){r9=HEAP32[r2+14];r10=r9+HEAP32[r2+15]|0;HEAP32[r2+2]=r9;HEAP32[r2+3]=r10;HEAP32[r2+4]=r10;r11=r10}else{r10=HEAP32[r2+8];r9=r10+HEAP32[r2+13]|0;HEAP32[r2+2]=r10;HEAP32[r2+3]=r9;HEAP32[r2+4]=r9;r11=r9}HEAP32[r8>>2]=8;r12=1;r13=r11;r14=r1+12|0,r15=r14>>2}else{r11=r1+12|0;r12=0;r13=HEAP32[r11>>2];r14=r11,r15=r14>>2}if((r13|0)==0){r14=r4+1|0;HEAP32[r2+2]=r4;HEAP32[r15]=r14;HEAP32[r2+4]=r14;r16=r14}else{r16=r13}r13=HEAP32[r2+4];if(r12){r17=0}else{r12=(r13-HEAP32[r2+2]|0)/2&-1;r17=r12>>>0>4?4:r12}r12=(r1+16|0)>>2;do{if((r16|0)==(r13|0)){r14=r1+8|0,r11=r14>>2;_memmove(HEAP32[r11],r16+ -r17|0,r17,1,0);if((HEAP8[r1+98|0]&1)!=0){r8=HEAP32[r11];r9=_fread(r8+r17|0,1,HEAP32[r12]-r17-r8|0,HEAP32[r6]);if((r9|0)==0){r18=-1;r19=r14;break}r8=HEAP32[r11];r10=r8+r17|0;HEAP32[r15]=r10;HEAP32[r12]=r8+r9+r17;r18=HEAPU8[r10];r19=r14;break}r10=(r1+32|0)>>2;r9=r1+36|0,r8=r9>>2;r20=HEAP32[r8];r21=(r1+40|0)>>2;_memmove(HEAP32[r10],r20,HEAP32[r21]-r20|0,1,0);r20=HEAP32[r10];r22=r20+(HEAP32[r21]-HEAP32[r8])|0;HEAP32[r8]=r22;if((r20|0)==(r1+44|0)){r23=8}else{r23=HEAP32[r2+13]}r24=r20+r23|0;HEAP32[r21]=r24;r20=r1+60|0;r25=HEAP32[r20>>2]-r17|0;r26=r24-r22|0;r24=r1+72|0;r27=r24;r28=r1+80|0;r29=HEAP32[r27+4>>2];HEAP32[r28>>2]=HEAP32[r27>>2];HEAP32[r28+4>>2]=r29;r29=_fread(r22,1,r26>>>0<r25>>>0?r26:r25,HEAP32[r6]);if((r29|0)==0){r18=-1;r19=r14;break}r25=HEAP32[r2+17];if((r25|0)==0){r26=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r26);___cxa_throw(r26,9304,382)}r26=HEAP32[r8]+r29|0;HEAP32[r21]=r26;r29=HEAP32[r11];if((FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+16>>2]](r25,r24,HEAP32[r10],r26,r9,r29+r17|0,r29+HEAP32[r20>>2]|0,r5)|0)==3){r20=HEAP32[r10];r10=HEAP32[r21];HEAP32[r11]=r20;HEAP32[r15]=r20;HEAP32[r12]=r10;r18=HEAPU8[r20];r19=r14;break}r20=HEAP32[r5>>2];r10=HEAP32[r11];r21=r10+r17|0;if((r20|0)==(r21|0)){r18=-1;r19=r14;break}HEAP32[r11]=r10;HEAP32[r15]=r21;HEAP32[r12]=r20;r18=HEAPU8[r21];r19=r14}else{r18=HEAPU8[r16];r19=r1+8|0}}while(0);if((HEAP32[r19>>2]|0)!=(r4|0)){r7=r18;STACKTOP=r3;return r7}HEAP32[r19>>2]=0;HEAP32[r15]=0;HEAP32[r12]=0;r7=r18;STACKTOP=r3;return r7}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEE8overflowEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r3=r1>>2;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+24|0;r6=r5;r7=r5+8;r8=r5+16;r9=(r1+64|0)>>2;if((HEAP32[r9]|0)==0){r10=-1;STACKTOP=r5;return r10}r11=r1+92|0;if((HEAP32[r11>>2]&16|0)==0){HEAP32[r3+2]=0;HEAP32[r3+3]=0;HEAP32[r3+4]=0;r12=HEAP32[r3+13];do{if(r12>>>0>8){if((HEAP8[r1+98|0]&1)==0){r13=HEAP32[r3+14];r14=r13+(HEAP32[r3+15]-1)|0;HEAP32[r3+6]=r13;HEAP32[r3+5]=r13;HEAP32[r3+7]=r14;r15=r13;r16=r14;break}else{r14=HEAP32[r3+8];r13=r14+(r12-1)|0;HEAP32[r3+6]=r14;HEAP32[r3+5]=r14;HEAP32[r3+7]=r13;r15=r14;r16=r13;break}}else{HEAP32[r3+6]=0;HEAP32[r3+5]=0;HEAP32[r3+7]=0;r15=0;r16=0}}while(0);HEAP32[r11>>2]=16;r17=r15;r18=r16;r19=r1+20|0,r20=r19>>2;r21=r1+28|0,r22=r21>>2}else{r16=r1+20|0;r15=r1+28|0;r17=HEAP32[r16>>2];r18=HEAP32[r15>>2];r19=r16,r20=r19>>2;r21=r15,r22=r21>>2}r21=(r2|0)==-1;r15=(r1+24|0)>>2;r19=HEAP32[r15];if(r21){r23=r17;r24=r19}else{if((r19|0)==0){HEAP32[r15]=r6;HEAP32[r20]=r6;HEAP32[r22]=r6+1;r25=r6}else{r25=r19}HEAP8[r25]=r2&255;r25=HEAP32[r15]+1|0;HEAP32[r15]=r25;r23=HEAP32[r20];r24=r25}r25=(r1+24|0)>>2;if((r24|0)!=(r23|0)){L402:do{if((HEAP8[r1+98|0]&1)==0){r15=(r1+32|0)>>2;r19=HEAP32[r15];HEAP32[r7>>2]=r19;r6=r1+68|0;r16=HEAP32[r6>>2];if((r16|0)==0){r26=___cxa_allocate_exception(4);r27=r26;__ZNSt8bad_castC2Ev(r27);___cxa_throw(r26,9304,382)}r11=r1+72|0;r3=r1+52|0;r12=r16;r16=r23;r13=r24;r14=r19;while(1){r19=FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+12>>2]](r12,r11,r16,r13,r8,r14,r14+HEAP32[r3>>2]|0,r7);r28=HEAP32[r20];if((HEAP32[r8>>2]|0)==(r28|0)){r10=-1;r4=446;break}if((r19|0)==3){r4=432;break}if(r19>>>0>=2){r10=-1;r4=448;break}r29=HEAP32[r15];r30=HEAP32[r7>>2]-r29|0;if((_fwrite(r29,1,r30,HEAP32[r9])|0)!=(r30|0)){r10=-1;r4=443;break}if((r19|0)!=1){break L402}r19=HEAP32[r8>>2];r30=HEAP32[r25];HEAP32[r20]=r19;HEAP32[r22]=r30;r29=r19+(r30-r19)|0;HEAP32[r25]=r29;r30=HEAP32[r6>>2];if((r30|0)==0){r4=442;break}r12=r30;r16=r19;r13=r29;r14=HEAP32[r15]}if(r4==446){STACKTOP=r5;return r10}else if(r4==448){STACKTOP=r5;return r10}else if(r4==432){r15=HEAP32[r25]-r28|0;if((_fwrite(r28,1,r15,HEAP32[r9])|0)==(r15|0)){break}else{r10=-1}STACKTOP=r5;return r10}else if(r4==442){r26=___cxa_allocate_exception(4);r27=r26;__ZNSt8bad_castC2Ev(r27);___cxa_throw(r26,9304,382)}else if(r4==443){STACKTOP=r5;return r10}}else{r15=r24-r23|0;if((_fwrite(r23,1,r15,HEAP32[r9])|0)==(r15|0)){break}else{r10=-1}STACKTOP=r5;return r10}}while(0);HEAP32[r25]=r17;HEAP32[r20]=r17;HEAP32[r22]=r18}r10=r21?0:r2;STACKTOP=r5;return r10}function __ZNSt3__113basic_filebufIcNS_11char_traitsIcEEEC2Ev(r1){var r2,r3,r4,r5,r6,r7,r8;r2=r1>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3;r5=r3+8;__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEEC2Ev(r1|0);HEAP32[r2]=5488;HEAP32[r2+8]=0;HEAP32[r2+9]=0;HEAP32[r2+10]=0;r6=r1+68|0;r7=r1+4|0;_memset(r1+52|0,0,47);__ZNSt3__16localeC2ERKS0_(r4,r7);r8=__ZNKSt3__16locale9has_facetERNS0_2idE(r4,14224);__ZNSt3__16localeD2Ev(r4);if(r8){__ZNSt3__16localeC2ERKS0_(r5,r7);r7=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14224);HEAP32[r6>>2]=r7;__ZNSt3__16localeD2Ev(r5);r5=HEAP32[r6>>2];r6=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+28>>2]](r5)&1;HEAP8[r1+98|0]=r6}FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r1,0,4096);STACKTOP=r3;return}function __ZNSt3__18ios_base4InitC2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r1=STACKTOP;STACKTOP=STACKTOP+32|0;r2=r1;r3=r1+8;r4=r1+16;r5=r1+24;__ZNSt3__110__stdinbufIcEC2EP7__sFILEP10_mbstate_t(13968,HEAP32[_stdin>>2],14024);HEAP32[3722]=5444;HEAP32[3724]=5464;HEAP32[3723]=0;r6=HEAP32[1358];__ZNSt3__18ios_base4initEPv(r6+14888|0,13968);HEAP32[r6+14960>>2]=0;HEAP32[r6+14964>>2]=-1;r6=HEAP32[_stdout>>2];__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEEC2Ev(13872);HEAP32[3468]=5664;HEAP32[3476]=r6;__ZNSt3__16localeC2ERKS0_(r5,13876);r6=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14224);r7=r6;__ZNSt3__16localeD2Ev(r5);HEAP32[3477]=r7;HEAP32[3478]=14032;r5=FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+28>>2]](r7)&1;HEAP8[13916]=r5;HEAP32[3656]=5348;HEAP32[3657]=5368;r5=HEAP32[1334];__ZNSt3__18ios_base4initEPv(r5+14624|0,13872);r7=(r5+72|0)>>2;HEAP32[r7+3656]=0;r6=(r5+76|0)>>2;HEAP32[r6+3656]=-1;r8=HEAP32[_stderr>>2];__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEEC2Ev(13920);HEAP32[3480]=5664;HEAP32[3488]=r8;__ZNSt3__16localeC2ERKS0_(r4,13924);r8=__ZNKSt3__16locale9use_facetERNS0_2idE(r4,14224);r9=r8;__ZNSt3__16localeD2Ev(r4);HEAP32[3489]=r9;HEAP32[3490]=14040;r4=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+28>>2]](r9)&1;HEAP8[13964]=r4;HEAP32[3700]=5348;HEAP32[3701]=5368;__ZNSt3__18ios_base4initEPv(r5+14800|0,13920);HEAP32[r7+3700]=0;HEAP32[r6+3700]=-1;r4=HEAP32[HEAP32[HEAP32[3700]-12>>2]+14824>>2];HEAP32[3678]=5348;HEAP32[3679]=5368;__ZNSt3__18ios_base4initEPv(r5+14712|0,r4);HEAP32[r7+3678]=0;HEAP32[r6+3678]=-1;HEAP32[HEAP32[HEAP32[3722]-12>>2]+14960>>2]=14624;r6=HEAP32[HEAP32[3700]-12>>2]+14804|0;HEAP32[r6>>2]=HEAP32[r6>>2]|8192;HEAP32[HEAP32[HEAP32[3700]-12>>2]+14872>>2]=14624;__ZNSt3__110__stdinbufIwEC2EP7__sFILEP10_mbstate_t(13816,HEAP32[_stdin>>2],14048);HEAP32[3634]=5396;HEAP32[3636]=5416;HEAP32[3635]=0;r6=HEAP32[1346];__ZNSt3__18ios_base4initEPv(r6+14536|0,13816);HEAP32[r6+14608>>2]=0;HEAP32[r6+14612>>2]=-1;r6=HEAP32[_stdout>>2];__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEEC2Ev(13720);HEAP32[3430]=5592;HEAP32[3438]=r6;__ZNSt3__16localeC2ERKS0_(r3,13724);r6=__ZNKSt3__16locale9use_facetERNS0_2idE(r3,14216);r7=r6;__ZNSt3__16localeD2Ev(r3);HEAP32[3439]=r7;HEAP32[3440]=14056;r3=FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+28>>2]](r7)&1;HEAP8[13764]=r3;HEAP32[3564]=5300;HEAP32[3565]=5320;r3=HEAP32[1322];__ZNSt3__18ios_base4initEPv(r3+14256|0,13720);r7=(r3+72|0)>>2;HEAP32[r7+3564]=0;r6=(r3+76|0)>>2;HEAP32[r6+3564]=-1;r4=HEAP32[_stderr>>2];__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEEC2Ev(13768);HEAP32[3442]=5592;HEAP32[3450]=r4;__ZNSt3__16localeC2ERKS0_(r2,13772);r4=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14216);r5=r4;__ZNSt3__16localeD2Ev(r2);HEAP32[3451]=r5;HEAP32[3452]=14064;r2=FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+28>>2]](r5)&1;HEAP8[13812]=r2;HEAP32[3608]=5300;HEAP32[3609]=5320;__ZNSt3__18ios_base4initEPv(r3+14432|0,13768);HEAP32[r7+3608]=0;HEAP32[r6+3608]=-1;r2=HEAP32[HEAP32[HEAP32[3608]-12>>2]+14456>>2];HEAP32[3586]=5300;HEAP32[3587]=5320;__ZNSt3__18ios_base4initEPv(r3+14344|0,r2);HEAP32[r7+3586]=0;HEAP32[r6+3586]=-1;HEAP32[HEAP32[HEAP32[3634]-12>>2]+14608>>2]=14256;r6=HEAP32[HEAP32[3608]-12>>2]+14436|0;HEAP32[r6>>2]=HEAP32[r6>>2]|8192;HEAP32[HEAP32[HEAP32[3608]-12>>2]+14504>>2]=14256;STACKTOP=r1;return}function __ZNSt3__111__stdoutbufIwED1Ev(r1){__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED2Ev(r1|0);return}function __ZNSt3__111__stdoutbufIwED0Ev(r1){__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__111__stdoutbufIwE5imbueERKNS_6localeE(r1,r2){var r3,r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14216);r2=r3;HEAP32[r1+36>>2]=r2;r4=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](r2)&1;HEAP8[r1+44|0]=r4;return}function __ZNSt3__111__stdoutbufIwE4syncEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3;r5=r3+8;r6=r1+36|0;r7=r1+40|0;r8=r4|0;r9=r4+8|0;r10=r4;r4=r1+32|0;while(1){r1=HEAP32[r6>>2];r11=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,HEAP32[r7>>2],r8,r9,r5);r1=HEAP32[r5>>2]-r10|0;if((_fwrite(r8,1,r1,HEAP32[r4>>2])|0)!=(r1|0)){r12=-1;r2=497;break}if((r11|0)==2){r12=-1;r2=498;break}else if((r11|0)!=1){r2=495;break}}if(r2==498){STACKTOP=r3;return r12}else if(r2==497){STACKTOP=r3;return r12}else if(r2==495){r12=((_fflush(HEAP32[r4>>2])|0)!=0)<<31>>31;STACKTOP=r3;return r12}}function __ZNSt3__111__stdoutbufIwE8overflowEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8;r7=r4+16;r8=r4+24;r9=(r2|0)==-1;L462:do{if(!r9){HEAP32[r6>>2]=r2;if((HEAP8[r1+44|0]&1)!=0){if((_fwrite(r6,4,1,HEAP32[r1+32>>2])|0)==1){break}else{r10=-1}STACKTOP=r4;return r10}r11=r5|0;HEAP32[r7>>2]=r11;r12=r6+4|0;r13=r1+36|0;r14=r1+40|0;r15=r5+8|0;r16=r5;r17=r1+32|0;r18=r6;while(1){r19=HEAP32[r13>>2];r20=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+12>>2]](r19,HEAP32[r14>>2],r18,r12,r8,r11,r15,r7);if((HEAP32[r8>>2]|0)==(r18|0)){r10=-1;r3=517;break}if((r20|0)==3){r3=506;break}r19=(r20|0)==1;if(r20>>>0>=2){r10=-1;r3=514;break}r20=HEAP32[r7>>2]-r16|0;if((_fwrite(r11,1,r20,HEAP32[r17>>2])|0)!=(r20|0)){r10=-1;r3=515;break}if(r19){r18=r19?HEAP32[r8>>2]:r18}else{break L462}}if(r3==506){if((_fwrite(r18,1,1,HEAP32[r17>>2])|0)==1){break}else{r10=-1}STACKTOP=r4;return r10}else if(r3==514){STACKTOP=r4;return r10}else if(r3==515){STACKTOP=r4;return r10}else if(r3==517){STACKTOP=r4;return r10}}}while(0);r10=r9?0:r2;STACKTOP=r4;return r10}function __ZNSt3__110__stdinbufIwEC2EP7__sFILEP10_mbstate_t(r1,r2,r3){var r4,r5,r6,r7;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEEC2Ev(r1|0);HEAP32[r1>>2]=5992;HEAP32[r1+32>>2]=r2;HEAP32[r1+40>>2]=r3;HEAP32[r1+48>>2]=-1;HEAP8[r1+52|0]=0;__ZNSt3__16localeC2ERKS0_(r5,r1+4|0);r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14216);r2=r3;r6=r1+36|0;HEAP32[r6>>2]=r2;r7=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r2);r2=r1+44|0;HEAP32[r2>>2]=r7;r7=HEAP32[r6>>2];r6=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+28>>2]](r7)&1;HEAP8[r1+53|0]=r6;if((HEAP32[r2>>2]|0)<=8){__ZNSt3__16localeD2Ev(r5);STACKTOP=r4;return}__ZNSt3__121__throw_runtime_errorEPKc(424);__ZNSt3__16localeD2Ev(r5);STACKTOP=r4;return}function __ZNSt3__110__stdinbufIwED1Ev(r1){__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED2Ev(r1|0);return}function __ZNSt3__110__stdinbufIwED0Ev(r1){__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110__stdinbufIwE5imbueERKNS_6localeE(r1,r2){var r3,r4,r5;r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14216);r2=r3;r4=r1+36|0;HEAP32[r4>>2]=r2;r5=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r2);r2=r1+44|0;HEAP32[r2>>2]=r5;r5=HEAP32[r4>>2];r4=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+28>>2]](r5)&1;HEAP8[r1+53|0]=r4;if((HEAP32[r2>>2]|0)<=8){return}__ZNSt3__121__throw_runtime_errorEPKc(424);return}function __ZNSt3__110__stdinbufIwE9underflowEv(r1){return __ZNSt3__110__stdinbufIwE9__getcharEb(r1,0)}function __ZNSt3__110__stdinbufIwE5uflowEv(r1){return __ZNSt3__110__stdinbufIwE9__getcharEb(r1,1)}function __ZNSt3__110__stdinbufIwE9pbackfailEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=STACKTOP;STACKTOP=STACKTOP+32|0;r4=r3;r5=r3+8,r6=r5>>2;r7=r3+16;r8=r3+24;r9=r1+52|0;r10=(HEAP8[r9]&1)!=0;if((r2|0)==-1){if(r10){r11=-1;STACKTOP=r3;return r11}r12=HEAP32[r1+48>>2];HEAP8[r9]=(r12|0)!=-1|0;r11=r12;STACKTOP=r3;return r11}r12=(r1+48|0)>>2;L505:do{if(r10){HEAP32[r7>>2]=HEAP32[r12];r13=HEAP32[r1+36>>2];r14=r4|0;r15=FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r13,HEAP32[r1+40>>2],r7,r7+4|0,r8,r14,r4+8|0,r5);if((r15|0)==2|(r15|0)==1){r11=-1;STACKTOP=r3;return r11}else if((r15|0)==3){HEAP8[r14]=HEAP32[r12]&255;HEAP32[r6]=r4+1}r15=r1+32|0;while(1){r13=HEAP32[r6];if(r13>>>0<=r14>>>0){break L505}r16=r13-1|0;HEAP32[r6]=r16;if((_ungetc(HEAP8[r16]|0,HEAP32[r15>>2])|0)==-1){r11=-1;break}}STACKTOP=r3;return r11}}while(0);HEAP32[r12]=r2;HEAP8[r9]=1;r11=r2;STACKTOP=r3;return r11}function __ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16;r8=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r9>>2];r9=r1;r10=(r2|0)>>2;r2=HEAP32[r10],r11=r2>>2;if((r2|0)==0){HEAP32[r8]=0;STACKTOP=r1;return}r12=r5;r5=r3;r13=r12-r5|0;r14=r6+12|0;r6=HEAP32[r14>>2];r15=(r6|0)>(r13|0)?r6-r13|0:0;r13=r4;r6=r13-r5|0;do{if((r6|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r3,r6)|0)==(r6|0)){break}HEAP32[r10]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);do{if((r15|0)>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEjc(r9,r15,r7);if((HEAP8[r9]&1)==0){r16=r9+1|0}else{r16=HEAP32[r9+8>>2]}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r16,r15)|0)==(r15|0)){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r9);break}HEAP32[r10]=0;HEAP32[r8]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r9);STACKTOP=r1;return}}while(0);r9=r12-r13|0;do{if((r9|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r4,r9)|0)==(r9|0)){break}HEAP32[r10]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);HEAP32[r14>>2]=0;HEAP32[r8]=r2;STACKTOP=r1;return}function __ZNSt3__18ios_base4InitD2Ev(r1){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(14624);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(14712);__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(14256);__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(14344);return}function __ZNSt3__114__shared_countD2Ev(r1){return}function __ZNSt3__114error_categoryD2Ev(r1){return}function __ZNSt3__114__shared_count12__add_sharedEv(r1){var r2;r2=r1+4|0;tempValue=HEAP32[r2>>2],HEAP32[r2>>2]=tempValue+1,tempValue;return}function __ZNKSt11logic_error4whatEv(r1){return HEAP32[r1+4>>2]}function __ZNKSt13runtime_error4whatEv(r1){return HEAP32[r1+4>>2]}function __ZNSt3__114error_categoryC2Ev(r1){HEAP32[r1>>2]=5200;return}function __ZNKSt3__114error_category23default_error_conditionEi(r1,r2,r3){HEAP32[r1>>2]=r3;HEAP32[r1+4>>2]=r2;return}function __ZNSt3__110__stdinbufIwE9__getcharEb(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8,r7=r6>>2;r8=r4+16;r9=r4+24;r10=r1+52|0;if((HEAP8[r10]&1)!=0){r11=r1+48|0;r12=HEAP32[r11>>2];if(!r2){r13=r12;STACKTOP=r4;return r13}HEAP32[r11>>2]=-1;HEAP8[r10]=0;r13=r12;STACKTOP=r4;return r13}r12=HEAP32[r1+44>>2];r10=(r12|0)>1?r12:1;L565:do{if((r10|0)>0){r12=r1+32|0;r11=0;while(1){r14=_fgetc(HEAP32[r12>>2]);if((r14|0)==-1){r13=-1;break}HEAP8[r5+r11|0]=r14&255;r14=r11+1|0;if((r14|0)<(r10|0)){r11=r14}else{break L565}}STACKTOP=r4;return r13}}while(0);L572:do{if((HEAP8[r1+53|0]&1)==0){r11=r1+40|0;r12=r1+36|0;r14=r5|0;r15=r6+4|0;r16=r1+32|0;r17=r10;while(1){r18=HEAP32[r11>>2];r19=r18;r20=HEAP32[r19>>2];r21=HEAP32[r19+4>>2];r19=HEAP32[r12>>2];r22=r5+r17|0;r23=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+16>>2]](r19,r18,r14,r22,r8,r6,r15,r9);if((r23|0)==2){r13=-1;r3=613;break}else if((r23|0)==3){r3=602;break}else if((r23|0)!=1){r24=r17;break L572}r23=HEAP32[r11>>2];HEAP32[r23>>2]=r20;HEAP32[r23+4>>2]=r21;if((r17|0)==8){r13=-1;r3=614;break}r21=_fgetc(HEAP32[r16>>2]);if((r21|0)==-1){r13=-1;r3=615;break}HEAP8[r22]=r21&255;r17=r17+1|0}if(r3==613){STACKTOP=r4;return r13}else if(r3==614){STACKTOP=r4;return r13}else if(r3==602){HEAP32[r7]=HEAP8[r14]|0;r24=r17;break}else if(r3==615){STACKTOP=r4;return r13}}else{HEAP32[r7]=HEAP8[r5|0]|0;r24=r10}}while(0);if(r2){r2=HEAP32[r7];HEAP32[r1+48>>2]=r2;r13=r2;STACKTOP=r4;return r13}r2=r1+32|0;r1=r24;while(1){if((r1|0)<=0){break}r24=r1-1|0;if((_ungetc(HEAP8[r5+r24|0]|0,HEAP32[r2>>2])|0)==-1){r13=-1;r3=619;break}else{r1=r24}}if(r3==619){STACKTOP=r4;return r13}r13=HEAP32[r7];STACKTOP=r4;return r13}function __ZNSt3__111__stdoutbufIcED1Ev(r1){__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1|0);return}function __ZNSt3__111__stdoutbufIcED0Ev(r1){__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__111__stdoutbufIcE5imbueERKNS_6localeE(r1,r2){var r3,r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14224);r2=r3;HEAP32[r1+36>>2]=r2;r4=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+28>>2]](r2)&1;HEAP8[r1+44|0]=r4;return}function __ZNSt3__111__stdoutbufIcE4syncEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3;r5=r3+8;r6=r1+36|0;r7=r1+40|0;r8=r4|0;r9=r4+8|0;r10=r4;r4=r1+32|0;while(1){r1=HEAP32[r6>>2];r11=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,HEAP32[r7>>2],r8,r9,r5);r1=HEAP32[r5>>2]-r10|0;if((_fwrite(r8,1,r1,HEAP32[r4>>2])|0)!=(r1|0)){r12=-1;r2=628;break}if((r11|0)==2){r12=-1;r2=629;break}else if((r11|0)!=1){r2=626;break}}if(r2==628){STACKTOP=r3;return r12}else if(r2==629){STACKTOP=r3;return r12}else if(r2==626){r12=((_fflush(HEAP32[r4>>2])|0)!=0)<<31>>31;STACKTOP=r3;return r12}}function __ZNSt3__111__stdoutbufIcE8overflowEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8;r7=r4+16;r8=r4+24;r9=(r2|0)==-1;L610:do{if(!r9){HEAP8[r6]=r2&255;if((HEAP8[r1+44|0]&1)!=0){if((_fwrite(r6,1,1,HEAP32[r1+32>>2])|0)==1){break}else{r10=-1}STACKTOP=r4;return r10}r11=r5|0;HEAP32[r7>>2]=r11;r12=r6+1|0;r13=r1+36|0;r14=r1+40|0;r15=r5+8|0;r16=r5;r17=r1+32|0;r18=r6;while(1){r19=HEAP32[r13>>2];r20=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+12>>2]](r19,HEAP32[r14>>2],r18,r12,r8,r11,r15,r7);if((HEAP32[r8>>2]|0)==(r18|0)){r10=-1;r3=644;break}if((r20|0)==3){r3=637;break}r19=(r20|0)==1;if(r20>>>0>=2){r10=-1;r3=647;break}r20=HEAP32[r7>>2]-r16|0;if((_fwrite(r11,1,r20,HEAP32[r17>>2])|0)!=(r20|0)){r10=-1;r3=646;break}if(r19){r18=r19?HEAP32[r8>>2]:r18}else{break L610}}if(r3==637){if((_fwrite(r18,1,1,HEAP32[r17>>2])|0)==1){break}else{r10=-1}STACKTOP=r4;return r10}else if(r3==647){STACKTOP=r4;return r10}else if(r3==644){STACKTOP=r4;return r10}else if(r3==646){STACKTOP=r4;return r10}}}while(0);r10=r9?0:r2;STACKTOP=r4;return r10}function __ZNSt3__110__stdinbufIcEC2EP7__sFILEP10_mbstate_t(r1,r2,r3){var r4,r5,r6,r7;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEEC2Ev(r1|0);HEAP32[r1>>2]=6064;HEAP32[r1+32>>2]=r2;HEAP32[r1+40>>2]=r3;HEAP32[r1+48>>2]=-1;HEAP8[r1+52|0]=0;__ZNSt3__16localeC2ERKS0_(r5,r1+4|0);r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14224);r2=r3;r6=r1+36|0;HEAP32[r6>>2]=r2;r7=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r2);r2=r1+44|0;HEAP32[r2>>2]=r7;r7=HEAP32[r6>>2];r6=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+28>>2]](r7)&1;HEAP8[r1+53|0]=r6;if((HEAP32[r2>>2]|0)<=8){__ZNSt3__16localeD2Ev(r5);STACKTOP=r4;return}__ZNSt3__121__throw_runtime_errorEPKc(424);__ZNSt3__16localeD2Ev(r5);STACKTOP=r4;return}function __ZNSt3__110__stdinbufIcED1Ev(r1){__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1|0);return}function __ZNSt3__110__stdinbufIcED0Ev(r1){__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110__stdinbufIcE5imbueERKNS_6localeE(r1,r2){var r3,r4,r5;r3=__ZNKSt3__16locale9use_facetERNS0_2idE(r2,14224);r2=r3;r4=r1+36|0;HEAP32[r4>>2]=r2;r5=FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r2);r2=r1+44|0;HEAP32[r2>>2]=r5;r5=HEAP32[r4>>2];r4=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+28>>2]](r5)&1;HEAP8[r1+53|0]=r4;if((HEAP32[r2>>2]|0)<=8){return}__ZNSt3__121__throw_runtime_errorEPKc(424);return}function __ZNSt3__110__stdinbufIcE9underflowEv(r1){return __ZNSt3__110__stdinbufIcE9__getcharEb(r1,0)}function __ZNSt3__110__stdinbufIcE5uflowEv(r1){return __ZNSt3__110__stdinbufIcE9__getcharEb(r1,1)}function __ZNSt3__110__stdinbufIcE9pbackfailEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=STACKTOP;STACKTOP=STACKTOP+32|0;r4=r3;r5=r3+8,r6=r5>>2;r7=r3+16;r8=r3+24;r9=r1+52|0;r10=(HEAP8[r9]&1)!=0;if((r2|0)==-1){if(r10){r11=-1;STACKTOP=r3;return r11}r12=HEAP32[r1+48>>2];HEAP8[r9]=(r12|0)!=-1|0;r11=r12;STACKTOP=r3;return r11}r12=(r1+48|0)>>2;L653:do{if(r10){HEAP8[r7]=HEAP32[r12]&255;r13=HEAP32[r1+36>>2];r14=r4|0;r15=FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r13,HEAP32[r1+40>>2],r7,r7+1|0,r8,r14,r4+8|0,r5);if((r15|0)==2|(r15|0)==1){r11=-1;STACKTOP=r3;return r11}else if((r15|0)==3){HEAP8[r14]=HEAP32[r12]&255;HEAP32[r6]=r4+1}r15=r1+32|0;while(1){r13=HEAP32[r6];if(r13>>>0<=r14>>>0){break L653}r16=r13-1|0;HEAP32[r6]=r16;if((_ungetc(HEAP8[r16]|0,HEAP32[r15>>2])|0)==-1){r11=-1;break}}STACKTOP=r3;return r11}}while(0);HEAP32[r12]=r2;HEAP8[r9]=1;r11=r2;STACKTOP=r3;return r11}function __ZNSt3__110__stdinbufIcE9__getcharEb(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8;r7=r4+16;r8=r4+24;r9=r1+52|0;if((HEAP8[r9]&1)!=0){r10=r1+48|0;r11=HEAP32[r10>>2];if(!r2){r12=r11;STACKTOP=r4;return r12}HEAP32[r10>>2]=-1;HEAP8[r9]=0;r12=r11;STACKTOP=r4;return r12}r11=HEAP32[r1+44>>2];r9=(r11|0)>1?r11:1;L673:do{if((r9|0)>0){r11=r1+32|0;r10=0;while(1){r13=_fgetc(HEAP32[r11>>2]);if((r13|0)==-1){r12=-1;break}HEAP8[r5+r10|0]=r13&255;r13=r10+1|0;if((r13|0)<(r9|0)){r10=r13}else{break L673}}STACKTOP=r4;return r12}}while(0);L680:do{if((HEAP8[r1+53|0]&1)==0){r10=r1+40|0;r11=r1+36|0;r13=r5|0;r14=r6+1|0;r15=r1+32|0;r16=r9;while(1){r17=HEAP32[r10>>2];r18=r17;r19=HEAP32[r18>>2];r20=HEAP32[r18+4>>2];r18=HEAP32[r11>>2];r21=r5+r16|0;r22=FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+16>>2]](r18,r17,r13,r21,r7,r6,r14,r8);if((r22|0)==2){r12=-1;r3=706;break}else if((r22|0)==3){r3=694;break}else if((r22|0)!=1){r23=r16;break L680}r22=HEAP32[r10>>2];HEAP32[r22>>2]=r19;HEAP32[r22+4>>2]=r20;if((r16|0)==8){r12=-1;r3=707;break}r20=_fgetc(HEAP32[r15>>2]);if((r20|0)==-1){r12=-1;r3=711;break}HEAP8[r21]=r20&255;r16=r16+1|0}if(r3==711){STACKTOP=r4;return r12}else if(r3==706){STACKTOP=r4;return r12}else if(r3==707){STACKTOP=r4;return r12}else if(r3==694){HEAP8[r6]=HEAP8[r13];r23=r16;break}}else{HEAP8[r6]=HEAP8[r5|0];r23=r9}}while(0);do{if(r2){r9=HEAP8[r6];HEAP32[r1+48>>2]=r9&255;r24=r9}else{r9=r1+32|0;r8=r23;while(1){if((r8|0)<=0){r3=701;break}r7=r8-1|0;if((_ungetc(HEAPU8[r5+r7|0],HEAP32[r9>>2])|0)==-1){r12=-1;r3=708;break}else{r8=r7}}if(r3==701){r24=HEAP8[r6];break}else if(r3==708){STACKTOP=r4;return r12}}}while(0);r12=r24&255;STACKTOP=r4;return r12}function __GLOBAL__I_a(){__ZNSt3__18ios_base4InitC2Ev(0);_atexit(394,14976,___dso_handle);return}function __ZNSt3__114__shared_count16__release_sharedEv(r1){var r2,r3;r2=r1+4|0;if(((tempValue=HEAP32[r2>>2],HEAP32[r2>>2]=tempValue+ -1,tempValue)|0)!=0){r3=0;return r3}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1);r3=1;return r3}function __ZNSt11logic_errorC2EPKc(r1,r2){var r3,r4,r5,r6;HEAP32[r1>>2]=3432;r3=r1+4|0;if((r3|0)==0){return}r1=_strlen(r2);r4=r1+1|0;r5=__Znaj(r1+13|0),r6=r5>>2;HEAP32[r6+1]=r1;HEAP32[r6]=r1;r1=r5+12|0;HEAP32[r3>>2]=r1;HEAP32[r6+2]=0;_memcpy(r1,r2,r4)|0;return}function __ZNSt11logic_errorD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=3432;r2=r1+4|0;r3=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)-1|0)>=0){r4=r1;__ZdlPv(r4);return}r3=HEAP32[r2>>2]-12|0;if((r3|0)==0){r4=r1;__ZdlPv(r4);return}__ZdaPv(r3);r4=r1;__ZdlPv(r4);return}function __ZNSt11logic_errorD2Ev(r1){var r2;HEAP32[r1>>2]=3432;r2=r1+4|0;r1=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)-1|0)>=0){return}r1=HEAP32[r2>>2]-12|0;if((r1|0)==0){return}__ZdaPv(r1);return}function __ZNSt13runtime_errorC2ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE(r1,r2){var r3,r4,r5,r6;HEAP32[r1>>2]=3368;r3=r1+4|0;if((r3|0)==0){return}if((HEAP8[r2]&1)==0){r4=r2+1|0}else{r4=HEAP32[r2+8>>2]}r2=_strlen(r4);r1=r2+1|0;r5=__Znaj(r2+13|0),r6=r5>>2;HEAP32[r6+1]=r2;HEAP32[r6]=r2;r2=r5+12|0;HEAP32[r3>>2]=r2;HEAP32[r6+2]=0;_memcpy(r2,r4,r1)|0;return}function __ZNSt13runtime_errorC2EPKc(r1,r2){var r3,r4,r5,r6;HEAP32[r1>>2]=3368;r3=r1+4|0;if((r3|0)==0){return}r1=_strlen(r2);r4=r1+1|0;r5=__Znaj(r1+13|0),r6=r5>>2;HEAP32[r6+1]=r1;HEAP32[r6]=r1;r1=r5+12|0;HEAP32[r3>>2]=r1;HEAP32[r6+2]=0;_memcpy(r1,r2,r4)|0;return}function __ZNSt13runtime_errorD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=3368;r2=r1+4|0;r3=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)-1|0)>=0){r4=r1;__ZdlPv(r4);return}r3=HEAP32[r2>>2]-12|0;if((r3|0)==0){r4=r1;__ZdlPv(r4);return}__ZdaPv(r3);r4=r1;__ZdlPv(r4);return}function __ZNSt13runtime_errorD2Ev(r1){var r2;HEAP32[r1>>2]=3368;r2=r1+4|0;r1=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)-1|0)>=0){return}r1=HEAP32[r2>>2]-12|0;if((r1|0)==0){return}__ZdaPv(r1);return}function __ZNSt12length_errorD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=3432;r2=r1+4|0;r3=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)-1|0)>=0){r4=r1;__ZdlPv(r4);return}r3=HEAP32[r2>>2]-12|0;if((r3|0)==0){r4=r1;__ZdlPv(r4);return}__ZdaPv(r3);r4=r1;__ZdlPv(r4);return}function __ZNSt3__114error_categoryD0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__114error_category10equivalentERKNS_10error_codeEi(r1,r2,r3){var r4;if((HEAP32[r2+4>>2]|0)!=(r1|0)){r4=0;return r4}r4=(HEAP32[r2>>2]|0)==(r3|0);return r4}function __ZNKSt3__114error_category10equivalentEiRKNS_15error_conditionE(r1,r2,r3){var r4,r5,r6;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r5,r1,r2);if((HEAP32[r5+4>>2]|0)!=(HEAP32[r3+4>>2]|0)){r6=0;STACKTOP=r4;return r6}r6=(HEAP32[r5>>2]|0)==(HEAP32[r3>>2]|0);STACKTOP=r4;return r6}function __ZNKSt3__112__do_message7messageEi(r1,r2,r3){r2=_strerror(r3);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1,r2,_strlen(r2));return}function __ZNSt3__112system_error6__initERKNS_10error_codeENS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r4=STACKTOP;r5=r3,r6=r5>>2;r7=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r8=r2|0;r9=HEAP32[r8>>2];if((r9|0)==0){r10=r1,r11=r10>>2;HEAP32[r11]=HEAP32[r6];HEAP32[r11+1]=HEAP32[r6+1];HEAP32[r11+2]=HEAP32[r6+2];HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;STACKTOP=r4;return}r12=HEAPU8[r5];if((r12&1|0)==0){r13=r12>>>1}else{r13=HEAP32[r3+4>>2]}if((r13|0)==0){r14=r9}else{__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc(r3,1792);r14=HEAP32[r8>>2]}r8=HEAP32[r2+4>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+24>>2]](r7,r8,r14);r14=HEAP8[r7];if((r14&1)==0){r15=r7+1|0}else{r15=HEAP32[r7+8>>2]}r8=r14&255;if((r8&1|0)==0){r16=r8>>>1}else{r16=HEAP32[r7+4>>2]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcj(r3,r15,r16);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r7);r10=r1,r11=r10>>2;HEAP32[r11]=HEAP32[r6];HEAP32[r11+1]=HEAP32[r6+1];HEAP32[r11+2]=HEAP32[r6+2];HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;STACKTOP=r4;return}function __ZNSt3__112system_errorC2ENS_10error_codeEPKc(r1,r2,r3){var r4,r5,r6;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r2;r2=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[r2>>2]=HEAP32[r5>>2];HEAP32[r2+4>>2]=HEAP32[r5+4>>2];r5=r4;r6=r4+16;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r6,r3,_strlen(r3));__ZNSt3__112system_error6__initERKNS_10error_codeENS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE(r5,r2,r6);__ZNSt13runtime_errorC2ERKNSt3__112basic_stringIcNS0_11char_traitsIcEENS0_9allocatorIcEEEE(r1|0,r5);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r5);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r6);HEAP32[r1>>2]=5560;r6=r2;r2=r1+8|0;r1=HEAP32[r6+4>>2];HEAP32[r2>>2]=HEAP32[r6>>2];HEAP32[r2+4>>2]=r1;STACKTOP=r4;return}function __ZNSt3__112system_errorD0Ev(r1){__ZNSt13runtime_errorD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__112system_errorD2Ev(r1){__ZNSt13runtime_errorD2Ev(r1|0);return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1){if((HEAP8[r1]&1)==0){return}__ZdlPv(HEAP32[r1+8>>2]);return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=_strlen(r2);r4=r1;r5=r1;r6=HEAP8[r5];if((r6&1)==0){r7=10;r8=r6}else{r6=HEAP32[r1>>2];r7=(r6&-2)-1|0;r8=r6&255}if(r7>>>0<r3>>>0){r6=r8&255;if((r6&1|0)==0){r9=r6>>>1}else{r9=HEAP32[r1+4>>2]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE21__grow_by_and_replaceEjjjjjjPKc(r1,r7,r3-r7|0,r9,0,r9,r3,r2);return r1}if((r8&1)==0){r10=r4+1|0}else{r10=HEAP32[r1+8>>2]}_memmove(r10,r2,r3,1,0);HEAP8[r10+r3|0]=0;if((HEAP8[r5]&1)==0){HEAP8[r5]=r3<<1&255;return r1}else{HEAP32[r1+4>>2]=r3;return r1}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r1,r2,r3){var r4,r5,r6,r7;r4=r1;r5=HEAP8[r4];r6=r5&255;if((r6&1|0)==0){r7=r6>>>1}else{r7=HEAP32[r1+4>>2]}if(r7>>>0<r2>>>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEjc(r1,r2-r7|0,r3);return}if((r5&1)==0){HEAP8[r1+(r2+1)|0]=0;HEAP8[r4]=r2<<1&255;return}else{HEAP8[HEAP32[r1+8>>2]+r2|0]=0;HEAP32[r1+4>>2]=r2;return}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEjc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10;if((r2|0)==0){return r1}r4=r1;r5=HEAP8[r4];if((r5&1)==0){r6=10;r7=r5}else{r5=HEAP32[r1>>2];r6=(r5&-2)-1|0;r7=r5&255}r5=r7&255;if((r5&1|0)==0){r8=r5>>>1}else{r8=HEAP32[r1+4>>2]}if((r6-r8|0)>>>0<r2>>>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r1,r6,r2-r6+r8|0,r8,r8,0,0);r9=HEAP8[r4]}else{r9=r7}if((r9&1)==0){r10=r1+1|0}else{r10=HEAP32[r1+8>>2]}_memset(r10+r8|0,r3,r2);r3=r8+r2|0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r3<<1&255}else{HEAP32[r1+4>>2]=r3}HEAP8[r10+r3|0]=0;return r1}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKc(r1,r2){return __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcj(r1,r2,_strlen(r2))}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11;r3=r1;r4=HEAP8[r3];if((r4&1)==0){r5=(r4&255)>>>1;r6=10}else{r5=HEAP32[r1+4>>2];r6=(HEAP32[r1>>2]&-2)-1|0}if((r5|0)==(r6|0)){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r1,r6,1,r6,r6,0,0);r7=HEAP8[r3]}else{r7=r4}if((r7&1)==0){HEAP8[r3]=(r5<<1)+2&255;r8=r1+1|0;r9=r5+1|0;r10=r8+r5|0;HEAP8[r10]=r2;r11=r8+r9|0;HEAP8[r11]=0;return}else{r3=HEAP32[r1+8>>2];r7=r5+1|0;HEAP32[r1+4>>2]=r7;r8=r3;r9=r7;r10=r8+r5|0;HEAP8[r10]=r2;r11=r8+r9|0;HEAP8[r11]=0;return}}function __ZNSt3__111__call_onceERVmPvPFvS2_E(r1,r2,r3){var r4;r4=r1>>2;if((HEAP32[r4]|0)==1){while(1){_pthread_cond_wait(10928,10920);if((HEAP32[r4]|0)!=1){break}}}if((HEAP32[r4]|0)!=0){return}HEAP32[r4]=1;FUNCTION_TABLE[r3](r2);HEAP32[r4]=-1;_pthread_cond_broadcast(10928);return}function __ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(r1){r1=___cxa_allocate_exception(8);__ZNSt11logic_errorC2EPKc(r1,696);HEAP32[r1>>2]=3400;___cxa_throw(r1,9336,76)}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_(r1,r2){var r3,r4,r5,r6;r3=r2,r4=r3>>2;if((HEAP8[r3]&1)==0){r3=r1>>2;HEAP32[r3]=HEAP32[r4];HEAP32[r3+1]=HEAP32[r4+1];HEAP32[r3+2]=HEAP32[r4+2];return}r4=HEAP32[r2+8>>2];r3=HEAP32[r2+4>>2];if((r3|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r3>>>0<11){HEAP8[r1]=r3<<1&255;r5=r1+1|0}else{r2=r3+16&-16;r6=__Znwj(r2);HEAP32[r1+8>>2]=r6;HEAP32[r1>>2]=r2|1;HEAP32[r1+4>>2]=r3;r5=r6}_memcpy(r5,r4,r3)|0;HEAP8[r5+r3|0]=0;return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1,r2,r3){var r4,r5,r6,r7;if((r3|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r3>>>0<11){HEAP8[r1]=r3<<1&255;r4=r1+1|0;_memcpy(r4,r2,r3)|0;r5=r4+r3|0;HEAP8[r5]=0;return}else{r6=r3+16&-16;r7=__Znwj(r6);HEAP32[r1+8>>2]=r7;HEAP32[r1>>2]=r6|1;HEAP32[r1+4>>2]=r3;r4=r7;_memcpy(r4,r2,r3)|0;r5=r4+r3|0;HEAP8[r5]=0;return}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEjc(r1,r2,r3){var r4,r5,r6,r7;if((r2|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r2>>>0<11){HEAP8[r1]=r2<<1&255;r4=r1+1|0;_memset(r4,r3,r2);r5=r4+r2|0;HEAP8[r5]=0;return}else{r6=r2+16&-16;r7=__Znwj(r6);HEAP32[r1+8>>2]=r7;HEAP32[r1>>2]=r6|1;HEAP32[r1+4>>2]=r2;r4=r7;_memset(r4,r3,r2);r5=r4+r2|0;HEAP8[r5]=0;return}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=r1>>2;if((r2|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}r4=r1;r5=r1;r1=HEAP8[r5];if((r1&1)==0){r6=10;r7=r1}else{r1=HEAP32[r3];r6=(r1&-2)-1|0;r7=r1&255}r1=r7&255;if((r1&1|0)==0){r8=r1>>>1}else{r8=HEAP32[r3+1]}r1=r8>>>0>r2>>>0?r8:r2;if(r1>>>0<11){r9=11}else{r9=r1+16&-16}r1=r9-1|0;if((r1|0)==(r6|0)){return}if((r1|0)==10){r10=r4+1|0;r11=HEAP32[r3+2];r12=1;r13=0}else{if(r1>>>0>r6>>>0){r14=__Znwj(r9)}else{r14=__Znwj(r9)}r6=r7&1;if(r6<<24>>24==0){r15=r4+1|0}else{r15=HEAP32[r3+2]}r10=r14;r11=r15;r12=r6<<24>>24!=0;r13=1}r6=r7&255;if((r6&1|0)==0){r16=r6>>>1}else{r16=HEAP32[r3+1]}r6=r16+1|0;_memcpy(r10,r11,r6)|0;if(r12){__ZdlPv(r11)}if(r13){HEAP32[r3]=r9|1;HEAP32[r3+1]=r8;HEAP32[r3+2]=r10;return}else{HEAP8[r5]=r8<<1&255;return}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcj(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=r1;r5=HEAP8[r4];if((r5&1)==0){r6=10;r7=r5}else{r5=HEAP32[r1>>2];r6=(r5&-2)-1|0;r7=r5&255}r5=r7&255;if((r5&1|0)==0){r8=r5>>>1}else{r8=HEAP32[r1+4>>2]}if((r6-r8|0)>>>0<r3>>>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE21__grow_by_and_replaceEjjjjjjPKc(r1,r6,r3-r6+r8|0,r8,r8,0,r3,r2);return r1}if((r3|0)==0){return r1}if((r7&1)==0){r9=r1+1|0}else{r9=HEAP32[r1+8>>2]}r7=r9+r8|0;_memcpy(r7,r2,r3)|0;r2=r8+r3|0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r2<<1&255}else{HEAP32[r1+4>>2]=r2}HEAP8[r9+r2|0]=0;return r1}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r1){if((HEAP8[r1]&1)==0){return}__ZdlPv(HEAP32[r1+8>>2]);return}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(r1,r2){return __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(r1,r2,_wcslen(r2))}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=r1;r5=HEAP8[r4];if((r5&1)==0){r6=1;r7=r5}else{r5=HEAP32[r1>>2];r6=(r5&-2)-1|0;r7=r5&255}if(r6>>>0<r3>>>0){r5=r7&255;if((r5&1|0)==0){r8=r5>>>1}else{r8=HEAP32[r1+4>>2]}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE21__grow_by_and_replaceEjjjjjjPKw(r1,r6,r3-r6|0,r8,0,r8,r3,r2);return r1}if((r7&1)==0){r9=r1+4|0}else{r9=HEAP32[r1+8>>2]}_wmemmove(r9,r2,r3);HEAP32[r9+(r3<<2)>>2]=0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r3<<1&255;return r1}else{HEAP32[r1+4>>2]=r3;return r1}}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11;r3=r1;r4=HEAP8[r3];if((r4&1)==0){r5=(r4&255)>>>1;r6=1}else{r5=HEAP32[r1+4>>2];r6=(HEAP32[r1>>2]&-2)-1|0}if((r5|0)==(r6|0)){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r1,r6,1,r6,r6,0,0);r7=HEAP8[r3]}else{r7=r4}if((r7&1)==0){HEAP8[r3]=(r5<<1)+2&255;r8=r1+4|0;r9=r5+1|0;r10=(r5<<2)+r8|0;HEAP32[r10>>2]=r2;r11=(r9<<2)+r8|0;HEAP32[r11>>2]=0;return}else{r3=HEAP32[r1+8>>2];r7=r5+1|0;HEAP32[r1+4>>2]=r7;r8=r3;r9=r7;r10=(r5<<2)+r8|0;HEAP32[r10>>2]=r2;r11=(r9<<2)+r8|0;HEAP32[r11>>2]=0;return}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE21__grow_by_and_replaceEjjjjjjPKc(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;if((-3-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r9=r1+1|0}else{r9=HEAP32[r1+8>>2]}do{if(r2>>>0<2147483631){r10=r3+r2|0;r11=r2<<1;r12=r10>>>0<r11>>>0?r11:r10;if(r12>>>0<11){r13=11;break}r13=r12+16&-16}else{r13=-2}}while(0);r3=__Znwj(r13);if((r5|0)!=0){_memcpy(r3,r9,r5)|0}if((r7|0)!=0){r12=r3+r5|0;_memcpy(r12,r8,r7)|0}r8=r4-r6|0;if((r8|0)!=(r5|0)){r4=r8-r5|0;r12=r3+r7+r5|0;r10=r9+r6+r5|0;_memcpy(r12,r10,r4)|0}if((r2|0)==10){r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r13|1;r16=r1|0;HEAP32[r16>>2]=r15;r17=r8+r7|0;r18=r1+4|0;HEAP32[r18>>2]=r17;r19=r3+r17|0;HEAP8[r19]=0;return}__ZdlPv(r9);r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r13|1;r16=r1|0;HEAP32[r16>>2]=r15;r17=r8+r7|0;r18=r1+4|0;HEAP32[r18>>2]=r17;r19=r3+r17|0;HEAP8[r19]=0;return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15;if((-3-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r8=r1+1|0}else{r8=HEAP32[r1+8>>2]}do{if(r2>>>0<2147483631){r9=r3+r2|0;r10=r2<<1;r11=r9>>>0<r10>>>0?r10:r9;if(r11>>>0<11){r12=11;break}r12=r11+16&-16}else{r12=-2}}while(0);r3=__Znwj(r12);if((r5|0)!=0){_memcpy(r3,r8,r5)|0}r11=r4-r6|0;if((r11|0)!=(r5|0)){r4=r11-r5|0;r11=r3+r7+r5|0;r7=r8+r6+r5|0;_memcpy(r11,r7,r4)|0}if((r2|0)==10){r13=r1+8|0;HEAP32[r13>>2]=r3;r14=r12|1;r15=r1|0;HEAP32[r15>>2]=r14;return}__ZdlPv(r8);r13=r1+8|0;HEAP32[r13>>2]=r3;r14=r12|1;r15=r1|0;HEAP32[r15>>2]=r14;return}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(r1,r2,r3){var r4,r5,r6,r7,r8;if(r3>>>0>1073741822){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r3>>>0<2){HEAP8[r1]=r3<<1&255;r4=r1+4|0;r5=_wmemcpy(r4,r2,r3);r6=(r3<<2)+r4|0;HEAP32[r6>>2]=0;return}else{r7=r3+4&-4;r8=__Znwj(r7<<2);HEAP32[r1+8>>2]=r8;HEAP32[r1>>2]=r7|1;HEAP32[r1+4>>2]=r3;r4=r8;r5=_wmemcpy(r4,r2,r3);r6=(r3<<2)+r4|0;HEAP32[r6>>2]=0;return}}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEjw(r1,r2,r3){var r4,r5,r6,r7,r8;if(r2>>>0>1073741822){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r2>>>0<2){HEAP8[r1]=r2<<1&255;r4=r1+4|0;r5=_wmemset(r4,r3,r2);r6=(r2<<2)+r4|0;HEAP32[r6>>2]=0;return}else{r7=r2+4&-4;r8=__Znwj(r7<<2);HEAP32[r1+8>>2]=r8;HEAP32[r1>>2]=r7|1;HEAP32[r1+4>>2]=r2;r4=r8;r5=_wmemset(r4,r3,r2);r6=(r2<<2)+r4|0;HEAP32[r6>>2]=0;return}}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=r1>>2;if(r2>>>0>1073741822){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}r4=r1;r5=HEAP8[r4];if((r5&1)==0){r6=1;r7=r5}else{r5=HEAP32[r3];r6=(r5&-2)-1|0;r7=r5&255}r5=r7&255;if((r5&1|0)==0){r8=r5>>>1}else{r8=HEAP32[r3+1]}r5=r8>>>0>r2>>>0?r8:r2;if(r5>>>0<2){r9=2}else{r9=r5+4&-4}r5=r9-1|0;if((r5|0)==(r6|0)){return}if((r5|0)==1){r10=r1+4|0;r11=HEAP32[r3+2];r12=1;r13=0}else{r2=r9<<2;if(r5>>>0>r6>>>0){r14=__Znwj(r2)}else{r14=__Znwj(r2)}r2=r7&1;if(r2<<24>>24==0){r15=r1+4|0}else{r15=HEAP32[r3+2]}r10=r14;r11=r15;r12=r2<<24>>24!=0;r13=1}r2=r10;r10=r7&255;if((r10&1|0)==0){r16=r10>>>1}else{r16=HEAP32[r3+1]}_wmemcpy(r2,r11,r16+1|0);if(r12){__ZdlPv(r11)}if(r13){HEAP32[r3]=r9|1;HEAP32[r3+1]=r8;HEAP32[r3+2]=r2;return}else{HEAP8[r4]=r8<<1&255;return}}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE21__grow_by_and_replaceEjjjjjjPKw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;if((1073741821-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r9=r1+4|0}else{r9=HEAP32[r1+8>>2]}do{if(r2>>>0<536870895){r10=r3+r2|0;r11=r2<<1;r12=r10>>>0<r11>>>0?r11:r10;if(r12>>>0<2){r13=2;break}r13=r12+4&-4}else{r13=1073741822}}while(0);r3=__Znwj(r13<<2);if((r5|0)!=0){_wmemcpy(r3,r9,r5)}if((r7|0)!=0){_wmemcpy((r5<<2)+r3|0,r8,r7)}r8=r4-r6|0;if((r8|0)!=(r5|0)){_wmemcpy((r7+r5<<2)+r3|0,(r6+r5<<2)+r9|0,r8-r5|0)}if((r2|0)==1){r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r13|1;r16=r1|0;HEAP32[r16>>2]=r15;r17=r8+r7|0;r18=r1+4|0;HEAP32[r18>>2]=r17;r19=(r17<<2)+r3|0;HEAP32[r19>>2]=0;return}__ZdlPv(r9);r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r13|1;r16=r1|0;HEAP32[r16>>2]=r15;r17=r8+r7|0;r18=r1+4|0;HEAP32[r18>>2]=r17;r19=(r17<<2)+r3|0;HEAP32[r19>>2]=0;return}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15;if((1073741821-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r8=r1+4|0}else{r8=HEAP32[r1+8>>2]}do{if(r2>>>0<536870895){r9=r3+r2|0;r10=r2<<1;r11=r9>>>0<r10>>>0?r10:r9;if(r11>>>0<2){r12=2;break}r12=r11+4&-4}else{r12=1073741822}}while(0);r3=__Znwj(r12<<2);if((r5|0)!=0){_wmemcpy(r3,r8,r5)}r11=r4-r6|0;if((r11|0)!=(r5|0)){_wmemcpy((r7+r5<<2)+r3|0,(r6+r5<<2)+r8|0,r11-r5|0)}if((r2|0)==1){r13=r1+8|0;HEAP32[r13>>2]=r3;r14=r12|1;r15=r1|0;HEAP32[r15>>2]=r14;return}__ZdlPv(r8);r13=r1+8|0;HEAP32[r13>>2]=r3;r14=r12|1;r15=r1|0;HEAP32[r15>>2]=r14;return}function __ZNSt3__18ios_base5clearEj(r1,r2){var r3,r4,r5;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=(HEAP32[r1+24>>2]|0)==0;if(r5){HEAP32[r1+16>>2]=r2|1}else{HEAP32[r1+16>>2]=r2}if(((r5&1|r2)&HEAP32[r1+20>>2]|0)==0){STACKTOP=r3;return}r3=___cxa_allocate_exception(16);do{if((HEAP8[15096]|0)==0){if((___cxa_guard_acquire(15096)|0)==0){break}__ZNSt3__114error_categoryC2Ev(13176);HEAP32[3294]=4896;_atexit(186,13176,___dso_handle)}}while(0);r1=_bitshift64Shl(13176,0,32);HEAP32[r4>>2]=r1&0|1;HEAP32[r4+4>>2]=tempRet0&-1;__ZNSt3__112system_errorC2ENS_10error_codeEPKc(r3,r4,1848);HEAP32[r3>>2]=4080;___cxa_throw(r3,9880,66)}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE5imbueERKNS_6localeE(r1,r2){return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6setbufEPci(r1,r2,r3){return r1}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE4syncEv(r1){return 0}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9showmanycEv(r1){return 0}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9underflowEv(r1){return-1}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9pbackfailEi(r1,r2){return-1}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE8overflowEi(r1,r2){return-1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE5imbueERKNS_6localeE(r1,r2){return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6setbufEPwi(r1,r2,r3){return r1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE4syncEv(r1){return 0}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9showmanycEv(r1){return 0}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9underflowEv(r1){return-1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9pbackfailEi(r1,r2){return-1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE8overflowEi(r1,r2){return-1}function __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED2Ev(r1,r2){return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE7seekoffExNS_8ios_base7seekdirEj(r1,r2,r3,r4,r5,r6){r6=r1;HEAP32[r6>>2]=0;HEAP32[r6+4>>2]=0;r6=r1+8|0;HEAP32[r6>>2]=-1;HEAP32[r6+4>>2]=-1;return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE7seekposENS_4fposI10_mbstate_tEEj(r1,r2,r3,r4){r4=STACKTOP;r2=r3>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;HEAP32[r3>>2]=HEAP32[r2];HEAP32[r3+4>>2]=HEAP32[r2+1];HEAP32[r3+8>>2]=HEAP32[r2+2];HEAP32[r3+12>>2]=HEAP32[r2+3];r2=r1;HEAP32[r2>>2]=0;HEAP32[r2+4>>2]=0;r2=r1+8|0;HEAP32[r2>>2]=-1;HEAP32[r2+4>>2]=-1;STACKTOP=r4;return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE7seekoffExNS_8ios_base7seekdirEj(r1,r2,r3,r4,r5,r6){r6=r1;HEAP32[r6>>2]=0;HEAP32[r6+4>>2]=0;r6=r1+8|0;HEAP32[r6>>2]=-1;HEAP32[r6+4>>2]=-1;return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE7seekposENS_4fposI10_mbstate_tEEj(r1,r2,r3,r4){r4=STACKTOP;r2=r3>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;HEAP32[r3>>2]=HEAP32[r2];HEAP32[r3+4>>2]=HEAP32[r2+1];HEAP32[r3+8>>2]=HEAP32[r2+2];HEAP32[r3+12>>2]=HEAP32[r2+3];r2=r1;HEAP32[r2>>2]=0;HEAP32[r2+4>>2]=0;r2=r1+8|0;HEAP32[r2>>2]=-1;HEAP32[r2+4>>2]=-1;STACKTOP=r4;return}function __ZNSt3__19basic_iosIcNS_11char_traitsIcEEED2Ev(r1){__ZNSt3__18ios_baseD2Ev(r1|0);return}function __ZNKSt3__18ios_base6getlocEv(r1,r2){__ZNSt3__16localeC2ERKS0_(r1,r2+28|0);return}function __ZNSt3__18ios_base4initEPv(r1,r2){var r3;r3=r1>>2;HEAP32[r3+6]=r2;HEAP32[r3+4]=(r2|0)==0;HEAP32[r3+5]=0;HEAP32[r3+1]=4098;HEAP32[r3+3]=0;HEAP32[r3+2]=6;r3=r1+28|0;_memset(r1+32|0,0,40);if((r3|0)==0){return}__ZNSt3__16localeC2Ev(r3);return}function __ZNSt3__19basic_iosIwNS_11char_traitsIwEEED2Ev(r1){__ZNSt3__18ios_baseD2Ev(r1|0);return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED0Ev(r1){HEAP32[r1>>2]=5128;__ZNSt3__16localeD2Ev(r1+4|0);__ZdlPv(r1);return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED1Ev(r1){HEAP32[r1>>2]=5128;__ZNSt3__16localeD2Ev(r1+4|0);return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED2Ev(r1){HEAP32[r1>>2]=5128;__ZNSt3__16localeD2Ev(r1+4|0);return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEEC2Ev(r1){var r2;HEAP32[r1>>2]=5128;__ZNSt3__16localeC2Ev(r1+4|0);r2=(r1+8|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6xsgetnEPci(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+12|0;r8=r1+16|0;r9=r2;r2=0;while(1){r10=HEAP32[r7>>2];if(r10>>>0<HEAP32[r8>>2]>>>0){HEAP32[r7>>2]=r10+1;r11=HEAP8[r10]}else{r10=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+40>>2]](r1);if((r10|0)==-1){r6=r2;r4=1180;break}r11=r10&255}HEAP8[r9]=r11;r10=r2+1|0;if((r10|0)<(r3|0)){r9=r9+1|0;r2=r10}else{r6=r10;r4=1179;break}}if(r4==1179){return r6}else if(r4==1180){return r6}}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE5uflowEv(r1){var r2,r3;if((FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r1)|0)==-1){r2=-1;return r2}r3=r1+12|0;r1=HEAP32[r3>>2];HEAP32[r3>>2]=r1+1;r2=HEAPU8[r1];return r2}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6xsputnEPKci(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+24|0;r8=r1+28|0;r9=0;r10=r2;while(1){r2=HEAP32[r7>>2];if(r2>>>0<HEAP32[r8>>2]>>>0){r11=HEAP8[r10];HEAP32[r7>>2]=r2+1;HEAP8[r2]=r11}else{if((FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+52>>2]](r1,HEAPU8[r10])|0)==-1){r6=r9;r4=1193;break}}r11=r9+1|0;if((r11|0)<(r3|0)){r9=r11;r10=r10+1|0}else{r6=r11;r4=1194;break}}if(r4==1193){return r6}else if(r4==1194){return r6}}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED0Ev(r1){HEAP32[r1>>2]=5056;__ZNSt3__16localeD2Ev(r1+4|0);__ZdlPv(r1);return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED1Ev(r1){HEAP32[r1>>2]=5056;__ZNSt3__16localeD2Ev(r1+4|0);return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED2Ev(r1){HEAP32[r1>>2]=5056;__ZNSt3__16localeD2Ev(r1+4|0);return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEEC2Ev(r1){var r2;HEAP32[r1>>2]=5056;__ZNSt3__16localeC2Ev(r1+4|0);r2=(r1+8|0)>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;HEAP32[r2+3]=0;HEAP32[r2+4]=0;HEAP32[r2+5]=0;return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6xsgetnEPwi(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+12|0;r8=r1+16|0;r9=r2;r2=0;while(1){r10=HEAP32[r7>>2];if(r10>>>0<HEAP32[r8>>2]>>>0){HEAP32[r7>>2]=r10+4;r11=HEAP32[r10>>2]}else{r10=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+40>>2]](r1);if((r10|0)==-1){r6=r2;r4=1208;break}else{r11=r10}}HEAP32[r9>>2]=r11;r10=r2+1|0;if((r10|0)<(r3|0)){r9=r9+4|0;r2=r10}else{r6=r10;r4=1209;break}}if(r4==1209){return r6}else if(r4==1208){return r6}}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE5uflowEv(r1){var r2,r3;if((FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r1)|0)==-1){r2=-1;return r2}r3=r1+12|0;r1=HEAP32[r3>>2];HEAP32[r3>>2]=r1+4;r2=HEAP32[r1>>2];return r2}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6xsputnEPKwi(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+24|0;r8=r1+28|0;r9=0;r10=r2;while(1){r2=HEAP32[r7>>2];if(r2>>>0<HEAP32[r8>>2]>>>0){r11=HEAP32[r10>>2];HEAP32[r7>>2]=r2+4;HEAP32[r2>>2]=r11}else{if((FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+52>>2]](r1,HEAP32[r10>>2])|0)==-1){r6=r9;r4=1224;break}}r11=r9+1|0;if((r11|0)<(r3|0)){r9=r11;r10=r10+4|0}else{r6=r11;r4=1223;break}}if(r4==1223){return r6}else if(r4==1224){return r6}}function __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);__ZdlPv(r1);return}function __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);return}function __ZTv0_n12_NSt3__113basic_istreamIcNS_11char_traitsIcEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+8)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_istreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+8|0);return}function __ZNSt3__113basic_istreamIwNS_11char_traitsIwEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);__ZdlPv(r1);return}function __ZNSt3__113basic_istreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);return}function __ZTv0_n12_NSt3__113basic_istreamIwNS_11char_traitsIwEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+8)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_istreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+8|0);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);__ZdlPv(r1);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIcNS_11char_traitsIcEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+4)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+4|0);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_(r1,r2){var r3,r4;r3=r1|0;HEAP8[r3]=0;HEAP32[r1+4>>2]=r2;r1=HEAP32[HEAP32[r2>>2]-12>>2];r4=r2;if((HEAP32[r1+(r4+16)>>2]|0)!=0){return}r2=HEAP32[r1+(r4+72)>>2];if((r2|0)!=0){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r2)}HEAP8[r3]=1;return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev(r1){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r1);return}function __ZNSt3__18ios_baseD2Ev(r1){var r2,r3,r4,r5;HEAP32[r1>>2]=4056;r2=HEAP32[r1+40>>2];r3=r1+32|0;r4=r1+36|0;if((r2|0)!=0){r5=r2;while(1){r2=r5-1|0;FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+(r2<<2)>>2]](0,r1,HEAP32[HEAP32[r4>>2]+(r2<<2)>>2]);if((r2|0)==0){break}else{r5=r2}}}__ZNSt3__16localeD2Ev(r1+28|0);_free(HEAP32[r3>>2]);_free(HEAP32[r4>>2]);_free(HEAP32[r1+48>>2]);_free(HEAP32[r1+60>>2]);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r1>>2;r5=HEAP32[HEAP32[r4]-12>>2]>>2;r6=r1,r7=r6>>2;if((HEAP32[r5+(r7+6)]|0)==0){STACKTOP=r2;return r1}r8=r3|0;HEAP8[r8]=0;HEAP32[r3+4>>2]=r1;do{if((HEAP32[r5+(r7+4)]|0)==0){r9=HEAP32[r5+(r7+18)];if((r9|0)!=0){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r9)}HEAP8[r8]=1;r9=HEAP32[(HEAP32[HEAP32[r4]-12>>2]+24>>2)+r7];if((FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+24>>2]](r9)|0)!=-1){break}r9=HEAP32[HEAP32[r4]-12>>2];__ZNSt3__18ios_base5clearEj(r6+r9|0,HEAP32[(r9+16>>2)+r7]|1)}}while(0);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r3);STACKTOP=r2;return r1}function __ZNSt3__18ios_base33__set_badbit_and_consider_rethrowEv(r1){var r2;r2=r1+16|0;HEAP32[r2>>2]=HEAP32[r2>>2]|1;if((HEAP32[r1+20>>2]&1|0)==0){return}else{___cxa_rethrow()}}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=r1>>2;r5=HEAP32[HEAP32[r4]-12>>2]>>2;r6=r1,r7=r6>>2;if((HEAP32[r5+(r7+6)]|0)==0){STACKTOP=r2;return r1}r8=r3|0;HEAP8[r8]=0;HEAP32[r3+4>>2]=r1;do{if((HEAP32[r5+(r7+4)]|0)==0){r9=HEAP32[r5+(r7+18)];if((r9|0)!=0){__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(r9)}HEAP8[r8]=1;r9=HEAP32[(HEAP32[HEAP32[r4]-12>>2]+24>>2)+r7];if((FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+24>>2]](r9)|0)!=-1){break}r9=HEAP32[HEAP32[r4]-12>>2];__ZNSt3__18ios_base5clearEj(r6+r9|0,HEAP32[(r9+16>>2)+r7]|1)}}while(0);__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE6sentryD2Ev(r3);STACKTOP=r2;return r1}function __ZNKSt3__119__iostream_category4nameEv(r1){return 2144}function __ZNKSt3__17collateIcE10do_compareEPKcS3_S3_S3_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r1=0;L1360:do{if((r4|0)==(r5|0)){r6=r2}else{r7=r2;r8=r4;while(1){if((r7|0)==(r3|0)){r9=-1;r1=1304;break}r10=HEAP8[r7];r11=HEAP8[r8];if(r10<<24>>24<r11<<24>>24){r9=-1;r1=1302;break}if(r11<<24>>24<r10<<24>>24){r9=1;r1=1301;break}r10=r7+1|0;r11=r8+1|0;if((r11|0)==(r5|0)){r6=r10;break L1360}else{r7=r10;r8=r11}}if(r1==1304){return r9}else if(r1==1301){return r9}else if(r1==1302){return r9}}}while(0);r9=(r6|0)!=(r3|0)|0;return r9}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);__ZdlPv(r1);return}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIwNS_11char_traitsIwEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+4)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+4|0);return}function __ZNKSt3__119__iostream_category7messageEi(r1,r2,r3){if((r3|0)==1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1,2424,35);return}else{__ZNKSt3__112__do_message7messageEi(r1,r2|0,r3);return}}function __ZNSt3__119__iostream_categoryD1Ev(r1){__ZNSt3__114error_categoryD2Ev(r1|0);return}function __ZNSt3__18ios_base7failureD0Ev(r1){__ZNSt3__112system_errorD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18ios_base7failureD2Ev(r1){__ZNSt3__112system_errorD2Ev(r1|0);return}function __ZNSt3__18ios_baseD0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1);__ZdlPv(r1);return}function __ZNSt3__119__iostream_categoryD0Ev(r1){__ZNSt3__114error_categoryD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17collateIcED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17collateIcED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__16locale5facetD2Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r1){var r2,r3,r4;r2=(r1+4|0)>>2;r1=HEAP32[r2];r3=HEAP32[HEAP32[r1>>2]-12>>2]>>2;r4=r1>>2;if((HEAP32[r3+(r4+6)]|0)==0){return}if((HEAP32[r3+(r4+4)]|0)!=0){return}if((HEAP32[r3+(r4+1)]&8192|0)==0){return}if(__ZSt18uncaught_exceptionv()){return}r4=HEAP32[r2];r3=HEAP32[r4+HEAP32[HEAP32[r4>>2]-12>>2]+24>>2];if((FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r3)|0)!=-1){return}r3=HEAP32[r2];r2=HEAP32[HEAP32[r3>>2]-12>>2];r4=r3;__ZNSt3__18ios_base5clearEj(r4+r2|0,HEAP32[r2+(r4+16)>>2]|1);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+40|0;r4=r3;r5=r3+8;r6=r3+16;r7=r3+24;r8=r3+32;r9=r6|0;HEAP8[r9]=0;HEAP32[r6+4>>2]=r1;r10=r1>>2;r11=HEAP32[HEAP32[r10]-12>>2];r12=r1,r13=r12>>2;do{if((HEAP32[(r11+16>>2)+r13]|0)==0){r14=HEAP32[(r11+72>>2)+r13];if((r14|0)!=0){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r14)}HEAP8[r9]=1;__ZNSt3__16localeC2ERKS0_(r7,r12+HEAP32[HEAP32[r10]-12>>2]+28|0);r14=__ZNKSt3__16locale9use_facetERNS0_2idE(r7,14176);__ZNSt3__16localeD2Ev(r7);r15=HEAP32[HEAP32[r10]-12>>2];r16=HEAP32[(r15+24>>2)+r13];r17=r15+(r12+76)|0;r18=HEAP32[r17>>2];if((r18|0)==-1){__ZNSt3__16localeC2ERKS0_(r5,r15+(r12+28)|0);r19=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14528);r20=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+28>>2]](r19,32);__ZNSt3__16localeD2Ev(r5);HEAP32[r17>>2]=r20<<24>>24;r21=r20}else{r21=r18&255}r18=HEAP32[HEAP32[r14>>2]+16>>2];HEAP32[r4>>2]=r16;FUNCTION_TABLE[r18](r8,r14,r4,r12+r15|0,r21,r2);if((HEAP32[r8>>2]|0)!=0){break}r15=HEAP32[HEAP32[r10]-12>>2];__ZNSt3__18ios_base5clearEj(r12+r15|0,HEAP32[(r15+16>>2)+r13]|5)}}while(0);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r6);STACKTOP=r3;return r1}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEElsEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r3=STACKTOP;STACKTOP=STACKTOP+40|0;r4=r3;r5=r3+8;r6=r3+16;r7=r3+24;r8=r3+32;r9=r6|0;HEAP8[r9]=0;HEAP32[r6+4>>2]=r1;r10=r1>>2;r11=HEAP32[HEAP32[r10]-12>>2];r12=r1,r13=r12>>2;do{if((HEAP32[(r11+16>>2)+r13]|0)==0){r14=HEAP32[(r11+72>>2)+r13];if((r14|0)!=0){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r14)}HEAP8[r9]=1;__ZNSt3__16localeC2ERKS0_(r7,r12+HEAP32[HEAP32[r10]-12>>2]+28|0);r14=__ZNKSt3__16locale9use_facetERNS0_2idE(r7,14176);__ZNSt3__16localeD2Ev(r7);r15=HEAP32[HEAP32[r10]-12>>2];r16=HEAP32[(r15+24>>2)+r13];r17=r15+(r12+76)|0;r18=HEAP32[r17>>2];if((r18|0)==-1){__ZNSt3__16localeC2ERKS0_(r5,r15+(r12+28)|0);r19=__ZNKSt3__16locale9use_facetERNS0_2idE(r5,14528);r20=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+28>>2]](r19,32);__ZNSt3__16localeD2Ev(r5);HEAP32[r17>>2]=r20<<24>>24;r21=r20}else{r21=r18&255}r18=HEAP32[HEAP32[r14>>2]+24>>2];HEAP32[r4>>2]=r16;FUNCTION_TABLE[r18](r8,r14,r4,r12+r15|0,r21,r2);if((HEAP32[r8>>2]|0)!=0){break}r15=HEAP32[HEAP32[r10]-12>>2];__ZNSt3__18ios_base5clearEj(r12+r15|0,HEAP32[(r15+16>>2)+r13]|5)}}while(0);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r6);STACKTOP=r3;return r1}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE3putEc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r4=r3;r5=r4|0;HEAP8[r5]=0;HEAP32[r4+4>>2]=r1;r6=r1>>2;r7=HEAP32[HEAP32[r6]-12>>2];r8=r1,r9=r8>>2;do{if((HEAP32[(r7+16>>2)+r9]|0)==0){r10=HEAP32[(r7+72>>2)+r9];if((r10|0)!=0){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r10)}HEAP8[r5]=1;r10=HEAP32[(HEAP32[HEAP32[r6]-12>>2]+24>>2)+r9];r11=r10;if((r10|0)==0){r12=r11}else{r13=r10+24|0;r14=HEAP32[r13>>2];if((r14|0)==(HEAP32[r10+28>>2]|0)){r15=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+52>>2]](r11,r2&255)}else{HEAP32[r13>>2]=r14+1;HEAP8[r14]=r2;r15=r2&255}r12=(r15|0)==-1?0:r11}if((r12|0)!=0){break}r11=HEAP32[HEAP32[r6]-12>>2];__ZNSt3__18ios_base5clearEj(r8+r11|0,HEAP32[(r11+16>>2)+r9]|1)}}while(0);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r4);STACKTOP=r3;return r1}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE6sentryD2Ev(r1){var r2,r3,r4;r2=(r1+4|0)>>2;r1=HEAP32[r2];r3=HEAP32[HEAP32[r1>>2]-12>>2]>>2;r4=r1>>2;if((HEAP32[r3+(r4+6)]|0)==0){return}if((HEAP32[r3+(r4+4)]|0)!=0){return}if((HEAP32[r3+(r4+1)]&8192|0)==0){return}if(__ZSt18uncaught_exceptionv()){return}r4=HEAP32[r2];r3=HEAP32[r4+HEAP32[HEAP32[r4>>2]-12>>2]+24>>2];if((FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+24>>2]](r3)|0)!=-1){return}r3=HEAP32[r2];r2=HEAP32[HEAP32[r3>>2]-12>>2];r4=r3;__ZNSt3__18ios_base5clearEj(r4+r2|0,HEAP32[r2+(r4+16)>>2]|1);return}function __ZNKSt3__17collateIcE7do_hashEPKcS3_(r1,r2,r3){var r4,r5,r6,r7;if((r2|0)==(r3|0)){r4=0;return r4}else{r5=r2;r6=0}while(1){r2=(r6<<4)+HEAP8[r5]|0;r1=r2&-268435456;r7=(r1>>>24|r1)^r2;r2=r5+1|0;if((r2|0)==(r3|0)){r4=r7;break}else{r5=r2;r6=r7}}return r4}function __ZNKSt3__17collateIwE10do_compareEPKwS3_S3_S3_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r1=0;L1481:do{if((r4|0)==(r5|0)){r6=r2}else{r7=r2;r8=r4;while(1){if((r7|0)==(r3|0)){r9=-1;r1=1442;break}r10=HEAP32[r7>>2];r11=HEAP32[r8>>2];if((r10|0)<(r11|0)){r9=-1;r1=1443;break}if((r11|0)<(r10|0)){r9=1;r1=1440;break}r10=r7+4|0;r11=r8+4|0;if((r11|0)==(r5|0)){r6=r10;break L1481}else{r7=r10;r8=r11}}if(r1==1442){return r9}else if(r1==1443){return r9}else if(r1==1440){return r9}}}while(0);r9=(r6|0)!=(r3|0)|0;return r9}function __ZNKSt3__17collateIwE7do_hashEPKwS3_(r1,r2,r3){var r4,r5,r6,r7;if((r2|0)==(r3|0)){r4=0;return r4}else{r5=r2;r6=0}while(1){r2=(r6<<4)+HEAP32[r5>>2]|0;r1=r2&-268435456;r7=(r1>>>24|r1)^r2;r2=r5+4|0;if((r2|0)==(r3|0)){r4=r7;break}else{r5=r2;r6=r7}}return r4}function __ZNKSt3__17collateIcE12do_transformEPKcS3_(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r2=0;r5=r3;r6=r4-r5|0;do{if((r6|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(r1);r2=1453}else{if(r6>>>0>=11){r2=1453;break}HEAP8[r1]=r6<<1&255;r7=r1+1|0}}while(0);if(r2==1453){r2=r6+16&-16;r8=__Znwj(r2);HEAP32[r1+8>>2]=r8;HEAP32[r1>>2]=r2|1;HEAP32[r1+4>>2]=r6;r7=r8}if((r3|0)==(r4|0)){r9=r7;HEAP8[r9]=0;return}r8=r4+ -r5|0;r5=r7;r6=r3;while(1){HEAP8[r5]=HEAP8[r6];r3=r6+1|0;if((r3|0)==(r4|0)){break}else{r5=r5+1|0;r6=r3}}r9=r7+r8|0;HEAP8[r9]=0;return}function __ZNSt3__17collateIwED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17collateIwED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__17collateIwE12do_transformEPKwS3_(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r2=r3;r5=r4-r2|0;r6=r5>>2;if(r6>>>0>1073741822){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(r1)}if(r6>>>0<2){HEAP8[r1]=r5>>>1&255;r7=r1+4|0}else{r5=r6+4&-4;r8=__Znwj(r5<<2);HEAP32[r1+8>>2]=r8;HEAP32[r1>>2]=r5|1;HEAP32[r1+4>>2]=r6;r7=r8}if((r3|0)==(r4|0)){r9=r7;HEAP32[r9>>2]=0;return}r8=(r4-4+ -r2|0)>>>2;r2=r7;r6=r3;while(1){HEAP32[r2>>2]=HEAP32[r6>>2];r3=r6+4|0;if((r3|0)==(r4|0)){break}else{r2=r2+4|0;r6=r3}}r9=(r8+1<<2)+r7|0;HEAP32[r9>>2]=0;return}function __ZNSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r8=STACKTOP;STACKTOP=STACKTOP+112|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16,r12=r11>>2;r13=r8+32;r14=r8+40;r15=r8+48;r16=r8+56;r17=r8+64;r18=r8+72;r19=r8+80;r20=r8+104;if((HEAP32[r5+4>>2]&1|0)==0){HEAP32[r13>>2]=-1;r21=HEAP32[HEAP32[r2>>2]+16>>2];r22=r3|0;HEAP32[r15>>2]=HEAP32[r22>>2];HEAP32[r16>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r21](r14,r2,r15,r16,r5,r6,r13);r16=HEAP32[r14>>2];HEAP32[r22>>2]=r16;r22=HEAP32[r13>>2];if((r22|0)==0){HEAP8[r7]=0}else if((r22|0)==1){HEAP8[r7]=1}else{HEAP8[r7]=1;HEAP32[r6>>2]=4}HEAP32[r1>>2]=r16;STACKTOP=r8;return}__ZNKSt3__18ios_base6getlocEv(r17,r5);r16=r17|0;r17=HEAP32[r16>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r12]=14528;HEAP32[r12+1]=26;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r11,260)}r11=HEAP32[3633]-1|0;r12=HEAP32[r17+8>>2];do{if(HEAP32[r17+12>>2]-r12>>2>>>0>r11>>>0){r22=HEAP32[r12+(r11<<2)>>2];if((r22|0)==0){break}r13=r22;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r16>>2]|0);__ZNKSt3__18ios_base6getlocEv(r18,r5);r22=r18|0;r14=HEAP32[r22>>2];if((HEAP32[3536]|0)!=-1){HEAP32[r10]=14144;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14144,r9,260)}r15=HEAP32[3537]-1|0;r2=HEAP32[r14+8>>2];do{if(HEAP32[r14+12>>2]-r2>>2>>>0>r15>>>0){r21=HEAP32[r2+(r15<<2)>>2];if((r21|0)==0){break}r23=r21;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r22>>2]|0);r24=r19|0;r25=r21;FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+24>>2]](r24,r23);FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+28>>2]](r19+12|0,r23);HEAP32[r20>>2]=HEAP32[r4>>2];r23=(__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r20,r24,r19+24|0,r13,r6,1)|0)==(r24|0)|0;HEAP8[r7]=r23;HEAP32[r1>>2]=HEAP32[r3>>2];__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r19+12|0);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r19|0);STACKTOP=r8;return}}while(0);r13=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r13);___cxa_throw(r13,9304,382)}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+104|0;r10=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r10>>2];r10=(r4-r3|0)/12&-1;r11=r9|0;do{if(r10>>>0>100){r12=_malloc(r10);if((r12|0)!=0){r13=r12;r14=r12;break}__ZSt17__throw_bad_allocv();r13=0;r14=0}else{r13=r11;r14=0}}while(0);r11=(r3|0)==(r4|0);if(r11){r15=r10;r16=0}else{r12=r10;r10=0;r17=r13;r18=r3;while(1){r19=HEAPU8[r18];if((r19&1|0)==0){r20=r19>>>1}else{r20=HEAP32[r18+4>>2]}if((r20|0)==0){HEAP8[r17]=2;r21=r10+1|0;r22=r12-1|0}else{HEAP8[r17]=1;r21=r10;r22=r12}r19=r18+12|0;if((r19|0)==(r4|0)){r15=r22;r16=r21;break}else{r12=r22;r10=r21;r17=r17+1|0;r18=r19}}}r18=(r1|0)>>2;r1=(r2|0)>>2;r2=r5;r17=0;r21=r16;r16=r15;while(1){r15=HEAP32[r18],r10=r15>>2;do{if((r15|0)==0){r23=0}else{if((HEAP32[r10+3]|0)!=(HEAP32[r10+4]|0)){r23=r15;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r15)|0)==-1){HEAP32[r18]=0;r23=0;break}else{r23=HEAP32[r18];break}}}while(0);r15=(r23|0)==0;r10=HEAP32[r1],r22=r10>>2;if((r10|0)==0){r24=r23,r25=r24>>2;r26=0,r27=r26>>2}else{do{if((HEAP32[r22+3]|0)==(HEAP32[r22+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r10)|0)!=-1){r28=r10;break}HEAP32[r1]=0;r28=0}else{r28=r10}}while(0);r24=HEAP32[r18],r25=r24>>2;r26=r28,r27=r26>>2}r29=(r26|0)==0;if(!((r15^r29)&(r16|0)!=0)){break}r10=HEAP32[r25+3];if((r10|0)==(HEAP32[r25+4]|0)){r30=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)&255}else{r30=HEAP8[r10]}if(r7){r31=r30}else{r31=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+12>>2]](r5,r30)}do{if(r11){r32=r21;r33=r16}else{r10=r17+1|0;L1609:do{if(r7){r22=r16;r12=r21;r20=r13;r19=0;r34=r3;while(1){do{if((HEAP8[r20]|0)==1){r35=r34;if((HEAP8[r35]&1)==0){r36=r34+1|0}else{r36=HEAP32[r34+8>>2]}if(r31<<24>>24!=(HEAP8[r36+r17|0]|0)){HEAP8[r20]=0;r37=r19;r38=r12;r39=r22-1|0;break}r40=HEAPU8[r35];if((r40&1|0)==0){r41=r40>>>1}else{r41=HEAP32[r34+4>>2]}if((r41|0)!=(r10|0)){r37=1;r38=r12;r39=r22;break}HEAP8[r20]=2;r37=1;r38=r12+1|0;r39=r22-1|0}else{r37=r19;r38=r12;r39=r22}}while(0);r40=r34+12|0;if((r40|0)==(r4|0)){r42=r39;r43=r38;r44=r37;break L1609}r22=r39;r12=r38;r20=r20+1|0;r19=r37;r34=r40}}else{r34=r16;r19=r21;r20=r13;r12=0;r22=r3;while(1){do{if((HEAP8[r20]|0)==1){r40=r22;if((HEAP8[r40]&1)==0){r45=r22+1|0}else{r45=HEAP32[r22+8>>2]}if(r31<<24>>24!=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+12>>2]](r5,HEAP8[r45+r17|0])<<24>>24){HEAP8[r20]=0;r46=r12;r47=r19;r48=r34-1|0;break}r35=HEAPU8[r40];if((r35&1|0)==0){r49=r35>>>1}else{r49=HEAP32[r22+4>>2]}if((r49|0)!=(r10|0)){r46=1;r47=r19;r48=r34;break}HEAP8[r20]=2;r46=1;r47=r19+1|0;r48=r34-1|0}else{r46=r12;r47=r19;r48=r34}}while(0);r35=r22+12|0;if((r35|0)==(r4|0)){r42=r48;r43=r47;r44=r46;break L1609}r34=r48;r19=r47;r20=r20+1|0;r12=r46;r22=r35}}}while(0);if(!r44){r32=r43;r33=r42;break}r10=HEAP32[r18];r22=r10+12|0;r12=HEAP32[r22>>2];if((r12|0)==(HEAP32[r10+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+40>>2]](r10)}else{HEAP32[r22>>2]=r12+1}if((r43+r42|0)>>>0<2|r11){r32=r43;r33=r42;break}r12=r17+1|0;r22=r43;r10=r13;r20=r3;while(1){do{if((HEAP8[r10]|0)==2){r19=HEAPU8[r20];if((r19&1|0)==0){r50=r19>>>1}else{r50=HEAP32[r20+4>>2]}if((r50|0)==(r12|0)){r51=r22;break}HEAP8[r10]=0;r51=r22-1|0}else{r51=r22}}while(0);r19=r20+12|0;if((r19|0)==(r4|0)){r32=r51;r33=r42;break}else{r22=r51;r10=r10+1|0;r20=r19}}}}while(0);r17=r17+1|0;r21=r32;r16=r33}do{if((r24|0)==0){r52=0}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){r52=r24;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r18]=0;r52=0;break}else{r52=HEAP32[r18];break}}}while(0);r18=(r52|0)==0;do{if(r29){r8=1600}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){if(r18){break}else{r8=1602;break}}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)|0)==-1){HEAP32[r1]=0;r8=1600;break}else{if(r18^(r26|0)==0){break}else{r8=1602;break}}}}while(0);if(r8==1600){if(r18){r8=1602}}if(r8==1602){HEAP32[r6>>2]=HEAP32[r6>>2]|2}L1688:do{if(r11){r8=1607}else{r18=r3;r26=r13;while(1){if((HEAP8[r26]|0)==2){r53=r18;break L1688}r1=r18+12|0;if((r1|0)==(r4|0)){r8=1607;break L1688}r18=r1;r26=r26+1|0}}}while(0);if(r8==1607){HEAP32[r6>>2]=HEAP32[r6>>2]|4;r53=r4}if((r14|0)==0){STACKTOP=r9;return r53}_free(r14);STACKTOP=r9;return r53}function __ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16;r11=r5>>2;r5=r4>>2;r4=HEAP32[r5];r12=(r4|0)==(r3|0);do{if(r12){r13=(HEAP8[r10+24|0]|0)==r1<<24>>24;if(!r13){if((HEAP8[r10+25|0]|0)!=r1<<24>>24){break}}HEAP32[r5]=r3+1;HEAP8[r3]=r13?43:45;HEAP32[r11]=0;r14=0;return r14}}while(0);r13=HEAPU8[r7];if((r13&1|0)==0){r15=r13>>>1}else{r15=HEAP32[r7+4>>2]}if((r15|0)!=0&r1<<24>>24==r6<<24>>24){r6=HEAP32[r9>>2];if((r6-r8|0)>=160){r14=0;return r14}r8=HEAP32[r11];HEAP32[r9>>2]=r6+4;HEAP32[r6>>2]=r8;HEAP32[r11]=0;r14=0;return r14}r8=r10+26|0;r6=r10;while(1){if((r6|0)==(r8|0)){r16=r8;break}if((HEAP8[r6]|0)==r1<<24>>24){r16=r6;break}else{r6=r6+1|0}}r6=r16-r10|0;if((r6|0)>23){r14=-1;return r14}do{if((r2|0)==8|(r2|0)==10){if((r6|0)<(r2|0)){break}else{r14=-1}return r14}else if((r2|0)==16){if((r6|0)<22){break}if(r12){r14=-1;return r14}if((r4-r3|0)>=3){r14=-1;return r14}if((HEAP8[r4-1|0]|0)!=48){r14=-1;return r14}HEAP32[r11]=0;r10=HEAP8[r6+10936|0];r16=HEAP32[r5];HEAP32[r5]=r16+1;HEAP8[r16]=r10;r14=0;return r14}}while(0);r3=HEAP8[r6+10936|0];HEAP32[r5]=r4+1;HEAP8[r4]=r3;HEAP32[r11]=HEAP32[r11]+1;r14=0;return r14}function __ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=r1;r6=r1;r7=HEAP8[r6];r8=r7&255;if((r8&1|0)==0){r9=r8>>>1}else{r9=HEAP32[r1+4>>2]}if((r9|0)==0){return}do{if((r2|0)==(r3|0)){r10=r7}else{r9=r3-4|0;if(r9>>>0>r2>>>0){r11=r2;r12=r9}else{r10=r7;break}while(1){r9=HEAP32[r11>>2];HEAP32[r11>>2]=HEAP32[r12>>2];HEAP32[r12>>2]=r9;r9=r11+4|0;r8=r12-4|0;if(r9>>>0<r8>>>0){r11=r9;r12=r8}else{break}}r10=HEAP8[r6]}}while(0);if((r10&1)==0){r13=r5+1|0}else{r13=HEAP32[r1+8>>2]}r5=r10&255;if((r5&1|0)==0){r14=r5>>>1}else{r14=HEAP32[r1+4>>2]}r1=r3-4|0;r3=HEAP8[r13];r5=r3<<24>>24;r10=r3<<24>>24<1|r3<<24>>24==127;L1765:do{if(r1>>>0>r2>>>0){r3=r13+r14|0;r6=r13;r12=r2;r11=r5;r7=r10;while(1){if(!r7){if((r11|0)!=(HEAP32[r12>>2]|0)){break}}r8=(r3-r6|0)>1?r6+1|0:r6;r9=r12+4|0;r15=HEAP8[r8];r16=r15<<24>>24;r17=r15<<24>>24<1|r15<<24>>24==127;if(r9>>>0<r1>>>0){r6=r8;r12=r9;r11=r16;r7=r17}else{r18=r16;r19=r17;break L1765}}HEAP32[r4>>2]=4;return}else{r18=r5;r19=r10}}while(0);if(r19){return}r19=HEAP32[r1>>2];if(!(r18>>>0<r19>>>0|(r19|0)==0)){return}HEAP32[r4>>2]=4;return}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRl(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+72|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==0){r22=0}else if((r21|0)==64){r22=8}else if((r21|0)==8){r22=16}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP8[r10];r10=r23;r23=HEAP32[r14],r27=r23>>2;L1793:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){r28=r23,r29=r28>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r30=(r28|0)==0;r31=HEAP32[r3],r32=r31>>2;do{if((r31|0)==0){r2=1696}else{if((HEAP32[r32+3]|0)!=(HEAP32[r32+4]|0)){if(r30){r33=r31;r34=0;break}else{r35=r10;r36=r31,r37=r36>>2;r38=0;break L1793}}if((FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)|0)==-1){HEAP32[r3]=0;r2=1696;break}else{r39=(r31|0)==0;if(r30^r39){r33=r31;r34=r39;break}else{r35=r10;r36=r31,r37=r36>>2;r38=r39;break L1793}}}}while(0);if(r2==1696){r2=0;if(r30){r35=r10;r36=0,r37=r36>>2;r38=1;break}else{r33=0;r34=1}}r31=HEAPU8[r13];r32=(r31&1|0)==0;if((HEAP32[r16]-r10|0)==((r32?r31>>>1:HEAP32[r9>>2])|0)){if(r32){r40=r31>>>1;r41=r31>>>1}else{r31=HEAP32[r9>>2];r40=r31;r41=r31}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r40<<1,0);if((HEAP8[r13]&1)==0){r42=10}else{r42=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42,0);if((HEAP8[r13]&1)==0){r43=r24}else{r43=HEAP32[r25>>2]}HEAP32[r16]=r43+r41;r44=r43}else{r44=r10}r31=(r28+12|0)>>2;r32=HEAP32[r31];r39=r28+16|0;if((r32|0)==(HEAP32[r39>>2]|0)){r45=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)&255}else{r45=HEAP8[r32]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r45,r22,r44,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r35=r44;r36=r33,r37=r36>>2;r38=r34;break}r32=HEAP32[r31];if((r32|0)==(HEAP32[r39>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r44;r23=r28,r27=r23>>2;continue}else{HEAP32[r31]=r32+1;r10=r44;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r46=r23>>>1}else{r46=HEAP32[r11+4>>2]}do{if((r46|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__125__num_get_signed_integralIlEET_PKcS3_Rji(r35,HEAP32[r16],r6,r22);HEAP32[r7>>2]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r30){r47=0}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r47=r28;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){r47=r28;break}HEAP32[r14]=0;r47=0}}while(0);r14=(r47|0)==0;L1853:do{if(r38){r2=1737}else{do{if((HEAP32[r37+3]|0)==(HEAP32[r37+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r36)|0)!=-1){break}HEAP32[r3]=0;r2=1737;break L1853}}while(0);if(!(r14^(r36|0)==0)){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==1737){if(r14){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__125__num_get_signed_integralIlEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=___errno_location();r9=HEAP32[r8>>2];r8=___errno_location();HEAP32[r8>>2]=0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r8=_newlocale(1,2e3,0);HEAP32[3292]=r8}}while(0);r8=_strtoll(r1,r6,r4,HEAP32[3292]);r4=tempRet0;r1=___errno_location();r10=HEAP32[r1>>2];if((r10|0)==0){r1=___errno_location();HEAP32[r1>>2]=r9}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=-1;r6=0;if((r10|0)==34|((r4|0)<(r2|0)|(r4|0)==(r2|0)&r8>>>0<-2147483648>>>0)|((r4|0)>(r6|0)|(r4|0)==(r6|0)&r8>>>0>2147483647>>>0)){HEAP32[r3>>2]=4;r3=0;r7=(r4|0)>(r3|0)|(r4|0)==(r3|0)&r8>>>0>0>>>0?2147483647:-2147483648;STACKTOP=r5;return r7}else{r7=r8;STACKTOP=r5;return r7}}function __ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+40|0;r6=r5,r7=r6>>2;r8=r5+16,r9=r8>>2;r10=r5+32;__ZNKSt3__18ios_base6getlocEv(r10,r2);r2=(r10|0)>>2;r10=HEAP32[r2];if((HEAP32[3632]|0)!=-1){HEAP32[r9]=14528;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r8,260)}r8=HEAP32[3633]-1|0;r9=HEAP32[r10+8>>2];do{if(HEAP32[r10+12>>2]-r9>>2>>>0>r8>>>0){r11=HEAP32[r9+(r8<<2)>>2];if((r11|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+32>>2]](r11,10936,10962,r3);r11=HEAP32[r2];if((HEAP32[3536]|0)!=-1){HEAP32[r7]=14144;HEAP32[r7+1]=26;HEAP32[r7+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14144,r6,260)}r12=HEAP32[3537]-1|0;r13=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r13>>2>>>0>r12>>>0){r14=HEAP32[r13+(r12<<2)>>2];if((r14|0)==0){break}r15=r14;r16=FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+16>>2]](r15);HEAP8[r4]=r16;FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+20>>2]](r1,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2]|0);STACKTOP=r5;return}}while(0);r12=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r12);___cxa_throw(r12,9304,382)}}while(0);r5=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r5);___cxa_throw(r5,9304,382)}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+72|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==64){r22=8}else if((r21|0)==0){r22=0}else if((r21|0)==8){r22=16}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP8[r10];r10=r23;r23=HEAP32[r14],r27=r23>>2;L1919:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){r28=r23,r29=r28>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r30=(r28|0)==0;r31=HEAP32[r3],r32=r31>>2;do{if((r31|0)==0){r2=1800}else{if((HEAP32[r32+3]|0)!=(HEAP32[r32+4]|0)){if(r30){r33=r31;r34=0;break}else{r35=r10;r36=r31,r37=r36>>2;r38=0;break L1919}}if((FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)|0)==-1){HEAP32[r3]=0;r2=1800;break}else{r39=(r31|0)==0;if(r30^r39){r33=r31;r34=r39;break}else{r35=r10;r36=r31,r37=r36>>2;r38=r39;break L1919}}}}while(0);if(r2==1800){r2=0;if(r30){r35=r10;r36=0,r37=r36>>2;r38=1;break}else{r33=0;r34=1}}r31=HEAPU8[r13];r32=(r31&1|0)==0;if((HEAP32[r16]-r10|0)==((r32?r31>>>1:HEAP32[r9>>2])|0)){if(r32){r40=r31>>>1;r41=r31>>>1}else{r31=HEAP32[r9>>2];r40=r31;r41=r31}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r40<<1,0);if((HEAP8[r13]&1)==0){r42=10}else{r42=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42,0);if((HEAP8[r13]&1)==0){r43=r24}else{r43=HEAP32[r25>>2]}HEAP32[r16]=r43+r41;r44=r43}else{r44=r10}r31=(r28+12|0)>>2;r32=HEAP32[r31];r39=r28+16|0;if((r32|0)==(HEAP32[r39>>2]|0)){r45=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)&255}else{r45=HEAP8[r32]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r45,r22,r44,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r35=r44;r36=r33,r37=r36>>2;r38=r34;break}r32=HEAP32[r31];if((r32|0)==(HEAP32[r39>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r44;r23=r28,r27=r23>>2;continue}else{HEAP32[r31]=r32+1;r10=r44;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r46=r23>>>1}else{r46=HEAP32[r11+4>>2]}do{if((r46|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__125__num_get_signed_integralIxEET_PKcS3_Rji(r35,HEAP32[r16],r6,r22);HEAP32[r7>>2]=r20;HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r30){r47=0}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r47=r28;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){r47=r28;break}HEAP32[r14]=0;r47=0}}while(0);r14=(r47|0)==0;L1979:do{if(r38){r2=1841}else{do{if((HEAP32[r37+3]|0)==(HEAP32[r37+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r36)|0)!=-1){break}HEAP32[r3]=0;r2=1841;break L1979}}while(0);if(!(r14^(r36|0)==0)){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==1841){if(r14){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__125__num_get_signed_integralIxEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;do{if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0}else{r9=___errno_location();r10=HEAP32[r9>>2];r9=___errno_location();HEAP32[r9>>2]=0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r9=_newlocale(1,2e3,0);HEAP32[3292]=r9}}while(0);r9=_strtoll(r1,r6,r4,HEAP32[3292]);r11=tempRet0;r12=___errno_location();r13=HEAP32[r12>>2];if((r13|0)==0){r12=___errno_location();HEAP32[r12>>2]=r10}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0;break}if((r13|0)!=34){r7=r11;r8=r9;break}HEAP32[r3>>2]=4;r13=0;r12=(r11|0)>(r13|0)|(r11|0)==(r13|0)&r9>>>0>0>>>0;r7=r12?2147483647:-2147483648;r8=r12?-1:0}}while(0);STACKTOP=r5;return tempRet0=r7,r8}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRt(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+72|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==64){r22=8}else if((r21|0)==0){r22=0}else if((r21|0)==8){r22=16}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP8[r10];r10=r23;r23=HEAP32[r14],r27=r23>>2;L2020:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){r28=r23,r29=r28>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r30=(r28|0)==0;r31=HEAP32[r3],r32=r31>>2;do{if((r31|0)==0){r2=1882}else{if((HEAP32[r32+3]|0)!=(HEAP32[r32+4]|0)){if(r30){r33=r31;r34=0;break}else{r35=r10;r36=r31,r37=r36>>2;r38=0;break L2020}}if((FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)|0)==-1){HEAP32[r3]=0;r2=1882;break}else{r39=(r31|0)==0;if(r30^r39){r33=r31;r34=r39;break}else{r35=r10;r36=r31,r37=r36>>2;r38=r39;break L2020}}}}while(0);if(r2==1882){r2=0;if(r30){r35=r10;r36=0,r37=r36>>2;r38=1;break}else{r33=0;r34=1}}r31=HEAPU8[r13];r32=(r31&1|0)==0;if((HEAP32[r16]-r10|0)==((r32?r31>>>1:HEAP32[r9>>2])|0)){if(r32){r40=r31>>>1;r41=r31>>>1}else{r31=HEAP32[r9>>2];r40=r31;r41=r31}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r40<<1,0);if((HEAP8[r13]&1)==0){r42=10}else{r42=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42,0);if((HEAP8[r13]&1)==0){r43=r24}else{r43=HEAP32[r25>>2]}HEAP32[r16]=r43+r41;r44=r43}else{r44=r10}r31=(r28+12|0)>>2;r32=HEAP32[r31];r39=r28+16|0;if((r32|0)==(HEAP32[r39>>2]|0)){r45=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)&255}else{r45=HEAP8[r32]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r45,r22,r44,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r35=r44;r36=r33,r37=r36>>2;r38=r34;break}r32=HEAP32[r31];if((r32|0)==(HEAP32[r39>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r44;r23=r28,r27=r23>>2;continue}else{HEAP32[r31]=r32+1;r10=r44;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r46=r23>>>1}else{r46=HEAP32[r11+4>>2]}do{if((r46|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__127__num_get_unsigned_integralItEET_PKcS3_Rji(r35,HEAP32[r16],r6,r22);HEAP16[r7>>1]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r30){r47=0}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r47=r28;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){r47=r28;break}HEAP32[r14]=0;r47=0}}while(0);r14=(r47|0)==0;L2080:do{if(r38){r2=1923}else{do{if((HEAP32[r37+3]|0)==(HEAP32[r37+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r36)|0)!=-1){break}HEAP32[r3]=0;r2=1923;break L2080}}while(0);if(!(r14^(r36|0)==0)){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==1923){if(r14){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralItEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=___errno_location();r9=HEAP32[r8>>2];r8=___errno_location();HEAP32[r8>>2]=0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r8=_newlocale(1,2e3,0);HEAP32[3292]=r8}}while(0);r8=_strtoull(r1,r6,r4,HEAP32[3292]);r4=tempRet0;r1=___errno_location();r10=HEAP32[r1>>2];if((r10|0)==0){r1=___errno_location();HEAP32[r1>>2]=r9}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=0;if((r10|0)==34|(r4>>>0>r2>>>0|r4>>>0==r2>>>0&r8>>>0>65535>>>0)){HEAP32[r3>>2]=4;r7=-1;STACKTOP=r5;return r7}else{r7=r8&65535;STACKTOP=r5;return r7}}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+72|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==64){r22=8}else if((r21|0)==0){r22=0}else if((r21|0)==8){r22=16}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP8[r10];r10=r23;r23=HEAP32[r14],r27=r23>>2;L2130:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){r28=r23,r29=r28>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r30=(r28|0)==0;r31=HEAP32[r3],r32=r31>>2;do{if((r31|0)==0){r2=1972}else{if((HEAP32[r32+3]|0)!=(HEAP32[r32+4]|0)){if(r30){r33=r31;r34=0;break}else{r35=r10;r36=r31,r37=r36>>2;r38=0;break L2130}}if((FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)|0)==-1){HEAP32[r3]=0;r2=1972;break}else{r39=(r31|0)==0;if(r30^r39){r33=r31;r34=r39;break}else{r35=r10;r36=r31,r37=r36>>2;r38=r39;break L2130}}}}while(0);if(r2==1972){r2=0;if(r30){r35=r10;r36=0,r37=r36>>2;r38=1;break}else{r33=0;r34=1}}r31=HEAPU8[r13];r32=(r31&1|0)==0;if((HEAP32[r16]-r10|0)==((r32?r31>>>1:HEAP32[r9>>2])|0)){if(r32){r40=r31>>>1;r41=r31>>>1}else{r31=HEAP32[r9>>2];r40=r31;r41=r31}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r40<<1,0);if((HEAP8[r13]&1)==0){r42=10}else{r42=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42,0);if((HEAP8[r13]&1)==0){r43=r24}else{r43=HEAP32[r25>>2]}HEAP32[r16]=r43+r41;r44=r43}else{r44=r10}r31=(r28+12|0)>>2;r32=HEAP32[r31];r39=r28+16|0;if((r32|0)==(HEAP32[r39>>2]|0)){r45=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)&255}else{r45=HEAP8[r32]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r45,r22,r44,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r35=r44;r36=r33,r37=r36>>2;r38=r34;break}r32=HEAP32[r31];if((r32|0)==(HEAP32[r39>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r44;r23=r28,r27=r23>>2;continue}else{HEAP32[r31]=r32+1;r10=r44;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r46=r23>>>1}else{r46=HEAP32[r11+4>>2]}do{if((r46|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__127__num_get_unsigned_integralIjEET_PKcS3_Rji(r35,HEAP32[r16],r6,r22);HEAP32[r7>>2]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r30){r47=0}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r47=r28;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){r47=r28;break}HEAP32[r14]=0;r47=0}}while(0);r14=(r47|0)==0;L2190:do{if(r38){r2=2013}else{do{if((HEAP32[r37+3]|0)==(HEAP32[r37+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r36)|0)!=-1){break}HEAP32[r3]=0;r2=2013;break L2190}}while(0);if(!(r14^(r36|0)==0)){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2013){if(r14){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralIjEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=___errno_location();r9=HEAP32[r8>>2];r8=___errno_location();HEAP32[r8>>2]=0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r8=_newlocale(1,2e3,0);HEAP32[3292]=r8}}while(0);r8=_strtoull(r1,r6,r4,HEAP32[3292]);r4=tempRet0;r1=___errno_location();r10=HEAP32[r1>>2];if((r10|0)==0){r1=___errno_location();HEAP32[r1>>2]=r9}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=0;if((r10|0)==34|(r4>>>0>r2>>>0|r4>>>0==r2>>>0&r8>>>0>-1>>>0)){HEAP32[r3>>2]=4;r7=-1;STACKTOP=r5;return r7}else{r7=r8;STACKTOP=r5;return r7}}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+72|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==64){r22=8}else if((r21|0)==0){r22=0}else if((r21|0)==8){r22=16}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP8[r10];r10=r23;r23=HEAP32[r14],r27=r23>>2;L2240:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){r28=r23,r29=r28>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r30=(r28|0)==0;r31=HEAP32[r3],r32=r31>>2;do{if((r31|0)==0){r2=2062}else{if((HEAP32[r32+3]|0)!=(HEAP32[r32+4]|0)){if(r30){r33=r31;r34=0;break}else{r35=r10;r36=r31,r37=r36>>2;r38=0;break L2240}}if((FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)|0)==-1){HEAP32[r3]=0;r2=2062;break}else{r39=(r31|0)==0;if(r30^r39){r33=r31;r34=r39;break}else{r35=r10;r36=r31,r37=r36>>2;r38=r39;break L2240}}}}while(0);if(r2==2062){r2=0;if(r30){r35=r10;r36=0,r37=r36>>2;r38=1;break}else{r33=0;r34=1}}r31=HEAPU8[r13];r32=(r31&1|0)==0;if((HEAP32[r16]-r10|0)==((r32?r31>>>1:HEAP32[r9>>2])|0)){if(r32){r40=r31>>>1;r41=r31>>>1}else{r31=HEAP32[r9>>2];r40=r31;r41=r31}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r40<<1,0);if((HEAP8[r13]&1)==0){r42=10}else{r42=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42,0);if((HEAP8[r13]&1)==0){r43=r24}else{r43=HEAP32[r25>>2]}HEAP32[r16]=r43+r41;r44=r43}else{r44=r10}r31=(r28+12|0)>>2;r32=HEAP32[r31];r39=r28+16|0;if((r32|0)==(HEAP32[r39>>2]|0)){r45=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)&255}else{r45=HEAP8[r32]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r45,r22,r44,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r35=r44;r36=r33,r37=r36>>2;r38=r34;break}r32=HEAP32[r31];if((r32|0)==(HEAP32[r39>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r44;r23=r28,r27=r23>>2;continue}else{HEAP32[r31]=r32+1;r10=r44;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r46=r23>>>1}else{r46=HEAP32[r11+4>>2]}do{if((r46|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__127__num_get_unsigned_integralImEET_PKcS3_Rji(r35,HEAP32[r16],r6,r22);HEAP32[r7>>2]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r30){r47=0}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r47=r28;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){r47=r28;break}HEAP32[r14]=0;r47=0}}while(0);r14=(r47|0)==0;L2300:do{if(r38){r2=2103}else{do{if((HEAP32[r37+3]|0)==(HEAP32[r37+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r36)|0)!=-1){break}HEAP32[r3]=0;r2=2103;break L2300}}while(0);if(!(r14^(r36|0)==0)){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2103){if(r14){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralImEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=___errno_location();r9=HEAP32[r8>>2];r8=___errno_location();HEAP32[r8>>2]=0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r8=_newlocale(1,2e3,0);HEAP32[3292]=r8}}while(0);r8=_strtoull(r1,r6,r4,HEAP32[3292]);r4=tempRet0;r1=___errno_location();r10=HEAP32[r1>>2];if((r10|0)==0){r1=___errno_location();HEAP32[r1>>2]=r9}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=0;if((r10|0)==34|(r4>>>0>r2>>>0|r4>>>0==r2>>>0&r8>>>0>-1>>>0)){HEAP32[r3>>2]=4;r7=-1;STACKTOP=r5;return r7}else{r7=r8;STACKTOP=r5;return r7}}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+72|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==64){r22=8}else if((r21|0)==0){r22=0}else if((r21|0)==8){r22=16}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP8[r10];r10=r23;r23=HEAP32[r14],r27=r23>>2;L2350:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){r28=r23,r29=r28>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r30=(r28|0)==0;r31=HEAP32[r3],r32=r31>>2;do{if((r31|0)==0){r2=2152}else{if((HEAP32[r32+3]|0)!=(HEAP32[r32+4]|0)){if(r30){r33=r31;r34=0;break}else{r35=r10;r36=r31,r37=r36>>2;r38=0;break L2350}}if((FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)|0)==-1){HEAP32[r3]=0;r2=2152;break}else{r39=(r31|0)==0;if(r30^r39){r33=r31;r34=r39;break}else{r35=r10;r36=r31,r37=r36>>2;r38=r39;break L2350}}}}while(0);if(r2==2152){r2=0;if(r30){r35=r10;r36=0,r37=r36>>2;r38=1;break}else{r33=0;r34=1}}r31=HEAPU8[r13];r32=(r31&1|0)==0;if((HEAP32[r16]-r10|0)==((r32?r31>>>1:HEAP32[r9>>2])|0)){if(r32){r40=r31>>>1;r41=r31>>>1}else{r31=HEAP32[r9>>2];r40=r31;r41=r31}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r40<<1,0);if((HEAP8[r13]&1)==0){r42=10}else{r42=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42,0);if((HEAP8[r13]&1)==0){r43=r24}else{r43=HEAP32[r25>>2]}HEAP32[r16]=r43+r41;r44=r43}else{r44=r10}r31=(r28+12|0)>>2;r32=HEAP32[r31];r39=r28+16|0;if((r32|0)==(HEAP32[r39>>2]|0)){r45=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)&255}else{r45=HEAP8[r32]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r45,r22,r44,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r35=r44;r36=r33,r37=r36>>2;r38=r34;break}r32=HEAP32[r31];if((r32|0)==(HEAP32[r39>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r44;r23=r28,r27=r23>>2;continue}else{HEAP32[r31]=r32+1;r10=r44;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r46=r23>>>1}else{r46=HEAP32[r11+4>>2]}do{if((r46|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__127__num_get_unsigned_integralIyEET_PKcS3_Rji(r35,HEAP32[r16],r6,r22);HEAP32[r7>>2]=r20;HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r30){r47=0}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r47=r28;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){r47=r28;break}HEAP32[r14]=0;r47=0}}while(0);r14=(r47|0)==0;L2410:do{if(r38){r2=2193}else{do{if((HEAP32[r37+3]|0)==(HEAP32[r37+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r36)|0)!=-1){break}HEAP32[r3]=0;r2=2193;break L2410}}while(0);if(!(r14^(r36|0)==0)){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2193){if(r14){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralIyEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;do{if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0}else{if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;r8=0;break}r9=___errno_location();r10=HEAP32[r9>>2];r9=___errno_location();HEAP32[r9>>2]=0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r9=_newlocale(1,2e3,0);HEAP32[3292]=r9}}while(0);r9=_strtoull(r1,r6,r4,HEAP32[3292]);r11=tempRet0;r12=___errno_location();r13=HEAP32[r12>>2];if((r13|0)==0){r12=___errno_location();HEAP32[r12>>2]=r10}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0;break}if((r13|0)!=34){r7=r11;r8=r9;break}HEAP32[r3>>2]=4;r7=-1;r8=-1}}while(0);STACKTOP=r5;return tempRet0=r7,r8}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRf(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+80|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8+32;r10=r8+40;r11=r8+48;r12=r8+64;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r22=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r23=r8|0;__ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r11,r5,r23,r9,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r24=r5;r25=r5;r26=r12+8|0}else{r5=r12+8|0;r24=HEAP32[r5>>2];r25=r14+1|0;r26=r5}HEAP32[r16]=r24;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;HEAP8[r21]=1;HEAP8[r22]=69;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r27=r12+4|0;r28=HEAP8[r9];r9=HEAP8[r10];r10=r24;r24=HEAP32[r14],r29=r24>>2;L2449:while(1){do{if((r24|0)==0){r30=0,r31=r30>>2}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r30=r24,r31=r30>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r24)|0)!=-1){r30=r24,r31=r30>>2;break}HEAP32[r14]=0;r30=0,r31=r30>>2}}while(0);r32=(r30|0)==0;r33=HEAP32[r3],r34=r33>>2;do{if((r33|0)==0){r2=2232}else{if((HEAP32[r34+3]|0)!=(HEAP32[r34+4]|0)){if(r32){r35=r33;r36=0;break}else{r37=r10;r38=r33,r39=r38>>2;r40=0;break L2449}}if((FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r33)|0)==-1){HEAP32[r3]=0;r2=2232;break}else{r41=(r33|0)==0;if(r32^r41){r35=r33;r36=r41;break}else{r37=r10;r38=r33,r39=r38>>2;r40=r41;break L2449}}}}while(0);if(r2==2232){r2=0;if(r32){r37=r10;r38=0,r39=r38>>2;r40=1;break}else{r35=0;r36=1}}r33=HEAPU8[r13];r34=(r33&1|0)==0;if((HEAP32[r16]-r10|0)==((r34?r33>>>1:HEAP32[r27>>2])|0)){if(r34){r42=r33>>>1;r43=r33>>>1}else{r33=HEAP32[r27>>2];r42=r33;r43=r33}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42<<1,0);if((HEAP8[r13]&1)==0){r44=10}else{r44=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44,0);if((HEAP8[r13]&1)==0){r45=r25}else{r45=HEAP32[r26>>2]}HEAP32[r16]=r45+r43;r46=r45}else{r46=r10}r33=(r30+12|0)>>2;r34=HEAP32[r33];r41=r30+16|0;if((r34|0)==(HEAP32[r41>>2]|0)){r47=FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)&255}else{r47=HEAP8[r34]}if((__ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r47,r21,r22,r46,r15,r28,r9,r11,r5,r18,r20,r23)|0)!=0){r37=r46;r38=r35,r39=r38>>2;r40=r36;break}r34=HEAP32[r33];if((r34|0)==(HEAP32[r41>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r31]+40>>2]](r30);r10=r46;r24=r30,r29=r24>>2;continue}else{HEAP32[r33]=r34+1;r10=r46;r24=r30,r29=r24>>2;continue}}r24=HEAPU8[r11];if((r24&1|0)==0){r48=r24>>>1}else{r48=HEAP32[r11+4>>2]}do{if((r48|0)!=0){if((HEAP8[r21]&1)==0){break}r24=HEAP32[r19];if((r24-r17|0)>=160){break}r29=HEAP32[r20>>2];HEAP32[r19]=r24+4;HEAP32[r24>>2]=r29}}while(0);r20=__ZNSt3__115__num_get_floatIfEET_PKcS3_Rj(r37,HEAP32[r16],r6);HEAPF32[r7>>2]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r32){r49=0}else{if((HEAP32[r31+3]|0)!=(HEAP32[r31+4]|0)){r49=r30;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)|0)!=-1){r49=r30;break}HEAP32[r14]=0;r49=0}}while(0);r14=(r49|0)==0;L2510:do{if(r40){r2=2274}else{do{if((HEAP32[r39+3]|0)==(HEAP32[r39+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r39]+36>>2]](r38)|0)!=-1){break}HEAP32[r3]=0;r2=2274;break L2510}}while(0);if(!(r14^(r38|0)==0)){break}r50=r1|0,r51=r50>>2;HEAP32[r51]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2274){if(r14){break}r50=r1|0,r51=r50>>2;HEAP32[r51]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r50=r1|0,r51=r50>>2;HEAP32[r51]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12){var r13,r14,r15,r16,r17,r18;r13=r11>>2;r11=r10>>2;r10=r5>>2;if(r1<<24>>24==r6<<24>>24){if((HEAP8[r2]&1)==0){r14=-1;return r14}HEAP8[r2]=0;r6=HEAP32[r10];HEAP32[r10]=r6+1;HEAP8[r6]=46;r6=HEAPU8[r8];if((r6&1|0)==0){r15=r6>>>1}else{r15=HEAP32[r8+4>>2]}if((r15|0)==0){r14=0;return r14}r15=HEAP32[r11];if((r15-r9|0)>=160){r14=0;return r14}r6=HEAP32[r13];HEAP32[r11]=r15+4;HEAP32[r15>>2]=r6;r14=0;return r14}do{if(r1<<24>>24==r7<<24>>24){r6=HEAPU8[r8];if((r6&1|0)==0){r16=r6>>>1}else{r16=HEAP32[r8+4>>2]}if((r16|0)==0){break}if((HEAP8[r2]&1)==0){r14=-1;return r14}r6=HEAP32[r11];if((r6-r9|0)>=160){r14=0;return r14}r15=HEAP32[r13];HEAP32[r11]=r6+4;HEAP32[r6>>2]=r15;HEAP32[r13]=0;r14=0;return r14}}while(0);r16=r12+32|0;r7=r12;while(1){if((r7|0)==(r16|0)){r17=r16;break}if((HEAP8[r7]|0)==r1<<24>>24){r17=r7;break}else{r7=r7+1|0}}r7=r17-r12|0;if((r7|0)>31){r14=-1;return r14}r12=HEAP8[r7+10936|0];if((r7|0)==22|(r7|0)==23){HEAP8[r3]=80;r17=HEAP32[r10];HEAP32[r10]=r17+1;HEAP8[r17]=r12;r14=0;return r14}else if((r7|0)==25|(r7|0)==24){r17=HEAP32[r10];do{if((r17|0)!=(r4|0)){if((HEAP8[r17-1|0]&95|0)==(HEAP8[r3]&127|0)){break}else{r14=-1}return r14}}while(0);HEAP32[r10]=r17+1;HEAP8[r17]=r12;r14=0;return r14}else{r17=HEAP8[r3];do{if((r12&95|0)==(r17<<24>>24|0)){HEAP8[r3]=r17|-128;if((HEAP8[r2]&1)==0){break}HEAP8[r2]=0;r4=HEAPU8[r8];if((r4&1|0)==0){r18=r4>>>1}else{r18=HEAP32[r8+4>>2]}if((r18|0)==0){break}r4=HEAP32[r11];if((r4-r9|0)>=160){break}r1=HEAP32[r13];HEAP32[r11]=r4+4;HEAP32[r4>>2]=r1}}while(0);r11=HEAP32[r10];HEAP32[r10]=r11+1;HEAP8[r11]=r12;if((r7|0)>21){r14=0;return r14}HEAP32[r13]=HEAP32[r13]+1;r14=0;return r14}}function __ZNSt3__115__num_get_floatIfEET_PKcS3_Rj(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r6=0;STACKTOP=r4;return r6}r7=___errno_location();r8=HEAP32[r7>>2];r7=___errno_location();HEAP32[r7>>2]=0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r7=_newlocale(1,2e3,0);HEAP32[3292]=r7}}while(0);r7=_strtold_l(r1,r5,HEAP32[3292]);r1=___errno_location();r9=HEAP32[r1>>2];if((r9|0)==0){r1=___errno_location();HEAP32[r1>>2]=r8}if((HEAP32[r5>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r6=0;STACKTOP=r4;return r6}if((r9|0)==34){HEAP32[r3>>2]=4}r6=r7;STACKTOP=r4;return r6}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRd(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+80|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8+32;r10=r8+40;r11=r8+48;r12=r8+64;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r22=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r23=r8|0;__ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r11,r5,r23,r9,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r24=r5;r25=r5;r26=r12+8|0}else{r5=r12+8|0;r24=HEAP32[r5>>2];r25=r14+1|0;r26=r5}HEAP32[r16]=r24;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;HEAP8[r21]=1;HEAP8[r22]=69;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r27=r12+4|0;r28=HEAP8[r9];r9=HEAP8[r10];r10=r24;r24=HEAP32[r14],r29=r24>>2;L2614:while(1){do{if((r24|0)==0){r30=0,r31=r30>>2}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r30=r24,r31=r30>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r24)|0)!=-1){r30=r24,r31=r30>>2;break}HEAP32[r14]=0;r30=0,r31=r30>>2}}while(0);r32=(r30|0)==0;r33=HEAP32[r3],r34=r33>>2;do{if((r33|0)==0){r2=2364}else{if((HEAP32[r34+3]|0)!=(HEAP32[r34+4]|0)){if(r32){r35=r33;r36=0;break}else{r37=r10;r38=r33,r39=r38>>2;r40=0;break L2614}}if((FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r33)|0)==-1){HEAP32[r3]=0;r2=2364;break}else{r41=(r33|0)==0;if(r32^r41){r35=r33;r36=r41;break}else{r37=r10;r38=r33,r39=r38>>2;r40=r41;break L2614}}}}while(0);if(r2==2364){r2=0;if(r32){r37=r10;r38=0,r39=r38>>2;r40=1;break}else{r35=0;r36=1}}r33=HEAPU8[r13];r34=(r33&1|0)==0;if((HEAP32[r16]-r10|0)==((r34?r33>>>1:HEAP32[r27>>2])|0)){if(r34){r42=r33>>>1;r43=r33>>>1}else{r33=HEAP32[r27>>2];r42=r33;r43=r33}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42<<1,0);if((HEAP8[r13]&1)==0){r44=10}else{r44=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44,0);if((HEAP8[r13]&1)==0){r45=r25}else{r45=HEAP32[r26>>2]}HEAP32[r16]=r45+r43;r46=r45}else{r46=r10}r33=(r30+12|0)>>2;r34=HEAP32[r33];r41=r30+16|0;if((r34|0)==(HEAP32[r41>>2]|0)){r47=FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)&255}else{r47=HEAP8[r34]}if((__ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r47,r21,r22,r46,r15,r28,r9,r11,r5,r18,r20,r23)|0)!=0){r37=r46;r38=r35,r39=r38>>2;r40=r36;break}r34=HEAP32[r33];if((r34|0)==(HEAP32[r41>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r31]+40>>2]](r30);r10=r46;r24=r30,r29=r24>>2;continue}else{HEAP32[r33]=r34+1;r10=r46;r24=r30,r29=r24>>2;continue}}r24=HEAPU8[r11];if((r24&1|0)==0){r48=r24>>>1}else{r48=HEAP32[r11+4>>2]}do{if((r48|0)!=0){if((HEAP8[r21]&1)==0){break}r24=HEAP32[r19];if((r24-r17|0)>=160){break}r29=HEAP32[r20>>2];HEAP32[r19]=r24+4;HEAP32[r24>>2]=r29}}while(0);r20=__ZNSt3__115__num_get_floatIdEET_PKcS3_Rj(r37,HEAP32[r16],r6);HEAPF64[r7>>3]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r32){r49=0}else{if((HEAP32[r31+3]|0)!=(HEAP32[r31+4]|0)){r49=r30;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)|0)!=-1){r49=r30;break}HEAP32[r14]=0;r49=0}}while(0);r14=(r49|0)==0;L2675:do{if(r40){r2=2406}else{do{if((HEAP32[r39+3]|0)==(HEAP32[r39+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r39]+36>>2]](r38)|0)!=-1){break}HEAP32[r3]=0;r2=2406;break L2675}}while(0);if(!(r14^(r38|0)==0)){break}r50=r1|0,r51=r50>>2;HEAP32[r51]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2406){if(r14){break}r50=r1|0,r51=r50>>2;HEAP32[r51]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r50=r1|0,r51=r50>>2;HEAP32[r51]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__115__num_get_floatIdEET_PKcS3_Rj(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r6=0;STACKTOP=r4;return r6}r7=___errno_location();r8=HEAP32[r7>>2];r7=___errno_location();HEAP32[r7>>2]=0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r7=_newlocale(1,2e3,0);HEAP32[3292]=r7}}while(0);r7=_strtold_l(r1,r5,HEAP32[3292]);r1=___errno_location();r9=HEAP32[r1>>2];if((r9|0)==0){r1=___errno_location();HEAP32[r1>>2]=r8}if((HEAP32[r5>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r6=0;STACKTOP=r4;return r6}if((r9|0)!=34){r6=r7;STACKTOP=r4;return r6}HEAP32[r3>>2]=4;r6=r7;STACKTOP=r4;return r6}function __ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r6=STACKTOP;STACKTOP=STACKTOP+40|0;r7=r6,r8=r7>>2;r9=r6+16,r10=r9>>2;r11=r6+32;__ZNKSt3__18ios_base6getlocEv(r11,r2);r2=(r11|0)>>2;r11=HEAP32[r2];if((HEAP32[3632]|0)!=-1){HEAP32[r10]=14528;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r9,260)}r9=HEAP32[3633]-1|0;r10=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r10>>2>>>0>r9>>>0){r12=HEAP32[r10+(r9<<2)>>2];if((r12|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+32>>2]](r12,10936,10968,r3);r12=HEAP32[r2];if((HEAP32[3536]|0)!=-1){HEAP32[r8]=14144;HEAP32[r8+1]=26;HEAP32[r8+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14144,r7,260)}r13=HEAP32[3537]-1|0;r14=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r14>>2>>>0>r13>>>0){r15=HEAP32[r14+(r13<<2)>>2];if((r15|0)==0){break}r16=r15;r17=r15;r18=FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+12>>2]](r16);HEAP8[r4]=r18;r18=FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+16>>2]](r16);HEAP8[r5]=r18;FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+20>>2]](r1,r16);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2]|0);STACKTOP=r6;return}}while(0);r13=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r13);___cxa_throw(r13,9304,382)}}while(0);r6=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r6);___cxa_throw(r6,9304,382)}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+80|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8+32;r10=r8+40;r11=r8+48;r12=r8+64;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r22=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r23=r8|0;__ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r11,r5,r23,r9,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r24=r5;r25=r5;r26=r12+8|0}else{r5=r12+8|0;r24=HEAP32[r5>>2];r25=r14+1|0;r26=r5}HEAP32[r16]=r24;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;HEAP8[r21]=1;HEAP8[r22]=69;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r27=r12+4|0;r28=HEAP8[r9];r9=HEAP8[r10];r10=r24;r24=HEAP32[r14],r29=r24>>2;L2736:while(1){do{if((r24|0)==0){r30=0,r31=r30>>2}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r30=r24,r31=r30>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r24)|0)!=-1){r30=r24,r31=r30>>2;break}HEAP32[r14]=0;r30=0,r31=r30>>2}}while(0);r32=(r30|0)==0;r33=HEAP32[r3],r34=r33>>2;do{if((r33|0)==0){r2=2465}else{if((HEAP32[r34+3]|0)!=(HEAP32[r34+4]|0)){if(r32){r35=r33;r36=0;break}else{r37=r10;r38=r33,r39=r38>>2;r40=0;break L2736}}if((FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r33)|0)==-1){HEAP32[r3]=0;r2=2465;break}else{r41=(r33|0)==0;if(r32^r41){r35=r33;r36=r41;break}else{r37=r10;r38=r33,r39=r38>>2;r40=r41;break L2736}}}}while(0);if(r2==2465){r2=0;if(r32){r37=r10;r38=0,r39=r38>>2;r40=1;break}else{r35=0;r36=1}}r33=HEAPU8[r13];r34=(r33&1|0)==0;if((HEAP32[r16]-r10|0)==((r34?r33>>>1:HEAP32[r27>>2])|0)){if(r34){r42=r33>>>1;r43=r33>>>1}else{r33=HEAP32[r27>>2];r42=r33;r43=r33}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42<<1,0);if((HEAP8[r13]&1)==0){r44=10}else{r44=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44,0);if((HEAP8[r13]&1)==0){r45=r25}else{r45=HEAP32[r26>>2]}HEAP32[r16]=r45+r43;r46=r45}else{r46=r10}r33=(r30+12|0)>>2;r34=HEAP32[r33];r41=r30+16|0;if((r34|0)==(HEAP32[r41>>2]|0)){r47=FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)&255}else{r47=HEAP8[r34]}if((__ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r47,r21,r22,r46,r15,r28,r9,r11,r5,r18,r20,r23)|0)!=0){r37=r46;r38=r35,r39=r38>>2;r40=r36;break}r34=HEAP32[r33];if((r34|0)==(HEAP32[r41>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r31]+40>>2]](r30);r10=r46;r24=r30,r29=r24>>2;continue}else{HEAP32[r33]=r34+1;r10=r46;r24=r30,r29=r24>>2;continue}}r24=HEAPU8[r11];if((r24&1|0)==0){r48=r24>>>1}else{r48=HEAP32[r11+4>>2]}do{if((r48|0)!=0){if((HEAP8[r21]&1)==0){break}r24=HEAP32[r19];if((r24-r17|0)>=160){break}r29=HEAP32[r20>>2];HEAP32[r19]=r24+4;HEAP32[r24>>2]=r29}}while(0);r20=__ZNSt3__115__num_get_floatIeEET_PKcS3_Rj(r37,HEAP32[r16],r6);HEAPF64[r7>>3]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r32){r49=0}else{if((HEAP32[r31+3]|0)!=(HEAP32[r31+4]|0)){r49=r30;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)|0)!=-1){r49=r30;break}HEAP32[r14]=0;r49=0}}while(0);r14=(r49|0)==0;L2797:do{if(r40){r2=2507}else{do{if((HEAP32[r39+3]|0)==(HEAP32[r39+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r39]+36>>2]](r38)|0)!=-1){break}HEAP32[r3]=0;r2=2507;break L2797}}while(0);if(!(r14^(r38|0)==0)){break}r50=r1|0,r51=r50>>2;HEAP32[r51]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2507){if(r14){break}r50=r1|0,r51=r50>>2;HEAP32[r51]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r50=r1|0,r51=r50>>2;HEAP32[r51]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__115__num_get_floatIeEET_PKcS3_Rj(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r6=0;STACKTOP=r4;return r6}r7=___errno_location();r8=HEAP32[r7>>2];r7=___errno_location();HEAP32[r7>>2]=0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r7=_newlocale(1,2e3,0);HEAP32[3292]=r7}}while(0);r7=_strtold_l(r1,r5,HEAP32[3292]);r1=___errno_location();r9=HEAP32[r1>>2];if((r9|0)==0){r1=___errno_location();HEAP32[r1>>2]=r8}if((HEAP32[r5>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r6=0;STACKTOP=r4;return r6}if((r9|0)!=34){r6=r7;STACKTOP=r4;return r6}HEAP32[r3>>2]=4;r6=r7;STACKTOP=r4;return r6}function __ZNSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49;r2=0;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+64|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r10>>2];r10=r9,r11=r10>>2;r12=r9+16;r13=r9+48;r14=r13>>2;r15=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r16=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP,r18=r17>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r19=STACKTOP;STACKTOP=STACKTOP+160|0;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r16,r22=r14>>2;__ZNKSt3__18ios_base6getlocEv(r15,r5);r5=r15|0;r15=HEAP32[r5>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r11]=14528;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r10,260)}r10=HEAP32[3633]-1|0;r11=HEAP32[r15+8>>2];do{if(HEAP32[r15+12>>2]-r11>>2>>>0>r10>>>0){r23=HEAP32[r11+(r10<<2)>>2];if((r23|0)==0){break}r24=r12|0;FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+32>>2]](r23,10936,10962,r24);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;r23=r16;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r16,10,0);if((HEAP8[r14]&1)==0){r25=r23+1|0;r26=r25;r27=r25;r28=r16+8|0}else{r25=r16+8|0;r26=HEAP32[r25>>2];r27=r23+1|0;r28=r25}HEAP32[r18]=r26;r25=r19|0;HEAP32[r20>>2]=r25;HEAP32[r21>>2]=0;r23=(r3|0)>>2;r29=(r4|0)>>2;r30=r16|0;r31=r16+4|0;r32=r26;r33=HEAP32[r23],r34=r33>>2;L2847:while(1){do{if((r33|0)==0){r35=0}else{if((HEAP32[r34+3]|0)!=(HEAP32[r34+4]|0)){r35=r33;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r33)|0)!=-1){r35=r33;break}HEAP32[r23]=0;r35=0}}while(0);r36=(r35|0)==0;r37=HEAP32[r29],r38=r37>>2;do{if((r37|0)==0){r2=2558}else{if((HEAP32[r38+3]|0)!=(HEAP32[r38+4]|0)){if(r36){break}else{r39=r32;break L2847}}if((FUNCTION_TABLE[HEAP32[HEAP32[r38]+36>>2]](r37)|0)==-1){HEAP32[r29]=0;r2=2558;break}else{if(r36^(r37|0)==0){break}else{r39=r32;break L2847}}}}while(0);if(r2==2558){r2=0;if(r36){r39=r32;break}}r37=HEAPU8[r14];r38=(r37&1|0)==0;if((HEAP32[r18]-r32|0)==((r38?r37>>>1:HEAP32[r31>>2])|0)){if(r38){r40=r37>>>1;r41=r37>>>1}else{r37=HEAP32[r31>>2];r40=r37;r41=r37}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r16,r40<<1,0);if((HEAP8[r14]&1)==0){r42=10}else{r42=(HEAP32[r30>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r16,r42,0);if((HEAP8[r14]&1)==0){r43=r27}else{r43=HEAP32[r28>>2]}HEAP32[r18]=r43+r41;r44=r43}else{r44=r32}r37=(r35+12|0)>>2;r38=HEAP32[r37];r45=r35+16|0;if((r38|0)==(HEAP32[r45>>2]|0)){r46=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+36>>2]](r35)&255}else{r46=HEAP8[r38]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r46,16,r44,r17,r21,0,r13,r25,r20,r24)|0)!=0){r39=r44;break}r38=HEAP32[r37];if((r38|0)==(HEAP32[r45>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+40>>2]](r35);r32=r44;r33=r35,r34=r33>>2;continue}else{HEAP32[r37]=r38+1;r32=r44;r33=r35,r34=r33>>2;continue}}HEAP8[r39+3|0]=0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r33=_newlocale(1,2e3,0);HEAP32[3292]=r33}}while(0);r33=__ZNSt3__110__sscanf_lEPKcPvS1_z(r39,HEAP32[3292],1880,(r8=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r8>>2]=r7,r8));STACKTOP=r8;if((r33|0)!=1){HEAP32[r6>>2]=4}r33=HEAP32[r23],r34=r33>>2;do{if((r33|0)==0){r47=0}else{if((HEAP32[r34+3]|0)!=(HEAP32[r34+4]|0)){r47=r33;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r33)|0)!=-1){r47=r33;break}HEAP32[r23]=0;r47=0}}while(0);r23=(r47|0)==0;r33=HEAP32[r29],r34=r33>>2;do{if((r33|0)==0){r2=2603}else{if((HEAP32[r34+3]|0)!=(HEAP32[r34+4]|0)){if(!r23){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r16);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r9;return}if((FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r33)|0)==-1){HEAP32[r29]=0;r2=2603;break}if(!(r23^(r33|0)==0)){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r16);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r9;return}}while(0);do{if(r2==2603){if(r23){break}r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r16);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r9;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r48=r1|0,r49=r48>>2;HEAP32[r49]=r47;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r16);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r9;return}}while(0);r9=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r9);___cxa_throw(r9,9304,382)}function __ZNSt3__110__sscanf_lEPKcPvS1_z(r1,r2,r3,r4){var r5,r6,r7;r5=STACKTOP;STACKTOP=STACKTOP+16|0;r6=r5;r7=r6;HEAP32[r7>>2]=r4;HEAP32[r7+4>>2]=0;r7=_uselocale(r2);r2=_vsscanf(r1,r3,r6|0);if((r7|0)==0){STACKTOP=r5;return r2}_uselocale(r7);STACKTOP=r5;return r2}function __ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+104|0;r10=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r10>>2];r10=(r4-r3|0)/12&-1;r11=r9|0;do{if(r10>>>0>100){r12=_malloc(r10);if((r12|0)!=0){r13=r12;r14=r12;break}__ZSt17__throw_bad_allocv();r13=0;r14=0}else{r13=r11;r14=0}}while(0);r11=(r3|0)==(r4|0);if(r11){r15=r10;r16=0}else{r12=r10;r10=0;r17=r13;r18=r3;while(1){r19=HEAPU8[r18];if((r19&1|0)==0){r20=r19>>>1}else{r20=HEAP32[r18+4>>2]}if((r20|0)==0){HEAP8[r17]=2;r21=r10+1|0;r22=r12-1|0}else{HEAP8[r17]=1;r21=r10;r22=r12}r19=r18+12|0;if((r19|0)==(r4|0)){r15=r22;r16=r21;break}else{r12=r22;r10=r21;r17=r17+1|0;r18=r19}}}r18=(r1|0)>>2;r1=(r2|0)>>2;r2=r5;r17=0;r21=r16;r16=r15;while(1){r15=HEAP32[r18],r10=r15>>2;do{if((r15|0)==0){r23=0}else{r22=HEAP32[r10+3];if((r22|0)==(HEAP32[r10+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r15)}else{r24=HEAP32[r22>>2]}if((r24|0)==-1){HEAP32[r18]=0;r23=0;break}else{r23=HEAP32[r18];break}}}while(0);r15=(r23|0)==0;r10=HEAP32[r1],r22=r10>>2;if((r10|0)==0){r25=r23,r26=r25>>2;r27=0,r28=r27>>2}else{r12=HEAP32[r22+3];if((r12|0)==(HEAP32[r22+4]|0)){r29=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r10)}else{r29=HEAP32[r12>>2]}if((r29|0)==-1){HEAP32[r1]=0;r30=0}else{r30=r10}r25=HEAP32[r18],r26=r25>>2;r27=r30,r28=r27>>2}r31=(r27|0)==0;if(!((r15^r31)&(r16|0)!=0)){break}r15=HEAP32[r26+3];if((r15|0)==(HEAP32[r26+4]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)}else{r32=HEAP32[r15>>2]}if(r7){r33=r32}else{r33=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+28>>2]](r5,r32)}do{if(r11){r34=r21;r35=r16}else{r15=r17+1|0;L2979:do{if(r7){r10=r16;r12=r21;r22=r13;r20=0;r19=r3;while(1){do{if((HEAP8[r22]|0)==1){r36=r19;if((HEAP8[r36]&1)==0){r37=r19+4|0}else{r37=HEAP32[r19+8>>2]}if((r33|0)!=(HEAP32[r37+(r17<<2)>>2]|0)){HEAP8[r22]=0;r38=r20;r39=r12;r40=r10-1|0;break}r41=HEAPU8[r36];if((r41&1|0)==0){r42=r41>>>1}else{r42=HEAP32[r19+4>>2]}if((r42|0)!=(r15|0)){r38=1;r39=r12;r40=r10;break}HEAP8[r22]=2;r38=1;r39=r12+1|0;r40=r10-1|0}else{r38=r20;r39=r12;r40=r10}}while(0);r41=r19+12|0;if((r41|0)==(r4|0)){r43=r40;r44=r39;r45=r38;break L2979}r10=r40;r12=r39;r22=r22+1|0;r20=r38;r19=r41}}else{r19=r16;r20=r21;r22=r13;r12=0;r10=r3;while(1){do{if((HEAP8[r22]|0)==1){r41=r10;if((HEAP8[r41]&1)==0){r46=r10+4|0}else{r46=HEAP32[r10+8>>2]}if((r33|0)!=(FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+28>>2]](r5,HEAP32[r46+(r17<<2)>>2])|0)){HEAP8[r22]=0;r47=r12;r48=r20;r49=r19-1|0;break}r36=HEAPU8[r41];if((r36&1|0)==0){r50=r36>>>1}else{r50=HEAP32[r10+4>>2]}if((r50|0)!=(r15|0)){r47=1;r48=r20;r49=r19;break}HEAP8[r22]=2;r47=1;r48=r20+1|0;r49=r19-1|0}else{r47=r12;r48=r20;r49=r19}}while(0);r36=r10+12|0;if((r36|0)==(r4|0)){r43=r49;r44=r48;r45=r47;break L2979}r19=r49;r20=r48;r22=r22+1|0;r12=r47;r10=r36}}}while(0);if(!r45){r34=r44;r35=r43;break}r15=HEAP32[r18];r10=r15+12|0;r12=HEAP32[r10>>2];if((r12|0)==(HEAP32[r15+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+40>>2]](r15)}else{HEAP32[r10>>2]=r12+4}if((r44+r43|0)>>>0<2|r11){r34=r44;r35=r43;break}r12=r17+1|0;r10=r44;r15=r13;r22=r3;while(1){do{if((HEAP8[r15]|0)==2){r20=HEAPU8[r22];if((r20&1|0)==0){r51=r20>>>1}else{r51=HEAP32[r22+4>>2]}if((r51|0)==(r12|0)){r52=r10;break}HEAP8[r15]=0;r52=r10-1|0}else{r52=r10}}while(0);r20=r22+12|0;if((r20|0)==(r4|0)){r34=r52;r35=r43;break}else{r10=r52;r15=r15+1|0;r22=r20}}}}while(0);r17=r17+1|0;r21=r34;r16=r35}do{if((r25|0)==0){r53=1}else{r35=HEAP32[r26+3];if((r35|0)==(HEAP32[r26+4]|0)){r54=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)}else{r54=HEAP32[r35>>2]}if((r54|0)==-1){HEAP32[r18]=0;r53=1;break}else{r53=(HEAP32[r18]|0)==0;break}}}while(0);do{if(r31){r8=2712}else{r18=HEAP32[r28+3];if((r18|0)==(HEAP32[r28+4]|0)){r55=FUNCTION_TABLE[HEAP32[HEAP32[r28]+36>>2]](r27)}else{r55=HEAP32[r18>>2]}if((r55|0)==-1){HEAP32[r1]=0;r8=2712;break}else{if(r53^(r27|0)==0){break}else{r8=2714;break}}}}while(0);if(r8==2712){if(r53){r8=2714}}if(r8==2714){HEAP32[r6>>2]=HEAP32[r6>>2]|2}L3060:do{if(r11){r8=2719}else{r53=r3;r27=r13;while(1){if((HEAP8[r27]|0)==2){r56=r53;break L3060}r1=r53+12|0;if((r1|0)==(r4|0)){r8=2719;break L3060}r53=r1;r27=r27+1|0}}}while(0);if(r8==2719){HEAP32[r6>>2]=HEAP32[r6>>2]|4;r56=r4}if((r14|0)==0){STACKTOP=r9;return r56}_free(r14);STACKTOP=r9;return r56}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r8=STACKTOP;STACKTOP=STACKTOP+112|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16,r12=r11>>2;r13=r8+32;r14=r8+40;r15=r8+48;r16=r8+56;r17=r8+64;r18=r8+72;r19=r8+80;r20=r8+104;if((HEAP32[r5+4>>2]&1|0)==0){HEAP32[r13>>2]=-1;r21=HEAP32[HEAP32[r2>>2]+16>>2];r22=r3|0;HEAP32[r15>>2]=HEAP32[r22>>2];HEAP32[r16>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r21](r14,r2,r15,r16,r5,r6,r13);r16=HEAP32[r14>>2];HEAP32[r22>>2]=r16;r22=HEAP32[r13>>2];if((r22|0)==1){HEAP8[r7]=1}else if((r22|0)==0){HEAP8[r7]=0}else{HEAP8[r7]=1;HEAP32[r6>>2]=4}HEAP32[r1>>2]=r16;STACKTOP=r8;return}__ZNKSt3__18ios_base6getlocEv(r17,r5);r16=r17|0;r17=HEAP32[r16>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r12]=14520;HEAP32[r12+1]=26;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r11,260)}r11=HEAP32[3631]-1|0;r12=HEAP32[r17+8>>2];do{if(HEAP32[r17+12>>2]-r12>>2>>>0>r11>>>0){r22=HEAP32[r12+(r11<<2)>>2];if((r22|0)==0){break}r13=r22;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r16>>2]|0);__ZNKSt3__18ios_base6getlocEv(r18,r5);r22=r18|0;r14=HEAP32[r22>>2];if((HEAP32[3534]|0)!=-1){HEAP32[r10]=14136;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14136,r9,260)}r15=HEAP32[3535]-1|0;r2=HEAP32[r14+8>>2];do{if(HEAP32[r14+12>>2]-r2>>2>>>0>r15>>>0){r21=HEAP32[r2+(r15<<2)>>2];if((r21|0)==0){break}r23=r21;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r22>>2]|0);r24=r19|0;r25=r21;FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+24>>2]](r24,r23);FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+28>>2]](r19+12|0,r23);HEAP32[r20>>2]=HEAP32[r4>>2];r23=(__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r20,r24,r19+24|0,r13,r6,1)|0)==(r24|0)|0;HEAP8[r7]=r23;HEAP32[r1>>2]=HEAP32[r3>>2];__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r19+12|0);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r19|0);STACKTOP=r8;return}}while(0);r13=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r13);___cxa_throw(r13,9304,382)}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16;r11=r5>>2;r5=r4>>2;r4=HEAP32[r5];r12=(r4|0)==(r3|0);do{if(r12){r13=(HEAP32[r10+96>>2]|0)==(r1|0);if(!r13){if((HEAP32[r10+100>>2]|0)!=(r1|0)){break}}HEAP32[r5]=r3+1;HEAP8[r3]=r13?43:45;HEAP32[r11]=0;r14=0;return r14}}while(0);r13=HEAPU8[r7];if((r13&1|0)==0){r15=r13>>>1}else{r15=HEAP32[r7+4>>2]}if((r15|0)!=0&(r1|0)==(r6|0)){r6=HEAP32[r9>>2];if((r6-r8|0)>=160){r14=0;return r14}r8=HEAP32[r11];HEAP32[r9>>2]=r6+4;HEAP32[r6>>2]=r8;HEAP32[r11]=0;r14=0;return r14}r8=r10+104|0;r6=r10;while(1){if((r6|0)==(r8|0)){r16=r8;break}if((HEAP32[r6>>2]|0)==(r1|0)){r16=r6;break}else{r6=r6+4|0}}r6=r16-r10|0;r10=r6>>2;if((r6|0)>92){r14=-1;return r14}do{if((r2|0)==8|(r2|0)==10){if((r10|0)<(r2|0)){break}else{r14=-1}return r14}else if((r2|0)==16){if((r6|0)<88){break}if(r12){r14=-1;return r14}if((r4-r3|0)>=3){r14=-1;return r14}if((HEAP8[r4-1|0]|0)!=48){r14=-1;return r14}HEAP32[r11]=0;r16=HEAP8[r10+10936|0];r1=HEAP32[r5];HEAP32[r5]=r1+1;HEAP8[r1]=r16;r14=0;return r14}}while(0);r3=HEAP8[r10+10936|0];HEAP32[r5]=r4+1;HEAP8[r4]=r3;HEAP32[r11]=HEAP32[r11]+1;r14=0;return r14}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRl(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+144|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==8){r22=16}else if((r21|0)==64){r22=8}else if((r21|0)==0){r22=0}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP32[r10>>2];r10=r23;r23=HEAP32[r14],r27=r23>>2;L3156:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{r30=HEAP32[r27+3];if((r30|0)==(HEAP32[r27+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)}else{r31=HEAP32[r30>>2]}if((r31|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r32=(r28|0)==0;r30=HEAP32[r3],r33=r30>>2;do{if((r30|0)==0){r2=2811}else{r34=HEAP32[r33+3];if((r34|0)==(HEAP32[r33+4]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r33]+36>>2]](r30)}else{r35=HEAP32[r34>>2]}if((r35|0)==-1){HEAP32[r3]=0;r2=2811;break}else{r34=(r30|0)==0;if(r32^r34){r36=r30;r37=r34;break}else{r38=r10;r39=r30,r40=r39>>2;r41=r34;break L3156}}}}while(0);if(r2==2811){r2=0;if(r32){r38=r10;r39=0,r40=r39>>2;r41=1;break}else{r36=0;r37=1}}r30=HEAPU8[r13];r33=(r30&1|0)==0;if((HEAP32[r16]-r10|0)==((r33?r30>>>1:HEAP32[r9>>2])|0)){if(r33){r42=r30>>>1;r43=r30>>>1}else{r30=HEAP32[r9>>2];r42=r30;r43=r30}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42<<1,0);if((HEAP8[r13]&1)==0){r44=10}else{r44=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44,0);if((HEAP8[r13]&1)==0){r45=r24}else{r45=HEAP32[r25>>2]}HEAP32[r16]=r45+r43;r46=r45}else{r46=r10}r30=(r28+12|0)>>2;r33=HEAP32[r30];r34=r28+16|0;if((r33|0)==(HEAP32[r34>>2]|0)){r47=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r47=HEAP32[r33>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r47,r22,r46,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r38=r46;r39=r36,r40=r39>>2;r41=r37;break}r33=HEAP32[r30];if((r33|0)==(HEAP32[r34>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r46;r23=r28,r27=r23>>2;continue}else{HEAP32[r30]=r33+4;r10=r46;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r48=r23>>>1}else{r48=HEAP32[r11+4>>2]}do{if((r48|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__125__num_get_signed_integralIlEET_PKcS3_Rji(r38,HEAP32[r16],r6,r22);HEAP32[r7>>2]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r32){r49=0}else{r19=HEAP32[r29+3];if((r19|0)==(HEAP32[r29+4]|0)){r50=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r50=HEAP32[r19>>2]}if((r50|0)!=-1){r49=r28;break}HEAP32[r14]=0;r49=0}}while(0);r14=(r49|0)==0;do{if(r41){r2=2853}else{r28=HEAP32[r40+3];if((r28|0)==(HEAP32[r40+4]|0)){r51=FUNCTION_TABLE[HEAP32[HEAP32[r40]+36>>2]](r39)}else{r51=HEAP32[r28>>2]}if((r51|0)==-1){HEAP32[r3]=0;r2=2853;break}if(!(r14^(r39|0)==0)){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2853){if(r14){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+40|0;r6=r5,r7=r6>>2;r8=r5+16,r9=r8>>2;r10=r5+32;__ZNKSt3__18ios_base6getlocEv(r10,r2);r2=(r10|0)>>2;r10=HEAP32[r2];if((HEAP32[3630]|0)!=-1){HEAP32[r9]=14520;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r8,260)}r8=HEAP32[3631]-1|0;r9=HEAP32[r10+8>>2];do{if(HEAP32[r10+12>>2]-r9>>2>>>0>r8>>>0){r11=HEAP32[r9+(r8<<2)>>2];if((r11|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+48>>2]](r11,10936,10962,r3);r11=HEAP32[r2];if((HEAP32[3534]|0)!=-1){HEAP32[r7]=14136;HEAP32[r7+1]=26;HEAP32[r7+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14136,r6,260)}r12=HEAP32[3535]-1|0;r13=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r13>>2>>>0>r12>>>0){r14=HEAP32[r13+(r12<<2)>>2];if((r14|0)==0){break}r15=r14;r16=FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+16>>2]](r15);HEAP32[r4>>2]=r16;FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+20>>2]](r1,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2]|0);STACKTOP=r5;return}}while(0);r12=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r12);___cxa_throw(r12,9304,382)}}while(0);r5=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r5);___cxa_throw(r5,9304,382)}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+144|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==8){r22=16}else if((r21|0)==64){r22=8}else if((r21|0)==0){r22=0}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP32[r10>>2];r10=r23;r23=HEAP32[r14],r27=r23>>2;L3265:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{r30=HEAP32[r27+3];if((r30|0)==(HEAP32[r27+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)}else{r31=HEAP32[r30>>2]}if((r31|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r32=(r28|0)==0;r30=HEAP32[r3],r33=r30>>2;do{if((r30|0)==0){r2=2898}else{r34=HEAP32[r33+3];if((r34|0)==(HEAP32[r33+4]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r33]+36>>2]](r30)}else{r35=HEAP32[r34>>2]}if((r35|0)==-1){HEAP32[r3]=0;r2=2898;break}else{r34=(r30|0)==0;if(r32^r34){r36=r30;r37=r34;break}else{r38=r10;r39=r30,r40=r39>>2;r41=r34;break L3265}}}}while(0);if(r2==2898){r2=0;if(r32){r38=r10;r39=0,r40=r39>>2;r41=1;break}else{r36=0;r37=1}}r30=HEAPU8[r13];r33=(r30&1|0)==0;if((HEAP32[r16]-r10|0)==((r33?r30>>>1:HEAP32[r9>>2])|0)){if(r33){r42=r30>>>1;r43=r30>>>1}else{r30=HEAP32[r9>>2];r42=r30;r43=r30}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42<<1,0);if((HEAP8[r13]&1)==0){r44=10}else{r44=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44,0);if((HEAP8[r13]&1)==0){r45=r24}else{r45=HEAP32[r25>>2]}HEAP32[r16]=r45+r43;r46=r45}else{r46=r10}r30=(r28+12|0)>>2;r33=HEAP32[r30];r34=r28+16|0;if((r33|0)==(HEAP32[r34>>2]|0)){r47=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r47=HEAP32[r33>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r47,r22,r46,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r38=r46;r39=r36,r40=r39>>2;r41=r37;break}r33=HEAP32[r30];if((r33|0)==(HEAP32[r34>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r46;r23=r28,r27=r23>>2;continue}else{HEAP32[r30]=r33+4;r10=r46;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r48=r23>>>1}else{r48=HEAP32[r11+4>>2]}do{if((r48|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__125__num_get_signed_integralIxEET_PKcS3_Rji(r38,HEAP32[r16],r6,r22);HEAP32[r7>>2]=r20;HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r32){r49=0}else{r19=HEAP32[r29+3];if((r19|0)==(HEAP32[r29+4]|0)){r50=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r50=HEAP32[r19>>2]}if((r50|0)!=-1){r49=r28;break}HEAP32[r14]=0;r49=0}}while(0);r14=(r49|0)==0;do{if(r41){r2=2940}else{r28=HEAP32[r40+3];if((r28|0)==(HEAP32[r40+4]|0)){r51=FUNCTION_TABLE[HEAP32[HEAP32[r40]+36>>2]](r39)}else{r51=HEAP32[r28>>2]}if((r51|0)==-1){HEAP32[r3]=0;r2=2940;break}if(!(r14^(r39|0)==0)){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==2940){if(r14){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRt(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+144|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==8){r22=16}else if((r21|0)==0){r22=0}else if((r21|0)==64){r22=8}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP32[r10>>2];r10=r23;r23=HEAP32[r14],r27=r23>>2;L11:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{r30=HEAP32[r27+3];if((r30|0)==(HEAP32[r27+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)}else{r31=HEAP32[r30>>2]}if((r31|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r32=(r28|0)==0;r30=HEAP32[r3],r33=r30>>2;do{if((r30|0)==0){r2=22}else{r34=HEAP32[r33+3];if((r34|0)==(HEAP32[r33+4]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r33]+36>>2]](r30)}else{r35=HEAP32[r34>>2]}if((r35|0)==-1){HEAP32[r3]=0;r2=22;break}else{r34=(r30|0)==0;if(r32^r34){r36=r30;r37=r34;break}else{r38=r10;r39=r30,r40=r39>>2;r41=r34;break L11}}}}while(0);if(r2==22){r2=0;if(r32){r38=r10;r39=0,r40=r39>>2;r41=1;break}else{r36=0;r37=1}}r30=HEAPU8[r13];r33=(r30&1|0)==0;if((HEAP32[r16]-r10|0)==((r33?r30>>>1:HEAP32[r9>>2])|0)){if(r33){r42=r30>>>1;r43=r30>>>1}else{r30=HEAP32[r9>>2];r42=r30;r43=r30}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42<<1,0);if((HEAP8[r13]&1)==0){r44=10}else{r44=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44,0);if((HEAP8[r13]&1)==0){r45=r24}else{r45=HEAP32[r25>>2]}HEAP32[r16]=r45+r43;r46=r45}else{r46=r10}r30=(r28+12|0)>>2;r33=HEAP32[r30];r34=r28+16|0;if((r33|0)==(HEAP32[r34>>2]|0)){r47=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r47=HEAP32[r33>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r47,r22,r46,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r38=r46;r39=r36,r40=r39>>2;r41=r37;break}r33=HEAP32[r30];if((r33|0)==(HEAP32[r34>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r46;r23=r28,r27=r23>>2;continue}else{HEAP32[r30]=r33+4;r10=r46;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r48=r23>>>1}else{r48=HEAP32[r11+4>>2]}do{if((r48|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__127__num_get_unsigned_integralItEET_PKcS3_Rji(r38,HEAP32[r16],r6,r22);HEAP16[r7>>1]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r32){r49=0}else{r19=HEAP32[r29+3];if((r19|0)==(HEAP32[r29+4]|0)){r50=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r50=HEAP32[r19>>2]}if((r50|0)!=-1){r49=r28;break}HEAP32[r14]=0;r49=0}}while(0);r14=(r49|0)==0;do{if(r41){r2=64}else{r28=HEAP32[r40+3];if((r28|0)==(HEAP32[r40+4]|0)){r51=FUNCTION_TABLE[HEAP32[HEAP32[r40]+36>>2]](r39)}else{r51=HEAP32[r28>>2]}if((r51|0)==-1){HEAP32[r3]=0;r2=64;break}if(!(r14^(r39|0)==0)){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==64){if(r14){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+144|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==8){r22=16}else if((r21|0)==0){r22=0}else if((r21|0)==64){r22=8}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP32[r10>>2];r10=r23;r23=HEAP32[r14],r27=r23>>2;L100:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{r30=HEAP32[r27+3];if((r30|0)==(HEAP32[r27+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)}else{r31=HEAP32[r30>>2]}if((r31|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r32=(r28|0)==0;r30=HEAP32[r3],r33=r30>>2;do{if((r30|0)==0){r2=92}else{r34=HEAP32[r33+3];if((r34|0)==(HEAP32[r33+4]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r33]+36>>2]](r30)}else{r35=HEAP32[r34>>2]}if((r35|0)==-1){HEAP32[r3]=0;r2=92;break}else{r34=(r30|0)==0;if(r32^r34){r36=r30;r37=r34;break}else{r38=r10;r39=r30,r40=r39>>2;r41=r34;break L100}}}}while(0);if(r2==92){r2=0;if(r32){r38=r10;r39=0,r40=r39>>2;r41=1;break}else{r36=0;r37=1}}r30=HEAPU8[r13];r33=(r30&1|0)==0;if((HEAP32[r16]-r10|0)==((r33?r30>>>1:HEAP32[r9>>2])|0)){if(r33){r42=r30>>>1;r43=r30>>>1}else{r30=HEAP32[r9>>2];r42=r30;r43=r30}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42<<1,0);if((HEAP8[r13]&1)==0){r44=10}else{r44=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44,0);if((HEAP8[r13]&1)==0){r45=r24}else{r45=HEAP32[r25>>2]}HEAP32[r16]=r45+r43;r46=r45}else{r46=r10}r30=(r28+12|0)>>2;r33=HEAP32[r30];r34=r28+16|0;if((r33|0)==(HEAP32[r34>>2]|0)){r47=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r47=HEAP32[r33>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r47,r22,r46,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r38=r46;r39=r36,r40=r39>>2;r41=r37;break}r33=HEAP32[r30];if((r33|0)==(HEAP32[r34>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r46;r23=r28,r27=r23>>2;continue}else{HEAP32[r30]=r33+4;r10=r46;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r48=r23>>>1}else{r48=HEAP32[r11+4>>2]}do{if((r48|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__127__num_get_unsigned_integralIjEET_PKcS3_Rji(r38,HEAP32[r16],r6,r22);HEAP32[r7>>2]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r32){r49=0}else{r19=HEAP32[r29+3];if((r19|0)==(HEAP32[r29+4]|0)){r50=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r50=HEAP32[r19>>2]}if((r50|0)!=-1){r49=r28;break}HEAP32[r14]=0;r49=0}}while(0);r14=(r49|0)==0;do{if(r41){r2=134}else{r28=HEAP32[r40+3];if((r28|0)==(HEAP32[r40+4]|0)){r51=FUNCTION_TABLE[HEAP32[HEAP32[r40]+36>>2]](r39)}else{r51=HEAP32[r28>>2]}if((r51|0)==-1){HEAP32[r3]=0;r2=134;break}if(!(r14^(r39|0)==0)){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==134){if(r14){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+144|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==0){r22=0}else if((r21|0)==64){r22=8}else if((r21|0)==8){r22=16}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP32[r10>>2];r10=r23;r23=HEAP32[r14],r27=r23>>2;L189:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{r30=HEAP32[r27+3];if((r30|0)==(HEAP32[r27+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)}else{r31=HEAP32[r30>>2]}if((r31|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r32=(r28|0)==0;r30=HEAP32[r3],r33=r30>>2;do{if((r30|0)==0){r2=162}else{r34=HEAP32[r33+3];if((r34|0)==(HEAP32[r33+4]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r33]+36>>2]](r30)}else{r35=HEAP32[r34>>2]}if((r35|0)==-1){HEAP32[r3]=0;r2=162;break}else{r34=(r30|0)==0;if(r32^r34){r36=r30;r37=r34;break}else{r38=r10;r39=r30,r40=r39>>2;r41=r34;break L189}}}}while(0);if(r2==162){r2=0;if(r32){r38=r10;r39=0,r40=r39>>2;r41=1;break}else{r36=0;r37=1}}r30=HEAPU8[r13];r33=(r30&1|0)==0;if((HEAP32[r16]-r10|0)==((r33?r30>>>1:HEAP32[r9>>2])|0)){if(r33){r42=r30>>>1;r43=r30>>>1}else{r30=HEAP32[r9>>2];r42=r30;r43=r30}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42<<1,0);if((HEAP8[r13]&1)==0){r44=10}else{r44=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44,0);if((HEAP8[r13]&1)==0){r45=r24}else{r45=HEAP32[r25>>2]}HEAP32[r16]=r45+r43;r46=r45}else{r46=r10}r30=(r28+12|0)>>2;r33=HEAP32[r30];r34=r28+16|0;if((r33|0)==(HEAP32[r34>>2]|0)){r47=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r47=HEAP32[r33>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r47,r22,r46,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r38=r46;r39=r36,r40=r39>>2;r41=r37;break}r33=HEAP32[r30];if((r33|0)==(HEAP32[r34>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r46;r23=r28,r27=r23>>2;continue}else{HEAP32[r30]=r33+4;r10=r46;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r48=r23>>>1}else{r48=HEAP32[r11+4>>2]}do{if((r48|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__127__num_get_unsigned_integralImEET_PKcS3_Rji(r38,HEAP32[r16],r6,r22);HEAP32[r7>>2]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r32){r49=0}else{r19=HEAP32[r29+3];if((r19|0)==(HEAP32[r29+4]|0)){r50=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r50=HEAP32[r19>>2]}if((r50|0)!=-1){r49=r28;break}HEAP32[r14]=0;r49=0}}while(0);r14=(r49|0)==0;do{if(r41){r2=204}else{r28=HEAP32[r40+3];if((r28|0)==(HEAP32[r40+4]|0)){r51=FUNCTION_TABLE[HEAP32[HEAP32[r40]+36>>2]](r39)}else{r51=HEAP32[r28>>2]}if((r51|0)==-1){HEAP32[r3]=0;r2=204;break}if(!(r14^(r39|0)==0)){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==204){if(r14){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+144|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=HEAP32[r5+4>>2]&74;if((r21|0)==64){r22=8}else if((r21|0)==0){r22=0}else if((r21|0)==8){r22=16}else{r22=10}r21=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r21,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r23=r5;r24=r5;r25=r12+8|0}else{r5=r12+8|0;r23=HEAP32[r5>>2];r24=r14+1|0;r25=r5}HEAP32[r16]=r23;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r9=r12+4|0;r26=HEAP32[r10>>2];r10=r23;r23=HEAP32[r14],r27=r23>>2;L278:while(1){do{if((r23|0)==0){r28=0,r29=r28>>2}else{r30=HEAP32[r27+3];if((r30|0)==(HEAP32[r27+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r23)}else{r31=HEAP32[r30>>2]}if((r31|0)!=-1){r28=r23,r29=r28>>2;break}HEAP32[r14]=0;r28=0,r29=r28>>2}}while(0);r32=(r28|0)==0;r30=HEAP32[r3],r33=r30>>2;do{if((r30|0)==0){r2=232}else{r34=HEAP32[r33+3];if((r34|0)==(HEAP32[r33+4]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r33]+36>>2]](r30)}else{r35=HEAP32[r34>>2]}if((r35|0)==-1){HEAP32[r3]=0;r2=232;break}else{r34=(r30|0)==0;if(r32^r34){r36=r30;r37=r34;break}else{r38=r10;r39=r30,r40=r39>>2;r41=r34;break L278}}}}while(0);if(r2==232){r2=0;if(r32){r38=r10;r39=0,r40=r39>>2;r41=1;break}else{r36=0;r37=1}}r30=HEAPU8[r13];r33=(r30&1|0)==0;if((HEAP32[r16]-r10|0)==((r33?r30>>>1:HEAP32[r9>>2])|0)){if(r33){r42=r30>>>1;r43=r30>>>1}else{r30=HEAP32[r9>>2];r42=r30;r43=r30}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r42<<1,0);if((HEAP8[r13]&1)==0){r44=10}else{r44=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44,0);if((HEAP8[r13]&1)==0){r45=r24}else{r45=HEAP32[r25>>2]}HEAP32[r16]=r45+r43;r46=r45}else{r46=r10}r30=(r28+12|0)>>2;r33=HEAP32[r30];r34=r28+16|0;if((r33|0)==(HEAP32[r34>>2]|0)){r47=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r47=HEAP32[r33>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r47,r22,r46,r15,r20,r26,r11,r5,r18,r21)|0)!=0){r38=r46;r39=r36,r40=r39>>2;r41=r37;break}r33=HEAP32[r30];if((r33|0)==(HEAP32[r34>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r10=r46;r23=r28,r27=r23>>2;continue}else{HEAP32[r30]=r33+4;r10=r46;r23=r28,r27=r23>>2;continue}}r23=HEAPU8[r11];if((r23&1|0)==0){r48=r23>>>1}else{r48=HEAP32[r11+4>>2]}do{if((r48|0)!=0){r23=HEAP32[r19];if((r23-r17|0)>=160){break}r27=HEAP32[r20>>2];HEAP32[r19]=r23+4;HEAP32[r23>>2]=r27}}while(0);r20=__ZNSt3__127__num_get_unsigned_integralIyEET_PKcS3_Rji(r38,HEAP32[r16],r6,r22);HEAP32[r7>>2]=r20;HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r32){r49=0}else{r19=HEAP32[r29+3];if((r19|0)==(HEAP32[r29+4]|0)){r50=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r50=HEAP32[r19>>2]}if((r50|0)!=-1){r49=r28;break}HEAP32[r14]=0;r49=0}}while(0);r14=(r49|0)==0;do{if(r41){r2=274}else{r28=HEAP32[r40+3];if((r28|0)==(HEAP32[r40+4]|0)){r51=FUNCTION_TABLE[HEAP32[HEAP32[r40]+36>>2]](r39)}else{r51=HEAP32[r28>>2]}if((r51|0)==-1){HEAP32[r3]=0;r2=274;break}if(!(r14^(r39|0)==0)){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==274){if(r14){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12){var r13,r14,r15,r16,r17,r18;r13=r11>>2;r11=r10>>2;r10=r5>>2;if((r1|0)==(r6|0)){if((HEAP8[r2]&1)==0){r14=-1;return r14}HEAP8[r2]=0;r6=HEAP32[r10];HEAP32[r10]=r6+1;HEAP8[r6]=46;r6=HEAPU8[r8];if((r6&1|0)==0){r15=r6>>>1}else{r15=HEAP32[r8+4>>2]}if((r15|0)==0){r14=0;return r14}r15=HEAP32[r11];if((r15-r9|0)>=160){r14=0;return r14}r6=HEAP32[r13];HEAP32[r11]=r15+4;HEAP32[r15>>2]=r6;r14=0;return r14}do{if((r1|0)==(r7|0)){r6=HEAPU8[r8];if((r6&1|0)==0){r16=r6>>>1}else{r16=HEAP32[r8+4>>2]}if((r16|0)==0){break}if((HEAP8[r2]&1)==0){r14=-1;return r14}r6=HEAP32[r11];if((r6-r9|0)>=160){r14=0;return r14}r15=HEAP32[r13];HEAP32[r11]=r6+4;HEAP32[r6>>2]=r15;HEAP32[r13]=0;r14=0;return r14}}while(0);r16=r12+128|0;r7=r12;while(1){if((r7|0)==(r16|0)){r17=r16;break}if((HEAP32[r7>>2]|0)==(r1|0)){r17=r7;break}else{r7=r7+4|0}}r7=r17-r12|0;r12=r7>>2;if((r7|0)>124){r14=-1;return r14}r17=HEAP8[r12+10936|0];do{if((r12|0)==25|(r12|0)==24){r1=HEAP32[r10];do{if((r1|0)!=(r4|0)){if((HEAP8[r1-1|0]&95|0)==(HEAP8[r3]&127|0)){break}else{r14=-1}return r14}}while(0);HEAP32[r10]=r1+1;HEAP8[r1]=r17;r14=0;return r14}else if((r12|0)==22|(r12|0)==23){HEAP8[r3]=80}else{r16=HEAP8[r3];if((r17&95|0)!=(r16<<24>>24|0)){break}HEAP8[r3]=r16|-128;if((HEAP8[r2]&1)==0){break}HEAP8[r2]=0;r16=HEAPU8[r8];if((r16&1|0)==0){r18=r16>>>1}else{r18=HEAP32[r8+4>>2]}if((r18|0)==0){break}r16=HEAP32[r11];if((r16-r9|0)>=160){break}r15=HEAP32[r13];HEAP32[r11]=r16+4;HEAP32[r16>>2]=r15}}while(0);r11=HEAP32[r10];HEAP32[r10]=r11+1;HEAP8[r11]=r17;if((r7|0)>84){r14=0;return r14}HEAP32[r13]=HEAP32[r13]+1;r14=0;return r14}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRf(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+176|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8+128;r10=r8+136;r11=r8+144;r12=r8+160;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r22=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r23=r8|0;__ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r11,r5,r23,r9,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r24=r5;r25=r5;r26=r12+8|0}else{r5=r12+8|0;r24=HEAP32[r5>>2];r25=r14+1|0;r26=r5}HEAP32[r16]=r24;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;HEAP8[r21]=1;HEAP8[r22]=69;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r27=r12+4|0;r28=HEAP32[r9>>2];r9=HEAP32[r10>>2];r10=r24;r24=HEAP32[r14],r29=r24>>2;L424:while(1){do{if((r24|0)==0){r30=0,r31=r30>>2}else{r32=HEAP32[r29+3];if((r32|0)==(HEAP32[r29+4]|0)){r33=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r24)}else{r33=HEAP32[r32>>2]}if((r33|0)!=-1){r30=r24,r31=r30>>2;break}HEAP32[r14]=0;r30=0,r31=r30>>2}}while(0);r34=(r30|0)==0;r32=HEAP32[r3],r35=r32>>2;do{if((r32|0)==0){r2=346}else{r36=HEAP32[r35+3];if((r36|0)==(HEAP32[r35+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r32)}else{r37=HEAP32[r36>>2]}if((r37|0)==-1){HEAP32[r3]=0;r2=346;break}else{r36=(r32|0)==0;if(r34^r36){r38=r32;r39=r36;break}else{r40=r10;r41=r32,r42=r41>>2;r43=r36;break L424}}}}while(0);if(r2==346){r2=0;if(r34){r40=r10;r41=0,r42=r41>>2;r43=1;break}else{r38=0;r39=1}}r32=HEAPU8[r13];r35=(r32&1|0)==0;if((HEAP32[r16]-r10|0)==((r35?r32>>>1:HEAP32[r27>>2])|0)){if(r35){r44=r32>>>1;r45=r32>>>1}else{r32=HEAP32[r27>>2];r44=r32;r45=r32}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44<<1,0);if((HEAP8[r13]&1)==0){r46=10}else{r46=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r46,0);if((HEAP8[r13]&1)==0){r47=r25}else{r47=HEAP32[r26>>2]}HEAP32[r16]=r47+r45;r48=r47}else{r48=r10}r32=(r30+12|0)>>2;r35=HEAP32[r32];r36=r30+16|0;if((r35|0)==(HEAP32[r36>>2]|0)){r49=FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)}else{r49=HEAP32[r35>>2]}if((__ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r49,r21,r22,r48,r15,r28,r9,r11,r5,r18,r20,r23)|0)!=0){r40=r48;r41=r38,r42=r41>>2;r43=r39;break}r35=HEAP32[r32];if((r35|0)==(HEAP32[r36>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r31]+40>>2]](r30);r10=r48;r24=r30,r29=r24>>2;continue}else{HEAP32[r32]=r35+4;r10=r48;r24=r30,r29=r24>>2;continue}}r24=HEAPU8[r11];if((r24&1|0)==0){r50=r24>>>1}else{r50=HEAP32[r11+4>>2]}do{if((r50|0)!=0){if((HEAP8[r21]&1)==0){break}r24=HEAP32[r19];if((r24-r17|0)>=160){break}r29=HEAP32[r20>>2];HEAP32[r19]=r24+4;HEAP32[r24>>2]=r29}}while(0);r20=__ZNSt3__115__num_get_floatIfEET_PKcS3_Rj(r40,HEAP32[r16],r6);HEAPF32[r7>>2]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r34){r51=0}else{r19=HEAP32[r31+3];if((r19|0)==(HEAP32[r31+4]|0)){r52=FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)}else{r52=HEAP32[r19>>2]}if((r52|0)!=-1){r51=r30;break}HEAP32[r14]=0;r51=0}}while(0);r14=(r51|0)==0;do{if(r43){r2=389}else{r30=HEAP32[r42+3];if((r30|0)==(HEAP32[r42+4]|0)){r53=FUNCTION_TABLE[HEAP32[HEAP32[r42]+36>>2]](r41)}else{r53=HEAP32[r30>>2]}if((r53|0)==-1){HEAP32[r3]=0;r2=389;break}if(!(r14^(r41|0)==0)){break}r54=r1|0,r55=r54>>2;HEAP32[r55]=r51;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==389){if(r14){break}r54=r1|0,r55=r54>>2;HEAP32[r55]=r51;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r54=r1|0,r55=r54>>2;HEAP32[r55]=r51;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r6=STACKTOP;STACKTOP=STACKTOP+40|0;r7=r6,r8=r7>>2;r9=r6+16,r10=r9>>2;r11=r6+32;__ZNKSt3__18ios_base6getlocEv(r11,r2);r2=(r11|0)>>2;r11=HEAP32[r2];if((HEAP32[3630]|0)!=-1){HEAP32[r10]=14520;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r9,260)}r9=HEAP32[3631]-1|0;r10=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r10>>2>>>0>r9>>>0){r12=HEAP32[r10+(r9<<2)>>2];if((r12|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+48>>2]](r12,10936,10968,r3);r12=HEAP32[r2];if((HEAP32[3534]|0)!=-1){HEAP32[r8]=14136;HEAP32[r8+1]=26;HEAP32[r8+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14136,r7,260)}r13=HEAP32[3535]-1|0;r14=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r14>>2>>>0>r13>>>0){r15=HEAP32[r14+(r13<<2)>>2];if((r15|0)==0){break}r16=r15;r17=r15;r18=FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+12>>2]](r16);HEAP32[r4>>2]=r18;r18=FUNCTION_TABLE[HEAP32[HEAP32[r17>>2]+16>>2]](r16);HEAP32[r5>>2]=r18;FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+20>>2]](r1,r16);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2]|0);STACKTOP=r6;return}}while(0);r13=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r13);___cxa_throw(r13,9304,382)}}while(0);r6=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r6);___cxa_throw(r6,9304,382)}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRd(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+176|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8+128;r10=r8+136;r11=r8+144;r12=r8+160;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r22=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r23=r8|0;__ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r11,r5,r23,r9,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r24=r5;r25=r5;r26=r12+8|0}else{r5=r12+8|0;r24=HEAP32[r5>>2];r25=r14+1|0;r26=r5}HEAP32[r16]=r24;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;HEAP8[r21]=1;HEAP8[r22]=69;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r27=r12+4|0;r28=HEAP32[r9>>2];r9=HEAP32[r10>>2];r10=r24;r24=HEAP32[r14],r29=r24>>2;L530:while(1){do{if((r24|0)==0){r30=0,r31=r30>>2}else{r32=HEAP32[r29+3];if((r32|0)==(HEAP32[r29+4]|0)){r33=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r24)}else{r33=HEAP32[r32>>2]}if((r33|0)!=-1){r30=r24,r31=r30>>2;break}HEAP32[r14]=0;r30=0,r31=r30>>2}}while(0);r34=(r30|0)==0;r32=HEAP32[r3],r35=r32>>2;do{if((r32|0)==0){r2=431}else{r36=HEAP32[r35+3];if((r36|0)==(HEAP32[r35+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r32)}else{r37=HEAP32[r36>>2]}if((r37|0)==-1){HEAP32[r3]=0;r2=431;break}else{r36=(r32|0)==0;if(r34^r36){r38=r32;r39=r36;break}else{r40=r10;r41=r32,r42=r41>>2;r43=r36;break L530}}}}while(0);if(r2==431){r2=0;if(r34){r40=r10;r41=0,r42=r41>>2;r43=1;break}else{r38=0;r39=1}}r32=HEAPU8[r13];r35=(r32&1|0)==0;if((HEAP32[r16]-r10|0)==((r35?r32>>>1:HEAP32[r27>>2])|0)){if(r35){r44=r32>>>1;r45=r32>>>1}else{r32=HEAP32[r27>>2];r44=r32;r45=r32}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44<<1,0);if((HEAP8[r13]&1)==0){r46=10}else{r46=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r46,0);if((HEAP8[r13]&1)==0){r47=r25}else{r47=HEAP32[r26>>2]}HEAP32[r16]=r47+r45;r48=r47}else{r48=r10}r32=(r30+12|0)>>2;r35=HEAP32[r32];r36=r30+16|0;if((r35|0)==(HEAP32[r36>>2]|0)){r49=FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)}else{r49=HEAP32[r35>>2]}if((__ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r49,r21,r22,r48,r15,r28,r9,r11,r5,r18,r20,r23)|0)!=0){r40=r48;r41=r38,r42=r41>>2;r43=r39;break}r35=HEAP32[r32];if((r35|0)==(HEAP32[r36>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r31]+40>>2]](r30);r10=r48;r24=r30,r29=r24>>2;continue}else{HEAP32[r32]=r35+4;r10=r48;r24=r30,r29=r24>>2;continue}}r24=HEAPU8[r11];if((r24&1|0)==0){r50=r24>>>1}else{r50=HEAP32[r11+4>>2]}do{if((r50|0)!=0){if((HEAP8[r21]&1)==0){break}r24=HEAP32[r19];if((r24-r17|0)>=160){break}r29=HEAP32[r20>>2];HEAP32[r19]=r24+4;HEAP32[r24>>2]=r29}}while(0);r20=__ZNSt3__115__num_get_floatIdEET_PKcS3_Rj(r40,HEAP32[r16],r6);HEAPF64[r7>>3]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r34){r51=0}else{r19=HEAP32[r31+3];if((r19|0)==(HEAP32[r31+4]|0)){r52=FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)}else{r52=HEAP32[r19>>2]}if((r52|0)!=-1){r51=r30;break}HEAP32[r14]=0;r51=0}}while(0);r14=(r51|0)==0;do{if(r43){r2=474}else{r30=HEAP32[r42+3];if((r30|0)==(HEAP32[r42+4]|0)){r53=FUNCTION_TABLE[HEAP32[HEAP32[r42]+36>>2]](r41)}else{r53=HEAP32[r30>>2]}if((r53|0)==-1){HEAP32[r3]=0;r2=474;break}if(!(r14^(r41|0)==0)){break}r54=r1|0,r55=r54>>2;HEAP32[r55]=r51;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==474){if(r14){break}r54=r1|0,r55=r54>>2;HEAP32[r55]=r51;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r54=r1|0,r55=r54>>2;HEAP32[r55]=r51;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+176|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8+128;r10=r8+136;r11=r8+144;r12=r8+160;r13=r12,r14=r13>>2;r15=STACKTOP,r16=r15>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r22=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r23=r8|0;__ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r11,r5,r23,r9,r10);HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r12;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,10,0);if((HEAP8[r13]&1)==0){r5=r14+1|0;r24=r5;r25=r5;r26=r12+8|0}else{r5=r12+8|0;r24=HEAP32[r5>>2];r25=r14+1|0;r26=r5}HEAP32[r16]=r24;r5=r17|0;HEAP32[r19]=r5;HEAP32[r20>>2]=0;HEAP8[r21]=1;HEAP8[r22]=69;r14=(r3|0)>>2;r3=(r4|0)>>2;r4=r12|0;r27=r12+4|0;r28=HEAP32[r9>>2];r9=HEAP32[r10>>2];r10=r24;r24=HEAP32[r14],r29=r24>>2;L615:while(1){do{if((r24|0)==0){r30=0,r31=r30>>2}else{r32=HEAP32[r29+3];if((r32|0)==(HEAP32[r29+4]|0)){r33=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r24)}else{r33=HEAP32[r32>>2]}if((r33|0)!=-1){r30=r24,r31=r30>>2;break}HEAP32[r14]=0;r30=0,r31=r30>>2}}while(0);r34=(r30|0)==0;r32=HEAP32[r3],r35=r32>>2;do{if((r32|0)==0){r2=498}else{r36=HEAP32[r35+3];if((r36|0)==(HEAP32[r35+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r32)}else{r37=HEAP32[r36>>2]}if((r37|0)==-1){HEAP32[r3]=0;r2=498;break}else{r36=(r32|0)==0;if(r34^r36){r38=r32;r39=r36;break}else{r40=r10;r41=r32,r42=r41>>2;r43=r36;break L615}}}}while(0);if(r2==498){r2=0;if(r34){r40=r10;r41=0,r42=r41>>2;r43=1;break}else{r38=0;r39=1}}r32=HEAPU8[r13];r35=(r32&1|0)==0;if((HEAP32[r16]-r10|0)==((r35?r32>>>1:HEAP32[r27>>2])|0)){if(r35){r44=r32>>>1;r45=r32>>>1}else{r32=HEAP32[r27>>2];r44=r32;r45=r32}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r44<<1,0);if((HEAP8[r13]&1)==0){r46=10}else{r46=(HEAP32[r4>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r12,r46,0);if((HEAP8[r13]&1)==0){r47=r25}else{r47=HEAP32[r26>>2]}HEAP32[r16]=r47+r45;r48=r47}else{r48=r10}r32=(r30+12|0)>>2;r35=HEAP32[r32];r36=r30+16|0;if((r35|0)==(HEAP32[r36>>2]|0)){r49=FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)}else{r49=HEAP32[r35>>2]}if((__ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r49,r21,r22,r48,r15,r28,r9,r11,r5,r18,r20,r23)|0)!=0){r40=r48;r41=r38,r42=r41>>2;r43=r39;break}r35=HEAP32[r32];if((r35|0)==(HEAP32[r36>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r31]+40>>2]](r30);r10=r48;r24=r30,r29=r24>>2;continue}else{HEAP32[r32]=r35+4;r10=r48;r24=r30,r29=r24>>2;continue}}r24=HEAPU8[r11];if((r24&1|0)==0){r50=r24>>>1}else{r50=HEAP32[r11+4>>2]}do{if((r50|0)!=0){if((HEAP8[r21]&1)==0){break}r24=HEAP32[r19];if((r24-r17|0)>=160){break}r29=HEAP32[r20>>2];HEAP32[r19]=r24+4;HEAP32[r24>>2]=r29}}while(0);r20=__ZNSt3__115__num_get_floatIeEET_PKcS3_Rj(r40,HEAP32[r16],r6);HEAPF64[r7>>3]=r20;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r5,HEAP32[r19],r6);do{if(r34){r51=0}else{r19=HEAP32[r31+3];if((r19|0)==(HEAP32[r31+4]|0)){r52=FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r30)}else{r52=HEAP32[r19>>2]}if((r52|0)!=-1){r51=r30;break}HEAP32[r14]=0;r51=0}}while(0);r14=(r51|0)==0;do{if(r43){r2=541}else{r30=HEAP32[r42+3];if((r30|0)==(HEAP32[r42+4]|0)){r53=FUNCTION_TABLE[HEAP32[HEAP32[r42]+36>>2]](r41)}else{r53=HEAP32[r30>>2]}if((r53|0)==-1){HEAP32[r3]=0;r2=541;break}if(!(r14^(r41|0)==0)){break}r54=r1|0,r55=r54>>2;HEAP32[r55]=r51;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);do{if(r2==541){if(r14){break}r54=r1|0,r55=r54>>2;HEAP32[r55]=r51;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r54=r1|0,r55=r54>>2;HEAP32[r55]=r51;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r11);STACKTOP=r8;return}function __ZNSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcl(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+80|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+24;r12=r8+48;r13=r8+56;r14=r8+64;r15=r8+72;r16=r9|0;HEAP8[r16]=HEAP8[3264];HEAP8[r16+1|0]=HEAP8[3265|0];HEAP8[r16+2|0]=HEAP8[3266|0];HEAP8[r16+3|0]=HEAP8[3267|0];HEAP8[r16+4|0]=HEAP8[3268|0];HEAP8[r16+5|0]=HEAP8[3269|0];r17=r9+1|0;r18=r4+4|0;r19=HEAP32[r18>>2];if((r19&2048|0)==0){r20=r17}else{HEAP8[r17]=43;r20=r9+2|0}if((r19&512|0)==0){r21=r20}else{HEAP8[r20]=35;r21=r20+1|0}HEAP8[r21]=108;r20=r21+1|0;r21=r19&74;do{if((r21|0)==64){HEAP8[r20]=111}else if((r21|0)==8){if((r19&16384|0)==0){HEAP8[r20]=120;break}else{HEAP8[r20]=88;break}}else{HEAP8[r20]=100}}while(0);r20=r10|0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r19=_newlocale(1,2e3,0);HEAP32[3292]=r19}}while(0);r19=__ZNSt3__112__snprintf_lEPcjPvPKcz(r20,12,HEAP32[3292],r16,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r7>>2]=r6,r7));STACKTOP=r7;r7=r10+r19|0;r6=HEAP32[r18>>2]&176;do{if((r6|0)==32){r22=r7}else if((r6|0)==16){r18=HEAP8[r20];if(r18<<24>>24==45|r18<<24>>24==43){r22=r10+1|0;break}if(!((r19|0)>1&r18<<24>>24==48)){r2=571;break}r18=HEAP8[r10+1|0];if(!(r18<<24>>24==120|r18<<24>>24==88)){r2=571;break}r22=r10+2|0}else{r2=571}}while(0);if(r2==571){r22=r20}r2=r11|0;__ZNKSt3__18ios_base6getlocEv(r14,r4);__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r20,r22,r7,r2,r12,r13,r14);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r14>>2]|0);HEAP32[r15>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,HEAP32[r12>>2],HEAP32[r13>>2],r4,r5);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53;r2=0;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+136|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r10>>2];r10=r9,r11=r10>>2;r12=r9+16;r13=r9+120;r14=r13>>2;r15=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r16=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP,r18=r17>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r19=STACKTOP;STACKTOP=STACKTOP+160|0;r20=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r21=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=r16,r22=r14>>2;__ZNKSt3__18ios_base6getlocEv(r15,r5);r5=r15|0;r15=HEAP32[r5>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r11]=14520;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r10,260)}r10=HEAP32[3631]-1|0;r11=HEAP32[r15+8>>2];do{if(HEAP32[r15+12>>2]-r11>>2>>>0>r10>>>0){r23=HEAP32[r11+(r10<<2)>>2];if((r23|0)==0){break}r24=r12|0;FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+48>>2]](r23,10936,10962,r24);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;r23=r16;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r16,10,0);if((HEAP8[r14]&1)==0){r25=r23+1|0;r26=r25;r27=r25;r28=r16+8|0}else{r25=r16+8|0;r26=HEAP32[r25>>2];r27=r23+1|0;r28=r25}HEAP32[r18]=r26;r25=r19|0;HEAP32[r20>>2]=r25;HEAP32[r21>>2]=0;r23=(r3|0)>>2;r29=(r4|0)>>2;r30=r16|0;r31=r16+4|0;r32=r26;r33=HEAP32[r23],r34=r33>>2;L741:while(1){do{if((r33|0)==0){r35=0}else{r36=HEAP32[r34+3];if((r36|0)==(HEAP32[r34+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r33)}else{r37=HEAP32[r36>>2]}if((r37|0)!=-1){r35=r33;break}HEAP32[r23]=0;r35=0}}while(0);r36=(r35|0)==0;r38=HEAP32[r29],r39=r38>>2;do{if((r38|0)==0){r2=600}else{r40=HEAP32[r39+3];if((r40|0)==(HEAP32[r39+4]|0)){r41=FUNCTION_TABLE[HEAP32[HEAP32[r39]+36>>2]](r38)}else{r41=HEAP32[r40>>2]}if((r41|0)==-1){HEAP32[r29]=0;r2=600;break}else{if(r36^(r38|0)==0){break}else{r42=r32;break L741}}}}while(0);if(r2==600){r2=0;if(r36){r42=r32;break}}r38=HEAPU8[r14];r39=(r38&1|0)==0;if((HEAP32[r18]-r32|0)==((r39?r38>>>1:HEAP32[r31>>2])|0)){if(r39){r43=r38>>>1;r44=r38>>>1}else{r38=HEAP32[r31>>2];r43=r38;r44=r38}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r16,r43<<1,0);if((HEAP8[r14]&1)==0){r45=10}else{r45=(HEAP32[r30>>2]&-2)-1|0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEjc(r16,r45,0);if((HEAP8[r14]&1)==0){r46=r27}else{r46=HEAP32[r28>>2]}HEAP32[r18]=r46+r44;r47=r46}else{r47=r32}r38=(r35+12|0)>>2;r39=HEAP32[r38];r40=r35+16|0;if((r39|0)==(HEAP32[r40>>2]|0)){r48=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+36>>2]](r35)}else{r48=HEAP32[r39>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r48,16,r47,r17,r21,0,r13,r25,r20,r24)|0)!=0){r42=r47;break}r39=HEAP32[r38];if((r39|0)==(HEAP32[r40>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+40>>2]](r35);r32=r47;r33=r35,r34=r33>>2;continue}else{HEAP32[r38]=r39+4;r32=r47;r33=r35,r34=r33>>2;continue}}HEAP8[r42+3|0]=0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r33=_newlocale(1,2e3,0);HEAP32[3292]=r33}}while(0);r33=__ZNSt3__110__sscanf_lEPKcPvS1_z(r42,HEAP32[3292],1880,(r8=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r8>>2]=r7,r8));STACKTOP=r8;if((r33|0)!=1){HEAP32[r6>>2]=4}r33=HEAP32[r23],r34=r33>>2;do{if((r33|0)==0){r49=0}else{r32=HEAP32[r34+3];if((r32|0)==(HEAP32[r34+4]|0)){r50=FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r33)}else{r50=HEAP32[r32>>2]}if((r50|0)!=-1){r49=r33;break}HEAP32[r23]=0;r49=0}}while(0);r23=(r49|0)==0;r33=HEAP32[r29],r34=r33>>2;do{if((r33|0)==0){r2=645}else{r32=HEAP32[r34+3];if((r32|0)==(HEAP32[r34+4]|0)){r51=FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r33)}else{r51=HEAP32[r32>>2]}if((r51|0)==-1){HEAP32[r29]=0;r2=645;break}if(!(r23^(r33|0)==0)){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r16);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r9;return}}while(0);do{if(r2==645){if(r23){break}r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r16);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r9;return}}while(0);HEAP32[r6>>2]=HEAP32[r6>>2]|2;r52=r1|0,r53=r52>>2;HEAP32[r53]=r49;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r16);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r9;return}}while(0);r9=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r9);___cxa_throw(r9,9304,382)}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcb(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r7=STACKTOP;STACKTOP=STACKTOP+48|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7,r9=r8>>2;r10=r7+16;r11=r7+24;r12=r7+32;if((HEAP32[r4+4>>2]&1|0)==0){r13=HEAP32[HEAP32[r2>>2]+24>>2];HEAP32[r10>>2]=HEAP32[r3>>2];FUNCTION_TABLE[r13](r1,r2,r10,r4,r5,r6&1);STACKTOP=r7;return}__ZNKSt3__18ios_base6getlocEv(r11,r4);r4=r11|0;r11=HEAP32[r4>>2];if((HEAP32[3536]|0)!=-1){HEAP32[r9]=14144;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14144,r8,260)}r8=HEAP32[3537]-1|0;r9=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r9>>2>>>0>r8>>>0){r5=HEAP32[r9+(r8<<2)>>2];if((r5|0)==0){break}r10=r5;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r4>>2]|0);r2=HEAP32[r5>>2];if(r6){FUNCTION_TABLE[HEAP32[r2+24>>2]](r12,r10)}else{FUNCTION_TABLE[HEAP32[r2+28>>2]](r12,r10)}r10=r12;r2=r12;r5=HEAP8[r2];if((r5&1)==0){r13=r10+1|0;r14=r13;r15=r13;r16=r12+8|0}else{r13=r12+8|0;r14=HEAP32[r13>>2];r15=r10+1|0;r16=r13}r13=(r3|0)>>2;r10=r12+4|0;r17=r14;r18=r5;while(1){if((r18&1)==0){r19=r15}else{r19=HEAP32[r16>>2]}r5=r18&255;if((r17|0)==(r19+((r5&1|0)==0?r5>>>1:HEAP32[r10>>2])|0)){break}r5=HEAP8[r17];r20=HEAP32[r13];do{if((r20|0)!=0){r21=r20+24|0;r22=HEAP32[r21>>2];if((r22|0)!=(HEAP32[r20+28>>2]|0)){HEAP32[r21>>2]=r22+1;HEAP8[r22]=r5;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+52>>2]](r20,r5&255)|0)!=-1){break}HEAP32[r13]=0}}while(0);r17=r17+1|0;r18=HEAP8[r2]}HEAP32[r1>>2]=HEAP32[r13];__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r12);STACKTOP=r7;return}}while(0);r7=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r7);___cxa_throw(r7,9304,382)}function __ZNSt3__112__snprintf_lEPcjPvPKcz(r1,r2,r3,r4,r5){var r6,r7,r8;r6=STACKTOP;STACKTOP=STACKTOP+16|0;r7=r6;r8=r7;HEAP32[r8>>2]=r5;HEAP32[r8+4>>2]=0;r8=_uselocale(r3);r3=_vsnprintf(r1,r2,r4,r7|0);if((r8|0)==0){STACKTOP=r6;return r3}_uselocale(r8);STACKTOP=r6;return r3}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+112|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r9;r11=r9+8;r12=r9+32;r13=r9+80;r14=r9+88;r15=r9+96;r16=r9+104;HEAP32[r10>>2]=37;HEAP32[r10+4>>2]=0;r17=r10;r10=r17+1|0;r18=r4+4|0;r19=HEAP32[r18>>2];if((r19&2048|0)==0){r20=r10}else{HEAP8[r10]=43;r20=r17+2|0}if((r19&512|0)==0){r21=r20}else{HEAP8[r20]=35;r21=r20+1|0}HEAP8[r21]=108;HEAP8[r21+1|0]=108;r20=r21+2|0;r21=r19&74;do{if((r21|0)==64){HEAP8[r20]=111}else if((r21|0)==8){if((r19&16384|0)==0){HEAP8[r20]=120;break}else{HEAP8[r20]=88;break}}else{HEAP8[r20]=100}}while(0);r20=r11|0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r19=_newlocale(1,2e3,0);HEAP32[3292]=r19}}while(0);r19=__ZNSt3__112__snprintf_lEPcjPvPKcz(r20,22,HEAP32[3292],r17,(r8=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r8>>2]=r6,HEAP32[r8+8>>2]=r7,r8));STACKTOP=r8;r8=r11+r19|0;r7=HEAP32[r18>>2]&176;do{if((r7|0)==16){r18=HEAP8[r20];if(r18<<24>>24==45|r18<<24>>24==43){r22=r11+1|0;break}if(!((r19|0)>1&r18<<24>>24==48)){r2=712;break}r18=HEAP8[r11+1|0];if(!(r18<<24>>24==120|r18<<24>>24==88)){r2=712;break}r22=r11+2|0}else if((r7|0)==32){r22=r8}else{r2=712}}while(0);if(r2==712){r22=r20}r2=r12|0;__ZNKSt3__18ios_base6getlocEv(r15,r4);__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r20,r22,r8,r2,r13,r14,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r15>>2]|0);HEAP32[r16>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r16,r2,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);STACKTOP=r9;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcm(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+80|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+24;r12=r8+48;r13=r8+56;r14=r8+64;r15=r8+72;r16=r9|0;HEAP8[r16]=HEAP8[3264];HEAP8[r16+1|0]=HEAP8[3265|0];HEAP8[r16+2|0]=HEAP8[3266|0];HEAP8[r16+3|0]=HEAP8[3267|0];HEAP8[r16+4|0]=HEAP8[3268|0];HEAP8[r16+5|0]=HEAP8[3269|0];r17=r9+1|0;r18=r4+4|0;r19=HEAP32[r18>>2];if((r19&2048|0)==0){r20=r17}else{HEAP8[r17]=43;r20=r9+2|0}if((r19&512|0)==0){r21=r20}else{HEAP8[r20]=35;r21=r20+1|0}HEAP8[r21]=108;r20=r21+1|0;r21=r19&74;do{if((r21|0)==64){HEAP8[r20]=111}else if((r21|0)==8){if((r19&16384|0)==0){HEAP8[r20]=120;break}else{HEAP8[r20]=88;break}}else{HEAP8[r20]=117}}while(0);r20=r10|0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r19=_newlocale(1,2e3,0);HEAP32[3292]=r19}}while(0);r19=__ZNSt3__112__snprintf_lEPcjPvPKcz(r20,12,HEAP32[3292],r16,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r7>>2]=r6,r7));STACKTOP=r7;r7=r10+r19|0;r6=HEAP32[r18>>2]&176;do{if((r6|0)==16){r18=HEAP8[r20];if(r18<<24>>24==45|r18<<24>>24==43){r22=r10+1|0;break}if(!((r19|0)>1&r18<<24>>24==48)){r2=737;break}r18=HEAP8[r10+1|0];if(!(r18<<24>>24==120|r18<<24>>24==88)){r2=737;break}r22=r10+2|0}else if((r6|0)==32){r22=r7}else{r2=737}}while(0);if(r2==737){r22=r20}r2=r11|0;__ZNKSt3__18ios_base6getlocEv(r14,r4);__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r20,r22,r7,r2,r12,r13,r14);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r14>>2]|0);HEAP32[r15>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,HEAP32[r12>>2],HEAP32[r13>>2],r4,r5);STACKTOP=r8;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+112|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r9;r11=r9+8;r12=r9+32;r13=r9+80;r14=r9+88;r15=r9+96;r16=r9+104;HEAP32[r10>>2]=37;HEAP32[r10+4>>2]=0;r17=r10;r10=r17+1|0;r18=r4+4|0;r19=HEAP32[r18>>2];if((r19&2048|0)==0){r20=r10}else{HEAP8[r10]=43;r20=r17+2|0}if((r19&512|0)==0){r21=r20}else{HEAP8[r20]=35;r21=r20+1|0}HEAP8[r21]=108;HEAP8[r21+1|0]=108;r20=r21+2|0;r21=r19&74;do{if((r21|0)==64){HEAP8[r20]=111}else if((r21|0)==8){if((r19&16384|0)==0){HEAP8[r20]=120;break}else{HEAP8[r20]=88;break}}else{HEAP8[r20]=117}}while(0);r20=r11|0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r19=_newlocale(1,2e3,0);HEAP32[3292]=r19}}while(0);r19=__ZNSt3__112__snprintf_lEPcjPvPKcz(r20,23,HEAP32[3292],r17,(r8=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r8>>2]=r6,HEAP32[r8+8>>2]=r7,r8));STACKTOP=r8;r8=r11+r19|0;r7=HEAP32[r18>>2]&176;do{if((r7|0)==16){r18=HEAP8[r20];if(r18<<24>>24==45|r18<<24>>24==43){r22=r11+1|0;break}if(!((r19|0)>1&r18<<24>>24==48)){r2=762;break}r18=HEAP8[r11+1|0];if(!(r18<<24>>24==120|r18<<24>>24==88)){r2=762;break}r22=r11+2|0}else if((r7|0)==32){r22=r8}else{r2=762}}while(0);if(r2==762){r22=r20}r2=r12|0;__ZNKSt3__18ios_base6getlocEv(r15,r4);__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r20,r22,r8,r2,r13,r14,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r15>>2]|0);HEAP32[r16>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r16,r2,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);STACKTOP=r9;return}function __ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r8=r6>>2;r6=STACKTOP;STACKTOP=STACKTOP+48|0;r9=r6,r10=r9>>2;r11=r6+16,r12=r11>>2;r13=r6+32;r14=r7|0;r7=HEAP32[r14>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r12]=14528;HEAP32[r12+1]=26;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r11,260)}r11=HEAP32[3633]-1|0;r12=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r12>>2>>>0<=r11>>>0){r15=___cxa_allocate_exception(4);r16=r15;__ZNSt8bad_castC2Ev(r16);___cxa_throw(r15,9304,382)}r7=HEAP32[r12+(r11<<2)>>2];if((r7|0)==0){r15=___cxa_allocate_exception(4);r16=r15;__ZNSt8bad_castC2Ev(r16);___cxa_throw(r15,9304,382)}r15=r7;r16=HEAP32[r14>>2];if((HEAP32[3536]|0)!=-1){HEAP32[r10]=14144;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14144,r9,260)}r9=HEAP32[3537]-1|0;r10=HEAP32[r16+8>>2];if(HEAP32[r16+12>>2]-r10>>2>>>0<=r9>>>0){r17=___cxa_allocate_exception(4);r18=r17;__ZNSt8bad_castC2Ev(r18);___cxa_throw(r17,9304,382)}r16=HEAP32[r10+(r9<<2)>>2];if((r16|0)==0){r17=___cxa_allocate_exception(4);r18=r17;__ZNSt8bad_castC2Ev(r18);___cxa_throw(r17,9304,382)}r17=r16;FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+20>>2]](r13,r17);r18=r13;r9=r13;r10=HEAPU8[r9];if((r10&1|0)==0){r19=r10>>>1}else{r19=HEAP32[r13+4>>2]}do{if((r19|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+32>>2]](r15,r1,r3,r4);HEAP32[r8]=r4+(r3-r1)}else{HEAP32[r8]=r4;r10=HEAP8[r1];if(r10<<24>>24==45|r10<<24>>24==43){r14=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+28>>2]](r15,r10);r10=HEAP32[r8];HEAP32[r8]=r10+1;HEAP8[r10]=r14;r20=r1+1|0}else{r20=r1}do{if((r3-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;break}r14=r20+1|0;r10=HEAP8[r14];if(!(r10<<24>>24==120|r10<<24>>24==88)){r21=r20;break}r10=r7;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+28>>2]](r15,48);r12=HEAP32[r8];HEAP32[r8]=r12+1;HEAP8[r12]=r11;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+28>>2]](r15,HEAP8[r14]);r14=HEAP32[r8];HEAP32[r8]=r14+1;HEAP8[r14]=r11;r21=r20+2|0}else{r21=r20}}while(0);do{if((r21|0)!=(r3|0)){r11=r3-1|0;if(r21>>>0<r11>>>0){r22=r21;r23=r11}else{break}while(1){r11=HEAP8[r22];HEAP8[r22]=HEAP8[r23];HEAP8[r23]=r11;r11=r22+1|0;r14=r23-1|0;if(r11>>>0<r14>>>0){r22=r11;r23=r14}else{break}}}}while(0);r14=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+16>>2]](r17);if(r21>>>0<r3>>>0){r11=r18+1|0;r10=r7;r12=r13+4|0;r24=r13+8|0;r25=0;r26=0;r27=r21;while(1){r28=(HEAP8[r9]&1)==0;do{if((HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)==0){r29=r26;r30=r25}else{if((r25|0)!=(HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)){r29=r26;r30=r25;break}r31=HEAP32[r8];HEAP32[r8]=r31+1;HEAP8[r31]=r14;r31=HEAPU8[r9];r29=(r26>>>0<(((r31&1|0)==0?r31>>>1:HEAP32[r12>>2])-1|0)>>>0)+r26|0;r30=0}}while(0);r28=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+28>>2]](r15,HEAP8[r27]);r31=HEAP32[r8];HEAP32[r8]=r31+1;HEAP8[r31]=r28;r28=r27+1|0;if(r28>>>0<r3>>>0){r25=r30+1|0;r26=r29;r27=r28}else{break}}}r27=r4+(r21-r1)|0;r26=HEAP32[r8];if((r27|0)==(r26|0)){break}r25=r26-1|0;if(r27>>>0<r25>>>0){r32=r27;r33=r25}else{break}while(1){r25=HEAP8[r32];HEAP8[r32]=HEAP8[r33];HEAP8[r33]=r25;r25=r32+1|0;r27=r33-1|0;if(r25>>>0<r27>>>0){r32=r25;r33=r27}else{break}}}}while(0);if((r2|0)==(r3|0)){r34=HEAP32[r8];HEAP32[r5>>2]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r6;return}else{r34=r4+(r2-r1)|0;HEAP32[r5>>2]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r6;return}}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcd(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r2=0;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+152|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+40,r12=r11>>2;r13=r8+48;r14=r8+112;r15=r8+120;r16=r8+128;r17=r8+136;r18=r8+144;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r19=r9;r9=r19+1|0;r20=r4+4|0;r21=HEAP32[r20>>2];if((r21&2048|0)==0){r22=r9}else{HEAP8[r9]=43;r22=r19+2|0}if((r21&1024|0)==0){r23=r22}else{HEAP8[r22]=35;r23=r22+1|0}r22=r21&260;r9=r21>>>14;do{if((r22|0)==260){if((r9&1|0)==0){HEAP8[r23]=97;r24=0;break}else{HEAP8[r23]=65;r24=0;break}}else{HEAP8[r23]=46;r21=r23+2|0;HEAP8[r23+1|0]=42;if((r22|0)==4){if((r9&1|0)==0){HEAP8[r21]=102;r24=1;break}else{HEAP8[r21]=70;r24=1;break}}else if((r22|0)==256){if((r9&1|0)==0){HEAP8[r21]=101;r24=1;break}else{HEAP8[r21]=69;r24=1;break}}else{if((r9&1|0)==0){HEAP8[r21]=103;r24=1;break}else{HEAP8[r21]=71;r24=1;break}}}}while(0);r9=r10|0;HEAP32[r12]=r9;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r10=HEAP32[3292];if(r24){r22=__ZNSt3__112__snprintf_lEPcjPvPKcz(r9,30,r10,r19,(r7=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r7>>2]=HEAP32[r4+8>>2],HEAPF64[r7+8>>3]=r6,r7));STACKTOP=r7;r25=r22}else{r22=__ZNSt3__112__snprintf_lEPcjPvPKcz(r9,30,r10,r19,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[r7>>3]=r6,r7));STACKTOP=r7;r25=r22}do{if((r25|0)>29){r22=(HEAP8[15088]|0)==0;if(r24){do{if(r22){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r10=__ZNSt3__112__asprintf_lEPPcPvPKcz(r11,HEAP32[3292],r19,(r7=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r7>>2]=HEAP32[r4+8>>2],HEAPF64[r7+8>>3]=r6,r7));STACKTOP=r7;r26=r10}else{do{if(r22){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r22=__ZNSt3__112__asprintf_lEPPcPvPKcz(r11,HEAP32[3292],r19,(r7=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r7>>2]=HEAP32[r4+8>>2],HEAPF64[r7+8>>3]=r6,r7));STACKTOP=r7;r26=r22}r22=HEAP32[r12];if((r22|0)!=0){r27=r26;r28=r22;r29=r22;break}__ZSt17__throw_bad_allocv();r22=HEAP32[r12];r27=r26;r28=r22;r29=r22}else{r27=r25;r28=0;r29=HEAP32[r12]}}while(0);r25=r29+r27|0;r26=HEAP32[r20>>2]&176;do{if((r26|0)==16){r20=HEAP8[r29];if(r20<<24>>24==45|r20<<24>>24==43){r30=r29+1|0;break}if(!((r27|0)>1&r20<<24>>24==48)){r2=870;break}r20=HEAP8[r29+1|0];if(!(r20<<24>>24==120|r20<<24>>24==88)){r2=870;break}r30=r29+2|0}else if((r26|0)==32){r30=r25}else{r2=870}}while(0);if(r2==870){r30=r29}do{if((r29|0)==(r9|0)){r31=r13|0;r32=0;r33=r9}else{r2=_malloc(r27<<1);if((r2|0)!=0){r31=r2;r32=r2;r33=r29;break}__ZSt17__throw_bad_allocv();r31=0;r32=0;r33=HEAP32[r12]}}while(0);__ZNKSt3__18ios_base6getlocEv(r16,r4);__ZNSt3__19__num_putIcE23__widen_and_group_floatEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r33,r30,r25,r31,r14,r15,r16);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r16>>2]|0);r16=r3|0;HEAP32[r18>>2]=HEAP32[r16>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r17,r18,r31,HEAP32[r14>>2],HEAP32[r15>>2],r4,r5);r5=HEAP32[r17>>2];HEAP32[r16>>2]=r5;HEAP32[r1>>2]=r5;if((r32|0)!=0){_free(r32)}if((r28|0)==0){STACKTOP=r8;return}_free(r28);STACKTOP=r8;return}function __ZNSt3__112__asprintf_lEPPcPvPKcz(r1,r2,r3,r4){var r5,r6,r7;r5=STACKTOP;STACKTOP=STACKTOP+16|0;r6=r5;r7=r6;HEAP32[r7>>2]=r4;HEAP32[r7+4>>2]=0;r7=_uselocale(r2);r2=_vasprintf(r1,r3,r6|0);if((r7|0)==0){STACKTOP=r5;return r2}_uselocale(r7);STACKTOP=r5;return r2}function __ZNSt3__19__num_putIcE23__widen_and_group_floatEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r8=r6>>2;r6=0;r9=STACKTOP;STACKTOP=STACKTOP+48|0;r10=r9,r11=r10>>2;r12=r9+16,r13=r12>>2;r14=r9+32;r15=r7|0;r7=HEAP32[r15>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r13]=14528;HEAP32[r13+1]=26;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r12,260)}r12=HEAP32[3633]-1|0;r13=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r13>>2>>>0<=r12>>>0){r16=___cxa_allocate_exception(4);r17=r16;__ZNSt8bad_castC2Ev(r17);___cxa_throw(r16,9304,382)}r7=HEAP32[r13+(r12<<2)>>2],r12=r7>>2;if((r7|0)==0){r16=___cxa_allocate_exception(4);r17=r16;__ZNSt8bad_castC2Ev(r17);___cxa_throw(r16,9304,382)}r16=r7;r17=HEAP32[r15>>2];if((HEAP32[3536]|0)!=-1){HEAP32[r11]=14144;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14144,r10,260)}r10=HEAP32[3537]-1|0;r11=HEAP32[r17+8>>2];if(HEAP32[r17+12>>2]-r11>>2>>>0<=r10>>>0){r18=___cxa_allocate_exception(4);r19=r18;__ZNSt8bad_castC2Ev(r19);___cxa_throw(r18,9304,382)}r17=HEAP32[r11+(r10<<2)>>2],r10=r17>>2;if((r17|0)==0){r18=___cxa_allocate_exception(4);r19=r18;__ZNSt8bad_castC2Ev(r19);___cxa_throw(r18,9304,382)}r18=r17;FUNCTION_TABLE[HEAP32[HEAP32[r10]+20>>2]](r14,r18);HEAP32[r8]=r4;r17=HEAP8[r1];if(r17<<24>>24==45|r17<<24>>24==43){r19=FUNCTION_TABLE[HEAP32[HEAP32[r12]+28>>2]](r16,r17);r17=HEAP32[r8];HEAP32[r8]=r17+1;HEAP8[r17]=r19;r20=r1+1|0}else{r20=r1}r19=r3;L1129:do{if((r19-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;r6=936;break}r17=r20+1|0;r11=HEAP8[r17];if(!(r11<<24>>24==120|r11<<24>>24==88)){r21=r20;r6=936;break}r11=r7;r15=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r16,48);r13=HEAP32[r8];HEAP32[r8]=r13+1;HEAP8[r13]=r15;r15=r20+2|0;r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r16,HEAP8[r17]);r17=HEAP32[r8];HEAP32[r8]=r17+1;HEAP8[r17]=r13;r13=r15;while(1){if(r13>>>0>=r3>>>0){r22=r13;r23=r15;break L1129}r17=HEAP8[r13];do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r11=_newlocale(1,2e3,0);HEAP32[3292]=r11}}while(0);if((_isxdigit(r17<<24>>24,HEAP32[3292])|0)==0){r22=r13;r23=r15;break}else{r13=r13+1|0}}}else{r21=r20;r6=936}}while(0);L1144:do{if(r6==936){while(1){r6=0;if(r21>>>0>=r3>>>0){r22=r21;r23=r20;break L1144}r13=HEAP8[r21];do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r15=_newlocale(1,2e3,0);HEAP32[3292]=r15}}while(0);if((_isdigit(r13<<24>>24,HEAP32[3292])|0)==0){r22=r21;r23=r20;break}else{r21=r21+1|0;r6=936}}}}while(0);r6=r14;r21=r14;r20=HEAPU8[r21];if((r20&1|0)==0){r24=r20>>>1}else{r24=HEAP32[r14+4>>2]}do{if((r24|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r12]+32>>2]](r16,r23,r22,HEAP32[r8]);HEAP32[r8]=HEAP32[r8]+(r22-r23)}else{do{if((r23|0)!=(r22|0)){r20=r22-1|0;if(r23>>>0<r20>>>0){r25=r23;r26=r20}else{break}while(1){r20=HEAP8[r25];HEAP8[r25]=HEAP8[r26];HEAP8[r26]=r20;r20=r25+1|0;r17=r26-1|0;if(r20>>>0<r17>>>0){r25=r20;r26=r17}else{break}}}}while(0);r13=FUNCTION_TABLE[HEAP32[HEAP32[r10]+16>>2]](r18);if(r23>>>0<r22>>>0){r17=r6+1|0;r20=r14+4|0;r15=r14+8|0;r11=r7;r27=0;r28=0;r29=r23;while(1){r30=(HEAP8[r21]&1)==0;do{if((HEAP8[(r30?r17:HEAP32[r15>>2])+r28|0]|0)>0){if((r27|0)!=(HEAP8[(r30?r17:HEAP32[r15>>2])+r28|0]|0)){r31=r28;r32=r27;break}r33=HEAP32[r8];HEAP32[r8]=r33+1;HEAP8[r33]=r13;r33=HEAPU8[r21];r31=(r28>>>0<(((r33&1|0)==0?r33>>>1:HEAP32[r20>>2])-1|0)>>>0)+r28|0;r32=0}else{r31=r28;r32=r27}}while(0);r30=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r16,HEAP8[r29]);r33=HEAP32[r8];HEAP32[r8]=r33+1;HEAP8[r33]=r30;r30=r29+1|0;if(r30>>>0<r22>>>0){r27=r32+1|0;r28=r31;r29=r30}else{break}}}r29=r4+(r23-r1)|0;r28=HEAP32[r8];if((r29|0)==(r28|0)){break}r27=r28-1|0;if(r29>>>0<r27>>>0){r34=r29;r35=r27}else{break}while(1){r27=HEAP8[r34];HEAP8[r34]=HEAP8[r35];HEAP8[r35]=r27;r27=r34+1|0;r29=r35-1|0;if(r27>>>0<r29>>>0){r34=r27;r35=r29}else{break}}}}while(0);L1183:do{if(r22>>>0<r3>>>0){r35=r7;r34=r22;while(1){r23=HEAP8[r34];if(r23<<24>>24==46){break}r31=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+28>>2]](r16,r23);r23=HEAP32[r8];HEAP32[r8]=r23+1;HEAP8[r23]=r31;r31=r34+1|0;if(r31>>>0<r3>>>0){r34=r31}else{r36=r31;break L1183}}r35=FUNCTION_TABLE[HEAP32[HEAP32[r10]+12>>2]](r18);r31=HEAP32[r8];HEAP32[r8]=r31+1;HEAP8[r31]=r35;r36=r34+1|0}else{r36=r22}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r12]+32>>2]](r16,r36,r3,HEAP32[r8]);r16=HEAP32[r8]+(r19-r36)|0;HEAP32[r8]=r16;if((r2|0)==(r3|0)){r37=r16;HEAP32[r5>>2]=r37;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r14);STACKTOP=r9;return}r37=r4+(r2-r1)|0;HEAP32[r5>>2]=r37;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r14);STACKTOP=r9;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEce(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r2=0;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+152|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+40,r12=r11>>2;r13=r8+48;r14=r8+112;r15=r8+120;r16=r8+128;r17=r8+136;r18=r8+144;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r19=r9;r9=r19+1|0;r20=r4+4|0;r21=HEAP32[r20>>2];if((r21&2048|0)==0){r22=r9}else{HEAP8[r9]=43;r22=r19+2|0}if((r21&1024|0)==0){r23=r22}else{HEAP8[r22]=35;r23=r22+1|0}r22=r21&260;r9=r21>>>14;do{if((r22|0)==260){HEAP8[r23]=76;r21=r23+1|0;if((r9&1|0)==0){HEAP8[r21]=97;r24=0;break}else{HEAP8[r21]=65;r24=0;break}}else{HEAP8[r23]=46;HEAP8[r23+1|0]=42;HEAP8[r23+2|0]=76;r21=r23+3|0;if((r22|0)==4){if((r9&1|0)==0){HEAP8[r21]=102;r24=1;break}else{HEAP8[r21]=70;r24=1;break}}else if((r22|0)==256){if((r9&1|0)==0){HEAP8[r21]=101;r24=1;break}else{HEAP8[r21]=69;r24=1;break}}else{if((r9&1|0)==0){HEAP8[r21]=103;r24=1;break}else{HEAP8[r21]=71;r24=1;break}}}}while(0);r9=r10|0;HEAP32[r12]=r9;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r10=HEAP32[3292];if(r24){r22=__ZNSt3__112__snprintf_lEPcjPvPKcz(r9,30,r10,r19,(r7=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r7>>2]=HEAP32[r4+8>>2],HEAPF64[r7+8>>3]=r6,r7));STACKTOP=r7;r25=r22}else{r22=__ZNSt3__112__snprintf_lEPcjPvPKcz(r9,30,r10,r19,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[r7>>3]=r6,r7));STACKTOP=r7;r25=r22}do{if((r25|0)>29){r22=(HEAP8[15088]|0)==0;if(r24){do{if(r22){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r10=__ZNSt3__112__asprintf_lEPPcPvPKcz(r11,HEAP32[3292],r19,(r7=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r7>>2]=HEAP32[r4+8>>2],HEAPF64[r7+8>>3]=r6,r7));STACKTOP=r7;r26=r10}else{do{if(r22){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r22=__ZNSt3__112__asprintf_lEPPcPvPKcz(r11,HEAP32[3292],r19,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[r7>>3]=r6,r7));STACKTOP=r7;r26=r22}r22=HEAP32[r12];if((r22|0)!=0){r27=r26;r28=r22;r29=r22;break}__ZSt17__throw_bad_allocv();r22=HEAP32[r12];r27=r26;r28=r22;r29=r22}else{r27=r25;r28=0;r29=HEAP32[r12]}}while(0);r25=r29+r27|0;r26=HEAP32[r20>>2]&176;do{if((r26|0)==32){r30=r25}else if((r26|0)==16){r20=HEAP8[r29];if(r20<<24>>24==45|r20<<24>>24==43){r30=r29+1|0;break}if(!((r27|0)>1&r20<<24>>24==48)){r2=1033;break}r20=HEAP8[r29+1|0];if(!(r20<<24>>24==120|r20<<24>>24==88)){r2=1033;break}r30=r29+2|0}else{r2=1033}}while(0);if(r2==1033){r30=r29}do{if((r29|0)==(r9|0)){r31=r13|0;r32=0;r33=r9}else{r2=_malloc(r27<<1);if((r2|0)!=0){r31=r2;r32=r2;r33=r29;break}__ZSt17__throw_bad_allocv();r31=0;r32=0;r33=HEAP32[r12]}}while(0);__ZNKSt3__18ios_base6getlocEv(r16,r4);__ZNSt3__19__num_putIcE23__widen_and_group_floatEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r33,r30,r25,r31,r14,r15,r16);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r16>>2]|0);r16=r3|0;HEAP32[r18>>2]=HEAP32[r16>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r17,r18,r31,HEAP32[r14>>2],HEAP32[r15>>2],r4,r5);r5=HEAP32[r17>>2];HEAP32[r16>>2]=r5;HEAP32[r1>>2]=r5;if((r32|0)!=0){_free(r32)}if((r28|0)==0){STACKTOP=r8;return}_free(r28);STACKTOP=r8;return}function __ZNSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwl(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+144|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+24;r12=r8+112;r13=r8+120;r14=r8+128;r15=r8+136;r16=r9|0;HEAP8[r16]=HEAP8[3264];HEAP8[r16+1|0]=HEAP8[3265|0];HEAP8[r16+2|0]=HEAP8[3266|0];HEAP8[r16+3|0]=HEAP8[3267|0];HEAP8[r16+4|0]=HEAP8[3268|0];HEAP8[r16+5|0]=HEAP8[3269|0];r17=r9+1|0;r18=r4+4|0;r19=HEAP32[r18>>2];if((r19&2048|0)==0){r20=r17}else{HEAP8[r17]=43;r20=r9+2|0}if((r19&512|0)==0){r21=r20}else{HEAP8[r20]=35;r21=r20+1|0}HEAP8[r21]=108;r20=r21+1|0;r21=r19&74;do{if((r21|0)==64){HEAP8[r20]=111}else if((r21|0)==8){if((r19&16384|0)==0){HEAP8[r20]=120;break}else{HEAP8[r20]=88;break}}else{HEAP8[r20]=100}}while(0);r20=r10|0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r19=_newlocale(1,2e3,0);HEAP32[3292]=r19}}while(0);r19=__ZNSt3__112__snprintf_lEPcjPvPKcz(r20,12,HEAP32[3292],r16,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r7>>2]=r6,r7));STACKTOP=r7;r7=r10+r19|0;r6=HEAP32[r18>>2]&176;do{if((r6|0)==32){r22=r7}else if((r6|0)==16){r18=HEAP8[r20];if(r18<<24>>24==45|r18<<24>>24==43){r22=r10+1|0;break}if(!((r19|0)>1&r18<<24>>24==48)){r2=1078;break}r18=HEAP8[r10+1|0];if(!(r18<<24>>24==120|r18<<24>>24==88)){r2=1078;break}r22=r10+2|0}else{r2=1078}}while(0);if(r2==1078){r22=r20}r2=r11|0;__ZNKSt3__18ios_base6getlocEv(r14,r4);__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r20,r22,r7,r2,r12,r13,r14);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r14>>2]|0);HEAP32[r15>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,HEAP32[r12>>2],HEAP32[r13>>2],r4,r5);STACKTOP=r8;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPKv(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+104|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+24;r12=r8+48;r13=r8+88;r14=r8+96;r15=r8+16|0;HEAP8[r15]=HEAP8[3272];HEAP8[r15+1|0]=HEAP8[3273|0];HEAP8[r15+2|0]=HEAP8[3274|0];HEAP8[r15+3|0]=HEAP8[3275|0];HEAP8[r15+4|0]=HEAP8[3276|0];HEAP8[r15+5|0]=HEAP8[3277|0];r16=r11|0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r17=_newlocale(1,2e3,0);HEAP32[3292]=r17}}while(0);r17=__ZNSt3__112__snprintf_lEPcjPvPKcz(r16,20,HEAP32[3292],r15,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r7>>2]=r6,r7));STACKTOP=r7;r7=r11+r17|0;r6=HEAP32[r4+4>>2]&176;do{if((r6|0)==16){r15=HEAP8[r16];if(r15<<24>>24==45|r15<<24>>24==43){r18=r11+1|0;break}if(!((r17|0)>1&r15<<24>>24==48)){r2=1093;break}r15=HEAP8[r11+1|0];if(!(r15<<24>>24==120|r15<<24>>24==88)){r2=1093;break}r18=r11+2|0}else if((r6|0)==32){r18=r7}else{r2=1093}}while(0);if(r2==1093){r18=r16}__ZNKSt3__18ios_base6getlocEv(r13,r4);r2=r13|0;r13=HEAP32[r2>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r10]=14528;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r9,260)}r9=HEAP32[3633]-1|0;r10=HEAP32[r13+8>>2];do{if(HEAP32[r13+12>>2]-r10>>2>>>0>r9>>>0){r6=HEAP32[r10+(r9<<2)>>2];if((r6|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2>>2]|0);r15=r12|0;FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+32>>2]](r6,r16,r7,r15);r6=r12+r17|0;if((r18|0)==(r7|0)){r19=r6;r20=r3|0;r21=HEAP32[r20>>2];r22=r14|0;HEAP32[r22>>2]=r21;__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r15,r19,r6,r4,r5);STACKTOP=r8;return}r19=r12+(r18-r11)|0;r20=r3|0;r21=HEAP32[r20>>2];r22=r14|0;HEAP32[r22>>2]=r21;__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r15,r19,r6,r4,r5);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwb(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r7=STACKTOP;STACKTOP=STACKTOP+48|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7,r9=r8>>2;r10=r7+16;r11=r7+24;r12=r7+32;if((HEAP32[r4+4>>2]&1|0)==0){r13=HEAP32[HEAP32[r2>>2]+24>>2];HEAP32[r10>>2]=HEAP32[r3>>2];FUNCTION_TABLE[r13](r1,r2,r10,r4,r5,r6&1);STACKTOP=r7;return}__ZNKSt3__18ios_base6getlocEv(r11,r4);r4=r11|0;r11=HEAP32[r4>>2];if((HEAP32[3534]|0)!=-1){HEAP32[r9]=14136;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14136,r8,260)}r8=HEAP32[3535]-1|0;r9=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r9>>2>>>0>r8>>>0){r5=HEAP32[r9+(r8<<2)>>2];if((r5|0)==0){break}r10=r5;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r4>>2]|0);r2=HEAP32[r5>>2];if(r6){FUNCTION_TABLE[HEAP32[r2+24>>2]](r12,r10)}else{FUNCTION_TABLE[HEAP32[r2+28>>2]](r12,r10)}r10=r12;r2=HEAP8[r10];if((r2&1)==0){r5=r12+4|0;r14=r5;r15=r5;r16=r12+8|0}else{r5=r12+8|0;r14=HEAP32[r5>>2];r15=r12+4|0;r16=r5}r5=(r3|0)>>2;r13=r14;r17=r2;while(1){if((r17&1)==0){r18=r15}else{r18=HEAP32[r16>>2]}r2=r17&255;if((r2&1|0)==0){r19=r2>>>1}else{r19=HEAP32[r15>>2]}if((r13|0)==((r19<<2)+r18|0)){break}r2=HEAP32[r13>>2];r20=HEAP32[r5];do{if((r20|0)!=0){r21=r20+24|0;r22=HEAP32[r21>>2];if((r22|0)==(HEAP32[r20+28>>2]|0)){r23=FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+52>>2]](r20,r2)}else{HEAP32[r21>>2]=r22+4;HEAP32[r22>>2]=r2;r23=r2}if((r23|0)!=-1){break}HEAP32[r5]=0}}while(0);r13=r13+4|0;r17=HEAP8[r10]}HEAP32[r1>>2]=HEAP32[r5];__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r12);STACKTOP=r7;return}}while(0);r7=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r7);___cxa_throw(r7,9304,382)}function __ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16;r8=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r9>>2];r9=r1;r10=(r2|0)>>2;r2=HEAP32[r10],r11=r2>>2;if((r2|0)==0){HEAP32[r8]=0;STACKTOP=r1;return}r12=r5;r5=r3;r13=r12-r5>>2;r14=r6+12|0;r6=HEAP32[r14>>2];r15=(r6|0)>(r13|0)?r6-r13|0:0;r13=r4;r6=r13-r5|0;r5=r6>>2;do{if((r6|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r3,r5)|0)==(r5|0)){break}HEAP32[r10]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);do{if((r15|0)>0){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEjw(r9,r15,r7);if((HEAP8[r9]&1)==0){r16=r9+4|0}else{r16=HEAP32[r9+8>>2]}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r16,r15)|0)==(r15|0)){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r9);break}HEAP32[r10]=0;HEAP32[r8]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r9);STACKTOP=r1;return}}while(0);r9=r12-r13|0;r13=r9>>2;do{if((r9|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+48>>2]](r2,r4,r13)|0)==(r13|0)){break}HEAP32[r10]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);HEAP32[r14>>2]=0;HEAP32[r8]=r2;STACKTOP=r1;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+232|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r9;r11=r9+8;r12=r9+32;r13=r9+200;r14=r9+208;r15=r9+216;r16=r9+224;HEAP32[r10>>2]=37;HEAP32[r10+4>>2]=0;r17=r10;r10=r17+1|0;r18=r4+4|0;r19=HEAP32[r18>>2];if((r19&2048|0)==0){r20=r10}else{HEAP8[r10]=43;r20=r17+2|0}if((r19&512|0)==0){r21=r20}else{HEAP8[r20]=35;r21=r20+1|0}HEAP8[r21]=108;HEAP8[r21+1|0]=108;r20=r21+2|0;r21=r19&74;do{if((r21|0)==64){HEAP8[r20]=111}else if((r21|0)==8){if((r19&16384|0)==0){HEAP8[r20]=120;break}else{HEAP8[r20]=88;break}}else{HEAP8[r20]=100}}while(0);r20=r11|0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r19=_newlocale(1,2e3,0);HEAP32[3292]=r19}}while(0);r19=__ZNSt3__112__snprintf_lEPcjPvPKcz(r20,22,HEAP32[3292],r17,(r8=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r8>>2]=r6,HEAP32[r8+8>>2]=r7,r8));STACKTOP=r8;r8=r11+r19|0;r7=HEAP32[r18>>2]&176;do{if((r7|0)==16){r18=HEAP8[r20];if(r18<<24>>24==45|r18<<24>>24==43){r22=r11+1|0;break}if(!((r19|0)>1&r18<<24>>24==48)){r2=1186;break}r18=HEAP8[r11+1|0];if(!(r18<<24>>24==120|r18<<24>>24==88)){r2=1186;break}r22=r11+2|0}else if((r7|0)==32){r22=r8}else{r2=1186}}while(0);if(r2==1186){r22=r20}r2=r12|0;__ZNKSt3__18ios_base6getlocEv(r15,r4);__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r20,r22,r8,r2,r13,r14,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r15>>2]|0);HEAP32[r16>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r16,r2,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);STACKTOP=r9;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwm(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+144|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+24;r12=r8+112;r13=r8+120;r14=r8+128;r15=r8+136;r16=r9|0;HEAP8[r16]=HEAP8[3264];HEAP8[r16+1|0]=HEAP8[3265|0];HEAP8[r16+2|0]=HEAP8[3266|0];HEAP8[r16+3|0]=HEAP8[3267|0];HEAP8[r16+4|0]=HEAP8[3268|0];HEAP8[r16+5|0]=HEAP8[3269|0];r17=r9+1|0;r18=r4+4|0;r19=HEAP32[r18>>2];if((r19&2048|0)==0){r20=r17}else{HEAP8[r17]=43;r20=r9+2|0}if((r19&512|0)==0){r21=r20}else{HEAP8[r20]=35;r21=r20+1|0}HEAP8[r21]=108;r20=r21+1|0;r21=r19&74;do{if((r21|0)==64){HEAP8[r20]=111}else if((r21|0)==8){if((r19&16384|0)==0){HEAP8[r20]=120;break}else{HEAP8[r20]=88;break}}else{HEAP8[r20]=117}}while(0);r20=r10|0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r19=_newlocale(1,2e3,0);HEAP32[3292]=r19}}while(0);r19=__ZNSt3__112__snprintf_lEPcjPvPKcz(r20,12,HEAP32[3292],r16,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r7>>2]=r6,r7));STACKTOP=r7;r7=r10+r19|0;r6=HEAP32[r18>>2]&176;do{if((r6|0)==32){r22=r7}else if((r6|0)==16){r18=HEAP8[r20];if(r18<<24>>24==45|r18<<24>>24==43){r22=r10+1|0;break}if(!((r19|0)>1&r18<<24>>24==48)){r2=1211;break}r18=HEAP8[r10+1|0];if(!(r18<<24>>24==120|r18<<24>>24==88)){r2=1211;break}r22=r10+2|0}else{r2=1211}}while(0);if(r2==1211){r22=r20}r2=r11|0;__ZNKSt3__18ios_base6getlocEv(r14,r4);__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r20,r22,r7,r2,r12,r13,r14);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r14>>2]|0);HEAP32[r15>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,HEAP32[r12>>2],HEAP32[r13>>2],r4,r5);STACKTOP=r8;return}function __ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r8=r6>>2;r6=STACKTOP;STACKTOP=STACKTOP+48|0;r9=r6,r10=r9>>2;r11=r6+16,r12=r11>>2;r13=r6+32;r14=r7|0;r7=HEAP32[r14>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r12]=14520;HEAP32[r12+1]=26;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r11,260)}r11=HEAP32[3631]-1|0;r12=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r12>>2>>>0<=r11>>>0){r15=___cxa_allocate_exception(4);r16=r15;__ZNSt8bad_castC2Ev(r16);___cxa_throw(r15,9304,382)}r7=HEAP32[r12+(r11<<2)>>2];if((r7|0)==0){r15=___cxa_allocate_exception(4);r16=r15;__ZNSt8bad_castC2Ev(r16);___cxa_throw(r15,9304,382)}r15=r7;r16=HEAP32[r14>>2];if((HEAP32[3534]|0)!=-1){HEAP32[r10]=14136;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14136,r9,260)}r9=HEAP32[3535]-1|0;r10=HEAP32[r16+8>>2];if(HEAP32[r16+12>>2]-r10>>2>>>0<=r9>>>0){r17=___cxa_allocate_exception(4);r18=r17;__ZNSt8bad_castC2Ev(r18);___cxa_throw(r17,9304,382)}r16=HEAP32[r10+(r9<<2)>>2];if((r16|0)==0){r17=___cxa_allocate_exception(4);r18=r17;__ZNSt8bad_castC2Ev(r18);___cxa_throw(r17,9304,382)}r17=r16;FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+20>>2]](r13,r17);r18=r13;r9=r13;r10=HEAPU8[r9];if((r10&1|0)==0){r19=r10>>>1}else{r19=HEAP32[r13+4>>2]}do{if((r19|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+48>>2]](r15,r1,r3,r4);HEAP32[r8]=(r3-r1<<2)+r4}else{HEAP32[r8]=r4;r10=HEAP8[r1];if(r10<<24>>24==45|r10<<24>>24==43){r14=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+44>>2]](r15,r10);r10=HEAP32[r8];HEAP32[r8]=r10+4;HEAP32[r10>>2]=r14;r20=r1+1|0}else{r20=r1}do{if((r3-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;break}r14=r20+1|0;r10=HEAP8[r14];if(!(r10<<24>>24==120|r10<<24>>24==88)){r21=r20;break}r10=r7;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+44>>2]](r15,48);r12=HEAP32[r8];HEAP32[r8]=r12+4;HEAP32[r12>>2]=r11;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+44>>2]](r15,HEAP8[r14]);r14=HEAP32[r8];HEAP32[r8]=r14+4;HEAP32[r14>>2]=r11;r21=r20+2|0}else{r21=r20}}while(0);do{if((r21|0)!=(r3|0)){r11=r3-1|0;if(r21>>>0<r11>>>0){r22=r21;r23=r11}else{break}while(1){r11=HEAP8[r22];HEAP8[r22]=HEAP8[r23];HEAP8[r23]=r11;r11=r22+1|0;r14=r23-1|0;if(r11>>>0<r14>>>0){r22=r11;r23=r14}else{break}}}}while(0);r14=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+16>>2]](r17);if(r21>>>0<r3>>>0){r11=r18+1|0;r10=r7;r12=r13+4|0;r24=r13+8|0;r25=0;r26=0;r27=r21;while(1){r28=(HEAP8[r9]&1)==0;do{if((HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)==0){r29=r26;r30=r25}else{if((r25|0)!=(HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)){r29=r26;r30=r25;break}r31=HEAP32[r8];HEAP32[r8]=r31+4;HEAP32[r31>>2]=r14;r31=HEAPU8[r9];r29=(r26>>>0<(((r31&1|0)==0?r31>>>1:HEAP32[r12>>2])-1|0)>>>0)+r26|0;r30=0}}while(0);r28=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+44>>2]](r15,HEAP8[r27]);r31=HEAP32[r8];HEAP32[r8]=r31+4;HEAP32[r31>>2]=r28;r28=r27+1|0;if(r28>>>0<r3>>>0){r25=r30+1|0;r26=r29;r27=r28}else{break}}}r27=(r21-r1<<2)+r4|0;r26=HEAP32[r8];if((r27|0)==(r26|0)){break}r25=r26-4|0;if(r27>>>0<r25>>>0){r32=r27;r33=r25}else{break}while(1){r25=HEAP32[r32>>2];HEAP32[r32>>2]=HEAP32[r33>>2];HEAP32[r33>>2]=r25;r25=r32+4|0;r27=r33-4|0;if(r25>>>0<r27>>>0){r32=r25;r33=r27}else{break}}}}while(0);if((r2|0)==(r3|0)){r34=HEAP32[r8];HEAP32[r5>>2]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r6;return}else{r34=(r2-r1<<2)+r4|0;HEAP32[r5>>2]=r34;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r13);STACKTOP=r6;return}}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+240|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r9;r11=r9+8;r12=r9+32;r13=r9+208;r14=r9+216;r15=r9+224;r16=r9+232;HEAP32[r10>>2]=37;HEAP32[r10+4>>2]=0;r17=r10;r10=r17+1|0;r18=r4+4|0;r19=HEAP32[r18>>2];if((r19&2048|0)==0){r20=r10}else{HEAP8[r10]=43;r20=r17+2|0}if((r19&512|0)==0){r21=r20}else{HEAP8[r20]=35;r21=r20+1|0}HEAP8[r21]=108;HEAP8[r21+1|0]=108;r20=r21+2|0;r21=r19&74;do{if((r21|0)==64){HEAP8[r20]=111}else if((r21|0)==8){if((r19&16384|0)==0){HEAP8[r20]=120;break}else{HEAP8[r20]=88;break}}else{HEAP8[r20]=117}}while(0);r20=r11|0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r19=_newlocale(1,2e3,0);HEAP32[3292]=r19}}while(0);r19=__ZNSt3__112__snprintf_lEPcjPvPKcz(r20,23,HEAP32[3292],r17,(r8=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r8>>2]=r6,HEAP32[r8+8>>2]=r7,r8));STACKTOP=r8;r8=r11+r19|0;r7=HEAP32[r18>>2]&176;do{if((r7|0)==16){r18=HEAP8[r20];if(r18<<24>>24==45|r18<<24>>24==43){r22=r11+1|0;break}if(!((r19|0)>1&r18<<24>>24==48)){r2=1288;break}r18=HEAP8[r11+1|0];if(!(r18<<24>>24==120|r18<<24>>24==88)){r2=1288;break}r22=r11+2|0}else if((r7|0)==32){r22=r8}else{r2=1288}}while(0);if(r2==1288){r22=r20}r2=r12|0;__ZNKSt3__18ios_base6getlocEv(r15,r4);__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r20,r22,r8,r2,r13,r14,r15);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r15>>2]|0);HEAP32[r16>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r16,r2,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);STACKTOP=r9;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwd(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r2=0;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+320|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+40,r12=r11>>2;r13=r8+48;r14=r8+280;r15=r8+288;r16=r8+296;r17=r8+304;r18=r8+312;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r19=r9;r9=r19+1|0;r20=r4+4|0;r21=HEAP32[r20>>2];if((r21&2048|0)==0){r22=r9}else{HEAP8[r9]=43;r22=r19+2|0}if((r21&1024|0)==0){r23=r22}else{HEAP8[r22]=35;r23=r22+1|0}r22=r21&260;r9=r21>>>14;do{if((r22|0)==260){if((r9&1|0)==0){HEAP8[r23]=97;r24=0;break}else{HEAP8[r23]=65;r24=0;break}}else{HEAP8[r23]=46;r21=r23+2|0;HEAP8[r23+1|0]=42;if((r22|0)==4){if((r9&1|0)==0){HEAP8[r21]=102;r24=1;break}else{HEAP8[r21]=70;r24=1;break}}else if((r22|0)==256){if((r9&1|0)==0){HEAP8[r21]=101;r24=1;break}else{HEAP8[r21]=69;r24=1;break}}else{if((r9&1|0)==0){HEAP8[r21]=103;r24=1;break}else{HEAP8[r21]=71;r24=1;break}}}}while(0);r9=r10|0;HEAP32[r12]=r9;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r10=HEAP32[3292];if(r24){r22=__ZNSt3__112__snprintf_lEPcjPvPKcz(r9,30,r10,r19,(r7=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r7>>2]=HEAP32[r4+8>>2],HEAPF64[r7+8>>3]=r6,r7));STACKTOP=r7;r25=r22}else{r22=__ZNSt3__112__snprintf_lEPcjPvPKcz(r9,30,r10,r19,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[r7>>3]=r6,r7));STACKTOP=r7;r25=r22}do{if((r25|0)>29){r22=(HEAP8[15088]|0)==0;if(r24){do{if(r22){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r10=__ZNSt3__112__asprintf_lEPPcPvPKcz(r11,HEAP32[3292],r19,(r7=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r7>>2]=HEAP32[r4+8>>2],HEAPF64[r7+8>>3]=r6,r7));STACKTOP=r7;r26=r10}else{do{if(r22){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r22=__ZNSt3__112__asprintf_lEPPcPvPKcz(r11,HEAP32[3292],r19,(r7=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r7>>2]=HEAP32[r4+8>>2],HEAPF64[r7+8>>3]=r6,r7));STACKTOP=r7;r26=r22}r22=HEAP32[r12];if((r22|0)!=0){r27=r26;r28=r22;r29=r22;break}__ZSt17__throw_bad_allocv();r22=HEAP32[r12];r27=r26;r28=r22;r29=r22}else{r27=r25;r28=0;r29=HEAP32[r12]}}while(0);r25=r29+r27|0;r26=HEAP32[r20>>2]&176;do{if((r26|0)==32){r30=r25}else if((r26|0)==16){r20=HEAP8[r29];if(r20<<24>>24==45|r20<<24>>24==43){r30=r29+1|0;break}if(!((r27|0)>1&r20<<24>>24==48)){r2=1344;break}r20=HEAP8[r29+1|0];if(!(r20<<24>>24==120|r20<<24>>24==88)){r2=1344;break}r30=r29+2|0}else{r2=1344}}while(0);if(r2==1344){r30=r29}do{if((r29|0)==(r9|0)){r31=r13|0;r32=0;r33=r9}else{r2=_malloc(r27<<3);r26=r2;if((r2|0)!=0){r31=r26;r32=r26;r33=r29;break}__ZSt17__throw_bad_allocv();r31=r26;r32=r26;r33=HEAP32[r12]}}while(0);__ZNKSt3__18ios_base6getlocEv(r16,r4);__ZNSt3__19__num_putIwE23__widen_and_group_floatEPcS2_S2_PwRS3_S4_RKNS_6localeE(r33,r30,r25,r31,r14,r15,r16);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r16>>2]|0);r16=r3|0;HEAP32[r18>>2]=HEAP32[r16>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r17,r18,r31,HEAP32[r14>>2],HEAP32[r15>>2],r4,r5);r5=HEAP32[r17>>2];HEAP32[r16>>2]=r5;HEAP32[r1>>2]=r5;if((r32|0)!=0){_free(r32)}if((r28|0)==0){STACKTOP=r8;return}_free(r28);STACKTOP=r8;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwe(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r2=0;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+320|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+40,r12=r11>>2;r13=r8+48;r14=r8+280;r15=r8+288;r16=r8+296;r17=r8+304;r18=r8+312;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r19=r9;r9=r19+1|0;r20=r4+4|0;r21=HEAP32[r20>>2];if((r21&2048|0)==0){r22=r9}else{HEAP8[r9]=43;r22=r19+2|0}if((r21&1024|0)==0){r23=r22}else{HEAP8[r22]=35;r23=r22+1|0}r22=r21&260;r9=r21>>>14;do{if((r22|0)==260){HEAP8[r23]=76;r21=r23+1|0;if((r9&1|0)==0){HEAP8[r21]=97;r24=0;break}else{HEAP8[r21]=65;r24=0;break}}else{HEAP8[r23]=46;HEAP8[r23+1|0]=42;HEAP8[r23+2|0]=76;r21=r23+3|0;if((r22|0)==4){if((r9&1|0)==0){HEAP8[r21]=102;r24=1;break}else{HEAP8[r21]=70;r24=1;break}}else if((r22|0)==256){if((r9&1|0)==0){HEAP8[r21]=101;r24=1;break}else{HEAP8[r21]=69;r24=1;break}}else{if((r9&1|0)==0){HEAP8[r21]=103;r24=1;break}else{HEAP8[r21]=71;r24=1;break}}}}while(0);r9=r10|0;HEAP32[r12]=r9;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r10=HEAP32[3292];if(r24){r22=__ZNSt3__112__snprintf_lEPcjPvPKcz(r9,30,r10,r19,(r7=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r7>>2]=HEAP32[r4+8>>2],HEAPF64[r7+8>>3]=r6,r7));STACKTOP=r7;r25=r22}else{r22=__ZNSt3__112__snprintf_lEPcjPvPKcz(r9,30,r10,r19,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[r7>>3]=r6,r7));STACKTOP=r7;r25=r22}do{if((r25|0)>29){r22=(HEAP8[15088]|0)==0;if(r24){do{if(r22){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r10=__ZNSt3__112__asprintf_lEPPcPvPKcz(r11,HEAP32[3292],r19,(r7=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r7>>2]=HEAP32[r4+8>>2],HEAPF64[r7+8>>3]=r6,r7));STACKTOP=r7;r26=r10}else{do{if(r22){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);r22=__ZNSt3__112__asprintf_lEPPcPvPKcz(r11,HEAP32[3292],r19,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[r7>>3]=r6,r7));STACKTOP=r7;r26=r22}r22=HEAP32[r12];if((r22|0)!=0){r27=r26;r28=r22;r29=r22;break}__ZSt17__throw_bad_allocv();r22=HEAP32[r12];r27=r26;r28=r22;r29=r22}else{r27=r25;r28=0;r29=HEAP32[r12]}}while(0);r25=r29+r27|0;r26=HEAP32[r20>>2]&176;do{if((r26|0)==16){r20=HEAP8[r29];if(r20<<24>>24==45|r20<<24>>24==43){r30=r29+1|0;break}if(!((r27|0)>1&r20<<24>>24==48)){r2=1418;break}r20=HEAP8[r29+1|0];if(!(r20<<24>>24==120|r20<<24>>24==88)){r2=1418;break}r30=r29+2|0}else if((r26|0)==32){r30=r25}else{r2=1418}}while(0);if(r2==1418){r30=r29}do{if((r29|0)==(r9|0)){r31=r13|0;r32=0;r33=r9}else{r2=_malloc(r27<<3);r26=r2;if((r2|0)!=0){r31=r26;r32=r26;r33=r29;break}__ZSt17__throw_bad_allocv();r31=r26;r32=r26;r33=HEAP32[r12]}}while(0);__ZNKSt3__18ios_base6getlocEv(r16,r4);__ZNSt3__19__num_putIwE23__widen_and_group_floatEPcS2_S2_PwRS3_S4_RKNS_6localeE(r33,r30,r25,r31,r14,r15,r16);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r16>>2]|0);r16=r3|0;HEAP32[r18>>2]=HEAP32[r16>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r17,r18,r31,HEAP32[r14>>2],HEAP32[r15>>2],r4,r5);r5=HEAP32[r17>>2];HEAP32[r16>>2]=r5;HEAP32[r1>>2]=r5;if((r32|0)!=0){_free(r32)}if((r28|0)==0){STACKTOP=r8;return}_free(r28);STACKTOP=r8;return}function __ZNSt3__19__num_putIwE23__widen_and_group_floatEPcS2_S2_PwRS3_S4_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r8=r6>>2;r6=0;r9=STACKTOP;STACKTOP=STACKTOP+48|0;r10=r9,r11=r10>>2;r12=r9+16,r13=r12>>2;r14=r9+32;r15=r7|0;r7=HEAP32[r15>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r13]=14520;HEAP32[r13+1]=26;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r12,260)}r12=HEAP32[3631]-1|0;r13=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r13>>2>>>0<=r12>>>0){r16=___cxa_allocate_exception(4);r17=r16;__ZNSt8bad_castC2Ev(r17);___cxa_throw(r16,9304,382)}r7=HEAP32[r13+(r12<<2)>>2],r12=r7>>2;if((r7|0)==0){r16=___cxa_allocate_exception(4);r17=r16;__ZNSt8bad_castC2Ev(r17);___cxa_throw(r16,9304,382)}r16=r7;r17=HEAP32[r15>>2];if((HEAP32[3534]|0)!=-1){HEAP32[r11]=14136;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14136,r10,260)}r10=HEAP32[3535]-1|0;r11=HEAP32[r17+8>>2];if(HEAP32[r17+12>>2]-r11>>2>>>0<=r10>>>0){r18=___cxa_allocate_exception(4);r19=r18;__ZNSt8bad_castC2Ev(r19);___cxa_throw(r18,9304,382)}r17=HEAP32[r11+(r10<<2)>>2],r10=r17>>2;if((r17|0)==0){r18=___cxa_allocate_exception(4);r19=r18;__ZNSt8bad_castC2Ev(r19);___cxa_throw(r18,9304,382)}r18=r17;FUNCTION_TABLE[HEAP32[HEAP32[r10]+20>>2]](r14,r18);HEAP32[r8]=r4;r17=HEAP8[r1];if(r17<<24>>24==45|r17<<24>>24==43){r19=FUNCTION_TABLE[HEAP32[HEAP32[r12]+44>>2]](r16,r17);r17=HEAP32[r8];HEAP32[r8]=r17+4;HEAP32[r17>>2]=r19;r20=r1+1|0}else{r20=r1}r19=r3;L1749:do{if((r19-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;r6=1473;break}r17=r20+1|0;r11=HEAP8[r17];if(!(r11<<24>>24==120|r11<<24>>24==88)){r21=r20;r6=1473;break}r11=r7;r15=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+44>>2]](r16,48);r13=HEAP32[r8];HEAP32[r8]=r13+4;HEAP32[r13>>2]=r15;r15=r20+2|0;r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+44>>2]](r16,HEAP8[r17]);r17=HEAP32[r8];HEAP32[r8]=r17+4;HEAP32[r17>>2]=r13;r13=r15;while(1){if(r13>>>0>=r3>>>0){r22=r13;r23=r15;break L1749}r17=HEAP8[r13];do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r11=_newlocale(1,2e3,0);HEAP32[3292]=r11}}while(0);if((_isxdigit(r17<<24>>24,HEAP32[3292])|0)==0){r22=r13;r23=r15;break}else{r13=r13+1|0}}}else{r21=r20;r6=1473}}while(0);L1764:do{if(r6==1473){while(1){r6=0;if(r21>>>0>=r3>>>0){r22=r21;r23=r20;break L1764}r13=HEAP8[r21];do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r15=_newlocale(1,2e3,0);HEAP32[3292]=r15}}while(0);if((_isdigit(r13<<24>>24,HEAP32[3292])|0)==0){r22=r21;r23=r20;break}else{r21=r21+1|0;r6=1473}}}}while(0);r6=r14;r21=r14;r20=HEAPU8[r21];if((r20&1|0)==0){r24=r20>>>1}else{r24=HEAP32[r14+4>>2]}do{if((r24|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r12]+48>>2]](r16,r23,r22,HEAP32[r8]);HEAP32[r8]=(r22-r23<<2)+HEAP32[r8]}else{do{if((r23|0)!=(r22|0)){r20=r22-1|0;if(r23>>>0<r20>>>0){r25=r23;r26=r20}else{break}while(1){r20=HEAP8[r25];HEAP8[r25]=HEAP8[r26];HEAP8[r26]=r20;r20=r25+1|0;r17=r26-1|0;if(r20>>>0<r17>>>0){r25=r20;r26=r17}else{break}}}}while(0);r13=FUNCTION_TABLE[HEAP32[HEAP32[r10]+16>>2]](r18);if(r23>>>0<r22>>>0){r17=r6+1|0;r20=r14+4|0;r15=r14+8|0;r11=r7;r27=0;r28=0;r29=r23;while(1){r30=(HEAP8[r21]&1)==0;do{if((HEAP8[(r30?r17:HEAP32[r15>>2])+r28|0]|0)>0){if((r27|0)!=(HEAP8[(r30?r17:HEAP32[r15>>2])+r28|0]|0)){r31=r28;r32=r27;break}r33=HEAP32[r8];HEAP32[r8]=r33+4;HEAP32[r33>>2]=r13;r33=HEAPU8[r21];r31=(r28>>>0<(((r33&1|0)==0?r33>>>1:HEAP32[r20>>2])-1|0)>>>0)+r28|0;r32=0}else{r31=r28;r32=r27}}while(0);r30=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+44>>2]](r16,HEAP8[r29]);r33=HEAP32[r8];HEAP32[r8]=r33+4;HEAP32[r33>>2]=r30;r30=r29+1|0;if(r30>>>0<r22>>>0){r27=r32+1|0;r28=r31;r29=r30}else{break}}}r29=(r23-r1<<2)+r4|0;r28=HEAP32[r8];if((r29|0)==(r28|0)){break}r27=r28-4|0;if(r29>>>0<r27>>>0){r34=r29;r35=r27}else{break}while(1){r27=HEAP32[r34>>2];HEAP32[r34>>2]=HEAP32[r35>>2];HEAP32[r35>>2]=r27;r27=r34+4|0;r29=r35-4|0;if(r27>>>0<r29>>>0){r34=r27;r35=r29}else{break}}}}while(0);L1803:do{if(r22>>>0<r3>>>0){r35=r7;r34=r22;while(1){r23=HEAP8[r34];if(r23<<24>>24==46){break}r31=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+44>>2]](r16,r23);r23=HEAP32[r8];HEAP32[r8]=r23+4;HEAP32[r23>>2]=r31;r31=r34+1|0;if(r31>>>0<r3>>>0){r34=r31}else{r36=r31;break L1803}}r35=FUNCTION_TABLE[HEAP32[HEAP32[r10]+12>>2]](r18);r31=HEAP32[r8];HEAP32[r8]=r31+4;HEAP32[r31>>2]=r35;r36=r34+1|0}else{r36=r22}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r12]+48>>2]](r16,r36,r3,HEAP32[r8]);r16=(r19-r36<<2)+HEAP32[r8]|0;HEAP32[r8]=r16;if((r2|0)==(r3|0)){r37=r16;HEAP32[r5>>2]=r37;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r14);STACKTOP=r9;return}r37=(r2-r1<<2)+r4|0;HEAP32[r5>>2]=r37;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r14);STACKTOP=r9;return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13do_date_orderEv(r1){return 2}function __ZNSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r1,r2,r9,r10,r5,r6,r7,3256,3264);STACKTOP=r8;return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r2+8|0;r12=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+20>>2]](r11);HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];r4=r12;r3=HEAP8[r12];if((r3&1)==0){r13=r4+1|0;r14=r4+1|0}else{r4=HEAP32[r12+8>>2];r13=r4;r14=r4}r4=r3&255;if((r4&1|0)==0){r15=r4>>>1}else{r15=HEAP32[r12+4>>2]}__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r1,r2,r9,r10,r5,r6,r7,r14,r13+r15|0);STACKTOP=r8;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPKv(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r2=0;r7=0;r8=STACKTOP;STACKTOP=STACKTOP+216|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+24;r12=r8+48;r13=r8+200;r14=r8+208;r15=r8+16|0;HEAP8[r15]=HEAP8[3272];HEAP8[r15+1|0]=HEAP8[3273|0];HEAP8[r15+2|0]=HEAP8[3274|0];HEAP8[r15+3|0]=HEAP8[3275|0];HEAP8[r15+4|0]=HEAP8[3276|0];HEAP8[r15+5|0]=HEAP8[3277|0];r16=r11|0;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r17=_newlocale(1,2e3,0);HEAP32[3292]=r17}}while(0);r17=__ZNSt3__112__snprintf_lEPcjPvPKcz(r16,20,HEAP32[3292],r15,(r7=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r7>>2]=r6,r7));STACKTOP=r7;r7=r11+r17|0;r6=HEAP32[r4+4>>2]&176;do{if((r6|0)==16){r15=HEAP8[r16];if(r15<<24>>24==45|r15<<24>>24==43){r18=r11+1|0;break}if(!((r17|0)>1&r15<<24>>24==48)){r2=1540;break}r15=HEAP8[r11+1|0];if(!(r15<<24>>24==120|r15<<24>>24==88)){r2=1540;break}r18=r11+2|0}else if((r6|0)==32){r18=r7}else{r2=1540}}while(0);if(r2==1540){r18=r16}__ZNKSt3__18ios_base6getlocEv(r13,r4);r2=r13|0;r13=HEAP32[r2>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r10]=14520;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r9,260)}r9=HEAP32[3631]-1|0;r10=HEAP32[r13+8>>2];do{if(HEAP32[r13+12>>2]-r10>>2>>>0>r9>>>0){r6=HEAP32[r10+(r9<<2)>>2];if((r6|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r2>>2]|0);r15=r12|0;FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+48>>2]](r6,r16,r7,r15);r6=(r17<<2)+r12|0;if((r18|0)==(r7|0)){r19=r6;r20=r3|0;r21=HEAP32[r20>>2];r22=r14|0;HEAP32[r22>>2]=r21;__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r15,r19,r6,r4,r5);STACKTOP=r8;return}r19=(r18-r11<<2)+r12|0;r20=r3|0;r21=HEAP32[r20>>2];r22=r14|0;HEAP32[r22>>2]=r21;__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r15,r19,r6,r4,r5);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r10=r6>>2;r11=0;r12=STACKTOP;STACKTOP=STACKTOP+48|0;r13=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r13>>2];r13=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r13>>2];r13=r12,r14=r13>>2;r15=r12+16;r16=r12+24;r17=r12+32;r18=r12+40;__ZNKSt3__18ios_base6getlocEv(r15,r5);r19=r15|0;r15=HEAP32[r19>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r14]=14528;HEAP32[r14+1]=26;HEAP32[r14+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r13,260)}r13=HEAP32[3633]-1|0;r14=HEAP32[r15+8>>2];do{if(HEAP32[r15+12>>2]-r14>>2>>>0>r13>>>0){r20=HEAP32[r14+(r13<<2)>>2];if((r20|0)==0){break}r21=r20;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r19>>2]|0);HEAP32[r10]=0;r22=(r3|0)>>2;L1865:do{if((r8|0)==(r9|0)){r11=1619}else{r23=(r4|0)>>2;r24=r20>>2;r25=r20+8|0;r26=r20;r27=r2;r28=r17|0;r29=r18|0;r30=r16|0;r31=r8;r32=0;L1867:while(1){r33=r32;while(1){if((r33|0)!=0){r11=1619;break L1865}r34=HEAP32[r22],r35=r34>>2;do{if((r34|0)==0){r36=0}else{if((HEAP32[r35+3]|0)!=(HEAP32[r35+4]|0)){r36=r34;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r34)|0)!=-1){r36=r34;break}HEAP32[r22]=0;r36=0}}while(0);r34=(r36|0)==0;r35=HEAP32[r23],r37=r35>>2;L1877:do{if((r35|0)==0){r11=1572}else{do{if((HEAP32[r37+3]|0)==(HEAP32[r37+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r35)|0)!=-1){break}HEAP32[r23]=0;r11=1572;break L1877}}while(0);if(r34){r38=r35}else{r11=1573;break L1867}}}while(0);if(r11==1572){r11=0;if(r34){r11=1573;break L1867}else{r38=0}}if(FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r21,HEAP8[r31],0)<<24>>24==37){r11=1576;break}r35=HEAP8[r31];if(r35<<24>>24>-1){r39=HEAP32[r25>>2];if((HEAP16[r39+(r35<<24>>24<<1)>>1]&8192)!=0){r40=r31;r11=1587;break}}r41=(r36+12|0)>>2;r35=HEAP32[r41];r42=r36+16|0;if((r35|0)==(HEAP32[r42>>2]|0)){r43=FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+36>>2]](r36)&255}else{r43=HEAP8[r35]}if(FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+12>>2]](r21,r43)<<24>>24==FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+12>>2]](r21,HEAP8[r31])<<24>>24){r11=1614;break}HEAP32[r10]=4;r33=4}L1895:do{if(r11==1587){while(1){r11=0;r33=r40+1|0;if((r33|0)==(r9|0)){r44=r9;break}r35=HEAP8[r33];if(r35<<24>>24<=-1){r44=r33;break}if((HEAP16[r39+(r35<<24>>24<<1)>>1]&8192)==0){r44=r33;break}else{r40=r33;r11=1587}}r34=r36,r33=r34>>2;r35=r38,r37=r35>>2;while(1){do{if((r34|0)==0){r45=0}else{if((HEAP32[r33+3]|0)!=(HEAP32[r33+4]|0)){r45=r34;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r33]+36>>2]](r34)|0)!=-1){r45=r34;break}HEAP32[r22]=0;r45=0}}while(0);r46=(r45|0)==0;do{if((r35|0)==0){r11=1600}else{if((HEAP32[r37+3]|0)!=(HEAP32[r37+4]|0)){if(r46){r47=r35;break}else{r48=r44;break L1895}}if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r35)|0)==-1){HEAP32[r23]=0;r11=1600;break}else{if(r46^(r35|0)==0){r47=r35;break}else{r48=r44;break L1895}}}}while(0);if(r11==1600){r11=0;if(r46){r48=r44;break L1895}else{r47=0}}r49=(r45+12|0)>>2;r50=HEAP32[r49];r51=r45+16|0;if((r50|0)==(HEAP32[r51>>2]|0)){r52=FUNCTION_TABLE[HEAP32[HEAP32[r45>>2]+36>>2]](r45)&255}else{r52=HEAP8[r50]}if(r52<<24>>24<=-1){r48=r44;break L1895}if((HEAP16[HEAP32[r25>>2]+(r52<<24>>24<<1)>>1]&8192)==0){r48=r44;break L1895}r50=HEAP32[r49];if((r50|0)==(HEAP32[r51>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r45>>2]+40>>2]](r45);r34=r45,r33=r34>>2;r35=r47,r37=r35>>2;continue}else{HEAP32[r49]=r50+1;r34=r45,r33=r34>>2;r35=r47,r37=r35>>2;continue}}}else if(r11==1614){r11=0;r35=HEAP32[r41];if((r35|0)==(HEAP32[r42>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+40>>2]](r36)}else{HEAP32[r41]=r35+1}r48=r31+1|0}else if(r11==1576){r11=0;r35=r31+1|0;if((r35|0)==(r9|0)){r11=1577;break L1867}r37=FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r21,HEAP8[r35],0);if(r37<<24>>24==69|r37<<24>>24==48){r34=r31+2|0;if((r34|0)==(r9|0)){r11=1580;break L1867}r53=r37;r54=FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r21,HEAP8[r34],0);r55=r34}else{r53=0;r54=r37;r55=r35}r35=HEAP32[HEAP32[r27>>2]+36>>2];HEAP32[r28>>2]=r36;HEAP32[r29>>2]=r38;FUNCTION_TABLE[r35](r16,r2,r17,r18,r5,r6,r7,r54,r53);HEAP32[r22]=HEAP32[r30>>2];r48=r55+1|0}}while(0);if((r48|0)==(r9|0)){r11=1619;break L1865}r31=r48;r32=HEAP32[r10]}if(r11==1573){HEAP32[r10]=4;r56=r36,r57=r56>>2;break}else if(r11==1577){HEAP32[r10]=4;r56=r36,r57=r56>>2;break}else if(r11==1580){HEAP32[r10]=4;r56=r36,r57=r56>>2;break}}}while(0);if(r11==1619){r56=HEAP32[r22],r57=r56>>2}r21=r3|0;do{if((r56|0)!=0){if((HEAP32[r57+3]|0)!=(HEAP32[r57+4]|0)){break}if((FUNCTION_TABLE[HEAP32[HEAP32[r57]+36>>2]](r56)|0)!=-1){break}HEAP32[r21>>2]=0}}while(0);r22=HEAP32[r21>>2];r20=(r22|0)==0;r32=r4|0;r31=HEAP32[r32>>2],r30=r31>>2;L1953:do{if((r31|0)==0){r11=1629}else{do{if((HEAP32[r30+3]|0)==(HEAP32[r30+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r30]+36>>2]](r31)|0)!=-1){break}HEAP32[r32>>2]=0;r11=1629;break L1953}}while(0);if(!r20){break}r58=r1|0,r59=r58>>2;HEAP32[r59]=r22;STACKTOP=r12;return}}while(0);do{if(r11==1629){if(r20){break}r58=r1|0,r59=r58>>2;HEAP32[r59]=r22;STACKTOP=r12;return}}while(0);HEAP32[r10]=HEAP32[r10]|2;r58=r1|0,r59=r58>>2;HEAP32[r59]=r22;STACKTOP=r12;return}}while(0);r12=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r12);___cxa_throw(r12,9304,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r8=STACKTOP;STACKTOP=STACKTOP+32|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=r8+24;__ZNKSt3__18ios_base6getlocEv(r12,r5);r5=r12|0;r12=HEAP32[r5>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r11]=14528;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r10,260)}r10=HEAP32[3633]-1|0;r11=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r11>>2>>>0>r10>>>0){r13=HEAP32[r11+(r10<<2)>>2];if((r13|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);r14=HEAP32[r4>>2];r15=r2+8|0;r16=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]>>2]](r15);HEAP32[r9>>2]=r14;r14=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r16,r16+168|0,r13,r6,0)-r16|0;if((r14|0)>=168){r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}HEAP32[r7+24>>2]=((r14|0)/12&-1|0)%7&-1;r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r8=STACKTOP;STACKTOP=STACKTOP+32|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=r8+24;__ZNKSt3__18ios_base6getlocEv(r12,r5);r5=r12|0;r12=HEAP32[r5>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r11]=14528;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r10,260)}r10=HEAP32[3633]-1|0;r11=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r11>>2>>>0>r10>>>0){r13=HEAP32[r11+(r10<<2)>>2];if((r13|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);r14=HEAP32[r4>>2];r15=r2+8|0;r16=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+4>>2]](r15);HEAP32[r9>>2]=r14;r14=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r16,r16+288|0,r13,r6,0)-r16|0;if((r14|0)>=288){r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}HEAP32[r7+16>>2]=((r14|0)/12&-1|0)%12&-1;r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r2=STACKTOP;STACKTOP=STACKTOP+32|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r2;r9=r2+8,r10=r9>>2;r11=r2+24;__ZNKSt3__18ios_base6getlocEv(r11,r5);r5=r11|0;r11=HEAP32[r5>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r10]=14528;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r9,260)}r9=HEAP32[3633]-1|0;r10=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r10>>2>>>0>r9>>>0){r12=HEAP32[r10+(r9<<2)>>2];if((r12|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);HEAP32[r8>>2]=HEAP32[r4>>2];r13=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r8,r6,r12,4);if((HEAP32[r6>>2]&4|0)!=0){r14=r3|0;r15=HEAP32[r14>>2];r16=r1|0;HEAP32[r16>>2]=r15;STACKTOP=r2;return}if((r13|0)<69){r17=r13+2e3|0}else{r17=(r13-69|0)>>>0<31?r13+1900|0:r13}HEAP32[r7+20>>2]=r17-1900;r14=r3|0;r15=HEAP32[r14>>2];r16=r1|0;HEAP32[r16>>2]=r15;STACKTOP=r2;return}}while(0);r2=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r2);___cxa_throw(r2,9304,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67;r9=r7>>2;r10=r6>>2;r11=STACKTOP;STACKTOP=STACKTOP+328|0;r12=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r12>>2];r12=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r12>>2];r12=r11;r13=r11+8;r14=r11+16;r15=r11+24;r16=r11+32;r17=r11+40;r18=r11+48;r19=r11+56;r20=r11+64;r21=r11+72;r22=r11+80;r23=r11+88;r24=r11+96,r25=r24>>2;r26=r11+112;r27=r11+120;r28=r11+128;r29=r11+136;r30=r11+144;r31=r11+152;r32=r11+160;r33=r11+168;r34=r11+176;r35=r11+184;r36=r11+192;r37=r11+200;r38=r11+208;r39=r11+216;r40=r11+224;r41=r11+232;r42=r11+240;r43=r11+248;r44=r11+256;r45=r11+264;r46=r11+272;r47=r11+280;r48=r11+288;r49=r11+296;r50=r11+304;r51=r11+312;r52=r11+320;HEAP32[r10]=0;__ZNKSt3__18ios_base6getlocEv(r26,r5);r53=r26|0;r26=HEAP32[r53>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r25]=14528;HEAP32[r25+1]=26;HEAP32[r25+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r24,260)}r24=HEAP32[3633]-1|0;r25=HEAP32[r26+8>>2];do{if(HEAP32[r26+12>>2]-r25>>2>>>0>r24>>>0){r54=HEAP32[r25+(r24<<2)>>2];if((r54|0)==0){break}r55=r54;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r53>>2]|0);r54=r8<<24>>24;L2017:do{if((r54|0)==110|(r54|0)==116){HEAP32[r36>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIcEE(0,r3,r36,r6,r55)}else if((r54|0)==119){HEAP32[r14>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r14,r6,r55,1);r57=HEAP32[r10];if((r57&4|0)==0&(r56|0)<7){HEAP32[r9+6]=r56;break}else{HEAP32[r10]=r57|4;break}}else if((r54|0)==120){r57=HEAP32[HEAP32[r2>>2]+20>>2];HEAP32[r47>>2]=HEAP32[r3>>2];HEAP32[r48>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r57](r1,r2,r47,r48,r5,r6,r7);STACKTOP=r11;return}else if((r54|0)==88){r57=r2+8|0;r56=FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]+24>>2]](r57);r57=r3|0;HEAP32[r50>>2]=HEAP32[r57>>2];HEAP32[r51>>2]=HEAP32[r4>>2];r58=r56;r59=HEAP8[r56];if((r59&1)==0){r60=r58+1|0;r61=r58+1|0}else{r58=HEAP32[r56+8>>2];r60=r58;r61=r58}r58=r59&255;if((r58&1|0)==0){r62=r58>>>1}else{r62=HEAP32[r56+4>>2]}__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r49,r2,r50,r51,r5,r6,r7,r61,r60+r62|0);HEAP32[r57>>2]=HEAP32[r49>>2]}else if((r54|0)==106){HEAP32[r18>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r18,r6,r55,3);r56=HEAP32[r10];if((r56&4|0)==0&(r57|0)<366){HEAP32[r9+7]=r57;break}else{HEAP32[r10]=r56|4;break}}else if((r54|0)==72){HEAP32[r20>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r20,r6,r55,2);r57=HEAP32[r10];if((r57&4|0)==0&(r56|0)<24){HEAP32[r9+2]=r56;break}else{HEAP32[r10]=r57|4;break}}else if((r54|0)==70){r57=r3|0;HEAP32[r34>>2]=HEAP32[r57>>2];HEAP32[r35>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r33,r2,r34,r35,r5,r6,r7,3240,3248);HEAP32[r57>>2]=HEAP32[r33>>2]}else if((r54|0)==73){r57=r7+8|0;HEAP32[r19>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r19,r6,r55,2);r58=HEAP32[r10];do{if((r58&4|0)==0){if((r56-1|0)>>>0>=12){break}HEAP32[r57>>2]=r56;break L2017}}while(0);HEAP32[r10]=r58|4}else if((r54|0)==84){r56=r3|0;HEAP32[r45>>2]=HEAP32[r56>>2];HEAP32[r46>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r44,r2,r45,r46,r5,r6,r7,3208,3216);HEAP32[r56>>2]=HEAP32[r44>>2]}else if((r54|0)==77){HEAP32[r16>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r16,r6,r55,2);r57=HEAP32[r10];if((r57&4|0)==0&(r56|0)<60){HEAP32[r9+1]=r56;break}else{HEAP32[r10]=r57|4;break}}else if((r54|0)==97|(r54|0)==65){r57=HEAP32[r4>>2];r56=r2+8|0;r59=FUNCTION_TABLE[HEAP32[HEAP32[r56>>2]>>2]](r56);HEAP32[r23>>2]=r57;r57=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r23,r59,r59+168|0,r55,r6,0)-r59|0;if((r57|0)>=168){break}HEAP32[r9+6]=((r57|0)/12&-1|0)%7&-1}else if((r54|0)==99){r57=r2+8|0;r59=FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]+12>>2]](r57);r57=r3|0;HEAP32[r28>>2]=HEAP32[r57>>2];HEAP32[r29>>2]=HEAP32[r4>>2];r56=r59;r63=HEAP8[r59];if((r63&1)==0){r64=r56+1|0;r65=r56+1|0}else{r56=HEAP32[r59+8>>2];r64=r56;r65=r56}r56=r63&255;if((r56&1|0)==0){r66=r56>>>1}else{r66=HEAP32[r59+4>>2]}__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r27,r2,r28,r29,r5,r6,r7,r65,r64+r66|0);HEAP32[r57>>2]=HEAP32[r27>>2]}else if((r54|0)==100|(r54|0)==101){r57=r7+12|0;HEAP32[r21>>2]=HEAP32[r4>>2];r59=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r21,r6,r55,2);r56=HEAP32[r10];do{if((r56&4|0)==0){if((r59-1|0)>>>0>=31){break}HEAP32[r57>>2]=r59;break L2017}}while(0);HEAP32[r10]=r56|4}else if((r54|0)==89){HEAP32[r12>>2]=HEAP32[r4>>2];r59=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r12,r6,r55,4);if((HEAP32[r10]&4|0)!=0){break}HEAP32[r9+5]=r59-1900}else if((r54|0)==37){HEAP32[r52>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIcEE(0,r3,r52,r6,r55)}else if((r54|0)==68){r59=r3|0;HEAP32[r31>>2]=HEAP32[r59>>2];HEAP32[r32>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r30,r2,r31,r32,r5,r6,r7,3248,3256);HEAP32[r59>>2]=HEAP32[r30>>2]}else if((r54|0)==109){HEAP32[r17>>2]=HEAP32[r4>>2];r59=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r17,r6,r55,2)-1|0;r57=HEAP32[r10];if((r57&4|0)==0&(r59|0)<12){HEAP32[r9+4]=r59;break}else{HEAP32[r10]=r57|4;break}}else if((r54|0)==112){HEAP32[r37>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIcEE(r2,r7+8|0,r3,r37,r6,r55)}else if((r54|0)==114){r57=r3|0;HEAP32[r39>>2]=HEAP32[r57>>2];HEAP32[r40>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r38,r2,r39,r40,r5,r6,r7,3224,3235);HEAP32[r57>>2]=HEAP32[r38>>2]}else if((r54|0)==82){r57=r3|0;HEAP32[r42>>2]=HEAP32[r57>>2];HEAP32[r43>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r41,r2,r42,r43,r5,r6,r7,3216,3221);HEAP32[r57>>2]=HEAP32[r41>>2]}else if((r54|0)==83){HEAP32[r15>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r15,r6,r55,2);r59=HEAP32[r10];if((r59&4|0)==0&(r57|0)<61){HEAP32[r9]=r57;break}else{HEAP32[r10]=r59|4;break}}else if((r54|0)==121){HEAP32[r13>>2]=HEAP32[r4>>2];r59=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r13,r6,r55,4);if((HEAP32[r10]&4|0)!=0){break}if((r59|0)<69){r67=r59+2e3|0}else{r67=(r59-69|0)>>>0<31?r59+1900|0:r59}HEAP32[r9+5]=r67-1900}else if((r54|0)==98|(r54|0)==66|(r54|0)==104){r59=HEAP32[r4>>2];r57=r2+8|0;r58=FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]+4>>2]](r57);HEAP32[r22>>2]=r59;r59=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r22,r58,r58+288|0,r55,r6,0)-r58|0;if((r59|0)>=288){break}HEAP32[r9+4]=((r59|0)/12&-1|0)%12&-1}else{HEAP32[r10]=HEAP32[r10]|4}}while(0);HEAP32[r1>>2]=HEAP32[r3>>2];STACKTOP=r11;return}}while(0);r11=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r11);___cxa_throw(r11,9304,382)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIcEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r1=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=(r3|0)>>2;r3=r5+8|0;L2098:while(1){r5=HEAP32[r7],r8=r5>>2;do{if((r5|0)==0){r9=0}else{if((HEAP32[r8+3]|0)!=(HEAP32[r8+4]|0)){r9=r5;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r5)|0)==-1){HEAP32[r7]=0;r9=0;break}else{r9=HEAP32[r7];break}}}while(0);r5=(r9|0)==0;r8=HEAP32[r2],r10=r8>>2;L2107:do{if((r8|0)==0){r1=1758}else{do{if((HEAP32[r10+3]|0)==(HEAP32[r10+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r8)|0)!=-1){break}HEAP32[r2]=0;r1=1758;break L2107}}while(0);if(r5){r11=r8;r12=0}else{r13=r8,r14=r13>>2;r15=0;break L2098}}}while(0);if(r1==1758){r1=0;if(r5){r13=0,r14=r13>>2;r15=1;break}else{r11=0;r12=1}}r8=HEAP32[r7],r10=r8>>2;r16=HEAP32[r10+3];if((r16|0)==(HEAP32[r10+4]|0)){r17=FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r8)&255}else{r17=HEAP8[r16]}if(r17<<24>>24<=-1){r13=r11,r14=r13>>2;r15=r12;break}if((HEAP16[HEAP32[r3>>2]+(r17<<24>>24<<1)>>1]&8192)==0){r13=r11,r14=r13>>2;r15=r12;break}r16=HEAP32[r7];r8=r16+12|0;r10=HEAP32[r8>>2];if((r10|0)==(HEAP32[r16+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+40>>2]](r16);continue}else{HEAP32[r8>>2]=r10+1;continue}}r12=HEAP32[r7],r11=r12>>2;do{if((r12|0)==0){r18=0}else{if((HEAP32[r11+3]|0)!=(HEAP32[r11+4]|0)){r18=r12;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+36>>2]](r12)|0)==-1){HEAP32[r7]=0;r18=0;break}else{r18=HEAP32[r7];break}}}while(0);r7=(r18|0)==0;do{if(r15){r1=1777}else{if((HEAP32[r14+3]|0)!=(HEAP32[r14+4]|0)){if(!(r7^(r13|0)==0)){break}STACKTOP=r6;return}if((FUNCTION_TABLE[HEAP32[HEAP32[r14]+36>>2]](r13)|0)==-1){HEAP32[r2]=0;r1=1777;break}if(!r7){break}STACKTOP=r6;return}}while(0);do{if(r1==1777){if(r7){break}STACKTOP=r6;return}}while(0);HEAP32[r4>>2]=HEAP32[r4>>2]|2;STACKTOP=r6;return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIcEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11;r7=STACKTOP;STACKTOP=STACKTOP+8|0;r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r7;r9=r1+8|0;r1=FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+8>>2]](r9);r9=HEAPU8[r1];if((r9&1|0)==0){r10=r9>>>1}else{r10=HEAP32[r1+4>>2]}r9=HEAPU8[r1+12|0];if((r9&1|0)==0){r11=r9>>>1}else{r11=HEAP32[r1+16>>2]}if((r10|0)==(-r11|0)){HEAP32[r5>>2]=HEAP32[r5>>2]|4;STACKTOP=r7;return}HEAP32[r8>>2]=HEAP32[r4>>2];r4=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r8,r1,r1+24|0,r6,r5,0);r5=r4-r1|0;do{if((r4|0)==(r1|0)){if((HEAP32[r2>>2]|0)!=12){break}HEAP32[r2>>2]=0;STACKTOP=r7;return}}while(0);if((r5|0)!=12){STACKTOP=r7;return}r5=HEAP32[r2>>2];if((r5|0)>=12){STACKTOP=r7;return}HEAP32[r2>>2]=r5+12;STACKTOP=r7;return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIcEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14;r1=r4>>2;r4=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=HEAP32[r7],r8=r2>>2;do{if((r2|0)==0){r9=0}else{if((HEAP32[r8+3]|0)!=(HEAP32[r8+4]|0)){r9=r2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r2)|0)==-1){HEAP32[r7]=0;r9=0;break}else{r9=HEAP32[r7];break}}}while(0);r2=(r9|0)==0;r9=(r3|0)>>2;r3=HEAP32[r9],r8=r3>>2;L2181:do{if((r3|0)==0){r4=1815}else{do{if((HEAP32[r8+3]|0)==(HEAP32[r8+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r3)|0)!=-1){break}HEAP32[r9]=0;r4=1815;break L2181}}while(0);if(r2){r10=r3,r11=r10>>2;r12=0}else{r4=1816}}}while(0);if(r4==1815){if(r2){r4=1816}else{r10=0,r11=r10>>2;r12=1}}if(r4==1816){HEAP32[r1]=HEAP32[r1]|6;STACKTOP=r6;return}r2=HEAP32[r7],r3=r2>>2;r8=HEAP32[r3+3];if((r8|0)==(HEAP32[r3+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r3]+36>>2]](r2)&255}else{r13=HEAP8[r8]}if(FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+36>>2]](r5,r13,0)<<24>>24!=37){HEAP32[r1]=HEAP32[r1]|4;STACKTOP=r6;return}r13=HEAP32[r7];r5=r13+12|0;r8=HEAP32[r5>>2];if((r8|0)==(HEAP32[r13+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+40>>2]](r13)}else{HEAP32[r5>>2]=r8+1}r8=HEAP32[r7],r5=r8>>2;do{if((r8|0)==0){r14=0}else{if((HEAP32[r5+3]|0)!=(HEAP32[r5+4]|0)){r14=r8;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r5]+36>>2]](r8)|0)==-1){HEAP32[r7]=0;r14=0;break}else{r14=HEAP32[r7];break}}}while(0);r7=(r14|0)==0;do{if(r12){r4=1835}else{if((HEAP32[r11+3]|0)!=(HEAP32[r11+4]|0)){if(!(r7^(r10|0)==0)){break}STACKTOP=r6;return}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+36>>2]](r10)|0)==-1){HEAP32[r9]=0;r4=1835;break}if(!r7){break}STACKTOP=r6;return}}while(0);do{if(r4==1835){if(r7){break}STACKTOP=r6;return}}while(0);HEAP32[r1]=HEAP32[r1]|2;STACKTOP=r6;return}function __ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r6=r3>>2;r3=0;r7=STACKTOP;r8=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r8>>2];r8=(r1|0)>>2;r1=HEAP32[r8],r9=r1>>2;do{if((r1|0)==0){r10=0}else{if((HEAP32[r9+3]|0)!=(HEAP32[r9+4]|0)){r10=r1;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r1)|0)==-1){HEAP32[r8]=0;r10=0;break}else{r10=HEAP32[r8];break}}}while(0);r1=(r10|0)==0;r10=(r2|0)>>2;r2=HEAP32[r10],r9=r2>>2;L2235:do{if((r2|0)==0){r3=1855}else{do{if((HEAP32[r9+3]|0)==(HEAP32[r9+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r2)|0)!=-1){break}HEAP32[r10]=0;r3=1855;break L2235}}while(0);if(r1){r11=r2}else{r3=1856}}}while(0);if(r3==1855){if(r1){r3=1856}else{r11=0}}if(r3==1856){HEAP32[r6]=HEAP32[r6]|6;r12=0;STACKTOP=r7;return r12}r1=HEAP32[r8],r2=r1>>2;r9=HEAP32[r2+3];if((r9|0)==(HEAP32[r2+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r1)&255}else{r13=HEAP8[r9]}do{if(r13<<24>>24>-1){r9=r4+8|0;if((HEAP16[HEAP32[r9>>2]+(r13<<24>>24<<1)>>1]&2048)==0){break}r1=r4;r2=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r4,r13,0)<<24>>24;r14=HEAP32[r8];r15=r14+12|0;r16=HEAP32[r15>>2];if((r16|0)==(HEAP32[r14+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+40>>2]](r14);r17=r2;r18=r5;r19=r11,r20=r19>>2}else{HEAP32[r15>>2]=r16+1;r17=r2;r18=r5;r19=r11,r20=r19>>2}while(1){r21=r17-48|0;r2=r18-1|0;r16=HEAP32[r8],r15=r16>>2;do{if((r16|0)==0){r22=0}else{if((HEAP32[r15+3]|0)!=(HEAP32[r15+4]|0)){r22=r16;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r15]+36>>2]](r16)|0)==-1){HEAP32[r8]=0;r22=0;break}else{r22=HEAP32[r8];break}}}while(0);r16=(r22|0)==0;if((r19|0)==0){r23=r22,r24=r23>>2;r25=0,r26=r25>>2}else{do{if((HEAP32[r20+3]|0)==(HEAP32[r20+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r19)|0)!=-1){r27=r19;break}HEAP32[r10]=0;r27=0}else{r27=r19}}while(0);r23=HEAP32[r8],r24=r23>>2;r25=r27,r26=r25>>2}r28=(r25|0)==0;if(!((r16^r28)&(r2|0)>0)){r3=1885;break}r15=HEAP32[r24+3];if((r15|0)==(HEAP32[r24+4]|0)){r29=FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r23)&255}else{r29=HEAP8[r15]}if(r29<<24>>24<=-1){r12=r21;r3=1898;break}if((HEAP16[HEAP32[r9>>2]+(r29<<24>>24<<1)>>1]&2048)==0){r12=r21;r3=1899;break}r15=(FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r4,r29,0)<<24>>24)+(r21*10&-1)|0;r14=HEAP32[r8];r30=r14+12|0;r31=HEAP32[r30>>2];if((r31|0)==(HEAP32[r14+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+40>>2]](r14);r17=r15;r18=r2;r19=r25,r20=r19>>2;continue}else{HEAP32[r30>>2]=r31+1;r17=r15;r18=r2;r19=r25,r20=r19>>2;continue}}if(r3==1885){do{if((r23|0)==0){r32=0}else{if((HEAP32[r24+3]|0)!=(HEAP32[r24+4]|0)){r32=r23;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r23)|0)==-1){HEAP32[r8]=0;r32=0;break}else{r32=HEAP32[r8];break}}}while(0);r1=(r32|0)==0;L2292:do{if(r28){r3=1895}else{do{if((HEAP32[r26+3]|0)==(HEAP32[r26+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)|0)!=-1){break}HEAP32[r10]=0;r3=1895;break L2292}}while(0);if(r1){r12=r21}else{break}STACKTOP=r7;return r12}}while(0);do{if(r3==1895){if(r1){break}else{r12=r21}STACKTOP=r7;return r12}}while(0);HEAP32[r6]=HEAP32[r6]|2;r12=r21;STACKTOP=r7;return r12}else if(r3==1898){STACKTOP=r7;return r12}else if(r3==1899){STACKTOP=r7;return r12}}}while(0);HEAP32[r6]=HEAP32[r6]|4;r12=0;STACKTOP=r7;return r12}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13do_date_orderEv(r1){return 2}function __ZNSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r1,r2,r9,r10,r5,r6,r7,3176,3208);STACKTOP=r8;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r2+8|0;r12=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+20>>2]](r11);HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];r4=HEAP8[r12];if((r4&1)==0){r13=r12+4|0;r14=r12+4|0}else{r3=HEAP32[r12+8>>2];r13=r3;r14=r3}r3=r4&255;if((r3&1|0)==0){r15=r3>>>1}else{r15=HEAP32[r12+4>>2]}__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r1,r2,r9,r10,r5,r6,r7,r14,(r15<<2)+r13|0);STACKTOP=r8;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65;r10=r6>>2;r11=0;r12=STACKTOP;STACKTOP=STACKTOP+48|0;r13=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r13>>2];r13=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r13>>2];r13=r12,r14=r13>>2;r15=r12+16;r16=r12+24;r17=r12+32;r18=r12+40;__ZNKSt3__18ios_base6getlocEv(r15,r5);r19=r15|0;r15=HEAP32[r19>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r14]=14520;HEAP32[r14+1]=26;HEAP32[r14+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r13,260)}r13=HEAP32[3631]-1|0;r14=HEAP32[r15+8>>2];do{if(HEAP32[r15+12>>2]-r14>>2>>>0>r13>>>0){r20=HEAP32[r14+(r13<<2)>>2];if((r20|0)==0){break}r21=r20;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r19>>2]|0);HEAP32[r10]=0;r22=(r3|0)>>2;L2328:do{if((r8|0)==(r9|0)){r11=1986}else{r23=(r4|0)>>2;r24=r20>>2;r25=r20>>2;r26=r20;r27=r2;r28=r17|0;r29=r18|0;r30=r16|0;r31=r8,r32=r31>>2;r33=0;L2330:while(1){r34=r33;while(1){if((r34|0)!=0){r11=1986;break L2328}r35=HEAP32[r22],r36=r35>>2;do{if((r35|0)==0){r37=0}else{r38=HEAP32[r36+3];if((r38|0)==(HEAP32[r36+4]|0)){r39=FUNCTION_TABLE[HEAP32[HEAP32[r36]+36>>2]](r35)}else{r39=HEAP32[r38>>2]}if((r39|0)!=-1){r37=r35;break}HEAP32[r22]=0;r37=0}}while(0);r35=(r37|0)==0;r36=HEAP32[r23],r38=r36>>2;do{if((r36|0)==0){r11=1938}else{r40=HEAP32[r38+3];if((r40|0)==(HEAP32[r38+4]|0)){r41=FUNCTION_TABLE[HEAP32[HEAP32[r38]+36>>2]](r36)}else{r41=HEAP32[r40>>2]}if((r41|0)==-1){HEAP32[r23]=0;r11=1938;break}else{if(r35^(r36|0)==0){r42=r36;break}else{r11=1940;break L2330}}}}while(0);if(r11==1938){r11=0;if(r35){r11=1940;break L2330}else{r42=0}}if(FUNCTION_TABLE[HEAP32[HEAP32[r24]+52>>2]](r21,HEAP32[r32],0)<<24>>24==37){r11=1943;break}if(FUNCTION_TABLE[HEAP32[HEAP32[r25]+12>>2]](r21,8192,HEAP32[r32])){r43=r31;r11=1953;break}r44=(r37+12|0)>>2;r36=HEAP32[r44];r45=r37+16|0;if((r36|0)==(HEAP32[r45>>2]|0)){r46=FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+36>>2]](r37)}else{r46=HEAP32[r36>>2]}if((FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+28>>2]](r21,r46)|0)==(FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+28>>2]](r21,HEAP32[r32])|0)){r11=1981;break}HEAP32[r10]=4;r34=4}L2362:do{if(r11==1981){r11=0;r34=HEAP32[r44];if((r34|0)==(HEAP32[r45>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+40>>2]](r37)}else{HEAP32[r44]=r34+4}r47=r31+4|0}else if(r11==1953){while(1){r11=0;r34=r43+4|0;if((r34|0)==(r9|0)){r48=r9;break}if(FUNCTION_TABLE[HEAP32[HEAP32[r25]+12>>2]](r21,8192,HEAP32[r34>>2])){r43=r34;r11=1953}else{r48=r34;break}}r35=r37,r34=r35>>2;r36=r42,r38=r36>>2;while(1){do{if((r35|0)==0){r49=0}else{r40=HEAP32[r34+3];if((r40|0)==(HEAP32[r34+4]|0)){r50=FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r35)}else{r50=HEAP32[r40>>2]}if((r50|0)!=-1){r49=r35;break}HEAP32[r22]=0;r49=0}}while(0);r40=(r49|0)==0;do{if((r36|0)==0){r11=1968}else{r51=HEAP32[r38+3];if((r51|0)==(HEAP32[r38+4]|0)){r52=FUNCTION_TABLE[HEAP32[HEAP32[r38]+36>>2]](r36)}else{r52=HEAP32[r51>>2]}if((r52|0)==-1){HEAP32[r23]=0;r11=1968;break}else{if(r40^(r36|0)==0){r53=r36;break}else{r47=r48;break L2362}}}}while(0);if(r11==1968){r11=0;if(r40){r47=r48;break L2362}else{r53=0}}r51=(r49+12|0)>>2;r54=HEAP32[r51];r55=r49+16|0;if((r54|0)==(HEAP32[r55>>2]|0)){r56=FUNCTION_TABLE[HEAP32[HEAP32[r49>>2]+36>>2]](r49)}else{r56=HEAP32[r54>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r25]+12>>2]](r21,8192,r56)){r47=r48;break L2362}r54=HEAP32[r51];if((r54|0)==(HEAP32[r55>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r49>>2]+40>>2]](r49);r35=r49,r34=r35>>2;r36=r53,r38=r36>>2;continue}else{HEAP32[r51]=r54+4;r35=r49,r34=r35>>2;r36=r53,r38=r36>>2;continue}}}else if(r11==1943){r11=0;r36=r31+4|0;if((r36|0)==(r9|0)){r11=1944;break L2330}r38=FUNCTION_TABLE[HEAP32[HEAP32[r24]+52>>2]](r21,HEAP32[r36>>2],0);if(r38<<24>>24==69|r38<<24>>24==48){r35=r31+8|0;if((r35|0)==(r9|0)){r11=1947;break L2330}r57=r38;r58=FUNCTION_TABLE[HEAP32[HEAP32[r24]+52>>2]](r21,HEAP32[r35>>2],0);r59=r35}else{r57=0;r58=r38;r59=r36}r36=HEAP32[HEAP32[r27>>2]+36>>2];HEAP32[r28>>2]=r37;HEAP32[r29>>2]=r42;FUNCTION_TABLE[r36](r16,r2,r17,r18,r5,r6,r7,r58,r57);HEAP32[r22]=HEAP32[r30>>2];r47=r59+4|0}}while(0);if((r47|0)==(r9|0)){r11=1986;break L2328}r31=r47,r32=r31>>2;r33=HEAP32[r10]}if(r11==1940){HEAP32[r10]=4;r60=r37,r61=r60>>2;break}else if(r11==1944){HEAP32[r10]=4;r60=r37,r61=r60>>2;break}else if(r11==1947){HEAP32[r10]=4;r60=r37,r61=r60>>2;break}}}while(0);if(r11==1986){r60=HEAP32[r22],r61=r60>>2}r21=r3|0;do{if((r60|0)!=0){r20=HEAP32[r61+3];if((r20|0)==(HEAP32[r61+4]|0)){r62=FUNCTION_TABLE[HEAP32[HEAP32[r61]+36>>2]](r60)}else{r62=HEAP32[r20>>2]}if((r62|0)!=-1){break}HEAP32[r21>>2]=0}}while(0);r22=HEAP32[r21>>2];r20=(r22|0)==0;r33=r4|0;r31=HEAP32[r33>>2],r32=r31>>2;do{if((r31|0)==0){r11=1999}else{r30=HEAP32[r32+3];if((r30|0)==(HEAP32[r32+4]|0)){r63=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r63=HEAP32[r30>>2]}if((r63|0)==-1){HEAP32[r33>>2]=0;r11=1999;break}if(!(r20^(r31|0)==0)){break}r64=r1|0,r65=r64>>2;HEAP32[r65]=r22;STACKTOP=r12;return}}while(0);do{if(r11==1999){if(r20){break}r64=r1|0,r65=r64>>2;HEAP32[r65]=r22;STACKTOP=r12;return}}while(0);HEAP32[r10]=HEAP32[r10]|2;r64=r1|0,r65=r64>>2;HEAP32[r65]=r22;STACKTOP=r12;return}}while(0);r12=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r12);___cxa_throw(r12,9304,382)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r8=STACKTOP;STACKTOP=STACKTOP+32|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=r8+24;__ZNKSt3__18ios_base6getlocEv(r12,r5);r5=r12|0;r12=HEAP32[r5>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r11]=14520;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r10,260)}r10=HEAP32[3631]-1|0;r11=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r11>>2>>>0>r10>>>0){r13=HEAP32[r11+(r10<<2)>>2];if((r13|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);r14=HEAP32[r4>>2];r15=r2+8|0;r16=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]>>2]](r15);HEAP32[r9>>2]=r14;r14=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r16,r16+168|0,r13,r6,0)-r16|0;if((r14|0)>=168){r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}HEAP32[r7+24>>2]=((r14|0)/12&-1|0)%7&-1;r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r8=STACKTOP;STACKTOP=STACKTOP+32|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=r8+24;__ZNKSt3__18ios_base6getlocEv(r12,r5);r5=r12|0;r12=HEAP32[r5>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r11]=14520;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r10,260)}r10=HEAP32[3631]-1|0;r11=HEAP32[r12+8>>2];do{if(HEAP32[r12+12>>2]-r11>>2>>>0>r10>>>0){r13=HEAP32[r11+(r10<<2)>>2];if((r13|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);r14=HEAP32[r4>>2];r15=r2+8|0;r16=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+4>>2]](r15);HEAP32[r9>>2]=r14;r14=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r16,r16+288|0,r13,r6,0)-r16|0;if((r14|0)>=288){r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}HEAP32[r7+16>>2]=((r14|0)/12&-1|0)%12&-1;r17=r3|0;r18=HEAP32[r17>>2];r19=r1|0;HEAP32[r19>>2]=r18;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r2=STACKTOP;STACKTOP=STACKTOP+32|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r2;r9=r2+8,r10=r9>>2;r11=r2+24;__ZNKSt3__18ios_base6getlocEv(r11,r5);r5=r11|0;r11=HEAP32[r5>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r10]=14520;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r9,260)}r9=HEAP32[3631]-1|0;r10=HEAP32[r11+8>>2];do{if(HEAP32[r11+12>>2]-r10>>2>>>0>r9>>>0){r12=HEAP32[r10+(r9<<2)>>2];if((r12|0)==0){break}__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r5>>2]|0);HEAP32[r8>>2]=HEAP32[r4>>2];r13=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r8,r6,r12,4);if((HEAP32[r6>>2]&4|0)!=0){r14=r3|0;r15=HEAP32[r14>>2];r16=r1|0;HEAP32[r16>>2]=r15;STACKTOP=r2;return}if((r13|0)<69){r17=r13+2e3|0}else{r17=(r13-69|0)>>>0<31?r13+1900|0:r13}HEAP32[r7+20>>2]=r17-1900;r14=r3|0;r15=HEAP32[r14>>2];r16=r1|0;HEAP32[r16>>2]=r15;STACKTOP=r2;return}}while(0);r2=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r2);___cxa_throw(r2,9304,382)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIwEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r1=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=(r3|0)>>2;r3=r5;L2486:while(1){r8=HEAP32[r7],r9=r8>>2;do{if((r8|0)==0){r10=1}else{r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r12=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r8)}else{r12=HEAP32[r11>>2]}if((r12|0)==-1){HEAP32[r7]=0;r10=1;break}else{r10=(HEAP32[r7]|0)==0;break}}}while(0);r8=HEAP32[r2],r9=r8>>2;do{if((r8|0)==0){r1=2059}else{r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r8)}else{r13=HEAP32[r11>>2]}if((r13|0)==-1){HEAP32[r2]=0;r1=2059;break}else{r11=(r8|0)==0;if(r10^r11){r14=r8;r15=r11;break}else{r16=r8,r17=r16>>2;r18=r11;break L2486}}}}while(0);if(r1==2059){r1=0;if(r10){r16=0,r17=r16>>2;r18=1;break}else{r14=0;r15=1}}r8=HEAP32[r7],r9=r8>>2;r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r19=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r8)}else{r19=HEAP32[r11>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+12>>2]](r5,8192,r19)){r16=r14,r17=r16>>2;r18=r15;break}r11=HEAP32[r7];r8=r11+12|0;r9=HEAP32[r8>>2];if((r9|0)==(HEAP32[r11+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+40>>2]](r11);continue}else{HEAP32[r8>>2]=r9+4;continue}}r15=HEAP32[r7],r14=r15>>2;do{if((r15|0)==0){r20=1}else{r19=HEAP32[r14+3];if((r19|0)==(HEAP32[r14+4]|0)){r21=FUNCTION_TABLE[HEAP32[HEAP32[r14]+36>>2]](r15)}else{r21=HEAP32[r19>>2]}if((r21|0)==-1){HEAP32[r7]=0;r20=1;break}else{r20=(HEAP32[r7]|0)==0;break}}}while(0);do{if(r18){r1=2081}else{r7=HEAP32[r17+3];if((r7|0)==(HEAP32[r17+4]|0)){r22=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r16)}else{r22=HEAP32[r7>>2]}if((r22|0)==-1){HEAP32[r2]=0;r1=2081;break}if(!(r20^(r16|0)==0)){break}STACKTOP=r6;return}}while(0);do{if(r1==2081){if(r20){break}STACKTOP=r6;return}}while(0);HEAP32[r4>>2]=HEAP32[r4>>2]|2;STACKTOP=r6;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66;r9=r7>>2;r10=r6>>2;r11=STACKTOP;STACKTOP=STACKTOP+328|0;r12=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r12>>2];r12=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r12>>2];r12=r11;r13=r11+8;r14=r11+16;r15=r11+24;r16=r11+32;r17=r11+40;r18=r11+48;r19=r11+56;r20=r11+64;r21=r11+72;r22=r11+80;r23=r11+88;r24=r11+96,r25=r24>>2;r26=r11+112;r27=r11+120;r28=r11+128;r29=r11+136;r30=r11+144;r31=r11+152;r32=r11+160;r33=r11+168;r34=r11+176;r35=r11+184;r36=r11+192;r37=r11+200;r38=r11+208;r39=r11+216;r40=r11+224;r41=r11+232;r42=r11+240;r43=r11+248;r44=r11+256;r45=r11+264;r46=r11+272;r47=r11+280;r48=r11+288;r49=r11+296;r50=r11+304;r51=r11+312;r52=r11+320;HEAP32[r10]=0;__ZNKSt3__18ios_base6getlocEv(r26,r5);r53=r26|0;r26=HEAP32[r53>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r25]=14520;HEAP32[r25+1]=26;HEAP32[r25+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r24,260)}r24=HEAP32[3631]-1|0;r25=HEAP32[r26+8>>2];do{if(HEAP32[r26+12>>2]-r25>>2>>>0>r24>>>0){r54=HEAP32[r25+(r24<<2)>>2];if((r54|0)==0){break}r55=r54;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r53>>2]|0);r54=r8<<24>>24;L2551:do{if((r54|0)==72){HEAP32[r20>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r20,r6,r55,2);r57=HEAP32[r10];if((r57&4|0)==0&(r56|0)<24){HEAP32[r9+2]=r56;break}else{HEAP32[r10]=r57|4;break}}else if((r54|0)==99){r57=r2+8|0;r56=FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]+12>>2]](r57);r57=r3|0;HEAP32[r28>>2]=HEAP32[r57>>2];HEAP32[r29>>2]=HEAP32[r4>>2];r58=HEAP8[r56];if((r58&1)==0){r59=r56+4|0;r60=r56+4|0}else{r61=HEAP32[r56+8>>2];r59=r61;r60=r61}r61=r58&255;if((r61&1|0)==0){r62=r61>>>1}else{r62=HEAP32[r56+4>>2]}__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r27,r2,r28,r29,r5,r6,r7,r60,(r62<<2)+r59|0);HEAP32[r57>>2]=HEAP32[r27>>2]}else if((r54|0)==120){r57=HEAP32[HEAP32[r2>>2]+20>>2];HEAP32[r47>>2]=HEAP32[r3>>2];HEAP32[r48>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r57](r1,r2,r47,r48,r5,r6,r7);STACKTOP=r11;return}else if((r54|0)==88){r57=r2+8|0;r56=FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]+24>>2]](r57);r57=r3|0;HEAP32[r50>>2]=HEAP32[r57>>2];HEAP32[r51>>2]=HEAP32[r4>>2];r61=HEAP8[r56];if((r61&1)==0){r63=r56+4|0;r64=r56+4|0}else{r58=HEAP32[r56+8>>2];r63=r58;r64=r58}r58=r61&255;if((r58&1|0)==0){r65=r58>>>1}else{r65=HEAP32[r56+4>>2]}__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r49,r2,r50,r51,r5,r6,r7,r64,(r65<<2)+r63|0);HEAP32[r57>>2]=HEAP32[r49>>2]}else if((r54|0)==109){HEAP32[r17>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r17,r6,r55,2)-1|0;r56=HEAP32[r10];if((r56&4|0)==0&(r57|0)<12){HEAP32[r9+4]=r57;break}else{HEAP32[r10]=r56|4;break}}else if((r54|0)==68){r56=r3|0;HEAP32[r31>>2]=HEAP32[r56>>2];HEAP32[r32>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r30,r2,r31,r32,r5,r6,r7,3144,3176);HEAP32[r56>>2]=HEAP32[r30>>2]}else if((r54|0)==84){r56=r3|0;HEAP32[r45>>2]=HEAP32[r56>>2];HEAP32[r46>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r44,r2,r45,r46,r5,r6,r7,3040,3072);HEAP32[r56>>2]=HEAP32[r44>>2]}else if((r54|0)==119){HEAP32[r14>>2]=HEAP32[r4>>2];r56=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r14,r6,r55,1);r57=HEAP32[r10];if((r57&4|0)==0&(r56|0)<7){HEAP32[r9+6]=r56;break}else{HEAP32[r10]=r57|4;break}}else if((r54|0)==89){HEAP32[r12>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r12,r6,r55,4);if((HEAP32[r10]&4|0)!=0){break}HEAP32[r9+5]=r57-1900}else if((r54|0)==121){HEAP32[r13>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r13,r6,r55,4);if((HEAP32[r10]&4|0)!=0){break}if((r57|0)<69){r66=r57+2e3|0}else{r66=(r57-69|0)>>>0<31?r57+1900|0:r57}HEAP32[r9+5]=r66-1900}else if((r54|0)==97|(r54|0)==65){r57=HEAP32[r4>>2];r56=r2+8|0;r58=FUNCTION_TABLE[HEAP32[HEAP32[r56>>2]>>2]](r56);HEAP32[r23>>2]=r57;r57=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r23,r58,r58+168|0,r55,r6,0)-r58|0;if((r57|0)>=168){break}HEAP32[r9+6]=((r57|0)/12&-1|0)%7&-1}else if((r54|0)==110|(r54|0)==116){HEAP32[r36>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIwEE(0,r3,r36,r6,r55)}else if((r54|0)==112){HEAP32[r37>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIwEE(r2,r7+8|0,r3,r37,r6,r55)}else if((r54|0)==114){r57=r3|0;HEAP32[r39>>2]=HEAP32[r57>>2];HEAP32[r40>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r38,r2,r39,r40,r5,r6,r7,3096,3140);HEAP32[r57>>2]=HEAP32[r38>>2]}else if((r54|0)==70){r57=r3|0;HEAP32[r34>>2]=HEAP32[r57>>2];HEAP32[r35>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r33,r2,r34,r35,r5,r6,r7,3008,3040);HEAP32[r57>>2]=HEAP32[r33>>2]}else if((r54|0)==106){HEAP32[r18>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r18,r6,r55,3);r58=HEAP32[r10];if((r58&4|0)==0&(r57|0)<366){HEAP32[r9+7]=r57;break}else{HEAP32[r10]=r58|4;break}}else if((r54|0)==73){r58=r7+8|0;HEAP32[r19>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r19,r6,r55,2);r56=HEAP32[r10];do{if((r56&4|0)==0){if((r57-1|0)>>>0>=12){break}HEAP32[r58>>2]=r57;break L2551}}while(0);HEAP32[r10]=r56|4}else if((r54|0)==100|(r54|0)==101){r57=r7+12|0;HEAP32[r21>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r21,r6,r55,2);r61=HEAP32[r10];do{if((r61&4|0)==0){if((r58-1|0)>>>0>=31){break}HEAP32[r57>>2]=r58;break L2551}}while(0);HEAP32[r10]=r61|4}else if((r54|0)==82){r58=r3|0;HEAP32[r42>>2]=HEAP32[r58>>2];HEAP32[r43>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r41,r2,r42,r43,r5,r6,r7,3072,3092);HEAP32[r58>>2]=HEAP32[r41>>2]}else if((r54|0)==83){HEAP32[r15>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r15,r6,r55,2);r57=HEAP32[r10];if((r57&4|0)==0&(r58|0)<61){HEAP32[r9]=r58;break}else{HEAP32[r10]=r57|4;break}}else if((r54|0)==37){HEAP32[r52>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIwEE(0,r3,r52,r6,r55)}else if((r54|0)==98|(r54|0)==66|(r54|0)==104){r57=HEAP32[r4>>2];r58=r2+8|0;r56=FUNCTION_TABLE[HEAP32[HEAP32[r58>>2]+4>>2]](r58);HEAP32[r22>>2]=r57;r57=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r22,r56,r56+288|0,r55,r6,0)-r56|0;if((r57|0)>=288){break}HEAP32[r9+4]=((r57|0)/12&-1|0)%12&-1}else if((r54|0)==77){HEAP32[r16>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r16,r6,r55,2);r56=HEAP32[r10];if((r56&4|0)==0&(r57|0)<60){HEAP32[r9+1]=r57;break}else{HEAP32[r10]=r56|4;break}}else{HEAP32[r10]=HEAP32[r10]|4}}while(0);HEAP32[r1>>2]=HEAP32[r3>>2];STACKTOP=r11;return}}while(0);r11=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r11);___cxa_throw(r11,9304,382)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIwEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11;r7=STACKTOP;STACKTOP=STACKTOP+8|0;r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r7;r9=r1+8|0;r1=FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+8>>2]](r9);r9=HEAPU8[r1];if((r9&1|0)==0){r10=r9>>>1}else{r10=HEAP32[r1+4>>2]}r9=HEAPU8[r1+12|0];if((r9&1|0)==0){r11=r9>>>1}else{r11=HEAP32[r1+16>>2]}if((r10|0)==(-r11|0)){HEAP32[r5>>2]=HEAP32[r5>>2]|4;STACKTOP=r7;return}HEAP32[r8>>2]=HEAP32[r4>>2];r4=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r8,r1,r1+24|0,r6,r5,0);r5=r4-r1|0;do{if((r4|0)==(r1|0)){if((HEAP32[r2>>2]|0)!=12){break}HEAP32[r2>>2]=0;STACKTOP=r7;return}}while(0);if((r5|0)!=12){STACKTOP=r7;return}r5=HEAP32[r2>>2];if((r5|0)>=12){STACKTOP=r7;return}HEAP32[r2>>2]=r5+12;STACKTOP=r7;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIwEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r1=r4>>2;r4=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=HEAP32[r7],r8=r2>>2;do{if((r2|0)==0){r9=1}else{r10=HEAP32[r8+3];if((r10|0)==(HEAP32[r8+4]|0)){r11=FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r2)}else{r11=HEAP32[r10>>2]}if((r11|0)==-1){HEAP32[r7]=0;r9=1;break}else{r9=(HEAP32[r7]|0)==0;break}}}while(0);r11=(r3|0)>>2;r3=HEAP32[r11],r2=r3>>2;do{if((r3|0)==0){r4=2194}else{r8=HEAP32[r2+3];if((r8|0)==(HEAP32[r2+4]|0)){r12=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r3)}else{r12=HEAP32[r8>>2]}if((r12|0)==-1){HEAP32[r11]=0;r4=2194;break}else{r8=(r3|0)==0;if(r9^r8){r13=r3,r14=r13>>2;r15=r8;break}else{r4=2196;break}}}}while(0);if(r4==2194){if(r9){r4=2196}else{r13=0,r14=r13>>2;r15=1}}if(r4==2196){HEAP32[r1]=HEAP32[r1]|6;STACKTOP=r6;return}r9=HEAP32[r7],r3=r9>>2;r12=HEAP32[r3+3];if((r12|0)==(HEAP32[r3+4]|0)){r16=FUNCTION_TABLE[HEAP32[HEAP32[r3]+36>>2]](r9)}else{r16=HEAP32[r12>>2]}if(FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+52>>2]](r5,r16,0)<<24>>24!=37){HEAP32[r1]=HEAP32[r1]|4;STACKTOP=r6;return}r16=HEAP32[r7];r5=r16+12|0;r12=HEAP32[r5>>2];if((r12|0)==(HEAP32[r16+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+40>>2]](r16)}else{HEAP32[r5>>2]=r12+4}r12=HEAP32[r7],r5=r12>>2;do{if((r12|0)==0){r17=1}else{r16=HEAP32[r5+3];if((r16|0)==(HEAP32[r5+4]|0)){r18=FUNCTION_TABLE[HEAP32[HEAP32[r5]+36>>2]](r12)}else{r18=HEAP32[r16>>2]}if((r18|0)==-1){HEAP32[r7]=0;r17=1;break}else{r17=(HEAP32[r7]|0)==0;break}}}while(0);do{if(r15){r4=2218}else{r7=HEAP32[r14+3];if((r7|0)==(HEAP32[r14+4]|0)){r19=FUNCTION_TABLE[HEAP32[HEAP32[r14]+36>>2]](r13)}else{r19=HEAP32[r7>>2]}if((r19|0)==-1){HEAP32[r11]=0;r4=2218;break}if(!(r17^(r13|0)==0)){break}STACKTOP=r6;return}}while(0);do{if(r4==2218){if(r17){break}STACKTOP=r6;return}}while(0);HEAP32[r1]=HEAP32[r1]|2;STACKTOP=r6;return}function __ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r6=r3>>2;r3=0;r7=STACKTOP;r8=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r8>>2];r8=(r1|0)>>2;r1=HEAP32[r8],r9=r1>>2;do{if((r1|0)==0){r10=1}else{r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r12=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r1)}else{r12=HEAP32[r11>>2]}if((r12|0)==-1){HEAP32[r8]=0;r10=1;break}else{r10=(HEAP32[r8]|0)==0;break}}}while(0);r12=(r2|0)>>2;r2=HEAP32[r12],r1=r2>>2;do{if((r2|0)==0){r3=2240}else{r9=HEAP32[r1+3];if((r9|0)==(HEAP32[r1+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r1]+36>>2]](r2)}else{r13=HEAP32[r9>>2]}if((r13|0)==-1){HEAP32[r12]=0;r3=2240;break}else{if(r10^(r2|0)==0){r14=r2;break}else{r3=2242;break}}}}while(0);if(r3==2240){if(r10){r3=2242}else{r14=0}}if(r3==2242){HEAP32[r6]=HEAP32[r6]|6;r15=0;STACKTOP=r7;return r15}r10=HEAP32[r8],r2=r10>>2;r13=HEAP32[r2+3];if((r13|0)==(HEAP32[r2+4]|0)){r16=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r10)}else{r16=HEAP32[r13>>2]}r13=r4;if(!FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r4,2048,r16)){HEAP32[r6]=HEAP32[r6]|4;r15=0;STACKTOP=r7;return r15}r10=r4;r2=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+52>>2]](r4,r16,0)<<24>>24;r16=HEAP32[r8];r1=r16+12|0;r9=HEAP32[r1>>2];if((r9|0)==(HEAP32[r16+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+40>>2]](r16);r17=r2;r18=r5;r19=r14,r20=r19>>2}else{HEAP32[r1>>2]=r9+4;r17=r2;r18=r5;r19=r14,r20=r19>>2}while(1){r21=r17-48|0;r14=r18-1|0;r5=HEAP32[r8],r2=r5>>2;do{if((r5|0)==0){r22=0}else{r9=HEAP32[r2+3];if((r9|0)==(HEAP32[r2+4]|0)){r23=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r5)}else{r23=HEAP32[r9>>2]}if((r23|0)==-1){HEAP32[r8]=0;r22=0;break}else{r22=HEAP32[r8];break}}}while(0);r5=(r22|0)==0;if((r19|0)==0){r24=r22,r25=r24>>2;r26=0,r27=r26>>2}else{r2=HEAP32[r20+3];if((r2|0)==(HEAP32[r20+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r19)}else{r28=HEAP32[r2>>2]}if((r28|0)==-1){HEAP32[r12]=0;r29=0}else{r29=r19}r24=HEAP32[r8],r25=r24>>2;r26=r29,r27=r26>>2}r30=(r26|0)==0;if(!((r5^r30)&(r14|0)>0)){break}r5=HEAP32[r25+3];if((r5|0)==(HEAP32[r25+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r31=HEAP32[r5>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r4,2048,r31)){r15=r21;r3=2294;break}r5=(FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+52>>2]](r4,r31,0)<<24>>24)+(r21*10&-1)|0;r2=HEAP32[r8];r9=r2+12|0;r1=HEAP32[r9>>2];if((r1|0)==(HEAP32[r2+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+40>>2]](r2);r17=r5;r18=r14;r19=r26,r20=r19>>2;continue}else{HEAP32[r9>>2]=r1+4;r17=r5;r18=r14;r19=r26,r20=r19>>2;continue}}if(r3==2294){STACKTOP=r7;return r15}do{if((r24|0)==0){r32=1}else{r19=HEAP32[r25+3];if((r19|0)==(HEAP32[r25+4]|0)){r33=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r33=HEAP32[r19>>2]}if((r33|0)==-1){HEAP32[r8]=0;r32=1;break}else{r32=(HEAP32[r8]|0)==0;break}}}while(0);do{if(r30){r3=2286}else{r8=HEAP32[r27+3];if((r8|0)==(HEAP32[r27+4]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)}else{r34=HEAP32[r8>>2]}if((r34|0)==-1){HEAP32[r12]=0;r3=2286;break}if(r32^(r26|0)==0){r15=r21}else{break}STACKTOP=r7;return r15}}while(0);do{if(r3==2286){if(r32){break}else{r15=r21}STACKTOP=r7;return r15}}while(0);HEAP32[r6]=HEAP32[r6]|2;r15=r21;STACKTOP=r7;return r15}function __ZNKSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPK2tmcc(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=STACKTOP;STACKTOP=STACKTOP+112|0;r4=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r4>>2];r4=r5;r9=r5+8;r10=r9|0;r11=r4|0;HEAP8[r11]=37;r12=r4+1|0;HEAP8[r12]=r7;r13=r4+2|0;HEAP8[r13]=r8;HEAP8[r4+3|0]=0;if(r8<<24>>24!=0){HEAP8[r12]=r8;HEAP8[r13]=r7}r7=_strftime(r10,100,r11,r6,HEAP32[r2+8>>2]);r2=r9+r7|0;r9=HEAP32[r3>>2];if((r7|0)==0){r14=r9;r15=r1|0;HEAP32[r15>>2]=r14;STACKTOP=r5;return}else{r16=r9;r17=r10}while(1){r10=HEAP8[r17];if((r16|0)==0){r18=0}else{r9=r16+24|0;r7=HEAP32[r9>>2];if((r7|0)==(HEAP32[r16+28>>2]|0)){r19=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+52>>2]](r16,r10&255)}else{HEAP32[r9>>2]=r7+1;HEAP8[r7]=r10;r19=r10&255}r18=(r19|0)==-1?0:r16}r10=r17+1|0;if((r10|0)==(r2|0)){r14=r18;break}else{r16=r18;r17=r10}}r15=r1|0;HEAP32[r15>>2]=r14;STACKTOP=r5;return}function __ZNSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){var r2,r3,r4,r5,r6;r2=r1;r3=r1+8|0;r4=HEAP32[r3>>2];do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r5=_newlocale(1,2e3,0);HEAP32[3292]=r5}}while(0);if((r4|0)==(HEAP32[3292]|0)){r6=r1|0;__ZNSt3__114__shared_countD2Ev(r6);__ZdlPv(r2);return}_freelocale(HEAP32[r3>>2]);r6=r1|0;__ZNSt3__114__shared_countD2Ev(r6);__ZdlPv(r2);return}function __ZNSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){var r2,r3,r4,r5;r2=r1+8|0;r3=HEAP32[r2>>2];do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r4=_newlocale(1,2e3,0);HEAP32[3292]=r4}}while(0);if((r3|0)==(HEAP32[3292]|0)){r5=r1|0;__ZNSt3__114__shared_countD2Ev(r5);return}_freelocale(HEAP32[r2>>2]);r5=r1|0;__ZNSt3__114__shared_countD2Ev(r5);return}function __ZNSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){var r2,r3,r4,r5,r6;r2=r1;r3=r1+8|0;r4=HEAP32[r3>>2];do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r5=_newlocale(1,2e3,0);HEAP32[3292]=r5}}while(0);if((r4|0)==(HEAP32[3292]|0)){r6=r1|0;__ZNSt3__114__shared_countD2Ev(r6);__ZdlPv(r2);return}_freelocale(HEAP32[r3>>2]);r6=r1|0;__ZNSt3__114__shared_countD2Ev(r6);__ZdlPv(r2);return}function __ZNKSt3__110moneypunctIcLb0EE16do_decimal_pointEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb0EE16do_thousands_sepEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb0EE14do_frac_digitsEv(r1){return 0}function __ZNKSt3__110moneypunctIcLb1EE16do_decimal_pointEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb1EE16do_thousands_sepEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb1EE14do_frac_digitsEv(r1){return 0}function __ZNKSt3__110moneypunctIwLb0EE16do_decimal_pointEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb0EE16do_thousands_sepEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb0EE14do_frac_digitsEv(r1){return 0}function __ZNKSt3__110moneypunctIwLb1EE16do_decimal_pointEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb1EE16do_thousands_sepEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb1EE14do_frac_digitsEv(r1){return 0}function __ZNSt3__112__do_nothingEPv(r1){return}function __ZNKSt3__110moneypunctIcLb0EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIcLb0EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIcLb1EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIcLb1EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb0EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb0EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb1EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb1EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPK2tmcc(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+408|0;r4=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r4>>2];r4=r5;r9=r5+400;r10=r4|0;HEAP32[r9>>2]=r4+400;__ZNKSt3__110__time_put8__do_putEPwRS1_PK2tmcc(r2+8|0,r10,r9,r6,r7,r8);r8=HEAP32[r9>>2];r9=HEAP32[r3>>2];if((r10|0)==(r8|0)){r11=r9;r12=r1|0;HEAP32[r12>>2]=r11;STACKTOP=r5;return}else{r13=r9;r14=r10}while(1){r10=HEAP32[r14>>2];if((r13|0)==0){r15=0}else{r9=r13+24|0;r3=HEAP32[r9>>2];if((r3|0)==(HEAP32[r13+28>>2]|0)){r16=FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+52>>2]](r13,r10)}else{HEAP32[r9>>2]=r3+4;HEAP32[r3>>2]=r10;r16=r10}r15=(r16|0)==-1?0:r13}r10=r14+4|0;if((r10|0)==(r8|0)){r11=r15;break}else{r13=r15;r14=r10}}r12=r1|0;HEAP32[r12>>2]=r11;STACKTOP=r5;return}function __ZNSt3__110moneypunctIcLb0EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110moneypunctIcLb0EED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__110moneypunctIcLb0EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb0EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb0EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb0EE16do_negative_signEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEjc(r1,1,45);return}function __ZNSt3__110moneypunctIcLb1EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110moneypunctIcLb1EED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__110moneypunctIcLb1EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb1EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb1EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb1EE16do_negative_signEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEjc(r1,1,45);return}function __ZNSt3__110moneypunctIwLb0EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110moneypunctIwLb0EED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__110moneypunctIwLb0EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb0EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb0EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb0EE16do_negative_signEv(r1,r2){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEjw(r1,1,45);return}function __ZNSt3__110moneypunctIwLb1EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__110moneypunctIwLb1EED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__110moneypunctIwLb1EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb1EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb1EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb1EE16do_negative_signEv(r1,r2){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEjw(r1,1,45);return}function __ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){var r2,r3,r4,r5;r2=r1+8|0;r3=HEAP32[r2>>2];do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r4=_newlocale(1,2e3,0);HEAP32[3292]=r4}}while(0);if((r3|0)==(HEAP32[3292]|0)){r5=r1|0;__ZNSt3__114__shared_countD2Ev(r5);return}_freelocale(HEAP32[r2>>2]);r5=r1|0;__ZNSt3__114__shared_countD2Ev(r5);return}function __ZNKSt3__110__time_put8__do_putEPwRS1_PK2tmcc(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14;r7=STACKTOP;STACKTOP=STACKTOP+120|0;r8=r7;r9=r7+112;r10=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r11=r7+8|0;r12=r8|0;HEAP8[r12]=37;r13=r8+1|0;HEAP8[r13]=r5;r14=r8+2|0;HEAP8[r14]=r6;HEAP8[r8+3|0]=0;if(r6<<24>>24!=0){HEAP8[r13]=r6;HEAP8[r14]=r5}r5=r1|0;_strftime(r11,100,r12,r4,HEAP32[r5>>2]);HEAP32[r9>>2]=0;HEAP32[r9+4>>2]=0;HEAP32[r10>>2]=r11;r11=HEAP32[r3>>2]-r2>>2;r4=_uselocale(HEAP32[r5>>2]);r5=_mbsrtowcs(r2,r10,r11,r9);if((r4|0)!=0){_uselocale(r4)}if((r5|0)==-1){__ZNSt3__121__throw_runtime_errorEPKc(1304)}else{HEAP32[r3>>2]=(r5<<2)+r2;STACKTOP=r7;return}}function __ZNKSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43;r2=0;r9=0;r10=STACKTOP;STACKTOP=STACKTOP+280|0;r11=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r11>>2];r11=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r11>>2];r11=r10,r12=r11>>2;r13=r10+16;r14=r10+120;r15=r10+128;r16=r10+136;r17=r10+144;r18=r10+152;r19=r10+160;r20=r10+176;r21=(r14|0)>>2;HEAP32[r21]=r13;r22=r14+4|0;HEAP32[r22>>2]=452;r23=r13+100|0;__ZNKSt3__18ios_base6getlocEv(r16,r6);r13=r16|0;r24=HEAP32[r13>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r12]=14528;HEAP32[r12+1]=26;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r11,260)}r11=HEAP32[3633]-1|0;r12=HEAP32[r24+8>>2];do{if(HEAP32[r24+12>>2]-r12>>2>>>0>r11>>>0){r25=HEAP32[r12+(r11<<2)>>2];if((r25|0)==0){break}r26=r25;HEAP8[r17]=0;r27=(r4|0)>>2;HEAP32[r18>>2]=HEAP32[r27];do{if(__ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIcEERNS_10unique_ptrIcPFvPvEEERPcSM_(r3,r18,r5,r16,HEAP32[r6+4>>2],r7,r17,r26,r14,r15,r23)){r28=r19|0;FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+32>>2]](r26,2992,3002,r28);r29=r20|0;r30=HEAP32[r15>>2];r31=HEAP32[r21];r32=r30-r31|0;do{if((r32|0)>98){r33=_malloc(r32+2|0);if((r33|0)!=0){r34=r33;r35=r33;break}__ZSt17__throw_bad_allocv();r34=0;r35=0}else{r34=r29;r35=0}}while(0);if((HEAP8[r17]&1)==0){r36=r34}else{HEAP8[r34]=45;r36=r34+1|0}if(r31>>>0<r30>>>0){r32=r19+10|0;r33=r19;r37=r36;r38=r31;while(1){r39=r28;while(1){if((r39|0)==(r32|0)){r40=r32;break}if((HEAP8[r39]|0)==(HEAP8[r38]|0)){r40=r39;break}else{r39=r39+1|0}}HEAP8[r37]=HEAP8[r40-r33+2992|0];r39=r38+1|0;r41=r37+1|0;if(r39>>>0<HEAP32[r15>>2]>>>0){r37=r41;r38=r39}else{r42=r41;break}}}else{r42=r36}HEAP8[r42]=0;r38=_sscanf(r29,2136,(r9=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r9>>2]=r8,r9));STACKTOP=r9;if((r38|0)==1){if((r35|0)==0){break}_free(r35);break}r38=___cxa_allocate_exception(8);__ZNSt13runtime_errorC2EPKc(r38,2080);___cxa_throw(r38,9320,44)}}while(0);r26=r3|0;r25=HEAP32[r26>>2],r38=r25>>2;do{if((r25|0)==0){r43=0}else{if((HEAP32[r38+3]|0)!=(HEAP32[r38+4]|0)){r43=r25;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r38]+36>>2]](r25)|0)!=-1){r43=r25;break}HEAP32[r26>>2]=0;r43=0}}while(0);r26=(r43|0)==0;r25=HEAP32[r27],r38=r25>>2;do{if((r25|0)==0){r2=2470}else{if((HEAP32[r38+3]|0)!=(HEAP32[r38+4]|0)){if(r26){break}else{r2=2472;break}}if((FUNCTION_TABLE[HEAP32[HEAP32[r38]+36>>2]](r25)|0)==-1){HEAP32[r27]=0;r2=2470;break}else{if(r26^(r25|0)==0){break}else{r2=2472;break}}}}while(0);if(r2==2470){if(r26){r2=2472}}if(r2==2472){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r43;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r13>>2]|0);r25=HEAP32[r21];HEAP32[r21]=0;if((r25|0)==0){STACKTOP=r10;return}FUNCTION_TABLE[HEAP32[r22>>2]](r25);STACKTOP=r10;return}}while(0);r10=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r10);___cxa_throw(r10,9304,382)}function __ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIcEERNS_10unique_ptrIcPFvPvEEERPcSM_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147;r12=r10>>2;r10=r6>>2;r6=0;r13=STACKTOP;STACKTOP=STACKTOP+440|0;r14=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r14>>2];r14=r13;r15=r13+400;r16=r13+408;r17=r13+416;r18=r13+424;r19=r18,r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r22=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r23=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=STACKTOP,r26=r25>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r28=r14|0;HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;r20=r21,r29=r20>>2;r30=r22,r31=r30>>2;r32=r23,r33=r32>>2;r34=r24,r35=r34>>2;HEAP32[r29]=0;HEAP32[r29+1]=0;HEAP32[r29+2]=0;HEAP32[r31]=0;HEAP32[r31+1]=0;HEAP32[r31+2]=0;HEAP32[r33]=0;HEAP32[r33+1]=0;HEAP32[r33+2]=0;HEAP32[r35]=0;HEAP32[r35+1]=0;HEAP32[r35+2]=0;__ZNSt3__111__money_getIcE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_SF_Ri(r3,r4,r15,r16,r17,r18,r21,r22,r23,r25);r25=(r9|0)>>2;HEAP32[r12]=HEAP32[r25];r4=(r1|0)>>2;r1=(r2|0)>>2;r2=(r8+8|0)>>2;r8=r23+1|0;r3=(r23+4|0)>>2;r35=r23+8|0;r33=r22+1|0;r31=(r22+4|0)>>2;r29=r22+8|0;r36=(r5&512|0)!=0;r5=r21+1|0;r37=(r21+4|0)>>2;r38=(r21+8|0)>>2;r39=r24+1|0;r40=r24+4|0;r41=r24+8|0;r42=r15+3|0;r43=(r9+4|0)>>2;r9=r18+4|0;r44=r11;r11=452;r45=r28;r46=r28;r28=r14+400|0;r14=0;r47=0;L2:while(1){r48=HEAP32[r4],r49=r48>>2;do{if((r48|0)==0){r50=0}else{if((HEAP32[r49+3]|0)!=(HEAP32[r49+4]|0)){r50=r48;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r49]+36>>2]](r48)|0)==-1){HEAP32[r4]=0;r50=0;break}else{r50=HEAP32[r4];break}}}while(0);r48=(r50|0)==0;r49=HEAP32[r1],r51=r49>>2;do{if((r49|0)==0){r6=15}else{if((HEAP32[r51+3]|0)!=(HEAP32[r51+4]|0)){if(r48){r52=r49;break}else{r53=r11;r54=r45;r55=r46;r56=r14;r6=267;break L2}}if((FUNCTION_TABLE[HEAP32[HEAP32[r51]+36>>2]](r49)|0)==-1){HEAP32[r1]=0;r6=15;break}else{if(r48){r52=r49;break}else{r53=r11;r54=r45;r55=r46;r56=r14;r6=267;break L2}}}}while(0);if(r6==15){r6=0;if(r48){r53=r11;r54=r45;r55=r46;r56=r14;r6=267;break}else{r52=0}}r49=HEAP8[r15+r47|0]|0;do{if((r49|0)==1){if((r47|0)==3){r53=r11;r54=r45;r55=r46;r56=r14;r6=267;break L2}r51=HEAP32[r4],r57=r51>>2;r58=HEAP32[r57+3];if((r58|0)==(HEAP32[r57+4]|0)){r59=FUNCTION_TABLE[HEAP32[HEAP32[r57]+36>>2]](r51)&255}else{r59=HEAP8[r58]}if(r59<<24>>24<=-1){r6=40;break L2}if((HEAP16[HEAP32[r2]+(r59<<24>>24<<1)>>1]&8192)==0){r6=40;break L2}r58=HEAP32[r4];r51=r58+12|0;r57=HEAP32[r51>>2];if((r57|0)==(HEAP32[r58+16>>2]|0)){r60=FUNCTION_TABLE[HEAP32[HEAP32[r58>>2]+40>>2]](r58)&255}else{HEAP32[r51>>2]=r57+1;r60=HEAP8[r57]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r24,r60);r6=41}else if((r49|0)==0){r6=41}else if((r49|0)==3){r57=HEAP8[r30];r51=r57&255;r58=(r51&1|0)==0?r51>>>1:HEAP32[r31];r51=HEAP8[r32];r61=r51&255;r62=(r61&1|0)==0?r61>>>1:HEAP32[r3];if((r58|0)==(-r62|0)){r63=r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break}r61=(r58|0)==0;r58=HEAP32[r4],r69=r58>>2;r70=HEAP32[r69+3];r71=HEAP32[r69+4];r72=(r70|0)==(r71|0);if(!(r61|(r62|0)==0)){if(r72){r62=FUNCTION_TABLE[HEAP32[HEAP32[r69]+36>>2]](r58)&255;r73=HEAP32[r4];r74=r62;r75=HEAP8[r30];r76=r73;r77=HEAP32[r73+12>>2];r78=HEAP32[r73+16>>2]}else{r74=HEAP8[r70];r75=r57;r76=r58;r77=r70;r78=r71}r71=r76+12|0;r73=(r77|0)==(r78|0);if(r74<<24>>24==(HEAP8[(r75&1)==0?r33:HEAP32[r29>>2]]|0)){if(r73){FUNCTION_TABLE[HEAP32[HEAP32[r76>>2]+40>>2]](r76)}else{HEAP32[r71>>2]=r77+1}r71=HEAPU8[r30];r63=((r71&1|0)==0?r71>>>1:HEAP32[r31])>>>0>1?r22:r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break}if(r73){r79=FUNCTION_TABLE[HEAP32[HEAP32[r76>>2]+36>>2]](r76)&255}else{r79=HEAP8[r77]}if(r79<<24>>24!=(HEAP8[(HEAP8[r32]&1)==0?r8:HEAP32[r35>>2]]|0)){r6=107;break L2}r73=HEAP32[r4];r71=r73+12|0;r62=HEAP32[r71>>2];if((r62|0)==(HEAP32[r73+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r73>>2]+40>>2]](r73)}else{HEAP32[r71>>2]=r62+1}HEAP8[r7]=1;r62=HEAPU8[r32];r63=((r62&1|0)==0?r62>>>1:HEAP32[r3])>>>0>1?r23:r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break}if(r61){if(r72){r80=FUNCTION_TABLE[HEAP32[HEAP32[r69]+36>>2]](r58)&255;r81=HEAP8[r32]}else{r80=HEAP8[r70];r81=r51}if(r80<<24>>24!=(HEAP8[(r81&1)==0?r8:HEAP32[r35>>2]]|0)){r63=r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break}r51=HEAP32[r4];r61=r51+12|0;r62=HEAP32[r61>>2];if((r62|0)==(HEAP32[r51+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r51>>2]+40>>2]](r51)}else{HEAP32[r61>>2]=r62+1}HEAP8[r7]=1;r62=HEAPU8[r32];r63=((r62&1|0)==0?r62>>>1:HEAP32[r3])>>>0>1?r23:r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break}if(r72){r82=FUNCTION_TABLE[HEAP32[HEAP32[r69]+36>>2]](r58)&255;r83=HEAP8[r30]}else{r82=HEAP8[r70];r83=r57}if(r82<<24>>24!=(HEAP8[(r83&1)==0?r33:HEAP32[r29>>2]]|0)){HEAP8[r7]=1;r63=r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break}r57=HEAP32[r4];r70=r57+12|0;r58=HEAP32[r70>>2];if((r58|0)==(HEAP32[r57+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]+40>>2]](r57)}else{HEAP32[r70>>2]=r58+1}r58=HEAPU8[r30];r63=((r58&1|0)==0?r58>>>1:HEAP32[r31])>>>0>1?r22:r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44}else if((r49|0)==2){if(!((r14|0)!=0|r47>>>0<2)){if((r47|0)==2){r84=(HEAP8[r42]|0)!=0}else{r84=0}if(!(r36|r84)){r63=0;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break}}r58=HEAP8[r20];r70=(r58&1)==0?r5:HEAP32[r38];L98:do{if((r47|0)==0){r85=r70}else{if(HEAPU8[r15+(r47-1)|0]>=2){r85=r70;break}r57=r58&255;r69=r70+((r57&1|0)==0?r57>>>1:HEAP32[r37])|0;r57=r70;while(1){if((r57|0)==(r69|0)){r86=r69;break}r72=HEAP8[r57];if(r72<<24>>24<=-1){r86=r57;break}if((HEAP16[HEAP32[r2]+(r72<<24>>24<<1)>>1]&8192)==0){r86=r57;break}else{r57=r57+1|0}}r57=r86-r70|0;r69=HEAP8[r34];r72=r69&255;r62=(r72&1|0)==0?r72>>>1:HEAP32[r40>>2];if(r57>>>0>r62>>>0){r85=r70;break}r72=(r69&1)==0?r39:HEAP32[r41>>2];r69=r72+r62|0;if((r86|0)==(r70|0)){r85=r70;break}r61=r70;r51=r72+(r62-r57)|0;while(1){if((HEAP8[r51]|0)!=(HEAP8[r61]|0)){r85=r70;break L98}r57=r51+1|0;if((r57|0)==(r69|0)){r85=r86;break}else{r61=r61+1|0;r51=r57}}}}while(0);r51=r58&255;L112:do{if((r85|0)==(r70+((r51&1|0)==0?r51>>>1:HEAP32[r37])|0)){r87=r85}else{r61=r52,r69=r61>>2;r57=r85;while(1){r62=HEAP32[r4],r72=r62>>2;do{if((r62|0)==0){r88=0}else{if((HEAP32[r72+3]|0)!=(HEAP32[r72+4]|0)){r88=r62;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r72]+36>>2]](r62)|0)==-1){HEAP32[r4]=0;r88=0;break}else{r88=HEAP32[r4];break}}}while(0);r62=(r88|0)==0;do{if((r61|0)==0){r6=136}else{if((HEAP32[r69+3]|0)!=(HEAP32[r69+4]|0)){if(r62){r89=r61;break}else{r87=r57;break L112}}if((FUNCTION_TABLE[HEAP32[HEAP32[r69]+36>>2]](r61)|0)==-1){HEAP32[r1]=0;r6=136;break}else{if(r62){r89=r61;break}else{r87=r57;break L112}}}}while(0);if(r6==136){r6=0;if(r62){r87=r57;break L112}else{r89=0}}r72=HEAP32[r4],r71=r72>>2;r73=HEAP32[r71+3];if((r73|0)==(HEAP32[r71+4]|0)){r90=FUNCTION_TABLE[HEAP32[HEAP32[r71]+36>>2]](r72)&255}else{r90=HEAP8[r73]}if(r90<<24>>24!=(HEAP8[r57]|0)){r87=r57;break L112}r73=HEAP32[r4];r72=r73+12|0;r71=HEAP32[r72>>2];if((r71|0)==(HEAP32[r73+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r73>>2]+40>>2]](r73)}else{HEAP32[r72>>2]=r71+1}r71=r57+1|0;r72=HEAP8[r20];r73=r72&255;if((r71|0)==(((r72&1)==0?r5:HEAP32[r38])+((r73&1|0)==0?r73>>>1:HEAP32[r37])|0)){r87=r71;break}else{r61=r89,r69=r61>>2;r57=r71}}}}while(0);if(!r36){r63=r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break}r51=HEAP8[r20];r70=r51&255;if((r87|0)==(((r51&1)==0?r5:HEAP32[r38])+((r70&1|0)==0?r70>>>1:HEAP32[r37])|0)){r63=r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44}else{r6=149;break L2}}else if((r49|0)==4){r70=0;r51=r28;r58=r46;r57=r45;r61=r11;r69=r44;L147:while(1){r71=HEAP32[r4],r73=r71>>2;do{if((r71|0)==0){r91=0}else{if((HEAP32[r73+3]|0)!=(HEAP32[r73+4]|0)){r91=r71;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r73]+36>>2]](r71)|0)==-1){HEAP32[r4]=0;r91=0;break}else{r91=HEAP32[r4];break}}}while(0);r71=(r91|0)==0;r73=HEAP32[r1],r72=r73>>2;do{if((r73|0)==0){r6=162}else{if((HEAP32[r72+3]|0)!=(HEAP32[r72+4]|0)){if(r71){break}else{break L147}}if((FUNCTION_TABLE[HEAP32[HEAP32[r72]+36>>2]](r73)|0)==-1){HEAP32[r1]=0;r6=162;break}else{if(r71){break}else{break L147}}}}while(0);if(r6==162){r6=0;if(r71){break}}r73=HEAP32[r4],r72=r73>>2;r92=HEAP32[r72+3];if((r92|0)==(HEAP32[r72+4]|0)){r93=FUNCTION_TABLE[HEAP32[HEAP32[r72]+36>>2]](r73)&255}else{r93=HEAP8[r92]}do{if(r93<<24>>24>-1){if((HEAP16[HEAP32[r2]+(r93<<24>>24<<1)>>1]&2048)==0){r6=181;break}r92=HEAP32[r12];if((r92|0)==(r69|0)){r73=(HEAP32[r43]|0)!=452;r72=HEAP32[r25];r94=r69-r72|0;r95=r94>>>0<2147483647?r94<<1:-1;r96=_realloc(r73?r72:0,r95);if((r96|0)==0){__ZSt17__throw_bad_allocv()}do{if(r73){HEAP32[r25]=r96;r97=r96}else{r72=HEAP32[r25];HEAP32[r25]=r96;if((r72|0)==0){r97=r96;break}FUNCTION_TABLE[HEAP32[r43]](r72);r97=HEAP32[r25]}}while(0);HEAP32[r43]=228;r96=r97+r94|0;HEAP32[r12]=r96;r98=HEAP32[r25]+r95|0;r99=r96}else{r98=r69;r99=r92}HEAP32[r12]=r99+1;HEAP8[r99]=r93;r100=r70+1|0;r101=r51;r102=r58;r103=r57;r104=r61;r105=r98}else{r6=181}}while(0);if(r6==181){r6=0;r71=HEAPU8[r19];if((((r71&1|0)==0?r71>>>1:HEAP32[r9>>2])|0)==0|(r70|0)==0){break}if(r93<<24>>24!=(HEAP8[r17]|0)){break}if((r58|0)==(r51|0)){r71=r58-r57|0;r96=r71>>>0<2147483647?r71<<1:-1;if((r61|0)==452){r106=0}else{r106=r57}r73=_realloc(r106,r96);r62=r73;if((r73|0)==0){__ZSt17__throw_bad_allocv()}r107=(r96>>>2<<2)+r62|0;r108=(r71>>2<<2)+r62|0;r109=r62;r110=228}else{r107=r51;r108=r58;r109=r57;r110=r61}HEAP32[r108>>2]=r70;r100=0;r101=r107;r102=r108+4|0;r103=r109;r104=r110;r105=r69}r62=HEAP32[r4];r71=r62+12|0;r96=HEAP32[r71>>2];if((r96|0)==(HEAP32[r62+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+40>>2]](r62);r70=r100;r51=r101;r58=r102;r57=r103;r61=r104;r69=r105;continue}else{HEAP32[r71>>2]=r96+1;r70=r100;r51=r101;r58=r102;r57=r103;r61=r104;r69=r105;continue}}if((r57|0)==(r58|0)|(r70|0)==0){r111=r51;r112=r58;r113=r57;r114=r61}else{if((r58|0)==(r51|0)){r96=r58-r57|0;r71=r96>>>0<2147483647?r96<<1:-1;if((r61|0)==452){r115=0}else{r115=r57}r62=_realloc(r115,r71);r73=r62;if((r62|0)==0){__ZSt17__throw_bad_allocv()}r116=(r71>>>2<<2)+r73|0;r117=(r96>>2<<2)+r73|0;r118=r73;r119=228}else{r116=r51;r117=r58;r118=r57;r119=r61}HEAP32[r117>>2]=r70;r111=r116;r112=r117+4|0;r113=r118;r114=r119}if((HEAP32[r26]|0)>0){r73=HEAP32[r4],r96=r73>>2;do{if((r73|0)==0){r120=0}else{if((HEAP32[r96+3]|0)!=(HEAP32[r96+4]|0)){r120=r73;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r96]+36>>2]](r73)|0)==-1){HEAP32[r4]=0;r120=0;break}else{r120=HEAP32[r4];break}}}while(0);r73=(r120|0)==0;r96=HEAP32[r1],r70=r96>>2;do{if((r96|0)==0){r6=214}else{if((HEAP32[r70+3]|0)!=(HEAP32[r70+4]|0)){if(r73){r121=r96;break}else{r6=221;break L2}}if((FUNCTION_TABLE[HEAP32[HEAP32[r70]+36>>2]](r96)|0)==-1){HEAP32[r1]=0;r6=214;break}else{if(r73){r121=r96;break}else{r6=221;break L2}}}}while(0);if(r6==214){r6=0;if(r73){r6=221;break L2}else{r121=0}}r96=HEAP32[r4],r70=r96>>2;r61=HEAP32[r70+3];if((r61|0)==(HEAP32[r70+4]|0)){r122=FUNCTION_TABLE[HEAP32[HEAP32[r70]+36>>2]](r96)&255}else{r122=HEAP8[r61]}if(r122<<24>>24!=(HEAP8[r16]|0)){r6=221;break L2}r61=HEAP32[r4];r96=r61+12|0;r70=HEAP32[r96>>2];if((r70|0)==(HEAP32[r61+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r61>>2]+40>>2]](r61);r123=r69;r124=r121,r125=r124>>2}else{HEAP32[r96>>2]=r70+1;r123=r69;r124=r121,r125=r124>>2}while(1){r70=HEAP32[r4],r96=r70>>2;do{if((r70|0)==0){r126=0}else{if((HEAP32[r96+3]|0)!=(HEAP32[r96+4]|0)){r126=r70;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r96]+36>>2]](r70)|0)==-1){HEAP32[r4]=0;r126=0;break}else{r126=HEAP32[r4];break}}}while(0);r70=(r126|0)==0;do{if((r124|0)==0){r6=237}else{if((HEAP32[r125+3]|0)!=(HEAP32[r125+4]|0)){if(r70){r127=r124;break}else{r6=245;break L2}}if((FUNCTION_TABLE[HEAP32[HEAP32[r125]+36>>2]](r124)|0)==-1){HEAP32[r1]=0;r6=237;break}else{if(r70){r127=r124;break}else{r6=245;break L2}}}}while(0);if(r6==237){r6=0;if(r70){r6=245;break L2}else{r127=0}}r96=HEAP32[r4],r61=r96>>2;r57=HEAP32[r61+3];if((r57|0)==(HEAP32[r61+4]|0)){r128=FUNCTION_TABLE[HEAP32[HEAP32[r61]+36>>2]](r96)&255}else{r128=HEAP8[r57]}if(r128<<24>>24<=-1){r6=245;break L2}if((HEAP16[HEAP32[r2]+(r128<<24>>24<<1)>>1]&2048)==0){r6=245;break L2}r57=HEAP32[r12];if((r57|0)==(r123|0)){r96=(HEAP32[r43]|0)!=452;r61=HEAP32[r25];r58=r123-r61|0;r51=r58>>>0<2147483647?r58<<1:-1;r71=_realloc(r96?r61:0,r51);if((r71|0)==0){__ZSt17__throw_bad_allocv()}do{if(r96){HEAP32[r25]=r71;r129=r71}else{r61=HEAP32[r25];HEAP32[r25]=r71;if((r61|0)==0){r129=r71;break}FUNCTION_TABLE[HEAP32[r43]](r61);r129=HEAP32[r25]}}while(0);HEAP32[r43]=228;r71=r129+r58|0;HEAP32[r12]=r71;r130=HEAP32[r25]+r51|0;r131=r71}else{r130=r123;r131=r57}r71=HEAP32[r4],r96=r71>>2;r70=HEAP32[r96+3];if((r70|0)==(HEAP32[r96+4]|0)){r132=FUNCTION_TABLE[HEAP32[HEAP32[r96]+36>>2]](r71)&255;r133=HEAP32[r12]}else{r132=HEAP8[r70];r133=r131}HEAP32[r12]=r133+1;HEAP8[r133]=r132;r70=HEAP32[r26]-1|0;HEAP32[r26]=r70;r71=HEAP32[r4];r96=r71+12|0;r61=HEAP32[r96>>2];if((r61|0)==(HEAP32[r71+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r71>>2]+40>>2]](r71)}else{HEAP32[r96>>2]=r61+1}if((r70|0)>0){r123=r130;r124=r127,r125=r124>>2}else{r134=r130;break}}}else{r134=r69}if((HEAP32[r12]|0)==(HEAP32[r25]|0)){r6=265;break L2}else{r63=r14;r64=r111;r65=r112;r66=r113;r67=r114;r68=r134}}else{r63=r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44}}while(0);L301:do{if(r6==41){r6=0;if((r47|0)==3){r53=r11;r54=r45;r55=r46;r56=r14;r6=267;break L2}else{r135=r52,r136=r135>>2}while(1){r49=HEAP32[r4],r48=r49>>2;do{if((r49|0)==0){r137=0}else{if((HEAP32[r48+3]|0)!=(HEAP32[r48+4]|0)){r137=r49;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r48]+36>>2]](r49)|0)==-1){HEAP32[r4]=0;r137=0;break}else{r137=HEAP32[r4];break}}}while(0);r49=(r137|0)==0;do{if((r135|0)==0){r6=54}else{if((HEAP32[r136+3]|0)!=(HEAP32[r136+4]|0)){if(r49){r138=r135;break}else{r63=r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break L301}}if((FUNCTION_TABLE[HEAP32[HEAP32[r136]+36>>2]](r135)|0)==-1){HEAP32[r1]=0;r6=54;break}else{if(r49){r138=r135;break}else{r63=r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break L301}}}}while(0);if(r6==54){r6=0;if(r49){r63=r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break L301}else{r138=0}}r48=HEAP32[r4],r57=r48>>2;r51=HEAP32[r57+3];if((r51|0)==(HEAP32[r57+4]|0)){r139=FUNCTION_TABLE[HEAP32[HEAP32[r57]+36>>2]](r48)&255}else{r139=HEAP8[r51]}if(r139<<24>>24<=-1){r63=r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break L301}if((HEAP16[HEAP32[r2]+(r139<<24>>24<<1)>>1]&8192)==0){r63=r14;r64=r28;r65=r46;r66=r45;r67=r11;r68=r44;break L301}r51=HEAP32[r4];r48=r51+12|0;r57=HEAP32[r48>>2];if((r57|0)==(HEAP32[r51+16>>2]|0)){r140=FUNCTION_TABLE[HEAP32[HEAP32[r51>>2]+40>>2]](r51)&255}else{HEAP32[r48>>2]=r57+1;r140=HEAP8[r57]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r24,r140);r135=r138,r136=r135>>2}}}while(0);r69=r47+1|0;if(r69>>>0<4){r44=r68;r11=r67;r45=r66;r46=r65;r28=r64;r14=r63;r47=r69}else{r53=r67;r54=r66;r55=r65;r56=r63;r6=267;break}}L338:do{if(r6==40){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r45;r143=r11}else if(r6==107){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r45;r143=r11}else if(r6==149){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r45;r143=r11}else if(r6==221){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r113;r143=r114}else if(r6==245){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r113;r143=r114}else if(r6==265){HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r113;r143=r114}else if(r6==267){L346:do{if((r56|0)!=0){r63=r56;r65=r56+1|0;r66=r56+8|0;r67=r56+4|0;r47=1;L348:while(1){r14=HEAPU8[r63];if((r14&1|0)==0){r144=r14>>>1}else{r144=HEAP32[r67>>2]}if(r47>>>0>=r144>>>0){break L346}r14=HEAP32[r4],r64=r14>>2;do{if((r14|0)==0){r145=0}else{if((HEAP32[r64+3]|0)!=(HEAP32[r64+4]|0)){r145=r14;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r64]+36>>2]](r14)|0)==-1){HEAP32[r4]=0;r145=0;break}else{r145=HEAP32[r4];break}}}while(0);r14=(r145|0)==0;r64=HEAP32[r1],r49=r64>>2;do{if((r64|0)==0){r6=285}else{if((HEAP32[r49+3]|0)!=(HEAP32[r49+4]|0)){if(r14){break}else{break L348}}if((FUNCTION_TABLE[HEAP32[HEAP32[r49]+36>>2]](r64)|0)==-1){HEAP32[r1]=0;r6=285;break}else{if(r14){break}else{break L348}}}}while(0);if(r6==285){r6=0;if(r14){break}}r64=HEAP32[r4],r49=r64>>2;r28=HEAP32[r49+3];if((r28|0)==(HEAP32[r49+4]|0)){r146=FUNCTION_TABLE[HEAP32[HEAP32[r49]+36>>2]](r64)&255}else{r146=HEAP8[r28]}if((HEAP8[r63]&1)==0){r147=r65}else{r147=HEAP32[r66>>2]}if(r146<<24>>24!=(HEAP8[r147+r47|0]|0)){break}r28=r47+1|0;r64=HEAP32[r4];r49=r64+12|0;r46=HEAP32[r49>>2];if((r46|0)==(HEAP32[r64+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r64>>2]+40>>2]](r64);r47=r28;continue}else{HEAP32[r49>>2]=r46+1;r47=r28;continue}}HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r54;r143=r53;break L338}}while(0);if((r54|0)==(r55|0)){r141=1;r142=r55;r143=r53;break}HEAP32[r27>>2]=0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r18,r54,r55,r27);if((HEAP32[r27>>2]|0)==0){r141=1;r142=r54;r143=r53;break}HEAP32[r10]=HEAP32[r10]|4;r141=0;r142=r54;r143=r53}}while(0);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r24);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r23);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r22);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r21);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r18);if((r142|0)==0){STACKTOP=r13;return r141}FUNCTION_TABLE[r143](r142);STACKTOP=r13;return r141}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendIPcEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=r1;r5=r2;r6=HEAP8[r4];r7=r6&255;if((r7&1|0)==0){r8=r7>>>1}else{r8=HEAP32[r1+4>>2]}if((r6&1)==0){r9=10;r10=r6}else{r6=HEAP32[r1>>2];r9=(r6&-2)-1|0;r10=r6&255}r6=r3-r5|0;if((r3|0)==(r2|0)){return r1}if((r9-r8|0)>>>0<r6>>>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r1,r9,r8+r6-r9|0,r8,r8,0,0);r11=HEAP8[r4]}else{r11=r10}if((r11&1)==0){r12=r1+1|0}else{r12=HEAP32[r1+8>>2]}r11=r3+(r8-r5)|0;r5=r2;r2=r12+r8|0;while(1){HEAP8[r2]=HEAP8[r5];r10=r5+1|0;if((r10|0)==(r3|0)){break}else{r5=r10;r2=r2+1|0}}HEAP8[r12+r11|0]=0;r11=r8+r6|0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r11<<1&255;return r1}else{HEAP32[r1+4>>2]=r11;return r1}}function __ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__121__throw_runtime_errorEPKc(r1){var r2;r2=___cxa_allocate_exception(8);__ZNSt13runtime_errorC2EPKc(r2,r1);___cxa_throw(r2,9320,44)}function __ZNKSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIcS3_NS_9allocatorIcEEEE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30;r2=0;r9=STACKTOP;STACKTOP=STACKTOP+160|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r10>>2];r10=r9,r11=r10>>2;r12=r9+16;r13=r9+120;r14=r9+128;r15=r9+136;r16=r9+144;r17=r9+152;r18=(r13|0)>>2;HEAP32[r18]=r12;r19=r13+4|0;HEAP32[r19>>2]=452;r20=r12+100|0;__ZNKSt3__18ios_base6getlocEv(r15,r6);r12=r15|0;r21=HEAP32[r12>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r11]=14528;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r10,260)}r10=HEAP32[3633]-1|0;r11=HEAP32[r21+8>>2];do{if(HEAP32[r21+12>>2]-r11>>2>>>0>r10>>>0){r22=HEAP32[r11+(r10<<2)>>2];if((r22|0)==0){break}r23=r22;HEAP8[r16]=0;r24=r4|0;r25=HEAP32[r24>>2],r26=r25>>2;HEAP32[r17>>2]=r25;if(__ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIcEERNS_10unique_ptrIcPFvPvEEERPcSM_(r3,r17,r5,r15,HEAP32[r6+4>>2],r7,r16,r23,r13,r14,r20)){r27=r8;if((HEAP8[r27]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r27]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}r27=r22;if((HEAP8[r16]&1)!=0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r8,FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+28>>2]](r23,45))}r22=FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+28>>2]](r23,48);r23=HEAP32[r14>>2];r27=r23-1|0;r28=HEAP32[r18];while(1){if(r28>>>0>=r27>>>0){break}if((HEAP8[r28]|0)==r22<<24>>24){r28=r28+1|0}else{break}}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendIPcEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r8,r28,r23)}r22=r3|0;r27=HEAP32[r22>>2],r29=r27>>2;do{if((r27|0)==0){r30=0}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r30=r27;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r27)|0)!=-1){r30=r27;break}HEAP32[r22>>2]=0;r30=0}}while(0);r22=(r30|0)==0;do{if((r25|0)==0){r2=365}else{if((HEAP32[r26+3]|0)!=(HEAP32[r26+4]|0)){if(r22){break}else{r2=367;break}}if((FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)|0)==-1){HEAP32[r24>>2]=0;r2=365;break}else{if(r22^(r25|0)==0){break}else{r2=367;break}}}}while(0);if(r2==365){if(r22){r2=367}}if(r2==367){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r30;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r12>>2]|0);r25=HEAP32[r18];HEAP32[r18]=0;if((r25|0)==0){STACKTOP=r9;return}FUNCTION_TABLE[HEAP32[r19>>2]](r25);STACKTOP=r9;return}}while(0);r9=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r9);___cxa_throw(r9,9304,382)}function __ZNSt3__111__money_getIcE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_SF_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r11=STACKTOP;STACKTOP=STACKTOP+56|0;r12=r11,r13=r12>>2;r14=r11+16,r15=r14>>2;r16=r11+32;r17=r11+40;r18=r17>>2;r19=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r22=r21>>2;r23=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r24=r23>>2;r25=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=r26>>2;r28=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r29=r28>>2;r30=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r31=r30>>2;r32=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r33=r32>>2;if(r1){r1=HEAP32[r2>>2];if((HEAP32[3750]|0)!=-1){HEAP32[r15]=15e3;HEAP32[r15+1]=26;HEAP32[r15+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(15e3,r14,260)}r14=HEAP32[3751]-1|0;r15=HEAP32[r1+8>>2];if(HEAP32[r1+12>>2]-r15>>2>>>0<=r14>>>0){r34=___cxa_allocate_exception(4);r35=r34;__ZNSt8bad_castC2Ev(r35);___cxa_throw(r34,9304,382)}r1=HEAP32[r15+(r14<<2)>>2];if((r1|0)==0){r34=___cxa_allocate_exception(4);r35=r34;__ZNSt8bad_castC2Ev(r35);___cxa_throw(r34,9304,382)}r34=r1;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+44>>2]](r16,r34);r35=r3;tempBigInt=HEAP32[r16>>2];HEAP8[r35]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+3|0]=tempBigInt&255;r35=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r35]+32>>2]](r17,r34);r16=r9,r14=r16>>2;if((HEAP8[r16]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r16]=0}else{HEAP8[HEAP32[r9+8>>2]]=0;HEAP32[r9+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r14]=HEAP32[r18];HEAP32[r14+1]=HEAP32[r18+1];HEAP32[r14+2]=HEAP32[r18+2];HEAP32[r18]=0;HEAP32[r18+1]=0;HEAP32[r18+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r17);FUNCTION_TABLE[HEAP32[HEAP32[r35]+28>>2]](r19,r34);r17=r8,r18=r17>>2;if((HEAP8[r17]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r17]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r18]=HEAP32[r20];HEAP32[r18+1]=HEAP32[r20+1];HEAP32[r18+2]=HEAP32[r20+2];HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r19);r19=r1;r20=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+12>>2]](r34);HEAP8[r4]=r20;r20=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+16>>2]](r34);HEAP8[r5]=r20;FUNCTION_TABLE[HEAP32[HEAP32[r35]+20>>2]](r21,r34);r20=r6,r19=r20>>2;if((HEAP8[r20]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r20]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r19]=HEAP32[r22];HEAP32[r19+1]=HEAP32[r22+1];HEAP32[r19+2]=HEAP32[r22+2];HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r21);FUNCTION_TABLE[HEAP32[HEAP32[r35]+24>>2]](r23,r34);r35=r7,r21=r35>>2;if((HEAP8[r35]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r35]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r21]=HEAP32[r24];HEAP32[r21+1]=HEAP32[r24+1];HEAP32[r21+2]=HEAP32[r24+2];HEAP32[r24]=0;HEAP32[r24+1]=0;HEAP32[r24+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r23);r36=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r34);HEAP32[r10>>2]=r36;STACKTOP=r11;return}else{r34=HEAP32[r2>>2];if((HEAP32[3752]|0)!=-1){HEAP32[r13]=15008;HEAP32[r13+1]=26;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(15008,r12,260)}r12=HEAP32[3753]-1|0;r13=HEAP32[r34+8>>2];if(HEAP32[r34+12>>2]-r13>>2>>>0<=r12>>>0){r37=___cxa_allocate_exception(4);r38=r37;__ZNSt8bad_castC2Ev(r38);___cxa_throw(r37,9304,382)}r34=HEAP32[r13+(r12<<2)>>2];if((r34|0)==0){r37=___cxa_allocate_exception(4);r38=r37;__ZNSt8bad_castC2Ev(r38);___cxa_throw(r37,9304,382)}r37=r34;FUNCTION_TABLE[HEAP32[HEAP32[r34>>2]+44>>2]](r25,r37);r38=r3;tempBigInt=HEAP32[r25>>2];HEAP8[r38]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+3|0]=tempBigInt&255;r38=r34>>2;FUNCTION_TABLE[HEAP32[HEAP32[r38]+32>>2]](r26,r37);r25=r9,r3=r25>>2;if((HEAP8[r25]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r25]=0}else{HEAP8[HEAP32[r9+8>>2]]=0;HEAP32[r9+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r3]=HEAP32[r27];HEAP32[r3+1]=HEAP32[r27+1];HEAP32[r3+2]=HEAP32[r27+2];HEAP32[r27]=0;HEAP32[r27+1]=0;HEAP32[r27+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r26);FUNCTION_TABLE[HEAP32[HEAP32[r38]+28>>2]](r28,r37);r26=r8,r27=r26>>2;if((HEAP8[r26]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r26]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r27]=HEAP32[r29];HEAP32[r27+1]=HEAP32[r29+1];HEAP32[r27+2]=HEAP32[r29+2];HEAP32[r29]=0;HEAP32[r29+1]=0;HEAP32[r29+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r28);r28=r34;r29=FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+12>>2]](r37);HEAP8[r4]=r29;r29=FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+16>>2]](r37);HEAP8[r5]=r29;FUNCTION_TABLE[HEAP32[HEAP32[r38]+20>>2]](r30,r37);r29=r6,r5=r29>>2;if((HEAP8[r29]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r29]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r5]=HEAP32[r31];HEAP32[r5+1]=HEAP32[r31+1];HEAP32[r5+2]=HEAP32[r31+2];HEAP32[r31]=0;HEAP32[r31+1]=0;HEAP32[r31+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r30);FUNCTION_TABLE[HEAP32[HEAP32[r38]+24>>2]](r32,r37);r38=r7,r30=r38>>2;if((HEAP8[r38]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r38]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r30]=HEAP32[r33];HEAP32[r30+1]=HEAP32[r33+1];HEAP32[r30+2]=HEAP32[r33+2];HEAP32[r33]=0;HEAP32[r33+1]=0;HEAP32[r33+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r32);r36=FUNCTION_TABLE[HEAP32[HEAP32[r34>>2]+36>>2]](r37);HEAP32[r10>>2]=r36;STACKTOP=r11;return}}
function __ZNKSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45;r2=0;r9=0;r10=STACKTOP;STACKTOP=STACKTOP+600|0;r11=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r11>>2];r11=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r11>>2];r11=r10,r12=r11>>2;r13=r10+16;r14=r10+416;r15=r10+424;r16=r10+432;r17=r10+440;r18=r10+448;r19=r10+456;r20=r10+496;r21=(r14|0)>>2;HEAP32[r21]=r13;r22=r14+4|0;HEAP32[r22>>2]=452;r23=r13+400|0;__ZNKSt3__18ios_base6getlocEv(r16,r6);r13=r16|0;r24=HEAP32[r13>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r12]=14520;HEAP32[r12+1]=26;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r11,260)}r11=HEAP32[3631]-1|0;r12=HEAP32[r24+8>>2];do{if(HEAP32[r24+12>>2]-r12>>2>>>0>r11>>>0){r25=HEAP32[r12+(r11<<2)>>2];if((r25|0)==0){break}r26=r25;HEAP8[r17]=0;r27=(r4|0)>>2;HEAP32[r18>>2]=HEAP32[r27];do{if(__ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIwEERNS_10unique_ptrIwPFvPvEEERPwSM_(r3,r18,r5,r16,HEAP32[r6+4>>2],r7,r17,r26,r14,r15,r23)){r28=r19|0;FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+48>>2]](r26,2976,2986,r28);r29=r20|0;r30=HEAP32[r15>>2];r31=HEAP32[r21];r32=r30-r31|0;do{if((r32|0)>392){r33=_malloc(r32+8>>2|0);if((r33|0)!=0){r34=r33;r35=r33;break}__ZSt17__throw_bad_allocv();r34=0;r35=0}else{r34=r29;r35=0}}while(0);if((HEAP8[r17]&1)==0){r36=r34}else{HEAP8[r34]=45;r36=r34+1|0}if(r31>>>0<r30>>>0){r32=r19+40|0;r33=r19;r37=r36;r38=r31;while(1){r39=r28;while(1){if((r39|0)==(r32|0)){r40=r32;break}if((HEAP32[r39>>2]|0)==(HEAP32[r38>>2]|0)){r40=r39;break}else{r39=r39+4|0}}HEAP8[r37]=HEAP8[r40-r33+11904>>2|0];r39=r38+4|0;r41=r37+1|0;if(r39>>>0<HEAP32[r15>>2]>>>0){r37=r41;r38=r39}else{r42=r41;break}}}else{r42=r36}HEAP8[r42]=0;r38=_sscanf(r29,2136,(r9=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r9>>2]=r8,r9));STACKTOP=r9;if((r38|0)==1){if((r35|0)==0){break}_free(r35);break}r38=___cxa_allocate_exception(8);__ZNSt13runtime_errorC2EPKc(r38,2080);___cxa_throw(r38,9320,44)}}while(0);r26=r3|0;r25=HEAP32[r26>>2],r38=r25>>2;do{if((r25|0)==0){r43=0}else{r37=HEAP32[r38+3];if((r37|0)==(HEAP32[r38+4]|0)){r44=FUNCTION_TABLE[HEAP32[HEAP32[r38]+36>>2]](r25)}else{r44=HEAP32[r37>>2]}if((r44|0)!=-1){r43=r25;break}HEAP32[r26>>2]=0;r43=0}}while(0);r26=(r43|0)==0;r25=HEAP32[r27],r38=r25>>2;do{if((r25|0)==0){r2=483}else{r37=HEAP32[r38+3];if((r37|0)==(HEAP32[r38+4]|0)){r45=FUNCTION_TABLE[HEAP32[HEAP32[r38]+36>>2]](r25)}else{r45=HEAP32[r37>>2]}if((r45|0)==-1){HEAP32[r27]=0;r2=483;break}else{if(r26^(r25|0)==0){break}else{r2=485;break}}}}while(0);if(r2==483){if(r26){r2=485}}if(r2==485){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r43;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r13>>2]|0);r25=HEAP32[r21];HEAP32[r21]=0;if((r25|0)==0){STACKTOP=r10;return}FUNCTION_TABLE[HEAP32[r22>>2]](r25);STACKTOP=r10;return}}while(0);r10=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r10);___cxa_throw(r10,9304,382)}function __ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIwEERNS_10unique_ptrIwPFvPvEEERPwSM_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154;r12=r10>>2;r13=r6>>2;r6=0;r14=STACKTOP;STACKTOP=STACKTOP+448|0;r15=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r15>>2];r15=r14,r16=r15>>2;r17=r14+8;r18=r14+408;r19=r14+416;r20=r14+424;r21=r14+432;r22=r21,r23=r22>>2;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r16]=r11;r11=r17|0;HEAP32[r23]=0;HEAP32[r23+1]=0;HEAP32[r23+2]=0;r23=r24,r30=r23>>2;r31=r25,r32=r31>>2;r33=r26,r34=r33>>2;r35=r27,r36=r35>>2;HEAP32[r30]=0;HEAP32[r30+1]=0;HEAP32[r30+2]=0;HEAP32[r32]=0;HEAP32[r32+1]=0;HEAP32[r32+2]=0;HEAP32[r34]=0;HEAP32[r34+1]=0;HEAP32[r34+2]=0;HEAP32[r36]=0;HEAP32[r36+1]=0;HEAP32[r36+2]=0;__ZNSt3__111__money_getIwE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_SJ_Ri(r3,r4,r18,r19,r20,r21,r24,r25,r26,r28);r4=r9|0;HEAP32[r12]=HEAP32[r4>>2];r3=(r1|0)>>2;r1=(r2|0)>>2;r2=r8>>2;r36=r26+4|0,r34=r36>>2;r32=r26+8|0;r30=r25+4|0,r37=r30>>2;r38=r25+8|0;r39=(r5&512|0)!=0;r5=r24+4|0,r40=r5>>2;r41=(r24+8|0)>>2;r42=r27+4|0,r43=r42>>2;r44=r27+8|0;r45=r18+3|0;r46=r21+4|0;r47=452;r48=r11;r49=r11;r11=r17+400|0;r17=0;r50=0;L606:while(1){r51=HEAP32[r3],r52=r51>>2;do{if((r51|0)==0){r53=1}else{r54=HEAP32[r52+3];if((r54|0)==(HEAP32[r52+4]|0)){r55=FUNCTION_TABLE[HEAP32[HEAP32[r52]+36>>2]](r51)}else{r55=HEAP32[r54>>2]}if((r55|0)==-1){HEAP32[r3]=0;r53=1;break}else{r53=(HEAP32[r3]|0)==0;break}}}while(0);r51=HEAP32[r1],r52=r51>>2;do{if((r51|0)==0){r6=511}else{r54=HEAP32[r52+3];if((r54|0)==(HEAP32[r52+4]|0)){r56=FUNCTION_TABLE[HEAP32[HEAP32[r52]+36>>2]](r51)}else{r56=HEAP32[r54>>2]}if((r56|0)==-1){HEAP32[r1]=0;r6=511;break}else{if(r53^(r51|0)==0){r57=r51;break}else{r58=r47;r59=r48;r60=r49;r61=r17;r6=751;break L606}}}}while(0);if(r6==511){r6=0;if(r53){r58=r47;r59=r48;r60=r49;r61=r17;r6=751;break}else{r57=0}}r51=HEAP8[r18+r50|0]|0;L630:do{if((r51|0)==4){r52=0;r54=r11;r62=r49;r63=r48;r64=r47;L631:while(1){r65=HEAP32[r3],r66=r65>>2;do{if((r65|0)==0){r67=1}else{r68=HEAP32[r66+3];if((r68|0)==(HEAP32[r66+4]|0)){r69=FUNCTION_TABLE[HEAP32[HEAP32[r66]+36>>2]](r65)}else{r69=HEAP32[r68>>2]}if((r69|0)==-1){HEAP32[r3]=0;r67=1;break}else{r67=(HEAP32[r3]|0)==0;break}}}while(0);r65=HEAP32[r1],r66=r65>>2;do{if((r65|0)==0){r6=659}else{r68=HEAP32[r66+3];if((r68|0)==(HEAP32[r66+4]|0)){r70=FUNCTION_TABLE[HEAP32[HEAP32[r66]+36>>2]](r65)}else{r70=HEAP32[r68>>2]}if((r70|0)==-1){HEAP32[r1]=0;r6=659;break}else{if(r67^(r65|0)==0){break}else{break L631}}}}while(0);if(r6==659){r6=0;if(r67){break}}r65=HEAP32[r3],r66=r65>>2;r68=HEAP32[r66+3];if((r68|0)==(HEAP32[r66+4]|0)){r71=FUNCTION_TABLE[HEAP32[HEAP32[r66]+36>>2]](r65)}else{r71=HEAP32[r68>>2]}if(FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,2048,r71)){r68=HEAP32[r12];if((r68|0)==(HEAP32[r16]|0)){__ZNSt3__119__double_or_nothingIwEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_(r9,r10,r15);r72=HEAP32[r12]}else{r72=r68}HEAP32[r12]=r72+4;HEAP32[r72>>2]=r71;r73=r52+1|0;r74=r54;r75=r62;r76=r63;r77=r64}else{r68=HEAPU8[r22];if((((r68&1|0)==0?r68>>>1:HEAP32[r46>>2])|0)==0|(r52|0)==0){break}if((r71|0)!=(HEAP32[r20>>2]|0)){break}if((r62|0)==(r54|0)){r68=(r64|0)!=452;r65=r62-r63|0;r66=r65>>>0<2147483647?r65<<1:-1;if(r68){r78=r63}else{r78=0}r68=_realloc(r78,r66);r79=r68;if((r68|0)==0){__ZSt17__throw_bad_allocv()}r80=(r66>>>2<<2)+r79|0;r81=(r65>>2<<2)+r79|0;r82=r79;r83=228}else{r80=r54;r81=r62;r82=r63;r83=r64}HEAP32[r81>>2]=r52;r73=0;r74=r80;r75=r81+4|0;r76=r82;r77=r83}r79=HEAP32[r3];r65=r79+12|0;r66=HEAP32[r65>>2];if((r66|0)==(HEAP32[r79+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r79>>2]+40>>2]](r79);r52=r73;r54=r74;r62=r75;r63=r76;r64=r77;continue}else{HEAP32[r65>>2]=r66+4;r52=r73;r54=r74;r62=r75;r63=r76;r64=r77;continue}}if((r63|0)==(r62|0)|(r52|0)==0){r84=r54;r85=r62;r86=r63;r87=r64}else{if((r62|0)==(r54|0)){r66=(r64|0)!=452;r65=r62-r63|0;r79=r65>>>0<2147483647?r65<<1:-1;if(r66){r88=r63}else{r88=0}r66=_realloc(r88,r79);r68=r66;if((r66|0)==0){__ZSt17__throw_bad_allocv()}r89=(r79>>>2<<2)+r68|0;r90=(r65>>2<<2)+r68|0;r91=r68;r92=228}else{r89=r54;r90=r62;r91=r63;r92=r64}HEAP32[r90>>2]=r52;r84=r89;r85=r90+4|0;r86=r91;r87=r92}r68=HEAP32[r28>>2];if((r68|0)>0){r65=HEAP32[r3],r79=r65>>2;do{if((r65|0)==0){r93=1}else{r66=HEAP32[r79+3];if((r66|0)==(HEAP32[r79+4]|0)){r94=FUNCTION_TABLE[HEAP32[HEAP32[r79]+36>>2]](r65)}else{r94=HEAP32[r66>>2]}if((r94|0)==-1){HEAP32[r3]=0;r93=1;break}else{r93=(HEAP32[r3]|0)==0;break}}}while(0);r65=HEAP32[r1],r79=r65>>2;do{if((r65|0)==0){r6=708}else{r52=HEAP32[r79+3];if((r52|0)==(HEAP32[r79+4]|0)){r95=FUNCTION_TABLE[HEAP32[HEAP32[r79]+36>>2]](r65)}else{r95=HEAP32[r52>>2]}if((r95|0)==-1){HEAP32[r1]=0;r6=708;break}else{if(r93^(r65|0)==0){r96=r65;break}else{r6=714;break L606}}}}while(0);if(r6==708){r6=0;if(r93){r6=714;break L606}else{r96=0}}r65=HEAP32[r3],r79=r65>>2;r52=HEAP32[r79+3];if((r52|0)==(HEAP32[r79+4]|0)){r97=FUNCTION_TABLE[HEAP32[HEAP32[r79]+36>>2]](r65)}else{r97=HEAP32[r52>>2]}if((r97|0)!=(HEAP32[r19>>2]|0)){r6=714;break L606}r52=HEAP32[r3];r65=r52+12|0;r79=HEAP32[r65>>2];if((r79|0)==(HEAP32[r52+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r52>>2]+40>>2]](r52);r98=r96,r99=r98>>2;r100=r68}else{HEAP32[r65>>2]=r79+4;r98=r96,r99=r98>>2;r100=r68}while(1){r79=HEAP32[r3],r65=r79>>2;do{if((r79|0)==0){r101=1}else{r52=HEAP32[r65+3];if((r52|0)==(HEAP32[r65+4]|0)){r102=FUNCTION_TABLE[HEAP32[HEAP32[r65]+36>>2]](r79)}else{r102=HEAP32[r52>>2]}if((r102|0)==-1){HEAP32[r3]=0;r101=1;break}else{r101=(HEAP32[r3]|0)==0;break}}}while(0);do{if((r98|0)==0){r6=731}else{r79=HEAP32[r99+3];if((r79|0)==(HEAP32[r99+4]|0)){r103=FUNCTION_TABLE[HEAP32[HEAP32[r99]+36>>2]](r98)}else{r103=HEAP32[r79>>2]}if((r103|0)==-1){HEAP32[r1]=0;r6=731;break}else{if(r101^(r98|0)==0){r104=r98;break}else{r6=738;break L606}}}}while(0);if(r6==731){r6=0;if(r101){r6=738;break L606}else{r104=0}}r79=HEAP32[r3],r65=r79>>2;r52=HEAP32[r65+3];if((r52|0)==(HEAP32[r65+4]|0)){r105=FUNCTION_TABLE[HEAP32[HEAP32[r65]+36>>2]](r79)}else{r105=HEAP32[r52>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,2048,r105)){r6=738;break L606}if((HEAP32[r12]|0)==(HEAP32[r16]|0)){__ZNSt3__119__double_or_nothingIwEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_(r9,r10,r15)}r52=HEAP32[r3],r79=r52>>2;r65=HEAP32[r79+3];if((r65|0)==(HEAP32[r79+4]|0)){r106=FUNCTION_TABLE[HEAP32[HEAP32[r79]+36>>2]](r52)}else{r106=HEAP32[r65>>2]}r65=HEAP32[r12];HEAP32[r12]=r65+4;HEAP32[r65>>2]=r106;r65=r100-1|0;HEAP32[r28>>2]=r65;r52=HEAP32[r3];r79=r52+12|0;r64=HEAP32[r79>>2];if((r64|0)==(HEAP32[r52+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r52>>2]+40>>2]](r52)}else{HEAP32[r79>>2]=r64+4}if((r65|0)>0){r98=r104,r99=r98>>2;r100=r65}else{break}}}if((HEAP32[r12]|0)==(HEAP32[r4>>2]|0)){r6=749;break L606}else{r107=r17;r108=r84;r109=r85;r110=r86;r111=r87}}else if((r51|0)==2){if(!((r17|0)!=0|r50>>>0<2)){if((r50|0)==2){r112=(HEAP8[r45]|0)!=0}else{r112=0}if(!(r39|r112)){r107=0;r108=r11;r109=r49;r110=r48;r111=r47;break}}r68=HEAP8[r23];r65=(r68&1)==0?r5:HEAP32[r41];L782:do{if((r50|0)==0){r113=r65;r114=r68;r115=r57,r116=r115>>2}else{if(HEAPU8[r18+(r50-1)|0]<2){r117=r65;r118=r68}else{r113=r65;r114=r68;r115=r57,r116=r115>>2;break}while(1){r64=r118&255;if((r117|0)==((((r64&1|0)==0?r64>>>1:HEAP32[r40])<<2)+((r118&1)==0?r5:HEAP32[r41])|0)){r119=r118;break}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,8192,HEAP32[r117>>2])){r6=612;break}r117=r117+4|0;r118=HEAP8[r23]}if(r6==612){r6=0;r119=HEAP8[r23]}r64=(r119&1)==0;r79=r117-(r64?r5:HEAP32[r41])>>2;r52=HEAP8[r35];r63=r52&255;r62=(r63&1|0)==0;L792:do{if(r79>>>0<=(r62?r63>>>1:HEAP32[r43])>>>0){r54=(r52&1)==0;r66=((r62?r63>>>1:HEAP32[r43])-r79<<2)+(r54?r42:HEAP32[r44>>2])|0;r120=((r62?r63>>>1:HEAP32[r43])<<2)+(r54?r42:HEAP32[r44>>2])|0;if((r66|0)==(r120|0)){r113=r117;r114=r119;r115=r57,r116=r115>>2;break L782}else{r121=r66;r122=r64?r5:HEAP32[r41]}while(1){if((HEAP32[r121>>2]|0)!=(HEAP32[r122>>2]|0)){break L792}r66=r121+4|0;if((r66|0)==(r120|0)){r113=r117;r114=r119;r115=r57,r116=r115>>2;break L782}r121=r66;r122=r122+4|0}}}while(0);r113=r64?r5:HEAP32[r41];r114=r119;r115=r57,r116=r115>>2}}while(0);L799:while(1){r68=r114&255;if((r113|0)==((((r68&1|0)==0?r68>>>1:HEAP32[r40])<<2)+((r114&1)==0?r5:HEAP32[r41])|0)){break}r68=HEAP32[r3],r65=r68>>2;do{if((r68|0)==0){r123=1}else{r63=HEAP32[r65+3];if((r63|0)==(HEAP32[r65+4]|0)){r124=FUNCTION_TABLE[HEAP32[HEAP32[r65]+36>>2]](r68)}else{r124=HEAP32[r63>>2]}if((r124|0)==-1){HEAP32[r3]=0;r123=1;break}else{r123=(HEAP32[r3]|0)==0;break}}}while(0);do{if((r115|0)==0){r6=633}else{r68=HEAP32[r116+3];if((r68|0)==(HEAP32[r116+4]|0)){r125=FUNCTION_TABLE[HEAP32[HEAP32[r116]+36>>2]](r115)}else{r125=HEAP32[r68>>2]}if((r125|0)==-1){HEAP32[r1]=0;r6=633;break}else{if(r123^(r115|0)==0){r126=r115;break}else{break L799}}}}while(0);if(r6==633){r6=0;if(r123){break}else{r126=0}}r68=HEAP32[r3],r65=r68>>2;r64=HEAP32[r65+3];if((r64|0)==(HEAP32[r65+4]|0)){r127=FUNCTION_TABLE[HEAP32[HEAP32[r65]+36>>2]](r68)}else{r127=HEAP32[r64>>2]}if((r127|0)!=(HEAP32[r113>>2]|0)){break}r64=HEAP32[r3];r68=r64+12|0;r65=HEAP32[r68>>2];if((r65|0)==(HEAP32[r64+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r64>>2]+40>>2]](r64)}else{HEAP32[r68>>2]=r65+4}r113=r113+4|0;r114=HEAP8[r23];r115=r126,r116=r115>>2}if(!r39){r107=r17;r108=r11;r109=r49;r110=r48;r111=r47;break}r65=HEAP8[r23];r68=r65&255;if((r113|0)==((((r68&1|0)==0?r68>>>1:HEAP32[r40])<<2)+((r65&1)==0?r5:HEAP32[r41])|0)){r107=r17;r108=r11;r109=r49;r110=r48;r111=r47}else{r6=645;break L606}}else if((r51|0)==1){if((r50|0)==3){r58=r47;r59=r48;r60=r49;r61=r17;r6=751;break L606}r65=HEAP32[r3],r68=r65>>2;r64=HEAP32[r68+3];if((r64|0)==(HEAP32[r68+4]|0)){r128=FUNCTION_TABLE[HEAP32[HEAP32[r68]+36>>2]](r65)}else{r128=HEAP32[r64>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,8192,r128)){r6=535;break L606}r64=HEAP32[r3];r65=r64+12|0;r68=HEAP32[r65>>2];if((r68|0)==(HEAP32[r64+16>>2]|0)){r129=FUNCTION_TABLE[HEAP32[HEAP32[r64>>2]+40>>2]](r64)}else{HEAP32[r65>>2]=r68+4;r129=HEAP32[r68>>2]}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw(r27,r129);r6=536}else if((r51|0)==0){r6=536}else if((r51|0)==3){r68=HEAP8[r31];r65=r68&255;r64=(r65&1|0)==0;r63=HEAP8[r33];r62=r63&255;r79=(r62&1|0)==0;if(((r64?r65>>>1:HEAP32[r37])|0)==(-(r79?r62>>>1:HEAP32[r34])|0)){r107=r17;r108=r11;r109=r49;r110=r48;r111=r47;break}do{if(((r64?r65>>>1:HEAP32[r37])|0)!=0){if(((r79?r62>>>1:HEAP32[r34])|0)==0){break}r52=HEAP32[r3],r120=r52>>2;r66=HEAP32[r120+3];if((r66|0)==(HEAP32[r120+4]|0)){r130=FUNCTION_TABLE[HEAP32[HEAP32[r120]+36>>2]](r52);r131=HEAP8[r31]}else{r130=HEAP32[r66>>2];r131=r68}r66=HEAP32[r3],r52=r66>>2;r120=r66+12|0;r54=HEAP32[r120>>2];r132=(r54|0)==(HEAP32[r52+4]|0);if((r130|0)==(HEAP32[((r131&1)==0?r30:HEAP32[r38>>2])>>2]|0)){if(r132){FUNCTION_TABLE[HEAP32[HEAP32[r52]+40>>2]](r66)}else{HEAP32[r120>>2]=r54+4}r120=HEAPU8[r31];r107=((r120&1|0)==0?r120>>>1:HEAP32[r37])>>>0>1?r25:r17;r108=r11;r109=r49;r110=r48;r111=r47;break L630}if(r132){r133=FUNCTION_TABLE[HEAP32[HEAP32[r52]+36>>2]](r66)}else{r133=HEAP32[r54>>2]}if((r133|0)!=(HEAP32[((HEAP8[r33]&1)==0?r36:HEAP32[r32>>2])>>2]|0)){r6=601;break L606}r54=HEAP32[r3];r66=r54+12|0;r52=HEAP32[r66>>2];if((r52|0)==(HEAP32[r54+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r54>>2]+40>>2]](r54)}else{HEAP32[r66>>2]=r52+4}HEAP8[r7]=1;r52=HEAPU8[r33];r107=((r52&1|0)==0?r52>>>1:HEAP32[r34])>>>0>1?r26:r17;r108=r11;r109=r49;r110=r48;r111=r47;break L630}}while(0);r62=HEAP32[r3],r79=r62>>2;r52=HEAP32[r79+3];r66=(r52|0)==(HEAP32[r79+4]|0);if(((r64?r65>>>1:HEAP32[r37])|0)==0){if(r66){r134=FUNCTION_TABLE[HEAP32[HEAP32[r79]+36>>2]](r62);r135=HEAP8[r33]}else{r134=HEAP32[r52>>2];r135=r63}if((r134|0)!=(HEAP32[((r135&1)==0?r36:HEAP32[r32>>2])>>2]|0)){r107=r17;r108=r11;r109=r49;r110=r48;r111=r47;break}r54=HEAP32[r3];r132=r54+12|0;r120=HEAP32[r132>>2];if((r120|0)==(HEAP32[r54+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r54>>2]+40>>2]](r54)}else{HEAP32[r132>>2]=r120+4}HEAP8[r7]=1;r120=HEAPU8[r33];r107=((r120&1|0)==0?r120>>>1:HEAP32[r34])>>>0>1?r26:r17;r108=r11;r109=r49;r110=r48;r111=r47;break}if(r66){r136=FUNCTION_TABLE[HEAP32[HEAP32[r79]+36>>2]](r62);r137=HEAP8[r31]}else{r136=HEAP32[r52>>2];r137=r68}if((r136|0)!=(HEAP32[((r137&1)==0?r30:HEAP32[r38>>2])>>2]|0)){HEAP8[r7]=1;r107=r17;r108=r11;r109=r49;r110=r48;r111=r47;break}r52=HEAP32[r3];r62=r52+12|0;r79=HEAP32[r62>>2];if((r79|0)==(HEAP32[r52+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r52>>2]+40>>2]](r52)}else{HEAP32[r62>>2]=r79+4}r79=HEAPU8[r31];r107=((r79&1|0)==0?r79>>>1:HEAP32[r37])>>>0>1?r25:r17;r108=r11;r109=r49;r110=r48;r111=r47}else{r107=r17;r108=r11;r109=r49;r110=r48;r111=r47}}while(0);L899:do{if(r6==536){r6=0;if((r50|0)==3){r58=r47;r59=r48;r60=r49;r61=r17;r6=751;break L606}else{r138=r57,r139=r138>>2}while(1){r51=HEAP32[r3],r79=r51>>2;do{if((r51|0)==0){r140=1}else{r62=HEAP32[r79+3];if((r62|0)==(HEAP32[r79+4]|0)){r141=FUNCTION_TABLE[HEAP32[HEAP32[r79]+36>>2]](r51)}else{r141=HEAP32[r62>>2]}if((r141|0)==-1){HEAP32[r3]=0;r140=1;break}else{r140=(HEAP32[r3]|0)==0;break}}}while(0);do{if((r138|0)==0){r6=550}else{r51=HEAP32[r139+3];if((r51|0)==(HEAP32[r139+4]|0)){r142=FUNCTION_TABLE[HEAP32[HEAP32[r139]+36>>2]](r138)}else{r142=HEAP32[r51>>2]}if((r142|0)==-1){HEAP32[r1]=0;r6=550;break}else{if(r140^(r138|0)==0){r143=r138;break}else{r107=r17;r108=r11;r109=r49;r110=r48;r111=r47;break L899}}}}while(0);if(r6==550){r6=0;if(r140){r107=r17;r108=r11;r109=r49;r110=r48;r111=r47;break L899}else{r143=0}}r51=HEAP32[r3],r79=r51>>2;r62=HEAP32[r79+3];if((r62|0)==(HEAP32[r79+4]|0)){r144=FUNCTION_TABLE[HEAP32[HEAP32[r79]+36>>2]](r51)}else{r144=HEAP32[r62>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,8192,r144)){r107=r17;r108=r11;r109=r49;r110=r48;r111=r47;break L899}r62=HEAP32[r3];r51=r62+12|0;r79=HEAP32[r51>>2];if((r79|0)==(HEAP32[r62+16>>2]|0)){r145=FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+40>>2]](r62)}else{HEAP32[r51>>2]=r79+4;r145=HEAP32[r79>>2]}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw(r27,r145);r138=r143,r139=r138>>2}}}while(0);r68=r50+1|0;if(r68>>>0<4){r47=r111;r48=r110;r49=r109;r11=r108;r17=r107;r50=r68}else{r58=r111;r59=r110;r60=r109;r61=r107;r6=751;break}}L936:do{if(r6==645){HEAP32[r13]=HEAP32[r13]|4;r146=0;r147=r48;r148=r47}else if(r6==714){HEAP32[r13]=HEAP32[r13]|4;r146=0;r147=r86;r148=r87}else if(r6==738){HEAP32[r13]=HEAP32[r13]|4;r146=0;r147=r86;r148=r87}else if(r6==749){HEAP32[r13]=HEAP32[r13]|4;r146=0;r147=r86;r148=r87}else if(r6==751){L942:do{if((r61|0)!=0){r107=r61;r109=r61+4|0;r110=r61+8|0;r111=1;L944:while(1){r50=HEAPU8[r107];if((r50&1|0)==0){r149=r50>>>1}else{r149=HEAP32[r109>>2]}if(r111>>>0>=r149>>>0){break L942}r50=HEAP32[r3],r17=r50>>2;do{if((r50|0)==0){r150=1}else{r108=HEAP32[r17+3];if((r108|0)==(HEAP32[r17+4]|0)){r151=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r50)}else{r151=HEAP32[r108>>2]}if((r151|0)==-1){HEAP32[r3]=0;r150=1;break}else{r150=(HEAP32[r3]|0)==0;break}}}while(0);r50=HEAP32[r1],r17=r50>>2;do{if((r50|0)==0){r6=770}else{r108=HEAP32[r17+3];if((r108|0)==(HEAP32[r17+4]|0)){r152=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r50)}else{r152=HEAP32[r108>>2]}if((r152|0)==-1){HEAP32[r1]=0;r6=770;break}else{if(r150^(r50|0)==0){break}else{break L944}}}}while(0);if(r6==770){r6=0;if(r150){break}}r50=HEAP32[r3],r17=r50>>2;r108=HEAP32[r17+3];if((r108|0)==(HEAP32[r17+4]|0)){r153=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r50)}else{r153=HEAP32[r108>>2]}if((HEAP8[r107]&1)==0){r154=r109}else{r154=HEAP32[r110>>2]}if((r153|0)!=(HEAP32[r154+(r111<<2)>>2]|0)){break}r108=r111+1|0;r50=HEAP32[r3];r17=r50+12|0;r11=HEAP32[r17>>2];if((r11|0)==(HEAP32[r50+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r50>>2]+40>>2]](r50);r111=r108;continue}else{HEAP32[r17>>2]=r11+4;r111=r108;continue}}HEAP32[r13]=HEAP32[r13]|4;r146=0;r147=r59;r148=r58;break L936}}while(0);if((r59|0)==(r60|0)){r146=1;r147=r60;r148=r58;break}HEAP32[r29>>2]=0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r21,r59,r60,r29);if((HEAP32[r29>>2]|0)==0){r146=1;r147=r59;r148=r58;break}HEAP32[r13]=HEAP32[r13]|4;r146=0;r147=r59;r148=r58}else if(r6==601){HEAP32[r13]=HEAP32[r13]|4;r146=0;r147=r48;r148=r47}else if(r6==535){HEAP32[r13]=HEAP32[r13]|4;r146=0;r147=r48;r148=r47}}while(0);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r27);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r26);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r25);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r24);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r21);if((r147|0)==0){STACKTOP=r14;return r146}FUNCTION_TABLE[r148](r147);STACKTOP=r14;return r146}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6appendIPwEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r4=r1;r5=r2;r6=HEAP8[r4];r7=r6&255;if((r7&1|0)==0){r8=r7>>>1}else{r8=HEAP32[r1+4>>2]}if((r6&1)==0){r9=1;r10=r6}else{r6=HEAP32[r1>>2];r9=(r6&-2)-1|0;r10=r6&255}r6=r3-r5>>2;if((r6|0)==0){return r1}if((r9-r8|0)>>>0<r6>>>0){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r1,r9,r8+r6-r9|0,r8,r8,0,0);r11=HEAP8[r4]}else{r11=r10}if((r11&1)==0){r12=r1+4|0}else{r12=HEAP32[r1+8>>2]}r11=(r8<<2)+r12|0;if((r2|0)==(r3|0)){r13=r11}else{r10=r8+((r3-4+ -r5|0)>>>2)+1|0;r5=r2;r2=r11;while(1){HEAP32[r2>>2]=HEAP32[r5>>2];r11=r5+4|0;if((r11|0)==(r3|0)){break}else{r5=r11;r2=r2+4|0}}r13=(r10<<2)+r12|0}HEAP32[r13>>2]=0;r13=r8+r6|0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r13<<1&255;return r1}else{HEAP32[r1+4>>2]=r13;return r1}}function __ZNSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNKSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIwS3_NS_9allocatorIwEEEE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r2=0;r9=STACKTOP;STACKTOP=STACKTOP+456|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r10>>2];r10=r9,r11=r10>>2;r12=r9+16;r13=r9+416;r14=r9+424;r15=r9+432;r16=r9+440;r17=r9+448;r18=(r13|0)>>2;HEAP32[r18]=r12;r19=r13+4|0;HEAP32[r19>>2]=452;r20=r12+400|0;__ZNKSt3__18ios_base6getlocEv(r15,r6);r12=r15|0;r21=HEAP32[r12>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r11]=14520;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r10,260)}r10=HEAP32[3631]-1|0;r11=HEAP32[r21+8>>2];do{if(HEAP32[r21+12>>2]-r11>>2>>>0>r10>>>0){r22=HEAP32[r11+(r10<<2)>>2];if((r22|0)==0){break}r23=r22;HEAP8[r16]=0;r24=r4|0;r25=HEAP32[r24>>2],r26=r25>>2;HEAP32[r17>>2]=r25;if(__ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIwEERNS_10unique_ptrIwPFvPvEEERPwSM_(r3,r17,r5,r15,HEAP32[r6+4>>2],r7,r16,r23,r13,r14,r20)){r27=r8;if((HEAP8[r27]&1)==0){HEAP32[r8+4>>2]=0;HEAP8[r27]=0}else{HEAP32[HEAP32[r8+8>>2]>>2]=0;HEAP32[r8+4>>2]=0}r27=r22;if((HEAP8[r16]&1)!=0){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw(r8,FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+44>>2]](r23,45))}r22=FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+44>>2]](r23,48);r23=HEAP32[r14>>2];r27=r23-4|0;r28=HEAP32[r18];while(1){if(r28>>>0>=r27>>>0){break}if((HEAP32[r28>>2]|0)==(r22|0)){r28=r28+4|0}else{break}}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6appendIPwEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r8,r28,r23)}r22=r3|0;r27=HEAP32[r22>>2],r29=r27>>2;do{if((r27|0)==0){r30=0}else{r31=HEAP32[r29+3];if((r31|0)==(HEAP32[r29+4]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r27)}else{r32=HEAP32[r31>>2]}if((r32|0)!=-1){r30=r27;break}HEAP32[r22>>2]=0;r30=0}}while(0);r22=(r30|0)==0;do{if((r25|0)==0){r2=848}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r33=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)}else{r33=HEAP32[r27>>2]}if((r33|0)==-1){HEAP32[r24>>2]=0;r2=848;break}else{if(r22^(r25|0)==0){break}else{r2=850;break}}}}while(0);if(r2==848){if(r22){r2=850}}if(r2==850){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r30;__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r12>>2]|0);r25=HEAP32[r18];HEAP32[r18]=0;if((r25|0)==0){STACKTOP=r9;return}FUNCTION_TABLE[HEAP32[r19>>2]](r25);STACKTOP=r9;return}}while(0);r9=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r9);___cxa_throw(r9,9304,382)}function __ZNSt3__111__money_getIwE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_SJ_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r11=r9>>2;r12=r8>>2;r13=r7>>2;r14=STACKTOP;STACKTOP=STACKTOP+56|0;r15=r14,r16=r15>>2;r17=r14+16,r18=r17>>2;r19=r14+32;r20=r14+40;r21=r20>>2;r22=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r23=r22>>2;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=r24>>2;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=r26>>2;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r30=r29>>2;r31=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r32=r31>>2;r33=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r34=r33>>2;r35=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r36=r35>>2;if(r1){r1=HEAP32[r2>>2];if((HEAP32[3746]|0)!=-1){HEAP32[r18]=14984;HEAP32[r18+1]=26;HEAP32[r18+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14984,r17,260)}r17=HEAP32[3747]-1|0;r18=HEAP32[r1+8>>2];if(HEAP32[r1+12>>2]-r18>>2>>>0<=r17>>>0){r37=___cxa_allocate_exception(4);r38=r37;__ZNSt8bad_castC2Ev(r38);___cxa_throw(r37,9304,382)}r1=HEAP32[r18+(r17<<2)>>2];if((r1|0)==0){r37=___cxa_allocate_exception(4);r38=r37;__ZNSt8bad_castC2Ev(r38);___cxa_throw(r37,9304,382)}r37=r1;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+44>>2]](r19,r37);r38=r3;tempBigInt=HEAP32[r19>>2];HEAP8[r38]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+3|0]=tempBigInt&255;r38=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r38]+32>>2]](r20,r37);r19=r9,r17=r19>>2;if((HEAP8[r19]&1)==0){HEAP32[r11+1]=0;HEAP8[r19]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r17]=HEAP32[r21];HEAP32[r17+1]=HEAP32[r21+1];HEAP32[r17+2]=HEAP32[r21+2];HEAP32[r21]=0;HEAP32[r21+1]=0;HEAP32[r21+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r20);FUNCTION_TABLE[HEAP32[HEAP32[r38]+28>>2]](r22,r37);r20=r8,r21=r20>>2;if((HEAP8[r20]&1)==0){HEAP32[r12+1]=0;HEAP8[r20]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r21]=HEAP32[r23];HEAP32[r21+1]=HEAP32[r23+1];HEAP32[r21+2]=HEAP32[r23+2];HEAP32[r23]=0;HEAP32[r23+1]=0;HEAP32[r23+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r22);r22=r1>>2;r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+12>>2]](r37);HEAP32[r4>>2]=r23;r23=FUNCTION_TABLE[HEAP32[HEAP32[r22]+16>>2]](r37);HEAP32[r5>>2]=r23;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r24,r37);r1=r6,r23=r1>>2;if((HEAP8[r1]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r1]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r23]=HEAP32[r25];HEAP32[r23+1]=HEAP32[r25+1];HEAP32[r23+2]=HEAP32[r25+2];HEAP32[r25]=0;HEAP32[r25+1]=0;HEAP32[r25+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r24);FUNCTION_TABLE[HEAP32[HEAP32[r38]+24>>2]](r26,r37);r38=r7,r24=r38>>2;if((HEAP8[r38]&1)==0){HEAP32[r13+1]=0;HEAP8[r38]=0}else{HEAP32[HEAP32[r13+2]>>2]=0;HEAP32[r13+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r7,0);HEAP32[r24]=HEAP32[r27];HEAP32[r24+1]=HEAP32[r27+1];HEAP32[r24+2]=HEAP32[r27+2];HEAP32[r27]=0;HEAP32[r27+1]=0;HEAP32[r27+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r26);r39=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r37);HEAP32[r10>>2]=r39;STACKTOP=r14;return}else{r37=HEAP32[r2>>2];if((HEAP32[3748]|0)!=-1){HEAP32[r16]=14992;HEAP32[r16+1]=26;HEAP32[r16+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14992,r15,260)}r15=HEAP32[3749]-1|0;r16=HEAP32[r37+8>>2];if(HEAP32[r37+12>>2]-r16>>2>>>0<=r15>>>0){r40=___cxa_allocate_exception(4);r41=r40;__ZNSt8bad_castC2Ev(r41);___cxa_throw(r40,9304,382)}r37=HEAP32[r16+(r15<<2)>>2];if((r37|0)==0){r40=___cxa_allocate_exception(4);r41=r40;__ZNSt8bad_castC2Ev(r41);___cxa_throw(r40,9304,382)}r40=r37;FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+44>>2]](r28,r40);r41=r3;tempBigInt=HEAP32[r28>>2];HEAP8[r41]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r41+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r41+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r41+3|0]=tempBigInt&255;r41=r37>>2;FUNCTION_TABLE[HEAP32[HEAP32[r41]+32>>2]](r29,r40);r28=r9,r3=r28>>2;if((HEAP8[r28]&1)==0){HEAP32[r11+1]=0;HEAP8[r28]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r3]=HEAP32[r30];HEAP32[r3+1]=HEAP32[r30+1];HEAP32[r3+2]=HEAP32[r30+2];HEAP32[r30]=0;HEAP32[r30+1]=0;HEAP32[r30+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r29);FUNCTION_TABLE[HEAP32[HEAP32[r41]+28>>2]](r31,r40);r29=r8,r30=r29>>2;if((HEAP8[r29]&1)==0){HEAP32[r12+1]=0;HEAP8[r29]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r30]=HEAP32[r32];HEAP32[r30+1]=HEAP32[r32+1];HEAP32[r30+2]=HEAP32[r32+2];HEAP32[r32]=0;HEAP32[r32+1]=0;HEAP32[r32+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r31);r31=r37>>2;r32=FUNCTION_TABLE[HEAP32[HEAP32[r31]+12>>2]](r40);HEAP32[r4>>2]=r32;r32=FUNCTION_TABLE[HEAP32[HEAP32[r31]+16>>2]](r40);HEAP32[r5>>2]=r32;FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+20>>2]](r33,r40);r37=r6,r32=r37>>2;if((HEAP8[r37]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r37]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r32]=HEAP32[r34];HEAP32[r32+1]=HEAP32[r34+1];HEAP32[r32+2]=HEAP32[r34+2];HEAP32[r34]=0;HEAP32[r34+1]=0;HEAP32[r34+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r33);FUNCTION_TABLE[HEAP32[HEAP32[r41]+24>>2]](r35,r40);r41=r7,r33=r41>>2;if((HEAP8[r41]&1)==0){HEAP32[r13+1]=0;HEAP8[r41]=0}else{HEAP32[HEAP32[r13+2]>>2]=0;HEAP32[r13+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r7,0);HEAP32[r33]=HEAP32[r36];HEAP32[r33+1]=HEAP32[r36+1];HEAP32[r33+2]=HEAP32[r36+2];HEAP32[r36]=0;HEAP32[r36+1]=0;HEAP32[r36+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r35);r39=FUNCTION_TABLE[HEAP32[HEAP32[r31]+36>>2]](r40);HEAP32[r10>>2]=r39;STACKTOP=r14;return}}function __ZNSt3__119__double_or_nothingIwEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=(r1+4|0)>>2;r5=(HEAP32[r4]|0)!=452;r6=(r1|0)>>2;r1=HEAP32[r6];r7=r1;r8=HEAP32[r3>>2]-r7|0;r9=r8>>>0<2147483647?r8<<1:-1;r8=HEAP32[r2>>2]-r7>>2;if(r5){r10=r1}else{r10=0}r1=_realloc(r10,r9);r10=r1;if((r1|0)==0){__ZSt17__throw_bad_allocv()}do{if(r5){HEAP32[r6]=r10;r11=r10}else{r1=HEAP32[r6];HEAP32[r6]=r10;if((r1|0)==0){r11=r10;break}FUNCTION_TABLE[HEAP32[r4]](r1);r11=HEAP32[r6]}}while(0);HEAP32[r4]=228;HEAP32[r2>>2]=(r8<<2)+r11;HEAP32[r3>>2]=(r9>>>2<<2)+HEAP32[r6];return}function __ZNSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEce(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+120,r12=r11>>2;r13=r8+232;r14=r8+240;r15=r8+248;r16=r8+256;r17=r8+264;r18=r17>>2;r19=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r20=r19,r21=r20>>2;r22=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r23=r22,r24=r23>>2;r25=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+100|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r30=r8+16|0;HEAP32[r12]=r30;r31=r8+128|0;r32=_snprintf(r30,100,2056,(r2=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[r2>>3]=r7,r2));STACKTOP=r2;do{if(r32>>>0>99){do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r30=_newlocale(1,2e3,0);HEAP32[3292]=r30}}while(0);r30=__ZNSt3__112__asprintf_lEPPcPvPKcz(r11,HEAP32[3292],2056,(r2=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[r2>>3]=r7,r2));STACKTOP=r2;r33=HEAP32[r12];if((r33|0)==0){__ZSt17__throw_bad_allocv();r34=HEAP32[r12]}else{r34=r33}r33=_malloc(r30);if((r33|0)!=0){r35=r33;r36=r30;r37=r34;r38=r33;break}__ZSt17__throw_bad_allocv();r35=0;r36=r30;r37=r34;r38=0}else{r35=r31;r36=r32;r37=0;r38=0}}while(0);__ZNKSt3__18ios_base6getlocEv(r13,r5);r32=r13|0;r31=HEAP32[r32>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r10]=14528;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r9,260)}r9=HEAP32[3633]-1|0;r10=HEAP32[r31+8>>2];do{if(HEAP32[r31+12>>2]-r10>>2>>>0>r9>>>0){r34=HEAP32[r10+(r9<<2)>>2];if((r34|0)==0){break}r2=r34;r7=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r34>>2]+32>>2]](r2,r7,r7+r36|0,r35);if((r36|0)==0){r39=0}else{r39=(HEAP8[HEAP32[r12]]|0)==45}HEAP32[r18]=0;HEAP32[r18+1]=0;HEAP32[r18+2]=0;HEAP32[r21]=0;HEAP32[r21+1]=0;HEAP32[r21+2]=0;HEAP32[r24]=0;HEAP32[r24+1]=0;HEAP32[r24+2]=0;__ZNSt3__111__money_putIcE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_Ri(r4,r39,r13,r14,r15,r16,r17,r19,r22,r25);r7=r26|0;r34=HEAP32[r25>>2];if((r36|0)>(r34|0)){r11=HEAPU8[r23];if((r11&1|0)==0){r40=r11>>>1}else{r40=HEAP32[r22+4>>2]}r11=HEAPU8[r20];if((r11&1|0)==0){r41=r11>>>1}else{r41=HEAP32[r19+4>>2]}r42=(r36-r34<<1|1)+r40+r41|0}else{r11=HEAPU8[r23];if((r11&1|0)==0){r43=r11>>>1}else{r43=HEAP32[r22+4>>2]}r11=HEAPU8[r20];if((r11&1|0)==0){r44=r11>>>1}else{r44=HEAP32[r19+4>>2]}r42=r44+(r43+2)|0}r11=r42+r34|0;do{if(r11>>>0>100){r30=_malloc(r11);if((r30|0)!=0){r45=r30;r46=r30;break}__ZSt17__throw_bad_allocv();r45=0;r46=0}else{r45=r7;r46=0}}while(0);__ZNSt3__111__money_putIcE8__formatEPcRS2_S3_jPKcS5_RKNS_5ctypeIcEEbRKNS_10money_base7patternEccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESL_SL_i(r45,r27,r28,HEAP32[r5+4>>2],r35,r35+r36|0,r2,r39,r14,HEAP8[r15],HEAP8[r16],r17,r19,r22,r34);HEAP32[r29>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r29,r45,HEAP32[r27>>2],HEAP32[r28>>2],r5,r6);if((r46|0)!=0){_free(r46)}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r22);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r19);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r17);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r32>>2]|0);if((r38|0)!=0){_free(r38)}if((r37|0)==0){STACKTOP=r8;return}_free(r37);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNSt3__111__money_putIcE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r11=r9>>2;r12=STACKTOP;STACKTOP=STACKTOP+40|0;r13=r12,r14=r13>>2;r15=r12+16,r16=r15>>2;r17=r12+32;r18=r17;r19=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r22=r21;r23=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r24=r23>>2;r25=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r26=r25>>2;r27=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r28=r27>>2;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r30=r29;r31=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r32=r31>>2;r33=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r34=r33;r35=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r36=r35>>2;r37=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r38=r37>>2;r39=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r40=r39>>2;r41=HEAP32[r3>>2]>>2;if(r1){if((HEAP32[3750]|0)!=-1){HEAP32[r16]=15e3;HEAP32[r16+1]=26;HEAP32[r16+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(15e3,r15,260)}r15=HEAP32[3751]-1|0;r16=HEAP32[r41+2];if(HEAP32[r41+3]-r16>>2>>>0<=r15>>>0){r42=___cxa_allocate_exception(4);r43=r42;__ZNSt8bad_castC2Ev(r43);___cxa_throw(r42,9304,382)}r1=HEAP32[r16+(r15<<2)>>2],r15=r1>>2;if((r1|0)==0){r42=___cxa_allocate_exception(4);r43=r42;__ZNSt8bad_castC2Ev(r43);___cxa_throw(r42,9304,382)}r42=r1;r43=HEAP32[r15];if(r2){FUNCTION_TABLE[HEAP32[r43+44>>2]](r18,r42);r18=r4;tempBigInt=HEAP32[r17>>2];HEAP8[r18]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r18+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r18+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r18+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r15]+32>>2]](r19,r42);r18=r9,r17=r18>>2;if((HEAP8[r18]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r18]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r17]=HEAP32[r20];HEAP32[r17+1]=HEAP32[r20+1];HEAP32[r17+2]=HEAP32[r20+2];HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r19)}else{FUNCTION_TABLE[HEAP32[r43+40>>2]](r22,r42);r22=r4;tempBigInt=HEAP32[r21>>2];HEAP8[r22]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r22+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r22+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r22+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r15]+28>>2]](r23,r42);r22=r9,r21=r22>>2;if((HEAP8[r22]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r22]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r21]=HEAP32[r24];HEAP32[r21+1]=HEAP32[r24+1];HEAP32[r21+2]=HEAP32[r24+2];HEAP32[r24]=0;HEAP32[r24+1]=0;HEAP32[r24+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r23)}r23=r1;r24=FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+12>>2]](r42);HEAP8[r5]=r24;r24=FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+16>>2]](r42);HEAP8[r6]=r24;r24=r1;FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+20>>2]](r25,r42);r1=r7,r23=r1>>2;if((HEAP8[r1]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r1]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r23]=HEAP32[r26];HEAP32[r23+1]=HEAP32[r26+1];HEAP32[r23+2]=HEAP32[r26+2];HEAP32[r26]=0;HEAP32[r26+1]=0;HEAP32[r26+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r25);FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+24>>2]](r27,r42);r24=r8,r25=r24>>2;if((HEAP8[r24]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r24]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r25]=HEAP32[r28];HEAP32[r25+1]=HEAP32[r28+1];HEAP32[r25+2]=HEAP32[r28+2];HEAP32[r28]=0;HEAP32[r28+1]=0;HEAP32[r28+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r27);r44=FUNCTION_TABLE[HEAP32[HEAP32[r15]+36>>2]](r42);HEAP32[r10>>2]=r44;STACKTOP=r12;return}else{if((HEAP32[3752]|0)!=-1){HEAP32[r14]=15008;HEAP32[r14+1]=26;HEAP32[r14+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(15008,r13,260)}r13=HEAP32[3753]-1|0;r14=HEAP32[r41+2];if(HEAP32[r41+3]-r14>>2>>>0<=r13>>>0){r45=___cxa_allocate_exception(4);r46=r45;__ZNSt8bad_castC2Ev(r46);___cxa_throw(r45,9304,382)}r41=HEAP32[r14+(r13<<2)>>2],r13=r41>>2;if((r41|0)==0){r45=___cxa_allocate_exception(4);r46=r45;__ZNSt8bad_castC2Ev(r46);___cxa_throw(r45,9304,382)}r45=r41;r46=HEAP32[r13];if(r2){FUNCTION_TABLE[HEAP32[r46+44>>2]](r30,r45);r30=r4;tempBigInt=HEAP32[r29>>2];HEAP8[r30]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r30+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r30+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r30+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r13]+32>>2]](r31,r45);r30=r9,r29=r30>>2;if((HEAP8[r30]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r30]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r29]=HEAP32[r32];HEAP32[r29+1]=HEAP32[r32+1];HEAP32[r29+2]=HEAP32[r32+2];HEAP32[r32]=0;HEAP32[r32+1]=0;HEAP32[r32+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r31)}else{FUNCTION_TABLE[HEAP32[r46+40>>2]](r34,r45);r34=r4;tempBigInt=HEAP32[r33>>2];HEAP8[r34]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r34+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r34+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r34+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r13]+28>>2]](r35,r45);r34=r9,r33=r34>>2;if((HEAP8[r34]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r34]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r33]=HEAP32[r36];HEAP32[r33+1]=HEAP32[r36+1];HEAP32[r33+2]=HEAP32[r36+2];HEAP32[r36]=0;HEAP32[r36+1]=0;HEAP32[r36+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r35)}r35=r41;r36=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+12>>2]](r45);HEAP8[r5]=r36;r36=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+16>>2]](r45);HEAP8[r6]=r36;r36=r41;FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+20>>2]](r37,r45);r41=r7,r6=r41>>2;if((HEAP8[r41]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r41]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r6]=HEAP32[r38];HEAP32[r6+1]=HEAP32[r38+1];HEAP32[r6+2]=HEAP32[r38+2];HEAP32[r38]=0;HEAP32[r38+1]=0;HEAP32[r38+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r37);FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+24>>2]](r39,r45);r36=r8,r37=r36>>2;if((HEAP8[r36]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r36]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r37]=HEAP32[r40];HEAP32[r37+1]=HEAP32[r40+1];HEAP32[r37+2]=HEAP32[r40+2];HEAP32[r40]=0;HEAP32[r40+1]=0;HEAP32[r40+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r39);r44=FUNCTION_TABLE[HEAP32[HEAP32[r13]+36>>2]](r45);HEAP32[r10>>2]=r44;STACKTOP=r12;return}}function __ZNSt3__111__money_putIcE8__formatEPcRS2_S3_jPKcS5_RKNS_5ctypeIcEEbRKNS_10money_base7patternEccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESL_SL_i(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15){var r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77;r16=r3>>2;r3=0;HEAP32[r16]=r1;r17=r7>>2;r18=r14;r19=r14+1|0;r20=r14+8|0;r21=(r14+4|0)>>2;r14=r13;r22=(r4&512|0)==0;r23=r13+1|0;r24=r13+4|0;r25=r13+8|0;r13=r7+8|0;r26=(r15|0)>0;r27=r12;r28=r12+1|0;r29=(r12+8|0)>>2;r30=r12+4|0;r12=-r15|0;r31=r5;r5=0;while(1){r32=HEAP8[r9+r5|0]|0;do{if((r32|0)==0){HEAP32[r2>>2]=HEAP32[r16];r33=r31}else if((r32|0)==1){HEAP32[r2>>2]=HEAP32[r16];r34=FUNCTION_TABLE[HEAP32[HEAP32[r17]+28>>2]](r7,32);r35=HEAP32[r16];HEAP32[r16]=r35+1;HEAP8[r35]=r34;r33=r31}else if((r32|0)==3){r34=HEAP8[r18];r35=r34&255;if((r35&1|0)==0){r36=r35>>>1}else{r36=HEAP32[r21]}if((r36|0)==0){r33=r31;break}if((r34&1)==0){r37=r19}else{r37=HEAP32[r20>>2]}r34=HEAP8[r37];r35=HEAP32[r16];HEAP32[r16]=r35+1;HEAP8[r35]=r34;r33=r31}else if((r32|0)==2){r34=HEAP8[r14];r35=r34&255;r38=(r35&1|0)==0;if(r38){r39=r35>>>1}else{r39=HEAP32[r24>>2]}if((r39|0)==0|r22){r33=r31;break}if((r34&1)==0){r40=r23;r41=r23}else{r34=HEAP32[r25>>2];r40=r34;r41=r34}if(r38){r42=r35>>>1}else{r42=HEAP32[r24>>2]}r35=r40+r42|0;r38=HEAP32[r16];if((r41|0)==(r35|0)){r43=r38}else{r34=r41;r44=r38;while(1){HEAP8[r44]=HEAP8[r34];r38=r34+1|0;r45=r44+1|0;if((r38|0)==(r35|0)){r43=r45;break}else{r34=r38;r44=r45}}}HEAP32[r16]=r43;r33=r31}else if((r32|0)==4){r44=HEAP32[r16];r34=r8?r31+1|0:r31;r35=r34;while(1){if(r35>>>0>=r6>>>0){break}r45=HEAP8[r35];if(r45<<24>>24<=-1){break}if((HEAP16[HEAP32[r13>>2]+(r45<<24>>24<<1)>>1]&2048)==0){break}else{r35=r35+1|0}}r45=r35;if(r26){if(r35>>>0>r34>>>0){r38=r34+ -r45|0;r45=r38>>>0<r12>>>0?r12:r38;r38=r45+r15|0;r46=r35;r47=r15;r48=r44;while(1){r49=r46-1|0;r50=HEAP8[r49];HEAP32[r16]=r48+1;HEAP8[r48]=r50;r50=r47-1|0;r51=(r50|0)>0;if(!(r49>>>0>r34>>>0&r51)){break}r46=r49;r47=r50;r48=HEAP32[r16]}r48=r35+r45|0;if(r51){r52=r38;r53=r48;r3=1098}else{r54=0;r55=r38;r56=r48}}else{r52=r15;r53=r35;r3=1098}if(r3==1098){r3=0;r54=FUNCTION_TABLE[HEAP32[HEAP32[r17]+28>>2]](r7,48);r55=r52;r56=r53}r48=HEAP32[r16];HEAP32[r16]=r48+1;if((r55|0)>0){r47=r55;r46=r48;while(1){HEAP8[r46]=r54;r50=r47-1|0;r49=HEAP32[r16];HEAP32[r16]=r49+1;if((r50|0)>0){r47=r50;r46=r49}else{r57=r49;break}}}else{r57=r48}HEAP8[r57]=r10;r58=r56}else{r58=r35}if((r58|0)==(r34|0)){r46=FUNCTION_TABLE[HEAP32[HEAP32[r17]+28>>2]](r7,48);r47=HEAP32[r16];HEAP32[r16]=r47+1;HEAP8[r47]=r46}else{r46=HEAP8[r27];r47=r46&255;if((r47&1|0)==0){r59=r47>>>1}else{r59=HEAP32[r30>>2]}if((r59|0)==0){r60=r58;r61=0;r62=0;r63=-1}else{if((r46&1)==0){r64=r28}else{r64=HEAP32[r29]}r60=r58;r61=0;r62=0;r63=HEAP8[r64]|0}while(1){do{if((r61|0)==(r63|0)){r46=HEAP32[r16];HEAP32[r16]=r46+1;HEAP8[r46]=r11;r46=r62+1|0;r47=HEAP8[r27];r38=r47&255;if((r38&1|0)==0){r65=r38>>>1}else{r65=HEAP32[r30>>2]}if(r46>>>0>=r65>>>0){r66=r63;r67=r46;r68=0;break}r38=(r47&1)==0;if(r38){r69=r28}else{r69=HEAP32[r29]}if((HEAP8[r69+r46|0]|0)==127){r66=-1;r67=r46;r68=0;break}if(r38){r70=r28}else{r70=HEAP32[r29]}r66=HEAP8[r70+r46|0]|0;r67=r46;r68=0}else{r66=r63;r67=r62;r68=r61}}while(0);r46=r60-1|0;r38=HEAP8[r46];r47=HEAP32[r16];HEAP32[r16]=r47+1;HEAP8[r47]=r38;if((r46|0)==(r34|0)){break}else{r60=r46;r61=r68+1|0;r62=r67;r63=r66}}}r35=HEAP32[r16];if((r44|0)==(r35|0)){r33=r34;break}r48=r35-1|0;if(r44>>>0<r48>>>0){r71=r44;r72=r48}else{r33=r34;break}while(1){r48=HEAP8[r71];HEAP8[r71]=HEAP8[r72];HEAP8[r72]=r48;r48=r71+1|0;r35=r72-1|0;if(r48>>>0<r35>>>0){r71=r48;r72=r35}else{r33=r34;break}}}else{r33=r31}}while(0);r32=r5+1|0;if(r32>>>0<4){r31=r33;r5=r32}else{break}}r5=HEAP8[r18];r18=r5&255;r33=(r18&1|0)==0;if(r33){r73=r18>>>1}else{r73=HEAP32[r21]}if(r73>>>0>1){if((r5&1)==0){r74=r19;r75=r19}else{r19=HEAP32[r20>>2];r74=r19;r75=r19}if(r33){r76=r18>>>1}else{r76=HEAP32[r21]}r21=r74+r76|0;r76=HEAP32[r16];r74=r75+1|0;if((r74|0)==(r21|0)){r77=r76}else{r75=r76;r76=r74;while(1){HEAP8[r75]=HEAP8[r76];r74=r75+1|0;r18=r76+1|0;if((r18|0)==(r21|0)){r77=r74;break}else{r75=r74;r76=r18}}}HEAP32[r16]=r77}r77=r4&176;if((r77|0)==16){return}else if((r77|0)==32){HEAP32[r2>>2]=HEAP32[r16];return}else{HEAP32[r2>>2]=r1;return}}function __ZNSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEcRKNS_12basic_stringIcS3_NS_9allocatorIcEEEE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r2=r7>>2;r8=STACKTOP;STACKTOP=STACKTOP+64|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16;r12=r8+24;r13=r8+32;r14=r8+40;r15=r8+48;r16=r15>>2;r17=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r18=r17,r19=r18>>2;r20=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r21=r20,r22=r21>>2;r23=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r24=STACKTOP;STACKTOP=STACKTOP+100|0;STACKTOP=STACKTOP+7>>3<<3;r25=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;__ZNKSt3__18ios_base6getlocEv(r11,r5);r28=(r11|0)>>2;r29=HEAP32[r28];if((HEAP32[3632]|0)!=-1){HEAP32[r10]=14528;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r9,260)}r9=HEAP32[3633]-1|0;r10=HEAP32[r29+8>>2];do{if(HEAP32[r29+12>>2]-r10>>2>>>0>r9>>>0){r30=HEAP32[r10+(r9<<2)>>2];if((r30|0)==0){break}r31=r30;r32=r7;r33=r7;r34=HEAP8[r33];r35=r34&255;if((r35&1|0)==0){r36=r35>>>1}else{r36=HEAP32[r2+1]}if((r36|0)==0){r37=0}else{if((r34&1)==0){r38=r32+1|0}else{r38=HEAP32[r2+2]}r37=HEAP8[r38]<<24>>24==FUNCTION_TABLE[HEAP32[HEAP32[r30>>2]+28>>2]](r31,45)<<24>>24}HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r19]=0;HEAP32[r19+1]=0;HEAP32[r19+2]=0;HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;__ZNSt3__111__money_putIcE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_Ri(r4,r37,r11,r12,r13,r14,r15,r17,r20,r23);r30=r24|0;r34=HEAP8[r33];r35=r34&255;r39=(r35&1|0)==0;if(r39){r40=r35>>>1}else{r40=HEAP32[r2+1]}r41=HEAP32[r23>>2];if((r40|0)>(r41|0)){if(r39){r42=r35>>>1}else{r42=HEAP32[r2+1]}r35=HEAPU8[r21];if((r35&1|0)==0){r43=r35>>>1}else{r43=HEAP32[r20+4>>2]}r35=HEAPU8[r18];if((r35&1|0)==0){r44=r35>>>1}else{r44=HEAP32[r17+4>>2]}r45=(r42-r41<<1|1)+r43+r44|0}else{r35=HEAPU8[r21];if((r35&1|0)==0){r46=r35>>>1}else{r46=HEAP32[r20+4>>2]}r35=HEAPU8[r18];if((r35&1|0)==0){r47=r35>>>1}else{r47=HEAP32[r17+4>>2]}r45=r47+(r46+2)|0}r35=r45+r41|0;do{if(r35>>>0>100){r39=_malloc(r35);if((r39|0)!=0){r48=r39;r49=r39;r50=r34;break}__ZSt17__throw_bad_allocv();r48=0;r49=0;r50=HEAP8[r33]}else{r48=r30;r49=0;r50=r34}}while(0);if((r50&1)==0){r51=r32+1|0;r52=r32+1|0}else{r34=HEAP32[r2+2];r51=r34;r52=r34}r34=r50&255;if((r34&1|0)==0){r53=r34>>>1}else{r53=HEAP32[r2+1]}__ZNSt3__111__money_putIcE8__formatEPcRS2_S3_jPKcS5_RKNS_5ctypeIcEEbRKNS_10money_base7patternEccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESL_SL_i(r48,r25,r26,HEAP32[r5+4>>2],r52,r51+r53|0,r31,r37,r12,HEAP8[r13],HEAP8[r14],r15,r17,r20,r41);HEAP32[r27>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r27,r48,HEAP32[r25>>2],HEAP32[r26>>2],r5,r6);if((r49|0)==0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r20);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r17);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r15);r54=HEAP32[r28];r55=r54|0;r56=__ZNSt3__114__shared_count16__release_sharedEv(r55);STACKTOP=r8;return}_free(r49);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r20);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r17);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r15);r54=HEAP32[r28];r55=r54|0;r56=__ZNSt3__114__shared_count16__release_sharedEv(r55);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNKSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwe(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+576|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+120,r12=r11>>2;r13=r8+528;r14=r8+536;r15=r8+544;r16=r8+552;r17=r8+560;r18=r17>>2;r19=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r20=r19,r21=r20>>2;r22=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r23=r22,r24=r23>>2;r25=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+400|0;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r30=r8+16|0;HEAP32[r12]=r30;r31=r8+128|0;r32=_snprintf(r30,100,2056,(r2=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[r2>>3]=r7,r2));STACKTOP=r2;do{if(r32>>>0>99){do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r30=_newlocale(1,2e3,0);HEAP32[3292]=r30}}while(0);r30=__ZNSt3__112__asprintf_lEPPcPvPKcz(r11,HEAP32[3292],2056,(r2=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[r2>>3]=r7,r2));STACKTOP=r2;r33=HEAP32[r12];if((r33|0)==0){__ZSt17__throw_bad_allocv();r34=HEAP32[r12]}else{r34=r33}r33=_malloc(r30<<2);r35=r33;if((r33|0)!=0){r36=r35;r37=r30;r38=r34;r39=r35;break}__ZSt17__throw_bad_allocv();r36=r35;r37=r30;r38=r34;r39=r35}else{r36=r31;r37=r32;r38=0;r39=0}}while(0);__ZNKSt3__18ios_base6getlocEv(r13,r5);r32=r13|0;r31=HEAP32[r32>>2];if((HEAP32[3630]|0)!=-1){HEAP32[r10]=14520;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r9,260)}r9=HEAP32[3631]-1|0;r10=HEAP32[r31+8>>2];do{if(HEAP32[r31+12>>2]-r10>>2>>>0>r9>>>0){r34=HEAP32[r10+(r9<<2)>>2];if((r34|0)==0){break}r2=r34;r7=HEAP32[r12];FUNCTION_TABLE[HEAP32[HEAP32[r34>>2]+48>>2]](r2,r7,r7+r37|0,r36);if((r37|0)==0){r40=0}else{r40=(HEAP8[HEAP32[r12]]|0)==45}HEAP32[r18]=0;HEAP32[r18+1]=0;HEAP32[r18+2]=0;HEAP32[r21]=0;HEAP32[r21+1]=0;HEAP32[r21+2]=0;HEAP32[r24]=0;HEAP32[r24+1]=0;HEAP32[r24+2]=0;__ZNSt3__111__money_putIwE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_Ri(r4,r40,r13,r14,r15,r16,r17,r19,r22,r25);r7=r26|0;r34=HEAP32[r25>>2];if((r37|0)>(r34|0)){r11=HEAPU8[r23];if((r11&1|0)==0){r41=r11>>>1}else{r41=HEAP32[r22+4>>2]}r11=HEAPU8[r20];if((r11&1|0)==0){r42=r11>>>1}else{r42=HEAP32[r19+4>>2]}r43=(r37-r34<<1|1)+r41+r42|0}else{r11=HEAPU8[r23];if((r11&1|0)==0){r44=r11>>>1}else{r44=HEAP32[r22+4>>2]}r11=HEAPU8[r20];if((r11&1|0)==0){r45=r11>>>1}else{r45=HEAP32[r19+4>>2]}r43=r45+(r44+2)|0}r11=r43+r34|0;do{if(r11>>>0>100){r35=_malloc(r11<<2);r30=r35;if((r35|0)!=0){r46=r30;r47=r30;break}__ZSt17__throw_bad_allocv();r46=r30;r47=r30}else{r46=r7;r47=0}}while(0);__ZNSt3__111__money_putIwE8__formatEPwRS2_S3_jPKwS5_RKNS_5ctypeIwEEbRKNS_10money_base7patternEwwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNSE_IwNSF_IwEENSH_IwEEEESQ_i(r46,r27,r28,HEAP32[r5+4>>2],r36,(r37<<2)+r36|0,r2,r40,r14,HEAP32[r15>>2],HEAP32[r16>>2],r17,r19,r22,r34);HEAP32[r29>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r29,r46,HEAP32[r27>>2],HEAP32[r28>>2],r5,r6);if((r47|0)!=0){_free(r47)}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r22);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r19);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r17);__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r32>>2]|0);if((r39|0)!=0){_free(r39)}if((r38|0)==0){STACKTOP=r8;return}_free(r38);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNSt3__111__money_putIwE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47;r11=r9>>2;r12=r8>>2;r13=STACKTOP;STACKTOP=STACKTOP+40|0;r14=r13,r15=r14>>2;r16=r13+16,r17=r16>>2;r18=r13+32;r19=r18;r20=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r21=r20>>2;r22=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r23=r22;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=r24>>2;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=r26>>2;r28=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r29=r28>>2;r30=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r31=r30;r32=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r33=r32>>2;r34=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r35=r34;r36=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r37=r36>>2;r38=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r39=r38>>2;r40=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r41=r40>>2;r42=HEAP32[r3>>2]>>2;if(r1){if((HEAP32[3746]|0)!=-1){HEAP32[r17]=14984;HEAP32[r17+1]=26;HEAP32[r17+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14984,r16,260)}r16=HEAP32[3747]-1|0;r17=HEAP32[r42+2];if(HEAP32[r42+3]-r17>>2>>>0<=r16>>>0){r43=___cxa_allocate_exception(4);r44=r43;__ZNSt8bad_castC2Ev(r44);___cxa_throw(r43,9304,382)}r1=HEAP32[r17+(r16<<2)>>2],r16=r1>>2;if((r1|0)==0){r43=___cxa_allocate_exception(4);r44=r43;__ZNSt8bad_castC2Ev(r44);___cxa_throw(r43,9304,382)}r43=r1;r44=HEAP32[r16];if(r2){FUNCTION_TABLE[HEAP32[r44+44>>2]](r19,r43);r19=r4;tempBigInt=HEAP32[r18>>2];HEAP8[r19]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r19+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r19+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r19+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r16]+32>>2]](r20,r43);r19=r9,r18=r19>>2;if((HEAP8[r19]&1)==0){HEAP32[r11+1]=0;HEAP8[r19]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r18]=HEAP32[r21];HEAP32[r18+1]=HEAP32[r21+1];HEAP32[r18+2]=HEAP32[r21+2];HEAP32[r21]=0;HEAP32[r21+1]=0;HEAP32[r21+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r20)}else{FUNCTION_TABLE[HEAP32[r44+40>>2]](r23,r43);r23=r4;tempBigInt=HEAP32[r22>>2];HEAP8[r23]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r23+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r23+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r23+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r16]+28>>2]](r24,r43);r23=r9,r22=r23>>2;if((HEAP8[r23]&1)==0){HEAP32[r11+1]=0;HEAP8[r23]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r22]=HEAP32[r25];HEAP32[r22+1]=HEAP32[r25+1];HEAP32[r22+2]=HEAP32[r25+2];HEAP32[r25]=0;HEAP32[r25+1]=0;HEAP32[r25+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r24)}r24=r1>>2;r1=FUNCTION_TABLE[HEAP32[HEAP32[r24]+12>>2]](r43);HEAP32[r5>>2]=r1;r1=FUNCTION_TABLE[HEAP32[HEAP32[r24]+16>>2]](r43);HEAP32[r6>>2]=r1;FUNCTION_TABLE[HEAP32[HEAP32[r16]+20>>2]](r26,r43);r1=r7,r25=r1>>2;if((HEAP8[r1]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r1]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r25]=HEAP32[r27];HEAP32[r25+1]=HEAP32[r27+1];HEAP32[r25+2]=HEAP32[r27+2];HEAP32[r27]=0;HEAP32[r27+1]=0;HEAP32[r27+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r26);FUNCTION_TABLE[HEAP32[HEAP32[r16]+24>>2]](r28,r43);r16=r8,r26=r16>>2;if((HEAP8[r16]&1)==0){HEAP32[r12+1]=0;HEAP8[r16]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r26]=HEAP32[r29];HEAP32[r26+1]=HEAP32[r29+1];HEAP32[r26+2]=HEAP32[r29+2];HEAP32[r29]=0;HEAP32[r29+1]=0;HEAP32[r29+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r28);r45=FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r43);HEAP32[r10>>2]=r45;STACKTOP=r13;return}else{if((HEAP32[3748]|0)!=-1){HEAP32[r15]=14992;HEAP32[r15+1]=26;HEAP32[r15+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14992,r14,260)}r14=HEAP32[3749]-1|0;r15=HEAP32[r42+2];if(HEAP32[r42+3]-r15>>2>>>0<=r14>>>0){r46=___cxa_allocate_exception(4);r47=r46;__ZNSt8bad_castC2Ev(r47);___cxa_throw(r46,9304,382)}r42=HEAP32[r15+(r14<<2)>>2],r14=r42>>2;if((r42|0)==0){r46=___cxa_allocate_exception(4);r47=r46;__ZNSt8bad_castC2Ev(r47);___cxa_throw(r46,9304,382)}r46=r42;r47=HEAP32[r14];if(r2){FUNCTION_TABLE[HEAP32[r47+44>>2]](r31,r46);r31=r4;tempBigInt=HEAP32[r30>>2];HEAP8[r31]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r31+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r31+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r31+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r14]+32>>2]](r32,r46);r31=r9,r30=r31>>2;if((HEAP8[r31]&1)==0){HEAP32[r11+1]=0;HEAP8[r31]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r30]=HEAP32[r33];HEAP32[r30+1]=HEAP32[r33+1];HEAP32[r30+2]=HEAP32[r33+2];HEAP32[r33]=0;HEAP32[r33+1]=0;HEAP32[r33+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r32)}else{FUNCTION_TABLE[HEAP32[r47+40>>2]](r35,r46);r35=r4;tempBigInt=HEAP32[r34>>2];HEAP8[r35]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r14]+28>>2]](r36,r46);r35=r9,r34=r35>>2;if((HEAP8[r35]&1)==0){HEAP32[r11+1]=0;HEAP8[r35]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r34]=HEAP32[r37];HEAP32[r34+1]=HEAP32[r37+1];HEAP32[r34+2]=HEAP32[r37+2];HEAP32[r37]=0;HEAP32[r37+1]=0;HEAP32[r37+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r36)}r36=r42>>2;r42=FUNCTION_TABLE[HEAP32[HEAP32[r36]+12>>2]](r46);HEAP32[r5>>2]=r42;r42=FUNCTION_TABLE[HEAP32[HEAP32[r36]+16>>2]](r46);HEAP32[r6>>2]=r42;FUNCTION_TABLE[HEAP32[HEAP32[r14]+20>>2]](r38,r46);r42=r7,r6=r42>>2;if((HEAP8[r42]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r42]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r6]=HEAP32[r39];HEAP32[r6+1]=HEAP32[r39+1];HEAP32[r6+2]=HEAP32[r39+2];HEAP32[r39]=0;HEAP32[r39+1]=0;HEAP32[r39+2]=0;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r38);FUNCTION_TABLE[HEAP32[HEAP32[r14]+24>>2]](r40,r46);r14=r8,r38=r14>>2;if((HEAP8[r14]&1)==0){HEAP32[r12+1]=0;HEAP8[r14]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r38]=HEAP32[r41];HEAP32[r38+1]=HEAP32[r41+1];HEAP32[r38+2]=HEAP32[r41+2];HEAP32[r41]=0;HEAP32[r41+1]=0;HEAP32[r41+2]=0;__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r40);r45=FUNCTION_TABLE[HEAP32[HEAP32[r36]+36>>2]](r46);HEAP32[r10>>2]=r45;STACKTOP=r13;return}}function __ZNSt3__111__money_putIwE8__formatEPwRS2_S3_jPKwS5_RKNS_5ctypeIwEEbRKNS_10money_base7patternEwwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNSE_IwNSF_IwEENSH_IwEEEESQ_i(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15){var r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77;r16=r3>>2;r3=0;HEAP32[r16]=r1;r17=r7>>2;r18=r14;r19=r14+4|0,r20=r19>>2;r21=r14+8|0;r14=r13;r22=(r4&512|0)==0;r23=r13+4|0;r24=r13+8|0;r13=r7;r25=(r15|0)>0;r26=r12;r27=r12+1|0;r28=(r12+8|0)>>2;r29=r12+4|0;r12=r5;r5=0;while(1){r30=HEAP8[r9+r5|0]|0;do{if((r30|0)==0){HEAP32[r2>>2]=HEAP32[r16];r31=r12}else if((r30|0)==1){HEAP32[r2>>2]=HEAP32[r16];r32=FUNCTION_TABLE[HEAP32[HEAP32[r17]+44>>2]](r7,32);r33=HEAP32[r16];HEAP32[r16]=r33+4;HEAP32[r33>>2]=r32;r31=r12}else if((r30|0)==3){r32=HEAP8[r18];r33=r32&255;if((r33&1|0)==0){r34=r33>>>1}else{r34=HEAP32[r20]}if((r34|0)==0){r31=r12;break}if((r32&1)==0){r35=r19}else{r35=HEAP32[r21>>2]}r32=HEAP32[r35>>2];r33=HEAP32[r16];HEAP32[r16]=r33+4;HEAP32[r33>>2]=r32;r31=r12}else if((r30|0)==2){r32=HEAP8[r14];r33=r32&255;r36=(r33&1|0)==0;if(r36){r37=r33>>>1}else{r37=HEAP32[r23>>2]}if((r37|0)==0|r22){r31=r12;break}if((r32&1)==0){r38=r23;r39=r23;r40=r23}else{r32=HEAP32[r24>>2];r38=r32;r39=r32;r40=r32}if(r36){r41=r33>>>1}else{r41=HEAP32[r23>>2]}r33=(r41<<2)+r38|0;r36=HEAP32[r16];if((r39|0)==(r33|0)){r42=r36}else{r32=((r41-1<<2)+r38+ -r40|0)>>>2;r43=r39;r44=r36;while(1){HEAP32[r44>>2]=HEAP32[r43>>2];r45=r43+4|0;if((r45|0)==(r33|0)){break}r43=r45;r44=r44+4|0}r42=(r32+1<<2)+r36|0}HEAP32[r16]=r42;r31=r12}else if((r30|0)==4){r44=HEAP32[r16];r43=r8?r12+4|0:r12;r33=r43;while(1){if(r33>>>0>=r6>>>0){break}if(FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r7,2048,HEAP32[r33>>2])){r33=r33+4|0}else{break}}if(r25){if(r33>>>0>r43>>>0){r36=r33;r32=r15;while(1){r46=r36-4|0;r45=HEAP32[r46>>2];r47=HEAP32[r16];HEAP32[r16]=r47+4;HEAP32[r47>>2]=r45;r48=r32-1|0;r49=(r48|0)>0;if(r46>>>0>r43>>>0&r49){r36=r46;r32=r48}else{break}}if(r49){r50=r48;r51=r46;r3=1374}else{r52=0;r53=r48;r54=r46}}else{r50=r15;r51=r33;r3=1374}if(r3==1374){r3=0;r52=FUNCTION_TABLE[HEAP32[HEAP32[r17]+44>>2]](r7,48);r53=r50;r54=r51}r32=HEAP32[r16];HEAP32[r16]=r32+4;if((r53|0)>0){r36=r53;r45=r32;while(1){HEAP32[r45>>2]=r52;r47=r36-1|0;r55=HEAP32[r16];HEAP32[r16]=r55+4;if((r47|0)>0){r36=r47;r45=r55}else{r56=r55;break}}}else{r56=r32}HEAP32[r56>>2]=r10;r57=r54}else{r57=r33}if((r57|0)==(r43|0)){r45=FUNCTION_TABLE[HEAP32[HEAP32[r17]+44>>2]](r7,48);r36=HEAP32[r16];HEAP32[r16]=r36+4;HEAP32[r36>>2]=r45}else{r45=HEAP8[r26];r36=r45&255;if((r36&1|0)==0){r58=r36>>>1}else{r58=HEAP32[r29>>2]}if((r58|0)==0){r59=r57;r60=0;r61=0;r62=-1}else{if((r45&1)==0){r63=r27}else{r63=HEAP32[r28]}r59=r57;r60=0;r61=0;r62=HEAP8[r63]|0}while(1){do{if((r60|0)==(r62|0)){r45=HEAP32[r16];HEAP32[r16]=r45+4;HEAP32[r45>>2]=r11;r45=r61+1|0;r36=HEAP8[r26];r55=r36&255;if((r55&1|0)==0){r64=r55>>>1}else{r64=HEAP32[r29>>2]}if(r45>>>0>=r64>>>0){r65=r62;r66=r45;r67=0;break}r55=(r36&1)==0;if(r55){r68=r27}else{r68=HEAP32[r28]}if((HEAP8[r68+r45|0]|0)==127){r65=-1;r66=r45;r67=0;break}if(r55){r69=r27}else{r69=HEAP32[r28]}r65=HEAP8[r69+r45|0]|0;r66=r45;r67=0}else{r65=r62;r66=r61;r67=r60}}while(0);r45=r59-4|0;r55=HEAP32[r45>>2];r36=HEAP32[r16];HEAP32[r16]=r36+4;HEAP32[r36>>2]=r55;if((r45|0)==(r43|0)){break}else{r59=r45;r60=r67+1|0;r61=r66;r62=r65}}}r33=HEAP32[r16];if((r44|0)==(r33|0)){r31=r43;break}r32=r33-4|0;if(r44>>>0<r32>>>0){r70=r44;r71=r32}else{r31=r43;break}while(1){r32=HEAP32[r70>>2];HEAP32[r70>>2]=HEAP32[r71>>2];HEAP32[r71>>2]=r32;r32=r70+4|0;r33=r71-4|0;if(r32>>>0<r33>>>0){r70=r32;r71=r33}else{r31=r43;break}}}else{r31=r12}}while(0);r30=r5+1|0;if(r30>>>0<4){r12=r31;r5=r30}else{break}}r5=HEAP8[r18];r18=r5&255;r31=(r18&1|0)==0;if(r31){r72=r18>>>1}else{r72=HEAP32[r20]}if(r72>>>0>1){if((r5&1)==0){r73=r19;r74=r19;r75=r19}else{r19=HEAP32[r21>>2];r73=r19;r74=r19;r75=r19}if(r31){r76=r18>>>1}else{r76=HEAP32[r20]}r20=(r76<<2)+r73|0;r18=HEAP32[r16];r31=r74+4|0;if((r31|0)==(r20|0)){r77=r18}else{r74=(((r76-2<<2)+r73+ -r75|0)>>>2)+1|0;r75=r18;r73=r31;while(1){HEAP32[r75>>2]=HEAP32[r73>>2];r31=r73+4|0;if((r31|0)==(r20|0)){break}else{r75=r75+4|0;r73=r31}}r77=(r74<<2)+r18|0}HEAP32[r16]=r77}r77=r4&176;if((r77|0)==32){HEAP32[r2>>2]=HEAP32[r16];return}else if((r77|0)==16){return}else{HEAP32[r2>>2]=r1;return}}function __ZNSt3__18messagesIcED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18messagesIcED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__18messagesIcE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE(r1,r2,r3){var r4;if((HEAP8[r2]&1)==0){r4=r2+1|0}else{r4=HEAP32[r2+8>>2]}r2=__Z7catopenPKci(r4,200);return r2>>>(((r2|0)!=-1|0)>>>0)}function __ZNKSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwRKNS_12basic_stringIwS3_NS_9allocatorIwEEEE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r2=r7>>2;r8=STACKTOP;STACKTOP=STACKTOP+64|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16;r12=r8+24;r13=r8+32;r14=r8+40;r15=r8+48;r16=r15>>2;r17=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r18=r17,r19=r18>>2;r20=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r21=r20,r22=r21>>2;r23=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r24=STACKTOP;STACKTOP=STACKTOP+400|0;r25=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;__ZNKSt3__18ios_base6getlocEv(r11,r5);r28=(r11|0)>>2;r29=HEAP32[r28];if((HEAP32[3630]|0)!=-1){HEAP32[r10]=14520;HEAP32[r10+1]=26;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r9,260)}r9=HEAP32[3631]-1|0;r10=HEAP32[r29+8>>2];do{if(HEAP32[r29+12>>2]-r10>>2>>>0>r9>>>0){r30=HEAP32[r10+(r9<<2)>>2];if((r30|0)==0){break}r31=r30;r32=r7;r33=HEAP8[r32];r34=r33&255;if((r34&1|0)==0){r35=r34>>>1}else{r35=HEAP32[r2+1]}if((r35|0)==0){r36=0}else{if((r33&1)==0){r37=r7+4|0}else{r37=HEAP32[r2+2]}r36=(HEAP32[r37>>2]|0)==(FUNCTION_TABLE[HEAP32[HEAP32[r30>>2]+44>>2]](r31,45)|0)}HEAP32[r16]=0;HEAP32[r16+1]=0;HEAP32[r16+2]=0;HEAP32[r19]=0;HEAP32[r19+1]=0;HEAP32[r19+2]=0;HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;__ZNSt3__111__money_putIwE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_Ri(r4,r36,r11,r12,r13,r14,r15,r17,r20,r23);r30=r24|0;r33=HEAP8[r32];r34=r33&255;r38=(r34&1|0)==0;if(r38){r39=r34>>>1}else{r39=HEAP32[r2+1]}r40=HEAP32[r23>>2];if((r39|0)>(r40|0)){if(r38){r41=r34>>>1}else{r41=HEAP32[r2+1]}r34=HEAPU8[r21];if((r34&1|0)==0){r42=r34>>>1}else{r42=HEAP32[r20+4>>2]}r34=HEAPU8[r18];if((r34&1|0)==0){r43=r34>>>1}else{r43=HEAP32[r17+4>>2]}r44=(r41-r40<<1|1)+r42+r43|0}else{r34=HEAPU8[r21];if((r34&1|0)==0){r45=r34>>>1}else{r45=HEAP32[r20+4>>2]}r34=HEAPU8[r18];if((r34&1|0)==0){r46=r34>>>1}else{r46=HEAP32[r17+4>>2]}r44=r46+(r45+2)|0}r34=r44+r40|0;do{if(r34>>>0>100){r38=_malloc(r34<<2);r47=r38;if((r38|0)!=0){r48=r47;r49=r47;r50=r33;break}__ZSt17__throw_bad_allocv();r48=r47;r49=r47;r50=HEAP8[r32]}else{r48=r30;r49=0;r50=r33}}while(0);if((r50&1)==0){r51=r7+4|0;r52=r7+4|0}else{r33=HEAP32[r2+2];r51=r33;r52=r33}r33=r50&255;if((r33&1|0)==0){r53=r33>>>1}else{r53=HEAP32[r2+1]}__ZNSt3__111__money_putIwE8__formatEPwRS2_S3_jPKwS5_RKNS_5ctypeIwEEbRKNS_10money_base7patternEwwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNSE_IwNSF_IwEENSH_IwEEEESQ_i(r48,r25,r26,HEAP32[r5+4>>2],r52,(r53<<2)+r51|0,r31,r36,r12,HEAP32[r13>>2],HEAP32[r14>>2],r15,r17,r20,r40);HEAP32[r27>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r27,r48,HEAP32[r25>>2],HEAP32[r26>>2],r5,r6);if((r49|0)==0){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r20);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r17);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r15);r54=HEAP32[r28];r55=r54|0;r56=__ZNSt3__114__shared_count16__release_sharedEv(r55);STACKTOP=r8;return}_free(r49);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r20);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r17);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r15);r54=HEAP32[r28];r55=r54|0;r56=__ZNSt3__114__shared_count16__release_sharedEv(r55);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);__ZNSt8bad_castC2Ev(r8);___cxa_throw(r8,9304,382)}function __ZNKSt3__18messagesIcE6do_getEiiiRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+16|0;r8=r7;r9=r8,r10=r9>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;r10=r1>>2;r11=r6;r12=HEAP8[r6];if((r12&1)==0){r13=r11+1|0;r14=r11+1|0}else{r11=HEAP32[r6+8>>2];r13=r11;r14=r11}r11=r12&255;if((r11&1|0)==0){r15=r11>>>1}else{r15=HEAP32[r6+4>>2]}r6=r13+r15|0;do{if(r14>>>0<r6>>>0){r15=r14;while(1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r8,HEAP8[r15]);r13=r15+1|0;if(r13>>>0<r6>>>0){r15=r13}else{break}}r15=(r3|0)==-1?-1:r3<<1;if((HEAP8[r9]&1)==0){r16=r15;r2=1506;break}r17=HEAP32[r8+8>>2];r18=r15}else{r16=(r3|0)==-1?-1:r3<<1;r2=1506}}while(0);if(r2==1506){r17=r8+1|0;r18=r16}r16=__Z7catgetsP8_nl_catdiiPKc(r18,r4,r5,r17);HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;r10=_strlen(r16);r17=r16+r10|0;if((r10|0)>0){r19=r16}else{__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r8);STACKTOP=r7;return}while(1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r1,HEAP8[r19]);r16=r19+1|0;if(r16>>>0<r17>>>0){r19=r16}else{break}}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r8);STACKTOP=r7;return}function __ZNKSt3__18messagesIcE8do_closeEi(r1,r2){__Z8catcloseP8_nl_catd((r2|0)==-1?-1:r2<<1);return}function __ZNSt3__18messagesIwED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18messagesIwED1Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__18messagesIwE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE(r1,r2,r3){var r4;if((HEAP8[r2]&1)==0){r4=r2+1|0}else{r4=HEAP32[r2+8>>2]}r2=__Z7catopenPKci(r4,200);return r2>>>(((r2|0)!=-1|0)>>>0)}function __ZNKSt3__18messagesIwE8do_closeEi(r1,r2){__Z8catcloseP8_nl_catd((r2|0)==-1?-1:r2<<1);return}function __ZNKSt3__18messagesIwE6do_getEiiiRKNS_12basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+224|0;r8=r7;r9=r7+8;r10=r7+40;r11=r7+48,r12=r11>>2;r13=r7+56;r14=r7+64;r15=r7+192;r16=r7+200,r17=r16>>2;r18=r7+208;r19=r18,r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+8|0;r22=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;r20=r1>>2;r23=r21|0;HEAP32[r21+4>>2]=0;HEAP32[r21>>2]=5e3;r24=HEAP8[r6];if((r24&1)==0){r25=r6+4|0;r26=r6+4|0}else{r27=HEAP32[r6+8>>2];r25=r27;r26=r27}r27=r24&255;if((r27&1|0)==0){r28=r27>>>1}else{r28=HEAP32[r6+4>>2]}r6=(r28<<2)+r25|0;L1851:do{if(r26>>>0<r6>>>0){r25=r21;r28=r9|0;r27=r9+32|0;r24=r26;r29=5e3;while(1){HEAP32[r12]=r24;r30=(FUNCTION_TABLE[HEAP32[r29+12>>2]](r23,r8,r24,r6,r11,r28,r27,r10)|0)==2;r31=HEAP32[r12];if(r30|(r31|0)==(r24|0)){break}if(r28>>>0<HEAP32[r10>>2]>>>0){r30=r28;while(1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc(r18,HEAP8[r30]);r32=r30+1|0;if(r32>>>0<HEAP32[r10>>2]>>>0){r30=r32}else{break}}r33=HEAP32[r12]}else{r33=r31}if(r33>>>0>=r6>>>0){break L1851}r24=r33;r29=HEAP32[r25>>2]}r25=___cxa_allocate_exception(8);__ZNSt13runtime_errorC2EPKc(r25,1304);___cxa_throw(r25,9320,44)}}while(0);__ZNSt3__114__shared_countD2Ev(r21|0);if((HEAP8[r19]&1)==0){r34=r18+1|0}else{r34=HEAP32[r18+8>>2]}r19=__Z7catgetsP8_nl_catdiiPKc((r3|0)==-1?-1:r3<<1,r4,r5,r34);HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;r20=r22|0;HEAP32[r22+4>>2]=0;HEAP32[r22>>2]=4944;r34=_strlen(r19);r5=r19+r34|0;if((r34|0)<1){r35=r22|0;__ZNSt3__114__shared_countD2Ev(r35);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r18);STACKTOP=r7;return}r34=r22;r4=r5;r3=r14|0;r21=r14+128|0;r14=r19;r19=4944;while(1){HEAP32[r17]=r14;r33=(FUNCTION_TABLE[HEAP32[r19+16>>2]](r20,r13,r14,(r4-r14|0)>32?r14+32|0:r5,r16,r3,r21,r15)|0)==2;r6=HEAP32[r17];if(r33|(r6|0)==(r14|0)){break}if(r3>>>0<HEAP32[r15>>2]>>>0){r33=r3;while(1){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9push_backEw(r1,HEAP32[r33>>2]);r12=r33+4|0;if(r12>>>0<HEAP32[r15>>2]>>>0){r33=r12}else{break}}r36=HEAP32[r17]}else{r36=r6}if(r36>>>0>=r5>>>0){r2=1574;break}r14=r36;r19=HEAP32[r34>>2]}if(r2==1574){r35=r22|0;__ZNSt3__114__shared_countD2Ev(r35);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r18);STACKTOP=r7;return}r7=___cxa_allocate_exception(8);__ZNSt13runtime_errorC2EPKc(r7,1304);___cxa_throw(r7,9320,44)}function __ZNSt3__17codecvtIwc10_mbstate_tED2Ev(r1){var r2,r3,r4,r5;HEAP32[r1>>2]=4464;r2=r1+8|0;r3=HEAP32[r2>>2];do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r4=_newlocale(1,2e3,0);HEAP32[3292]=r4}}while(0);if((r3|0)==(HEAP32[3292]|0)){r5=r1|0;__ZNSt3__114__shared_countD2Ev(r5);return}_freelocale(HEAP32[r2>>2]);r5=r1|0;__ZNSt3__114__shared_countD2Ev(r5);return}function __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv(r1){r1=___cxa_allocate_exception(8);__ZNSt11logic_errorC2EPKc(r1,2032);HEAP32[r1>>2]=3400;___cxa_throw(r1,9336,76)}function __ZNSt3__16locale5__impC2Ej(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65;r3=STACKTOP;STACKTOP=STACKTOP+448|0;r4=r3,r5=r4>>2;r6=r3+16,r7=r6>>2;r8=r3+32,r9=r8>>2;r10=r3+48,r11=r10>>2;r12=r3+64,r13=r12>>2;r14=r3+80,r15=r14>>2;r16=r3+96,r17=r16>>2;r18=r3+112,r19=r18>>2;r20=r3+128,r21=r20>>2;r22=r3+144,r23=r22>>2;r24=r3+160,r25=r24>>2;r26=r3+176,r27=r26>>2;r28=r3+192,r29=r28>>2;r30=r3+208,r31=r30>>2;r32=r3+224,r33=r32>>2;r34=r3+240,r35=r34>>2;r36=r3+256,r37=r36>>2;r38=r3+272,r39=r38>>2;r40=r3+288,r41=r40>>2;r42=r3+304,r43=r42>>2;r44=r3+320,r45=r44>>2;r46=r3+336,r47=r46>>2;r48=r3+352,r49=r48>>2;r50=r3+368,r51=r50>>2;r52=r3+384,r53=r52>>2;r54=r3+400,r55=r54>>2;r56=r3+416,r57=r56>>2;r58=r3+432,r59=r58>>2;HEAP32[r1+4>>2]=r2-1;HEAP32[r1>>2]=4720;r2=r1+8|0;r60=(r1+12|0)>>2;HEAP8[r1+136|0]=1;r61=r1+24|0;r62=r61;HEAP32[r60]=r62;HEAP32[r2>>2]=r62;HEAP32[r1+16>>2]=r61+112;r61=28;r63=r62;while(1){if((r63|0)==0){r64=0}else{HEAP32[r63>>2]=0;r64=HEAP32[r60]}r62=r64+4|0;HEAP32[r60]=r62;r65=r61-1|0;if((r65|0)==0){break}else{r61=r65;r63=r62}}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1+144|0,2e3,1);r63=HEAP32[r2>>2];r2=HEAP32[r60];if((r63|0)!=(r2|0)){HEAP32[r60]=(~((r2-4+ -r63|0)>>>2)<<2)+r2}HEAP32[3325]=0;HEAP32[3324]=4424;if((HEAP32[3552]|0)!=-1){HEAP32[r59]=14208;HEAP32[r59+1]=26;HEAP32[r59+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14208,r58,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13296,HEAP32[3553]-1|0);HEAP32[3323]=0;HEAP32[3322]=4384;if((HEAP32[3550]|0)!=-1){HEAP32[r57]=14200;HEAP32[r57+1]=26;HEAP32[r57+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14200,r56,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13288,HEAP32[3551]-1|0);HEAP32[3375]=0;HEAP32[3374]=4832;HEAP32[3376]=0;HEAP8[13508]=0;r56=___ctype_b_loc();HEAP32[3376]=HEAP32[r56>>2];if((HEAP32[3632]|0)!=-1){HEAP32[r55]=14528;HEAP32[r55+1]=26;HEAP32[r55+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14528,r54,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13496,HEAP32[3633]-1|0);HEAP32[3373]=0;HEAP32[3372]=4752;if((HEAP32[3630]|0)!=-1){HEAP32[r53]=14520;HEAP32[r53+1]=26;HEAP32[r53+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14520,r52,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13488,HEAP32[3631]-1|0);HEAP32[3327]=0;HEAP32[3326]=4520;if((HEAP32[3556]|0)!=-1){HEAP32[r51]=14224;HEAP32[r51+1]=26;HEAP32[r51+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14224,r50,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13304,HEAP32[3557]-1|0);HEAP32[741]=0;HEAP32[740]=4464;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r50=_newlocale(1,2e3,0);HEAP32[3292]=r50}}while(0);HEAP32[742]=HEAP32[3292];if((HEAP32[3554]|0)!=-1){HEAP32[r49]=14216;HEAP32[r49+1]=26;HEAP32[r49+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14216,r48,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2960,HEAP32[3555]-1|0);HEAP32[3329]=0;HEAP32[3328]=4576;if((HEAP32[3558]|0)!=-1){HEAP32[r47]=14232;HEAP32[r47+1]=26;HEAP32[r47+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14232,r46,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13312,HEAP32[3559]-1|0);HEAP32[3331]=0;HEAP32[3330]=4632;if((HEAP32[3560]|0)!=-1){HEAP32[r45]=14240;HEAP32[r45+1]=26;HEAP32[r45+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14240,r44,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13320,HEAP32[3561]-1|0);HEAP32[3305]=0;HEAP32[3304]=3928;HEAP8[13224]=46;HEAP8[13225]=44;HEAP32[3307]=0;HEAP32[3308]=0;HEAP32[3309]=0;if((HEAP32[3536]|0)!=-1){HEAP32[r43]=14144;HEAP32[r43+1]=26;HEAP32[r43+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14144,r42,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13216,HEAP32[3537]-1|0);HEAP32[733]=0;HEAP32[732]=3880;HEAP32[734]=46;HEAP32[735]=44;HEAP32[736]=0;HEAP32[737]=0;HEAP32[738]=0;if((HEAP32[3534]|0)!=-1){HEAP32[r41]=14136;HEAP32[r41+1]=26;HEAP32[r41+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14136,r40,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2928,HEAP32[3535]-1|0);HEAP32[3321]=0;HEAP32[3320]=4312;if((HEAP32[3548]|0)!=-1){HEAP32[r39]=14192;HEAP32[r39+1]=26;HEAP32[r39+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14192,r38,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13280,HEAP32[3549]-1|0);HEAP32[3319]=0;HEAP32[3318]=4240;if((HEAP32[3546]|0)!=-1){HEAP32[r37]=14184;HEAP32[r37+1]=26;HEAP32[r37+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14184,r36,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13272,HEAP32[3547]-1|0);HEAP32[3317]=0;HEAP32[3316]=4176;if((HEAP32[3544]|0)!=-1){HEAP32[r35]=14176;HEAP32[r35+1]=26;HEAP32[r35+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14176,r34,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13264,HEAP32[3545]-1|0);HEAP32[3315]=0;HEAP32[3314]=4112;if((HEAP32[3542]|0)!=-1){HEAP32[r33]=14168;HEAP32[r33+1]=26;HEAP32[r33+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14168,r32,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13256,HEAP32[3543]-1|0);HEAP32[3385]=0;HEAP32[3384]=5928;if((HEAP32[3752]|0)!=-1){HEAP32[r31]=15008;HEAP32[r31+1]=26;HEAP32[r31+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(15008,r30,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13536,HEAP32[3753]-1|0);HEAP32[3383]=0;HEAP32[3382]=5864;if((HEAP32[3750]|0)!=-1){HEAP32[r29]=15e3;HEAP32[r29+1]=26;HEAP32[r29+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(15e3,r28,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13528,HEAP32[3751]-1|0);HEAP32[3381]=0;HEAP32[3380]=5800;if((HEAP32[3748]|0)!=-1){HEAP32[r27]=14992;HEAP32[r27+1]=26;HEAP32[r27+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14992,r26,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13520,HEAP32[3749]-1|0);HEAP32[3379]=0;HEAP32[3378]=5736;if((HEAP32[3746]|0)!=-1){HEAP32[r25]=14984;HEAP32[r25+1]=26;HEAP32[r25+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14984,r24,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13512,HEAP32[3747]-1|0);HEAP32[3303]=0;HEAP32[3302]=3584;if((HEAP32[3524]|0)!=-1){HEAP32[r23]=14096;HEAP32[r23+1]=26;HEAP32[r23+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14096,r22,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13208,HEAP32[3525]-1|0);HEAP32[3301]=0;HEAP32[3300]=3544;if((HEAP32[3522]|0)!=-1){HEAP32[r21]=14088;HEAP32[r21+1]=26;HEAP32[r21+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14088,r20,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13200,HEAP32[3523]-1|0);HEAP32[3299]=0;HEAP32[3298]=3504;if((HEAP32[3520]|0)!=-1){HEAP32[r19]=14080;HEAP32[r19+1]=26;HEAP32[r19+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14080,r18,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13192,HEAP32[3521]-1|0);HEAP32[3297]=0;HEAP32[3296]=3464;if((HEAP32[3518]|0)!=-1){HEAP32[r17]=14072;HEAP32[r17+1]=26;HEAP32[r17+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14072,r16,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13184,HEAP32[3519]-1|0);HEAP32[729]=0;HEAP32[728]=3784;HEAP32[730]=3832;if((HEAP32[3532]|0)!=-1){HEAP32[r15]=14128;HEAP32[r15+1]=26;HEAP32[r15+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14128,r14,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2912,HEAP32[3533]-1|0);HEAP32[725]=0;HEAP32[724]=3688;HEAP32[726]=3736;if((HEAP32[3530]|0)!=-1){HEAP32[r13]=14120;HEAP32[r13+1]=26;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14120,r12,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2896,HEAP32[3531]-1|0);HEAP32[721]=0;HEAP32[720]=4688;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r12=_newlocale(1,2e3,0);HEAP32[3292]=r12}}while(0);HEAP32[722]=HEAP32[3292];HEAP32[720]=3656;if((HEAP32[3528]|0)!=-1){HEAP32[r11]=14112;HEAP32[r11+1]=26;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14112,r10,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2880,HEAP32[3529]-1|0);HEAP32[717]=0;HEAP32[716]=4688;do{if((HEAP8[15088]|0)==0){if((___cxa_guard_acquire(15088)|0)==0){break}r10=_newlocale(1,2e3,0);HEAP32[3292]=r10}}while(0);HEAP32[718]=HEAP32[3292];HEAP32[716]=3624;if((HEAP32[3526]|0)!=-1){HEAP32[r9]=14104;HEAP32[r9+1]=26;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14104,r8,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,2864,HEAP32[3527]-1|0);HEAP32[3313]=0;HEAP32[3312]=4016;if((HEAP32[3540]|0)!=-1){HEAP32[r7]=14160;HEAP32[r7+1]=26;HEAP32[r7+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14160,r6,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13248,HEAP32[3541]-1|0);HEAP32[3311]=0;HEAP32[3310]=3976;if((HEAP32[3538]|0)!=-1){HEAP32[r5]=14152;HEAP32[r5+1]=26;HEAP32[r5+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(14152,r4,260)}__ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,13240,HEAP32[3539]-1|0);STACKTOP=r3;return}function __ZNKSt3__15ctypeIcE8do_widenEc(r1,r2){return r2}function __ZNKSt3__17codecvtIcc10_mbstate_tE6do_outERS1_PKcS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){HEAP32[r5>>2]=r3;HEAP32[r8>>2]=r6;return 3}function __ZNKSt3__15ctypeIwE8do_widenEc(r1,r2){return r2<<24>>24}function __ZNKSt3__15ctypeIwE9do_narrowEwc(r1,r2,r3){return r2>>>0<128?r2&255:r3}function __ZNKSt3__15ctypeIcE9do_narrowEcc(r1,r2,r3){return r2<<24>>24>-1?r2:r3}function __ZNSt3__16locale2id6__initEv(r1){HEAP32[r1+4>>2]=(tempValue=HEAP32[3562],HEAP32[3562]=tempValue+1,tempValue)+1;return}function __ZNKSt3__15ctypeIwE8do_widenEPKcS3_Pw(r1,r2,r3,r4){var r5,r6,r7;if((r2|0)==(r3|0)){r5=r2;return r5}else{r6=r2;r7=r4}while(1){HEAP32[r7>>2]=HEAP8[r6]|0;r4=r6+1|0;if((r4|0)==(r3|0)){r5=r3;break}else{r6=r4;r7=r7+4|0}}return r5}function __ZNKSt3__15ctypeIwE9do_narrowEPKwS3_cPc(r1,r2,r3,r4,r5){var r6,r7,r8;if((r2|0)==(r3|0)){r6=r2;return r6}r1=((r3-4+ -r2|0)>>>2)+1|0;r7=r2;r8=r5;while(1){r5=HEAP32[r7>>2];HEAP8[r8]=r5>>>0<128?r5&255:r4;r5=r7+4|0;if((r5|0)==(r3|0)){break}else{r7=r5;r8=r8+1|0}}r6=(r1<<2)+r2|0;return r6}function __ZNKSt3__15ctypeIcE8do_widenEPKcS3_Pc(r1,r2,r3,r4){var r5,r6,r7;if((r2|0)==(r3|0)){r5=r2;return r5}else{r6=r2;r7=r4}while(1){HEAP8[r7]=HEAP8[r6];r4=r6+1|0;if((r4|0)==(r3|0)){r5=r3;break}else{r6=r4;r7=r7+1|0}}return r5}function __ZNKSt3__15ctypeIcE9do_narrowEPKcS3_cPc(r1,r2,r3,r4,r5){var r6,r7,r8;if((r2|0)==(r3|0)){r6=r2;return r6}else{r7=r2;r8=r5}while(1){r5=HEAP8[r7];HEAP8[r8]=r5<<24>>24>-1?r5:r4;r5=r7+1|0;if((r5|0)==(r3|0)){r6=r3;break}else{r7=r5;r8=r8+1|0}}return r6}function __ZNSt3__16locale5__imp7installEPNS0_5facetEl(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;__ZNSt3__114__shared_count12__add_sharedEv(r2|0);r4=r1+8|0;r5=r1+12|0;r1=HEAP32[r5>>2];r6=(r4|0)>>2;r7=HEAP32[r6];r8=r1-r7>>2;do{if(r8>>>0>r3>>>0){r9=r7}else{r10=r3+1|0;if(r8>>>0<r10>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r4,r10-r8|0);r9=HEAP32[r6];break}if(r8>>>0<=r10>>>0){r9=r7;break}r11=(r10<<2)+r7|0;if((r11|0)==(r1|0)){r9=r7;break}HEAP32[r5>>2]=(~((r1-4+ -r11|0)>>>2)<<2)+r1;r9=r7}}while(0);r7=HEAP32[r9+(r3<<2)>>2];if((r7|0)==0){r12=r9;r13=(r3<<2)+r12|0;HEAP32[r13>>2]=r2;return}__ZNSt3__114__shared_count16__release_sharedEv(r7|0);r12=HEAP32[r6];r13=(r3<<2)+r12|0;HEAP32[r13>>2]=r2;return}function __ZNSt3__16locale5__impD0Ev(r1){__ZNSt3__16locale5__impD2Ev(r1);__ZdlPv(r1);return}function __ZNSt3__16locale5__impD2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10;HEAP32[r1>>2]=4720;r2=(r1+12|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;r5=HEAP32[r4];if((r3|0)!=(r5|0)){r6=0;r7=r5;r5=r3;while(1){r3=HEAP32[r7+(r6<<2)>>2];if((r3|0)==0){r8=r5;r9=r7}else{__ZNSt3__114__shared_count16__release_sharedEv(r3|0);r8=HEAP32[r2];r9=HEAP32[r4]}r3=r6+1|0;if(r3>>>0<r8-r9>>2>>>0){r6=r3;r7=r9;r5=r8}else{break}}}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1+144|0);r8=HEAP32[r4];if((r8|0)==0){r10=r1|0;__ZNSt3__114__shared_countD2Ev(r10);return}r4=HEAP32[r2];if((r8|0)!=(r4|0)){HEAP32[r2]=(~((r4-4+ -r8|0)>>>2)<<2)+r4}if((r8|0)==(r1+24|0)){HEAP8[r1+136|0]=0;r10=r1|0;__ZNSt3__114__shared_countD2Ev(r10);return}else{__ZdlPv(r8);r10=r1|0;__ZNSt3__114__shared_countD2Ev(r10);return}}function __ZNSt3__16locale8__globalEv(){var r1,r2;if((HEAP8[15072]|0)!=0){r1=HEAP32[3284];return r1}if((___cxa_guard_acquire(15072)|0)==0){r1=HEAP32[3284];return r1}do{if((HEAP8[15080]|0)==0){if((___cxa_guard_acquire(15080)|0)==0){break}__ZNSt3__16locale5__impC2Ej(13328,1);HEAP32[3288]=13328;HEAP32[3286]=13152}}while(0);r2=HEAP32[HEAP32[3286]>>2];HEAP32[3290]=r2;__ZNSt3__114__shared_count12__add_sharedEv(r2|0);HEAP32[3284]=13160;r1=HEAP32[3284];return r1}function __ZNSt3__16localeC2ERKS0_(r1,r2){var r3;r3=HEAP32[r2>>2];HEAP32[r1>>2]=r3;__ZNSt3__114__shared_count12__add_sharedEv(r3|0);return}function __ZNSt3__16localeD2Ev(r1){__ZNSt3__114__shared_count16__release_sharedEv(HEAP32[r1>>2]|0);return}function __ZNKSt3__16locale9has_facetERNS0_2idE(r1,r2){var r3,r4,r5,r6,r7;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3,r5=r4>>2;r6=HEAP32[r1>>2];r1=r2|0;if((HEAP32[r1>>2]|0)!=-1){HEAP32[r5]=r2;HEAP32[r5+1]=26;HEAP32[r5+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(r1,r4,260)}r4=HEAP32[r2+4>>2]-1|0;r2=HEAP32[r6+8>>2];if(HEAP32[r6+12>>2]-r2>>2>>>0<=r4>>>0){r7=0;STACKTOP=r3;return r7}r7=(HEAP32[r2+(r4<<2)>>2]|0)!=0;STACKTOP=r3;return r7}function __ZNSt3__16locale5facetD0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__16locale5facet16__on_zero_sharedEv(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function __ZNSt3__15ctypeIwED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__15ctypeIcED0Ev(r1){var r2;HEAP32[r1>>2]=4832;r2=HEAP32[r1+8>>2];do{if((r2|0)!=0){if((HEAP8[r1+12|0]&1)==0){break}__ZdaPv(r2)}}while(0);__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__15ctypeIcED2Ev(r1){var r2;HEAP32[r1>>2]=4832;r2=HEAP32[r1+8>>2];do{if((r2|0)!=0){if((HEAP8[r1+12|0]&1)==0){break}__ZdaPv(r2)}}while(0);__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__17codecvtIcc10_mbstate_tED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__16localeC2Ev(r1){var r2,r3;r2=__ZNSt3__16locale8__globalEv()|0;r3=HEAP32[r2>>2];HEAP32[r1>>2]=r3;__ZNSt3__114__shared_count12__add_sharedEv(r3|0);return}function __ZNKSt3__16locale9use_facetERNS0_2idE(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3,r5=r4>>2;r6=HEAP32[r1>>2];r1=r2|0;if((HEAP32[r1>>2]|0)!=-1){HEAP32[r5]=r2;HEAP32[r5+1]=26;HEAP32[r5+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(r1,r4,260)}r4=HEAP32[r2+4>>2]-1|0;r2=HEAP32[r6+8>>2];if(HEAP32[r6+12>>2]-r2>>2>>>0<=r4>>>0){r7=___cxa_allocate_exception(4);r8=r7;__ZNSt8bad_castC2Ev(r8);___cxa_throw(r7,9304,382)}r6=HEAP32[r2+(r4<<2)>>2];if((r6|0)==0){r7=___cxa_allocate_exception(4);r8=r7;__ZNSt8bad_castC2Ev(r8);___cxa_throw(r7,9304,382)}else{STACKTOP=r3;return r6}}function __ZNKSt3__15ctypeIwE5do_isEtw(r1,r2,r3){var r4;if(r3>>>0>=128){r4=0;return r4}r1=___ctype_b_loc();r4=(HEAP16[HEAP32[r1>>2]+(r3<<1)>>1]&r2)<<16>>16!=0;return r4}function __ZNKSt3__15ctypeIwE5do_isEPKwS3_Pt(r1,r2,r3,r4){var r5,r6,r7,r8;if((r2|0)==(r3|0)){r5=r2;return r5}else{r6=r2;r7=r4}while(1){r4=HEAP32[r6>>2];if(r4>>>0<128){r2=___ctype_b_loc();r8=HEAP16[HEAP32[r2>>2]+(r4<<1)>>1]}else{r8=0}HEAP16[r7>>1]=r8;r4=r6+4|0;if((r4|0)==(r3|0)){r5=r3;break}else{r6=r4;r7=r7+2|0}}return r5}function __ZNKSt3__15ctypeIwE10do_scan_isEtPKwS3_(r1,r2,r3,r4){var r5,r6,r7;L2179:do{if((r3|0)==(r4|0)){r5=r3}else{r1=r3;while(1){r6=HEAP32[r1>>2];if(r6>>>0<128){r7=___ctype_b_loc();if((HEAP16[HEAP32[r7>>2]+(r6<<1)>>1]&r2)<<16>>16!=0){r5=r1;break L2179}}r6=r1+4|0;if((r6|0)==(r4|0)){r5=r4;break}else{r1=r6}}}}while(0);return r5}function __ZNKSt3__15ctypeIwE11do_scan_notEtPKwS3_(r1,r2,r3,r4){var r5,r6;r1=r3;while(1){if((r1|0)==(r4|0)){r5=r4;break}r3=HEAP32[r1>>2];if(r3>>>0>=128){r5=r1;break}r6=___ctype_b_loc();if((HEAP16[HEAP32[r6>>2]+(r3<<1)>>1]&r2)<<16>>16==0){r5=r1;break}else{r1=r1+4|0}}return r5}function __ZNKSt3__15ctypeIwE10do_toupperEw(r1,r2){var r3;if(r2>>>0>=128){r3=r2;return r3}r1=___ctype_toupper_loc();r3=HEAP32[HEAP32[r1>>2]+(r2<<2)>>2];return r3}function __ZNKSt3__15ctypeIwE10do_toupperEPwPKw(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP32[r5>>2];if(r2>>>0<128){r1=___ctype_toupper_loc();r6=HEAP32[HEAP32[r1>>2]+(r2<<2)>>2]}else{r6=r2}HEAP32[r5>>2]=r6;r2=r5+4|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNKSt3__15ctypeIwE10do_tolowerEw(r1,r2){var r3;if(r2>>>0>=128){r3=r2;return r3}r1=___ctype_tolower_loc();r3=HEAP32[HEAP32[r1>>2]+(r2<<2)>>2];return r3}function __ZNKSt3__15ctypeIwE10do_tolowerEPwPKw(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP32[r5>>2];if(r2>>>0<128){r1=___ctype_tolower_loc();r6=HEAP32[HEAP32[r1>>2]+(r2<<2)>>2]}else{r6=r2}HEAP32[r5>>2]=r6;r2=r5+4|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNKSt3__15ctypeIcE10do_toupperEc(r1,r2){var r3;if(r2<<24>>24<=-1){r3=r2;return r3}r1=___ctype_toupper_loc();r3=HEAP32[HEAP32[r1>>2]+((r2&255)<<2)>>2]&255;return r3}function __ZNKSt3__15ctypeIcE10do_toupperEPcPKc(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP8[r5];if(r2<<24>>24>-1){r1=___ctype_toupper_loc();r6=HEAP32[HEAP32[r1>>2]+(r2<<24>>24<<2)>>2]&255}else{r6=r2}HEAP8[r5]=r6;r2=r5+1|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNKSt3__15ctypeIcE10do_tolowerEc(r1,r2){var r3;if(r2<<24>>24<=-1){r3=r2;return r3}r1=___ctype_tolower_loc();r3=HEAP32[HEAP32[r1>>2]+(r2<<24>>24<<2)>>2]&255;return r3}function __ZNKSt3__15ctypeIcE10do_tolowerEPcPKc(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP8[r5];if(r2<<24>>24>-1){r1=___ctype_tolower_loc();r6=HEAP32[HEAP32[r1>>2]+(r2<<24>>24<<2)>>2]&255}else{r6=r2}HEAP8[r5]=r6;r2=r5+1|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNKSt3__17codecvtIcc10_mbstate_tE5do_inERS1_PKcS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){HEAP32[r5>>2]=r3;HEAP32[r8>>2]=r6;return 3}function __ZNKSt3__17codecvtIcc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){HEAP32[r5>>2]=r3;return 3}function __ZNKSt3__17codecvtIcc10_mbstate_tE11do_encodingEv(r1){return 1}function __ZNKSt3__17codecvtIcc10_mbstate_tE16do_always_noconvEv(r1){return 1}function __ZNKSt3__17codecvtIcc10_mbstate_tE13do_max_lengthEv(r1){return 1}function __ZNKSt3__17codecvtIwc10_mbstate_tE16do_always_noconvEv(r1){return 0}function __ZNKSt3__17codecvtIcc10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){r2=r4-r3|0;return r2>>>0<r5>>>0?r2:r5}function __ZNSt3__17codecvtIwc10_mbstate_tED0Ev(r1){__ZNSt3__17codecvtIwc10_mbstate_tED2Ev(r1);__ZdlPv(r1);return}function __ZNSt3__17codecvtIDsc10_mbstate_tED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNKSt3__17codecvtIDsc10_mbstate_tE6do_outERS1_PKDsS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L13utf16_to_utf8EPKtS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=(HEAP32[r1>>2]-r3>>1<<1)+r3;HEAP32[r8>>2]=r6+(HEAP32[r9>>2]-r6);STACKTOP=r2;return r10}function __ZNKSt3__17codecvtIwc10_mbstate_tE6do_outERS1_PKwS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r9=r8>>2;r8=r5>>2;r10=0;r11=STACKTOP;STACKTOP=STACKTOP+8|0;r12=r11;r13=r12;r14=STACKTOP;STACKTOP=STACKTOP+1|0;STACKTOP=STACKTOP+7>>3<<3;r15=r3;while(1){if((r15|0)==(r4|0)){r16=r4;break}if((HEAP32[r15>>2]|0)==0){r16=r15;break}else{r15=r15+4|0}}HEAP32[r9]=r6;HEAP32[r8]=r3;L2273:do{if((r3|0)==(r4|0)|(r6|0)==(r7|0)){r17=r3}else{r15=r2;r18=r7;r19=(r1+8|0)>>2;r20=r14|0;r21=r6;r22=r3;r23=r16;while(1){r24=HEAP32[r15+4>>2];HEAP32[r12>>2]=HEAP32[r15>>2];HEAP32[r12+4>>2]=r24;r24=_uselocale(HEAP32[r19]);r25=_wcsnrtombs(r21,r5,r23-r22>>2,r18-r21|0,r2);if((r24|0)!=0){_uselocale(r24)}if((r25|0)==-1){r10=1933;break}else if((r25|0)==0){r26=1;r10=1969;break}r24=HEAP32[r9]+r25|0;HEAP32[r9]=r24;if((r24|0)==(r7|0)){r10=1966;break}if((r23|0)==(r4|0)){r27=r4;r28=r24;r29=HEAP32[r8]}else{r24=_uselocale(HEAP32[r19]);r25=_wcrtomb(r20,0,r2);if((r24|0)!=0){_uselocale(r24)}if((r25|0)==-1){r26=2;r10=1971;break}r24=HEAP32[r9];if(r25>>>0>(r18-r24|0)>>>0){r26=1;r10=1972;break}L2292:do{if((r25|0)!=0){r30=r25;r31=r20;r32=r24;while(1){r33=HEAP8[r31];HEAP32[r9]=r32+1;HEAP8[r32]=r33;r33=r30-1|0;if((r33|0)==0){break L2292}r30=r33;r31=r31+1|0;r32=HEAP32[r9]}}}while(0);r24=HEAP32[r8]+4|0;HEAP32[r8]=r24;r25=r24;while(1){if((r25|0)==(r4|0)){r34=r4;break}if((HEAP32[r25>>2]|0)==0){r34=r25;break}else{r25=r25+4|0}}r27=r34;r28=HEAP32[r9];r29=r24}if((r29|0)==(r4|0)|(r28|0)==(r7|0)){r17=r29;break L2273}else{r21=r28;r22=r29;r23=r27}}if(r10==1933){HEAP32[r9]=r21;L2304:do{if((r22|0)==(HEAP32[r8]|0)){r35=r22}else{r23=r22;r20=r21;while(1){r18=HEAP32[r23>>2];r15=_uselocale(HEAP32[r19]);r25=_wcrtomb(r20,r18,r13);if((r15|0)!=0){_uselocale(r15)}if((r25|0)==-1){r35=r23;break L2304}r15=HEAP32[r9]+r25|0;HEAP32[r9]=r15;r25=r23+4|0;if((r25|0)==(HEAP32[r8]|0)){r35=r25;break}else{r23=r25;r20=r15}}}}while(0);HEAP32[r8]=r35;r26=2;STACKTOP=r11;return r26}else if(r10==1966){r17=HEAP32[r8];break}else if(r10==1969){STACKTOP=r11;return r26}else if(r10==1971){STACKTOP=r11;return r26}else if(r10==1972){STACKTOP=r11;return r26}}}while(0);r26=(r17|0)!=(r4|0)|0;STACKTOP=r11;return r26}function __ZNKSt3__17codecvtIwc10_mbstate_tE5do_inERS1_PKcS5_RS5_PwS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r9=r8>>2;r8=r5>>2;r10=0;r11=STACKTOP;STACKTOP=STACKTOP+8|0;r12=r11;r13=r12;r14=r3;while(1){if((r14|0)==(r4|0)){r15=r4;break}if((HEAP8[r14]|0)==0){r15=r14;break}else{r14=r14+1|0}}HEAP32[r9]=r6;HEAP32[r8]=r3;L2325:do{if((r3|0)==(r4|0)|(r6|0)==(r7|0)){r16=r3}else{r14=r2;r17=r7;r18=(r1+8|0)>>2;r19=r6;r20=r3;r21=r15;while(1){r22=HEAP32[r14+4>>2];HEAP32[r12>>2]=HEAP32[r14>>2];HEAP32[r12+4>>2]=r22;r23=r21;r22=_uselocale(HEAP32[r18]);r24=_mbsnrtowcs(r19,r5,r23-r20|0,r17-r19>>2,r2);if((r22|0)!=0){_uselocale(r22)}if((r24|0)==-1){r10=1988;break}else if((r24|0)==0){r25=2;r10=2023;break}r22=(r24<<2)+HEAP32[r9]|0;HEAP32[r9]=r22;if((r22|0)==(r7|0)){r10=2020;break}r24=HEAP32[r8];if((r21|0)==(r4|0)){r26=r4;r27=r22;r28=r24}else{r29=_uselocale(HEAP32[r18]);r30=_mbrtowc(r22,r24,1,r2);if((r29|0)!=0){_uselocale(r29)}if((r30|0)!=0){r25=2;r10=2027;break}HEAP32[r9]=HEAP32[r9]+4;r30=HEAP32[r8]+1|0;HEAP32[r8]=r30;r29=r30;while(1){if((r29|0)==(r4|0)){r31=r4;break}if((HEAP8[r29]|0)==0){r31=r29;break}else{r29=r29+1|0}}r26=r31;r27=HEAP32[r9];r28=r30}if((r28|0)==(r4|0)|(r27|0)==(r7|0)){r16=r28;break L2325}else{r19=r27;r20=r28;r21=r26}}if(r10==1988){HEAP32[r9]=r19;L2349:do{if((r20|0)==(HEAP32[r8]|0)){r32=r20}else{r21=r19;r17=r20;while(1){r14=_uselocale(HEAP32[r18]);r29=_mbrtowc(r21,r17,r23-r17|0,r13);if((r14|0)!=0){_uselocale(r14)}if((r29|0)==0){r33=r17+1|0}else if((r29|0)==-1){r10=1999;break}else if((r29|0)==-2){r10=2e3;break}else{r33=r17+r29|0}r29=HEAP32[r9]+4|0;HEAP32[r9]=r29;if((r33|0)==(HEAP32[r8]|0)){r32=r33;break L2349}else{r21=r29;r17=r33}}if(r10==1999){HEAP32[r8]=r17;r25=2;STACKTOP=r11;return r25}else if(r10==2e3){HEAP32[r8]=r17;r25=1;STACKTOP=r11;return r25}}}while(0);HEAP32[r8]=r32;r25=(r32|0)!=(r4|0)|0;STACKTOP=r11;return r25}else if(r10==2020){r16=HEAP32[r8];break}else if(r10==2023){STACKTOP=r11;return r25}else if(r10==2027){STACKTOP=r11;return r25}}}while(0);r25=(r16|0)!=(r4|0)|0;STACKTOP=r11;return r25}function __ZNKSt3__17codecvtIwc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r6=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[r5>>2]=r3;r3=r6|0;r7=_uselocale(HEAP32[r1+8>>2]);r1=_wcrtomb(r3,0,r2);if((r7|0)!=0){_uselocale(r7)}if((r1|0)==-1|(r1|0)==0){r8=2;STACKTOP=r6;return r8}r7=r1-1|0;r1=HEAP32[r5>>2];if(r7>>>0>(r4-r1|0)>>>0){r8=1;STACKTOP=r6;return r8}if((r7|0)==0){r8=0;STACKTOP=r6;return r8}else{r9=r7;r10=r3;r11=r1}while(1){r1=HEAP8[r10];HEAP32[r5>>2]=r11+1;HEAP8[r11]=r1;r1=r9-1|0;if((r1|0)==0){r8=0;break}r9=r1;r10=r10+1|0;r11=HEAP32[r5>>2]}STACKTOP=r6;return r8}function __ZNKSt3__17codecvtIwc10_mbstate_tE11do_encodingEv(r1){var r2,r3,r4,r5,r6;r2=r1+8|0;r1=_uselocale(HEAP32[r2>>2]);r3=_mbtowc(0,0,1);if((r1|0)!=0){_uselocale(r1)}if((r3|0)!=0){r4=-1;return r4}r3=HEAP32[r2>>2];if((r3|0)==0){r4=1;return r4}r4=_uselocale(r3);r3=___locale_mb_cur_max();if((r4|0)==0){r5=(r3|0)==1;r6=r5&1;return r6}_uselocale(r4);r5=(r3|0)==1;r6=r5&1;return r6}function __ZNKSt3__17codecvtIwc10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14;r6=0;if((r5|0)==0|(r3|0)==(r4|0)){r7=0;return r7}r8=r4;r9=r1+8|0;r1=r3;r3=0;r10=0;while(1){r11=_uselocale(HEAP32[r9>>2]);r12=_mbrlen(r1,r8-r1|0,r2);if((r11|0)!=0){_uselocale(r11)}if((r12|0)==0){r13=1;r14=r1+1|0}else if((r12|0)==-1|(r12|0)==-2){r7=r3;r6=2088;break}else{r13=r12;r14=r1+r12|0}r12=r13+r3|0;r11=r10+1|0;if(r11>>>0>=r5>>>0|(r14|0)==(r4|0)){r7=r12;r6=2090;break}else{r1=r14;r3=r12;r10=r11}}if(r6==2088){return r7}else if(r6==2090){return r7}}function __ZNKSt3__17codecvtIwc10_mbstate_tE13do_max_lengthEv(r1){var r2,r3,r4;r2=HEAP32[r1+8>>2];do{if((r2|0)==0){r3=1}else{r1=_uselocale(r2);r4=___locale_mb_cur_max();if((r1|0)==0){r3=r4;break}_uselocale(r1);r3=r4}}while(0);return r3}function __ZNKSt3__17codecvtIDsc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){HEAP32[r5>>2]=r3;return 3}function __ZNKSt3__17codecvtIDsc10_mbstate_tE11do_encodingEv(r1){return 0}function __ZNKSt3__17codecvtIDsc10_mbstate_tE16do_always_noconvEv(r1){return 0}function __ZNKSt3__17codecvtIDsc10_mbstate_tE13do_max_lengthEv(r1){return 4}function __ZNSt3__1L13utf16_to_utf8EPKtS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14;r9=r6>>2;r6=r3>>2;r3=0;HEAP32[r6]=r1;HEAP32[r9]=r4;do{if((r8&2|0)!=0){if((r5-r4|0)<3){r10=1;return r10}else{HEAP32[r9]=r4+1;HEAP8[r4]=-17;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-69;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-65;break}}}while(0);r4=r2;r8=HEAP32[r6];if(r8>>>0>=r2>>>0){r10=0;return r10}r1=r5;r5=r8;L2445:while(1){r8=HEAP16[r5>>1];r11=r8&65535;if(r11>>>0>r7>>>0){r10=2;r3=2137;break}do{if((r8&65535)<128){r12=HEAP32[r9];if((r1-r12|0)<1){r10=1;r3=2145;break L2445}HEAP32[r9]=r12+1;HEAP8[r12]=r8&255}else{if((r8&65535)<2048){r12=HEAP32[r9];if((r1-r12|0)<2){r10=1;r3=2144;break L2445}HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>6|192)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11&63|128)&255;break}if((r8&65535)<55296){r12=HEAP32[r9];if((r1-r12|0)<3){r10=1;r3=2133;break L2445}HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>12|224)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>6&63|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11&63|128)&255;break}if((r8&65535)>=56320){if((r8&65535)<57344){r10=2;r3=2139;break L2445}r12=HEAP32[r9];if((r1-r12|0)<3){r10=1;r3=2141;break L2445}HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>12|224)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>6&63|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11&63|128)&255;break}if((r4-r5|0)<4){r10=1;r3=2134;break L2445}r12=r5+2|0;r13=HEAPU16[r12>>1];if((r13&64512|0)!=56320){r10=2;r3=2142;break L2445}if((r1-HEAP32[r9]|0)<4){r10=1;r3=2143;break L2445}r14=r11&960;if(((r14<<10)+65536|r11<<10&64512|r13&1023)>>>0>r7>>>0){r10=2;r3=2140;break L2445}HEAP32[r6]=r12;r12=(r14>>>6)+1|0;r14=HEAP32[r9];HEAP32[r9]=r14+1;HEAP8[r14]=(r12>>>2|240)&255;r14=HEAP32[r9];HEAP32[r9]=r14+1;HEAP8[r14]=(r11>>>2&15|r12<<4&48|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11<<4&48|r13>>>6&15|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r13&63|128)&255}}while(0);r11=HEAP32[r6]+2|0;HEAP32[r6]=r11;if(r11>>>0<r2>>>0){r5=r11}else{r10=0;r3=2136;break}}if(r3==2133){return r10}else if(r3==2134){return r10}else if(r3==2136){return r10}else if(r3==2137){return r10}else if(r3==2139){return r10}else if(r3==2140){return r10}else if(r3==2141){return r10}else if(r3==2142){return r10}else if(r3==2143){return r10}else if(r3==2144){return r10}else if(r3==2145){return r10}}function __ZNSt3__1L13utf8_to_utf16EPKhS1_RS1_PtS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r9=r6>>2;r6=r3>>2;r3=0;HEAP32[r6]=r1;HEAP32[r9]=r4;r4=HEAP32[r6];do{if((r8&4|0)==0){r10=r4}else{if((r2-r4|0)<=2){r10=r4;break}if((HEAP8[r4]|0)!=-17){r10=r4;break}if((HEAP8[r4+1|0]|0)!=-69){r10=r4;break}if((HEAP8[r4+2|0]|0)!=-65){r10=r4;break}r1=r4+3|0;HEAP32[r6]=r1;r10=r1}}while(0);L2490:do{if(r10>>>0<r2>>>0){r4=r2;r8=r5;r1=HEAP32[r9],r11=r1>>1;r12=r10;L2492:while(1){if(r1>>>0>=r5>>>0){r13=r12;break L2490}r14=HEAP8[r12];r15=r14&255;if(r15>>>0>r7>>>0){r16=2;r3=2206;break}do{if(r14<<24>>24>-1){HEAP16[r11]=r14&255;HEAP32[r6]=HEAP32[r6]+1}else{if((r14&255)<194){r16=2;r3=2192;break L2492}if((r14&255)<224){if((r4-r12|0)<2){r16=1;r3=2207;break L2492}r17=HEAPU8[r12+1|0];if((r17&192|0)!=128){r16=2;r3=2203;break L2492}r18=r17&63|r15<<6&1984;if(r18>>>0>r7>>>0){r16=2;r3=2204;break L2492}HEAP16[r11]=r18&65535;HEAP32[r6]=HEAP32[r6]+2;break}if((r14&255)<240){if((r4-r12|0)<3){r16=1;r3=2205;break L2492}r18=HEAP8[r12+1|0];r17=HEAP8[r12+2|0];if((r15|0)==224){if((r18&-32)<<24>>24!=-96){r16=2;r3=2197;break L2492}}else if((r15|0)==237){if((r18&-32)<<24>>24!=-128){r16=2;r3=2198;break L2492}}else{if((r18&-64)<<24>>24!=-128){r16=2;r3=2199;break L2492}}r19=r17&255;if((r19&192|0)!=128){r16=2;r3=2200;break L2492}r17=(r18&255)<<6&4032|r15<<12|r19&63;if((r17&65535)>>>0>r7>>>0){r16=2;r3=2195;break L2492}HEAP16[r11]=r17&65535;HEAP32[r6]=HEAP32[r6]+3;break}if((r14&255)>=245){r16=2;r3=2190;break L2492}if((r4-r12|0)<4){r16=1;r3=2191;break L2492}r17=HEAP8[r12+1|0];r19=HEAP8[r12+2|0];r18=HEAP8[r12+3|0];if((r15|0)==240){if((r17+112&255)>=48){r16=2;r3=2189;break L2492}}else if((r15|0)==244){if((r17&-16)<<24>>24!=-128){r16=2;r3=2193;break L2492}}else{if((r17&-64)<<24>>24!=-128){r16=2;r3=2194;break L2492}}r20=r19&255;if((r20&192|0)!=128){r16=2;r3=2187;break L2492}r19=r18&255;if((r19&192|0)!=128){r16=2;r3=2188;break L2492}if((r8-r1|0)<4){r16=1;r3=2201;break L2492}r18=r15&7;r21=r17&255;r17=r20<<6;r22=r19&63;if((r21<<12&258048|r18<<18|r17&4032|r22)>>>0>r7>>>0){r16=2;r3=2202;break L2492}HEAP16[r11]=(r21<<2&60|r20>>>4&3|((r21>>>4&3|r18<<2)<<6)+16320|55296)&65535;r18=HEAP32[r9]+2|0;HEAP32[r9]=r18;HEAP16[r18>>1]=(r22|r17&960|56320)&65535;HEAP32[r6]=HEAP32[r6]+4}}while(0);r15=HEAP32[r9]+2|0;HEAP32[r9]=r15;r14=HEAP32[r6];if(r14>>>0<r2>>>0){r1=r15,r11=r1>>1;r12=r14}else{r13=r14;break L2490}}if(r3==2199){return r16}else if(r3==2200){return r16}else if(r3==2201){return r16}else if(r3==2202){return r16}else if(r3==2193){return r16}else if(r3==2194){return r16}else if(r3==2195){return r16}else if(r3==2189){return r16}else if(r3==2190){return r16}else if(r3==2191){return r16}else if(r3==2192){return r16}else if(r3==2187){return r16}else if(r3==2188){return r16}else if(r3==2197){return r16}else if(r3==2198){return r16}else if(r3==2203){return r16}else if(r3==2204){return r16}else if(r3==2205){return r16}else if(r3==2206){return r16}else if(r3==2207){return r16}}else{r13=r10}}while(0);r16=r13>>>0<r2>>>0|0;return r16}function __ZNSt3__1L20utf8_to_utf16_lengthEPKhS1_jmNS_12codecvt_modeE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r6=0;do{if((r5&4|0)==0){r7=r1}else{if((r2-r1|0)<=2){r7=r1;break}if((HEAP8[r1]|0)!=-17){r7=r1;break}if((HEAP8[r1+1|0]|0)!=-69){r7=r1;break}r7=(HEAP8[r1+2|0]|0)==-65?r1+3|0:r1}}while(0);L2559:do{if(r7>>>0<r2>>>0&(r3|0)!=0){r5=r2;r8=0;r9=r7;L2561:while(1){r10=HEAP8[r9];r11=r10&255;if(r11>>>0>r4>>>0){r12=r9;break L2559}do{if(r10<<24>>24>-1){r13=r9+1|0;r14=r8}else{if((r10&255)<194){r12=r9;break L2559}if((r10&255)<224){if((r5-r9|0)<2){r12=r9;break L2559}r15=HEAPU8[r9+1|0];if((r15&192|0)!=128){r12=r9;break L2559}if((r15&63|r11<<6&1984)>>>0>r4>>>0){r12=r9;break L2559}r13=r9+2|0;r14=r8;break}if((r10&255)<240){r16=r9;if((r5-r16|0)<3){r12=r9;break L2559}r15=HEAP8[r9+1|0];r17=HEAP8[r9+2|0];if((r11|0)==224){if((r15&-32)<<24>>24!=-96){r6=2228;break L2561}}else if((r11|0)==237){if((r15&-32)<<24>>24!=-128){r6=2230;break L2561}}else{if((r15&-64)<<24>>24!=-128){r6=2232;break L2561}}r18=r17&255;if((r18&192|0)!=128){r12=r9;break L2559}if(((r15&255)<<6&4032|r11<<12&61440|r18&63)>>>0>r4>>>0){r12=r9;break L2559}r13=r9+3|0;r14=r8;break}if((r10&255)>=245){r12=r9;break L2559}r19=r9;if((r5-r19|0)<4){r12=r9;break L2559}if((r3-r8|0)>>>0<2){r12=r9;break L2559}r18=HEAP8[r9+1|0];r15=HEAP8[r9+2|0];r17=HEAP8[r9+3|0];if((r11|0)==240){if((r18+112&255)>=48){r6=2241;break L2561}}else if((r11|0)==244){if((r18&-16)<<24>>24!=-128){r6=2243;break L2561}}else{if((r18&-64)<<24>>24!=-128){r6=2245;break L2561}}r20=r15&255;if((r20&192|0)!=128){r12=r9;break L2559}r15=r17&255;if((r15&192|0)!=128){r12=r9;break L2559}if(((r18&255)<<12&258048|r11<<18&1835008|r20<<6&4032|r15&63)>>>0>r4>>>0){r12=r9;break L2559}r13=r9+4|0;r14=r8+1|0}}while(0);r11=r14+1|0;if(r13>>>0<r2>>>0&r11>>>0<r3>>>0){r8=r11;r9=r13}else{r12=r13;break L2559}}if(r6==2245){r21=r19-r1|0;return r21}else if(r6==2230){r21=r16-r1|0;return r21}else if(r6==2228){r21=r16-r1|0;return r21}else if(r6==2241){r21=r19-r1|0;return r21}else if(r6==2243){r21=r19-r1|0;return r21}else if(r6==2232){r21=r16-r1|0;return r21}}else{r12=r7}}while(0);r21=r12-r1|0;return r21}function __ZNKSt3__17codecvtIDsc10_mbstate_tE5do_inERS1_PKcS5_RS5_PDsS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L13utf8_to_utf16EPKhS1_RS1_PtS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=r3+(HEAP32[r1>>2]-r3);HEAP32[r8>>2]=(HEAP32[r9>>2]-r6>>1<<1)+r6;STACKTOP=r2;return r10}function __ZNKSt3__17codecvtIDsc10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){return __ZNSt3__1L20utf8_to_utf16_lengthEPKhS1_jmNS_12codecvt_modeE(r3,r4,r5,1114111,0)}function __ZNSt3__17codecvtIDic10_mbstate_tED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNKSt3__17codecvtIDic10_mbstate_tE6do_outERS1_PKDiS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L12ucs4_to_utf8EPKjS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=(HEAP32[r1>>2]-r3>>2<<2)+r3;HEAP32[r8>>2]=r6+(HEAP32[r9>>2]-r6);STACKTOP=r2;return r10}function __ZNKSt3__17codecvtIDic10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){HEAP32[r5>>2]=r3;return 3}function __ZNKSt3__17codecvtIDic10_mbstate_tE11do_encodingEv(r1){return 0}function __ZNKSt3__17codecvtIDic10_mbstate_tE16do_always_noconvEv(r1){return 0}function __ZNKSt3__17codecvtIDic10_mbstate_tE13do_max_lengthEv(r1){return 4}function __ZNSt3__1L12ucs4_to_utf8EPKjS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12;r9=r6>>2;r6=0;HEAP32[r3>>2]=r1;HEAP32[r9]=r4;do{if((r8&2|0)!=0){if((r5-r4|0)<3){r10=1;return r10}else{HEAP32[r9]=r4+1;HEAP8[r4]=-17;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-69;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-65;break}}}while(0);r4=HEAP32[r3>>2];if(r4>>>0>=r2>>>0){r10=0;return r10}r8=r5;r5=r4;L2630:while(1){r4=HEAP32[r5>>2];if((r4&-2048|0)==55296|r4>>>0>r7>>>0){r10=2;r6=2291;break}do{if(r4>>>0<128){r1=HEAP32[r9];if((r8-r1|0)<1){r10=1;r6=2289;break L2630}HEAP32[r9]=r1+1;HEAP8[r1]=r4&255}else{if(r4>>>0<2048){r1=HEAP32[r9];if((r8-r1|0)<2){r10=1;r6=2292;break L2630}HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>6|192)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4&63|128)&255;break}r1=HEAP32[r9];r11=r8-r1|0;if(r4>>>0<65536){if((r11|0)<3){r10=1;r6=2287;break L2630}HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>12|224)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r4>>>6&63|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r4&63|128)&255;break}else{if((r11|0)<4){r10=1;r6=2290;break L2630}HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>18|240)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>12&63|128)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>6&63|128)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4&63|128)&255;break}}}while(0);r4=HEAP32[r3>>2]+4|0;HEAP32[r3>>2]=r4;if(r4>>>0<r2>>>0){r5=r4}else{r10=0;r6=2288;break}}if(r6==2292){return r10}else if(r6==2291){return r10}else if(r6==2287){return r10}else if(r6==2290){return r10}else if(r6==2289){return r10}else if(r6==2288){return r10}}function __ZNSt3__1L12utf8_to_ucs4EPKhS1_RS1_PjS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r9=r3>>2;r3=0;HEAP32[r9]=r1;HEAP32[r6>>2]=r4;r4=HEAP32[r9];do{if((r8&4|0)==0){r10=r4}else{if((r2-r4|0)<=2){r10=r4;break}if((HEAP8[r4]|0)!=-17){r10=r4;break}if((HEAP8[r4+1|0]|0)!=-69){r10=r4;break}if((HEAP8[r4+2|0]|0)!=-65){r10=r4;break}r1=r4+3|0;HEAP32[r9]=r1;r10=r1}}while(0);L2662:do{if(r10>>>0<r2>>>0){r4=r2;r8=HEAP32[r6>>2],r1=r8>>2;r11=r10;L2664:while(1){if(r8>>>0>=r5>>>0){r12=r11;break L2662}r13=HEAP8[r11];r14=r13&255;do{if(r13<<24>>24>-1){if(r14>>>0>r7>>>0){r15=2;r3=2351;break L2664}HEAP32[r1]=r14;HEAP32[r9]=HEAP32[r9]+1}else{if((r13&255)<194){r15=2;r3=2344;break L2664}if((r13&255)<224){if((r4-r11|0)<2){r15=1;r3=2353;break L2664}r16=HEAPU8[r11+1|0];if((r16&192|0)!=128){r15=2;r3=2345;break L2664}r17=r16&63|r14<<6&1984;if(r17>>>0>r7>>>0){r15=2;r3=2337;break L2664}HEAP32[r1]=r17;HEAP32[r9]=HEAP32[r9]+2;break}if((r13&255)<240){if((r4-r11|0)<3){r15=1;r3=2343;break L2664}r17=HEAP8[r11+1|0];r16=HEAP8[r11+2|0];if((r14|0)==237){if((r17&-32)<<24>>24!=-128){r15=2;r3=2342;break L2664}}else if((r14|0)==224){if((r17&-32)<<24>>24!=-96){r15=2;r3=2346;break L2664}}else{if((r17&-64)<<24>>24!=-128){r15=2;r3=2350;break L2664}}r18=r16&255;if((r18&192|0)!=128){r15=2;r3=2339;break L2664}r16=(r17&255)<<6&4032|r14<<12&61440|r18&63;if(r16>>>0>r7>>>0){r15=2;r3=2349;break L2664}HEAP32[r1]=r16;HEAP32[r9]=HEAP32[r9]+3;break}if((r13&255)>=245){r15=2;r3=2340;break L2664}if((r4-r11|0)<4){r15=1;r3=2341;break L2664}r16=HEAP8[r11+1|0];r18=HEAP8[r11+2|0];r17=HEAP8[r11+3|0];if((r14|0)==244){if((r16&-16)<<24>>24!=-128){r15=2;r3=2347;break L2664}}else if((r14|0)==240){if((r16+112&255)>=48){r15=2;r3=2354;break L2664}}else{if((r16&-64)<<24>>24!=-128){r15=2;r3=2348;break L2664}}r19=r18&255;if((r19&192|0)!=128){r15=2;r3=2338;break L2664}r18=r17&255;if((r18&192|0)!=128){r15=2;r3=2335;break L2664}r17=(r16&255)<<12&258048|r14<<18&1835008|r19<<6&4032|r18&63;if(r17>>>0>r7>>>0){r15=2;r3=2336;break L2664}HEAP32[r1]=r17;HEAP32[r9]=HEAP32[r9]+4}}while(0);r14=HEAP32[r6>>2]+4|0;HEAP32[r6>>2]=r14;r13=HEAP32[r9];if(r13>>>0<r2>>>0){r8=r14,r1=r8>>2;r11=r13}else{r12=r13;break L2662}}if(r3==2343){return r15}else if(r3==2344){return r15}else if(r3==2345){return r15}else if(r3==2346){return r15}else if(r3==2335){return r15}else if(r3==2339){return r15}else if(r3==2340){return r15}else if(r3==2341){return r15}else if(r3==2342){return r15}else if(r3==2336){return r15}else if(r3==2337){return r15}else if(r3==2338){return r15}else if(r3==2351){return r15}else if(r3==2353){return r15}else if(r3==2354){return r15}else if(r3==2347){return r15}else if(r3==2348){return r15}else if(r3==2349){return r15}else if(r3==2350){return r15}}else{r12=r10}}while(0);r15=r12>>>0<r2>>>0|0;return r15}function __ZNSt3__1L19utf8_to_ucs4_lengthEPKhS1_jmNS_12codecvt_modeE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r6=0;do{if((r5&4|0)==0){r7=r1}else{if((r2-r1|0)<=2){r7=r1;break}if((HEAP8[r1]|0)!=-17){r7=r1;break}if((HEAP8[r1+1|0]|0)!=-69){r7=r1;break}r7=(HEAP8[r1+2|0]|0)==-65?r1+3|0:r1}}while(0);L2729:do{if(r7>>>0<r2>>>0&(r3|0)!=0){r5=r2;r8=1;r9=r7;L2731:while(1){r10=HEAP8[r9];r11=r10&255;do{if(r10<<24>>24>-1){if(r11>>>0>r4>>>0){r12=r9;break L2729}r13=r9+1|0}else{if((r10&255)<194){r12=r9;break L2729}if((r10&255)<224){if((r5-r9|0)<2){r12=r9;break L2729}r14=HEAPU8[r9+1|0];if((r14&192|0)!=128){r12=r9;break L2729}if((r14&63|r11<<6&1984)>>>0>r4>>>0){r12=r9;break L2729}r13=r9+2|0;break}if((r10&255)<240){r15=r9;if((r5-r15|0)<3){r12=r9;break L2729}r14=HEAP8[r9+1|0];r16=HEAP8[r9+2|0];if((r11|0)==224){if((r14&-32)<<24>>24!=-96){r6=2375;break L2731}}else if((r11|0)==237){if((r14&-32)<<24>>24!=-128){r6=2377;break L2731}}else{if((r14&-64)<<24>>24!=-128){r6=2379;break L2731}}r17=r16&255;if((r17&192|0)!=128){r12=r9;break L2729}if(((r14&255)<<6&4032|r11<<12&61440|r17&63)>>>0>r4>>>0){r12=r9;break L2729}r13=r9+3|0;break}if((r10&255)>=245){r12=r9;break L2729}r18=r9;if((r5-r18|0)<4){r12=r9;break L2729}r17=HEAP8[r9+1|0];r14=HEAP8[r9+2|0];r16=HEAP8[r9+3|0];if((r11|0)==240){if((r17+112&255)>=48){r6=2387;break L2731}}else if((r11|0)==244){if((r17&-16)<<24>>24!=-128){r6=2389;break L2731}}else{if((r17&-64)<<24>>24!=-128){r6=2391;break L2731}}r19=r14&255;if((r19&192|0)!=128){r12=r9;break L2729}r14=r16&255;if((r14&192|0)!=128){r12=r9;break L2729}if(((r17&255)<<12&258048|r11<<18&1835008|r19<<6&4032|r14&63)>>>0>r4>>>0){r12=r9;break L2729}r13=r9+4|0}}while(0);if(!(r13>>>0<r2>>>0&r8>>>0<r3>>>0)){r12=r13;break L2729}r8=r8+1|0;r9=r13}if(r6==2389){r20=r18-r1|0;return r20}else if(r6==2375){r20=r15-r1|0;return r20}else if(r6==2377){r20=r15-r1|0;return r20}else if(r6==2379){r20=r15-r1|0;return r20}else if(r6==2391){r20=r18-r1|0;return r20}else if(r6==2387){r20=r18-r1|0;return r20}}else{r12=r7}}while(0);r20=r12-r1|0;return r20}function __ZNKSt3__18numpunctIcE16do_decimal_pointEv(r1){return HEAP8[r1+8|0]}function __ZNKSt3__18numpunctIwE16do_decimal_pointEv(r1){return HEAP32[r1+8>>2]}function __ZNKSt3__18numpunctIcE16do_thousands_sepEv(r1){return HEAP8[r1+9|0]}function __ZNKSt3__18numpunctIwE16do_thousands_sepEv(r1){return HEAP32[r1+12>>2]}function __ZNKSt3__17codecvtIDic10_mbstate_tE5do_inERS1_PKcS5_RS5_PDiS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L12utf8_to_ucs4EPKhS1_RS1_PjS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=r3+(HEAP32[r1>>2]-r3);HEAP32[r8>>2]=(HEAP32[r9>>2]-r6>>2<<2)+r6;STACKTOP=r2;return r10}function __ZNKSt3__17codecvtIDic10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){return __ZNSt3__1L19utf8_to_ucs4_lengthEPKhS1_jmNS_12codecvt_modeE(r3,r4,r5,1114111,0)}function __ZNSt3__116__narrow_to_utf8ILj32EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__117__widen_from_utf8ILj32EED0Ev(r1){__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18numpunctIcED0Ev(r1){HEAP32[r1>>2]=3928;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1+12|0);__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18numpunctIcED2Ev(r1){HEAP32[r1>>2]=3928;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1+12|0);__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNSt3__18numpunctIwED0Ev(r1){HEAP32[r1>>2]=3880;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1+16|0);__ZNSt3__114__shared_countD2Ev(r1|0);__ZdlPv(r1);return}function __ZNSt3__18numpunctIwED2Ev(r1){HEAP32[r1>>2]=3880;__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1+16|0);__ZNSt3__114__shared_countD2Ev(r1|0);return}function __ZNKSt3__18numpunctIcE11do_groupingEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_(r1,r2+12|0);return}function __ZNKSt3__18numpunctIwE11do_groupingEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1ERKS5_(r1,r2+16|0);return}function __ZNKSt3__18numpunctIcE11do_truenameEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1,1744,4);return}function __ZNKSt3__18numpunctIwE11do_truenameEv(r1,r2){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(r1,1720,_wcslen(1720));return}function __ZNKSt3__18numpunctIcE12do_falsenameEv(r1,r2){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(r1,1712,5);return}function __ZNKSt3__18numpunctIwE12do_falsenameEv(r1,r2){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(r1,1680,_wcslen(1680));return}function __ZNKSt3__120__time_get_c_storageIcE7__weeksEv(r1){var r2;if((HEAP8[15168]|0)!=0){r2=HEAP32[3410];return r2}if((___cxa_guard_acquire(15168)|0)==0){r2=HEAP32[3410];return r2}do{if((HEAP8[15056]|0)==0){if((___cxa_guard_acquire(15056)|0)==0){break}_memset(12680,0,168);_atexit(776,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12680,2288);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12692,2280);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12704,2272);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12716,2256);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12728,2240);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12740,2232);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12752,2216);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12764,2208);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12776,2200);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12788,2168);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12800,2160);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12812,2128);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12824,2120);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12836,2112);HEAP32[3410]=12680;r2=HEAP32[3410];return r2}function __ZNKSt3__120__time_get_c_storageIwE7__weeksEv(r1){var r2;if((HEAP8[15112]|0)!=0){r2=HEAP32[3388];return r2}if((___cxa_guard_acquire(15112)|0)==0){r2=HEAP32[3388];return r2}do{if((HEAP8[15032]|0)==0){if((___cxa_guard_acquire(15032)|0)==0){break}_memset(11936,0,168);_atexit(408,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11936,2720);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11948,2688);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11960,2656);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11972,2616);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11984,2552);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11996,2520);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12008,2480);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12020,2464);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12032,2408);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12044,2392);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12056,2376);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12068,2360);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12080,2344);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12092,2328);HEAP32[3388]=11936;r2=HEAP32[3388];return r2}function __ZNKSt3__120__time_get_c_storageIcE8__monthsEv(r1){var r2;if((HEAP8[15160]|0)!=0){r2=HEAP32[3408];return r2}if((___cxa_guard_acquire(15160)|0)==0){r2=HEAP32[3408];return r2}do{if((HEAP8[15048]|0)==0){if((___cxa_guard_acquire(15048)|0)==0){break}_memset(12392,0,288);_atexit(456,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12392,600);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12404,584);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12416,576);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12428,568);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12440,560);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12452,552);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12464,544);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12476,536);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12488,504);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12500,496);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12512,480);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12524,464);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12536,416);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12548,408);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12560,400);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12572,392);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12584,560);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12596,384);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12608,376);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12620,2784);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12632,2776);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12644,2768);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12656,2760);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12668,2752);HEAP32[3408]=12392;r2=HEAP32[3408];return r2}function __ZNKSt3__120__time_get_c_storageIwE8__monthsEv(r1){var r2;if((HEAP8[15104]|0)!=0){r2=HEAP32[3386];return r2}if((___cxa_guard_acquire(15104)|0)==0){r2=HEAP32[3386];return r2}do{if((HEAP8[15024]|0)==0){if((___cxa_guard_acquire(15024)|0)==0){break}_memset(11648,0,288);_atexit(340,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11648,1200);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11660,1160);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11672,1136);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11684,1088);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11696,760);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11708,1064);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11720,1040);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11732,1008);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11744,968);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11756,936);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11768,896);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11780,856);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11792,840);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11804,808);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11816,792);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11828,776);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11840,760);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11852,744);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11864,728);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11876,712);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11888,680);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11900,664);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11912,648);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(11924,608);HEAP32[3386]=11648;r2=HEAP32[3386];return r2}function __ZNKSt3__120__time_get_c_storageIcE7__am_pmEv(r1){var r2;if((HEAP8[15176]|0)!=0){r2=HEAP32[3412];return r2}if((___cxa_guard_acquire(15176)|0)==0){r2=HEAP32[3412];return r2}do{if((HEAP8[15064]|0)==0){if((___cxa_guard_acquire(15064)|0)==0){break}_memset(12848,0,288);_atexit(334,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12848,1240);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(12860,1232);HEAP32[3412]=12848;r2=HEAP32[3412];return r2}function __ZNKSt3__120__time_get_c_storageIwE7__am_pmEv(r1){var r2;if((HEAP8[15120]|0)!=0){r2=HEAP32[3390];return r2}if((___cxa_guard_acquire(15120)|0)==0){r2=HEAP32[3390];return r2}do{if((HEAP8[15040]|0)==0){if((___cxa_guard_acquire(15040)|0)==0){break}_memset(12104,0,288);_atexit(736,0,___dso_handle)}}while(0);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12104,1264);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKw(12116,1248);HEAP32[3390]=12104;r2=HEAP32[3390];return r2}function __ZNKSt3__120__time_get_c_storageIcE3__xEv(r1){if((HEAP8[15184]|0)!=0){return 13656}if((___cxa_guard_acquire(15184)|0)==0){return 13656}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(13656,1632,8);_atexit(768,13656,___dso_handle);return 13656}function __ZNKSt3__120__time_get_c_storageIwE3__xEv(r1){if((HEAP8[15128]|0)!=0){return 13568}if((___cxa_guard_acquire(15128)|0)==0){return 13568}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(13568,1592,_wcslen(1592));_atexit(522,13568,___dso_handle);return 13568}function __ZNKSt3__120__time_get_c_storageIcE3__XEv(r1){if((HEAP8[15208]|0)!=0){return 13704}if((___cxa_guard_acquire(15208)|0)==0){return 13704}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(13704,1560,8);_atexit(768,13704,___dso_handle);return 13704}function __ZNKSt3__120__time_get_c_storageIwE3__XEv(r1){if((HEAP8[15152]|0)!=0){return 13616}if((___cxa_guard_acquire(15152)|0)==0){return 13616}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(13616,1520,_wcslen(1520));_atexit(522,13616,___dso_handle);return 13616}function __ZNKSt3__120__time_get_c_storageIcE3__cEv(r1){if((HEAP8[15200]|0)!=0){return 13688}if((___cxa_guard_acquire(15200)|0)==0){return 13688}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(13688,1496,20);_atexit(768,13688,___dso_handle);return 13688}function __ZNKSt3__120__time_get_c_storageIwE3__cEv(r1){if((HEAP8[15144]|0)!=0){return 13600}if((___cxa_guard_acquire(15144)|0)==0){return 13600}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(13600,1408,_wcslen(1408));_atexit(522,13600,___dso_handle);return 13600}function __ZNKSt3__120__time_get_c_storageIcE3__rEv(r1){if((HEAP8[15192]|0)!=0){return 13672}if((___cxa_guard_acquire(15192)|0)==0){return 13672}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6__initEPKcj(13672,1392,11);_atexit(768,13672,___dso_handle);return 13672}function __ZNKSt3__120__time_get_c_storageIwE3__rEv(r1){if((HEAP8[15136]|0)!=0){return 13584}if((___cxa_guard_acquire(15136)|0)==0){return 13584}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6__initEPKwj(13584,1344,_wcslen(1344));_atexit(522,13584,___dso_handle);return 13584}function __ZNSt3__117__call_once_proxyINS_5tupleIJNS_12_GLOBAL__N_111__fake_bindEEEEEEvPv(r1){var r2,r3,r4,r5;r2=r1+4|0;r3=HEAP32[r1>>2]+HEAP32[r2+4>>2]|0;r1=r3;r4=HEAP32[r2>>2];if((r4&1|0)==0){r5=r4;FUNCTION_TABLE[r5](r1);return}else{r5=HEAP32[HEAP32[r3>>2]+(r4-1)>>2];FUNCTION_TABLE[r5](r1);return}}function ___cxx_global_array_dtor(r1){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12380);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12368);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12356);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12344);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12332);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12320);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12308);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12296);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12284);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12272);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12260);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12248);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12236);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12224);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12212);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12200);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12188);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12176);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12164);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12152);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12140);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12128);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12116);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12104);return}function ___cxx_global_array_dtor53(r1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13124);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13112);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13100);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13088);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13076);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13064);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13052);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13040);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13028);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13016);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(13004);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12992);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12980);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12968);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12956);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12944);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12932);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12920);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12908);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12896);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12884);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12872);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12860);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12848);return}function ___cxx_global_array_dtor56(r1){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11924);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11912);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11900);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11888);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11876);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11864);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11852);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11840);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11828);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11816);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11804);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11792);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11780);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11768);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11756);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11744);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11732);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11720);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11708);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11696);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11684);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11672);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11660);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11648);return}function ___cxx_global_array_dtor81(r1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12668);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12656);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12644);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12632);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12620);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12608);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12596);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12584);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12572);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12560);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12548);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12536);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12524);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12512);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12500);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12488);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12476);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12464);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12452);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12440);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12428);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12416);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12404);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12392);return}function ___cxx_global_array_dtor105(r1){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12092);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12080);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12068);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12056);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12044);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12032);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12020);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(12008);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11996);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11984);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11972);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11960);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11948);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(11936);return}function ___cxx_global_array_dtor120(r1){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12836);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12824);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12812);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12800);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12788);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12776);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12764);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12752);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12740);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12728);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12716);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12704);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12692);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(12680);return}function _mbrlen(r1,r2,r3){return _mbrtowc(0,r1,r2,(r3|0)!=0?r3:11168)}function _mbrtowc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;HEAP32[r6>>2]=r1;r7=(((r4|0)==0?11160:r4)|0)>>2;r4=HEAP32[r7];L33:do{if((r2|0)==0){if((r4|0)==0){r8=0}else{break}STACKTOP=r5;return r8}else{if((r1|0)==0){r9=r6;HEAP32[r6>>2]=r9;r10=r9}else{r10=r1}if((r3|0)==0){r8=-2;STACKTOP=r5;return r8}do{if((r4|0)==0){r9=HEAP8[r2];r11=r9&255;if(r9<<24>>24>-1){HEAP32[r10>>2]=r11;r8=r9<<24>>24!=0|0;STACKTOP=r5;return r8}else{r9=r11-194|0;if(r9>>>0>50){break L33}r12=r2+1|0;r13=HEAP32[___fsmu8+(r9<<2)>>2];r14=r3-1|0;break}}else{r12=r2;r13=r4;r14=r3}}while(0);L51:do{if((r14|0)==0){r15=r13}else{r9=HEAP8[r12];r11=(r9&255)>>>3;if((r11-16|(r13>>26)+r11)>>>0>7){break L33}else{r16=r12;r17=r13;r18=r14;r19=r9}while(1){r9=r16+1|0;r20=(r19&255)-128|r17<<6;r21=r18-1|0;if((r20|0)>=0){break}if((r21|0)==0){r15=r20;break L51}r11=HEAP8[r9];if(((r11&255)-128|0)>>>0>63){break L33}else{r16=r9;r17=r20;r18=r21;r19=r11}}HEAP32[r7]=0;HEAP32[r10>>2]=r20;r8=r3-r21|0;STACKTOP=r5;return r8}}while(0);HEAP32[r7]=r15;r8=-2;STACKTOP=r5;return r8}}while(0);HEAP32[r7]=0;r7=___errno_location();HEAP32[r7>>2]=138;r8=-1;STACKTOP=r5;return r8}function _mbsnrtowcs(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r6=STACKTOP;STACKTOP=STACKTOP+1032|0;r7=r6;r8=r6+1024,r9=r8>>2;r10=HEAP32[r2>>2];HEAP32[r9]=r10;r11=(r1|0)!=0;r12=r11?r4:256;r4=r11?r1:r7|0;L64:do{if((r10|0)==0|(r12|0)==0){r13=0;r14=r3;r15=r12;r16=r4;r17=r10}else{r1=r7|0;r18=r12;r19=r3;r20=0;r21=r4;r22=r10;while(1){r23=r19>>>2;r24=r23>>>0>=r18>>>0;if(!(r24|r19>>>0>131)){r13=r20;r14=r19;r15=r18;r16=r21;r17=r22;break L64}r25=r24?r18:r23;r26=r19-r25|0;r23=_mbsrtowcs(r21,r8,r25,r5);if((r23|0)==-1){break}if((r21|0)==(r1|0)){r27=r1;r28=r18}else{r27=(r23<<2)+r21|0;r28=r18-r23|0}r25=r23+r20|0;r23=HEAP32[r9];if((r23|0)==0|(r28|0)==0){r13=r25;r14=r26;r15=r28;r16=r27;r17=r23;break L64}else{r18=r28;r19=r26;r20=r25;r21=r27;r22=r23}}r13=-1;r14=r26;r15=0;r16=r21;r17=HEAP32[r9]}}while(0);L75:do{if((r17|0)==0){r29=r13}else{if((r15|0)==0|(r14|0)==0){r29=r13;break}else{r30=r15;r31=r14;r32=r13;r33=r16;r34=r17}while(1){r35=_mbrtowc(r33,r34,r31,r5);if((r35+2|0)>>>0<3){break}r26=HEAP32[r9]+r35|0;HEAP32[r9]=r26;r27=r30-1|0;r28=r32+1|0;if((r27|0)==0|(r31|0)==(r35|0)){r29=r28;break L75}else{r30=r27;r31=r31-r35|0;r32=r28;r33=r33+4|0;r34=r26}}if((r35|0)==0){HEAP32[r9]=0;r29=r32;break}else if((r35|0)==-1){r29=-1;break}else{HEAP32[r5>>2]=0;r29=r32;break}}}while(0);if(!r11){STACKTOP=r6;return r29}HEAP32[r2>>2]=HEAP32[r9];STACKTOP=r6;return r29}function __ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r3=0;r4=r1+8|0;r5=(r1+4|0)>>2;r6=HEAP32[r5];r7=HEAP32[r4>>2];r8=r6;if(r7-r8>>2>>>0>=r2>>>0){r9=r2;r10=r6;while(1){if((r10|0)==0){r11=0}else{HEAP32[r10>>2]=0;r11=HEAP32[r5]}r6=r11+4|0;HEAP32[r5]=r6;r12=r9-1|0;if((r12|0)==0){break}else{r9=r12;r10=r6}}return}r10=r1+16|0;r9=(r1|0)>>2;r11=HEAP32[r9];r6=r8-r11>>2;r8=r6+r2|0;if(r8>>>0>1073741823){__ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv(0)}r12=r7-r11|0;do{if(r12>>2>>>0>536870910){r13=1073741823;r3=88}else{r11=r12>>1;r7=r11>>>0<r8>>>0?r8:r11;if((r7|0)==0){r14=0;r15=0;break}r11=r1+128|0;if(!((HEAP8[r11]&1)==0&r7>>>0<29)){r13=r7;r3=88;break}HEAP8[r11]=1;r14=r10;r15=r7}}while(0);if(r3==88){r14=__Znwj(r13<<2);r15=r13}r13=r2;r2=(r6<<2)+r14|0;while(1){if((r2|0)==0){r16=0}else{HEAP32[r2>>2]=0;r16=r2}r17=r16+4|0;r3=r13-1|0;if((r3|0)==0){break}else{r13=r3;r2=r17}}r2=(r15<<2)+r14|0;r15=HEAP32[r9];r13=HEAP32[r5]-r15|0;r16=(r6-(r13>>2)<<2)+r14|0;r14=r16;r6=r15;_memcpy(r14,r6,r13)|0;HEAP32[r9]=r16;HEAP32[r5]=r17;HEAP32[r4>>2]=r2;if((r15|0)==0){return}if((r15|0)==(r10|0)){HEAP8[r1+128|0]=0;return}else{__ZdlPv(r6);return}}function __ZNSt9type_infoD2Ev(r1){return}function __ZNSt8bad_castD2Ev(r1){return}function __ZNKSt8bad_cast4whatEv(r1){return 1984}function __ZNK10__cxxabiv116__shim_type_info5noop1Ev(r1){return}function __ZNK10__cxxabiv116__shim_type_info5noop2Ev(r1){return}function _wcslen(r1){var r2;r2=r1;while(1){if((HEAP32[r2>>2]|0)==0){break}else{r2=r2+4|0}}return r2-r1>>2}function _wmemcpy(r1,r2,r3){var r4,r5,r6;if((r3|0)==0){return r1}else{r4=r2;r5=r3;r6=r1}while(1){r3=r5-1|0;HEAP32[r6>>2]=HEAP32[r4>>2];if((r3|0)==0){break}else{r4=r4+4|0;r5=r3;r6=r6+4|0}}return r1}function _wmemmove(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=(r3|0)==0;if(r1-r2>>2>>>0<r3>>>0){if(r4){return r1}else{r5=r3}while(1){r6=r5-1|0;HEAP32[r1+(r6<<2)>>2]=HEAP32[r2+(r6<<2)>>2];if((r6|0)==0){break}else{r5=r6}}return r1}else{if(r4){return r1}else{r7=r2;r8=r3;r9=r1}while(1){r3=r8-1|0;HEAP32[r9>>2]=HEAP32[r7>>2];if((r3|0)==0){break}else{r7=r7+4|0;r8=r3;r9=r9+4|0}}return r1}}function _wmemset(r1,r2,r3){var r4,r5;if((r3|0)==0){return r1}else{r4=r3;r5=r1}while(1){r3=r4-1|0;HEAP32[r5>>2]=r2;if((r3|0)==0){break}else{r4=r3;r5=r5+4|0}}return r1}function __ZNSt8bad_castC2Ev(r1){HEAP32[r1>>2]=3336;return}function _mbsrtowcs(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r5=0;r6=HEAP32[r2>>2];do{if((r4|0)==0){r5=135}else{r7=r4|0;r8=HEAP32[r7>>2];if((r8|0)==0){r5=135;break}if((r1|0)==0){r9=r8;r10=r6;r11=r3;r5=146;break}HEAP32[r7>>2]=0;r12=r8;r13=r6;r14=r1;r15=r3;r5=166}}while(0);if(r5==135){if((r1|0)==0){r16=r6;r17=r3;r5=137}else{r18=r6;r19=r1;r20=r3;r5=136}}L165:while(1){if(r5==137){r5=0;r6=HEAP8[r16];do{if(((r6&255)-1|0)>>>0<127){if((r16&3|0)!=0){r21=r16;r22=r17;r23=r6;break}r4=HEAP32[r16>>2];if(((r4-16843009|r4)&-2139062144|0)==0){r24=r17;r25=r16}else{r21=r16;r22=r17;r23=r4&255;break}while(1){r26=r25+4|0;r27=r24-4|0;r28=HEAP32[r26>>2];if(((r28-16843009|r28)&-2139062144|0)==0){r24=r27;r25=r26}else{break}}r21=r26;r22=r27;r23=r28&255}else{r21=r16;r22=r17;r23=r6}}while(0);r6=r23&255;if((r6-1|0)>>>0<127){r16=r21+1|0;r17=r22-1|0;r5=137;continue}r4=r6-194|0;if(r4>>>0>50){r29=r22;r30=r1;r31=r21;r5=177;break}r9=HEAP32[___fsmu8+(r4<<2)>>2];r10=r21+1|0;r11=r22;r5=146;continue}else if(r5==146){r5=0;r4=HEAPU8[r10]>>>3;if((r4-16|(r9>>26)+r4)>>>0>7){r5=147;break}r4=r10+1|0;do{if((r9&33554432|0)==0){r32=r4}else{if((HEAPU8[r4]-128|0)>>>0>63){r5=150;break L165}r6=r10+2|0;if((r9&524288|0)==0){r32=r6;break}if((HEAPU8[r6]-128|0)>>>0>63){r5=153;break L165}r32=r10+3|0}}while(0);r16=r32;r17=r11-1|0;r5=137;continue}else if(r5==136){r5=0;if((r20|0)==0){r33=r3;r5=185;break}else{r34=r20;r35=r19;r36=r18}while(1){r4=HEAP8[r36];do{if(((r4&255)-1|0)>>>0<127){if((r36&3|0)==0&r34>>>0>3){r37=r34;r38=r35,r39=r38>>2;r40=r36}else{r41=r36;r42=r35;r43=r34;r44=r4;break}while(1){r45=HEAP32[r40>>2];if(((r45-16843009|r45)&-2139062144|0)!=0){r5=160;break}HEAP32[r39]=r45&255;HEAP32[r39+1]=HEAPU8[r40+1|0];HEAP32[r39+2]=HEAPU8[r40+2|0];r46=r40+4|0;r47=r38+16|0;HEAP32[r39+3]=HEAPU8[r40+3|0];r48=r37-4|0;if(r48>>>0>3){r37=r48;r38=r47,r39=r38>>2;r40=r46}else{r5=161;break}}if(r5==160){r5=0;r41=r40;r42=r38;r43=r37;r44=r45&255;break}else if(r5==161){r5=0;r41=r46;r42=r47;r43=r48;r44=HEAP8[r46];break}}else{r41=r36;r42=r35;r43=r34;r44=r4}}while(0);r49=r44&255;if((r49-1|0)>>>0>=127){break}HEAP32[r42>>2]=r49;r4=r43-1|0;if((r4|0)==0){r33=r3;r5=184;break L165}else{r34=r4;r35=r42+4|0;r36=r41+1|0}}r4=r49-194|0;if(r4>>>0>50){r29=r43;r30=r42;r31=r41;r5=177;break}r12=HEAP32[___fsmu8+(r4<<2)>>2];r13=r41+1|0;r14=r42;r15=r43;r5=166;continue}else if(r5==166){r5=0;r4=HEAPU8[r13];r6=r4>>>3;if((r6-16|(r12>>26)+r6)>>>0>7){r5=167;break}r6=r13+1|0;r50=r4-128|r12<<6;do{if((r50|0)<0){r4=HEAPU8[r6]-128|0;if(r4>>>0>63){r5=170;break L165}r8=r13+2|0;r51=r4|r50<<6;if((r51|0)>=0){r52=r51;r53=r8;break}r4=HEAPU8[r8]-128|0;if(r4>>>0>63){r5=173;break L165}r52=r4|r51<<6;r53=r13+3|0}else{r52=r50;r53=r6}}while(0);HEAP32[r14>>2]=r52;r18=r53;r19=r14+4|0;r20=r15-1|0;r5=136;continue}}if(r5==153){r54=r9;r55=r10-1|0;r56=r1;r57=r11;r5=176}else if(r5==147){r54=r9;r55=r10-1|0;r56=r1;r57=r11;r5=176}else if(r5==150){r54=r9;r55=r10-1|0;r56=r1;r57=r11;r5=176}else if(r5==167){r54=r12;r55=r13-1|0;r56=r14;r57=r15;r5=176}else if(r5==170){r54=r50;r55=r13-1|0;r56=r14;r57=r15;r5=176}else if(r5==173){r54=r51;r55=r13-1|0;r56=r14;r57=r15;r5=176}else if(r5==184){return r33}else if(r5==185){return r33}if(r5==176){if((r54|0)==0){r29=r57;r30=r56;r31=r55;r5=177}else{r58=r56;r59=r55}}do{if(r5==177){if((HEAP8[r31]|0)!=0){r58=r30;r59=r31;break}if((r30|0)!=0){HEAP32[r30>>2]=0;HEAP32[r2>>2]=0}r33=r3-r29|0;return r33}}while(0);r29=___errno_location();HEAP32[r29>>2]=138;if((r58|0)==0){r33=-1;return r33}HEAP32[r2>>2]=r59;r33=-1;return r33}function _mbtowc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;HEAP32[r5>>2]=r1;if((r2|0)==0){r6=0;STACKTOP=r4;return r6}do{if((r3|0)!=0){if((r1|0)==0){r7=r5;HEAP32[r5>>2]=r7;r8=r7,r9=r8>>2}else{r8=r1,r9=r8>>2}r7=HEAP8[r2];r10=r7&255;if(r7<<24>>24>-1){HEAP32[r9]=r10;r6=r7<<24>>24!=0|0;STACKTOP=r4;return r6}r7=r10-194|0;if(r7>>>0>50){break}r10=r2+1|0;r11=HEAP32[___fsmu8+(r7<<2)>>2];if(r3>>>0<4){if((r11&-2147483648>>>(((r3*6&-1)-6|0)>>>0)|0)!=0){break}}r7=HEAPU8[r10];r10=r7>>>3;if((r10-16|(r11>>26)+r10)>>>0>7){break}r10=r7-128|r11<<6;if((r10|0)>=0){HEAP32[r9]=r10;r6=2;STACKTOP=r4;return r6}r11=HEAPU8[r2+2|0]-128|0;if(r11>>>0>63){break}r7=r11|r10<<6;if((r7|0)>=0){HEAP32[r9]=r7;r6=3;STACKTOP=r4;return r6}r10=HEAPU8[r2+3|0]-128|0;if(r10>>>0>63){break}HEAP32[r9]=r10|r7<<6;r6=4;STACKTOP=r4;return r6}}while(0);r9=___errno_location();HEAP32[r9>>2]=138;r6=-1;STACKTOP=r4;return r6}function _wcrtomb(r1,r2,r3){var r4;if((r1|0)==0){r4=1;return r4}if(r2>>>0<128){HEAP8[r1]=r2&255;r4=1;return r4}if(r2>>>0<2048){HEAP8[r1]=(r2>>>6|192)&255;HEAP8[r1+1|0]=(r2&63|128)&255;r4=2;return r4}if(r2>>>0<55296|(r2-57344|0)>>>0<8192){HEAP8[r1]=(r2>>>12|224)&255;HEAP8[r1+1|0]=(r2>>>6&63|128)&255;HEAP8[r1+2|0]=(r2&63|128)&255;r4=3;return r4}if((r2-65536|0)>>>0<1048576){HEAP8[r1]=(r2>>>18|240)&255;HEAP8[r1+1|0]=(r2>>>12&63|128)&255;HEAP8[r1+2|0]=(r2>>>6&63|128)&255;HEAP8[r1+3|0]=(r2&63|128)&255;r4=4;return r4}else{r2=___errno_location();HEAP32[r2>>2]=138;r4=-1;return r4}}function _wcsnrtombs(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r5=STACKTOP;STACKTOP=STACKTOP+264|0;r6=r5;r7=r5+256,r8=r7>>2;r9=HEAP32[r2>>2];HEAP32[r8]=r9;r10=(r1|0)!=0;r11=r10?r4:256;r4=r10?r1:r6|0;L286:do{if((r9|0)==0|(r11|0)==0){r12=0;r13=r3;r14=r11;r15=r4;r16=r9}else{r1=r6|0;r17=r11;r18=r3;r19=0;r20=r4;r21=r9;while(1){r22=r18>>>0>=r17>>>0;if(!(r22|r18>>>0>32)){r12=r19;r13=r18;r14=r17;r15=r20;r16=r21;break L286}r23=r22?r17:r18;r24=r18-r23|0;r22=_wcsrtombs(r20,r7,r23,0);if((r22|0)==-1){break}if((r20|0)==(r1|0)){r25=r1;r26=r17}else{r25=r20+r22|0;r26=r17-r22|0}r23=r22+r19|0;r22=HEAP32[r8];if((r22|0)==0|(r26|0)==0){r12=r23;r13=r24;r14=r26;r15=r25;r16=r22;break L286}else{r17=r26;r18=r24;r19=r23;r20=r25;r21=r22}}r12=-1;r13=r24;r14=0;r15=r20;r16=HEAP32[r8]}}while(0);L297:do{if((r16|0)==0){r27=r12}else{if((r14|0)==0|(r13|0)==0){r27=r12;break}else{r28=r14;r29=r13;r30=r12;r31=r15;r32=r16}while(1){r33=_wcrtomb(r31,HEAP32[r32>>2],0);if((r33+1|0)>>>0<2){break}r24=HEAP32[r8]+4|0;HEAP32[r8]=r24;r25=r29-1|0;r26=r30+1|0;if((r28|0)==(r33|0)|(r25|0)==0){r27=r26;break L297}else{r28=r28-r33|0;r29=r25;r30=r26;r31=r31+r33|0;r32=r24}}if((r33|0)!=0){r27=-1;break}HEAP32[r8]=0;r27=r30}}while(0);if(!r10){STACKTOP=r5;return r27}HEAP32[r2>>2]=HEAP32[r8];STACKTOP=r5;return r27}function _wcsrtombs(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r4=r2>>2;r2=0;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==0){r7=HEAP32[r4];r8=r6|0;r9=HEAP32[r7>>2];if((r9|0)==0){r10=0;STACKTOP=r5;return r10}else{r11=0;r12=r7;r13=r9}while(1){if(r13>>>0>127){r9=_wcrtomb(r8,r13,0);if((r9|0)==-1){r10=-1;r2=278;break}else{r14=r9}}else{r14=1}r9=r14+r11|0;r7=r12+4|0;r15=HEAP32[r7>>2];if((r15|0)==0){r10=r9;r2=279;break}else{r11=r9;r12=r7;r13=r15}}if(r2==278){STACKTOP=r5;return r10}else if(r2==279){STACKTOP=r5;return r10}}L323:do{if(r3>>>0>3){r13=r3;r12=r1;r11=HEAP32[r4];while(1){r14=HEAP32[r11>>2];if((r14|0)==0){r16=r13;r17=r12;break L323}if(r14>>>0>127){r8=_wcrtomb(r12,r14,0);if((r8|0)==-1){r10=-1;break}r18=r12+r8|0;r19=r13-r8|0;r20=r11}else{HEAP8[r12]=r14&255;r18=r12+1|0;r19=r13-1|0;r20=HEAP32[r4]}r14=r20+4|0;HEAP32[r4]=r14;if(r19>>>0>3){r13=r19;r12=r18;r11=r14}else{r16=r19;r17=r18;break L323}}STACKTOP=r5;return r10}else{r16=r3;r17=r1}}while(0);L335:do{if((r16|0)==0){r21=0}else{r1=r6|0;r18=r16;r19=r17;r20=HEAP32[r4];while(1){r11=HEAP32[r20>>2];if((r11|0)==0){r2=273;break}if(r11>>>0>127){r12=_wcrtomb(r1,r11,0);if((r12|0)==-1){r10=-1;r2=281;break}if(r12>>>0>r18>>>0){r2=269;break}_wcrtomb(r19,HEAP32[r20>>2],0);r22=r19+r12|0;r23=r18-r12|0;r24=r20}else{HEAP8[r19]=r11&255;r22=r19+1|0;r23=r18-1|0;r24=HEAP32[r4]}r11=r24+4|0;HEAP32[r4]=r11;if((r23|0)==0){r21=0;break L335}else{r18=r23;r19=r22;r20=r11}}if(r2==273){HEAP8[r19]=0;r21=r18;break}else if(r2==281){STACKTOP=r5;return r10}else if(r2==269){r10=r3-r18|0;STACKTOP=r5;return r10}}}while(0);HEAP32[r4]=0;r10=r3-r21|0;STACKTOP=r5;return r10}function __ZNSt8bad_castD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv116__shim_type_infoD2Ev(r1){__ZNSt9type_infoD2Ev(r1|0);return}function __ZN10__cxxabiv117__class_type_infoD0Ev(r1){__ZNSt9type_infoD2Ev(r1|0);__ZdlPv(r1);return}function __ZN10__cxxabiv120__si_class_type_infoD0Ev(r1){__ZNSt9type_infoD2Ev(r1|0);__ZdlPv(r1);return}function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5;if((HEAP32[r2+8>>2]|0)!=(r1|0)){return}r1=r2+16|0;r5=HEAP32[r1>>2];if((r5|0)==0){HEAP32[r1>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r5|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r3=r2+24|0;if((HEAP32[r3>>2]|0)!=2){return}HEAP32[r3>>2]=r4;return}function __ZN10__cxxabiv121__vmi_class_type_infoD0Ev(r1){__ZNSt9type_infoD2Ev(r1|0);__ZdlPv(r1);return}function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv(r1,r2,r3){var r4,r5,r6,r7,r8;r4=STACKTOP;STACKTOP=STACKTOP+56|0;r5=r4,r6=r5>>2;if((r1|0)==(r2|0)){r7=1;STACKTOP=r4;return r7}if((r2|0)==0){r7=0;STACKTOP=r4;return r7}r8=___dynamic_cast(r2,10864,10848,-1);r2=r8;if((r8|0)==0){r7=0;STACKTOP=r4;return r7}_memset(r5,0,56);HEAP32[r6]=r2;HEAP32[r6+2]=r1;HEAP32[r6+3]=-1;HEAP32[r6+12]=1;FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+28>>2]](r2,r5,HEAP32[r3>>2],1);if((HEAP32[r6+6]|0)!=1){r7=0;STACKTOP=r4;return r7}HEAP32[r3>>2]=HEAP32[r6+4];r7=1;STACKTOP=r4;return r7}function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5;if((r1|0)!=(HEAP32[r2+8>>2]|0)){r5=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+28>>2]](r5,r2,r3,r4);return}r5=r2+16|0;r1=HEAP32[r5>>2];if((r1|0)==0){HEAP32[r5>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r1|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r3=r2+24|0;if((HEAP32[r3>>2]|0)!=2){return}HEAP32[r3>>2]=r4;return}function __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r5=0;if((r1|0)==(HEAP32[r2+8>>2]|0)){r6=r2+16|0;r7=HEAP32[r6>>2];if((r7|0)==0){HEAP32[r6>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r7|0)!=(r3|0)){r7=r2+36|0;HEAP32[r7>>2]=HEAP32[r7>>2]+1;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r7=r2+24|0;if((HEAP32[r7>>2]|0)!=2){return}HEAP32[r7>>2]=r4;return}r7=HEAP32[r1+12>>2];r6=(r7<<3)+r1+16|0;r8=HEAP32[r1+20>>2];r9=r8>>8;if((r8&1|0)==0){r10=r9}else{r10=HEAP32[HEAP32[r3>>2]+r9>>2]}r9=HEAP32[r1+16>>2];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r9,r2,r3+r10|0,(r8&2|0)!=0?r4:2);if((r7|0)<=1){return}r7=r2+54|0;r8=r3;r10=r1+24|0;while(1){r1=HEAP32[r10+4>>2];r9=r1>>8;if((r1&1|0)==0){r11=r9}else{r11=HEAP32[HEAP32[r8>>2]+r9>>2]}r9=HEAP32[r10>>2];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r9,r2,r3+r11|0,(r1&2|0)!=0?r4:2);if((HEAP8[r7]&1)!=0){r5=342;break}r1=r10+8|0;if(r1>>>0<r6>>>0){r10=r1}else{r5=343;break}}if(r5==342){return}else if(r5==343){return}}function ___dynamic_cast(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r5=STACKTOP;STACKTOP=STACKTOP+56|0;r6=r5,r7=r6>>2;r8=HEAP32[r1>>2];r9=r1+HEAP32[r8-8>>2]|0;r10=HEAP32[r8-4>>2];r8=r10;HEAP32[r7]=r3;HEAP32[r7+1]=r1;HEAP32[r7+2]=r2;HEAP32[r7+3]=r4;r4=r6+16|0;r2=r6+20|0;r1=r6+24|0;r11=r6+28|0;r12=r6+32|0;r13=r6+40|0;_memset(r4,0,39);if((r10|0)==(r3|0)){HEAP32[r7+12]=1;FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+20>>2]](r8,r6,r9,r9,1,0);STACKTOP=r5;return(HEAP32[r1>>2]|0)==1?r9:0}FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+24>>2]](r8,r6,r9,1,0);r9=HEAP32[r7+9];if((r9|0)==0){if((HEAP32[r13>>2]|0)!=1){r14=0;STACKTOP=r5;return r14}if((HEAP32[r11>>2]|0)!=1){r14=0;STACKTOP=r5;return r14}r14=(HEAP32[r12>>2]|0)==1?HEAP32[r2>>2]:0;STACKTOP=r5;return r14}else if((r9|0)==1){do{if((HEAP32[r1>>2]|0)!=1){if((HEAP32[r13>>2]|0)!=0){r14=0;STACKTOP=r5;return r14}if((HEAP32[r11>>2]|0)!=1){r14=0;STACKTOP=r5;return r14}if((HEAP32[r12>>2]|0)==1){break}else{r14=0}STACKTOP=r5;return r14}}while(0);r14=HEAP32[r4>>2];STACKTOP=r5;return r14}else{r14=0;STACKTOP=r5;return r14}}function __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r6=r2>>2;r7=r1>>2;r8=0;r9=r1|0;if((r9|0)==(HEAP32[r6+2]|0)){if((HEAP32[r6+1]|0)!=(r3|0)){return}r10=r2+28|0;if((HEAP32[r10>>2]|0)==1){return}HEAP32[r10>>2]=r4;return}if((r9|0)==(HEAP32[r6]|0)){do{if((HEAP32[r6+4]|0)!=(r3|0)){r9=r2+20|0;if((HEAP32[r9>>2]|0)==(r3|0)){break}HEAP32[r6+8]=r4;r10=(r2+44|0)>>2;if((HEAP32[r10]|0)==4){return}r11=HEAP32[r7+3];r12=(r11<<3)+r1+16|0;L481:do{if((r11|0)>0){r13=r2+52|0;r14=r2+53|0;r15=r2+54|0;r16=r1+8|0;r17=r2+24|0;r18=r3;r19=0;r20=r1+16|0;r21=0;L483:while(1){HEAP8[r13]=0;HEAP8[r14]=0;r22=HEAP32[r20+4>>2];r23=r22>>8;if((r22&1|0)==0){r24=r23}else{r24=HEAP32[HEAP32[r18>>2]+r23>>2]}r23=HEAP32[r20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+20>>2]](r23,r2,r3,r3+r24|0,2-(r22>>>1&1)|0,r5);if((HEAP8[r15]&1)!=0){r25=r21;r26=r19;break}do{if((HEAP8[r14]&1)==0){r27=r21;r28=r19}else{if((HEAP8[r13]&1)==0){if((HEAP32[r16>>2]&1|0)==0){r25=1;r26=r19;break L483}else{r27=1;r28=r19;break}}if((HEAP32[r17>>2]|0)==1){r8=395;break L481}if((HEAP32[r16>>2]&2|0)==0){r8=395;break L481}else{r27=1;r28=1}}}while(0);r22=r20+8|0;if(r22>>>0<r12>>>0){r19=r28;r20=r22;r21=r27}else{r25=r27;r26=r28;break}}if(r26){r29=r25;r8=394}else{r30=r25;r8=391}}else{r30=0;r8=391}}while(0);do{if(r8==391){HEAP32[r9>>2]=r3;r12=r2+40|0;HEAP32[r12>>2]=HEAP32[r12>>2]+1;if((HEAP32[r6+9]|0)!=1){r29=r30;r8=394;break}if((HEAP32[r6+6]|0)!=2){r29=r30;r8=394;break}HEAP8[r2+54|0]=1;if(r30){r8=395}else{r8=396}}}while(0);if(r8==394){if(r29){r8=395}else{r8=396}}if(r8==395){HEAP32[r10]=3;return}else if(r8==396){HEAP32[r10]=4;return}}}while(0);if((r4|0)!=1){return}HEAP32[r6+8]=1;return}r6=HEAP32[r7+3];r29=(r6<<3)+r1+16|0;r30=HEAP32[r7+5];r25=r30>>8;if((r30&1|0)==0){r31=r25}else{r31=HEAP32[HEAP32[r3>>2]+r25>>2]}r25=HEAP32[r7+4];FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+24>>2]](r25,r2,r3+r31|0,(r30&2|0)!=0?r4:2,r5);r30=r1+24|0;if((r6|0)<=1){return}r6=HEAP32[r7+2];do{if((r6&2|0)==0){r7=(r2+36|0)>>2;if((HEAP32[r7]|0)==1){break}if((r6&1|0)==0){r1=r2+54|0;r31=r3;r25=r30;while(1){if((HEAP8[r1]&1)!=0){r8=433;break}if((HEAP32[r7]|0)==1){r8=434;break}r26=HEAP32[r25+4>>2];r28=r26>>8;if((r26&1|0)==0){r32=r28}else{r32=HEAP32[HEAP32[r31>>2]+r28>>2]}r28=HEAP32[r25>>2];FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+24>>2]](r28,r2,r3+r32|0,(r26&2|0)!=0?r4:2,r5);r26=r25+8|0;if(r26>>>0<r29>>>0){r25=r26}else{r8=435;break}}if(r8==433){return}else if(r8==434){return}else if(r8==435){return}}r25=r2+24|0;r31=r2+54|0;r1=r3;r10=r30;while(1){if((HEAP8[r31]&1)!=0){r8=424;break}if((HEAP32[r7]|0)==1){if((HEAP32[r25>>2]|0)==1){r8=436;break}}r26=HEAP32[r10+4>>2];r28=r26>>8;if((r26&1|0)==0){r33=r28}else{r33=HEAP32[HEAP32[r1>>2]+r28>>2]}r28=HEAP32[r10>>2];FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+24>>2]](r28,r2,r3+r33|0,(r26&2|0)!=0?r4:2,r5);r26=r10+8|0;if(r26>>>0<r29>>>0){r10=r26}else{r8=432;break}}if(r8==424){return}else if(r8==432){return}else if(r8==436){return}}}while(0);r33=r2+54|0;r32=r3;r6=r30;while(1){if((HEAP8[r33]&1)!=0){r8=422;break}r30=HEAP32[r6+4>>2];r10=r30>>8;if((r30&1|0)==0){r34=r10}else{r34=HEAP32[HEAP32[r32>>2]+r10>>2]}r10=HEAP32[r6>>2];FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+24>>2]](r10,r2,r3+r34|0,(r30&2|0)!=0?r4:2,r5);r30=r6+8|0;if(r30>>>0<r29>>>0){r6=r30}else{r8=423;break}}if(r8==422){return}else if(r8==423){return}}function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13;r6=r2>>2;r7=0;r8=r1|0;if((r8|0)==(HEAP32[r6+2]|0)){if((HEAP32[r6+1]|0)!=(r3|0)){return}r9=r2+28|0;if((HEAP32[r9>>2]|0)==1){return}HEAP32[r9>>2]=r4;return}if((r8|0)!=(HEAP32[r6]|0)){r8=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+24>>2]](r8,r2,r3,r4,r5);return}do{if((HEAP32[r6+4]|0)!=(r3|0)){r8=r2+20|0;if((HEAP32[r8>>2]|0)==(r3|0)){break}HEAP32[r6+8]=r4;r9=(r2+44|0)>>2;if((HEAP32[r9]|0)==4){return}r10=r2+52|0;HEAP8[r10]=0;r11=r2+53|0;HEAP8[r11]=0;r12=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+20>>2]](r12,r2,r3,r3,1,r5);if((HEAP8[r11]&1)==0){r13=0;r7=451}else{if((HEAP8[r10]&1)==0){r13=1;r7=451}}L583:do{if(r7==451){HEAP32[r8>>2]=r3;r10=r2+40|0;HEAP32[r10>>2]=HEAP32[r10>>2]+1;do{if((HEAP32[r6+9]|0)==1){if((HEAP32[r6+6]|0)!=2){r7=454;break}HEAP8[r2+54|0]=1;if(r13){break L583}}else{r7=454}}while(0);if(r7==454){if(r13){break}}HEAP32[r9]=4;return}}while(0);HEAP32[r9]=3;return}}while(0);if((r4|0)!=1){return}HEAP32[r6+8]=1;return}function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6;r5=r2>>2;if((HEAP32[r5+2]|0)==(r1|0)){if((HEAP32[r5+1]|0)!=(r3|0)){return}r6=r2+28|0;if((HEAP32[r6>>2]|0)==1){return}HEAP32[r6>>2]=r4;return}if((HEAP32[r5]|0)!=(r1|0)){return}do{if((HEAP32[r5+4]|0)!=(r3|0)){r1=r2+20|0;if((HEAP32[r1>>2]|0)==(r3|0)){break}HEAP32[r5+8]=r4;HEAP32[r1>>2]=r3;r1=r2+40|0;HEAP32[r1>>2]=HEAP32[r1>>2]+1;do{if((HEAP32[r5+9]|0)==1){if((HEAP32[r5+6]|0)!=2){break}HEAP8[r2+54|0]=1}}while(0);HEAP32[r5+11]=4;return}}while(0);if((r4|0)!=1){return}HEAP32[r5+8]=1;return}function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7;r6=r2>>2;if((HEAP32[r6+2]|0)!=(r1|0)){return}HEAP8[r2+53|0]=1;if((HEAP32[r6+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r1=HEAP32[r4>>2];if((r1|0)==0){HEAP32[r4>>2]=r3;HEAP32[r6+6]=r5;HEAP32[r6+9]=1;if(!((HEAP32[r6+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r1|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r1=HEAP32[r3>>2];if((r1|0)==2){HEAP32[r3>>2]=r5;r7=r5}else{r7=r1}if(!((HEAP32[r6+12]|0)==1&(r7|0)==1)){return}HEAP8[r2+54|0]=1;return}function __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r7=r2>>2;if((r1|0)!=(HEAP32[r7+2]|0)){r8=r2+52|0;r9=HEAP8[r8]&1;r10=r2+53|0;r11=HEAP8[r10]&1;r12=HEAP32[r1+12>>2];r13=(r12<<3)+r1+16|0;HEAP8[r8]=0;HEAP8[r10]=0;r14=HEAP32[r1+20>>2];r15=r14>>8;if((r14&1|0)==0){r16=r15}else{r16=HEAP32[HEAP32[r4>>2]+r15>>2]}r15=HEAP32[r1+16>>2];FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+20>>2]](r15,r2,r3,r4+r16|0,(r14&2|0)!=0?r5:2,r6);L657:do{if((r12|0)>1){r14=r2+24|0;r16=r1+8|0;r15=r2+54|0;r17=r4;r18=r1+24|0;while(1){if((HEAP8[r15]&1)!=0){break L657}do{if((HEAP8[r8]&1)==0){if((HEAP8[r10]&1)==0){break}if((HEAP32[r16>>2]&1|0)==0){break L657}}else{if((HEAP32[r14>>2]|0)==1){break L657}if((HEAP32[r16>>2]&2|0)==0){break L657}}}while(0);HEAP8[r8]=0;HEAP8[r10]=0;r19=HEAP32[r18+4>>2];r20=r19>>8;if((r19&1|0)==0){r21=r20}else{r21=HEAP32[HEAP32[r17>>2]+r20>>2]}r20=HEAP32[r18>>2];FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+20>>2]](r20,r2,r3,r4+r21|0,(r19&2|0)!=0?r5:2,r6);r19=r18+8|0;if(r19>>>0<r13>>>0){r18=r19}else{break}}}}while(0);HEAP8[r8]=r9;HEAP8[r10]=r11;return}HEAP8[r2+53|0]=1;if((HEAP32[r7+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r11=HEAP32[r4>>2];if((r11|0)==0){HEAP32[r4>>2]=r3;HEAP32[r7+6]=r5;HEAP32[r7+9]=1;if(!((HEAP32[r7+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r11|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r11=HEAP32[r3>>2];if((r11|0)==2){HEAP32[r3>>2]=r5;r22=r5}else{r22=r11}if(!((HEAP32[r7+12]|0)==1&(r22|0)==1)){return}HEAP8[r2+54|0]=1;return}function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7,r8,r9;r7=r2>>2;if((r1|0)!=(HEAP32[r7+2]|0)){r8=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+20>>2]](r8,r2,r3,r4,r5,r6);return}HEAP8[r2+53|0]=1;if((HEAP32[r7+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r6=HEAP32[r4>>2];if((r6|0)==0){HEAP32[r4>>2]=r3;HEAP32[r7+6]=r5;HEAP32[r7+9]=1;if(!((HEAP32[r7+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r6|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r6=HEAP32[r3>>2];if((r6|0)==2){HEAP32[r3>>2]=r5;r9=r5}else{r9=r6}if(!((HEAP32[r7+12]|0)==1&(r9|0)==1)){return}HEAP8[r2+54|0]=1;return}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[2794];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+11216|0;r10=(r8+2<<2)+11216|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[2794]=r5&~(1<<r7)}else{if(r12>>>0<HEAP32[2798]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[2796]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+11216|0;r13=(r17+2<<2)+11216|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[2794]=r5&~(1<<r19)}else{if(r12>>>0<HEAP32[2798]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[2796];if((r12|0)!=0){r18=HEAP32[2799];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+11216|0;r11=HEAP32[2794];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[2794]=r11|r8;r20=r6;r21=(r12+2<<2)+11216|0}else{r4=(r12+2<<2)+11216|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[2798]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[2796]=r13;HEAP32[2799]=r5;r14=r9;return r14}r12=HEAP32[2795];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+11480>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[2798];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break}else{r25=r8;r26=r12}}else{r25=r7;r26=r18}while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L799:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+11480|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[2795]=HEAP32[2795]&~(1<<HEAP32[r6>>2]);break L799}else{if(r5>>>0<HEAP32[2798]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L799}}}while(0);if(r23>>>0<HEAP32[2798]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[2796];if((r6|0)!=0){r5=HEAP32[2799];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+11216|0;r12=HEAP32[2794];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[2794]=r12|r7;r27=r18;r28=(r6+2<<2)+11216|0}else{r9=(r6+2<<2)+11216|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[2798]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[2796]=r11;HEAP32[2799]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[2795];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+11480>>2];L847:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L847}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+11480>>2]}else{r38=r34}if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[2796]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r31=r40,r5=r31>>2;r11=HEAP32[2798];if(r31>>>0<r11>>>0){_abort()}r18=r31+r7|0;r19=r18;if(r31>>>0>=r18>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break}else{r44=r8;r45=r6}}else{r44=r4;r45=r9}while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r11>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r11>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L897:do{if((r17|0)!=0){r13=r40+28|0;r11=(HEAP32[r13>>2]<<2)+11480|0;do{if((r40|0)==(HEAP32[r11>>2]|0)){HEAP32[r11>>2]=r42;if((r42|0)!=0){break}HEAP32[2795]=HEAP32[2795]&~(1<<HEAP32[r13>>2]);break L897}else{if(r17>>>0<HEAP32[2798]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L897}}}while(0);if(r42>>>0<HEAP32[2798]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r31+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r5]=r39|1;HEAP32[(r39>>2)+r5+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r11=(r17<<2)+11216|0;r9=HEAP32[2794];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[2794]=r9|r6;r46=r11;r47=(r17+2<<2)+11216|0}else{r13=(r17+2<<2)+11216|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[2798]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r19;HEAP32[r46+12>>2]=r19;HEAP32[r12+(r5+2)]=r46;HEAP32[r12+(r5+3)]=r11;break}r17=r18;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+11480|0;HEAP32[r12+(r5+7)]=r48;HEAP32[r12+(r5+5)]=0;HEAP32[r12+(r5+4)]=0;r11=HEAP32[2795];r30=1<<r48;if((r11&r30|0)==0){HEAP32[2795]=r11|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r5+6)]=r6;HEAP32[r12+(r5+3)]=r17;HEAP32[r12+(r5+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r11=HEAP32[r6>>2];while(1){if((HEAP32[r11+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r11+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=711;break}else{r30=r30<<1;r11=r6}}if(r2==711){if(r50>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r5+6)]=r11;HEAP32[r12+(r5+3)]=r17;HEAP32[r12+(r5+2)]=r17;break}}r30=r11+8|0;r6=HEAP32[r30>>2];r13=HEAP32[2798];if(r11>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r5+2)]=r6;HEAP32[r12+(r5+3)]=r11;HEAP32[r12+(r5+6)]=0;break}}}while(0);r5=r40+8|0;if((r5|0)==0){r15=r7,r16=r15>>2;break}else{r14=r5}return r14}}while(0);r40=HEAP32[2796];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[2799];if(r50>>>0>15){r49=r39;HEAP32[2799]=r49+r15;HEAP32[2796]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[2796]=0;HEAP32[2799]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[2797];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[2797]=r50;r39=HEAP32[2800];r40=r39;HEAP32[2800]=r40+r15;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[2784]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[2786]=r39;HEAP32[2785]=r39;HEAP32[2787]=-1;HEAP32[2788]=-1;HEAP32[2789]=0;HEAP32[2905]=0;r39=_time(0)&-16^1431655768;HEAP32[2784]=r39;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[2786];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[2904];do{if((r46|0)!=0){r47=HEAP32[2902];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L989:do{if((HEAP32[2905]&4|0)==0){r46=HEAP32[2800];L991:do{if((r46|0)==0){r2=741}else{r41=r46;r47=11624;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=741;break L991}else{r47=r42}}if((r47|0)==0){r2=741;break}r41=r49-HEAP32[2797]&r48;if(r41>>>0>=2147483647){r53=0;break}r11=_sbrk(r41);r17=(r11|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r11:-1;r55=r17?r41:0;r56=r11;r57=r41;r2=750}}while(0);do{if(r2==741){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[2785];r11=r41-1|0;if((r11&r7|0)==0){r58=r50}else{r58=r50-r7+(r11+r7&-r41)|0}r41=HEAP32[2902];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r11=HEAP32[2904];if((r11|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r11>>>0){r53=0;break}}r11=_sbrk(r58);r7=(r11|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r11;r57=r58;r2=750}}while(0);L1011:do{if(r2==750){r11=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=761;break L989}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[2786];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r11);r53=r55;break L1011}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=761;break L989}}}while(0);HEAP32[2905]=HEAP32[2905]|4;r64=r53;r2=758}else{r64=0;r2=758}}while(0);do{if(r2==758){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)!=-1){r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=761}}}while(0);do{if(r2==761){r64=HEAP32[2902]+r59|0;HEAP32[2902]=r64;if(r64>>>0>HEAP32[2903]>>>0){HEAP32[2903]=r64}r64=HEAP32[2800],r50=r64>>2;L1031:do{if((r64|0)==0){r55=HEAP32[2798];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[2798]=r61}HEAP32[2906]=r61;HEAP32[2907]=r59;HEAP32[2909]=0;HEAP32[2803]=HEAP32[2784];HEAP32[2802]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+11216|0;HEAP32[(r63+3<<2)+11216>>2]=r56;HEAP32[(r63+2<<2)+11216>>2]=r56;r56=r55+1|0;if(r56>>>0<32){r55=r56}else{break}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[2800]=r61+r65;HEAP32[2797]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[2801]=HEAP32[2788]}else{r55=11624,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=773;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==773){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59;r55=HEAP32[2800];r63=HEAP32[2797]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[2800]=r53+r69;HEAP32[2797]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[2801]=HEAP32[2788];break L1031}}while(0);if(r61>>>0<HEAP32[2798]>>>0){HEAP32[2798]=r61}r56=r61+r59|0;r53=11624;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=783;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==783){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[2800]|0)){r54=HEAP32[2797]+r39|0;HEAP32[2797]=r54;HEAP32[2800]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[2799]|0)){r54=HEAP32[2796]+r39|0;HEAP32[2796]=r54;HEAP32[2799]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L1076:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r11=(r51<<3)+11216|0;do{if((r48|0)!=(r11|0)){if(r48>>>0<HEAP32[2798]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[2794]=HEAP32[2794]&~(1<<r51);break}do{if((r49|0)==(r11|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[2798]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r11=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];do{if((r46|0)==(r11|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];if((r17|0)==0){r42=r61+r7+r59|0;r7=HEAP32[r42>>2];if((r7|0)==0){r75=0,r76=r75>>2;break}else{r77=r7;r78=r42}}else{r77=r17;r78=r41}while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[2798]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r11|0)){_abort()}r42=r46+8|0;if((HEAP32[r42>>2]|0)==(r11|0)){HEAP32[r17>>2]=r46;HEAP32[r42>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+11480|0;do{if((r11|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[2795]=HEAP32[2795]&~(1<<HEAP32[r46>>2]);break L1076}else{if(r47>>>0<HEAP32[2798]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r11|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L1076}}}while(0);if(r75>>>0<HEAP32[2798]>>>0){_abort()}HEAP32[r76+6]=r47;r11=r72|16;r46=HEAP32[(r11>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r11>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+11216|0;r46=HEAP32[2794];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[2794]=r46|r47;r81=r58;r82=(r51+2<<2)+11216|0}else{r54=(r51+2<<2)+11216|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[2798]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+11480|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[2795];r49=1<<r83;if((r58&r49|0)==0){HEAP32[2795]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=856;break}else{r49=r49<<1;r58=r47}}if(r2==856){if(r85>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[2798];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=11624,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[2800]=r61+r90;HEAP32[2797]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[2801]=HEAP32[2788];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[2906];HEAP32[r57+1]=HEAP32[2907];HEAP32[r57+2]=HEAP32[2908];HEAP32[r57+3]=HEAP32[2909];HEAP32[2906]=r61;HEAP32[2907]=r59;HEAP32[2909]=0;HEAP32[2908]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r55=r57+4|0;HEAP32[r55>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r55}else{break}}}if((r40|0)==(r53|0)){break}r57=r40-r64|0;r55=r57+(r53+4)|0;HEAP32[r55>>2]=HEAP32[r55>>2]&-2;HEAP32[r50+1]=r57|1;HEAP32[r53+r57>>2]=r57;r55=r57>>>3;if(r57>>>0<256){r39=r55<<1;r63=(r39<<2)+11216|0;r56=HEAP32[2794];r47=1<<r55;do{if((r56&r47|0)==0){HEAP32[2794]=r56|r47;r91=r63;r92=(r39+2<<2)+11216|0}else{r55=(r39+2<<2)+11216|0;r49=HEAP32[r55>>2];if(r49>>>0>=HEAP32[2798]>>>0){r91=r49;r92=r55;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r57>>>8;do{if((r47|0)==0){r93=0}else{if(r57>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r55=r53<<r40;r53=(r55+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r55<<r53>>>15)|0;r93=r57>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+11480|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[2795];r49=1<<r93;if((r63&r49|0)==0){HEAP32[2795]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r57<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r57|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=891;break}else{r49=r49<<1;r63=r47}}if(r2==891){if(r95>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r57=HEAP32[r49>>2];r47=HEAP32[2798];if(r63>>>0<r47>>>0){_abort()}if(r57>>>0<r47>>>0){_abort()}else{HEAP32[r57+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r57;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[2797];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[2797]=r64;r50=HEAP32[2800];r57=r50;HEAP32[2800]=r57+r15;HEAP32[(r57+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);r15=___errno_location();HEAP32[r15>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[2798];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L1248:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[2799]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[2796]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+11216|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[2794]=HEAP32[2794]&~(1<<r19);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break}else{r33=r30;r34=r29}}else{r33=r28;r34=r27}while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+11480|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[2795]=HEAP32[2795]&~(1<<HEAP32[r26>>2]);r20=r17,r21=r20>>2;r22=r18;break L1248}else{if(r19>>>0<HEAP32[2798]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L1248}}}while(0);if(r31>>>0<HEAP32[2798]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[2800]|0)){r6=HEAP32[2797]+r22|0;HEAP32[2797]=r6;HEAP32[2800]=r20;HEAP32[r21+1]=r6|1;if((r20|0)!=(HEAP32[2799]|0)){return}HEAP32[2799]=0;HEAP32[2796]=0;return}if((r12|0)==(HEAP32[2799]|0)){r6=HEAP32[2796]+r22|0;HEAP32[2796]=r6;HEAP32[2799]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L1351:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+11216|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[2798]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[2794]=HEAP32[2794]&~(1<<r33);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[2798]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break}else{r38=r16;r39=r26}}else{r38=r19;r39=r24}while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[2798]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+11480|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[2795]=HEAP32[2795]&~(1<<HEAP32[r7>>2]);break L1351}else{if(r4>>>0<HEAP32[2798]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L1351}}}while(0);if(r36>>>0<HEAP32[2798]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[2799]|0)){r40=r6;break}HEAP32[2796]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+11216|0;r5=HEAP32[2794];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[2794]=r5|r36;r41=r32;r42=(r31+2<<2)+11216|0}else{r22=(r31+2<<2)+11216|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[2798]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+11480|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[2795];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[2795]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=1068;break}else{r5=r5<<1;r42=r36}}if(r3==1068){if(r45>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[2798];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[2802]-1|0;HEAP32[2802]=r21;if((r21|0)==0){r46=11632}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[2802]=-1;return}function _realloc(r1,r2){var r3,r4,r5,r6;if((r1|0)==0){r3=_malloc(r2);return r3}if(r2>>>0>4294967231){r4=___errno_location();HEAP32[r4>>2]=12;r3=0;return r3}if(r2>>>0<11){r5=16}else{r5=r2+11&-8}r4=_try_realloc_chunk(r1-8|0,r5);if((r4|0)!=0){r3=r4+8|0;return r3}r4=_malloc(r2);if((r4|0)==0){r3=0;return r3}r5=HEAP32[r1-4>>2];r6=(r5&-8)-((r5&3|0)==0?8:4)|0;r5=r6>>>0<r2>>>0?r6:r2;_memcpy(r4,r1,r5)|0;_free(r1);r3=r4;return r3}function _try_realloc_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r3=(r1+4|0)>>2;r4=HEAP32[r3];r5=r4&-8,r6=r5>>2;r7=r1,r8=r7>>2;r9=r7+r5|0;r10=r9;r11=HEAP32[2798];if(r7>>>0<r11>>>0){_abort()}r12=r4&3;if(!((r12|0)!=1&r7>>>0<r9>>>0)){_abort()}r13=(r7+(r5|4)|0)>>2;r14=HEAP32[r13];if((r14&1|0)==0){_abort()}if((r12|0)==0){if(r2>>>0<256){r15=0;return r15}do{if(r5>>>0>=(r2+4|0)>>>0){if((r5-r2|0)>>>0>HEAP32[2786]<<1>>>0){break}else{r15=r1}return r15}}while(0);r15=0;return r15}if(r5>>>0>=r2>>>0){r12=r5-r2|0;if(r12>>>0<=15){r15=r1;return r15}HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|3;HEAP32[r13]=HEAP32[r13]|1;_dispose_chunk(r7+r2|0,r12);r15=r1;return r15}if((r10|0)==(HEAP32[2800]|0)){r12=HEAP32[2797]+r5|0;if(r12>>>0<=r2>>>0){r15=0;return r15}r13=r12-r2|0;HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r13|1;HEAP32[2800]=r7+r2;HEAP32[2797]=r13;r15=r1;return r15}if((r10|0)==(HEAP32[2799]|0)){r13=HEAP32[2796]+r5|0;if(r13>>>0<r2>>>0){r15=0;return r15}r12=r13-r2|0;if(r12>>>0>15){HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|1;HEAP32[(r13>>2)+r8]=r12;r16=r13+(r7+4)|0;HEAP32[r16>>2]=HEAP32[r16>>2]&-2;r17=r7+r2|0;r18=r12}else{HEAP32[r3]=r4&1|r13|2;r4=r13+(r7+4)|0;HEAP32[r4>>2]=HEAP32[r4>>2]|1;r17=0;r18=0}HEAP32[2796]=r18;HEAP32[2799]=r17;r15=r1;return r15}if((r14&2|0)!=0){r15=0;return r15}r17=(r14&-8)+r5|0;if(r17>>>0<r2>>>0){r15=0;return r15}r18=r17-r2|0;r4=r14>>>3;L1537:do{if(r14>>>0<256){r13=HEAP32[r6+(r8+2)];r12=HEAP32[r6+(r8+3)];r16=(r4<<3)+11216|0;do{if((r13|0)!=(r16|0)){if(r13>>>0<r11>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r10|0)){break}_abort()}}while(0);if((r12|0)==(r13|0)){HEAP32[2794]=HEAP32[2794]&~(1<<r4);break}do{if((r12|0)==(r16|0)){r19=r12+8|0}else{if(r12>>>0<r11>>>0){_abort()}r20=r12+8|0;if((HEAP32[r20>>2]|0)==(r10|0)){r19=r20;break}_abort()}}while(0);HEAP32[r13+12>>2]=r12;HEAP32[r19>>2]=r13}else{r16=r9;r20=HEAP32[r6+(r8+6)];r21=HEAP32[r6+(r8+3)];do{if((r21|0)==(r16|0)){r22=r5+(r7+20)|0;r23=HEAP32[r22>>2];if((r23|0)==0){r24=r5+(r7+16)|0;r25=HEAP32[r24>>2];if((r25|0)==0){r26=0,r27=r26>>2;break}else{r28=r25;r29=r24}}else{r28=r23;r29=r22}while(1){r22=r28+20|0;r23=HEAP32[r22>>2];if((r23|0)!=0){r28=r23;r29=r22;continue}r22=r28+16|0;r23=HEAP32[r22>>2];if((r23|0)==0){break}else{r28=r23;r29=r22}}if(r29>>>0<r11>>>0){_abort()}else{HEAP32[r29>>2]=0;r26=r28,r27=r26>>2;break}}else{r22=HEAP32[r6+(r8+2)];if(r22>>>0<r11>>>0){_abort()}r23=r22+12|0;if((HEAP32[r23>>2]|0)!=(r16|0)){_abort()}r24=r21+8|0;if((HEAP32[r24>>2]|0)==(r16|0)){HEAP32[r23>>2]=r21;HEAP32[r24>>2]=r22;r26=r21,r27=r26>>2;break}else{_abort()}}}while(0);if((r20|0)==0){break}r21=r5+(r7+28)|0;r13=(HEAP32[r21>>2]<<2)+11480|0;do{if((r16|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r26;if((r26|0)!=0){break}HEAP32[2795]=HEAP32[2795]&~(1<<HEAP32[r21>>2]);break L1537}else{if(r20>>>0<HEAP32[2798]>>>0){_abort()}r12=r20+16|0;if((HEAP32[r12>>2]|0)==(r16|0)){HEAP32[r12>>2]=r26}else{HEAP32[r20+20>>2]=r26}if((r26|0)==0){break L1537}}}while(0);if(r26>>>0<HEAP32[2798]>>>0){_abort()}HEAP32[r27+6]=r20;r16=HEAP32[r6+(r8+4)];do{if((r16|0)!=0){if(r16>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r27+4]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);r16=HEAP32[r6+(r8+5)];if((r16|0)==0){break}if(r16>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r27+5]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);if(r18>>>0<16){HEAP32[r3]=r17|HEAP32[r3]&1|2;r26=r7+(r17|4)|0;HEAP32[r26>>2]=HEAP32[r26>>2]|1;r15=r1;return r15}else{HEAP32[r3]=HEAP32[r3]&1|r2|2;HEAP32[(r2+4>>2)+r8]=r18|3;r8=r7+(r17|4)|0;HEAP32[r8>>2]=HEAP32[r8>>2]|1;_dispose_chunk(r7+r2|0,r18);r15=r1;return r15}}function _dispose_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r3=r2>>2;r4=0;r5=r1,r6=r5>>2;r7=r5+r2|0;r8=r7;r9=HEAP32[r1+4>>2];L1613:do{if((r9&1|0)==0){r10=HEAP32[r1>>2];if((r9&3|0)==0){return}r11=r5+ -r10|0;r12=r11;r13=r10+r2|0;r14=HEAP32[2798];if(r11>>>0<r14>>>0){_abort()}if((r12|0)==(HEAP32[2799]|0)){r15=(r2+(r5+4)|0)>>2;if((HEAP32[r15]&3|0)!=3){r16=r12,r17=r16>>2;r18=r13;break}HEAP32[2796]=r13;HEAP32[r15]=HEAP32[r15]&-2;HEAP32[(4-r10>>2)+r6]=r13|1;HEAP32[r7>>2]=r13;return}r15=r10>>>3;if(r10>>>0<256){r19=HEAP32[(8-r10>>2)+r6];r20=HEAP32[(12-r10>>2)+r6];r21=(r15<<3)+11216|0;do{if((r19|0)!=(r21|0)){if(r19>>>0<r14>>>0){_abort()}if((HEAP32[r19+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r20|0)==(r19|0)){HEAP32[2794]=HEAP32[2794]&~(1<<r15);r16=r12,r17=r16>>2;r18=r13;break}do{if((r20|0)==(r21|0)){r22=r20+8|0}else{if(r20>>>0<r14>>>0){_abort()}r23=r20+8|0;if((HEAP32[r23>>2]|0)==(r12|0)){r22=r23;break}_abort()}}while(0);HEAP32[r19+12>>2]=r20;HEAP32[r22>>2]=r19;r16=r12,r17=r16>>2;r18=r13;break}r21=r11;r15=HEAP32[(24-r10>>2)+r6];r23=HEAP32[(12-r10>>2)+r6];do{if((r23|0)==(r21|0)){r24=16-r10|0;r25=r24+(r5+4)|0;r26=HEAP32[r25>>2];if((r26|0)==0){r27=r5+r24|0;r24=HEAP32[r27>>2];if((r24|0)==0){r28=0,r29=r28>>2;break}else{r30=r24;r31=r27}}else{r30=r26;r31=r25}while(1){r25=r30+20|0;r26=HEAP32[r25>>2];if((r26|0)!=0){r30=r26;r31=r25;continue}r25=r30+16|0;r26=HEAP32[r25>>2];if((r26|0)==0){break}else{r30=r26;r31=r25}}if(r31>>>0<r14>>>0){_abort()}else{HEAP32[r31>>2]=0;r28=r30,r29=r28>>2;break}}else{r25=HEAP32[(8-r10>>2)+r6];if(r25>>>0<r14>>>0){_abort()}r26=r25+12|0;if((HEAP32[r26>>2]|0)!=(r21|0)){_abort()}r27=r23+8|0;if((HEAP32[r27>>2]|0)==(r21|0)){HEAP32[r26>>2]=r23;HEAP32[r27>>2]=r25;r28=r23,r29=r28>>2;break}else{_abort()}}}while(0);if((r15|0)==0){r16=r12,r17=r16>>2;r18=r13;break}r23=r5+(28-r10)|0;r14=(HEAP32[r23>>2]<<2)+11480|0;do{if((r21|0)==(HEAP32[r14>>2]|0)){HEAP32[r14>>2]=r28;if((r28|0)!=0){break}HEAP32[2795]=HEAP32[2795]&~(1<<HEAP32[r23>>2]);r16=r12,r17=r16>>2;r18=r13;break L1613}else{if(r15>>>0<HEAP32[2798]>>>0){_abort()}r11=r15+16|0;if((HEAP32[r11>>2]|0)==(r21|0)){HEAP32[r11>>2]=r28}else{HEAP32[r15+20>>2]=r28}if((r28|0)==0){r16=r12,r17=r16>>2;r18=r13;break L1613}}}while(0);if(r28>>>0<HEAP32[2798]>>>0){_abort()}HEAP32[r29+6]=r15;r21=16-r10|0;r23=HEAP32[(r21>>2)+r6];do{if((r23|0)!=0){if(r23>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r29+4]=r23;HEAP32[r23+24>>2]=r28;break}}}while(0);r23=HEAP32[(r21+4>>2)+r6];if((r23|0)==0){r16=r12,r17=r16>>2;r18=r13;break}if(r23>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r29+5]=r23;HEAP32[r23+24>>2]=r28;r16=r12,r17=r16>>2;r18=r13;break}}else{r16=r1,r17=r16>>2;r18=r2}}while(0);r1=HEAP32[2798];if(r7>>>0<r1>>>0){_abort()}r28=r2+(r5+4)|0;r29=HEAP32[r28>>2];do{if((r29&2|0)==0){if((r8|0)==(HEAP32[2800]|0)){r30=HEAP32[2797]+r18|0;HEAP32[2797]=r30;HEAP32[2800]=r16;HEAP32[r17+1]=r30|1;if((r16|0)!=(HEAP32[2799]|0)){return}HEAP32[2799]=0;HEAP32[2796]=0;return}if((r8|0)==(HEAP32[2799]|0)){r30=HEAP32[2796]+r18|0;HEAP32[2796]=r30;HEAP32[2799]=r16;HEAP32[r17+1]=r30|1;HEAP32[(r30>>2)+r17]=r30;return}r30=(r29&-8)+r18|0;r31=r29>>>3;L1712:do{if(r29>>>0<256){r22=HEAP32[r3+(r6+2)];r9=HEAP32[r3+(r6+3)];r23=(r31<<3)+11216|0;do{if((r22|0)!=(r23|0)){if(r22>>>0<r1>>>0){_abort()}if((HEAP32[r22+12>>2]|0)==(r8|0)){break}_abort()}}while(0);if((r9|0)==(r22|0)){HEAP32[2794]=HEAP32[2794]&~(1<<r31);break}do{if((r9|0)==(r23|0)){r32=r9+8|0}else{if(r9>>>0<r1>>>0){_abort()}r10=r9+8|0;if((HEAP32[r10>>2]|0)==(r8|0)){r32=r10;break}_abort()}}while(0);HEAP32[r22+12>>2]=r9;HEAP32[r32>>2]=r22}else{r23=r7;r10=HEAP32[r3+(r6+6)];r15=HEAP32[r3+(r6+3)];do{if((r15|0)==(r23|0)){r14=r2+(r5+20)|0;r11=HEAP32[r14>>2];if((r11|0)==0){r19=r2+(r5+16)|0;r20=HEAP32[r19>>2];if((r20|0)==0){r33=0,r34=r33>>2;break}else{r35=r20;r36=r19}}else{r35=r11;r36=r14}while(1){r14=r35+20|0;r11=HEAP32[r14>>2];if((r11|0)!=0){r35=r11;r36=r14;continue}r14=r35+16|0;r11=HEAP32[r14>>2];if((r11|0)==0){break}else{r35=r11;r36=r14}}if(r36>>>0<r1>>>0){_abort()}else{HEAP32[r36>>2]=0;r33=r35,r34=r33>>2;break}}else{r14=HEAP32[r3+(r6+2)];if(r14>>>0<r1>>>0){_abort()}r11=r14+12|0;if((HEAP32[r11>>2]|0)!=(r23|0)){_abort()}r19=r15+8|0;if((HEAP32[r19>>2]|0)==(r23|0)){HEAP32[r11>>2]=r15;HEAP32[r19>>2]=r14;r33=r15,r34=r33>>2;break}else{_abort()}}}while(0);if((r10|0)==0){break}r15=r2+(r5+28)|0;r22=(HEAP32[r15>>2]<<2)+11480|0;do{if((r23|0)==(HEAP32[r22>>2]|0)){HEAP32[r22>>2]=r33;if((r33|0)!=0){break}HEAP32[2795]=HEAP32[2795]&~(1<<HEAP32[r15>>2]);break L1712}else{if(r10>>>0<HEAP32[2798]>>>0){_abort()}r9=r10+16|0;if((HEAP32[r9>>2]|0)==(r23|0)){HEAP32[r9>>2]=r33}else{HEAP32[r10+20>>2]=r33}if((r33|0)==0){break L1712}}}while(0);if(r33>>>0<HEAP32[2798]>>>0){_abort()}HEAP32[r34+6]=r10;r23=HEAP32[r3+(r6+4)];do{if((r23|0)!=0){if(r23>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r34+4]=r23;HEAP32[r23+24>>2]=r33;break}}}while(0);r23=HEAP32[r3+(r6+5)];if((r23|0)==0){break}if(r23>>>0<HEAP32[2798]>>>0){_abort()}else{HEAP32[r34+5]=r23;HEAP32[r23+24>>2]=r33;break}}}while(0);HEAP32[r17+1]=r30|1;HEAP32[(r30>>2)+r17]=r30;if((r16|0)!=(HEAP32[2799]|0)){r37=r30;break}HEAP32[2796]=r30;return}else{HEAP32[r28>>2]=r29&-2;HEAP32[r17+1]=r18|1;HEAP32[(r18>>2)+r17]=r18;r37=r18}}while(0);r18=r37>>>3;if(r37>>>0<256){r29=r18<<1;r28=(r29<<2)+11216|0;r33=HEAP32[2794];r34=1<<r18;do{if((r33&r34|0)==0){HEAP32[2794]=r33|r34;r38=r28;r39=(r29+2<<2)+11216|0}else{r18=(r29+2<<2)+11216|0;r6=HEAP32[r18>>2];if(r6>>>0>=HEAP32[2798]>>>0){r38=r6;r39=r18;break}_abort()}}while(0);HEAP32[r39>>2]=r16;HEAP32[r38+12>>2]=r16;HEAP32[r17+2]=r38;HEAP32[r17+3]=r28;return}r28=r16;r38=r37>>>8;do{if((r38|0)==0){r40=0}else{if(r37>>>0>16777215){r40=31;break}r39=(r38+1048320|0)>>>16&8;r29=r38<<r39;r34=(r29+520192|0)>>>16&4;r33=r29<<r34;r29=(r33+245760|0)>>>16&2;r18=14-(r34|r39|r29)+(r33<<r29>>>15)|0;r40=r37>>>((r18+7|0)>>>0)&1|r18<<1}}while(0);r38=(r40<<2)+11480|0;HEAP32[r17+7]=r40;HEAP32[r17+5]=0;HEAP32[r17+4]=0;r18=HEAP32[2795];r29=1<<r40;if((r18&r29|0)==0){HEAP32[2795]=r18|r29;HEAP32[r38>>2]=r28;HEAP32[r17+6]=r38;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}if((r40|0)==31){r41=0}else{r41=25-(r40>>>1)|0}r40=r37<<r41;r41=HEAP32[r38>>2];while(1){if((HEAP32[r41+4>>2]&-8|0)==(r37|0)){break}r42=(r40>>>31<<2)+r41+16|0;r38=HEAP32[r42>>2];if((r38|0)==0){r4=1348;break}else{r40=r40<<1;r41=r38}}if(r4==1348){if(r42>>>0<HEAP32[2798]>>>0){_abort()}HEAP32[r42>>2]=r28;HEAP32[r17+6]=r41;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}r16=r41+8|0;r42=HEAP32[r16>>2];r4=HEAP32[2798];if(r41>>>0<r4>>>0){_abort()}if(r42>>>0<r4>>>0){_abort()}HEAP32[r42+12>>2]=r28;HEAP32[r16>>2]=r28;HEAP32[r17+2]=r42;HEAP32[r17+3]=r41;HEAP32[r17+6]=0;return}function __Znwj(r1){var r2,r3,r4;r2=0;r3=(r1|0)==0?1:r1;while(1){r4=_malloc(r3);if((r4|0)!=0){r2=1392;break}r1=(tempValue=HEAP32[3754],HEAP32[3754]=tempValue,tempValue);if((r1|0)==0){break}FUNCTION_TABLE[r1]()}if(r2==1392){return r4}r4=___cxa_allocate_exception(4);HEAP32[r4>>2]=3304;___cxa_throw(r4,9288,72)}function __Znaj(r1){return __Znwj(r1)}function __ZNSt9bad_allocD2Ev(r1){return}function __ZNKSt9bad_alloc4whatEv(r1){return 1576}function __ZdlPv(r1){if((r1|0)==0){return}_free(r1);return}function __ZdaPv(r1){__ZdlPv(r1);return}function __ZNSt9bad_allocD0Ev(r1){__ZdlPv(r1);return}function _strtod(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r3=0;r4=r1;while(1){r5=r4+1|0;if((_isspace(HEAP8[r4]|0)|0)==0){break}else{r4=r5}}r6=HEAP8[r4];if(r6<<24>>24==45){r7=r5;r8=1}else if(r6<<24>>24==43){r7=r5;r8=0}else{r7=r4;r8=0}r4=-1;r5=0;r6=r7;while(1){r9=HEAP8[r6];if(((r9<<24>>24)-48|0)>>>0<10){r10=r4}else{if(r9<<24>>24!=46|(r4|0)>-1){break}else{r10=r5}}r4=r10;r5=r5+1|0;r6=r6+1|0}r10=r6+ -r5|0;r7=(r4|0)<0;r11=((r7^1)<<31>>31)+r5|0;r12=(r11|0)>18;r13=(r12?-18:-r11|0)+(r7?r5:r4)|0;r4=r12?18:r11;do{if((r4|0)==0){r14=r1;r15=0}else{if((r4|0)>9){r11=r10;r12=r4;r5=0;while(1){r7=HEAP8[r11];r16=r11+1|0;if(r7<<24>>24==46){r17=HEAP8[r16];r18=r11+2|0}else{r17=r7;r18=r16}r19=(r17<<24>>24)+((r5*10&-1)-48)|0;r16=r12-1|0;if((r16|0)>9){r11=r18;r12=r16;r5=r19}else{break}}r20=(r19|0)*1e9;r21=9;r22=r18;r3=1422}else{if((r4|0)>0){r20=0;r21=r4;r22=r10;r3=1422}else{r23=0;r24=0}}if(r3==1422){r5=r22;r12=r21;r11=0;while(1){r16=HEAP8[r5];r7=r5+1|0;if(r16<<24>>24==46){r25=HEAP8[r7];r26=r5+2|0}else{r25=r16;r26=r7}r27=(r25<<24>>24)+((r11*10&-1)-48)|0;r7=r12-1|0;if((r7|0)>0){r5=r26;r12=r7;r11=r27}else{break}}r23=r27|0;r24=r20}r11=r24+r23;do{if(r9<<24>>24==69|r9<<24>>24==101){r12=r6+1|0;r5=HEAP8[r12];if(r5<<24>>24==43){r28=r6+2|0;r29=0}else if(r5<<24>>24==45){r28=r6+2|0;r29=1}else{r28=r12;r29=0}r12=HEAP8[r28];if(((r12<<24>>24)-48|0)>>>0<10){r30=r28;r31=0;r32=r12}else{r33=0;r34=r28;r35=r29;break}while(1){r12=(r32<<24>>24)+((r31*10&-1)-48)|0;r5=r30+1|0;r7=HEAP8[r5];if(((r7<<24>>24)-48|0)>>>0<10){r30=r5;r31=r12;r32=r7}else{r33=r12;r34=r5;r35=r29;break}}}else{r33=0;r34=r6;r35=0}}while(0);r5=r13+((r35|0)==0?r33:-r33|0)|0;r12=(r5|0)<0?-r5|0:r5;if((r12|0)>511){r7=___errno_location();HEAP32[r7>>2]=34;r36=1;r37=8;r38=511;r3=1439}else{if((r12|0)==0){r39=1}else{r36=1;r37=8;r38=r12;r3=1439}}if(r3==1439){while(1){r3=0;if((r38&1|0)==0){r40=r36}else{r40=r36*HEAPF64[r37>>3]}r12=r38>>1;if((r12|0)==0){r39=r40;break}else{r36=r40;r37=r37+8|0;r38=r12;r3=1439}}}if((r5|0)>-1){r14=r34;r15=r11*r39;break}else{r14=r34;r15=r11/r39;break}}}while(0);if((r2|0)!=0){HEAP32[r2>>2]=r14}if((r8|0)==0){r41=r15;return r41}r41=-r15;return r41}function _strtold_l(r1,r2,r3){return _strtod(r1,r2)}function __ZSt17__throw_bad_allocv(){var r1;r1=___cxa_allocate_exception(4);HEAP32[r1>>2]=3304;___cxa_throw(r1,9288,72)}function _i64Add(r1,r2,r3,r4){var r5,r6;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0;r5=r1+r3>>>0;r6=r2+r4+(r5>>>0<r1>>>0|0)>>>0;return tempRet0=r6,r5|0}function _i64Subtract(r1,r2,r3,r4){var r5,r6;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0;r5=r1-r3>>>0;r6=r2-r4>>>0;r6=r2-r4-(r3>>>0>r1>>>0|0)>>>0;return tempRet0=r6,r5|0}function _bitshift64Shl(r1,r2,r3){var r4;r1=r1|0;r2=r2|0;r3=r3|0;r4=0;if((r3|0)<32){r4=(1<<r3)-1|0;tempRet0=r2<<r3|(r1&r4<<32-r3)>>>32-r3;return r1<<r3}tempRet0=r1<<r3-32;return 0}function _bitshift64Lshr(r1,r2,r3){var r4;r1=r1|0;r2=r2|0;r3=r3|0;r4=0;if((r3|0)<32){r4=(1<<r3)-1|0;tempRet0=r2>>>r3;return r1>>>r3|(r2&r4)<<32-r3}tempRet0=0;return r2>>>r3-32|0}function _bitshift64Ashr(r1,r2,r3){var r4;r1=r1|0;r2=r2|0;r3=r3|0;r4=0;if((r3|0)<32){r4=(1<<r3)-1|0;tempRet0=r2>>r3;return r1>>>r3|(r2&r4)<<32-r3}tempRet0=(r2|0)<0?-1:0;return r2>>r3-32|0}function _llvm_ctlz_i32(r1){var r2;r1=r1|0;r2=0;r2=HEAP8[ctlz_i8+(r1>>>24)|0];if((r2|0)<8)return r2|0;r2=HEAP8[ctlz_i8+(r1>>16&255)|0];if((r2|0)<8)return r2+8|0;r2=HEAP8[ctlz_i8+(r1>>8&255)|0];if((r2|0)<8)return r2+16|0;return HEAP8[ctlz_i8+(r1&255)|0]+24|0}var ctlz_i8=allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"i8",ALLOC_DYNAMIC);function _llvm_cttz_i32(r1){var r2;r1=r1|0;r2=0;r2=HEAP8[cttz_i8+(r1&255)|0];if((r2|0)<8)return r2|0;r2=HEAP8[cttz_i8+(r1>>8&255)|0];if((r2|0)<8)return r2+8|0;r2=HEAP8[cttz_i8+(r1>>16&255)|0];if((r2|0)<8)return r2+16|0;return HEAP8[cttz_i8+(r1>>>24)|0]+24|0}var cttz_i8=allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0],"i8",ALLOC_DYNAMIC);function ___muldsi3(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r1=r1|0;r2=r2|0;r3=0,r4=0,r5=0,r6=0,r7=0,r8=0,r9=0;r3=r1&65535;r4=r2&65535;r5=Math.imul(r4,r3)|0;r6=r1>>>16;r7=(r5>>>16)+Math.imul(r4,r6)|0;r8=r2>>>16;r9=Math.imul(r8,r3)|0;return(tempRet0=(r7>>>16)+Math.imul(r8,r6)+(((r7&65535)+r9|0)>>>16)|0,r7+r9<<16|r5&65535|0)|0}function ___divdi3(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0,r7=0,r8=0,r9=0,r10=0,r11=0,r12=0,r13=0,r14=0,r15=0;r5=r2>>31|((r2|0)<0?-1:0)<<1;r6=((r2|0)<0?-1:0)>>31|((r2|0)<0?-1:0)<<1;r7=r4>>31|((r4|0)<0?-1:0)<<1;r8=((r4|0)<0?-1:0)>>31|((r4|0)<0?-1:0)<<1;r9=_i64Subtract(r5^r1,r6^r2,r5,r6)|0;r10=tempRet0;r11=_i64Subtract(r7^r3,r8^r4,r7,r8)|0;r12=r7^r5;r13=r8^r6;r14=___udivmoddi4(r9,r10,r11,tempRet0,0)|0;r15=_i64Subtract(r14^r12,tempRet0^r13,r12,r13)|0;return(tempRet0=tempRet0,r15)|0}function ___remdi3(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0,r7=0,r8=0,r9=0,r10=0,r11=0,r12=0,r13=0,r14=0,r15=0;r15=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r15|0;r6=r2>>31|((r2|0)<0?-1:0)<<1;r7=((r2|0)<0?-1:0)>>31|((r2|0)<0?-1:0)<<1;r8=r4>>31|((r4|0)<0?-1:0)<<1;r9=((r4|0)<0?-1:0)>>31|((r4|0)<0?-1:0)<<1;r10=_i64Subtract(r6^r1,r7^r2,r6,r7)|0;r11=tempRet0;r12=_i64Subtract(r8^r3,r9^r4,r8,r9)|0;___udivmoddi4(r10,r11,r12,tempRet0,r5)|0;r13=_i64Subtract(HEAP32[r5>>2]^r6,HEAP32[r5+4>>2]^r7,r6,r7)|0;r14=tempRet0;STACKTOP=r15;return(tempRet0=r14,r13)|0}function ___muldi3(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0,r7=0,r8=0,r9=0;r5=r1;r6=r3;r7=___muldsi3(r5,r6)|0;r8=tempRet0;r9=Math.imul(r2,r6)|0;return(tempRet0=Math.imul(r4,r5)+r9+r8|r8&0,r7&-1|0)|0}function ___udivdi3(r1,r2,r3,r4){var r5;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0;r5=___udivmoddi4(r1,r2,r3,r4,0)|0;return(tempRet0=tempRet0,r5)|0}function ___uremdi3(r1,r2,r3,r4){var r5,r6;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0;r6=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r6|0;___udivmoddi4(r1,r2,r3,r4,r5)|0;STACKTOP=r6;return(tempRet0=HEAP32[r5+4>>2]|0,HEAP32[r5>>2]|0)|0}function ___udivmoddi4(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=r5|0;r6=0,r7=0,r8=0,r9=0,r10=0,r11=0,r12=0,r13=0,r14=0,r15=0,r16=0,r17=0,r18=0,r19=0,r20=0,r21=0,r22=0,r23=0,r24=0,r25=0,r26=0,r27=0,r28=0,r29=0,r30=0,r31=0,r32=0,r33=0,r34=0,r35=0,r36=0,r37=0,r38=0,r39=0,r40=0,r41=0,r42=0,r43=0,r44=0,r45=0,r46=0,r47=0,r48=0,r49=0,r50=0,r51=0,r52=0,r53=0,r54=0,r55=0,r56=0,r57=0,r58=0,r59=0,r60=0,r61=0,r62=0,r63=0,r64=0,r65=0,r66=0,r67=0,r68=0,r69=0;r6=r1;r7=r2;r8=r7;r9=r3;r10=r4;r11=r10;if((r8|0)==0){r12=(r5|0)!=0;if((r11|0)==0){if(r12){HEAP32[r5>>2]=(r6>>>0)%(r9>>>0);HEAP32[r5+4>>2]=0}r69=0;r68=(r6>>>0)/(r9>>>0)>>>0;return(tempRet0=r69,r68)|0}else{if(!r12){r69=0;r68=0;return(tempRet0=r69,r68)|0}HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r2&0;r69=0;r68=0;return(tempRet0=r69,r68)|0}}r13=(r11|0)==0;do{if((r9|0)==0){if(r13){if((r5|0)!=0){HEAP32[r5>>2]=(r8>>>0)%(r9>>>0);HEAP32[r5+4>>2]=0}r69=0;r68=(r8>>>0)/(r9>>>0)>>>0;return(tempRet0=r69,r68)|0}if((r6|0)==0){if((r5|0)!=0){HEAP32[r5>>2]=0;HEAP32[r5+4>>2]=(r8>>>0)%(r11>>>0)}r69=0;r68=(r8>>>0)/(r11>>>0)>>>0;return(tempRet0=r69,r68)|0}r14=r11-1|0;if((r14&r11|0)==0){if((r5|0)!=0){HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r14&r8|r2&0}r69=0;r68=r8>>>((_llvm_cttz_i32(r11|0)|0)>>>0);return(tempRet0=r69,r68)|0}r15=_llvm_ctlz_i32(r11|0)|0;r16=r15-_llvm_ctlz_i32(r8|0)|0;if(r16>>>0<=30){r17=r16+1|0;r18=31-r16|0;r37=r17;r36=r8<<r18|r6>>>(r17>>>0);r35=r8>>>(r17>>>0);r34=0;r33=r6<<r18;break}if((r5|0)==0){r69=0;r68=0;return(tempRet0=r69,r68)|0}HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r7|r2&0;r69=0;r68=0;return(tempRet0=r69,r68)|0}else{if(!r13){r28=_llvm_ctlz_i32(r11|0)|0;r29=r28-_llvm_ctlz_i32(r8|0)|0;if(r29>>>0<=31){r30=r29+1|0;r31=31-r29|0;r32=r29-31>>31;r37=r30;r36=r6>>>(r30>>>0)&r32|r8<<r31;r35=r8>>>(r30>>>0)&r32;r34=0;r33=r6<<r31;break}if((r5|0)==0){r69=0;r68=0;return(tempRet0=r69,r68)|0}HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r7|r2&0;r69=0;r68=0;return(tempRet0=r69,r68)|0}r19=r9-1|0;if((r19&r9|0)!=0){r21=_llvm_ctlz_i32(r9|0)+33|0;r22=r21-_llvm_ctlz_i32(r8|0)|0;r23=64-r22|0;r24=32-r22|0;r25=r24>>31;r26=r22-32|0;r27=r26>>31;r37=r22;r36=r24-1>>31&r8>>>(r26>>>0)|(r8<<r24|r6>>>(r22>>>0))&r27;r35=r27&r8>>>(r22>>>0);r34=r6<<r23&r25;r33=(r8<<r23|r6>>>(r26>>>0))&r25|r6<<r24&r22-33>>31;break}if((r5|0)!=0){HEAP32[r5>>2]=r19&r6;HEAP32[r5+4>>2]=0}if((r9|0)==1){r69=r7|r2&0;r68=r1&-1|0;return(tempRet0=r69,r68)|0}else{r20=_llvm_cttz_i32(r9|0)|0;r69=r8>>>(r20>>>0)|0;r68=r8<<32-r20|r6>>>(r20>>>0)|0;return(tempRet0=r69,r68)|0}}}while(0);if((r37|0)==0){r64=r33;r63=r34;r62=r35;r61=r36;r60=0;r59=0}else{r38=r3&-1|0;r39=r10|r4&0;r40=_i64Add(r38,r39,-1,-1)|0;r41=tempRet0;r47=r33;r46=r34;r45=r35;r44=r36;r43=r37;r42=0;while(1){r48=r46>>>31|r47<<1;r49=r42|r46<<1;r50=r44<<1|r47>>>31|0;r51=r44>>>31|r45<<1|0;_i64Subtract(r40,r41,r50,r51)|0;r52=tempRet0;r53=r52>>31|((r52|0)<0?-1:0)<<1;r54=r53&1;r55=_i64Subtract(r50,r51,r53&r38,(((r52|0)<0?-1:0)>>31|((r52|0)<0?-1:0)<<1)&r39)|0;r56=r55;r57=tempRet0;r58=r43-1|0;if((r58|0)==0){break}else{r47=r48;r46=r49;r45=r57;r44=r56;r43=r58;r42=r54}}r64=r48;r63=r49;r62=r57;r61=r56;r60=0;r59=r54}r65=r63;r66=0;r67=r64|r66;if((r5|0)!=0){HEAP32[r5>>2]=r61;HEAP32[r5+4>>2]=r62}r69=(r65|0)>>>31|r67<<1|(r66<<1|r65>>>31)&0|r60;r68=(r65<<1|0>>>31)&-2|r59;return(tempRet0=r69,r68)|0}
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
(function() {
function assert(check, msg) {
  if (!check) throw msg + new Error().stack;
}
    function DataRequest() {}
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.requests[name] = this;
      },
      send: function() {}
    };
    var filePreload0 = new DataRequest();
    filePreload0.open('GET', '/convolution_kernel.cl', true);
    filePreload0.responseType = 'arraybuffer';
    filePreload0.onload = function() {
      var arrayBuffer = filePreload0.response;
      assert(arrayBuffer, 'Loading file /convolution_kernel.cl failed.');
      var byteArray = !arrayBuffer.subarray ? new Uint8Array(arrayBuffer) : arrayBuffer;
      Module['FS_createPreloadedFile']('/', 'convolution_kernel.cl', byteArray, true, true, function() {
        Module['removeRunDependency']('fp /convolution_kernel.cl');
      });
    };
    Module['addRunDependency']('fp /convolution_kernel.cl');
    filePreload0.send(null);
    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;
    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = '../build/convolution.data';
    var REMOTE_PACKAGE_NAME = 'convolution.data';
    var PACKAGE_UUID = '4ed9f2e6-7316-4df7-9a80-c51fd322ff5c';
    function fetchRemotePackage(packageName, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        if (event.loaded && event.total) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: event.total
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
          Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          Module['setStatus']('Downloading data...');
        }
      };
      xhr.onload = function(event) {
        var packageData = xhr.response;
        callback(packageData);
      };
      xhr.send(null);
    };
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
        curr = DataRequest.prototype.requests['/convolution_kernel.cl'];
        var data = byteArray.subarray(0, 1003);
        var ptr = Module['_malloc'](1003);
        Module['HEAPU8'].set(data, ptr);
        curr.response = Module['HEAPU8'].subarray(ptr, ptr + 1003);
        curr.onload();
                Module['removeRunDependency']('datafile_../build/convolution.data');
    };
    Module['addRunDependency']('datafile_../build/convolution.data');
    function handleError(error) {
      console.error('package error:', error);
    };
    if (!Module.preloadResults)
      Module.preloadResults = {};
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      fetchRemotePackage(REMOTE_PACKAGE_NAME, processPackageData, handleError);
})();
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
