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
  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function() { throw 'no read() available (jsc?)' };
  }
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
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,Math.abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math.min(Math.floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
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
  // TODO: use TextDecoder
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
STATICTOP = STATIC_BASE + 3944;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
var _stderr;
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([1,0,0,0,0,0,0,0,128,2,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,79,112,101,110,67,76,32,99,111,110,116,101,120,116,0,0,0,85,110,97,98,108,101,32,116,111,32,115,101,108,101,99,116,32,97,110,32,97,112,112,114,111,112,114,105,97,116,101,32,100,101,118,105,99,101,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,100,101,118,105,99,101,32,73,68,115,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,112,108,97,116,102,111,114,109,32,73,68,115,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,112,108,97,116,102,111,114,109,115,0,0,1,0,0,0,0,0,0,0,120,3,0,0,0,0,0,0,224,1,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,109,97,116,101,114,105,97,108,32,116,121,112,101,32,102,111,114,32,115,112,104,101,114,101,32,35,37,100,58,32,37,100,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,116,104,101,32,79,112,101,110,67,76,32,112,105,120,101,108,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,115,112,104,101,114,101,32,37,102,32,32,37,102,32,37,102,32,37,102,32,32,37,102,32,37,102,32,37,102,32,32,37,102,32,37,102,32,37,102,32,32,37,100,10,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,57,58,32,37,100,10,0,0,0,0,0,0,0,83,99,101,110,101,32,115,105,122,101,58,32,37,100,10,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,56,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,101,110,113,117,101,117,101,32,79,112,101,110,67,76,32,119,111,114,107,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,108,101,97,115,101,32,79,112,101,110,67,76,32,115,101,101,100,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,108,101,97,115,101,32,79,112,101,110,67,76,32,112,105,120,101,108,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,108,101,97,115,101,32,79,112,101,110,67,76,32,99,111,108,111,114,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,119,114,105,116,101,32,116,104,101,32,79,112,101,110,67,76,32,115,101,101,100,115,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,115,101,101,100,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,115,112,104,101,114,101,32,99,111,117,110,116,58,32,37,100,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,112,105,120,101,108,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,111,117,116,112,117,116,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,114,101,110,100,101,114,105,110,103,95,107,101,114,110,101,108,46,99,108,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,55,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,102,105,108,101,32,39,37,115,39,32,40,114,101,97,100,32,37,108,100,41,10,0,0,0,0,82,101,97,100,105,110,103,32,102,105,108,101,32,39,37,115,39,32,40,115,105,122,101,32,37,108,100,32,98,121,116,101,115,41,10,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,109,101,109,111,114,121,32,102,111,114,32,102,105,108,101,32,39,37,115,39,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,104,101,99,107,32,112,111,115,105,116,105,111,110,32,111,110,32,102,105,108,101,32,39,37,115,39,10,0,0,70,97,105,108,101,100,32,116,111,32,115,101,101,107,32,102,105,108,101,32,39,37,115,39,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,102,105,108,101,32,39,37,115,39,10,0,0,0,0,0,0,0,114,0,0,0,0,0,0,0,115,105,122,101,32,37,117,10,0,0,0,0,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,48,58,32,107,101,114,110,101,108,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,61,32,37,100,10,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,105,110,102,111,58,32,37,100,10,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,54,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,107,101,114,110,101,108,58,32,37,100,10,0,0,0,0,0,82,97,100,105,97,110,99,101,71,80,85,0,0,0,0,0,79,112,101,110,67,76,32,80,114,111,103,114,97,109,109,32,66,117,105,108,100,32,76,111,103,58,32,37,115,10,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,105,110,102,111,58,32,37,100,10,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,105,110,102,111,32,115,105,122,101,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,98,117,105,108,100,32,79,112,101,110,67,76,32,107,101,114,110,101,108,58,32,37,100,32,45,32,37,100,10,0,45,73,46,32,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,54,32,99,97,109,101,114,97,32,112,97,114,97,109,101,116,101,114,115,58,32,37,100,10,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,79,112,101,110,67,76,32,107,101,114,110,101,108,32,115,111,117,114,99,101,115,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,99,97,109,101,114,97,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,115,99,101,110,101,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,53,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,99,111,109,109,97,110,100,32,113,117,101,117,101,58,32,37,100,10,0,0,0,0,0,0,91,83,69,76,69,67,84,69,68,93,32,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,77,97,120,46,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,61,32,37,100,10,0,91,83,69,76,69,67,84,69,68,93,32,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,67,111,109,112,117,116,101,32,117,110,105,116,115,32,61,32,37,117,10,0,0,0,0,0,0,0,0,91,83,69,76,69,67,84,69,68,93,32,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,78,97,109,101,32,61,32,37,115,10,0,91,83,69,76,69,67,84,69,68,93,32,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,84,121,112,101,32,61,32,37,115,10,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,99,111,110,116,101,120,116,32,105,110,102,111,58,32,37,100,10,0,0,99,97,109,101,114,97,32,37,102,32,37,102,32,37,102,32,32,37,102,32,37,102,32,37,102,10,0,0,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,77,97,120,46,32,119,111,114,107,32,103,114,111,117,112,32,115,105,122,101,32,61,32,37,100,10,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,67,111,109,112,117,116,101,32,117,110,105,116,115,32,61,32,37,117,10,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,52,58,32,37,100,10,0,0,0,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,78,97,109,101,32,61,32,37,115,10,0,0,0,0,79,112,101,110,67,76,32,68,101,118,105,99,101,32,37,100,58,32,84,121,112,101,32,61,32,37,115,10,0,0,0,0,84,89,80,69,95,85,78,75,78,79,87,78,0,0,0,0,84,89,80,69,95,71,80,85,0,0,0,0,0,0,0,0,84,89,80,69,95,67,80,85,0,0,0,0,0,0,0,0,84,89,80,69,95,68,69,70,65,85,76,84,0,0,0,0,84,89,80,69,95,65,76,76,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,102,105,108,101,58,32,37,115,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,103,101,116,32,79,112,101,110,67,76,32,100,101,118,105,99,101,32,105,110,102,111,58,32,37,100,10,0,0,0,79,112,101,110,67,76,32,80,108,97,116,102,111,114,109,32,37,100,58,32,37,115,10,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,51,58,32,37,100,10,0,0,0,0,0,0,0,82,101,97,100,105,110,103,32,115,99,101,110,101,58,32,37,115,10,0,0,0,0,0,0,83,101,108,101,99,116,101,100,32,115,112,104,101,114,101,32,37,100,32,40,37,102,32,37,102,32,37,102,41,10,0,0,83,109,97,108,108,80,84,32,71,80,85,32,86,49,46,54,32,40,87,114,105,116,116,101,110,32,98,121,32,68,97,118,105,100,32,66,117,99,99,105,97,114,101,108,108,105,41,0,68,111,110,101,46,10,0,0,115,99,101,110,101,115,47,99,97,117,115,116,105,99,46,115,99,110,0,0,0,0,0,0,37,100,32,37,100,32,37,100,32,0,0,0,0,0,0,0,114,101,110,100,101,114,105,110,103,95,107,101,114,110,101,108,95,99,117,115,116,111,109,46,99,108,0,0,0,0,0,0,80,51,10,37,100,32,37,100,10,37,100,10,0,0,0,0,85,115,97,103,101,58,32,37,115,32,60,117,115,101,32,67,80,85,47,71,80,85,32,100,101,118,105,99,101,32,40,48,61,67,80,85,32,111,114,32,49,61,71,80,85,41,62,32,60,119,111,114,107,103,114,111,117,112,32,115,105,122,101,32,40,48,61,100,101,102,97,117,108,116,32,118,97,108,117,101,32,111,114,32,97,110,121,116,104,105,110,103,32,62,32,48,32,97,110,100,32,112,111,119,101,114,32,111,102,32,50,41,62,32,60,107,101,114,110,101,108,32,102,105,108,101,32,110,97,109,101,62,32,60,119,105,110,100,111,119,32,119,105,100,116,104,62,32,60,119,105,110,100,111,119,32,104,101,105,103,104,116,62,32,60,115,99,101,110,101,32,102,105,108,101,62,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,111,112,101,110,32,105,109,97,103,101,32,102,105,108,101,58,32,105,109,97,103,101,46,112,112,109,10,0,0,0,85,115,97,103,101,58,32,37,115,10,0,0,0,0,0,0,119,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,119,114,105,116,101,32,116,104,101,32,79,112,101,110,67,76,32,99,97,109,101,114,97,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,114,0,0,0,0,0,0,0,105,109,97,103,101,46,112,112,109,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,119,114,105,116,101,32,116,104,101,32,79,112,101,110,67,76,32,115,99,101,110,101,32,98,117,102,102,101,114,58,32,37,100,10,0,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,115,112,104,101,114,101,32,35,37,100,58,32,37,100,10,0,0,82,101,110,100,101,114,105,110,103,32,116,105,109,101,32,37,46,51,102,32,115,101,99,32,40,112,97,115,115,32,37,100,41,32,32,83,97,109,112,108,101,47,115,101,99,32,32,37,46,49,102,75,10,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,50,58,32,37,100,10,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,32,79,112,101,110,67,76,32,97,114,103,46,32,35,49,58,32,37,100,10,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
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
      }};var CL={address_space:{GENERAL:0,GLOBAL:1,LOCAL:2,CONSTANT:4,PRIVATE:8},data_type:{FLOAT:16,INT:32,UINT:64},device_infos:{},index_object:0,webcl_mozilla:0,webcl_webkit:0,ctx:[],ctx_clean:[],cmdQueue:[],cmdQueue_clean:[],programs:[],programs_clean:[],kernels:[],kernels_name:[],kernels_sig:{},kernels_clean:[],buffers:[],buffers_clean:[],devices:[],devices_clean:[],platforms:[],errorMessage:"Unfortunately your system does not support WebCL. Make sure that you have both the OpenCL driver and the WebCL browser extension installed.",setupWebCLEnums:function () {
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
          0x1031:CL.DEVICE_PLATFORM,
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
        var message = "";
        if (CL.webcl_webkit == 1) {
          message = e.message;
        } else {
          message = e;
        }
        console.info(message);
        var str=""+message;
        var n=str.lastIndexOf(" ");
        var error = str.substr(n+1,str.length-n-2);
        console.error("CATCH: "+name+": "+message);
        Module.print("/!\\"+name+": "+message);
        return error;
      }};function _clSetKernelArg(kernel, arg_index, arg_size, arg_value) {
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
      },extname:function (path) {
        return PATH.splitPath(path)[3];
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
  var MEMFS={CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },mount:function (mount) {
        return MEMFS.create_node(null, '/', 0040000 | 0777, 0);
      },create_node:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek
          };
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
          node.stream_ops = {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap
          };
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink
          };
          node.stream_ops = {};
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr
          };
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
            MEMFS.ensureFlexible(node);
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
          var node = MEMFS.create_node(parent, newname, 0777 | 0120000, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          var size = Math.min(contents.length - position, length);
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
            if (canOwn && buffer.buffer === HEAP8.buffer && offset === 0) {
              node.contents = buffer; // this is a subarray of the heap, and we can own it
              node.contentMode = MEMFS.CONTENT_OWNING;
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
          if ( !(flags & 0x02) &&
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
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        },handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + new Error().stack;
        return ___setErrNo(e.errno);
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
      },isSocket:function (mode) {
        return (mode & 0140000) === 0140000;
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
        mode = mode !== undefined ? mode : 0666;
        mode &= 4095;
        mode |= 0100000;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 0001000;
        mode |= 0040000;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
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
        mode = typeof mode === 'undefined' ? 0666 : mode;
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
      },write:function (stream, buffer, offset, length, position, canOwn) {
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
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
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
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
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
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0);
        } else {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        FS.close(stream);
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
        HEAP32[((_stdin)>>2)]=stdin.fd;
        assert(stdin.fd === 1, 'invalid handle for stdin (' + stdin.fd + ')');
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=stdout.fd;
        assert(stdout.fd === 2, 'invalid handle for stdout (' + stdout.fd + ')');
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=stderr.fd;
        assert(stderr.fd === 3, 'invalid handle for stderr (' + stderr.fd + ')');
      },staticInit:function () {
        FS.nameTable = new Array(4096);
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
            FS.mkdir(current);
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
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
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
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(path, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join(typeof parent === 'string' ? parent : FS.getPath(parent), name);
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
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
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
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join(parent, name)) : parent;
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
        openRequest.onupgradeneeded = function() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
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
        openRequest.onsuccess = function() {
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
            getRequest.onsuccess = function() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 0040000 | 0777, 0);
      },nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
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
        var node = FS.createNode(SOCKFS.root, name, 0140000, 0);
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
        }},websocket_sock_ops:{createPeer:function (sock, addr, port) {
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
              var opts = ENVIRONMENT_IS_NODE ? {} : ['binary'];
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
          var handleMessage = function(data) {
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
            peer.socket.onmessage = function(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (0 /* XXX missing C define POLLRDNORM */ | 1) : 0;
          }
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (0 /* XXX missing C define POLLRDNORM */ | 1);
          }
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 2;
          }
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 1:
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
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module.print('exit(' + status + ') called');
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }
  function _clFinish(command_queue) {
      var queue = CL.getArrayId(command_queue);
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
  function _clEnqueueWriteBuffer(command_queue, buffer, blocking_write, offset, size, ptr, num_events_in_wait_list, event_wait_list, event) {
      var queue = CL.getArrayId(command_queue);
      if (queue >= CL.cmdQueue.length || queue < 0 ) {
        console.error("clEnqueueWriteBuffer: Invalid command queue : "+queue);
        return -36; /* CL_INVALID_COMMAND_QUEUE */
      }
      var buff = CL.getArrayId(buffer);
      if (buff >= CL.buffers.length || buff < 0 ) {
        console.error("clEnqueueWriteBuffer: Invalid command queue : "+buff);
        return -38; /* CL_INVALID_MEM_OBJECT */
      }
      var vector;
      var isFloat = 0;
      var isUint = 0;
      var isInt = 0;
      if (CL.kernels_name.length > 0) {
        // \warning experimental stuff
        console.info("/!\\ clEnqueueWriteBuffer: Need to find how detect the array type");
        var name = CL.kernels_name[0];
        console.info("/!\\ clEnqueueWriteBuffer: use '"+name+"' kernel name ...");
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
          console.info("/!\\ clEnqueueWriteBuffer: use FLOAT output type ...");
        } else {
          vector = new Int32Array(size / Int32Array.BYTES_PER_ELEMENT);
          console.info("/!\\ clEnqueueWriteBuffer: use INT output type ...");        
        }
      } else {        
        if (isFloat) {
          vector = new Float32Array(size / Float32Array.BYTES_PER_ELEMENT);
          console.info("/!\\ clEnqueueWriteBuffer: use FLOAT output type ...");
        } else if (isUint) {
          vector = new Uint32Array(size / Uint32Array.BYTES_PER_ELEMENT);
          console.info("/!\\ clEnqueueWriteBuffer: use UINT output type ...");
        } else if (isInt) {
          vector = new Int32Array(size / Int32Array.BYTES_PER_ELEMENT);
          console.info("/!\\ clEnqueueWriteBuffer: use INT output type ...");
        } else {
          console.error("clEnqueueWriteBuffer: Unknow ouptut type : "+sig[buff]);
        }
      }
      for (var i = 0; i < (size / 4); i++) {
        if (isFloat) {
          vector[i] = HEAPF32[(((ptr)+(i*4))>>2)];
        } else {
          vector[i] = HEAP32[(((ptr)+(i*4))>>2)];
        }
      }
      //console.info(vector);
      try {
        CL.cmdQueue[queue].enqueueWriteBuffer (CL.buffers[buff], blocking_write, offset, size, vector , []);
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clEnqueueWriteBuffer",e);
      }
    }
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
      }};
  function _glutPostRedisplay() {
      if (GLUT.displayFunc) {
        Browser.requestAnimationFrame(function() {
          if (ABORT) return;
          Runtime.dynCall('v', GLUT.displayFunc);
        });
      }
    }function _glutReshapeWindow(width, height) {
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
  function _clGetPlatformIDs(num_entries,platform_ids,num_platforms) {
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
  function _clGetPlatformInfo(platform, param, param_value_size, param_value, param_value_size_ret) {
      var plat = CL.getArrayId(platform);
      if (plat >= CL.platforms.length || plat < 0 ) {
          console.error("clGetPlatformInfo: Invalid platform : "+plat);
          return -32; /* CL_INVALID_PLATFORM */ 
      }
      try { 
        var value;
        switch (param) {
          case(0x0900)/*CL_PLATFORM_PROFILE*/:
            value = (CL.webcl_mozilla == 1) ? CL.platforms[plat].getPlatformInfo(CL.PLATFORM_PROFILE) : CL.platforms[plat].getInfo(CL.PLATFORM_PROFILE);
            break;
          case(0x0901)/*CL_PLATFORM_VERSION*/:
            value = (CL.webcl_mozilla == 1) ? CL.platforms[plat].getPlatformInfo(CL.PLATFORM_VERSION) : CL.platforms[plat].getInfo(CL.PLATFORM_VERSION);  
            break;
          case(0x0902)/*CL_PLATFORM_NAME*/:
            value = (CL.webcl_mozilla == 1) ? CL.platforms[plat].getPlatformInfo(CL.PLATFORM_NAME) : "Not Visible";  
            break;
          case(0x0903)/*CL_PLATFORM_VENDOR*/:
            value = (CL.webcl_mozilla == 1) ? CL.platforms[plat].getPlatformInfo(CL.PLATFORM_VENDOR) : "Not Visible";  
            break;
          case(0x0904)/*CL_PLATFORM_EXTENSIONS*/:
            value = (CL.webcl_mozilla == 1) ? CL.platforms[plat].getPlatformInfo(CL.PLATFORM_EXTENSIONS) : "Not Visible"; 
            break;
          default:
            console.error("clGetPlatformInfo : Param not yet implemented or unknow : "+param);
            return -30; /* CL_INVALID_VALUE */           
        }
        if (param_value != 0) {
          writeStringToMemory(value, param_value);
        }
        HEAP32[((param_value_size_ret)>>2)]=value.length;
        return 0; /*CL_SUCCESS*/
      } catch (e) {
        return CL.catchError("clGetPlatformInfo",e);
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
  function _clGetDeviceInfo(device, param_name, param_value_size, param_value, param_value_size_ret) {
      var idx = CL.getArrayId(device);
      if (idx >= CL.devices.length || idx < 0 ) {
        console.error("clGetDeviceInfo: Invalid device : "+idx);
        return -33; /* CL_INVALID_DEVICE */  
      }    
      var res;
      var size = 0;
      var info = CL.device_infos[param_name];
      if (param_name in CL.device_infos) {
        // Return string
        if (
          (param_name == 0x1030) || /* CL_DEVICE_EXTENSIONS               */
          (param_name == 0x102B) || /* CL_DEVICE_NAME                     */
          (param_name == 0x102C) || /* CL_DEVICE_VENDOR                   */
          (param_name == 0x102D) || /* CL_DRIVER_VERSION                  */
          (param_name == 0x102F) || /* CL_DEVICE_VERSION                  */
          (param_name == 0x102E)    /* CL_DEVICE_PROFILE                  */
        ) {
          try {
            if (info != undefined) {
              res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(info) : CL.devices[idx].getInfo(info);
            } else {
              res = "Not Visible";
            }
          } catch (e) {
            CL.catchError("clGetDeviceInfo",e);
            res = "Not Visible";
          }    
          writeStringToMemory(res, param_value);
          size = res.length;
        }
        // Return array
        else if (
          (param_name == 0x1005) /* CL_DEVICE_MAX_WORK_ITEM_SIZES */
        ) {
          try {
            if (info != undefined) {
              res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(info) : CL.devices[idx].getInfo(info);
            } else {
              res = [1,1,1]; // minimum value is (1, 1, 1).
            }
            for (var i = 0 ; i < 3; i++) {
              HEAP32[(((param_value)+(i*4))>>2)]=res[i]; 
            }
            size = 3;            
          } catch (e) {
            CL.catchError("clGetDeviceInfo",e);
            for (var i = 0 ; i < 3; i++) {
              HEAP32[(((param_value)+(i*4))>>2)]=1;
            }
            size = 3;
          }         
        }
        // Return int
        else {
          try {
            if (info != undefined) {
              res = (CL.webcl_mozilla == 1) ? CL.devices[idx].getDeviceInfo(info) : CL.devices[idx].getInfo(info);
            } else {
              res = 0;
            }
            HEAP32[((param_value)>>2)]=res;
          } catch (e) {
            CL.catchError("clGetDeviceInfo",e);
            HEAP32[((param_value)>>2)]=0;
          }   
          size = 1;
        }
      } else {
        console.error("clGetDeviceInfo: Unknow param info : "+param_name);
        HEAP32[((param_value)>>2)]=0;
        size = 1;
      }
      HEAP32[((param_value_size_ret)>>2)]=size;
      return 0;/*CL_SUCCESS*/  
    }
  function _clCreateContext(properties, num_devices, devices, pfn_notify, user_data, errcode_ret) {
      if (CL.checkWebCL() < 0) {
        console.error(CL.errorMessage);
        Module.print("/!\\"+CL.errorMessage);
        return -1;/*WEBCL_NOT_FOUND*/;
      }
      try {
        if (CL.platforms.length == 0) {
          // Get the platform
          var platforms = WebCL.getPlatforms();
          if (platforms.length > 0) {
            CL.platforms.push(platforms[0]);
            plat = CL.platforms.length - 1;
          } else {
            console.error("clGetDeviceIDs: Invalid platform : "+platform);
            HEAP32[((errcode_ret)>>2)]=-32 /* CL_INVALID_PLATFORM */;
            return 0; // Null pointer    
          } 
        } 
        var prop = [];
        var plat = 0;
        var use_gl_interop = 0;
        var share_group = 0;
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
                  plat = readprop;    
                  prop.push(CL.platforms[readprop]);
                }             
              break;
              case (0x2008) /*CL_GL_CONTEXT_KHR*/:
                use_gl_interop = 1;
                i++;
              break;
              case (0x200A) /*CL_GLX_DISPLAY_KHR*/:
                i++;
              break;
              case (0x200C) /*CL_CGL_SHAREGROUP_KHR*/:
                use_gl_interop = 1;
                share_group = 1;
                i++;
              break;
              default:
                console.error("clCreateContext : Param not yet implemented or unknow : "+readprop);
                HEAP32[((errcode_ret)>>2)]=-30 /* CL_INVALID_VALUE */;
                return 0; // Null pointer    
            }
            i++;  
          }        
        }
        if (prop.length == 0) {
          prop = [CL.CONTEXT_PLATFORM, CL.platforms[0]]; 
          plat = 0;    
        }
        if (CL.devices.length == 0) {
          var alldev = CL.getAllDevices(plat);
          var mapcount = 0;
          for (var i = 0 ; i < alldev.length; i++ ) {
            CL.devices.push(alldev[i]);  
          }
        }
        if (num_devices > CL.devices.length) {
          console.error("clCreateContext: Invalid num devices : "+num_devices);
          HEAP32[((errcode_ret)>>2)]=-33 /* CL_INVALID_DEVICE */;  
          return 0;
        }
        // \todo will be better to use the devices list in parameter ...
        var devices_tab = [];
        for (var i = 0; i < num_devices; i++) {
          devices_tab[i] = CL.devices[i];
        } 
        if (num_devices == 0) {
          devices_tab[0] = CL.devices[0];
        }
        if (CL.webcl_mozilla == 1) {
          if (use_gl_interop) {
            console.error("clCreateContext: GL Interop not yet supported by Firefox");
            HEAP32[((errcode_ret)>>2)]=-33 /* CL_INVALID_DEVICE */;  
            return 0;
          }
          CL.ctx.push(WebCL.createContext(prop, devices_tab/*[CL.devices[0],CL.devices[1]]*/));  
        } else {
          var builder = WebCL;
          if (use_gl_interop)
            builder = WebCL.getExtension("KHR_GL_SHARING");
          CL.ctx.push(builder.createContext({platform: CL.platforms[plat], devices: devices_tab, deviceType: devices_tab[0].getInfo(CL.DEVICE_TYPE), shareGroup: share_group, hint: null}));
        }
        return CL.getNewId(CL.ctx.length-1);
      } catch (e) {    
        HEAP32[((errcode_ret)>>2)]=CL.catchError("clCreateContext",e);
        return 0; // Null pointer    
      }
    }
  function _clGetContextInfo(context, param_name, param_value_size, param_value, param_value_size_ret) {
      var ctx = CL.getArrayId(context);
      if (ctx >= CL.ctx.length || ctx < 0 ) {
          console.error("clGetContextInfo: Invalid context : "+ctx);
          return -34; /* CL_INVALID_CONTEXT */ 
      }
      try {
        var res;
        var size;
        switch (param_name) {
          case (0x1081) /* CL_CONTEXT_DEVICES */:
            res = (CL.webcl_mozilla == 1) ? CL.ctx[ctx].getContextInfo(CL.CONTEXT_DEVICES) : CL.ctx[ctx].getInfo(CL.CONTEXT_DEVICES) ;
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
            res = (CL.webcl_mozilla == 1) ? CL.ctx[ctx].getContextInfo(CL.CONTEXT_PROPERTIES) : CL.ctx[ctx].getInfo(CL.CONTEXT_PROPERTIES) ;
            // \todo add in param_value the properties list
            size = res.length * 4;          
            break;
          case (0x1080) /* CL_CONTEXT_REFERENCE_COUNT */:
            res = CL.ctx[ctx].getContextInfo(CL.CONTEXT_REFERENCE_COUNT); // return cl_uint
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
        var opt = "";//(options == 0) ? "" : Pointer_stringify(options);
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
  function _clGetKernelWorkGroupInfo(kernel, devices, param_name, param_value_size, param_value, param_value_size_ret) {
      var ker = CL.getArrayId(kernel);
      if (ker >= CL.kernels.length || ker < 0 ) {
        console.error("clGetKernelWorkGroupInfo: Invalid kernel : "+ker);
        return -48; /* CL_INVALID_KERNEL */
      }
      // \todo the type is a number but why i except have a Array ??? Will must be an array ???
      var idx = CL.getArrayId(devices);
      if (idx >= CL.devices.length || idx < 0 ) {
        console.error("clGetKernelWorkGroupInfo: Invalid device : "+idx);
        return -33; /* CL_INVALID_DEVICE */  
      }
      try {        
        var res;
        switch (param_name) {
          case (0x11B0) /* CL_KERNEL_WORK_GROUP_SIZE */:
            if (CL.webcl_mozilla == 1) {
              res = CL.kernels[ker].getKernelWorkGroupInfo(CL.devices[idx],CL.KERNEL_WORK_GROUP_SIZE);
            } else {
              res = CL.kernels[ker].getWorkGroupInfo(CL.devices[idx],CL.KERNEL_WORK_GROUP_SIZE);
            }
            break;
          case (0x11B1) /*    CL_KERNEL_COMPILE_WORK_GROUP_SIZE    */:
            if (CL.webcl_mozilla == 1) {
              res = CL.kernels[ker].getKernelWorkGroupInfo(CL.devices[idx],CL.KERNEL_COMPILE_WORK_GROUP_SIZE);
            } else {
              res = CL.kernels[ker].getWorkGroupInfo(CL.devices[idx],CL.KERNEL_COMPILE_WORK_GROUP_SIZE);
            }
            break;
          case (0x11B2) /*    CL_KERNEL_LOCAL_MEM_SIZE    */:
            if (CL.webcl_mozilla == 1) {
              res = CL.kernels[ker].getKernelWorkGroupInfo(CL.devices[idx],CL.KERNEL_LOCAL_MEM_SIZE);
            } else {
              res = CL.kernels[ker].getWorkGroupInfo(CL.devices[idx],CL.KERNEL_LOCAL_MEM_SIZE);
            }
            break;
        };
        HEAP32[((param_value)>>2)]=res
        return 0;/*CL_SUCCESS*/
      } catch(e) {
        return CL.catchError("clGetKernelWorkGroupInfo",e);
      }
    }
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _open(path, oflag, varargs) {
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
    }
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
    }
  function _rewind(stream) {
      // void rewind(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/rewind.html
      _fseek(stream, 0, 0);  // SEEK_SET.
      var streamObj = FS.getStream(stream);
      if (streamObj) streamObj.error = false;
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
        FS.handleFSError(e);
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
  function _rand() {
      return Math.floor(Math.random()*0x80000000);
    }
  function _clReleaseMemObject(memobj) { 
      var buff = CL.getArrayId(memobj);  
      if (buff >= (CL.buffers.length + CL.buffers_clean.length) || buff < 0 ) {
        console.error("clReleaseMemObject: Invalid Memory Object : "+buff);
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
      console.info("clReleaseMemObject: Release Memory Object : "+buff);
      return 0;/*CL_SUCCESS*/
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
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
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
        var streamObj = FS.getStream(stream);
        if (streamObj) streamObj.error = true;
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
  function _emscripten_get_now() {
      if (!_emscripten_get_now.actual) {
        if (ENVIRONMENT_IS_NODE) {
            _emscripten_get_now.actual = function() {
              var t = process['hrtime']();
              return t[0] * 1e3 + t[1] / 1e6;
            }
        } else if (typeof dateNow !== 'undefined') {
          _emscripten_get_now.actual = dateNow;
        } else if (ENVIRONMENT_IS_WEB && window['performance'] && window['performance']['now']) {
          _emscripten_get_now.actual = function() { return window['performance']['now'](); };
        } else {
          _emscripten_get_now.actual = Date.now;
        }
      }
      return _emscripten_get_now.actual();
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
                (tempI64 = [parseInt(text, 10)>>>0,(tempDouble=parseInt(text, 10),Math.abs(tempDouble) >= 1 ? (tempDouble > 0 ? Math.min(Math.floor((tempDouble)/4294967296), 4294967295)>>>0 : (~~(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
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
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }
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
    }function _fscanf(stream, format, varargs) {
      // int fscanf(FILE *restrict stream, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var streamObj = FS.getStream(stream);
      if (!streamObj) {
        return -1;
      }
      var buffer = [];
      var get = function() {
        var c = _fgetc(stream);
        buffer.push(c);
        return c;
      };
      var unget = function() {
        _ungetc(buffer.pop(), stream);
      };
      return __scanString(format, get, unget, varargs);
    }
  var _sqrt=Math.sqrt;
  function _glClear(x0) { Module.ctx.clear(x0) }
  function _glutSwapBuffers() {}
  function _glViewport(x0, x1, x2, x3) { Module.ctx.viewport(x0, x1, x2, x3) }
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
          var x, y;
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (window.scrollX + rect.left);
              y = t.pageY - (window.scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (window.scrollX + rect.left);
            y = event.pageY - (window.scrollY + rect.top);
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
  function _glEnable(x0) { Module.ctx.enable(x0) }
  function _glDisable(x0) { Module.ctx.disable(x0) }
  function _glIsEnabled(x0) { return Module.ctx.isEnabled(x0) }
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
  function _glGetIntegerv(name_, p) {
      switch(name_) { // Handle a few trivial GLES values
        case 0x8DFA: // GL_SHADER_COMPILER
          HEAP32[((p)>>2)]=1;
          return;
        case 0x8DF9: // GL_NUM_SHADER_BINARY_FORMATS
          HEAP32[((p)>>2)]=0;
          return;
        case 0x86A2: // GL_NUM_COMPRESSED_TEXTURE_FORMATS
          // WebGL doesn't have GL_NUM_COMPRESSED_TEXTURE_FORMATS (it's obsolete since GL_COMPRESSED_TEXTURE_FORMATS returns a JS array that can be queried for length),
          // so implement it ourselves to allow C++ GLES2 code get the length.
          var formats = Module.ctx.getParameter(0x86A3 /*GL_COMPRESSED_TEXTURE_FORMATS*/);
          HEAP32[((p)>>2)]=formats.length;
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
            HEAP32[((p)>>2)]=result.name | 0;
          } else if (result instanceof WebGLProgram) {
            HEAP32[((p)>>2)]=result.name | 0;
          } else if (result instanceof WebGLFramebuffer) {
            HEAP32[((p)>>2)]=result.name | 0;
          } else if (result instanceof WebGLRenderbuffer) {
            HEAP32[((p)>>2)]=result.name | 0;
          } else if (result instanceof WebGLTexture) {
            HEAP32[((p)>>2)]=result.name | 0;
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
  function _glCreateShader(shaderType) {
      var id = GL.getNewId(GL.shaders);
      GL.shaders[id] = Module.ctx.createShader(shaderType);
      return id;
    }
  function _glShaderSource(shader, count, string, length) {
      var source = GL.getSource(shader, count, string, length);
      Module.ctx.shaderSource(GL.shaders[shader], source);
    }
  function _glCompileShader(shader) {
      Module.ctx.compileShader(GL.shaders[shader]);
    }
  function _glAttachShader(program, shader) {
      Module.ctx.attachShader(GL.programs[program],
                              GL.shaders[shader]);
    }
  function _glDetachShader(program, shader) {
      Module.ctx.detachShader(GL.programs[program],
                              GL.shaders[shader]);
    }
  function _glUseProgram(program) {
      Module.ctx.useProgram(program ? GL.programs[program] : null);
    }
  function _glDeleteProgram(program) {
      var program = GL.programs[program];
      Module.ctx.deleteProgram(program);
      program.name = 0;
      GL.programs[program] = null;
      GL.uniformTable[program] = null;
    }
  function _glBindAttribLocation(program, index, name) {
      name = Pointer_stringify(name);
      Module.ctx.bindAttribLocation(GL.programs[program], index, name);
    }
  function _glLinkProgram(program) {
      Module.ctx.linkProgram(GL.programs[program]);
      GL.uniformTable[program] = {}; // uniforms no longer keep the same names after linking
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
            HEAPF32[((p)>>2)]=result.name | 0;
          } else if (result instanceof WebGLProgram) {
            HEAPF32[((p)>>2)]=result.name | 0;
          } else if (result instanceof WebGLFramebuffer) {
            HEAPF32[((p)>>2)]=result.name | 0;
          } else if (result instanceof WebGLRenderbuffer) {
            HEAPF32[((p)>>2)]=result.name | 0;
          } else if (result instanceof WebGLTexture) {
            HEAPF32[((p)>>2)]=result.name | 0;
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
  function _glHint(x0, x1) { Module.ctx.hint(x0, x1) }
  function _glEnableVertexAttribArray(index) {
      Module.ctx.enableVertexAttribArray(index);
    }
  function _glDisableVertexAttribArray(index) {
      Module.ctx.disableVertexAttribArray(index);
    }
  function _glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
      Module.ctx.vertexAttribPointer(index, size, type, normalized, stride, ptr);
    }
  function _glActiveTexture(x0) { Module.ctx.activeTexture(x0) }var GLEmulation={fogStart:0,fogEnd:1,fogDensity:1,fogColor:null,fogMode:2048,fogEnabled:false,vaos:[],currentVao:null,enabledVertexAttribArrays:{},hasRunInit:false,init:function () {
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
        Module.printErr('WARNING: using emscripten GL emulation. This is a collection of limited workarounds, do not expect it to work.');
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
          GL.immediate.vertexCounter = (GL.immediate.stride * count) / 4; // XXX assuming float
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
          if (!GL.immediate.restrideBuffer) GL.immediate.restrideBuffer = _malloc(GL.MAX_TEMP_BUFFER_SIZE);
          start = GL.immediate.restrideBuffer;
          // calculate restrided offsets and total size
          for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            if (!attribute) break;
            var size = attribute.size * GL.byteSizeByType[attribute.type - GL.byteSizeByTypeRoot];
            if (size % 4 != 0) size += 4 - (size % 4); // align everything
            attribute.offset = bytes;
            bytes += size;
          }
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
  var GLImmediateSetup={};function _glLoadIdentity() {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.identity(GL.immediate.matrix[GL.immediate.currentMatrix]);
    }
  function _glOrtho(left, right, bottom, top_, nearVal, farVal) {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.multiply(GL.immediate.matrix[GL.immediate.currentMatrix],
          GL.immediate.matrix.lib.mat4.ortho(left, right, bottom, top_, nearVal, farVal));
    }
  function _glutInitWindowSize(width, height) {
      Browser.setCanvasSize( GLUT.initWindowWidth = width,
                             GLUT.initWindowHeight = height );
    }
  function _glutInitWindowPosition(x, y) {
      // Ignore for now
    }
  function _glutInitDisplayMode(mode) {}
  function _glutInit(argcp, argv) {
      // Ignore arguments
      GLUT.initTime = Date.now();
      var isTouchDevice = 'ontouchstart' in document.documentElement;
      window.addEventListener("keydown", GLUT.onKeydown, true);
      window.addEventListener("keyup", GLUT.onKeyup, true);
      if (isTouchDevice) {
        window.addEventListener("touchmove", GLUT.onMousemove, true);
        window.addEventListener("touchstart", GLUT.onMouseButtonDown, true);
        window.addEventListener("touchend", GLUT.onMouseButtonUp, true);
      } else {
        window.addEventListener("mousemove", GLUT.onMousemove, true);
        window.addEventListener("mousedown", GLUT.onMouseButtonDown, true);
        window.addEventListener("mouseup", GLUT.onMouseButtonUp, true);
      }
      Browser.resizeListeners.push(function(width, height) {
        if (GLUT.reshapeFunc) {
        	Runtime.dynCall('vii', GLUT.reshapeFunc, [width, height]);
        }
      });
      __ATEXIT__.push({ func: function() {
        window.removeEventListener("keydown", GLUT.onKeydown, true);
        window.removeEventListener("keyup", GLUT.onKeyup, true);
        if (isTouchDevice) {
          window.removeEventListener("touchmove", GLUT.onMousemove, true);
          window.removeEventListener("touchstart", GLUT.onMouseButtonDown, true);
          window.removeEventListener("touchend", GLUT.onMouseButtonUp, true);
        } else {
          window.removeEventListener("mousemove", GLUT.onMousemove, true);
          window.removeEventListener("mousedown", GLUT.onMouseButtonDown, true);
          window.removeEventListener("mouseup", GLUT.onMouseButtonUp, true);
        }
        Module["canvas"].width = Module["canvas"].height = 1;
      } });
    }
  function _glutCreateWindow(name) {
      Module.ctx = Browser.createContext(Module['canvas'], true, true);
      return Module.ctx ? 1 /* a new GLUT window ID for the created context */ : 0 /* failure */;
    }
  function _glutReshapeFunc(func) {
      GLUT.reshapeFunc = func;
    }
  function _glutKeyboardFunc(func) {
      GLUT.keyboardFunc = func;
    }
  function _glutSpecialFunc(func) {
      GLUT.specialFunc = func;
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
  function _abort() {
      Module['abort']();
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
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
    }
GL.init()
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
GL.immediate.setupFuncs(); Browser.moduleContextCreatedCallbacks.push(function() { GL.immediate.init() });
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
GLEmulation.init();
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var FUNCTION_TABLE = [0,0,_reshapeFunc,0,_idleFunc,0,_keyFunc,0,_specialFunc,0,_displayFunc];
// EMSCRIPTEN_START_FUNCS
function _UpdateRendering(){var r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r1=0;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r3=r2;r4=r2+8;r5=_WallClockTime();r6=HEAP32[3360>>2];r7=_clSetKernelArg(HEAP32[3344>>2],0,4,3392);if((r7|0)!=0){_printf(3216,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r7,r1));STACKTOP=r1;_exit(-1)}r7=_clSetKernelArg(HEAP32[3344>>2],1,4,3288);if((r7|0)!=0){_printf(3176,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r7,r1));STACKTOP=r1;_exit(-1)}r7=_clSetKernelArg(HEAP32[3344>>2],2,4,3272);if((r7|0)!=0){_printf(2480,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r7,r1));STACKTOP=r1;_exit(-1)}r7=_clSetKernelArg(HEAP32[3344>>2],3,4,3400);if((r7|0)!=0){_printf(2200,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r7,r1));STACKTOP=r1;_exit(-1)}r7=_clSetKernelArg(HEAP32[3344>>2],4,4,3264);if((r7|0)!=0){_printf(1760,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r7,r1));STACKTOP=r1;_exit(-1)}r7=_clSetKernelArg(HEAP32[3344>>2],5,4,16);if((r7|0)!=0){_printf(1312,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r7,r1));STACKTOP=r1;_exit(-1)}r7=_clSetKernelArg(HEAP32[3344>>2],6,4,216);if((r7|0)!=0){_printf(912,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r7,r1));STACKTOP=r1;_exit(-1)}r7=_clSetKernelArg(HEAP32[3344>>2],7,4,3360);if((r7|0)!=0){_printf(432,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r7,r1));STACKTOP=r1;_exit(-1)}r7=_clSetKernelArg(HEAP32[3344>>2],8,4,3312);if((r7|0)!=0){_printf(376,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r7,r1));STACKTOP=r1;_exit(-1)}r7=HEAP32[3360>>2];L28:do{if((r7|0)<20){r8=Math.imul(HEAP32[216>>2],HEAP32[16>>2])|0;r9=r3|0;HEAP32[r9>>2]=r8;r10=HEAP32[8>>2];if(((r8>>>0)%(r10>>>0)&-1|0)!=0){r11=Math.imul(((r8>>>0)/(r10>>>0)&-1)+1|0,r10)|0;HEAP32[r9>>2]=r11}r11=r4|0;HEAP32[r11>>2]=r10;r10=_clEnqueueNDRangeKernel(HEAP32[3376>>2],HEAP32[3344>>2],1,0,r9,r11,0,0,0);if((r10|0)==0){HEAP32[3360>>2]=HEAP32[3360>>2]+1;break}else{_printf(472,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r10,r1));STACKTOP=r1;_exit(-1)}}else{r10=r7-20|0;if((r10|0)<100){r12=r10|0}else{r12=100}r10=r12/100*.5;r11=r3|0;r9=r4|0;while(1){r8=Math.imul(HEAP32[216>>2],HEAP32[16>>2])|0;HEAP32[r11>>2]=r8;r13=HEAP32[8>>2];if(((r8>>>0)%(r13>>>0)&-1|0)!=0){r14=Math.imul(((r8>>>0)/(r13>>>0)&-1)+1|0,r13)|0;HEAP32[r11>>2]=r14}HEAP32[r9>>2]=r13;r15=_clEnqueueNDRangeKernel(HEAP32[3376>>2],HEAP32[3344>>2],1,0,r11,r9,0,0,0);if((r15|0)!=0){break}_clFinish(HEAP32[3376>>2]);HEAP32[3360>>2]=HEAP32[3360>>2]+1;if(_WallClockTime()-r5>r10){break L28}}_printf(472,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r15,r1));STACKTOP=r1;_exit(-1)}}while(0);r15=HEAP32[3376>>2];r4=HEAP32[3312>>2];r3=Math.imul(HEAP32[16>>2]<<2,HEAP32[216>>2])|0;r12=_clEnqueueReadBuffer(r15,r4,1,0,r3,HEAP32[3304>>2],0,0,0);if((r12|0)==0){r3=_WallClockTime()-r5;r5=HEAP32[3360>>2];r4=Math.imul(r5-r6|0,HEAP32[216>>2])|0;r6=(Math.imul(r4,HEAP32[16>>2])|0)/r3/1e3;_printf(3120,(r1=STACKTOP,STACKTOP=STACKTOP+24|0,HEAPF64[r1>>3]=r3,HEAP32[r1+8>>2]=r5,HEAPF64[r1+16>>3]=r6,r1));STACKTOP=r1;STACKTOP=r2;return}else{_printf(280,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r12,r1));STACKTOP=r1;_exit(-1)}}function _ReInitScene(){var r1,r2,r3;r1=0;r2=STACKTOP;HEAP32[3360>>2]=0;r3=_clEnqueueWriteBuffer(HEAP32[3376>>2],HEAP32[3272>>2],1,0,HEAP32[3264>>2]*44&-1,HEAP32[3256>>2],0,0,0);if((r3|0)==0){STACKTOP=r2;return}else{_printf(3040,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r3,r1));STACKTOP=r1;_exit(-1)}}function _ReInit(r1){var r2,r3,r4;r2=0;r3=STACKTOP;do{if((r1|0)==0){_UpdateCamera()}else{r4=_clReleaseMemObject(HEAP32[3392>>2]);if((r4|0)!=0){_printf(608,(r2=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r2>>2]=r4,r2));STACKTOP=r2;_exit(-1)}r4=_clReleaseMemObject(HEAP32[3312>>2]);if((r4|0)!=0){_printf(560,(r2=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r2>>2]=r4,r2));STACKTOP=r2;_exit(-1)}r4=_clReleaseMemObject(HEAP32[3288>>2]);if((r4|0)==0){_free(HEAP32[3280>>2]);_free(HEAP32[3384>>2]);_free(HEAP32[3304>>2]);_UpdateCamera();_AllocateBuffers();break}else{_printf(512,(r2=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r2>>2]=r4,r2));STACKTOP=r2;_exit(-1)}}}while(0);r1=_clEnqueueWriteBuffer(HEAP32[3376>>2],HEAP32[3400>>2],1,0,60,3408,0,0,0);if((r1|0)==0){HEAP32[3360>>2]=0;STACKTOP=r3;return}else{_printf(2968,(r2=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r2>>2]=r1,r2));STACKTOP=r2;_exit(-1)}}function _main(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55;r3=0;r4=0;r5=STACKTOP;STACKTOP=STACKTOP+872|0;r6=r5;r7=r5+8;r8=r5+120;r9=r5+248;r10=r5+256;r11=r5+264;r12=r5+528;r13=r5+536;r14=r5+544;r15=r5+560;r16=r5+568;r17=r5+832;r18=r5+840;r19=r5+848;r20=r5+856;r21=r5+864;HEAP32[3472>>2]=0;_printf(2944,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=HEAP32[r2>>2],r4));STACKTOP=r4;_printf(2720,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=HEAP32[r2>>2],r4));STACKTOP=r4;HEAP32[208>>2]=2672;HEAP32[16>>2]=512;HEAP32[216>>2]=512;_ReadScene(2632);_UpdateCamera();r22=r5+16|0;r23=r8;r24=r11;r25=r5+272|0;r26=r12;r27=r13;r28=r16;r29=r5+576|0;r30=r17;r31=r18;r32=r21;r33=_clGetPlatformIDs(0,0,r6);HEAP32[r7>>2]=r33;if((r33|0)!=0){_puts(168);_exit(-1)}r33=HEAP32[r6>>2];if((r33|0)==0){r34=0}else{r35=_malloc(r33<<2);r36=r35;r37=_clGetPlatformIDs(r33,r36,0);HEAP32[r7>>2]=r37;if((r37|0)!=0){_puts(128);_exit(-1)}L81:do{if((HEAP32[r6>>2]|0)!=0){r37=0;while(1){r33=_clGetPlatformInfo(HEAP32[r36+(r37<<2)>>2],2307,100,r22,0);HEAP32[r7>>2]=r33;r33=_clGetPlatformIDs(HEAP32[r6>>2],r36,0);HEAP32[r7>>2]=r33;if((r33|0)!=0){break}_printf(2456,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r37,HEAP32[r4+8>>2]=r22,r4));STACKTOP=r4;r33=r37+1|0;if(r33>>>0<HEAP32[r6>>2]>>>0){r37=r33}else{break L81}}_puts(128);_exit(-1)}}while(0);r6=HEAP32[r36>>2];_free(r35);r34=r6}r6=r8|0;r35=_clGetDeviceIDs(r34,-1,0,32,r6,r9);HEAP32[r7>>2]=r35;if((r35|0)!=0){_puts(96);_exit(-1)}if((HEAP32[r9>>2]|0)==0){r38=_puts(56);_exit(-1)}else{r39=0;r40=0}while(1){HEAP32[r11>>2]=0;HEAP32[r11+4>>2]=0;r35=r8+(r40<<2)|0;r41=_clGetDeviceInfo(HEAP32[r35>>2],4096,8,r24,0);HEAP32[r7>>2]=r41;if((r41|0)!=0){r3=65;break}r36=HEAP32[r11>>2];r22=HEAP32[r11+4>>2];r37=4;r33=0;r42=2;r43=0;r44=-1;r45=0;do{if(r36==1&r22==0){r46=2352;r47=r39}else if(r36==r42&r22==r43){r46=2336;r47=r39}else if(r36==r37&r22==r33){if((r39|0)!=0){r46=2320;r47=r39;break}HEAP32[r10>>2]=HEAP32[r35>>2];r46=2320;r47=1}else if(r36==r44&r22==r45){r46=2368;r47=r39}else{r46=2304;r47=r39}}while(0);_printf(2272,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r40,HEAP32[r4+8>>2]=r46,r4));STACKTOP=r4;r48=_clGetDeviceInfo(HEAP32[r35>>2],4139,256,r25,0);HEAP32[r7>>2]=r48;if((r48|0)!=0){r3=73;break}_printf(2240,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r40,HEAP32[r4+8>>2]=r25,r4));STACKTOP=r4;HEAP32[r12>>2]=0;r49=_clGetDeviceInfo(HEAP32[r35>>2],4098,4,r26,0);HEAP32[r7>>2]=r49;if((r49|0)!=0){r3=75;break}r45=HEAP32[r12>>2];_printf(2160,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r40,HEAP32[r4+8>>2]=r45,r4));STACKTOP=r4;HEAP32[r13>>2]=0;r50=_clGetDeviceInfo(HEAP32[r35>>2],4100,4,r27,0);HEAP32[r7>>2]=r50;if((r50|0)!=0){r3=77;break}r45=HEAP32[r13>>2];_printf(2112,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r40,HEAP32[r4+8>>2]=r45,r4));STACKTOP=r4;r45=r40+1|0;if(r45>>>0<HEAP32[r9>>2]>>>0){r39=r47;r40=r45}else{r3=79;break}}if(r3==65){_printf(2416,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r41,r4));STACKTOP=r4;_exit(-1)}else if(r3==73){_printf(2416,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r48,r4));STACKTOP=r4;_exit(-1)}else if(r3==75){_printf(2416,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r49,r4));STACKTOP=r4;_exit(-1)}else if(r3==77){_printf(2416,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r50,r4));STACKTOP=r4;_exit(-1)}else if(r3==79){if((r47|0)==0){r38=_puts(56);_exit(-1)}r38=r14|0;HEAP32[r38>>2]=4228;HEAP32[r14+4>>2]=r34;HEAP32[r14+8>>2]=0;r14=_clCreateContext((r34|0)==0?0:r38,1,r10,0,0,r7);HEAP32[3368>>2]=r14;if((HEAP32[r7>>2]|0)!=0){_puts(24);_exit(-1)}r10=_clGetContextInfo(r14,4225,32,r23,r15);HEAP32[r7>>2]=r10;if((r10|0)!=0){_printf(2040,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r10,r4));STACKTOP=r4;_exit(-1)}L121:do{if(HEAP32[r15>>2]>>>0>3){r10=0;while(1){HEAP32[r16>>2]=0;HEAP32[r16+4>>2]=0;r23=r8+(r10<<2)|0;r51=_clGetDeviceInfo(HEAP32[r23>>2],4096,8,r28,0);HEAP32[r7>>2]=r51;if((r51|0)!=0){r3=87;break}r14=HEAP32[r16>>2];r38=HEAP32[r16+4>>2];r34=4;r47=0;r50=2;r49=0;r48=-1;r41=0;if(r14==1&r38==0){r52=2352}else if(r14==r50&r38==r49){r52=2336}else if(r14==r34&r38==r47){r52=2320}else if(r14==r48&r38==r41){r52=2368}else{r52=2304}_printf(2e3,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r10,HEAP32[r4+8>>2]=r52,r4));STACKTOP=r4;r53=_clGetDeviceInfo(HEAP32[r23>>2],4139,256,r29,0);HEAP32[r7>>2]=r53;if((r53|0)!=0){r3=94;break}_printf(1960,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r10,HEAP32[r4+8>>2]=r29,r4));STACKTOP=r4;HEAP32[r17>>2]=0;r54=_clGetDeviceInfo(HEAP32[r23>>2],4098,4,r30,0);HEAP32[r7>>2]=r54;if((r54|0)!=0){r3=96;break}r41=HEAP32[r17>>2];_printf(1904,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r10,HEAP32[r4+8>>2]=r41,r4));STACKTOP=r4;HEAP32[r18>>2]=0;r55=_clGetDeviceInfo(HEAP32[r23>>2],4100,4,r31,0);HEAP32[r7>>2]=r55;if((r55|0)!=0){r3=98;break}r23=HEAP32[r18>>2];_printf(1848,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r10,HEAP32[r4+8>>2]=r23,r4));STACKTOP=r4;r23=r10+1|0;if(r23>>>0<HEAP32[r15>>2]>>>2>>>0){r10=r23}else{break L121}}if(r3==87){_printf(2416,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r51,r4));STACKTOP=r4;_exit(-1)}else if(r3==94){_printf(2416,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r53,r4));STACKTOP=r4;_exit(-1)}else if(r3==96){_printf(2416,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r54,r4));STACKTOP=r4;_exit(-1)}else if(r3==98){_printf(2416,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r55,r4));STACKTOP=r4;_exit(-1)}}}while(0);r55=_clCreateCommandQueue(HEAP32[3368>>2],HEAP32[r6>>2],0,0,r7);HEAP32[3376>>2]=r55;r55=HEAP32[r7>>2];if((r55|0)!=0){_printf(1800,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r55,r4));STACKTOP=r4;_exit(-1)}r55=_clCreateBuffer(HEAP32[3368>>2],4,0,HEAP32[3264>>2]*44&-1,0,r7);HEAP32[3272>>2]=r55;r3=HEAP32[r7>>2];if((r3|0)!=0){_printf(1712,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r3,r4));STACKTOP=r4;_exit(-1)}r3=_clEnqueueWriteBuffer(HEAP32[3376>>2],r55,1,0,HEAP32[3264>>2]*44&-1,HEAP32[3256>>2],0,0,0);HEAP32[r7>>2]=r3;if((r3|0)!=0){_printf(3040,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r3,r4));STACKTOP=r4;_exit(-1)}r3=_clCreateBuffer(HEAP32[3368>>2],4,0,60,0,r7);HEAP32[3400>>2]=r3;r55=HEAP32[r7>>2];if((r55|0)!=0){_printf(1664,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r55,r4));STACKTOP=r4;_exit(-1)}r55=_clEnqueueWriteBuffer(HEAP32[3376>>2],r3,1,0,60,3408,0,0,0);HEAP32[r7>>2]=r55;if((r55|0)!=0){_printf(2968,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r55,r4));STACKTOP=r4;_exit(-1)}_AllocateBuffers();r55=HEAP32[208>>2];r3=_fopen(r55,1184);if((r3|0)==0){_printf(1152,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r55,r4));STACKTOP=r4;_exit(-1)}if((_fseek(r3,0,2)|0)!=0){_printf(1120,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r55,r4));STACKTOP=r4;_exit(-1)}r54=_ftell(r3);if((r54|0)==0){_printf(1080,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r55,r4));STACKTOP=r4;_exit(-1)}_rewind(r3);r53=_malloc(r54+1|0);if((r53|0)==0){_printf(1032,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r55,r4));STACKTOP=r4;_exit(-1)}_printf(992,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r55,HEAP32[r4+8>>2]=r54,r4));STACKTOP=r4;r51=_fread(r53,1,r54,r3);if((r51|0)!=(r54|0)){_printf(952,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r55,HEAP32[r4+8>>2]=r51,r4));STACKTOP=r4;_exit(-1)}HEAP8[r53+r54|0]=0;_fclose(r3);HEAP32[r19>>2]=r53;r53=_clCreateProgramWithSource(HEAP32[3368>>2],1,r19,0,r7);HEAP32[3296>>2]=r53;r19=HEAP32[r7>>2];if((r19|0)!=0){_printf(1616,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r19,r4));STACKTOP=r4;_exit(-1)}r19=_clBuildProgram(r53,1,r6,1568,0,0);HEAP32[r7>>2]=r19;if((r19|0)==0){r53=_clCreateKernel(HEAP32[3296>>2],1392,r7);HEAP32[3344>>2]=r53;r3=HEAP32[r7>>2];if((r3|0)!=0){_printf(1352,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r3,r4));STACKTOP=r4;_exit(-1)}HEAP32[r21>>2]=0;r3=_clGetKernelWorkGroupInfo(r53,HEAP32[r6>>2],4528,4,r32,0);HEAP32[r7>>2]=r3;if((r3|0)==0){r32=HEAP32[r21>>2];HEAP32[8>>2]=r32;_printf(1208,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r32,r4));STACKTOP=r4;_InitGlut(r1,r2,2576);_glutMainLoop();STACKTOP=r5;return 0}else{_printf(1256,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r3,r4));STACKTOP=r4;_exit(-1)}}else{r3=HEAP32[r6>>2];_printf(1528,(r4=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r4>>2]=r19,HEAP32[r4+8>>2]=r3,r4));STACKTOP=r4;r3=_clGetProgramBuildInfo(HEAP32[3296>>2],HEAP32[r6>>2],4483,0,0,r20);HEAP32[r7>>2]=r3;if((r3|0)!=0){_printf(1480,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r3,r4));STACKTOP=r4;_exit(-1)}r3=HEAP32[r20>>2];r19=_malloc(r3+1|0);r5=_clGetProgramBuildInfo(HEAP32[3296>>2],HEAP32[r6>>2],4483,r3,r19,0);HEAP32[r7>>2]=r5;if((r5|0)==0){HEAP8[r19+HEAP32[r20>>2]|0]=0;_printf(1408,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r19,r4));STACKTOP=r4;_exit(-1)}else{_printf(1440,(r4=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r4>>2]=r5,r4));STACKTOP=r4;_exit(-1)}}}}function _WallClockTime(){return(_emscripten_get_now()|0)/1e3}function _UpdateCamera(){var r1,r2,r3,r4,r5,r6,r7,r8,r9;r1=HEAPF32[3420>>2]-HEAPF32[3408>>2];r2=HEAPF32[3424>>2]-HEAPF32[3412>>2];r3=HEAPF32[3428>>2]-HEAPF32[3416>>2];r4=1/Math.sqrt(r3*r3+(r1*r1+r2*r2));r5=r1*r4;HEAPF32[3432>>2]=r5;r1=r4*r2;HEAPF32[3436>>2]=r1;r2=r4*r3;HEAPF32[3440>>2]=r2;r3=0;r4=r3-r2;r6=0-0;r7=r5-r3;r3=1/Math.sqrt(r7*r7+(r4*r4+r6*r6));r8=(HEAP32[16>>2]|0)*.7853981852531433/(HEAP32[216>>2]|0);r9=r8*r4*r3;HEAPF32[3444>>2]=r9;r4=r8*r3*r6;HEAPF32[3448>>2]=r4;r6=r8*r3*r7;HEAPF32[3452>>2]=r6;r7=r4*r2-r6*r1;r3=r6*r5-r9*r2;r2=r9*r1-r4*r5;r5=1/Math.sqrt(r2*r2+(r7*r7+r3*r3));HEAPF32[3456>>2]=r7*r5*.7853981852531433;HEAPF32[3460>>2]=r5*r3*.7853981852531433;HEAPF32[3464>>2]=r5*r2*.7853981852531433;return}function _idleFunc(){_UpdateRendering();_glutPostRedisplay();return}function _displayFunc(){_glClear(16384);return}function _reshapeFunc(r1,r2){HEAP32[16>>2]=r1;HEAP32[216>>2]=r2;_glViewport(0,0,r1,r2);_glLoadIdentity();_glOrtho(0,(HEAP32[16>>2]|0)-1,0,(HEAP32[216>>2]|0)-1,-1,1);_ReInit(1);_glutPostRedisplay();return}function _specialFunc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102;r4=0;switch(r1|0){case 101:{r5=HEAPF32[3420>>2];r6=HEAPF32[3424>>2];r7=HEAPF32[3428>>2];r8=HEAPF32[3408>>2];r9=r5-r8;r10=HEAPF32[3412>>2];r11=r6-r10;r12=HEAPF32[3416>>2];r13=r7-r12;r14=r11;r15=r14*.9993908270190958;r16=r13;r17=r16*-.03489949670250097;r18=r15+r17;r19=r18;r20=-r19;r21=r20;r22=r21*-.03489949670250097;r23=r16*.9993908270190958;r24=r23+r22;r25=r24;r26=r8+r9;r27=r10+r19;r28=r12+r25;HEAPF32[3420>>2]=r26;HEAPF32[3424>>2]=r27;HEAPF32[3428>>2]=r28;_ReInit(0);return;break};case 103:{r29=HEAPF32[3420>>2];r30=HEAPF32[3424>>2];r31=HEAPF32[3428>>2];r32=HEAPF32[3408>>2];r33=r29-r32;r34=HEAPF32[3412>>2];r35=r30-r34;r36=HEAPF32[3416>>2];r37=r31-r36;r38=r35;r39=r38*.9993908270190958;r40=r37;r41=r40*.03489949670250097;r42=r39+r41;r43=r42;r44=-r43;r45=r44;r46=r45*.03489949670250097;r47=r40*.9993908270190958;r48=r47+r46;r49=r48;r50=r32+r33;r51=r34+r43;r52=r36+r49;HEAPF32[3420>>2]=r50;HEAPF32[3424>>2]=r51;HEAPF32[3428>>2]=r52;_ReInit(0);return;break};case 100:{r53=HEAPF32[3420>>2];r54=HEAPF32[3424>>2];r55=HEAPF32[3428>>2];r56=HEAPF32[3408>>2];r57=r53-r56;r58=HEAPF32[3412>>2];r59=r54-r58;r60=HEAPF32[3416>>2];r61=r55-r60;r62=r57;r63=r62*.9993908270190958;r64=r61;r65=r64*-.03489949670250097;r66=r63-r65;r67=r66;r68=r67;r69=r68*-.03489949670250097;r70=r64*.9993908270190958;r71=r70+r69;r72=r71;r73=r56+r67;r74=r58+r59;r75=r60+r72;HEAPF32[3420>>2]=r73;HEAPF32[3424>>2]=r74;HEAPF32[3428>>2]=r75;_ReInit(0);return;break};case 102:{r76=HEAPF32[3420>>2];r77=HEAPF32[3424>>2];r78=HEAPF32[3428>>2];r79=HEAPF32[3408>>2];r80=r76-r79;r81=HEAPF32[3412>>2];r82=r77-r81;r83=HEAPF32[3416>>2];r84=r78-r83;r85=r80;r86=r85*.9993908270190958;r87=r84;r88=r87*.03489949670250097;r89=r86-r88;r90=r89;r91=r90;r92=r91*.03489949670250097;r93=r87*.9993908270190958;r94=r93+r92;r95=r94;r96=r79+r90;r97=r81+r82;r98=r83+r95;HEAPF32[3420>>2]=r96;HEAPF32[3424>>2]=r97;HEAPF32[3428>>2]=r98;_ReInit(0);return;break};case 104:{r99=HEAPF32[3424>>2];r100=r99+10;HEAPF32[3424>>2]=r100;_ReInit(0);return;break};case 105:{r101=HEAPF32[3424>>2];r102=r101-10;HEAPF32[3424>>2]=r102;_ReInit(0);return;break};default:{return}}}function _InitGlut(r1,r2,r3){var r4,r5;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;HEAP32[r5>>2]=r1;_glutInitWindowSize(HEAP32[16>>2],HEAP32[216>>2]);_glutInitWindowPosition(0,0);_glutInitDisplayMode(2);_glutInit(r5,r2);_glutCreateWindow(r3);_glutReshapeFunc(2);_glutKeyboardFunc(6);_glutSpecialFunc(8);_glutDisplayFunc(10);_glutIdleFunc(4);_glViewport(0,0,HEAP32[16>>2],HEAP32[216>>2]);_glLoadIdentity();_glOrtho(0,(HEAP32[16>>2]|0)-1,0,(HEAP32[216>>2]|0)-1,-1,1);STACKTOP=r4;return}function _AllocateBuffers(){var r1,r2,r3,r4,r5,r6,r7,r8;r1=0;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=Math.imul(HEAP32[216>>2],HEAP32[16>>2])|0;r5=_malloc(r4*12&-1);HEAP32[3384>>2]=r5;r5=r4<<2;r6=_malloc(r4<<3);HEAP32[3280>>2]=r6;r6=r4<<1;if((r6|0)>0){r7=0;while(1){r8=_rand();HEAP32[HEAP32[3280>>2]+(r7<<2)>>2]=r8;r8=HEAP32[3280>>2]+(r7<<2)|0;if(HEAP32[r8>>2]>>>0<2){HEAP32[r8>>2]=2}r8=r7+1|0;if((r8|0)<(r6|0)){r7=r8}else{break}}}r7=_malloc(r5);HEAP32[3304>>2]=r7;L217:do{if((r4|0)>0){r5=0;r6=r7;while(1){HEAP32[r6+(r5<<2)>>2]=r5;r8=r5+1|0;if((r8|0)>=(r4|0)){break L217}r5=r8;r6=HEAP32[3304>>2]}}}while(0);r4=Math.imul(HEAP32[16>>2]*12&-1,HEAP32[216>>2])|0;r7=_clCreateBuffer(HEAP32[3368>>2],1,0,r4,0,r3);HEAP32[3392>>2]=r7;r7=HEAP32[r3>>2];if((r7|0)!=0){_printf(840,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r7,r1));STACKTOP=r1;_exit(-1)}r7=Math.imul(HEAP32[16>>2]<<2,HEAP32[216>>2])|0;r4=_clCreateBuffer(HEAP32[3368>>2],2,0,r7,0,r3);HEAP32[3312>>2]=r4;r4=HEAP32[r3>>2];if((r4|0)!=0){_printf(792,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r4,r1));STACKTOP=r1;_exit(-1)}r4=Math.imul(HEAP32[16>>2]<<3,HEAP32[216>>2])|0;r7=_clCreateBuffer(HEAP32[3368>>2],1,0,r4,0,r3);HEAP32[3288>>2]=r7;r6=HEAP32[r3>>2];if((r6|0)!=0){_printf(704,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r6,r1));STACKTOP=r1;_exit(-1)}r6=_clEnqueueWriteBuffer(HEAP32[3376>>2],r7,1,0,r4,HEAP32[3280>>2],0,0,0);HEAP32[r3>>2]=r6;if((r6|0)==0){STACKTOP=r2;return}else{_printf(656,(r1=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r1>>2]=r6,r1));STACKTOP=r1;_exit(-1)}}function _ReadScene(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10;r2=0;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;_fprintf(HEAP32[_stderr>>2],2520,(r3=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r3>>2]=r1,r3));STACKTOP=r3;r6=_fopen(r1,3016);if((r6|0)==0){_fprintf(HEAP32[_stderr>>2],2384,(r3=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r3>>2]=r1,r3));STACKTOP=r3;_exit(-1)}r1=_fscanf(r6,2080,(r3=STACKTOP,STACKTOP=STACKTOP+48|0,HEAP32[r3>>2]=3408,HEAP32[r3+8>>2]=3412,HEAP32[r3+16>>2]=3416,HEAP32[r3+24>>2]=3420,HEAP32[r3+32>>2]=3424,HEAP32[r3+40>>2]=3428,r3));STACKTOP=r3;if((r1|0)!=6){_fprintf(HEAP32[_stderr>>2],1576,(r3=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r3>>2]=r1,r3));STACKTOP=r3;_exit(-1)}r1=_fscanf(r6,1192,(r3=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r3>>2]=3264,r3));STACKTOP=r3;r7=HEAP32[_stderr>>2];if((r1|0)!=1){_fprintf(r7,752,(r3=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r3>>2]=r1,r3));STACKTOP=r3;_exit(-1)}_fprintf(r7,416,(r3=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[r3>>2]=HEAP32[3264>>2],r3));STACKTOP=r3;r7=HEAP32[3264>>2];r1=_malloc(r7*44&-1);HEAP32[3256>>2]=r1;r1=0;r8=r7;while(1){if(r1>>>0>=r8>>>0){r2=188;break}r7=HEAP32[3256>>2];r9=_fscanf(r6,328,(r3=STACKTOP,STACKTOP=STACKTOP+88|0,HEAP32[r3>>2]=r7+(r1*44&-1),HEAP32[r3+8>>2]=r7+(r1*44&-1)+4,HEAP32[r3+16>>2]=r7+(r1*44&-1)+8,HEAP32[r3+24>>2]=r7+(r1*44&-1)+12,HEAP32[r3+32>>2]=r7+(r1*44&-1)+16,HEAP32[r3+40>>2]=r7+(r1*44&-1)+20,HEAP32[r3+48>>2]=r7+(r1*44&-1)+24,HEAP32[r3+56>>2]=r7+(r1*44&-1)+28,HEAP32[r3+64>>2]=r7+(r1*44&-1)+32,HEAP32[r3+72>>2]=r7+(r1*44&-1)+36,HEAP32[r3+80>>2]=r5,r3));STACKTOP=r3;r10=HEAP32[r5>>2];if((r10|0)==0){HEAP32[r7+(r1*44&-1)+40>>2]=0}else if((r10|0)==1){HEAP32[r7+(r1*44&-1)+40>>2]=1}else if((r10|0)==2){HEAP32[r7+(r1*44&-1)+40>>2]=2}else{r2=184;break}if((r9|0)!=11){r2=187;break}r1=r1+1|0;r8=HEAP32[3264>>2]}if(r2==184){_fprintf(HEAP32[_stderr>>2],224,(r3=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r3>>2]=r1,HEAP32[r3+8>>2]=r10,r3));STACKTOP=r3;_exit(-1)}else if(r2==187){_fprintf(HEAP32[_stderr>>2],3088,(r3=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[r3>>2]=r1,HEAP32[r3+8>>2]=r9,r3));STACKTOP=r3;_exit(-1)}else if(r2==188){_fclose(r6);STACKTOP=r4;return}}function _keyFunc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162,r163,r164,r165,r166,r167,r168,r169,r170,r171,r172,r173,r174,r175,r176,r177,r178,r179,r180,r181,r182,r183,r184,r185,r186,r187,r188,r189,r190,r191,r192,r193,r194,r195,r196,r197,r198,r199,r200,r201,r202,r203,r204,r205,r206,r207,r208,r209,r210,r211,r212,r213,r214,r215;r4=0;r5=0;r6=STACKTOP;r7=r1&255;switch(r7|0){case 112:{r8=_fopen(3024,2960);r9=(r8|0)==0;if(r9){r10=HEAP32[_stderr>>2];r11=_fwrite(2904,37,1,r10);STACKTOP=r6;return}r12=HEAP32[16>>2];r13=HEAP32[216>>2];r14=_fprintf(r8,2704,(r5=STACKTOP,STACKTOP=STACKTOP+24|0,HEAP32[r5>>2]=r12,HEAP32[r5+8>>2]=r13,HEAP32[r5+16>>2]=255,r5));STACKTOP=r5;r15=HEAP32[216>>2];r16=(r15|0)>0;if(r16){r17=HEAP32[16>>2];r18=r15;r19=r17;while(1){r20=r18-1|0;r21=(r19|0)>0;if(r21){r22=HEAP32[3304>>2];r23=Math.imul(r19,r20)|0;r24=r22+(r23<<2)|0;r25=r24;r26=r25;r27=0;while(1){r28=HEAP8[r26];r29=r28&255;r30=r26+1|0;r31=HEAP8[r30];r32=r31&255;r33=r26+2|0;r34=HEAP8[r33];r35=r34&255;r36=_fprintf(r8,2656,(r5=STACKTOP,STACKTOP=STACKTOP+24|0,HEAP32[r5>>2]=r29,HEAP32[r5+8>>2]=r32,HEAP32[r5+16>>2]=r35,r5));STACKTOP=r5;r37=r27+1|0;r38=r26+4|0;r39=HEAP32[16>>2];r40=(r37|0)<(r39|0);if(r40){r26=r38;r27=r37}else{r41=r39;break}}}else{r41=r19}r42=(r20|0)>0;if(r42){r18=r20;r19=r41}else{break}}}r43=_fclose(r8);STACKTOP=r6;return;break};case 27:{r44=HEAP32[_stderr>>2];r45=_fwrite(2624,6,1,r44);_exit(0);break};case 32:{_ReInit(1);STACKTOP=r6;return;break};case 97:{r46=HEAPF32[3444>>2];r47=HEAPF32[3448>>2];r48=HEAPF32[3452>>2];r49=r46*r46;r50=r47*r47;r51=r49+r50;r52=r48*r48;r53=r51+r52;r54=r53;r55=Math.sqrt(r54);r56=1/r55;r57=r56;r58=r46*r57;r59=r47*r57;r60=r48*r57;r61=r58*-10;r62=r59*-10;r63=r60*-10;r64=HEAPF32[3408>>2];r65=r64+r61;HEAPF32[3408>>2]=r65;r66=HEAPF32[3412>>2];r67=r66+r62;HEAPF32[3412>>2]=r67;r68=HEAPF32[3416>>2];r69=r68+r63;HEAPF32[3416>>2]=r69;r70=HEAPF32[3420>>2];r71=r61+r70;HEAPF32[3420>>2]=r71;r72=HEAPF32[3424>>2];r73=r62+r72;HEAPF32[3424>>2]=r73;r74=HEAPF32[3428>>2];r75=r63+r74;HEAPF32[3428>>2]=r75;_ReInit(0);STACKTOP=r6;return;break};case 100:{r76=HEAPF32[3444>>2];r77=HEAPF32[3448>>2];r78=HEAPF32[3452>>2];r79=r76*r76;r80=r77*r77;r81=r79+r80;r82=r78*r78;r83=r81+r82;r84=r83;r85=Math.sqrt(r84);r86=1/r85;r87=r86;r88=r76*r87;r89=r77*r87;r90=r78*r87;r91=r88*10;r92=r89*10;r93=r90*10;r94=HEAPF32[3408>>2];r95=r94+r91;HEAPF32[3408>>2]=r95;r96=HEAPF32[3412>>2];r97=r96+r92;HEAPF32[3412>>2]=r97;r98=HEAPF32[3416>>2];r99=r98+r93;HEAPF32[3416>>2]=r99;r100=HEAPF32[3420>>2];r101=r91+r100;HEAPF32[3420>>2]=r101;r102=HEAPF32[3424>>2];r103=r92+r102;HEAPF32[3424>>2]=r103;r104=HEAPF32[3428>>2];r105=r93+r104;HEAPF32[3428>>2]=r105;_ReInit(0);STACKTOP=r6;return;break};case 119:{r106=HEAPF32[3432>>2];r107=HEAPF32[3436>>2];r108=HEAPF32[3440>>2];r109=r106*10;r110=r107*10;r111=r108*10;r112=HEAPF32[3408>>2];r113=r109+r112;HEAPF32[3408>>2]=r113;r114=HEAPF32[3412>>2];r115=r110+r114;HEAPF32[3412>>2]=r115;r116=HEAPF32[3416>>2];r117=r111+r116;HEAPF32[3416>>2]=r117;r118=HEAPF32[3420>>2];r119=r109+r118;HEAPF32[3420>>2]=r119;r120=HEAPF32[3424>>2];r121=r110+r120;HEAPF32[3424>>2]=r121;r122=HEAPF32[3428>>2];r123=r111+r122;HEAPF32[3428>>2]=r123;_ReInit(0);STACKTOP=r6;return;break};case 115:{r124=HEAPF32[3432>>2];r125=HEAPF32[3436>>2];r126=HEAPF32[3440>>2];r127=r124*-10;r128=r125*-10;r129=r126*-10;r130=HEAPF32[3408>>2];r131=r127+r130;HEAPF32[3408>>2]=r131;r132=HEAPF32[3412>>2];r133=r128+r132;HEAPF32[3412>>2]=r133;r134=HEAPF32[3416>>2];r135=r129+r134;HEAPF32[3416>>2]=r135;r136=HEAPF32[3420>>2];r137=r127+r136;HEAPF32[3420>>2]=r137;r138=HEAPF32[3424>>2];r139=r128+r138;HEAPF32[3424>>2]=r139;r140=HEAPF32[3428>>2];r141=r129+r140;HEAPF32[3428>>2]=r141;_ReInit(0);STACKTOP=r6;return;break};case 114:{r142=HEAPF32[3412>>2];r143=r142+10;HEAPF32[3412>>2]=r143;r144=HEAPF32[3424>>2];r145=r144+10;HEAPF32[3424>>2]=r145;_ReInit(0);STACKTOP=r6;return;break};case 102:{r146=HEAPF32[3412>>2];r147=r146-10;HEAPF32[3412>>2]=r147;r148=HEAPF32[3424>>2];r149=r148-10;HEAPF32[3424>>2]=r149;_ReInit(0);STACKTOP=r6;return;break};case 43:{r150=HEAP32[3352>>2];r151=r150+1|0;r152=HEAP32[3264>>2];r153=(r151>>>0)%(r152>>>0)&-1;HEAP32[3352>>2]=r153;r154=HEAP32[_stderr>>2];r155=HEAP32[3256>>2];r156=r155+(r153*44&-1)+4|0;r157=HEAPF32[r156>>2];r158=r157;r159=r155+(r153*44&-1)+8|0;r160=HEAPF32[r159>>2];r161=r160;r162=r155+(r153*44&-1)+12|0;r163=HEAPF32[r162>>2];r164=r163;r165=_fprintf(r154,2544,(r5=STACKTOP,STACKTOP=STACKTOP+32|0,HEAP32[r5>>2]=r153,HEAPF64[r5+8>>3]=r158,HEAPF64[r5+16>>3]=r161,HEAPF64[r5+24>>3]=r164,r5));STACKTOP=r5;_ReInitScene();STACKTOP=r6;return;break};case 45:{r166=HEAP32[3352>>2];r167=HEAP32[3264>>2];r168=r166-1|0;r169=r168+r167|0;r170=(r169>>>0)%(r167>>>0)&-1;HEAP32[3352>>2]=r170;r171=HEAP32[_stderr>>2];r172=HEAP32[3256>>2];r173=r172+(r170*44&-1)+4|0;r174=HEAPF32[r173>>2];r175=r174;r176=r172+(r170*44&-1)+8|0;r177=HEAPF32[r176>>2];r178=r177;r179=r172+(r170*44&-1)+12|0;r180=HEAPF32[r179>>2];r181=r180;r182=_fprintf(r171,2544,(r5=STACKTOP,STACKTOP=STACKTOP+32|0,HEAP32[r5>>2]=r170,HEAPF64[r5+8>>3]=r175,HEAPF64[r5+16>>3]=r178,HEAPF64[r5+24>>3]=r181,r5));STACKTOP=r5;_ReInitScene();STACKTOP=r6;return;break};case 52:{r183=HEAP32[3352>>2];r184=HEAP32[3256>>2];r185=r184+(r183*44&-1)+4|0;r186=HEAPF32[r185>>2];r187=r186-5;HEAPF32[r185>>2]=r187;_ReInitScene();STACKTOP=r6;return;break};case 54:{r188=HEAP32[3352>>2];r189=HEAP32[3256>>2];r190=r189+(r188*44&-1)+4|0;r191=HEAPF32[r190>>2];r192=r191+5;HEAPF32[r190>>2]=r192;_ReInitScene();STACKTOP=r6;return;break};case 56:{r193=HEAP32[3352>>2];r194=HEAP32[3256>>2];r195=r194+(r193*44&-1)+12|0;r196=HEAPF32[r195>>2];r197=r196-5;HEAPF32[r195>>2]=r197;_ReInitScene();STACKTOP=r6;return;break};case 50:{r198=HEAP32[3352>>2];r199=HEAP32[3256>>2];r200=r199+(r198*44&-1)+12|0;r201=HEAPF32[r200>>2];r202=r201+5;HEAPF32[r200>>2]=r202;_ReInitScene();STACKTOP=r6;return;break};case 57:{r203=HEAP32[3352>>2];r204=HEAP32[3256>>2];r205=r204+(r203*44&-1)+8|0;r206=HEAPF32[r205>>2];r207=r206+5;HEAPF32[r205>>2]=r207;_ReInitScene();STACKTOP=r6;return;break};case 51:{r208=HEAP32[3352>>2];r209=HEAP32[3256>>2];r210=r209+(r208*44&-1)+8|0;r211=HEAPF32[r210>>2];r212=r211-5;HEAPF32[r210>>2]=r212;_ReInitScene();STACKTOP=r6;return;break};case 104:{r213=HEAP32[200>>2];r214=(r213|0)==0;r215=r214&1;HEAP32[200>>2]=r215;STACKTOP=r6;return;break};default:{STACKTOP=r6;return}}}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[3480>>2];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=3520+(r8<<2)|0;r10=3520+(r8+2<<2)|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[3480>>2]=r5&~(1<<r7)}else{if(r12>>>0<HEAP32[3496>>2]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[3488>>2]>>>0){r15=r3;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r16=r13>>>(r9>>>0);r13=r16>>>1&2;r17=r16>>>(r13>>>0);r16=r17>>>1&1;r18=(r10|r12|r9|r13|r16)+(r17>>>(r16>>>0))|0;r16=r18<<1;r17=3520+(r16<<2)|0;r13=3520+(r16+2<<2)|0;r16=HEAP32[r13>>2];r9=r16+8|0;r12=HEAP32[r9>>2];do{if((r17|0)==(r12|0)){HEAP32[3480>>2]=r5&~(1<<r18)}else{if(r12>>>0<HEAP32[3496>>2]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r16|0)){HEAP32[r10>>2]=r17;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r18<<3;r13=r12-r3|0;HEAP32[r16+4>>2]=r3|3;r17=r16;r5=r17+r3|0;HEAP32[r17+(r3|4)>>2]=r13|1;HEAP32[r17+r12>>2]=r13;r12=HEAP32[3488>>2];if((r12|0)!=0){r17=HEAP32[3500>>2];r4=r12>>>3;r12=r4<<1;r6=3520+(r12<<2)|0;r11=HEAP32[3480>>2];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[3480>>2]=r11|r8;r19=r6;r20=3520+(r12+2<<2)|0}else{r4=3520+(r12+2<<2)|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[3496>>2]>>>0){r19=r7;r20=r4;break}_abort()}}while(0);HEAP32[r20>>2]=r17;HEAP32[r19+12>>2]=r17;HEAP32[r17+8>>2]=r19;HEAP32[r17+12>>2]=r6}HEAP32[3488>>2]=r13;HEAP32[3500>>2]=r5;r14=r9;return r14}r12=HEAP32[3484>>2];if((r12|0)==0){r15=r3;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r16=r11>>>(r8>>>0);r11=r16>>>2&4;r18=r16>>>(r11>>>0);r16=r18>>>1&2;r4=r18>>>(r16>>>0);r18=r4>>>1&1;r7=HEAP32[3784+((r8|r12|r11|r16|r18)+(r4>>>(r18>>>0))<<2)>>2];r18=r7;r4=r7;r16=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r18+16>>2];if((r7|0)==0){r11=HEAP32[r18+20>>2];if((r11|0)==0){break}else{r21=r11}}else{r21=r7}r7=(HEAP32[r21+4>>2]&-8)-r3|0;r11=r7>>>0<r16>>>0;r18=r21;r4=r11?r21:r4;r16=r11?r7:r16}r18=r4;r9=HEAP32[3496>>2];if(r18>>>0<r9>>>0){_abort()}r5=r18+r3|0;r13=r5;if(r18>>>0>=r5>>>0){_abort()}r5=HEAP32[r4+24>>2];r6=HEAP32[r4+12>>2];do{if((r6|0)==(r4|0)){r17=r4+20|0;r7=HEAP32[r17>>2];if((r7|0)==0){r11=r4+16|0;r12=HEAP32[r11>>2];if((r12|0)==0){r22=0;break}else{r23=r12;r24=r11}}else{r23=r7;r24=r17}while(1){r17=r23+20|0;r7=HEAP32[r17>>2];if((r7|0)!=0){r23=r7;r24=r17;continue}r17=r23+16|0;r7=HEAP32[r17>>2];if((r7|0)==0){break}else{r23=r7;r24=r17}}if(r24>>>0<r9>>>0){_abort()}else{HEAP32[r24>>2]=0;r22=r23;break}}else{r17=HEAP32[r4+8>>2];if(r17>>>0<r9>>>0){_abort()}r7=r17+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r11=r6+8|0;if((HEAP32[r11>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r11>>2]=r17;r22=r6;break}else{_abort()}}}while(0);L387:do{if((r5|0)!=0){r6=r4+28|0;r9=3784+(HEAP32[r6>>2]<<2)|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r22;if((r22|0)!=0){break}HEAP32[3484>>2]=HEAP32[3484>>2]&~(1<<HEAP32[r6>>2]);break L387}else{if(r5>>>0<HEAP32[3496>>2]>>>0){_abort()}r17=r5+16|0;if((HEAP32[r17>>2]|0)==(r4|0)){HEAP32[r17>>2]=r22}else{HEAP32[r5+20>>2]=r22}if((r22|0)==0){break L387}}}while(0);if(r22>>>0<HEAP32[3496>>2]>>>0){_abort()}HEAP32[r22+24>>2]=r5;r6=HEAP32[r4+16>>2];do{if((r6|0)!=0){if(r6>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r22+16>>2]=r6;HEAP32[r6+24>>2]=r22;break}}}while(0);r6=HEAP32[r4+20>>2];if((r6|0)==0){break}if(r6>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r22+20>>2]=r6;HEAP32[r6+24>>2]=r22;break}}}while(0);if(r16>>>0<16){r5=r16+r3|0;HEAP32[r4+4>>2]=r5|3;r6=r18+(r5+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r4+4>>2]=r3|3;HEAP32[r18+(r3|4)>>2]=r16|1;HEAP32[r18+(r16+r3)>>2]=r16;r6=HEAP32[3488>>2];if((r6|0)!=0){r5=HEAP32[3500>>2];r9=r6>>>3;r6=r9<<1;r17=3520+(r6<<2)|0;r11=HEAP32[3480>>2];r7=1<<r9;do{if((r11&r7|0)==0){HEAP32[3480>>2]=r11|r7;r25=r17;r26=3520+(r6+2<<2)|0}else{r9=3520+(r6+2<<2)|0;r12=HEAP32[r9>>2];if(r12>>>0>=HEAP32[3496>>2]>>>0){r25=r12;r26=r9;break}_abort()}}while(0);HEAP32[r26>>2]=r5;HEAP32[r25+12>>2]=r5;HEAP32[r5+8>>2]=r25;HEAP32[r5+12>>2]=r17}HEAP32[3488>>2]=r16;HEAP32[3500>>2]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1;break}r6=r1+11|0;r7=r6&-8;r11=HEAP32[3484>>2];if((r11|0)==0){r15=r7;break}r18=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r27=0}else{if(r7>>>0>16777215){r27=31;break}r6=(r9+1048320|0)>>>16&8;r12=r9<<r6;r8=(r12+520192|0)>>>16&4;r10=r12<<r8;r12=(r10+245760|0)>>>16&2;r28=14-(r8|r6|r12)+(r10<<r12>>>15)|0;r27=r7>>>((r28+7|0)>>>0)&1|r28<<1}}while(0);r9=HEAP32[3784+(r27<<2)>>2];L435:do{if((r9|0)==0){r29=0;r30=r18;r31=0}else{if((r27|0)==31){r32=0}else{r32=25-(r27>>>1)|0}r4=0;r13=r18;r16=r9;r17=r7<<r32;r5=0;while(1){r28=HEAP32[r16+4>>2]&-8;r12=r28-r7|0;if(r12>>>0<r13>>>0){if((r28|0)==(r7|0)){r29=r16;r30=r12;r31=r16;break L435}else{r33=r16;r34=r12}}else{r33=r4;r34=r13}r12=HEAP32[r16+20>>2];r28=HEAP32[r16+16+(r17>>>31<<2)>>2];r10=(r12|0)==0|(r12|0)==(r28|0)?r5:r12;if((r28|0)==0){r29=r33;r30=r34;r31=r10;break}else{r4=r33;r13=r34;r16=r28;r17=r17<<1;r5=r10}}}}while(0);if((r31|0)==0&(r29|0)==0){r9=2<<r27;r18=r11&(r9|-r9);if((r18|0)==0){r15=r7;break}r9=(r18&-r18)-1|0;r18=r9>>>12&16;r5=r9>>>(r18>>>0);r9=r5>>>5&8;r17=r5>>>(r9>>>0);r5=r17>>>2&4;r16=r17>>>(r5>>>0);r17=r16>>>1&2;r13=r16>>>(r17>>>0);r16=r13>>>1&1;r35=HEAP32[3784+((r9|r18|r5|r17|r16)+(r13>>>(r16>>>0))<<2)>>2]}else{r35=r31}if((r35|0)==0){r36=r30;r37=r29}else{r16=r35;r13=r30;r17=r29;while(1){r5=(HEAP32[r16+4>>2]&-8)-r7|0;r18=r5>>>0<r13>>>0;r9=r18?r5:r13;r5=r18?r16:r17;r18=HEAP32[r16+16>>2];if((r18|0)!=0){r16=r18;r13=r9;r17=r5;continue}r18=HEAP32[r16+20>>2];if((r18|0)==0){r36=r9;r37=r5;break}else{r16=r18;r13=r9;r17=r5}}}if((r37|0)==0){r15=r7;break}if(r36>>>0>=(HEAP32[3488>>2]-r7|0)>>>0){r15=r7;break}r17=r37;r13=HEAP32[3496>>2];if(r17>>>0<r13>>>0){_abort()}r16=r17+r7|0;r11=r16;if(r17>>>0>=r16>>>0){_abort()}r5=HEAP32[r37+24>>2];r9=HEAP32[r37+12>>2];do{if((r9|0)==(r37|0)){r18=r37+20|0;r4=HEAP32[r18>>2];if((r4|0)==0){r10=r37+16|0;r28=HEAP32[r10>>2];if((r28|0)==0){r38=0;break}else{r39=r28;r40=r10}}else{r39=r4;r40=r18}while(1){r18=r39+20|0;r4=HEAP32[r18>>2];if((r4|0)!=0){r39=r4;r40=r18;continue}r18=r39+16|0;r4=HEAP32[r18>>2];if((r4|0)==0){break}else{r39=r4;r40=r18}}if(r40>>>0<r13>>>0){_abort()}else{HEAP32[r40>>2]=0;r38=r39;break}}else{r18=HEAP32[r37+8>>2];if(r18>>>0<r13>>>0){_abort()}r4=r18+12|0;if((HEAP32[r4>>2]|0)!=(r37|0)){_abort()}r10=r9+8|0;if((HEAP32[r10>>2]|0)==(r37|0)){HEAP32[r4>>2]=r9;HEAP32[r10>>2]=r18;r38=r9;break}else{_abort()}}}while(0);L485:do{if((r5|0)!=0){r9=r37+28|0;r13=3784+(HEAP32[r9>>2]<<2)|0;do{if((r37|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r38;if((r38|0)!=0){break}HEAP32[3484>>2]=HEAP32[3484>>2]&~(1<<HEAP32[r9>>2]);break L485}else{if(r5>>>0<HEAP32[3496>>2]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r37|0)){HEAP32[r18>>2]=r38}else{HEAP32[r5+20>>2]=r38}if((r38|0)==0){break L485}}}while(0);if(r38>>>0<HEAP32[3496>>2]>>>0){_abort()}HEAP32[r38+24>>2]=r5;r9=HEAP32[r37+16>>2];do{if((r9|0)!=0){if(r9>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r38+16>>2]=r9;HEAP32[r9+24>>2]=r38;break}}}while(0);r9=HEAP32[r37+20>>2];if((r9|0)==0){break}if(r9>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r38+20>>2]=r9;HEAP32[r9+24>>2]=r38;break}}}while(0);do{if(r36>>>0<16){r5=r36+r7|0;HEAP32[r37+4>>2]=r5|3;r9=r17+(r5+4)|0;HEAP32[r9>>2]=HEAP32[r9>>2]|1}else{HEAP32[r37+4>>2]=r7|3;HEAP32[r17+(r7|4)>>2]=r36|1;HEAP32[r17+(r36+r7)>>2]=r36;r9=r36>>>3;if(r36>>>0<256){r5=r9<<1;r13=3520+(r5<<2)|0;r18=HEAP32[3480>>2];r10=1<<r9;do{if((r18&r10|0)==0){HEAP32[3480>>2]=r18|r10;r41=r13;r42=3520+(r5+2<<2)|0}else{r9=3520+(r5+2<<2)|0;r4=HEAP32[r9>>2];if(r4>>>0>=HEAP32[3496>>2]>>>0){r41=r4;r42=r9;break}_abort()}}while(0);HEAP32[r42>>2]=r11;HEAP32[r41+12>>2]=r11;HEAP32[r17+(r7+8)>>2]=r41;HEAP32[r17+(r7+12)>>2]=r13;break}r5=r16;r10=r36>>>8;do{if((r10|0)==0){r43=0}else{if(r36>>>0>16777215){r43=31;break}r18=(r10+1048320|0)>>>16&8;r9=r10<<r18;r4=(r9+520192|0)>>>16&4;r28=r9<<r4;r9=(r28+245760|0)>>>16&2;r12=14-(r4|r18|r9)+(r28<<r9>>>15)|0;r43=r36>>>((r12+7|0)>>>0)&1|r12<<1}}while(0);r10=3784+(r43<<2)|0;HEAP32[r17+(r7+28)>>2]=r43;HEAP32[r17+(r7+20)>>2]=0;HEAP32[r17+(r7+16)>>2]=0;r13=HEAP32[3484>>2];r12=1<<r43;if((r13&r12|0)==0){HEAP32[3484>>2]=r13|r12;HEAP32[r10>>2]=r5;HEAP32[r17+(r7+24)>>2]=r10;HEAP32[r17+(r7+12)>>2]=r5;HEAP32[r17+(r7+8)>>2]=r5;break}if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r12=r36<<r44;r13=HEAP32[r10>>2];while(1){if((HEAP32[r13+4>>2]&-8|0)==(r36|0)){break}r45=r13+16+(r12>>>31<<2)|0;r10=HEAP32[r45>>2];if((r10|0)==0){r2=386;break}else{r12=r12<<1;r13=r10}}if(r2==386){if(r45>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r45>>2]=r5;HEAP32[r17+(r7+24)>>2]=r13;HEAP32[r17+(r7+12)>>2]=r5;HEAP32[r17+(r7+8)>>2]=r5;break}}r12=r13+8|0;r10=HEAP32[r12>>2];r9=HEAP32[3496>>2];if(r13>>>0<r9>>>0){_abort()}if(r10>>>0<r9>>>0){_abort()}else{HEAP32[r10+12>>2]=r5;HEAP32[r12>>2]=r5;HEAP32[r17+(r7+8)>>2]=r10;HEAP32[r17+(r7+12)>>2]=r13;HEAP32[r17+(r7+24)>>2]=0;break}}}while(0);r17=r37+8|0;if((r17|0)==0){r15=r7;break}else{r14=r17}return r14}}while(0);r37=HEAP32[3488>>2];if(r15>>>0<=r37>>>0){r45=r37-r15|0;r36=HEAP32[3500>>2];if(r45>>>0>15){r44=r36;HEAP32[3500>>2]=r44+r15;HEAP32[3488>>2]=r45;HEAP32[r44+(r15+4)>>2]=r45|1;HEAP32[r44+r37>>2]=r45;HEAP32[r36+4>>2]=r15|3}else{HEAP32[3488>>2]=0;HEAP32[3500>>2]=0;HEAP32[r36+4>>2]=r37|3;r45=r36+(r37+4)|0;HEAP32[r45>>2]=HEAP32[r45>>2]|1}r14=r36+8|0;return r14}r36=HEAP32[3492>>2];if(r15>>>0<r36>>>0){r45=r36-r15|0;HEAP32[3492>>2]=r45;r36=HEAP32[3504>>2];r37=r36;HEAP32[3504>>2]=r37+r15;HEAP32[r37+(r15+4)>>2]=r45|1;HEAP32[r36+4>>2]=r15|3;r14=r36+8|0;return r14}do{if((HEAP32[3320>>2]|0)==0){r36=_sysconf(8);if((r36-1&r36|0)==0){HEAP32[3328>>2]=r36;HEAP32[3324>>2]=r36;HEAP32[3332>>2]=-1;HEAP32[3336>>2]=-1;HEAP32[3340>>2]=0;HEAP32[3924>>2]=0;r36=_time(0)&-16^1431655768;HEAP32[3320>>2]=r36;break}else{_abort()}}}while(0);r36=r15+48|0;r45=HEAP32[3328>>2];r37=r15+47|0;r44=r45+r37|0;r43=-r45|0;r45=r44&r43;if(r45>>>0<=r15>>>0){r14=0;return r14}r41=HEAP32[3920>>2];do{if((r41|0)!=0){r42=HEAP32[3912>>2];r38=r42+r45|0;if(r38>>>0<=r42>>>0|r38>>>0>r41>>>0){r14=0}else{break}return r14}}while(0);L577:do{if((HEAP32[3924>>2]&4|0)==0){r41=HEAP32[3504>>2];L579:do{if((r41|0)==0){r2=416}else{r38=r41;r42=3928;while(1){r46=r42|0;r39=HEAP32[r46>>2];if(r39>>>0<=r38>>>0){r47=r42+4|0;if((r39+HEAP32[r47>>2]|0)>>>0>r38>>>0){break}}r39=HEAP32[r42+8>>2];if((r39|0)==0){r2=416;break L579}else{r42=r39}}if((r42|0)==0){r2=416;break}r38=r44-HEAP32[3492>>2]&r43;if(r38>>>0>=2147483647){r48=0;break}r13=_sbrk(r38);r5=(r13|0)==(HEAP32[r46>>2]+HEAP32[r47>>2]|0);r49=r5?r13:-1;r50=r5?r38:0;r51=r13;r52=r38;r2=425}}while(0);do{if(r2==416){r41=_sbrk(0);if((r41|0)==-1){r48=0;break}r7=r41;r38=HEAP32[3324>>2];r13=r38-1|0;if((r13&r7|0)==0){r53=r45}else{r53=r45-r7+(r13+r7&-r38)|0}r38=HEAP32[3912>>2];r7=r38+r53|0;if(!(r53>>>0>r15>>>0&r53>>>0<2147483647)){r48=0;break}r13=HEAP32[3920>>2];if((r13|0)!=0){if(r7>>>0<=r38>>>0|r7>>>0>r13>>>0){r48=0;break}}r13=_sbrk(r53);r7=(r13|0)==(r41|0);r49=r7?r41:-1;r50=r7?r53:0;r51=r13;r52=r53;r2=425}}while(0);L599:do{if(r2==425){r13=-r52|0;if((r49|0)!=-1){r54=r50;r55=r49;r2=436;break L577}do{if((r51|0)!=-1&r52>>>0<2147483647&r52>>>0<r36>>>0){r7=HEAP32[3328>>2];r41=r37-r52+r7&-r7;if(r41>>>0>=2147483647){r56=r52;break}if((_sbrk(r41)|0)==-1){_sbrk(r13);r48=r50;break L599}else{r56=r41+r52|0;break}}else{r56=r52}}while(0);if((r51|0)==-1){r48=r50}else{r54=r56;r55=r51;r2=436;break L577}}}while(0);HEAP32[3924>>2]=HEAP32[3924>>2]|4;r57=r48;r2=433}else{r57=0;r2=433}}while(0);do{if(r2==433){if(r45>>>0>=2147483647){break}r48=_sbrk(r45);r51=_sbrk(0);if(!((r51|0)!=-1&(r48|0)!=-1&r48>>>0<r51>>>0)){break}r56=r51-r48|0;r51=r56>>>0>(r15+40|0)>>>0;r50=r51?r48:-1;if((r50|0)!=-1){r54=r51?r56:r57;r55=r50;r2=436}}}while(0);do{if(r2==436){r57=HEAP32[3912>>2]+r54|0;HEAP32[3912>>2]=r57;if(r57>>>0>HEAP32[3916>>2]>>>0){HEAP32[3916>>2]=r57}r57=HEAP32[3504>>2];L619:do{if((r57|0)==0){r45=HEAP32[3496>>2];if((r45|0)==0|r55>>>0<r45>>>0){HEAP32[3496>>2]=r55}HEAP32[3928>>2]=r55;HEAP32[3932>>2]=r54;HEAP32[3940>>2]=0;HEAP32[3516>>2]=HEAP32[3320>>2];HEAP32[3512>>2]=-1;r45=0;while(1){r50=r45<<1;r56=3520+(r50<<2)|0;HEAP32[3520+(r50+3<<2)>>2]=r56;HEAP32[3520+(r50+2<<2)>>2]=r56;r56=r45+1|0;if(r56>>>0<32){r45=r56}else{break}}r45=r55+8|0;if((r45&7|0)==0){r58=0}else{r58=-r45&7}r45=r54-40-r58|0;HEAP32[3504>>2]=r55+r58;HEAP32[3492>>2]=r45;HEAP32[r55+(r58+4)>>2]=r45|1;HEAP32[r55+(r54-36)>>2]=40;HEAP32[3508>>2]=HEAP32[3336>>2]}else{r45=3928;while(1){r59=HEAP32[r45>>2];r60=r45+4|0;r61=HEAP32[r60>>2];if((r55|0)==(r59+r61|0)){r2=448;break}r56=HEAP32[r45+8>>2];if((r56|0)==0){break}else{r45=r56}}do{if(r2==448){if((HEAP32[r45+12>>2]&8|0)!=0){break}r56=r57;if(!(r56>>>0>=r59>>>0&r56>>>0<r55>>>0)){break}HEAP32[r60>>2]=r61+r54;r56=HEAP32[3504>>2];r50=HEAP32[3492>>2]+r54|0;r51=r56;r48=r56+8|0;if((r48&7|0)==0){r62=0}else{r62=-r48&7}r48=r50-r62|0;HEAP32[3504>>2]=r51+r62;HEAP32[3492>>2]=r48;HEAP32[r51+(r62+4)>>2]=r48|1;HEAP32[r51+(r50+4)>>2]=40;HEAP32[3508>>2]=HEAP32[3336>>2];break L619}}while(0);if(r55>>>0<HEAP32[3496>>2]>>>0){HEAP32[3496>>2]=r55}r45=r55+r54|0;r50=3928;while(1){r63=r50|0;if((HEAP32[r63>>2]|0)==(r45|0)){r2=458;break}r51=HEAP32[r50+8>>2];if((r51|0)==0){break}else{r50=r51}}do{if(r2==458){if((HEAP32[r50+12>>2]&8|0)!=0){break}HEAP32[r63>>2]=r55;r45=r50+4|0;HEAP32[r45>>2]=HEAP32[r45>>2]+r54;r45=r55+8|0;if((r45&7|0)==0){r64=0}else{r64=-r45&7}r45=r55+(r54+8)|0;if((r45&7|0)==0){r65=0}else{r65=-r45&7}r45=r55+(r65+r54)|0;r51=r45;r48=r64+r15|0;r56=r55+r48|0;r52=r56;r37=r45-(r55+r64)-r15|0;HEAP32[r55+(r64+4)>>2]=r15|3;do{if((r51|0)==(HEAP32[3504>>2]|0)){r36=HEAP32[3492>>2]+r37|0;HEAP32[3492>>2]=r36;HEAP32[3504>>2]=r52;HEAP32[r55+(r48+4)>>2]=r36|1}else{if((r51|0)==(HEAP32[3500>>2]|0)){r36=HEAP32[3488>>2]+r37|0;HEAP32[3488>>2]=r36;HEAP32[3500>>2]=r52;HEAP32[r55+(r48+4)>>2]=r36|1;HEAP32[r55+(r36+r48)>>2]=r36;break}r36=r54+4|0;r49=HEAP32[r55+(r36+r65)>>2];if((r49&3|0)==1){r53=r49&-8;r47=r49>>>3;L664:do{if(r49>>>0<256){r46=HEAP32[r55+((r65|8)+r54)>>2];r43=HEAP32[r55+(r54+12+r65)>>2];r44=3520+(r47<<1<<2)|0;do{if((r46|0)!=(r44|0)){if(r46>>>0<HEAP32[3496>>2]>>>0){_abort()}if((HEAP32[r46+12>>2]|0)==(r51|0)){break}_abort()}}while(0);if((r43|0)==(r46|0)){HEAP32[3480>>2]=HEAP32[3480>>2]&~(1<<r47);break}do{if((r43|0)==(r44|0)){r66=r43+8|0}else{if(r43>>>0<HEAP32[3496>>2]>>>0){_abort()}r13=r43+8|0;if((HEAP32[r13>>2]|0)==(r51|0)){r66=r13;break}_abort()}}while(0);HEAP32[r46+12>>2]=r43;HEAP32[r66>>2]=r46}else{r44=r45;r13=HEAP32[r55+((r65|24)+r54)>>2];r42=HEAP32[r55+(r54+12+r65)>>2];do{if((r42|0)==(r44|0)){r41=r65|16;r7=r55+(r36+r41)|0;r38=HEAP32[r7>>2];if((r38|0)==0){r5=r55+(r41+r54)|0;r41=HEAP32[r5>>2];if((r41|0)==0){r67=0;break}else{r68=r41;r69=r5}}else{r68=r38;r69=r7}while(1){r7=r68+20|0;r38=HEAP32[r7>>2];if((r38|0)!=0){r68=r38;r69=r7;continue}r7=r68+16|0;r38=HEAP32[r7>>2];if((r38|0)==0){break}else{r68=r38;r69=r7}}if(r69>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r69>>2]=0;r67=r68;break}}else{r7=HEAP32[r55+((r65|8)+r54)>>2];if(r7>>>0<HEAP32[3496>>2]>>>0){_abort()}r38=r7+12|0;if((HEAP32[r38>>2]|0)!=(r44|0)){_abort()}r5=r42+8|0;if((HEAP32[r5>>2]|0)==(r44|0)){HEAP32[r38>>2]=r42;HEAP32[r5>>2]=r7;r67=r42;break}else{_abort()}}}while(0);if((r13|0)==0){break}r42=r55+(r54+28+r65)|0;r46=3784+(HEAP32[r42>>2]<<2)|0;do{if((r44|0)==(HEAP32[r46>>2]|0)){HEAP32[r46>>2]=r67;if((r67|0)!=0){break}HEAP32[3484>>2]=HEAP32[3484>>2]&~(1<<HEAP32[r42>>2]);break L664}else{if(r13>>>0<HEAP32[3496>>2]>>>0){_abort()}r43=r13+16|0;if((HEAP32[r43>>2]|0)==(r44|0)){HEAP32[r43>>2]=r67}else{HEAP32[r13+20>>2]=r67}if((r67|0)==0){break L664}}}while(0);if(r67>>>0<HEAP32[3496>>2]>>>0){_abort()}HEAP32[r67+24>>2]=r13;r44=r65|16;r42=HEAP32[r55+(r44+r54)>>2];do{if((r42|0)!=0){if(r42>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r67+16>>2]=r42;HEAP32[r42+24>>2]=r67;break}}}while(0);r42=HEAP32[r55+(r36+r44)>>2];if((r42|0)==0){break}if(r42>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r67+20>>2]=r42;HEAP32[r42+24>>2]=r67;break}}}while(0);r70=r55+((r53|r65)+r54)|0;r71=r53+r37|0}else{r70=r51;r71=r37}r36=r70+4|0;HEAP32[r36>>2]=HEAP32[r36>>2]&-2;HEAP32[r55+(r48+4)>>2]=r71|1;HEAP32[r55+(r71+r48)>>2]=r71;r36=r71>>>3;if(r71>>>0<256){r47=r36<<1;r49=3520+(r47<<2)|0;r42=HEAP32[3480>>2];r13=1<<r36;do{if((r42&r13|0)==0){HEAP32[3480>>2]=r42|r13;r72=r49;r73=3520+(r47+2<<2)|0}else{r36=3520+(r47+2<<2)|0;r46=HEAP32[r36>>2];if(r46>>>0>=HEAP32[3496>>2]>>>0){r72=r46;r73=r36;break}_abort()}}while(0);HEAP32[r73>>2]=r52;HEAP32[r72+12>>2]=r52;HEAP32[r55+(r48+8)>>2]=r72;HEAP32[r55+(r48+12)>>2]=r49;break}r47=r56;r13=r71>>>8;do{if((r13|0)==0){r74=0}else{if(r71>>>0>16777215){r74=31;break}r42=(r13+1048320|0)>>>16&8;r53=r13<<r42;r36=(r53+520192|0)>>>16&4;r46=r53<<r36;r53=(r46+245760|0)>>>16&2;r43=14-(r36|r42|r53)+(r46<<r53>>>15)|0;r74=r71>>>((r43+7|0)>>>0)&1|r43<<1}}while(0);r13=3784+(r74<<2)|0;HEAP32[r55+(r48+28)>>2]=r74;HEAP32[r55+(r48+20)>>2]=0;HEAP32[r55+(r48+16)>>2]=0;r49=HEAP32[3484>>2];r43=1<<r74;if((r49&r43|0)==0){HEAP32[3484>>2]=r49|r43;HEAP32[r13>>2]=r47;HEAP32[r55+(r48+24)>>2]=r13;HEAP32[r55+(r48+12)>>2]=r47;HEAP32[r55+(r48+8)>>2]=r47;break}if((r74|0)==31){r75=0}else{r75=25-(r74>>>1)|0}r43=r71<<r75;r49=HEAP32[r13>>2];while(1){if((HEAP32[r49+4>>2]&-8|0)==(r71|0)){break}r76=r49+16+(r43>>>31<<2)|0;r13=HEAP32[r76>>2];if((r13|0)==0){r2=531;break}else{r43=r43<<1;r49=r13}}if(r2==531){if(r76>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r76>>2]=r47;HEAP32[r55+(r48+24)>>2]=r49;HEAP32[r55+(r48+12)>>2]=r47;HEAP32[r55+(r48+8)>>2]=r47;break}}r43=r49+8|0;r13=HEAP32[r43>>2];r53=HEAP32[3496>>2];if(r49>>>0<r53>>>0){_abort()}if(r13>>>0<r53>>>0){_abort()}else{HEAP32[r13+12>>2]=r47;HEAP32[r43>>2]=r47;HEAP32[r55+(r48+8)>>2]=r13;HEAP32[r55+(r48+12)>>2]=r49;HEAP32[r55+(r48+24)>>2]=0;break}}}while(0);r14=r55+(r64|8)|0;return r14}}while(0);r50=r57;r48=3928;while(1){r77=HEAP32[r48>>2];if(r77>>>0<=r50>>>0){r78=HEAP32[r48+4>>2];r79=r77+r78|0;if(r79>>>0>r50>>>0){break}}r48=HEAP32[r48+8>>2]}r48=r77+(r78-39)|0;if((r48&7|0)==0){r80=0}else{r80=-r48&7}r48=r77+(r78-47+r80)|0;r56=r48>>>0<(r57+16|0)>>>0?r50:r48;r48=r56+8|0;r52=r55+8|0;if((r52&7|0)==0){r81=0}else{r81=-r52&7}r52=r54-40-r81|0;HEAP32[3504>>2]=r55+r81;HEAP32[3492>>2]=r52;HEAP32[r55+(r81+4)>>2]=r52|1;HEAP32[r55+(r54-36)>>2]=40;HEAP32[3508>>2]=HEAP32[3336>>2];HEAP32[r56+4>>2]=27;HEAP32[r48>>2]=HEAP32[3928>>2];HEAP32[r48+4>>2]=HEAP32[3932>>2];HEAP32[r48+8>>2]=HEAP32[3936>>2];HEAP32[r48+12>>2]=HEAP32[3940>>2];HEAP32[3928>>2]=r55;HEAP32[3932>>2]=r54;HEAP32[3940>>2]=0;HEAP32[3936>>2]=r48;r48=r56+28|0;HEAP32[r48>>2]=7;if((r56+32|0)>>>0<r79>>>0){r52=r48;while(1){r48=r52+4|0;HEAP32[r48>>2]=7;if((r52+8|0)>>>0<r79>>>0){r52=r48}else{break}}}if((r56|0)==(r50|0)){break}r52=r56-r57|0;r48=r50+(r52+4)|0;HEAP32[r48>>2]=HEAP32[r48>>2]&-2;HEAP32[r57+4>>2]=r52|1;HEAP32[r50+r52>>2]=r52;r48=r52>>>3;if(r52>>>0<256){r37=r48<<1;r51=3520+(r37<<2)|0;r45=HEAP32[3480>>2];r13=1<<r48;do{if((r45&r13|0)==0){HEAP32[3480>>2]=r45|r13;r82=r51;r83=3520+(r37+2<<2)|0}else{r48=3520+(r37+2<<2)|0;r43=HEAP32[r48>>2];if(r43>>>0>=HEAP32[3496>>2]>>>0){r82=r43;r83=r48;break}_abort()}}while(0);HEAP32[r83>>2]=r57;HEAP32[r82+12>>2]=r57;HEAP32[r57+8>>2]=r82;HEAP32[r57+12>>2]=r51;break}r37=r57;r13=r52>>>8;do{if((r13|0)==0){r84=0}else{if(r52>>>0>16777215){r84=31;break}r45=(r13+1048320|0)>>>16&8;r50=r13<<r45;r56=(r50+520192|0)>>>16&4;r48=r50<<r56;r50=(r48+245760|0)>>>16&2;r43=14-(r56|r45|r50)+(r48<<r50>>>15)|0;r84=r52>>>((r43+7|0)>>>0)&1|r43<<1}}while(0);r13=3784+(r84<<2)|0;HEAP32[r57+28>>2]=r84;HEAP32[r57+20>>2]=0;HEAP32[r57+16>>2]=0;r51=HEAP32[3484>>2];r43=1<<r84;if((r51&r43|0)==0){HEAP32[3484>>2]=r51|r43;HEAP32[r13>>2]=r37;HEAP32[r57+24>>2]=r13;HEAP32[r57+12>>2]=r57;HEAP32[r57+8>>2]=r57;break}if((r84|0)==31){r85=0}else{r85=25-(r84>>>1)|0}r43=r52<<r85;r51=HEAP32[r13>>2];while(1){if((HEAP32[r51+4>>2]&-8|0)==(r52|0)){break}r86=r51+16+(r43>>>31<<2)|0;r13=HEAP32[r86>>2];if((r13|0)==0){r2=566;break}else{r43=r43<<1;r51=r13}}if(r2==566){if(r86>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r86>>2]=r37;HEAP32[r57+24>>2]=r51;HEAP32[r57+12>>2]=r57;HEAP32[r57+8>>2]=r57;break}}r43=r51+8|0;r52=HEAP32[r43>>2];r13=HEAP32[3496>>2];if(r51>>>0<r13>>>0){_abort()}if(r52>>>0<r13>>>0){_abort()}else{HEAP32[r52+12>>2]=r37;HEAP32[r43>>2]=r37;HEAP32[r57+8>>2]=r52;HEAP32[r57+12>>2]=r51;HEAP32[r57+24>>2]=0;break}}}while(0);r57=HEAP32[3492>>2];if(r57>>>0<=r15>>>0){break}r52=r57-r15|0;HEAP32[3492>>2]=r52;r57=HEAP32[3504>>2];r43=r57;HEAP32[3504>>2]=r43+r15;HEAP32[r43+(r15+4)>>2]=r52|1;HEAP32[r57+4>>2]=r15|3;r14=r57+8|0;return r14}}while(0);r15=___errno_location();HEAP32[r15>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r2=0;if((r1|0)==0){return}r3=r1-8|0;r4=r3;r5=HEAP32[3496>>2];if(r3>>>0<r5>>>0){_abort()}r6=HEAP32[r1-4>>2];r7=r6&3;if((r7|0)==1){_abort()}r8=r6&-8;r9=r1+(r8-8)|0;r10=r9;L836:do{if((r6&1|0)==0){r11=HEAP32[r3>>2];if((r7|0)==0){return}r12=-8-r11|0;r13=r1+r12|0;r14=r13;r15=r11+r8|0;if(r13>>>0<r5>>>0){_abort()}if((r14|0)==(HEAP32[3500>>2]|0)){r16=r1+(r8-4)|0;if((HEAP32[r16>>2]&3|0)!=3){r17=r14;r18=r15;break}HEAP32[3488>>2]=r15;HEAP32[r16>>2]=HEAP32[r16>>2]&-2;HEAP32[r1+(r12+4)>>2]=r15|1;HEAP32[r9>>2]=r15;return}r16=r11>>>3;if(r11>>>0<256){r11=HEAP32[r1+(r12+8)>>2];r19=HEAP32[r1+(r12+12)>>2];r20=3520+(r16<<1<<2)|0;do{if((r11|0)!=(r20|0)){if(r11>>>0<r5>>>0){_abort()}if((HEAP32[r11+12>>2]|0)==(r14|0)){break}_abort()}}while(0);if((r19|0)==(r11|0)){HEAP32[3480>>2]=HEAP32[3480>>2]&~(1<<r16);r17=r14;r18=r15;break}do{if((r19|0)==(r20|0)){r21=r19+8|0}else{if(r19>>>0<r5>>>0){_abort()}r22=r19+8|0;if((HEAP32[r22>>2]|0)==(r14|0)){r21=r22;break}_abort()}}while(0);HEAP32[r11+12>>2]=r19;HEAP32[r21>>2]=r11;r17=r14;r18=r15;break}r20=r13;r16=HEAP32[r1+(r12+24)>>2];r22=HEAP32[r1+(r12+12)>>2];do{if((r22|0)==(r20|0)){r23=r1+(r12+20)|0;r24=HEAP32[r23>>2];if((r24|0)==0){r25=r1+(r12+16)|0;r26=HEAP32[r25>>2];if((r26|0)==0){r27=0;break}else{r28=r26;r29=r25}}else{r28=r24;r29=r23}while(1){r23=r28+20|0;r24=HEAP32[r23>>2];if((r24|0)!=0){r28=r24;r29=r23;continue}r23=r28+16|0;r24=HEAP32[r23>>2];if((r24|0)==0){break}else{r28=r24;r29=r23}}if(r29>>>0<r5>>>0){_abort()}else{HEAP32[r29>>2]=0;r27=r28;break}}else{r23=HEAP32[r1+(r12+8)>>2];if(r23>>>0<r5>>>0){_abort()}r24=r23+12|0;if((HEAP32[r24>>2]|0)!=(r20|0)){_abort()}r25=r22+8|0;if((HEAP32[r25>>2]|0)==(r20|0)){HEAP32[r24>>2]=r22;HEAP32[r25>>2]=r23;r27=r22;break}else{_abort()}}}while(0);if((r16|0)==0){r17=r14;r18=r15;break}r22=r1+(r12+28)|0;r13=3784+(HEAP32[r22>>2]<<2)|0;do{if((r20|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r27;if((r27|0)!=0){break}HEAP32[3484>>2]=HEAP32[3484>>2]&~(1<<HEAP32[r22>>2]);r17=r14;r18=r15;break L836}else{if(r16>>>0<HEAP32[3496>>2]>>>0){_abort()}r11=r16+16|0;if((HEAP32[r11>>2]|0)==(r20|0)){HEAP32[r11>>2]=r27}else{HEAP32[r16+20>>2]=r27}if((r27|0)==0){r17=r14;r18=r15;break L836}}}while(0);if(r27>>>0<HEAP32[3496>>2]>>>0){_abort()}HEAP32[r27+24>>2]=r16;r20=HEAP32[r1+(r12+16)>>2];do{if((r20|0)!=0){if(r20>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r27+16>>2]=r20;HEAP32[r20+24>>2]=r27;break}}}while(0);r20=HEAP32[r1+(r12+20)>>2];if((r20|0)==0){r17=r14;r18=r15;break}if(r20>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r27+20>>2]=r20;HEAP32[r20+24>>2]=r27;r17=r14;r18=r15;break}}else{r17=r4;r18=r8}}while(0);r4=r17;if(r4>>>0>=r9>>>0){_abort()}r27=r1+(r8-4)|0;r5=HEAP32[r27>>2];if((r5&1|0)==0){_abort()}do{if((r5&2|0)==0){if((r10|0)==(HEAP32[3504>>2]|0)){r28=HEAP32[3492>>2]+r18|0;HEAP32[3492>>2]=r28;HEAP32[3504>>2]=r17;HEAP32[r17+4>>2]=r28|1;if((r17|0)!=(HEAP32[3500>>2]|0)){return}HEAP32[3500>>2]=0;HEAP32[3488>>2]=0;return}if((r10|0)==(HEAP32[3500>>2]|0)){r28=HEAP32[3488>>2]+r18|0;HEAP32[3488>>2]=r28;HEAP32[3500>>2]=r17;HEAP32[r17+4>>2]=r28|1;HEAP32[r4+r28>>2]=r28;return}r28=(r5&-8)+r18|0;r29=r5>>>3;L939:do{if(r5>>>0<256){r21=HEAP32[r1+r8>>2];r7=HEAP32[r1+(r8|4)>>2];r3=3520+(r29<<1<<2)|0;do{if((r21|0)!=(r3|0)){if(r21>>>0<HEAP32[3496>>2]>>>0){_abort()}if((HEAP32[r21+12>>2]|0)==(r10|0)){break}_abort()}}while(0);if((r7|0)==(r21|0)){HEAP32[3480>>2]=HEAP32[3480>>2]&~(1<<r29);break}do{if((r7|0)==(r3|0)){r30=r7+8|0}else{if(r7>>>0<HEAP32[3496>>2]>>>0){_abort()}r6=r7+8|0;if((HEAP32[r6>>2]|0)==(r10|0)){r30=r6;break}_abort()}}while(0);HEAP32[r21+12>>2]=r7;HEAP32[r30>>2]=r21}else{r3=r9;r6=HEAP32[r1+(r8+16)>>2];r20=HEAP32[r1+(r8|4)>>2];do{if((r20|0)==(r3|0)){r16=r1+(r8+12)|0;r22=HEAP32[r16>>2];if((r22|0)==0){r13=r1+(r8+8)|0;r11=HEAP32[r13>>2];if((r11|0)==0){r31=0;break}else{r32=r11;r33=r13}}else{r32=r22;r33=r16}while(1){r16=r32+20|0;r22=HEAP32[r16>>2];if((r22|0)!=0){r32=r22;r33=r16;continue}r16=r32+16|0;r22=HEAP32[r16>>2];if((r22|0)==0){break}else{r32=r22;r33=r16}}if(r33>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r33>>2]=0;r31=r32;break}}else{r16=HEAP32[r1+r8>>2];if(r16>>>0<HEAP32[3496>>2]>>>0){_abort()}r22=r16+12|0;if((HEAP32[r22>>2]|0)!=(r3|0)){_abort()}r13=r20+8|0;if((HEAP32[r13>>2]|0)==(r3|0)){HEAP32[r22>>2]=r20;HEAP32[r13>>2]=r16;r31=r20;break}else{_abort()}}}while(0);if((r6|0)==0){break}r20=r1+(r8+20)|0;r21=3784+(HEAP32[r20>>2]<<2)|0;do{if((r3|0)==(HEAP32[r21>>2]|0)){HEAP32[r21>>2]=r31;if((r31|0)!=0){break}HEAP32[3484>>2]=HEAP32[3484>>2]&~(1<<HEAP32[r20>>2]);break L939}else{if(r6>>>0<HEAP32[3496>>2]>>>0){_abort()}r7=r6+16|0;if((HEAP32[r7>>2]|0)==(r3|0)){HEAP32[r7>>2]=r31}else{HEAP32[r6+20>>2]=r31}if((r31|0)==0){break L939}}}while(0);if(r31>>>0<HEAP32[3496>>2]>>>0){_abort()}HEAP32[r31+24>>2]=r6;r3=HEAP32[r1+(r8+8)>>2];do{if((r3|0)!=0){if(r3>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r31+16>>2]=r3;HEAP32[r3+24>>2]=r31;break}}}while(0);r3=HEAP32[r1+(r8+12)>>2];if((r3|0)==0){break}if(r3>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r31+20>>2]=r3;HEAP32[r3+24>>2]=r31;break}}}while(0);HEAP32[r17+4>>2]=r28|1;HEAP32[r4+r28>>2]=r28;if((r17|0)!=(HEAP32[3500>>2]|0)){r34=r28;break}HEAP32[3488>>2]=r28;return}else{HEAP32[r27>>2]=r5&-2;HEAP32[r17+4>>2]=r18|1;HEAP32[r4+r18>>2]=r18;r34=r18}}while(0);r18=r34>>>3;if(r34>>>0<256){r4=r18<<1;r5=3520+(r4<<2)|0;r27=HEAP32[3480>>2];r31=1<<r18;do{if((r27&r31|0)==0){HEAP32[3480>>2]=r27|r31;r35=r5;r36=3520+(r4+2<<2)|0}else{r18=3520+(r4+2<<2)|0;r8=HEAP32[r18>>2];if(r8>>>0>=HEAP32[3496>>2]>>>0){r35=r8;r36=r18;break}_abort()}}while(0);HEAP32[r36>>2]=r17;HEAP32[r35+12>>2]=r17;HEAP32[r17+8>>2]=r35;HEAP32[r17+12>>2]=r5;return}r5=r17;r35=r34>>>8;do{if((r35|0)==0){r37=0}else{if(r34>>>0>16777215){r37=31;break}r36=(r35+1048320|0)>>>16&8;r4=r35<<r36;r31=(r4+520192|0)>>>16&4;r27=r4<<r31;r4=(r27+245760|0)>>>16&2;r18=14-(r31|r36|r4)+(r27<<r4>>>15)|0;r37=r34>>>((r18+7|0)>>>0)&1|r18<<1}}while(0);r35=3784+(r37<<2)|0;HEAP32[r17+28>>2]=r37;HEAP32[r17+20>>2]=0;HEAP32[r17+16>>2]=0;r18=HEAP32[3484>>2];r4=1<<r37;do{if((r18&r4|0)==0){HEAP32[3484>>2]=r18|r4;HEAP32[r35>>2]=r5;HEAP32[r17+24>>2]=r35;HEAP32[r17+12>>2]=r17;HEAP32[r17+8>>2]=r17}else{if((r37|0)==31){r38=0}else{r38=25-(r37>>>1)|0}r27=r34<<r38;r36=HEAP32[r35>>2];while(1){if((HEAP32[r36+4>>2]&-8|0)==(r34|0)){break}r39=r36+16+(r27>>>31<<2)|0;r31=HEAP32[r39>>2];if((r31|0)==0){r2=743;break}else{r27=r27<<1;r36=r31}}if(r2==743){if(r39>>>0<HEAP32[3496>>2]>>>0){_abort()}else{HEAP32[r39>>2]=r5;HEAP32[r17+24>>2]=r36;HEAP32[r17+12>>2]=r17;HEAP32[r17+8>>2]=r17;break}}r27=r36+8|0;r28=HEAP32[r27>>2];r31=HEAP32[3496>>2];if(r36>>>0<r31>>>0){_abort()}if(r28>>>0<r31>>>0){_abort()}else{HEAP32[r28+12>>2]=r5;HEAP32[r27>>2]=r5;HEAP32[r17+8>>2]=r28;HEAP32[r17+12>>2]=r36;HEAP32[r17+24>>2]=0;break}}}while(0);r17=HEAP32[3512>>2]-1|0;HEAP32[3512>>2]=r17;if((r17|0)==0){r40=3936}else{return}while(1){r17=HEAP32[r40>>2];if((r17|0)==0){break}else{r40=r17+8|0}}HEAP32[3512>>2]=-1;return}
// EMSCRIPTEN_END_FUNCS
Module["_main"] = _main;
Module["_malloc"] = _malloc;
Module["_free"] = _free;
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
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
      throw e;
    }
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
    Module.printErr(text);
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
Module['FS_createPath']('/', 'scenes', true, true);
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
        if (this.crunched) {
          var ddsHeader = byteArray.subarray(0, 128);
          var that = this;
          requestDecrunch(this.name, byteArray.subarray(128), function(ddsData) {
            byteArray = new Uint8Array(ddsHeader.length + ddsData.length);
            byteArray.set(ddsHeader, 0);
            byteArray.set(ddsData, 128);
            that.finish(byteArray);
          });
        } else {
          this.finish(byteArray);
        }
      },
      finish: function(byteArray) {
        var that = this;
        Module['FS_createPreloadedFile'](this.name, null, byteArray, true, true, function() {
          Module['removeRunDependency']('fp ' + that.name);
        }, function() {
          if (that.audio) {
            Module['removeRunDependency']('fp ' + that.name); // workaround for chromium bug 124926 (still no audio with this, but at least we don't hang)
          } else {
            Runtime.warn('Preloading file ' + that.name + ' failed');
          }
        }, false, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        this.requests[this.name] = null;
      },
    };
      new DataRequest(0, 16247, 0, 0).open('GET', '/rendering_kernel_custom.cl');
    new DataRequest(16247, 16437, 0, 0).open('GET', '/scenes/caustic.scn');
    new DataRequest(16437, 16730, 0, 0).open('GET', '/scenes/caustic3.scn');
    new DataRequest(16730, 56250, 0, 0).open('GET', '/scenes/complex.scn');
    new DataRequest(56250, 56829, 0, 0).open('GET', '/scenes/cornell_large.scn');
    new DataRequest(56829, 57406, 0, 0).open('GET', '/scenes/cornell.scn');
    new DataRequest(57406, 57698, 0, 0).open('GET', '/scenes/simple.scn');
    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;
    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = '../build/smallpt.data';
    var REMOTE_PACKAGE_NAME = 'smallpt.data';
    var PACKAGE_UUID = '5c4dd8c6-76f2-4950-86a0-4277dd19b80f';
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
      // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though.
      var ptr = Module['_malloc'](byteArray.length);
      Module['HEAPU8'].set(byteArray, ptr);
      DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
          DataRequest.prototype.requests["/rendering_kernel_custom.cl"].onload();
          DataRequest.prototype.requests["/scenes/caustic.scn"].onload();
          DataRequest.prototype.requests["/scenes/caustic3.scn"].onload();
          DataRequest.prototype.requests["/scenes/complex.scn"].onload();
          DataRequest.prototype.requests["/scenes/cornell_large.scn"].onload();
          DataRequest.prototype.requests["/scenes/cornell.scn"].onload();
          DataRequest.prototype.requests["/scenes/simple.scn"].onload();
          Module['removeRunDependency']('datafile_../build/smallpt.data');
    };
    Module['addRunDependency']('datafile_../build/smallpt.data');
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
