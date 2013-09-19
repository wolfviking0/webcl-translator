// Note: Some Emscripten settings will significantly limit the speed of the generated code.
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
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    assert(ptr + i < TOTAL_MEMORY);
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
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
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
STATICTOP = STATIC_BASE + 4104;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
/* memory initializer */ allocate([24,0,0,0,248,255,255,255,24,0,0,0,8,0,0,0,252,255,255,255,20,0,0,0,0,0,0,0,20,0,0,0,132,16,0,0,0,0,0,0,12,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,16,0,0,0,0,0,0,12,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,17,0,0,65,17,0,0,1,0,0,0,0,0,0,0,80,17,0,0,81,17,0,0,82,17,0,0,83,17,0,0,84,17,0,0,0,0,0,0,96,17,0,0,97,17,0,0,98,17,0,0,99,17,0,0,100,17,0,0,101,17,0,0,102,17,0,0,0,0,0,0,129,17,0,0,130,17,0,0,131,17,0,0,0,0,0,0,0,17,0,0,1,17,0,0,2,17,0,0,3,17,0,0,4,17,0,0,5,17,0,0,5,17,0,0,7,17,0,0,8,17,0,0,0,0,0,0,181,17,0,0,176,17,0,0,177,17,0,0,178,17,0,0,179,17,0,0,180,17,0,0,144,17,0,0,145,17,0,0,146,17,0,0,147,17,0,0,148,17,0,0,149,17,0,0,0,16,0,0,1,16,0,0,2,16,0,0,3,16,0,0,4,16,0,0,5,16,0,0,6,16,0,0,7,16,0,0,8,16,0,0,9,16,0,0,10,16,0,0,11,16,0,0,12,16,0,0,13,16,0,0,14,16,0,0,15,16,0,0,16,16,0,0,17,16,0,0,18,16,0,0,19,16,0,0,20,16,0,0,21,16,0,0,22,16,0,0,23,16,0,0,24,16,0,0,25,16,0,0,26,16,0,0,27,16,0,0,28,16,0,0,29,16,0,0,30,16,0,0,31,16,0,0,32,16,0,0,33,16,0,0,34,16,0,0,35,16,0,0,36,16,0,0,37,16,0,0,38,16,0,0,39,16,0,0,40,16,0,0,41,16,0,0,42,16,0,0,43,16,0,0,44,16,0,0,45,16,0,0,46,16,0,0,47,16,0,0,48,16,0,0,49,16,0,0,50,16,0,0,52,16,0,0,53,16,0,0,54,16,0,0,55,16,0,0,56,16,0,0,57,16,0,0,58,16,0,0,59,16,0,0,60,16,0,0,61,16,0,0,62,16,0,0,63,16,0,0,64,16,0,0,65,16,0,0,66,16,0,0,67,16,0,0,68,16,0,0,69,16,0,0,70,16,0,0,71,16,0,0,72,16,0,0,73,16,0,0,74,16,0,0,75,16,0,0,0,0,0,0,16,17,0,0,17,17,0,0,18,17,0,0,18,17,0,0,20,17,0,0,21,17,0,0,22,17,0,0,0,0,0,0,128,16,0,0,131,16,0,0,129,16,0,0,130,16,0,0,132,16,0,0,0,0,0,0,144,16,0,0,145,16,0,0,146,16,0,0,147,16,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,48,17,0,0,49,17,0,0,50,17,0,0,51,17,0,0,52,17,0,0,0,0,0,0,67,80,85,0,0,0,0,0,10,10,10,10,10,10,10,0,10,10,10,10,10,10,10,84,69,83,84,32,58,32,72,101,108,108,111,32,87,111,114,108,100,32,83,97,109,112,108,101,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,75,101,114,110,101,108,73,110,102,111,10,0,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,75,101,114,110,101,108,87,111,114,107,71,114,111,117,112,73,110,102,111,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,83,101,116,75,101,114,110,101,108,65,114,103,10,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,75,101,114,110,101,108,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,32,45,32,37,100,10,0,0,0,0,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,0,0,71,80,85,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,75,101,114,110,101,108,115,73,110,80,114,111,103,114,97,109,10,0,0,0,0,0,0,0,115,113,117,97,114,101,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,75,101,114,110,101,108,10,0,10,84,69,83,84,32,58,32,99,108,71,101,116,80,114,111,103,114,97,109,73,110,102,111,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,80,114,111,103,114,97,109,66,117,105,108,100,73,110,102,111,10,0,0,37,100,41,32,37,100,32,58,32,37,100,32,58,32,37,100,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,32,58,32,37,115,10,0,0,0,0,0,0,0,45,99,108,45,115,116,100,61,0,0,0,0,0,0,0,0,45,87,101,114,114,111,114,0,80,97,114,97,109,101,116,101,114,32,100,101,116,101,99,116,32,37,115,32,100,101,118,105,99,101,10,0,0,0,0,0,45,87,0,0,0,0,0,0,45,99,108,45,102,97,115,116,45,114,101,108,97,120,101,100,45,109,97,116,104,0,0,0,45,99,108,45,102,105,110,105,116,101,45,109,97,116,104,45,111,110,108,121,0,0,0,0,45,99,108,45,117,110,115,97,102,101,45,109,97,116,104,45,111,112,116,105,109,105,122,97,116,105,111,110,115,0,0,0,45,99,108,45,110,111,45,115,105,103,110,101,100,45,122,101,114,111,115,0,0,0,0,0,45,99,108,45,109,97,100,45,101,110,97,98,108,101,0,0,45,99,108,45,100,101,110,111,114,109,115,45,97,114,101,45,122,101,114,111,0,0,0,0,45,99,108,45,115,105,110,103,108,101,45,112,114,101,99,105,115,105,111,110,45,99,111,110,115,116,97,110,116,0,0,0,45,99,108,45,111,112,116,45,100,105,115,97,98,108,101,0,45,68,32,110,97,109,101,61,100,101,102,105,110,105,116,105,111,110,0,0,0,0,0,0,103,112,117,0,0,0,0,0,45,68,32,110,97,109,101,0,10,84,69,83,84,32,58,32,99,108,66,117,105,108,100,80,114,111,103,114,97,109,10,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,80,114,111,103,114,97,109,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,80,114,111,103,114,97,109,87,105,116,104,83,111,117,114,99,101,10,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,83,97,109,112,108,101,114,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,83,97,109,112,108,101,114,73,110,102,111,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,45,32,37,100,32,40,37,100,120,37,100,120,37,100,41,10,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,83,97,109,112,108,101,114,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,40,37,100,120,37,100,41,10,0,0,0,0,0,0,0,99,112,117,0,0,0,0,0,10,37,100,41,32,37,100,32,58,32,37,100,10,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,83,117,112,112,111,114,116,101,100,73,109,97,103,101,70,111,114,109,97,116,115,10,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,77,101,109,79,98,106,101,99,116,10,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,73,109,97,103,101,73,110,102,111,10,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,77,101,109,79,98,106,101,99,116,73,110,102,111,10,0,0,0,0,0,37,100,41,32,37,108,108,100,32,58,32,37,100,32,45,32,37,100,32,40,37,100,120,37,100,41,10,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,73,109,97,103,101,50,68,10,0,0,0,0,0,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,0,37,100,41,32,37,100,32,58,32,112,102,110,95,110,111,116,105,102,121,32,99,97,108,108,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,83,117,98,66,117,102,102,101,114,10,0,0,0,0,0,0,37,100,41,32,37,108,108,100,32,58,32,37,100,32,45,32,37,100,10,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,66,117,102,102,101,114,10,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,67,111,109,109,97,110,100,81,117,101,117,101,10,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,67,111,109,109,97,110,100,81,117,101,117,101,73,110,102,111,10,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,67,111,109,109,97,110,100,81,117,101,117,101,10,0,0,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,67,111,110,116,101,120,116,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,67,111,110,116,101,120,116,73,110,102,111,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,108,108,117,32,61,62,32,37,100,10,0,0,0,0,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,10,0,0,0,0,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,70,114,111,109,84,121,112,101,32,116,121,112,101,32,58,32,37,108,108,117,10,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,70,114,111,109,84,121,112,101,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,10,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,32,45,32,37,100,32,61,62,32,37,108,108,117,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,32,45,32,37,100,32,61,62,32,37,100,44,32,37,100,32,44,32,37,100,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,32,45,32,37,100,32,61,62,32,37,115,10,0,37,100,41,32,37,100,32,58,32,37,100,32,45,32,37,100,32,61,62,32,37,100,10,0,10,84,69,83,84,32,58,32,99,108,71,101,116,68,101,118,105,99,101,73,110,102,111,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,45,32,37,100,32,45,32,37,100,32,45,32,37,100,10,0,0,37,115,10,0,0,0,0,0,99,108,71,101,116,68,101,118,105,99,101,73,68,115,32,116,121,112,101,32,58,32,37,108,108,117,10,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,68,101,118,105,99,101,73,68,115,10,0,37,100,41,32,37,100,32,45,32,37,115,32,45,32,37,100,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,45,32,37,115,10,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,80,108,97,116,102,111,114,109,73,110,102,111,10,0,0,0,0,0,0,37,100,41,32,37,100,32,45,32,37,100,32,45,32,37,100,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,45,32,37,100,10,0,0,0,0,37,100,41,32,37,100,10,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,0,0,0,0,84,69,83,84,32,58,32,99,108,71,101,116,80,108,97,116,102,111,114,109,73,68,115,10,0,0,0,0,0,0,0,0,10,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,10,0,0,0,10,95,95,107,101,114,110,101,108,32,118,111,105,100,32,115,113,117,97,114,101,40,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,95,95,103,108,111,98,97,108,32,102,108,111,97,116,42,32,105,110,112,117,116,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,95,95,103,108,111,98,97,108,32,102,108,111,97,116,42,32,111,117,116,112,117,116,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,99,111,110,115,116,32,117,110,115,105,103,110,101,100,32,105,110,116,32,99,111,117,110,116,41,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,123,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,105,110,116,32,105,32,61,32,103,101,116,95,103,108,111,98,97,108,95,105,100,40,48,41,59,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,105,102,40,105,32,60,32,99,111,117,110,116,41,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,32,32,32,32,111,117,116,112,117,116,91,105,93,32,61,32,105,110,112,117,116,91,105,93,32,42,32,105,110,112,117,116,91,105,93,59,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,125,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,10,0,128,11,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
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
      }};var CL={cl_digits:[1,2,3,4,5,6,7,8,9,0],cl_pn_type:0,cl_objects:{},cl_objects_counter:0,udid:function (obj) {    
        var _id;
        if (obj !== undefined) {
           _id = obj.udid;
           if (_id !== undefined) {
             return _id;
           }
        }
        var _uuid = [];
        _uuid[0] = CL.cl_digits[0 | Math.random()*CL.cl_digits.length-1]; // First digit of udid can't be 0
        for (var i = 1; i < 8; i++) _uuid[i] = CL.cl_digits[0 | Math.random()*CL.cl_digits.length];
        _id = _uuid.join('');
        if (_id in CL.cl_objects) {
          console.error("/!\\ **********************");
          console.error("/!\\ UDID not unique !!!!!!");
          console.error("/!\\ **********************");        
        }
        // /!\ Call udid when you add inside cl_objects if you pass object in parameter
        if (obj !== undefined) {
          Object.defineProperty(obj, "udid", { value : _id,writable : false });
          CL.cl_objects[_id]=obj;
          CL.cl_objects_counter++,
          console.info("Counter++ HashMap Object : " + CL.cl_objects_counter + " - Udid : " + _id);
        }
        return _id;      
      },getPointerToValue:function (ptr,size) {  
        var _value = null;
        switch(CL.cl_pn_type) {
          case webcl.SIGNED_INT8:
          case webcl.UNSIGNED_INT8:          
            _value = HEAP8[(ptr)]
            break;
          case webcl.SIGNED_INT16:
          case webcl.UNSIGNED_INT16:
            _value = HEAP16[((ptr)>>1)]
            break;
          case webcl.SIGNED_INT32:
          case webcl.UNSIGNED_INT32:
            _value = HEAP32[((ptr)>>2)]
            break;
          case webcl.FLOAT:
            _value = HEAPF32[((ptr)>>2)]
            break;          
          default:
            console.info("Use default type FLOAT, call clSetTypePointer() for set the pointer type ...\n");
            _value = HEAPF32[((ptr)>>2)]
            break;
        }
        return _value;
      },getPointerToArray:function (ptr,size) {  
        var _host_ptr = null;
        switch(CL.cl_pn_type) {
          case webcl.SIGNED_INT8:
            _host_ptr = HEAP8.subarray((ptr),(ptr+size))
            break;
          case webcl.SIGNED_INT16:
            _host_ptr = HEAP16.subarray((ptr)>>1,(ptr+size)>>1)
            break;
          case webcl.SIGNED_INT32:
            _host_ptr = HEAP32.subarray((ptr)>>2,(ptr+size)>>2)
            break;
          case webcl.UNSIGNED_INT8:
            _host_ptr = HEAPU8.subarray((ptr),(ptr+size))
            break;
          case webcl.UNSIGNED_INT16:
            _host_ptr = HEAPU16.subarray((ptr)>>1,(ptr+size)>>1)
            break;
          case webcl.UNSIGNED_INT32:
            _host_ptr = HEAPU32.subarray((ptr)>>2,(ptr+size)>>2)
            break;
          case webcl.FLOAT:
            _host_ptr = HEAPF32.subarray((ptr)>>2,(ptr+size)>>2)
            break;          
          default:
            console.info("Use default type FLOAT, call clSetTypePointer() for set the pointer type ...\n");
            _host_ptr = HEAPF32.subarray((ptr)>>2,(ptr+size)>>2)
            break;
        }
        return _host_ptr;
      },getPointerToArrayBuffer:function (ptr,size) {  
        return CL.getPointerToArray(ptr,size).buffer;
      },catchError:function (e) {
        console.error(e);
        var _error = -1;
        if (e instanceof WebCLException) {
          var _str=e.message;
          var _n=_str.lastIndexOf(" ");
          _error = _str.substr(_n+1,_str.length-_n-1);
        }
        return _error;
      },stack_trace:"// Javascript webcl Stack Trace\n",webclBeginStackTrace:function (name,parameter) {
        CL.stack_trace += "\n" + name + "("
        CL.webclCallParameterStackTrace(parameter);
        CL.stack_trace += ")\n";
      },webclCallStackTrace:function (name,parameter) {
        CL.stack_trace += "\t->" + name + "("
        CL.webclCallParameterStackTrace(parameter);
        CL.stack_trace += ")\n";
      },webclCallParameterStackTrace:function (parameter) {
        for (var i = 0; i < parameter.length - 1 ; i++) {
          CL.stack_trace += parameter[i] + ",";
        }
        if (parameter.length >= 1) {
          CL.stack_trace += parameter[parameter.length - 1];
        }
      },webclEndStackTrace:function (result,message,exception) {
        CL.stack_trace += "\t\t=>Result (" + result[0];
        if (result.length >= 2) {
          CL.stack_trace += " : ";
        }
        for (var i = 1; i < result.length - 1 ; i++) {
          CL.stack_trace += ( result[i] == 0 ? '0' : HEAP32[((result[i])>>2)] ) + " - ";
        }
        if (result.length >= 2) {
          CL.stack_trace +=  ( result[result.length - 1] == 0 ? '0' : HEAP32[((result[result.length - 1])>>2)] );
        }
        CL.stack_trace += ") - Message (" + message + ") - Exception (" + exception + ")\n";
      }};function _webclPrintStackTrace(param_value,param_value_size) {
      var _size = HEAP32[((param_value_size)>>2)] ;
      if (_size == 0) {
        HEAP32[((param_value_size)>>2)]=CL.stack_trace.length /* Size of char stack */;
      } else {
        writeStringToMemory(CL.stack_trace, param_value);
      }
      return webcl.SUCCESS;
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
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
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
      }};function _glutInit(argcp, argv) {
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
      }};function _glutInitDisplayMode(mode) {}
  function _glutInitWindowSize(width, height) {
      Browser.setCanvasSize( GLUT.initWindowWidth = width,
                             GLUT.initWindowHeight = height );
    }
  function _glutCreateWindow(name) {
      Module.ctx = Browser.createContext(Module['canvas'], true, true);
      return Module.ctx ? 1 /* a new GLUT window ID for the created context */ : 0 /* failure */;
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
  function _clGetPlatformIDs(num_entries,platforms,num_platforms) {
      // Test UDID 
      // for (var i = 0 ; i < 100000; i++) {
      //   CL.udid();
      // }
      CL.webclBeginStackTrace("clGetPlatformIDs",[num_entries,platforms,num_platforms]);
      if ( num_entries == 0 && platforms != 0) {
        CL.webclEndStackTrace([webcl.INVALID_VALUE],"num_entries is equal to zero and platforms is not NULL","");
        return webcl.INVALID_VALUE;
      }
      if ( num_platforms == 0 && platforms == 0) {
        CL.webclEndStackTrace([webcl.INVALID_VALUE],"both num_platforms and platforms are NULL","");
        return webcl.INVALID_VALUE;
      }
      try { 
        CL.webclCallStackTrace(webcl+".getPlatforms",[]);
        var _platforms = webcl.getPlatforms();
        if (num_platforms != 0) {
          HEAP32[((num_platforms)>>2)]=Math.min(num_entries,_platforms.length) /* Num of platforms */;
        } 
        if (platforms != 0) {
          for (var i = 0; i < Math.min(num_entries,_platforms.length); i++) {
            var _id = CL.udid(_platforms[i]);
            HEAP32[(((platforms)+(i*4))>>2)]=_id;
          }
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error,platforms,num_platforms],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,platforms,num_platforms],"","");
      return webcl.SUCCESS;
    }
  function _clGetPlatformInfo(platform,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetPlatformInfo",[platform,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (platform in CL.cl_objects) {
          CL.webclCallStackTrace(""+CL.cl_objects[platform]+".getInfo",[param_name]);
          var _info = CL.cl_objects[platform].getInfo(param_name);
          if (param_value != 0) {
            writeStringToMemory(_info, param_value);
          }
          if (param_value_size_ret != 0) {
            HEAP32[((param_value_size_ret)>>2)]=Math.min(param_value_size,_info.length);
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_PLATFORM],"platform are NULL","");
          return webcl.INVALID_PLATFORM;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        var _info = "undefined";
        if (param_value != 0) {
          writeStringToMemory(_info, param_value);
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=Math.min(param_value_size,_info.length);
        }
        CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
      return webcl.SUCCESS;
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
    }var _llvm_memset_p0i8_i32=_memset;
  function _clGetDeviceIDs(platform,device_type_i64_1,device_type_i64_2,num_entries,devices,num_devices) {
      // Assume the device_type is i32 
      assert(device_type_i64_2 == 0, 'Invalid device_type i64');
      CL.webclBeginStackTrace("clGetDeviceIDs",[platform,device_type_i64_1,num_entries,devices,num_devices]);
      if ( num_entries == 0 && device_type_i64_1 != 0) {
        CL.webclEndStackTrace([webcl.INVALID_VALUE],"num_entries is equal to zero and device_type is not NULL","");
        return webcl.INVALID_VALUE;
      }
      if ( num_devices == 0 && device_type_i64_1 == 0) {
        CL.webclEndStackTrace([webcl.INVALID_VALUE],"both num_devices and device_type are NULL","");
        return webcl.INVALID_VALUE;
      }
      try {
        if ((platform in CL.cl_objects) || (platform == 0)) {
          // If platform is NULL use the first platform found ...
          if (platform == 0) {
            CL.webclCallStackTrace(webcl+".getPlatforms",[]);
            var _platforms = webcl.getPlatforms();
            if (_platforms.length == 0) {
              CL.webclEndStackTrace([webcl.INVALID_PLATFORM],"platform is not a valid platform","");
              return webcl.INVALID_PLATFORM;  
            }
            // Create a new UDID 
            platform = CL.udid(_platforms[0]);
          } 
          var _platform = CL.cl_objects[platform];
          CL.webclCallStackTrace(_platform+".getDevices",[device_type_i64_1]);
          var _devices = _platform.getDevices(device_type_i64_1);
          if (num_devices != 0) {
            HEAP32[((num_devices)>>2)]=Math.min(num_entries,_devices.length) /* Num of device */;
          } 
          if (devices != 0) {
            for (var i = 0; i < Math.min(num_entries,_devices.length); i++) {
              var _id = CL.udid(_devices[i]);
              HEAP32[(((devices)+(i*4))>>2)]=_id;
            }
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_PLATFORM],"platform is not a valid platform","");
          return webcl.INVALID_PLATFORM;       
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error,devices,num_devices],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,devices,num_devices],"","");
      return webcl.SUCCESS;
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
  function _clGetDeviceInfo(device,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetDeviceInfo",[device,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (device in CL.cl_objects) {
          var _object = CL.cl_objects[device];
          if (param_name == 4107 /*DEVICE_PREFERRED_VECTOR_WIDTH_DOUBLE*/) {
            CL.webclCallStackTrace(""+webcl+".getExtension",["KHR_FP64"]);
            _object = webcl.getExtension("KHR_FP64");
          }
          if (param_name == 4148 /*DEVICE_PREFERRED_VECTOR_WIDTH_HALF*/) {
            CL.webclCallStackTrace(""+webcl+".getExtension",["KHR_FP16"]);
            _object = webcl.getExtension("KHR_FP16");
          }
          CL.webclCallStackTrace(""+_object+".getInfo",[param_name]);
          var _info = _object.getInfo(param_name);
          if(typeof(_info) == "number") {
            if (param_value_size == 8) {
              if (param_value != 0) (tempI64 = [_info>>>0,(Math.abs(_info) >= 1 ? (_info > 0 ? Math.min(Math.floor((_info)/4294967296), 4294967295)>>>0 : (~~(Math.ceil((_info - +(((~~(_info)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((param_value)>>2)]=tempI64[0],HEAP32[(((param_value)+(4))>>2)]=tempI64[1]);
            } else {
              if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
            } 
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
          } else if(typeof(_info) == "boolean") {
            if (param_value != 0) (_info == true) ? HEAP32[((param_value)>>2)]=1 : HEAP32[((param_value)>>2)]=0;
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
          } else if(typeof(_info) == "string") {
            if (param_value != 0) writeStringToMemory(_info, param_value);
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=Math.min(param_value_size,_info.length);
          } else if(typeof(_info) == "object") {
            if (_info instanceof Int32Array) {
              for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
                if (param_value != 0) HEAP32[(((param_value)+(i*4))>>2)]=_info[i];
              }
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=Math.min(param_value_size>>2,_info.length);
            } else if (_info instanceof WebCLPlatform) {
              var _id = CL.udid(_info);
              if (param_value != 0) HEAP32[((param_value)>>2)]=_id;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else if (_info == null) {
              if (param_value != 0) HEAP32[((param_value)>>2)]=0;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else {
              CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
              return webcl.INVALID_VALUE;
            }
          } else {
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
            return webcl.INVALID_VALUE;
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_DEVICE],"device are NULL","");
          return webcl.INVALID_DEVICE;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        if (param_value != 0) {
          HEAP32[((param_value)>>2)]=0;
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
        CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
      return webcl.SUCCESS;
    }
  function _clCreateContext(properties,num_devices,devices,pfn_notify,user_data,cl_errcode_ret) {
      CL.webclBeginStackTrace("clCreateContext",[properties,num_devices,devices,pfn_notify,user_data,cl_errcode_ret]);
      var _id = null;
      var _context = null;
      try { 
        var _webcl = webcl;
        var _platform = null;
        var _devices = [];
        var _deviceType = null;
        var _sharedContext = null;
        // Verify the device, theorically on OpenCL there are CL_INVALID_VALUE when devices or num_devices is null,
        // WebCL can work using default device / platform, we check only if parameter are set.
        for (var i = 0; i < num_devices; i++) {
          var _idxDevice = HEAP32[(((devices)+(i*4))>>2)];
          if (_idxDevice in CL.cl_objects) {
            _devices.push(CL.cl_objects[_idxDevice]);
          } else {
            if (cl_errcode_ret != 0) {
              HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_DEVICE;
            }
            CL.webclEndStackTrace([0,cl_errcode_ret],"devices contains an invalid device","");
            return 0;  
          }
        }
        // Verify the property
        if (properties != 0) {
          var _propertiesCounter = 0;
          while(1) {
            var _readprop = HEAP32[(((properties)+(_propertiesCounter*4))>>2)];
            if (_readprop == 0) break;
            switch (_readprop) {
              case webcl.CONTEXT_PLATFORM:
                _propertiesCounter ++;
                var _idxPlatform = HEAP32[(((properties)+(_propertiesCounter*4))>>2)];
                if (_idxPlatform in CL.cl_objects) {
                  _platform = CL.cl_objects[_idxPlatform];
                } else {
                  if (cl_errcode_ret != 0) {
                    HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_PLATFORM;
                  }
                  CL.webclEndStackTrace([0,cl_errcode_ret],"platform value specified in properties is not a valid platform","");
                  return 0;  
                }
                break;
              // /!\ This part, it's for the CL_GL_Interop --> @steven can you check if you are agree ??
              case (0x200A) /*CL_GLX_DISPLAY_KHR*/:
              case (0x2008) /*CL_GL_CONTEXT_KHR*/:
              case (0x200C) /*CL_CGL_SHAREGROUP_KHR*/:            
                _propertiesCounter ++;
                // Just one is enough 
                if (!(_webcl instanceof WebCLGL)){
                  _sharedContext = Module.ctx;
                  CL.webclCallStackTrace(""+webcl+".getExtension",["KHR_GL_SHARING"]);
                  _webcl = webcl.getExtension("KHR_GL_SHARING");
                }
                break;
              default:
                if (cl_errcode_ret != 0) {
                  HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_PROPERTY;
                }
                CL.webclEndStackTrace([0,cl_errcode_ret],"context property name '"+_readprop+"' in properties is not a supported property name","");
                return 0; 
            };
            _propertiesCounter ++;
          }
        }
        var _prop;
        if (_webcl instanceof WebCLGL) {   
          _prop = {platform: _platform, devices: _devices, deviceType: _deviceType, sharedContext: _sharedContext};
        } else {
          _prop = {platform: _platform, devices: _devices, deviceType: _deviceType};
        }
        CL.webclCallStackTrace(_webcl+".createContext",[_prop]);
        _context = _webcl.createContext(_prop)
      } catch (e) {
        var _error = CL.catchError(e);
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
        return 0; // NULL Pointer
      }
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
      _id = CL.udid(_context);
      CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
      return _id;
    }
  function _clCreateContextFromType(properties,device_type_i64_1,device_type_i64_2,pfn_notify,user_data,cl_errcode_ret) {
      // Assume the device_type is i32 
      assert(device_type_i64_2 == 0, 'Invalid device_type i64');
      CL.webclBeginStackTrace("clCreateContextFromType",[properties,device_type_i64_1,pfn_notify,user_data,cl_errcode_ret]);
      var _id = null;
      var _context = null;
      try { 
        var _webcl = webcl;
        var _platform = null;
        var _devices = null;
        var _deviceType = device_type_i64_1;
        var _sharedContext = null;
        // Verify the property
        if (properties != 0) {
          var _propertiesCounter = 0;
          while(1) {
            var _readprop = HEAP32[(((properties)+(_propertiesCounter*4))>>2)];
            if (_readprop == 0) break;
            switch (_readprop) {
              case webcl.CONTEXT_PLATFORM:
                _propertiesCounter ++;
                var _idxPlatform = HEAP32[(((properties)+(_propertiesCounter*4))>>2)];
                if (_idxPlatform in CL.cl_objects) {
                  _platform = CL.cl_objects[_idxPlatform];
                } else {
                  if (cl_errcode_ret != 0) {
                    HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_PLATFORM;
                  }
                  CL.webclEndStackTrace([0,cl_errcode_ret],"platform value specified in properties is not a valid platform","");
                  return 0;  
                }
                break;
              // /!\ This part, it's for the CL_GL_Interop --> @steven can you check if you are agree like for the clCreateContext ??
              case (0x200A) /*CL_GLX_DISPLAY_KHR*/:
              case (0x2008) /*CL_GL_CONTEXT_KHR*/:
              case (0x200C) /*CL_CGL_SHAREGROUP_KHR*/:            
                _propertiesCounter ++;
                // Just one is enough 
                if (!(_webcl instanceof WebCLGL)){
                  _sharedContext = Module.ctx;
                  CL.webclCallStackTrace(""+webcl+".getExtension",["KHR_GL_SHARING"]);
                  _webcl = webcl.getExtension("KHR_GL_SHARING");
                }
                break;
              default:
                if (cl_errcode_ret != 0) {
                  HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_PROPERTY;
                }
                CL.webclEndStackTrace([0,cl_errcode_ret],"context property name '"+_readprop+"' in properties is not a supported property name","");
                return 0; 
            };
            _propertiesCounter ++;
          }
        }
        var _prop;
        if (_webcl instanceof WebCLGL) {
          _prop = {platform: _platform, devices: _devices, deviceType: _deviceType, sharedContext: _sharedContext};
        } else {
          _prop = {platform: _platform, devices: _devices, deviceType: _deviceType};
        }
        CL.webclCallStackTrace(_webcl+".createContext",[_prop]);
        _context = _webcl.createContext(_prop)
      } catch (e) {
        var _error = CL.catchError(e);
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
        return 0; // NULL Pointer
      }
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
      _id = CL.udid(_context);
      CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
      return _id;
    }
  function _clGetContextInfo(context,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetContextInfo",[context,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (context in CL.cl_objects) {
          CL.webclCallStackTrace(""+CL.cl_objects[context]+".getInfo",[param_name]);
          var _info = CL.cl_objects[context].getInfo(param_name);
          if(typeof(_info) == "number") {
            if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
          } else if(typeof(_info) == "boolean") {
            if (param_value != 0) (_info == true) ? HEAP32[((param_value)>>2)]=1 : HEAP32[((param_value)>>2)]=0;
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
          } else if(typeof(_info) == "object") {
            if ( (_info instanceof WebCLPlatform) || (_info instanceof WebCLContextProperties)) {
              var _id = CL.udid(_info);
              if (param_value != 0) HEAP32[((param_value)>>2)]=_id;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else if (_info instanceof Array) {
              for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
                var _id = CL.udid(_info[i]);
                if (param_value != 0) HEAP32[(((param_value)+(i*4))>>2)]=_id;
              }
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=Math.min(param_value_size>>2,_info.length);
            } else if (_info == null) {
              if (param_value != 0) HEAP32[((param_value)>>2)]=0;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else {
              CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
              return webcl.INVALID_VALUE;
            }
          } else {
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
            return webcl.INVALID_VALUE;
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_CONTEXT],"context are NULL","");
          return webcl.INVALID_CONTEXT;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        if (param_value != 0) {
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
        CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
      return webcl.SUCCESS;
    }
  function _clReleaseContext(context) {
      CL.webclBeginStackTrace("clReleaseContext",[context]);
      try {
        if (context in CL.cl_objects) {
          CL.webclCallStackTrace(CL.cl_objects[context]+".release",[]);
          CL.cl_objects[context].release();
          delete CL.cl_objects[context];
          CL.cl_objects_counter--,
          console.info("Counter- HashMap Object : " + CL.cl_objects_counter);
        } else {
          CL.webclEndStackTrace([webcl.INVALID_CONTEXT],CL.cl_objects[context]+" is not a valid OpenCL context","");
          return webcl.INVALID_CONTEXT;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clCreateCommandQueue(context,device,properties_1,properties_2,cl_errcode_ret) {
      // Assume the properties is i32 
      assert(properties_2 == 0, 'Invalid properties i64');
      CL.webclBeginStackTrace("clCreateCommandQueue",[context,device,properties_1,cl_errcode_ret]);
      var _id = null;
      var _command = null;
      // Context must be created
      if (!(context in CL.cl_objects)) {
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_CONTEXT;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
        return 0; 
      }
      if (device == 0) {
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_DEVICE;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"device '"+device+"' is not a valid device","");
        return 0; 
      }
      try { 
        CL.webclCallStackTrace( CL.cl_objects[context]+".createCommandQueue",[properties_1]);
        _command = CL.cl_objects[context].createCommandQueue(device,properties_1);
      } catch (e) {
        var _error = CL.catchError(e);
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
        return 0; // NULL Pointer
      }
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
      _id = CL.udid(_command);
      CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
      return _id;
    }
  function _clGetCommandQueueInfo(command_queue,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetCommandQueueInfo",[command_queue,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (command_queue in CL.cl_objects) {
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".getInfo",[param_name]);
          var _info = CL.cl_objects[command_queue].getInfo(param_name);
          if(typeof(_info) == "number") {
            if (param_value_size == 8) {
              if (param_value != 0) (tempI64 = [_info>>>0,(Math.abs(_info) >= 1 ? (_info > 0 ? Math.min(Math.floor((_info)/4294967296), 4294967295)>>>0 : (~~(Math.ceil((_info - +(((~~(_info)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((param_value)>>2)]=tempI64[0],HEAP32[(((param_value)+(4))>>2)]=tempI64[1]);
            } else {
              if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
            } 
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
          } else if(typeof(_info) == "object") {
            if ( (_info instanceof WebCLDevice) || (_info instanceof WebCLContext)) {
              var _id = CL.udid(_info);
              if (param_value != 0) HEAP32[((param_value)>>2)]=_id;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else if (_info == null) {
              if (param_value != 0) HEAP32[((param_value)>>2)]=0;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else {
              CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
              return webcl.INVALID_VALUE;
            }
          } else {
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
            return webcl.INVALID_VALUE;
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
          return webcl.INVALID_COMMAND_QUEUE;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        if (param_value != 0) {
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
        CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
      return webcl.SUCCESS;
    }
  function _clReleaseCommandQueue(command_queue) {
      CL.webclBeginStackTrace("clReleaseCommandQueue",[command_queue]);
      try {
        if (command_queue in CL.cl_objects) {
          CL.webclCallStackTrace(CL.cl_objects[command_queue]+".release",[]);
          CL.cl_objects[command_queue].release();
          delete CL.cl_objects[command_queue];
          CL.cl_objects_counter--,
          console.info("Counter- HashMap Object : " + CL.cl_objects_counter);
        } else {
          CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],CL.cl_objects[command_queue]+" is not a valid OpenCL command_queue","");
          return webcl.INVALID_COMMAND_QUEUE;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _rand() {
      return Math.floor(Math.random()*0x80000000);
    }
  function _clCreateBuffer(context,flags_i64_1,flags_i64_2,size,host_ptr,cl_errcode_ret) {
      // Assume the flags is i32 
      assert(flags_i64_2 == 0, 'Invalid flags i64');
      CL.webclBeginStackTrace("clCreateBuffer",[flags_i64_1,size,host_ptr,cl_errcode_ret]);
      var _id = null;
      var _buffer = null;
      // Context must be created
      if (!(context in CL.cl_objects)) {
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_CONTEXT;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
        return 0; 
      }
      try {
        var _flags;
        if (flags_i64_1 & webcl.MEM_READ_WRITE) {
          _flags = webcl.MEM_READ_WRITE;
        } else if (flags_i64_1 & webcl.MEM_WRITE_ONLY) {
          _flags = webcl.MEM_WRITE_ONLY;
        } else if (flags_i64_1 & webcl.MEM_READ_ONLY) {
          _flags = webcl.MEM_READ_ONLY;
        } else {
          if (cl_errcode_ret != 0) {
            HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_VALUE;
          }
          CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
          return 0; 
        }
        var _host_ptr = null;
        if (flags_i64_1 & (1 << 4) /* CL_MEM_ALLOC_HOST_PTR */) {
          _host_ptr = new ArrayBuffer(size);
        } else if (host_ptr != 0 && (flags_i64_1 & (1 << 5) /* CL_MEM_COPY_HOST_PTR */)) {
          _host_ptr = CL.getPointerToArrayBuffer(host_ptr,size);
        } else if (flags_i64_1 & ~_flags) {
          // /!\ For the CL_MEM_USE_HOST_PTR (1 << 3)... 
          // may be i can do fake it using the same behavior than CL_MEM_COPY_HOST_PTR --> @steven What do you thing ??
          console.error("clCreateBuffer : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
        }
        CL.webclCallStackTrace( CL.cl_objects[context]+".createBuffer",[_flags,size,_host_ptr]);
        if (_host_ptr != null)
          _buffer = CL.cl_objects[context].createBuffer(_flags,size,_host_ptr);
        else
          _buffer = CL.cl_objects[context].createBuffer(_flags,size);
      } catch (e) {
        var _error = CL.catchError(e);
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
        return 0; // NULL Pointer
      }
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
      _id = CL.udid(_buffer);
      CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
      return _id;
    }
  function _clSetTypePointer(pn_type) {
      /*pn_type : CL_SIGNED_INT8,CL_SIGNED_INT16,CL_SIGNED_INT32,CL_UNSIGNED_INT8,CL_UNSIGNED_INT16,CL_UNSIGNED_INT32,CL_FLOAT*/
      switch(pn_type) {
        case webcl.SIGNED_INT8:
          console.info("clSetTypePointer : SIGNED_INT8 - "+webcl.SIGNED_INT8);
          break;
        case webcl.SIGNED_INT16:
          console.info("clSetTypePointer : SIGNED_INT16 - "+webcl.SIGNED_INT16);
          break;
        case webcl.SIGNED_INT32:
          console.info("clSetTypePointer : SIGNED_INT32 - "+webcl.SIGNED_INT32);
          break;
        case webcl.UNSIGNED_INT8:
          console.info("clSetTypePointer : UNSIGNED_INT8 - "+webcl.UNSIGNED_INT8);
          break;
        case webcl.UNSIGNED_INT16:
          console.info("clSetTypePointer : UNSIGNED_INT16 - "+webcl.UNSIGNED_INT16);
          break;
        case webcl.UNSIGNED_INT32:
          console.info("clSetTypePointer : UNSIGNED_INT32 - "+webcl.UNSIGNED_INT32);
          break;
        default:
          console.info("clSetTypePointer : FLOAT - "+webcl.FLOAT);
          break;
      }
      CL.cl_pn_type = pn_type;
      return webcl.SUCCESS;
    }
  function _clCreateSubBuffer(buffer,flags_i64_1,flags_i64_2,buffer_create_type,buffer_create_info,cl_errcode_ret) {
      // Assume the flags is i32 
      assert(flags_i64_2 == 0, 'Invalid flags i64');
      CL.webclBeginStackTrace("clCreateSubBuffer",[buffer,flags_i64_1,buffer_create_type,buffer_create_info,cl_errcode_ret]);
      var _id = null;
      var _subbuffer = null;
      // Context must be created
      if (!(buffer in CL.cl_objects)) {
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_MEM_OBJECT;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"Mem object '"+buffer+"' is not a valid buffer","");
        return 0; 
      }
      try {
        var _flags;
        var _origin;
        var _sizeInBytes;
        if (flags_i64_1 & webcl.MEM_READ_WRITE) {
          _flags = webcl.MEM_READ_WRITE;
        } else if (flags_i64_1 & webcl.MEM_WRITE_ONLY) {
          _flags = webcl.MEM_WRITE_ONLY;
        } else if (flags_i64_1 & webcl.MEM_READ_ONLY) {
          _flags = webcl.MEM_READ_ONLY;
        } else {
          if (cl_errcode_ret != 0) {
            HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_VALUE;
          }
          CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
          return 0; 
        }
        if (flags_i64_1 & ~_flags) {
          console.error("clCreateSubBuffer : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
        }
        if (buffer_create_info != 0) {
          _origin = HEAP32[((buffer_create_info)>>2)];
          _sizeInBytes = HEAP32[(((buffer_create_info)+(4))>>2)];
        } else {
          if (cl_errcode_ret != 0) {
            HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_VALUE;
          }
          CL.webclEndStackTrace([0,cl_errcode_ret],"buffer_create_info is NULL","");
          return 0; 
        }
        CL.webclCallStackTrace( CL.cl_objects[buffer]+".createSubBuffer",[_flags,_origin,_sizeInBytes]);
        _subbuffer = CL.cl_objects[buffer].createSubBuffer(_flags,_origin,_sizeInBytes);
      } catch (e) {
        var _error = CL.catchError(e);
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
        return 0; // NULL Pointer
      }
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
      _id = CL.udid(_subbuffer);
      CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
      return _id;
    }
  function _clCreateImage2D(context,flags_i64_1,flags_i64_2,image_format,image_width,image_height,image_row_pitch,host_ptr,cl_errcode_ret) {
      // Assume the flags is i32 
      assert(flags_i64_2 == 0, 'Invalid flags i64');
      CL.webclBeginStackTrace("clCreateImage2D",[context,flags_i64_1,image_format,image_width,image_height,image_row_pitch,host_ptr,cl_errcode_ret]);
      var _id = null;
      var _image = null;
      // Context must be created
      if (!(context in CL.cl_objects)) {
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_CONTEXT;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
        return 0; 
      }
      try {
        var _flags;
        if (flags_i64_1 & webcl.MEM_READ_WRITE) {
          _flags = webcl.MEM_READ_WRITE;
        } else if (flags_i64_1 & webcl.MEM_WRITE_ONLY) {
          _flags = webcl.MEM_WRITE_ONLY;
        } else if (flags_i64_1 & webcl.MEM_READ_ONLY) {
          _flags = webcl.MEM_READ_ONLY;
        } else {
          if (cl_errcode_ret != 0) {
            HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_VALUE;
          }
          CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
          return 0; 
        }
        var _host_ptr = null;
        var _channel_order = webcl.RGBA;
        var _channel_type = webcl.UNORM_INT8;
        if (image_format != 0) {
          _channel_order = HEAP32[((image_format)>>2)];
          _channel_type = HEAP32[(((image_format)+(4))>>2)];
        } else {
          if (cl_errcode_ret != 0) {
            HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_IMAGE_FORMAT_DESCRIPTOR;
          }
          CL.webclEndStackTrace([0,cl_errcode_ret],"image_format is NULL","");
          return 0; 
        }
        // There are no possibility to know the size of the host_ptr --> @steven What do you thing ?
        var _sizeInByte = 0;
        var _size = 0;
        if (host_ptr != 0 ) {
          if (cl_errcode_ret != 0) {
            HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_HOST_PTR;
          }
          CL.webclEndStackTrace([0,cl_errcode_ret],"Can't have the size of the host_ptr","");
          return 0;
        }
        if (flags_i64_1 & (1 << 4) /* CL_MEM_ALLOC_HOST_PTR */) {
          _host_ptr = new ArrayBuffer(_sizeInByte);
        } else if (host_ptr != 0 && (flags_i64_1 & (1 << 5) /* CL_MEM_COPY_HOST_PTR */)) {
          _host_ptr = CL.getPointerToArrayBuffer(host_ptr,size);
        } else if (flags_i64_1 & ~_flags) {
          // /!\ For the CL_MEM_USE_HOST_PTR (1 << 3)... 
          // ( Same question : clCreateBuffer )
          // may be i can do fake it using the same behavior than CL_MEM_COPY_HOST_PTR --> @steven What do you thing ??
          console.error("clCreateImage2D : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
        }
        var _descriptor = {channelOrder:_channel_order, channelType:_channel_type, width:image_width, height:image_height, rowPitch:image_row_pitch }
        CL.webclCallStackTrace( CL.cl_objects[context]+".createImage",[_flags,_descriptor,_host_ptr]);
        if (_host_ptr != null)
          _image = CL.cl_objects[context].createImage(_flags,_descriptor,_host_ptr);
        else
          _image = CL.cl_objects[context].createImage(_flags,_descriptor);
      } catch (e) {
        var _error = CL.catchError(e);
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
        return 0; // NULL Pointer
      }
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
      _id = CL.udid(_image);
      CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
      return _id;
    }
  function _clGetMemObjectInfo(memobj,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetMemObjectInfo",[memobj,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (memobj in CL.cl_objects) {
          CL.webclCallStackTrace(""+CL.cl_objects[memobj]+".getInfo",[param_name]);
          var _info = CL.cl_objects[memobj].getInfo(param_name);
          if(typeof(_info) == "number") {
            if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
          } else if(typeof(_info) == "object") {
            if (_info instanceof WebCLBuffer) {
              var _id = CL.udid(_info);
              if (param_value != 0) HEAP32[((param_value)>>2)]=_id;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else if (_info == null) {
              if (param_value != 0) HEAP32[((param_value)>>2)]=0;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else {
              console.error("clGetMemObjectInfo : "+typeof(_info)+" not yet implemented");
            }
          } else {
            console.error("clGetMemObjectInfo : "+typeof(_info)+" not yet implemented");
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"memobj are NULL","");
          return webcl.INVALID_MEM_OBJECT;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        if (param_value != 0) {
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
        CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
      return webcl.SUCCESS;
    }
  function _clGetImageInfo(image,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetImageInfo",[image,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (image in CL.cl_objects) {
          CL.webclCallStackTrace(""+CL.cl_objects[image]+".getInfo",[param_name]);
          var _info = CL.cl_objects[image].getInfo(param_name);
          switch (param_name) {
            case (webcl.IMAGE_FORMAT) :
              if (param_value != 0) HEAP32[((param_value)>>2)]=_info.channelOrder;
              if (param_value != 0) HEAP32[(((param_value)+(4))>>2)]=_info.channelType;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
              break;
            case (webcl.IMAGE_ELEMENT_SIZE) :
              //  Not sure how I can know the element size ... It's depending of the channelType I suppose --> @steven Your opinion about that ??
              if (param_value != 0) HEAP32[((param_value)>>2)]=4;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
              break;
            case (webcl.IMAGE_ROW_PITCH) :
              if (param_value != 0) HEAP32[((param_value)>>2)]=_info.rowPitch;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
              break;
            case (webcl.IMAGE_WIDTH) :
              if (param_value != 0) HEAP32[((param_value)>>2)]=_info.width;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
              break;
            case (webcl.IMAGE_HEIGHT) :
              if (param_value != 0) HEAP32[((param_value)>>2)]=_info.height;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
              break;
            default:
              CL.webclEndStackTrace([webcl.INVALID_VALUE],param_name+" not yet implemente","");
              return webcl.INVALID_VALUE;
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"image are NULL","");
          return webcl.INVALID_MEM_OBJECT;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        if (param_value != 0) {
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
        CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
      return webcl.SUCCESS;
    }
  function _clReleaseMemObject(memobj) {
      CL.webclBeginStackTrace("clReleaseMemObject",[memobj]);
      try {
        if (memobj in CL.cl_objects) {
          CL.webclCallStackTrace(CL.cl_objects[memobj]+".release",[]);
          CL.cl_objects[memobj].release();
          delete CL.cl_objects[memobj];
          CL.cl_objects_counter--,
          console.info("Counter- HashMap Object : " + CL.cl_objects_counter);
        } else {
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],CL.cl_objects[memobj]+" is not a valid OpenCL memobj","");
          return webcl.INVALID_MEM_OBJECT;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clGetSupportedImageFormats(context,flags_i64_1,flags_i64_2,image_type,num_entries,image_formats,num_image_formats) {
      // Assume the flags is i32 
      assert(flags_i64_2 == 0, 'Invalid flags i64');
      CL.webclBeginStackTrace("clGetSupportedImageFormats",[context,flags_i64_1,image_type,num_entries,image_formats,num_image_formats]);
      // Context must be created
      if (!(context in CL.cl_objects)) {
        CL.webclEndStackTrace([webcl.INVALID_CONTEXT],"context '"+context+"' is not a valid context","");
        return webcl.INVALID_CONTEXT; 
      }
      if (image_type != webcl.MEM_OBJECT_IMAGE2D) {
        CL.webclEndStackTrace([webcl.CL_INVALID_VALUE],"image_type "+image_type+" are not valid","");
        return webcl.CL_INVALID_VALUE;       
      }
      try {
        var _flags;
        if (flags_i64_1 & webcl.MEM_READ_WRITE) {
          _flags = webcl.MEM_READ_WRITE;
        } else if (flags_i64_1 & webcl.MEM_WRITE_ONLY) {
          _flags = webcl.MEM_WRITE_ONLY;
        } else if (flags_i64_1 & webcl.MEM_READ_ONLY) {
          _flags = webcl.MEM_READ_ONLY;
        } else {
          CL.webclEndStackTrace([webcl.INVALID_VALUE],"values specified "+flags_i64_1+" in flags are not valid","");
          return webcl.INVALID_VALUE; 
        }
        if (flags_i64_1 & ~_flags) {
          console.error("clGetSupportedImageFormats : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
        }
        CL.webclCallStackTrace(CL.cl_objects[context]+".getSupportedImageFormats",[_flags]);
        var _descriptor_list = CL.cl_objects[context].getSupportedImageFormats(_flags);
        var _counter = 0;
        for (var i = 0; i < Math.min(num_entries,_descriptor_list.length); i++) {
          var _descriptor = _descriptor_list[i];
          if (image_formats != 0) {
            HEAP32[(((image_formats)+(_counter*4))>>2)]=_descriptor.channelOrder;
            _counter++;
            HEAP32[(((image_formats)+(_counter*4))>>2)]=_descriptor.channelType;
            _counter++;
          }
        }
        if (num_image_formats != 0) {
          HEAP32[((num_image_formats)>>2)]=_descriptor_list.length;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _llvm_stacksave() {
      var self = _llvm_stacksave;
      if (!self.LLVM_SAVEDSTACKS) {
        self.LLVM_SAVEDSTACKS = [];
      }
      self.LLVM_SAVEDSTACKS.push(Runtime.stackSave());
      return self.LLVM_SAVEDSTACKS.length-1;
    }
  function _llvm_stackrestore(p) {
      var self = _llvm_stacksave;
      var ret = self.LLVM_SAVEDSTACKS[p];
      self.LLVM_SAVEDSTACKS.splice(p, 1);
      Runtime.stackRestore(ret);
    }
  function _clCreateSampler(context,normalized_coords,addressing_mode,filter_mode,cl_errcode_ret) {
      CL.webclBeginStackTrace("clCreateSampler",[context,normalized_coords,addressing_mode,filter_mode,cl_errcode_ret]);
      var _id = null;
      var _sampler = null;
      // Context must be created
      if (!(context in CL.cl_objects)) {
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_CONTEXT;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
        return 0; 
      }
      try {
        CL.webclCallStackTrace( CL.cl_objects[context]+".createSampler",[normalized_coords,addressing_mode,filter_mode]);
        _sampler = CL.cl_objects[context].createSampler(normalized_coords,addressing_mode,filter_mode);
      } catch (e) {
        var _error = CL.catchError(e);
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
        return 0; // NULL Pointer
      }
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
      _id = CL.udid(_sampler);
      CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
      return _id;
    }
  function _clGetSamplerInfo(sampler,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetSamplerInfo",[sampler,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (sampler in CL.cl_objects) {
          CL.webclCallStackTrace(""+CL.cl_objects[sampler]+".getInfo",[param_name]);
          var _info = CL.cl_objects[sampler].getInfo(param_name);
          if(typeof(_info) == "number") {
            if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
          } else if(typeof(_info) == "boolean") {
            if (param_value != 0) (_info == true) ? HEAP32[((param_value)>>2)]=1 : HEAP32[((param_value)>>2)]=0;
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
          } else if(typeof(_info) == "object") {
            if (_info instanceof WebCLContext) {
              var _id = CL.udid(_info);
              if (param_value != 0) HEAP32[((param_value)>>2)]=_id;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else if (_info == null) {
              if (param_value != 0) HEAP32[((param_value)>>2)]=0;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else {
              CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
              return webcl.INVALID_VALUE;
            }
          } else {
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
            return webcl.INVALID_VALUE;
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_CONTEXT],"sampler are NULL","");
          return webcl.INVALID_SAMPLER;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        if (param_value != 0) {
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
        CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
      return webcl.SUCCESS;
    }
  function _clReleaseSampler(sampler) {
      CL.webclBeginStackTrace("clReleaseSampler",[sampler]);
      try {
        if (sampler in CL.cl_objects) {
          CL.webclCallStackTrace(CL.cl_objects[sampler]+".release",[]);
          CL.cl_objects[sampler].release();
          delete CL.cl_objects[sampler];
          CL.cl_objects_counter--,
          console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + sampler);
        } else {
          CL.webclEndStackTrace([webcl.INVALID_SAMPLER],CL.cl_objects[sampler]+" is not a valid OpenCL sampler","");
          return webcl.INVALID_SAMPLER;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clCreateProgramWithSource(context,count,strings,lengths,cl_errcode_ret) {
      CL.webclBeginStackTrace("clCreateProgramWithSource",[context,count,strings,lengths,cl_errcode_ret]);
      var _id = null;
      var _program = null;
      // Context must be created
      if (!(context in CL.cl_objects)) {
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_CONTEXT;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
        return 0; 
      }
      try {
        var _string = Pointer_stringify(HEAP32[((strings)>>2)]); 
        CL.webclCallStackTrace( CL.cl_objects[context]+".createProgramWithSource",[_string]);
        _program = CL.cl_objects[context].createProgram(_string);
      } catch (e) {
        var _error = CL.catchError(e);
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
        return 0; // NULL Pointer
      }
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
      _id = CL.udid(_program);
      CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
      return _id;
    }
  function _clReleaseProgram(program) {
      CL.webclBeginStackTrace("clReleaseProgram",[program]);
      try {
        if (program in CL.cl_objects) {
          CL.webclCallStackTrace(CL.cl_objects[program]+".release",[]);
          CL.cl_objects[program].release();
          delete CL.cl_objects[program];
          CL.cl_objects_counter--,
          console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + program);
        } else {
          CL.webclEndStackTrace([webcl.INVALID_SAMPLER],CL.cl_objects[program]+" is not a valid OpenCL program","");
          return webcl.INVALID_PROGRAM;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clBuildProgram(program,num_devices,device_list,options,pfn_notify,user_data) {
      CL.webclBeginStackTrace("clBuildProgram",[program,num_devices,device_list,options,pfn_notify,user_data]);
      // Program must be created
      if (!(program in CL.cl_objects)) {
        CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program '"+program+"' is not a valid program","");
        return webcl.INVALID_PROGRAM; 
      }
      try {
        var _devices = [];
        var _option = (options == 0) ? "" : Pointer_stringify(options); 
        if (device_list != 0 && num_devices > 0 ) {
          for (var i = 0; i < num_devices ; i++) {
            var _device = HEAP32[(((device_list)+(i*4))>>2)]
            if (_device in CL.cl_objects) {
              _devices.push(CL.cl_objects[_device]);
            }
          }
        }
        // Need to call this code inside the callback event WebCLCallback.
        // if (pfn_notify != 0) {
        //  FUNCTION_TABLE[pfn_notify](program, user_data);
        // }
        CL.webclCallStackTrace(CL.cl_objects[program]+".build",[_devices,_option]);
        CL.cl_objects[program].build(_devices,_option,null,null);
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;      
    }
  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
  function _clGetProgramBuildInfo(program,device,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetProgramBuildInfo",[program,device,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (program in CL.cl_objects) {
          if (device in CL.cl_objects) {
            CL.webclCallStackTrace(""+CL.cl_objects[program]+".getBuildInfo",[device,param_name]);
            var _info = CL.cl_objects[program].getBuildInfo(CL.cl_objects[device], param_name);
            if(typeof(_info) == "number") {
              if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else if(typeof(_info) == "string") {
              if (param_value != 0) {
                writeStringToMemory(_info, param_value);
              }
              if (param_value_size_ret != 0) {
                HEAP32[((param_value_size_ret)>>2)]=Math.min(param_value_size,_info.length);
              }
            } else {
              CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
              return webcl.INVALID_VALUE;
            }
          } else {
            CL.webclEndStackTrace([webcl.INVALID_DEVICE],"device are NULL","");
            return webcl.INVALID_DEVICE;
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program are NULL","");
          return webcl.INVALID_PROGRAM;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        if (param_value != 0) {
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
        CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
      return webcl.SUCCESS;
    }
  function _clGetProgramInfo(program,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetProgramInfo",[program,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (program in CL.cl_objects) {
          CL.webclCallStackTrace(""+CL.cl_objects[program]+".getInfo",[param_name]);
          var _info = CL.cl_objects[program].getInfo(param_name);
          if(typeof(_info) == "number") {
            if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
          } else if(typeof(_info) == "string") {
            if (param_value != 0) {
              writeStringToMemory(_info, param_value);
            }
            if (param_value_size_ret != 0) {
              HEAP32[((param_value_size_ret)>>2)]=Math.min(param_value_size,_info.length);
            }
          } else if(typeof(_info) == "object") {
            if (_info instanceof WebCLContext) {
              var _id = CL.udid(_info);
              if (param_value != 0) HEAP32[((param_value)>>2)]=_id;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else if (_info instanceof Array) {
              for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
                var _id = CL.udid(_info[i]);
                if (param_value != 0) HEAP32[(((param_value)+(i*4))>>2)]=_id;
              }
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=Math.min(param_value_size>>2,_info.length);
            } else if (_info == null) {
              if (param_value != 0) HEAP32[((param_value)>>2)]=0;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else {
              CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
              return webcl.INVALID_VALUE;
            }
          } else {
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
            return webcl.INVALID_VALUE;
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program are NULL","");
          return webcl.INVALID_PROGRAM;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        if (param_value != 0) {
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
        CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
      return webcl.SUCCESS;
    }
  function _clCreateKernel(program,kernel_name,cl_errcode_ret) {
      CL.webclBeginStackTrace("clCreateKernel",[program,kernel_name,cl_errcode_ret]);
      var _id = null;
      var _kernel = null;
      var _name = (kernel_name == 0) ? "" : Pointer_stringify(kernel_name);
      // program must be created
      if (!(program in CL.cl_objects)) {
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_PROGRAM;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"program '"+program+"' is not a valid program","");
        return 0; 
      }
      try {
        CL.webclCallStackTrace( CL.cl_objects[program]+".createKernel",[_name]);
        _kernel = CL.cl_objects[program].createKernel(_name);
      } catch (e) {
        var _error = CL.catchError(e);
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
        CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
        return 0; // NULL Pointer
      }
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
      _id = CL.udid(_kernel);
      CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
      return _id;
    }
  function _clCreateKernelsInProgram(program,num_kernels,kernels,num_kernels_ret) {
      CL.webclBeginStackTrace("clCreateKernelsInProgram",[program,num_kernels,kernels,num_kernels_ret]);
      // program must be created
      if (!(program in CL.cl_objects)) {
        CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program '"+program+"' is not a valid program","");
        return webcl.INVALID_PROGRAM; 
      }
      try {
        CL.webclCallStackTrace( CL.cl_objects[program]+".createKernelsInProgram",[]);
        var _kernels = CL.cl_objects[program].createKernelsInProgram();
        for (var i = 0; i < Math.min(num_kernels,_kernels.length); i++) {
          var _id = CL.udid(_kernels[i]);
          if (kernels != 0) HEAP32[(((kernels)+(i*4))>>2)]=_id;
        }
        if (num_kernels_ret != 0) HEAP32[((num_kernels_ret)>>2)]=Math.min(num_kernels,_kernels.length);
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error; 
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clReleaseKernel(kernel) {
      CL.webclBeginStackTrace("clReleaseKernel",[kernel]);
      try {
        if (kernel in CL.cl_objects) {
          CL.webclCallStackTrace(CL.cl_objects[kernel]+".release",[]);
          CL.cl_objects[kernel].release();
          delete CL.cl_objects[kernel];
          CL.cl_objects_counter--,
          console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + kernel);
        } else {
          CL.webclEndStackTrace([webcl.INVALID_KERNEL],CL.cl_objects[kernel]+" is not a valid OpenCL kernel","");
          return webcl.INVALID_KERNEL;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clSetKernelArg(kernel,arg_index,arg_size,arg_value) {
      CL.webclBeginStackTrace("clSetKernelArg",[kernel,arg_index,arg_size,arg_value]);
      try {
        console.info("/!\\ ***************************************************** ");
        console.info("/!\\ clSetKernelArg, not yet fully implemented and tested. ");
        console.info("/!\\ May be need to plug again the kernel parser.");
        console.info("/!\\ Could be give problem with LOCAL_MEMORY_SIZE !.");
        console.info("/!\\ ***************************************************** ");
        console.info("");
        if (kernel in CL.cl_objects) {
          var _size = arg_size >> 2
          var _type = WebCLKernelArgumentTypes;
          var _value = null;
          // 1 ) arg_value is not null
          if (arg_value != 0) {
            // 1.1 ) arg_value is an array
            if (_size > 1) {
              _value = new ArrayBuffer(size);
              // 1.1.1 ) arg_value is an array of float
              if (CL.cl_pn_type == 0 || CL.cl_pn_type == webcl.FLOAT) {
                _type = WebCLKernelArgumentTypes.FLOAT;
                for (var i = 0; i < _size; i++ ) {
                  _value[i] = HEAPF32[(((arg_value)+(i*4))>>2)];
                }
              } 
              // 1.1.2 ) arg_value is an array of int
              else {
                _type = WebCLKernelArgumentTypes.INT;
                for (var i = 0; i < _size; i++ ) {
                  _value[i] = HEAP32[(((arg_value)+(i*4))>>2)];
                }
              }
            } 
            // 1.2 ) arg_value is a value
            else {
              // 1.2.1 ) arg_value is a float
              if (CL.cl_pn_type == 0 || CL.cl_pn_type == webcl.FLOAT) {
                _type = WebCLKernelArgumentTypes.FLOAT;
                _value = HEAPF32[((arg_value)>>2)];
              } 
              // 1.2.2 ) arg_value is a int
              else {
                _type = WebCLKernelArgumentTypes.INT;
                _value = HEAP32[((arg_value)>>2)];
              }
            }
            // 1.3 ) arg_value is may be an object .. check ...
            if (_value in CL.cl_objects) {
              _value = CL.cl_objects[_value];
              CL.webclCallStackTrace(CL.cl_objects[kernel]+".setArg",[arg_index,_value]);
              CL.cl_objects[kernel].setArg(arg_index,_value);
            } else {
              CL.webclCallStackTrace(CL.cl_objects[kernel]+".setArg",[arg_index,_value,_type]);
              CL.cl_objects[kernel].setArg(arg_index,_value,_type);
            }
          }  
          // 2 ) arg_value is null
          else {
            _type = WebCLKernelArgumentTypes.LOCAL_MEMORY_SIZE;
            CL.webclCallStackTrace(CL.cl_objects[kernel]+".setArg",[arg_index,arg_size,_type]);
            CL.cl_objects[kernel].setArg(arg_index,arg_size,_type);
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_KERNEL],CL.cl_objects[kernel]+" is not a valid OpenCL kernel","");
          return webcl.INVALID_KERNEL;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clGetKernelWorkGroupInfo(kernel,device,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetKernelWorkGroupInfo",[kernel,device,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (kernel in CL.cl_objects) {
          if (device in CL.cl_objects) {
            CL.webclCallStackTrace(""+CL.cl_objects[kernel]+".getWorkGroupInfo",[device,param_name]);
            var _info = CL.cl_objects[kernel].getWorkGroupInfo(CL.cl_objects[device], param_name);
            if(typeof(_info) == "number") {
              if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else if (_info instanceof Int32Array) {
              for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
                if (param_value != 0) HEAP32[(((param_value)+(i*4))>>2)]=_info[i];
              }
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=Math.min(param_value_size>>2,_info.length);
            } else {
              CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
              return webcl.INVALID_VALUE;
            }
          } else {
            CL.webclEndStackTrace([webcl.INVALID_DEVICE],"device are NULL","");
            return webcl.INVALID_DEVICE;
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_KERNEL],"kernel are NULL","");
          return webcl.INVALID_KERNEL;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        if (param_value != 0) {
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
        CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
      return webcl.SUCCESS;
    }
  function _clGetKernelInfo(kernel,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetKernelInfo",[kernel,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (kernel in CL.cl_objects) {
          CL.webclCallStackTrace(""+CL.cl_objects[kernel]+".getInfo",[param_name]);
          var _info = CL.cl_objects[kernel].getInfo(param_name);
          if(typeof(_info) == "number") {
            if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
          } else if(typeof(_info) == "string") {
            if (param_value != 0) {
              writeStringToMemory(_info, param_value);
            }
            if (param_value_size_ret != 0) {
              HEAP32[((param_value_size_ret)>>2)]=Math.min(param_value_size,_info.length);
            }
          } else if(typeof(_info) == "object") {
            if ( (_info instanceof WebCLContext) || (_info instanceof WebCLProgram) ){
              var _id = CL.udid(_info);
              if (param_value != 0) HEAP32[((param_value)>>2)]=_id;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else if (_info == null) {
              if (param_value != 0) HEAP32[((param_value)>>2)]=0;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=1;
            } else {
              CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
              return webcl.INVALID_VALUE;
            }
          } else {
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
            return webcl.INVALID_VALUE;
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_KERNEL],"kernel are NULL","");
          return webcl.INVALID_KERNEL;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        if (param_value != 0) {
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=0;
        }
        CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
      return webcl.SUCCESS;
    }
  function _abort() {
      Module['abort']();
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
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
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
GL.init()
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var FUNCTION_TABLE = [0,0,_pfn_notify_program];
// EMSCRIPTEN_START_FUNCS
function _print_stack() {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $size=sp;
 var $webcl_stack;
 var $call=_printf(((2904)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 HEAP32[(($size)>>2)]=0;
 var $call1=_webclPrintStackTrace(0, $size);
 var $0=HEAP32[(($size)>>2)];
 var $add=((($0)+(1))|0);
 var $call2=_malloc($add);
 $webcl_stack=$call2;
 var $1=HEAP32[(($size)>>2)];
 var $2=$webcl_stack;
 var $arrayidx=(($2+$1)|0);
 HEAP8[($arrayidx)]=0;
 var $3=$webcl_stack;
 var $call3=_webclPrintStackTrace($3, $size);
 var $4=$webcl_stack;
 var $call4=_printf(((2656)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$4,tempVarArgs)); STACKTOP=tempVarArgs;
 var $call5=_printf(((2312)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $5=$webcl_stack;
 _free($5);
 STACKTOP = sp;
 return;
}
function _end($e) {
 var label = 0;
 var $e_addr;
 $e_addr=$e;
 _print_stack();
 var $0=$e_addr;
 return $0;
}
function _pfn_notify_program($program, $user_data) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $program_addr;
 var $user_data_addr;
 $program_addr=$program;
 $user_data_addr=$user_data;
 var $0=$user_data_addr;
 var $1=$0;
 var $2=$program_addr;
 var $3=$2;
 var $call=_printf(((2016)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1,HEAP32[(((tempVarArgs)+(8))>>2)]=$3,tempVarArgs)); STACKTOP=tempVarArgs;
 STACKTOP = sp;
 return;
}
function _main($argc, $argv) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 3080)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $retval;
   var $argc_addr=sp;
   var $argv_addr;
   var $err=(sp)+(8);
   var $num_platforms=(sp)+(16);
   var $first_platform_id=(sp)+(24);
   var $counter;
   var $i;
   var $use_gpu;
   var $buffer=(sp)+(32);
   var $size=(sp)+(1056);
   var $first_device_id=(sp)+(1064);
   var $num_devices=(sp)+(1072);
   var $array_type=(sp)+(1080);
   var $i61;
   var $array_info=(sp)+(1120);
   var $value=(sp)+(1424);
   var $i103;
   var $extensions=(sp)+(1432);
   var $array=(sp)+(2456);
   var $ul=(sp)+(2472);
   var $cl_errcode_ret=(sp)+(2480);
   var $context;
   var $contextFromType;
   var $properties=(sp)+(2488);
   var $properties149=(sp)+(2512);
   var $properties159=(sp)+(2544);
   var $i169;
   var $properties185=(sp)+(2560);
   var $properties192=(sp)+(2584);
   var $properties206=(sp)+(2616);
   var $array_context_info=(sp)+(2632);
   var $i221;
   var $queue;
   var $queue_to_release;
   var $array_command_info=(sp)+(2656);
   var $i264;
   var $array_buffer_flags=(sp)+(2672);
   var $buff;
   var $pixelCount;
   var $pixels;
   var $sizeBytes;
   var $pixels2;
   var $sizeBytes2;
   var $i305;
   var $region1=(sp)+(2696);
   var $region2=(sp)+(2704);
   var $region3=(sp)+(2712);
   var $region4=(sp)+(2720);
   var $subbuffer;
   var $i345;
   var $image;
   var $img_fmt=(sp)+(2728);
   var $img_fmt2=(sp)+(2736);
   var $img_fmt3=(sp)+(2744);
   var $width;
   var $height;
   var $i379;
   var $array_mem_info=(sp)+(2752);
   var $i418;
   var $array_img_info=(sp)+(2792);
   var $i438;
   var $uiNumSupportedFormats=(sp)+(2824);
   var $i464;
   var $saved_stack;
   var $i475;
   var $addr=(sp)+(2832);
   var $filter=(sp)+(2856);
   var $boolean=(sp)+(2864);
   var $i494;
   var $j;
   var $k;
   var $sampler;
   var $sampler525;
   var $array_sampler_info=(sp)+(2872);
   var $i529;
   var $program;
   var $program2;
   var $options=(sp)+(2896);
   var $i598;
   var $array_program_build_info=(sp)+(2952);
   var $i617;
   var $array_program_info=(sp)+(2968);
   var $i632;
   var $kernel;
   var $kernel2=(sp)+(3000);
   var $count=(sp)+(3008);
   var $saved_stack674;
   var $input=(sp)+(3016);
   var $output=(sp)+(3024);
   var $array_kernel_work_info=(sp)+(3032);
   var $i712;
   var $array_kernel_info=(sp)+(3056);
   var $i727;
   var $cleanup_dest_slot;
   $retval=0;
   HEAP32[(($argc_addr)>>2)]=$argc;
   $argv_addr=$argv;
   var $0=$argv_addr;
   _glutInit($argc_addr, $0);
   _glutInitDisplayMode(18);
   _glutInitWindowSize(256, 256);
   var $1=$argv_addr;
   var $arrayidx=(($1)|0);
   var $2=HEAP32[(($arrayidx)>>2)];
   var $call=_glutCreateWindow($2);
   $counter=0;
   $i=0;
   $use_gpu=1;
   label = 2; break;
  case 2: 
   var $3=$i;
   var $4=HEAP32[(($argc_addr)>>2)];
   var $cmp=(($3)|(0)) < (($4)|(0));
   if ($cmp) { label = 3; break; } else { var $6 = 0;label = 4; break; }
  case 3: 
   var $5=$argv_addr;
   var $tobool=(($5)|(0))!=0;
   var $6 = $tobool;label = 4; break;
  case 4: 
   var $6;
   if ($6) { label = 5; break; } else { label = 14; break; }
  case 5: 
   var $7=$i;
   var $8=$argv_addr;
   var $arrayidx1=(($8+($7<<2))|0);
   var $9=HEAP32[(($arrayidx1)>>2)];
   var $tobool2=(($9)|(0))!=0;
   if ($tobool2) { label = 7; break; } else { label = 6; break; }
  case 6: 
   label = 13; break;
  case 7: 
   var $10=$i;
   var $11=$argv_addr;
   var $arrayidx3=(($11+($10<<2))|0);
   var $12=HEAP32[(($arrayidx3)>>2)];
   var $call4=_strstr($12, ((1696)|0));
   var $tobool5=(($call4)|(0))!=0;
   if ($tobool5) { label = 8; break; } else { label = 9; break; }
  case 8: 
   $use_gpu=0;
   label = 12; break;
  case 9: 
   var $13=$i;
   var $14=$argv_addr;
   var $arrayidx7=(($14+($13<<2))|0);
   var $15=HEAP32[(($arrayidx7)>>2)];
   var $call8=_strstr($15, ((1408)|0));
   var $tobool9=(($call8)|(0))!=0;
   if ($tobool9) { label = 10; break; } else { label = 11; break; }
  case 10: 
   $use_gpu=1;
   label = 11; break;
  case 11: 
   label = 12; break;
  case 12: 
   label = 13; break;
  case 13: 
   var $16=$i;
   var $inc=((($16)+(1))|0);
   $i=$inc;
   label = 2; break;
  case 14: 
   var $17=$use_gpu;
   var $cmp13=(($17)|(0))==1;
   var $cond=$cmp13 ? (((936)|0)) : (((688)|0));
   var $call14=_printf(((1152)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$cond,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call15=_printf(((2872)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call16=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call17=_clGetPlatformIDs(0, 0, 0);
   HEAP32[(($err)>>2)]=$call17;
   var $18=$counter;
   var $inc18=((($18)+(1))|0);
   $counter=$inc18;
   var $19=HEAP32[(($err)>>2)];
   var $call19=_printf(((2832)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc18,HEAP32[(((tempVarArgs)+(8))>>2)]=$19,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call20=_clGetPlatformIDs(0, $first_platform_id, 0);
   HEAP32[(($err)>>2)]=$call20;
   var $20=$counter;
   var $inc21=((($20)+(1))|0);
   $counter=$inc21;
   var $21=HEAP32[(($err)>>2)];
   var $22=HEAP32[(($first_platform_id)>>2)];
   var $23=$22;
   var $call22=_printf(((2816)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc21,HEAP32[(((tempVarArgs)+(8))>>2)]=$21,HEAP32[(((tempVarArgs)+(16))>>2)]=$23,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call23=_clGetPlatformIDs(0, 0, $num_platforms);
   HEAP32[(($err)>>2)]=$call23;
   var $24=$counter;
   var $inc24=((($24)+(1))|0);
   $counter=$inc24;
   var $25=HEAP32[(($err)>>2)];
   var $26=HEAP32[(($num_platforms)>>2)];
   var $call25=_printf(((2816)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc24,HEAP32[(((tempVarArgs)+(8))>>2)]=$25,HEAP32[(((tempVarArgs)+(16))>>2)]=$26,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call26=_clGetPlatformIDs(2, 0, $num_platforms);
   HEAP32[(($err)>>2)]=$call26;
   var $27=$counter;
   var $inc27=((($27)+(1))|0);
   $counter=$inc27;
   var $28=HEAP32[(($err)>>2)];
   var $29=HEAP32[(($num_platforms)>>2)];
   var $call28=_printf(((2816)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc27,HEAP32[(((tempVarArgs)+(8))>>2)]=$28,HEAP32[(((tempVarArgs)+(16))>>2)]=$29,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call29=_clGetPlatformIDs(1, $first_platform_id, 0);
   HEAP32[(($err)>>2)]=$call29;
   var $30=$counter;
   var $inc30=((($30)+(1))|0);
   $counter=$inc30;
   var $31=HEAP32[(($err)>>2)];
   var $32=HEAP32[(($first_platform_id)>>2)];
   var $33=$32;
   var $call31=_printf(((2816)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc30,HEAP32[(((tempVarArgs)+(8))>>2)]=$31,HEAP32[(((tempVarArgs)+(16))>>2)]=$33,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call32=_clGetPlatformIDs(1, $first_platform_id, $num_platforms);
   HEAP32[(($err)>>2)]=$call32;
   var $34=$counter;
   var $inc33=((($34)+(1))|0);
   $counter=$inc33;
   var $35=HEAP32[(($err)>>2)];
   var $36=HEAP32[(($first_platform_id)>>2)];
   var $37=$36;
   var $38=HEAP32[(($num_platforms)>>2)];
   var $call34=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc33,HEAP32[(((tempVarArgs)+(8))>>2)]=$35,HEAP32[(((tempVarArgs)+(16))>>2)]=$37,HEAP32[(((tempVarArgs)+(24))>>2)]=$38,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call35=_printf(((2760)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call36=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   var $arraydecay=(($buffer)|0);
   var $call37=_clGetPlatformInfo(0, 2304, 1024, $arraydecay, 0);
   HEAP32[(($err)>>2)]=$call37;
   var $39=$counter;
   var $inc38=((($39)+(1))|0);
   $counter=$inc38;
   var $40=HEAP32[(($err)>>2)];
   var $arraydecay39=(($buffer)|0);
   var $call40=_printf(((2744)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc38,HEAP32[(((tempVarArgs)+(8))>>2)]=$40,HEAP32[(((tempVarArgs)+(16))>>2)]=$arraydecay39,tempVarArgs)); STACKTOP=tempVarArgs;
   var $arraydecay41=(($buffer)|0);
   var $call42=_clGetPlatformInfo(0, 2307, 1024, $arraydecay41, 0);
   HEAP32[(($err)>>2)]=$call42;
   var $41=$counter;
   var $inc43=((($41)+(1))|0);
   $counter=$inc43;
   var $42=HEAP32[(($err)>>2)];
   var $arraydecay44=(($buffer)|0);
   var $call45=_printf(((2744)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc43,HEAP32[(((tempVarArgs)+(8))>>2)]=$42,HEAP32[(((tempVarArgs)+(16))>>2)]=$arraydecay44,tempVarArgs)); STACKTOP=tempVarArgs;
   var $43=HEAP32[(($first_platform_id)>>2)];
   var $arraydecay46=(($buffer)|0);
   var $call47=_clGetPlatformInfo($43, 2304, 1024, $arraydecay46, 0);
   HEAP32[(($err)>>2)]=$call47;
   var $44=$counter;
   var $inc48=((($44)+(1))|0);
   $counter=$inc48;
   var $45=HEAP32[(($err)>>2)];
   var $arraydecay49=(($buffer)|0);
   var $call50=_printf(((2744)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc48,HEAP32[(((tempVarArgs)+(8))>>2)]=$45,HEAP32[(((tempVarArgs)+(16))>>2)]=$arraydecay49,tempVarArgs)); STACKTOP=tempVarArgs;
   var $46=HEAP32[(($first_platform_id)>>2)];
   var $call51=_clGetPlatformInfo($46, 2305, 1024, 0, 0);
   HEAP32[(($err)>>2)]=$call51;
   var $47=$counter;
   var $inc52=((($47)+(1))|0);
   $counter=$inc52;
   var $48=HEAP32[(($err)>>2)];
   var $call53=_printf(((2832)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc52,HEAP32[(((tempVarArgs)+(8))>>2)]=$48,tempVarArgs)); STACKTOP=tempVarArgs;
   var $49=HEAP32[(($first_platform_id)>>2)];
   var $arraydecay54=(($buffer)|0);
   var $call55=_clGetPlatformInfo($49, 2307, 1024, $arraydecay54, $size);
   HEAP32[(($err)>>2)]=$call55;
   var $50=$counter;
   var $inc56=((($50)+(1))|0);
   $counter=$inc56;
   var $51=HEAP32[(($err)>>2)];
   var $arraydecay57=(($buffer)|0);
   var $52=HEAP32[(($size)>>2)];
   var $call58=_printf(((2720)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc56,HEAP32[(((tempVarArgs)+(8))>>2)]=$51,HEAP32[(((tempVarArgs)+(16))>>2)]=$arraydecay57,HEAP32[(((tempVarArgs)+(24))>>2)]=$52,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call59=_printf(((2696)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call60=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $53=$array_type;
   HEAP32[(($53)>>2)]=0; HEAP32[((($53)+(4))>>2)]=0; HEAP32[((($53)+(8))>>2)]=0; HEAP32[((($53)+(12))>>2)]=0; HEAP32[((($53)+(16))>>2)]=0; HEAP32[((($53)+(20))>>2)]=0; HEAP32[((($53)+(24))>>2)]=0; HEAP32[((($53)+(28))>>2)]=0; HEAP32[((($53)+(32))>>2)]=0; HEAP32[((($53)+(36))>>2)]=0;
   var $54=$53;
   var $55=(($54)|0);
   var $$etemp$0$0=-1;
   var $$etemp$0$1=0;
   var $st$1$0=(($55)|0);
   HEAP32[(($st$1$0)>>2)]=$$etemp$0$0;
   var $st$2$1=(($55+4)|0);
   HEAP32[(($st$2$1)>>2)]=$$etemp$0$1;
   var $56=(($54+8)|0);
   var $$etemp$3$0=4;
   var $$etemp$3$1=0;
   var $st$4$0=(($56)|0);
   HEAP32[(($st$4$0)>>2)]=$$etemp$3$0;
   var $st$5$1=(($56+4)|0);
   HEAP32[(($st$5$1)>>2)]=$$etemp$3$1;
   var $57=(($54+16)|0);
   var $$etemp$6$0=1;
   var $$etemp$6$1=0;
   var $st$7$0=(($57)|0);
   HEAP32[(($st$7$0)>>2)]=$$etemp$6$0;
   var $st$8$1=(($57+4)|0);
   HEAP32[(($st$8$1)>>2)]=$$etemp$6$1;
   var $58=(($54+24)|0);
   var $$etemp$9$0=8;
   var $$etemp$9$1=0;
   var $st$10$0=(($58)|0);
   HEAP32[(($st$10$0)>>2)]=$$etemp$9$0;
   var $st$11$1=(($58+4)|0);
   HEAP32[(($st$11$1)>>2)]=$$etemp$9$1;
   var $59=(($54+32)|0);
   var $$etemp$12$0=2;
   var $$etemp$12$1=0;
   var $st$13$0=(($59)|0);
   HEAP32[(($st$13$0)>>2)]=$$etemp$12$0;
   var $st$14$1=(($59+4)|0);
   HEAP32[(($st$14$1)>>2)]=$$etemp$12$1;
   $i61=0;
   label = 15; break;
  case 15: 
   var $60=$i61;
   var $cmp63=(($60)|(0)) < 5;
   if ($cmp63) { label = 16; break; } else { label = 18; break; }
  case 16: 
   var $61=$i61;
   var $arrayidx65=(($array_type+($61<<3))|0);
   var $ld$15$0=(($arrayidx65)|0);
   var $62$0=HEAP32[(($ld$15$0)>>2)];
   var $ld$16$1=(($arrayidx65+4)|0);
   var $62$1=HEAP32[(($ld$16$1)>>2)];
   var $$etemp$17=((2664)|0);
   var $call66=_printf($$etemp$17, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$62$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$62$1,tempVarArgs)); STACKTOP=tempVarArgs;
   var $63=$i61;
   var $arrayidx67=(($array_type+($63<<3))|0);
   var $ld$18$0=(($arrayidx67)|0);
   var $64$0=HEAP32[(($ld$18$0)>>2)];
   var $ld$19$1=(($arrayidx67+4)|0);
   var $64$1=HEAP32[(($ld$19$1)>>2)];
   var $call68=_clGetDeviceIDs(0, $64$0, $64$1, 0, 0, 0);
   HEAP32[(($err)>>2)]=$call68;
   var $65=$counter;
   var $inc69=((($65)+(1))|0);
   $counter=$inc69;
   var $66=HEAP32[(($err)>>2)];
   var $call70=_printf(((2832)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc69,HEAP32[(((tempVarArgs)+(8))>>2)]=$66,tempVarArgs)); STACKTOP=tempVarArgs;
   var $$etemp$20$0=0;
   var $$etemp$20$1=0;
   var $call71=_clGetDeviceIDs(0, $$etemp$20$0, $$etemp$20$1, 0, 0, 0);
   HEAP32[(($err)>>2)]=$call71;
   var $67=$counter;
   var $inc72=((($67)+(1))|0);
   $counter=$inc72;
   var $68=HEAP32[(($err)>>2)];
   var $call73=_printf(((2832)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc72,HEAP32[(((tempVarArgs)+(8))>>2)]=$68,tempVarArgs)); STACKTOP=tempVarArgs;
   var $69=$i61;
   var $arrayidx74=(($array_type+($69<<3))|0);
   var $ld$21$0=(($arrayidx74)|0);
   var $70$0=HEAP32[(($ld$21$0)>>2)];
   var $ld$22$1=(($arrayidx74+4)|0);
   var $70$1=HEAP32[(($ld$22$1)>>2)];
   var $call75=_clGetDeviceIDs(0, $70$0, $70$1, 1, 0, $num_devices);
   HEAP32[(($err)>>2)]=$call75;
   var $71=$counter;
   var $inc76=((($71)+(1))|0);
   $counter=$inc76;
   var $72=HEAP32[(($err)>>2)];
   var $73=HEAP32[(($num_devices)>>2)];
   var $call77=_printf(((2816)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc76,HEAP32[(((tempVarArgs)+(8))>>2)]=$72,HEAP32[(((tempVarArgs)+(16))>>2)]=$73,tempVarArgs)); STACKTOP=tempVarArgs;
   var $74=$i61;
   var $arrayidx78=(($array_type+($74<<3))|0);
   var $ld$23$0=(($arrayidx78)|0);
   var $75$0=HEAP32[(($ld$23$0)>>2)];
   var $ld$24$1=(($arrayidx78+4)|0);
   var $75$1=HEAP32[(($ld$24$1)>>2)];
   var $call79=_clGetDeviceIDs(0, $75$0, $75$1, 1, $first_device_id, 0);
   HEAP32[(($err)>>2)]=$call79;
   var $76=$counter;
   var $inc80=((($76)+(1))|0);
   $counter=$inc80;
   var $77=HEAP32[(($err)>>2)];
   var $78=HEAP32[(($first_device_id)>>2)];
   var $79=$78;
   var $call81=_printf(((2816)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc80,HEAP32[(((tempVarArgs)+(8))>>2)]=$77,HEAP32[(((tempVarArgs)+(16))>>2)]=$79,tempVarArgs)); STACKTOP=tempVarArgs;
   var $80=$i61;
   var $arrayidx82=(($array_type+($80<<3))|0);
   var $ld$25$0=(($arrayidx82)|0);
   var $81$0=HEAP32[(($ld$25$0)>>2)];
   var $ld$26$1=(($arrayidx82+4)|0);
   var $81$1=HEAP32[(($ld$26$1)>>2)];
   var $call83=_clGetDeviceIDs(0, $81$0, $81$1, 2, $first_device_id, $num_devices);
   HEAP32[(($err)>>2)]=$call83;
   var $82=$counter;
   var $inc84=((($82)+(1))|0);
   $counter=$inc84;
   var $83=HEAP32[(($err)>>2)];
   var $84=HEAP32[(($first_device_id)>>2)];
   var $85=$84;
   var $86=HEAP32[(($num_devices)>>2)];
   var $call85=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc84,HEAP32[(((tempVarArgs)+(8))>>2)]=$83,HEAP32[(((tempVarArgs)+(16))>>2)]=$85,HEAP32[(((tempVarArgs)+(24))>>2)]=$86,tempVarArgs)); STACKTOP=tempVarArgs;
   var $87=HEAP32[(($first_platform_id)>>2)];
   var $88=$i61;
   var $arrayidx86=(($array_type+($88<<3))|0);
   var $ld$27$0=(($arrayidx86)|0);
   var $89$0=HEAP32[(($ld$27$0)>>2)];
   var $ld$28$1=(($arrayidx86+4)|0);
   var $89$1=HEAP32[(($ld$28$1)>>2)];
   var $call87=_clGetDeviceIDs($87, $89$0, $89$1, 1, 0, $num_devices);
   HEAP32[(($err)>>2)]=$call87;
   var $90=$counter;
   var $inc88=((($90)+(1))|0);
   $counter=$inc88;
   var $91=HEAP32[(($err)>>2)];
   var $92=HEAP32[(($first_platform_id)>>2)];
   var $93=$92;
   var $94=HEAP32[(($num_devices)>>2)];
   var $call89=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc88,HEAP32[(((tempVarArgs)+(8))>>2)]=$91,HEAP32[(((tempVarArgs)+(16))>>2)]=$93,HEAP32[(((tempVarArgs)+(24))>>2)]=$94,tempVarArgs)); STACKTOP=tempVarArgs;
   var $95=HEAP32[(($first_platform_id)>>2)];
   var $96=$i61;
   var $arrayidx90=(($array_type+($96<<3))|0);
   var $ld$29$0=(($arrayidx90)|0);
   var $97$0=HEAP32[(($ld$29$0)>>2)];
   var $ld$30$1=(($arrayidx90+4)|0);
   var $97$1=HEAP32[(($ld$30$1)>>2)];
   var $call91=_clGetDeviceIDs($95, $97$0, $97$1, 1, $first_device_id, 0);
   HEAP32[(($err)>>2)]=$call91;
   var $98=$counter;
   var $inc92=((($98)+(1))|0);
   $counter=$inc92;
   var $99=HEAP32[(($err)>>2)];
   var $100=HEAP32[(($first_platform_id)>>2)];
   var $101=$100;
   var $102=HEAP32[(($first_device_id)>>2)];
   var $103=$102;
   var $call93=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc92,HEAP32[(((tempVarArgs)+(8))>>2)]=$99,HEAP32[(((tempVarArgs)+(16))>>2)]=$101,HEAP32[(((tempVarArgs)+(24))>>2)]=$103,tempVarArgs)); STACKTOP=tempVarArgs;
   var $104=HEAP32[(($first_platform_id)>>2)];
   var $105=$i61;
   var $arrayidx94=(($array_type+($105<<3))|0);
   var $ld$31$0=(($arrayidx94)|0);
   var $106$0=HEAP32[(($ld$31$0)>>2)];
   var $ld$32$1=(($arrayidx94+4)|0);
   var $106$1=HEAP32[(($ld$32$1)>>2)];
   var $call95=_clGetDeviceIDs($104, $106$0, $106$1, 2, $first_device_id, $num_devices);
   HEAP32[(($err)>>2)]=$call95;
   var $107=$counter;
   var $inc96=((($107)+(1))|0);
   $counter=$inc96;
   var $108=HEAP32[(($err)>>2)];
   var $109=HEAP32[(($first_platform_id)>>2)];
   var $110=$109;
   var $111=HEAP32[(($first_device_id)>>2)];
   var $112=$111;
   var $113=HEAP32[(($num_devices)>>2)];
   var $call97=_printf(((2632)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc96,HEAP32[(((tempVarArgs)+(8))>>2)]=$108,HEAP32[(((tempVarArgs)+(16))>>2)]=$110,HEAP32[(((tempVarArgs)+(24))>>2)]=$112,HEAP32[(((tempVarArgs)+(32))>>2)]=$113,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 17; break;
  case 17: 
   var $114=$i61;
   var $inc99=((($114)+(1))|0);
   $i61=$inc99;
   label = 15; break;
  case 18: 
   var $call101=_printf(((2600)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call102=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $115=$array_info;
   assert(300 % 1 === 0);(_memcpy($115, 264, 300)|0);
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   $i103=0;
   label = 19; break;
  case 19: 
   var $116=$i103;
   var $cmp105=(($116)|(0)) < 75;
   if ($cmp105) { label = 20; break; } else { label = 22; break; }
  case 20: 
   var $117=HEAP32[(($first_device_id)>>2)];
   var $118=$i103;
   var $arrayidx107=(($array_info+($118<<2))|0);
   var $119=HEAP32[(($arrayidx107)>>2)];
   var $120=$value;
   var $call108=_clGetDeviceInfo($117, $119, 4, $120, $size);
   HEAP32[(($err)>>2)]=$call108;
   var $121=$counter;
   var $inc109=((($121)+(1))|0);
   $counter=$inc109;
   var $122=$i103;
   var $arrayidx110=(($array_info+($122<<2))|0);
   var $123=HEAP32[(($arrayidx110)>>2)];
   var $124=HEAP32[(($err)>>2)];
   var $125=HEAP32[(($size)>>2)];
   var $126=HEAP32[(($value)>>2)];
   var $call111=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc109,HEAP32[(((tempVarArgs)+(8))>>2)]=$123,HEAP32[(((tempVarArgs)+(16))>>2)]=$124,HEAP32[(((tempVarArgs)+(24))>>2)]=$125,HEAP32[(((tempVarArgs)+(32))>>2)]=$126,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 21; break;
  case 21: 
   var $127=$i103;
   var $inc113=((($127)+(1))|0);
   $i103=$inc113;
   label = 19; break;
  case 22: 
   HEAP32[(($size)>>2)]=0;
   var $128=HEAP32[(($first_device_id)>>2)];
   var $129=$extensions;
   var $call115=_clGetDeviceInfo($128, 4144, 1024, $129, $size);
   HEAP32[(($err)>>2)]=$call115;
   var $130=$counter;
   var $inc116=((($130)+(1))|0);
   $counter=$inc116;
   var $131=HEAP32[(($err)>>2)];
   var $132=HEAP32[(($size)>>2)];
   var $arraydecay117=(($extensions)|0);
   var $call118=_printf(((2552)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc116,HEAP32[(((tempVarArgs)+(8))>>2)]=4144,HEAP32[(((tempVarArgs)+(16))>>2)]=$131,HEAP32[(((tempVarArgs)+(24))>>2)]=$132,HEAP32[(((tempVarArgs)+(32))>>2)]=$arraydecay117,tempVarArgs)); STACKTOP=tempVarArgs;
   var $133=HEAP32[(($first_device_id)>>2)];
   var $134=$array;
   var $call119=_clGetDeviceInfo($133, 4101, 12, $134, $size);
   HEAP32[(($err)>>2)]=$call119;
   var $135=$counter;
   var $inc120=((($135)+(1))|0);
   $counter=$inc120;
   var $136=HEAP32[(($err)>>2)];
   var $137=HEAP32[(($size)>>2)];
   var $arrayidx121=(($array)|0);
   var $138=HEAP32[(($arrayidx121)>>2)];
   var $arrayidx122=(($array+4)|0);
   var $139=HEAP32[(($arrayidx122)>>2)];
   var $arrayidx123=(($array+8)|0);
   var $140=HEAP32[(($arrayidx123)>>2)];
   var $call124=_printf(((2512)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 56)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc120,HEAP32[(((tempVarArgs)+(8))>>2)]=4101,HEAP32[(((tempVarArgs)+(16))>>2)]=$136,HEAP32[(((tempVarArgs)+(24))>>2)]=$137,HEAP32[(((tempVarArgs)+(32))>>2)]=$138,HEAP32[(((tempVarArgs)+(40))>>2)]=$139,HEAP32[(((tempVarArgs)+(48))>>2)]=$140,tempVarArgs)); STACKTOP=tempVarArgs;
   var $141=HEAP32[(($first_device_id)>>2)];
   var $142=$ul;
   var $call125=_clGetDeviceInfo($141, 4112, 8, $142, $size);
   HEAP32[(($err)>>2)]=$call125;
   var $143=$counter;
   var $inc126=((($143)+(1))|0);
   $counter=$inc126;
   var $144=HEAP32[(($err)>>2)];
   var $145=HEAP32[(($size)>>2)];
   var $ld$33$0=(($ul)|0);
   var $146$0=HEAP32[(($ld$33$0)>>2)];
   var $ld$34$1=(($ul+4)|0);
   var $146$1=HEAP32[(($ld$34$1)>>2)];
   var $$etemp$35=((2480)|0);
   var $call127=_printf($$etemp$35, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 48)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc126,HEAP32[(((tempVarArgs)+(8))>>2)]=4112,HEAP32[(((tempVarArgs)+(16))>>2)]=$144,HEAP32[(((tempVarArgs)+(24))>>2)]=$145,HEAP32[(((tempVarArgs)+(32))>>2)]=$146$0,HEAP32[(((tempVarArgs)+(40))>>2)]=$146$1,tempVarArgs)); STACKTOP=tempVarArgs;
   var $$etemp$36$0=0;
   var $$etemp$36$1=0;
   var $st$37$0=(($ul)|0);
   HEAP32[(($st$37$0)>>2)]=$$etemp$36$0;
   var $st$38$1=(($ul+4)|0);
   HEAP32[(($st$38$1)>>2)]=$$etemp$36$1;
   var $147=HEAP32[(($first_device_id)>>2)];
   var $148=$ul;
   var $call128=_clGetDeviceInfo($147, 4127, 8, $148, $size);
   HEAP32[(($err)>>2)]=$call128;
   var $149=$counter;
   var $inc129=((($149)+(1))|0);
   $counter=$inc129;
   var $150=HEAP32[(($err)>>2)];
   var $151=HEAP32[(($size)>>2)];
   var $ld$39$0=(($ul)|0);
   var $152$0=HEAP32[(($ld$39$0)>>2)];
   var $ld$40$1=(($ul+4)|0);
   var $152$1=HEAP32[(($ld$40$1)>>2)];
   var $$etemp$41=((2480)|0);
   var $call130=_printf($$etemp$41, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 48)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc129,HEAP32[(((tempVarArgs)+(8))>>2)]=4127,HEAP32[(((tempVarArgs)+(16))>>2)]=$150,HEAP32[(((tempVarArgs)+(24))>>2)]=$151,HEAP32[(((tempVarArgs)+(32))>>2)]=$152$0,HEAP32[(((tempVarArgs)+(40))>>2)]=$152$1,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call131=_printf(((2448)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call132=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($cl_errcode_ret)>>2)]=0;
   var $call133=_clCreateContext(0, 0, 0, 0, 0, $cl_errcode_ret);
   $context=$call133;
   var $153=$counter;
   var $inc134=((($153)+(1))|0);
   $counter=$inc134;
   var $154=HEAP32[(($cl_errcode_ret)>>2)];
   var $155=$context;
   var $156=$155;
   var $call135=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc134,HEAP32[(((tempVarArgs)+(8))>>2)]=$154,HEAP32[(((tempVarArgs)+(16))>>2)]=$156,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call136=_clCreateContext(0, 1, 0, 0, 0, $cl_errcode_ret);
   $context=$call136;
   var $157=$counter;
   var $inc137=((($157)+(1))|0);
   $counter=$inc137;
   var $158=HEAP32[(($cl_errcode_ret)>>2)];
   var $159=$context;
   var $160=$159;
   var $call138=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc137,HEAP32[(((tempVarArgs)+(8))>>2)]=$158,HEAP32[(((tempVarArgs)+(16))>>2)]=$160,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call139=_clCreateContext(0, 0, $first_device_id, 0, 0, $cl_errcode_ret);
   $context=$call139;
   var $161=$counter;
   var $inc140=((($161)+(1))|0);
   $counter=$inc140;
   var $162=HEAP32[(($cl_errcode_ret)>>2)];
   var $163=$context;
   var $164=$163;
   var $call141=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc140,HEAP32[(((tempVarArgs)+(8))>>2)]=$162,HEAP32[(((tempVarArgs)+(16))>>2)]=$164,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call142=_clCreateContext(0, 1, $first_device_id, 0, 0, $cl_errcode_ret);
   $context=$call142;
   var $165=$counter;
   var $inc143=((($165)+(1))|0);
   $counter=$inc143;
   var $166=HEAP32[(($cl_errcode_ret)>>2)];
   var $167=$context;
   var $168=$167;
   var $call144=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc143,HEAP32[(((tempVarArgs)+(8))>>2)]=$166,HEAP32[(((tempVarArgs)+(16))>>2)]=$168,tempVarArgs)); STACKTOP=tempVarArgs;
   var $169=$properties;
   assert(20 % 1 === 0);HEAP32[(($169)>>2)]=HEAP32[((64)>>2)];HEAP32[((($169)+(4))>>2)]=HEAP32[((68)>>2)];HEAP32[((($169)+(8))>>2)]=HEAP32[((72)>>2)];HEAP32[((($169)+(12))>>2)]=HEAP32[((76)>>2)];HEAP32[((($169)+(16))>>2)]=HEAP32[((80)>>2)];
   var $arraydecay145=(($properties)|0);
   var $call146=_clCreateContext($arraydecay145, 1, $first_device_id, 0, 0, $cl_errcode_ret);
   $context=$call146;
   var $170=$counter;
   var $inc147=((($170)+(1))|0);
   $counter=$inc147;
   var $171=HEAP32[(($cl_errcode_ret)>>2)];
   var $172=$context;
   var $173=$172;
   var $call148=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc147,HEAP32[(((tempVarArgs)+(8))>>2)]=$171,HEAP32[(((tempVarArgs)+(16))>>2)]=$173,tempVarArgs)); STACKTOP=tempVarArgs;
   var $arrayinit_begin=(($properties149)|0);
   HEAP32[(($arrayinit_begin)>>2)]=4228;
   var $arrayinit_element=(($arrayinit_begin+4)|0);
   var $174=HEAP32[(($first_platform_id)>>2)];
   var $175=$174;
   HEAP32[(($arrayinit_element)>>2)]=$175;
   var $arrayinit_element150=(($arrayinit_element+4)|0);
   HEAP32[(($arrayinit_element150)>>2)]=8200;
   var $arrayinit_element151=(($arrayinit_element150+4)|0);
   HEAP32[(($arrayinit_element151)>>2)]=0;
   var $arrayinit_element152=(($arrayinit_element151+4)|0);
   HEAP32[(($arrayinit_element152)>>2)]=8204;
   var $arrayinit_element153=(($arrayinit_element152+4)|0);
   HEAP32[(($arrayinit_element153)>>2)]=0;
   var $arrayinit_element154=(($arrayinit_element153+4)|0);
   HEAP32[(($arrayinit_element154)>>2)]=0;
   var $arraydecay155=(($properties149)|0);
   var $call156=_clCreateContext($arraydecay155, 1, $first_device_id, 0, 0, $cl_errcode_ret);
   $context=$call156;
   var $176=$counter;
   var $inc157=((($176)+(1))|0);
   $counter=$inc157;
   var $177=HEAP32[(($cl_errcode_ret)>>2)];
   var $178=$context;
   var $179=$178;
   var $call158=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc157,HEAP32[(((tempVarArgs)+(8))>>2)]=$177,HEAP32[(((tempVarArgs)+(16))>>2)]=$179,tempVarArgs)); STACKTOP=tempVarArgs;
   var $arrayinit_begin160=(($properties159)|0);
   HEAP32[(($arrayinit_begin160)>>2)]=4228;
   var $arrayinit_element161=(($arrayinit_begin160+4)|0);
   var $180=HEAP32[(($first_platform_id)>>2)];
   var $181=$180;
   HEAP32[(($arrayinit_element161)>>2)]=$181;
   var $arrayinit_element162=(($arrayinit_element161+4)|0);
   HEAP32[(($arrayinit_element162)>>2)]=0;
   var $arraydecay163=(($properties159)|0);
   var $call164=_clCreateContext($arraydecay163, 1, $first_device_id, 0, 0, $cl_errcode_ret);
   $context=$call164;
   var $182=$counter;
   var $inc165=((($182)+(1))|0);
   $counter=$inc165;
   var $183=HEAP32[(($cl_errcode_ret)>>2)];
   var $184=$context;
   var $185=$184;
   var $call166=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc165,HEAP32[(((tempVarArgs)+(8))>>2)]=$183,HEAP32[(((tempVarArgs)+(16))>>2)]=$185,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call167=_printf(((2392)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call168=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $i169=0;
   label = 23; break;
  case 23: 
   var $186=$i169;
   var $cmp171=(($186)|(0)) < 5;
   if ($cmp171) { label = 24; break; } else { label = 26; break; }
  case 24: 
   var $187=$i169;
   var $arrayidx173=(($array_type+($187<<3))|0);
   var $ld$42$0=(($arrayidx173)|0);
   var $188$0=HEAP32[(($ld$42$0)>>2)];
   var $ld$43$1=(($arrayidx173+4)|0);
   var $188$1=HEAP32[(($ld$43$1)>>2)];
   var $$etemp$44=((2352)|0);
   var $call174=_printf($$etemp$44, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$188$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$188$1,tempVarArgs)); STACKTOP=tempVarArgs;
   var $189=$i169;
   var $arrayidx175=(($array_type+($189<<3))|0);
   var $ld$45$0=(($arrayidx175)|0);
   var $190$0=HEAP32[(($ld$45$0)>>2)];
   var $ld$46$1=(($arrayidx175+4)|0);
   var $190$1=HEAP32[(($ld$46$1)>>2)];
   var $call176=_clCreateContextFromType(0, $190$0, $190$1, 0, 0, $cl_errcode_ret);
   $contextFromType=$call176;
   var $191=$counter;
   var $inc177=((($191)+(1))|0);
   $counter=$inc177;
   var $192=HEAP32[(($cl_errcode_ret)>>2)];
   var $193=$i169;
   var $arrayidx178=(($array_type+($193<<3))|0);
   var $ld$47$0=(($arrayidx178)|0);
   var $194$0=HEAP32[(($ld$47$0)>>2)];
   var $ld$48$1=(($arrayidx178+4)|0);
   var $194$1=HEAP32[(($ld$48$1)>>2)];
   var $195=$contextFromType;
   var $196=$195;
   var $$etemp$49=((2288)|0);
   var $call179=_printf($$etemp$49, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc177,HEAP32[(((tempVarArgs)+(8))>>2)]=$192,HEAP32[(((tempVarArgs)+(16))>>2)]=$194$0,HEAP32[(((tempVarArgs)+(24))>>2)]=$194$1,HEAP32[(((tempVarArgs)+(32))>>2)]=$196,tempVarArgs)); STACKTOP=tempVarArgs;
   var $197=$i169;
   var $arrayidx180=(($array_type+($197<<3))|0);
   var $ld$50$0=(($arrayidx180)|0);
   var $198$0=HEAP32[(($ld$50$0)>>2)];
   var $ld$51$1=(($arrayidx180+4)|0);
   var $198$1=HEAP32[(($ld$51$1)>>2)];
   var $call181=_clCreateContextFromType(0, $198$0, $198$1, 0, 0, $cl_errcode_ret);
   $contextFromType=$call181;
   var $199=$counter;
   var $inc182=((($199)+(1))|0);
   $counter=$inc182;
   var $200=HEAP32[(($cl_errcode_ret)>>2)];
   var $201=$i169;
   var $arrayidx183=(($array_type+($201<<3))|0);
   var $ld$52$0=(($arrayidx183)|0);
   var $202$0=HEAP32[(($ld$52$0)>>2)];
   var $ld$53$1=(($arrayidx183+4)|0);
   var $202$1=HEAP32[(($ld$53$1)>>2)];
   var $203=$contextFromType;
   var $204=$203;
   var $$etemp$54=((2288)|0);
   var $call184=_printf($$etemp$54, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc182,HEAP32[(((tempVarArgs)+(8))>>2)]=$200,HEAP32[(((tempVarArgs)+(16))>>2)]=$202$0,HEAP32[(((tempVarArgs)+(24))>>2)]=$202$1,HEAP32[(((tempVarArgs)+(32))>>2)]=$204,tempVarArgs)); STACKTOP=tempVarArgs;
   var $205=$properties185;
   assert(20 % 1 === 0);HEAP32[(($205)>>2)]=HEAP32[((40)>>2)];HEAP32[((($205)+(4))>>2)]=HEAP32[((44)>>2)];HEAP32[((($205)+(8))>>2)]=HEAP32[((48)>>2)];HEAP32[((($205)+(12))>>2)]=HEAP32[((52)>>2)];HEAP32[((($205)+(16))>>2)]=HEAP32[((56)>>2)];
   var $arraydecay186=(($properties185)|0);
   var $206=$i169;
   var $arrayidx187=(($array_type+($206<<3))|0);
   var $ld$55$0=(($arrayidx187)|0);
   var $207$0=HEAP32[(($ld$55$0)>>2)];
   var $ld$56$1=(($arrayidx187+4)|0);
   var $207$1=HEAP32[(($ld$56$1)>>2)];
   var $call188=_clCreateContextFromType($arraydecay186, $207$0, $207$1, 0, 0, $cl_errcode_ret);
   $contextFromType=$call188;
   var $208=$counter;
   var $inc189=((($208)+(1))|0);
   $counter=$inc189;
   var $209=HEAP32[(($cl_errcode_ret)>>2)];
   var $210=$i169;
   var $arrayidx190=(($array_type+($210<<3))|0);
   var $ld$57$0=(($arrayidx190)|0);
   var $211$0=HEAP32[(($ld$57$0)>>2)];
   var $ld$58$1=(($arrayidx190+4)|0);
   var $211$1=HEAP32[(($ld$58$1)>>2)];
   var $212=$contextFromType;
   var $213=$212;
   var $$etemp$59=((2288)|0);
   var $call191=_printf($$etemp$59, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc189,HEAP32[(((tempVarArgs)+(8))>>2)]=$209,HEAP32[(((tempVarArgs)+(16))>>2)]=$211$0,HEAP32[(((tempVarArgs)+(24))>>2)]=$211$1,HEAP32[(((tempVarArgs)+(32))>>2)]=$213,tempVarArgs)); STACKTOP=tempVarArgs;
   var $arrayinit_begin193=(($properties192)|0);
   HEAP32[(($arrayinit_begin193)>>2)]=4228;
   var $arrayinit_element194=(($arrayinit_begin193+4)|0);
   var $214=HEAP32[(($first_platform_id)>>2)];
   var $215=$214;
   HEAP32[(($arrayinit_element194)>>2)]=$215;
   var $arrayinit_element195=(($arrayinit_element194+4)|0);
   HEAP32[(($arrayinit_element195)>>2)]=8200;
   var $arrayinit_element196=(($arrayinit_element195+4)|0);
   HEAP32[(($arrayinit_element196)>>2)]=0;
   var $arrayinit_element197=(($arrayinit_element196+4)|0);
   HEAP32[(($arrayinit_element197)>>2)]=8204;
   var $arrayinit_element198=(($arrayinit_element197+4)|0);
   HEAP32[(($arrayinit_element198)>>2)]=0;
   var $arrayinit_element199=(($arrayinit_element198+4)|0);
   HEAP32[(($arrayinit_element199)>>2)]=0;
   var $arraydecay200=(($properties192)|0);
   var $216=$i169;
   var $arrayidx201=(($array_type+($216<<3))|0);
   var $ld$60$0=(($arrayidx201)|0);
   var $217$0=HEAP32[(($ld$60$0)>>2)];
   var $ld$61$1=(($arrayidx201+4)|0);
   var $217$1=HEAP32[(($ld$61$1)>>2)];
   var $call202=_clCreateContextFromType($arraydecay200, $217$0, $217$1, 0, 0, $cl_errcode_ret);
   $contextFromType=$call202;
   var $218=$counter;
   var $inc203=((($218)+(1))|0);
   $counter=$inc203;
   var $219=HEAP32[(($cl_errcode_ret)>>2)];
   var $220=$i169;
   var $arrayidx204=(($array_type+($220<<3))|0);
   var $ld$62$0=(($arrayidx204)|0);
   var $221$0=HEAP32[(($ld$62$0)>>2)];
   var $ld$63$1=(($arrayidx204+4)|0);
   var $221$1=HEAP32[(($ld$63$1)>>2)];
   var $222=$contextFromType;
   var $223=$222;
   var $$etemp$64=((2288)|0);
   var $call205=_printf($$etemp$64, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc203,HEAP32[(((tempVarArgs)+(8))>>2)]=$219,HEAP32[(((tempVarArgs)+(16))>>2)]=$221$0,HEAP32[(((tempVarArgs)+(24))>>2)]=$221$1,HEAP32[(((tempVarArgs)+(32))>>2)]=$223,tempVarArgs)); STACKTOP=tempVarArgs;
   var $arrayinit_begin207=(($properties206)|0);
   HEAP32[(($arrayinit_begin207)>>2)]=4228;
   var $arrayinit_element208=(($arrayinit_begin207+4)|0);
   var $224=HEAP32[(($first_platform_id)>>2)];
   var $225=$224;
   HEAP32[(($arrayinit_element208)>>2)]=$225;
   var $arrayinit_element209=(($arrayinit_element208+4)|0);
   HEAP32[(($arrayinit_element209)>>2)]=0;
   var $arraydecay210=(($properties206)|0);
   var $226=$i169;
   var $arrayidx211=(($array_type+($226<<3))|0);
   var $ld$65$0=(($arrayidx211)|0);
   var $227$0=HEAP32[(($ld$65$0)>>2)];
   var $ld$66$1=(($arrayidx211+4)|0);
   var $227$1=HEAP32[(($ld$66$1)>>2)];
   var $call212=_clCreateContextFromType($arraydecay210, $227$0, $227$1, 0, 0, $cl_errcode_ret);
   $contextFromType=$call212;
   var $228=$counter;
   var $inc213=((($228)+(1))|0);
   $counter=$inc213;
   var $229=HEAP32[(($cl_errcode_ret)>>2)];
   var $230=$i169;
   var $arrayidx214=(($array_type+($230<<3))|0);
   var $ld$67$0=(($arrayidx214)|0);
   var $231$0=HEAP32[(($ld$67$0)>>2)];
   var $ld$68$1=(($arrayidx214+4)|0);
   var $231$1=HEAP32[(($ld$68$1)>>2)];
   var $232=$contextFromType;
   var $233=$232;
   var $$etemp$69=((2288)|0);
   var $call215=_printf($$etemp$69, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc213,HEAP32[(((tempVarArgs)+(8))>>2)]=$229,HEAP32[(((tempVarArgs)+(16))>>2)]=$231$0,HEAP32[(((tempVarArgs)+(24))>>2)]=$231$1,HEAP32[(((tempVarArgs)+(32))>>2)]=$233,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 25; break;
  case 25: 
   var $234=$i169;
   var $inc217=((($234)+(1))|0);
   $i169=$inc217;
   label = 23; break;
  case 26: 
   var $call219=_printf(((2256)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call220=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   var $235=$array_context_info;
   assert(20 % 1 === 0);HEAP32[(($235)>>2)]=HEAP32[((600)>>2)];HEAP32[((($235)+(4))>>2)]=HEAP32[((604)>>2)];HEAP32[((($235)+(8))>>2)]=HEAP32[((608)>>2)];HEAP32[((($235)+(12))>>2)]=HEAP32[((612)>>2)];HEAP32[((($235)+(16))>>2)]=HEAP32[((616)>>2)];
   $i221=0;
   label = 27; break;
  case 27: 
   var $236=$i221;
   var $cmp223=(($236)|(0)) < 5;
   if ($cmp223) { label = 28; break; } else { label = 30; break; }
  case 28: 
   var $237=$contextFromType;
   var $238=$i221;
   var $arrayidx225=(($array_context_info+($238<<2))|0);
   var $239=HEAP32[(($arrayidx225)>>2)];
   var $240=$value;
   var $call226=_clGetContextInfo($237, $239, 4, $240, $size);
   HEAP32[(($err)>>2)]=$call226;
   var $241=$counter;
   var $inc227=((($241)+(1))|0);
   $counter=$inc227;
   var $242=$i221;
   var $arrayidx228=(($array_context_info+($242<<2))|0);
   var $243=HEAP32[(($arrayidx228)>>2)];
   var $244=HEAP32[(($err)>>2)];
   var $245=HEAP32[(($size)>>2)];
   var $246=HEAP32[(($value)>>2)];
   var $call229=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc227,HEAP32[(((tempVarArgs)+(8))>>2)]=$243,HEAP32[(((tempVarArgs)+(16))>>2)]=$244,HEAP32[(((tempVarArgs)+(24))>>2)]=$245,HEAP32[(((tempVarArgs)+(32))>>2)]=$246,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 29; break;
  case 29: 
   var $247=$i221;
   var $inc231=((($247)+(1))|0);
   $i221=$inc231;
   label = 27; break;
  case 30: 
   var $call233=_printf(((2224)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call234=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call235=_clReleaseContext(0);
   HEAP32[(($err)>>2)]=$call235;
   var $248=$counter;
   var $inc236=((($248)+(1))|0);
   $counter=$inc236;
   var $249=HEAP32[(($err)>>2)];
   var $call237=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc236,HEAP32[(((tempVarArgs)+(8))>>2)]=$249,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $250=$contextFromType;
   var $call238=_clReleaseContext($250);
   HEAP32[(($err)>>2)]=$call238;
   var $251=$counter;
   var $inc239=((($251)+(1))|0);
   $counter=$inc239;
   var $252=HEAP32[(($err)>>2)];
   var $253=$contextFromType;
   var $254=$253;
   var $call240=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc239,HEAP32[(((tempVarArgs)+(8))>>2)]=$252,HEAP32[(((tempVarArgs)+(16))>>2)]=$254,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call241=_printf(((2192)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call242=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $$etemp$70$0=0;
   var $$etemp$70$1=0;
   var $call243=_clCreateCommandQueue(0, 0, $$etemp$70$0, $$etemp$70$1, $cl_errcode_ret);
   $queue=$call243;
   var $255=$counter;
   var $inc244=((($255)+(1))|0);
   $counter=$inc244;
   var $256=HEAP32[(($cl_errcode_ret)>>2)];
   var $257=$queue;
   var $258=$257;
   var $call245=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc244,HEAP32[(((tempVarArgs)+(8))>>2)]=$256,HEAP32[(((tempVarArgs)+(16))>>2)]=$258,tempVarArgs)); STACKTOP=tempVarArgs;
   var $259=$context;
   var $$etemp$71$0=0;
   var $$etemp$71$1=0;
   var $call246=_clCreateCommandQueue($259, 0, $$etemp$71$0, $$etemp$71$1, $cl_errcode_ret);
   $queue=$call246;
   var $260=$counter;
   var $inc247=((($260)+(1))|0);
   $counter=$inc247;
   var $261=HEAP32[(($cl_errcode_ret)>>2)];
   var $262=$queue;
   var $263=$262;
   var $call248=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc247,HEAP32[(((tempVarArgs)+(8))>>2)]=$261,HEAP32[(((tempVarArgs)+(16))>>2)]=$263,tempVarArgs)); STACKTOP=tempVarArgs;
   var $264=$context;
   var $265=HEAP32[(($first_device_id)>>2)];
   var $$etemp$72$0=0;
   var $$etemp$72$1=0;
   var $call249=_clCreateCommandQueue($264, $265, $$etemp$72$0, $$etemp$72$1, $cl_errcode_ret);
   $queue=$call249;
   var $266=$counter;
   var $inc250=((($266)+(1))|0);
   $counter=$inc250;
   var $267=HEAP32[(($cl_errcode_ret)>>2)];
   var $268=$queue;
   var $269=$268;
   var $call251=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc250,HEAP32[(((tempVarArgs)+(8))>>2)]=$267,HEAP32[(((tempVarArgs)+(16))>>2)]=$269,tempVarArgs)); STACKTOP=tempVarArgs;
   var $270=$context;
   var $271=HEAP32[(($first_device_id)>>2)];
   var $$etemp$73$0=1;
   var $$etemp$73$1=0;
   var $call252=_clCreateCommandQueue($270, $271, $$etemp$73$0, $$etemp$73$1, $cl_errcode_ret);
   $queue=$call252;
   var $272=$counter;
   var $inc253=((($272)+(1))|0);
   $counter=$inc253;
   var $273=HEAP32[(($cl_errcode_ret)>>2)];
   var $274=$queue;
   var $275=$274;
   var $call254=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc253,HEAP32[(((tempVarArgs)+(8))>>2)]=$273,HEAP32[(((tempVarArgs)+(16))>>2)]=$275,tempVarArgs)); STACKTOP=tempVarArgs;
   var $276=$context;
   var $277=HEAP32[(($first_device_id)>>2)];
   var $$etemp$74$0=3;
   var $$etemp$74$1=0;
   var $call255=_clCreateCommandQueue($276, $277, $$etemp$74$0, $$etemp$74$1, $cl_errcode_ret);
   $queue=$call255;
   var $278=$counter;
   var $inc256=((($278)+(1))|0);
   $counter=$inc256;
   var $279=HEAP32[(($cl_errcode_ret)>>2)];
   var $280=$queue;
   var $281=$280;
   var $call257=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc256,HEAP32[(((tempVarArgs)+(8))>>2)]=$279,HEAP32[(((tempVarArgs)+(16))>>2)]=$281,tempVarArgs)); STACKTOP=tempVarArgs;
   var $282=$context;
   var $283=HEAP32[(($first_device_id)>>2)];
   var $$etemp$75$0=2;
   var $$etemp$75$1=0;
   var $call258=_clCreateCommandQueue($282, $283, $$etemp$75$0, $$etemp$75$1, $cl_errcode_ret);
   $queue=$call258;
   var $284=$counter;
   var $inc259=((($284)+(1))|0);
   $counter=$inc259;
   var $285=HEAP32[(($cl_errcode_ret)>>2)];
   var $286=$queue;
   var $287=$286;
   var $call260=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc259,HEAP32[(((tempVarArgs)+(8))>>2)]=$285,HEAP32[(((tempVarArgs)+(16))>>2)]=$287,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call261=_printf(((2160)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call262=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $288=$context;
   var $289=HEAP32[(($first_device_id)>>2)];
   var $$etemp$76$0=2;
   var $$etemp$76$1=0;
   var $call263=_clCreateCommandQueue($288, $289, $$etemp$76$0, $$etemp$76$1, $cl_errcode_ret);
   $queue_to_release=$call263;
   var $290=$array_command_info;
   assert(16 % 1 === 0);HEAP32[(($290)>>2)]=HEAP32[((624)>>2)];HEAP32[((($290)+(4))>>2)]=HEAP32[((628)>>2)];HEAP32[((($290)+(8))>>2)]=HEAP32[((632)>>2)];HEAP32[((($290)+(12))>>2)]=HEAP32[((636)>>2)];
   $i264=0;
   label = 31; break;
  case 31: 
   var $291=$i264;
   var $cmp266=(($291)|(0)) < 4;
   if ($cmp266) { label = 32; break; } else { label = 34; break; }
  case 32: 
   var $292=$queue_to_release;
   var $293=$i264;
   var $arrayidx268=(($array_command_info+($293<<2))|0);
   var $294=HEAP32[(($arrayidx268)>>2)];
   var $295=$value;
   var $call269=_clGetCommandQueueInfo($292, $294, 4, $295, $size);
   HEAP32[(($err)>>2)]=$call269;
   var $296=$counter;
   var $inc270=((($296)+(1))|0);
   $counter=$inc270;
   var $297=$i264;
   var $arrayidx271=(($array_command_info+($297<<2))|0);
   var $298=HEAP32[(($arrayidx271)>>2)];
   var $299=HEAP32[(($err)>>2)];
   var $300=HEAP32[(($size)>>2)];
   var $301=HEAP32[(($value)>>2)];
   var $call272=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc270,HEAP32[(((tempVarArgs)+(8))>>2)]=$298,HEAP32[(((tempVarArgs)+(16))>>2)]=$299,HEAP32[(((tempVarArgs)+(24))>>2)]=$300,HEAP32[(((tempVarArgs)+(32))>>2)]=$301,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 33; break;
  case 33: 
   var $302=$i264;
   var $inc274=((($302)+(1))|0);
   $i264=$inc274;
   label = 31; break;
  case 34: 
   var $call276=_printf(((2128)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call277=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call278=_clReleaseCommandQueue(0);
   HEAP32[(($err)>>2)]=$call278;
   var $303=$counter;
   var $inc279=((($303)+(1))|0);
   $counter=$inc279;
   var $304=HEAP32[(($err)>>2)];
   var $call280=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc279,HEAP32[(((tempVarArgs)+(8))>>2)]=$304,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $305=$queue_to_release;
   var $call281=_clReleaseCommandQueue($305);
   HEAP32[(($err)>>2)]=$call281;
   var $306=$counter;
   var $inc282=((($306)+(1))|0);
   $counter=$inc282;
   var $307=HEAP32[(($err)>>2)];
   var $308=$queue_to_release;
   var $309=$308;
   var $call283=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc282,HEAP32[(((tempVarArgs)+(8))>>2)]=$307,HEAP32[(((tempVarArgs)+(16))>>2)]=$309,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call284=_printf(((2104)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call285=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $310=$array_buffer_flags;
   assert(24 % 1 === 0);HEAP32[(($310)>>2)]=HEAP32[((640)>>2)];HEAP32[((($310)+(4))>>2)]=HEAP32[((644)>>2)];HEAP32[((($310)+(8))>>2)]=HEAP32[((648)>>2)];HEAP32[((($310)+(12))>>2)]=HEAP32[((652)>>2)];HEAP32[((($310)+(16))>>2)]=HEAP32[((656)>>2)];HEAP32[((($310)+(20))>>2)]=HEAP32[((660)>>2)];
   $pixelCount=10;
   var $311=$pixelCount;
   var $mul=((($311)*(12))&-1);
   var $call286=_malloc($mul);
   var $312=$call286;
   $pixels=$312;
   var $313=$pixelCount;
   var $mul287=((($313)*(12))&-1);
   $sizeBytes=$mul287;
   var $314=$pixelCount;
   var $mul288=((($314)*(12))&-1);
   var $call289=_malloc($mul288);
   var $315=$call289;
   $pixels2=$315;
   var $316=$pixelCount;
   var $mul290=((($316)*(12))&-1);
   $sizeBytes2=$mul290;
   $i=0;
   label = 35; break;
  case 35: 
   var $317=$i;
   var $318=$pixelCount;
   var $cmp292=(($317)|(0)) < (($318)|(0));
   if ($cmp292) { label = 36; break; } else { label = 38; break; }
  case 36: 
   var $call294=_rand();
   var $conv=(($call294)|(0));
   var $div=($conv)/(2147483648);
   var $319=$i;
   var $320=$pixels;
   var $arrayidx295=(($320+($319<<2))|0);
   HEAPF32[(($arrayidx295)>>2)]=$div;
   var $call296=_rand();
   var $conv297=(($call296)|(0));
   var $div298=($conv297)/(2147483648);
   var $mul299=($div298)*(100);
   var $conv300=(($mul299)&-1);
   var $321=$i;
   var $322=$pixels2;
   var $arrayidx301=(($322+($321<<2))|0);
   HEAP32[(($arrayidx301)>>2)]=$conv300;
   label = 37; break;
  case 37: 
   var $323=$i;
   var $inc303=((($323)+(1))|0);
   $i=$inc303;
   label = 35; break;
  case 38: 
   $i305=0;
   label = 39; break;
  case 39: 
   var $324=$i305;
   var $cmp307=(($324)|(0)) < 3;
   if ($cmp307) { label = 40; break; } else { label = 42; break; }
  case 40: 
   var $325=$context;
   var $326=$i305;
   var $arrayidx310=(($array_buffer_flags+($326<<3))|0);
   var $ld$77$0=(($arrayidx310)|0);
   var $327$0=HEAP32[(($ld$77$0)>>2)];
   var $ld$78$1=(($arrayidx310+4)|0);
   var $327$1=HEAP32[(($ld$78$1)>>2)];
   var $call311=_clCreateBuffer($325, $327$0, $327$1, 4, 0, $cl_errcode_ret);
   $buff=$call311;
   var $328=$counter;
   var $inc312=((($328)+(1))|0);
   $counter=$inc312;
   var $329=$i305;
   var $arrayidx313=(($array_buffer_flags+($329<<3))|0);
   var $ld$79$0=(($arrayidx313)|0);
   var $330$0=HEAP32[(($ld$79$0)>>2)];
   var $ld$80$1=(($arrayidx313+4)|0);
   var $330$1=HEAP32[(($ld$80$1)>>2)];
   var $331=$buff;
   var $332=$331;
   var $333=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$81=((2080)|0);
   var $call314=_printf($$etemp$81, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc312,HEAP32[(((tempVarArgs)+(8))>>2)]=$330$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$330$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$332,HEAP32[(((tempVarArgs)+(32))>>2)]=$333,tempVarArgs)); STACKTOP=tempVarArgs;
   var $334=$context;
   var $335=$i305;
   var $arrayidx315=(($array_buffer_flags+($335<<3))|0);
   var $ld$82$0=(($arrayidx315)|0);
   var $336$0=HEAP32[(($ld$82$0)>>2)];
   var $ld$83$1=(($arrayidx315+4)|0);
   var $336$1=HEAP32[(($ld$83$1)>>2)];
   var $$etemp$84$0=16;
   var $$etemp$84$1=0;
   var $or$0=$336$0 | $$etemp$84$0;
   var $or$1=$336$1 | $$etemp$84$1;
   var $337=$sizeBytes;
   var $call316=_clCreateBuffer($334, $or$0, $or$1, $337, 0, $cl_errcode_ret);
   $buff=$call316;
   var $338=$counter;
   var $inc317=((($338)+(1))|0);
   $counter=$inc317;
   var $339=$i305;
   var $arrayidx318=(($array_buffer_flags+($339<<3))|0);
   var $ld$85$0=(($arrayidx318)|0);
   var $340$0=HEAP32[(($ld$85$0)>>2)];
   var $ld$86$1=(($arrayidx318+4)|0);
   var $340$1=HEAP32[(($ld$86$1)>>2)];
   var $341=$buff;
   var $342=$341;
   var $343=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$87=((2080)|0);
   var $call319=_printf($$etemp$87, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc317,HEAP32[(((tempVarArgs)+(8))>>2)]=$340$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$340$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$342,HEAP32[(((tempVarArgs)+(32))>>2)]=$343,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call320=_clSetTypePointer(4318);
   var $344=$context;
   var $345=$i305;
   var $arrayidx321=(($array_buffer_flags+($345<<3))|0);
   var $ld$88$0=(($arrayidx321)|0);
   var $346$0=HEAP32[(($ld$88$0)>>2)];
   var $ld$89$1=(($arrayidx321+4)|0);
   var $346$1=HEAP32[(($ld$89$1)>>2)];
   var $$etemp$90$0=32;
   var $$etemp$90$1=0;
   var $or322$0=$346$0 | $$etemp$90$0;
   var $or322$1=$346$1 | $$etemp$90$1;
   var $347=$sizeBytes;
   var $348=$pixels;
   var $349=$348;
   var $call323=_clCreateBuffer($344, $or322$0, $or322$1, $347, $349, $cl_errcode_ret);
   $buff=$call323;
   var $350=$counter;
   var $inc324=((($350)+(1))|0);
   $counter=$inc324;
   var $351=$i305;
   var $arrayidx325=(($array_buffer_flags+($351<<3))|0);
   var $ld$91$0=(($arrayidx325)|0);
   var $352$0=HEAP32[(($ld$91$0)>>2)];
   var $ld$92$1=(($arrayidx325+4)|0);
   var $352$1=HEAP32[(($ld$92$1)>>2)];
   var $353=$buff;
   var $354=$353;
   var $355=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$93=((2080)|0);
   var $call326=_printf($$etemp$93, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc324,HEAP32[(((tempVarArgs)+(8))>>2)]=$352$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$352$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$354,HEAP32[(((tempVarArgs)+(32))>>2)]=$355,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call327=_clSetTypePointer(4313);
   var $356=$context;
   var $357=$i305;
   var $arrayidx328=(($array_buffer_flags+($357<<3))|0);
   var $ld$94$0=(($arrayidx328)|0);
   var $358$0=HEAP32[(($ld$94$0)>>2)];
   var $ld$95$1=(($arrayidx328+4)|0);
   var $358$1=HEAP32[(($ld$95$1)>>2)];
   var $$etemp$96$0=32;
   var $$etemp$96$1=0;
   var $or329$0=$358$0 | $$etemp$96$0;
   var $or329$1=$358$1 | $$etemp$96$1;
   var $359=$sizeBytes2;
   var $360=$pixels2;
   var $361=$360;
   var $call330=_clCreateBuffer($356, $or329$0, $or329$1, $359, $361, $cl_errcode_ret);
   $buff=$call330;
   var $362=$counter;
   var $inc331=((($362)+(1))|0);
   $counter=$inc331;
   var $363=$i305;
   var $arrayidx332=(($array_buffer_flags+($363<<3))|0);
   var $ld$97$0=(($arrayidx332)|0);
   var $364$0=HEAP32[(($ld$97$0)>>2)];
   var $ld$98$1=(($arrayidx332+4)|0);
   var $364$1=HEAP32[(($ld$98$1)>>2)];
   var $365=$buff;
   var $366=$365;
   var $367=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$99=((2080)|0);
   var $call333=_printf($$etemp$99, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc331,HEAP32[(((tempVarArgs)+(8))>>2)]=$364$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$364$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$366,HEAP32[(((tempVarArgs)+(32))>>2)]=$367,tempVarArgs)); STACKTOP=tempVarArgs;
   var $368=$context;
   var $369=$i305;
   var $arrayidx334=(($array_buffer_flags+($369<<3))|0);
   var $ld$100$0=(($arrayidx334)|0);
   var $370$0=HEAP32[(($ld$100$0)>>2)];
   var $ld$101$1=(($arrayidx334+4)|0);
   var $370$1=HEAP32[(($ld$101$1)>>2)];
   var $$etemp$102$0=8;
   var $$etemp$102$1=0;
   var $or335$0=$370$0 | $$etemp$102$0;
   var $or335$1=$370$1 | $$etemp$102$1;
   var $371=$sizeBytes2;
   var $372=$pixels2;
   var $373=$372;
   var $call336=_clCreateBuffer($368, $or335$0, $or335$1, $371, $373, $cl_errcode_ret);
   $buff=$call336;
   var $374=$counter;
   var $inc337=((($374)+(1))|0);
   $counter=$inc337;
   var $375=$i305;
   var $arrayidx338=(($array_buffer_flags+($375<<3))|0);
   var $ld$103$0=(($arrayidx338)|0);
   var $376$0=HEAP32[(($ld$103$0)>>2)];
   var $ld$104$1=(($arrayidx338+4)|0);
   var $376$1=HEAP32[(($ld$104$1)>>2)];
   var $377=$buff;
   var $378=$377;
   var $379=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$105=((2080)|0);
   var $call339=_printf($$etemp$105, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc337,HEAP32[(((tempVarArgs)+(8))>>2)]=$376$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$376$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$378,HEAP32[(((tempVarArgs)+(32))>>2)]=$379,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 41; break;
  case 41: 
   var $380=$i305;
   var $inc341=((($380)+(1))|0);
   $i305=$inc341;
   label = 39; break;
  case 42: 
   var $call343=_printf(((2048)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call344=_printf(((1984)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $381=$region1;
   assert(8 % 1 === 0);HEAP32[(($381)>>2)]=HEAP32[((32)>>2)];HEAP32[((($381)+(4))>>2)]=HEAP32[((36)>>2)];
   var $382=$region2;
   assert(8 % 1 === 0);HEAP32[(($382)>>2)]=HEAP32[((24)>>2)];HEAP32[((($382)+(4))>>2)]=HEAP32[((28)>>2)];
   var $383=$region3;
   assert(8 % 1 === 0);HEAP32[(($383)>>2)]=HEAP32[((16)>>2)];HEAP32[((($383)+(4))>>2)]=HEAP32[((20)>>2)];
   var $384=$region4;
   assert(8 % 1 === 0);HEAP32[(($384)>>2)]=HEAP32[((8)>>2)];HEAP32[((($384)+(4))>>2)]=HEAP32[((12)>>2)];
   $subbuffer=0;
   $i345=0;
   label = 43; break;
  case 43: 
   var $385=$i345;
   var $cmp347=(($385)|(0)) < 3;
   if ($cmp347) { label = 44; break; } else { label = 46; break; }
  case 44: 
   var $386=$buff;
   var $387=$i345;
   var $arrayidx350=(($array_buffer_flags+($387<<3))|0);
   var $ld$106$0=(($arrayidx350)|0);
   var $388$0=HEAP32[(($ld$106$0)>>2)];
   var $ld$107$1=(($arrayidx350+4)|0);
   var $388$1=HEAP32[(($ld$107$1)>>2)];
   var $389=$region2;
   var $call351=_clCreateSubBuffer($386, $388$0, $388$1, 4640, $389, $cl_errcode_ret);
   $subbuffer=$call351;
   var $390=$counter;
   var $inc352=((($390)+(1))|0);
   $counter=$inc352;
   var $391=$i345;
   var $arrayidx353=(($array_buffer_flags+($391<<3))|0);
   var $ld$108$0=(($arrayidx353)|0);
   var $392$0=HEAP32[(($ld$108$0)>>2)];
   var $ld$109$1=(($arrayidx353+4)|0);
   var $392$1=HEAP32[(($ld$109$1)>>2)];
   var $393=$subbuffer;
   var $394=$393;
   var $395=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$110=((2080)|0);
   var $call354=_printf($$etemp$110, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc352,HEAP32[(((tempVarArgs)+(8))>>2)]=$392$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$392$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$394,HEAP32[(((tempVarArgs)+(32))>>2)]=$395,tempVarArgs)); STACKTOP=tempVarArgs;
   var $396=$buff;
   var $397=$i345;
   var $arrayidx355=(($array_buffer_flags+($397<<3))|0);
   var $ld$111$0=(($arrayidx355)|0);
   var $398$0=HEAP32[(($ld$111$0)>>2)];
   var $ld$112$1=(($arrayidx355+4)|0);
   var $398$1=HEAP32[(($ld$112$1)>>2)];
   var $399=$region3;
   var $call356=_clCreateSubBuffer($396, $398$0, $398$1, 4640, $399, $cl_errcode_ret);
   $subbuffer=$call356;
   var $400=$counter;
   var $inc357=((($400)+(1))|0);
   $counter=$inc357;
   var $401=$i345;
   var $arrayidx358=(($array_buffer_flags+($401<<3))|0);
   var $ld$113$0=(($arrayidx358)|0);
   var $402$0=HEAP32[(($ld$113$0)>>2)];
   var $ld$114$1=(($arrayidx358+4)|0);
   var $402$1=HEAP32[(($ld$114$1)>>2)];
   var $403=$subbuffer;
   var $404=$403;
   var $405=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$115=((2080)|0);
   var $call359=_printf($$etemp$115, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc357,HEAP32[(((tempVarArgs)+(8))>>2)]=$402$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$402$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$404,HEAP32[(((tempVarArgs)+(32))>>2)]=$405,tempVarArgs)); STACKTOP=tempVarArgs;
   var $406=$buff;
   var $407=$i345;
   var $arrayidx360=(($array_buffer_flags+($407<<3))|0);
   var $ld$116$0=(($arrayidx360)|0);
   var $408$0=HEAP32[(($ld$116$0)>>2)];
   var $ld$117$1=(($arrayidx360+4)|0);
   var $408$1=HEAP32[(($ld$117$1)>>2)];
   var $409=$region4;
   var $call361=_clCreateSubBuffer($406, $408$0, $408$1, 4640, $409, $cl_errcode_ret);
   $subbuffer=$call361;
   var $410=$counter;
   var $inc362=((($410)+(1))|0);
   $counter=$inc362;
   var $411=$i345;
   var $arrayidx363=(($array_buffer_flags+($411<<3))|0);
   var $ld$118$0=(($arrayidx363)|0);
   var $412$0=HEAP32[(($ld$118$0)>>2)];
   var $ld$119$1=(($arrayidx363+4)|0);
   var $412$1=HEAP32[(($ld$119$1)>>2)];
   var $413=$subbuffer;
   var $414=$413;
   var $415=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$120=((2080)|0);
   var $call364=_printf($$etemp$120, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc362,HEAP32[(((tempVarArgs)+(8))>>2)]=$412$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$412$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$414,HEAP32[(((tempVarArgs)+(32))>>2)]=$415,tempVarArgs)); STACKTOP=tempVarArgs;
   var $416=$buff;
   var $417=$i345;
   var $arrayidx365=(($array_buffer_flags+($417<<3))|0);
   var $ld$121$0=(($arrayidx365)|0);
   var $418$0=HEAP32[(($ld$121$0)>>2)];
   var $ld$122$1=(($arrayidx365+4)|0);
   var $418$1=HEAP32[(($ld$122$1)>>2)];
   var $419=$region3;
   var $call366=_clCreateSubBuffer($416, $418$0, $418$1, 4640, $419, $cl_errcode_ret);
   $subbuffer=$call366;
   var $420=$counter;
   var $inc367=((($420)+(1))|0);
   $counter=$inc367;
   var $421=$i345;
   var $arrayidx368=(($array_buffer_flags+($421<<3))|0);
   var $ld$123$0=(($arrayidx368)|0);
   var $422$0=HEAP32[(($ld$123$0)>>2)];
   var $ld$124$1=(($arrayidx368+4)|0);
   var $422$1=HEAP32[(($ld$124$1)>>2)];
   var $423=$subbuffer;
   var $424=$423;
   var $425=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$125=((2080)|0);
   var $call369=_printf($$etemp$125, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc367,HEAP32[(((tempVarArgs)+(8))>>2)]=$422$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$422$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$424,HEAP32[(((tempVarArgs)+(32))>>2)]=$425,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 45; break;
  case 45: 
   var $426=$i345;
   var $inc371=((($426)+(1))|0);
   $i345=$inc371;
   label = 43; break;
  case 46: 
   var $call373=_printf(((1952)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call374=_printf(((1984)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $image_channel_order=(($img_fmt)|0);
   HEAP32[(($image_channel_order)>>2)]=4277;
   var $image_channel_data_type=(($img_fmt+4)|0);
   HEAP32[(($image_channel_data_type)>>2)]=4318;
   var $image_channel_order375=(($img_fmt2)|0);
   HEAP32[(($image_channel_order375)>>2)]=4277;
   var $image_channel_data_type376=(($img_fmt2+4)|0);
   HEAP32[(($image_channel_data_type376)>>2)]=4306;
   var $image_channel_order377=(($img_fmt3)|0);
   HEAP32[(($image_channel_order377)>>2)]=4279;
   var $image_channel_data_type378=(($img_fmt3+4)|0);
   HEAP32[(($image_channel_data_type378)>>2)]=4316;
   $height=10;
   $width=10;
   $i379=0;
   label = 47; break;
  case 47: 
   var $427=$i379;
   var $cmp381=(($427)|(0)) < 3;
   if ($cmp381) { label = 48; break; } else { label = 50; break; }
  case 48: 
   var $428=$context;
   var $429=$i379;
   var $arrayidx384=(($array_buffer_flags+($429<<3))|0);
   var $ld$126$0=(($arrayidx384)|0);
   var $430$0=HEAP32[(($ld$126$0)>>2)];
   var $ld$127$1=(($arrayidx384+4)|0);
   var $430$1=HEAP32[(($ld$127$1)>>2)];
   var $431=$width;
   var $432=$height;
   var $call385=_clCreateImage2D($428, $430$0, $430$1, $img_fmt, $431, $432, 0, 0, $cl_errcode_ret);
   $image=$call385;
   var $433=$counter;
   var $inc386=((($433)+(1))|0);
   $counter=$inc386;
   var $434=$i379;
   var $arrayidx387=(($array_buffer_flags+($434<<3))|0);
   var $ld$128$0=(($arrayidx387)|0);
   var $435$0=HEAP32[(($ld$128$0)>>2)];
   var $ld$129$1=(($arrayidx387+4)|0);
   var $435$1=HEAP32[(($ld$129$1)>>2)];
   var $436=$image;
   var $437=$436;
   var $438=HEAP32[(($cl_errcode_ret)>>2)];
   var $image_channel_order388=(($img_fmt)|0);
   var $439=HEAP32[(($image_channel_order388)>>2)];
   var $image_channel_data_type389=(($img_fmt+4)|0);
   var $440=HEAP32[(($image_channel_data_type389)>>2)];
   var $$etemp$130=((1920)|0);
   var $call390=_printf($$etemp$130, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 56)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc386,HEAP32[(((tempVarArgs)+(8))>>2)]=$435$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$435$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$437,HEAP32[(((tempVarArgs)+(32))>>2)]=$438,HEAP32[(((tempVarArgs)+(40))>>2)]=$439,HEAP32[(((tempVarArgs)+(48))>>2)]=$440,tempVarArgs)); STACKTOP=tempVarArgs;
   var $441=$context;
   var $442=$i379;
   var $arrayidx391=(($array_buffer_flags+($442<<3))|0);
   var $ld$131$0=(($arrayidx391)|0);
   var $443$0=HEAP32[(($ld$131$0)>>2)];
   var $ld$132$1=(($arrayidx391+4)|0);
   var $443$1=HEAP32[(($ld$132$1)>>2)];
   var $444=$width;
   var $445=$height;
   var $call392=_clCreateImage2D($441, $443$0, $443$1, $img_fmt3, $444, $445, 0, 0, $cl_errcode_ret);
   $image=$call392;
   var $446=$counter;
   var $inc393=((($446)+(1))|0);
   $counter=$inc393;
   var $447=$i379;
   var $arrayidx394=(($array_buffer_flags+($447<<3))|0);
   var $ld$133$0=(($arrayidx394)|0);
   var $448$0=HEAP32[(($ld$133$0)>>2)];
   var $ld$134$1=(($arrayidx394+4)|0);
   var $448$1=HEAP32[(($ld$134$1)>>2)];
   var $449=$image;
   var $450=$449;
   var $451=HEAP32[(($cl_errcode_ret)>>2)];
   var $image_channel_order395=(($img_fmt3)|0);
   var $452=HEAP32[(($image_channel_order395)>>2)];
   var $image_channel_data_type396=(($img_fmt3+4)|0);
   var $453=HEAP32[(($image_channel_data_type396)>>2)];
   var $$etemp$135=((1920)|0);
   var $call397=_printf($$etemp$135, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 56)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc393,HEAP32[(((tempVarArgs)+(8))>>2)]=$448$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$448$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$450,HEAP32[(((tempVarArgs)+(32))>>2)]=$451,HEAP32[(((tempVarArgs)+(40))>>2)]=$452,HEAP32[(((tempVarArgs)+(48))>>2)]=$453,tempVarArgs)); STACKTOP=tempVarArgs;
   var $454=$context;
   var $455=$i379;
   var $arrayidx398=(($array_buffer_flags+($455<<3))|0);
   var $ld$136$0=(($arrayidx398)|0);
   var $456$0=HEAP32[(($ld$136$0)>>2)];
   var $ld$137$1=(($arrayidx398+4)|0);
   var $456$1=HEAP32[(($ld$137$1)>>2)];
   var $$etemp$138$0=32;
   var $$etemp$138$1=0;
   var $or399$0=$456$0 | $$etemp$138$0;
   var $or399$1=$456$1 | $$etemp$138$1;
   var $457=$width;
   var $458=$height;
   var $459=$pixels2;
   var $460=$459;
   var $call400=_clCreateImage2D($454, $or399$0, $or399$1, $img_fmt2, $457, $458, 0, $460, $cl_errcode_ret);
   $image=$call400;
   var $461=$counter;
   var $inc401=((($461)+(1))|0);
   $counter=$inc401;
   var $462=$i379;
   var $arrayidx402=(($array_buffer_flags+($462<<3))|0);
   var $ld$139$0=(($arrayidx402)|0);
   var $463$0=HEAP32[(($ld$139$0)>>2)];
   var $ld$140$1=(($arrayidx402+4)|0);
   var $463$1=HEAP32[(($ld$140$1)>>2)];
   var $464=$image;
   var $465=$464;
   var $466=HEAP32[(($cl_errcode_ret)>>2)];
   var $image_channel_order403=(($img_fmt2)|0);
   var $467=HEAP32[(($image_channel_order403)>>2)];
   var $image_channel_data_type404=(($img_fmt2+4)|0);
   var $468=HEAP32[(($image_channel_data_type404)>>2)];
   var $$etemp$141=((1920)|0);
   var $call405=_printf($$etemp$141, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 56)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc401,HEAP32[(((tempVarArgs)+(8))>>2)]=$463$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$463$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$465,HEAP32[(((tempVarArgs)+(32))>>2)]=$466,HEAP32[(((tempVarArgs)+(40))>>2)]=$467,HEAP32[(((tempVarArgs)+(48))>>2)]=$468,tempVarArgs)); STACKTOP=tempVarArgs;
   var $469=$context;
   var $470=$i379;
   var $arrayidx406=(($array_buffer_flags+($470<<3))|0);
   var $ld$142$0=(($arrayidx406)|0);
   var $471$0=HEAP32[(($ld$142$0)>>2)];
   var $ld$143$1=(($arrayidx406+4)|0);
   var $471$1=HEAP32[(($ld$143$1)>>2)];
   var $472=$width;
   var $473=$height;
   var $call407=_clCreateImage2D($469, $471$0, $471$1, $img_fmt2, $472, $473, 0, 0, $cl_errcode_ret);
   $image=$call407;
   var $474=$counter;
   var $inc408=((($474)+(1))|0);
   $counter=$inc408;
   var $475=$i379;
   var $arrayidx409=(($array_buffer_flags+($475<<3))|0);
   var $ld$144$0=(($arrayidx409)|0);
   var $476$0=HEAP32[(($ld$144$0)>>2)];
   var $ld$145$1=(($arrayidx409+4)|0);
   var $476$1=HEAP32[(($ld$145$1)>>2)];
   var $477=$image;
   var $478=$477;
   var $479=HEAP32[(($cl_errcode_ret)>>2)];
   var $image_channel_order410=(($img_fmt2)|0);
   var $480=HEAP32[(($image_channel_order410)>>2)];
   var $image_channel_data_type411=(($img_fmt2+4)|0);
   var $481=HEAP32[(($image_channel_data_type411)>>2)];
   var $$etemp$146=((1920)|0);
   var $call412=_printf($$etemp$146, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 56)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc408,HEAP32[(((tempVarArgs)+(8))>>2)]=$476$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$476$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$478,HEAP32[(((tempVarArgs)+(32))>>2)]=$479,HEAP32[(((tempVarArgs)+(40))>>2)]=$480,HEAP32[(((tempVarArgs)+(48))>>2)]=$481,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 49; break;
  case 49: 
   var $482=$i379;
   var $inc414=((($482)+(1))|0);
   $i379=$inc414;
   label = 47; break;
  case 50: 
   var $call416=_printf(((1888)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call417=_printf(((1856)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $483=$array_mem_info;
   assert(36 % 1 === 0);(_memcpy($483, 176, 36)|0);
   $i418=0;
   label = 51; break;
  case 51: 
   var $484=$i418;
   var $cmp420=(($484)|(0)) < 9;
   if ($cmp420) { label = 52; break; } else { label = 54; break; }
  case 52: 
   var $485=$subbuffer;
   var $486=$i418;
   var $arrayidx423=(($array_mem_info+($486<<2))|0);
   var $487=HEAP32[(($arrayidx423)>>2)];
   var $488=$value;
   var $call424=_clGetMemObjectInfo($485, $487, 4, $488, $size);
   HEAP32[(($err)>>2)]=$call424;
   var $489=$counter;
   var $inc425=((($489)+(1))|0);
   $counter=$inc425;
   var $490=$i418;
   var $arrayidx426=(($array_mem_info+($490<<2))|0);
   var $491=HEAP32[(($arrayidx426)>>2)];
   var $492=HEAP32[(($err)>>2)];
   var $493=HEAP32[(($size)>>2)];
   var $494=HEAP32[(($value)>>2)];
   var $call427=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc425,HEAP32[(((tempVarArgs)+(8))>>2)]=$491,HEAP32[(((tempVarArgs)+(16))>>2)]=$492,HEAP32[(((tempVarArgs)+(24))>>2)]=$493,HEAP32[(((tempVarArgs)+(32))>>2)]=$494,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 53; break;
  case 53: 
   var $495=$i418;
   var $inc429=((($495)+(1))|0);
   $i418=$inc429;
   label = 51; break;
  case 54: 
   var $496=$buff;
   var $arrayidx431=(($array_mem_info+32)|0);
   var $497=HEAP32[(($arrayidx431)>>2)];
   var $498=$value;
   var $call432=_clGetMemObjectInfo($496, $497, 4, $498, $size);
   HEAP32[(($err)>>2)]=$call432;
   var $499=$counter;
   var $inc433=((($499)+(1))|0);
   $counter=$inc433;
   var $arrayidx434=(($array_mem_info+32)|0);
   var $500=HEAP32[(($arrayidx434)>>2)];
   var $501=HEAP32[(($err)>>2)];
   var $502=HEAP32[(($size)>>2)];
   var $503=HEAP32[(($value)>>2)];
   var $call435=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc433,HEAP32[(((tempVarArgs)+(8))>>2)]=$500,HEAP32[(((tempVarArgs)+(16))>>2)]=$501,HEAP32[(((tempVarArgs)+(24))>>2)]=$502,HEAP32[(((tempVarArgs)+(32))>>2)]=$503,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call436=_printf(((1832)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call437=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $504=$array_img_info;
   assert(28 % 1 === 0);HEAP32[(($504)>>2)]=HEAP32[((568)>>2)];HEAP32[((($504)+(4))>>2)]=HEAP32[((572)>>2)];HEAP32[((($504)+(8))>>2)]=HEAP32[((576)>>2)];HEAP32[((($504)+(12))>>2)]=HEAP32[((580)>>2)];HEAP32[((($504)+(16))>>2)]=HEAP32[((584)>>2)];HEAP32[((($504)+(20))>>2)]=HEAP32[((588)>>2)];HEAP32[((($504)+(24))>>2)]=HEAP32[((592)>>2)];
   $i438=0;
   label = 55; break;
  case 55: 
   var $505=$i438;
   var $cmp440=(($505)|(0)) < 7;
   if ($cmp440) { label = 56; break; } else { label = 58; break; }
  case 56: 
   var $506=$image;
   var $507=$i438;
   var $arrayidx443=(($array_img_info+($507<<2))|0);
   var $508=HEAP32[(($arrayidx443)>>2)];
   var $509=$value;
   var $call444=_clGetImageInfo($506, $508, 4, $509, $size);
   HEAP32[(($err)>>2)]=$call444;
   var $510=$counter;
   var $inc445=((($510)+(1))|0);
   $counter=$inc445;
   var $511=$i438;
   var $arrayidx446=(($array_img_info+($511<<2))|0);
   var $512=HEAP32[(($arrayidx446)>>2)];
   var $513=HEAP32[(($err)>>2)];
   var $514=HEAP32[(($size)>>2)];
   var $515=HEAP32[(($value)>>2)];
   var $call447=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc445,HEAP32[(((tempVarArgs)+(8))>>2)]=$512,HEAP32[(((tempVarArgs)+(16))>>2)]=$513,HEAP32[(((tempVarArgs)+(24))>>2)]=$514,HEAP32[(((tempVarArgs)+(32))>>2)]=$515,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 57; break;
  case 57: 
   var $516=$i438;
   var $inc449=((($516)+(1))|0);
   $i438=$inc449;
   label = 55; break;
  case 58: 
   var $call451=_printf(((1800)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call452=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call453=_clReleaseMemObject(0);
   HEAP32[(($err)>>2)]=$call453;
   var $517=$counter;
   var $inc454=((($517)+(1))|0);
   $counter=$inc454;
   var $518=HEAP32[(($err)>>2)];
   var $call455=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc454,HEAP32[(((tempVarArgs)+(8))>>2)]=$518,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $519=$subbuffer;
   var $call456=_clReleaseMemObject($519);
   HEAP32[(($err)>>2)]=$call456;
   var $520=$counter;
   var $inc457=((($520)+(1))|0);
   $counter=$inc457;
   var $521=HEAP32[(($err)>>2)];
   var $522=$subbuffer;
   var $523=$522;
   var $call458=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc457,HEAP32[(((tempVarArgs)+(8))>>2)]=$521,HEAP32[(((tempVarArgs)+(16))>>2)]=$523,tempVarArgs)); STACKTOP=tempVarArgs;
   var $524=$image;
   var $call459=_clReleaseMemObject($524);
   HEAP32[(($err)>>2)]=$call459;
   var $525=$counter;
   var $inc460=((($525)+(1))|0);
   $counter=$inc460;
   var $526=HEAP32[(($err)>>2)];
   var $527=$image;
   var $528=$527;
   var $call461=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc460,HEAP32[(((tempVarArgs)+(8))>>2)]=$526,HEAP32[(((tempVarArgs)+(16))>>2)]=$528,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call462=_printf(((1760)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call463=_printf(((1720)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($uiNumSupportedFormats)>>2)]=0;
   $i464=0;
   label = 59; break;
  case 59: 
   var $529=$i464;
   var $cmp466=(($529)|(0)) < 3;
   if ($cmp466) { label = 60; break; } else { label = 66; break; }
  case 60: 
   var $530=$context;
   var $531=$i464;
   var $arrayidx469=(($array_buffer_flags+($531<<3))|0);
   var $ld$147$0=(($arrayidx469)|0);
   var $532$0=HEAP32[(($ld$147$0)>>2)];
   var $ld$148$1=(($arrayidx469+4)|0);
   var $532$1=HEAP32[(($ld$148$1)>>2)];
   var $call470=_clGetSupportedImageFormats($530, $532$0, $532$1, 4337, 0, 0, $uiNumSupportedFormats);
   HEAP32[(($err)>>2)]=$call470;
   var $533=$counter;
   var $inc471=((($533)+(1))|0);
   $counter=$inc471;
   var $534=HEAP32[(($err)>>2)];
   var $535=HEAP32[(($uiNumSupportedFormats)>>2)];
   var $call472=_printf(((1704)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc471,HEAP32[(((tempVarArgs)+(8))>>2)]=$534,HEAP32[(((tempVarArgs)+(16))>>2)]=$535,tempVarArgs)); STACKTOP=tempVarArgs;
   var $536=HEAP32[(($uiNumSupportedFormats)>>2)];
   var $537=_llvm_stacksave();
   $saved_stack=$537;
   var $vla=STACKTOP;STACKTOP = (STACKTOP + ((($536)*(8))&-1))|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3);(assert((STACKTOP|0) < (STACK_MAX|0))|0);
   var $538=$context;
   var $539=$i464;
   var $arrayidx473=(($array_buffer_flags+($539<<3))|0);
   var $ld$149$0=(($arrayidx473)|0);
   var $540$0=HEAP32[(($ld$149$0)>>2)];
   var $ld$150$1=(($arrayidx473+4)|0);
   var $540$1=HEAP32[(($ld$150$1)>>2)];
   var $541=HEAP32[(($uiNumSupportedFormats)>>2)];
   var $call474=_clGetSupportedImageFormats($538, $540$0, $540$1, 4337, $541, $vla, 0);
   HEAP32[(($err)>>2)]=$call474;
   $i475=0;
   label = 61; break;
  case 61: 
   var $542=$i475;
   var $543=HEAP32[(($uiNumSupportedFormats)>>2)];
   var $cmp477=(($542)>>>(0)) < (($543)>>>(0));
   if ($cmp477) { label = 62; break; } else { label = 64; break; }
  case 62: 
   var $544=$counter;
   var $inc480=((($544)+(1))|0);
   $counter=$inc480;
   var $545=HEAP32[(($err)>>2)];
   var $546=$i475;
   var $arrayidx481=(($vla+($546<<3))|0);
   var $image_channel_order482=(($arrayidx481)|0);
   var $547=HEAP32[(($image_channel_order482)>>2)];
   var $548=$i475;
   var $arrayidx483=(($vla+($548<<3))|0);
   var $image_channel_data_type484=(($arrayidx483+4)|0);
   var $549=HEAP32[(($image_channel_data_type484)>>2)];
   var $call485=_printf(((1672)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc480,HEAP32[(((tempVarArgs)+(8))>>2)]=$545,HEAP32[(((tempVarArgs)+(16))>>2)]=$547,HEAP32[(((tempVarArgs)+(24))>>2)]=$549,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 63; break;
  case 63: 
   var $550=$i475;
   var $inc487=((($550)+(1))|0);
   $i475=$inc487;
   label = 61; break;
  case 64: 
   var $551=$saved_stack;
   _llvm_stackrestore($551);
   label = 65; break;
  case 65: 
   var $552=$i464;
   var $inc490=((($552)+(1))|0);
   $i464=$inc490;
   label = 59; break;
  case 66: 
   var $call492=_printf(((1640)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call493=_printf(((1984)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $553=$addr;
   assert(20 % 1 === 0);HEAP32[(($553)>>2)]=HEAP32[((664)>>2)];HEAP32[((($553)+(4))>>2)]=HEAP32[((668)>>2)];HEAP32[((($553)+(8))>>2)]=HEAP32[((672)>>2)];HEAP32[((($553)+(12))>>2)]=HEAP32[((676)>>2)];HEAP32[((($553)+(16))>>2)]=HEAP32[((680)>>2)];
   var $554=$filter;
   assert(8 % 1 === 0);HEAP32[(($554)>>2)]=HEAP32[((88)>>2)];HEAP32[((($554)+(4))>>2)]=HEAP32[((92)>>2)];
   var $555=$boolean;
   assert(8 % 1 === 0);HEAP32[(($555)>>2)]=HEAP32[((96)>>2)];HEAP32[((($555)+(4))>>2)]=HEAP32[((100)>>2)];
   $i494=0;
   label = 67; break;
  case 67: 
   var $556=$i494;
   var $cmp496=(($556)|(0)) < 5;
   if ($cmp496) { label = 68; break; } else { label = 78; break; }
  case 68: 
   $j=0;
   label = 69; break;
  case 69: 
   var $557=$j;
   var $cmp500=(($557)|(0)) < 2;
   if ($cmp500) { label = 70; break; } else { label = 76; break; }
  case 70: 
   $k=0;
   label = 71; break;
  case 71: 
   var $558=$k;
   var $cmp504=(($558)|(0)) < 2;
   if ($cmp504) { label = 72; break; } else { label = 74; break; }
  case 72: 
   var $559=$context;
   var $560=$k;
   var $arrayidx507=(($boolean+($560<<2))|0);
   var $561=HEAP32[(($arrayidx507)>>2)];
   var $562=$i494;
   var $arrayidx508=(($addr+($562<<2))|0);
   var $563=HEAP32[(($arrayidx508)>>2)];
   var $564=$j;
   var $arrayidx509=(($filter+($564<<2))|0);
   var $565=HEAP32[(($arrayidx509)>>2)];
   var $call510=_clCreateSampler($559, $561, $563, $565, $cl_errcode_ret);
   $sampler=$call510;
   var $566=$counter;
   var $inc511=((($566)+(1))|0);
   $counter=$inc511;
   var $567=$sampler;
   var $568=$567;
   var $569=HEAP32[(($cl_errcode_ret)>>2)];
   var $570=$k;
   var $arrayidx512=(($boolean+($570<<2))|0);
   var $571=HEAP32[(($arrayidx512)>>2)];
   var $572=$i494;
   var $arrayidx513=(($addr+($572<<2))|0);
   var $573=HEAP32[(($arrayidx513)>>2)];
   var $574=$j;
   var $arrayidx514=(($filter+($574<<2))|0);
   var $575=HEAP32[(($arrayidx514)>>2)];
   var $call515=_printf(((1616)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 48)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc511,HEAP32[(((tempVarArgs)+(8))>>2)]=$568,HEAP32[(((tempVarArgs)+(16))>>2)]=$569,HEAP32[(((tempVarArgs)+(24))>>2)]=$571,HEAP32[(((tempVarArgs)+(32))>>2)]=$573,HEAP32[(((tempVarArgs)+(40))>>2)]=$575,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 73; break;
  case 73: 
   var $576=$k;
   var $inc517=((($576)+(1))|0);
   $k=$inc517;
   label = 71; break;
  case 74: 
   label = 75; break;
  case 75: 
   var $577=$j;
   var $inc520=((($577)+(1))|0);
   $j=$inc520;
   label = 69; break;
  case 76: 
   label = 77; break;
  case 77: 
   var $578=$i494;
   var $inc523=((($578)+(1))|0);
   $i494=$inc523;
   label = 67; break;
  case 78: 
   var $579=$context;
   var $call526=_clCreateSampler($579, 0, 4400, 4416, $cl_errcode_ret);
   $sampler525=$call526;
   var $call527=_printf(((1584)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call528=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $580=$array_sampler_info;
   assert(20 % 1 === 0);HEAP32[(($580)>>2)]=HEAP32[((104)>>2)];HEAP32[((($580)+(4))>>2)]=HEAP32[((108)>>2)];HEAP32[((($580)+(8))>>2)]=HEAP32[((112)>>2)];HEAP32[((($580)+(12))>>2)]=HEAP32[((116)>>2)];HEAP32[((($580)+(16))>>2)]=HEAP32[((120)>>2)];
   $i529=0;
   label = 79; break;
  case 79: 
   var $581=$i529;
   var $cmp531=(($581)|(0)) < 5;
   if ($cmp531) { label = 80; break; } else { label = 82; break; }
  case 80: 
   var $582=$sampler525;
   var $583=$i529;
   var $arrayidx534=(($array_sampler_info+($583<<2))|0);
   var $584=HEAP32[(($arrayidx534)>>2)];
   var $585=$value;
   var $call535=_clGetSamplerInfo($582, $584, 4, $585, $size);
   HEAP32[(($err)>>2)]=$call535;
   var $586=$counter;
   var $inc536=((($586)+(1))|0);
   $counter=$inc536;
   var $587=$i529;
   var $arrayidx537=(($array_sampler_info+($587<<2))|0);
   var $588=HEAP32[(($arrayidx537)>>2)];
   var $589=HEAP32[(($err)>>2)];
   var $590=HEAP32[(($size)>>2)];
   var $591=HEAP32[(($value)>>2)];
   var $call538=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc536,HEAP32[(((tempVarArgs)+(8))>>2)]=$588,HEAP32[(((tempVarArgs)+(16))>>2)]=$589,HEAP32[(((tempVarArgs)+(24))>>2)]=$590,HEAP32[(((tempVarArgs)+(32))>>2)]=$591,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 81; break;
  case 81: 
   var $592=$i529;
   var $inc540=((($592)+(1))|0);
   $i529=$inc540;
   label = 79; break;
  case 82: 
   var $call542=_printf(((1552)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call543=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call544=_clReleaseSampler(0);
   HEAP32[(($err)>>2)]=$call544;
   var $593=$counter;
   var $inc545=((($593)+(1))|0);
   $counter=$inc545;
   var $594=HEAP32[(($err)>>2)];
   var $call546=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc545,HEAP32[(((tempVarArgs)+(8))>>2)]=$594,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $595=$sampler525;
   var $call547=_clReleaseSampler($595);
   HEAP32[(($err)>>2)]=$call547;
   var $596=$counter;
   var $inc548=((($596)+(1))|0);
   $counter=$inc548;
   var $597=HEAP32[(($err)>>2)];
   var $598=$sampler525;
   var $599=$598;
   var $call549=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc548,HEAP32[(((tempVarArgs)+(8))>>2)]=$597,HEAP32[(((tempVarArgs)+(16))>>2)]=$599,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call550=_printf(((1512)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call551=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $600=$context;
   var $call552=_clCreateProgramWithSource($600, 1, 3600, 0, $cl_errcode_ret);
   $program=$call552;
   var $601=$counter;
   var $inc553=((($601)+(1))|0);
   $counter=$inc553;
   var $602=$program;
   var $603=$602;
   var $604=HEAP32[(($cl_errcode_ret)>>2)];
   var $call554=_printf(((2816)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc553,HEAP32[(((tempVarArgs)+(8))>>2)]=$603,HEAP32[(((tempVarArgs)+(16))>>2)]=$604,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call555=_printf(((1480)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call556=_printf(((1448)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $605=$context;
   var $call557=_clCreateProgramWithSource($605, 1, 3600, 0, $cl_errcode_ret);
   $program2=$call557;
   var $call558=_clReleaseProgram(0);
   HEAP32[(($err)>>2)]=$call558;
   var $606=$counter;
   var $inc559=((($606)+(1))|0);
   $counter=$inc559;
   var $607=HEAP32[(($err)>>2)];
   var $call560=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc559,HEAP32[(((tempVarArgs)+(8))>>2)]=$607,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $608=$program2;
   var $call561=_clReleaseProgram($608);
   HEAP32[(($err)>>2)]=$call561;
   var $609=$counter;
   var $inc562=((($609)+(1))|0);
   $counter=$inc562;
   var $610=HEAP32[(($err)>>2)];
   var $611=$program2;
   var $612=$611;
   var $call563=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc562,HEAP32[(((tempVarArgs)+(8))>>2)]=$610,HEAP32[(((tempVarArgs)+(16))>>2)]=$612,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call564=_printf(((1424)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call565=_printf(((1448)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $613=$program;
   var $call566=_clBuildProgram($613, 0, 0, 0, 0, 0);
   HEAP32[(($err)>>2)]=$call566;
   var $614=$counter;
   var $inc567=((($614)+(1))|0);
   $counter=$inc567;
   var $615=HEAP32[(($err)>>2)];
   var $616=$program;
   var $617=$616;
   var $call568=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc567,HEAP32[(((tempVarArgs)+(8))>>2)]=$615,HEAP32[(((tempVarArgs)+(16))>>2)]=$617,tempVarArgs)); STACKTOP=tempVarArgs;
   var $618=$program;
   var $619=HEAP32[(($first_device_id)>>2)];
   var $620=$619;
   var $call569=_clBuildProgram($618, 1, $620, 0, 0, 0);
   HEAP32[(($err)>>2)]=$call569;
   var $621=$counter;
   var $inc570=((($621)+(1))|0);
   $counter=$inc570;
   var $622=HEAP32[(($err)>>2)];
   var $623=$program;
   var $624=$623;
   var $625=HEAP32[(($first_device_id)>>2)];
   var $626=$625;
   var $call571=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc570,HEAP32[(((tempVarArgs)+(8))>>2)]=$622,HEAP32[(((tempVarArgs)+(16))>>2)]=$624,HEAP32[(((tempVarArgs)+(24))>>2)]=$626,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call572=_strdup(((1416)|0));
   var $arrayidx573=(($options)|0);
   HEAP32[(($arrayidx573)>>2)]=$call572;
   var $call574=_strdup(((1384)|0));
   var $arrayidx575=(($options+4)|0);
   HEAP32[(($arrayidx575)>>2)]=$call574;
   var $call576=_strdup(((1368)|0));
   var $arrayidx577=(($options+8)|0);
   HEAP32[(($arrayidx577)>>2)]=$call576;
   var $call578=_strdup(((1336)|0));
   var $arrayidx579=(($options+12)|0);
   HEAP32[(($arrayidx579)>>2)]=$call578;
   var $call580=_strdup(((1312)|0));
   var $arrayidx581=(($options+16)|0);
   HEAP32[(($arrayidx581)>>2)]=$call580;
   var $call582=_strdup(((1296)|0));
   var $arrayidx583=(($options+20)|0);
   HEAP32[(($arrayidx583)>>2)]=$call582;
   var $call584=_strdup(((1272)|0));
   var $arrayidx585=(($options+24)|0);
   HEAP32[(($arrayidx585)>>2)]=$call584;
   var $call586=_strdup(((1240)|0));
   var $arrayidx587=(($options+28)|0);
   HEAP32[(($arrayidx587)>>2)]=$call586;
   var $call588=_strdup(((1216)|0));
   var $arrayidx589=(($options+32)|0);
   HEAP32[(($arrayidx589)>>2)]=$call588;
   var $call590=_strdup(((1192)|0));
   var $arrayidx591=(($options+36)|0);
   HEAP32[(($arrayidx591)>>2)]=$call590;
   var $call592=_strdup(((1184)|0));
   var $arrayidx593=(($options+40)|0);
   HEAP32[(($arrayidx593)>>2)]=$call592;
   var $call594=_strdup(((1144)|0));
   var $arrayidx595=(($options+44)|0);
   HEAP32[(($arrayidx595)>>2)]=$call594;
   var $call596=_strdup(((1128)|0));
   var $arrayidx597=(($options+48)|0);
   HEAP32[(($arrayidx597)>>2)]=$call596;
   $i598=0;
   label = 83; break;
  case 83: 
   var $627=$i598;
   var $cmp600=(($627)|(0)) < 14;
   if ($cmp600) { label = 84; break; } else { label = 86; break; }
  case 84: 
   var $628=$program;
   var $629=HEAP32[(($first_device_id)>>2)];
   var $630=$629;
   var $631=$i598;
   var $arrayidx603=(($options+($631<<2))|0);
   var $632=HEAP32[(($arrayidx603)>>2)];
   var $call604=_clBuildProgram($628, 1, $630, $632, 0, 0);
   HEAP32[(($err)>>2)]=$call604;
   var $633=$counter;
   var $inc605=((($633)+(1))|0);
   $counter=$inc605;
   var $634=HEAP32[(($err)>>2)];
   var $635=$program;
   var $636=$635;
   var $637=HEAP32[(($first_device_id)>>2)];
   var $638=$637;
   var $639=$i598;
   var $arrayidx606=(($options+($639<<2))|0);
   var $640=HEAP32[(($arrayidx606)>>2)];
   var $call607=_printf(((1104)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc605,HEAP32[(((tempVarArgs)+(8))>>2)]=$634,HEAP32[(((tempVarArgs)+(16))>>2)]=$636,HEAP32[(((tempVarArgs)+(24))>>2)]=$638,HEAP32[(((tempVarArgs)+(32))>>2)]=$640,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 85; break;
  case 85: 
   var $641=$i598;
   var $inc609=((($641)+(1))|0);
   $i598=$inc609;
   label = 83; break;
  case 86: 
   var $642=$program;
   var $643=HEAP32[(($first_device_id)>>2)];
   var $644=$643;
   var $645=$counter;
   var $inc611=((($645)+(1))|0);
   $counter=$inc611;
   var $646=$inc611;
   var $call612=_clBuildProgram($642, 1, $644, 0, 2, $646);
   HEAP32[(($err)>>2)]=$call612;
   var $647=$counter;
   var $inc613=((($647)+(1))|0);
   $counter=$inc613;
   var $648=HEAP32[(($err)>>2)];
   var $649=$program;
   var $650=$649;
   var $651=HEAP32[(($first_device_id)>>2)];
   var $652=$651;
   var $call614=_printf(((1080)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc613,HEAP32[(((tempVarArgs)+(8))>>2)]=$648,HEAP32[(((tempVarArgs)+(16))>>2)]=$650,HEAP32[(((tempVarArgs)+(24))>>2)]=$652,HEAP32[(((tempVarArgs)+(32))>>2)]=2,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call615=_printf(((1048)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call616=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   var $653=$array_program_build_info;
   assert(12 % 1 === 0);HEAP32[(($653)>>2)]=HEAP32[((160)>>2)];HEAP32[((($653)+(4))>>2)]=HEAP32[((164)>>2)];HEAP32[((($653)+(8))>>2)]=HEAP32[((168)>>2)];
   $i617=0;
   label = 87; break;
  case 87: 
   var $654=$i617;
   var $cmp619=(($654)|(0)) < 3;
   if ($cmp619) { label = 88; break; } else { label = 90; break; }
  case 88: 
   var $655=$program;
   var $656=HEAP32[(($first_device_id)>>2)];
   var $657=$i617;
   var $arrayidx622=(($array_program_build_info+($657<<2))|0);
   var $658=HEAP32[(($arrayidx622)>>2)];
   var $659=$value;
   var $call623=_clGetProgramBuildInfo($655, $656, $658, 4, $659, $size);
   HEAP32[(($err)>>2)]=$call623;
   var $660=$counter;
   var $inc624=((($660)+(1))|0);
   $counter=$inc624;
   var $661=$i617;
   var $arrayidx625=(($array_program_build_info+($661<<2))|0);
   var $662=HEAP32[(($arrayidx625)>>2)];
   var $663=HEAP32[(($err)>>2)];
   var $664=HEAP32[(($size)>>2)];
   var $665=HEAP32[(($value)>>2)];
   var $call626=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc624,HEAP32[(((tempVarArgs)+(8))>>2)]=$662,HEAP32[(((tempVarArgs)+(16))>>2)]=$663,HEAP32[(((tempVarArgs)+(24))>>2)]=$664,HEAP32[(((tempVarArgs)+(32))>>2)]=$665,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 89; break;
  case 89: 
   var $666=$i617;
   var $inc628=((($666)+(1))|0);
   $i617=$inc628;
   label = 87; break;
  case 90: 
   var $call630=_printf(((1016)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call631=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   var $667=$array_program_info;
   assert(28 % 1 === 0);HEAP32[(($667)>>2)]=HEAP32[((128)>>2)];HEAP32[((($667)+(4))>>2)]=HEAP32[((132)>>2)];HEAP32[((($667)+(8))>>2)]=HEAP32[((136)>>2)];HEAP32[((($667)+(12))>>2)]=HEAP32[((140)>>2)];HEAP32[((($667)+(16))>>2)]=HEAP32[((144)>>2)];HEAP32[((($667)+(20))>>2)]=HEAP32[((148)>>2)];HEAP32[((($667)+(24))>>2)]=HEAP32[((152)>>2)];
   $i632=0;
   label = 91; break;
  case 91: 
   var $668=$i632;
   var $cmp634=(($668)|(0)) < 7;
   if ($cmp634) { label = 92; break; } else { label = 94; break; }
  case 92: 
   var $669=$program;
   var $670=$i632;
   var $arrayidx637=(($array_program_info+($670<<2))|0);
   var $671=HEAP32[(($arrayidx637)>>2)];
   var $672=$value;
   var $call638=_clGetProgramInfo($669, $671, 4, $672, $size);
   HEAP32[(($err)>>2)]=$call638;
   var $673=$counter;
   var $inc639=((($673)+(1))|0);
   $counter=$inc639;
   var $674=$i632;
   var $arrayidx640=(($array_program_info+($674<<2))|0);
   var $675=HEAP32[(($arrayidx640)>>2)];
   var $676=HEAP32[(($err)>>2)];
   var $677=HEAP32[(($size)>>2)];
   var $678=HEAP32[(($value)>>2)];
   var $call641=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc639,HEAP32[(((tempVarArgs)+(8))>>2)]=$675,HEAP32[(((tempVarArgs)+(16))>>2)]=$676,HEAP32[(((tempVarArgs)+(24))>>2)]=$677,HEAP32[(((tempVarArgs)+(32))>>2)]=$678,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 93; break;
  case 93: 
   var $679=$i632;
   var $inc643=((($679)+(1))|0);
   $i632=$inc643;
   label = 91; break;
  case 94: 
   var $call645=_printf(((992)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call646=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $680=$program;
   var $call647=_clCreateKernel($680, 0, $err);
   $kernel=$call647;
   var $681=$counter;
   var $inc648=((($681)+(1))|0);
   $counter=$inc648;
   var $682=$program;
   var $683=$682;
   var $684=HEAP32[(($err)>>2)];
   var $call649=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc648,HEAP32[(((tempVarArgs)+(8))>>2)]=$683,HEAP32[(((tempVarArgs)+(16))>>2)]=$684,tempVarArgs)); STACKTOP=tempVarArgs;
   var $685=$program;
   var $call650=_clCreateKernel($685, ((3632)|0), $err);
   $kernel=$call650;
   var $686=$counter;
   var $inc651=((($686)+(1))|0);
   $counter=$inc651;
   var $687=$program;
   var $688=$687;
   var $689=HEAP32[(($err)>>2)];
   var $call652=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc651,HEAP32[(((tempVarArgs)+(8))>>2)]=$688,HEAP32[(((tempVarArgs)+(16))>>2)]=$689,tempVarArgs)); STACKTOP=tempVarArgs;
   var $690=$program;
   var $call653=_clCreateKernel($690, ((984)|0), $err);
   $kernel=$call653;
   var $691=$counter;
   var $inc654=((($691)+(1))|0);
   $counter=$inc654;
   var $692=$program;
   var $693=$692;
   var $694=HEAP32[(($err)>>2)];
   var $call655=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc654,HEAP32[(((tempVarArgs)+(8))>>2)]=$693,HEAP32[(((tempVarArgs)+(16))>>2)]=$694,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call656=_printf(((944)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call657=_printf(((896)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $695=$program;
   var $call658=_clCreateKernelsInProgram($695, 0, 0, $size);
   HEAP32[(($err)>>2)]=$call658;
   var $696=$counter;
   var $inc659=((($696)+(1))|0);
   $counter=$inc659;
   var $697=$program;
   var $698=$697;
   var $699=HEAP32[(($err)>>2)];
   var $700=HEAP32[(($size)>>2)];
   var $call660=_printf(((872)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc659,HEAP32[(((tempVarArgs)+(8))>>2)]=$698,HEAP32[(((tempVarArgs)+(16))>>2)]=$699,HEAP32[(((tempVarArgs)+(24))>>2)]=$700,tempVarArgs)); STACKTOP=tempVarArgs;
   var $701=$program;
   var $call661=_clCreateKernelsInProgram($701, 1, $kernel2, $size);
   HEAP32[(($err)>>2)]=$call661;
   var $702=$counter;
   var $inc662=((($702)+(1))|0);
   $counter=$inc662;
   var $703=$program;
   var $704=$703;
   var $705=HEAP32[(($err)>>2)];
   var $706=HEAP32[(($size)>>2)];
   var $707=HEAP32[(($kernel2)>>2)];
   var $708=$707;
   var $call663=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc662,HEAP32[(((tempVarArgs)+(8))>>2)]=$704,HEAP32[(((tempVarArgs)+(16))>>2)]=$705,HEAP32[(((tempVarArgs)+(24))>>2)]=$706,HEAP32[(((tempVarArgs)+(32))>>2)]=$708,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call664=_printf(((840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call665=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call666=_clReleaseKernel(0);
   HEAP32[(($err)>>2)]=$call666;
   var $709=$counter;
   var $inc667=((($709)+(1))|0);
   $counter=$inc667;
   var $710=HEAP32[(($err)>>2)];
   var $call668=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc667,HEAP32[(((tempVarArgs)+(8))>>2)]=$710,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $711=HEAP32[(($kernel2)>>2)];
   var $call669=_clReleaseKernel($711);
   HEAP32[(($err)>>2)]=$call669;
   var $712=$counter;
   var $inc670=((($712)+(1))|0);
   $counter=$inc670;
   var $713=HEAP32[(($err)>>2)];
   var $714=HEAP32[(($kernel2)>>2)];
   var $715=$714;
   var $call671=_printf(((2432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc670,HEAP32[(((tempVarArgs)+(8))>>2)]=$713,HEAP32[(((tempVarArgs)+(16))>>2)]=$715,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call672=_printf(((816)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call673=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($count)>>2)]=1024;
   var $716=HEAP32[(($count)>>2)];
   var $717=_llvm_stacksave();
   $saved_stack674=$717;
   var $vla675=STACKTOP;STACKTOP = (STACKTOP + ((($716)*(4))&-1))|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3);(assert((STACKTOP|0) < (STACK_MAX|0))|0);
   $i=0;
   label = 95; break;
  case 95: 
   var $718=$i;
   var $719=HEAP32[(($count)>>2)];
   var $cmp677=(($718)>>>(0)) < (($719)>>>(0));
   if ($cmp677) { label = 96; break; } else { label = 98; break; }
  case 96: 
   var $call680=_rand();
   var $conv681=(($call680)|(0));
   var $div682=($conv681)/(2147483648);
   var $720=$i;
   var $arrayidx683=(($vla675+($720<<2))|0);
   HEAPF32[(($arrayidx683)>>2)]=$div682;
   label = 97; break;
  case 97: 
   var $721=$i;
   var $inc685=((($721)+(1))|0);
   $i=$inc685;
   label = 95; break;
  case 98: 
   var $722=$context;
   var $723=HEAP32[(($count)>>2)];
   var $mul687=($723<<2);
   var $$etemp$151$0=4;
   var $$etemp$151$1=0;
   var $call688=_clCreateBuffer($722, $$etemp$151$0, $$etemp$151$1, $mul687, 0, 0);
   HEAP32[(($input)>>2)]=$call688;
   var $724=$context;
   var $725=HEAP32[(($count)>>2)];
   var $mul689=($725<<2);
   var $$etemp$152$0=2;
   var $$etemp$152$1=0;
   var $call690=_clCreateBuffer($724, $$etemp$152$0, $$etemp$152$1, $mul689, 0, 0);
   HEAP32[(($output)>>2)]=$call690;
   HEAP32[(($err)>>2)]=0;
   var $726=$kernel;
   var $727=$input;
   var $call691=_clSetKernelArg($726, 0, 4, $727);
   HEAP32[(($err)>>2)]=$call691;
   var $728=$counter;
   var $inc692=((($728)+(1))|0);
   $counter=$inc692;
   var $729=$kernel;
   var $730=$729;
   var $731=HEAP32[(($input)>>2)];
   var $732=$731;
   var $call693=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc692,HEAP32[(((tempVarArgs)+(8))>>2)]=$730,HEAP32[(((tempVarArgs)+(16))>>2)]=0,HEAP32[(((tempVarArgs)+(24))>>2)]=4,HEAP32[(((tempVarArgs)+(32))>>2)]=$732,tempVarArgs)); STACKTOP=tempVarArgs;
   var $733=$kernel;
   var $734=$output;
   var $call694=_clSetKernelArg($733, 1, 4, $734);
   var $735=HEAP32[(($err)>>2)];
   var $or695=$735 | $call694;
   HEAP32[(($err)>>2)]=$or695;
   var $736=$counter;
   var $inc696=((($736)+(1))|0);
   $counter=$inc696;
   var $737=$kernel;
   var $738=$737;
   var $739=HEAP32[(($output)>>2)];
   var $740=$739;
   var $call697=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc696,HEAP32[(((tempVarArgs)+(8))>>2)]=$738,HEAP32[(((tempVarArgs)+(16))>>2)]=1,HEAP32[(((tempVarArgs)+(24))>>2)]=4,HEAP32[(((tempVarArgs)+(32))>>2)]=$740,tempVarArgs)); STACKTOP=tempVarArgs;
   var $741=$kernel;
   var $call698=_clSetKernelArg($741, 2, 1024, 0);
   var $742=HEAP32[(($err)>>2)];
   var $or699=$742 | $call698;
   HEAP32[(($err)>>2)]=$or699;
   var $743=$counter;
   var $inc700=((($743)+(1))|0);
   $counter=$inc700;
   var $744=$kernel;
   var $745=$744;
   var $call701=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc700,HEAP32[(((tempVarArgs)+(8))>>2)]=$745,HEAP32[(((tempVarArgs)+(16))>>2)]=2,HEAP32[(((tempVarArgs)+(24))>>2)]=1024,HEAP32[(((tempVarArgs)+(32))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $746=$kernel;
   var $call702=_clSetKernelArg($746, 3, 1024, 0);
   var $747=HEAP32[(($err)>>2)];
   var $or703=$747 | $call702;
   HEAP32[(($err)>>2)]=$or703;
   var $748=$counter;
   var $inc704=((($748)+(1))|0);
   $counter=$inc704;
   var $749=$kernel;
   var $750=$749;
   var $751=HEAP32[(($count)>>2)];
   var $call705=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc704,HEAP32[(((tempVarArgs)+(8))>>2)]=$750,HEAP32[(((tempVarArgs)+(16))>>2)]=3,HEAP32[(((tempVarArgs)+(24))>>2)]=4,HEAP32[(((tempVarArgs)+(32))>>2)]=$751,tempVarArgs)); STACKTOP=tempVarArgs;
   var $752=$kernel;
   var $753=$count;
   var $call706=_clSetKernelArg($752, 2, 4, $753);
   var $754=HEAP32[(($err)>>2)];
   var $or707=$754 | $call706;
   HEAP32[(($err)>>2)]=$or707;
   var $755=$counter;
   var $inc708=((($755)+(1))|0);
   $counter=$inc708;
   var $756=$kernel;
   var $757=$756;
   var $758=HEAP32[(($count)>>2)];
   var $call709=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc708,HEAP32[(((tempVarArgs)+(8))>>2)]=$757,HEAP32[(((tempVarArgs)+(16))>>2)]=2,HEAP32[(((tempVarArgs)+(24))>>2)]=4,HEAP32[(((tempVarArgs)+(32))>>2)]=$758,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call710=_printf(((776)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call711=_printf(((896)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   var $759=$array_kernel_work_info;
   assert(24 % 1 === 0);HEAP32[(($759)>>2)]=HEAP32[((216)>>2)];HEAP32[((($759)+(4))>>2)]=HEAP32[((220)>>2)];HEAP32[((($759)+(8))>>2)]=HEAP32[((224)>>2)];HEAP32[((($759)+(12))>>2)]=HEAP32[((228)>>2)];HEAP32[((($759)+(16))>>2)]=HEAP32[((232)>>2)];HEAP32[((($759)+(20))>>2)]=HEAP32[((236)>>2)];
   $i712=0;
   label = 99; break;
  case 99: 
   var $760=$i712;
   var $cmp714=(($760)|(0)) < 6;
   if ($cmp714) { label = 100; break; } else { label = 102; break; }
  case 100: 
   var $761=$kernel;
   var $762=HEAP32[(($first_device_id)>>2)];
   var $763=$i712;
   var $arrayidx717=(($array_kernel_work_info+($763<<2))|0);
   var $764=HEAP32[(($arrayidx717)>>2)];
   var $765=$value;
   var $call718=_clGetKernelWorkGroupInfo($761, $762, $764, 4, $765, $size);
   HEAP32[(($err)>>2)]=$call718;
   var $766=$counter;
   var $inc719=((($766)+(1))|0);
   $counter=$inc719;
   var $767=$i712;
   var $arrayidx720=(($array_kernel_work_info+($767<<2))|0);
   var $768=HEAP32[(($arrayidx720)>>2)];
   var $769=HEAP32[(($err)>>2)];
   var $770=HEAP32[(($size)>>2)];
   var $771=HEAP32[(($value)>>2)];
   var $call721=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc719,HEAP32[(((tempVarArgs)+(8))>>2)]=$768,HEAP32[(((tempVarArgs)+(16))>>2)]=$769,HEAP32[(((tempVarArgs)+(24))>>2)]=$770,HEAP32[(((tempVarArgs)+(32))>>2)]=$771,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 101; break;
  case 101: 
   var $772=$i712;
   var $inc723=((($772)+(1))|0);
   $i712=$inc723;
   label = 99; break;
  case 102: 
   var $call725=_printf(((744)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call726=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   var $773=$array_kernel_info;
   assert(24 % 1 === 0);HEAP32[(($773)>>2)]=HEAP32[((240)>>2)];HEAP32[((($773)+(4))>>2)]=HEAP32[((244)>>2)];HEAP32[((($773)+(8))>>2)]=HEAP32[((248)>>2)];HEAP32[((($773)+(12))>>2)]=HEAP32[((252)>>2)];HEAP32[((($773)+(16))>>2)]=HEAP32[((256)>>2)];HEAP32[((($773)+(20))>>2)]=HEAP32[((260)>>2)];
   $i727=0;
   label = 103; break;
  case 103: 
   var $774=$i727;
   var $cmp729=(($774)|(0)) < 6;
   if ($cmp729) { label = 104; break; } else { label = 106; break; }
  case 104: 
   var $775=$kernel;
   var $776=$i727;
   var $arrayidx732=(($array_kernel_info+($776<<2))|0);
   var $777=HEAP32[(($arrayidx732)>>2)];
   var $778=$value;
   var $call733=_clGetKernelInfo($775, $777, 4, $778, $size);
   HEAP32[(($err)>>2)]=$call733;
   var $779=$counter;
   var $inc734=((($779)+(1))|0);
   $counter=$inc734;
   var $780=$i727;
   var $arrayidx735=(($array_kernel_info+($780<<2))|0);
   var $781=HEAP32[(($arrayidx735)>>2)];
   var $782=HEAP32[(($err)>>2)];
   var $783=HEAP32[(($size)>>2)];
   var $784=HEAP32[(($value)>>2)];
   var $call736=_printf(((2576)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$inc734,HEAP32[(((tempVarArgs)+(8))>>2)]=$781,HEAP32[(((tempVarArgs)+(16))>>2)]=$782,HEAP32[(((tempVarArgs)+(24))>>2)]=$783,HEAP32[(((tempVarArgs)+(32))>>2)]=$784,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 105; break;
  case 105: 
   var $785=$i727;
   var $inc738=((($785)+(1))|0);
   $i727=$inc738;
   label = 103; break;
  case 106: 
   var $call740=_printf(((704)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call741=_printf(((2840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call742=_printf(((696)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call743=_end(0);
   $retval=$call743;
   $cleanup_dest_slot=1;
   var $786=$saved_stack674;
   _llvm_stackrestore($786);
   var $787=$retval;
   STACKTOP = sp;
   return $787;
  default: assert(0, "bad label: " + label);
 }
}
Module["_main"] = _main;
function _malloc($bytes) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $cmp=(($bytes)>>>(0)) < 245;
   if ($cmp) { label = 2; break; } else { label = 78; break; }
  case 2: 
   var $cmp1=(($bytes)>>>(0)) < 11;
   if ($cmp1) { var $cond = 16;label = 4; break; } else { label = 3; break; }
  case 3: 
   var $add2=((($bytes)+(11))|0);
   var $and=$add2 & -8;
   var $cond = $and;label = 4; break;
  case 4: 
   var $cond;
   var $shr=$cond >>> 3;
   var $0=HEAP32[((((3640)|0))>>2)];
   var $shr3=$0 >>> (($shr)>>>(0));
   var $and4=$shr3 & 3;
   var $cmp5=(($and4)|(0))==0;
   if ($cmp5) { label = 12; break; } else { label = 5; break; }
  case 5: 
   var $neg=$shr3 & 1;
   var $and7=$neg ^ 1;
   var $add8=((($and7)+($shr))|0);
   var $shl=$add8 << 1;
   var $arrayidx=((3680+($shl<<2))|0);
   var $1=$arrayidx;
   var $arrayidx_sum=((($shl)+(2))|0);
   var $2=((3680+($arrayidx_sum<<2))|0);
   var $3=HEAP32[(($2)>>2)];
   var $fd9=(($3+8)|0);
   var $4=HEAP32[(($fd9)>>2)];
   var $cmp10=(($1)|(0))==(($4)|(0));
   if ($cmp10) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $shl12=1 << $add8;
   var $neg13=$shl12 ^ -1;
   var $and14=$0 & $neg13;
   HEAP32[((((3640)|0))>>2)]=$and14;
   label = 11; break;
  case 7: 
   var $5=$4;
   var $6=HEAP32[((((3656)|0))>>2)];
   var $cmp15=(($5)>>>(0)) < (($6)>>>(0));
   if ($cmp15) { label = 10; break; } else { label = 8; break; }
  case 8: 
   var $bk=(($4+12)|0);
   var $7=HEAP32[(($bk)>>2)];
   var $cmp16=(($7)|(0))==(($3)|(0));
   if ($cmp16) { label = 9; break; } else { label = 10; break; }
  case 9: 
   HEAP32[(($bk)>>2)]=$1;
   HEAP32[(($2)>>2)]=$4;
   label = 11; break;
  case 10: 
   _abort();
   throw "Reached an unreachable!";
  case 11: 
   var $shl22=$add8 << 3;
   var $or23=$shl22 | 3;
   var $head=(($3+4)|0);
   HEAP32[(($head)>>2)]=$or23;
   var $8=$3;
   var $add_ptr_sum106=$shl22 | 4;
   var $head25=(($8+$add_ptr_sum106)|0);
   var $9=$head25;
   var $10=HEAP32[(($9)>>2)];
   var $or26=$10 | 1;
   HEAP32[(($9)>>2)]=$or26;
   var $11=$fd9;
   var $mem_0 = $11;label = 341; break;
  case 12: 
   var $12=HEAP32[((((3648)|0))>>2)];
   var $cmp29=(($cond)>>>(0)) > (($12)>>>(0));
   if ($cmp29) { label = 13; break; } else { var $nb_0 = $cond;label = 160; break; }
  case 13: 
   var $cmp31=(($shr3)|(0))==0;
   if ($cmp31) { label = 27; break; } else { label = 14; break; }
  case 14: 
   var $shl35=$shr3 << $shr;
   var $shl37=2 << $shr;
   var $sub=(((-$shl37))|0);
   var $or40=$shl37 | $sub;
   var $and41=$shl35 & $or40;
   var $sub42=(((-$and41))|0);
   var $and43=$and41 & $sub42;
   var $sub44=((($and43)-(1))|0);
   var $shr45=$sub44 >>> 12;
   var $and46=$shr45 & 16;
   var $shr47=$sub44 >>> (($and46)>>>(0));
   var $shr48=$shr47 >>> 5;
   var $and49=$shr48 & 8;
   var $add50=$and49 | $and46;
   var $shr51=$shr47 >>> (($and49)>>>(0));
   var $shr52=$shr51 >>> 2;
   var $and53=$shr52 & 4;
   var $add54=$add50 | $and53;
   var $shr55=$shr51 >>> (($and53)>>>(0));
   var $shr56=$shr55 >>> 1;
   var $and57=$shr56 & 2;
   var $add58=$add54 | $and57;
   var $shr59=$shr55 >>> (($and57)>>>(0));
   var $shr60=$shr59 >>> 1;
   var $and61=$shr60 & 1;
   var $add62=$add58 | $and61;
   var $shr63=$shr59 >>> (($and61)>>>(0));
   var $add64=((($add62)+($shr63))|0);
   var $shl65=$add64 << 1;
   var $arrayidx66=((3680+($shl65<<2))|0);
   var $13=$arrayidx66;
   var $arrayidx66_sum=((($shl65)+(2))|0);
   var $14=((3680+($arrayidx66_sum<<2))|0);
   var $15=HEAP32[(($14)>>2)];
   var $fd69=(($15+8)|0);
   var $16=HEAP32[(($fd69)>>2)];
   var $cmp70=(($13)|(0))==(($16)|(0));
   if ($cmp70) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $shl72=1 << $add64;
   var $neg73=$shl72 ^ -1;
   var $and74=$0 & $neg73;
   HEAP32[((((3640)|0))>>2)]=$and74;
   label = 20; break;
  case 16: 
   var $17=$16;
   var $18=HEAP32[((((3656)|0))>>2)];
   var $cmp76=(($17)>>>(0)) < (($18)>>>(0));
   if ($cmp76) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $bk78=(($16+12)|0);
   var $19=HEAP32[(($bk78)>>2)];
   var $cmp79=(($19)|(0))==(($15)|(0));
   if ($cmp79) { label = 18; break; } else { label = 19; break; }
  case 18: 
   HEAP32[(($bk78)>>2)]=$13;
   HEAP32[(($14)>>2)]=$16;
   label = 20; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   var $shl90=$add64 << 3;
   var $sub91=((($shl90)-($cond))|0);
   var $or93=$cond | 3;
   var $head94=(($15+4)|0);
   HEAP32[(($head94)>>2)]=$or93;
   var $20=$15;
   var $add_ptr95=(($20+$cond)|0);
   var $21=$add_ptr95;
   var $or96=$sub91 | 1;
   var $add_ptr95_sum103=$cond | 4;
   var $head97=(($20+$add_ptr95_sum103)|0);
   var $22=$head97;
   HEAP32[(($22)>>2)]=$or96;
   var $add_ptr98=(($20+$shl90)|0);
   var $prev_foot=$add_ptr98;
   HEAP32[(($prev_foot)>>2)]=$sub91;
   var $23=HEAP32[((((3648)|0))>>2)];
   var $cmp99=(($23)|(0))==0;
   if ($cmp99) { label = 26; break; } else { label = 21; break; }
  case 21: 
   var $24=HEAP32[((((3660)|0))>>2)];
   var $shr101=$23 >>> 3;
   var $shl102=$shr101 << 1;
   var $arrayidx103=((3680+($shl102<<2))|0);
   var $25=$arrayidx103;
   var $26=HEAP32[((((3640)|0))>>2)];
   var $shl105=1 << $shr101;
   var $and106=$26 & $shl105;
   var $tobool107=(($and106)|(0))==0;
   if ($tobool107) { label = 22; break; } else { label = 23; break; }
  case 22: 
   var $or110=$26 | $shl105;
   HEAP32[((((3640)|0))>>2)]=$or110;
   var $arrayidx103_sum_pre=((($shl102)+(2))|0);
   var $_pre=((3680+($arrayidx103_sum_pre<<2))|0);
   var $F104_0 = $25;var $_pre_phi = $_pre;label = 25; break;
  case 23: 
   var $arrayidx103_sum104=((($shl102)+(2))|0);
   var $27=((3680+($arrayidx103_sum104<<2))|0);
   var $28=HEAP32[(($27)>>2)];
   var $29=$28;
   var $30=HEAP32[((((3656)|0))>>2)];
   var $cmp113=(($29)>>>(0)) < (($30)>>>(0));
   if ($cmp113) { label = 24; break; } else { var $F104_0 = $28;var $_pre_phi = $27;label = 25; break; }
  case 24: 
   _abort();
   throw "Reached an unreachable!";
  case 25: 
   var $_pre_phi;
   var $F104_0;
   HEAP32[(($_pre_phi)>>2)]=$24;
   var $bk122=(($F104_0+12)|0);
   HEAP32[(($bk122)>>2)]=$24;
   var $fd123=(($24+8)|0);
   HEAP32[(($fd123)>>2)]=$F104_0;
   var $bk124=(($24+12)|0);
   HEAP32[(($bk124)>>2)]=$25;
   label = 26; break;
  case 26: 
   HEAP32[((((3648)|0))>>2)]=$sub91;
   HEAP32[((((3660)|0))>>2)]=$21;
   var $31=$fd69;
   var $mem_0 = $31;label = 341; break;
  case 27: 
   var $32=HEAP32[((((3644)|0))>>2)];
   var $cmp128=(($32)|(0))==0;
   if ($cmp128) { var $nb_0 = $cond;label = 160; break; } else { label = 28; break; }
  case 28: 
   var $sub_i=(((-$32))|0);
   var $and_i=$32 & $sub_i;
   var $sub2_i=((($and_i)-(1))|0);
   var $shr_i=$sub2_i >>> 12;
   var $and3_i=$shr_i & 16;
   var $shr4_i=$sub2_i >>> (($and3_i)>>>(0));
   var $shr5_i=$shr4_i >>> 5;
   var $and6_i=$shr5_i & 8;
   var $add_i=$and6_i | $and3_i;
   var $shr7_i=$shr4_i >>> (($and6_i)>>>(0));
   var $shr8_i=$shr7_i >>> 2;
   var $and9_i=$shr8_i & 4;
   var $add10_i=$add_i | $and9_i;
   var $shr11_i=$shr7_i >>> (($and9_i)>>>(0));
   var $shr12_i=$shr11_i >>> 1;
   var $and13_i=$shr12_i & 2;
   var $add14_i=$add10_i | $and13_i;
   var $shr15_i=$shr11_i >>> (($and13_i)>>>(0));
   var $shr16_i=$shr15_i >>> 1;
   var $and17_i=$shr16_i & 1;
   var $add18_i=$add14_i | $and17_i;
   var $shr19_i=$shr15_i >>> (($and17_i)>>>(0));
   var $add20_i=((($add18_i)+($shr19_i))|0);
   var $arrayidx_i=((3944+($add20_i<<2))|0);
   var $33=HEAP32[(($arrayidx_i)>>2)];
   var $head_i=(($33+4)|0);
   var $34=HEAP32[(($head_i)>>2)];
   var $and21_i=$34 & -8;
   var $sub22_i=((($and21_i)-($cond))|0);
   var $t_0_i = $33;var $v_0_i = $33;var $rsize_0_i = $sub22_i;label = 29; break;
  case 29: 
   var $rsize_0_i;
   var $v_0_i;
   var $t_0_i;
   var $arrayidx23_i=(($t_0_i+16)|0);
   var $35=HEAP32[(($arrayidx23_i)>>2)];
   var $cmp_i=(($35)|(0))==0;
   if ($cmp_i) { label = 30; break; } else { var $cond7_i = $35;label = 31; break; }
  case 30: 
   var $arrayidx27_i=(($t_0_i+20)|0);
   var $36=HEAP32[(($arrayidx27_i)>>2)];
   var $cmp28_i=(($36)|(0))==0;
   if ($cmp28_i) { label = 32; break; } else { var $cond7_i = $36;label = 31; break; }
  case 31: 
   var $cond7_i;
   var $head29_i=(($cond7_i+4)|0);
   var $37=HEAP32[(($head29_i)>>2)];
   var $and30_i=$37 & -8;
   var $sub31_i=((($and30_i)-($cond))|0);
   var $cmp32_i=(($sub31_i)>>>(0)) < (($rsize_0_i)>>>(0));
   var $sub31_rsize_0_i=$cmp32_i ? $sub31_i : $rsize_0_i;
   var $cond_v_0_i=$cmp32_i ? $cond7_i : $v_0_i;
   var $t_0_i = $cond7_i;var $v_0_i = $cond_v_0_i;var $rsize_0_i = $sub31_rsize_0_i;label = 29; break;
  case 32: 
   var $38=$v_0_i;
   var $39=HEAP32[((((3656)|0))>>2)];
   var $cmp33_i=(($38)>>>(0)) < (($39)>>>(0));
   if ($cmp33_i) { label = 76; break; } else { label = 33; break; }
  case 33: 
   var $add_ptr_i=(($38+$cond)|0);
   var $40=$add_ptr_i;
   var $cmp35_i=(($38)>>>(0)) < (($add_ptr_i)>>>(0));
   if ($cmp35_i) { label = 34; break; } else { label = 76; break; }
  case 34: 
   var $parent_i=(($v_0_i+24)|0);
   var $41=HEAP32[(($parent_i)>>2)];
   var $bk_i=(($v_0_i+12)|0);
   var $42=HEAP32[(($bk_i)>>2)];
   var $cmp40_i=(($42)|(0))==(($v_0_i)|(0));
   if ($cmp40_i) { label = 40; break; } else { label = 35; break; }
  case 35: 
   var $fd_i=(($v_0_i+8)|0);
   var $43=HEAP32[(($fd_i)>>2)];
   var $44=$43;
   var $cmp45_i=(($44)>>>(0)) < (($39)>>>(0));
   if ($cmp45_i) { label = 39; break; } else { label = 36; break; }
  case 36: 
   var $bk47_i=(($43+12)|0);
   var $45=HEAP32[(($bk47_i)>>2)];
   var $cmp48_i=(($45)|(0))==(($v_0_i)|(0));
   if ($cmp48_i) { label = 37; break; } else { label = 39; break; }
  case 37: 
   var $fd50_i=(($42+8)|0);
   var $46=HEAP32[(($fd50_i)>>2)];
   var $cmp51_i=(($46)|(0))==(($v_0_i)|(0));
   if ($cmp51_i) { label = 38; break; } else { label = 39; break; }
  case 38: 
   HEAP32[(($bk47_i)>>2)]=$42;
   HEAP32[(($fd50_i)>>2)]=$43;
   var $R_1_i = $42;label = 47; break;
  case 39: 
   _abort();
   throw "Reached an unreachable!";
  case 40: 
   var $arrayidx61_i=(($v_0_i+20)|0);
   var $47=HEAP32[(($arrayidx61_i)>>2)];
   var $cmp62_i=(($47)|(0))==0;
   if ($cmp62_i) { label = 41; break; } else { var $R_0_i = $47;var $RP_0_i = $arrayidx61_i;label = 42; break; }
  case 41: 
   var $arrayidx65_i=(($v_0_i+16)|0);
   var $48=HEAP32[(($arrayidx65_i)>>2)];
   var $cmp66_i=(($48)|(0))==0;
   if ($cmp66_i) { var $R_1_i = 0;label = 47; break; } else { var $R_0_i = $48;var $RP_0_i = $arrayidx65_i;label = 42; break; }
  case 42: 
   var $RP_0_i;
   var $R_0_i;
   var $arrayidx71_i=(($R_0_i+20)|0);
   var $49=HEAP32[(($arrayidx71_i)>>2)];
   var $cmp72_i=(($49)|(0))==0;
   if ($cmp72_i) { label = 43; break; } else { var $R_0_i = $49;var $RP_0_i = $arrayidx71_i;label = 42; break; }
  case 43: 
   var $arrayidx75_i=(($R_0_i+16)|0);
   var $50=HEAP32[(($arrayidx75_i)>>2)];
   var $cmp76_i=(($50)|(0))==0;
   if ($cmp76_i) { label = 44; break; } else { var $R_0_i = $50;var $RP_0_i = $arrayidx75_i;label = 42; break; }
  case 44: 
   var $51=$RP_0_i;
   var $cmp81_i=(($51)>>>(0)) < (($39)>>>(0));
   if ($cmp81_i) { label = 46; break; } else { label = 45; break; }
  case 45: 
   HEAP32[(($RP_0_i)>>2)]=0;
   var $R_1_i = $R_0_i;label = 47; break;
  case 46: 
   _abort();
   throw "Reached an unreachable!";
  case 47: 
   var $R_1_i;
   var $cmp90_i=(($41)|(0))==0;
   if ($cmp90_i) { label = 67; break; } else { label = 48; break; }
  case 48: 
   var $index_i=(($v_0_i+28)|0);
   var $52=HEAP32[(($index_i)>>2)];
   var $arrayidx94_i=((3944+($52<<2))|0);
   var $53=HEAP32[(($arrayidx94_i)>>2)];
   var $cmp95_i=(($v_0_i)|(0))==(($53)|(0));
   if ($cmp95_i) { label = 49; break; } else { label = 51; break; }
  case 49: 
   HEAP32[(($arrayidx94_i)>>2)]=$R_1_i;
   var $cond5_i=(($R_1_i)|(0))==0;
   if ($cond5_i) { label = 50; break; } else { label = 57; break; }
  case 50: 
   var $54=HEAP32[(($index_i)>>2)];
   var $shl_i=1 << $54;
   var $neg_i=$shl_i ^ -1;
   var $55=HEAP32[((((3644)|0))>>2)];
   var $and103_i=$55 & $neg_i;
   HEAP32[((((3644)|0))>>2)]=$and103_i;
   label = 67; break;
  case 51: 
   var $56=$41;
   var $57=HEAP32[((((3656)|0))>>2)];
   var $cmp107_i=(($56)>>>(0)) < (($57)>>>(0));
   if ($cmp107_i) { label = 55; break; } else { label = 52; break; }
  case 52: 
   var $arrayidx113_i=(($41+16)|0);
   var $58=HEAP32[(($arrayidx113_i)>>2)];
   var $cmp114_i=(($58)|(0))==(($v_0_i)|(0));
   if ($cmp114_i) { label = 53; break; } else { label = 54; break; }
  case 53: 
   HEAP32[(($arrayidx113_i)>>2)]=$R_1_i;
   label = 56; break;
  case 54: 
   var $arrayidx121_i=(($41+20)|0);
   HEAP32[(($arrayidx121_i)>>2)]=$R_1_i;
   label = 56; break;
  case 55: 
   _abort();
   throw "Reached an unreachable!";
  case 56: 
   var $cmp126_i=(($R_1_i)|(0))==0;
   if ($cmp126_i) { label = 67; break; } else { label = 57; break; }
  case 57: 
   var $59=$R_1_i;
   var $60=HEAP32[((((3656)|0))>>2)];
   var $cmp130_i=(($59)>>>(0)) < (($60)>>>(0));
   if ($cmp130_i) { label = 66; break; } else { label = 58; break; }
  case 58: 
   var $parent135_i=(($R_1_i+24)|0);
   HEAP32[(($parent135_i)>>2)]=$41;
   var $arrayidx137_i=(($v_0_i+16)|0);
   var $61=HEAP32[(($arrayidx137_i)>>2)];
   var $cmp138_i=(($61)|(0))==0;
   if ($cmp138_i) { label = 62; break; } else { label = 59; break; }
  case 59: 
   var $62=$61;
   var $63=HEAP32[((((3656)|0))>>2)];
   var $cmp142_i=(($62)>>>(0)) < (($63)>>>(0));
   if ($cmp142_i) { label = 61; break; } else { label = 60; break; }
  case 60: 
   var $arrayidx148_i=(($R_1_i+16)|0);
   HEAP32[(($arrayidx148_i)>>2)]=$61;
   var $parent149_i=(($61+24)|0);
   HEAP32[(($parent149_i)>>2)]=$R_1_i;
   label = 62; break;
  case 61: 
   _abort();
   throw "Reached an unreachable!";
  case 62: 
   var $arrayidx154_i=(($v_0_i+20)|0);
   var $64=HEAP32[(($arrayidx154_i)>>2)];
   var $cmp155_i=(($64)|(0))==0;
   if ($cmp155_i) { label = 67; break; } else { label = 63; break; }
  case 63: 
   var $65=$64;
   var $66=HEAP32[((((3656)|0))>>2)];
   var $cmp159_i=(($65)>>>(0)) < (($66)>>>(0));
   if ($cmp159_i) { label = 65; break; } else { label = 64; break; }
  case 64: 
   var $arrayidx165_i=(($R_1_i+20)|0);
   HEAP32[(($arrayidx165_i)>>2)]=$64;
   var $parent166_i=(($64+24)|0);
   HEAP32[(($parent166_i)>>2)]=$R_1_i;
   label = 67; break;
  case 65: 
   _abort();
   throw "Reached an unreachable!";
  case 66: 
   _abort();
   throw "Reached an unreachable!";
  case 67: 
   var $cmp174_i=(($rsize_0_i)>>>(0)) < 16;
   if ($cmp174_i) { label = 68; break; } else { label = 69; break; }
  case 68: 
   var $add177_i=((($rsize_0_i)+($cond))|0);
   var $or178_i=$add177_i | 3;
   var $head179_i=(($v_0_i+4)|0);
   HEAP32[(($head179_i)>>2)]=$or178_i;
   var $add_ptr181_sum_i=((($add177_i)+(4))|0);
   var $head182_i=(($38+$add_ptr181_sum_i)|0);
   var $67=$head182_i;
   var $68=HEAP32[(($67)>>2)];
   var $or183_i=$68 | 1;
   HEAP32[(($67)>>2)]=$or183_i;
   label = 77; break;
  case 69: 
   var $or186_i=$cond | 3;
   var $head187_i=(($v_0_i+4)|0);
   HEAP32[(($head187_i)>>2)]=$or186_i;
   var $or188_i=$rsize_0_i | 1;
   var $add_ptr_sum_i175=$cond | 4;
   var $head189_i=(($38+$add_ptr_sum_i175)|0);
   var $69=$head189_i;
   HEAP32[(($69)>>2)]=$or188_i;
   var $add_ptr_sum1_i=((($rsize_0_i)+($cond))|0);
   var $add_ptr190_i=(($38+$add_ptr_sum1_i)|0);
   var $prev_foot_i=$add_ptr190_i;
   HEAP32[(($prev_foot_i)>>2)]=$rsize_0_i;
   var $70=HEAP32[((((3648)|0))>>2)];
   var $cmp191_i=(($70)|(0))==0;
   if ($cmp191_i) { label = 75; break; } else { label = 70; break; }
  case 70: 
   var $71=HEAP32[((((3660)|0))>>2)];
   var $shr194_i=$70 >>> 3;
   var $shl195_i=$shr194_i << 1;
   var $arrayidx196_i=((3680+($shl195_i<<2))|0);
   var $72=$arrayidx196_i;
   var $73=HEAP32[((((3640)|0))>>2)];
   var $shl198_i=1 << $shr194_i;
   var $and199_i=$73 & $shl198_i;
   var $tobool200_i=(($and199_i)|(0))==0;
   if ($tobool200_i) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $or204_i=$73 | $shl198_i;
   HEAP32[((((3640)|0))>>2)]=$or204_i;
   var $arrayidx196_sum_pre_i=((($shl195_i)+(2))|0);
   var $_pre_i=((3680+($arrayidx196_sum_pre_i<<2))|0);
   var $F197_0_i = $72;var $_pre_phi_i = $_pre_i;label = 74; break;
  case 72: 
   var $arrayidx196_sum2_i=((($shl195_i)+(2))|0);
   var $74=((3680+($arrayidx196_sum2_i<<2))|0);
   var $75=HEAP32[(($74)>>2)];
   var $76=$75;
   var $77=HEAP32[((((3656)|0))>>2)];
   var $cmp208_i=(($76)>>>(0)) < (($77)>>>(0));
   if ($cmp208_i) { label = 73; break; } else { var $F197_0_i = $75;var $_pre_phi_i = $74;label = 74; break; }
  case 73: 
   _abort();
   throw "Reached an unreachable!";
  case 74: 
   var $_pre_phi_i;
   var $F197_0_i;
   HEAP32[(($_pre_phi_i)>>2)]=$71;
   var $bk218_i=(($F197_0_i+12)|0);
   HEAP32[(($bk218_i)>>2)]=$71;
   var $fd219_i=(($71+8)|0);
   HEAP32[(($fd219_i)>>2)]=$F197_0_i;
   var $bk220_i=(($71+12)|0);
   HEAP32[(($bk220_i)>>2)]=$72;
   label = 75; break;
  case 75: 
   HEAP32[((((3648)|0))>>2)]=$rsize_0_i;
   HEAP32[((((3660)|0))>>2)]=$40;
   label = 77; break;
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $add_ptr225_i=(($v_0_i+8)|0);
   var $78=$add_ptr225_i;
   var $cmp130=(($add_ptr225_i)|(0))==0;
   if ($cmp130) { var $nb_0 = $cond;label = 160; break; } else { var $mem_0 = $78;label = 341; break; }
  case 78: 
   var $cmp138=(($bytes)>>>(0)) > 4294967231;
   if ($cmp138) { var $nb_0 = -1;label = 160; break; } else { label = 79; break; }
  case 79: 
   var $add143=((($bytes)+(11))|0);
   var $and144=$add143 & -8;
   var $79=HEAP32[((((3644)|0))>>2)];
   var $cmp145=(($79)|(0))==0;
   if ($cmp145) { var $nb_0 = $and144;label = 160; break; } else { label = 80; break; }
  case 80: 
   var $sub_i107=(((-$and144))|0);
   var $shr_i108=$add143 >>> 8;
   var $cmp_i109=(($shr_i108)|(0))==0;
   if ($cmp_i109) { var $idx_0_i = 0;label = 83; break; } else { label = 81; break; }
  case 81: 
   var $cmp1_i=(($and144)>>>(0)) > 16777215;
   if ($cmp1_i) { var $idx_0_i = 31;label = 83; break; } else { label = 82; break; }
  case 82: 
   var $sub4_i=((($shr_i108)+(1048320))|0);
   var $shr5_i111=$sub4_i >>> 16;
   var $and_i112=$shr5_i111 & 8;
   var $shl_i113=$shr_i108 << $and_i112;
   var $sub6_i=((($shl_i113)+(520192))|0);
   var $shr7_i114=$sub6_i >>> 16;
   var $and8_i=$shr7_i114 & 4;
   var $add_i115=$and8_i | $and_i112;
   var $shl9_i=$shl_i113 << $and8_i;
   var $sub10_i=((($shl9_i)+(245760))|0);
   var $shr11_i116=$sub10_i >>> 16;
   var $and12_i=$shr11_i116 & 2;
   var $add13_i=$add_i115 | $and12_i;
   var $sub14_i=(((14)-($add13_i))|0);
   var $shl15_i=$shl9_i << $and12_i;
   var $shr16_i117=$shl15_i >>> 15;
   var $add17_i=((($sub14_i)+($shr16_i117))|0);
   var $shl18_i=$add17_i << 1;
   var $add19_i=((($add17_i)+(7))|0);
   var $shr20_i=$and144 >>> (($add19_i)>>>(0));
   var $and21_i118=$shr20_i & 1;
   var $add22_i=$and21_i118 | $shl18_i;
   var $idx_0_i = $add22_i;label = 83; break;
  case 83: 
   var $idx_0_i;
   var $arrayidx_i119=((3944+($idx_0_i<<2))|0);
   var $80=HEAP32[(($arrayidx_i119)>>2)];
   var $cmp24_i=(($80)|(0))==0;
   if ($cmp24_i) { var $v_2_i = 0;var $rsize_2_i = $sub_i107;var $t_1_i = 0;label = 90; break; } else { label = 84; break; }
  case 84: 
   var $cmp26_i=(($idx_0_i)|(0))==31;
   if ($cmp26_i) { var $cond_i = 0;label = 86; break; } else { label = 85; break; }
  case 85: 
   var $shr27_i=$idx_0_i >>> 1;
   var $sub30_i=(((25)-($shr27_i))|0);
   var $cond_i = $sub30_i;label = 86; break;
  case 86: 
   var $cond_i;
   var $shl31_i=$and144 << $cond_i;
   var $v_0_i123 = 0;var $rsize_0_i122 = $sub_i107;var $t_0_i121 = $80;var $sizebits_0_i = $shl31_i;var $rst_0_i = 0;label = 87; break;
  case 87: 
   var $rst_0_i;
   var $sizebits_0_i;
   var $t_0_i121;
   var $rsize_0_i122;
   var $v_0_i123;
   var $head_i124=(($t_0_i121+4)|0);
   var $81=HEAP32[(($head_i124)>>2)];
   var $and32_i=$81 & -8;
   var $sub33_i=((($and32_i)-($and144))|0);
   var $cmp34_i=(($sub33_i)>>>(0)) < (($rsize_0_i122)>>>(0));
   if ($cmp34_i) { label = 88; break; } else { var $v_1_i = $v_0_i123;var $rsize_1_i = $rsize_0_i122;label = 89; break; }
  case 88: 
   var $cmp36_i=(($and32_i)|(0))==(($and144)|(0));
   if ($cmp36_i) { var $v_2_i = $t_0_i121;var $rsize_2_i = $sub33_i;var $t_1_i = $t_0_i121;label = 90; break; } else { var $v_1_i = $t_0_i121;var $rsize_1_i = $sub33_i;label = 89; break; }
  case 89: 
   var $rsize_1_i;
   var $v_1_i;
   var $arrayidx40_i=(($t_0_i121+20)|0);
   var $82=HEAP32[(($arrayidx40_i)>>2)];
   var $shr41_i=$sizebits_0_i >>> 31;
   var $arrayidx44_i=(($t_0_i121+16+($shr41_i<<2))|0);
   var $83=HEAP32[(($arrayidx44_i)>>2)];
   var $cmp45_i125=(($82)|(0))==0;
   var $cmp46_i=(($82)|(0))==(($83)|(0));
   var $or_cond_i=$cmp45_i125 | $cmp46_i;
   var $rst_1_i=$or_cond_i ? $rst_0_i : $82;
   var $cmp49_i=(($83)|(0))==0;
   var $shl52_i=$sizebits_0_i << 1;
   if ($cmp49_i) { var $v_2_i = $v_1_i;var $rsize_2_i = $rsize_1_i;var $t_1_i = $rst_1_i;label = 90; break; } else { var $v_0_i123 = $v_1_i;var $rsize_0_i122 = $rsize_1_i;var $t_0_i121 = $83;var $sizebits_0_i = $shl52_i;var $rst_0_i = $rst_1_i;label = 87; break; }
  case 90: 
   var $t_1_i;
   var $rsize_2_i;
   var $v_2_i;
   var $cmp54_i=(($t_1_i)|(0))==0;
   var $cmp56_i=(($v_2_i)|(0))==0;
   var $or_cond18_i=$cmp54_i & $cmp56_i;
   if ($or_cond18_i) { label = 91; break; } else { var $t_2_ph_i = $t_1_i;label = 93; break; }
  case 91: 
   var $shl59_i=2 << $idx_0_i;
   var $sub62_i=(((-$shl59_i))|0);
   var $or_i=$shl59_i | $sub62_i;
   var $and63_i=$79 & $or_i;
   var $cmp64_i=(($and63_i)|(0))==0;
   if ($cmp64_i) { var $nb_0 = $and144;label = 160; break; } else { label = 92; break; }
  case 92: 
   var $sub66_i=(((-$and63_i))|0);
   var $and67_i=$and63_i & $sub66_i;
   var $sub69_i=((($and67_i)-(1))|0);
   var $shr71_i=$sub69_i >>> 12;
   var $and72_i=$shr71_i & 16;
   var $shr74_i=$sub69_i >>> (($and72_i)>>>(0));
   var $shr75_i=$shr74_i >>> 5;
   var $and76_i=$shr75_i & 8;
   var $add77_i=$and76_i | $and72_i;
   var $shr78_i=$shr74_i >>> (($and76_i)>>>(0));
   var $shr79_i=$shr78_i >>> 2;
   var $and80_i=$shr79_i & 4;
   var $add81_i=$add77_i | $and80_i;
   var $shr82_i=$shr78_i >>> (($and80_i)>>>(0));
   var $shr83_i=$shr82_i >>> 1;
   var $and84_i=$shr83_i & 2;
   var $add85_i=$add81_i | $and84_i;
   var $shr86_i=$shr82_i >>> (($and84_i)>>>(0));
   var $shr87_i=$shr86_i >>> 1;
   var $and88_i=$shr87_i & 1;
   var $add89_i=$add85_i | $and88_i;
   var $shr90_i=$shr86_i >>> (($and88_i)>>>(0));
   var $add91_i=((($add89_i)+($shr90_i))|0);
   var $arrayidx93_i=((3944+($add91_i<<2))|0);
   var $84=HEAP32[(($arrayidx93_i)>>2)];
   var $t_2_ph_i = $84;label = 93; break;
  case 93: 
   var $t_2_ph_i;
   var $cmp9623_i=(($t_2_ph_i)|(0))==0;
   if ($cmp9623_i) { var $rsize_3_lcssa_i = $rsize_2_i;var $v_3_lcssa_i = $v_2_i;label = 96; break; } else { var $t_224_i = $t_2_ph_i;var $rsize_325_i = $rsize_2_i;var $v_326_i = $v_2_i;label = 94; break; }
  case 94: 
   var $v_326_i;
   var $rsize_325_i;
   var $t_224_i;
   var $head98_i=(($t_224_i+4)|0);
   var $85=HEAP32[(($head98_i)>>2)];
   var $and99_i=$85 & -8;
   var $sub100_i=((($and99_i)-($and144))|0);
   var $cmp101_i=(($sub100_i)>>>(0)) < (($rsize_325_i)>>>(0));
   var $sub100_rsize_3_i=$cmp101_i ? $sub100_i : $rsize_325_i;
   var $t_2_v_3_i=$cmp101_i ? $t_224_i : $v_326_i;
   var $arrayidx105_i=(($t_224_i+16)|0);
   var $86=HEAP32[(($arrayidx105_i)>>2)];
   var $cmp106_i=(($86)|(0))==0;
   if ($cmp106_i) { label = 95; break; } else { var $t_224_i = $86;var $rsize_325_i = $sub100_rsize_3_i;var $v_326_i = $t_2_v_3_i;label = 94; break; }
  case 95: 
   var $arrayidx112_i=(($t_224_i+20)|0);
   var $87=HEAP32[(($arrayidx112_i)>>2)];
   var $cmp96_i=(($87)|(0))==0;
   if ($cmp96_i) { var $rsize_3_lcssa_i = $sub100_rsize_3_i;var $v_3_lcssa_i = $t_2_v_3_i;label = 96; break; } else { var $t_224_i = $87;var $rsize_325_i = $sub100_rsize_3_i;var $v_326_i = $t_2_v_3_i;label = 94; break; }
  case 96: 
   var $v_3_lcssa_i;
   var $rsize_3_lcssa_i;
   var $cmp115_i=(($v_3_lcssa_i)|(0))==0;
   if ($cmp115_i) { var $nb_0 = $and144;label = 160; break; } else { label = 97; break; }
  case 97: 
   var $88=HEAP32[((((3648)|0))>>2)];
   var $sub117_i=((($88)-($and144))|0);
   var $cmp118_i=(($rsize_3_lcssa_i)>>>(0)) < (($sub117_i)>>>(0));
   if ($cmp118_i) { label = 98; break; } else { var $nb_0 = $and144;label = 160; break; }
  case 98: 
   var $89=$v_3_lcssa_i;
   var $90=HEAP32[((((3656)|0))>>2)];
   var $cmp120_i=(($89)>>>(0)) < (($90)>>>(0));
   if ($cmp120_i) { label = 158; break; } else { label = 99; break; }
  case 99: 
   var $add_ptr_i128=(($89+$and144)|0);
   var $91=$add_ptr_i128;
   var $cmp122_i=(($89)>>>(0)) < (($add_ptr_i128)>>>(0));
   if ($cmp122_i) { label = 100; break; } else { label = 158; break; }
  case 100: 
   var $parent_i129=(($v_3_lcssa_i+24)|0);
   var $92=HEAP32[(($parent_i129)>>2)];
   var $bk_i130=(($v_3_lcssa_i+12)|0);
   var $93=HEAP32[(($bk_i130)>>2)];
   var $cmp127_i=(($93)|(0))==(($v_3_lcssa_i)|(0));
   if ($cmp127_i) { label = 106; break; } else { label = 101; break; }
  case 101: 
   var $fd_i131=(($v_3_lcssa_i+8)|0);
   var $94=HEAP32[(($fd_i131)>>2)];
   var $95=$94;
   var $cmp132_i=(($95)>>>(0)) < (($90)>>>(0));
   if ($cmp132_i) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $bk135_i=(($94+12)|0);
   var $96=HEAP32[(($bk135_i)>>2)];
   var $cmp136_i=(($96)|(0))==(($v_3_lcssa_i)|(0));
   if ($cmp136_i) { label = 103; break; } else { label = 105; break; }
  case 103: 
   var $fd138_i=(($93+8)|0);
   var $97=HEAP32[(($fd138_i)>>2)];
   var $cmp139_i=(($97)|(0))==(($v_3_lcssa_i)|(0));
   if ($cmp139_i) { label = 104; break; } else { label = 105; break; }
  case 104: 
   HEAP32[(($bk135_i)>>2)]=$93;
   HEAP32[(($fd138_i)>>2)]=$94;
   var $R_1_i139 = $93;label = 113; break;
  case 105: 
   _abort();
   throw "Reached an unreachable!";
  case 106: 
   var $arrayidx150_i=(($v_3_lcssa_i+20)|0);
   var $98=HEAP32[(($arrayidx150_i)>>2)];
   var $cmp151_i=(($98)|(0))==0;
   if ($cmp151_i) { label = 107; break; } else { var $R_0_i137 = $98;var $RP_0_i136 = $arrayidx150_i;label = 108; break; }
  case 107: 
   var $arrayidx154_i133=(($v_3_lcssa_i+16)|0);
   var $99=HEAP32[(($arrayidx154_i133)>>2)];
   var $cmp155_i134=(($99)|(0))==0;
   if ($cmp155_i134) { var $R_1_i139 = 0;label = 113; break; } else { var $R_0_i137 = $99;var $RP_0_i136 = $arrayidx154_i133;label = 108; break; }
  case 108: 
   var $RP_0_i136;
   var $R_0_i137;
   var $arrayidx160_i=(($R_0_i137+20)|0);
   var $100=HEAP32[(($arrayidx160_i)>>2)];
   var $cmp161_i=(($100)|(0))==0;
   if ($cmp161_i) { label = 109; break; } else { var $R_0_i137 = $100;var $RP_0_i136 = $arrayidx160_i;label = 108; break; }
  case 109: 
   var $arrayidx164_i=(($R_0_i137+16)|0);
   var $101=HEAP32[(($arrayidx164_i)>>2)];
   var $cmp165_i=(($101)|(0))==0;
   if ($cmp165_i) { label = 110; break; } else { var $R_0_i137 = $101;var $RP_0_i136 = $arrayidx164_i;label = 108; break; }
  case 110: 
   var $102=$RP_0_i136;
   var $cmp170_i=(($102)>>>(0)) < (($90)>>>(0));
   if ($cmp170_i) { label = 112; break; } else { label = 111; break; }
  case 111: 
   HEAP32[(($RP_0_i136)>>2)]=0;
   var $R_1_i139 = $R_0_i137;label = 113; break;
  case 112: 
   _abort();
   throw "Reached an unreachable!";
  case 113: 
   var $R_1_i139;
   var $cmp179_i=(($92)|(0))==0;
   if ($cmp179_i) { label = 133; break; } else { label = 114; break; }
  case 114: 
   var $index_i140=(($v_3_lcssa_i+28)|0);
   var $103=HEAP32[(($index_i140)>>2)];
   var $arrayidx183_i=((3944+($103<<2))|0);
   var $104=HEAP32[(($arrayidx183_i)>>2)];
   var $cmp184_i=(($v_3_lcssa_i)|(0))==(($104)|(0));
   if ($cmp184_i) { label = 115; break; } else { label = 117; break; }
  case 115: 
   HEAP32[(($arrayidx183_i)>>2)]=$R_1_i139;
   var $cond20_i=(($R_1_i139)|(0))==0;
   if ($cond20_i) { label = 116; break; } else { label = 123; break; }
  case 116: 
   var $105=HEAP32[(($index_i140)>>2)];
   var $shl191_i=1 << $105;
   var $neg_i141=$shl191_i ^ -1;
   var $106=HEAP32[((((3644)|0))>>2)];
   var $and193_i=$106 & $neg_i141;
   HEAP32[((((3644)|0))>>2)]=$and193_i;
   label = 133; break;
  case 117: 
   var $107=$92;
   var $108=HEAP32[((((3656)|0))>>2)];
   var $cmp197_i=(($107)>>>(0)) < (($108)>>>(0));
   if ($cmp197_i) { label = 121; break; } else { label = 118; break; }
  case 118: 
   var $arrayidx203_i=(($92+16)|0);
   var $109=HEAP32[(($arrayidx203_i)>>2)];
   var $cmp204_i=(($109)|(0))==(($v_3_lcssa_i)|(0));
   if ($cmp204_i) { label = 119; break; } else { label = 120; break; }
  case 119: 
   HEAP32[(($arrayidx203_i)>>2)]=$R_1_i139;
   label = 122; break;
  case 120: 
   var $arrayidx211_i=(($92+20)|0);
   HEAP32[(($arrayidx211_i)>>2)]=$R_1_i139;
   label = 122; break;
  case 121: 
   _abort();
   throw "Reached an unreachable!";
  case 122: 
   var $cmp216_i=(($R_1_i139)|(0))==0;
   if ($cmp216_i) { label = 133; break; } else { label = 123; break; }
  case 123: 
   var $110=$R_1_i139;
   var $111=HEAP32[((((3656)|0))>>2)];
   var $cmp220_i=(($110)>>>(0)) < (($111)>>>(0));
   if ($cmp220_i) { label = 132; break; } else { label = 124; break; }
  case 124: 
   var $parent225_i=(($R_1_i139+24)|0);
   HEAP32[(($parent225_i)>>2)]=$92;
   var $arrayidx227_i=(($v_3_lcssa_i+16)|0);
   var $112=HEAP32[(($arrayidx227_i)>>2)];
   var $cmp228_i=(($112)|(0))==0;
   if ($cmp228_i) { label = 128; break; } else { label = 125; break; }
  case 125: 
   var $113=$112;
   var $114=HEAP32[((((3656)|0))>>2)];
   var $cmp232_i=(($113)>>>(0)) < (($114)>>>(0));
   if ($cmp232_i) { label = 127; break; } else { label = 126; break; }
  case 126: 
   var $arrayidx238_i=(($R_1_i139+16)|0);
   HEAP32[(($arrayidx238_i)>>2)]=$112;
   var $parent239_i=(($112+24)|0);
   HEAP32[(($parent239_i)>>2)]=$R_1_i139;
   label = 128; break;
  case 127: 
   _abort();
   throw "Reached an unreachable!";
  case 128: 
   var $arrayidx244_i=(($v_3_lcssa_i+20)|0);
   var $115=HEAP32[(($arrayidx244_i)>>2)];
   var $cmp245_i=(($115)|(0))==0;
   if ($cmp245_i) { label = 133; break; } else { label = 129; break; }
  case 129: 
   var $116=$115;
   var $117=HEAP32[((((3656)|0))>>2)];
   var $cmp249_i=(($116)>>>(0)) < (($117)>>>(0));
   if ($cmp249_i) { label = 131; break; } else { label = 130; break; }
  case 130: 
   var $arrayidx255_i=(($R_1_i139+20)|0);
   HEAP32[(($arrayidx255_i)>>2)]=$115;
   var $parent256_i=(($115+24)|0);
   HEAP32[(($parent256_i)>>2)]=$R_1_i139;
   label = 133; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   _abort();
   throw "Reached an unreachable!";
  case 133: 
   var $cmp264_i=(($rsize_3_lcssa_i)>>>(0)) < 16;
   if ($cmp264_i) { label = 134; break; } else { label = 135; break; }
  case 134: 
   var $add267_i=((($rsize_3_lcssa_i)+($and144))|0);
   var $or269_i=$add267_i | 3;
   var $head270_i=(($v_3_lcssa_i+4)|0);
   HEAP32[(($head270_i)>>2)]=$or269_i;
   var $add_ptr272_sum_i=((($add267_i)+(4))|0);
   var $head273_i=(($89+$add_ptr272_sum_i)|0);
   var $118=$head273_i;
   var $119=HEAP32[(($118)>>2)];
   var $or274_i=$119 | 1;
   HEAP32[(($118)>>2)]=$or274_i;
   label = 159; break;
  case 135: 
   var $or277_i=$and144 | 3;
   var $head278_i=(($v_3_lcssa_i+4)|0);
   HEAP32[(($head278_i)>>2)]=$or277_i;
   var $or279_i=$rsize_3_lcssa_i | 1;
   var $add_ptr_sum_i143174=$and144 | 4;
   var $head280_i=(($89+$add_ptr_sum_i143174)|0);
   var $120=$head280_i;
   HEAP32[(($120)>>2)]=$or279_i;
   var $add_ptr_sum1_i144=((($rsize_3_lcssa_i)+($and144))|0);
   var $add_ptr281_i=(($89+$add_ptr_sum1_i144)|0);
   var $prev_foot_i145=$add_ptr281_i;
   HEAP32[(($prev_foot_i145)>>2)]=$rsize_3_lcssa_i;
   var $shr282_i=$rsize_3_lcssa_i >>> 3;
   var $cmp283_i=(($rsize_3_lcssa_i)>>>(0)) < 256;
   if ($cmp283_i) { label = 136; break; } else { label = 141; break; }
  case 136: 
   var $shl287_i=$shr282_i << 1;
   var $arrayidx288_i=((3680+($shl287_i<<2))|0);
   var $121=$arrayidx288_i;
   var $122=HEAP32[((((3640)|0))>>2)];
   var $shl290_i=1 << $shr282_i;
   var $and291_i=$122 & $shl290_i;
   var $tobool292_i=(($and291_i)|(0))==0;
   if ($tobool292_i) { label = 137; break; } else { label = 138; break; }
  case 137: 
   var $or296_i=$122 | $shl290_i;
   HEAP32[((((3640)|0))>>2)]=$or296_i;
   var $arrayidx288_sum_pre_i=((($shl287_i)+(2))|0);
   var $_pre_i146=((3680+($arrayidx288_sum_pre_i<<2))|0);
   var $F289_0_i = $121;var $_pre_phi_i147 = $_pre_i146;label = 140; break;
  case 138: 
   var $arrayidx288_sum16_i=((($shl287_i)+(2))|0);
   var $123=((3680+($arrayidx288_sum16_i<<2))|0);
   var $124=HEAP32[(($123)>>2)];
   var $125=$124;
   var $126=HEAP32[((((3656)|0))>>2)];
   var $cmp300_i=(($125)>>>(0)) < (($126)>>>(0));
   if ($cmp300_i) { label = 139; break; } else { var $F289_0_i = $124;var $_pre_phi_i147 = $123;label = 140; break; }
  case 139: 
   _abort();
   throw "Reached an unreachable!";
  case 140: 
   var $_pre_phi_i147;
   var $F289_0_i;
   HEAP32[(($_pre_phi_i147)>>2)]=$91;
   var $bk310_i=(($F289_0_i+12)|0);
   HEAP32[(($bk310_i)>>2)]=$91;
   var $add_ptr_sum14_i=((($and144)+(8))|0);
   var $fd311_i=(($89+$add_ptr_sum14_i)|0);
   var $127=$fd311_i;
   HEAP32[(($127)>>2)]=$F289_0_i;
   var $add_ptr_sum15_i=((($and144)+(12))|0);
   var $bk312_i=(($89+$add_ptr_sum15_i)|0);
   var $128=$bk312_i;
   HEAP32[(($128)>>2)]=$121;
   label = 159; break;
  case 141: 
   var $129=$add_ptr_i128;
   var $shr317_i=$rsize_3_lcssa_i >>> 8;
   var $cmp318_i=(($shr317_i)|(0))==0;
   if ($cmp318_i) { var $I315_0_i = 0;label = 144; break; } else { label = 142; break; }
  case 142: 
   var $cmp322_i=(($rsize_3_lcssa_i)>>>(0)) > 16777215;
   if ($cmp322_i) { var $I315_0_i = 31;label = 144; break; } else { label = 143; break; }
  case 143: 
   var $sub328_i=((($shr317_i)+(1048320))|0);
   var $shr329_i=$sub328_i >>> 16;
   var $and330_i=$shr329_i & 8;
   var $shl332_i=$shr317_i << $and330_i;
   var $sub333_i=((($shl332_i)+(520192))|0);
   var $shr334_i=$sub333_i >>> 16;
   var $and335_i=$shr334_i & 4;
   var $add336_i=$and335_i | $and330_i;
   var $shl337_i=$shl332_i << $and335_i;
   var $sub338_i=((($shl337_i)+(245760))|0);
   var $shr339_i=$sub338_i >>> 16;
   var $and340_i=$shr339_i & 2;
   var $add341_i=$add336_i | $and340_i;
   var $sub342_i=(((14)-($add341_i))|0);
   var $shl343_i=$shl337_i << $and340_i;
   var $shr344_i=$shl343_i >>> 15;
   var $add345_i=((($sub342_i)+($shr344_i))|0);
   var $shl346_i=$add345_i << 1;
   var $add347_i=((($add345_i)+(7))|0);
   var $shr348_i=$rsize_3_lcssa_i >>> (($add347_i)>>>(0));
   var $and349_i=$shr348_i & 1;
   var $add350_i=$and349_i | $shl346_i;
   var $I315_0_i = $add350_i;label = 144; break;
  case 144: 
   var $I315_0_i;
   var $arrayidx354_i=((3944+($I315_0_i<<2))|0);
   var $add_ptr_sum2_i=((($and144)+(28))|0);
   var $index355_i=(($89+$add_ptr_sum2_i)|0);
   var $130=$index355_i;
   HEAP32[(($130)>>2)]=$I315_0_i;
   var $add_ptr_sum3_i=((($and144)+(16))|0);
   var $child356_i=(($89+$add_ptr_sum3_i)|0);
   var $child356_sum_i=((($and144)+(20))|0);
   var $arrayidx357_i=(($89+$child356_sum_i)|0);
   var $131=$arrayidx357_i;
   HEAP32[(($131)>>2)]=0;
   var $arrayidx359_i=$child356_i;
   HEAP32[(($arrayidx359_i)>>2)]=0;
   var $132=HEAP32[((((3644)|0))>>2)];
   var $shl361_i=1 << $I315_0_i;
   var $and362_i=$132 & $shl361_i;
   var $tobool363_i=(($and362_i)|(0))==0;
   if ($tobool363_i) { label = 145; break; } else { label = 146; break; }
  case 145: 
   var $or367_i=$132 | $shl361_i;
   HEAP32[((((3644)|0))>>2)]=$or367_i;
   HEAP32[(($arrayidx354_i)>>2)]=$129;
   var $133=$arrayidx354_i;
   var $add_ptr_sum4_i=((($and144)+(24))|0);
   var $parent368_i=(($89+$add_ptr_sum4_i)|0);
   var $134=$parent368_i;
   HEAP32[(($134)>>2)]=$133;
   var $add_ptr_sum5_i=((($and144)+(12))|0);
   var $bk369_i=(($89+$add_ptr_sum5_i)|0);
   var $135=$bk369_i;
   HEAP32[(($135)>>2)]=$129;
   var $add_ptr_sum6_i=((($and144)+(8))|0);
   var $fd370_i=(($89+$add_ptr_sum6_i)|0);
   var $136=$fd370_i;
   HEAP32[(($136)>>2)]=$129;
   label = 159; break;
  case 146: 
   var $137=HEAP32[(($arrayidx354_i)>>2)];
   var $cmp373_i=(($I315_0_i)|(0))==31;
   if ($cmp373_i) { var $cond382_i = 0;label = 148; break; } else { label = 147; break; }
  case 147: 
   var $shr377_i=$I315_0_i >>> 1;
   var $sub380_i=(((25)-($shr377_i))|0);
   var $cond382_i = $sub380_i;label = 148; break;
  case 148: 
   var $cond382_i;
   var $shl383_i=$rsize_3_lcssa_i << $cond382_i;
   var $K372_0_i = $shl383_i;var $T_0_i = $137;label = 149; break;
  case 149: 
   var $T_0_i;
   var $K372_0_i;
   var $head385_i=(($T_0_i+4)|0);
   var $138=HEAP32[(($head385_i)>>2)];
   var $and386_i=$138 & -8;
   var $cmp387_i=(($and386_i)|(0))==(($rsize_3_lcssa_i)|(0));
   if ($cmp387_i) { label = 154; break; } else { label = 150; break; }
  case 150: 
   var $shr390_i=$K372_0_i >>> 31;
   var $arrayidx393_i=(($T_0_i+16+($shr390_i<<2))|0);
   var $139=HEAP32[(($arrayidx393_i)>>2)];
   var $cmp395_i=(($139)|(0))==0;
   var $shl394_i=$K372_0_i << 1;
   if ($cmp395_i) { label = 151; break; } else { var $K372_0_i = $shl394_i;var $T_0_i = $139;label = 149; break; }
  case 151: 
   var $140=$arrayidx393_i;
   var $141=HEAP32[((((3656)|0))>>2)];
   var $cmp400_i=(($140)>>>(0)) < (($141)>>>(0));
   if ($cmp400_i) { label = 153; break; } else { label = 152; break; }
  case 152: 
   HEAP32[(($arrayidx393_i)>>2)]=$129;
   var $add_ptr_sum11_i=((($and144)+(24))|0);
   var $parent405_i=(($89+$add_ptr_sum11_i)|0);
   var $142=$parent405_i;
   HEAP32[(($142)>>2)]=$T_0_i;
   var $add_ptr_sum12_i=((($and144)+(12))|0);
   var $bk406_i=(($89+$add_ptr_sum12_i)|0);
   var $143=$bk406_i;
   HEAP32[(($143)>>2)]=$129;
   var $add_ptr_sum13_i=((($and144)+(8))|0);
   var $fd407_i=(($89+$add_ptr_sum13_i)|0);
   var $144=$fd407_i;
   HEAP32[(($144)>>2)]=$129;
   label = 159; break;
  case 153: 
   _abort();
   throw "Reached an unreachable!";
  case 154: 
   var $fd412_i=(($T_0_i+8)|0);
   var $145=HEAP32[(($fd412_i)>>2)];
   var $146=$T_0_i;
   var $147=HEAP32[((((3656)|0))>>2)];
   var $cmp414_i=(($146)>>>(0)) < (($147)>>>(0));
   if ($cmp414_i) { label = 157; break; } else { label = 155; break; }
  case 155: 
   var $148=$145;
   var $cmp418_i=(($148)>>>(0)) < (($147)>>>(0));
   if ($cmp418_i) { label = 157; break; } else { label = 156; break; }
  case 156: 
   var $bk425_i=(($145+12)|0);
   HEAP32[(($bk425_i)>>2)]=$129;
   HEAP32[(($fd412_i)>>2)]=$129;
   var $add_ptr_sum8_i=((($and144)+(8))|0);
   var $fd427_i=(($89+$add_ptr_sum8_i)|0);
   var $149=$fd427_i;
   HEAP32[(($149)>>2)]=$145;
   var $add_ptr_sum9_i=((($and144)+(12))|0);
   var $bk428_i=(($89+$add_ptr_sum9_i)|0);
   var $150=$bk428_i;
   HEAP32[(($150)>>2)]=$T_0_i;
   var $add_ptr_sum10_i=((($and144)+(24))|0);
   var $parent429_i=(($89+$add_ptr_sum10_i)|0);
   var $151=$parent429_i;
   HEAP32[(($151)>>2)]=0;
   label = 159; break;
  case 157: 
   _abort();
   throw "Reached an unreachable!";
  case 158: 
   _abort();
   throw "Reached an unreachable!";
  case 159: 
   var $add_ptr436_i=(($v_3_lcssa_i+8)|0);
   var $152=$add_ptr436_i;
   var $cmp149=(($add_ptr436_i)|(0))==0;
   if ($cmp149) { var $nb_0 = $and144;label = 160; break; } else { var $mem_0 = $152;label = 341; break; }
  case 160: 
   var $nb_0;
   var $153=HEAP32[((((3648)|0))>>2)];
   var $cmp155=(($nb_0)>>>(0)) > (($153)>>>(0));
   if ($cmp155) { label = 165; break; } else { label = 161; break; }
  case 161: 
   var $sub159=((($153)-($nb_0))|0);
   var $154=HEAP32[((((3660)|0))>>2)];
   var $cmp161=(($sub159)>>>(0)) > 15;
   if ($cmp161) { label = 162; break; } else { label = 163; break; }
  case 162: 
   var $155=$154;
   var $add_ptr165=(($155+$nb_0)|0);
   var $156=$add_ptr165;
   HEAP32[((((3660)|0))>>2)]=$156;
   HEAP32[((((3648)|0))>>2)]=$sub159;
   var $or166=$sub159 | 1;
   var $add_ptr165_sum=((($nb_0)+(4))|0);
   var $head167=(($155+$add_ptr165_sum)|0);
   var $157=$head167;
   HEAP32[(($157)>>2)]=$or166;
   var $add_ptr168=(($155+$153)|0);
   var $prev_foot169=$add_ptr168;
   HEAP32[(($prev_foot169)>>2)]=$sub159;
   var $or171=$nb_0 | 3;
   var $head172=(($154+4)|0);
   HEAP32[(($head172)>>2)]=$or171;
   label = 164; break;
  case 163: 
   HEAP32[((((3648)|0))>>2)]=0;
   HEAP32[((((3660)|0))>>2)]=0;
   var $or175=$153 | 3;
   var $head176=(($154+4)|0);
   HEAP32[(($head176)>>2)]=$or175;
   var $158=$154;
   var $add_ptr177_sum=((($153)+(4))|0);
   var $head178=(($158+$add_ptr177_sum)|0);
   var $159=$head178;
   var $160=HEAP32[(($159)>>2)];
   var $or179=$160 | 1;
   HEAP32[(($159)>>2)]=$or179;
   label = 164; break;
  case 164: 
   var $add_ptr181=(($154+8)|0);
   var $161=$add_ptr181;
   var $mem_0 = $161;label = 341; break;
  case 165: 
   var $162=HEAP32[((((3652)|0))>>2)];
   var $cmp183=(($nb_0)>>>(0)) < (($162)>>>(0));
   if ($cmp183) { label = 166; break; } else { label = 167; break; }
  case 166: 
   var $sub187=((($162)-($nb_0))|0);
   HEAP32[((((3652)|0))>>2)]=$sub187;
   var $163=HEAP32[((((3664)|0))>>2)];
   var $164=$163;
   var $add_ptr190=(($164+$nb_0)|0);
   var $165=$add_ptr190;
   HEAP32[((((3664)|0))>>2)]=$165;
   var $or191=$sub187 | 1;
   var $add_ptr190_sum=((($nb_0)+(4))|0);
   var $head192=(($164+$add_ptr190_sum)|0);
   var $166=$head192;
   HEAP32[(($166)>>2)]=$or191;
   var $or194=$nb_0 | 3;
   var $head195=(($163+4)|0);
   HEAP32[(($head195)>>2)]=$or194;
   var $add_ptr196=(($163+8)|0);
   var $167=$add_ptr196;
   var $mem_0 = $167;label = 341; break;
  case 167: 
   var $168=HEAP32[((((3608)|0))>>2)];
   var $cmp_i148=(($168)|(0))==0;
   if ($cmp_i148) { label = 168; break; } else { label = 171; break; }
  case 168: 
   var $call_i_i=_sysconf(8);
   var $sub_i_i=((($call_i_i)-(1))|0);
   var $and_i_i=$sub_i_i & $call_i_i;
   var $cmp1_i_i=(($and_i_i)|(0))==0;
   if ($cmp1_i_i) { label = 170; break; } else { label = 169; break; }
  case 169: 
   _abort();
   throw "Reached an unreachable!";
  case 170: 
   HEAP32[((((3616)|0))>>2)]=$call_i_i;
   HEAP32[((((3612)|0))>>2)]=$call_i_i;
   HEAP32[((((3620)|0))>>2)]=-1;
   HEAP32[((((3624)|0))>>2)]=-1;
   HEAP32[((((3628)|0))>>2)]=0;
   HEAP32[((((4084)|0))>>2)]=0;
   var $call6_i_i=_time(0);
   var $xor_i_i=$call6_i_i & -16;
   var $and7_i_i=$xor_i_i ^ 1431655768;
   HEAP32[((((3608)|0))>>2)]=$and7_i_i;
   label = 171; break;
  case 171: 
   var $add_i149=((($nb_0)+(48))|0);
   var $169=HEAP32[((((3616)|0))>>2)];
   var $sub_i150=((($nb_0)+(47))|0);
   var $add9_i=((($169)+($sub_i150))|0);
   var $neg_i151=(((-$169))|0);
   var $and11_i=$add9_i & $neg_i151;
   var $cmp12_i=(($and11_i)>>>(0)) > (($nb_0)>>>(0));
   if ($cmp12_i) { label = 172; break; } else { var $mem_0 = 0;label = 341; break; }
  case 172: 
   var $170=HEAP32[((((4080)|0))>>2)];
   var $cmp15_i=(($170)|(0))==0;
   if ($cmp15_i) { label = 174; break; } else { label = 173; break; }
  case 173: 
   var $171=HEAP32[((((4072)|0))>>2)];
   var $add17_i152=((($171)+($and11_i))|0);
   var $cmp19_i=(($add17_i152)>>>(0)) <= (($171)>>>(0));
   var $cmp21_i=(($add17_i152)>>>(0)) > (($170)>>>(0));
   var $or_cond1_i=$cmp19_i | $cmp21_i;
   if ($or_cond1_i) { var $mem_0 = 0;label = 341; break; } else { label = 174; break; }
  case 174: 
   var $172=HEAP32[((((4084)|0))>>2)];
   var $and26_i=$172 & 4;
   var $tobool27_i=(($and26_i)|(0))==0;
   if ($tobool27_i) { label = 175; break; } else { var $tsize_1_i = 0;label = 198; break; }
  case 175: 
   var $173=HEAP32[((((3664)|0))>>2)];
   var $cmp29_i=(($173)|(0))==0;
   if ($cmp29_i) { label = 181; break; } else { label = 176; break; }
  case 176: 
   var $174=$173;
   var $sp_0_i_i = ((4088)|0);label = 177; break;
  case 177: 
   var $sp_0_i_i;
   var $base_i_i=(($sp_0_i_i)|0);
   var $175=HEAP32[(($base_i_i)>>2)];
   var $cmp_i9_i=(($175)>>>(0)) > (($174)>>>(0));
   if ($cmp_i9_i) { label = 179; break; } else { label = 178; break; }
  case 178: 
   var $size_i_i=(($sp_0_i_i+4)|0);
   var $176=HEAP32[(($size_i_i)>>2)];
   var $add_ptr_i_i=(($175+$176)|0);
   var $cmp2_i_i=(($add_ptr_i_i)>>>(0)) > (($174)>>>(0));
   if ($cmp2_i_i) { label = 180; break; } else { label = 179; break; }
  case 179: 
   var $next_i_i=(($sp_0_i_i+8)|0);
   var $177=HEAP32[(($next_i_i)>>2)];
   var $cmp3_i_i=(($177)|(0))==0;
   if ($cmp3_i_i) { label = 181; break; } else { var $sp_0_i_i = $177;label = 177; break; }
  case 180: 
   var $cmp32_i154=(($sp_0_i_i)|(0))==0;
   if ($cmp32_i154) { label = 181; break; } else { label = 188; break; }
  case 181: 
   var $call34_i=_sbrk(0);
   var $cmp35_i156=(($call34_i)|(0))==-1;
   if ($cmp35_i156) { var $tsize_0758385_i = 0;label = 197; break; } else { label = 182; break; }
  case 182: 
   var $178=$call34_i;
   var $179=HEAP32[((((3612)|0))>>2)];
   var $sub38_i=((($179)-(1))|0);
   var $and39_i=$sub38_i & $178;
   var $cmp40_i157=(($and39_i)|(0))==0;
   if ($cmp40_i157) { var $ssize_0_i = $and11_i;label = 184; break; } else { label = 183; break; }
  case 183: 
   var $add43_i=((($sub38_i)+($178))|0);
   var $neg45_i=(((-$179))|0);
   var $and46_i=$add43_i & $neg45_i;
   var $sub47_i=((($and11_i)-($178))|0);
   var $add48_i=((($sub47_i)+($and46_i))|0);
   var $ssize_0_i = $add48_i;label = 184; break;
  case 184: 
   var $ssize_0_i;
   var $180=HEAP32[((((4072)|0))>>2)];
   var $add51_i=((($180)+($ssize_0_i))|0);
   var $cmp52_i=(($ssize_0_i)>>>(0)) > (($nb_0)>>>(0));
   var $cmp54_i158=(($ssize_0_i)>>>(0)) < 2147483647;
   var $or_cond_i159=$cmp52_i & $cmp54_i158;
   if ($or_cond_i159) { label = 185; break; } else { var $tsize_0758385_i = 0;label = 197; break; }
  case 185: 
   var $181=HEAP32[((((4080)|0))>>2)];
   var $cmp57_i=(($181)|(0))==0;
   if ($cmp57_i) { label = 187; break; } else { label = 186; break; }
  case 186: 
   var $cmp60_i=(($add51_i)>>>(0)) <= (($180)>>>(0));
   var $cmp63_i=(($add51_i)>>>(0)) > (($181)>>>(0));
   var $or_cond2_i=$cmp60_i | $cmp63_i;
   if ($or_cond2_i) { var $tsize_0758385_i = 0;label = 197; break; } else { label = 187; break; }
  case 187: 
   var $call65_i=_sbrk($ssize_0_i);
   var $cmp66_i160=(($call65_i)|(0))==(($call34_i)|(0));
   var $ssize_0__i=$cmp66_i160 ? $ssize_0_i : 0;
   var $call34__i=$cmp66_i160 ? $call34_i : -1;
   var $tbase_0_i = $call34__i;var $tsize_0_i = $ssize_0__i;var $br_0_i = $call65_i;var $ssize_1_i = $ssize_0_i;label = 190; break;
  case 188: 
   var $182=HEAP32[((((3652)|0))>>2)];
   var $add74_i=((($add9_i)-($182))|0);
   var $and77_i=$add74_i & $neg_i151;
   var $cmp78_i=(($and77_i)>>>(0)) < 2147483647;
   if ($cmp78_i) { label = 189; break; } else { var $tsize_0758385_i = 0;label = 197; break; }
  case 189: 
   var $call80_i=_sbrk($and77_i);
   var $183=HEAP32[(($base_i_i)>>2)];
   var $184=HEAP32[(($size_i_i)>>2)];
   var $add_ptr_i162=(($183+$184)|0);
   var $cmp82_i=(($call80_i)|(0))==(($add_ptr_i162)|(0));
   var $and77__i=$cmp82_i ? $and77_i : 0;
   var $call80__i=$cmp82_i ? $call80_i : -1;
   var $tbase_0_i = $call80__i;var $tsize_0_i = $and77__i;var $br_0_i = $call80_i;var $ssize_1_i = $and77_i;label = 190; break;
  case 190: 
   var $ssize_1_i;
   var $br_0_i;
   var $tsize_0_i;
   var $tbase_0_i;
   var $sub109_i=(((-$ssize_1_i))|0);
   var $cmp86_i=(($tbase_0_i)|(0))==-1;
   if ($cmp86_i) { label = 191; break; } else { var $tsize_291_i = $tsize_0_i;var $tbase_292_i = $tbase_0_i;label = 201; break; }
  case 191: 
   var $cmp88_i=(($br_0_i)|(0))!=-1;
   var $cmp90_i163=(($ssize_1_i)>>>(0)) < 2147483647;
   var $or_cond3_i=$cmp88_i & $cmp90_i163;
   var $cmp93_i=(($ssize_1_i)>>>(0)) < (($add_i149)>>>(0));
   var $or_cond4_i=$or_cond3_i & $cmp93_i;
   if ($or_cond4_i) { label = 192; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 192: 
   var $185=HEAP32[((((3616)|0))>>2)];
   var $sub96_i=((($sub_i150)-($ssize_1_i))|0);
   var $add98_i=((($sub96_i)+($185))|0);
   var $neg100_i=(((-$185))|0);
   var $and101_i=$add98_i & $neg100_i;
   var $cmp102_i=(($and101_i)>>>(0)) < 2147483647;
   if ($cmp102_i) { label = 193; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 193: 
   var $call104_i=_sbrk($and101_i);
   var $cmp105_i=(($call104_i)|(0))==-1;
   if ($cmp105_i) { label = 195; break; } else { label = 194; break; }
  case 194: 
   var $add107_i=((($and101_i)+($ssize_1_i))|0);
   var $ssize_2_i = $add107_i;label = 196; break;
  case 195: 
   var $call110_i=_sbrk($sub109_i);
   var $tsize_0758385_i = $tsize_0_i;label = 197; break;
  case 196: 
   var $ssize_2_i;
   var $cmp115_i164=(($br_0_i)|(0))==-1;
   if ($cmp115_i164) { var $tsize_0758385_i = $tsize_0_i;label = 197; break; } else { var $tsize_291_i = $ssize_2_i;var $tbase_292_i = $br_0_i;label = 201; break; }
  case 197: 
   var $tsize_0758385_i;
   var $186=HEAP32[((((4084)|0))>>2)];
   var $or_i165=$186 | 4;
   HEAP32[((((4084)|0))>>2)]=$or_i165;
   var $tsize_1_i = $tsize_0758385_i;label = 198; break;
  case 198: 
   var $tsize_1_i;
   var $cmp124_i=(($and11_i)>>>(0)) < 2147483647;
   if ($cmp124_i) { label = 199; break; } else { label = 340; break; }
  case 199: 
   var $call128_i=_sbrk($and11_i);
   var $call129_i=_sbrk(0);
   var $notlhs_i=(($call128_i)|(0))!=-1;
   var $notrhs_i=(($call129_i)|(0))!=-1;
   var $or_cond6_not_i=$notrhs_i & $notlhs_i;
   var $cmp134_i=(($call128_i)>>>(0)) < (($call129_i)>>>(0));
   var $or_cond7_i=$or_cond6_not_i & $cmp134_i;
   if ($or_cond7_i) { label = 200; break; } else { label = 340; break; }
  case 200: 
   var $sub_ptr_lhs_cast_i=$call129_i;
   var $sub_ptr_rhs_cast_i=$call128_i;
   var $sub_ptr_sub_i=((($sub_ptr_lhs_cast_i)-($sub_ptr_rhs_cast_i))|0);
   var $add137_i=((($nb_0)+(40))|0);
   var $cmp138_i166=(($sub_ptr_sub_i)>>>(0)) > (($add137_i)>>>(0));
   var $sub_ptr_sub_tsize_1_i=$cmp138_i166 ? $sub_ptr_sub_i : $tsize_1_i;
   var $call128_tbase_1_i=$cmp138_i166 ? $call128_i : -1;
   var $cmp144_i=(($call128_tbase_1_i)|(0))==-1;
   if ($cmp144_i) { label = 340; break; } else { var $tsize_291_i = $sub_ptr_sub_tsize_1_i;var $tbase_292_i = $call128_tbase_1_i;label = 201; break; }
  case 201: 
   var $tbase_292_i;
   var $tsize_291_i;
   var $187=HEAP32[((((4072)|0))>>2)];
   var $add147_i=((($187)+($tsize_291_i))|0);
   HEAP32[((((4072)|0))>>2)]=$add147_i;
   var $188=HEAP32[((((4076)|0))>>2)];
   var $cmp148_i=(($add147_i)>>>(0)) > (($188)>>>(0));
   if ($cmp148_i) { label = 202; break; } else { label = 203; break; }
  case 202: 
   HEAP32[((((4076)|0))>>2)]=$add147_i;
   label = 203; break;
  case 203: 
   var $189=HEAP32[((((3664)|0))>>2)];
   var $cmp154_i=(($189)|(0))==0;
   if ($cmp154_i) { label = 204; break; } else { var $sp_0105_i = ((4088)|0);label = 211; break; }
  case 204: 
   var $190=HEAP32[((((3656)|0))>>2)];
   var $cmp156_i=(($190)|(0))==0;
   var $cmp159_i168=(($tbase_292_i)>>>(0)) < (($190)>>>(0));
   var $or_cond8_i=$cmp156_i | $cmp159_i168;
   if ($or_cond8_i) { label = 205; break; } else { label = 206; break; }
  case 205: 
   HEAP32[((((3656)|0))>>2)]=$tbase_292_i;
   label = 206; break;
  case 206: 
   HEAP32[((((4088)|0))>>2)]=$tbase_292_i;
   HEAP32[((((4092)|0))>>2)]=$tsize_291_i;
   HEAP32[((((4100)|0))>>2)]=0;
   var $191=HEAP32[((((3608)|0))>>2)];
   HEAP32[((((3676)|0))>>2)]=$191;
   HEAP32[((((3672)|0))>>2)]=-1;
   var $i_02_i_i = 0;label = 207; break;
  case 207: 
   var $i_02_i_i;
   var $shl_i_i=$i_02_i_i << 1;
   var $arrayidx_i_i=((3680+($shl_i_i<<2))|0);
   var $192=$arrayidx_i_i;
   var $arrayidx_sum_i_i=((($shl_i_i)+(3))|0);
   var $193=((3680+($arrayidx_sum_i_i<<2))|0);
   HEAP32[(($193)>>2)]=$192;
   var $arrayidx_sum1_i_i=((($shl_i_i)+(2))|0);
   var $194=((3680+($arrayidx_sum1_i_i<<2))|0);
   HEAP32[(($194)>>2)]=$192;
   var $inc_i_i=((($i_02_i_i)+(1))|0);
   var $cmp_i11_i=(($inc_i_i)>>>(0)) < 32;
   if ($cmp_i11_i) { var $i_02_i_i = $inc_i_i;label = 207; break; } else { label = 208; break; }
  case 208: 
   var $sub169_i=((($tsize_291_i)-(40))|0);
   var $add_ptr_i12_i=(($tbase_292_i+8)|0);
   var $195=$add_ptr_i12_i;
   var $and_i13_i=$195 & 7;
   var $cmp_i14_i=(($and_i13_i)|(0))==0;
   if ($cmp_i14_i) { var $cond_i_i = 0;label = 210; break; } else { label = 209; break; }
  case 209: 
   var $196=(((-$195))|0);
   var $and3_i_i=$196 & 7;
   var $cond_i_i = $and3_i_i;label = 210; break;
  case 210: 
   var $cond_i_i;
   var $add_ptr4_i_i=(($tbase_292_i+$cond_i_i)|0);
   var $197=$add_ptr4_i_i;
   var $sub5_i_i=((($sub169_i)-($cond_i_i))|0);
   HEAP32[((((3664)|0))>>2)]=$197;
   HEAP32[((((3652)|0))>>2)]=$sub5_i_i;
   var $or_i_i=$sub5_i_i | 1;
   var $add_ptr4_sum_i_i=((($cond_i_i)+(4))|0);
   var $head_i_i=(($tbase_292_i+$add_ptr4_sum_i_i)|0);
   var $198=$head_i_i;
   HEAP32[(($198)>>2)]=$or_i_i;
   var $add_ptr6_sum_i_i=((($tsize_291_i)-(36))|0);
   var $head7_i_i=(($tbase_292_i+$add_ptr6_sum_i_i)|0);
   var $199=$head7_i_i;
   HEAP32[(($199)>>2)]=40;
   var $200=HEAP32[((((3624)|0))>>2)];
   HEAP32[((((3668)|0))>>2)]=$200;
   label = 338; break;
  case 211: 
   var $sp_0105_i;
   var $base184_i=(($sp_0105_i)|0);
   var $201=HEAP32[(($base184_i)>>2)];
   var $size185_i=(($sp_0105_i+4)|0);
   var $202=HEAP32[(($size185_i)>>2)];
   var $add_ptr186_i=(($201+$202)|0);
   var $cmp187_i=(($tbase_292_i)|(0))==(($add_ptr186_i)|(0));
   if ($cmp187_i) { label = 213; break; } else { label = 212; break; }
  case 212: 
   var $next_i=(($sp_0105_i+8)|0);
   var $203=HEAP32[(($next_i)>>2)];
   var $cmp183_i=(($203)|(0))==0;
   if ($cmp183_i) { label = 218; break; } else { var $sp_0105_i = $203;label = 211; break; }
  case 213: 
   var $sflags190_i=(($sp_0105_i+12)|0);
   var $204=HEAP32[(($sflags190_i)>>2)];
   var $and191_i=$204 & 8;
   var $tobool192_i=(($and191_i)|(0))==0;
   if ($tobool192_i) { label = 214; break; } else { label = 218; break; }
  case 214: 
   var $205=$189;
   var $cmp200_i=(($205)>>>(0)) >= (($201)>>>(0));
   var $cmp206_i=(($205)>>>(0)) < (($tbase_292_i)>>>(0));
   var $or_cond94_i=$cmp200_i & $cmp206_i;
   if ($or_cond94_i) { label = 215; break; } else { label = 218; break; }
  case 215: 
   var $add209_i=((($202)+($tsize_291_i))|0);
   HEAP32[(($size185_i)>>2)]=$add209_i;
   var $206=HEAP32[((((3664)|0))>>2)];
   var $207=HEAP32[((((3652)|0))>>2)];
   var $add212_i=((($207)+($tsize_291_i))|0);
   var $208=$206;
   var $add_ptr_i23_i=(($206+8)|0);
   var $209=$add_ptr_i23_i;
   var $and_i24_i=$209 & 7;
   var $cmp_i25_i=(($and_i24_i)|(0))==0;
   if ($cmp_i25_i) { var $cond_i28_i = 0;label = 217; break; } else { label = 216; break; }
  case 216: 
   var $210=(((-$209))|0);
   var $and3_i26_i=$210 & 7;
   var $cond_i28_i = $and3_i26_i;label = 217; break;
  case 217: 
   var $cond_i28_i;
   var $add_ptr4_i29_i=(($208+$cond_i28_i)|0);
   var $211=$add_ptr4_i29_i;
   var $sub5_i30_i=((($add212_i)-($cond_i28_i))|0);
   HEAP32[((((3664)|0))>>2)]=$211;
   HEAP32[((((3652)|0))>>2)]=$sub5_i30_i;
   var $or_i31_i=$sub5_i30_i | 1;
   var $add_ptr4_sum_i32_i=((($cond_i28_i)+(4))|0);
   var $head_i33_i=(($208+$add_ptr4_sum_i32_i)|0);
   var $212=$head_i33_i;
   HEAP32[(($212)>>2)]=$or_i31_i;
   var $add_ptr6_sum_i34_i=((($add212_i)+(4))|0);
   var $head7_i35_i=(($208+$add_ptr6_sum_i34_i)|0);
   var $213=$head7_i35_i;
   HEAP32[(($213)>>2)]=40;
   var $214=HEAP32[((((3624)|0))>>2)];
   HEAP32[((((3668)|0))>>2)]=$214;
   label = 338; break;
  case 218: 
   var $215=HEAP32[((((3656)|0))>>2)];
   var $cmp215_i=(($tbase_292_i)>>>(0)) < (($215)>>>(0));
   if ($cmp215_i) { label = 219; break; } else { label = 220; break; }
  case 219: 
   HEAP32[((((3656)|0))>>2)]=$tbase_292_i;
   label = 220; break;
  case 220: 
   var $add_ptr224_i=(($tbase_292_i+$tsize_291_i)|0);
   var $sp_1101_i = ((4088)|0);label = 221; break;
  case 221: 
   var $sp_1101_i;
   var $base223_i=(($sp_1101_i)|0);
   var $216=HEAP32[(($base223_i)>>2)];
   var $cmp225_i=(($216)|(0))==(($add_ptr224_i)|(0));
   if ($cmp225_i) { label = 223; break; } else { label = 222; break; }
  case 222: 
   var $next228_i=(($sp_1101_i+8)|0);
   var $217=HEAP32[(($next228_i)>>2)];
   var $cmp221_i=(($217)|(0))==0;
   if ($cmp221_i) { label = 304; break; } else { var $sp_1101_i = $217;label = 221; break; }
  case 223: 
   var $sflags232_i=(($sp_1101_i+12)|0);
   var $218=HEAP32[(($sflags232_i)>>2)];
   var $and233_i=$218 & 8;
   var $tobool234_i=(($and233_i)|(0))==0;
   if ($tobool234_i) { label = 224; break; } else { label = 304; break; }
  case 224: 
   HEAP32[(($base223_i)>>2)]=$tbase_292_i;
   var $size242_i=(($sp_1101_i+4)|0);
   var $219=HEAP32[(($size242_i)>>2)];
   var $add243_i=((($219)+($tsize_291_i))|0);
   HEAP32[(($size242_i)>>2)]=$add243_i;
   var $add_ptr_i38_i=(($tbase_292_i+8)|0);
   var $220=$add_ptr_i38_i;
   var $and_i39_i=$220 & 7;
   var $cmp_i40_i=(($and_i39_i)|(0))==0;
   if ($cmp_i40_i) { var $cond_i43_i = 0;label = 226; break; } else { label = 225; break; }
  case 225: 
   var $221=(((-$220))|0);
   var $and3_i41_i=$221 & 7;
   var $cond_i43_i = $and3_i41_i;label = 226; break;
  case 226: 
   var $cond_i43_i;
   var $add_ptr4_i44_i=(($tbase_292_i+$cond_i43_i)|0);
   var $add_ptr224_sum_i=((($tsize_291_i)+(8))|0);
   var $add_ptr5_i_i=(($tbase_292_i+$add_ptr224_sum_i)|0);
   var $222=$add_ptr5_i_i;
   var $and6_i45_i=$222 & 7;
   var $cmp7_i_i=(($and6_i45_i)|(0))==0;
   if ($cmp7_i_i) { var $cond15_i_i = 0;label = 228; break; } else { label = 227; break; }
  case 227: 
   var $223=(((-$222))|0);
   var $and13_i_i=$223 & 7;
   var $cond15_i_i = $and13_i_i;label = 228; break;
  case 228: 
   var $cond15_i_i;
   var $add_ptr224_sum122_i=((($cond15_i_i)+($tsize_291_i))|0);
   var $add_ptr16_i_i=(($tbase_292_i+$add_ptr224_sum122_i)|0);
   var $224=$add_ptr16_i_i;
   var $sub_ptr_lhs_cast_i47_i=$add_ptr16_i_i;
   var $sub_ptr_rhs_cast_i48_i=$add_ptr4_i44_i;
   var $sub_ptr_sub_i49_i=((($sub_ptr_lhs_cast_i47_i)-($sub_ptr_rhs_cast_i48_i))|0);
   var $add_ptr4_sum_i50_i=((($cond_i43_i)+($nb_0))|0);
   var $add_ptr17_i_i=(($tbase_292_i+$add_ptr4_sum_i50_i)|0);
   var $225=$add_ptr17_i_i;
   var $sub18_i_i=((($sub_ptr_sub_i49_i)-($nb_0))|0);
   var $or19_i_i=$nb_0 | 3;
   var $add_ptr4_sum1_i_i=((($cond_i43_i)+(4))|0);
   var $head_i51_i=(($tbase_292_i+$add_ptr4_sum1_i_i)|0);
   var $226=$head_i51_i;
   HEAP32[(($226)>>2)]=$or19_i_i;
   var $227=HEAP32[((((3664)|0))>>2)];
   var $cmp20_i_i=(($224)|(0))==(($227)|(0));
   if ($cmp20_i_i) { label = 229; break; } else { label = 230; break; }
  case 229: 
   var $228=HEAP32[((((3652)|0))>>2)];
   var $add_i_i=((($228)+($sub18_i_i))|0);
   HEAP32[((((3652)|0))>>2)]=$add_i_i;
   HEAP32[((((3664)|0))>>2)]=$225;
   var $or22_i_i=$add_i_i | 1;
   var $add_ptr17_sum39_i_i=((($add_ptr4_sum_i50_i)+(4))|0);
   var $head23_i_i=(($tbase_292_i+$add_ptr17_sum39_i_i)|0);
   var $229=$head23_i_i;
   HEAP32[(($229)>>2)]=$or22_i_i;
   label = 303; break;
  case 230: 
   var $230=HEAP32[((((3660)|0))>>2)];
   var $cmp24_i_i=(($224)|(0))==(($230)|(0));
   if ($cmp24_i_i) { label = 231; break; } else { label = 232; break; }
  case 231: 
   var $231=HEAP32[((((3648)|0))>>2)];
   var $add26_i_i=((($231)+($sub18_i_i))|0);
   HEAP32[((((3648)|0))>>2)]=$add26_i_i;
   HEAP32[((((3660)|0))>>2)]=$225;
   var $or28_i_i=$add26_i_i | 1;
   var $add_ptr17_sum37_i_i=((($add_ptr4_sum_i50_i)+(4))|0);
   var $head29_i_i=(($tbase_292_i+$add_ptr17_sum37_i_i)|0);
   var $232=$head29_i_i;
   HEAP32[(($232)>>2)]=$or28_i_i;
   var $add_ptr17_sum38_i_i=((($add26_i_i)+($add_ptr4_sum_i50_i))|0);
   var $add_ptr30_i53_i=(($tbase_292_i+$add_ptr17_sum38_i_i)|0);
   var $prev_foot_i54_i=$add_ptr30_i53_i;
   HEAP32[(($prev_foot_i54_i)>>2)]=$add26_i_i;
   label = 303; break;
  case 232: 
   var $add_ptr16_sum_i_i=((($tsize_291_i)+(4))|0);
   var $add_ptr224_sum123_i=((($add_ptr16_sum_i_i)+($cond15_i_i))|0);
   var $head32_i_i=(($tbase_292_i+$add_ptr224_sum123_i)|0);
   var $233=$head32_i_i;
   var $234=HEAP32[(($233)>>2)];
   var $and33_i_i=$234 & 3;
   var $cmp34_i_i=(($and33_i_i)|(0))==1;
   if ($cmp34_i_i) { label = 233; break; } else { var $oldfirst_0_i_i = $224;var $qsize_0_i_i = $sub18_i_i;label = 280; break; }
  case 233: 
   var $and37_i_i=$234 & -8;
   var $shr_i55_i=$234 >>> 3;
   var $cmp38_i_i=(($234)>>>(0)) < 256;
   if ($cmp38_i_i) { label = 234; break; } else { label = 246; break; }
  case 234: 
   var $add_ptr16_sum3233_i_i=$cond15_i_i | 8;
   var $add_ptr224_sum133_i=((($add_ptr16_sum3233_i_i)+($tsize_291_i))|0);
   var $fd_i_i=(($tbase_292_i+$add_ptr224_sum133_i)|0);
   var $235=$fd_i_i;
   var $236=HEAP32[(($235)>>2)];
   var $add_ptr16_sum34_i_i=((($tsize_291_i)+(12))|0);
   var $add_ptr224_sum134_i=((($add_ptr16_sum34_i_i)+($cond15_i_i))|0);
   var $bk_i56_i=(($tbase_292_i+$add_ptr224_sum134_i)|0);
   var $237=$bk_i56_i;
   var $238=HEAP32[(($237)>>2)];
   var $shl_i57_i=$shr_i55_i << 1;
   var $arrayidx_i58_i=((3680+($shl_i57_i<<2))|0);
   var $239=$arrayidx_i58_i;
   var $cmp41_i_i=(($236)|(0))==(($239)|(0));
   if ($cmp41_i_i) { label = 237; break; } else { label = 235; break; }
  case 235: 
   var $240=$236;
   var $241=HEAP32[((((3656)|0))>>2)];
   var $cmp42_i_i=(($240)>>>(0)) < (($241)>>>(0));
   if ($cmp42_i_i) { label = 245; break; } else { label = 236; break; }
  case 236: 
   var $bk43_i_i=(($236+12)|0);
   var $242=HEAP32[(($bk43_i_i)>>2)];
   var $cmp44_i_i=(($242)|(0))==(($224)|(0));
   if ($cmp44_i_i) { label = 237; break; } else { label = 245; break; }
  case 237: 
   var $cmp46_i60_i=(($238)|(0))==(($236)|(0));
   if ($cmp46_i60_i) { label = 238; break; } else { label = 239; break; }
  case 238: 
   var $shl48_i_i=1 << $shr_i55_i;
   var $neg_i_i=$shl48_i_i ^ -1;
   var $243=HEAP32[((((3640)|0))>>2)];
   var $and49_i_i=$243 & $neg_i_i;
   HEAP32[((((3640)|0))>>2)]=$and49_i_i;
   label = 279; break;
  case 239: 
   var $cmp54_i_i=(($238)|(0))==(($239)|(0));
   if ($cmp54_i_i) { label = 240; break; } else { label = 241; break; }
  case 240: 
   var $fd68_pre_i_i=(($238+8)|0);
   var $fd68_pre_phi_i_i = $fd68_pre_i_i;label = 243; break;
  case 241: 
   var $244=$238;
   var $245=HEAP32[((((3656)|0))>>2)];
   var $cmp57_i_i=(($244)>>>(0)) < (($245)>>>(0));
   if ($cmp57_i_i) { label = 244; break; } else { label = 242; break; }
  case 242: 
   var $fd59_i_i=(($238+8)|0);
   var $246=HEAP32[(($fd59_i_i)>>2)];
   var $cmp60_i_i=(($246)|(0))==(($224)|(0));
   if ($cmp60_i_i) { var $fd68_pre_phi_i_i = $fd59_i_i;label = 243; break; } else { label = 244; break; }
  case 243: 
   var $fd68_pre_phi_i_i;
   var $bk67_i_i=(($236+12)|0);
   HEAP32[(($bk67_i_i)>>2)]=$238;
   HEAP32[(($fd68_pre_phi_i_i)>>2)]=$236;
   label = 279; break;
  case 244: 
   _abort();
   throw "Reached an unreachable!";
  case 245: 
   _abort();
   throw "Reached an unreachable!";
  case 246: 
   var $247=$add_ptr16_i_i;
   var $add_ptr16_sum23_i_i=$cond15_i_i | 24;
   var $add_ptr224_sum124_i=((($add_ptr16_sum23_i_i)+($tsize_291_i))|0);
   var $parent_i62_i=(($tbase_292_i+$add_ptr224_sum124_i)|0);
   var $248=$parent_i62_i;
   var $249=HEAP32[(($248)>>2)];
   var $add_ptr16_sum4_i_i=((($tsize_291_i)+(12))|0);
   var $add_ptr224_sum125_i=((($add_ptr16_sum4_i_i)+($cond15_i_i))|0);
   var $bk74_i_i=(($tbase_292_i+$add_ptr224_sum125_i)|0);
   var $250=$bk74_i_i;
   var $251=HEAP32[(($250)>>2)];
   var $cmp75_i_i=(($251)|(0))==(($247)|(0));
   if ($cmp75_i_i) { label = 252; break; } else { label = 247; break; }
  case 247: 
   var $add_ptr16_sum2930_i_i=$cond15_i_i | 8;
   var $add_ptr224_sum126_i=((($add_ptr16_sum2930_i_i)+($tsize_291_i))|0);
   var $fd78_i_i=(($tbase_292_i+$add_ptr224_sum126_i)|0);
   var $252=$fd78_i_i;
   var $253=HEAP32[(($252)>>2)];
   var $254=$253;
   var $255=HEAP32[((((3656)|0))>>2)];
   var $cmp81_i_i=(($254)>>>(0)) < (($255)>>>(0));
   if ($cmp81_i_i) { label = 251; break; } else { label = 248; break; }
  case 248: 
   var $bk82_i_i=(($253+12)|0);
   var $256=HEAP32[(($bk82_i_i)>>2)];
   var $cmp83_i_i=(($256)|(0))==(($247)|(0));
   if ($cmp83_i_i) { label = 249; break; } else { label = 251; break; }
  case 249: 
   var $fd85_i_i=(($251+8)|0);
   var $257=HEAP32[(($fd85_i_i)>>2)];
   var $cmp86_i_i=(($257)|(0))==(($247)|(0));
   if ($cmp86_i_i) { label = 250; break; } else { label = 251; break; }
  case 250: 
   HEAP32[(($bk82_i_i)>>2)]=$251;
   HEAP32[(($fd85_i_i)>>2)]=$253;
   var $R_1_i_i = $251;label = 259; break;
  case 251: 
   _abort();
   throw "Reached an unreachable!";
  case 252: 
   var $add_ptr16_sum56_i_i=$cond15_i_i | 16;
   var $add_ptr224_sum131_i=((($add_ptr16_sum_i_i)+($add_ptr16_sum56_i_i))|0);
   var $arrayidx96_i_i=(($tbase_292_i+$add_ptr224_sum131_i)|0);
   var $258=$arrayidx96_i_i;
   var $259=HEAP32[(($258)>>2)];
   var $cmp97_i_i=(($259)|(0))==0;
   if ($cmp97_i_i) { label = 253; break; } else { var $R_0_i_i = $259;var $RP_0_i_i = $258;label = 254; break; }
  case 253: 
   var $add_ptr224_sum132_i=((($add_ptr16_sum56_i_i)+($tsize_291_i))|0);
   var $child_i_i=(($tbase_292_i+$add_ptr224_sum132_i)|0);
   var $arrayidx99_i_i=$child_i_i;
   var $260=HEAP32[(($arrayidx99_i_i)>>2)];
   var $cmp100_i_i=(($260)|(0))==0;
   if ($cmp100_i_i) { var $R_1_i_i = 0;label = 259; break; } else { var $R_0_i_i = $260;var $RP_0_i_i = $arrayidx99_i_i;label = 254; break; }
  case 254: 
   var $RP_0_i_i;
   var $R_0_i_i;
   var $arrayidx103_i_i=(($R_0_i_i+20)|0);
   var $261=HEAP32[(($arrayidx103_i_i)>>2)];
   var $cmp104_i_i=(($261)|(0))==0;
   if ($cmp104_i_i) { label = 255; break; } else { var $R_0_i_i = $261;var $RP_0_i_i = $arrayidx103_i_i;label = 254; break; }
  case 255: 
   var $arrayidx107_i_i=(($R_0_i_i+16)|0);
   var $262=HEAP32[(($arrayidx107_i_i)>>2)];
   var $cmp108_i_i=(($262)|(0))==0;
   if ($cmp108_i_i) { label = 256; break; } else { var $R_0_i_i = $262;var $RP_0_i_i = $arrayidx107_i_i;label = 254; break; }
  case 256: 
   var $263=$RP_0_i_i;
   var $264=HEAP32[((((3656)|0))>>2)];
   var $cmp112_i_i=(($263)>>>(0)) < (($264)>>>(0));
   if ($cmp112_i_i) { label = 258; break; } else { label = 257; break; }
  case 257: 
   HEAP32[(($RP_0_i_i)>>2)]=0;
   var $R_1_i_i = $R_0_i_i;label = 259; break;
  case 258: 
   _abort();
   throw "Reached an unreachable!";
  case 259: 
   var $R_1_i_i;
   var $cmp120_i64_i=(($249)|(0))==0;
   if ($cmp120_i64_i) { label = 279; break; } else { label = 260; break; }
  case 260: 
   var $add_ptr16_sum26_i_i=((($tsize_291_i)+(28))|0);
   var $add_ptr224_sum127_i=((($add_ptr16_sum26_i_i)+($cond15_i_i))|0);
   var $index_i65_i=(($tbase_292_i+$add_ptr224_sum127_i)|0);
   var $265=$index_i65_i;
   var $266=HEAP32[(($265)>>2)];
   var $arrayidx123_i_i=((3944+($266<<2))|0);
   var $267=HEAP32[(($arrayidx123_i_i)>>2)];
   var $cmp124_i_i=(($247)|(0))==(($267)|(0));
   if ($cmp124_i_i) { label = 261; break; } else { label = 263; break; }
  case 261: 
   HEAP32[(($arrayidx123_i_i)>>2)]=$R_1_i_i;
   var $cond41_i_i=(($R_1_i_i)|(0))==0;
   if ($cond41_i_i) { label = 262; break; } else { label = 269; break; }
  case 262: 
   var $268=HEAP32[(($265)>>2)];
   var $shl131_i_i=1 << $268;
   var $neg132_i_i=$shl131_i_i ^ -1;
   var $269=HEAP32[((((3644)|0))>>2)];
   var $and133_i_i=$269 & $neg132_i_i;
   HEAP32[((((3644)|0))>>2)]=$and133_i_i;
   label = 279; break;
  case 263: 
   var $270=$249;
   var $271=HEAP32[((((3656)|0))>>2)];
   var $cmp137_i_i=(($270)>>>(0)) < (($271)>>>(0));
   if ($cmp137_i_i) { label = 267; break; } else { label = 264; break; }
  case 264: 
   var $arrayidx143_i_i=(($249+16)|0);
   var $272=HEAP32[(($arrayidx143_i_i)>>2)];
   var $cmp144_i_i=(($272)|(0))==(($247)|(0));
   if ($cmp144_i_i) { label = 265; break; } else { label = 266; break; }
  case 265: 
   HEAP32[(($arrayidx143_i_i)>>2)]=$R_1_i_i;
   label = 268; break;
  case 266: 
   var $arrayidx151_i_i=(($249+20)|0);
   HEAP32[(($arrayidx151_i_i)>>2)]=$R_1_i_i;
   label = 268; break;
  case 267: 
   _abort();
   throw "Reached an unreachable!";
  case 268: 
   var $cmp156_i_i=(($R_1_i_i)|(0))==0;
   if ($cmp156_i_i) { label = 279; break; } else { label = 269; break; }
  case 269: 
   var $273=$R_1_i_i;
   var $274=HEAP32[((((3656)|0))>>2)];
   var $cmp160_i_i=(($273)>>>(0)) < (($274)>>>(0));
   if ($cmp160_i_i) { label = 278; break; } else { label = 270; break; }
  case 270: 
   var $parent165_i_i=(($R_1_i_i+24)|0);
   HEAP32[(($parent165_i_i)>>2)]=$249;
   var $add_ptr16_sum2728_i_i=$cond15_i_i | 16;
   var $add_ptr224_sum128_i=((($add_ptr16_sum2728_i_i)+($tsize_291_i))|0);
   var $child166_i_i=(($tbase_292_i+$add_ptr224_sum128_i)|0);
   var $arrayidx167_i_i=$child166_i_i;
   var $275=HEAP32[(($arrayidx167_i_i)>>2)];
   var $cmp168_i_i=(($275)|(0))==0;
   if ($cmp168_i_i) { label = 274; break; } else { label = 271; break; }
  case 271: 
   var $276=$275;
   var $277=HEAP32[((((3656)|0))>>2)];
   var $cmp172_i_i=(($276)>>>(0)) < (($277)>>>(0));
   if ($cmp172_i_i) { label = 273; break; } else { label = 272; break; }
  case 272: 
   var $arrayidx178_i_i=(($R_1_i_i+16)|0);
   HEAP32[(($arrayidx178_i_i)>>2)]=$275;
   var $parent179_i_i=(($275+24)|0);
   HEAP32[(($parent179_i_i)>>2)]=$R_1_i_i;
   label = 274; break;
  case 273: 
   _abort();
   throw "Reached an unreachable!";
  case 274: 
   var $add_ptr224_sum129_i=((($add_ptr16_sum_i_i)+($add_ptr16_sum2728_i_i))|0);
   var $arrayidx184_i_i=(($tbase_292_i+$add_ptr224_sum129_i)|0);
   var $278=$arrayidx184_i_i;
   var $279=HEAP32[(($278)>>2)];
   var $cmp185_i_i=(($279)|(0))==0;
   if ($cmp185_i_i) { label = 279; break; } else { label = 275; break; }
  case 275: 
   var $280=$279;
   var $281=HEAP32[((((3656)|0))>>2)];
   var $cmp189_i_i=(($280)>>>(0)) < (($281)>>>(0));
   if ($cmp189_i_i) { label = 277; break; } else { label = 276; break; }
  case 276: 
   var $arrayidx195_i_i=(($R_1_i_i+20)|0);
   HEAP32[(($arrayidx195_i_i)>>2)]=$279;
   var $parent196_i_i=(($279+24)|0);
   HEAP32[(($parent196_i_i)>>2)]=$R_1_i_i;
   label = 279; break;
  case 277: 
   _abort();
   throw "Reached an unreachable!";
  case 278: 
   _abort();
   throw "Reached an unreachable!";
  case 279: 
   var $add_ptr16_sum7_i_i=$and37_i_i | $cond15_i_i;
   var $add_ptr224_sum130_i=((($add_ptr16_sum7_i_i)+($tsize_291_i))|0);
   var $add_ptr205_i_i=(($tbase_292_i+$add_ptr224_sum130_i)|0);
   var $282=$add_ptr205_i_i;
   var $add206_i_i=((($and37_i_i)+($sub18_i_i))|0);
   var $oldfirst_0_i_i = $282;var $qsize_0_i_i = $add206_i_i;label = 280; break;
  case 280: 
   var $qsize_0_i_i;
   var $oldfirst_0_i_i;
   var $head208_i_i=(($oldfirst_0_i_i+4)|0);
   var $283=HEAP32[(($head208_i_i)>>2)];
   var $and209_i_i=$283 & -2;
   HEAP32[(($head208_i_i)>>2)]=$and209_i_i;
   var $or210_i_i=$qsize_0_i_i | 1;
   var $add_ptr17_sum_i_i=((($add_ptr4_sum_i50_i)+(4))|0);
   var $head211_i_i=(($tbase_292_i+$add_ptr17_sum_i_i)|0);
   var $284=$head211_i_i;
   HEAP32[(($284)>>2)]=$or210_i_i;
   var $add_ptr17_sum8_i_i=((($qsize_0_i_i)+($add_ptr4_sum_i50_i))|0);
   var $add_ptr212_i_i=(($tbase_292_i+$add_ptr17_sum8_i_i)|0);
   var $prev_foot213_i_i=$add_ptr212_i_i;
   HEAP32[(($prev_foot213_i_i)>>2)]=$qsize_0_i_i;
   var $shr214_i_i=$qsize_0_i_i >>> 3;
   var $cmp215_i_i=(($qsize_0_i_i)>>>(0)) < 256;
   if ($cmp215_i_i) { label = 281; break; } else { label = 286; break; }
  case 281: 
   var $shl221_i_i=$shr214_i_i << 1;
   var $arrayidx223_i_i=((3680+($shl221_i_i<<2))|0);
   var $285=$arrayidx223_i_i;
   var $286=HEAP32[((((3640)|0))>>2)];
   var $shl226_i_i=1 << $shr214_i_i;
   var $and227_i_i=$286 & $shl226_i_i;
   var $tobool228_i_i=(($and227_i_i)|(0))==0;
   if ($tobool228_i_i) { label = 282; break; } else { label = 283; break; }
  case 282: 
   var $or232_i_i=$286 | $shl226_i_i;
   HEAP32[((((3640)|0))>>2)]=$or232_i_i;
   var $arrayidx223_sum_pre_i_i=((($shl221_i_i)+(2))|0);
   var $_pre_i67_i=((3680+($arrayidx223_sum_pre_i_i<<2))|0);
   var $F224_0_i_i = $285;var $_pre_phi_i68_i = $_pre_i67_i;label = 285; break;
  case 283: 
   var $arrayidx223_sum25_i_i=((($shl221_i_i)+(2))|0);
   var $287=((3680+($arrayidx223_sum25_i_i<<2))|0);
   var $288=HEAP32[(($287)>>2)];
   var $289=$288;
   var $290=HEAP32[((((3656)|0))>>2)];
   var $cmp236_i_i=(($289)>>>(0)) < (($290)>>>(0));
   if ($cmp236_i_i) { label = 284; break; } else { var $F224_0_i_i = $288;var $_pre_phi_i68_i = $287;label = 285; break; }
  case 284: 
   _abort();
   throw "Reached an unreachable!";
  case 285: 
   var $_pre_phi_i68_i;
   var $F224_0_i_i;
   HEAP32[(($_pre_phi_i68_i)>>2)]=$225;
   var $bk246_i_i=(($F224_0_i_i+12)|0);
   HEAP32[(($bk246_i_i)>>2)]=$225;
   var $add_ptr17_sum23_i_i=((($add_ptr4_sum_i50_i)+(8))|0);
   var $fd247_i_i=(($tbase_292_i+$add_ptr17_sum23_i_i)|0);
   var $291=$fd247_i_i;
   HEAP32[(($291)>>2)]=$F224_0_i_i;
   var $add_ptr17_sum24_i_i=((($add_ptr4_sum_i50_i)+(12))|0);
   var $bk248_i_i=(($tbase_292_i+$add_ptr17_sum24_i_i)|0);
   var $292=$bk248_i_i;
   HEAP32[(($292)>>2)]=$285;
   label = 303; break;
  case 286: 
   var $293=$add_ptr17_i_i;
   var $shr253_i_i=$qsize_0_i_i >>> 8;
   var $cmp254_i_i=(($shr253_i_i)|(0))==0;
   if ($cmp254_i_i) { var $I252_0_i_i = 0;label = 289; break; } else { label = 287; break; }
  case 287: 
   var $cmp258_i_i=(($qsize_0_i_i)>>>(0)) > 16777215;
   if ($cmp258_i_i) { var $I252_0_i_i = 31;label = 289; break; } else { label = 288; break; }
  case 288: 
   var $sub262_i_i=((($shr253_i_i)+(1048320))|0);
   var $shr263_i_i=$sub262_i_i >>> 16;
   var $and264_i_i=$shr263_i_i & 8;
   var $shl265_i_i=$shr253_i_i << $and264_i_i;
   var $sub266_i_i=((($shl265_i_i)+(520192))|0);
   var $shr267_i_i=$sub266_i_i >>> 16;
   var $and268_i_i=$shr267_i_i & 4;
   var $add269_i_i=$and268_i_i | $and264_i_i;
   var $shl270_i_i=$shl265_i_i << $and268_i_i;
   var $sub271_i_i=((($shl270_i_i)+(245760))|0);
   var $shr272_i_i=$sub271_i_i >>> 16;
   var $and273_i_i=$shr272_i_i & 2;
   var $add274_i_i=$add269_i_i | $and273_i_i;
   var $sub275_i_i=(((14)-($add274_i_i))|0);
   var $shl276_i_i=$shl270_i_i << $and273_i_i;
   var $shr277_i_i=$shl276_i_i >>> 15;
   var $add278_i_i=((($sub275_i_i)+($shr277_i_i))|0);
   var $shl279_i_i=$add278_i_i << 1;
   var $add280_i_i=((($add278_i_i)+(7))|0);
   var $shr281_i_i=$qsize_0_i_i >>> (($add280_i_i)>>>(0));
   var $and282_i_i=$shr281_i_i & 1;
   var $add283_i_i=$and282_i_i | $shl279_i_i;
   var $I252_0_i_i = $add283_i_i;label = 289; break;
  case 289: 
   var $I252_0_i_i;
   var $arrayidx287_i_i=((3944+($I252_0_i_i<<2))|0);
   var $add_ptr17_sum9_i_i=((($add_ptr4_sum_i50_i)+(28))|0);
   var $index288_i_i=(($tbase_292_i+$add_ptr17_sum9_i_i)|0);
   var $294=$index288_i_i;
   HEAP32[(($294)>>2)]=$I252_0_i_i;
   var $add_ptr17_sum10_i_i=((($add_ptr4_sum_i50_i)+(16))|0);
   var $child289_i_i=(($tbase_292_i+$add_ptr17_sum10_i_i)|0);
   var $child289_sum_i_i=((($add_ptr4_sum_i50_i)+(20))|0);
   var $arrayidx290_i_i=(($tbase_292_i+$child289_sum_i_i)|0);
   var $295=$arrayidx290_i_i;
   HEAP32[(($295)>>2)]=0;
   var $arrayidx292_i_i=$child289_i_i;
   HEAP32[(($arrayidx292_i_i)>>2)]=0;
   var $296=HEAP32[((((3644)|0))>>2)];
   var $shl294_i_i=1 << $I252_0_i_i;
   var $and295_i_i=$296 & $shl294_i_i;
   var $tobool296_i_i=(($and295_i_i)|(0))==0;
   if ($tobool296_i_i) { label = 290; break; } else { label = 291; break; }
  case 290: 
   var $or300_i_i=$296 | $shl294_i_i;
   HEAP32[((((3644)|0))>>2)]=$or300_i_i;
   HEAP32[(($arrayidx287_i_i)>>2)]=$293;
   var $297=$arrayidx287_i_i;
   var $add_ptr17_sum11_i_i=((($add_ptr4_sum_i50_i)+(24))|0);
   var $parent301_i_i=(($tbase_292_i+$add_ptr17_sum11_i_i)|0);
   var $298=$parent301_i_i;
   HEAP32[(($298)>>2)]=$297;
   var $add_ptr17_sum12_i_i=((($add_ptr4_sum_i50_i)+(12))|0);
   var $bk302_i_i=(($tbase_292_i+$add_ptr17_sum12_i_i)|0);
   var $299=$bk302_i_i;
   HEAP32[(($299)>>2)]=$293;
   var $add_ptr17_sum13_i_i=((($add_ptr4_sum_i50_i)+(8))|0);
   var $fd303_i_i=(($tbase_292_i+$add_ptr17_sum13_i_i)|0);
   var $300=$fd303_i_i;
   HEAP32[(($300)>>2)]=$293;
   label = 303; break;
  case 291: 
   var $301=HEAP32[(($arrayidx287_i_i)>>2)];
   var $cmp306_i_i=(($I252_0_i_i)|(0))==31;
   if ($cmp306_i_i) { var $cond315_i_i = 0;label = 293; break; } else { label = 292; break; }
  case 292: 
   var $shr310_i_i=$I252_0_i_i >>> 1;
   var $sub313_i_i=(((25)-($shr310_i_i))|0);
   var $cond315_i_i = $sub313_i_i;label = 293; break;
  case 293: 
   var $cond315_i_i;
   var $shl316_i_i=$qsize_0_i_i << $cond315_i_i;
   var $K305_0_i_i = $shl316_i_i;var $T_0_i69_i = $301;label = 294; break;
  case 294: 
   var $T_0_i69_i;
   var $K305_0_i_i;
   var $head317_i_i=(($T_0_i69_i+4)|0);
   var $302=HEAP32[(($head317_i_i)>>2)];
   var $and318_i_i=$302 & -8;
   var $cmp319_i_i=(($and318_i_i)|(0))==(($qsize_0_i_i)|(0));
   if ($cmp319_i_i) { label = 299; break; } else { label = 295; break; }
  case 295: 
   var $shr322_i_i=$K305_0_i_i >>> 31;
   var $arrayidx325_i_i=(($T_0_i69_i+16+($shr322_i_i<<2))|0);
   var $303=HEAP32[(($arrayidx325_i_i)>>2)];
   var $cmp327_i_i=(($303)|(0))==0;
   var $shl326_i_i=$K305_0_i_i << 1;
   if ($cmp327_i_i) { label = 296; break; } else { var $K305_0_i_i = $shl326_i_i;var $T_0_i69_i = $303;label = 294; break; }
  case 296: 
   var $304=$arrayidx325_i_i;
   var $305=HEAP32[((((3656)|0))>>2)];
   var $cmp332_i_i=(($304)>>>(0)) < (($305)>>>(0));
   if ($cmp332_i_i) { label = 298; break; } else { label = 297; break; }
  case 297: 
   HEAP32[(($arrayidx325_i_i)>>2)]=$293;
   var $add_ptr17_sum20_i_i=((($add_ptr4_sum_i50_i)+(24))|0);
   var $parent337_i_i=(($tbase_292_i+$add_ptr17_sum20_i_i)|0);
   var $306=$parent337_i_i;
   HEAP32[(($306)>>2)]=$T_0_i69_i;
   var $add_ptr17_sum21_i_i=((($add_ptr4_sum_i50_i)+(12))|0);
   var $bk338_i_i=(($tbase_292_i+$add_ptr17_sum21_i_i)|0);
   var $307=$bk338_i_i;
   HEAP32[(($307)>>2)]=$293;
   var $add_ptr17_sum22_i_i=((($add_ptr4_sum_i50_i)+(8))|0);
   var $fd339_i_i=(($tbase_292_i+$add_ptr17_sum22_i_i)|0);
   var $308=$fd339_i_i;
   HEAP32[(($308)>>2)]=$293;
   label = 303; break;
  case 298: 
   _abort();
   throw "Reached an unreachable!";
  case 299: 
   var $fd344_i_i=(($T_0_i69_i+8)|0);
   var $309=HEAP32[(($fd344_i_i)>>2)];
   var $310=$T_0_i69_i;
   var $311=HEAP32[((((3656)|0))>>2)];
   var $cmp346_i_i=(($310)>>>(0)) < (($311)>>>(0));
   if ($cmp346_i_i) { label = 302; break; } else { label = 300; break; }
  case 300: 
   var $312=$309;
   var $cmp350_i_i=(($312)>>>(0)) < (($311)>>>(0));
   if ($cmp350_i_i) { label = 302; break; } else { label = 301; break; }
  case 301: 
   var $bk357_i_i=(($309+12)|0);
   HEAP32[(($bk357_i_i)>>2)]=$293;
   HEAP32[(($fd344_i_i)>>2)]=$293;
   var $add_ptr17_sum17_i_i=((($add_ptr4_sum_i50_i)+(8))|0);
   var $fd359_i_i=(($tbase_292_i+$add_ptr17_sum17_i_i)|0);
   var $313=$fd359_i_i;
   HEAP32[(($313)>>2)]=$309;
   var $add_ptr17_sum18_i_i=((($add_ptr4_sum_i50_i)+(12))|0);
   var $bk360_i_i=(($tbase_292_i+$add_ptr17_sum18_i_i)|0);
   var $314=$bk360_i_i;
   HEAP32[(($314)>>2)]=$T_0_i69_i;
   var $add_ptr17_sum19_i_i=((($add_ptr4_sum_i50_i)+(24))|0);
   var $parent361_i_i=(($tbase_292_i+$add_ptr17_sum19_i_i)|0);
   var $315=$parent361_i_i;
   HEAP32[(($315)>>2)]=0;
   label = 303; break;
  case 302: 
   _abort();
   throw "Reached an unreachable!";
  case 303: 
   var $add_ptr4_sum1415_i_i=$cond_i43_i | 8;
   var $add_ptr368_i_i=(($tbase_292_i+$add_ptr4_sum1415_i_i)|0);
   var $mem_0 = $add_ptr368_i_i;label = 341; break;
  case 304: 
   var $316=$189;
   var $sp_0_i_i_i = ((4088)|0);label = 305; break;
  case 305: 
   var $sp_0_i_i_i;
   var $base_i_i_i=(($sp_0_i_i_i)|0);
   var $317=HEAP32[(($base_i_i_i)>>2)];
   var $cmp_i_i_i=(($317)>>>(0)) > (($316)>>>(0));
   if ($cmp_i_i_i) { label = 307; break; } else { label = 306; break; }
  case 306: 
   var $size_i_i_i=(($sp_0_i_i_i+4)|0);
   var $318=HEAP32[(($size_i_i_i)>>2)];
   var $add_ptr_i_i_i=(($317+$318)|0);
   var $cmp2_i_i_i=(($add_ptr_i_i_i)>>>(0)) > (($316)>>>(0));
   if ($cmp2_i_i_i) { label = 308; break; } else { label = 307; break; }
  case 307: 
   var $next_i_i_i=(($sp_0_i_i_i+8)|0);
   var $319=HEAP32[(($next_i_i_i)>>2)];
   var $sp_0_i_i_i = $319;label = 305; break;
  case 308: 
   var $add_ptr_sum_i_i=((($318)-(47))|0);
   var $add_ptr2_sum_i_i=((($318)-(39))|0);
   var $add_ptr3_i_i=(($317+$add_ptr2_sum_i_i)|0);
   var $320=$add_ptr3_i_i;
   var $and_i15_i=$320 & 7;
   var $cmp_i16_i=(($and_i15_i)|(0))==0;
   if ($cmp_i16_i) { var $cond_i18_i = 0;label = 310; break; } else { label = 309; break; }
  case 309: 
   var $321=(((-$320))|0);
   var $and6_i_i=$321 & 7;
   var $cond_i18_i = $and6_i_i;label = 310; break;
  case 310: 
   var $cond_i18_i;
   var $add_ptr2_sum1_i_i=((($add_ptr_sum_i_i)+($cond_i18_i))|0);
   var $add_ptr7_i_i=(($317+$add_ptr2_sum1_i_i)|0);
   var $add_ptr82_i_i=(($189+16)|0);
   var $add_ptr8_i_i=$add_ptr82_i_i;
   var $cmp9_i_i=(($add_ptr7_i_i)>>>(0)) < (($add_ptr8_i_i)>>>(0));
   var $cond13_i_i=$cmp9_i_i ? $316 : $add_ptr7_i_i;
   var $add_ptr14_i_i=(($cond13_i_i+8)|0);
   var $322=$add_ptr14_i_i;
   var $sub16_i_i=((($tsize_291_i)-(40))|0);
   var $add_ptr_i11_i_i=(($tbase_292_i+8)|0);
   var $323=$add_ptr_i11_i_i;
   var $and_i_i_i=$323 & 7;
   var $cmp_i12_i_i=(($and_i_i_i)|(0))==0;
   if ($cmp_i12_i_i) { var $cond_i_i_i = 0;label = 312; break; } else { label = 311; break; }
  case 311: 
   var $324=(((-$323))|0);
   var $and3_i_i_i=$324 & 7;
   var $cond_i_i_i = $and3_i_i_i;label = 312; break;
  case 312: 
   var $cond_i_i_i;
   var $add_ptr4_i_i_i=(($tbase_292_i+$cond_i_i_i)|0);
   var $325=$add_ptr4_i_i_i;
   var $sub5_i_i_i=((($sub16_i_i)-($cond_i_i_i))|0);
   HEAP32[((((3664)|0))>>2)]=$325;
   HEAP32[((((3652)|0))>>2)]=$sub5_i_i_i;
   var $or_i_i_i=$sub5_i_i_i | 1;
   var $add_ptr4_sum_i_i_i=((($cond_i_i_i)+(4))|0);
   var $head_i_i_i=(($tbase_292_i+$add_ptr4_sum_i_i_i)|0);
   var $326=$head_i_i_i;
   HEAP32[(($326)>>2)]=$or_i_i_i;
   var $add_ptr6_sum_i_i_i=((($tsize_291_i)-(36))|0);
   var $head7_i_i_i=(($tbase_292_i+$add_ptr6_sum_i_i_i)|0);
   var $327=$head7_i_i_i;
   HEAP32[(($327)>>2)]=40;
   var $328=HEAP32[((((3624)|0))>>2)];
   HEAP32[((((3668)|0))>>2)]=$328;
   var $head_i19_i=(($cond13_i_i+4)|0);
   var $329=$head_i19_i;
   HEAP32[(($329)>>2)]=27;
   assert(16 % 1 === 0);HEAP32[(($add_ptr14_i_i)>>2)]=HEAP32[(((((4088)|0)))>>2)];HEAP32[((($add_ptr14_i_i)+(4))>>2)]=HEAP32[((((((4088)|0)))+(4))>>2)];HEAP32[((($add_ptr14_i_i)+(8))>>2)]=HEAP32[((((((4088)|0)))+(8))>>2)];HEAP32[((($add_ptr14_i_i)+(12))>>2)]=HEAP32[((((((4088)|0)))+(12))>>2)];
   HEAP32[((((4088)|0))>>2)]=$tbase_292_i;
   HEAP32[((((4092)|0))>>2)]=$tsize_291_i;
   HEAP32[((((4100)|0))>>2)]=0;
   HEAP32[((((4096)|0))>>2)]=$322;
   var $add_ptr2414_i_i=(($cond13_i_i+28)|0);
   var $330=$add_ptr2414_i_i;
   HEAP32[(($330)>>2)]=7;
   var $331=(($cond13_i_i+32)|0);
   var $cmp2715_i_i=(($331)>>>(0)) < (($add_ptr_i_i_i)>>>(0));
   if ($cmp2715_i_i) { var $add_ptr2416_i_i = $330;label = 313; break; } else { label = 314; break; }
  case 313: 
   var $add_ptr2416_i_i;
   var $332=(($add_ptr2416_i_i+4)|0);
   HEAP32[(($332)>>2)]=7;
   var $333=(($add_ptr2416_i_i+8)|0);
   var $334=$333;
   var $cmp27_i_i=(($334)>>>(0)) < (($add_ptr_i_i_i)>>>(0));
   if ($cmp27_i_i) { var $add_ptr2416_i_i = $332;label = 313; break; } else { label = 314; break; }
  case 314: 
   var $cmp28_i_i=(($cond13_i_i)|(0))==(($316)|(0));
   if ($cmp28_i_i) { label = 338; break; } else { label = 315; break; }
  case 315: 
   var $sub_ptr_lhs_cast_i_i=$cond13_i_i;
   var $sub_ptr_rhs_cast_i_i=$189;
   var $sub_ptr_sub_i_i=((($sub_ptr_lhs_cast_i_i)-($sub_ptr_rhs_cast_i_i))|0);
   var $add_ptr30_i_i=(($316+$sub_ptr_sub_i_i)|0);
   var $add_ptr30_sum_i_i=((($sub_ptr_sub_i_i)+(4))|0);
   var $head31_i_i=(($316+$add_ptr30_sum_i_i)|0);
   var $335=$head31_i_i;
   var $336=HEAP32[(($335)>>2)];
   var $and32_i_i=$336 & -2;
   HEAP32[(($335)>>2)]=$and32_i_i;
   var $or33_i_i=$sub_ptr_sub_i_i | 1;
   var $head34_i_i=(($189+4)|0);
   HEAP32[(($head34_i_i)>>2)]=$or33_i_i;
   var $prev_foot_i_i=$add_ptr30_i_i;
   HEAP32[(($prev_foot_i_i)>>2)]=$sub_ptr_sub_i_i;
   var $shr_i_i=$sub_ptr_sub_i_i >>> 3;
   var $cmp36_i_i=(($sub_ptr_sub_i_i)>>>(0)) < 256;
   if ($cmp36_i_i) { label = 316; break; } else { label = 321; break; }
  case 316: 
   var $shl_i21_i=$shr_i_i << 1;
   var $arrayidx_i22_i=((3680+($shl_i21_i<<2))|0);
   var $337=$arrayidx_i22_i;
   var $338=HEAP32[((((3640)|0))>>2)];
   var $shl39_i_i=1 << $shr_i_i;
   var $and40_i_i=$338 & $shl39_i_i;
   var $tobool_i_i=(($and40_i_i)|(0))==0;
   if ($tobool_i_i) { label = 317; break; } else { label = 318; break; }
  case 317: 
   var $or44_i_i=$338 | $shl39_i_i;
   HEAP32[((((3640)|0))>>2)]=$or44_i_i;
   var $arrayidx_sum_pre_i_i=((($shl_i21_i)+(2))|0);
   var $_pre_i_i=((3680+($arrayidx_sum_pre_i_i<<2))|0);
   var $F_0_i_i = $337;var $_pre_phi_i_i = $_pre_i_i;label = 320; break;
  case 318: 
   var $arrayidx_sum10_i_i=((($shl_i21_i)+(2))|0);
   var $339=((3680+($arrayidx_sum10_i_i<<2))|0);
   var $340=HEAP32[(($339)>>2)];
   var $341=$340;
   var $342=HEAP32[((((3656)|0))>>2)];
   var $cmp46_i_i=(($341)>>>(0)) < (($342)>>>(0));
   if ($cmp46_i_i) { label = 319; break; } else { var $F_0_i_i = $340;var $_pre_phi_i_i = $339;label = 320; break; }
  case 319: 
   _abort();
   throw "Reached an unreachable!";
  case 320: 
   var $_pre_phi_i_i;
   var $F_0_i_i;
   HEAP32[(($_pre_phi_i_i)>>2)]=$189;
   var $bk_i_i=(($F_0_i_i+12)|0);
   HEAP32[(($bk_i_i)>>2)]=$189;
   var $fd54_i_i=(($189+8)|0);
   HEAP32[(($fd54_i_i)>>2)]=$F_0_i_i;
   var $bk55_i_i=(($189+12)|0);
   HEAP32[(($bk55_i_i)>>2)]=$337;
   label = 338; break;
  case 321: 
   var $343=$189;
   var $shr58_i_i=$sub_ptr_sub_i_i >>> 8;
   var $cmp59_i_i=(($shr58_i_i)|(0))==0;
   if ($cmp59_i_i) { var $I57_0_i_i = 0;label = 324; break; } else { label = 322; break; }
  case 322: 
   var $cmp63_i_i=(($sub_ptr_sub_i_i)>>>(0)) > 16777215;
   if ($cmp63_i_i) { var $I57_0_i_i = 31;label = 324; break; } else { label = 323; break; }
  case 323: 
   var $sub67_i_i=((($shr58_i_i)+(1048320))|0);
   var $shr68_i_i=$sub67_i_i >>> 16;
   var $and69_i_i=$shr68_i_i & 8;
   var $shl70_i_i=$shr58_i_i << $and69_i_i;
   var $sub71_i_i=((($shl70_i_i)+(520192))|0);
   var $shr72_i_i=$sub71_i_i >>> 16;
   var $and73_i_i=$shr72_i_i & 4;
   var $add74_i_i=$and73_i_i | $and69_i_i;
   var $shl75_i_i=$shl70_i_i << $and73_i_i;
   var $sub76_i_i=((($shl75_i_i)+(245760))|0);
   var $shr77_i_i=$sub76_i_i >>> 16;
   var $and78_i_i=$shr77_i_i & 2;
   var $add79_i_i=$add74_i_i | $and78_i_i;
   var $sub80_i_i=(((14)-($add79_i_i))|0);
   var $shl81_i_i=$shl75_i_i << $and78_i_i;
   var $shr82_i_i=$shl81_i_i >>> 15;
   var $add83_i_i=((($sub80_i_i)+($shr82_i_i))|0);
   var $shl84_i_i=$add83_i_i << 1;
   var $add85_i_i=((($add83_i_i)+(7))|0);
   var $shr86_i_i=$sub_ptr_sub_i_i >>> (($add85_i_i)>>>(0));
   var $and87_i_i=$shr86_i_i & 1;
   var $add88_i_i=$and87_i_i | $shl84_i_i;
   var $I57_0_i_i = $add88_i_i;label = 324; break;
  case 324: 
   var $I57_0_i_i;
   var $arrayidx91_i_i=((3944+($I57_0_i_i<<2))|0);
   var $index_i_i=(($189+28)|0);
   var $I57_0_c_i_i=$I57_0_i_i;
   HEAP32[(($index_i_i)>>2)]=$I57_0_c_i_i;
   var $arrayidx92_i_i=(($189+20)|0);
   HEAP32[(($arrayidx92_i_i)>>2)]=0;
   var $344=(($189+16)|0);
   HEAP32[(($344)>>2)]=0;
   var $345=HEAP32[((((3644)|0))>>2)];
   var $shl95_i_i=1 << $I57_0_i_i;
   var $and96_i_i=$345 & $shl95_i_i;
   var $tobool97_i_i=(($and96_i_i)|(0))==0;
   if ($tobool97_i_i) { label = 325; break; } else { label = 326; break; }
  case 325: 
   var $or101_i_i=$345 | $shl95_i_i;
   HEAP32[((((3644)|0))>>2)]=$or101_i_i;
   HEAP32[(($arrayidx91_i_i)>>2)]=$343;
   var $parent_i_i=(($189+24)|0);
   var $_c_i_i=$arrayidx91_i_i;
   HEAP32[(($parent_i_i)>>2)]=$_c_i_i;
   var $bk102_i_i=(($189+12)|0);
   HEAP32[(($bk102_i_i)>>2)]=$189;
   var $fd103_i_i=(($189+8)|0);
   HEAP32[(($fd103_i_i)>>2)]=$189;
   label = 338; break;
  case 326: 
   var $346=HEAP32[(($arrayidx91_i_i)>>2)];
   var $cmp106_i_i=(($I57_0_i_i)|(0))==31;
   if ($cmp106_i_i) { var $cond115_i_i = 0;label = 328; break; } else { label = 327; break; }
  case 327: 
   var $shr110_i_i=$I57_0_i_i >>> 1;
   var $sub113_i_i=(((25)-($shr110_i_i))|0);
   var $cond115_i_i = $sub113_i_i;label = 328; break;
  case 328: 
   var $cond115_i_i;
   var $shl116_i_i=$sub_ptr_sub_i_i << $cond115_i_i;
   var $K105_0_i_i = $shl116_i_i;var $T_0_i_i = $346;label = 329; break;
  case 329: 
   var $T_0_i_i;
   var $K105_0_i_i;
   var $head118_i_i=(($T_0_i_i+4)|0);
   var $347=HEAP32[(($head118_i_i)>>2)];
   var $and119_i_i=$347 & -8;
   var $cmp120_i_i=(($and119_i_i)|(0))==(($sub_ptr_sub_i_i)|(0));
   if ($cmp120_i_i) { label = 334; break; } else { label = 330; break; }
  case 330: 
   var $shr123_i_i=$K105_0_i_i >>> 31;
   var $arrayidx126_i_i=(($T_0_i_i+16+($shr123_i_i<<2))|0);
   var $348=HEAP32[(($arrayidx126_i_i)>>2)];
   var $cmp128_i_i=(($348)|(0))==0;
   var $shl127_i_i=$K105_0_i_i << 1;
   if ($cmp128_i_i) { label = 331; break; } else { var $K105_0_i_i = $shl127_i_i;var $T_0_i_i = $348;label = 329; break; }
  case 331: 
   var $349=$arrayidx126_i_i;
   var $350=HEAP32[((((3656)|0))>>2)];
   var $cmp133_i_i=(($349)>>>(0)) < (($350)>>>(0));
   if ($cmp133_i_i) { label = 333; break; } else { label = 332; break; }
  case 332: 
   HEAP32[(($arrayidx126_i_i)>>2)]=$343;
   var $parent138_i_i=(($189+24)|0);
   var $T_0_c7_i_i=$T_0_i_i;
   HEAP32[(($parent138_i_i)>>2)]=$T_0_c7_i_i;
   var $bk139_i_i=(($189+12)|0);
   HEAP32[(($bk139_i_i)>>2)]=$189;
   var $fd140_i_i=(($189+8)|0);
   HEAP32[(($fd140_i_i)>>2)]=$189;
   label = 338; break;
  case 333: 
   _abort();
   throw "Reached an unreachable!";
  case 334: 
   var $fd145_i_i=(($T_0_i_i+8)|0);
   var $351=HEAP32[(($fd145_i_i)>>2)];
   var $352=$T_0_i_i;
   var $353=HEAP32[((((3656)|0))>>2)];
   var $cmp147_i_i=(($352)>>>(0)) < (($353)>>>(0));
   if ($cmp147_i_i) { label = 337; break; } else { label = 335; break; }
  case 335: 
   var $354=$351;
   var $cmp150_i_i=(($354)>>>(0)) < (($353)>>>(0));
   if ($cmp150_i_i) { label = 337; break; } else { label = 336; break; }
  case 336: 
   var $bk155_i_i=(($351+12)|0);
   HEAP32[(($bk155_i_i)>>2)]=$343;
   HEAP32[(($fd145_i_i)>>2)]=$343;
   var $fd157_i_i=(($189+8)|0);
   var $_c6_i_i=$351;
   HEAP32[(($fd157_i_i)>>2)]=$_c6_i_i;
   var $bk158_i_i=(($189+12)|0);
   var $T_0_c_i_i=$T_0_i_i;
   HEAP32[(($bk158_i_i)>>2)]=$T_0_c_i_i;
   var $parent159_i_i=(($189+24)|0);
   HEAP32[(($parent159_i_i)>>2)]=0;
   label = 338; break;
  case 337: 
   _abort();
   throw "Reached an unreachable!";
  case 338: 
   var $355=HEAP32[((((3652)|0))>>2)];
   var $cmp250_i=(($355)>>>(0)) > (($nb_0)>>>(0));
   if ($cmp250_i) { label = 339; break; } else { label = 340; break; }
  case 339: 
   var $sub253_i=((($355)-($nb_0))|0);
   HEAP32[((((3652)|0))>>2)]=$sub253_i;
   var $356=HEAP32[((((3664)|0))>>2)];
   var $357=$356;
   var $add_ptr255_i=(($357+$nb_0)|0);
   var $358=$add_ptr255_i;
   HEAP32[((((3664)|0))>>2)]=$358;
   var $or257_i=$sub253_i | 1;
   var $add_ptr255_sum_i=((($nb_0)+(4))|0);
   var $head258_i=(($357+$add_ptr255_sum_i)|0);
   var $359=$head258_i;
   HEAP32[(($359)>>2)]=$or257_i;
   var $or260_i=$nb_0 | 3;
   var $head261_i=(($356+4)|0);
   HEAP32[(($head261_i)>>2)]=$or260_i;
   var $add_ptr262_i=(($356+8)|0);
   var $360=$add_ptr262_i;
   var $mem_0 = $360;label = 341; break;
  case 340: 
   var $call265_i=___errno_location();
   HEAP32[(($call265_i)>>2)]=12;
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
   var $cmp=(($mem)|(0))==0;
   if ($cmp) { label = 140; break; } else { label = 2; break; }
  case 2: 
   var $add_ptr=((($mem)-(8))|0);
   var $0=$add_ptr;
   var $1=HEAP32[((((3656)|0))>>2)];
   var $cmp1=(($add_ptr)>>>(0)) < (($1)>>>(0));
   if ($cmp1) { label = 139; break; } else { label = 3; break; }
  case 3: 
   var $head=((($mem)-(4))|0);
   var $2=$head;
   var $3=HEAP32[(($2)>>2)];
   var $and=$3 & 3;
   var $cmp2=(($and)|(0))==1;
   if ($cmp2) { label = 139; break; } else { label = 4; break; }
  case 4: 
   var $and5=$3 & -8;
   var $add_ptr_sum=((($and5)-(8))|0);
   var $add_ptr6=(($mem+$add_ptr_sum)|0);
   var $4=$add_ptr6;
   var $and8=$3 & 1;
   var $tobool9=(($and8)|(0))==0;
   if ($tobool9) { label = 5; break; } else { var $p_0 = $0;var $psize_0 = $and5;label = 56; break; }
  case 5: 
   var $prev_foot=$add_ptr;
   var $5=HEAP32[(($prev_foot)>>2)];
   var $cmp13=(($and)|(0))==0;
   if ($cmp13) { label = 140; break; } else { label = 6; break; }
  case 6: 
   var $add_ptr_sum231=(((-8)-($5))|0);
   var $add_ptr16=(($mem+$add_ptr_sum231)|0);
   var $6=$add_ptr16;
   var $add17=((($5)+($and5))|0);
   var $cmp18=(($add_ptr16)>>>(0)) < (($1)>>>(0));
   if ($cmp18) { label = 139; break; } else { label = 7; break; }
  case 7: 
   var $7=HEAP32[((((3660)|0))>>2)];
   var $cmp22=(($6)|(0))==(($7)|(0));
   if ($cmp22) { label = 54; break; } else { label = 8; break; }
  case 8: 
   var $shr=$5 >>> 3;
   var $cmp25=(($5)>>>(0)) < 256;
   if ($cmp25) { label = 9; break; } else { label = 21; break; }
  case 9: 
   var $add_ptr16_sum268=((($add_ptr_sum231)+(8))|0);
   var $fd=(($mem+$add_ptr16_sum268)|0);
   var $8=$fd;
   var $9=HEAP32[(($8)>>2)];
   var $add_ptr16_sum269=((($add_ptr_sum231)+(12))|0);
   var $bk=(($mem+$add_ptr16_sum269)|0);
   var $10=$bk;
   var $11=HEAP32[(($10)>>2)];
   var $shl=$shr << 1;
   var $arrayidx=((3680+($shl<<2))|0);
   var $12=$arrayidx;
   var $cmp29=(($9)|(0))==(($12)|(0));
   if ($cmp29) { label = 12; break; } else { label = 10; break; }
  case 10: 
   var $13=$9;
   var $cmp31=(($13)>>>(0)) < (($1)>>>(0));
   if ($cmp31) { label = 20; break; } else { label = 11; break; }
  case 11: 
   var $bk34=(($9+12)|0);
   var $14=HEAP32[(($bk34)>>2)];
   var $cmp35=(($14)|(0))==(($6)|(0));
   if ($cmp35) { label = 12; break; } else { label = 20; break; }
  case 12: 
   var $cmp42=(($11)|(0))==(($9)|(0));
   if ($cmp42) { label = 13; break; } else { label = 14; break; }
  case 13: 
   var $shl45=1 << $shr;
   var $neg=$shl45 ^ -1;
   var $15=HEAP32[((((3640)|0))>>2)];
   var $and46=$15 & $neg;
   HEAP32[((((3640)|0))>>2)]=$and46;
   var $p_0 = $6;var $psize_0 = $add17;label = 56; break;
  case 14: 
   var $cmp50=(($11)|(0))==(($12)|(0));
   if ($cmp50) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $fd67_pre=(($11+8)|0);
   var $fd67_pre_phi = $fd67_pre;label = 18; break;
  case 16: 
   var $16=$11;
   var $cmp53=(($16)>>>(0)) < (($1)>>>(0));
   if ($cmp53) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $fd56=(($11+8)|0);
   var $17=HEAP32[(($fd56)>>2)];
   var $cmp57=(($17)|(0))==(($6)|(0));
   if ($cmp57) { var $fd67_pre_phi = $fd56;label = 18; break; } else { label = 19; break; }
  case 18: 
   var $fd67_pre_phi;
   var $bk66=(($9+12)|0);
   HEAP32[(($bk66)>>2)]=$11;
   HEAP32[(($fd67_pre_phi)>>2)]=$9;
   var $p_0 = $6;var $psize_0 = $add17;label = 56; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   _abort();
   throw "Reached an unreachable!";
  case 21: 
   var $18=$add_ptr16;
   var $add_ptr16_sum260=((($add_ptr_sum231)+(24))|0);
   var $parent=(($mem+$add_ptr16_sum260)|0);
   var $19=$parent;
   var $20=HEAP32[(($19)>>2)];
   var $add_ptr16_sum261=((($add_ptr_sum231)+(12))|0);
   var $bk73=(($mem+$add_ptr16_sum261)|0);
   var $21=$bk73;
   var $22=HEAP32[(($21)>>2)];
   var $cmp74=(($22)|(0))==(($18)|(0));
   if ($cmp74) { label = 27; break; } else { label = 22; break; }
  case 22: 
   var $add_ptr16_sum265=((($add_ptr_sum231)+(8))|0);
   var $fd78=(($mem+$add_ptr16_sum265)|0);
   var $23=$fd78;
   var $24=HEAP32[(($23)>>2)];
   var $25=$24;
   var $cmp80=(($25)>>>(0)) < (($1)>>>(0));
   if ($cmp80) { label = 26; break; } else { label = 23; break; }
  case 23: 
   var $bk82=(($24+12)|0);
   var $26=HEAP32[(($bk82)>>2)];
   var $cmp83=(($26)|(0))==(($18)|(0));
   if ($cmp83) { label = 24; break; } else { label = 26; break; }
  case 24: 
   var $fd86=(($22+8)|0);
   var $27=HEAP32[(($fd86)>>2)];
   var $cmp87=(($27)|(0))==(($18)|(0));
   if ($cmp87) { label = 25; break; } else { label = 26; break; }
  case 25: 
   HEAP32[(($bk82)>>2)]=$22;
   HEAP32[(($fd86)>>2)]=$24;
   var $R_1 = $22;label = 34; break;
  case 26: 
   _abort();
   throw "Reached an unreachable!";
  case 27: 
   var $child_sum=((($add_ptr_sum231)+(20))|0);
   var $arrayidx99=(($mem+$child_sum)|0);
   var $28=$arrayidx99;
   var $29=HEAP32[(($28)>>2)];
   var $cmp100=(($29)|(0))==0;
   if ($cmp100) { label = 28; break; } else { var $R_0 = $29;var $RP_0 = $28;label = 29; break; }
  case 28: 
   var $add_ptr16_sum262=((($add_ptr_sum231)+(16))|0);
   var $child=(($mem+$add_ptr16_sum262)|0);
   var $arrayidx103=$child;
   var $30=HEAP32[(($arrayidx103)>>2)];
   var $cmp104=(($30)|(0))==0;
   if ($cmp104) { var $R_1 = 0;label = 34; break; } else { var $R_0 = $30;var $RP_0 = $arrayidx103;label = 29; break; }
  case 29: 
   var $RP_0;
   var $R_0;
   var $arrayidx108=(($R_0+20)|0);
   var $31=HEAP32[(($arrayidx108)>>2)];
   var $cmp109=(($31)|(0))==0;
   if ($cmp109) { label = 30; break; } else { var $R_0 = $31;var $RP_0 = $arrayidx108;label = 29; break; }
  case 30: 
   var $arrayidx113=(($R_0+16)|0);
   var $32=HEAP32[(($arrayidx113)>>2)];
   var $cmp114=(($32)|(0))==0;
   if ($cmp114) { label = 31; break; } else { var $R_0 = $32;var $RP_0 = $arrayidx113;label = 29; break; }
  case 31: 
   var $33=$RP_0;
   var $cmp118=(($33)>>>(0)) < (($1)>>>(0));
   if ($cmp118) { label = 33; break; } else { label = 32; break; }
  case 32: 
   HEAP32[(($RP_0)>>2)]=0;
   var $R_1 = $R_0;label = 34; break;
  case 33: 
   _abort();
   throw "Reached an unreachable!";
  case 34: 
   var $R_1;
   var $cmp127=(($20)|(0))==0;
   if ($cmp127) { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; } else { label = 35; break; }
  case 35: 
   var $add_ptr16_sum263=((($add_ptr_sum231)+(28))|0);
   var $index=(($mem+$add_ptr16_sum263)|0);
   var $34=$index;
   var $35=HEAP32[(($34)>>2)];
   var $arrayidx130=((3944+($35<<2))|0);
   var $36=HEAP32[(($arrayidx130)>>2)];
   var $cmp131=(($18)|(0))==(($36)|(0));
   if ($cmp131) { label = 36; break; } else { label = 38; break; }
  case 36: 
   HEAP32[(($arrayidx130)>>2)]=$R_1;
   var $cond278=(($R_1)|(0))==0;
   if ($cond278) { label = 37; break; } else { label = 44; break; }
  case 37: 
   var $37=HEAP32[(($34)>>2)];
   var $shl138=1 << $37;
   var $neg139=$shl138 ^ -1;
   var $38=HEAP32[((((3644)|0))>>2)];
   var $and140=$38 & $neg139;
   HEAP32[((((3644)|0))>>2)]=$and140;
   var $p_0 = $6;var $psize_0 = $add17;label = 56; break;
  case 38: 
   var $39=$20;
   var $40=HEAP32[((((3656)|0))>>2)];
   var $cmp143=(($39)>>>(0)) < (($40)>>>(0));
   if ($cmp143) { label = 42; break; } else { label = 39; break; }
  case 39: 
   var $arrayidx149=(($20+16)|0);
   var $41=HEAP32[(($arrayidx149)>>2)];
   var $cmp150=(($41)|(0))==(($18)|(0));
   if ($cmp150) { label = 40; break; } else { label = 41; break; }
  case 40: 
   HEAP32[(($arrayidx149)>>2)]=$R_1;
   label = 43; break;
  case 41: 
   var $arrayidx157=(($20+20)|0);
   HEAP32[(($arrayidx157)>>2)]=$R_1;
   label = 43; break;
  case 42: 
   _abort();
   throw "Reached an unreachable!";
  case 43: 
   var $cmp162=(($R_1)|(0))==0;
   if ($cmp162) { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; } else { label = 44; break; }
  case 44: 
   var $42=$R_1;
   var $43=HEAP32[((((3656)|0))>>2)];
   var $cmp165=(($42)>>>(0)) < (($43)>>>(0));
   if ($cmp165) { label = 53; break; } else { label = 45; break; }
  case 45: 
   var $parent170=(($R_1+24)|0);
   HEAP32[(($parent170)>>2)]=$20;
   var $add_ptr16_sum264=((($add_ptr_sum231)+(16))|0);
   var $child171=(($mem+$add_ptr16_sum264)|0);
   var $arrayidx172=$child171;
   var $44=HEAP32[(($arrayidx172)>>2)];
   var $cmp173=(($44)|(0))==0;
   if ($cmp173) { label = 49; break; } else { label = 46; break; }
  case 46: 
   var $45=$44;
   var $46=HEAP32[((((3656)|0))>>2)];
   var $cmp176=(($45)>>>(0)) < (($46)>>>(0));
   if ($cmp176) { label = 48; break; } else { label = 47; break; }
  case 47: 
   var $arrayidx182=(($R_1+16)|0);
   HEAP32[(($arrayidx182)>>2)]=$44;
   var $parent183=(($44+24)|0);
   HEAP32[(($parent183)>>2)]=$R_1;
   label = 49; break;
  case 48: 
   _abort();
   throw "Reached an unreachable!";
  case 49: 
   var $child171_sum=((($add_ptr_sum231)+(20))|0);
   var $arrayidx188=(($mem+$child171_sum)|0);
   var $47=$arrayidx188;
   var $48=HEAP32[(($47)>>2)];
   var $cmp189=(($48)|(0))==0;
   if ($cmp189) { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; } else { label = 50; break; }
  case 50: 
   var $49=$48;
   var $50=HEAP32[((((3656)|0))>>2)];
   var $cmp192=(($49)>>>(0)) < (($50)>>>(0));
   if ($cmp192) { label = 52; break; } else { label = 51; break; }
  case 51: 
   var $arrayidx198=(($R_1+20)|0);
   HEAP32[(($arrayidx198)>>2)]=$48;
   var $parent199=(($48+24)|0);
   HEAP32[(($parent199)>>2)]=$R_1;
   var $p_0 = $6;var $psize_0 = $add17;label = 56; break;
  case 52: 
   _abort();
   throw "Reached an unreachable!";
  case 53: 
   _abort();
   throw "Reached an unreachable!";
  case 54: 
   var $add_ptr6_sum=((($and5)-(4))|0);
   var $head209=(($mem+$add_ptr6_sum)|0);
   var $51=$head209;
   var $52=HEAP32[(($51)>>2)];
   var $and210=$52 & 3;
   var $cmp211=(($and210)|(0))==3;
   if ($cmp211) { label = 55; break; } else { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; }
  case 55: 
   HEAP32[((((3648)|0))>>2)]=$add17;
   var $53=HEAP32[(($51)>>2)];
   var $and215=$53 & -2;
   HEAP32[(($51)>>2)]=$and215;
   var $or=$add17 | 1;
   var $add_ptr16_sum=((($add_ptr_sum231)+(4))|0);
   var $head216=(($mem+$add_ptr16_sum)|0);
   var $54=$head216;
   HEAP32[(($54)>>2)]=$or;
   var $prev_foot218=$add_ptr6;
   HEAP32[(($prev_foot218)>>2)]=$add17;
   label = 140; break;
  case 56: 
   var $psize_0;
   var $p_0;
   var $55=$p_0;
   var $cmp225=(($55)>>>(0)) < (($add_ptr6)>>>(0));
   if ($cmp225) { label = 57; break; } else { label = 139; break; }
  case 57: 
   var $add_ptr6_sum258=((($and5)-(4))|0);
   var $head228=(($mem+$add_ptr6_sum258)|0);
   var $56=$head228;
   var $57=HEAP32[(($56)>>2)];
   var $and229=$57 & 1;
   var $phitmp=(($and229)|(0))==0;
   if ($phitmp) { label = 139; break; } else { label = 58; break; }
  case 58: 
   var $and237=$57 & 2;
   var $tobool238=(($and237)|(0))==0;
   if ($tobool238) { label = 59; break; } else { label = 112; break; }
  case 59: 
   var $58=HEAP32[((((3664)|0))>>2)];
   var $cmp240=(($4)|(0))==(($58)|(0));
   if ($cmp240) { label = 60; break; } else { label = 62; break; }
  case 60: 
   var $59=HEAP32[((((3652)|0))>>2)];
   var $add243=((($59)+($psize_0))|0);
   HEAP32[((((3652)|0))>>2)]=$add243;
   HEAP32[((((3664)|0))>>2)]=$p_0;
   var $or244=$add243 | 1;
   var $head245=(($p_0+4)|0);
   HEAP32[(($head245)>>2)]=$or244;
   var $60=HEAP32[((((3660)|0))>>2)];
   var $cmp246=(($p_0)|(0))==(($60)|(0));
   if ($cmp246) { label = 61; break; } else { label = 140; break; }
  case 61: 
   HEAP32[((((3660)|0))>>2)]=0;
   HEAP32[((((3648)|0))>>2)]=0;
   label = 140; break;
  case 62: 
   var $61=HEAP32[((((3660)|0))>>2)];
   var $cmp251=(($4)|(0))==(($61)|(0));
   if ($cmp251) { label = 63; break; } else { label = 64; break; }
  case 63: 
   var $62=HEAP32[((((3648)|0))>>2)];
   var $add254=((($62)+($psize_0))|0);
   HEAP32[((((3648)|0))>>2)]=$add254;
   HEAP32[((((3660)|0))>>2)]=$p_0;
   var $or255=$add254 | 1;
   var $head256=(($p_0+4)|0);
   HEAP32[(($head256)>>2)]=$or255;
   var $add_ptr257=(($55+$add254)|0);
   var $prev_foot258=$add_ptr257;
   HEAP32[(($prev_foot258)>>2)]=$add254;
   label = 140; break;
  case 64: 
   var $and261=$57 & -8;
   var $add262=((($and261)+($psize_0))|0);
   var $shr263=$57 >>> 3;
   var $cmp264=(($57)>>>(0)) < 256;
   if ($cmp264) { label = 65; break; } else { label = 77; break; }
  case 65: 
   var $fd268=(($mem+$and5)|0);
   var $63=$fd268;
   var $64=HEAP32[(($63)>>2)];
   var $add_ptr6_sum252253=$and5 | 4;
   var $bk270=(($mem+$add_ptr6_sum252253)|0);
   var $65=$bk270;
   var $66=HEAP32[(($65)>>2)];
   var $shl273=$shr263 << 1;
   var $arrayidx274=((3680+($shl273<<2))|0);
   var $67=$arrayidx274;
   var $cmp275=(($64)|(0))==(($67)|(0));
   if ($cmp275) { label = 68; break; } else { label = 66; break; }
  case 66: 
   var $68=$64;
   var $69=HEAP32[((((3656)|0))>>2)];
   var $cmp278=(($68)>>>(0)) < (($69)>>>(0));
   if ($cmp278) { label = 76; break; } else { label = 67; break; }
  case 67: 
   var $bk281=(($64+12)|0);
   var $70=HEAP32[(($bk281)>>2)];
   var $cmp282=(($70)|(0))==(($4)|(0));
   if ($cmp282) { label = 68; break; } else { label = 76; break; }
  case 68: 
   var $cmp291=(($66)|(0))==(($64)|(0));
   if ($cmp291) { label = 69; break; } else { label = 70; break; }
  case 69: 
   var $shl294=1 << $shr263;
   var $neg295=$shl294 ^ -1;
   var $71=HEAP32[((((3640)|0))>>2)];
   var $and296=$71 & $neg295;
   HEAP32[((((3640)|0))>>2)]=$and296;
   label = 110; break;
  case 70: 
   var $cmp300=(($66)|(0))==(($67)|(0));
   if ($cmp300) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $fd317_pre=(($66+8)|0);
   var $fd317_pre_phi = $fd317_pre;label = 74; break;
  case 72: 
   var $72=$66;
   var $73=HEAP32[((((3656)|0))>>2)];
   var $cmp303=(($72)>>>(0)) < (($73)>>>(0));
   if ($cmp303) { label = 75; break; } else { label = 73; break; }
  case 73: 
   var $fd306=(($66+8)|0);
   var $74=HEAP32[(($fd306)>>2)];
   var $cmp307=(($74)|(0))==(($4)|(0));
   if ($cmp307) { var $fd317_pre_phi = $fd306;label = 74; break; } else { label = 75; break; }
  case 74: 
   var $fd317_pre_phi;
   var $bk316=(($64+12)|0);
   HEAP32[(($bk316)>>2)]=$66;
   HEAP32[(($fd317_pre_phi)>>2)]=$64;
   label = 110; break;
  case 75: 
   _abort();
   throw "Reached an unreachable!";
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $75=$add_ptr6;
   var $add_ptr6_sum233=((($and5)+(16))|0);
   var $parent326=(($mem+$add_ptr6_sum233)|0);
   var $76=$parent326;
   var $77=HEAP32[(($76)>>2)];
   var $add_ptr6_sum234235=$and5 | 4;
   var $bk328=(($mem+$add_ptr6_sum234235)|0);
   var $78=$bk328;
   var $79=HEAP32[(($78)>>2)];
   var $cmp329=(($79)|(0))==(($75)|(0));
   if ($cmp329) { label = 83; break; } else { label = 78; break; }
  case 78: 
   var $fd333=(($mem+$and5)|0);
   var $80=$fd333;
   var $81=HEAP32[(($80)>>2)];
   var $82=$81;
   var $83=HEAP32[((((3656)|0))>>2)];
   var $cmp335=(($82)>>>(0)) < (($83)>>>(0));
   if ($cmp335) { label = 82; break; } else { label = 79; break; }
  case 79: 
   var $bk338=(($81+12)|0);
   var $84=HEAP32[(($bk338)>>2)];
   var $cmp339=(($84)|(0))==(($75)|(0));
   if ($cmp339) { label = 80; break; } else { label = 82; break; }
  case 80: 
   var $fd342=(($79+8)|0);
   var $85=HEAP32[(($fd342)>>2)];
   var $cmp343=(($85)|(0))==(($75)|(0));
   if ($cmp343) { label = 81; break; } else { label = 82; break; }
  case 81: 
   HEAP32[(($bk338)>>2)]=$79;
   HEAP32[(($fd342)>>2)]=$81;
   var $R327_1 = $79;label = 90; break;
  case 82: 
   _abort();
   throw "Reached an unreachable!";
  case 83: 
   var $child356_sum=((($and5)+(12))|0);
   var $arrayidx357=(($mem+$child356_sum)|0);
   var $86=$arrayidx357;
   var $87=HEAP32[(($86)>>2)];
   var $cmp358=(($87)|(0))==0;
   if ($cmp358) { label = 84; break; } else { var $R327_0 = $87;var $RP355_0 = $86;label = 85; break; }
  case 84: 
   var $add_ptr6_sum236=((($and5)+(8))|0);
   var $child356=(($mem+$add_ptr6_sum236)|0);
   var $arrayidx362=$child356;
   var $88=HEAP32[(($arrayidx362)>>2)];
   var $cmp363=(($88)|(0))==0;
   if ($cmp363) { var $R327_1 = 0;label = 90; break; } else { var $R327_0 = $88;var $RP355_0 = $arrayidx362;label = 85; break; }
  case 85: 
   var $RP355_0;
   var $R327_0;
   var $arrayidx369=(($R327_0+20)|0);
   var $89=HEAP32[(($arrayidx369)>>2)];
   var $cmp370=(($89)|(0))==0;
   if ($cmp370) { label = 86; break; } else { var $R327_0 = $89;var $RP355_0 = $arrayidx369;label = 85; break; }
  case 86: 
   var $arrayidx374=(($R327_0+16)|0);
   var $90=HEAP32[(($arrayidx374)>>2)];
   var $cmp375=(($90)|(0))==0;
   if ($cmp375) { label = 87; break; } else { var $R327_0 = $90;var $RP355_0 = $arrayidx374;label = 85; break; }
  case 87: 
   var $91=$RP355_0;
   var $92=HEAP32[((((3656)|0))>>2)];
   var $cmp381=(($91)>>>(0)) < (($92)>>>(0));
   if ($cmp381) { label = 89; break; } else { label = 88; break; }
  case 88: 
   HEAP32[(($RP355_0)>>2)]=0;
   var $R327_1 = $R327_0;label = 90; break;
  case 89: 
   _abort();
   throw "Reached an unreachable!";
  case 90: 
   var $R327_1;
   var $cmp390=(($77)|(0))==0;
   if ($cmp390) { label = 110; break; } else { label = 91; break; }
  case 91: 
   var $add_ptr6_sum246=((($and5)+(20))|0);
   var $index394=(($mem+$add_ptr6_sum246)|0);
   var $93=$index394;
   var $94=HEAP32[(($93)>>2)];
   var $arrayidx395=((3944+($94<<2))|0);
   var $95=HEAP32[(($arrayidx395)>>2)];
   var $cmp396=(($75)|(0))==(($95)|(0));
   if ($cmp396) { label = 92; break; } else { label = 94; break; }
  case 92: 
   HEAP32[(($arrayidx395)>>2)]=$R327_1;
   var $cond279=(($R327_1)|(0))==0;
   if ($cond279) { label = 93; break; } else { label = 100; break; }
  case 93: 
   var $96=HEAP32[(($93)>>2)];
   var $shl403=1 << $96;
   var $neg404=$shl403 ^ -1;
   var $97=HEAP32[((((3644)|0))>>2)];
   var $and405=$97 & $neg404;
   HEAP32[((((3644)|0))>>2)]=$and405;
   label = 110; break;
  case 94: 
   var $98=$77;
   var $99=HEAP32[((((3656)|0))>>2)];
   var $cmp408=(($98)>>>(0)) < (($99)>>>(0));
   if ($cmp408) { label = 98; break; } else { label = 95; break; }
  case 95: 
   var $arrayidx414=(($77+16)|0);
   var $100=HEAP32[(($arrayidx414)>>2)];
   var $cmp415=(($100)|(0))==(($75)|(0));
   if ($cmp415) { label = 96; break; } else { label = 97; break; }
  case 96: 
   HEAP32[(($arrayidx414)>>2)]=$R327_1;
   label = 99; break;
  case 97: 
   var $arrayidx422=(($77+20)|0);
   HEAP32[(($arrayidx422)>>2)]=$R327_1;
   label = 99; break;
  case 98: 
   _abort();
   throw "Reached an unreachable!";
  case 99: 
   var $cmp427=(($R327_1)|(0))==0;
   if ($cmp427) { label = 110; break; } else { label = 100; break; }
  case 100: 
   var $101=$R327_1;
   var $102=HEAP32[((((3656)|0))>>2)];
   var $cmp430=(($101)>>>(0)) < (($102)>>>(0));
   if ($cmp430) { label = 109; break; } else { label = 101; break; }
  case 101: 
   var $parent437=(($R327_1+24)|0);
   HEAP32[(($parent437)>>2)]=$77;
   var $add_ptr6_sum247=((($and5)+(8))|0);
   var $child438=(($mem+$add_ptr6_sum247)|0);
   var $arrayidx439=$child438;
   var $103=HEAP32[(($arrayidx439)>>2)];
   var $cmp440=(($103)|(0))==0;
   if ($cmp440) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $104=$103;
   var $105=HEAP32[((((3656)|0))>>2)];
   var $cmp443=(($104)>>>(0)) < (($105)>>>(0));
   if ($cmp443) { label = 104; break; } else { label = 103; break; }
  case 103: 
   var $arrayidx449=(($R327_1+16)|0);
   HEAP32[(($arrayidx449)>>2)]=$103;
   var $parent450=(($103+24)|0);
   HEAP32[(($parent450)>>2)]=$R327_1;
   label = 105; break;
  case 104: 
   _abort();
   throw "Reached an unreachable!";
  case 105: 
   var $child438_sum=((($and5)+(12))|0);
   var $arrayidx455=(($mem+$child438_sum)|0);
   var $106=$arrayidx455;
   var $107=HEAP32[(($106)>>2)];
   var $cmp456=(($107)|(0))==0;
   if ($cmp456) { label = 110; break; } else { label = 106; break; }
  case 106: 
   var $108=$107;
   var $109=HEAP32[((((3656)|0))>>2)];
   var $cmp459=(($108)>>>(0)) < (($109)>>>(0));
   if ($cmp459) { label = 108; break; } else { label = 107; break; }
  case 107: 
   var $arrayidx465=(($R327_1+20)|0);
   HEAP32[(($arrayidx465)>>2)]=$107;
   var $parent466=(($107+24)|0);
   HEAP32[(($parent466)>>2)]=$R327_1;
   label = 110; break;
  case 108: 
   _abort();
   throw "Reached an unreachable!";
  case 109: 
   _abort();
   throw "Reached an unreachable!";
  case 110: 
   var $or475=$add262 | 1;
   var $head476=(($p_0+4)|0);
   HEAP32[(($head476)>>2)]=$or475;
   var $add_ptr477=(($55+$add262)|0);
   var $prev_foot478=$add_ptr477;
   HEAP32[(($prev_foot478)>>2)]=$add262;
   var $110=HEAP32[((((3660)|0))>>2)];
   var $cmp479=(($p_0)|(0))==(($110)|(0));
   if ($cmp479) { label = 111; break; } else { var $psize_1 = $add262;label = 113; break; }
  case 111: 
   HEAP32[((((3648)|0))>>2)]=$add262;
   label = 140; break;
  case 112: 
   var $and487=$57 & -2;
   HEAP32[(($56)>>2)]=$and487;
   var $or488=$psize_0 | 1;
   var $head489=(($p_0+4)|0);
   HEAP32[(($head489)>>2)]=$or488;
   var $add_ptr490=(($55+$psize_0)|0);
   var $prev_foot491=$add_ptr490;
   HEAP32[(($prev_foot491)>>2)]=$psize_0;
   var $psize_1 = $psize_0;label = 113; break;
  case 113: 
   var $psize_1;
   var $shr493=$psize_1 >>> 3;
   var $cmp494=(($psize_1)>>>(0)) < 256;
   if ($cmp494) { label = 114; break; } else { label = 119; break; }
  case 114: 
   var $shl500=$shr493 << 1;
   var $arrayidx501=((3680+($shl500<<2))|0);
   var $111=$arrayidx501;
   var $112=HEAP32[((((3640)|0))>>2)];
   var $shl503=1 << $shr493;
   var $and504=$112 & $shl503;
   var $tobool505=(($and504)|(0))==0;
   if ($tobool505) { label = 115; break; } else { label = 116; break; }
  case 115: 
   var $or508=$112 | $shl503;
   HEAP32[((((3640)|0))>>2)]=$or508;
   var $arrayidx501_sum_pre=((($shl500)+(2))|0);
   var $_pre=((3680+($arrayidx501_sum_pre<<2))|0);
   var $F502_0 = $111;var $_pre_phi = $_pre;label = 118; break;
  case 116: 
   var $arrayidx501_sum245=((($shl500)+(2))|0);
   var $113=((3680+($arrayidx501_sum245<<2))|0);
   var $114=HEAP32[(($113)>>2)];
   var $115=$114;
   var $116=HEAP32[((((3656)|0))>>2)];
   var $cmp511=(($115)>>>(0)) < (($116)>>>(0));
   if ($cmp511) { label = 117; break; } else { var $F502_0 = $114;var $_pre_phi = $113;label = 118; break; }
  case 117: 
   _abort();
   throw "Reached an unreachable!";
  case 118: 
   var $_pre_phi;
   var $F502_0;
   HEAP32[(($_pre_phi)>>2)]=$p_0;
   var $bk521=(($F502_0+12)|0);
   HEAP32[(($bk521)>>2)]=$p_0;
   var $fd522=(($p_0+8)|0);
   HEAP32[(($fd522)>>2)]=$F502_0;
   var $bk523=(($p_0+12)|0);
   HEAP32[(($bk523)>>2)]=$111;
   label = 140; break;
  case 119: 
   var $117=$p_0;
   var $shr527=$psize_1 >>> 8;
   var $cmp528=(($shr527)|(0))==0;
   if ($cmp528) { var $I526_0 = 0;label = 122; break; } else { label = 120; break; }
  case 120: 
   var $cmp532=(($psize_1)>>>(0)) > 16777215;
   if ($cmp532) { var $I526_0 = 31;label = 122; break; } else { label = 121; break; }
  case 121: 
   var $sub=((($shr527)+(1048320))|0);
   var $shr536=$sub >>> 16;
   var $and537=$shr536 & 8;
   var $shl538=$shr527 << $and537;
   var $sub539=((($shl538)+(520192))|0);
   var $shr540=$sub539 >>> 16;
   var $and541=$shr540 & 4;
   var $add542=$and541 | $and537;
   var $shl543=$shl538 << $and541;
   var $sub544=((($shl543)+(245760))|0);
   var $shr545=$sub544 >>> 16;
   var $and546=$shr545 & 2;
   var $add547=$add542 | $and546;
   var $sub548=(((14)-($add547))|0);
   var $shl549=$shl543 << $and546;
   var $shr550=$shl549 >>> 15;
   var $add551=((($sub548)+($shr550))|0);
   var $shl552=$add551 << 1;
   var $add553=((($add551)+(7))|0);
   var $shr554=$psize_1 >>> (($add553)>>>(0));
   var $and555=$shr554 & 1;
   var $add556=$and555 | $shl552;
   var $I526_0 = $add556;label = 122; break;
  case 122: 
   var $I526_0;
   var $arrayidx559=((3944+($I526_0<<2))|0);
   var $index560=(($p_0+28)|0);
   var $I526_0_c=$I526_0;
   HEAP32[(($index560)>>2)]=$I526_0_c;
   var $arrayidx562=(($p_0+20)|0);
   HEAP32[(($arrayidx562)>>2)]=0;
   var $118=(($p_0+16)|0);
   HEAP32[(($118)>>2)]=0;
   var $119=HEAP32[((((3644)|0))>>2)];
   var $shl565=1 << $I526_0;
   var $and566=$119 & $shl565;
   var $tobool567=(($and566)|(0))==0;
   if ($tobool567) { label = 123; break; } else { label = 124; break; }
  case 123: 
   var $or570=$119 | $shl565;
   HEAP32[((((3644)|0))>>2)]=$or570;
   HEAP32[(($arrayidx559)>>2)]=$117;
   var $parent571=(($p_0+24)|0);
   var $_c=$arrayidx559;
   HEAP32[(($parent571)>>2)]=$_c;
   var $bk572=(($p_0+12)|0);
   HEAP32[(($bk572)>>2)]=$p_0;
   var $fd573=(($p_0+8)|0);
   HEAP32[(($fd573)>>2)]=$p_0;
   label = 136; break;
  case 124: 
   var $120=HEAP32[(($arrayidx559)>>2)];
   var $cmp576=(($I526_0)|(0))==31;
   if ($cmp576) { var $cond = 0;label = 126; break; } else { label = 125; break; }
  case 125: 
   var $shr578=$I526_0 >>> 1;
   var $sub581=(((25)-($shr578))|0);
   var $cond = $sub581;label = 126; break;
  case 126: 
   var $cond;
   var $shl582=$psize_1 << $cond;
   var $K575_0 = $shl582;var $T_0 = $120;label = 127; break;
  case 127: 
   var $T_0;
   var $K575_0;
   var $head583=(($T_0+4)|0);
   var $121=HEAP32[(($head583)>>2)];
   var $and584=$121 & -8;
   var $cmp585=(($and584)|(0))==(($psize_1)|(0));
   if ($cmp585) { label = 132; break; } else { label = 128; break; }
  case 128: 
   var $shr588=$K575_0 >>> 31;
   var $arrayidx591=(($T_0+16+($shr588<<2))|0);
   var $122=HEAP32[(($arrayidx591)>>2)];
   var $cmp593=(($122)|(0))==0;
   var $shl592=$K575_0 << 1;
   if ($cmp593) { label = 129; break; } else { var $K575_0 = $shl592;var $T_0 = $122;label = 127; break; }
  case 129: 
   var $123=$arrayidx591;
   var $124=HEAP32[((((3656)|0))>>2)];
   var $cmp597=(($123)>>>(0)) < (($124)>>>(0));
   if ($cmp597) { label = 131; break; } else { label = 130; break; }
  case 130: 
   HEAP32[(($arrayidx591)>>2)]=$117;
   var $parent602=(($p_0+24)|0);
   var $T_0_c242=$T_0;
   HEAP32[(($parent602)>>2)]=$T_0_c242;
   var $bk603=(($p_0+12)|0);
   HEAP32[(($bk603)>>2)]=$p_0;
   var $fd604=(($p_0+8)|0);
   HEAP32[(($fd604)>>2)]=$p_0;
   label = 136; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   var $fd609=(($T_0+8)|0);
   var $125=HEAP32[(($fd609)>>2)];
   var $126=$T_0;
   var $127=HEAP32[((((3656)|0))>>2)];
   var $cmp610=(($126)>>>(0)) < (($127)>>>(0));
   if ($cmp610) { label = 135; break; } else { label = 133; break; }
  case 133: 
   var $128=$125;
   var $cmp613=(($128)>>>(0)) < (($127)>>>(0));
   if ($cmp613) { label = 135; break; } else { label = 134; break; }
  case 134: 
   var $bk620=(($125+12)|0);
   HEAP32[(($bk620)>>2)]=$117;
   HEAP32[(($fd609)>>2)]=$117;
   var $fd622=(($p_0+8)|0);
   var $_c241=$125;
   HEAP32[(($fd622)>>2)]=$_c241;
   var $bk623=(($p_0+12)|0);
   var $T_0_c=$T_0;
   HEAP32[(($bk623)>>2)]=$T_0_c;
   var $parent624=(($p_0+24)|0);
   HEAP32[(($parent624)>>2)]=0;
   label = 136; break;
  case 135: 
   _abort();
   throw "Reached an unreachable!";
  case 136: 
   var $129=HEAP32[((((3672)|0))>>2)];
   var $dec=((($129)-(1))|0);
   HEAP32[((((3672)|0))>>2)]=$dec;
   var $cmp628=(($dec)|(0))==0;
   if ($cmp628) { var $sp_0_in_i = ((4096)|0);label = 137; break; } else { label = 140; break; }
  case 137: 
   var $sp_0_in_i;
   var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
   var $cmp_i=(($sp_0_i)|(0))==0;
   var $next4_i=(($sp_0_i+8)|0);
   if ($cmp_i) { label = 138; break; } else { var $sp_0_in_i = $next4_i;label = 137; break; }
  case 138: 
   HEAP32[((((3672)|0))>>2)]=-1;
   label = 140; break;
  case 139: 
   _abort();
   throw "Reached an unreachable!";
  case 140: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
Module["_free"] = _free;
// EMSCRIPTEN_END_FUNCS
// EMSCRIPTEN_END_FUNCS
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
//@ sourceMappingURL=hello_world.js.map