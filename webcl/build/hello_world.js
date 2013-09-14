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
STATICTOP = STATIC_BASE + 4056;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
/* memory initializer */ allocate([24,0,0,0,248,255,255,255,24,0,0,0,8,0,0,0,252,255,255,255,20,0,0,0,0,0,0,0,20,0,0,0,132,16,0,0,0,0,0,0,12,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,132,16,0,0,0,0,0,0,12,32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,17,0,0,65,17,0,0,1,0,0,0,0,0,0,0,80,17,0,0,81,17,0,0,82,17,0,0,83,17,0,0,84,17,0,0,0,0,0,0,96,17,0,0,97,17,0,0,98,17,0,0,99,17,0,0,100,17,0,0,101,17,0,0,102,17,0,0,0,0,0,0,129,17,0,0,130,17,0,0,131,17,0,0,0,0,0,0,0,17,0,0,1,17,0,0,2,17,0,0,3,17,0,0,4,17,0,0,5,17,0,0,5,17,0,0,7,17,0,0,8,17,0,0,0,0,0,0,181,17,0,0,176,17,0,0,177,17,0,0,178,17,0,0,179,17,0,0,180,17,0,0,144,17,0,0,145,17,0,0,146,17,0,0,147,17,0,0,148,17,0,0,149,17,0,0,0,16,0,0,1,16,0,0,2,16,0,0,3,16,0,0,4,16,0,0,5,16,0,0,6,16,0,0,7,16,0,0,8,16,0,0,9,16,0,0,10,16,0,0,11,16,0,0,12,16,0,0,13,16,0,0,14,16,0,0,15,16,0,0,16,16,0,0,17,16,0,0,18,16,0,0,19,16,0,0,20,16,0,0,21,16,0,0,22,16,0,0,23,16,0,0,24,16,0,0,25,16,0,0,26,16,0,0,27,16,0,0,28,16,0,0,29,16,0,0,30,16,0,0,31,16,0,0,32,16,0,0,33,16,0,0,34,16,0,0,35,16,0,0,36,16,0,0,37,16,0,0,38,16,0,0,39,16,0,0,40,16,0,0,41,16,0,0,42,16,0,0,43,16,0,0,44,16,0,0,45,16,0,0,46,16,0,0,47,16,0,0,48,16,0,0,49,16,0,0,50,16,0,0,52,16,0,0,53,16,0,0,54,16,0,0,55,16,0,0,56,16,0,0,57,16,0,0,58,16,0,0,59,16,0,0,60,16,0,0,61,16,0,0,62,16,0,0,63,16,0,0,64,16,0,0,65,16,0,0,66,16,0,0,67,16,0,0,68,16,0,0,69,16,0,0,70,16,0,0,71,16,0,0,72,16,0,0,73,16,0,0,74,16,0,0,75,16,0,0,0,0,0,0,16,17,0,0,17,17,0,0,18,17,0,0,18,17,0,0,20,17,0,0,21,17,0,0,22,17,0,0,0,0,0,0,128,16,0,0,131,16,0,0,129,16,0,0,130,16,0,0,132,16,0,0,0,0,0,0,144,16,0,0,145,16,0,0,146,16,0,0,147,16,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,48,17,0,0,49,17,0,0,50,17,0,0,51,17,0,0,52,17,0,0,0,0,0,0,67,80,85,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,75,101,114,110,101,108,73,110,102,111,10,0,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,75,101,114,110,101,108,87,111,114,107,71,114,111,117,112,73,110,102,111,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,83,101,116,75,101,114,110,101,108,65,114,103,10,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,75,101,114,110,101,108,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,32,45,32,37,100,10,0,0,0,0,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,0,0,71,80,85,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,75,101,114,110,101,108,115,73,110,80,114,111,103,114,97,109,10,0,0,0,0,0,0,0,115,113,117,97,114,101,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,75,101,114,110,101,108,10,0,10,84,69,83,84,32,58,32,99,108,71,101,116,80,114,111,103,114,97,109,73,110,102,111,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,80,114,111,103,114,97,109,66,117,105,108,100,73,110,102,111,10,0,0,37,100,41,32,37,100,32,58,32,37,100,32,58,32,37,100,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,32,58,32,37,115,10,0,0,0,0,0,0,0,45,99,108,45,115,116,100,61,0,0,0,0,0,0,0,0,45,87,101,114,114,111,114,0,80,97,114,97,109,101,116,101,114,32,100,101,116,101,99,116,32,37,115,32,100,101,118,105,99,101,10,0,0,0,0,0,45,87,0,0,0,0,0,0,45,99,108,45,102,97,115,116,45,114,101,108,97,120,101,100,45,109,97,116,104,0,0,0,45,99,108,45,102,105,110,105,116,101,45,109,97,116,104,45,111,110,108,121,0,0,0,0,45,99,108,45,117,110,115,97,102,101,45,109,97,116,104,45,111,112,116,105,109,105,122,97,116,105,111,110,115,0,0,0,45,99,108,45,110,111,45,115,105,103,110,101,100,45,122,101,114,111,115,0,0,0,0,0,45,99,108,45,109,97,100,45,101,110,97,98,108,101,0,0,45,99,108,45,100,101,110,111,114,109,115,45,97,114,101,45,122,101,114,111,0,0,0,0,45,99,108,45,115,105,110,103,108,101,45,112,114,101,99,105,115,105,111,110,45,99,111,110,115,116,97,110,116,0,0,0,45,99,108,45,111,112,116,45,100,105,115,97,98,108,101,0,45,68,32,110,97,109,101,61,100,101,102,105,110,105,116,105,111,110,0,0,0,0,0,0,103,112,117,0,0,0,0,0,45,68,32,110,97,109,101,0,10,84,69,83,84,32,58,32,99,108,66,117,105,108,100,80,114,111,103,114,97,109,10,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,80,114,111,103,114,97,109,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,80,114,111,103,114,97,109,87,105,116,104,83,111,117,114,99,101,10,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,83,97,109,112,108,101,114,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,83,97,109,112,108,101,114,73,110,102,111,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,45,32,37,100,32,40,37,100,120,37,100,120,37,100,41,10,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,83,97,109,112,108,101,114,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,40,37,100,120,37,100,41,10,0,0,0,0,0,0,0,99,112,117,0,0,0,0,0,10,37,100,41,32,37,100,32,58,32,37,100,10,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,83,117,112,112,111,114,116,101,100,73,109,97,103,101,70,111,114,109,97,116,115,10,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,77,101,109,79,98,106,101,99,116,10,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,73,109,97,103,101,73,110,102,111,10,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,77,101,109,79,98,106,101,99,116,73,110,102,111,10,0,0,0,0,0,37,100,41,32,37,108,108,100,32,58,32,37,100,32,45,32,37,100,32,40,37,100,120,37,100,41,10,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,73,109,97,103,101,50,68,10,0,0,0,0,0,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,0,37,100,41,32,37,100,32,58,32,112,102,110,95,110,111,116,105,102,121,32,99,97,108,108,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,83,117,98,66,117,102,102,101,114,10,0,0,0,0,0,0,37,100,41,32,37,108,108,100,32,58,32,37,100,32,45,32,37,100,10,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,66,117,102,102,101,114,10,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,67,111,109,109,97,110,100,81,117,101,117,101,10,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,67,111,109,109,97,110,100,81,117,101,117,101,73,110,102,111,10,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,67,111,109,109,97,110,100,81,117,101,117,101,10,0,0,0,10,84,69,83,84,32,58,32,99,108,82,101,108,101,97,115,101,67,111,110,116,101,120,116,10,0,0,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,67,111,110,116,101,120,116,73,110,102,111,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,108,108,117,32,61,62,32,37,100,10,0,0,0,0,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,10,0,0,0,0,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,70,114,111,109,84,121,112,101,32,116,121,112,101,32,58,32,37,108,108,117,10,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,70,114,111,109,84,121,112,101,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,10,0,0,0,0,10,84,69,83,84,32,58,32,99,108,67,114,101,97,116,101,67,111,110,116,101,120,116,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,32,45,32,37,100,32,61,62,32,37,108,108,117,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,32,45,32,37,100,32,61,62,32,37,100,44,32,37,100,32,44,32,37,100,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,58,32,37,100,32,45,32,37,100,32,61,62,32,37,115,10,0,37,100,41,32,37,100,32,58,32,37,100,32,45,32,37,100,32,61,62,32,37,100,10,0,10,84,69,83,84,32,58,32,99,108,71,101,116,68,101,118,105,99,101,73,110,102,111,10,0,0,0,0,0,0,0,0,37,100,41,32,37,100,32,45,32,37,100,32,45,32,37,100,32,45,32,37,100,10,0,0,37,115,10,0,0,0,0,0,99,108,71,101,116,68,101,118,105,99,101,73,68,115,32,116,121,112,101,32,58,32,37,108,108,117,10,0,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,68,101,118,105,99,101,73,68,115,10,0,37,100,41,32,37,100,32,45,32,37,115,32,45,32,37,100,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,45,32,37,115,10,0,0,0,0,10,84,69,83,84,32,58,32,99,108,71,101,116,80,108,97,116,102,111,114,109,73,110,102,111,10,0,0,0,0,0,0,37,100,41,32,37,100,32,45,32,37,100,32,45,32,37,100,10,0,0,0,0,0,0,0,37,100,41,32,37,100,32,45,32,37,100,10,0,0,0,0,37,100,41,32,37,100,10,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,0,0,0,0,0,0,0,84,69,83,84,32,58,32,99,108,71,101,116,80,108,97,116,102,111,114,109,73,68,115,10,0,0,0,0,0,0,0,0,10,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,10,0,0,0,10,95,95,107,101,114,110,101,108,32,118,111,105,100,32,115,113,117,97,114,101,40,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,95,95,103,108,111,98,97,108,32,102,108,111,97,116,42,32,105,110,112,117,116,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,95,95,103,108,111,98,97,108,32,102,108,111,97,116,42,32,111,117,116,112,117,116,44,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,99,111,110,115,116,32,117,110,115,105,103,110,101,100,32,105,110,116,32,99,111,117,110,116,41,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,123,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,105,110,116,32,105,32,61,32,103,101,116,95,103,108,111,98,97,108,95,105,100,40,48,41,59,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,105,102,40,105,32,60,32,99,111,117,110,116,41,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,32,32,32,32,32,32,32,111,117,116,112,117,116,91,105,93,32,61,32,105,110,112,117,116,91,105,93,32,42,32,105,110,112,117,116,91,105,93,59,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,125,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,32,10,10,0,80,11,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
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
      }};var CL={cl_digits:["1","2","3","4","5","6","7","8","9"],cl_objects:{},cl_objects_size:0,udid:function (obj) {
        var _id;
        if (obj !== undefined) {
           _id = obj.udid;
           console.info("udid() : get udid property: "+ obj + ".udid = "+_id+ " - "+(_id !== undefined));
           if (_id !== undefined) {
             return _id;
           }
        }
        var _uuid = [];
        for (var i = 0; i < 7; i++) _uuid[i] = CL.cl_digits[0 | Math.random()*CL.cl_digits.length];
        _id = _uuid.join('');
        if (_id in CL.cl_objects) {
          console.error("/!\\ **********************");
          console.error("/!\\ UDID not unique !!!!!!");
          console.error("/!\\ **********************");        
        }
        // /!\ Call udid when you add inside cl_objects if you pass object in parameter
        if (obj !== undefined) {
          Object.defineProperty(obj, "udid", { value : _id,writable : false });
          CL.cl_objects_size++;
          CL.cl_objects[_id]=obj;
          console.info("udid() : set udid property: "+ obj + ".udid = "+_id+ " - "+(_id !== undefined) + " --> Size : " + CL.cl_objects_size);
        }
        return _id;      
      },isFloat:function (ptr,size) {
        var _begin  = HEAPF32[((ptr)>>2)];
        var _middle = HEAPF32[(((ptr)+(size>>1))>>2)];
        var _end    = HEAPF32[(((ptr)+(size))>>2)];
        if ((_begin + _middle + _end).toFixed(5) > 0 ) {
          return 1;
        } else {
          return 0;
        } 
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
      }};function _webclPrintStackTrace(stack_string,stack_size) {
      var _size = HEAP32[((stack_size)>>2)] ;
      if (_size == 0) {
        HEAP32[((stack_size)>>2)]=CL.stack_trace.length /* Num of devices */;
      } else {
        writeStringToMemory(CL.stack_trace, stack_string);
      }
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
          CL.cl_objects_size--;
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
          CL.cl_objects_size--;
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
          _host_ptr = new ArrayBuffer(size);
          var _size = size >> 2;
          if (CL.isFloat(host_ptr, _size)) {
            for (var i = 0; i < _size; i++ ) {
              _host_ptr[i] = HEAPF32[(((host_ptr)+(i*4))>>2)];
            }
          } else {
            for (var i = 0; i < _size; i++ ) {
              _host_ptr[i] = HEAP32[(((host_ptr)+(i*4))>>2)];
            }
          }
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
          _host_ptr = new ArrayBuffer(_sizeInByte);
          if (CL.isFloat(host_ptr, _size)) {
            for (var i = 0; i < _size; i++ ) {
              _host_ptr[i] = HEAPF32[(((host_ptr)+(i*4))>>2)];
            }
          } else {
            for (var i = 0; i < _size; i++ ) {
              _host_ptr[i] = HEAP32[(((host_ptr)+(i*4))>>2)];
            }
          }
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
          CL.cl_objects_size--;
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
          CL.cl_objects_size--;
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
          CL.cl_objects_size--;
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
              _devices.push(CL.cl_objects(_device));
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
          CL.cl_objects_size--;
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
          var _value;
          // 1 ) arg_value is not null
          if (arg_value != 0) {
            // 1.1 ) arg_value is an array
            if (_size > 1) {
              _value = new ArrayBuffer(size);
              // 1.1.1 ) arg_value is an array of float
              if (CL.isFloat(arg_value, _size)) {
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
              if (CL.isFloat(arg_value, _size)) {
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
 var $1=_printf(((2856)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 HEAP32[(($size)>>2)]=0;
 _webclPrintStackTrace(0, $size);
 var $2=HEAP32[(($size)>>2)];
 var $3=((($2)+(1))|0);
 var $4=_malloc($3);
 $webcl_stack=$4;
 var $5=HEAP32[(($size)>>2)];
 var $6=$webcl_stack;
 var $7=(($6+$5)|0);
 HEAP8[($7)]=0;
 var $8=$webcl_stack;
 _webclPrintStackTrace($8, $size);
 var $9=$webcl_stack;
 var $10=_printf(((2608)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$9,tempVarArgs)); STACKTOP=tempVarArgs;
 var $11=_printf(((2264)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
 var $12=$webcl_stack;
 _free($12);
 STACKTOP = sp;
 return;
}
function _end($e) {
 var label = 0;
 var $1;
 $1=$e;
 _print_stack();
 var $2=$1;
 return $2;
}
function _pfn_notify_program($program, $user_data) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $1;
 var $2;
 $1=$program;
 $2=$user_data;
 var $3=$2;
 var $4=$3;
 var $5=$1;
 var $6=$5;
 var $7=_printf(((1968)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$4,HEAP32[(((tempVarArgs)+(8))>>2)]=$6,tempVarArgs)); STACKTOP=tempVarArgs;
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
   var $1;
   var $2=sp;
   var $3;
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
   var $i1;
   var $array_info=(sp)+(1120);
   var $value=(sp)+(1424);
   var $i2;
   var $extensions=(sp)+(1432);
   var $array=(sp)+(2456);
   var $ul=(sp)+(2472);
   var $cl_errcode_ret=(sp)+(2480);
   var $context;
   var $contextFromType;
   var $properties=(sp)+(2488);
   var $properties3=(sp)+(2512);
   var $properties4=(sp)+(2544);
   var $i5;
   var $properties6=(sp)+(2560);
   var $properties7=(sp)+(2584);
   var $properties8=(sp)+(2616);
   var $array_context_info=(sp)+(2632);
   var $i9;
   var $queue;
   var $queue_to_release;
   var $array_command_info=(sp)+(2656);
   var $i10;
   var $array_buffer_flags=(sp)+(2672);
   var $buff;
   var $pixelCount;
   var $pixels;
   var $sizeBytes;
   var $pixels2;
   var $sizeBytes2;
   var $i11;
   var $region1=(sp)+(2696);
   var $region2=(sp)+(2704);
   var $region3=(sp)+(2712);
   var $region4=(sp)+(2720);
   var $subbuffer;
   var $i12;
   var $image;
   var $img_fmt=(sp)+(2728);
   var $img_fmt2=(sp)+(2736);
   var $img_fmt3=(sp)+(2744);
   var $width;
   var $height;
   var $i13;
   var $array_mem_info=(sp)+(2752);
   var $i14;
   var $array_img_info=(sp)+(2792);
   var $i15;
   var $uiNumSupportedFormats=(sp)+(2824);
   var $i16;
   var $4;
   var $i17;
   var $addr=(sp)+(2832);
   var $filter=(sp)+(2856);
   var $boolean=(sp)+(2864);
   var $i18;
   var $j;
   var $k;
   var $sampler;
   var $sampler19;
   var $array_sampler_info=(sp)+(2872);
   var $i20;
   var $program;
   var $program2;
   var $options=(sp)+(2896);
   var $i21;
   var $array_program_build_info=(sp)+(2952);
   var $i22;
   var $array_program_info=(sp)+(2968);
   var $i23;
   var $kernel;
   var $kernel2=(sp)+(3000);
   var $count=(sp)+(3008);
   var $5;
   var $input=(sp)+(3016);
   var $output=(sp)+(3024);
   var $array_kernel_work_info=(sp)+(3032);
   var $i24;
   var $array_kernel_info=(sp)+(3056);
   var $i25;
   var $6;
   $1=0;
   HEAP32[(($2)>>2)]=$argc;
   $3=$argv;
   var $7=$3;
   _glutInit($2, $7);
   _glutInitDisplayMode(18);
   _glutInitWindowSize(256, 256);
   var $8=$3;
   var $9=(($8)|0);
   var $10=HEAP32[(($9)>>2)];
   var $11=_glutCreateWindow($10);
   $counter=0;
   $i=0;
   $use_gpu=1;
   label = 2; break;
  case 2: 
   var $13=$i;
   var $14=HEAP32[(($2)>>2)];
   var $15=(($13)|(0)) < (($14)|(0));
   if ($15) { label = 3; break; } else { var $20 = 0;label = 4; break; }
  case 3: 
   var $17=$3;
   var $18=(($17)|(0))!=0;
   var $20 = $18;label = 4; break;
  case 4: 
   var $20;
   if ($20) { label = 5; break; } else { label = 14; break; }
  case 5: 
   var $22=$i;
   var $23=$3;
   var $24=(($23+($22<<2))|0);
   var $25=HEAP32[(($24)>>2)];
   var $26=(($25)|(0))!=0;
   if ($26) { label = 7; break; } else { label = 6; break; }
  case 6: 
   label = 13; break;
  case 7: 
   var $29=$i;
   var $30=$3;
   var $31=(($30+($29<<2))|0);
   var $32=HEAP32[(($31)>>2)];
   var $33=_strstr($32, ((1648)|0));
   var $34=(($33)|(0))!=0;
   if ($34) { label = 8; break; } else { label = 9; break; }
  case 8: 
   $use_gpu=0;
   label = 12; break;
  case 9: 
   var $37=$i;
   var $38=$3;
   var $39=(($38+($37<<2))|0);
   var $40=HEAP32[(($39)>>2)];
   var $41=_strstr($40, ((1360)|0));
   var $42=(($41)|(0))!=0;
   if ($42) { label = 10; break; } else { label = 11; break; }
  case 10: 
   $use_gpu=1;
   label = 11; break;
  case 11: 
   label = 12; break;
  case 12: 
   label = 13; break;
  case 13: 
   var $47=$i;
   var $48=((($47)+(1))|0);
   $i=$48;
   label = 2; break;
  case 14: 
   var $50=$use_gpu;
   var $51=(($50)|(0))==1;
   var $52=$51 ? (((888)|0)) : (((688)|0));
   var $53=_printf(((1104)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$52,tempVarArgs)); STACKTOP=tempVarArgs;
   var $54=_printf(((2824)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $55=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $56=_clGetPlatformIDs(0, 0, 0);
   HEAP32[(($err)>>2)]=$56;
   var $57=$counter;
   var $58=((($57)+(1))|0);
   $counter=$58;
   var $59=HEAP32[(($err)>>2)];
   var $60=_printf(((2784)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$58,HEAP32[(((tempVarArgs)+(8))>>2)]=$59,tempVarArgs)); STACKTOP=tempVarArgs;
   var $61=_clGetPlatformIDs(0, $first_platform_id, 0);
   HEAP32[(($err)>>2)]=$61;
   var $62=$counter;
   var $63=((($62)+(1))|0);
   $counter=$63;
   var $64=HEAP32[(($err)>>2)];
   var $65=HEAP32[(($first_platform_id)>>2)];
   var $66=$65;
   var $67=_printf(((2768)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$63,HEAP32[(((tempVarArgs)+(8))>>2)]=$64,HEAP32[(((tempVarArgs)+(16))>>2)]=$66,tempVarArgs)); STACKTOP=tempVarArgs;
   var $68=_clGetPlatformIDs(0, 0, $num_platforms);
   HEAP32[(($err)>>2)]=$68;
   var $69=$counter;
   var $70=((($69)+(1))|0);
   $counter=$70;
   var $71=HEAP32[(($err)>>2)];
   var $72=HEAP32[(($num_platforms)>>2)];
   var $73=_printf(((2768)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$70,HEAP32[(((tempVarArgs)+(8))>>2)]=$71,HEAP32[(((tempVarArgs)+(16))>>2)]=$72,tempVarArgs)); STACKTOP=tempVarArgs;
   var $74=_clGetPlatformIDs(2, 0, $num_platforms);
   HEAP32[(($err)>>2)]=$74;
   var $75=$counter;
   var $76=((($75)+(1))|0);
   $counter=$76;
   var $77=HEAP32[(($err)>>2)];
   var $78=HEAP32[(($num_platforms)>>2)];
   var $79=_printf(((2768)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$76,HEAP32[(((tempVarArgs)+(8))>>2)]=$77,HEAP32[(((tempVarArgs)+(16))>>2)]=$78,tempVarArgs)); STACKTOP=tempVarArgs;
   var $80=_clGetPlatformIDs(1, $first_platform_id, 0);
   HEAP32[(($err)>>2)]=$80;
   var $81=$counter;
   var $82=((($81)+(1))|0);
   $counter=$82;
   var $83=HEAP32[(($err)>>2)];
   var $84=HEAP32[(($first_platform_id)>>2)];
   var $85=$84;
   var $86=_printf(((2768)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$82,HEAP32[(((tempVarArgs)+(8))>>2)]=$83,HEAP32[(((tempVarArgs)+(16))>>2)]=$85,tempVarArgs)); STACKTOP=tempVarArgs;
   var $87=_clGetPlatformIDs(1, $first_platform_id, $num_platforms);
   HEAP32[(($err)>>2)]=$87;
   var $88=$counter;
   var $89=((($88)+(1))|0);
   $counter=$89;
   var $90=HEAP32[(($err)>>2)];
   var $91=HEAP32[(($first_platform_id)>>2)];
   var $92=$91;
   var $93=HEAP32[(($num_platforms)>>2)];
   var $94=_printf(((2744)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$89,HEAP32[(((tempVarArgs)+(8))>>2)]=$90,HEAP32[(((tempVarArgs)+(16))>>2)]=$92,HEAP32[(((tempVarArgs)+(24))>>2)]=$93,tempVarArgs)); STACKTOP=tempVarArgs;
   var $95=_printf(((2712)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $96=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   var $97=(($buffer)|0);
   var $98=_clGetPlatformInfo(0, 2304, 1024, $97, 0);
   HEAP32[(($err)>>2)]=$98;
   var $99=$counter;
   var $100=((($99)+(1))|0);
   $counter=$100;
   var $101=HEAP32[(($err)>>2)];
   var $102=(($buffer)|0);
   var $103=_printf(((2696)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$100,HEAP32[(((tempVarArgs)+(8))>>2)]=$101,HEAP32[(((tempVarArgs)+(16))>>2)]=$102,tempVarArgs)); STACKTOP=tempVarArgs;
   var $104=(($buffer)|0);
   var $105=_clGetPlatformInfo(0, 2307, 1024, $104, 0);
   HEAP32[(($err)>>2)]=$105;
   var $106=$counter;
   var $107=((($106)+(1))|0);
   $counter=$107;
   var $108=HEAP32[(($err)>>2)];
   var $109=(($buffer)|0);
   var $110=_printf(((2696)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$107,HEAP32[(((tempVarArgs)+(8))>>2)]=$108,HEAP32[(((tempVarArgs)+(16))>>2)]=$109,tempVarArgs)); STACKTOP=tempVarArgs;
   var $111=HEAP32[(($first_platform_id)>>2)];
   var $112=(($buffer)|0);
   var $113=_clGetPlatformInfo($111, 2304, 1024, $112, 0);
   HEAP32[(($err)>>2)]=$113;
   var $114=$counter;
   var $115=((($114)+(1))|0);
   $counter=$115;
   var $116=HEAP32[(($err)>>2)];
   var $117=(($buffer)|0);
   var $118=_printf(((2696)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$115,HEAP32[(((tempVarArgs)+(8))>>2)]=$116,HEAP32[(((tempVarArgs)+(16))>>2)]=$117,tempVarArgs)); STACKTOP=tempVarArgs;
   var $119=HEAP32[(($first_platform_id)>>2)];
   var $120=_clGetPlatformInfo($119, 2305, 1024, 0, 0);
   HEAP32[(($err)>>2)]=$120;
   var $121=$counter;
   var $122=((($121)+(1))|0);
   $counter=$122;
   var $123=HEAP32[(($err)>>2)];
   var $124=_printf(((2784)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$122,HEAP32[(((tempVarArgs)+(8))>>2)]=$123,tempVarArgs)); STACKTOP=tempVarArgs;
   var $125=HEAP32[(($first_platform_id)>>2)];
   var $126=(($buffer)|0);
   var $127=_clGetPlatformInfo($125, 2307, 1024, $126, $size);
   HEAP32[(($err)>>2)]=$127;
   var $128=$counter;
   var $129=((($128)+(1))|0);
   $counter=$129;
   var $130=HEAP32[(($err)>>2)];
   var $131=(($buffer)|0);
   var $132=HEAP32[(($size)>>2)];
   var $133=_printf(((2672)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$129,HEAP32[(((tempVarArgs)+(8))>>2)]=$130,HEAP32[(((tempVarArgs)+(16))>>2)]=$131,HEAP32[(((tempVarArgs)+(24))>>2)]=$132,tempVarArgs)); STACKTOP=tempVarArgs;
   var $134=_printf(((2648)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $135=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $136=$array_type;
   HEAP32[(($136)>>2)]=0; HEAP32[((($136)+(4))>>2)]=0; HEAP32[((($136)+(8))>>2)]=0; HEAP32[((($136)+(12))>>2)]=0; HEAP32[((($136)+(16))>>2)]=0; HEAP32[((($136)+(20))>>2)]=0; HEAP32[((($136)+(24))>>2)]=0; HEAP32[((($136)+(28))>>2)]=0; HEAP32[((($136)+(32))>>2)]=0; HEAP32[((($136)+(36))>>2)]=0;
   var $137=$136;
   var $138=(($137)|0);
   var $$etemp$0$0=-1;
   var $$etemp$0$1=0;
   var $st$1$0=(($138)|0);
   HEAP32[(($st$1$0)>>2)]=$$etemp$0$0;
   var $st$2$1=(($138+4)|0);
   HEAP32[(($st$2$1)>>2)]=$$etemp$0$1;
   var $139=(($137+8)|0);
   var $$etemp$3$0=4;
   var $$etemp$3$1=0;
   var $st$4$0=(($139)|0);
   HEAP32[(($st$4$0)>>2)]=$$etemp$3$0;
   var $st$5$1=(($139+4)|0);
   HEAP32[(($st$5$1)>>2)]=$$etemp$3$1;
   var $140=(($137+16)|0);
   var $$etemp$6$0=1;
   var $$etemp$6$1=0;
   var $st$7$0=(($140)|0);
   HEAP32[(($st$7$0)>>2)]=$$etemp$6$0;
   var $st$8$1=(($140+4)|0);
   HEAP32[(($st$8$1)>>2)]=$$etemp$6$1;
   var $141=(($137+24)|0);
   var $$etemp$9$0=8;
   var $$etemp$9$1=0;
   var $st$10$0=(($141)|0);
   HEAP32[(($st$10$0)>>2)]=$$etemp$9$0;
   var $st$11$1=(($141+4)|0);
   HEAP32[(($st$11$1)>>2)]=$$etemp$9$1;
   var $142=(($137+32)|0);
   var $$etemp$12$0=2;
   var $$etemp$12$1=0;
   var $st$13$0=(($142)|0);
   HEAP32[(($st$13$0)>>2)]=$$etemp$12$0;
   var $st$14$1=(($142+4)|0);
   HEAP32[(($st$14$1)>>2)]=$$etemp$12$1;
   $i1=0;
   label = 15; break;
  case 15: 
   var $144=$i1;
   var $145=(($144)|(0)) < 5;
   if ($145) { label = 16; break; } else { label = 18; break; }
  case 16: 
   var $147=$i1;
   var $148=(($array_type+($147<<3))|0);
   var $ld$15$0=(($148)|0);
   var $149$0=HEAP32[(($ld$15$0)>>2)];
   var $ld$16$1=(($148+4)|0);
   var $149$1=HEAP32[(($ld$16$1)>>2)];
   var $$etemp$17=((2616)|0);
   var $150=_printf($$etemp$17, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$149$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$149$1,tempVarArgs)); STACKTOP=tempVarArgs;
   var $151=$i1;
   var $152=(($array_type+($151<<3))|0);
   var $ld$18$0=(($152)|0);
   var $153$0=HEAP32[(($ld$18$0)>>2)];
   var $ld$19$1=(($152+4)|0);
   var $153$1=HEAP32[(($ld$19$1)>>2)];
   var $154=_clGetDeviceIDs(0, $153$0, $153$1, 0, 0, 0);
   HEAP32[(($err)>>2)]=$154;
   var $155=$counter;
   var $156=((($155)+(1))|0);
   $counter=$156;
   var $157=HEAP32[(($err)>>2)];
   var $158=_printf(((2784)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$156,HEAP32[(((tempVarArgs)+(8))>>2)]=$157,tempVarArgs)); STACKTOP=tempVarArgs;
   var $$etemp$20$0=0;
   var $$etemp$20$1=0;
   var $159=_clGetDeviceIDs(0, $$etemp$20$0, $$etemp$20$1, 0, 0, 0);
   HEAP32[(($err)>>2)]=$159;
   var $160=$counter;
   var $161=((($160)+(1))|0);
   $counter=$161;
   var $162=HEAP32[(($err)>>2)];
   var $163=_printf(((2784)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$161,HEAP32[(((tempVarArgs)+(8))>>2)]=$162,tempVarArgs)); STACKTOP=tempVarArgs;
   var $164=$i1;
   var $165=(($array_type+($164<<3))|0);
   var $ld$21$0=(($165)|0);
   var $166$0=HEAP32[(($ld$21$0)>>2)];
   var $ld$22$1=(($165+4)|0);
   var $166$1=HEAP32[(($ld$22$1)>>2)];
   var $167=_clGetDeviceIDs(0, $166$0, $166$1, 1, 0, $num_devices);
   HEAP32[(($err)>>2)]=$167;
   var $168=$counter;
   var $169=((($168)+(1))|0);
   $counter=$169;
   var $170=HEAP32[(($err)>>2)];
   var $171=HEAP32[(($num_devices)>>2)];
   var $172=_printf(((2768)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$169,HEAP32[(((tempVarArgs)+(8))>>2)]=$170,HEAP32[(((tempVarArgs)+(16))>>2)]=$171,tempVarArgs)); STACKTOP=tempVarArgs;
   var $173=$i1;
   var $174=(($array_type+($173<<3))|0);
   var $ld$23$0=(($174)|0);
   var $175$0=HEAP32[(($ld$23$0)>>2)];
   var $ld$24$1=(($174+4)|0);
   var $175$1=HEAP32[(($ld$24$1)>>2)];
   var $176=_clGetDeviceIDs(0, $175$0, $175$1, 1, $first_device_id, 0);
   HEAP32[(($err)>>2)]=$176;
   var $177=$counter;
   var $178=((($177)+(1))|0);
   $counter=$178;
   var $179=HEAP32[(($err)>>2)];
   var $180=HEAP32[(($first_device_id)>>2)];
   var $181=$180;
   var $182=_printf(((2768)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$178,HEAP32[(((tempVarArgs)+(8))>>2)]=$179,HEAP32[(((tempVarArgs)+(16))>>2)]=$181,tempVarArgs)); STACKTOP=tempVarArgs;
   var $183=$i1;
   var $184=(($array_type+($183<<3))|0);
   var $ld$25$0=(($184)|0);
   var $185$0=HEAP32[(($ld$25$0)>>2)];
   var $ld$26$1=(($184+4)|0);
   var $185$1=HEAP32[(($ld$26$1)>>2)];
   var $186=_clGetDeviceIDs(0, $185$0, $185$1, 2, $first_device_id, $num_devices);
   HEAP32[(($err)>>2)]=$186;
   var $187=$counter;
   var $188=((($187)+(1))|0);
   $counter=$188;
   var $189=HEAP32[(($err)>>2)];
   var $190=HEAP32[(($first_device_id)>>2)];
   var $191=$190;
   var $192=HEAP32[(($num_devices)>>2)];
   var $193=_printf(((2744)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$188,HEAP32[(((tempVarArgs)+(8))>>2)]=$189,HEAP32[(((tempVarArgs)+(16))>>2)]=$191,HEAP32[(((tempVarArgs)+(24))>>2)]=$192,tempVarArgs)); STACKTOP=tempVarArgs;
   var $194=HEAP32[(($first_platform_id)>>2)];
   var $195=$i1;
   var $196=(($array_type+($195<<3))|0);
   var $ld$27$0=(($196)|0);
   var $197$0=HEAP32[(($ld$27$0)>>2)];
   var $ld$28$1=(($196+4)|0);
   var $197$1=HEAP32[(($ld$28$1)>>2)];
   var $198=_clGetDeviceIDs($194, $197$0, $197$1, 1, 0, $num_devices);
   HEAP32[(($err)>>2)]=$198;
   var $199=$counter;
   var $200=((($199)+(1))|0);
   $counter=$200;
   var $201=HEAP32[(($err)>>2)];
   var $202=HEAP32[(($first_platform_id)>>2)];
   var $203=$202;
   var $204=HEAP32[(($num_devices)>>2)];
   var $205=_printf(((2744)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$200,HEAP32[(((tempVarArgs)+(8))>>2)]=$201,HEAP32[(((tempVarArgs)+(16))>>2)]=$203,HEAP32[(((tempVarArgs)+(24))>>2)]=$204,tempVarArgs)); STACKTOP=tempVarArgs;
   var $206=HEAP32[(($first_platform_id)>>2)];
   var $207=$i1;
   var $208=(($array_type+($207<<3))|0);
   var $ld$29$0=(($208)|0);
   var $209$0=HEAP32[(($ld$29$0)>>2)];
   var $ld$30$1=(($208+4)|0);
   var $209$1=HEAP32[(($ld$30$1)>>2)];
   var $210=_clGetDeviceIDs($206, $209$0, $209$1, 1, $first_device_id, 0);
   HEAP32[(($err)>>2)]=$210;
   var $211=$counter;
   var $212=((($211)+(1))|0);
   $counter=$212;
   var $213=HEAP32[(($err)>>2)];
   var $214=HEAP32[(($first_platform_id)>>2)];
   var $215=$214;
   var $216=HEAP32[(($first_device_id)>>2)];
   var $217=$216;
   var $218=_printf(((2744)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$212,HEAP32[(((tempVarArgs)+(8))>>2)]=$213,HEAP32[(((tempVarArgs)+(16))>>2)]=$215,HEAP32[(((tempVarArgs)+(24))>>2)]=$217,tempVarArgs)); STACKTOP=tempVarArgs;
   var $219=HEAP32[(($first_platform_id)>>2)];
   var $220=$i1;
   var $221=(($array_type+($220<<3))|0);
   var $ld$31$0=(($221)|0);
   var $222$0=HEAP32[(($ld$31$0)>>2)];
   var $ld$32$1=(($221+4)|0);
   var $222$1=HEAP32[(($ld$32$1)>>2)];
   var $223=_clGetDeviceIDs($219, $222$0, $222$1, 2, $first_device_id, $num_devices);
   HEAP32[(($err)>>2)]=$223;
   var $224=$counter;
   var $225=((($224)+(1))|0);
   $counter=$225;
   var $226=HEAP32[(($err)>>2)];
   var $227=HEAP32[(($first_platform_id)>>2)];
   var $228=$227;
   var $229=HEAP32[(($first_device_id)>>2)];
   var $230=$229;
   var $231=HEAP32[(($num_devices)>>2)];
   var $232=_printf(((2584)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$225,HEAP32[(((tempVarArgs)+(8))>>2)]=$226,HEAP32[(((tempVarArgs)+(16))>>2)]=$228,HEAP32[(((tempVarArgs)+(24))>>2)]=$230,HEAP32[(((tempVarArgs)+(32))>>2)]=$231,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 17; break;
  case 17: 
   var $234=$i1;
   var $235=((($234)+(1))|0);
   $i1=$235;
   label = 15; break;
  case 18: 
   var $237=_printf(((2552)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $238=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $239=$array_info;
   assert(300 % 1 === 0);(_memcpy($239, 264, 300)|0);
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   $i2=0;
   label = 19; break;
  case 19: 
   var $241=$i2;
   var $242=(($241)|(0)) < 75;
   if ($242) { label = 20; break; } else { label = 22; break; }
  case 20: 
   var $244=HEAP32[(($first_device_id)>>2)];
   var $245=$i2;
   var $246=(($array_info+($245<<2))|0);
   var $247=HEAP32[(($246)>>2)];
   var $248=$value;
   var $249=_clGetDeviceInfo($244, $247, 4, $248, $size);
   HEAP32[(($err)>>2)]=$249;
   var $250=$counter;
   var $251=((($250)+(1))|0);
   $counter=$251;
   var $252=$i2;
   var $253=(($array_info+($252<<2))|0);
   var $254=HEAP32[(($253)>>2)];
   var $255=HEAP32[(($err)>>2)];
   var $256=HEAP32[(($size)>>2)];
   var $257=HEAP32[(($value)>>2)];
   var $258=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$251,HEAP32[(((tempVarArgs)+(8))>>2)]=$254,HEAP32[(((tempVarArgs)+(16))>>2)]=$255,HEAP32[(((tempVarArgs)+(24))>>2)]=$256,HEAP32[(((tempVarArgs)+(32))>>2)]=$257,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 21; break;
  case 21: 
   var $260=$i2;
   var $261=((($260)+(1))|0);
   $i2=$261;
   label = 19; break;
  case 22: 
   HEAP32[(($size)>>2)]=0;
   var $263=HEAP32[(($first_device_id)>>2)];
   var $264=$extensions;
   var $265=_clGetDeviceInfo($263, 4144, 1024, $264, $size);
   HEAP32[(($err)>>2)]=$265;
   var $266=$counter;
   var $267=((($266)+(1))|0);
   $counter=$267;
   var $268=HEAP32[(($err)>>2)];
   var $269=HEAP32[(($size)>>2)];
   var $270=(($extensions)|0);
   var $271=_printf(((2504)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$267,HEAP32[(((tempVarArgs)+(8))>>2)]=4144,HEAP32[(((tempVarArgs)+(16))>>2)]=$268,HEAP32[(((tempVarArgs)+(24))>>2)]=$269,HEAP32[(((tempVarArgs)+(32))>>2)]=$270,tempVarArgs)); STACKTOP=tempVarArgs;
   var $272=HEAP32[(($first_device_id)>>2)];
   var $273=$array;
   var $274=_clGetDeviceInfo($272, 4101, 12, $273, $size);
   HEAP32[(($err)>>2)]=$274;
   var $275=$counter;
   var $276=((($275)+(1))|0);
   $counter=$276;
   var $277=HEAP32[(($err)>>2)];
   var $278=HEAP32[(($size)>>2)];
   var $279=(($array)|0);
   var $280=HEAP32[(($279)>>2)];
   var $281=(($array+4)|0);
   var $282=HEAP32[(($281)>>2)];
   var $283=(($array+8)|0);
   var $284=HEAP32[(($283)>>2)];
   var $285=_printf(((2464)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 56)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$276,HEAP32[(((tempVarArgs)+(8))>>2)]=4101,HEAP32[(((tempVarArgs)+(16))>>2)]=$277,HEAP32[(((tempVarArgs)+(24))>>2)]=$278,HEAP32[(((tempVarArgs)+(32))>>2)]=$280,HEAP32[(((tempVarArgs)+(40))>>2)]=$282,HEAP32[(((tempVarArgs)+(48))>>2)]=$284,tempVarArgs)); STACKTOP=tempVarArgs;
   var $286=HEAP32[(($first_device_id)>>2)];
   var $287=$ul;
   var $288=_clGetDeviceInfo($286, 4112, 8, $287, $size);
   HEAP32[(($err)>>2)]=$288;
   var $289=$counter;
   var $290=((($289)+(1))|0);
   $counter=$290;
   var $291=HEAP32[(($err)>>2)];
   var $292=HEAP32[(($size)>>2)];
   var $ld$33$0=(($ul)|0);
   var $293$0=HEAP32[(($ld$33$0)>>2)];
   var $ld$34$1=(($ul+4)|0);
   var $293$1=HEAP32[(($ld$34$1)>>2)];
   var $$etemp$35=((2432)|0);
   var $294=_printf($$etemp$35, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 48)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$290,HEAP32[(((tempVarArgs)+(8))>>2)]=4112,HEAP32[(((tempVarArgs)+(16))>>2)]=$291,HEAP32[(((tempVarArgs)+(24))>>2)]=$292,HEAP32[(((tempVarArgs)+(32))>>2)]=$293$0,HEAP32[(((tempVarArgs)+(40))>>2)]=$293$1,tempVarArgs)); STACKTOP=tempVarArgs;
   var $$etemp$36$0=0;
   var $$etemp$36$1=0;
   var $st$37$0=(($ul)|0);
   HEAP32[(($st$37$0)>>2)]=$$etemp$36$0;
   var $st$38$1=(($ul+4)|0);
   HEAP32[(($st$38$1)>>2)]=$$etemp$36$1;
   var $295=HEAP32[(($first_device_id)>>2)];
   var $296=$ul;
   var $297=_clGetDeviceInfo($295, 4127, 8, $296, $size);
   HEAP32[(($err)>>2)]=$297;
   var $298=$counter;
   var $299=((($298)+(1))|0);
   $counter=$299;
   var $300=HEAP32[(($err)>>2)];
   var $301=HEAP32[(($size)>>2)];
   var $ld$39$0=(($ul)|0);
   var $302$0=HEAP32[(($ld$39$0)>>2)];
   var $ld$40$1=(($ul+4)|0);
   var $302$1=HEAP32[(($ld$40$1)>>2)];
   var $$etemp$41=((2432)|0);
   var $303=_printf($$etemp$41, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 48)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$299,HEAP32[(((tempVarArgs)+(8))>>2)]=4127,HEAP32[(((tempVarArgs)+(16))>>2)]=$300,HEAP32[(((tempVarArgs)+(24))>>2)]=$301,HEAP32[(((tempVarArgs)+(32))>>2)]=$302$0,HEAP32[(((tempVarArgs)+(40))>>2)]=$302$1,tempVarArgs)); STACKTOP=tempVarArgs;
   var $304=_printf(((2400)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $305=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($cl_errcode_ret)>>2)]=0;
   var $306=_clCreateContext(0, 0, 0, 0, 0, $cl_errcode_ret);
   $context=$306;
   var $307=$counter;
   var $308=((($307)+(1))|0);
   $counter=$308;
   var $309=HEAP32[(($cl_errcode_ret)>>2)];
   var $310=$context;
   var $311=$310;
   var $312=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$308,HEAP32[(((tempVarArgs)+(8))>>2)]=$309,HEAP32[(((tempVarArgs)+(16))>>2)]=$311,tempVarArgs)); STACKTOP=tempVarArgs;
   var $313=_clCreateContext(0, 1, 0, 0, 0, $cl_errcode_ret);
   $context=$313;
   var $314=$counter;
   var $315=((($314)+(1))|0);
   $counter=$315;
   var $316=HEAP32[(($cl_errcode_ret)>>2)];
   var $317=$context;
   var $318=$317;
   var $319=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$315,HEAP32[(((tempVarArgs)+(8))>>2)]=$316,HEAP32[(((tempVarArgs)+(16))>>2)]=$318,tempVarArgs)); STACKTOP=tempVarArgs;
   var $320=_clCreateContext(0, 0, $first_device_id, 0, 0, $cl_errcode_ret);
   $context=$320;
   var $321=$counter;
   var $322=((($321)+(1))|0);
   $counter=$322;
   var $323=HEAP32[(($cl_errcode_ret)>>2)];
   var $324=$context;
   var $325=$324;
   var $326=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$322,HEAP32[(((tempVarArgs)+(8))>>2)]=$323,HEAP32[(((tempVarArgs)+(16))>>2)]=$325,tempVarArgs)); STACKTOP=tempVarArgs;
   var $327=_clCreateContext(0, 1, $first_device_id, 0, 0, $cl_errcode_ret);
   $context=$327;
   var $328=$counter;
   var $329=((($328)+(1))|0);
   $counter=$329;
   var $330=HEAP32[(($cl_errcode_ret)>>2)];
   var $331=$context;
   var $332=$331;
   var $333=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$329,HEAP32[(((tempVarArgs)+(8))>>2)]=$330,HEAP32[(((tempVarArgs)+(16))>>2)]=$332,tempVarArgs)); STACKTOP=tempVarArgs;
   var $334=$properties;
   assert(20 % 1 === 0);HEAP32[(($334)>>2)]=HEAP32[((64)>>2)];HEAP32[((($334)+(4))>>2)]=HEAP32[((68)>>2)];HEAP32[((($334)+(8))>>2)]=HEAP32[((72)>>2)];HEAP32[((($334)+(12))>>2)]=HEAP32[((76)>>2)];HEAP32[((($334)+(16))>>2)]=HEAP32[((80)>>2)];
   var $335=(($properties)|0);
   var $336=_clCreateContext($335, 1, $first_device_id, 0, 0, $cl_errcode_ret);
   $context=$336;
   var $337=$counter;
   var $338=((($337)+(1))|0);
   $counter=$338;
   var $339=HEAP32[(($cl_errcode_ret)>>2)];
   var $340=$context;
   var $341=$340;
   var $342=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$338,HEAP32[(((tempVarArgs)+(8))>>2)]=$339,HEAP32[(((tempVarArgs)+(16))>>2)]=$341,tempVarArgs)); STACKTOP=tempVarArgs;
   var $343=(($properties3)|0);
   HEAP32[(($343)>>2)]=4228;
   var $344=(($343+4)|0);
   var $345=HEAP32[(($first_platform_id)>>2)];
   var $346=$345;
   HEAP32[(($344)>>2)]=$346;
   var $347=(($344+4)|0);
   HEAP32[(($347)>>2)]=8200;
   var $348=(($347+4)|0);
   HEAP32[(($348)>>2)]=0;
   var $349=(($348+4)|0);
   HEAP32[(($349)>>2)]=8204;
   var $350=(($349+4)|0);
   HEAP32[(($350)>>2)]=0;
   var $351=(($350+4)|0);
   HEAP32[(($351)>>2)]=0;
   var $352=(($properties3)|0);
   var $353=_clCreateContext($352, 1, $first_device_id, 0, 0, $cl_errcode_ret);
   $context=$353;
   var $354=$counter;
   var $355=((($354)+(1))|0);
   $counter=$355;
   var $356=HEAP32[(($cl_errcode_ret)>>2)];
   var $357=$context;
   var $358=$357;
   var $359=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$355,HEAP32[(((tempVarArgs)+(8))>>2)]=$356,HEAP32[(((tempVarArgs)+(16))>>2)]=$358,tempVarArgs)); STACKTOP=tempVarArgs;
   var $360=(($properties4)|0);
   HEAP32[(($360)>>2)]=4228;
   var $361=(($360+4)|0);
   var $362=HEAP32[(($first_platform_id)>>2)];
   var $363=$362;
   HEAP32[(($361)>>2)]=$363;
   var $364=(($361+4)|0);
   HEAP32[(($364)>>2)]=0;
   var $365=(($properties4)|0);
   var $366=_clCreateContext($365, 1, $first_device_id, 0, 0, $cl_errcode_ret);
   $context=$366;
   var $367=$counter;
   var $368=((($367)+(1))|0);
   $counter=$368;
   var $369=HEAP32[(($cl_errcode_ret)>>2)];
   var $370=$context;
   var $371=$370;
   var $372=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$368,HEAP32[(((tempVarArgs)+(8))>>2)]=$369,HEAP32[(((tempVarArgs)+(16))>>2)]=$371,tempVarArgs)); STACKTOP=tempVarArgs;
   var $373=_printf(((2344)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $374=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $i5=0;
   label = 23; break;
  case 23: 
   var $376=$i5;
   var $377=(($376)|(0)) < 5;
   if ($377) { label = 24; break; } else { label = 26; break; }
  case 24: 
   var $379=$i5;
   var $380=(($array_type+($379<<3))|0);
   var $ld$42$0=(($380)|0);
   var $381$0=HEAP32[(($ld$42$0)>>2)];
   var $ld$43$1=(($380+4)|0);
   var $381$1=HEAP32[(($ld$43$1)>>2)];
   var $$etemp$44=((2304)|0);
   var $382=_printf($$etemp$44, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$381$0,HEAP32[(((tempVarArgs)+(8))>>2)]=$381$1,tempVarArgs)); STACKTOP=tempVarArgs;
   var $383=$i5;
   var $384=(($array_type+($383<<3))|0);
   var $ld$45$0=(($384)|0);
   var $385$0=HEAP32[(($ld$45$0)>>2)];
   var $ld$46$1=(($384+4)|0);
   var $385$1=HEAP32[(($ld$46$1)>>2)];
   var $386=_clCreateContextFromType(0, $385$0, $385$1, 0, 0, $cl_errcode_ret);
   $contextFromType=$386;
   var $387=$counter;
   var $388=((($387)+(1))|0);
   $counter=$388;
   var $389=HEAP32[(($cl_errcode_ret)>>2)];
   var $390=$i5;
   var $391=(($array_type+($390<<3))|0);
   var $ld$47$0=(($391)|0);
   var $392$0=HEAP32[(($ld$47$0)>>2)];
   var $ld$48$1=(($391+4)|0);
   var $392$1=HEAP32[(($ld$48$1)>>2)];
   var $393=$contextFromType;
   var $394=$393;
   var $$etemp$49=((2240)|0);
   var $395=_printf($$etemp$49, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$388,HEAP32[(((tempVarArgs)+(8))>>2)]=$389,HEAP32[(((tempVarArgs)+(16))>>2)]=$392$0,HEAP32[(((tempVarArgs)+(24))>>2)]=$392$1,HEAP32[(((tempVarArgs)+(32))>>2)]=$394,tempVarArgs)); STACKTOP=tempVarArgs;
   var $396=$i5;
   var $397=(($array_type+($396<<3))|0);
   var $ld$50$0=(($397)|0);
   var $398$0=HEAP32[(($ld$50$0)>>2)];
   var $ld$51$1=(($397+4)|0);
   var $398$1=HEAP32[(($ld$51$1)>>2)];
   var $399=_clCreateContextFromType(0, $398$0, $398$1, 0, 0, $cl_errcode_ret);
   $contextFromType=$399;
   var $400=$counter;
   var $401=((($400)+(1))|0);
   $counter=$401;
   var $402=HEAP32[(($cl_errcode_ret)>>2)];
   var $403=$i5;
   var $404=(($array_type+($403<<3))|0);
   var $ld$52$0=(($404)|0);
   var $405$0=HEAP32[(($ld$52$0)>>2)];
   var $ld$53$1=(($404+4)|0);
   var $405$1=HEAP32[(($ld$53$1)>>2)];
   var $406=$contextFromType;
   var $407=$406;
   var $$etemp$54=((2240)|0);
   var $408=_printf($$etemp$54, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$401,HEAP32[(((tempVarArgs)+(8))>>2)]=$402,HEAP32[(((tempVarArgs)+(16))>>2)]=$405$0,HEAP32[(((tempVarArgs)+(24))>>2)]=$405$1,HEAP32[(((tempVarArgs)+(32))>>2)]=$407,tempVarArgs)); STACKTOP=tempVarArgs;
   var $409=$properties6;
   assert(20 % 1 === 0);HEAP32[(($409)>>2)]=HEAP32[((40)>>2)];HEAP32[((($409)+(4))>>2)]=HEAP32[((44)>>2)];HEAP32[((($409)+(8))>>2)]=HEAP32[((48)>>2)];HEAP32[((($409)+(12))>>2)]=HEAP32[((52)>>2)];HEAP32[((($409)+(16))>>2)]=HEAP32[((56)>>2)];
   var $410=(($properties6)|0);
   var $411=$i5;
   var $412=(($array_type+($411<<3))|0);
   var $ld$55$0=(($412)|0);
   var $413$0=HEAP32[(($ld$55$0)>>2)];
   var $ld$56$1=(($412+4)|0);
   var $413$1=HEAP32[(($ld$56$1)>>2)];
   var $414=_clCreateContextFromType($410, $413$0, $413$1, 0, 0, $cl_errcode_ret);
   $contextFromType=$414;
   var $415=$counter;
   var $416=((($415)+(1))|0);
   $counter=$416;
   var $417=HEAP32[(($cl_errcode_ret)>>2)];
   var $418=$i5;
   var $419=(($array_type+($418<<3))|0);
   var $ld$57$0=(($419)|0);
   var $420$0=HEAP32[(($ld$57$0)>>2)];
   var $ld$58$1=(($419+4)|0);
   var $420$1=HEAP32[(($ld$58$1)>>2)];
   var $421=$contextFromType;
   var $422=$421;
   var $$etemp$59=((2240)|0);
   var $423=_printf($$etemp$59, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$416,HEAP32[(((tempVarArgs)+(8))>>2)]=$417,HEAP32[(((tempVarArgs)+(16))>>2)]=$420$0,HEAP32[(((tempVarArgs)+(24))>>2)]=$420$1,HEAP32[(((tempVarArgs)+(32))>>2)]=$422,tempVarArgs)); STACKTOP=tempVarArgs;
   var $424=(($properties7)|0);
   HEAP32[(($424)>>2)]=4228;
   var $425=(($424+4)|0);
   var $426=HEAP32[(($first_platform_id)>>2)];
   var $427=$426;
   HEAP32[(($425)>>2)]=$427;
   var $428=(($425+4)|0);
   HEAP32[(($428)>>2)]=8200;
   var $429=(($428+4)|0);
   HEAP32[(($429)>>2)]=0;
   var $430=(($429+4)|0);
   HEAP32[(($430)>>2)]=8204;
   var $431=(($430+4)|0);
   HEAP32[(($431)>>2)]=0;
   var $432=(($431+4)|0);
   HEAP32[(($432)>>2)]=0;
   var $433=(($properties7)|0);
   var $434=$i5;
   var $435=(($array_type+($434<<3))|0);
   var $ld$60$0=(($435)|0);
   var $436$0=HEAP32[(($ld$60$0)>>2)];
   var $ld$61$1=(($435+4)|0);
   var $436$1=HEAP32[(($ld$61$1)>>2)];
   var $437=_clCreateContextFromType($433, $436$0, $436$1, 0, 0, $cl_errcode_ret);
   $contextFromType=$437;
   var $438=$counter;
   var $439=((($438)+(1))|0);
   $counter=$439;
   var $440=HEAP32[(($cl_errcode_ret)>>2)];
   var $441=$i5;
   var $442=(($array_type+($441<<3))|0);
   var $ld$62$0=(($442)|0);
   var $443$0=HEAP32[(($ld$62$0)>>2)];
   var $ld$63$1=(($442+4)|0);
   var $443$1=HEAP32[(($ld$63$1)>>2)];
   var $444=$contextFromType;
   var $445=$444;
   var $$etemp$64=((2240)|0);
   var $446=_printf($$etemp$64, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$439,HEAP32[(((tempVarArgs)+(8))>>2)]=$440,HEAP32[(((tempVarArgs)+(16))>>2)]=$443$0,HEAP32[(((tempVarArgs)+(24))>>2)]=$443$1,HEAP32[(((tempVarArgs)+(32))>>2)]=$445,tempVarArgs)); STACKTOP=tempVarArgs;
   var $447=(($properties8)|0);
   HEAP32[(($447)>>2)]=4228;
   var $448=(($447+4)|0);
   var $449=HEAP32[(($first_platform_id)>>2)];
   var $450=$449;
   HEAP32[(($448)>>2)]=$450;
   var $451=(($448+4)|0);
   HEAP32[(($451)>>2)]=0;
   var $452=(($properties8)|0);
   var $453=$i5;
   var $454=(($array_type+($453<<3))|0);
   var $ld$65$0=(($454)|0);
   var $455$0=HEAP32[(($ld$65$0)>>2)];
   var $ld$66$1=(($454+4)|0);
   var $455$1=HEAP32[(($ld$66$1)>>2)];
   var $456=_clCreateContextFromType($452, $455$0, $455$1, 0, 0, $cl_errcode_ret);
   $contextFromType=$456;
   var $457=$counter;
   var $458=((($457)+(1))|0);
   $counter=$458;
   var $459=HEAP32[(($cl_errcode_ret)>>2)];
   var $460=$i5;
   var $461=(($array_type+($460<<3))|0);
   var $ld$67$0=(($461)|0);
   var $462$0=HEAP32[(($ld$67$0)>>2)];
   var $ld$68$1=(($461+4)|0);
   var $462$1=HEAP32[(($ld$68$1)>>2)];
   var $463=$contextFromType;
   var $464=$463;
   var $$etemp$69=((2240)|0);
   var $465=_printf($$etemp$69, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$458,HEAP32[(((tempVarArgs)+(8))>>2)]=$459,HEAP32[(((tempVarArgs)+(16))>>2)]=$462$0,HEAP32[(((tempVarArgs)+(24))>>2)]=$462$1,HEAP32[(((tempVarArgs)+(32))>>2)]=$464,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 25; break;
  case 25: 
   var $467=$i5;
   var $468=((($467)+(1))|0);
   $i5=$468;
   label = 23; break;
  case 26: 
   var $470=_printf(((2208)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $471=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   var $472=$array_context_info;
   assert(20 % 1 === 0);HEAP32[(($472)>>2)]=HEAP32[((600)>>2)];HEAP32[((($472)+(4))>>2)]=HEAP32[((604)>>2)];HEAP32[((($472)+(8))>>2)]=HEAP32[((608)>>2)];HEAP32[((($472)+(12))>>2)]=HEAP32[((612)>>2)];HEAP32[((($472)+(16))>>2)]=HEAP32[((616)>>2)];
   $i9=0;
   label = 27; break;
  case 27: 
   var $474=$i9;
   var $475=(($474)|(0)) < 5;
   if ($475) { label = 28; break; } else { label = 30; break; }
  case 28: 
   var $477=$contextFromType;
   var $478=$i9;
   var $479=(($array_context_info+($478<<2))|0);
   var $480=HEAP32[(($479)>>2)];
   var $481=$value;
   var $482=_clGetContextInfo($477, $480, 4, $481, $size);
   HEAP32[(($err)>>2)]=$482;
   var $483=$counter;
   var $484=((($483)+(1))|0);
   $counter=$484;
   var $485=$i9;
   var $486=(($array_context_info+($485<<2))|0);
   var $487=HEAP32[(($486)>>2)];
   var $488=HEAP32[(($err)>>2)];
   var $489=HEAP32[(($size)>>2)];
   var $490=HEAP32[(($value)>>2)];
   var $491=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$484,HEAP32[(((tempVarArgs)+(8))>>2)]=$487,HEAP32[(((tempVarArgs)+(16))>>2)]=$488,HEAP32[(((tempVarArgs)+(24))>>2)]=$489,HEAP32[(((tempVarArgs)+(32))>>2)]=$490,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 29; break;
  case 29: 
   var $493=$i9;
   var $494=((($493)+(1))|0);
   $i9=$494;
   label = 27; break;
  case 30: 
   var $496=_printf(((2176)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $497=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $498=_clReleaseContext(0);
   HEAP32[(($err)>>2)]=$498;
   var $499=$counter;
   var $500=((($499)+(1))|0);
   $counter=$500;
   var $501=HEAP32[(($err)>>2)];
   var $502=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$500,HEAP32[(((tempVarArgs)+(8))>>2)]=$501,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $503=$contextFromType;
   var $504=_clReleaseContext($503);
   HEAP32[(($err)>>2)]=$504;
   var $505=$counter;
   var $506=((($505)+(1))|0);
   $counter=$506;
   var $507=HEAP32[(($err)>>2)];
   var $508=$contextFromType;
   var $509=$508;
   var $510=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$506,HEAP32[(((tempVarArgs)+(8))>>2)]=$507,HEAP32[(((tempVarArgs)+(16))>>2)]=$509,tempVarArgs)); STACKTOP=tempVarArgs;
   var $511=_printf(((2144)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $512=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $$etemp$70$0=0;
   var $$etemp$70$1=0;
   var $513=_clCreateCommandQueue(0, 0, $$etemp$70$0, $$etemp$70$1, $cl_errcode_ret);
   $queue=$513;
   var $514=$counter;
   var $515=((($514)+(1))|0);
   $counter=$515;
   var $516=HEAP32[(($cl_errcode_ret)>>2)];
   var $517=$queue;
   var $518=$517;
   var $519=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$515,HEAP32[(((tempVarArgs)+(8))>>2)]=$516,HEAP32[(((tempVarArgs)+(16))>>2)]=$518,tempVarArgs)); STACKTOP=tempVarArgs;
   var $520=$context;
   var $$etemp$71$0=0;
   var $$etemp$71$1=0;
   var $521=_clCreateCommandQueue($520, 0, $$etemp$71$0, $$etemp$71$1, $cl_errcode_ret);
   $queue=$521;
   var $522=$counter;
   var $523=((($522)+(1))|0);
   $counter=$523;
   var $524=HEAP32[(($cl_errcode_ret)>>2)];
   var $525=$queue;
   var $526=$525;
   var $527=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$523,HEAP32[(((tempVarArgs)+(8))>>2)]=$524,HEAP32[(((tempVarArgs)+(16))>>2)]=$526,tempVarArgs)); STACKTOP=tempVarArgs;
   var $528=$context;
   var $529=HEAP32[(($first_device_id)>>2)];
   var $$etemp$72$0=0;
   var $$etemp$72$1=0;
   var $530=_clCreateCommandQueue($528, $529, $$etemp$72$0, $$etemp$72$1, $cl_errcode_ret);
   $queue=$530;
   var $531=$counter;
   var $532=((($531)+(1))|0);
   $counter=$532;
   var $533=HEAP32[(($cl_errcode_ret)>>2)];
   var $534=$queue;
   var $535=$534;
   var $536=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$532,HEAP32[(((tempVarArgs)+(8))>>2)]=$533,HEAP32[(((tempVarArgs)+(16))>>2)]=$535,tempVarArgs)); STACKTOP=tempVarArgs;
   var $537=$context;
   var $538=HEAP32[(($first_device_id)>>2)];
   var $$etemp$73$0=1;
   var $$etemp$73$1=0;
   var $539=_clCreateCommandQueue($537, $538, $$etemp$73$0, $$etemp$73$1, $cl_errcode_ret);
   $queue=$539;
   var $540=$counter;
   var $541=((($540)+(1))|0);
   $counter=$541;
   var $542=HEAP32[(($cl_errcode_ret)>>2)];
   var $543=$queue;
   var $544=$543;
   var $545=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$541,HEAP32[(((tempVarArgs)+(8))>>2)]=$542,HEAP32[(((tempVarArgs)+(16))>>2)]=$544,tempVarArgs)); STACKTOP=tempVarArgs;
   var $546=$context;
   var $547=HEAP32[(($first_device_id)>>2)];
   var $$etemp$74$0=3;
   var $$etemp$74$1=0;
   var $548=_clCreateCommandQueue($546, $547, $$etemp$74$0, $$etemp$74$1, $cl_errcode_ret);
   $queue=$548;
   var $549=$counter;
   var $550=((($549)+(1))|0);
   $counter=$550;
   var $551=HEAP32[(($cl_errcode_ret)>>2)];
   var $552=$queue;
   var $553=$552;
   var $554=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$550,HEAP32[(((tempVarArgs)+(8))>>2)]=$551,HEAP32[(((tempVarArgs)+(16))>>2)]=$553,tempVarArgs)); STACKTOP=tempVarArgs;
   var $555=$context;
   var $556=HEAP32[(($first_device_id)>>2)];
   var $$etemp$75$0=2;
   var $$etemp$75$1=0;
   var $557=_clCreateCommandQueue($555, $556, $$etemp$75$0, $$etemp$75$1, $cl_errcode_ret);
   $queue=$557;
   var $558=$counter;
   var $559=((($558)+(1))|0);
   $counter=$559;
   var $560=HEAP32[(($cl_errcode_ret)>>2)];
   var $561=$queue;
   var $562=$561;
   var $563=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$559,HEAP32[(((tempVarArgs)+(8))>>2)]=$560,HEAP32[(((tempVarArgs)+(16))>>2)]=$562,tempVarArgs)); STACKTOP=tempVarArgs;
   var $564=_printf(((2112)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $565=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $566=$context;
   var $567=HEAP32[(($first_device_id)>>2)];
   var $$etemp$76$0=2;
   var $$etemp$76$1=0;
   var $568=_clCreateCommandQueue($566, $567, $$etemp$76$0, $$etemp$76$1, $cl_errcode_ret);
   $queue_to_release=$568;
   var $569=$array_command_info;
   assert(16 % 1 === 0);HEAP32[(($569)>>2)]=HEAP32[((624)>>2)];HEAP32[((($569)+(4))>>2)]=HEAP32[((628)>>2)];HEAP32[((($569)+(8))>>2)]=HEAP32[((632)>>2)];HEAP32[((($569)+(12))>>2)]=HEAP32[((636)>>2)];
   $i10=0;
   label = 31; break;
  case 31: 
   var $571=$i10;
   var $572=(($571)|(0)) < 4;
   if ($572) { label = 32; break; } else { label = 34; break; }
  case 32: 
   var $574=$queue_to_release;
   var $575=$i10;
   var $576=(($array_command_info+($575<<2))|0);
   var $577=HEAP32[(($576)>>2)];
   var $578=$value;
   var $579=_clGetCommandQueueInfo($574, $577, 4, $578, $size);
   HEAP32[(($err)>>2)]=$579;
   var $580=$counter;
   var $581=((($580)+(1))|0);
   $counter=$581;
   var $582=$i10;
   var $583=(($array_command_info+($582<<2))|0);
   var $584=HEAP32[(($583)>>2)];
   var $585=HEAP32[(($err)>>2)];
   var $586=HEAP32[(($size)>>2)];
   var $587=HEAP32[(($value)>>2)];
   var $588=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$581,HEAP32[(((tempVarArgs)+(8))>>2)]=$584,HEAP32[(((tempVarArgs)+(16))>>2)]=$585,HEAP32[(((tempVarArgs)+(24))>>2)]=$586,HEAP32[(((tempVarArgs)+(32))>>2)]=$587,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 33; break;
  case 33: 
   var $590=$i10;
   var $591=((($590)+(1))|0);
   $i10=$591;
   label = 31; break;
  case 34: 
   var $593=_printf(((2080)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $594=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $595=_clReleaseCommandQueue(0);
   HEAP32[(($err)>>2)]=$595;
   var $596=$counter;
   var $597=((($596)+(1))|0);
   $counter=$597;
   var $598=HEAP32[(($err)>>2)];
   var $599=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$597,HEAP32[(((tempVarArgs)+(8))>>2)]=$598,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $600=$queue_to_release;
   var $601=_clReleaseCommandQueue($600);
   HEAP32[(($err)>>2)]=$601;
   var $602=$counter;
   var $603=((($602)+(1))|0);
   $counter=$603;
   var $604=HEAP32[(($err)>>2)];
   var $605=$queue_to_release;
   var $606=$605;
   var $607=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$603,HEAP32[(((tempVarArgs)+(8))>>2)]=$604,HEAP32[(((tempVarArgs)+(16))>>2)]=$606,tempVarArgs)); STACKTOP=tempVarArgs;
   var $608=_printf(((2056)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $609=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $610=$array_buffer_flags;
   assert(24 % 1 === 0);HEAP32[(($610)>>2)]=HEAP32[((640)>>2)];HEAP32[((($610)+(4))>>2)]=HEAP32[((644)>>2)];HEAP32[((($610)+(8))>>2)]=HEAP32[((648)>>2)];HEAP32[((($610)+(12))>>2)]=HEAP32[((652)>>2)];HEAP32[((($610)+(16))>>2)]=HEAP32[((656)>>2)];HEAP32[((($610)+(20))>>2)]=HEAP32[((660)>>2)];
   $pixelCount=10;
   var $611=$pixelCount;
   var $612=((($611)*(12))&-1);
   var $613=_malloc($612);
   var $614=$613;
   $pixels=$614;
   var $615=$pixelCount;
   var $616=((($615)*(12))&-1);
   $sizeBytes=$616;
   var $617=$pixelCount;
   var $618=((($617)*(12))&-1);
   var $619=_malloc($618);
   var $620=$619;
   $pixels2=$620;
   var $621=$pixelCount;
   var $622=((($621)*(12))&-1);
   $sizeBytes2=$622;
   $i=0;
   label = 35; break;
  case 35: 
   var $624=$i;
   var $625=$pixelCount;
   var $626=(($624)|(0)) < (($625)|(0));
   if ($626) { label = 36; break; } else { label = 38; break; }
  case 36: 
   var $628=_rand();
   var $629=(($628)|(0));
   var $630=($629)/(2147483648);
   var $631=$i;
   var $632=$pixels;
   var $633=(($632+($631<<2))|0);
   HEAPF32[(($633)>>2)]=$630;
   var $634=_rand();
   var $635=(($634)|(0));
   var $636=($635)/(2147483648);
   var $637=($636)*(100);
   var $638=(($637)&-1);
   var $639=$i;
   var $640=$pixels2;
   var $641=(($640+($639<<2))|0);
   HEAP32[(($641)>>2)]=$638;
   label = 37; break;
  case 37: 
   var $643=$i;
   var $644=((($643)+(1))|0);
   $i=$644;
   label = 35; break;
  case 38: 
   $i11=0;
   label = 39; break;
  case 39: 
   var $647=$i11;
   var $648=(($647)|(0)) < 3;
   if ($648) { label = 40; break; } else { label = 42; break; }
  case 40: 
   var $650=$context;
   var $651=$i11;
   var $652=(($array_buffer_flags+($651<<3))|0);
   var $ld$77$0=(($652)|0);
   var $653$0=HEAP32[(($ld$77$0)>>2)];
   var $ld$78$1=(($652+4)|0);
   var $653$1=HEAP32[(($ld$78$1)>>2)];
   var $654=_clCreateBuffer($650, $653$0, $653$1, 4, 0, $cl_errcode_ret);
   $buff=$654;
   var $655=$counter;
   var $656=((($655)+(1))|0);
   $counter=$656;
   var $657=$i11;
   var $658=(($array_buffer_flags+($657<<3))|0);
   var $ld$79$0=(($658)|0);
   var $659$0=HEAP32[(($ld$79$0)>>2)];
   var $ld$80$1=(($658+4)|0);
   var $659$1=HEAP32[(($ld$80$1)>>2)];
   var $660=$buff;
   var $661=$660;
   var $662=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$81=((2032)|0);
   var $663=_printf($$etemp$81, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$656,HEAP32[(((tempVarArgs)+(8))>>2)]=$659$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$659$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$661,HEAP32[(((tempVarArgs)+(32))>>2)]=$662,tempVarArgs)); STACKTOP=tempVarArgs;
   var $664=$context;
   var $665=$i11;
   var $666=(($array_buffer_flags+($665<<3))|0);
   var $ld$82$0=(($666)|0);
   var $667$0=HEAP32[(($ld$82$0)>>2)];
   var $ld$83$1=(($666+4)|0);
   var $667$1=HEAP32[(($ld$83$1)>>2)];
   var $$etemp$84$0=16;
   var $$etemp$84$1=0;
   var $668$0=$667$0 | $$etemp$84$0;
   var $668$1=$667$1 | $$etemp$84$1;
   var $669=$sizeBytes;
   var $670=_clCreateBuffer($664, $668$0, $668$1, $669, 0, $cl_errcode_ret);
   $buff=$670;
   var $671=$counter;
   var $672=((($671)+(1))|0);
   $counter=$672;
   var $673=$i11;
   var $674=(($array_buffer_flags+($673<<3))|0);
   var $ld$85$0=(($674)|0);
   var $675$0=HEAP32[(($ld$85$0)>>2)];
   var $ld$86$1=(($674+4)|0);
   var $675$1=HEAP32[(($ld$86$1)>>2)];
   var $676=$buff;
   var $677=$676;
   var $678=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$87=((2032)|0);
   var $679=_printf($$etemp$87, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$672,HEAP32[(((tempVarArgs)+(8))>>2)]=$675$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$675$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$677,HEAP32[(((tempVarArgs)+(32))>>2)]=$678,tempVarArgs)); STACKTOP=tempVarArgs;
   var $680=$context;
   var $681=$i11;
   var $682=(($array_buffer_flags+($681<<3))|0);
   var $ld$88$0=(($682)|0);
   var $683$0=HEAP32[(($ld$88$0)>>2)];
   var $ld$89$1=(($682+4)|0);
   var $683$1=HEAP32[(($ld$89$1)>>2)];
   var $$etemp$90$0=32;
   var $$etemp$90$1=0;
   var $684$0=$683$0 | $$etemp$90$0;
   var $684$1=$683$1 | $$etemp$90$1;
   var $685=$sizeBytes;
   var $686=$pixels;
   var $687=$686;
   var $688=_clCreateBuffer($680, $684$0, $684$1, $685, $687, $cl_errcode_ret);
   $buff=$688;
   var $689=$counter;
   var $690=((($689)+(1))|0);
   $counter=$690;
   var $691=$i11;
   var $692=(($array_buffer_flags+($691<<3))|0);
   var $ld$91$0=(($692)|0);
   var $693$0=HEAP32[(($ld$91$0)>>2)];
   var $ld$92$1=(($692+4)|0);
   var $693$1=HEAP32[(($ld$92$1)>>2)];
   var $694=$buff;
   var $695=$694;
   var $696=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$93=((2032)|0);
   var $697=_printf($$etemp$93, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$690,HEAP32[(((tempVarArgs)+(8))>>2)]=$693$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$693$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$695,HEAP32[(((tempVarArgs)+(32))>>2)]=$696,tempVarArgs)); STACKTOP=tempVarArgs;
   var $698=$context;
   var $699=$i11;
   var $700=(($array_buffer_flags+($699<<3))|0);
   var $ld$94$0=(($700)|0);
   var $701$0=HEAP32[(($ld$94$0)>>2)];
   var $ld$95$1=(($700+4)|0);
   var $701$1=HEAP32[(($ld$95$1)>>2)];
   var $$etemp$96$0=32;
   var $$etemp$96$1=0;
   var $702$0=$701$0 | $$etemp$96$0;
   var $702$1=$701$1 | $$etemp$96$1;
   var $703=$sizeBytes2;
   var $704=$pixels2;
   var $705=$704;
   var $706=_clCreateBuffer($698, $702$0, $702$1, $703, $705, $cl_errcode_ret);
   $buff=$706;
   var $707=$counter;
   var $708=((($707)+(1))|0);
   $counter=$708;
   var $709=$i11;
   var $710=(($array_buffer_flags+($709<<3))|0);
   var $ld$97$0=(($710)|0);
   var $711$0=HEAP32[(($ld$97$0)>>2)];
   var $ld$98$1=(($710+4)|0);
   var $711$1=HEAP32[(($ld$98$1)>>2)];
   var $712=$buff;
   var $713=$712;
   var $714=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$99=((2032)|0);
   var $715=_printf($$etemp$99, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$708,HEAP32[(((tempVarArgs)+(8))>>2)]=$711$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$711$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$713,HEAP32[(((tempVarArgs)+(32))>>2)]=$714,tempVarArgs)); STACKTOP=tempVarArgs;
   var $716=$context;
   var $717=$i11;
   var $718=(($array_buffer_flags+($717<<3))|0);
   var $ld$100$0=(($718)|0);
   var $719$0=HEAP32[(($ld$100$0)>>2)];
   var $ld$101$1=(($718+4)|0);
   var $719$1=HEAP32[(($ld$101$1)>>2)];
   var $$etemp$102$0=8;
   var $$etemp$102$1=0;
   var $720$0=$719$0 | $$etemp$102$0;
   var $720$1=$719$1 | $$etemp$102$1;
   var $721=$sizeBytes2;
   var $722=$pixels2;
   var $723=$722;
   var $724=_clCreateBuffer($716, $720$0, $720$1, $721, $723, $cl_errcode_ret);
   $buff=$724;
   var $725=$counter;
   var $726=((($725)+(1))|0);
   $counter=$726;
   var $727=$i11;
   var $728=(($array_buffer_flags+($727<<3))|0);
   var $ld$103$0=(($728)|0);
   var $729$0=HEAP32[(($ld$103$0)>>2)];
   var $ld$104$1=(($728+4)|0);
   var $729$1=HEAP32[(($ld$104$1)>>2)];
   var $730=$buff;
   var $731=$730;
   var $732=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$105=((2032)|0);
   var $733=_printf($$etemp$105, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$726,HEAP32[(((tempVarArgs)+(8))>>2)]=$729$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$729$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$731,HEAP32[(((tempVarArgs)+(32))>>2)]=$732,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 41; break;
  case 41: 
   var $735=$i11;
   var $736=((($735)+(1))|0);
   $i11=$736;
   label = 39; break;
  case 42: 
   var $738=_printf(((2000)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $739=_printf(((1936)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $740=$region1;
   assert(8 % 1 === 0);HEAP32[(($740)>>2)]=HEAP32[((32)>>2)];HEAP32[((($740)+(4))>>2)]=HEAP32[((36)>>2)];
   var $741=$region2;
   assert(8 % 1 === 0);HEAP32[(($741)>>2)]=HEAP32[((24)>>2)];HEAP32[((($741)+(4))>>2)]=HEAP32[((28)>>2)];
   var $742=$region3;
   assert(8 % 1 === 0);HEAP32[(($742)>>2)]=HEAP32[((16)>>2)];HEAP32[((($742)+(4))>>2)]=HEAP32[((20)>>2)];
   var $743=$region4;
   assert(8 % 1 === 0);HEAP32[(($743)>>2)]=HEAP32[((8)>>2)];HEAP32[((($743)+(4))>>2)]=HEAP32[((12)>>2)];
   $subbuffer=0;
   $i12=0;
   label = 43; break;
  case 43: 
   var $745=$i12;
   var $746=(($745)|(0)) < 3;
   if ($746) { label = 44; break; } else { label = 46; break; }
  case 44: 
   var $748=$buff;
   var $749=$i12;
   var $750=(($array_buffer_flags+($749<<3))|0);
   var $ld$106$0=(($750)|0);
   var $751$0=HEAP32[(($ld$106$0)>>2)];
   var $ld$107$1=(($750+4)|0);
   var $751$1=HEAP32[(($ld$107$1)>>2)];
   var $752=$region2;
   var $753=_clCreateSubBuffer($748, $751$0, $751$1, 4640, $752, $cl_errcode_ret);
   $subbuffer=$753;
   var $754=$counter;
   var $755=((($754)+(1))|0);
   $counter=$755;
   var $756=$i12;
   var $757=(($array_buffer_flags+($756<<3))|0);
   var $ld$108$0=(($757)|0);
   var $758$0=HEAP32[(($ld$108$0)>>2)];
   var $ld$109$1=(($757+4)|0);
   var $758$1=HEAP32[(($ld$109$1)>>2)];
   var $759=$subbuffer;
   var $760=$759;
   var $761=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$110=((2032)|0);
   var $762=_printf($$etemp$110, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$755,HEAP32[(((tempVarArgs)+(8))>>2)]=$758$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$758$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$760,HEAP32[(((tempVarArgs)+(32))>>2)]=$761,tempVarArgs)); STACKTOP=tempVarArgs;
   var $763=$buff;
   var $764=$i12;
   var $765=(($array_buffer_flags+($764<<3))|0);
   var $ld$111$0=(($765)|0);
   var $766$0=HEAP32[(($ld$111$0)>>2)];
   var $ld$112$1=(($765+4)|0);
   var $766$1=HEAP32[(($ld$112$1)>>2)];
   var $767=$region3;
   var $768=_clCreateSubBuffer($763, $766$0, $766$1, 4640, $767, $cl_errcode_ret);
   $subbuffer=$768;
   var $769=$counter;
   var $770=((($769)+(1))|0);
   $counter=$770;
   var $771=$i12;
   var $772=(($array_buffer_flags+($771<<3))|0);
   var $ld$113$0=(($772)|0);
   var $773$0=HEAP32[(($ld$113$0)>>2)];
   var $ld$114$1=(($772+4)|0);
   var $773$1=HEAP32[(($ld$114$1)>>2)];
   var $774=$subbuffer;
   var $775=$774;
   var $776=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$115=((2032)|0);
   var $777=_printf($$etemp$115, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$770,HEAP32[(((tempVarArgs)+(8))>>2)]=$773$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$773$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$775,HEAP32[(((tempVarArgs)+(32))>>2)]=$776,tempVarArgs)); STACKTOP=tempVarArgs;
   var $778=$buff;
   var $779=$i12;
   var $780=(($array_buffer_flags+($779<<3))|0);
   var $ld$116$0=(($780)|0);
   var $781$0=HEAP32[(($ld$116$0)>>2)];
   var $ld$117$1=(($780+4)|0);
   var $781$1=HEAP32[(($ld$117$1)>>2)];
   var $782=$region4;
   var $783=_clCreateSubBuffer($778, $781$0, $781$1, 4640, $782, $cl_errcode_ret);
   $subbuffer=$783;
   var $784=$counter;
   var $785=((($784)+(1))|0);
   $counter=$785;
   var $786=$i12;
   var $787=(($array_buffer_flags+($786<<3))|0);
   var $ld$118$0=(($787)|0);
   var $788$0=HEAP32[(($ld$118$0)>>2)];
   var $ld$119$1=(($787+4)|0);
   var $788$1=HEAP32[(($ld$119$1)>>2)];
   var $789=$subbuffer;
   var $790=$789;
   var $791=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$120=((2032)|0);
   var $792=_printf($$etemp$120, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$785,HEAP32[(((tempVarArgs)+(8))>>2)]=$788$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$788$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$790,HEAP32[(((tempVarArgs)+(32))>>2)]=$791,tempVarArgs)); STACKTOP=tempVarArgs;
   var $793=$buff;
   var $794=$i12;
   var $795=(($array_buffer_flags+($794<<3))|0);
   var $ld$121$0=(($795)|0);
   var $796$0=HEAP32[(($ld$121$0)>>2)];
   var $ld$122$1=(($795+4)|0);
   var $796$1=HEAP32[(($ld$122$1)>>2)];
   var $797=$region3;
   var $798=_clCreateSubBuffer($793, $796$0, $796$1, 4640, $797, $cl_errcode_ret);
   $subbuffer=$798;
   var $799=$counter;
   var $800=((($799)+(1))|0);
   $counter=$800;
   var $801=$i12;
   var $802=(($array_buffer_flags+($801<<3))|0);
   var $ld$123$0=(($802)|0);
   var $803$0=HEAP32[(($ld$123$0)>>2)];
   var $ld$124$1=(($802+4)|0);
   var $803$1=HEAP32[(($ld$124$1)>>2)];
   var $804=$subbuffer;
   var $805=$804;
   var $806=HEAP32[(($cl_errcode_ret)>>2)];
   var $$etemp$125=((2032)|0);
   var $807=_printf($$etemp$125, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$800,HEAP32[(((tempVarArgs)+(8))>>2)]=$803$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$803$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$805,HEAP32[(((tempVarArgs)+(32))>>2)]=$806,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 45; break;
  case 45: 
   var $809=$i12;
   var $810=((($809)+(1))|0);
   $i12=$810;
   label = 43; break;
  case 46: 
   var $812=_printf(((1904)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $813=_printf(((1936)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $814=(($img_fmt)|0);
   HEAP32[(($814)>>2)]=4277;
   var $815=(($img_fmt+4)|0);
   HEAP32[(($815)>>2)]=4318;
   var $816=(($img_fmt2)|0);
   HEAP32[(($816)>>2)]=4277;
   var $817=(($img_fmt2+4)|0);
   HEAP32[(($817)>>2)]=4306;
   var $818=(($img_fmt3)|0);
   HEAP32[(($818)>>2)]=4279;
   var $819=(($img_fmt3+4)|0);
   HEAP32[(($819)>>2)]=4316;
   $height=10;
   $width=10;
   $i13=0;
   label = 47; break;
  case 47: 
   var $821=$i13;
   var $822=(($821)|(0)) < 3;
   if ($822) { label = 48; break; } else { label = 50; break; }
  case 48: 
   var $824=$context;
   var $825=$i13;
   var $826=(($array_buffer_flags+($825<<3))|0);
   var $ld$126$0=(($826)|0);
   var $827$0=HEAP32[(($ld$126$0)>>2)];
   var $ld$127$1=(($826+4)|0);
   var $827$1=HEAP32[(($ld$127$1)>>2)];
   var $828=$width;
   var $829=$height;
   var $830=_clCreateImage2D($824, $827$0, $827$1, $img_fmt, $828, $829, 0, 0, $cl_errcode_ret);
   $image=$830;
   var $831=$counter;
   var $832=((($831)+(1))|0);
   $counter=$832;
   var $833=$i13;
   var $834=(($array_buffer_flags+($833<<3))|0);
   var $ld$128$0=(($834)|0);
   var $835$0=HEAP32[(($ld$128$0)>>2)];
   var $ld$129$1=(($834+4)|0);
   var $835$1=HEAP32[(($ld$129$1)>>2)];
   var $836=$image;
   var $837=$836;
   var $838=HEAP32[(($cl_errcode_ret)>>2)];
   var $839=(($img_fmt)|0);
   var $840=HEAP32[(($839)>>2)];
   var $841=(($img_fmt+4)|0);
   var $842=HEAP32[(($841)>>2)];
   var $$etemp$130=((1872)|0);
   var $843=_printf($$etemp$130, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 56)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$832,HEAP32[(((tempVarArgs)+(8))>>2)]=$835$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$835$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$837,HEAP32[(((tempVarArgs)+(32))>>2)]=$838,HEAP32[(((tempVarArgs)+(40))>>2)]=$840,HEAP32[(((tempVarArgs)+(48))>>2)]=$842,tempVarArgs)); STACKTOP=tempVarArgs;
   var $844=$context;
   var $845=$i13;
   var $846=(($array_buffer_flags+($845<<3))|0);
   var $ld$131$0=(($846)|0);
   var $847$0=HEAP32[(($ld$131$0)>>2)];
   var $ld$132$1=(($846+4)|0);
   var $847$1=HEAP32[(($ld$132$1)>>2)];
   var $848=$width;
   var $849=$height;
   var $850=_clCreateImage2D($844, $847$0, $847$1, $img_fmt3, $848, $849, 0, 0, $cl_errcode_ret);
   $image=$850;
   var $851=$counter;
   var $852=((($851)+(1))|0);
   $counter=$852;
   var $853=$i13;
   var $854=(($array_buffer_flags+($853<<3))|0);
   var $ld$133$0=(($854)|0);
   var $855$0=HEAP32[(($ld$133$0)>>2)];
   var $ld$134$1=(($854+4)|0);
   var $855$1=HEAP32[(($ld$134$1)>>2)];
   var $856=$image;
   var $857=$856;
   var $858=HEAP32[(($cl_errcode_ret)>>2)];
   var $859=(($img_fmt3)|0);
   var $860=HEAP32[(($859)>>2)];
   var $861=(($img_fmt3+4)|0);
   var $862=HEAP32[(($861)>>2)];
   var $$etemp$135=((1872)|0);
   var $863=_printf($$etemp$135, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 56)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$852,HEAP32[(((tempVarArgs)+(8))>>2)]=$855$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$855$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$857,HEAP32[(((tempVarArgs)+(32))>>2)]=$858,HEAP32[(((tempVarArgs)+(40))>>2)]=$860,HEAP32[(((tempVarArgs)+(48))>>2)]=$862,tempVarArgs)); STACKTOP=tempVarArgs;
   var $864=$context;
   var $865=$i13;
   var $866=(($array_buffer_flags+($865<<3))|0);
   var $ld$136$0=(($866)|0);
   var $867$0=HEAP32[(($ld$136$0)>>2)];
   var $ld$137$1=(($866+4)|0);
   var $867$1=HEAP32[(($ld$137$1)>>2)];
   var $$etemp$138$0=32;
   var $$etemp$138$1=0;
   var $868$0=$867$0 | $$etemp$138$0;
   var $868$1=$867$1 | $$etemp$138$1;
   var $869=$width;
   var $870=$height;
   var $871=$pixels2;
   var $872=$871;
   var $873=_clCreateImage2D($864, $868$0, $868$1, $img_fmt2, $869, $870, 0, $872, $cl_errcode_ret);
   $image=$873;
   var $874=$counter;
   var $875=((($874)+(1))|0);
   $counter=$875;
   var $876=$i13;
   var $877=(($array_buffer_flags+($876<<3))|0);
   var $ld$139$0=(($877)|0);
   var $878$0=HEAP32[(($ld$139$0)>>2)];
   var $ld$140$1=(($877+4)|0);
   var $878$1=HEAP32[(($ld$140$1)>>2)];
   var $879=$image;
   var $880=$879;
   var $881=HEAP32[(($cl_errcode_ret)>>2)];
   var $882=(($img_fmt2)|0);
   var $883=HEAP32[(($882)>>2)];
   var $884=(($img_fmt2+4)|0);
   var $885=HEAP32[(($884)>>2)];
   var $$etemp$141=((1872)|0);
   var $886=_printf($$etemp$141, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 56)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$875,HEAP32[(((tempVarArgs)+(8))>>2)]=$878$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$878$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$880,HEAP32[(((tempVarArgs)+(32))>>2)]=$881,HEAP32[(((tempVarArgs)+(40))>>2)]=$883,HEAP32[(((tempVarArgs)+(48))>>2)]=$885,tempVarArgs)); STACKTOP=tempVarArgs;
   var $887=$context;
   var $888=$i13;
   var $889=(($array_buffer_flags+($888<<3))|0);
   var $ld$142$0=(($889)|0);
   var $890$0=HEAP32[(($ld$142$0)>>2)];
   var $ld$143$1=(($889+4)|0);
   var $890$1=HEAP32[(($ld$143$1)>>2)];
   var $891=$width;
   var $892=$height;
   var $893=_clCreateImage2D($887, $890$0, $890$1, $img_fmt2, $891, $892, 0, 0, $cl_errcode_ret);
   $image=$893;
   var $894=$counter;
   var $895=((($894)+(1))|0);
   $counter=$895;
   var $896=$i13;
   var $897=(($array_buffer_flags+($896<<3))|0);
   var $ld$144$0=(($897)|0);
   var $898$0=HEAP32[(($ld$144$0)>>2)];
   var $ld$145$1=(($897+4)|0);
   var $898$1=HEAP32[(($ld$145$1)>>2)];
   var $899=$image;
   var $900=$899;
   var $901=HEAP32[(($cl_errcode_ret)>>2)];
   var $902=(($img_fmt2)|0);
   var $903=HEAP32[(($902)>>2)];
   var $904=(($img_fmt2+4)|0);
   var $905=HEAP32[(($904)>>2)];
   var $$etemp$146=((1872)|0);
   var $906=_printf($$etemp$146, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 56)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$895,HEAP32[(((tempVarArgs)+(8))>>2)]=$898$0,HEAP32[(((tempVarArgs)+(16))>>2)]=$898$1,HEAP32[(((tempVarArgs)+(24))>>2)]=$900,HEAP32[(((tempVarArgs)+(32))>>2)]=$901,HEAP32[(((tempVarArgs)+(40))>>2)]=$903,HEAP32[(((tempVarArgs)+(48))>>2)]=$905,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 49; break;
  case 49: 
   var $908=$i13;
   var $909=((($908)+(1))|0);
   $i13=$909;
   label = 47; break;
  case 50: 
   var $911=_printf(((1840)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $912=_printf(((1808)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $913=$array_mem_info;
   assert(36 % 1 === 0);(_memcpy($913, 176, 36)|0);
   $i14=0;
   label = 51; break;
  case 51: 
   var $915=$i14;
   var $916=(($915)|(0)) < 9;
   if ($916) { label = 52; break; } else { label = 54; break; }
  case 52: 
   var $918=$subbuffer;
   var $919=$i14;
   var $920=(($array_mem_info+($919<<2))|0);
   var $921=HEAP32[(($920)>>2)];
   var $922=$value;
   var $923=_clGetMemObjectInfo($918, $921, 4, $922, $size);
   HEAP32[(($err)>>2)]=$923;
   var $924=$counter;
   var $925=((($924)+(1))|0);
   $counter=$925;
   var $926=$i14;
   var $927=(($array_mem_info+($926<<2))|0);
   var $928=HEAP32[(($927)>>2)];
   var $929=HEAP32[(($err)>>2)];
   var $930=HEAP32[(($size)>>2)];
   var $931=HEAP32[(($value)>>2)];
   var $932=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$925,HEAP32[(((tempVarArgs)+(8))>>2)]=$928,HEAP32[(((tempVarArgs)+(16))>>2)]=$929,HEAP32[(((tempVarArgs)+(24))>>2)]=$930,HEAP32[(((tempVarArgs)+(32))>>2)]=$931,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 53; break;
  case 53: 
   var $934=$i14;
   var $935=((($934)+(1))|0);
   $i14=$935;
   label = 51; break;
  case 54: 
   var $937=$buff;
   var $938=(($array_mem_info+32)|0);
   var $939=HEAP32[(($938)>>2)];
   var $940=$value;
   var $941=_clGetMemObjectInfo($937, $939, 4, $940, $size);
   HEAP32[(($err)>>2)]=$941;
   var $942=$counter;
   var $943=((($942)+(1))|0);
   $counter=$943;
   var $944=(($array_mem_info+32)|0);
   var $945=HEAP32[(($944)>>2)];
   var $946=HEAP32[(($err)>>2)];
   var $947=HEAP32[(($size)>>2)];
   var $948=HEAP32[(($value)>>2)];
   var $949=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$943,HEAP32[(((tempVarArgs)+(8))>>2)]=$945,HEAP32[(((tempVarArgs)+(16))>>2)]=$946,HEAP32[(((tempVarArgs)+(24))>>2)]=$947,HEAP32[(((tempVarArgs)+(32))>>2)]=$948,tempVarArgs)); STACKTOP=tempVarArgs;
   var $950=_printf(((1784)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $951=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $952=$array_img_info;
   assert(28 % 1 === 0);HEAP32[(($952)>>2)]=HEAP32[((568)>>2)];HEAP32[((($952)+(4))>>2)]=HEAP32[((572)>>2)];HEAP32[((($952)+(8))>>2)]=HEAP32[((576)>>2)];HEAP32[((($952)+(12))>>2)]=HEAP32[((580)>>2)];HEAP32[((($952)+(16))>>2)]=HEAP32[((584)>>2)];HEAP32[((($952)+(20))>>2)]=HEAP32[((588)>>2)];HEAP32[((($952)+(24))>>2)]=HEAP32[((592)>>2)];
   $i15=0;
   label = 55; break;
  case 55: 
   var $954=$i15;
   var $955=(($954)|(0)) < 7;
   if ($955) { label = 56; break; } else { label = 58; break; }
  case 56: 
   var $957=$image;
   var $958=$i15;
   var $959=(($array_img_info+($958<<2))|0);
   var $960=HEAP32[(($959)>>2)];
   var $961=$value;
   var $962=_clGetImageInfo($957, $960, 4, $961, $size);
   HEAP32[(($err)>>2)]=$962;
   var $963=$counter;
   var $964=((($963)+(1))|0);
   $counter=$964;
   var $965=$i15;
   var $966=(($array_img_info+($965<<2))|0);
   var $967=HEAP32[(($966)>>2)];
   var $968=HEAP32[(($err)>>2)];
   var $969=HEAP32[(($size)>>2)];
   var $970=HEAP32[(($value)>>2)];
   var $971=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$964,HEAP32[(((tempVarArgs)+(8))>>2)]=$967,HEAP32[(((tempVarArgs)+(16))>>2)]=$968,HEAP32[(((tempVarArgs)+(24))>>2)]=$969,HEAP32[(((tempVarArgs)+(32))>>2)]=$970,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 57; break;
  case 57: 
   var $973=$i15;
   var $974=((($973)+(1))|0);
   $i15=$974;
   label = 55; break;
  case 58: 
   var $976=_printf(((1752)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $977=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $978=_clReleaseMemObject(0);
   HEAP32[(($err)>>2)]=$978;
   var $979=$counter;
   var $980=((($979)+(1))|0);
   $counter=$980;
   var $981=HEAP32[(($err)>>2)];
   var $982=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$980,HEAP32[(((tempVarArgs)+(8))>>2)]=$981,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $983=$subbuffer;
   var $984=_clReleaseMemObject($983);
   HEAP32[(($err)>>2)]=$984;
   var $985=$counter;
   var $986=((($985)+(1))|0);
   $counter=$986;
   var $987=HEAP32[(($err)>>2)];
   var $988=$subbuffer;
   var $989=$988;
   var $990=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$986,HEAP32[(((tempVarArgs)+(8))>>2)]=$987,HEAP32[(((tempVarArgs)+(16))>>2)]=$989,tempVarArgs)); STACKTOP=tempVarArgs;
   var $991=$image;
   var $992=_clReleaseMemObject($991);
   HEAP32[(($err)>>2)]=$992;
   var $993=$counter;
   var $994=((($993)+(1))|0);
   $counter=$994;
   var $995=HEAP32[(($err)>>2)];
   var $996=$image;
   var $997=$996;
   var $998=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$994,HEAP32[(((tempVarArgs)+(8))>>2)]=$995,HEAP32[(((tempVarArgs)+(16))>>2)]=$997,tempVarArgs)); STACKTOP=tempVarArgs;
   var $999=_printf(((1712)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1000=_printf(((1672)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($uiNumSupportedFormats)>>2)]=0;
   $i16=0;
   label = 59; break;
  case 59: 
   var $1002=$i16;
   var $1003=(($1002)|(0)) < 3;
   if ($1003) { label = 60; break; } else { label = 66; break; }
  case 60: 
   var $1005=$context;
   var $1006=$i16;
   var $1007=(($array_buffer_flags+($1006<<3))|0);
   var $ld$147$0=(($1007)|0);
   var $1008$0=HEAP32[(($ld$147$0)>>2)];
   var $ld$148$1=(($1007+4)|0);
   var $1008$1=HEAP32[(($ld$148$1)>>2)];
   var $1009=_clGetSupportedImageFormats($1005, $1008$0, $1008$1, 4337, 0, 0, $uiNumSupportedFormats);
   HEAP32[(($err)>>2)]=$1009;
   var $1010=$counter;
   var $1011=((($1010)+(1))|0);
   $counter=$1011;
   var $1012=HEAP32[(($err)>>2)];
   var $1013=HEAP32[(($uiNumSupportedFormats)>>2)];
   var $1014=_printf(((1656)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1011,HEAP32[(((tempVarArgs)+(8))>>2)]=$1012,HEAP32[(((tempVarArgs)+(16))>>2)]=$1013,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1015=HEAP32[(($uiNumSupportedFormats)>>2)];
   var $1016=_llvm_stacksave();
   $4=$1016;
   var $1017=STACKTOP;STACKTOP = (STACKTOP + ((($1015)*(8))&-1))|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3);(assert((STACKTOP|0) < (STACK_MAX|0))|0);
   var $1018=$context;
   var $1019=$i16;
   var $1020=(($array_buffer_flags+($1019<<3))|0);
   var $ld$149$0=(($1020)|0);
   var $1021$0=HEAP32[(($ld$149$0)>>2)];
   var $ld$150$1=(($1020+4)|0);
   var $1021$1=HEAP32[(($ld$150$1)>>2)];
   var $1022=HEAP32[(($uiNumSupportedFormats)>>2)];
   var $1023=_clGetSupportedImageFormats($1018, $1021$0, $1021$1, 4337, $1022, $1017, 0);
   HEAP32[(($err)>>2)]=$1023;
   $i17=0;
   label = 61; break;
  case 61: 
   var $1025=$i17;
   var $1026=HEAP32[(($uiNumSupportedFormats)>>2)];
   var $1027=(($1025)>>>(0)) < (($1026)>>>(0));
   if ($1027) { label = 62; break; } else { label = 64; break; }
  case 62: 
   var $1029=$counter;
   var $1030=((($1029)+(1))|0);
   $counter=$1030;
   var $1031=HEAP32[(($err)>>2)];
   var $1032=$i17;
   var $1033=(($1017+($1032<<3))|0);
   var $1034=(($1033)|0);
   var $1035=HEAP32[(($1034)>>2)];
   var $1036=$i17;
   var $1037=(($1017+($1036<<3))|0);
   var $1038=(($1037+4)|0);
   var $1039=HEAP32[(($1038)>>2)];
   var $1040=_printf(((1624)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1030,HEAP32[(((tempVarArgs)+(8))>>2)]=$1031,HEAP32[(((tempVarArgs)+(16))>>2)]=$1035,HEAP32[(((tempVarArgs)+(24))>>2)]=$1039,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 63; break;
  case 63: 
   var $1042=$i17;
   var $1043=((($1042)+(1))|0);
   $i17=$1043;
   label = 61; break;
  case 64: 
   var $1045=$4;
   _llvm_stackrestore($1045);
   label = 65; break;
  case 65: 
   var $1047=$i16;
   var $1048=((($1047)+(1))|0);
   $i16=$1048;
   label = 59; break;
  case 66: 
   var $1050=_printf(((1592)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1051=_printf(((1936)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1052=$addr;
   assert(20 % 1 === 0);HEAP32[(($1052)>>2)]=HEAP32[((664)>>2)];HEAP32[((($1052)+(4))>>2)]=HEAP32[((668)>>2)];HEAP32[((($1052)+(8))>>2)]=HEAP32[((672)>>2)];HEAP32[((($1052)+(12))>>2)]=HEAP32[((676)>>2)];HEAP32[((($1052)+(16))>>2)]=HEAP32[((680)>>2)];
   var $1053=$filter;
   assert(8 % 1 === 0);HEAP32[(($1053)>>2)]=HEAP32[((88)>>2)];HEAP32[((($1053)+(4))>>2)]=HEAP32[((92)>>2)];
   var $1054=$boolean;
   assert(8 % 1 === 0);HEAP32[(($1054)>>2)]=HEAP32[((96)>>2)];HEAP32[((($1054)+(4))>>2)]=HEAP32[((100)>>2)];
   $i18=0;
   label = 67; break;
  case 67: 
   var $1056=$i18;
   var $1057=(($1056)|(0)) < 5;
   if ($1057) { label = 68; break; } else { label = 78; break; }
  case 68: 
   $j=0;
   label = 69; break;
  case 69: 
   var $1060=$j;
   var $1061=(($1060)|(0)) < 2;
   if ($1061) { label = 70; break; } else { label = 76; break; }
  case 70: 
   $k=0;
   label = 71; break;
  case 71: 
   var $1064=$k;
   var $1065=(($1064)|(0)) < 2;
   if ($1065) { label = 72; break; } else { label = 74; break; }
  case 72: 
   var $1067=$context;
   var $1068=$k;
   var $1069=(($boolean+($1068<<2))|0);
   var $1070=HEAP32[(($1069)>>2)];
   var $1071=$i18;
   var $1072=(($addr+($1071<<2))|0);
   var $1073=HEAP32[(($1072)>>2)];
   var $1074=$j;
   var $1075=(($filter+($1074<<2))|0);
   var $1076=HEAP32[(($1075)>>2)];
   var $1077=_clCreateSampler($1067, $1070, $1073, $1076, $cl_errcode_ret);
   $sampler=$1077;
   var $1078=$counter;
   var $1079=((($1078)+(1))|0);
   $counter=$1079;
   var $1080=$sampler;
   var $1081=$1080;
   var $1082=HEAP32[(($cl_errcode_ret)>>2)];
   var $1083=$k;
   var $1084=(($boolean+($1083<<2))|0);
   var $1085=HEAP32[(($1084)>>2)];
   var $1086=$i18;
   var $1087=(($addr+($1086<<2))|0);
   var $1088=HEAP32[(($1087)>>2)];
   var $1089=$j;
   var $1090=(($filter+($1089<<2))|0);
   var $1091=HEAP32[(($1090)>>2)];
   var $1092=_printf(((1568)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 48)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1079,HEAP32[(((tempVarArgs)+(8))>>2)]=$1081,HEAP32[(((tempVarArgs)+(16))>>2)]=$1082,HEAP32[(((tempVarArgs)+(24))>>2)]=$1085,HEAP32[(((tempVarArgs)+(32))>>2)]=$1088,HEAP32[(((tempVarArgs)+(40))>>2)]=$1091,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 73; break;
  case 73: 
   var $1094=$k;
   var $1095=((($1094)+(1))|0);
   $k=$1095;
   label = 71; break;
  case 74: 
   label = 75; break;
  case 75: 
   var $1098=$j;
   var $1099=((($1098)+(1))|0);
   $j=$1099;
   label = 69; break;
  case 76: 
   label = 77; break;
  case 77: 
   var $1102=$i18;
   var $1103=((($1102)+(1))|0);
   $i18=$1103;
   label = 67; break;
  case 78: 
   var $1105=$context;
   var $1106=_clCreateSampler($1105, 0, 4400, 4416, $cl_errcode_ret);
   $sampler19=$1106;
   var $1107=_printf(((1536)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1108=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1109=$array_sampler_info;
   assert(20 % 1 === 0);HEAP32[(($1109)>>2)]=HEAP32[((104)>>2)];HEAP32[((($1109)+(4))>>2)]=HEAP32[((108)>>2)];HEAP32[((($1109)+(8))>>2)]=HEAP32[((112)>>2)];HEAP32[((($1109)+(12))>>2)]=HEAP32[((116)>>2)];HEAP32[((($1109)+(16))>>2)]=HEAP32[((120)>>2)];
   $i20=0;
   label = 79; break;
  case 79: 
   var $1111=$i20;
   var $1112=(($1111)|(0)) < 5;
   if ($1112) { label = 80; break; } else { label = 82; break; }
  case 80: 
   var $1114=$sampler19;
   var $1115=$i20;
   var $1116=(($array_sampler_info+($1115<<2))|0);
   var $1117=HEAP32[(($1116)>>2)];
   var $1118=$value;
   var $1119=_clGetSamplerInfo($1114, $1117, 4, $1118, $size);
   HEAP32[(($err)>>2)]=$1119;
   var $1120=$counter;
   var $1121=((($1120)+(1))|0);
   $counter=$1121;
   var $1122=$i20;
   var $1123=(($array_sampler_info+($1122<<2))|0);
   var $1124=HEAP32[(($1123)>>2)];
   var $1125=HEAP32[(($err)>>2)];
   var $1126=HEAP32[(($size)>>2)];
   var $1127=HEAP32[(($value)>>2)];
   var $1128=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1121,HEAP32[(((tempVarArgs)+(8))>>2)]=$1124,HEAP32[(((tempVarArgs)+(16))>>2)]=$1125,HEAP32[(((tempVarArgs)+(24))>>2)]=$1126,HEAP32[(((tempVarArgs)+(32))>>2)]=$1127,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 81; break;
  case 81: 
   var $1130=$i20;
   var $1131=((($1130)+(1))|0);
   $i20=$1131;
   label = 79; break;
  case 82: 
   var $1133=_printf(((1504)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1134=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1135=_clReleaseSampler(0);
   HEAP32[(($err)>>2)]=$1135;
   var $1136=$counter;
   var $1137=((($1136)+(1))|0);
   $counter=$1137;
   var $1138=HEAP32[(($err)>>2)];
   var $1139=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1137,HEAP32[(((tempVarArgs)+(8))>>2)]=$1138,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1140=$sampler19;
   var $1141=_clReleaseSampler($1140);
   HEAP32[(($err)>>2)]=$1141;
   var $1142=$counter;
   var $1143=((($1142)+(1))|0);
   $counter=$1143;
   var $1144=HEAP32[(($err)>>2)];
   var $1145=$sampler19;
   var $1146=$1145;
   var $1147=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1143,HEAP32[(((tempVarArgs)+(8))>>2)]=$1144,HEAP32[(((tempVarArgs)+(16))>>2)]=$1146,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1148=_printf(((1464)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1149=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1150=$context;
   var $1151=_clCreateProgramWithSource($1150, 1, 3552, 0, $cl_errcode_ret);
   $program=$1151;
   var $1152=$counter;
   var $1153=((($1152)+(1))|0);
   $counter=$1153;
   var $1154=$program;
   var $1155=$1154;
   var $1156=HEAP32[(($cl_errcode_ret)>>2)];
   var $1157=_printf(((2768)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1153,HEAP32[(((tempVarArgs)+(8))>>2)]=$1155,HEAP32[(((tempVarArgs)+(16))>>2)]=$1156,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1158=_printf(((1432)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1159=_printf(((1400)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1160=$context;
   var $1161=_clCreateProgramWithSource($1160, 1, 3552, 0, $cl_errcode_ret);
   $program2=$1161;
   var $1162=_clReleaseProgram(0);
   HEAP32[(($err)>>2)]=$1162;
   var $1163=$counter;
   var $1164=((($1163)+(1))|0);
   $counter=$1164;
   var $1165=HEAP32[(($err)>>2)];
   var $1166=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1164,HEAP32[(((tempVarArgs)+(8))>>2)]=$1165,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1167=$program2;
   var $1168=_clReleaseProgram($1167);
   HEAP32[(($err)>>2)]=$1168;
   var $1169=$counter;
   var $1170=((($1169)+(1))|0);
   $counter=$1170;
   var $1171=HEAP32[(($err)>>2)];
   var $1172=$program2;
   var $1173=$1172;
   var $1174=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1170,HEAP32[(((tempVarArgs)+(8))>>2)]=$1171,HEAP32[(((tempVarArgs)+(16))>>2)]=$1173,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1175=_printf(((1376)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1176=_printf(((1400)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1177=$program;
   var $1178=_clBuildProgram($1177, 0, 0, 0, 0, 0);
   HEAP32[(($err)>>2)]=$1178;
   var $1179=$counter;
   var $1180=((($1179)+(1))|0);
   $counter=$1180;
   var $1181=HEAP32[(($err)>>2)];
   var $1182=$program;
   var $1183=$1182;
   var $1184=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1180,HEAP32[(((tempVarArgs)+(8))>>2)]=$1181,HEAP32[(((tempVarArgs)+(16))>>2)]=$1183,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1185=$program;
   var $1186=HEAP32[(($first_device_id)>>2)];
   var $1187=$1186;
   var $1188=_clBuildProgram($1185, 1, $1187, 0, 0, 0);
   HEAP32[(($err)>>2)]=$1188;
   var $1189=$counter;
   var $1190=((($1189)+(1))|0);
   $counter=$1190;
   var $1191=HEAP32[(($err)>>2)];
   var $1192=$program;
   var $1193=$1192;
   var $1194=HEAP32[(($first_device_id)>>2)];
   var $1195=$1194;
   var $1196=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1190,HEAP32[(((tempVarArgs)+(8))>>2)]=$1191,HEAP32[(((tempVarArgs)+(16))>>2)]=$1193,HEAP32[(((tempVarArgs)+(24))>>2)]=$1195,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1197=_strdup(((1368)|0));
   var $1198=(($options)|0);
   HEAP32[(($1198)>>2)]=$1197;
   var $1199=_strdup(((1336)|0));
   var $1200=(($options+4)|0);
   HEAP32[(($1200)>>2)]=$1199;
   var $1201=_strdup(((1320)|0));
   var $1202=(($options+8)|0);
   HEAP32[(($1202)>>2)]=$1201;
   var $1203=_strdup(((1288)|0));
   var $1204=(($options+12)|0);
   HEAP32[(($1204)>>2)]=$1203;
   var $1205=_strdup(((1264)|0));
   var $1206=(($options+16)|0);
   HEAP32[(($1206)>>2)]=$1205;
   var $1207=_strdup(((1248)|0));
   var $1208=(($options+20)|0);
   HEAP32[(($1208)>>2)]=$1207;
   var $1209=_strdup(((1224)|0));
   var $1210=(($options+24)|0);
   HEAP32[(($1210)>>2)]=$1209;
   var $1211=_strdup(((1192)|0));
   var $1212=(($options+28)|0);
   HEAP32[(($1212)>>2)]=$1211;
   var $1213=_strdup(((1168)|0));
   var $1214=(($options+32)|0);
   HEAP32[(($1214)>>2)]=$1213;
   var $1215=_strdup(((1144)|0));
   var $1216=(($options+36)|0);
   HEAP32[(($1216)>>2)]=$1215;
   var $1217=_strdup(((1136)|0));
   var $1218=(($options+40)|0);
   HEAP32[(($1218)>>2)]=$1217;
   var $1219=_strdup(((1096)|0));
   var $1220=(($options+44)|0);
   HEAP32[(($1220)>>2)]=$1219;
   var $1221=_strdup(((1080)|0));
   var $1222=(($options+48)|0);
   HEAP32[(($1222)>>2)]=$1221;
   $i21=0;
   label = 83; break;
  case 83: 
   var $1224=$i21;
   var $1225=(($1224)|(0)) < 14;
   if ($1225) { label = 84; break; } else { label = 86; break; }
  case 84: 
   var $1227=$program;
   var $1228=HEAP32[(($first_device_id)>>2)];
   var $1229=$1228;
   var $1230=$i21;
   var $1231=(($options+($1230<<2))|0);
   var $1232=HEAP32[(($1231)>>2)];
   var $1233=_clBuildProgram($1227, 1, $1229, $1232, 0, 0);
   HEAP32[(($err)>>2)]=$1233;
   var $1234=$counter;
   var $1235=((($1234)+(1))|0);
   $counter=$1235;
   var $1236=HEAP32[(($err)>>2)];
   var $1237=$program;
   var $1238=$1237;
   var $1239=HEAP32[(($first_device_id)>>2)];
   var $1240=$1239;
   var $1241=$i21;
   var $1242=(($options+($1241<<2))|0);
   var $1243=HEAP32[(($1242)>>2)];
   var $1244=_printf(((1056)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1235,HEAP32[(((tempVarArgs)+(8))>>2)]=$1236,HEAP32[(((tempVarArgs)+(16))>>2)]=$1238,HEAP32[(((tempVarArgs)+(24))>>2)]=$1240,HEAP32[(((tempVarArgs)+(32))>>2)]=$1243,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 85; break;
  case 85: 
   var $1246=$i21;
   var $1247=((($1246)+(1))|0);
   $i21=$1247;
   label = 83; break;
  case 86: 
   var $1249=$program;
   var $1250=HEAP32[(($first_device_id)>>2)];
   var $1251=$1250;
   var $1252=$counter;
   var $1253=((($1252)+(1))|0);
   $counter=$1253;
   var $1254=$1253;
   var $1255=_clBuildProgram($1249, 1, $1251, 0, 2, $1254);
   HEAP32[(($err)>>2)]=$1255;
   var $1256=$counter;
   var $1257=((($1256)+(1))|0);
   $counter=$1257;
   var $1258=HEAP32[(($err)>>2)];
   var $1259=$program;
   var $1260=$1259;
   var $1261=HEAP32[(($first_device_id)>>2)];
   var $1262=$1261;
   var $1263=_printf(((1032)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1257,HEAP32[(((tempVarArgs)+(8))>>2)]=$1258,HEAP32[(((tempVarArgs)+(16))>>2)]=$1260,HEAP32[(((tempVarArgs)+(24))>>2)]=$1262,HEAP32[(((tempVarArgs)+(32))>>2)]=2,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1264=_printf(((1000)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1265=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   var $1266=$array_program_build_info;
   assert(12 % 1 === 0);HEAP32[(($1266)>>2)]=HEAP32[((160)>>2)];HEAP32[((($1266)+(4))>>2)]=HEAP32[((164)>>2)];HEAP32[((($1266)+(8))>>2)]=HEAP32[((168)>>2)];
   $i22=0;
   label = 87; break;
  case 87: 
   var $1268=$i22;
   var $1269=(($1268)|(0)) < 3;
   if ($1269) { label = 88; break; } else { label = 90; break; }
  case 88: 
   var $1271=$program;
   var $1272=HEAP32[(($first_device_id)>>2)];
   var $1273=$i22;
   var $1274=(($array_program_build_info+($1273<<2))|0);
   var $1275=HEAP32[(($1274)>>2)];
   var $1276=$value;
   var $1277=_clGetProgramBuildInfo($1271, $1272, $1275, 4, $1276, $size);
   HEAP32[(($err)>>2)]=$1277;
   var $1278=$counter;
   var $1279=((($1278)+(1))|0);
   $counter=$1279;
   var $1280=$i22;
   var $1281=(($array_program_build_info+($1280<<2))|0);
   var $1282=HEAP32[(($1281)>>2)];
   var $1283=HEAP32[(($err)>>2)];
   var $1284=HEAP32[(($size)>>2)];
   var $1285=HEAP32[(($value)>>2)];
   var $1286=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1279,HEAP32[(((tempVarArgs)+(8))>>2)]=$1282,HEAP32[(((tempVarArgs)+(16))>>2)]=$1283,HEAP32[(((tempVarArgs)+(24))>>2)]=$1284,HEAP32[(((tempVarArgs)+(32))>>2)]=$1285,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 89; break;
  case 89: 
   var $1288=$i22;
   var $1289=((($1288)+(1))|0);
   $i22=$1289;
   label = 87; break;
  case 90: 
   var $1291=_printf(((968)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1292=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   var $1293=$array_program_info;
   assert(28 % 1 === 0);HEAP32[(($1293)>>2)]=HEAP32[((128)>>2)];HEAP32[((($1293)+(4))>>2)]=HEAP32[((132)>>2)];HEAP32[((($1293)+(8))>>2)]=HEAP32[((136)>>2)];HEAP32[((($1293)+(12))>>2)]=HEAP32[((140)>>2)];HEAP32[((($1293)+(16))>>2)]=HEAP32[((144)>>2)];HEAP32[((($1293)+(20))>>2)]=HEAP32[((148)>>2)];HEAP32[((($1293)+(24))>>2)]=HEAP32[((152)>>2)];
   $i23=0;
   label = 91; break;
  case 91: 
   var $1295=$i23;
   var $1296=(($1295)|(0)) < 7;
   if ($1296) { label = 92; break; } else { label = 94; break; }
  case 92: 
   var $1298=$program;
   var $1299=$i23;
   var $1300=(($array_program_info+($1299<<2))|0);
   var $1301=HEAP32[(($1300)>>2)];
   var $1302=$value;
   var $1303=_clGetProgramInfo($1298, $1301, 4, $1302, $size);
   HEAP32[(($err)>>2)]=$1303;
   var $1304=$counter;
   var $1305=((($1304)+(1))|0);
   $counter=$1305;
   var $1306=$i23;
   var $1307=(($array_program_info+($1306<<2))|0);
   var $1308=HEAP32[(($1307)>>2)];
   var $1309=HEAP32[(($err)>>2)];
   var $1310=HEAP32[(($size)>>2)];
   var $1311=HEAP32[(($value)>>2)];
   var $1312=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1305,HEAP32[(((tempVarArgs)+(8))>>2)]=$1308,HEAP32[(((tempVarArgs)+(16))>>2)]=$1309,HEAP32[(((tempVarArgs)+(24))>>2)]=$1310,HEAP32[(((tempVarArgs)+(32))>>2)]=$1311,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 93; break;
  case 93: 
   var $1314=$i23;
   var $1315=((($1314)+(1))|0);
   $i23=$1315;
   label = 91; break;
  case 94: 
   var $1317=_printf(((944)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1318=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1319=$program;
   var $1320=_clCreateKernel($1319, 0, $err);
   $kernel=$1320;
   var $1321=$counter;
   var $1322=((($1321)+(1))|0);
   $counter=$1322;
   var $1323=$program;
   var $1324=$1323;
   var $1325=HEAP32[(($err)>>2)];
   var $1326=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1322,HEAP32[(((tempVarArgs)+(8))>>2)]=$1324,HEAP32[(((tempVarArgs)+(16))>>2)]=$1325,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1327=$program;
   var $1328=_clCreateKernel($1327, ((3584)|0), $err);
   $kernel=$1328;
   var $1329=$counter;
   var $1330=((($1329)+(1))|0);
   $counter=$1330;
   var $1331=$program;
   var $1332=$1331;
   var $1333=HEAP32[(($err)>>2)];
   var $1334=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1330,HEAP32[(((tempVarArgs)+(8))>>2)]=$1332,HEAP32[(((tempVarArgs)+(16))>>2)]=$1333,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1335=$program;
   var $1336=_clCreateKernel($1335, ((936)|0), $err);
   $kernel=$1336;
   var $1337=$counter;
   var $1338=((($1337)+(1))|0);
   $counter=$1338;
   var $1339=$program;
   var $1340=$1339;
   var $1341=HEAP32[(($err)>>2)];
   var $1342=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1338,HEAP32[(((tempVarArgs)+(8))>>2)]=$1340,HEAP32[(((tempVarArgs)+(16))>>2)]=$1341,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1343=_printf(((896)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1344=_printf(((848)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1345=$program;
   var $1346=_clCreateKernelsInProgram($1345, 0, 0, $size);
   HEAP32[(($err)>>2)]=$1346;
   var $1347=$counter;
   var $1348=((($1347)+(1))|0);
   $counter=$1348;
   var $1349=$program;
   var $1350=$1349;
   var $1351=HEAP32[(($err)>>2)];
   var $1352=HEAP32[(($size)>>2)];
   var $1353=_printf(((824)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1348,HEAP32[(((tempVarArgs)+(8))>>2)]=$1350,HEAP32[(((tempVarArgs)+(16))>>2)]=$1351,HEAP32[(((tempVarArgs)+(24))>>2)]=$1352,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1354=$program;
   var $1355=_clCreateKernelsInProgram($1354, 1, $kernel2, $size);
   HEAP32[(($err)>>2)]=$1355;
   var $1356=$counter;
   var $1357=((($1356)+(1))|0);
   $counter=$1357;
   var $1358=$program;
   var $1359=$1358;
   var $1360=HEAP32[(($err)>>2)];
   var $1361=HEAP32[(($size)>>2)];
   var $1362=HEAP32[(($kernel2)>>2)];
   var $1363=$1362;
   var $1364=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1357,HEAP32[(((tempVarArgs)+(8))>>2)]=$1359,HEAP32[(((tempVarArgs)+(16))>>2)]=$1360,HEAP32[(((tempVarArgs)+(24))>>2)]=$1361,HEAP32[(((tempVarArgs)+(32))>>2)]=$1363,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1365=_printf(((792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1366=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1367=_clReleaseKernel(0);
   HEAP32[(($err)>>2)]=$1367;
   var $1368=$counter;
   var $1369=((($1368)+(1))|0);
   $counter=$1369;
   var $1370=HEAP32[(($err)>>2)];
   var $1371=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1369,HEAP32[(((tempVarArgs)+(8))>>2)]=$1370,HEAP32[(((tempVarArgs)+(16))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1372=HEAP32[(($kernel2)>>2)];
   var $1373=_clReleaseKernel($1372);
   HEAP32[(($err)>>2)]=$1373;
   var $1374=$counter;
   var $1375=((($1374)+(1))|0);
   $counter=$1375;
   var $1376=HEAP32[(($err)>>2)];
   var $1377=HEAP32[(($kernel2)>>2)];
   var $1378=$1377;
   var $1379=_printf(((2384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1375,HEAP32[(((tempVarArgs)+(8))>>2)]=$1376,HEAP32[(((tempVarArgs)+(16))>>2)]=$1378,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1380=_printf(((768)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1381=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($count)>>2)]=1024;
   var $1382=HEAP32[(($count)>>2)];
   var $1383=_llvm_stacksave();
   $5=$1383;
   var $1384=STACKTOP;STACKTOP = (STACKTOP + ((($1382)*(4))&-1))|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3);(assert((STACKTOP|0) < (STACK_MAX|0))|0);
   $i=0;
   label = 95; break;
  case 95: 
   var $1386=$i;
   var $1387=HEAP32[(($count)>>2)];
   var $1388=(($1386)>>>(0)) < (($1387)>>>(0));
   if ($1388) { label = 96; break; } else { label = 98; break; }
  case 96: 
   var $1390=_rand();
   var $1391=(($1390)|(0));
   var $1392=($1391)/(2147483648);
   var $1393=$i;
   var $1394=(($1384+($1393<<2))|0);
   HEAPF32[(($1394)>>2)]=$1392;
   label = 97; break;
  case 97: 
   var $1396=$i;
   var $1397=((($1396)+(1))|0);
   $i=$1397;
   label = 95; break;
  case 98: 
   var $1399=$context;
   var $1400=HEAP32[(($count)>>2)];
   var $1401=($1400<<2);
   var $$etemp$151$0=4;
   var $$etemp$151$1=0;
   var $1402=_clCreateBuffer($1399, $$etemp$151$0, $$etemp$151$1, $1401, 0, 0);
   HEAP32[(($input)>>2)]=$1402;
   var $1403=$context;
   var $1404=HEAP32[(($count)>>2)];
   var $1405=($1404<<2);
   var $$etemp$152$0=2;
   var $$etemp$152$1=0;
   var $1406=_clCreateBuffer($1403, $$etemp$152$0, $$etemp$152$1, $1405, 0, 0);
   HEAP32[(($output)>>2)]=$1406;
   HEAP32[(($err)>>2)]=0;
   var $1407=$kernel;
   var $1408=$input;
   var $1409=_clSetKernelArg($1407, 0, 4, $1408);
   HEAP32[(($err)>>2)]=$1409;
   var $1410=$counter;
   var $1411=((($1410)+(1))|0);
   $counter=$1411;
   var $1412=$kernel;
   var $1413=$1412;
   var $1414=HEAP32[(($input)>>2)];
   var $1415=$1414;
   var $1416=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1411,HEAP32[(((tempVarArgs)+(8))>>2)]=$1413,HEAP32[(((tempVarArgs)+(16))>>2)]=0,HEAP32[(((tempVarArgs)+(24))>>2)]=4,HEAP32[(((tempVarArgs)+(32))>>2)]=$1415,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1417=$kernel;
   var $1418=$output;
   var $1419=_clSetKernelArg($1417, 1, 4, $1418);
   var $1420=HEAP32[(($err)>>2)];
   var $1421=$1420 | $1419;
   HEAP32[(($err)>>2)]=$1421;
   var $1422=$counter;
   var $1423=((($1422)+(1))|0);
   $counter=$1423;
   var $1424=$kernel;
   var $1425=$1424;
   var $1426=HEAP32[(($output)>>2)];
   var $1427=$1426;
   var $1428=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1423,HEAP32[(((tempVarArgs)+(8))>>2)]=$1425,HEAP32[(((tempVarArgs)+(16))>>2)]=1,HEAP32[(((tempVarArgs)+(24))>>2)]=4,HEAP32[(((tempVarArgs)+(32))>>2)]=$1427,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1429=$kernel;
   var $1430=_clSetKernelArg($1429, 2, 1024, 0);
   var $1431=HEAP32[(($err)>>2)];
   var $1432=$1431 | $1430;
   HEAP32[(($err)>>2)]=$1432;
   var $1433=$counter;
   var $1434=((($1433)+(1))|0);
   $counter=$1434;
   var $1435=$kernel;
   var $1436=$1435;
   var $1437=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1434,HEAP32[(((tempVarArgs)+(8))>>2)]=$1436,HEAP32[(((tempVarArgs)+(16))>>2)]=2,HEAP32[(((tempVarArgs)+(24))>>2)]=1024,HEAP32[(((tempVarArgs)+(32))>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1438=$kernel;
   var $1439=_clSetKernelArg($1438, 3, 1024, 0);
   var $1440=HEAP32[(($err)>>2)];
   var $1441=$1440 | $1439;
   HEAP32[(($err)>>2)]=$1441;
   var $1442=$counter;
   var $1443=((($1442)+(1))|0);
   $counter=$1443;
   var $1444=$kernel;
   var $1445=$1444;
   var $1446=HEAP32[(($count)>>2)];
   var $1447=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1443,HEAP32[(((tempVarArgs)+(8))>>2)]=$1445,HEAP32[(((tempVarArgs)+(16))>>2)]=3,HEAP32[(((tempVarArgs)+(24))>>2)]=4,HEAP32[(((tempVarArgs)+(32))>>2)]=$1446,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1448=$kernel;
   var $1449=$count;
   var $1450=_clSetKernelArg($1448, 2, 4, $1449);
   var $1451=HEAP32[(($err)>>2)];
   var $1452=$1451 | $1450;
   HEAP32[(($err)>>2)]=$1452;
   var $1453=$counter;
   var $1454=((($1453)+(1))|0);
   $counter=$1454;
   var $1455=$kernel;
   var $1456=$1455;
   var $1457=HEAP32[(($count)>>2)];
   var $1458=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1454,HEAP32[(((tempVarArgs)+(8))>>2)]=$1456,HEAP32[(((tempVarArgs)+(16))>>2)]=2,HEAP32[(((tempVarArgs)+(24))>>2)]=4,HEAP32[(((tempVarArgs)+(32))>>2)]=$1457,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1459=_printf(((728)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1460=_printf(((848)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   var $1461=$array_kernel_work_info;
   assert(24 % 1 === 0);HEAP32[(($1461)>>2)]=HEAP32[((216)>>2)];HEAP32[((($1461)+(4))>>2)]=HEAP32[((220)>>2)];HEAP32[((($1461)+(8))>>2)]=HEAP32[((224)>>2)];HEAP32[((($1461)+(12))>>2)]=HEAP32[((228)>>2)];HEAP32[((($1461)+(16))>>2)]=HEAP32[((232)>>2)];HEAP32[((($1461)+(20))>>2)]=HEAP32[((236)>>2)];
   $i24=0;
   label = 99; break;
  case 99: 
   var $1463=$i24;
   var $1464=(($1463)|(0)) < 6;
   if ($1464) { label = 100; break; } else { label = 102; break; }
  case 100: 
   var $1466=$kernel;
   var $1467=HEAP32[(($first_device_id)>>2)];
   var $1468=$i24;
   var $1469=(($array_kernel_work_info+($1468<<2))|0);
   var $1470=HEAP32[(($1469)>>2)];
   var $1471=$value;
   var $1472=_clGetKernelWorkGroupInfo($1466, $1467, $1470, 4, $1471, $size);
   HEAP32[(($err)>>2)]=$1472;
   var $1473=$counter;
   var $1474=((($1473)+(1))|0);
   $counter=$1474;
   var $1475=$i24;
   var $1476=(($array_kernel_work_info+($1475<<2))|0);
   var $1477=HEAP32[(($1476)>>2)];
   var $1478=HEAP32[(($err)>>2)];
   var $1479=HEAP32[(($size)>>2)];
   var $1480=HEAP32[(($value)>>2)];
   var $1481=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1474,HEAP32[(((tempVarArgs)+(8))>>2)]=$1477,HEAP32[(((tempVarArgs)+(16))>>2)]=$1478,HEAP32[(((tempVarArgs)+(24))>>2)]=$1479,HEAP32[(((tempVarArgs)+(32))>>2)]=$1480,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 101; break;
  case 101: 
   var $1483=$i24;
   var $1484=((($1483)+(1))|0);
   $i24=$1484;
   label = 99; break;
  case 102: 
   var $1486=_printf(((696)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1487=_printf(((2792)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = ((((STACKTOP)+7)>>3)<<3),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($size)>>2)]=0;
   HEAP32[(($value)>>2)]=0;
   var $1488=$array_kernel_info;
   assert(24 % 1 === 0);HEAP32[(($1488)>>2)]=HEAP32[((240)>>2)];HEAP32[((($1488)+(4))>>2)]=HEAP32[((244)>>2)];HEAP32[((($1488)+(8))>>2)]=HEAP32[((248)>>2)];HEAP32[((($1488)+(12))>>2)]=HEAP32[((252)>>2)];HEAP32[((($1488)+(16))>>2)]=HEAP32[((256)>>2)];HEAP32[((($1488)+(20))>>2)]=HEAP32[((260)>>2)];
   $i25=0;
   label = 103; break;
  case 103: 
   var $1490=$i25;
   var $1491=(($1490)|(0)) < 6;
   if ($1491) { label = 104; break; } else { label = 106; break; }
  case 104: 
   var $1493=$kernel;
   var $1494=$i25;
   var $1495=(($array_kernel_info+($1494<<2))|0);
   var $1496=HEAP32[(($1495)>>2)];
   var $1497=$value;
   var $1498=_clGetKernelInfo($1493, $1496, 4, $1497, $size);
   HEAP32[(($err)>>2)]=$1498;
   var $1499=$counter;
   var $1500=((($1499)+(1))|0);
   $counter=$1500;
   var $1501=$i25;
   var $1502=(($array_kernel_info+($1501<<2))|0);
   var $1503=HEAP32[(($1502)>>2)];
   var $1504=HEAP32[(($err)>>2)];
   var $1505=HEAP32[(($size)>>2)];
   var $1506=HEAP32[(($value)>>2)];
   var $1507=_printf(((2528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1500,HEAP32[(((tempVarArgs)+(8))>>2)]=$1503,HEAP32[(((tempVarArgs)+(16))>>2)]=$1504,HEAP32[(((tempVarArgs)+(24))>>2)]=$1505,HEAP32[(((tempVarArgs)+(32))>>2)]=$1506,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 105; break;
  case 105: 
   var $1509=$i25;
   var $1510=((($1509)+(1))|0);
   $i25=$1510;
   label = 103; break;
  case 106: 
   var $1512=_end(0);
   $1=$1512;
   $6=1;
   var $1513=$5;
   _llvm_stackrestore($1513);
   var $1514=$1;
   STACKTOP = sp;
   return $1514;
  default: assert(0, "bad label: " + label);
 }
}
Module["_main"] = _main;
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
   var $10=HEAP32[((((3592)|0))>>2)];
   var $11=$10 >>> (($9)>>>(0));
   var $12=$11 & 3;
   var $13=(($12)|(0))==0;
   if ($13) { label = 12; break; } else { label = 5; break; }
  case 5: 
   var $15=$11 & 1;
   var $16=$15 ^ 1;
   var $17=((($16)+($9))|0);
   var $18=$17 << 1;
   var $19=((3632+($18<<2))|0);
   var $20=$19;
   var $_sum111=((($18)+(2))|0);
   var $21=((3632+($_sum111<<2))|0);
   var $22=HEAP32[(($21)>>2)];
   var $23=(($22+8)|0);
   var $24=HEAP32[(($23)>>2)];
   var $25=(($20)|(0))==(($24)|(0));
   if ($25) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $27=1 << $17;
   var $28=$27 ^ -1;
   var $29=$10 & $28;
   HEAP32[((((3592)|0))>>2)]=$29;
   label = 11; break;
  case 7: 
   var $31=$24;
   var $32=HEAP32[((((3608)|0))>>2)];
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
   var $50=HEAP32[((((3600)|0))>>2)];
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
   var $84=((3632+($83<<2))|0);
   var $85=$84;
   var $_sum104=((($83)+(2))|0);
   var $86=((3632+($_sum104<<2))|0);
   var $87=HEAP32[(($86)>>2)];
   var $88=(($87+8)|0);
   var $89=HEAP32[(($88)>>2)];
   var $90=(($85)|(0))==(($89)|(0));
   if ($90) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $92=1 << $82;
   var $93=$92 ^ -1;
   var $94=$10 & $93;
   HEAP32[((((3592)|0))>>2)]=$94;
   label = 20; break;
  case 16: 
   var $96=$89;
   var $97=HEAP32[((((3608)|0))>>2)];
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
   var $117=HEAP32[((((3600)|0))>>2)];
   var $118=(($117)|(0))==0;
   if ($118) { label = 26; break; } else { label = 21; break; }
  case 21: 
   var $120=HEAP32[((((3612)|0))>>2)];
   var $121=$117 >>> 3;
   var $122=$121 << 1;
   var $123=((3632+($122<<2))|0);
   var $124=$123;
   var $125=HEAP32[((((3592)|0))>>2)];
   var $126=1 << $121;
   var $127=$125 & $126;
   var $128=(($127)|(0))==0;
   if ($128) { label = 22; break; } else { label = 23; break; }
  case 22: 
   var $130=$125 | $126;
   HEAP32[((((3592)|0))>>2)]=$130;
   var $_sum109_pre=((($122)+(2))|0);
   var $_pre=((3632+($_sum109_pre<<2))|0);
   var $F4_0 = $124;var $_pre_phi = $_pre;label = 25; break;
  case 23: 
   var $_sum110=((($122)+(2))|0);
   var $132=((3632+($_sum110<<2))|0);
   var $133=HEAP32[(($132)>>2)];
   var $134=$133;
   var $135=HEAP32[((((3608)|0))>>2)];
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
   HEAP32[((((3600)|0))>>2)]=$106;
   HEAP32[((((3612)|0))>>2)]=$111;
   var $143=$88;
   var $mem_0 = $143;label = 341; break;
  case 27: 
   var $145=HEAP32[((((3596)|0))>>2)];
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
   var $171=((3896+($170<<2))|0);
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
   var $193=HEAP32[((((3608)|0))>>2)];
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
   var $244=((3896+($243<<2))|0);
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
   var $251=HEAP32[((((3596)|0))>>2)];
   var $252=$251 & $250;
   HEAP32[((((3596)|0))>>2)]=$252;
   label = 67; break;
  case 51: 
   var $254=$201;
   var $255=HEAP32[((((3608)|0))>>2)];
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
   var $269=HEAP32[((((3608)|0))>>2)];
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
   var $278=HEAP32[((((3608)|0))>>2)];
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
   var $290=HEAP32[((((3608)|0))>>2)];
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
   var $315=HEAP32[((((3600)|0))>>2)];
   var $316=(($315)|(0))==0;
   if ($316) { label = 75; break; } else { label = 70; break; }
  case 70: 
   var $318=HEAP32[((((3612)|0))>>2)];
   var $319=$315 >>> 3;
   var $320=$319 << 1;
   var $321=((3632+($320<<2))|0);
   var $322=$321;
   var $323=HEAP32[((((3592)|0))>>2)];
   var $324=1 << $319;
   var $325=$323 & $324;
   var $326=(($325)|(0))==0;
   if ($326) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $328=$323 | $324;
   HEAP32[((((3592)|0))>>2)]=$328;
   var $_sum2_pre_i=((($320)+(2))|0);
   var $_pre_i=((3632+($_sum2_pre_i<<2))|0);
   var $F1_0_i = $322;var $_pre_phi_i = $_pre_i;label = 74; break;
  case 72: 
   var $_sum3_i=((($320)+(2))|0);
   var $330=((3632+($_sum3_i<<2))|0);
   var $331=HEAP32[(($330)>>2)];
   var $332=$331;
   var $333=HEAP32[((((3608)|0))>>2)];
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
   HEAP32[((((3600)|0))>>2)]=$rsize_0_i;
   HEAP32[((((3612)|0))>>2)]=$197;
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
   var $350=HEAP32[((((3596)|0))>>2)];
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
   var $382=((3896+($idx_0_i<<2))|0);
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
   var $443=((3896+($442<<2))|0);
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
   var $459=HEAP32[((((3600)|0))>>2)];
   var $460=((($459)-($349))|0);
   var $461=(($rsize_3_lcssa_i)>>>(0)) < (($460)>>>(0));
   if ($461) { label = 98; break; } else { var $nb_0 = $349;label = 160; break; }
  case 98: 
   var $463=$v_3_lcssa_i;
   var $464=HEAP32[((((3608)|0))>>2)];
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
   var $515=((3896+($514<<2))|0);
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
   var $522=HEAP32[((((3596)|0))>>2)];
   var $523=$522 & $521;
   HEAP32[((((3596)|0))>>2)]=$523;
   label = 133; break;
  case 117: 
   var $525=$472;
   var $526=HEAP32[((((3608)|0))>>2)];
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
   var $540=HEAP32[((((3608)|0))>>2)];
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
   var $549=HEAP32[((((3608)|0))>>2)];
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
   var $561=HEAP32[((((3608)|0))>>2)];
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
   var $590=((3632+($589<<2))|0);
   var $591=$590;
   var $592=HEAP32[((((3592)|0))>>2)];
   var $593=1 << $586;
   var $594=$592 & $593;
   var $595=(($594)|(0))==0;
   if ($595) { label = 137; break; } else { label = 138; break; }
  case 137: 
   var $597=$592 | $593;
   HEAP32[((((3592)|0))>>2)]=$597;
   var $_sum15_pre_i=((($589)+(2))|0);
   var $_pre_i127=((3632+($_sum15_pre_i<<2))|0);
   var $F5_0_i = $591;var $_pre_phi_i128 = $_pre_i127;label = 140; break;
  case 138: 
   var $_sum18_i=((($589)+(2))|0);
   var $599=((3632+($_sum18_i<<2))|0);
   var $600=HEAP32[(($599)>>2)];
   var $601=$600;
   var $602=HEAP32[((((3608)|0))>>2)];
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
   var $641=((3896+($I7_0_i<<2))|0);
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
   var $648=HEAP32[((((3596)|0))>>2)];
   var $649=1 << $I7_0_i;
   var $650=$648 & $649;
   var $651=(($650)|(0))==0;
   if ($651) { label = 145; break; } else { label = 146; break; }
  case 145: 
   var $653=$648 | $649;
   HEAP32[((((3596)|0))>>2)]=$653;
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
   var $683=HEAP32[((((3608)|0))>>2)];
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
   var $697=HEAP32[((((3608)|0))>>2)];
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
   var $714=HEAP32[((((3600)|0))>>2)];
   var $715=(($nb_0)>>>(0)) > (($714)>>>(0));
   if ($715) { label = 165; break; } else { label = 161; break; }
  case 161: 
   var $717=((($714)-($nb_0))|0);
   var $718=HEAP32[((((3612)|0))>>2)];
   var $719=(($717)>>>(0)) > 15;
   if ($719) { label = 162; break; } else { label = 163; break; }
  case 162: 
   var $721=$718;
   var $722=(($721+$nb_0)|0);
   var $723=$722;
   HEAP32[((((3612)|0))>>2)]=$723;
   HEAP32[((((3600)|0))>>2)]=$717;
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
   HEAP32[((((3600)|0))>>2)]=0;
   HEAP32[((((3612)|0))>>2)]=0;
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
   var $743=HEAP32[((((3604)|0))>>2)];
   var $744=(($nb_0)>>>(0)) < (($743)>>>(0));
   if ($744) { label = 166; break; } else { label = 167; break; }
  case 166: 
   var $746=((($743)-($nb_0))|0);
   HEAP32[((((3604)|0))>>2)]=$746;
   var $747=HEAP32[((((3616)|0))>>2)];
   var $748=$747;
   var $749=(($748+$nb_0)|0);
   var $750=$749;
   HEAP32[((((3616)|0))>>2)]=$750;
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
   var $759=HEAP32[((((3560)|0))>>2)];
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
   HEAP32[((((3568)|0))>>2)]=$762;
   HEAP32[((((3564)|0))>>2)]=$762;
   HEAP32[((((3572)|0))>>2)]=-1;
   HEAP32[((((3576)|0))>>2)]=-1;
   HEAP32[((((3580)|0))>>2)]=0;
   HEAP32[((((4036)|0))>>2)]=0;
   var $767=_time(0);
   var $768=$767 & -16;
   var $769=$768 ^ 1431655768;
   HEAP32[((((3560)|0))>>2)]=$769;
   label = 171; break;
  case 171: 
   var $771=((($nb_0)+(48))|0);
   var $772=HEAP32[((((3568)|0))>>2)];
   var $773=((($nb_0)+(47))|0);
   var $774=((($772)+($773))|0);
   var $775=(((-$772))|0);
   var $776=$774 & $775;
   var $777=(($776)>>>(0)) > (($nb_0)>>>(0));
   if ($777) { label = 172; break; } else { var $mem_0 = 0;label = 341; break; }
  case 172: 
   var $779=HEAP32[((((4032)|0))>>2)];
   var $780=(($779)|(0))==0;
   if ($780) { label = 174; break; } else { label = 173; break; }
  case 173: 
   var $782=HEAP32[((((4024)|0))>>2)];
   var $783=((($782)+($776))|0);
   var $784=(($783)>>>(0)) <= (($782)>>>(0));
   var $785=(($783)>>>(0)) > (($779)>>>(0));
   var $or_cond1_i=$784 | $785;
   if ($or_cond1_i) { var $mem_0 = 0;label = 341; break; } else { label = 174; break; }
  case 174: 
   var $787=HEAP32[((((4036)|0))>>2)];
   var $788=$787 & 4;
   var $789=(($788)|(0))==0;
   if ($789) { label = 175; break; } else { var $tsize_1_i = 0;label = 198; break; }
  case 175: 
   var $791=HEAP32[((((3616)|0))>>2)];
   var $792=(($791)|(0))==0;
   if ($792) { label = 181; break; } else { label = 176; break; }
  case 176: 
   var $794=$791;
   var $sp_0_i_i = ((4040)|0);label = 177; break;
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
   var $813=HEAP32[((((3564)|0))>>2)];
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
   var $824=HEAP32[((((4024)|0))>>2)];
   var $825=((($824)+($ssize_0_i))|0);
   var $826=(($ssize_0_i)>>>(0)) > (($nb_0)>>>(0));
   var $827=(($ssize_0_i)>>>(0)) < 2147483647;
   var $or_cond_i131=$826 & $827;
   if ($or_cond_i131) { label = 185; break; } else { var $tsize_0303639_i = 0;label = 197; break; }
  case 185: 
   var $829=HEAP32[((((4032)|0))>>2)];
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
   var $838=HEAP32[((((3604)|0))>>2)];
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
   var $856=HEAP32[((((3568)|0))>>2)];
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
   var $871=HEAP32[((((4036)|0))>>2)];
   var $872=$871 | 4;
   HEAP32[((((4036)|0))>>2)]=$872;
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
   var $885=HEAP32[((((4024)|0))>>2)];
   var $886=((($885)+($tsize_244_i))|0);
   HEAP32[((((4024)|0))>>2)]=$886;
   var $887=HEAP32[((((4028)|0))>>2)];
   var $888=(($886)>>>(0)) > (($887)>>>(0));
   if ($888) { label = 202; break; } else { label = 203; break; }
  case 202: 
   HEAP32[((((4028)|0))>>2)]=$886;
   label = 203; break;
  case 203: 
   var $890=HEAP32[((((3616)|0))>>2)];
   var $891=(($890)|(0))==0;
   if ($891) { label = 204; break; } else { var $sp_067_i = ((4040)|0);label = 211; break; }
  case 204: 
   var $893=HEAP32[((((3608)|0))>>2)];
   var $894=(($893)|(0))==0;
   var $895=(($tbase_245_i)>>>(0)) < (($893)>>>(0));
   var $or_cond10_i=$894 | $895;
   if ($or_cond10_i) { label = 205; break; } else { label = 206; break; }
  case 205: 
   HEAP32[((((3608)|0))>>2)]=$tbase_245_i;
   label = 206; break;
  case 206: 
   HEAP32[((((4040)|0))>>2)]=$tbase_245_i;
   HEAP32[((((4044)|0))>>2)]=$tsize_244_i;
   HEAP32[((((4052)|0))>>2)]=0;
   var $897=HEAP32[((((3560)|0))>>2)];
   HEAP32[((((3628)|0))>>2)]=$897;
   HEAP32[((((3624)|0))>>2)]=-1;
   var $i_02_i_i = 0;label = 207; break;
  case 207: 
   var $i_02_i_i;
   var $899=$i_02_i_i << 1;
   var $900=((3632+($899<<2))|0);
   var $901=$900;
   var $_sum_i_i=((($899)+(3))|0);
   var $902=((3632+($_sum_i_i<<2))|0);
   HEAP32[(($902)>>2)]=$901;
   var $_sum1_i_i=((($899)+(2))|0);
   var $903=((3632+($_sum1_i_i<<2))|0);
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
   HEAP32[((((3616)|0))>>2)]=$916;
   HEAP32[((((3604)|0))>>2)]=$917;
   var $918=$917 | 1;
   var $_sum_i14_i=((($914)+(4))|0);
   var $919=(($tbase_245_i+$_sum_i14_i)|0);
   var $920=$919;
   HEAP32[(($920)>>2)]=$918;
   var $_sum2_i_i=((($tsize_244_i)-(36))|0);
   var $921=(($tbase_245_i+$_sum2_i_i)|0);
   var $922=$921;
   HEAP32[(($922)>>2)]=40;
   var $923=HEAP32[((((3576)|0))>>2)];
   HEAP32[((((3620)|0))>>2)]=$923;
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
   var $944=HEAP32[((((3616)|0))>>2)];
   var $945=HEAP32[((((3604)|0))>>2)];
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
   HEAP32[((((3616)|0))>>2)]=$957;
   HEAP32[((((3604)|0))>>2)]=$958;
   var $959=$958 | 1;
   var $_sum_i18_i=((($955)+(4))|0);
   var $960=(($947+$_sum_i18_i)|0);
   var $961=$960;
   HEAP32[(($961)>>2)]=$959;
   var $_sum2_i19_i=((($946)+(4))|0);
   var $962=(($947+$_sum2_i19_i)|0);
   var $963=$962;
   HEAP32[(($963)>>2)]=40;
   var $964=HEAP32[((((3576)|0))>>2)];
   HEAP32[((((3620)|0))>>2)]=$964;
   label = 338; break;
  case 218: 
   var $965=HEAP32[((((3608)|0))>>2)];
   var $966=(($tbase_245_i)>>>(0)) < (($965)>>>(0));
   if ($966) { label = 219; break; } else { label = 220; break; }
  case 219: 
   HEAP32[((((3608)|0))>>2)]=$tbase_245_i;
   label = 220; break;
  case 220: 
   var $968=(($tbase_245_i+$tsize_244_i)|0);
   var $sp_160_i = ((4040)|0);label = 221; break;
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
   var $1015=HEAP32[((((3616)|0))>>2)];
   var $1016=(($1005)|(0))==(($1015)|(0));
   if ($1016) { label = 229; break; } else { label = 230; break; }
  case 229: 
   var $1018=HEAP32[((((3604)|0))>>2)];
   var $1019=((($1018)+($1011))|0);
   HEAP32[((((3604)|0))>>2)]=$1019;
   HEAP32[((((3616)|0))>>2)]=$1010;
   var $1020=$1019 | 1;
   var $_sum46_i_i=((($_sum_i21_i)+(4))|0);
   var $1021=(($tbase_245_i+$_sum46_i_i)|0);
   var $1022=$1021;
   HEAP32[(($1022)>>2)]=$1020;
   label = 303; break;
  case 230: 
   var $1024=HEAP32[((((3612)|0))>>2)];
   var $1025=(($1005)|(0))==(($1024)|(0));
   if ($1025) { label = 231; break; } else { label = 232; break; }
  case 231: 
   var $1027=HEAP32[((((3600)|0))>>2)];
   var $1028=((($1027)+($1011))|0);
   HEAP32[((((3600)|0))>>2)]=$1028;
   HEAP32[((((3612)|0))>>2)]=$1010;
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
   var $1052=((3632+($1051<<2))|0);
   var $1053=$1052;
   var $1054=(($1047)|(0))==(($1053)|(0));
   if ($1054) { label = 237; break; } else { label = 235; break; }
  case 235: 
   var $1056=$1047;
   var $1057=HEAP32[((((3608)|0))>>2)];
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
   var $1067=HEAP32[((((3592)|0))>>2)];
   var $1068=$1067 & $1066;
   HEAP32[((((3592)|0))>>2)]=$1068;
   label = 279; break;
  case 239: 
   var $1070=(($1050)|(0))==(($1053)|(0));
   if ($1070) { label = 240; break; } else { label = 241; break; }
  case 240: 
   var $_pre56_i_i=(($1050+8)|0);
   var $_pre_phi57_i_i = $_pre56_i_i;label = 243; break;
  case 241: 
   var $1072=$1050;
   var $1073=HEAP32[((((3608)|0))>>2)];
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
   var $1094=HEAP32[((((3608)|0))>>2)];
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
   var $1124=HEAP32[((((3608)|0))>>2)];
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
   var $1134=((3896+($1133<<2))|0);
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
   var $1141=HEAP32[((((3596)|0))>>2)];
   var $1142=$1141 & $1140;
   HEAP32[((((3596)|0))>>2)]=$1142;
   label = 279; break;
  case 263: 
   var $1144=$1084;
   var $1145=HEAP32[((((3608)|0))>>2)];
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
   var $1159=HEAP32[((((3608)|0))>>2)];
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
   var $1169=HEAP32[((((3608)|0))>>2)];
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
   var $1182=HEAP32[((((3608)|0))>>2)];
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
   var $1206=((3632+($1205<<2))|0);
   var $1207=$1206;
   var $1208=HEAP32[((((3592)|0))>>2)];
   var $1209=1 << $1202;
   var $1210=$1208 & $1209;
   var $1211=(($1210)|(0))==0;
   if ($1211) { label = 282; break; } else { label = 283; break; }
  case 282: 
   var $1213=$1208 | $1209;
   HEAP32[((((3592)|0))>>2)]=$1213;
   var $_sum27_pre_i_i=((($1205)+(2))|0);
   var $_pre_i24_i=((3632+($_sum27_pre_i_i<<2))|0);
   var $F4_0_i_i = $1207;var $_pre_phi_i25_i = $_pre_i24_i;label = 285; break;
  case 283: 
   var $_sum30_i_i=((($1205)+(2))|0);
   var $1215=((3632+($_sum30_i_i<<2))|0);
   var $1216=HEAP32[(($1215)>>2)];
   var $1217=$1216;
   var $1218=HEAP32[((((3608)|0))>>2)];
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
   var $1257=((3896+($I7_0_i_i<<2))|0);
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
   var $1264=HEAP32[((((3596)|0))>>2)];
   var $1265=1 << $I7_0_i_i;
   var $1266=$1264 & $1265;
   var $1267=(($1266)|(0))==0;
   if ($1267) { label = 290; break; } else { label = 291; break; }
  case 290: 
   var $1269=$1264 | $1265;
   HEAP32[((((3596)|0))>>2)]=$1269;
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
   var $1299=HEAP32[((((3608)|0))>>2)];
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
   var $1313=HEAP32[((((3608)|0))>>2)];
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
   var $sp_0_i_i_i = ((4040)|0);label = 305; break;
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
   HEAP32[((((3616)|0))>>2)]=$1366;
   HEAP32[((((3604)|0))>>2)]=$1367;
   var $1368=$1367 | 1;
   var $_sum_i_i_i=((($1364)+(4))|0);
   var $1369=(($tbase_245_i+$_sum_i_i_i)|0);
   var $1370=$1369;
   HEAP32[(($1370)>>2)]=$1368;
   var $_sum2_i_i_i=((($tsize_244_i)-(36))|0);
   var $1371=(($tbase_245_i+$_sum2_i_i_i)|0);
   var $1372=$1371;
   HEAP32[(($1372)>>2)]=40;
   var $1373=HEAP32[((((3576)|0))>>2)];
   HEAP32[((((3620)|0))>>2)]=$1373;
   var $1374=(($1353+4)|0);
   var $1375=$1374;
   HEAP32[(($1375)>>2)]=27;
   assert(16 % 1 === 0);HEAP32[(($1354)>>2)]=HEAP32[(((((4040)|0)))>>2)];HEAP32[((($1354)+(4))>>2)]=HEAP32[((((((4040)|0)))+(4))>>2)];HEAP32[((($1354)+(8))>>2)]=HEAP32[((((((4040)|0)))+(8))>>2)];HEAP32[((($1354)+(12))>>2)]=HEAP32[((((((4040)|0)))+(12))>>2)];
   HEAP32[((((4040)|0))>>2)]=$tbase_245_i;
   HEAP32[((((4044)|0))>>2)]=$tsize_244_i;
   HEAP32[((((4052)|0))>>2)]=0;
   HEAP32[((((4048)|0))>>2)]=$1355;
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
   var $1402=((3632+($1401<<2))|0);
   var $1403=$1402;
   var $1404=HEAP32[((((3592)|0))>>2)];
   var $1405=1 << $1398;
   var $1406=$1404 & $1405;
   var $1407=(($1406)|(0))==0;
   if ($1407) { label = 317; break; } else { label = 318; break; }
  case 317: 
   var $1409=$1404 | $1405;
   HEAP32[((((3592)|0))>>2)]=$1409;
   var $_sum11_pre_i_i=((($1401)+(2))|0);
   var $_pre_i_i=((3632+($_sum11_pre_i_i<<2))|0);
   var $F_0_i_i = $1403;var $_pre_phi_i_i = $_pre_i_i;label = 320; break;
  case 318: 
   var $_sum12_i_i=((($1401)+(2))|0);
   var $1411=((3632+($_sum12_i_i<<2))|0);
   var $1412=HEAP32[(($1411)>>2)];
   var $1413=$1412;
   var $1414=HEAP32[((((3608)|0))>>2)];
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
   var $1451=((3896+($I1_0_i_i<<2))|0);
   var $1452=(($890+28)|0);
   var $I1_0_c_i_i=$I1_0_i_i;
   HEAP32[(($1452)>>2)]=$I1_0_c_i_i;
   var $1453=(($890+20)|0);
   HEAP32[(($1453)>>2)]=0;
   var $1454=(($890+16)|0);
   HEAP32[(($1454)>>2)]=0;
   var $1455=HEAP32[((((3596)|0))>>2)];
   var $1456=1 << $I1_0_i_i;
   var $1457=$1455 & $1456;
   var $1458=(($1457)|(0))==0;
   if ($1458) { label = 325; break; } else { label = 326; break; }
  case 325: 
   var $1460=$1455 | $1456;
   HEAP32[((((3596)|0))>>2)]=$1460;
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
   var $1486=HEAP32[((((3608)|0))>>2)];
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
   var $1497=HEAP32[((((3608)|0))>>2)];
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
   var $1507=HEAP32[((((3604)|0))>>2)];
   var $1508=(($1507)>>>(0)) > (($nb_0)>>>(0));
   if ($1508) { label = 339; break; } else { label = 340; break; }
  case 339: 
   var $1510=((($1507)-($nb_0))|0);
   HEAP32[((((3604)|0))>>2)]=$1510;
   var $1511=HEAP32[((((3616)|0))>>2)];
   var $1512=$1511;
   var $1513=(($1512+$nb_0)|0);
   var $1514=$1513;
   HEAP32[((((3616)|0))>>2)]=$1514;
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
   if ($1) { label = 140; break; } else { label = 2; break; }
  case 2: 
   var $3=((($mem)-(8))|0);
   var $4=$3;
   var $5=HEAP32[((((3608)|0))>>2)];
   var $6=(($3)>>>(0)) < (($5)>>>(0));
   if ($6) { label = 139; break; } else { label = 3; break; }
  case 3: 
   var $8=((($mem)-(4))|0);
   var $9=$8;
   var $10=HEAP32[(($9)>>2)];
   var $11=$10 & 3;
   var $12=(($11)|(0))==1;
   if ($12) { label = 139; break; } else { label = 4; break; }
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
   if ($22) { label = 140; break; } else { label = 6; break; }
  case 6: 
   var $_sum232=(((-8)-($21))|0);
   var $24=(($mem+$_sum232)|0);
   var $25=$24;
   var $26=((($21)+($14))|0);
   var $27=(($24)>>>(0)) < (($5)>>>(0));
   if ($27) { label = 139; break; } else { label = 7; break; }
  case 7: 
   var $29=HEAP32[((((3612)|0))>>2)];
   var $30=(($25)|(0))==(($29)|(0));
   if ($30) { label = 54; break; } else { label = 8; break; }
  case 8: 
   var $32=$21 >>> 3;
   var $33=(($21)>>>(0)) < 256;
   if ($33) { label = 9; break; } else { label = 21; break; }
  case 9: 
   var $_sum276=((($_sum232)+(8))|0);
   var $35=(($mem+$_sum276)|0);
   var $36=$35;
   var $37=HEAP32[(($36)>>2)];
   var $_sum277=((($_sum232)+(12))|0);
   var $38=(($mem+$_sum277)|0);
   var $39=$38;
   var $40=HEAP32[(($39)>>2)];
   var $41=$32 << 1;
   var $42=((3632+($41<<2))|0);
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
   var $56=HEAP32[((((3592)|0))>>2)];
   var $57=$56 & $55;
   HEAP32[((((3592)|0))>>2)]=$57;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 14: 
   var $59=(($40)|(0))==(($43)|(0));
   if ($59) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $_pre305=(($40+8)|0);
   var $_pre_phi306 = $_pre305;label = 18; break;
  case 16: 
   var $61=$40;
   var $62=(($61)>>>(0)) < (($5)>>>(0));
   if ($62) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $64=(($40+8)|0);
   var $65=HEAP32[(($64)>>2)];
   var $66=(($65)|(0))==(($25)|(0));
   if ($66) { var $_pre_phi306 = $64;label = 18; break; } else { label = 19; break; }
  case 18: 
   var $_pre_phi306;
   var $67=(($37+12)|0);
   HEAP32[(($67)>>2)]=$40;
   HEAP32[(($_pre_phi306)>>2)]=$37;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 19: 
   _abort();
   throw "Reached an unreachable!";
  case 20: 
   _abort();
   throw "Reached an unreachable!";
  case 21: 
   var $69=$24;
   var $_sum266=((($_sum232)+(24))|0);
   var $70=(($mem+$_sum266)|0);
   var $71=$70;
   var $72=HEAP32[(($71)>>2)];
   var $_sum267=((($_sum232)+(12))|0);
   var $73=(($mem+$_sum267)|0);
   var $74=$73;
   var $75=HEAP32[(($74)>>2)];
   var $76=(($75)|(0))==(($69)|(0));
   if ($76) { label = 27; break; } else { label = 22; break; }
  case 22: 
   var $_sum273=((($_sum232)+(8))|0);
   var $78=(($mem+$_sum273)|0);
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
   var $_sum269=((($_sum232)+(20))|0);
   var $93=(($mem+$_sum269)|0);
   var $94=$93;
   var $95=HEAP32[(($94)>>2)];
   var $96=(($95)|(0))==0;
   if ($96) { label = 28; break; } else { var $R_0 = $95;var $RP_0 = $94;label = 29; break; }
  case 28: 
   var $_sum268=((($_sum232)+(16))|0);
   var $98=(($mem+$_sum268)|0);
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
   var $_sum270=((($_sum232)+(28))|0);
   var $117=(($mem+$_sum270)|0);
   var $118=$117;
   var $119=HEAP32[(($118)>>2)];
   var $120=((3896+($119<<2))|0);
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
   var $127=HEAP32[((((3596)|0))>>2)];
   var $128=$127 & $126;
   HEAP32[((((3596)|0))>>2)]=$128;
   var $p_0 = $25;var $psize_0 = $26;label = 56; break;
  case 38: 
   var $130=$72;
   var $131=HEAP32[((((3608)|0))>>2)];
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
   var $145=HEAP32[((((3608)|0))>>2)];
   var $146=(($144)>>>(0)) < (($145)>>>(0));
   if ($146) { label = 53; break; } else { label = 45; break; }
  case 45: 
   var $148=(($R_1+24)|0);
   HEAP32[(($148)>>2)]=$72;
   var $_sum271=((($_sum232)+(16))|0);
   var $149=(($mem+$_sum271)|0);
   var $150=$149;
   var $151=HEAP32[(($150)>>2)];
   var $152=(($151)|(0))==0;
   if ($152) { label = 49; break; } else { label = 46; break; }
  case 46: 
   var $154=$151;
   var $155=HEAP32[((((3608)|0))>>2)];
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
   var $_sum272=((($_sum232)+(20))|0);
   var $162=(($mem+$_sum272)|0);
   var $163=$162;
   var $164=HEAP32[(($163)>>2)];
   var $165=(($164)|(0))==0;
   if ($165) { var $p_0 = $25;var $psize_0 = $26;label = 56; break; } else { label = 50; break; }
  case 50: 
   var $167=$164;
   var $168=HEAP32[((((3608)|0))>>2)];
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
   var $_sum233=((($14)-(4))|0);
   var $176=(($mem+$_sum233)|0);
   var $177=$176;
   var $178=HEAP32[(($177)>>2)];
   var $179=$178 & 3;
   var $180=(($179)|(0))==3;
   if ($180) { label = 55; break; } else { var $p_0 = $25;var $psize_0 = $26;label = 56; break; }
  case 55: 
   HEAP32[((((3600)|0))>>2)]=$26;
   var $182=HEAP32[(($177)>>2)];
   var $183=$182 & -2;
   HEAP32[(($177)>>2)]=$183;
   var $184=$26 | 1;
   var $_sum264=((($_sum232)+(4))|0);
   var $185=(($mem+$_sum264)|0);
   var $186=$185;
   HEAP32[(($186)>>2)]=$184;
   var $187=$15;
   HEAP32[(($187)>>2)]=$26;
   label = 140; break;
  case 56: 
   var $psize_0;
   var $p_0;
   var $189=$p_0;
   var $190=(($189)>>>(0)) < (($15)>>>(0));
   if ($190) { label = 57; break; } else { label = 139; break; }
  case 57: 
   var $_sum263=((($14)-(4))|0);
   var $192=(($mem+$_sum263)|0);
   var $193=$192;
   var $194=HEAP32[(($193)>>2)];
   var $195=$194 & 1;
   var $phitmp=(($195)|(0))==0;
   if ($phitmp) { label = 139; break; } else { label = 58; break; }
  case 58: 
   var $197=$194 & 2;
   var $198=(($197)|(0))==0;
   if ($198) { label = 59; break; } else { label = 112; break; }
  case 59: 
   var $200=HEAP32[((((3616)|0))>>2)];
   var $201=(($16)|(0))==(($200)|(0));
   if ($201) { label = 60; break; } else { label = 62; break; }
  case 60: 
   var $203=HEAP32[((((3604)|0))>>2)];
   var $204=((($203)+($psize_0))|0);
   HEAP32[((((3604)|0))>>2)]=$204;
   HEAP32[((((3616)|0))>>2)]=$p_0;
   var $205=$204 | 1;
   var $206=(($p_0+4)|0);
   HEAP32[(($206)>>2)]=$205;
   var $207=HEAP32[((((3612)|0))>>2)];
   var $208=(($p_0)|(0))==(($207)|(0));
   if ($208) { label = 61; break; } else { label = 140; break; }
  case 61: 
   HEAP32[((((3612)|0))>>2)]=0;
   HEAP32[((((3600)|0))>>2)]=0;
   label = 140; break;
  case 62: 
   var $211=HEAP32[((((3612)|0))>>2)];
   var $212=(($16)|(0))==(($211)|(0));
   if ($212) { label = 63; break; } else { label = 64; break; }
  case 63: 
   var $214=HEAP32[((((3600)|0))>>2)];
   var $215=((($214)+($psize_0))|0);
   HEAP32[((((3600)|0))>>2)]=$215;
   HEAP32[((((3612)|0))>>2)]=$p_0;
   var $216=$215 | 1;
   var $217=(($p_0+4)|0);
   HEAP32[(($217)>>2)]=$216;
   var $218=(($189+$215)|0);
   var $219=$218;
   HEAP32[(($219)>>2)]=$215;
   label = 140; break;
  case 64: 
   var $221=$194 & -8;
   var $222=((($221)+($psize_0))|0);
   var $223=$194 >>> 3;
   var $224=(($194)>>>(0)) < 256;
   if ($224) { label = 65; break; } else { label = 77; break; }
  case 65: 
   var $226=(($mem+$14)|0);
   var $227=$226;
   var $228=HEAP32[(($227)>>2)];
   var $_sum257258=$14 | 4;
   var $229=(($mem+$_sum257258)|0);
   var $230=$229;
   var $231=HEAP32[(($230)>>2)];
   var $232=$223 << 1;
   var $233=((3632+($232<<2))|0);
   var $234=$233;
   var $235=(($228)|(0))==(($234)|(0));
   if ($235) { label = 68; break; } else { label = 66; break; }
  case 66: 
   var $237=$228;
   var $238=HEAP32[((((3608)|0))>>2)];
   var $239=(($237)>>>(0)) < (($238)>>>(0));
   if ($239) { label = 76; break; } else { label = 67; break; }
  case 67: 
   var $241=(($228+12)|0);
   var $242=HEAP32[(($241)>>2)];
   var $243=(($242)|(0))==(($16)|(0));
   if ($243) { label = 68; break; } else { label = 76; break; }
  case 68: 
   var $244=(($231)|(0))==(($228)|(0));
   if ($244) { label = 69; break; } else { label = 70; break; }
  case 69: 
   var $246=1 << $223;
   var $247=$246 ^ -1;
   var $248=HEAP32[((((3592)|0))>>2)];
   var $249=$248 & $247;
   HEAP32[((((3592)|0))>>2)]=$249;
   label = 110; break;
  case 70: 
   var $251=(($231)|(0))==(($234)|(0));
   if ($251) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $_pre303=(($231+8)|0);
   var $_pre_phi304 = $_pre303;label = 74; break;
  case 72: 
   var $253=$231;
   var $254=HEAP32[((((3608)|0))>>2)];
   var $255=(($253)>>>(0)) < (($254)>>>(0));
   if ($255) { label = 75; break; } else { label = 73; break; }
  case 73: 
   var $257=(($231+8)|0);
   var $258=HEAP32[(($257)>>2)];
   var $259=(($258)|(0))==(($16)|(0));
   if ($259) { var $_pre_phi304 = $257;label = 74; break; } else { label = 75; break; }
  case 74: 
   var $_pre_phi304;
   var $260=(($228+12)|0);
   HEAP32[(($260)>>2)]=$231;
   HEAP32[(($_pre_phi304)>>2)]=$228;
   label = 110; break;
  case 75: 
   _abort();
   throw "Reached an unreachable!";
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $262=$15;
   var $_sum235=((($14)+(16))|0);
   var $263=(($mem+$_sum235)|0);
   var $264=$263;
   var $265=HEAP32[(($264)>>2)];
   var $_sum236237=$14 | 4;
   var $266=(($mem+$_sum236237)|0);
   var $267=$266;
   var $268=HEAP32[(($267)>>2)];
   var $269=(($268)|(0))==(($262)|(0));
   if ($269) { label = 83; break; } else { label = 78; break; }
  case 78: 
   var $271=(($mem+$14)|0);
   var $272=$271;
   var $273=HEAP32[(($272)>>2)];
   var $274=$273;
   var $275=HEAP32[((((3608)|0))>>2)];
   var $276=(($274)>>>(0)) < (($275)>>>(0));
   if ($276) { label = 82; break; } else { label = 79; break; }
  case 79: 
   var $278=(($273+12)|0);
   var $279=HEAP32[(($278)>>2)];
   var $280=(($279)|(0))==(($262)|(0));
   if ($280) { label = 80; break; } else { label = 82; break; }
  case 80: 
   var $282=(($268+8)|0);
   var $283=HEAP32[(($282)>>2)];
   var $284=(($283)|(0))==(($262)|(0));
   if ($284) { label = 81; break; } else { label = 82; break; }
  case 81: 
   HEAP32[(($278)>>2)]=$268;
   HEAP32[(($282)>>2)]=$273;
   var $R7_1 = $268;label = 90; break;
  case 82: 
   _abort();
   throw "Reached an unreachable!";
  case 83: 
   var $_sum239=((($14)+(12))|0);
   var $287=(($mem+$_sum239)|0);
   var $288=$287;
   var $289=HEAP32[(($288)>>2)];
   var $290=(($289)|(0))==0;
   if ($290) { label = 84; break; } else { var $R7_0 = $289;var $RP9_0 = $288;label = 85; break; }
  case 84: 
   var $_sum238=((($14)+(8))|0);
   var $292=(($mem+$_sum238)|0);
   var $293=$292;
   var $294=HEAP32[(($293)>>2)];
   var $295=(($294)|(0))==0;
   if ($295) { var $R7_1 = 0;label = 90; break; } else { var $R7_0 = $294;var $RP9_0 = $293;label = 85; break; }
  case 85: 
   var $RP9_0;
   var $R7_0;
   var $296=(($R7_0+20)|0);
   var $297=HEAP32[(($296)>>2)];
   var $298=(($297)|(0))==0;
   if ($298) { label = 86; break; } else { var $R7_0 = $297;var $RP9_0 = $296;label = 85; break; }
  case 86: 
   var $300=(($R7_0+16)|0);
   var $301=HEAP32[(($300)>>2)];
   var $302=(($301)|(0))==0;
   if ($302) { label = 87; break; } else { var $R7_0 = $301;var $RP9_0 = $300;label = 85; break; }
  case 87: 
   var $304=$RP9_0;
   var $305=HEAP32[((((3608)|0))>>2)];
   var $306=(($304)>>>(0)) < (($305)>>>(0));
   if ($306) { label = 89; break; } else { label = 88; break; }
  case 88: 
   HEAP32[(($RP9_0)>>2)]=0;
   var $R7_1 = $R7_0;label = 90; break;
  case 89: 
   _abort();
   throw "Reached an unreachable!";
  case 90: 
   var $R7_1;
   var $310=(($265)|(0))==0;
   if ($310) { label = 110; break; } else { label = 91; break; }
  case 91: 
   var $_sum250=((($14)+(20))|0);
   var $312=(($mem+$_sum250)|0);
   var $313=$312;
   var $314=HEAP32[(($313)>>2)];
   var $315=((3896+($314<<2))|0);
   var $316=HEAP32[(($315)>>2)];
   var $317=(($262)|(0))==(($316)|(0));
   if ($317) { label = 92; break; } else { label = 94; break; }
  case 92: 
   HEAP32[(($315)>>2)]=$R7_1;
   var $cond298=(($R7_1)|(0))==0;
   if ($cond298) { label = 93; break; } else { label = 100; break; }
  case 93: 
   var $319=HEAP32[(($313)>>2)];
   var $320=1 << $319;
   var $321=$320 ^ -1;
   var $322=HEAP32[((((3596)|0))>>2)];
   var $323=$322 & $321;
   HEAP32[((((3596)|0))>>2)]=$323;
   label = 110; break;
  case 94: 
   var $325=$265;
   var $326=HEAP32[((((3608)|0))>>2)];
   var $327=(($325)>>>(0)) < (($326)>>>(0));
   if ($327) { label = 98; break; } else { label = 95; break; }
  case 95: 
   var $329=(($265+16)|0);
   var $330=HEAP32[(($329)>>2)];
   var $331=(($330)|(0))==(($262)|(0));
   if ($331) { label = 96; break; } else { label = 97; break; }
  case 96: 
   HEAP32[(($329)>>2)]=$R7_1;
   label = 99; break;
  case 97: 
   var $334=(($265+20)|0);
   HEAP32[(($334)>>2)]=$R7_1;
   label = 99; break;
  case 98: 
   _abort();
   throw "Reached an unreachable!";
  case 99: 
   var $337=(($R7_1)|(0))==0;
   if ($337) { label = 110; break; } else { label = 100; break; }
  case 100: 
   var $339=$R7_1;
   var $340=HEAP32[((((3608)|0))>>2)];
   var $341=(($339)>>>(0)) < (($340)>>>(0));
   if ($341) { label = 109; break; } else { label = 101; break; }
  case 101: 
   var $343=(($R7_1+24)|0);
   HEAP32[(($343)>>2)]=$265;
   var $_sum251=((($14)+(8))|0);
   var $344=(($mem+$_sum251)|0);
   var $345=$344;
   var $346=HEAP32[(($345)>>2)];
   var $347=(($346)|(0))==0;
   if ($347) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $349=$346;
   var $350=HEAP32[((((3608)|0))>>2)];
   var $351=(($349)>>>(0)) < (($350)>>>(0));
   if ($351) { label = 104; break; } else { label = 103; break; }
  case 103: 
   var $353=(($R7_1+16)|0);
   HEAP32[(($353)>>2)]=$346;
   var $354=(($346+24)|0);
   HEAP32[(($354)>>2)]=$R7_1;
   label = 105; break;
  case 104: 
   _abort();
   throw "Reached an unreachable!";
  case 105: 
   var $_sum252=((($14)+(12))|0);
   var $357=(($mem+$_sum252)|0);
   var $358=$357;
   var $359=HEAP32[(($358)>>2)];
   var $360=(($359)|(0))==0;
   if ($360) { label = 110; break; } else { label = 106; break; }
  case 106: 
   var $362=$359;
   var $363=HEAP32[((((3608)|0))>>2)];
   var $364=(($362)>>>(0)) < (($363)>>>(0));
   if ($364) { label = 108; break; } else { label = 107; break; }
  case 107: 
   var $366=(($R7_1+20)|0);
   HEAP32[(($366)>>2)]=$359;
   var $367=(($359+24)|0);
   HEAP32[(($367)>>2)]=$R7_1;
   label = 110; break;
  case 108: 
   _abort();
   throw "Reached an unreachable!";
  case 109: 
   _abort();
   throw "Reached an unreachable!";
  case 110: 
   var $371=$222 | 1;
   var $372=(($p_0+4)|0);
   HEAP32[(($372)>>2)]=$371;
   var $373=(($189+$222)|0);
   var $374=$373;
   HEAP32[(($374)>>2)]=$222;
   var $375=HEAP32[((((3612)|0))>>2)];
   var $376=(($p_0)|(0))==(($375)|(0));
   if ($376) { label = 111; break; } else { var $psize_1 = $222;label = 113; break; }
  case 111: 
   HEAP32[((((3600)|0))>>2)]=$222;
   label = 140; break;
  case 112: 
   var $379=$194 & -2;
   HEAP32[(($193)>>2)]=$379;
   var $380=$psize_0 | 1;
   var $381=(($p_0+4)|0);
   HEAP32[(($381)>>2)]=$380;
   var $382=(($189+$psize_0)|0);
   var $383=$382;
   HEAP32[(($383)>>2)]=$psize_0;
   var $psize_1 = $psize_0;label = 113; break;
  case 113: 
   var $psize_1;
   var $385=$psize_1 >>> 3;
   var $386=(($psize_1)>>>(0)) < 256;
   if ($386) { label = 114; break; } else { label = 119; break; }
  case 114: 
   var $388=$385 << 1;
   var $389=((3632+($388<<2))|0);
   var $390=$389;
   var $391=HEAP32[((((3592)|0))>>2)];
   var $392=1 << $385;
   var $393=$391 & $392;
   var $394=(($393)|(0))==0;
   if ($394) { label = 115; break; } else { label = 116; break; }
  case 115: 
   var $396=$391 | $392;
   HEAP32[((((3592)|0))>>2)]=$396;
   var $_sum248_pre=((($388)+(2))|0);
   var $_pre=((3632+($_sum248_pre<<2))|0);
   var $F16_0 = $390;var $_pre_phi = $_pre;label = 118; break;
  case 116: 
   var $_sum249=((($388)+(2))|0);
   var $398=((3632+($_sum249<<2))|0);
   var $399=HEAP32[(($398)>>2)];
   var $400=$399;
   var $401=HEAP32[((((3608)|0))>>2)];
   var $402=(($400)>>>(0)) < (($401)>>>(0));
   if ($402) { label = 117; break; } else { var $F16_0 = $399;var $_pre_phi = $398;label = 118; break; }
  case 117: 
   _abort();
   throw "Reached an unreachable!";
  case 118: 
   var $_pre_phi;
   var $F16_0;
   HEAP32[(($_pre_phi)>>2)]=$p_0;
   var $405=(($F16_0+12)|0);
   HEAP32[(($405)>>2)]=$p_0;
   var $406=(($p_0+8)|0);
   HEAP32[(($406)>>2)]=$F16_0;
   var $407=(($p_0+12)|0);
   HEAP32[(($407)>>2)]=$390;
   label = 140; break;
  case 119: 
   var $409=$p_0;
   var $410=$psize_1 >>> 8;
   var $411=(($410)|(0))==0;
   if ($411) { var $I18_0 = 0;label = 122; break; } else { label = 120; break; }
  case 120: 
   var $413=(($psize_1)>>>(0)) > 16777215;
   if ($413) { var $I18_0 = 31;label = 122; break; } else { label = 121; break; }
  case 121: 
   var $415=((($410)+(1048320))|0);
   var $416=$415 >>> 16;
   var $417=$416 & 8;
   var $418=$410 << $417;
   var $419=((($418)+(520192))|0);
   var $420=$419 >>> 16;
   var $421=$420 & 4;
   var $422=$421 | $417;
   var $423=$418 << $421;
   var $424=((($423)+(245760))|0);
   var $425=$424 >>> 16;
   var $426=$425 & 2;
   var $427=$422 | $426;
   var $428=(((14)-($427))|0);
   var $429=$423 << $426;
   var $430=$429 >>> 15;
   var $431=((($428)+($430))|0);
   var $432=$431 << 1;
   var $433=((($431)+(7))|0);
   var $434=$psize_1 >>> (($433)>>>(0));
   var $435=$434 & 1;
   var $436=$435 | $432;
   var $I18_0 = $436;label = 122; break;
  case 122: 
   var $I18_0;
   var $438=((3896+($I18_0<<2))|0);
   var $439=(($p_0+28)|0);
   var $I18_0_c=$I18_0;
   HEAP32[(($439)>>2)]=$I18_0_c;
   var $440=(($p_0+20)|0);
   HEAP32[(($440)>>2)]=0;
   var $441=(($p_0+16)|0);
   HEAP32[(($441)>>2)]=0;
   var $442=HEAP32[((((3596)|0))>>2)];
   var $443=1 << $I18_0;
   var $444=$442 & $443;
   var $445=(($444)|(0))==0;
   if ($445) { label = 123; break; } else { label = 124; break; }
  case 123: 
   var $447=$442 | $443;
   HEAP32[((((3596)|0))>>2)]=$447;
   HEAP32[(($438)>>2)]=$409;
   var $448=(($p_0+24)|0);
   var $_c=$438;
   HEAP32[(($448)>>2)]=$_c;
   var $449=(($p_0+12)|0);
   HEAP32[(($449)>>2)]=$p_0;
   var $450=(($p_0+8)|0);
   HEAP32[(($450)>>2)]=$p_0;
   label = 136; break;
  case 124: 
   var $452=HEAP32[(($438)>>2)];
   var $453=(($I18_0)|(0))==31;
   if ($453) { var $458 = 0;label = 126; break; } else { label = 125; break; }
  case 125: 
   var $455=$I18_0 >>> 1;
   var $456=(((25)-($455))|0);
   var $458 = $456;label = 126; break;
  case 126: 
   var $458;
   var $459=$psize_1 << $458;
   var $K19_0 = $459;var $T_0 = $452;label = 127; break;
  case 127: 
   var $T_0;
   var $K19_0;
   var $461=(($T_0+4)|0);
   var $462=HEAP32[(($461)>>2)];
   var $463=$462 & -8;
   var $464=(($463)|(0))==(($psize_1)|(0));
   if ($464) { label = 132; break; } else { label = 128; break; }
  case 128: 
   var $466=$K19_0 >>> 31;
   var $467=(($T_0+16+($466<<2))|0);
   var $468=HEAP32[(($467)>>2)];
   var $469=(($468)|(0))==0;
   var $470=$K19_0 << 1;
   if ($469) { label = 129; break; } else { var $K19_0 = $470;var $T_0 = $468;label = 127; break; }
  case 129: 
   var $472=$467;
   var $473=HEAP32[((((3608)|0))>>2)];
   var $474=(($472)>>>(0)) < (($473)>>>(0));
   if ($474) { label = 131; break; } else { label = 130; break; }
  case 130: 
   HEAP32[(($467)>>2)]=$409;
   var $476=(($p_0+24)|0);
   var $T_0_c245=$T_0;
   HEAP32[(($476)>>2)]=$T_0_c245;
   var $477=(($p_0+12)|0);
   HEAP32[(($477)>>2)]=$p_0;
   var $478=(($p_0+8)|0);
   HEAP32[(($478)>>2)]=$p_0;
   label = 136; break;
  case 131: 
   _abort();
   throw "Reached an unreachable!";
  case 132: 
   var $481=(($T_0+8)|0);
   var $482=HEAP32[(($481)>>2)];
   var $483=$T_0;
   var $484=HEAP32[((((3608)|0))>>2)];
   var $485=(($483)>>>(0)) < (($484)>>>(0));
   if ($485) { label = 135; break; } else { label = 133; break; }
  case 133: 
   var $487=$482;
   var $488=(($487)>>>(0)) < (($484)>>>(0));
   if ($488) { label = 135; break; } else { label = 134; break; }
  case 134: 
   var $490=(($482+12)|0);
   HEAP32[(($490)>>2)]=$409;
   HEAP32[(($481)>>2)]=$409;
   var $491=(($p_0+8)|0);
   var $_c244=$482;
   HEAP32[(($491)>>2)]=$_c244;
   var $492=(($p_0+12)|0);
   var $T_0_c=$T_0;
   HEAP32[(($492)>>2)]=$T_0_c;
   var $493=(($p_0+24)|0);
   HEAP32[(($493)>>2)]=0;
   label = 136; break;
  case 135: 
   _abort();
   throw "Reached an unreachable!";
  case 136: 
   var $495=HEAP32[((((3624)|0))>>2)];
   var $496=((($495)-(1))|0);
   HEAP32[((((3624)|0))>>2)]=$496;
   var $497=(($496)|(0))==0;
   if ($497) { var $sp_0_in_i = ((4048)|0);label = 137; break; } else { label = 140; break; }
  case 137: 
   var $sp_0_in_i;
   var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
   var $498=(($sp_0_i)|(0))==0;
   var $499=(($sp_0_i+8)|0);
   if ($498) { label = 138; break; } else { var $sp_0_in_i = $499;label = 137; break; }
  case 138: 
   HEAP32[((((3624)|0))>>2)]=-1;
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