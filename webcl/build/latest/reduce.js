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
  if (typeof console !== 'undefined') {
    Module['print'] = function(x) {
      console.log(x);
    };
    Module['printErr'] = function(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
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
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
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
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        }
      }
    }
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
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
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
    assert(ret % 2 === 0);
    table.push(func);
    for (var i = 0; i < 2-1; i++) table.push(0);
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
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8);(assert((STACKTOP|0) < (STACK_MAX|0))|0); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + (assert(!staticSealed),size))|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + (assert(DYNAMICTOP > 0),size))|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((low>>>0)+((high>>>0)*4294967296)) : ((low>>>0)+((high|0)*4294967296))); return ret; },
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
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
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
// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0
}
Module['stringToUTF16'] = stringToUTF16;
// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;
  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;
// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr', 
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0
}
Module['stringToUTF32'] = stringToUTF32;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
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
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
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
function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    assert(str.charCodeAt(i) === str.charCodeAt(i)&0xff);
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i)
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;
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
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled
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
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
var memoryInitializer = null;
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 2368;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
/* memory initializer */ allocate([35,100,101,102,105,110,101,32,79,80,69,82,65,84,73,79,78,83,0,0,0,0,0,0,35,100,101,102,105,110,101,32,71,82,79,85,80,95,83,73,90,69,0,0,0,0,0,0,232,3,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,1,0,0,0,0,0,0,0,105,110,116,50,0,0,0,0,102,108,111,97,116,0,0,0,102,108,111,97,116,52,0,0,102,108,111,97,116,50,0,0,114,0,0,0,0,0,0,0,82,101,115,117,108,116,91,37,100,93,32,37,102,32,33,61,32,37,102,10,0,0,0,0,82,101,115,117,108,116,115,32,86,97,108,105,100,97,116,101,100,33,10,0,0,0,0,0,69,114,114,111,114,58,32,32,73,110,99,111,114,114,101,99,116,32,114,101,115,117,108,116,115,32,111,98,116,97,105,110,101,100,33,32,77,97,120,32,101,114,114,111,114,32,61,32,37,102,10,0,0,0,0,0,82,101,115,117,108,116,91,37,100,93,32,37,100,32,33,61,32,37,100,10,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,98,97,99,107,32,114,101,115,117,108,116,115,32,102,114,111,109,32,116,104,101,32,100,101,118,105,99,101,33,10,0,0,0,0,103,112,117,0,0,0,0,0,84,104,114,111,117,103,104,112,117,116,58,32,37,46,50,102,32,71,66,47,115,101,99,10,0,0,0,0,0,0,0,0,69,120,101,99,32,84,105,109,101,58,32,32,37,46,50,102,32,109,115,10,0,0,0,0,52,0,0,0,0,0,0,0,50,0,0,0,0,0,0,0,32,0,0,0,0,0,0,0,84,105,109,105,110,103,32,37,100,32,105,116,101,114,97,116,105,111,110,115,32,111,102,32,114,101,100,117,99,116,105,111,110,32,119,105,116,104,32,37,100,32,101,108,101,109,101,110,116,115,32,111,102,32,116,121,112,101,32,37,115,37,115,46,46,46,10,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,119,97,105,116,32,102,111,114,32,99,111,109,109,97,110,100,32,113,117,101,117,101,32,116,111,32,102,105,110,105,115,104,33,32,37,100,10,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,101,120,101,99,117,116,101,32,107,101,114,110,101,108,33,10,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,115,101,116,32,107,101,114,110,101,108,32,97,114,103,117,109,101,110,116,115,33,10,0,80,97,115,115,91,37,52,100,93,32,71,108,111,98,97,108,91,37,52,100,93,32,76,111,99,97,108,91,37,52,100,93,32,71,114,111,117,112,115,91,37,52,100,93,32,87,111,114,107,73,116,101,109,115,91,37,52,100,93,32,79,112,101,114,97,116,105,111,110,115,91,37,100,93,32,69,110,116,114,105,101,115,91,37,100,93,10,0,99,112,117,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,99,111,109,112,117,116,101,32,107,101,114,110,101,108,33,10,0,0,0,0,0,0,0,0,114,101,100,117,99,101,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,98,117,105,108,100,32,112,114,111,103,114,97,109,32,101,120,101,99,117,116,97,98,108,101,33,10,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,99,111,109,112,117,116,101,32,112,114,111,103,114,97,109,33,10,0,0,0,0,0,0,0,37,115,32,40,37,100,41,32,10,37,115,32,40,37,100,41,10,10,37,115,10,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,114,101,115,117,108,116,32,98,117,102,102,101,114,32,111,110,32,100,101,118,105,99,101,33,10,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,112,97,114,116,105,97,108,32,115,117,109,32,98,117,102,102,101,114,32,111,110,32,100,101,118,105,99,101,33,10,0,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,119,114,105,116,101,32,116,111,32,115,111,117,114,99,101,32,97,114,114,97,121,33,10,0,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,97,108,108,111,99,97,116,101,32,105,110,112,117,116,32,98,117,102,102,101,114,32,111,110,32,100,101,118,105,99,101,33,10,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,97,32,99,111,109,109,97,110,100,32,99,111,109,109,97,110,100,115,33,10,0,0,0,0,80,114,111,102,105,108,101,32,113,106,117,108,105,97,32,119,101,98,99,108,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,97,32,99,111,109,112,117,116,101,32,99,111,110,116,101,120,116,33,10,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,108,111,97,100,32,99,111,109,112,117,116,101,32,112,114,111,103,114,97,109,32,102,114,111,109,32,102,105,108,101,33,10,0,0,0,0,0,0,0,76,111,97,100,105,110,103,32,112,114,111,103,114,97,109,32,39,37,115,39,46,46,46,10,0,0,0,0,0,0,0,0,73,110,118,97,108,105,100,32,99,104,97,110,110,101,108,32,99,111,117,110,116,32,115,112,101,99,105,102,105,101,100,33,10,0,0,0,0,0,0,0,114,101,100,117,99,101,95,102,108,111,97,116,95,107,101,114,110,101,108,46,99,108,0,0,114,101,100,117,99,101,95,105,110,116,95,107,101,114,110,101,108,46,99,108,0,0,0,0,114,101,100,117,99,101,95,102,108,111,97,116,50,95,107,101,114,110,101,108,46,99,108,0,114,101,100,117,99,101,95,105,110,116,50,95,107,101,114,110,101,108,46,99,108,0,0,0,114,101,100,117,99,101,95,102,108,111,97,116,52,95,107,101,114,110,101,108,46,99,108,0,114,101,100,117,99,101,95,105,110,116,52,95,107,101,114,110,101,108,46,99,108,0,0,0,67,111,110,110,101,99,116,105,110,103,32,116,111,32,37,115,32,37,115,32,46,46,46,10,67,76,95,68,69,86,73,67,69,95,77,65,88,95,87,79,82,75,95,71,82,79,85,80,95,83,73,90,69,32,58,32,37,108,117,10,67,76,95,68,69,86,73,67,69,95,77,65,88,95,87,79,82,75,95,73,84,69,77,95,83,73,90,69,83,32,58,32,123,37,108,117,32,47,32,37,108,117,32,47,32,37,108,117,125,10,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,114,101,116,114,105,101,118,101,32,100,101,118,105,99,101,32,105,110,102,111,33,10,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,108,111,99,97,116,101,32,97,32,99,111,109,112,117,116,101,32,100,101,118,105,99,101,33,10,0,0,0,0,0,0,85,115,101,32,107,101,114,110,101,108,32,58,32,114,101,100,117,99,101,95,37,115,37,100,95,107,101,114,110,101,108,46,99,108,10,0,0,0,0,0,67,80,85,0,0,0,0,0,71,80,85,0,0,0,0,0,80,97,114,97,109,101,116,101,114,32,100,101,116,101,99,116,32,37,115,32,100,101,118,105,99,101,10,0,0,0,0,0,105,110,116,0,0,0,0,0,105,110,116,52,0,0,0,0,37,115,10,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
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
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
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
  var MEMFS={CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 0777, 0);
      },createNode:function (parent, name, mode, dev) {
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
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
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
          return MEMFS.createNode(parent, name, mode, dev);
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
          var node = MEMFS.createNode(parent, newname, 0777 | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
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
          if ( !(flags & 2) &&
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
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },reconcile:function (src, dst, callback) {
        var total = 0;
        var create = {};
        for (var key in src.files) {
          if (!src.files.hasOwnProperty(key)) continue;
          var e = src.files[key];
          var e2 = dst.files[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create[key] = e;
            total++;
          }
        }
        var remove = {};
        for (var key in dst.files) {
          if (!dst.files.hasOwnProperty(key)) continue;
          var e = dst.files[key];
          var e2 = src.files[key];
          if (!e2) {
            remove[key] = e;
            total++;
          }
        }
        if (!total) {
          // early out
          return callback(null);
        }
        var completed = 0;
        var done = function(err) {
          if (err) return callback(err);
          if (++completed >= total) {
            return callback(null);
          }
        };
        // create a single transaction to handle and IDB reads / writes we'll need to do
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        transaction.onerror = function() { callback(this.error); };
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
        for (var path in create) {
          if (!create.hasOwnProperty(path)) continue;
          var entry = create[path];
          if (dst.type === 'local') {
            // save file to local
            try {
              if (FS.isDir(entry.mode)) {
                FS.mkdir(path, entry.mode);
              } else if (FS.isFile(entry.mode)) {
                var stream = FS.open(path, 'w+', 0666);
                FS.write(stream, entry.contents, 0, entry.contents.length, 0, true /* canOwn */);
                FS.close(stream);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // save file to IDB
            var req = store.put(entry, path);
            req.onsuccess = function() { done(null); };
            req.onerror = function() { done(this.error); };
          }
        }
        for (var path in remove) {
          if (!remove.hasOwnProperty(path)) continue;
          var entry = remove[path];
          if (dst.type === 'local') {
            // delete file from local
            try {
              if (FS.isDir(entry.mode)) {
                // TODO recursive delete?
                FS.rmdir(path);
              } else if (FS.isFile(entry.mode)) {
                FS.unlink(path);
              }
              done(null);
            } catch (e) {
              return done(e);
            }
          } else {
            // delete file from IDB
            var req = store.delete(path);
            req.onsuccess = function() { done(null); };
            req.onerror = function() { done(this.error); };
          }
        }
      },getLocalSet:function (mount, callback) {
        var files = {};
        var isRealDir = function(p) {
          return p !== '.' && p !== '..';
        };
        var toAbsolute = function(root) {
          return function(p) {
            return PATH.join(root, p);
          }
        };
        var check = FS.readdir(mount.mountpoint)
          .filter(isRealDir)
          .map(toAbsolute(mount.mountpoint));
        while (check.length) {
          var path = check.pop();
          var stat, node;
          try {
            var lookup = FS.lookupPath(path);
            node = lookup.node;
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path)
              .filter(isRealDir)
              .map(toAbsolute(path)));
            files[path] = { mode: stat.mode, timestamp: stat.mtime };
          } else if (FS.isFile(stat.mode)) {
            files[path] = { contents: node.contents, mode: stat.mode, timestamp: stat.mtime };
          } else {
            return callback(new Error('node type not supported'));
          }
        }
        return callback(null, { type: 'local', files: files });
      },getDB:function (name, callback) {
        // look it up in the cache
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        req.onupgradeneeded = function() {
          db = req.result;
          db.createObjectStore(IDBFS.DB_STORE_NAME);
        };
        req.onsuccess = function() {
          db = req.result;
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getRemoteSet:function (mount, callback) {
        var files = {};
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          store.openCursor().onsuccess = function(event) {
            var cursor = event.target.result;
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, files: files });
            }
            files[cursor.key] = cursor.value;
            cursor.continue();
          };
        });
      }};
  var NODEFS={mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, stream.flags);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode)) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.position = position;
          return position;
        }}};
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[null],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:function ErrnoError(errno) {
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
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
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
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
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
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
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
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
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
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
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
            get: function() { return (stream.flags & 2097155) !== 1; }
          },
          isWrite: {
            get: function() { return (stream.flags & 2097155) !== 0; }
          },
          isAppend: {
            get: function() { return (stream.flags & 1024); }
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
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
        var completed = 0;
        var total = FS.mounts.length;
        var done = function(err) {
          if (err) {
            return callback(err);
          }
          if (++completed >= total) {
            callback(null);
          }
        };
        // sync all mounts
        for (var i = 0; i < FS.mounts.length; i++) {
          var mount = FS.mounts[i];
          if (!mount.type.syncfs) {
            done(null);
            continue;
          }
          mount.type.syncfs(mount, populate, done);
        }
      },mount:function (type, opts, mountpoint) {
        var lookup;
        if (mountpoint) {
          lookup = FS.lookupPath(mountpoint, { follow: false });
          mountpoint = lookup.path;  // use the absolute path
        }
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          root: null
        };
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
        // add to our cached list of mounts
        FS.mounts.push(mount);
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
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 0777;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 0666;
        }
        mode |= 8192;
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
        if ((stream.flags & 2097155) === 0) {
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
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        try {
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 131072)
          });
          node = lookup.node;
        } catch (e) {
          // ignore
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
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
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
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
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
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
        if ((stream.flags & 2097155) === 1) {
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
        if ((stream.flags & 2097155) === 0) {
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
        if (stream.flags & 1024) {
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
        if ((stream.flags & 2097155) === 0) {
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
        if ((stream.flags & 2097155) === 1) {
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
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
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
        FS.root = FS.createNode(null, '/', 16384 | 0777, 0);
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
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
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
        return FS.createNode(null, '/', 16384 | 0777, 0);
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
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
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
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
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
            return sock.pending.length ? (64 | 1) : 0;
          }
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
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
          var flagPadSign = false;
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
              case 32:
                flagPadSign = true;
                break;
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
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
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
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
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
          case 0x1403 /* GL_UNSIGNED_SHORT */:
            if (format == 0x1902 /* GL_DEPTH_COMPONENT */) {
              sizePerPixel = 2;
            } else {
              throw 'Invalid format (' + format + ')';
            }
            break;
          case 0x1405 /* GL_UNSIGNED_INT */:
            if (format == 0x1902 /* GL_DEPTH_COMPONENT */) {
              sizePerPixel = 4;
            } else {
              throw 'Invalid format (' + format + ')';
            }
            break;
          case 0x84FA /* UNSIGNED_INT_24_8_WEBGL */:
            sizePerPixel = 4;
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
        } else if (type == 0x1405 /* GL_UNSIGNED_INT */ || type == 0x84FA /* UNSIGNED_INT_24_8_WEBGL */) {
          pixels = HEAPU32.subarray((pixels)>>2,(pixels+bytes)>>2);
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
        GL.depthTextureExt = Module.ctx.getExtension("WEBGL_depth_texture") ||
                             Module.ctx.getExtension("MOZ_WEBGL_depth_texture") ||
                             Module.ctx.getExtension("WEBKIT_WEBGL_depth_texture");
      }};var CL={cl_digits:[1,2,3,4,5,6,7,8,9,0],cl_kernels_sig:{},cl_pn_type:0,cl_objects:{},cl_elapsed_time:0,cl_objects_counter:0,init:function () {
        if (typeof(webcl) === "undefined") {
          webcl = window.WebCL;
          if (typeof(webcl) === "undefined") {
            console.error("This browser has not WebCL implementation !!! \n");
            console.error("Use WebKit Samsung or Firefox Nokia plugin\n");     
          }
        }
        // Add webcl constant for double
        // webcl.FLOAT64 = 0x10DF;
      },udid:function (obj) {    
        var _id;
        if (obj !== undefined) {
          if ( obj.hasOwnProperty('udid') ) {
           _id = obj.udid;
           if (_id !== undefined) {
             return _id;
           }
          }
        }
        var _uuid = [];
        _uuid[0] = CL.cl_digits[0 | Math.random()*CL.cl_digits.length-1]; // First digit of udid can't be 0
        for (var i = 1; i < 6; i++) _uuid[i] = CL.cl_digits[0 | Math.random()*CL.cl_digits.length];
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
          CL.cl_objects_counter++;
          //console.info("Counter++ HashMap Object : " + CL.cl_objects_counter + " - Udid : " + _id);
        }
        return _id;      
      },parseKernel:function (kernel_string) {
        // Experimental parse of Kernel
        // Search kernel function like __kernel ... NAME ( p1 , p2 , p3)  
        // Step 1 : Search __kernel
        // Step 2 : Search kernel name (before the open brace)
        // Step 3 : Search brace '(' and ')'
        // Step 4 : Split all inside the brace by ',' after removing all space
        // Step 5 : For each parameter search Adress Space and Data Type
        //
        // --------------------------------------------------------------------
        var _kernel_struct = {};
        kernel_string = kernel_string.replace(/\n/g, " ");
        kernel_string = kernel_string.replace(/\r/g, " ");
        kernel_string = kernel_string.replace(/\t/g, " ");
        // Search kernel function __kernel 
        var _kernel_start = kernel_string.indexOf("__kernel");
        while (_kernel_start >= 0) {
          kernel_string = kernel_string.substr(_kernel_start,kernel_string.length-_kernel_start);
          var _brace_start = kernel_string.indexOf("(");
          var _brace_end = kernel_string.indexOf(")");  
          var _kernels_name = "";
          // Search kernel Name
          for (var i = _brace_start - 1; i >= 0 ; i--) {
            var _chara = kernel_string.charAt(i);
            if (_chara == ' ' && _kernels_name.length > 0) {
              break;
            } else if (_chara != ' ') {
              _kernels_name = _chara + _kernels_name;
            }
          }
          var _kernelsubstring = kernel_string.substr(_brace_start + 1,_brace_end - _brace_start - 1);
          _kernelsubstring = _kernelsubstring.replace(/\ /g, "");
          var _kernel_parameter = _kernelsubstring.split(",");
          kernel_string = kernel_string.substr(_brace_end);
          var _kernel_parameter_length = _kernel_parameter.length;
          var _parameter = new Array(_kernel_parameter_length);
          for (var i = 0; i < _kernel_parameter_length; i ++) {
            var _value = 0;
            var _string = _kernel_parameter[i]
            // Adress space
            // __global, __local, __constant, __private. 
            if (_string.indexOf("__local") >= 0 ) {
              _value = webcl.LOCAL;
            } 
            // Data Type
            // float, uchar, unsigned char, uint, unsigned int, int. 
            else if (_string.indexOf("float") >= 0 ) {
              _value = webcl.FLOAT;
            // } else if (_string.indexOf("double") >= 0 ) {
            //  _value = webcl.FLOAT64;
            } else if ( (_string.indexOf("uchar") >= 0 ) || (_string.indexOf("unsigned char") >= 0 ) ) {
              _value = webcl.UNSIGNED_INT8;
            } else if ( _string.indexOf("char") >= 0 ) {
              _value = webcl.SIGNED_INT8;
            } else if ( (_string.indexOf("ushort") >= 0 ) || (_string.indexOf("unsigned short") >= 0 ) ) {
              _value = webcl.UNSIGNED_INT16;
            } else if ( _string.indexOf("short") >= 0 ) {
              _value = webcl.SIGNED_INT16;                     
            } else if ( (_string.indexOf("uint") >= 0 ) || (_string.indexOf("unsigned int") >= 0 ) ) {
              _value = webcl.UNSIGNED_INT32;            
            } else if ( _string.indexOf("int") >= 0 ) {
              _value = webcl.SIGNED_INT32;
            } else {
              console.error("Unknow parameter type use float by default ...");   
              _value = webcl.FLOAT;
            }
            _parameter[i] = _value;
          }
          _kernel_struct[_kernels_name] = _parameter;
          _kernel_start = kernel_string.indexOf("__kernel");
        }
        for (var name in _kernel_struct) {
          console.info("Kernel NAME : " + name);      
          console.info("Kernel PARAMETER NUM : "+_kernel_struct[name].length);
        }
        return _kernel_struct;
      },getReferencePointerToArray:function (ptr,size,type) {  
        var _host_ptr = null;
        switch(type) {
          case webcl.SIGNED_INT8:
            _host_ptr = HEAP8.subarray((ptr),(ptr+size));
            break;
          case webcl.SIGNED_INT16:
            _host_ptr = HEAP16.subarray((ptr)>>1,(ptr+size)>>1);
            break;
          case webcl.SIGNED_INT32:
            _host_ptr = HEAP32.subarray((ptr)>>2,(ptr+size)>>2);
            break;
          case webcl.UNSIGNED_INT8:
            _host_ptr = HEAPU8.subarray((ptr),(ptr+size));
            break;
          case webcl.UNSIGNED_INT16:
            _host_ptr = HEAPU16.subarray((ptr)>>1,(ptr+size)>>1);
            break;
          case webcl.UNSIGNED_INT32:
            _host_ptr = HEAPU32.subarray((ptr)>>2,(ptr+size)>>2);
            break;         
          default:
            _host_ptr = HEAPF32.subarray((ptr)>>2,(ptr+size)>>2);
            break;
        }
        return _host_ptr;
      },getCopyPointerToArray:function (ptr,size,type) {  
        var _host_ptr = null;
        switch(type) {
          case webcl.SIGNED_INT8:
            _host_ptr = new Int8Array( HEAP8.subarray((ptr),(ptr+size)) );
            break;
          case webcl.SIGNED_INT16:
            _host_ptr = new Int16Array( HEAP16.subarray((ptr)>>1,(ptr+size)>>1) );
            break;
          case webcl.SIGNED_INT32:
            _host_ptr = new Int32Array( HEAP32.subarray((ptr)>>2,(ptr+size)>>2) );
            break;
          case webcl.UNSIGNED_INT8:
            _host_ptr = new UInt8Array( HEAPU8.subarray((ptr),(ptr+size)) );
            break;
          case webcl.UNSIGNED_INT16:
            _host_ptr = new UInt16Array( HEAPU16.subarray((ptr)>>1,(ptr+size)>>1) );
            break;
          case webcl.UNSIGNED_INT32:
            _host_ptr = new Int32Array( HEAPU32.subarray((ptr)>>2,(ptr+size)>>2) );
            break;         
          default:
            _host_ptr = new Float32Array( HEAPF32.subarray((ptr)>>2,(ptr+size)>>2) );
            break;
        }
        return _host_ptr;
      },getPointerToValue:function (ptr,type) {  
        var _value = null;
        switch(type) {
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
          default:
            _value = HEAPF32[((ptr)>>2)]
            break;
        }
        return _value;
      },catchError:function (e) {
        console.error(e);
        var _error = -1;
        if (typeof(WebCLException) !== "undefined") {
          if (e instanceof WebCLException) {
            var _str=e.message;
            var _n=_str.lastIndexOf(" ");
            _error = _str.substr(_n+1,_str.length-_n-1);
          }
        }
        return _error;
      },stack_trace:"// Javascript webcl Stack Trace\n(*) => all the stack_trace are print before the JS function call except for enqueueReadBuffer\n",webclBeginStackTrace:function (name,parameter) {
        CL.stack_trace += "\n" + name + "("
        CL.webclCallParameterStackTrace(parameter);
        CL.stack_trace += ")\n";
      },webclCallStackTrace:function (name,parameter) {
        CL.stack_trace += "\t->" + name + "("
        CL.webclCallParameterStackTrace(parameter);
        CL.stack_trace += ")\n";
      },webclCallParameterStackTrace:function (parameter) {
        for (var i = 0; i < parameter.length - 1 ; i++) {
          if ( ((typeof(ArrayBufferView) !== "undefined") && (parameter[i] instanceof ArrayBufferView)) || (parameter[i] instanceof ArrayBuffer) || (parameter[i] instanceof Array)){ 
            CL.stack_trace += "[";  
            for (var j = 0; j < parameter[i].length - 1 ; j++) {
              CL.stack_trace += parameter[i][j] + ",";
            }
            if (parameter[i].length >= 1) {
              CL.stack_trace += parameter[i][parameter[i].length - 1];
            }
            CL.stack_trace += "],";
          } else {
            CL.stack_trace += parameter[i] + ",";  
          }
        }
        if (parameter.length >= 1) {
          if ( ((typeof(ArrayBufferView) !== "undefined") && (parameter[parameter.length - 1] instanceof ArrayBufferView)) || (parameter[parameter.length - 1] instanceof ArrayBuffer) || (parameter[parameter.length - 1] instanceof Array) ) { 
            CL.stack_trace += "[";  
            for (var j = 0; j < parameter[parameter.length - 1].length - 1 ; j++) {
              CL.stack_trace += parameter[parameter.length - 1][j] + ",";
            }
            if (parameter[i].length >= 1) {
              CL.stack_trace += parameter[parameter.length - 1][parameter[parameter.length - 1].length - 1];
            }
            CL.stack_trace += "]";
          } else {
            CL.stack_trace += parameter[parameter.length - 1]; 
          }
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
      }};function _webclBeginProfile(name) {
      // start profiling
      console.profile(Pointer_stringify(name));
      CL.cl_elapsed_time = Date.now();
      return 0;
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
  function _rand() {
      return Math.floor(Math.random()*0x80000000);
    }
  function _clGetDeviceIDs(platform,device_type_i64_1,device_type_i64_2,num_entries,devices,num_devices) {
      // Assume the device_type is i32 
      assert(device_type_i64_2 == 0, 'Invalid device_type i64');
      CL.webclBeginStackTrace("clGetDeviceIDs",[platform,device_type_i64_1,num_entries,devices,num_devices]);
      // Init webcl variable if necessary
      CL.init();
      if ( num_entries == 0 && devices != 0) {
        CL.webclEndStackTrace([webcl.INVALID_VALUE],"num_entries is equal to zero and device is not NULL","");
        return webcl.INVALID_VALUE;
      }
      if ( num_devices == 0 && devices == 0) {
        CL.webclEndStackTrace([webcl.INVALID_VALUE],"both num_devices and device are NULL","");
        return webcl.INVALID_VALUE;
      }
      if ( platform != 0 && !(platform in CL.cl_objects)) {
        CL.webclEndStackTrace([webcl.INVALID_PLATFORM],"platform is not a valid platform","");
        return webcl.INVALID_PLATFORM;  
      }
      var _device = null;
      try {
        // If platform is NULL use the first platform found ...
        if (platform == 0) {
          CL.webclCallStackTrace(webcl+".getPlatforms",[]);
          var _platforms = webcl.getPlatforms();
          if (_platforms.length == 0) {
            CL.webclEndStackTrace([webcl.INVALID_PLATFORM],"platform not found","");
            return webcl.INVALID_PLATFORM;  
          }
          // Create a new UDID 
          platform = CL.udid(_platforms[0]);
        } 
        var _platform = CL.cl_objects[platform];
        CL.webclCallStackTrace(_platform+".getDevices",[device_type_i64_1]);
        _devices = _platform.getDevices(device_type_i64_1);
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error,devices,num_devices],"",e.message);
        return _error;
      }
      if (num_devices != 0) {
        HEAP32[((num_devices)>>2)]=_devices.length /* Num of device */;
      } 
      if (devices != 0) {
        for (var i = 0; i < Math.min(num_entries,_devices.length); i++) {
          var _id = CL.udid(_devices[i]);
          HEAP32[(((devices)+(i*4))>>2)]=_id;
        }
      }
      CL.webclEndStackTrace([webcl.SUCCESS,devices,num_devices],"","");
      return webcl.SUCCESS;
    }
  function _clGetDeviceInfo(device,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetDeviceInfo",[device,param_name,param_value_size,param_value,param_value_size_ret]);
        if (!(device in CL.cl_objects)) {
          CL.webclEndStackTrace([webcl.INVALID_DEVICE],"device are not in the map","");
          return webcl.INVALID_DEVICE;
        }
      var  _info = null;
      try { 
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
          _info = _object.getInfo(param_name);
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
      if(typeof(_info) == "number") {
        if (param_value_size == 8) {
          if (param_value != 0) (tempI64 = [_info>>>0,(Math.abs(_info) >= 1 ? (_info > 0 ? Math.min(Math.floor((_info)/4294967296), 4294967295)>>>0 : (~~(Math.ceil((_info - +(((~~(_info)))>>>0))/4294967296)))>>>0) : 0)],HEAP32[((param_value)>>2)]=tempI64[0],HEAP32[(((param_value)+(4))>>2)]=tempI64[1]);
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=8;
        } else {
          if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
        } 
      } else if(typeof(_info) == "boolean") {
        if (param_value != 0) (_info == true) ? HEAP32[((param_value)>>2)]=1 : HEAP32[((param_value)>>2)]=0;
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
      } else if(typeof(_info) == "string") {
        if (param_value != 0) writeStringToMemory(_info, param_value);
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=_info.length;
      } else if(typeof(_info) == "object") {
        if (_info instanceof Int32Array) {
          for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
            if (param_value != 0) HEAP32[(((param_value)+(i*4))>>2)]=_info[i];
          }
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=_info.length * 4;
        } else if (_info instanceof WebCLPlatform) {
          var _id = CL.udid(_info);
          if (param_value != 0) HEAP32[((param_value)>>2)]=_id;
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
        } else if (_info == null) {
          if (param_value != 0) HEAP32[((param_value)>>2)]=0;
          if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=0;
        } else {
          CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
          return webcl.INVALID_VALUE;
        }
      } else {
        CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
        return webcl.INVALID_VALUE;
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
                if ( (typeof(WebCLGL) !== "undefined") && (!(_webcl instanceof WebCLGL)) ){
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
        var _prop = null;
        if ( (typeof(WebCLGL) !== "undefined") && (_webcl instanceof WebCLGL) ) {   
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
  function _clCreateBuffer(context,flags_i64_1,flags_i64_2,size,host_ptr,cl_errcode_ret) {
      // Assume the flags is i32 
      assert(flags_i64_2 == 0, 'Invalid flags i64');
      CL.webclBeginStackTrace("clCreateBuffer",[flags_i64_1,size,host_ptr,cl_errcode_ret]);
      if (CL.cl_pn_type == 0) console.info("/!\\ clCreateBuffer : you don't call clSetTypePointer for host_ptr parameter");
      var _id = null;
      var _buffer = null;
      // Context must be created
      if (!(context in CL.cl_objects)) {
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=webcl.INVALID_CONTEXT;
        }
        CL.cl_pn_type = 0;
        CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
        return 0; 
      }
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
        CL.cl_pn_type = 0;
        CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
        return 0; 
      }
      var _host_ptr = null;
      if (flags_i64_1 & (1 << 4) /* CL_MEM_ALLOC_HOST_PTR */) {
        _host_ptr = new ArrayBuffer(size);
      } else if (host_ptr != 0 && (flags_i64_1 & (1 << 5) /* CL_MEM_COPY_HOST_PTR */)) {
        _host_ptr = CL.getCopyPointerToArray(host_ptr,size,CL.cl_pn_type);
      } else if (flags_i64_1 & ~_flags) {
        // /!\ For the CL_MEM_USE_HOST_PTR (1 << 3)... 
        // may be i can do fake it using the same behavior than CL_MEM_COPY_HOST_PTR --> @steven What do you thing ??
        console.error("clCreateBuffer : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
      }
      try {
        CL.webclCallStackTrace( CL.cl_objects[context]+".createBuffer",[_flags,size,_host_ptr]);
        if (_host_ptr != null) {
          _buffer = CL.cl_objects[context].createBuffer(_flags,size,_host_ptr.buffer);
        } else
          _buffer = CL.cl_objects[context].createBuffer(_flags,size);
      } catch (e) {
        var _error = CL.catchError(e);
        if (cl_errcode_ret != 0) {
          HEAP32[((cl_errcode_ret)>>2)]=_error;
        }
        CL.cl_pn_type = 0;
        CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
        return 0; // NULL Pointer
      }
      if (cl_errcode_ret != 0) {
        HEAP32[((cl_errcode_ret)>>2)]=0;
      }
      _id = CL.udid(_buffer);
      CL.cl_pn_type = 0;
      CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
      return _id;
    }
  function _clEnqueueWriteBuffer(command_queue,buffer,blocking_write,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
      CL.webclBeginStackTrace("clEnqueueWriteBuffer",[command_queue,buffer,blocking_write,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event]);
      if (CL.cl_pn_type == 0) console.info("/!\\ clEnqueueWriteBuffer : you don't call clSetTypePointer for ptr parameter");
      try { 
        if (command_queue in CL.cl_objects) {
          if (buffer in CL.cl_objects) {
            var _event = null;
            var _event_wait_list = [];
            var _host_ptr = CL.getCopyPointerToArray(ptr,cb,CL.cl_pn_type);
            for (var i = 0; i < num_events_in_wait_list; i++) {
              var _event_wait = HEAP32[(((event_wait_list)+(i*4))>>2)];
              if (_event_wait in CL.cl_objects) {
                _event_wait_list.push(_event_wait);
              } else {
                CL.cl_pn_type = 0;
                CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
                return webcl.INVALID_EVENT;    
              }
            } 
            CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueWriteBuffer",[CL.cl_objects[buffer],blocking_write,offset,cb,_host_ptr,_event_wait_list,_event]);
            CL.cl_objects[command_queue].enqueueWriteBuffer(CL.cl_objects[buffer],blocking_write,offset,cb,_host_ptr,_event_wait_list);    
            // CL.cl_objects[command_queue].enqueueWriteBuffer(CL.cl_objects[buffer],blocking_write,offset,cb,_host_ptr,_event_wait_list,_event);
            // if (event != 0) HEAP32[((event)>>2)]=CL.udid(_event);
        } else {
            CL.cl_pn_type = 0;
            CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"buffer are NULL","");
            return webcl.INVALID_MEM_OBJECT;
          }
        } else {
          CL.cl_pn_type = 0;
          CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
          return webcl.INVALID_COMMAND_QUEUE;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.cl_pn_type = 0;
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.cl_pn_type = 0;
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;  
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
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
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
        CL.cl_kernels_sig = CL.parseKernel(_string);
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
  function _clGetProgramBuildInfo(program,device,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetProgramBuildInfo",[program,device,param_name,param_value_size,param_value,param_value_size_ret]);
      // Program must be created
      if (!(program in CL.cl_objects)) {
        CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program '"+program+"' is not a valid program","");
        return webcl.INVALID_PROGRAM; 
      }
      if (!(device in CL.cl_objects)) {
        CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"device '"+device+"' is not a valid device","");
        return webcl.INVALID_DEVICE; 
      }
      var _info = null;
      try { 
        CL.webclCallStackTrace(""+CL.cl_objects[program]+".getBuildInfo",[device,param_name]);
        _info = CL.cl_objects[program].getBuildInfo(CL.cl_objects[device], param_name);
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
      if(typeof(_info) == "number") {
        if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
        if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
      } else if(typeof(_info) == "string") {
        if (param_value != 0) {
          writeStringToMemory(_info, param_value);
        }
        if (param_value_size_ret != 0) {
          HEAP32[((param_value_size_ret)>>2)]=_info.length;
        }
      } else {
        CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
        return webcl.INVALID_VALUE;
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
        Object.defineProperty(_kernel, "name", { value : _name,writable : false });
        Object.defineProperty(_kernel, "sig", { value : CL.cl_kernels_sig[_name],writable : false });
        console.info("clCreateKernel : Kernel '"+_kernel.name+"', has "+_kernel.sig+" parameters !!!!");
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
  function _clSetKernelArg(kernel,arg_index,arg_size,arg_value) {
      CL.webclBeginStackTrace("clSetKernelArg",[kernel,arg_index,arg_size,arg_value]);
      if (!(kernel in CL.cl_objects)) {
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],CL.cl_objects[kernel]+" is not a valid OpenCL kernel","");
        return webcl.INVALID_KERNEL;
      }
      if (CL.cl_objects[kernel].sig.length < arg_index) {
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],CL.cl_objects[kernel]+" doesn't contains sig array","");
        return webcl.INVALID_KERNEL;          
      }
      try {
        var _sig = CL.cl_objects[kernel].sig[arg_index];
        if (_sig == webcl.LOCAL) {
          // Not yet implemented in browser
          var _array = null;//new Uint32Array([arg_size]);
          CL.webclCallStackTrace(CL.cl_objects[kernel]+".setArg",[arg_index,_array]);
          // WD --> 
          //CL.cl_objects[kernel].setArg(arg_index,_array);
          // WebKit -->
          CL.cl_objects[kernel].setArg(arg_index,arg_size,WebCLKernelArgumentTypes.LOCAL_MEMORY_SIZE);
        } else {
          var _value = HEAP32[((arg_value)>>2)];
          if (_value in CL.cl_objects) {
            CL.webclCallStackTrace(CL.cl_objects[kernel]+".setArg",[arg_index,CL.cl_objects[_value]]);
            CL.cl_objects[kernel].setArg(arg_index,CL.cl_objects[_value]);
          } else {
            var _array = CL.getReferencePointerToArray(arg_value,arg_size,_sig);
            CL.webclCallStackTrace(CL.cl_objects[kernel]+".setArg",[arg_index,_array]);
            // WD --> 
            //CL.cl_objects[kernel].setArg(arg_index,_array);
            // WebKit -->     
            var _size = (arg_size>>(_array.BYTES_PER_ELEMENT>>1));
            var _type;
            switch(_sig) {
              case webcl.SIGNED_INT8:
                _type = WebCLKernelArgumentTypes.CHAR;
                break;
              case webcl.SIGNED_INT16:
                _type = WebCLKernelArgumentTypes.SHORT;
                break;
              case webcl.SIGNED_INT32:
                _type = WebCLKernelArgumentTypes.INT;
                break;
              case webcl.UNSIGNED_INT8:
                _type = WebCLKernelArgumentTypes.UCHAR;
                break;
              case webcl.UNSIGNED_INT16:
                _type = WebCLKernelArgumentTypes.USHORT;
                break;
              case webcl.UNSIGNED_INT32:
                _type = WebCLKernelArgumentTypes.UINT;
                break;
              default:
                _type = WebCLKernelArgumentTypes.FLOAT;
                break;
            }
            if ( _size > 1) {
              if (_size == 2) {
                _type |= WebCLKernelArgumentTypes.VEC2;
              } else if (_size == 3) {
                _type |= WebCLKernelArgumentTypes.VEC3;
              } else if (_size == 4) {
                _type |= WebCLKernelArgumentTypes.VEC4;
              } else if (_size == 8) {
                _type |= WebCLKernelArgumentTypes.VEC8;
              } else if (_size == 16) {
                _type |= WebCLKernelArgumentTypes.VEC16;
              }
              var _values = Array.apply( [], _array);
              CL.cl_objects[kernel].setArg(arg_index, _values, _type);
            } else {
              CL.cl_objects[kernel].setArg(arg_index,CL.getPointerToValue(arg_value,_sig),_type);
            }
          }
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clEnqueueNDRangeKernel(command_queue,kernel,work_dim,global_work_offset,global_work_size,local_work_size,num_events_in_wait_list,event_wait_list,event) {
      CL.webclBeginStackTrace("clEnqueueNDRangeKernel",[command_queue,kernel,work_dim,global_work_offset,global_work_size,local_work_size,num_events_in_wait_list,event_wait_list,event]);
      try { 
        if (command_queue in CL.cl_objects) {
          if (kernel in CL.cl_objects) {
            var _event = null;
            var _event_wait_list = [];
            // WD --> 
            // Workink Draft take CLuint[3]
            // var _global_work_offset = [];
            // var _global_work_size = [];
            // var _local_work_size = [];
            // WebKit -->
            // Webkit take UInt32Array     
            var _global_work_offset = global_work_offset == 0 ? null : new Int32Array(work_dim);
            var _global_work_size = new Int32Array(work_dim);
            var _local_work_size = local_work_size == 0 ? null : new Int32Array(work_dim);
            for (var i = 0; i < work_dim; i++) {
              //_global_work_size.push(HEAP32[(((global_work_size)+(i*4))>>2)]);
              //if (global_work_offset != 0)
              //  _global_work_offset.push(HEAP32[(((global_work_offset)+(i*4))>>2)]);
              //if (local_work_size != 0)
              //  _local_work_size.push(HEAP32[(((local_work_size)+(i*4))>>2)]);
              _global_work_size[i] = HEAP32[(((global_work_size)+(i*4))>>2)];
              if (_global_work_offset)
                _global_work_offset[i] = HEAP32[(((global_work_offset)+(i*4))>>2)];
              if (_local_work_size)
                _local_work_size[i] = HEAP32[(((local_work_size)+(i*4))>>2)];
            }
            for (var i = 0; i < num_events_in_wait_list; i++) {
              var _event_wait = HEAP32[(((event_wait_list)+(i*4))>>2)];
              if (_event_wait in CL.cl_objects) {
                _event_wait_list.push(_event_wait);
              } else {
                CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
                return webcl.INVALID_EVENT;    
              }
            }
            CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueNDRangeKernel",[CL.cl_objects[kernel],work_dim,_global_work_offset,_global_work_size,_local_work_size,_event_wait_list,_event]);
            CL.cl_objects[command_queue].enqueueNDRangeKernel(CL.cl_objects[kernel],_global_work_offset,_global_work_size,_local_work_size,_event_wait_list);       
            // CL.cl_objects[command_queue].enqueueNDRangeKernel(CL.cl_objects[kernel],work_dim,_global_work_offset,_global_work_size,_local_work_size,_event_wait_list,_event); 
            // if (event != 0) HEAP32[((event)>>2)]=CL.udid(_event);
        } else {
            CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"kernel are NULL","");
            return webcl.INVALID_MEM_OBJECT;
          }
        } else {
          CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
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
  function _clFinish(command_queue) {
      CL.webclBeginStackTrace("clFinish",[command_queue]);
      try { 
        if (command_queue in CL.cl_objects) {
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".finish",[]);
          CL.cl_objects[command_queue].finish();
        } else {
          CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
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
  function _clEnqueueReadBuffer(command_queue,buffer,blocking_read,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
      CL.webclBeginStackTrace("clEnqueueReadBuffer",[command_queue,buffer,blocking_read,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event]);
      if (CL.cl_pn_type == 0) console.info("/!\\ clEnqueueReadBuffer : you don't call clSetTypePointer for ptr parameter");
      try { 
        if (command_queue in CL.cl_objects) {
          if (buffer in CL.cl_objects) {
            var _host_ptr = CL.getReferencePointerToArray(ptr,cb,CL.cl_pn_type);
            var _event_wait_list = [];
            var _event = null;
            for (var i = 0; i < num_events_in_wait_list; i++) {
              var _event_wait = HEAP32[(((event_wait_list)+(i*4))>>2)];
              if (_event_wait in CL.cl_objects) {
                _event_wait_list.push(_event_wait);
              } else {
                CL.cl_pn_type = 0;
                CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
                return webcl.INVALID_EVENT;    
              }
            } 
            CL.cl_objects[command_queue].enqueueReadBuffer(CL.cl_objects[buffer],blocking_read,offset,cb,_host_ptr,_event_wait_list);
            //CL.cl_objects[command_queue].enqueueReadBuffer(CL.cl_objects[buffer],blocking_read,offset,cb,_host_ptr,_event_wait_list,_event);
            //if (event != 0) HEAP32[((event)>>2)]=CL.udid(_event);
            // It's the only callStackTrace call after the call for have info about the read host ptr
            CL.webclCallStackTrace("(*)"+CL.cl_objects[command_queue]+".enqueueReadBuffer",[CL.cl_objects[buffer],blocking_read,offset,cb,_host_ptr,_event_wait_list,_event]);
        } else {
            CL.cl_pn_type = 0;
            CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"buffer are NULL","");
            return webcl.INVALID_MEM_OBJECT;
          }
        } else {
          CL.cl_pn_type = 0;
          CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
          return webcl.INVALID_COMMAND_QUEUE;
        }
      } catch (e) {
        var _error = CL.catchError(e);
        CL.cl_pn_type = 0;
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.cl_pn_type = 0;
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;    
    }
  var _fabs=Math.abs;
  function _clReleaseKernel(kernel) {
      CL.webclBeginStackTrace("clReleaseKernel",[kernel]);
      if (!(kernel in CL.cl_objects)) {
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],CL.cl_objects[kernel]+" is not a valid OpenCL kernel","");
        return webcl.INVALID_KERNEL;
      }
      try {
        CL.webclCallStackTrace(CL.cl_objects[kernel]+".release",[]);
        //CL.cl_objects[kernel].release();
        delete CL.cl_objects[kernel];
        CL.cl_objects_counter--;
        //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + kernel);
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clReleaseProgram(program) {
      CL.webclBeginStackTrace("clReleaseProgram",[program]);
      if (program in CL.cl_objects) {
        CL.webclEndStackTrace([webcl.INVALID_SAMPLER],CL.cl_objects[program]+" is not a valid OpenCL program","");
        return webcl.INVALID_PROGRAM;
      }
      try {
          CL.webclCallStackTrace(CL.cl_objects[program]+".release",[]);
          CL.cl_objects[program].release();
          delete CL.cl_objects[program];
          CL.cl_objects_counter--;
          //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + program);
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clReleaseMemObject(memobj) {
      CL.webclBeginStackTrace("clReleaseMemObject",[memobj]);
      if (!(memobj in CL.cl_objects)) {
        CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],CL.cl_objects[memobj]+" is not a valid OpenCL memobj","");
        return webcl.INVALID_MEM_OBJECT;
      }
      try {
        CL.webclCallStackTrace(CL.cl_objects[memobj]+".release",[]);
        //CL.cl_objects[memobj].release();
        delete CL.cl_objects[memobj];
        CL.cl_objects_counter--;
        //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + memobj);
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clReleaseCommandQueue(command_queue) {
      CL.webclBeginStackTrace("clReleaseCommandQueue",[command_queue]);
      if (!(command_queue in CL.cl_objects)) {
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],CL.cl_objects[command_queue]+" is not a valid OpenCL command_queue","");
        return webcl.INVALID_COMMAND_QUEUE;
      }
      try {
          CL.webclCallStackTrace(CL.cl_objects[command_queue]+".release",[]);
          //CL.cl_objects[command_queue].release();
          delete CL.cl_objects[command_queue];
          CL.cl_objects_counter--;
          //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + command_queue);
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _clReleaseContext(context) {
      CL.webclBeginStackTrace("clReleaseContext",[context]);
      if (!(context in CL.cl_objects)) {
        CL.webclEndStackTrace([webcl.INVALID_CONTEXT],CL.cl_objects[context]+" is not a valid OpenCL context","");
        return webcl.INVALID_CONTEXT;
      }
      try {
          CL.webclCallStackTrace(CL.cl_objects[context]+".release",[]);
          //CL.cl_objects[context].release();
          delete CL.cl_objects[context];
          CL.cl_objects_counter--;
          //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + context);
      } catch (e) {
        var _error = CL.catchError(e);
        CL.webclEndStackTrace([_error],"",e.message);
        return _error;
      }
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
      return webcl.SUCCESS;
    }
  function _open(path, oflag, varargs) {
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
        flags |= 64;
        flags |= 512;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 64;
        flags |= 1024;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  function _stat(path, buf, dontResolveLastLink) {
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/stat.html
      // int stat(const char *path, struct stat *buf);
      // NOTE: dontResolveLastLink is a shortcut for lstat(). It should never be
      //       used in client code.
      path = typeof path !== 'string' ? Pointer_stringify(path) : path;
      try {
        var stat = dontResolveLastLink ? FS.lstat(path) : FS.stat(path);
        HEAP32[((buf)>>2)]=stat.dev;
        HEAP32[(((buf)+(4))>>2)]=0;
        HEAP32[(((buf)+(8))>>2)]=stat.ino;
        HEAP32[(((buf)+(12))>>2)]=stat.mode
        HEAP32[(((buf)+(16))>>2)]=stat.nlink
        HEAP32[(((buf)+(20))>>2)]=stat.uid
        HEAP32[(((buf)+(24))>>2)]=stat.gid
        HEAP32[(((buf)+(28))>>2)]=stat.rdev
        HEAP32[(((buf)+(32))>>2)]=0;
        HEAP32[(((buf)+(36))>>2)]=stat.size
        HEAP32[(((buf)+(40))>>2)]=4096
        HEAP32[(((buf)+(44))>>2)]=stat.blocks
        HEAP32[(((buf)+(48))>>2)]=Math.floor(stat.atime.getTime() / 1000)
        HEAP32[(((buf)+(52))>>2)]=0
        HEAP32[(((buf)+(56))>>2)]=Math.floor(stat.mtime.getTime() / 1000)
        HEAP32[(((buf)+(60))>>2)]=0
        HEAP32[(((buf)+(64))>>2)]=Math.floor(stat.ctime.getTime() / 1000)
        HEAP32[(((buf)+(68))>>2)]=0
        HEAP32[(((buf)+(72))>>2)]=stat.ino
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
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
  function _abort() {
      Module['abort']();
    }
  function ___errno_location() {
      return ___errno_state;
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
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
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
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); }
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
var FUNCTION_TABLE = [0, 0];
// EMSCRIPTEN_START_FUNCS
function _current_time() {
 var label = 0;
 var $call=_emscripten_get_now();
 var $conv$0 = $call>>>0; var $conv$1 = (Math.abs($call) >= 1 ? ($call > 0 ? Math.min(Math.floor(($call)/4294967296), 4294967295)>>>0 : (~~(Math.ceil(($call - +(((~~($call)))>>>0))/4294967296)))>>>0) : 0);
 return (tempRet0=$conv$1,$conv$0);
}
function _subtract_time_in_seconds($endtime$0, $endtime$1, $starttime$0, $starttime$1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $endtime_addr=sp;
 var $starttime_addr=(sp)+(8);
 var $st$0$0=(($endtime_addr)|0);
 HEAP32[(($st$0$0)>>2)]=$endtime$0;
 var $st$1$1=(($endtime_addr+4)|0);
 HEAP32[(($st$1$1)>>2)]=$endtime$1;
 var $st$2$0=(($starttime_addr)|0);
 HEAP32[(($st$2$0)>>2)]=$starttime$0;
 var $st$3$1=(($starttime_addr+4)|0);
 HEAP32[(($st$3$1)>>2)]=$starttime$1;
 var $ld$4$0=(($endtime_addr)|0);
 var $0$0=HEAP32[(($ld$4$0)>>2)];
 var $ld$5$1=(($endtime_addr+4)|0);
 var $0$1=HEAP32[(($ld$5$1)>>2)];
 var $ld$6$0=(($starttime_addr)|0);
 var $1$0=HEAP32[(($ld$6$0)>>2)];
 var $ld$7$1=(($starttime_addr+4)|0);
 var $1$1=HEAP32[(($ld$7$1)>>2)];
 var $sub$0 = _i64Subtract($0$0,$0$1,$1$0,$1$1); var $sub$1 = tempRet0;
 var $conv=(($sub$0>>>0)+(($sub$1>>>0)*4294967296));
 var $mul=((0.001))*($conv);
 STACKTOP = sp;
 return $mul;
}
function _reduce_validate_float($data, $size, $result) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $data_addr;
   var $size_addr;
   var $result_addr;
   var $i;
   var $sum;
   var $c;
   var $y;
   var $t;
   $data_addr=$data;
   $size_addr=$size;
   $result_addr=$result;
   var $0=$data_addr;
   var $arrayidx=(($0)|0);
   var $1=HEAPF32[(($arrayidx)>>2)];
   $sum=$1;
   $c=0;
   $i=1;
   label = 2; break;
  case 2: 
   var $2=$i;
   var $3=$size_addr;
   var $cmp=($2|0) < ($3|0);
   if ($cmp) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $4=$i;
   var $5=$data_addr;
   var $arrayidx1=(($5+($4<<2))|0);
   var $6=HEAPF32[(($arrayidx1)>>2)];
   var $7=$c;
   var $sub=($6)-($7);
   $y=$sub;
   var $8=$sum;
   var $9=$y;
   var $add=($8)+($9);
   $t=$add;
   var $10=$t;
   var $11=$sum;
   var $sub2=($10)-($11);
   var $12=$y;
   var $sub3=($sub2)-($12);
   $c=$sub3;
   var $13=$t;
   $sum=$13;
   label = 4; break;
  case 4: 
   var $14=$i;
   var $inc=((($14)+(1))|0);
   $i=$inc;
   label = 2; break;
  case 5: 
   var $15=$sum;
   var $16=$result_addr;
   var $arrayidx4=(($16)|0);
   HEAPF32[(($arrayidx4)>>2)]=$15;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _reduce_validate_float2($data, $size, $result) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $data_addr;
   var $size_addr;
   var $result_addr;
   var $i;
   var $c=sp;
   var $y=(sp)+(8);
   var $t=(sp)+(16);
   $data_addr=$data;
   $size_addr=$size;
   $result_addr=$result;
   var $0=$c;
   HEAP32[(($0)>>2)]=0; HEAP32[((($0)+(4))>>2)]=0;
   var $1=$data_addr;
   var $arrayidx=(($1)|0);
   var $2=HEAPF32[(($arrayidx)>>2)];
   var $3=$result_addr;
   var $arrayidx1=(($3)|0);
   HEAPF32[(($arrayidx1)>>2)]=$2;
   var $4=$data_addr;
   var $arrayidx2=(($4+4)|0);
   var $5=HEAPF32[(($arrayidx2)>>2)];
   var $6=$result_addr;
   var $arrayidx3=(($6+4)|0);
   HEAPF32[(($arrayidx3)>>2)]=$5;
   $i=1;
   label = 2; break;
  case 2: 
   var $7=$i;
   var $8=$size_addr;
   var $cmp=($7|0) < ($8|0);
   if ($cmp) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $arrayinit_begin=(($y)|0);
   var $9=$i;
   var $mul=($9<<1);
   var $add=(($mul)|0);
   var $10=$data_addr;
   var $arrayidx4=(($10+($add<<2))|0);
   var $11=HEAPF32[(($arrayidx4)>>2)];
   var $arrayidx5=(($c)|0);
   var $12=HEAPF32[(($arrayidx5)>>2)];
   var $sub=($11)-($12);
   HEAPF32[(($arrayinit_begin)>>2)]=$sub;
   var $arrayinit_element=(($arrayinit_begin+4)|0);
   var $13=$i;
   var $mul6=($13<<1);
   var $add7=((($mul6)+(1))|0);
   var $14=$data_addr;
   var $arrayidx8=(($14+($add7<<2))|0);
   var $15=HEAPF32[(($arrayidx8)>>2)];
   var $arrayidx9=(($c+4)|0);
   var $16=HEAPF32[(($arrayidx9)>>2)];
   var $sub10=($15)-($16);
   HEAPF32[(($arrayinit_element)>>2)]=$sub10;
   var $arrayinit_begin11=(($t)|0);
   var $17=$result_addr;
   var $arrayidx12=(($17)|0);
   var $18=HEAPF32[(($arrayidx12)>>2)];
   var $arrayidx13=(($y)|0);
   var $19=HEAPF32[(($arrayidx13)>>2)];
   var $add14=($18)+($19);
   HEAPF32[(($arrayinit_begin11)>>2)]=$add14;
   var $arrayinit_element15=(($arrayinit_begin11+4)|0);
   var $20=$result_addr;
   var $arrayidx16=(($20+4)|0);
   var $21=HEAPF32[(($arrayidx16)>>2)];
   var $arrayidx17=(($y+4)|0);
   var $22=HEAPF32[(($arrayidx17)>>2)];
   var $add18=($21)+($22);
   HEAPF32[(($arrayinit_element15)>>2)]=$add18;
   var $arrayidx19=(($t)|0);
   var $23=HEAPF32[(($arrayidx19)>>2)];
   var $24=$result_addr;
   var $arrayidx20=(($24)|0);
   var $25=HEAPF32[(($arrayidx20)>>2)];
   var $sub21=($23)-($25);
   var $arrayidx22=(($y)|0);
   var $26=HEAPF32[(($arrayidx22)>>2)];
   var $sub23=($sub21)-($26);
   var $arrayidx24=(($c)|0);
   HEAPF32[(($arrayidx24)>>2)]=$sub23;
   var $arrayidx25=(($t+4)|0);
   var $27=HEAPF32[(($arrayidx25)>>2)];
   var $28=$result_addr;
   var $arrayidx26=(($28+4)|0);
   var $29=HEAPF32[(($arrayidx26)>>2)];
   var $sub27=($27)-($29);
   var $arrayidx28=(($y+4)|0);
   var $30=HEAPF32[(($arrayidx28)>>2)];
   var $sub29=($sub27)-($30);
   var $arrayidx30=(($c+4)|0);
   HEAPF32[(($arrayidx30)>>2)]=$sub29;
   var $arrayidx31=(($t)|0);
   var $31=HEAPF32[(($arrayidx31)>>2)];
   var $32=$result_addr;
   var $arrayidx32=(($32)|0);
   HEAPF32[(($arrayidx32)>>2)]=$31;
   var $arrayidx33=(($t+4)|0);
   var $33=HEAPF32[(($arrayidx33)>>2)];
   var $34=$result_addr;
   var $arrayidx34=(($34+4)|0);
   HEAPF32[(($arrayidx34)>>2)]=$33;
   label = 4; break;
  case 4: 
   var $35=$i;
   var $inc=((($35)+(1))|0);
   $i=$inc;
   label = 2; break;
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _reduce_validate_float4($data, $size, $result) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 48)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $data_addr;
   var $size_addr;
   var $result_addr;
   var $i;
   var $c=sp;
   var $y=(sp)+(16);
   var $t=(sp)+(32);
   $data_addr=$data;
   $size_addr=$size;
   $result_addr=$result;
   var $0=$c;
   HEAP32[(($0)>>2)]=0; HEAP32[((($0)+(4))>>2)]=0; HEAP32[((($0)+(8))>>2)]=0; HEAP32[((($0)+(12))>>2)]=0;
   var $1=$data_addr;
   var $arrayidx=(($1)|0);
   var $2=HEAPF32[(($arrayidx)>>2)];
   var $3=$result_addr;
   var $arrayidx1=(($3)|0);
   HEAPF32[(($arrayidx1)>>2)]=$2;
   var $4=$data_addr;
   var $arrayidx2=(($4+4)|0);
   var $5=HEAPF32[(($arrayidx2)>>2)];
   var $6=$result_addr;
   var $arrayidx3=(($6+4)|0);
   HEAPF32[(($arrayidx3)>>2)]=$5;
   var $7=$data_addr;
   var $arrayidx4=(($7+8)|0);
   var $8=HEAPF32[(($arrayidx4)>>2)];
   var $9=$result_addr;
   var $arrayidx5=(($9+8)|0);
   HEAPF32[(($arrayidx5)>>2)]=$8;
   var $10=$data_addr;
   var $arrayidx6=(($10+12)|0);
   var $11=HEAPF32[(($arrayidx6)>>2)];
   var $12=$result_addr;
   var $arrayidx7=(($12+12)|0);
   HEAPF32[(($arrayidx7)>>2)]=$11;
   $i=1;
   label = 2; break;
  case 2: 
   var $13=$i;
   var $14=$size_addr;
   var $cmp=($13|0) < ($14|0);
   if ($cmp) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $arrayinit_begin=(($y)|0);
   var $15=$i;
   var $mul=($15<<2);
   var $add=(($mul)|0);
   var $16=$data_addr;
   var $arrayidx8=(($16+($add<<2))|0);
   var $17=HEAPF32[(($arrayidx8)>>2)];
   var $arrayidx9=(($c)|0);
   var $18=HEAPF32[(($arrayidx9)>>2)];
   var $sub=($17)-($18);
   HEAPF32[(($arrayinit_begin)>>2)]=$sub;
   var $arrayinit_element=(($arrayinit_begin+4)|0);
   var $19=$i;
   var $mul10=($19<<2);
   var $add11=((($mul10)+(1))|0);
   var $20=$data_addr;
   var $arrayidx12=(($20+($add11<<2))|0);
   var $21=HEAPF32[(($arrayidx12)>>2)];
   var $arrayidx13=(($c+4)|0);
   var $22=HEAPF32[(($arrayidx13)>>2)];
   var $sub14=($21)-($22);
   HEAPF32[(($arrayinit_element)>>2)]=$sub14;
   var $arrayinit_element15=(($arrayinit_element+4)|0);
   var $23=$i;
   var $mul16=($23<<2);
   var $add17=((($mul16)+(2))|0);
   var $24=$data_addr;
   var $arrayidx18=(($24+($add17<<2))|0);
   var $25=HEAPF32[(($arrayidx18)>>2)];
   var $arrayidx19=(($c+8)|0);
   var $26=HEAPF32[(($arrayidx19)>>2)];
   var $sub20=($25)-($26);
   HEAPF32[(($arrayinit_element15)>>2)]=$sub20;
   var $arrayinit_element21=(($arrayinit_element15+4)|0);
   var $27=$i;
   var $mul22=($27<<2);
   var $add23=((($mul22)+(3))|0);
   var $28=$data_addr;
   var $arrayidx24=(($28+($add23<<2))|0);
   var $29=HEAPF32[(($arrayidx24)>>2)];
   var $arrayidx25=(($c+12)|0);
   var $30=HEAPF32[(($arrayidx25)>>2)];
   var $sub26=($29)-($30);
   HEAPF32[(($arrayinit_element21)>>2)]=$sub26;
   var $arrayinit_begin27=(($t)|0);
   var $31=$result_addr;
   var $arrayidx28=(($31)|0);
   var $32=HEAPF32[(($arrayidx28)>>2)];
   var $arrayidx29=(($y)|0);
   var $33=HEAPF32[(($arrayidx29)>>2)];
   var $add30=($32)+($33);
   HEAPF32[(($arrayinit_begin27)>>2)]=$add30;
   var $arrayinit_element31=(($arrayinit_begin27+4)|0);
   var $34=$result_addr;
   var $arrayidx32=(($34+4)|0);
   var $35=HEAPF32[(($arrayidx32)>>2)];
   var $arrayidx33=(($y+4)|0);
   var $36=HEAPF32[(($arrayidx33)>>2)];
   var $add34=($35)+($36);
   HEAPF32[(($arrayinit_element31)>>2)]=$add34;
   var $arrayinit_element35=(($arrayinit_element31+4)|0);
   var $37=$result_addr;
   var $arrayidx36=(($37+8)|0);
   var $38=HEAPF32[(($arrayidx36)>>2)];
   var $arrayidx37=(($y+8)|0);
   var $39=HEAPF32[(($arrayidx37)>>2)];
   var $add38=($38)+($39);
   HEAPF32[(($arrayinit_element35)>>2)]=$add38;
   var $arrayinit_element39=(($arrayinit_element35+4)|0);
   var $40=$result_addr;
   var $arrayidx40=(($40+12)|0);
   var $41=HEAPF32[(($arrayidx40)>>2)];
   var $arrayidx41=(($y+12)|0);
   var $42=HEAPF32[(($arrayidx41)>>2)];
   var $add42=($41)+($42);
   HEAPF32[(($arrayinit_element39)>>2)]=$add42;
   var $arrayidx43=(($t)|0);
   var $43=HEAPF32[(($arrayidx43)>>2)];
   var $44=$result_addr;
   var $arrayidx44=(($44)|0);
   var $45=HEAPF32[(($arrayidx44)>>2)];
   var $sub45=($43)-($45);
   var $arrayidx46=(($y)|0);
   var $46=HEAPF32[(($arrayidx46)>>2)];
   var $sub47=($sub45)-($46);
   var $arrayidx48=(($c)|0);
   HEAPF32[(($arrayidx48)>>2)]=$sub47;
   var $arrayidx49=(($t+4)|0);
   var $47=HEAPF32[(($arrayidx49)>>2)];
   var $48=$result_addr;
   var $arrayidx50=(($48+4)|0);
   var $49=HEAPF32[(($arrayidx50)>>2)];
   var $sub51=($47)-($49);
   var $arrayidx52=(($y+4)|0);
   var $50=HEAPF32[(($arrayidx52)>>2)];
   var $sub53=($sub51)-($50);
   var $arrayidx54=(($c+4)|0);
   HEAPF32[(($arrayidx54)>>2)]=$sub53;
   var $arrayidx55=(($t+8)|0);
   var $51=HEAPF32[(($arrayidx55)>>2)];
   var $52=$result_addr;
   var $arrayidx56=(($52+8)|0);
   var $53=HEAPF32[(($arrayidx56)>>2)];
   var $sub57=($51)-($53);
   var $arrayidx58=(($y+8)|0);
   var $54=HEAPF32[(($arrayidx58)>>2)];
   var $sub59=($sub57)-($54);
   var $arrayidx60=(($c+8)|0);
   HEAPF32[(($arrayidx60)>>2)]=$sub59;
   var $arrayidx61=(($t+12)|0);
   var $55=HEAPF32[(($arrayidx61)>>2)];
   var $56=$result_addr;
   var $arrayidx62=(($56+12)|0);
   var $57=HEAPF32[(($arrayidx62)>>2)];
   var $sub63=($55)-($57);
   var $arrayidx64=(($y+12)|0);
   var $58=HEAPF32[(($arrayidx64)>>2)];
   var $sub65=($sub63)-($58);
   var $arrayidx66=(($c+12)|0);
   HEAPF32[(($arrayidx66)>>2)]=$sub65;
   var $arrayidx67=(($t)|0);
   var $59=HEAPF32[(($arrayidx67)>>2)];
   var $60=$result_addr;
   var $arrayidx68=(($60)|0);
   HEAPF32[(($arrayidx68)>>2)]=$59;
   var $arrayidx69=(($t+4)|0);
   var $61=HEAPF32[(($arrayidx69)>>2)];
   var $62=$result_addr;
   var $arrayidx70=(($62+4)|0);
   HEAPF32[(($arrayidx70)>>2)]=$61;
   var $arrayidx71=(($t+8)|0);
   var $63=HEAPF32[(($arrayidx71)>>2)];
   var $64=$result_addr;
   var $arrayidx72=(($64+8)|0);
   HEAPF32[(($arrayidx72)>>2)]=$63;
   var $arrayidx73=(($t+12)|0);
   var $65=HEAPF32[(($arrayidx73)>>2)];
   var $66=$result_addr;
   var $arrayidx74=(($66+12)|0);
   HEAPF32[(($arrayidx74)>>2)]=$65;
   label = 4; break;
  case 4: 
   var $67=$i;
   var $inc=((($67)+(1))|0);
   $i=$inc;
   label = 2; break;
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _reduce_validate_int($data, $size, $result) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $data_addr;
   var $size_addr;
   var $result_addr;
   var $i;
   var $sum;
   var $c;
   var $y;
   var $t;
   $data_addr=$data;
   $size_addr=$size;
   $result_addr=$result;
   var $0=$data_addr;
   var $arrayidx=(($0)|0);
   var $1=HEAP32[(($arrayidx)>>2)];
   $sum=$1;
   $c=0;
   $i=1;
   label = 2; break;
  case 2: 
   var $2=$i;
   var $3=$size_addr;
   var $cmp=($2|0) < ($3|0);
   if ($cmp) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $4=$i;
   var $5=$data_addr;
   var $arrayidx1=(($5+($4<<2))|0);
   var $6=HEAP32[(($arrayidx1)>>2)];
   var $7=$c;
   var $sub=((($6)-($7))|0);
   $y=$sub;
   var $8=$sum;
   var $9=$y;
   var $add=((($8)+($9))|0);
   $t=$add;
   var $10=$t;
   var $11=$sum;
   var $sub2=((($10)-($11))|0);
   var $12=$y;
   var $sub3=((($sub2)-($12))|0);
   $c=$sub3;
   var $13=$t;
   $sum=$13;
   label = 4; break;
  case 4: 
   var $14=$i;
   var $inc=((($14)+(1))|0);
   $i=$inc;
   label = 2; break;
  case 5: 
   var $15=$sum;
   var $16=$result_addr;
   var $arrayidx4=(($16)|0);
   HEAP32[(($arrayidx4)>>2)]=$15;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _reduce_validate_int2($data, $size, $result) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 24)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $data_addr;
   var $size_addr;
   var $result_addr;
   var $i;
   var $c=sp;
   var $y=(sp)+(8);
   var $t=(sp)+(16);
   $data_addr=$data;
   $size_addr=$size;
   $result_addr=$result;
   var $0=$c;
   HEAP32[(($0)>>2)]=0; HEAP32[((($0)+(4))>>2)]=0;
   var $1=$data_addr;
   var $arrayidx=(($1)|0);
   var $2=HEAP32[(($arrayidx)>>2)];
   var $3=$result_addr;
   var $arrayidx1=(($3)|0);
   HEAP32[(($arrayidx1)>>2)]=$2;
   var $4=$data_addr;
   var $arrayidx2=(($4+4)|0);
   var $5=HEAP32[(($arrayidx2)>>2)];
   var $6=$result_addr;
   var $arrayidx3=(($6+4)|0);
   HEAP32[(($arrayidx3)>>2)]=$5;
   $i=1;
   label = 2; break;
  case 2: 
   var $7=$i;
   var $8=$size_addr;
   var $cmp=($7|0) < ($8|0);
   if ($cmp) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $arrayinit_begin=(($y)|0);
   var $9=$i;
   var $mul=($9<<1);
   var $add=(($mul)|0);
   var $10=$data_addr;
   var $arrayidx4=(($10+($add<<2))|0);
   var $11=HEAP32[(($arrayidx4)>>2)];
   var $arrayidx5=(($c)|0);
   var $12=HEAP32[(($arrayidx5)>>2)];
   var $sub=((($11)-($12))|0);
   HEAP32[(($arrayinit_begin)>>2)]=$sub;
   var $arrayinit_element=(($arrayinit_begin+4)|0);
   var $13=$i;
   var $mul6=($13<<1);
   var $add7=((($mul6)+(1))|0);
   var $14=$data_addr;
   var $arrayidx8=(($14+($add7<<2))|0);
   var $15=HEAP32[(($arrayidx8)>>2)];
   var $arrayidx9=(($c+4)|0);
   var $16=HEAP32[(($arrayidx9)>>2)];
   var $sub10=((($15)-($16))|0);
   HEAP32[(($arrayinit_element)>>2)]=$sub10;
   var $arrayinit_begin11=(($t)|0);
   var $17=$result_addr;
   var $arrayidx12=(($17)|0);
   var $18=HEAP32[(($arrayidx12)>>2)];
   var $arrayidx13=(($y)|0);
   var $19=HEAP32[(($arrayidx13)>>2)];
   var $add14=((($18)+($19))|0);
   HEAP32[(($arrayinit_begin11)>>2)]=$add14;
   var $arrayinit_element15=(($arrayinit_begin11+4)|0);
   var $20=$result_addr;
   var $arrayidx16=(($20+4)|0);
   var $21=HEAP32[(($arrayidx16)>>2)];
   var $arrayidx17=(($y+4)|0);
   var $22=HEAP32[(($arrayidx17)>>2)];
   var $add18=((($21)+($22))|0);
   HEAP32[(($arrayinit_element15)>>2)]=$add18;
   var $arrayidx19=(($t)|0);
   var $23=HEAP32[(($arrayidx19)>>2)];
   var $24=$result_addr;
   var $arrayidx20=(($24)|0);
   var $25=HEAP32[(($arrayidx20)>>2)];
   var $sub21=((($23)-($25))|0);
   var $arrayidx22=(($y)|0);
   var $26=HEAP32[(($arrayidx22)>>2)];
   var $sub23=((($sub21)-($26))|0);
   var $arrayidx24=(($c)|0);
   HEAP32[(($arrayidx24)>>2)]=$sub23;
   var $arrayidx25=(($t+4)|0);
   var $27=HEAP32[(($arrayidx25)>>2)];
   var $28=$result_addr;
   var $arrayidx26=(($28+4)|0);
   var $29=HEAP32[(($arrayidx26)>>2)];
   var $sub27=((($27)-($29))|0);
   var $arrayidx28=(($y+4)|0);
   var $30=HEAP32[(($arrayidx28)>>2)];
   var $sub29=((($sub27)-($30))|0);
   var $arrayidx30=(($c+4)|0);
   HEAP32[(($arrayidx30)>>2)]=$sub29;
   var $arrayidx31=(($t)|0);
   var $31=HEAP32[(($arrayidx31)>>2)];
   var $32=$result_addr;
   var $arrayidx32=(($32)|0);
   HEAP32[(($arrayidx32)>>2)]=$31;
   var $arrayidx33=(($t+4)|0);
   var $33=HEAP32[(($arrayidx33)>>2)];
   var $34=$result_addr;
   var $arrayidx34=(($34+4)|0);
   HEAP32[(($arrayidx34)>>2)]=$33;
   label = 4; break;
  case 4: 
   var $35=$i;
   var $inc=((($35)+(1))|0);
   $i=$inc;
   label = 2; break;
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _reduce_validate_int4($data, $size, $result) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 48)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $data_addr;
   var $size_addr;
   var $result_addr;
   var $i;
   var $c=sp;
   var $y=(sp)+(16);
   var $t=(sp)+(32);
   $data_addr=$data;
   $size_addr=$size;
   $result_addr=$result;
   var $0=$c;
   HEAP32[(($0)>>2)]=0; HEAP32[((($0)+(4))>>2)]=0; HEAP32[((($0)+(8))>>2)]=0; HEAP32[((($0)+(12))>>2)]=0;
   var $1=$data_addr;
   var $arrayidx=(($1)|0);
   var $2=HEAP32[(($arrayidx)>>2)];
   var $3=$result_addr;
   var $arrayidx1=(($3)|0);
   HEAP32[(($arrayidx1)>>2)]=$2;
   var $4=$data_addr;
   var $arrayidx2=(($4+4)|0);
   var $5=HEAP32[(($arrayidx2)>>2)];
   var $6=$result_addr;
   var $arrayidx3=(($6+4)|0);
   HEAP32[(($arrayidx3)>>2)]=$5;
   var $7=$data_addr;
   var $arrayidx4=(($7+8)|0);
   var $8=HEAP32[(($arrayidx4)>>2)];
   var $9=$result_addr;
   var $arrayidx5=(($9+8)|0);
   HEAP32[(($arrayidx5)>>2)]=$8;
   var $10=$data_addr;
   var $arrayidx6=(($10+12)|0);
   var $11=HEAP32[(($arrayidx6)>>2)];
   var $12=$result_addr;
   var $arrayidx7=(($12+12)|0);
   HEAP32[(($arrayidx7)>>2)]=$11;
   $i=1;
   label = 2; break;
  case 2: 
   var $13=$i;
   var $14=$size_addr;
   var $cmp=($13|0) < ($14|0);
   if ($cmp) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $arrayinit_begin=(($y)|0);
   var $15=$i;
   var $mul=($15<<2);
   var $add=(($mul)|0);
   var $16=$data_addr;
   var $arrayidx8=(($16+($add<<2))|0);
   var $17=HEAP32[(($arrayidx8)>>2)];
   var $arrayidx9=(($c)|0);
   var $18=HEAP32[(($arrayidx9)>>2)];
   var $sub=((($17)-($18))|0);
   HEAP32[(($arrayinit_begin)>>2)]=$sub;
   var $arrayinit_element=(($arrayinit_begin+4)|0);
   var $19=$i;
   var $mul10=($19<<2);
   var $add11=((($mul10)+(1))|0);
   var $20=$data_addr;
   var $arrayidx12=(($20+($add11<<2))|0);
   var $21=HEAP32[(($arrayidx12)>>2)];
   var $arrayidx13=(($c+4)|0);
   var $22=HEAP32[(($arrayidx13)>>2)];
   var $sub14=((($21)-($22))|0);
   HEAP32[(($arrayinit_element)>>2)]=$sub14;
   var $arrayinit_element15=(($arrayinit_element+4)|0);
   var $23=$i;
   var $mul16=($23<<2);
   var $add17=((($mul16)+(2))|0);
   var $24=$data_addr;
   var $arrayidx18=(($24+($add17<<2))|0);
   var $25=HEAP32[(($arrayidx18)>>2)];
   var $arrayidx19=(($c+8)|0);
   var $26=HEAP32[(($arrayidx19)>>2)];
   var $sub20=((($25)-($26))|0);
   HEAP32[(($arrayinit_element15)>>2)]=$sub20;
   var $arrayinit_element21=(($arrayinit_element15+4)|0);
   var $27=$i;
   var $mul22=($27<<2);
   var $add23=((($mul22)+(3))|0);
   var $28=$data_addr;
   var $arrayidx24=(($28+($add23<<2))|0);
   var $29=HEAP32[(($arrayidx24)>>2)];
   var $arrayidx25=(($c+12)|0);
   var $30=HEAP32[(($arrayidx25)>>2)];
   var $sub26=((($29)-($30))|0);
   HEAP32[(($arrayinit_element21)>>2)]=$sub26;
   var $arrayinit_begin27=(($t)|0);
   var $31=$result_addr;
   var $arrayidx28=(($31)|0);
   var $32=HEAP32[(($arrayidx28)>>2)];
   var $arrayidx29=(($y)|0);
   var $33=HEAP32[(($arrayidx29)>>2)];
   var $add30=((($32)+($33))|0);
   HEAP32[(($arrayinit_begin27)>>2)]=$add30;
   var $arrayinit_element31=(($arrayinit_begin27+4)|0);
   var $34=$result_addr;
   var $arrayidx32=(($34+4)|0);
   var $35=HEAP32[(($arrayidx32)>>2)];
   var $arrayidx33=(($y+4)|0);
   var $36=HEAP32[(($arrayidx33)>>2)];
   var $add34=((($35)+($36))|0);
   HEAP32[(($arrayinit_element31)>>2)]=$add34;
   var $arrayinit_element35=(($arrayinit_element31+4)|0);
   var $37=$result_addr;
   var $arrayidx36=(($37+8)|0);
   var $38=HEAP32[(($arrayidx36)>>2)];
   var $arrayidx37=(($y+8)|0);
   var $39=HEAP32[(($arrayidx37)>>2)];
   var $add38=((($38)+($39))|0);
   HEAP32[(($arrayinit_element35)>>2)]=$add38;
   var $arrayinit_element39=(($arrayinit_element35+4)|0);
   var $40=$result_addr;
   var $arrayidx40=(($40+12)|0);
   var $41=HEAP32[(($arrayidx40)>>2)];
   var $arrayidx41=(($y+12)|0);
   var $42=HEAP32[(($arrayidx41)>>2)];
   var $add42=((($41)+($42))|0);
   HEAP32[(($arrayinit_element39)>>2)]=$add42;
   var $arrayidx43=(($t)|0);
   var $43=HEAP32[(($arrayidx43)>>2)];
   var $44=$result_addr;
   var $arrayidx44=(($44)|0);
   var $45=HEAP32[(($arrayidx44)>>2)];
   var $sub45=((($43)-($45))|0);
   var $arrayidx46=(($y)|0);
   var $46=HEAP32[(($arrayidx46)>>2)];
   var $sub47=((($sub45)-($46))|0);
   var $arrayidx48=(($c)|0);
   HEAP32[(($arrayidx48)>>2)]=$sub47;
   var $arrayidx49=(($t+4)|0);
   var $47=HEAP32[(($arrayidx49)>>2)];
   var $48=$result_addr;
   var $arrayidx50=(($48+4)|0);
   var $49=HEAP32[(($arrayidx50)>>2)];
   var $sub51=((($47)-($49))|0);
   var $arrayidx52=(($y+4)|0);
   var $50=HEAP32[(($arrayidx52)>>2)];
   var $sub53=((($sub51)-($50))|0);
   var $arrayidx54=(($c+4)|0);
   HEAP32[(($arrayidx54)>>2)]=$sub53;
   var $arrayidx55=(($t+8)|0);
   var $51=HEAP32[(($arrayidx55)>>2)];
   var $52=$result_addr;
   var $arrayidx56=(($52+8)|0);
   var $53=HEAP32[(($arrayidx56)>>2)];
   var $sub57=((($51)-($53))|0);
   var $arrayidx58=(($y+8)|0);
   var $54=HEAP32[(($arrayidx58)>>2)];
   var $sub59=((($sub57)-($54))|0);
   var $arrayidx60=(($c+8)|0);
   HEAP32[(($arrayidx60)>>2)]=$sub59;
   var $arrayidx61=(($t+12)|0);
   var $55=HEAP32[(($arrayidx61)>>2)];
   var $56=$result_addr;
   var $arrayidx62=(($56+12)|0);
   var $57=HEAP32[(($arrayidx62)>>2)];
   var $sub63=((($55)-($57))|0);
   var $arrayidx64=(($y+12)|0);
   var $58=HEAP32[(($arrayidx64)>>2)];
   var $sub65=((($sub63)-($58))|0);
   var $arrayidx66=(($c+12)|0);
   HEAP32[(($arrayidx66)>>2)]=$sub65;
   var $arrayidx67=(($t)|0);
   var $59=HEAP32[(($arrayidx67)>>2)];
   var $60=$result_addr;
   var $arrayidx68=(($60)|0);
   HEAP32[(($arrayidx68)>>2)]=$59;
   var $arrayidx69=(($t+4)|0);
   var $61=HEAP32[(($arrayidx69)>>2)];
   var $62=$result_addr;
   var $arrayidx70=(($62+4)|0);
   HEAP32[(($arrayidx70)>>2)]=$61;
   var $arrayidx71=(($t+8)|0);
   var $63=HEAP32[(($arrayidx71)>>2)];
   var $64=$result_addr;
   var $arrayidx72=(($64+8)|0);
   HEAP32[(($arrayidx72)>>2)]=$63;
   var $arrayidx73=(($t+12)|0);
   var $65=HEAP32[(($arrayidx73)>>2)];
   var $66=$result_addr;
   var $arrayidx74=(($66+12)|0);
   HEAP32[(($arrayidx74)>>2)]=$65;
   label = 4; break;
  case 4: 
   var $67=$i;
   var $inc=((($67)+(1))|0);
   $i=$inc;
   label = 2; break;
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _create_reduction_pass_counts($count, $max_group_size, $max_groups, $max_work_items, $pass_count, $group_counts, $work_item_counts, $operation_counts, $entry_counts) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $count_addr;
   var $max_group_size_addr;
   var $max_groups_addr;
   var $max_work_items_addr;
   var $pass_count_addr;
   var $group_counts_addr;
   var $work_item_counts_addr;
   var $operation_counts_addr;
   var $entry_counts_addr;
   var $work_items;
   var $groups;
   var $max_levels;
   var $s;
   var $work_items10;
   var $level;
   var $work_items38;
   var $groups46;
   $count_addr=$count;
   $max_group_size_addr=$max_group_size;
   $max_groups_addr=$max_groups;
   $max_work_items_addr=$max_work_items;
   $pass_count_addr=$pass_count;
   $group_counts_addr=$group_counts;
   $work_item_counts_addr=$work_item_counts;
   $operation_counts_addr=$operation_counts;
   $entry_counts_addr=$entry_counts;
   var $0=$count_addr;
   var $1=$max_work_items_addr;
   var $mul=($1<<1);
   var $cmp=($0|0) < ($mul|0);
   if ($cmp) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $2=$count_addr;
   var $div=(((($2|0))/(2))&-1);
   var $cond = $div;label = 4; break;
  case 3: 
   var $3=$max_work_items_addr;
   var $cond = $3;label = 4; break;
  case 4: 
   var $cond;
   $work_items=$cond;
   var $4=$count_addr;
   var $cmp1=($4|0) < 1;
   if ($cmp1) { label = 5; break; } else { label = 6; break; }
  case 5: 
   $work_items=1;
   label = 6; break;
  case 6: 
   var $5=$count_addr;
   var $6=$work_items;
   var $mul2=($6<<1);
   var $div3=(((($5|0))/(($mul2|0)))&-1);
   $groups=$div3;
   var $7=$max_groups_addr;
   var $8=$groups;
   var $cmp4=($7|0) < ($8|0);
   if ($cmp4) { label = 7; break; } else { label = 8; break; }
  case 7: 
   var $9=$max_groups_addr;
   var $cond8 = $9;label = 9; break;
  case 8: 
   var $10=$groups;
   var $cond8 = $10;label = 9; break;
  case 9: 
   var $cond8;
   $groups=$cond8;
   $max_levels=1;
   var $11=$groups;
   $s=$11;
   label = 10; break;
  case 10: 
   var $12=$s;
   var $cmp9=($12|0) > 1;
   if ($cmp9) { label = 11; break; } else { label = 15; break; }
  case 11: 
   var $13=$s;
   var $14=$max_work_items_addr;
   var $mul11=($14<<1);
   var $cmp12=($13|0) < ($mul11|0);
   if ($cmp12) { label = 12; break; } else { label = 13; break; }
  case 12: 
   var $15=$s;
   var $div14=(((($15|0))/(2))&-1);
   var $cond17 = $div14;label = 14; break;
  case 13: 
   var $16=$max_work_items_addr;
   var $cond17 = $16;label = 14; break;
  case 14: 
   var $cond17;
   $work_items10=$cond17;
   var $17=$s;
   var $18=$work_items10;
   var $mul18=($18<<1);
   var $div19=(((($17|0))/(($mul18|0)))&-1);
   $s=$div19;
   var $19=$max_levels;
   var $inc=((($19)+(1))|0);
   $max_levels=$inc;
   label = 10; break;
  case 15: 
   var $20=$max_levels;
   var $mul20=($20<<2);
   var $call=_malloc($mul20);
   var $21=$call;
   var $22=$group_counts_addr;
   HEAP32[(($22)>>2)]=$21;
   var $23=$max_levels;
   var $mul21=($23<<2);
   var $call22=_malloc($mul21);
   var $24=$call22;
   var $25=$work_item_counts_addr;
   HEAP32[(($25)>>2)]=$24;
   var $26=$max_levels;
   var $mul23=($26<<2);
   var $call24=_malloc($mul23);
   var $27=$call24;
   var $28=$operation_counts_addr;
   HEAP32[(($28)>>2)]=$27;
   var $29=$max_levels;
   var $mul25=($29<<2);
   var $call26=_malloc($mul25);
   var $30=$call26;
   var $31=$entry_counts_addr;
   HEAP32[(($31)>>2)]=$30;
   var $32=$max_levels;
   var $33=$pass_count_addr;
   HEAP32[(($33)>>2)]=$32;
   var $34=$groups;
   var $35=$group_counts_addr;
   var $36=HEAP32[(($35)>>2)];
   var $arrayidx=(($36)|0);
   HEAP32[(($arrayidx)>>2)]=$34;
   var $37=$work_items;
   var $38=$work_item_counts_addr;
   var $39=HEAP32[(($38)>>2)];
   var $arrayidx27=(($39)|0);
   HEAP32[(($arrayidx27)>>2)]=$37;
   var $40=$operation_counts_addr;
   var $41=HEAP32[(($40)>>2)];
   var $arrayidx28=(($41)|0);
   HEAP32[(($arrayidx28)>>2)]=1;
   var $42=$count_addr;
   var $43=$entry_counts_addr;
   var $44=HEAP32[(($43)>>2)];
   var $arrayidx29=(($44)|0);
   HEAP32[(($arrayidx29)>>2)]=$42;
   var $45=$max_group_size_addr;
   var $46=$work_items;
   var $cmp30=($45|0) < ($46|0);
   if ($cmp30) { label = 16; break; } else { label = 17; break; }
  case 16: 
   var $47=$work_items;
   var $48=$operation_counts_addr;
   var $49=HEAP32[(($48)>>2)];
   var $arrayidx32=(($49)|0);
   HEAP32[(($arrayidx32)>>2)]=$47;
   var $50=$max_group_size_addr;
   var $51=$work_item_counts_addr;
   var $52=HEAP32[(($51)>>2)];
   var $arrayidx33=(($52)|0);
   HEAP32[(($arrayidx33)>>2)]=$50;
   label = 17; break;
  case 17: 
   var $53=$groups;
   $s=$53;
   $level=1;
   label = 18; break;
  case 18: 
   var $54=$s;
   var $cmp36=($54|0) > 1;
   if ($cmp36) { label = 19; break; } else { label = 28; break; }
  case 19: 
   var $55=$s;
   var $56=$max_work_items_addr;
   var $mul39=($56<<1);
   var $cmp40=($55|0) < ($mul39|0);
   if ($cmp40) { label = 20; break; } else { label = 21; break; }
  case 20: 
   var $57=$s;
   var $div42=(((($57|0))/(2))&-1);
   var $cond45 = $div42;label = 22; break;
  case 21: 
   var $58=$max_work_items_addr;
   var $cond45 = $58;label = 22; break;
  case 22: 
   var $cond45;
   $work_items38=$cond45;
   var $59=$s;
   var $60=$work_items38;
   var $mul47=($60<<1);
   var $div48=(((($59|0))/(($mul47|0)))&-1);
   $groups46=$div48;
   var $61=$max_groups_addr;
   var $62=$groups46;
   var $cmp49=($61|0) < ($62|0);
   if ($cmp49) { label = 23; break; } else { label = 24; break; }
  case 23: 
   var $63=$max_groups_addr;
   var $cond53 = $63;label = 25; break;
  case 24: 
   var $64=$groups46;
   var $cond53 = $64;label = 25; break;
  case 25: 
   var $cond53;
   $groups46=$cond53;
   var $65=$groups46;
   var $66=$level;
   var $67=$group_counts_addr;
   var $68=HEAP32[(($67)>>2)];
   var $arrayidx54=(($68+($66<<2))|0);
   HEAP32[(($arrayidx54)>>2)]=$65;
   var $69=$work_items38;
   var $70=$level;
   var $71=$work_item_counts_addr;
   var $72=HEAP32[(($71)>>2)];
   var $arrayidx55=(($72+($70<<2))|0);
   HEAP32[(($arrayidx55)>>2)]=$69;
   var $73=$level;
   var $74=$operation_counts_addr;
   var $75=HEAP32[(($74)>>2)];
   var $arrayidx56=(($75+($73<<2))|0);
   HEAP32[(($arrayidx56)>>2)]=1;
   var $76=$s;
   var $77=$level;
   var $78=$entry_counts_addr;
   var $79=HEAP32[(($78)>>2)];
   var $arrayidx57=(($79+($77<<2))|0);
   HEAP32[(($arrayidx57)>>2)]=$76;
   var $80=$max_group_size_addr;
   var $81=$work_items38;
   var $cmp58=($80|0) < ($81|0);
   if ($cmp58) { label = 26; break; } else { label = 27; break; }
  case 26: 
   var $82=$work_items38;
   var $83=$level;
   var $84=$operation_counts_addr;
   var $85=HEAP32[(($84)>>2)];
   var $arrayidx60=(($85+($83<<2))|0);
   HEAP32[(($arrayidx60)>>2)]=$82;
   var $86=$max_group_size_addr;
   var $87=$level;
   var $88=$work_item_counts_addr;
   var $89=HEAP32[(($88)>>2)];
   var $arrayidx61=(($89+($87<<2))|0);
   HEAP32[(($arrayidx61)>>2)]=$86;
   label = 27; break;
  case 27: 
   var $90=$s;
   var $91=$work_items38;
   var $mul63=($91<<1);
   var $div64=(((($90|0))/(($mul63|0)))&-1);
   $s=$div64;
   var $92=$level;
   var $inc65=((($92)+(1))|0);
   $level=$inc65;
   label = 18; break;
  case 28: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _main($argc, $argv) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 4336)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $retval;
   var $argc_addr;
   var $argv_addr;
   var $t1=sp;
   var $t2=(sp)+(8);
   var $err=(sp)+(16);
   var $device_id=(sp)+(24);
   var $commands;
   var $context;
   var $output_buffer;
   var $input_buffer;
   var $partials_buffer;
   var $typesize;
   var $pass_count=(sp)+(32);
   var $group_counts=(sp)+(40);
   var $work_item_counts=(sp)+(48);
   var $operation_counts=(sp)+(56);
   var $entry_counts=(sp)+(64);
   var $use_gpu;
   var $i;
   var $c;
   var $float_data;
   var $integer_data;
   var $returned_size=(sp)+(72);
   var $max_workgroup_size=(sp)+(80);
   var $max_workgroup_item_size=(sp)+(88);
   var $vendor_name=(sp)+(104);
   var $device_name=(sp)+(1128);
   var $filename;
   var $source;
   var $buffer_size;
   var $input_data;
   var $programs;
   var $kernels;
   var $block_source=(sp)+(2152);
   var $source_length;
   var $length=(sp)+(2160);
   var $build_log=(sp)+(2168);
   var $pass_swap;
   var $pass_input=(sp)+(4216);
   var $pass_output=(sp)+(4224);
   var $global=(sp)+(4232);
   var $local=(sp)+(4240);
   var $operations;
   var $entries=(sp)+(4248);
   var $shared_size;
   var $k;
   var $global312=(sp)+(4256);
   var $local316=(sp)+(4264);
   var $t;
   var $computed_result;
   var $reference=(sp)+(4272);
   var $result=(sp)+(4288);
   var $v;
   var $error;
   var $diff;
   var $reference423=(sp)+(4304);
   var $result433=(sp)+(4320);
   var $v438;
   var $error445;
   var $diff446;
   $retval=0;
   $argc_addr=$argc;
   $argv_addr=$argv;
   var $call=_webclBeginProfile(((1152)|0));
   var $$etemp$0$0=0;
   var $$etemp$0$1=0;
   var $st$1$0=(($t1)|0);
   HEAP32[(($st$1$0)>>2)]=$$etemp$0$0;
   var $st$2$1=(($t1+4)|0);
   HEAP32[(($st$2$1)>>2)]=$$etemp$0$1;
   var $$etemp$3$0=0;
   var $$etemp$3$1=0;
   var $st$4$0=(($t2)|0);
   HEAP32[(($st$4$0)>>2)]=$$etemp$3$0;
   var $st$5$1=(($t2+4)|0);
   HEAP32[(($st$5$1)>>2)]=$$etemp$3$1;
   HEAP32[(($pass_count)>>2)]=0;
   HEAP32[(($group_counts)>>2)]=0;
   HEAP32[(($work_item_counts)>>2)]=0;
   HEAP32[(($operation_counts)>>2)]=0;
   HEAP32[(($entry_counts)>>2)]=0;
   $use_gpu=1;
   $i=0;
   label = 2; break;
  case 2: 
   var $0=$i;
   var $1=$argc_addr;
   var $cmp=($0|0) < ($1|0);
   if ($cmp) { label = 3; break; } else { var $3 = 0;label = 4; break; }
  case 3: 
   var $2=$argv_addr;
   var $tobool=($2|0)!=0;
   var $3 = $tobool;label = 4; break;
  case 4: 
   var $3;
   if ($3) { label = 5; break; } else { label = 32; break; }
  case 5: 
   var $4=$i;
   var $5=$argv_addr;
   var $arrayidx=(($5+($4<<2))|0);
   var $6=HEAP32[(($arrayidx)>>2)];
   var $tobool1=($6|0)!=0;
   if ($tobool1) { label = 7; break; } else { label = 6; break; }
  case 6: 
   label = 31; break;
  case 7: 
   var $7=$i;
   var $8=$argv_addr;
   var $arrayidx2=(($8+($7<<2))|0);
   var $9=HEAP32[(($arrayidx2)>>2)];
   var $call3=_strstr($9, ((696)|0));
   var $tobool4=($call3|0)!=0;
   if ($tobool4) { label = 8; break; } else { label = 9; break; }
  case 8: 
   $use_gpu=0;
   label = 30; break;
  case 9: 
   var $10=$i;
   var $11=$argv_addr;
   var $arrayidx6=(($11+($10<<2))|0);
   var $12=HEAP32[(($arrayidx6)>>2)];
   var $call7=_strstr($12, ((312)|0));
   var $tobool8=($call7|0)!=0;
   if ($tobool8) { label = 10; break; } else { label = 11; break; }
  case 10: 
   $use_gpu=1;
   label = 29; break;
  case 11: 
   var $13=$i;
   var $14=$argv_addr;
   var $arrayidx11=(($14+($13<<2))|0);
   var $15=HEAP32[(($arrayidx11)>>2)];
   var $call12=_strstr($15, ((112)|0));
   var $tobool13=($call12|0)!=0;
   if ($tobool13) { label = 12; break; } else { label = 13; break; }
  case 12: 
   HEAP8[(64)]=0;
   HEAP32[((80)>>2)]=2;
   label = 28; break;
  case 13: 
   var $16=$i;
   var $17=$argv_addr;
   var $arrayidx16=(($17+($16<<2))|0);
   var $18=HEAP32[(($arrayidx16)>>2)];
   var $call17=_strstr($18, ((104)|0));
   var $tobool18=($call17|0)!=0;
   if ($tobool18) { label = 14; break; } else { label = 15; break; }
  case 14: 
   HEAP8[(64)]=0;
   HEAP32[((80)>>2)]=4;
   label = 27; break;
  case 15: 
   var $19=$i;
   var $20=$argv_addr;
   var $arrayidx21=(($20+($19<<2))|0);
   var $21=HEAP32[(($arrayidx21)>>2)];
   var $call22=_strstr($21, ((96)|0));
   var $tobool23=($call22|0)!=0;
   if ($tobool23) { label = 16; break; } else { label = 17; break; }
  case 16: 
   HEAP8[(64)]=0;
   HEAP32[((80)>>2)]=1;
   label = 26; break;
  case 17: 
   var $22=$i;
   var $23=$argv_addr;
   var $arrayidx26=(($23+($22<<2))|0);
   var $24=HEAP32[(($arrayidx26)>>2)];
   var $call27=_strstr($24, ((88)|0));
   var $tobool28=($call27|0)!=0;
   if ($tobool28) { label = 18; break; } else { label = 19; break; }
  case 18: 
   HEAP8[(64)]=1;
   HEAP32[((80)>>2)]=2;
   label = 25; break;
  case 19: 
   var $25=$i;
   var $26=$argv_addr;
   var $arrayidx31=(($26+($25<<2))|0);
   var $27=HEAP32[(($arrayidx31)>>2)];
   var $call32=_strstr($27, ((1864)|0));
   var $tobool33=($call32|0)!=0;
   if ($tobool33) { label = 20; break; } else { label = 21; break; }
  case 20: 
   HEAP8[(64)]=1;
   HEAP32[((80)>>2)]=4;
   label = 24; break;
  case 21: 
   var $28=$i;
   var $29=$argv_addr;
   var $arrayidx36=(($29+($28<<2))|0);
   var $30=HEAP32[(($arrayidx36)>>2)];
   var $call37=_strstr($30, ((1856)|0));
   var $tobool38=($call37|0)!=0;
   if ($tobool38) { label = 22; break; } else { label = 23; break; }
  case 22: 
   HEAP8[(64)]=1;
   HEAP32[((80)>>2)]=1;
   label = 23; break;
  case 23: 
   label = 24; break;
  case 24: 
   label = 25; break;
  case 25: 
   label = 26; break;
  case 26: 
   label = 27; break;
  case 27: 
   label = 28; break;
  case 28: 
   label = 29; break;
  case 29: 
   label = 30; break;
  case 30: 
   label = 31; break;
  case 31: 
   var $31=$i;
   var $inc=((($31)+(1))|0);
   $i=$inc;
   label = 2; break;
  case 32: 
   var $32=$use_gpu;
   var $cmp48=($32|0)==1;
   var $cond=$cmp48 ? (((1816)|0)) : (((1808)|0));
   var $call49=_printf(((1824)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$cond,tempVarArgs)); STACKTOP=tempVarArgs;
   var $33=HEAP8[(64)];
   var $tobool50=(($33) & 1);
   var $conv=($tobool50&1);
   var $cmp51=($conv|0)==1;
   var $cond53=$cmp51 ? (((1856)|0)) : (((96)|0));
   var $34=HEAP32[((80)>>2)];
   var $call54=_printf(((1768)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$cond53,HEAP32[(((tempVarArgs)+(8))>>2)]=$34,tempVarArgs)); STACKTOP=tempVarArgs;
   var $35=HEAP32[((72)>>2)];
   var $36=HEAP32[((80)>>2)];
   var $mul=(Math.imul($35,$36)|0);
   var $mul55=($mul<<2);
   var $call56=_malloc($mul55);
   var $37=$call56;
   $float_data=$37;
   var $38=HEAP32[((72)>>2)];
   var $39=HEAP32[((80)>>2)];
   var $mul57=(Math.imul($38,$39)|0);
   var $mul58=($mul57<<2);
   var $call59=_malloc($mul58);
   var $40=$call59;
   $integer_data=$40;
   $i=0;
   label = 33; break;
  case 33: 
   var $41=$i;
   var $42=HEAP32[((72)>>2)];
   var $43=HEAP32[((80)>>2)];
   var $mul61=(Math.imul($42,$43)|0);
   var $cmp62=($41|0) < ($mul61|0);
   if ($cmp62) { label = 34; break; } else { label = 36; break; }
  case 34: 
   var $call65=_rand();
   var $conv66=($call65|0);
   var $div=($conv66)/(2147483648);
   var $44=$i;
   var $45=$float_data;
   var $arrayidx67=(($45+($44<<2))|0);
   HEAPF32[(($arrayidx67)>>2)]=$div;
   var $46=$i;
   var $47=$float_data;
   var $arrayidx68=(($47+($46<<2))|0);
   var $48=HEAPF32[(($arrayidx68)>>2)];
   var $mul69=($48)*(255);
   var $conv70=(($mul69)&-1);
   var $49=$i;
   var $50=$integer_data;
   var $arrayidx71=(($50+($49<<2))|0);
   HEAP32[(($arrayidx71)>>2)]=$conv70;
   label = 35; break;
  case 35: 
   var $51=$i;
   var $inc73=((($51)+(1))|0);
   $i=$inc73;
   label = 33; break;
  case 36: 
   var $52=$use_gpu;
   var $tobool75=($52|0)!=0;
   var $cond76=$tobool75 ? 4 : 2;
   var $conv77$0=$cond76;
   var $conv77$1=(($cond76|0) < 0 ? -1 : 0);
   var $call78=_clGetDeviceIDs(0, $conv77$0, $conv77$1, 1, $device_id, 0);
   HEAP32[(($err)>>2)]=$call78;
   var $53=HEAP32[(($err)>>2)];
   var $cmp79=($53|0)!=0;
   if ($cmp79) { label = 37; break; } else { label = 38; break; }
  case 37: 
   var $call82=_printf(((1720)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 38: 
   HEAP32[(($returned_size)>>2)]=0;
   HEAP32[(($max_workgroup_size)>>2)]=0;
   var $54=HEAP32[(($device_id)>>2)];
   var $55=$max_workgroup_size;
   var $call84=_clGetDeviceInfo($54, 4100, 4, $55, $returned_size);
   HEAP32[(($err)>>2)]=$call84;
   var $56=HEAP32[(($err)>>2)];
   var $cmp85=($56|0)!=0;
   if ($cmp85) { label = 39; break; } else { label = 40; break; }
  case 39: 
   var $call88=_printf(((1680)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 40: 
   HEAP32[(($returned_size)>>2)]=0;
   HEAP32[(($err)>>2)]=0;
   var $57=HEAP32[(($device_id)>>2)];
   var $58=$max_workgroup_item_size;
   var $call90=_clGetDeviceInfo($57, 4101, 12, $58, $returned_size);
   HEAP32[(($err)>>2)]=$call90;
   var $59=HEAP32[(($err)>>2)];
   var $cmp91=($59|0)!=0;
   if ($cmp91) { label = 41; break; } else { label = 42; break; }
  case 41: 
   var $call94=_printf(((1680)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 42: 
   var $60=$vendor_name;
   _memset($60, 0, 1024);
   var $61=$device_name;
   _memset($61, 0, 1024);
   var $62=HEAP32[(($device_id)>>2)];
   var $arraydecay=(($vendor_name)|0);
   var $call96=_clGetDeviceInfo($62, 4140, 1024, $arraydecay, $returned_size);
   HEAP32[(($err)>>2)]=$call96;
   var $63=HEAP32[(($device_id)>>2)];
   var $arraydecay97=(($device_name)|0);
   var $call98=_clGetDeviceInfo($63, 4139, 1024, $arraydecay97, $returned_size);
   var $64=HEAP32[(($err)>>2)];
   var $or=$64 | $call98;
   HEAP32[(($err)>>2)]=$or;
   var $65=HEAP32[(($err)>>2)];
   var $cmp99=($65|0)!=0;
   if ($cmp99) { label = 43; break; } else { label = 44; break; }
  case 43: 
   var $call102=_printf(((1680)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 44; break;
  case 44: 
   var $call104=_printf(((1608)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $arraydecay105=(($vendor_name)|0);
   var $arraydecay106=(($device_name)|0);
   var $66=HEAP32[(($max_workgroup_size)>>2)];
   var $arrayidx107=(($max_workgroup_item_size)|0);
   var $67=HEAP32[(($arrayidx107)>>2)];
   var $arrayidx108=(($max_workgroup_item_size+4)|0);
   var $68=HEAP32[(($arrayidx108)>>2)];
   var $arrayidx109=(($max_workgroup_item_size+8)|0);
   var $69=HEAP32[(($arrayidx109)>>2)];
   var $call110=_printf(((1496)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 48)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$arraydecay105,HEAP32[(((tempVarArgs)+(8))>>2)]=$arraydecay106,HEAP32[(((tempVarArgs)+(16))>>2)]=$66,HEAP32[(((tempVarArgs)+(24))>>2)]=$67,HEAP32[(((tempVarArgs)+(32))>>2)]=$68,HEAP32[(((tempVarArgs)+(40))>>2)]=$69,tempVarArgs)); STACKTOP=tempVarArgs;
   var $70=HEAP8[(64)];
   var $tobool111=(($70) & 1);
   var $cond113=$tobool111 ? 4 : 4;
   $typesize=$cond113;
   $filename=0;
   var $71=HEAP32[((80)>>2)];
   if (($71|0)==4) {
    label = 45; break;
   }
   else if (($71|0)==2) {
    label = 46; break;
   }
   else if (($71|0)==1) {
    label = 47; break;
   }
   else {
   label = 48; break;
   }
  case 45: 
   var $72=HEAP8[(64)];
   var $tobool114=(($72) & 1);
   var $cond116=$tobool114 ? (((1472)|0)) : (((1448)|0));
   $filename=$cond116;
   label = 49; break;
  case 46: 
   var $73=HEAP8[(64)];
   var $tobool118=(($73) & 1);
   var $cond120=$tobool118 ? (((1424)|0)) : (((1400)|0));
   $filename=$cond120;
   label = 49; break;
  case 47: 
   var $74=HEAP8[(64)];
   var $tobool122=(($74) & 1);
   var $cond124=$tobool122 ? (((1376)|0)) : (((1352)|0));
   $filename=$cond124;
   label = 49; break;
  case 48: 
   var $call125=_printf(((1312)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 49: 
   var $call126=_printf(((1608)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $75=$filename;
   var $call127=_printf(((1280)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$75,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call128=_printf(((1608)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $76=$filename;
   var $call129=_load_program_source($76);
   $source=$call129;
   var $77=$source;
   var $tobool130=($77|0)!=0;
   if ($tobool130) { label = 51; break; } else { label = 50; break; }
  case 50: 
   var $call132=_printf(((1224)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 51: 
   var $call134=_clCreateContext(0, 1, $device_id, 0, 0, $err);
   $context=$call134;
   var $78=$context;
   var $tobool135=($78|0)!=0;
   if ($tobool135) { label = 53; break; } else { label = 52; break; }
  case 52: 
   var $call137=_printf(((1176)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 53: 
   var $79=$context;
   var $80=HEAP32[(($device_id)>>2)];
   var $$etemp$6$0=0;
   var $$etemp$6$1=0;
   var $call139=_clCreateCommandQueue($79, $80, $$etemp$6$0, $$etemp$6$1, $err);
   $commands=$call139;
   var $81=$commands;
   var $tobool140=($81|0)!=0;
   if ($tobool140) { label = 55; break; } else { label = 54; break; }
  case 54: 
   var $call142=_printf(((1104)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 55: 
   var $82=$typesize;
   var $83=HEAP32[((72)>>2)];
   var $mul144=(Math.imul($82,$83)|0);
   var $84=HEAP32[((80)>>2)];
   var $mul145=(Math.imul($mul144,$84)|0);
   $buffer_size=$mul145;
   var $85=HEAP8[(64)];
   var $tobool146=(($85) & 1);
   var $cond148=$tobool146 ? 4313 : 4318;
   var $call149=_clSetTypePointer($cond148);
   var $86=$context;
   var $87=$buffer_size;
   var $$etemp$7$0=1;
   var $$etemp$7$1=0;
   var $call150=_clCreateBuffer($86, $$etemp$7$0, $$etemp$7$1, $87, 0, 0);
   $input_buffer=$call150;
   var $88=$input_buffer;
   var $tobool151=($88|0)!=0;
   if ($tobool151) { label = 57; break; } else { label = 56; break; }
  case 56: 
   var $call153=_printf(((1048)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 57: 
   var $89=HEAP8[(64)];
   var $tobool155=(($89) & 1);
   if ($tobool155) { label = 58; break; } else { label = 59; break; }
  case 58: 
   var $90=$integer_data;
   var $91=$90;
   var $cond157 = $91;label = 60; break;
  case 59: 
   var $92=$float_data;
   var $93=$92;
   var $cond157 = $93;label = 60; break;
  case 60: 
   var $cond157;
   $input_data=$cond157;
   var $94=HEAP8[(64)];
   var $tobool158=(($94) & 1);
   var $cond160=$tobool158 ? 4313 : 4318;
   var $call161=_clSetTypePointer($cond160);
   var $95=$commands;
   var $96=$input_buffer;
   var $97=$buffer_size;
   var $98=$input_data;
   var $call162=_clEnqueueWriteBuffer($95, $96, 1, 0, $97, $98, 0, 0, 0);
   HEAP32[(($err)>>2)]=$call162;
   var $99=HEAP32[(($err)>>2)];
   var $cmp163=($99|0)!=0;
   if ($cmp163) { label = 61; break; } else { label = 62; break; }
  case 61: 
   var $call166=_printf(((1000)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 62: 
   var $call168=_clSetTypePointer(4313);
   var $100=$context;
   var $101=$buffer_size;
   var $$etemp$8$0=1;
   var $$etemp$8$1=0;
   var $call169=_clCreateBuffer($100, $$etemp$8$0, $$etemp$8$1, $101, 0, 0);
   $partials_buffer=$call169;
   var $102=$partials_buffer;
   var $tobool170=($102|0)!=0;
   if ($tobool170) { label = 64; break; } else { label = 63; break; }
  case 63: 
   var $call172=_printf(((936)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 64: 
   var $call174=_clSetTypePointer(4313);
   var $103=$context;
   var $104=$buffer_size;
   var $$etemp$9$0=1;
   var $$etemp$9$1=0;
   var $call175=_clCreateBuffer($103, $$etemp$9$0, $$etemp$9$1, $104, 0, 0);
   $output_buffer=$call175;
   var $105=$output_buffer;
   var $tobool176=($105|0)!=0;
   if ($tobool176) { label = 66; break; } else { label = 65; break; }
  case 65: 
   var $call178=_printf(((880)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 66: 
   var $106=HEAP32[((72)>>2)];
   var $107=HEAP32[(($max_workgroup_size)>>2)];
   _create_reduction_pass_counts($106, $107, 64, 64, $pass_count, $group_counts, $work_item_counts, $operation_counts, $entry_counts);
   var $108=HEAP32[(($pass_count)>>2)];
   var $mul180=($108<<2);
   var $call181=_malloc($mul180);
   var $109=$call181;
   $programs=$109;
   var $110=$programs;
   var $111=$110;
   var $112=HEAP32[(($pass_count)>>2)];
   var $mul182=($112<<2);
   _memset($111, 0, $mul182);
   var $113=HEAP32[(($pass_count)>>2)];
   var $mul183=($113<<2);
   var $call184=_malloc($mul183);
   var $114=$call184;
   $kernels=$114;
   var $115=$kernels;
   var $116=$115;
   var $117=HEAP32[(($pass_count)>>2)];
   var $mul185=($117<<2);
   _memset($116, 0, $mul185);
   $i=0;
   label = 67; break;
  case 67: 
   var $118=$i;
   var $119=HEAP32[(($pass_count)>>2)];
   var $cmp187=($118|0) < ($119|0);
   if ($cmp187) { label = 68; break; } else { label = 78; break; }
  case 68: 
   var $120=$source;
   var $call190=_strlen($120);
   var $add=((($call190)+(1024))|0);
   var $call191=_malloc($add);
   HEAP32[(($block_source)>>2)]=$call191;
   var $121=$source;
   var $call192=_strlen($121);
   var $add193=((($call192)+(1024))|0);
   $source_length=$add193;
   var $122=HEAP32[(($block_source)>>2)];
   var $123=$source_length;
   _memset($122, 0, $123);
   var $124=HEAP32[(($block_source)>>2)];
   var $125=$i;
   var $126=HEAP32[(($group_counts)>>2)];
   var $arrayidx194=(($126+($125<<2))|0);
   var $127=HEAP32[(($arrayidx194)>>2)];
   var $128=$i;
   var $129=HEAP32[(($operation_counts)>>2)];
   var $arrayidx195=(($129+($128<<2))|0);
   var $130=HEAP32[(($arrayidx195)>>2)];
   var $131=$source;
   var $call196=_sprintf($124, ((856)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=((32)|0),HEAP32[(((tempVarArgs)+(8))>>2)]=$127,HEAP32[(((tempVarArgs)+(16))>>2)]=((8)|0),HEAP32[(((tempVarArgs)+(24))>>2)]=$130,HEAP32[(((tempVarArgs)+(32))>>2)]=$131,tempVarArgs)); STACKTOP=tempVarArgs;
   var $132=$context;
   var $call197=_clCreateProgramWithSource($132, 1, $block_source, 0, $err);
   var $133=$i;
   var $134=$programs;
   var $arrayidx198=(($134+($133<<2))|0);
   HEAP32[(($arrayidx198)>>2)]=$call197;
   var $135=$i;
   var $136=$programs;
   var $arrayidx199=(($136+($135<<2))|0);
   var $137=HEAP32[(($arrayidx199)>>2)];
   var $tobool200=($137|0)!=0;
   if ($tobool200) { label = 69; break; } else { label = 70; break; }
  case 69: 
   var $138=HEAP32[(($err)>>2)];
   var $cmp201=($138|0)!=0;
   if ($cmp201) { label = 70; break; } else { label = 71; break; }
  case 70: 
   var $139=HEAP32[(($block_source)>>2)];
   var $call204=_printf(((1872)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$139,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call205=_printf(((808)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 71: 
   var $140=$i;
   var $141=$programs;
   var $arrayidx207=(($141+($140<<2))|0);
   var $142=HEAP32[(($arrayidx207)>>2)];
   var $call208=_clBuildProgram($142, 0, 0, 0, 0, 0);
   HEAP32[(($err)>>2)]=$call208;
   var $143=HEAP32[(($err)>>2)];
   var $cmp209=($143|0)!=0;
   if ($cmp209) { label = 72; break; } else { label = 73; break; }
  case 72: 
   var $144=HEAP32[(($block_source)>>2)];
   var $call212=_printf(((1872)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$144,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call213=_printf(((760)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $145=$i;
   var $146=$programs;
   var $arrayidx214=(($146+($145<<2))|0);
   var $147=HEAP32[(($arrayidx214)>>2)];
   var $148=HEAP32[(($device_id)>>2)];
   var $arraydecay215=(($build_log)|0);
   var $call216=_clGetProgramBuildInfo($147, $148, 4483, 2048, $arraydecay215, $length);
   var $arraydecay217=(($build_log)|0);
   var $call218=_printf(((1872)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$arraydecay217,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 73: 
   var $149=$i;
   var $150=$programs;
   var $arrayidx220=(($150+($149<<2))|0);
   var $151=HEAP32[(($arrayidx220)>>2)];
   var $call221=_clCreateKernel($151, ((752)|0), $err);
   var $152=$i;
   var $153=$kernels;
   var $arrayidx222=(($153+($152<<2))|0);
   HEAP32[(($arrayidx222)>>2)]=$call221;
   var $154=$i;
   var $155=$kernels;
   var $arrayidx223=(($155+($154<<2))|0);
   var $156=HEAP32[(($arrayidx223)>>2)];
   var $tobool224=($156|0)!=0;
   if ($tobool224) { label = 74; break; } else { label = 75; break; }
  case 74: 
   var $157=HEAP32[(($err)>>2)];
   var $cmp226=($157|0)!=0;
   if ($cmp226) { label = 75; break; } else { label = 76; break; }
  case 75: 
   var $call229=_printf(((704)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 76: 
   var $158=HEAP32[(($block_source)>>2)];
   _free($158);
   label = 77; break;
  case 77: 
   var $159=$i;
   var $inc232=((($159)+(1))|0);
   $i=$inc232;
   label = 67; break;
  case 78: 
   var $160=$output_buffer;
   HEAP32[(($pass_input)>>2)]=$160;
   var $161=$input_buffer;
   HEAP32[(($pass_output)>>2)]=$161;
   $i=0;
   label = 79; break;
  case 79: 
   var $162=$i;
   var $163=HEAP32[(($pass_count)>>2)];
   var $cmp235=($162|0) < ($163|0);
   if ($cmp235) { label = 80; break; } else { label = 88; break; }
  case 80: 
   var $164=$i;
   var $165=HEAP32[(($group_counts)>>2)];
   var $arrayidx238=(($165+($164<<2))|0);
   var $166=HEAP32[(($arrayidx238)>>2)];
   var $167=$i;
   var $168=HEAP32[(($work_item_counts)>>2)];
   var $arrayidx239=(($168+($167<<2))|0);
   var $169=HEAP32[(($arrayidx239)>>2)];
   var $mul240=(Math.imul($166,$169)|0);
   HEAP32[(($global)>>2)]=$mul240;
   var $170=$i;
   var $171=HEAP32[(($work_item_counts)>>2)];
   var $arrayidx241=(($171+($170<<2))|0);
   var $172=HEAP32[(($arrayidx241)>>2)];
   HEAP32[(($local)>>2)]=$172;
   var $173=$i;
   var $174=HEAP32[(($operation_counts)>>2)];
   var $arrayidx242=(($174+($173<<2))|0);
   var $175=HEAP32[(($arrayidx242)>>2)];
   $operations=$175;
   var $176=$i;
   var $177=HEAP32[(($entry_counts)>>2)];
   var $arrayidx243=(($177+($176<<2))|0);
   var $178=HEAP32[(($arrayidx243)>>2)];
   HEAP32[(($entries)>>2)]=$178;
   var $179=$typesize;
   var $180=HEAP32[((80)>>2)];
   var $mul244=(Math.imul($179,$180)|0);
   var $181=HEAP32[(($local)>>2)];
   var $mul245=(Math.imul($mul244,$181)|0);
   var $182=$operations;
   var $mul246=(Math.imul($mul245,$182)|0);
   $shared_size=$mul246;
   var $183=$i;
   var $184=HEAP32[(($global)>>2)];
   var $185=HEAP32[(($local)>>2)];
   var $186=$i;
   var $187=HEAP32[(($group_counts)>>2)];
   var $arrayidx247=(($187+($186<<2))|0);
   var $188=HEAP32[(($arrayidx247)>>2)];
   var $189=$i;
   var $190=HEAP32[(($work_item_counts)>>2)];
   var $arrayidx248=(($190+($189<<2))|0);
   var $191=HEAP32[(($arrayidx248)>>2)];
   var $192=$operations;
   var $193=HEAP32[(($entries)>>2)];
   var $call249=_printf(((608)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 56)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$183,HEAP32[(((tempVarArgs)+(8))>>2)]=$184,HEAP32[(((tempVarArgs)+(16))>>2)]=$185,HEAP32[(((tempVarArgs)+(24))>>2)]=$188,HEAP32[(((tempVarArgs)+(32))>>2)]=$191,HEAP32[(((tempVarArgs)+(40))>>2)]=$192,HEAP32[(((tempVarArgs)+(48))>>2)]=$193,tempVarArgs)); STACKTOP=tempVarArgs;
   var $194=HEAP32[(($pass_input)>>2)];
   $pass_swap=$194;
   var $195=HEAP32[(($pass_output)>>2)];
   HEAP32[(($pass_input)>>2)]=$195;
   var $196=$pass_swap;
   HEAP32[(($pass_output)>>2)]=$196;
   HEAP32[(($err)>>2)]=0;
   var $197=$i;
   var $198=$kernels;
   var $arrayidx250=(($198+($197<<2))|0);
   var $199=HEAP32[(($arrayidx250)>>2)];
   var $200=$pass_output;
   var $call251=_clSetKernelArg($199, 0, 4, $200);
   var $201=HEAP32[(($err)>>2)];
   var $or252=$201 | $call251;
   HEAP32[(($err)>>2)]=$or252;
   var $202=$i;
   var $203=$kernels;
   var $arrayidx253=(($203+($202<<2))|0);
   var $204=HEAP32[(($arrayidx253)>>2)];
   var $205=$pass_input;
   var $call254=_clSetKernelArg($204, 1, 4, $205);
   var $206=HEAP32[(($err)>>2)];
   var $or255=$206 | $call254;
   HEAP32[(($err)>>2)]=$or255;
   var $207=$i;
   var $208=$kernels;
   var $arrayidx256=(($208+($207<<2))|0);
   var $209=HEAP32[(($arrayidx256)>>2)];
   var $210=$shared_size;
   var $call257=_clSetKernelArg($209, 2, $210, 0);
   var $211=HEAP32[(($err)>>2)];
   var $or258=$211 | $call257;
   HEAP32[(($err)>>2)]=$or258;
   var $212=$i;
   var $213=$kernels;
   var $arrayidx259=(($213+($212<<2))|0);
   var $214=HEAP32[(($arrayidx259)>>2)];
   var $215=$entries;
   var $call260=_clSetKernelArg($214, 3, 4, $215);
   var $216=HEAP32[(($err)>>2)];
   var $or261=$216 | $call260;
   HEAP32[(($err)>>2)]=$or261;
   var $217=HEAP32[(($err)>>2)];
   var $cmp262=($217|0)!=0;
   if ($cmp262) { label = 81; break; } else { label = 82; break; }
  case 81: 
   var $call265=_printf(((568)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 82: 
   var $218=HEAP32[(($pass_input)>>2)];
   var $219=$input_buffer;
   var $cmp267=($218|0)==($219|0);
   if ($cmp267) { label = 83; break; } else { label = 84; break; }
  case 83: 
   var $220=$partials_buffer;
   HEAP32[(($pass_input)>>2)]=$220;
   label = 84; break;
  case 84: 
   HEAP32[(($err)>>2)]=0;
   var $221=$commands;
   var $222=$i;
   var $223=$kernels;
   var $arrayidx271=(($223+($222<<2))|0);
   var $224=HEAP32[(($arrayidx271)>>2)];
   var $call272=_clEnqueueNDRangeKernel($221, $224, 1, 0, $global, $local, 0, 0, 0);
   var $225=HEAP32[(($err)>>2)];
   var $or273=$225 | $call272;
   HEAP32[(($err)>>2)]=$or273;
   var $226=HEAP32[(($err)>>2)];
   var $cmp274=($226|0)!=0;
   if ($cmp274) { label = 85; break; } else { label = 86; break; }
  case 85: 
   var $call277=_printf(((528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 86: 
   label = 87; break;
  case 87: 
   var $227=$i;
   var $inc280=((($227)+(1))|0);
   $i=$inc280;
   label = 79; break;
  case 88: 
   var $228=$commands;
   var $call282=_clFinish($228);
   HEAP32[(($err)>>2)]=$call282;
   var $229=HEAP32[(($err)>>2)];
   var $cmp283=($229|0)!=0;
   if ($cmp283) { label = 89; break; } else { label = 90; break; }
  case 89: 
   var $230=HEAP32[(($err)>>2)];
   var $call286=_printf(((472)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$230,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 90: 
   var $call288=_printf(((1608)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $231=HEAP32[((56)>>2)];
   var $232=HEAP32[((72)>>2)];
   var $233=HEAP8[(64)];
   var $tobool289=(($233) & 1);
   var $cond291=$tobool289 ? (((1856)|0)) : (((96)|0));
   var $234=HEAP32[((80)>>2)];
   var $cmp292=($234|0) <= 1;
   if ($cmp292) { label = 91; break; } else { label = 92; break; }
  case 91: 
   var $cond300 = ((392)|0);label = 93; break;
  case 92: 
   var $235=HEAP32[((80)>>2)];
   var $cmp296=($235|0)==2;
   var $cond298=$cmp296 ? (((384)|0)) : (((376)|0));
   var $cond300 = $cond298;label = 93; break;
  case 93: 
   var $cond300;
   var $call301=_printf(((400)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$231,HEAP32[(((tempVarArgs)+(8))>>2)]=$232,HEAP32[(((tempVarArgs)+(16))>>2)]=$cond291,HEAP32[(((tempVarArgs)+(24))>>2)]=$cond300,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call302=_printf(((1608)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[(($err)>>2)]=0;
   var $call303$0=_current_time();
   var $call303$1=tempRet0;
   var $st$10$0=(($t1)|0);
   HEAP32[(($st$10$0)>>2)]=$call303$0;
   var $st$11$1=(($t1+4)|0);
   HEAP32[(($st$11$1)>>2)]=$call303$1;
   $k=0;
   label = 94; break;
  case 94: 
   var $236=$k;
   var $237=HEAP32[((56)>>2)];
   var $cmp305=($236|0) < ($237|0);
   if ($cmp305) { label = 95; break; } else { label = 103; break; }
  case 95: 
   $i=0;
   label = 96; break;
  case 96: 
   var $238=$i;
   var $239=HEAP32[(($pass_count)>>2)];
   var $cmp309=($238|0) < ($239|0);
   if ($cmp309) { label = 97; break; } else { label = 101; break; }
  case 97: 
   var $240=$i;
   var $241=HEAP32[(($group_counts)>>2)];
   var $arrayidx313=(($241+($240<<2))|0);
   var $242=HEAP32[(($arrayidx313)>>2)];
   var $243=$i;
   var $244=HEAP32[(($work_item_counts)>>2)];
   var $arrayidx314=(($244+($243<<2))|0);
   var $245=HEAP32[(($arrayidx314)>>2)];
   var $mul315=(Math.imul($242,$245)|0);
   HEAP32[(($global312)>>2)]=$mul315;
   var $246=$i;
   var $247=HEAP32[(($work_item_counts)>>2)];
   var $arrayidx317=(($247+($246<<2))|0);
   var $248=HEAP32[(($arrayidx317)>>2)];
   HEAP32[(($local316)>>2)]=$248;
   var $249=$commands;
   var $250=$i;
   var $251=$kernels;
   var $arrayidx318=(($251+($250<<2))|0);
   var $252=HEAP32[(($arrayidx318)>>2)];
   var $call319=_clEnqueueNDRangeKernel($249, $252, 1, 0, $global312, $local316, 0, 0, 0);
   HEAP32[(($err)>>2)]=$call319;
   var $253=HEAP32[(($err)>>2)];
   var $cmp320=($253|0)!=0;
   if ($cmp320) { label = 98; break; } else { label = 99; break; }
  case 98: 
   var $call323=_printf(((528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 99: 
   label = 100; break;
  case 100: 
   var $254=$i;
   var $inc326=((($254)+(1))|0);
   $i=$inc326;
   label = 96; break;
  case 101: 
   label = 102; break;
  case 102: 
   var $255=$k;
   var $inc329=((($255)+(1))|0);
   $k=$inc329;
   label = 94; break;
  case 103: 
   var $256=$commands;
   var $call331=_clFinish($256);
   HEAP32[(($err)>>2)]=$call331;
   var $257=HEAP32[(($err)>>2)];
   var $cmp332=($257|0)!=0;
   if ($cmp332) { label = 104; break; } else { label = 105; break; }
  case 104: 
   var $258=HEAP32[(($err)>>2)];
   var $call335=_printf(((472)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$258,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 105: 
   var $call337$0=_current_time();
   var $call337$1=tempRet0;
   var $st$12$0=(($t2)|0);
   HEAP32[(($st$12$0)>>2)]=$call337$0;
   var $st$13$1=(($t2+4)|0);
   HEAP32[(($st$13$1)>>2)]=$call337$1;
   var $ld$14$0=(($t2)|0);
   var $259$0=HEAP32[(($ld$14$0)>>2)];
   var $ld$15$1=(($t2+4)|0);
   var $259$1=HEAP32[(($ld$15$1)>>2)];
   var $ld$16$0=(($t1)|0);
   var $260$0=HEAP32[(($ld$16$0)>>2)];
   var $ld$17$1=(($t1+4)|0);
   var $260$1=HEAP32[(($ld$17$1)>>2)];
   var $call338=_subtract_time_in_seconds($259$0, $259$1, $260$0, $260$1);
   $t=$call338;
   var $261=$t;
   var $mul339=($261)*(1000);
   var $262=HEAP32[((56)>>2)];
   var $conv340=($262|0);
   var $div341=($mul339)/($conv340);
   var $call342=_printf(((352)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempVarArgs)>>3)]=$div341,tempVarArgs)); STACKTOP=tempVarArgs;
   var $263=$buffer_size;
   var $conv343=($263>>>0);
   var $mul344=((1e-9))*($conv343);
   var $264=HEAP32[((56)>>2)];
   var $conv345=($264|0);
   var $mul346=($mul344)*($conv345);
   var $265=$t;
   var $div347=($mul346)/($265);
   var $call348=_printf(((320)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempVarArgs)>>3)]=$div347,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call349=_printf(((1608)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $266=$typesize;
   var $267=HEAP32[((80)>>2)];
   var $mul350=(Math.imul($266,$267)|0);
   var $call351=_malloc($mul350);
   $computed_result=$call351;
   var $268=$computed_result;
   var $269=$typesize;
   var $270=HEAP32[((80)>>2)];
   var $mul352=(Math.imul($269,$270)|0);
   _memset($268, 0, $mul352);
   var $271=HEAP8[(64)];
   var $tobool353=(($271) & 1);
   var $cond355=$tobool353 ? 4313 : 4318;
   var $call356=_clSetTypePointer($cond355);
   var $272=$commands;
   var $273=HEAP32[(($pass_output)>>2)];
   var $274=$typesize;
   var $275=HEAP32[((80)>>2)];
   var $mul357=(Math.imul($274,$275)|0);
   var $276=$computed_result;
   var $call358=_clEnqueueReadBuffer($272, $273, 1, 0, $mul357, $276, 0, 0, 0);
   HEAP32[(($err)>>2)]=$call358;
   var $277=HEAP32[(($err)>>2)];
   var $tobool359=($277|0)!=0;
   if ($tobool359) { label = 106; break; } else { label = 107; break; }
  case 106: 
   var $call361=_printf(((256)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 107: 
   var $278=HEAP8[(64)];
   var $tobool363=(($278) & 1);
   if ($tobool363) { label = 108; break; } else { label = 132; break; }
  case 108: 
   var $279=$reference;
   HEAP32[(($279)>>2)]=0; HEAP32[((($279)+(4))>>2)]=0; HEAP32[((($279)+(8))>>2)]=0; HEAP32[((($279)+(12))>>2)]=0;
   var $280=HEAP32[((80)>>2)];
   if (($280|0)==4) {
    label = 109; break;
   }
   else if (($280|0)==2) {
    label = 110; break;
   }
   else if (($280|0)==1) {
    label = 111; break;
   }
   else {
   label = 112; break;
   }
  case 109: 
   var $281=$integer_data;
   var $282=HEAP32[((72)>>2)];
   var $arraydecay366=(($reference)|0);
   _reduce_validate_int4($281, $282, $arraydecay366);
   label = 113; break;
  case 110: 
   var $283=$integer_data;
   var $284=HEAP32[((72)>>2)];
   var $arraydecay368=(($reference)|0);
   _reduce_validate_int2($283, $284, $arraydecay368);
   label = 113; break;
  case 111: 
   var $285=$integer_data;
   var $286=HEAP32[((72)>>2)];
   var $arraydecay370=(($reference)|0);
   _reduce_validate_int($285, $286, $arraydecay370);
   label = 113; break;
  case 112: 
   var $call372=_printf(((1312)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 113: 
   var $287=$result;
   HEAP32[(($287)>>2)]=0; HEAP32[((($287)+(4))>>2)]=0; HEAP32[((($287)+(8))>>2)]=0; HEAP32[((($287)+(12))>>2)]=0;
   $c=0;
   label = 114; break;
  case 114: 
   var $288=$c;
   var $289=HEAP32[((80)>>2)];
   var $cmp375=($288|0) < ($289|0);
   if ($cmp375) { label = 115; break; } else { label = 117; break; }
  case 115: 
   var $290=$c;
   var $291=$computed_result;
   var $292=$291;
   var $arrayidx378=(($292+($290<<2))|0);
   var $293=HEAP32[(($arrayidx378)>>2)];
   $v=$293;
   var $294=$v;
   var $295=$c;
   var $arrayidx379=(($result+($295<<2))|0);
   var $296=HEAP32[(($arrayidx379)>>2)];
   var $add380=((($296)+($294))|0);
   HEAP32[(($arrayidx379)>>2)]=$add380;
   label = 116; break;
  case 116: 
   var $297=$c;
   var $inc382=((($297)+(1))|0);
   $c=$inc382;
   label = 114; break;
  case 117: 
   $error=0;
   $diff=0;
   $c=0;
   label = 118; break;
  case 118: 
   var $298=$c;
   var $299=HEAP32[((80)>>2)];
   var $cmp385=($298|0) < ($299|0);
   if ($cmp385) { label = 119; break; } else { label = 124; break; }
  case 119: 
   var $300=$c;
   var $arrayidx388=(($reference+($300<<2))|0);
   var $301=HEAP32[(($arrayidx388)>>2)];
   var $302=$c;
   var $arrayidx389=(($result+($302<<2))|0);
   var $303=HEAP32[(($arrayidx389)>>2)];
   var $sub=((($301)-($303))|0);
   var $conv390=($sub|0);
   var $call391=Math.abs($conv390);
   var $conv392=$call391;
   $diff=$conv392;
   var $304=$diff;
   var $305=$error;
   var $cmp393=$304 > $305;
   if ($cmp393) { label = 120; break; } else { label = 121; break; }
  case 120: 
   var $306=$diff;
   var $cond398 = $306;label = 122; break;
  case 121: 
   var $307=$error;
   var $cond398 = $307;label = 122; break;
  case 122: 
   var $cond398;
   $error=$cond398;
   label = 123; break;
  case 123: 
   var $308=$c;
   var $inc400=((($308)+(1))|0);
   $c=$inc400;
   label = 118; break;
  case 124: 
   var $309=$error;
   var $conv402=$309;
   var $cmp403=$conv402 > (1e-7);
   if ($cmp403) { label = 125; break; } else { label = 130; break; }
  case 125: 
   $c=0;
   label = 126; break;
  case 126: 
   var $310=$c;
   var $311=HEAP32[((80)>>2)];
   var $cmp407=($310|0) < ($311|0);
   if ($cmp407) { label = 127; break; } else { label = 129; break; }
  case 127: 
   var $312=$c;
   var $313=$c;
   var $arrayidx410=(($reference+($313<<2))|0);
   var $314=HEAP32[(($arrayidx410)>>2)];
   var $315=$c;
   var $arrayidx411=(($result+($315<<2))|0);
   var $316=HEAP32[(($arrayidx411)>>2)];
   var $call412=_printf(((232)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$312,HEAP32[(((tempVarArgs)+(8))>>2)]=$314,HEAP32[(((tempVarArgs)+(16))>>2)]=$316,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 128; break;
  case 128: 
   var $317=$c;
   var $inc414=((($317)+(1))|0);
   $c=$inc414;
   label = 126; break;
  case 129: 
   var $318=$error;
   var $conv416=$318;
   var $call417=_printf(((176)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempVarArgs)>>3)]=$conv416,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 130: 
   var $call419=_printf(((152)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call420=_printf(((1608)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 131; break;
  case 131: 
   label = 156; break;
  case 132: 
   var $319=$reference423;
   HEAP32[(($319)>>2)]=0; HEAP32[((($319)+(4))>>2)]=0; HEAP32[((($319)+(8))>>2)]=0; HEAP32[((($319)+(12))>>2)]=0;
   var $320=HEAP32[((80)>>2)];
   if (($320|0)==4) {
    label = 133; break;
   }
   else if (($320|0)==2) {
    label = 134; break;
   }
   else if (($320|0)==1) {
    label = 135; break;
   }
   else {
   label = 136; break;
   }
  case 133: 
   var $321=$float_data;
   var $322=HEAP32[((72)>>2)];
   var $arraydecay425=(($reference423)|0);
   _reduce_validate_float4($321, $322, $arraydecay425);
   label = 137; break;
  case 134: 
   var $323=$float_data;
   var $324=HEAP32[((72)>>2)];
   var $arraydecay427=(($reference423)|0);
   _reduce_validate_float2($323, $324, $arraydecay427);
   label = 137; break;
  case 135: 
   var $325=$float_data;
   var $326=HEAP32[((72)>>2)];
   var $arraydecay429=(($reference423)|0);
   _reduce_validate_float($325, $326, $arraydecay429);
   label = 137; break;
  case 136: 
   var $call431=_printf(((1312)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 137: 
   var $327=$result433;
   HEAP32[(($327)>>2)]=0; HEAP32[((($327)+(4))>>2)]=0; HEAP32[((($327)+(8))>>2)]=0; HEAP32[((($327)+(12))>>2)]=0;
   $c=0;
   label = 138; break;
  case 138: 
   var $328=$c;
   var $329=HEAP32[((80)>>2)];
   var $cmp435=($328|0) < ($329|0);
   if ($cmp435) { label = 139; break; } else { label = 141; break; }
  case 139: 
   var $330=$c;
   var $331=$computed_result;
   var $332=$331;
   var $arrayidx439=(($332+($330<<2))|0);
   var $333=HEAPF32[(($arrayidx439)>>2)];
   $v438=$333;
   var $334=$v438;
   var $335=$c;
   var $arrayidx440=(($result433+($335<<2))|0);
   var $336=HEAPF32[(($arrayidx440)>>2)];
   var $add441=($336)+($334);
   HEAPF32[(($arrayidx440)>>2)]=$add441;
   label = 140; break;
  case 140: 
   var $337=$c;
   var $inc443=((($337)+(1))|0);
   $c=$inc443;
   label = 138; break;
  case 141: 
   $error445=0;
   $diff446=0;
   $c=0;
   label = 142; break;
  case 142: 
   var $338=$c;
   var $339=HEAP32[((80)>>2)];
   var $cmp448=($338|0) < ($339|0);
   if ($cmp448) { label = 143; break; } else { label = 148; break; }
  case 143: 
   var $340=$c;
   var $arrayidx451=(($reference423+($340<<2))|0);
   var $341=HEAPF32[(($arrayidx451)>>2)];
   var $342=$c;
   var $arrayidx452=(($result433+($342<<2))|0);
   var $343=HEAPF32[(($arrayidx452)>>2)];
   var $sub453=($341)-($343);
   var $conv454=$sub453;
   var $call455=Math.abs($conv454);
   var $conv456=$call455;
   $diff446=$conv456;
   var $344=$diff446;
   var $345=$error445;
   var $cmp457=$344 > $345;
   if ($cmp457) { label = 144; break; } else { label = 145; break; }
  case 144: 
   var $346=$diff446;
   var $cond462 = $346;label = 146; break;
  case 145: 
   var $347=$error445;
   var $cond462 = $347;label = 146; break;
  case 146: 
   var $cond462;
   $error445=$cond462;
   label = 147; break;
  case 147: 
   var $348=$c;
   var $inc464=((($348)+(1))|0);
   $c=$inc464;
   label = 142; break;
  case 148: 
   var $349=$error445;
   var $conv466=$349;
   var $cmp467=$conv466 > (1e-7);
   if ($cmp467) { label = 149; break; } else { label = 154; break; }
  case 149: 
   $c=0;
   label = 150; break;
  case 150: 
   var $350=$c;
   var $351=HEAP32[((80)>>2)];
   var $cmp471=($350|0) < ($351|0);
   if ($cmp471) { label = 151; break; } else { label = 153; break; }
  case 151: 
   var $352=$c;
   var $353=$c;
   var $arrayidx474=(($reference423+($353<<2))|0);
   var $354=HEAPF32[(($arrayidx474)>>2)];
   var $conv475=$354;
   var $355=$c;
   var $arrayidx476=(($result433+($355<<2))|0);
   var $356=HEAPF32[(($arrayidx476)>>2)];
   var $conv477=$356;
   var $call478=_printf(((128)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 24)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$352,HEAPF64[(((tempVarArgs)+(8))>>3)]=$conv475,HEAPF64[(((tempVarArgs)+(16))>>3)]=$conv477,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 152; break;
  case 152: 
   var $357=$c;
   var $inc480=((($357)+(1))|0);
   $c=$inc480;
   label = 150; break;
  case 153: 
   var $358=$error445;
   var $conv482=$358;
   var $call483=_printf(((176)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempVarArgs)>>3)]=$conv482,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=1;
   label = 161; break;
  case 154: 
   var $call485=_printf(((152)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call486=_printf(((1608)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 155; break;
  case 155: 
   label = 156; break;
  case 156: 
   $i=0;
   label = 157; break;
  case 157: 
   var $359=$i;
   var $360=HEAP32[(($pass_count)>>2)];
   var $cmp490=($359|0) < ($360|0);
   if ($cmp490) { label = 158; break; } else { label = 160; break; }
  case 158: 
   var $361=$i;
   var $362=$kernels;
   var $arrayidx493=(($362+($361<<2))|0);
   var $363=HEAP32[(($arrayidx493)>>2)];
   var $call494=_clReleaseKernel($363);
   var $364=$i;
   var $365=$programs;
   var $arrayidx495=(($365+($364<<2))|0);
   var $366=HEAP32[(($arrayidx495)>>2)];
   var $call496=_clReleaseProgram($366);
   label = 159; break;
  case 159: 
   var $367=$i;
   var $inc498=((($367)+(1))|0);
   $i=$inc498;
   label = 157; break;
  case 160: 
   var $368=$input_buffer;
   var $call500=_clReleaseMemObject($368);
   var $369=$output_buffer;
   var $call501=_clReleaseMemObject($369);
   var $370=$partials_buffer;
   var $call502=_clReleaseMemObject($370);
   var $371=$commands;
   var $call503=_clReleaseCommandQueue($371);
   var $372=$context;
   var $call504=_clReleaseContext($372);
   var $373=HEAP32[(($group_counts)>>2)];
   var $374=$373;
   _free($374);
   var $375=HEAP32[(($work_item_counts)>>2)];
   var $376=$375;
   _free($376);
   var $377=HEAP32[(($operation_counts)>>2)];
   var $378=$377;
   _free($378);
   var $379=HEAP32[(($entry_counts)>>2)];
   var $380=$379;
   _free($380);
   var $381=$computed_result;
   _free($381);
   var $382=$kernels;
   var $383=$382;
   _free($383);
   var $384=$float_data;
   var $385=$384;
   _free($385);
   var $386=$integer_data;
   var $387=$386;
   _free($387);
   $retval=0;
   label = 161; break;
  case 161: 
   var $388=$retval;
   STACKTOP = sp;
   return $388;
  default: assert(0, "bad label: " + label);
 }
}
Module["_main"] = _main;
function _load_program_source($filename) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 80)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $retval;
   var $filename_addr;
   var $statbuf=sp;
   var $fh;
   var $source;
   $filename_addr=$filename;
   var $0=$filename_addr;
   var $call=_fopen($0, ((120)|0));
   $fh=$call;
   var $1=$fh;
   var $cmp=($1|0)==0;
   if ($cmp) { label = 2; break; } else { label = 3; break; }
  case 2: 
   $retval=0;
   label = 4; break;
  case 3: 
   var $2=$filename_addr;
   var $call1=_stat($2, $statbuf);
   var $st_size=(($statbuf+36)|0);
   var $3=HEAP32[(($st_size)>>2)];
   var $add=((($3)+(1))|0);
   var $call2=_malloc($add);
   $source=$call2;
   var $4=$source;
   var $st_size3=(($statbuf+36)|0);
   var $5=HEAP32[(($st_size3)>>2)];
   var $6=$fh;
   var $call4=_fread($4, $5, 1, $6);
   var $st_size5=(($statbuf+36)|0);
   var $7=HEAP32[(($st_size5)>>2)];
   var $8=$source;
   var $arrayidx=(($8+$7)|0);
   HEAP8[($arrayidx)]=0;
   var $9=$source;
   $retval=$9;
   label = 4; break;
  case 4: 
   var $10=$retval;
   STACKTOP = sp;
   return $10;
  default: assert(0, "bad label: " + label);
 }
}
function _malloc($bytes) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $cmp=($bytes>>>0) < 245;
   if ($cmp) { label = 2; break; } else { label = 78; break; }
  case 2: 
   var $cmp1=($bytes>>>0) < 11;
   if ($cmp1) { var $cond = 16;label = 4; break; } else { label = 3; break; }
  case 3: 
   var $add2=((($bytes)+(11))|0);
   var $and=$add2 & -8;
   var $cond = $and;label = 4; break;
  case 4: 
   var $cond;
   var $shr=$cond >>> 3;
   var $0=HEAP32[((((1904)|0))>>2)];
   var $shr3=$0 >>> ($shr>>>0);
   var $and4=$shr3 & 3;
   var $cmp5=($and4|0)==0;
   if ($cmp5) { label = 12; break; } else { label = 5; break; }
  case 5: 
   var $neg=$shr3 & 1;
   var $and7=$neg ^ 1;
   var $add8=((($and7)+($shr))|0);
   var $shl=$add8 << 1;
   var $arrayidx=((1944+($shl<<2))|0);
   var $1=$arrayidx;
   var $arrayidx_sum=((($shl)+(2))|0);
   var $2=((1944+($arrayidx_sum<<2))|0);
   var $3=HEAP32[(($2)>>2)];
   var $fd9=(($3+8)|0);
   var $4=HEAP32[(($fd9)>>2)];
   var $cmp10=($1|0)==($4|0);
   if ($cmp10) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $shl12=1 << $add8;
   var $neg13=$shl12 ^ -1;
   var $and14=$0 & $neg13;
   HEAP32[((((1904)|0))>>2)]=$and14;
   label = 11; break;
  case 7: 
   var $5=$4;
   var $6=HEAP32[((((1920)|0))>>2)];
   var $cmp15=($5>>>0) < ($6>>>0);
   if ($cmp15) { label = 10; break; } else { label = 8; break; }
  case 8: 
   var $bk=(($4+12)|0);
   var $7=HEAP32[(($bk)>>2)];
   var $cmp16=($7|0)==($3|0);
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
   var $12=HEAP32[((((1912)|0))>>2)];
   var $cmp29=($cond>>>0) > ($12>>>0);
   if ($cmp29) { label = 13; break; } else { var $nb_0 = $cond;label = 160; break; }
  case 13: 
   var $cmp31=($shr3|0)==0;
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
   var $shr47=$sub44 >>> ($and46>>>0);
   var $shr48=$shr47 >>> 5;
   var $and49=$shr48 & 8;
   var $add50=$and49 | $and46;
   var $shr51=$shr47 >>> ($and49>>>0);
   var $shr52=$shr51 >>> 2;
   var $and53=$shr52 & 4;
   var $add54=$add50 | $and53;
   var $shr55=$shr51 >>> ($and53>>>0);
   var $shr56=$shr55 >>> 1;
   var $and57=$shr56 & 2;
   var $add58=$add54 | $and57;
   var $shr59=$shr55 >>> ($and57>>>0);
   var $shr60=$shr59 >>> 1;
   var $and61=$shr60 & 1;
   var $add62=$add58 | $and61;
   var $shr63=$shr59 >>> ($and61>>>0);
   var $add64=((($add62)+($shr63))|0);
   var $shl65=$add64 << 1;
   var $arrayidx66=((1944+($shl65<<2))|0);
   var $13=$arrayidx66;
   var $arrayidx66_sum=((($shl65)+(2))|0);
   var $14=((1944+($arrayidx66_sum<<2))|0);
   var $15=HEAP32[(($14)>>2)];
   var $fd69=(($15+8)|0);
   var $16=HEAP32[(($fd69)>>2)];
   var $cmp70=($13|0)==($16|0);
   if ($cmp70) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $shl72=1 << $add64;
   var $neg73=$shl72 ^ -1;
   var $and74=$0 & $neg73;
   HEAP32[((((1904)|0))>>2)]=$and74;
   label = 20; break;
  case 16: 
   var $17=$16;
   var $18=HEAP32[((((1920)|0))>>2)];
   var $cmp76=($17>>>0) < ($18>>>0);
   if ($cmp76) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $bk78=(($16+12)|0);
   var $19=HEAP32[(($bk78)>>2)];
   var $cmp79=($19|0)==($15|0);
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
   var $23=HEAP32[((((1912)|0))>>2)];
   var $cmp99=($23|0)==0;
   if ($cmp99) { label = 26; break; } else { label = 21; break; }
  case 21: 
   var $24=HEAP32[((((1924)|0))>>2)];
   var $shr101=$23 >>> 3;
   var $shl102=$shr101 << 1;
   var $arrayidx103=((1944+($shl102<<2))|0);
   var $25=$arrayidx103;
   var $26=HEAP32[((((1904)|0))>>2)];
   var $shl105=1 << $shr101;
   var $and106=$26 & $shl105;
   var $tobool107=($and106|0)==0;
   if ($tobool107) { label = 22; break; } else { label = 23; break; }
  case 22: 
   var $or110=$26 | $shl105;
   HEAP32[((((1904)|0))>>2)]=$or110;
   var $arrayidx103_sum_pre=((($shl102)+(2))|0);
   var $_pre=((1944+($arrayidx103_sum_pre<<2))|0);
   var $F104_0 = $25;var $_pre_phi = $_pre;label = 25; break;
  case 23: 
   var $arrayidx103_sum104=((($shl102)+(2))|0);
   var $27=((1944+($arrayidx103_sum104<<2))|0);
   var $28=HEAP32[(($27)>>2)];
   var $29=$28;
   var $30=HEAP32[((((1920)|0))>>2)];
   var $cmp113=($29>>>0) < ($30>>>0);
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
   HEAP32[((((1912)|0))>>2)]=$sub91;
   HEAP32[((((1924)|0))>>2)]=$21;
   var $31=$fd69;
   var $mem_0 = $31;label = 341; break;
  case 27: 
   var $32=HEAP32[((((1908)|0))>>2)];
   var $cmp128=($32|0)==0;
   if ($cmp128) { var $nb_0 = $cond;label = 160; break; } else { label = 28; break; }
  case 28: 
   var $sub_i=(((-$32))|0);
   var $and_i=$32 & $sub_i;
   var $sub2_i=((($and_i)-(1))|0);
   var $shr_i=$sub2_i >>> 12;
   var $and3_i=$shr_i & 16;
   var $shr4_i=$sub2_i >>> ($and3_i>>>0);
   var $shr5_i=$shr4_i >>> 5;
   var $and6_i=$shr5_i & 8;
   var $add_i=$and6_i | $and3_i;
   var $shr7_i=$shr4_i >>> ($and6_i>>>0);
   var $shr8_i=$shr7_i >>> 2;
   var $and9_i=$shr8_i & 4;
   var $add10_i=$add_i | $and9_i;
   var $shr11_i=$shr7_i >>> ($and9_i>>>0);
   var $shr12_i=$shr11_i >>> 1;
   var $and13_i=$shr12_i & 2;
   var $add14_i=$add10_i | $and13_i;
   var $shr15_i=$shr11_i >>> ($and13_i>>>0);
   var $shr16_i=$shr15_i >>> 1;
   var $and17_i=$shr16_i & 1;
   var $add18_i=$add14_i | $and17_i;
   var $shr19_i=$shr15_i >>> ($and17_i>>>0);
   var $add20_i=((($add18_i)+($shr19_i))|0);
   var $arrayidx_i=((2208+($add20_i<<2))|0);
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
   var $cmp_i=($35|0)==0;
   if ($cmp_i) { label = 30; break; } else { var $cond7_i = $35;label = 31; break; }
  case 30: 
   var $arrayidx27_i=(($t_0_i+20)|0);
   var $36=HEAP32[(($arrayidx27_i)>>2)];
   var $cmp28_i=($36|0)==0;
   if ($cmp28_i) { label = 32; break; } else { var $cond7_i = $36;label = 31; break; }
  case 31: 
   var $cond7_i;
   var $head29_i=(($cond7_i+4)|0);
   var $37=HEAP32[(($head29_i)>>2)];
   var $and30_i=$37 & -8;
   var $sub31_i=((($and30_i)-($cond))|0);
   var $cmp32_i=($sub31_i>>>0) < ($rsize_0_i>>>0);
   var $sub31_rsize_0_i=$cmp32_i ? $sub31_i : $rsize_0_i;
   var $cond_v_0_i=$cmp32_i ? $cond7_i : $v_0_i;
   var $t_0_i = $cond7_i;var $v_0_i = $cond_v_0_i;var $rsize_0_i = $sub31_rsize_0_i;label = 29; break;
  case 32: 
   var $38=$v_0_i;
   var $39=HEAP32[((((1920)|0))>>2)];
   var $cmp33_i=($38>>>0) < ($39>>>0);
   if ($cmp33_i) { label = 76; break; } else { label = 33; break; }
  case 33: 
   var $add_ptr_i=(($38+$cond)|0);
   var $40=$add_ptr_i;
   var $cmp35_i=($38>>>0) < ($add_ptr_i>>>0);
   if ($cmp35_i) { label = 34; break; } else { label = 76; break; }
  case 34: 
   var $parent_i=(($v_0_i+24)|0);
   var $41=HEAP32[(($parent_i)>>2)];
   var $bk_i=(($v_0_i+12)|0);
   var $42=HEAP32[(($bk_i)>>2)];
   var $cmp40_i=($42|0)==($v_0_i|0);
   if ($cmp40_i) { label = 40; break; } else { label = 35; break; }
  case 35: 
   var $fd_i=(($v_0_i+8)|0);
   var $43=HEAP32[(($fd_i)>>2)];
   var $44=$43;
   var $cmp45_i=($44>>>0) < ($39>>>0);
   if ($cmp45_i) { label = 39; break; } else { label = 36; break; }
  case 36: 
   var $bk47_i=(($43+12)|0);
   var $45=HEAP32[(($bk47_i)>>2)];
   var $cmp48_i=($45|0)==($v_0_i|0);
   if ($cmp48_i) { label = 37; break; } else { label = 39; break; }
  case 37: 
   var $fd50_i=(($42+8)|0);
   var $46=HEAP32[(($fd50_i)>>2)];
   var $cmp51_i=($46|0)==($v_0_i|0);
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
   var $cmp62_i=($47|0)==0;
   if ($cmp62_i) { label = 41; break; } else { var $R_0_i = $47;var $RP_0_i = $arrayidx61_i;label = 42; break; }
  case 41: 
   var $arrayidx65_i=(($v_0_i+16)|0);
   var $48=HEAP32[(($arrayidx65_i)>>2)];
   var $cmp66_i=($48|0)==0;
   if ($cmp66_i) { var $R_1_i = 0;label = 47; break; } else { var $R_0_i = $48;var $RP_0_i = $arrayidx65_i;label = 42; break; }
  case 42: 
   var $RP_0_i;
   var $R_0_i;
   var $arrayidx71_i=(($R_0_i+20)|0);
   var $49=HEAP32[(($arrayidx71_i)>>2)];
   var $cmp72_i=($49|0)==0;
   if ($cmp72_i) { label = 43; break; } else { var $R_0_i = $49;var $RP_0_i = $arrayidx71_i;label = 42; break; }
  case 43: 
   var $arrayidx75_i=(($R_0_i+16)|0);
   var $50=HEAP32[(($arrayidx75_i)>>2)];
   var $cmp76_i=($50|0)==0;
   if ($cmp76_i) { label = 44; break; } else { var $R_0_i = $50;var $RP_0_i = $arrayidx75_i;label = 42; break; }
  case 44: 
   var $51=$RP_0_i;
   var $cmp81_i=($51>>>0) < ($39>>>0);
   if ($cmp81_i) { label = 46; break; } else { label = 45; break; }
  case 45: 
   HEAP32[(($RP_0_i)>>2)]=0;
   var $R_1_i = $R_0_i;label = 47; break;
  case 46: 
   _abort();
   throw "Reached an unreachable!";
  case 47: 
   var $R_1_i;
   var $cmp90_i=($41|0)==0;
   if ($cmp90_i) { label = 67; break; } else { label = 48; break; }
  case 48: 
   var $index_i=(($v_0_i+28)|0);
   var $52=HEAP32[(($index_i)>>2)];
   var $arrayidx94_i=((2208+($52<<2))|0);
   var $53=HEAP32[(($arrayidx94_i)>>2)];
   var $cmp95_i=($v_0_i|0)==($53|0);
   if ($cmp95_i) { label = 49; break; } else { label = 51; break; }
  case 49: 
   HEAP32[(($arrayidx94_i)>>2)]=$R_1_i;
   var $cond5_i=($R_1_i|0)==0;
   if ($cond5_i) { label = 50; break; } else { label = 57; break; }
  case 50: 
   var $54=HEAP32[(($index_i)>>2)];
   var $shl_i=1 << $54;
   var $neg_i=$shl_i ^ -1;
   var $55=HEAP32[((((1908)|0))>>2)];
   var $and103_i=$55 & $neg_i;
   HEAP32[((((1908)|0))>>2)]=$and103_i;
   label = 67; break;
  case 51: 
   var $56=$41;
   var $57=HEAP32[((((1920)|0))>>2)];
   var $cmp107_i=($56>>>0) < ($57>>>0);
   if ($cmp107_i) { label = 55; break; } else { label = 52; break; }
  case 52: 
   var $arrayidx113_i=(($41+16)|0);
   var $58=HEAP32[(($arrayidx113_i)>>2)];
   var $cmp114_i=($58|0)==($v_0_i|0);
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
   var $cmp126_i=($R_1_i|0)==0;
   if ($cmp126_i) { label = 67; break; } else { label = 57; break; }
  case 57: 
   var $59=$R_1_i;
   var $60=HEAP32[((((1920)|0))>>2)];
   var $cmp130_i=($59>>>0) < ($60>>>0);
   if ($cmp130_i) { label = 66; break; } else { label = 58; break; }
  case 58: 
   var $parent135_i=(($R_1_i+24)|0);
   HEAP32[(($parent135_i)>>2)]=$41;
   var $arrayidx137_i=(($v_0_i+16)|0);
   var $61=HEAP32[(($arrayidx137_i)>>2)];
   var $cmp138_i=($61|0)==0;
   if ($cmp138_i) { label = 62; break; } else { label = 59; break; }
  case 59: 
   var $62=$61;
   var $63=HEAP32[((((1920)|0))>>2)];
   var $cmp142_i=($62>>>0) < ($63>>>0);
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
   var $cmp155_i=($64|0)==0;
   if ($cmp155_i) { label = 67; break; } else { label = 63; break; }
  case 63: 
   var $65=$64;
   var $66=HEAP32[((((1920)|0))>>2)];
   var $cmp159_i=($65>>>0) < ($66>>>0);
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
   var $cmp174_i=($rsize_0_i>>>0) < 16;
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
   var $70=HEAP32[((((1912)|0))>>2)];
   var $cmp191_i=($70|0)==0;
   if ($cmp191_i) { label = 75; break; } else { label = 70; break; }
  case 70: 
   var $71=HEAP32[((((1924)|0))>>2)];
   var $shr194_i=$70 >>> 3;
   var $shl195_i=$shr194_i << 1;
   var $arrayidx196_i=((1944+($shl195_i<<2))|0);
   var $72=$arrayidx196_i;
   var $73=HEAP32[((((1904)|0))>>2)];
   var $shl198_i=1 << $shr194_i;
   var $and199_i=$73 & $shl198_i;
   var $tobool200_i=($and199_i|0)==0;
   if ($tobool200_i) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $or204_i=$73 | $shl198_i;
   HEAP32[((((1904)|0))>>2)]=$or204_i;
   var $arrayidx196_sum_pre_i=((($shl195_i)+(2))|0);
   var $_pre_i=((1944+($arrayidx196_sum_pre_i<<2))|0);
   var $F197_0_i = $72;var $_pre_phi_i = $_pre_i;label = 74; break;
  case 72: 
   var $arrayidx196_sum2_i=((($shl195_i)+(2))|0);
   var $74=((1944+($arrayidx196_sum2_i<<2))|0);
   var $75=HEAP32[(($74)>>2)];
   var $76=$75;
   var $77=HEAP32[((((1920)|0))>>2)];
   var $cmp208_i=($76>>>0) < ($77>>>0);
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
   HEAP32[((((1912)|0))>>2)]=$rsize_0_i;
   HEAP32[((((1924)|0))>>2)]=$40;
   label = 77; break;
  case 76: 
   _abort();
   throw "Reached an unreachable!";
  case 77: 
   var $add_ptr225_i=(($v_0_i+8)|0);
   var $78=$add_ptr225_i;
   var $cmp130=($add_ptr225_i|0)==0;
   if ($cmp130) { var $nb_0 = $cond;label = 160; break; } else { var $mem_0 = $78;label = 341; break; }
  case 78: 
   var $cmp138=($bytes>>>0) > 4294967231;
   if ($cmp138) { var $nb_0 = -1;label = 160; break; } else { label = 79; break; }
  case 79: 
   var $add143=((($bytes)+(11))|0);
   var $and144=$add143 & -8;
   var $79=HEAP32[((((1908)|0))>>2)];
   var $cmp145=($79|0)==0;
   if ($cmp145) { var $nb_0 = $and144;label = 160; break; } else { label = 80; break; }
  case 80: 
   var $sub_i107=(((-$and144))|0);
   var $shr_i108=$add143 >>> 8;
   var $cmp_i109=($shr_i108|0)==0;
   if ($cmp_i109) { var $idx_0_i = 0;label = 83; break; } else { label = 81; break; }
  case 81: 
   var $cmp1_i=($and144>>>0) > 16777215;
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
   var $shr20_i=$and144 >>> ($add19_i>>>0);
   var $and21_i118=$shr20_i & 1;
   var $add22_i=$and21_i118 | $shl18_i;
   var $idx_0_i = $add22_i;label = 83; break;
  case 83: 
   var $idx_0_i;
   var $arrayidx_i119=((2208+($idx_0_i<<2))|0);
   var $80=HEAP32[(($arrayidx_i119)>>2)];
   var $cmp24_i=($80|0)==0;
   if ($cmp24_i) { var $v_2_i = 0;var $rsize_2_i = $sub_i107;var $t_1_i = 0;label = 90; break; } else { label = 84; break; }
  case 84: 
   var $cmp26_i=($idx_0_i|0)==31;
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
   var $cmp34_i=($sub33_i>>>0) < ($rsize_0_i122>>>0);
   if ($cmp34_i) { label = 88; break; } else { var $v_1_i = $v_0_i123;var $rsize_1_i = $rsize_0_i122;label = 89; break; }
  case 88: 
   var $cmp36_i=($and32_i|0)==($and144|0);
   if ($cmp36_i) { var $v_2_i = $t_0_i121;var $rsize_2_i = $sub33_i;var $t_1_i = $t_0_i121;label = 90; break; } else { var $v_1_i = $t_0_i121;var $rsize_1_i = $sub33_i;label = 89; break; }
  case 89: 
   var $rsize_1_i;
   var $v_1_i;
   var $arrayidx40_i=(($t_0_i121+20)|0);
   var $82=HEAP32[(($arrayidx40_i)>>2)];
   var $shr41_i=$sizebits_0_i >>> 31;
   var $arrayidx44_i=(($t_0_i121+16+($shr41_i<<2))|0);
   var $83=HEAP32[(($arrayidx44_i)>>2)];
   var $cmp45_i125=($82|0)==0;
   var $cmp46_i=($82|0)==($83|0);
   var $or_cond_i=$cmp45_i125 | $cmp46_i;
   var $rst_1_i=$or_cond_i ? $rst_0_i : $82;
   var $cmp49_i=($83|0)==0;
   var $shl52_i=$sizebits_0_i << 1;
   if ($cmp49_i) { var $v_2_i = $v_1_i;var $rsize_2_i = $rsize_1_i;var $t_1_i = $rst_1_i;label = 90; break; } else { var $v_0_i123 = $v_1_i;var $rsize_0_i122 = $rsize_1_i;var $t_0_i121 = $83;var $sizebits_0_i = $shl52_i;var $rst_0_i = $rst_1_i;label = 87; break; }
  case 90: 
   var $t_1_i;
   var $rsize_2_i;
   var $v_2_i;
   var $cmp54_i=($t_1_i|0)==0;
   var $cmp56_i=($v_2_i|0)==0;
   var $or_cond18_i=$cmp54_i & $cmp56_i;
   if ($or_cond18_i) { label = 91; break; } else { var $t_2_ph_i = $t_1_i;label = 93; break; }
  case 91: 
   var $shl59_i=2 << $idx_0_i;
   var $sub62_i=(((-$shl59_i))|0);
   var $or_i=$shl59_i | $sub62_i;
   var $and63_i=$79 & $or_i;
   var $cmp64_i=($and63_i|0)==0;
   if ($cmp64_i) { var $nb_0 = $and144;label = 160; break; } else { label = 92; break; }
  case 92: 
   var $sub66_i=(((-$and63_i))|0);
   var $and67_i=$and63_i & $sub66_i;
   var $sub69_i=((($and67_i)-(1))|0);
   var $shr71_i=$sub69_i >>> 12;
   var $and72_i=$shr71_i & 16;
   var $shr74_i=$sub69_i >>> ($and72_i>>>0);
   var $shr75_i=$shr74_i >>> 5;
   var $and76_i=$shr75_i & 8;
   var $add77_i=$and76_i | $and72_i;
   var $shr78_i=$shr74_i >>> ($and76_i>>>0);
   var $shr79_i=$shr78_i >>> 2;
   var $and80_i=$shr79_i & 4;
   var $add81_i=$add77_i | $and80_i;
   var $shr82_i=$shr78_i >>> ($and80_i>>>0);
   var $shr83_i=$shr82_i >>> 1;
   var $and84_i=$shr83_i & 2;
   var $add85_i=$add81_i | $and84_i;
   var $shr86_i=$shr82_i >>> ($and84_i>>>0);
   var $shr87_i=$shr86_i >>> 1;
   var $and88_i=$shr87_i & 1;
   var $add89_i=$add85_i | $and88_i;
   var $shr90_i=$shr86_i >>> ($and88_i>>>0);
   var $add91_i=((($add89_i)+($shr90_i))|0);
   var $arrayidx93_i=((2208+($add91_i<<2))|0);
   var $84=HEAP32[(($arrayidx93_i)>>2)];
   var $t_2_ph_i = $84;label = 93; break;
  case 93: 
   var $t_2_ph_i;
   var $cmp9623_i=($t_2_ph_i|0)==0;
   if ($cmp9623_i) { var $rsize_3_lcssa_i = $rsize_2_i;var $v_3_lcssa_i = $v_2_i;label = 96; break; } else { var $t_224_i = $t_2_ph_i;var $rsize_325_i = $rsize_2_i;var $v_326_i = $v_2_i;label = 94; break; }
  case 94: 
   var $v_326_i;
   var $rsize_325_i;
   var $t_224_i;
   var $head98_i=(($t_224_i+4)|0);
   var $85=HEAP32[(($head98_i)>>2)];
   var $and99_i=$85 & -8;
   var $sub100_i=((($and99_i)-($and144))|0);
   var $cmp101_i=($sub100_i>>>0) < ($rsize_325_i>>>0);
   var $sub100_rsize_3_i=$cmp101_i ? $sub100_i : $rsize_325_i;
   var $t_2_v_3_i=$cmp101_i ? $t_224_i : $v_326_i;
   var $arrayidx105_i=(($t_224_i+16)|0);
   var $86=HEAP32[(($arrayidx105_i)>>2)];
   var $cmp106_i=($86|0)==0;
   if ($cmp106_i) { label = 95; break; } else { var $t_224_i = $86;var $rsize_325_i = $sub100_rsize_3_i;var $v_326_i = $t_2_v_3_i;label = 94; break; }
  case 95: 
   var $arrayidx112_i=(($t_224_i+20)|0);
   var $87=HEAP32[(($arrayidx112_i)>>2)];
   var $cmp96_i=($87|0)==0;
   if ($cmp96_i) { var $rsize_3_lcssa_i = $sub100_rsize_3_i;var $v_3_lcssa_i = $t_2_v_3_i;label = 96; break; } else { var $t_224_i = $87;var $rsize_325_i = $sub100_rsize_3_i;var $v_326_i = $t_2_v_3_i;label = 94; break; }
  case 96: 
   var $v_3_lcssa_i;
   var $rsize_3_lcssa_i;
   var $cmp115_i=($v_3_lcssa_i|0)==0;
   if ($cmp115_i) { var $nb_0 = $and144;label = 160; break; } else { label = 97; break; }
  case 97: 
   var $88=HEAP32[((((1912)|0))>>2)];
   var $sub117_i=((($88)-($and144))|0);
   var $cmp118_i=($rsize_3_lcssa_i>>>0) < ($sub117_i>>>0);
   if ($cmp118_i) { label = 98; break; } else { var $nb_0 = $and144;label = 160; break; }
  case 98: 
   var $89=$v_3_lcssa_i;
   var $90=HEAP32[((((1920)|0))>>2)];
   var $cmp120_i=($89>>>0) < ($90>>>0);
   if ($cmp120_i) { label = 158; break; } else { label = 99; break; }
  case 99: 
   var $add_ptr_i128=(($89+$and144)|0);
   var $91=$add_ptr_i128;
   var $cmp122_i=($89>>>0) < ($add_ptr_i128>>>0);
   if ($cmp122_i) { label = 100; break; } else { label = 158; break; }
  case 100: 
   var $parent_i129=(($v_3_lcssa_i+24)|0);
   var $92=HEAP32[(($parent_i129)>>2)];
   var $bk_i130=(($v_3_lcssa_i+12)|0);
   var $93=HEAP32[(($bk_i130)>>2)];
   var $cmp127_i=($93|0)==($v_3_lcssa_i|0);
   if ($cmp127_i) { label = 106; break; } else { label = 101; break; }
  case 101: 
   var $fd_i131=(($v_3_lcssa_i+8)|0);
   var $94=HEAP32[(($fd_i131)>>2)];
   var $95=$94;
   var $cmp132_i=($95>>>0) < ($90>>>0);
   if ($cmp132_i) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $bk135_i=(($94+12)|0);
   var $96=HEAP32[(($bk135_i)>>2)];
   var $cmp136_i=($96|0)==($v_3_lcssa_i|0);
   if ($cmp136_i) { label = 103; break; } else { label = 105; break; }
  case 103: 
   var $fd138_i=(($93+8)|0);
   var $97=HEAP32[(($fd138_i)>>2)];
   var $cmp139_i=($97|0)==($v_3_lcssa_i|0);
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
   var $cmp151_i=($98|0)==0;
   if ($cmp151_i) { label = 107; break; } else { var $R_0_i137 = $98;var $RP_0_i136 = $arrayidx150_i;label = 108; break; }
  case 107: 
   var $arrayidx154_i133=(($v_3_lcssa_i+16)|0);
   var $99=HEAP32[(($arrayidx154_i133)>>2)];
   var $cmp155_i134=($99|0)==0;
   if ($cmp155_i134) { var $R_1_i139 = 0;label = 113; break; } else { var $R_0_i137 = $99;var $RP_0_i136 = $arrayidx154_i133;label = 108; break; }
  case 108: 
   var $RP_0_i136;
   var $R_0_i137;
   var $arrayidx160_i=(($R_0_i137+20)|0);
   var $100=HEAP32[(($arrayidx160_i)>>2)];
   var $cmp161_i=($100|0)==0;
   if ($cmp161_i) { label = 109; break; } else { var $R_0_i137 = $100;var $RP_0_i136 = $arrayidx160_i;label = 108; break; }
  case 109: 
   var $arrayidx164_i=(($R_0_i137+16)|0);
   var $101=HEAP32[(($arrayidx164_i)>>2)];
   var $cmp165_i=($101|0)==0;
   if ($cmp165_i) { label = 110; break; } else { var $R_0_i137 = $101;var $RP_0_i136 = $arrayidx164_i;label = 108; break; }
  case 110: 
   var $102=$RP_0_i136;
   var $cmp170_i=($102>>>0) < ($90>>>0);
   if ($cmp170_i) { label = 112; break; } else { label = 111; break; }
  case 111: 
   HEAP32[(($RP_0_i136)>>2)]=0;
   var $R_1_i139 = $R_0_i137;label = 113; break;
  case 112: 
   _abort();
   throw "Reached an unreachable!";
  case 113: 
   var $R_1_i139;
   var $cmp179_i=($92|0)==0;
   if ($cmp179_i) { label = 133; break; } else { label = 114; break; }
  case 114: 
   var $index_i140=(($v_3_lcssa_i+28)|0);
   var $103=HEAP32[(($index_i140)>>2)];
   var $arrayidx183_i=((2208+($103<<2))|0);
   var $104=HEAP32[(($arrayidx183_i)>>2)];
   var $cmp184_i=($v_3_lcssa_i|0)==($104|0);
   if ($cmp184_i) { label = 115; break; } else { label = 117; break; }
  case 115: 
   HEAP32[(($arrayidx183_i)>>2)]=$R_1_i139;
   var $cond20_i=($R_1_i139|0)==0;
   if ($cond20_i) { label = 116; break; } else { label = 123; break; }
  case 116: 
   var $105=HEAP32[(($index_i140)>>2)];
   var $shl191_i=1 << $105;
   var $neg_i141=$shl191_i ^ -1;
   var $106=HEAP32[((((1908)|0))>>2)];
   var $and193_i=$106 & $neg_i141;
   HEAP32[((((1908)|0))>>2)]=$and193_i;
   label = 133; break;
  case 117: 
   var $107=$92;
   var $108=HEAP32[((((1920)|0))>>2)];
   var $cmp197_i=($107>>>0) < ($108>>>0);
   if ($cmp197_i) { label = 121; break; } else { label = 118; break; }
  case 118: 
   var $arrayidx203_i=(($92+16)|0);
   var $109=HEAP32[(($arrayidx203_i)>>2)];
   var $cmp204_i=($109|0)==($v_3_lcssa_i|0);
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
   var $cmp216_i=($R_1_i139|0)==0;
   if ($cmp216_i) { label = 133; break; } else { label = 123; break; }
  case 123: 
   var $110=$R_1_i139;
   var $111=HEAP32[((((1920)|0))>>2)];
   var $cmp220_i=($110>>>0) < ($111>>>0);
   if ($cmp220_i) { label = 132; break; } else { label = 124; break; }
  case 124: 
   var $parent225_i=(($R_1_i139+24)|0);
   HEAP32[(($parent225_i)>>2)]=$92;
   var $arrayidx227_i=(($v_3_lcssa_i+16)|0);
   var $112=HEAP32[(($arrayidx227_i)>>2)];
   var $cmp228_i=($112|0)==0;
   if ($cmp228_i) { label = 128; break; } else { label = 125; break; }
  case 125: 
   var $113=$112;
   var $114=HEAP32[((((1920)|0))>>2)];
   var $cmp232_i=($113>>>0) < ($114>>>0);
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
   var $cmp245_i=($115|0)==0;
   if ($cmp245_i) { label = 133; break; } else { label = 129; break; }
  case 129: 
   var $116=$115;
   var $117=HEAP32[((((1920)|0))>>2)];
   var $cmp249_i=($116>>>0) < ($117>>>0);
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
   var $cmp264_i=($rsize_3_lcssa_i>>>0) < 16;
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
   var $cmp283_i=($rsize_3_lcssa_i>>>0) < 256;
   if ($cmp283_i) { label = 136; break; } else { label = 141; break; }
  case 136: 
   var $shl287_i=$shr282_i << 1;
   var $arrayidx288_i=((1944+($shl287_i<<2))|0);
   var $121=$arrayidx288_i;
   var $122=HEAP32[((((1904)|0))>>2)];
   var $shl290_i=1 << $shr282_i;
   var $and291_i=$122 & $shl290_i;
   var $tobool292_i=($and291_i|0)==0;
   if ($tobool292_i) { label = 137; break; } else { label = 138; break; }
  case 137: 
   var $or296_i=$122 | $shl290_i;
   HEAP32[((((1904)|0))>>2)]=$or296_i;
   var $arrayidx288_sum_pre_i=((($shl287_i)+(2))|0);
   var $_pre_i146=((1944+($arrayidx288_sum_pre_i<<2))|0);
   var $F289_0_i = $121;var $_pre_phi_i147 = $_pre_i146;label = 140; break;
  case 138: 
   var $arrayidx288_sum16_i=((($shl287_i)+(2))|0);
   var $123=((1944+($arrayidx288_sum16_i<<2))|0);
   var $124=HEAP32[(($123)>>2)];
   var $125=$124;
   var $126=HEAP32[((((1920)|0))>>2)];
   var $cmp300_i=($125>>>0) < ($126>>>0);
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
   var $cmp318_i=($shr317_i|0)==0;
   if ($cmp318_i) { var $I315_0_i = 0;label = 144; break; } else { label = 142; break; }
  case 142: 
   var $cmp322_i=($rsize_3_lcssa_i>>>0) > 16777215;
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
   var $shr348_i=$rsize_3_lcssa_i >>> ($add347_i>>>0);
   var $and349_i=$shr348_i & 1;
   var $add350_i=$and349_i | $shl346_i;
   var $I315_0_i = $add350_i;label = 144; break;
  case 144: 
   var $I315_0_i;
   var $arrayidx354_i=((2208+($I315_0_i<<2))|0);
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
   var $132=HEAP32[((((1908)|0))>>2)];
   var $shl361_i=1 << $I315_0_i;
   var $and362_i=$132 & $shl361_i;
   var $tobool363_i=($and362_i|0)==0;
   if ($tobool363_i) { label = 145; break; } else { label = 146; break; }
  case 145: 
   var $or367_i=$132 | $shl361_i;
   HEAP32[((((1908)|0))>>2)]=$or367_i;
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
   var $cmp373_i=($I315_0_i|0)==31;
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
   var $cmp387_i=($and386_i|0)==($rsize_3_lcssa_i|0);
   if ($cmp387_i) { label = 154; break; } else { label = 150; break; }
  case 150: 
   var $shr390_i=$K372_0_i >>> 31;
   var $arrayidx393_i=(($T_0_i+16+($shr390_i<<2))|0);
   var $139=HEAP32[(($arrayidx393_i)>>2)];
   var $cmp395_i=($139|0)==0;
   var $shl394_i=$K372_0_i << 1;
   if ($cmp395_i) { label = 151; break; } else { var $K372_0_i = $shl394_i;var $T_0_i = $139;label = 149; break; }
  case 151: 
   var $140=$arrayidx393_i;
   var $141=HEAP32[((((1920)|0))>>2)];
   var $cmp400_i=($140>>>0) < ($141>>>0);
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
   var $147=HEAP32[((((1920)|0))>>2)];
   var $cmp414_i=($146>>>0) < ($147>>>0);
   if ($cmp414_i) { label = 157; break; } else { label = 155; break; }
  case 155: 
   var $148=$145;
   var $cmp418_i=($148>>>0) < ($147>>>0);
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
   var $cmp149=($add_ptr436_i|0)==0;
   if ($cmp149) { var $nb_0 = $and144;label = 160; break; } else { var $mem_0 = $152;label = 341; break; }
  case 160: 
   var $nb_0;
   var $153=HEAP32[((((1912)|0))>>2)];
   var $cmp155=($nb_0>>>0) > ($153>>>0);
   if ($cmp155) { label = 165; break; } else { label = 161; break; }
  case 161: 
   var $sub159=((($153)-($nb_0))|0);
   var $154=HEAP32[((((1924)|0))>>2)];
   var $cmp161=($sub159>>>0) > 15;
   if ($cmp161) { label = 162; break; } else { label = 163; break; }
  case 162: 
   var $155=$154;
   var $add_ptr165=(($155+$nb_0)|0);
   var $156=$add_ptr165;
   HEAP32[((((1924)|0))>>2)]=$156;
   HEAP32[((((1912)|0))>>2)]=$sub159;
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
   HEAP32[((((1912)|0))>>2)]=0;
   HEAP32[((((1924)|0))>>2)]=0;
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
   var $162=HEAP32[((((1916)|0))>>2)];
   var $cmp183=($nb_0>>>0) < ($162>>>0);
   if ($cmp183) { label = 166; break; } else { label = 167; break; }
  case 166: 
   var $sub187=((($162)-($nb_0))|0);
   HEAP32[((((1916)|0))>>2)]=$sub187;
   var $163=HEAP32[((((1928)|0))>>2)];
   var $164=$163;
   var $add_ptr190=(($164+$nb_0)|0);
   var $165=$add_ptr190;
   HEAP32[((((1928)|0))>>2)]=$165;
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
   var $168=HEAP32[((((1880)|0))>>2)];
   var $cmp_i148=($168|0)==0;
   if ($cmp_i148) { label = 168; break; } else { label = 171; break; }
  case 168: 
   var $call_i_i=_sysconf(30);
   var $sub_i_i=((($call_i_i)-(1))|0);
   var $and_i_i=$sub_i_i & $call_i_i;
   var $cmp1_i_i=($and_i_i|0)==0;
   if ($cmp1_i_i) { label = 170; break; } else { label = 169; break; }
  case 169: 
   _abort();
   throw "Reached an unreachable!";
  case 170: 
   HEAP32[((((1888)|0))>>2)]=$call_i_i;
   HEAP32[((((1884)|0))>>2)]=$call_i_i;
   HEAP32[((((1892)|0))>>2)]=-1;
   HEAP32[((((1896)|0))>>2)]=-1;
   HEAP32[((((1900)|0))>>2)]=0;
   HEAP32[((((2348)|0))>>2)]=0;
   var $call6_i_i=_time(0);
   var $xor_i_i=$call6_i_i & -16;
   var $and7_i_i=$xor_i_i ^ 1431655768;
   HEAP32[((((1880)|0))>>2)]=$and7_i_i;
   label = 171; break;
  case 171: 
   var $add_i149=((($nb_0)+(48))|0);
   var $169=HEAP32[((((1888)|0))>>2)];
   var $sub_i150=((($nb_0)+(47))|0);
   var $add9_i=((($169)+($sub_i150))|0);
   var $neg_i151=(((-$169))|0);
   var $and11_i=$add9_i & $neg_i151;
   var $cmp12_i=($and11_i>>>0) > ($nb_0>>>0);
   if ($cmp12_i) { label = 172; break; } else { var $mem_0 = 0;label = 341; break; }
  case 172: 
   var $170=HEAP32[((((2344)|0))>>2)];
   var $cmp15_i=($170|0)==0;
   if ($cmp15_i) { label = 174; break; } else { label = 173; break; }
  case 173: 
   var $171=HEAP32[((((2336)|0))>>2)];
   var $add17_i152=((($171)+($and11_i))|0);
   var $cmp19_i=($add17_i152>>>0) <= ($171>>>0);
   var $cmp21_i=($add17_i152>>>0) > ($170>>>0);
   var $or_cond1_i=$cmp19_i | $cmp21_i;
   if ($or_cond1_i) { var $mem_0 = 0;label = 341; break; } else { label = 174; break; }
  case 174: 
   var $172=HEAP32[((((2348)|0))>>2)];
   var $and26_i=$172 & 4;
   var $tobool27_i=($and26_i|0)==0;
   if ($tobool27_i) { label = 175; break; } else { var $tsize_1_i = 0;label = 198; break; }
  case 175: 
   var $173=HEAP32[((((1928)|0))>>2)];
   var $cmp29_i=($173|0)==0;
   if ($cmp29_i) { label = 181; break; } else { label = 176; break; }
  case 176: 
   var $174=$173;
   var $sp_0_i_i = ((2352)|0);label = 177; break;
  case 177: 
   var $sp_0_i_i;
   var $base_i_i=(($sp_0_i_i)|0);
   var $175=HEAP32[(($base_i_i)>>2)];
   var $cmp_i9_i=($175>>>0) > ($174>>>0);
   if ($cmp_i9_i) { label = 179; break; } else { label = 178; break; }
  case 178: 
   var $size_i_i=(($sp_0_i_i+4)|0);
   var $176=HEAP32[(($size_i_i)>>2)];
   var $add_ptr_i_i=(($175+$176)|0);
   var $cmp2_i_i=($add_ptr_i_i>>>0) > ($174>>>0);
   if ($cmp2_i_i) { label = 180; break; } else { label = 179; break; }
  case 179: 
   var $next_i_i=(($sp_0_i_i+8)|0);
   var $177=HEAP32[(($next_i_i)>>2)];
   var $cmp3_i_i=($177|0)==0;
   if ($cmp3_i_i) { label = 181; break; } else { var $sp_0_i_i = $177;label = 177; break; }
  case 180: 
   var $cmp32_i154=($sp_0_i_i|0)==0;
   if ($cmp32_i154) { label = 181; break; } else { label = 188; break; }
  case 181: 
   var $call34_i=_sbrk(0);
   var $cmp35_i156=($call34_i|0)==-1;
   if ($cmp35_i156) { var $tsize_0758385_i = 0;label = 197; break; } else { label = 182; break; }
  case 182: 
   var $178=$call34_i;
   var $179=HEAP32[((((1884)|0))>>2)];
   var $sub38_i=((($179)-(1))|0);
   var $and39_i=$sub38_i & $178;
   var $cmp40_i157=($and39_i|0)==0;
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
   var $180=HEAP32[((((2336)|0))>>2)];
   var $add51_i=((($180)+($ssize_0_i))|0);
   var $cmp52_i=($ssize_0_i>>>0) > ($nb_0>>>0);
   var $cmp54_i158=($ssize_0_i>>>0) < 2147483647;
   var $or_cond_i159=$cmp52_i & $cmp54_i158;
   if ($or_cond_i159) { label = 185; break; } else { var $tsize_0758385_i = 0;label = 197; break; }
  case 185: 
   var $181=HEAP32[((((2344)|0))>>2)];
   var $cmp57_i=($181|0)==0;
   if ($cmp57_i) { label = 187; break; } else { label = 186; break; }
  case 186: 
   var $cmp60_i=($add51_i>>>0) <= ($180>>>0);
   var $cmp63_i=($add51_i>>>0) > ($181>>>0);
   var $or_cond2_i=$cmp60_i | $cmp63_i;
   if ($or_cond2_i) { var $tsize_0758385_i = 0;label = 197; break; } else { label = 187; break; }
  case 187: 
   var $call65_i=_sbrk($ssize_0_i);
   var $cmp66_i160=($call65_i|0)==($call34_i|0);
   var $ssize_0__i=$cmp66_i160 ? $ssize_0_i : 0;
   var $call34__i=$cmp66_i160 ? $call34_i : -1;
   var $tbase_0_i = $call34__i;var $tsize_0_i = $ssize_0__i;var $br_0_i = $call65_i;var $ssize_1_i = $ssize_0_i;label = 190; break;
  case 188: 
   var $182=HEAP32[((((1916)|0))>>2)];
   var $add74_i=((($add9_i)-($182))|0);
   var $and77_i=$add74_i & $neg_i151;
   var $cmp78_i=($and77_i>>>0) < 2147483647;
   if ($cmp78_i) { label = 189; break; } else { var $tsize_0758385_i = 0;label = 197; break; }
  case 189: 
   var $call80_i=_sbrk($and77_i);
   var $183=HEAP32[(($base_i_i)>>2)];
   var $184=HEAP32[(($size_i_i)>>2)];
   var $add_ptr_i162=(($183+$184)|0);
   var $cmp82_i=($call80_i|0)==($add_ptr_i162|0);
   var $and77__i=$cmp82_i ? $and77_i : 0;
   var $call80__i=$cmp82_i ? $call80_i : -1;
   var $tbase_0_i = $call80__i;var $tsize_0_i = $and77__i;var $br_0_i = $call80_i;var $ssize_1_i = $and77_i;label = 190; break;
  case 190: 
   var $ssize_1_i;
   var $br_0_i;
   var $tsize_0_i;
   var $tbase_0_i;
   var $sub109_i=(((-$ssize_1_i))|0);
   var $cmp86_i=($tbase_0_i|0)==-1;
   if ($cmp86_i) { label = 191; break; } else { var $tsize_291_i = $tsize_0_i;var $tbase_292_i = $tbase_0_i;label = 201; break; }
  case 191: 
   var $cmp88_i=($br_0_i|0)!=-1;
   var $cmp90_i163=($ssize_1_i>>>0) < 2147483647;
   var $or_cond3_i=$cmp88_i & $cmp90_i163;
   var $cmp93_i=($ssize_1_i>>>0) < ($add_i149>>>0);
   var $or_cond4_i=$or_cond3_i & $cmp93_i;
   if ($or_cond4_i) { label = 192; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 192: 
   var $185=HEAP32[((((1888)|0))>>2)];
   var $sub96_i=((($sub_i150)-($ssize_1_i))|0);
   var $add98_i=((($sub96_i)+($185))|0);
   var $neg100_i=(((-$185))|0);
   var $and101_i=$add98_i & $neg100_i;
   var $cmp102_i=($and101_i>>>0) < 2147483647;
   if ($cmp102_i) { label = 193; break; } else { var $ssize_2_i = $ssize_1_i;label = 196; break; }
  case 193: 
   var $call104_i=_sbrk($and101_i);
   var $cmp105_i=($call104_i|0)==-1;
   if ($cmp105_i) { label = 195; break; } else { label = 194; break; }
  case 194: 
   var $add107_i=((($and101_i)+($ssize_1_i))|0);
   var $ssize_2_i = $add107_i;label = 196; break;
  case 195: 
   var $call110_i=_sbrk($sub109_i);
   var $tsize_0758385_i = $tsize_0_i;label = 197; break;
  case 196: 
   var $ssize_2_i;
   var $cmp115_i164=($br_0_i|0)==-1;
   if ($cmp115_i164) { var $tsize_0758385_i = $tsize_0_i;label = 197; break; } else { var $tsize_291_i = $ssize_2_i;var $tbase_292_i = $br_0_i;label = 201; break; }
  case 197: 
   var $tsize_0758385_i;
   var $186=HEAP32[((((2348)|0))>>2)];
   var $or_i165=$186 | 4;
   HEAP32[((((2348)|0))>>2)]=$or_i165;
   var $tsize_1_i = $tsize_0758385_i;label = 198; break;
  case 198: 
   var $tsize_1_i;
   var $cmp124_i=($and11_i>>>0) < 2147483647;
   if ($cmp124_i) { label = 199; break; } else { label = 340; break; }
  case 199: 
   var $call128_i=_sbrk($and11_i);
   var $call129_i=_sbrk(0);
   var $notlhs_i=($call128_i|0)!=-1;
   var $notrhs_i=($call129_i|0)!=-1;
   var $or_cond6_not_i=$notrhs_i & $notlhs_i;
   var $cmp134_i=($call128_i>>>0) < ($call129_i>>>0);
   var $or_cond7_i=$or_cond6_not_i & $cmp134_i;
   if ($or_cond7_i) { label = 200; break; } else { label = 340; break; }
  case 200: 
   var $sub_ptr_lhs_cast_i=$call129_i;
   var $sub_ptr_rhs_cast_i=$call128_i;
   var $sub_ptr_sub_i=((($sub_ptr_lhs_cast_i)-($sub_ptr_rhs_cast_i))|0);
   var $add137_i=((($nb_0)+(40))|0);
   var $cmp138_i166=($sub_ptr_sub_i>>>0) > ($add137_i>>>0);
   var $sub_ptr_sub_tsize_1_i=$cmp138_i166 ? $sub_ptr_sub_i : $tsize_1_i;
   var $call128_tbase_1_i=$cmp138_i166 ? $call128_i : -1;
   var $cmp144_i=($call128_tbase_1_i|0)==-1;
   if ($cmp144_i) { label = 340; break; } else { var $tsize_291_i = $sub_ptr_sub_tsize_1_i;var $tbase_292_i = $call128_tbase_1_i;label = 201; break; }
  case 201: 
   var $tbase_292_i;
   var $tsize_291_i;
   var $187=HEAP32[((((2336)|0))>>2)];
   var $add147_i=((($187)+($tsize_291_i))|0);
   HEAP32[((((2336)|0))>>2)]=$add147_i;
   var $188=HEAP32[((((2340)|0))>>2)];
   var $cmp148_i=($add147_i>>>0) > ($188>>>0);
   if ($cmp148_i) { label = 202; break; } else { label = 203; break; }
  case 202: 
   HEAP32[((((2340)|0))>>2)]=$add147_i;
   label = 203; break;
  case 203: 
   var $189=HEAP32[((((1928)|0))>>2)];
   var $cmp154_i=($189|0)==0;
   if ($cmp154_i) { label = 204; break; } else { var $sp_0105_i = ((2352)|0);label = 211; break; }
  case 204: 
   var $190=HEAP32[((((1920)|0))>>2)];
   var $cmp156_i=($190|0)==0;
   var $cmp159_i168=($tbase_292_i>>>0) < ($190>>>0);
   var $or_cond8_i=$cmp156_i | $cmp159_i168;
   if ($or_cond8_i) { label = 205; break; } else { label = 206; break; }
  case 205: 
   HEAP32[((((1920)|0))>>2)]=$tbase_292_i;
   label = 206; break;
  case 206: 
   HEAP32[((((2352)|0))>>2)]=$tbase_292_i;
   HEAP32[((((2356)|0))>>2)]=$tsize_291_i;
   HEAP32[((((2364)|0))>>2)]=0;
   var $191=HEAP32[((((1880)|0))>>2)];
   HEAP32[((((1940)|0))>>2)]=$191;
   HEAP32[((((1936)|0))>>2)]=-1;
   var $i_02_i_i = 0;label = 207; break;
  case 207: 
   var $i_02_i_i;
   var $shl_i_i=$i_02_i_i << 1;
   var $arrayidx_i_i=((1944+($shl_i_i<<2))|0);
   var $192=$arrayidx_i_i;
   var $arrayidx_sum_i_i=((($shl_i_i)+(3))|0);
   var $193=((1944+($arrayidx_sum_i_i<<2))|0);
   HEAP32[(($193)>>2)]=$192;
   var $arrayidx_sum1_i_i=((($shl_i_i)+(2))|0);
   var $194=((1944+($arrayidx_sum1_i_i<<2))|0);
   HEAP32[(($194)>>2)]=$192;
   var $inc_i_i=((($i_02_i_i)+(1))|0);
   var $cmp_i11_i=($inc_i_i>>>0) < 32;
   if ($cmp_i11_i) { var $i_02_i_i = $inc_i_i;label = 207; break; } else { label = 208; break; }
  case 208: 
   var $sub169_i=((($tsize_291_i)-(40))|0);
   var $add_ptr_i12_i=(($tbase_292_i+8)|0);
   var $195=$add_ptr_i12_i;
   var $and_i13_i=$195 & 7;
   var $cmp_i14_i=($and_i13_i|0)==0;
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
   HEAP32[((((1928)|0))>>2)]=$197;
   HEAP32[((((1916)|0))>>2)]=$sub5_i_i;
   var $or_i_i=$sub5_i_i | 1;
   var $add_ptr4_sum_i_i=((($cond_i_i)+(4))|0);
   var $head_i_i=(($tbase_292_i+$add_ptr4_sum_i_i)|0);
   var $198=$head_i_i;
   HEAP32[(($198)>>2)]=$or_i_i;
   var $add_ptr6_sum_i_i=((($tsize_291_i)-(36))|0);
   var $head7_i_i=(($tbase_292_i+$add_ptr6_sum_i_i)|0);
   var $199=$head7_i_i;
   HEAP32[(($199)>>2)]=40;
   var $200=HEAP32[((((1896)|0))>>2)];
   HEAP32[((((1932)|0))>>2)]=$200;
   label = 338; break;
  case 211: 
   var $sp_0105_i;
   var $base184_i=(($sp_0105_i)|0);
   var $201=HEAP32[(($base184_i)>>2)];
   var $size185_i=(($sp_0105_i+4)|0);
   var $202=HEAP32[(($size185_i)>>2)];
   var $add_ptr186_i=(($201+$202)|0);
   var $cmp187_i=($tbase_292_i|0)==($add_ptr186_i|0);
   if ($cmp187_i) { label = 213; break; } else { label = 212; break; }
  case 212: 
   var $next_i=(($sp_0105_i+8)|0);
   var $203=HEAP32[(($next_i)>>2)];
   var $cmp183_i=($203|0)==0;
   if ($cmp183_i) { label = 218; break; } else { var $sp_0105_i = $203;label = 211; break; }
  case 213: 
   var $sflags190_i=(($sp_0105_i+12)|0);
   var $204=HEAP32[(($sflags190_i)>>2)];
   var $and191_i=$204 & 8;
   var $tobool192_i=($and191_i|0)==0;
   if ($tobool192_i) { label = 214; break; } else { label = 218; break; }
  case 214: 
   var $205=$189;
   var $cmp200_i=($205>>>0) >= ($201>>>0);
   var $cmp206_i=($205>>>0) < ($tbase_292_i>>>0);
   var $or_cond94_i=$cmp200_i & $cmp206_i;
   if ($or_cond94_i) { label = 215; break; } else { label = 218; break; }
  case 215: 
   var $add209_i=((($202)+($tsize_291_i))|0);
   HEAP32[(($size185_i)>>2)]=$add209_i;
   var $206=HEAP32[((((1928)|0))>>2)];
   var $207=HEAP32[((((1916)|0))>>2)];
   var $add212_i=((($207)+($tsize_291_i))|0);
   var $208=$206;
   var $add_ptr_i23_i=(($206+8)|0);
   var $209=$add_ptr_i23_i;
   var $and_i24_i=$209 & 7;
   var $cmp_i25_i=($and_i24_i|0)==0;
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
   HEAP32[((((1928)|0))>>2)]=$211;
   HEAP32[((((1916)|0))>>2)]=$sub5_i30_i;
   var $or_i31_i=$sub5_i30_i | 1;
   var $add_ptr4_sum_i32_i=((($cond_i28_i)+(4))|0);
   var $head_i33_i=(($208+$add_ptr4_sum_i32_i)|0);
   var $212=$head_i33_i;
   HEAP32[(($212)>>2)]=$or_i31_i;
   var $add_ptr6_sum_i34_i=((($add212_i)+(4))|0);
   var $head7_i35_i=(($208+$add_ptr6_sum_i34_i)|0);
   var $213=$head7_i35_i;
   HEAP32[(($213)>>2)]=40;
   var $214=HEAP32[((((1896)|0))>>2)];
   HEAP32[((((1932)|0))>>2)]=$214;
   label = 338; break;
  case 218: 
   var $215=HEAP32[((((1920)|0))>>2)];
   var $cmp215_i=($tbase_292_i>>>0) < ($215>>>0);
   if ($cmp215_i) { label = 219; break; } else { label = 220; break; }
  case 219: 
   HEAP32[((((1920)|0))>>2)]=$tbase_292_i;
   label = 220; break;
  case 220: 
   var $add_ptr224_i=(($tbase_292_i+$tsize_291_i)|0);
   var $sp_1101_i = ((2352)|0);label = 221; break;
  case 221: 
   var $sp_1101_i;
   var $base223_i=(($sp_1101_i)|0);
   var $216=HEAP32[(($base223_i)>>2)];
   var $cmp225_i=($216|0)==($add_ptr224_i|0);
   if ($cmp225_i) { label = 223; break; } else { label = 222; break; }
  case 222: 
   var $next228_i=(($sp_1101_i+8)|0);
   var $217=HEAP32[(($next228_i)>>2)];
   var $cmp221_i=($217|0)==0;
   if ($cmp221_i) { label = 304; break; } else { var $sp_1101_i = $217;label = 221; break; }
  case 223: 
   var $sflags232_i=(($sp_1101_i+12)|0);
   var $218=HEAP32[(($sflags232_i)>>2)];
   var $and233_i=$218 & 8;
   var $tobool234_i=($and233_i|0)==0;
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
   var $cmp_i40_i=($and_i39_i|0)==0;
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
   var $cmp7_i_i=($and6_i45_i|0)==0;
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
   var $227=HEAP32[((((1928)|0))>>2)];
   var $cmp20_i_i=($224|0)==($227|0);
   if ($cmp20_i_i) { label = 229; break; } else { label = 230; break; }
  case 229: 
   var $228=HEAP32[((((1916)|0))>>2)];
   var $add_i_i=((($228)+($sub18_i_i))|0);
   HEAP32[((((1916)|0))>>2)]=$add_i_i;
   HEAP32[((((1928)|0))>>2)]=$225;
   var $or22_i_i=$add_i_i | 1;
   var $add_ptr17_sum39_i_i=((($add_ptr4_sum_i50_i)+(4))|0);
   var $head23_i_i=(($tbase_292_i+$add_ptr17_sum39_i_i)|0);
   var $229=$head23_i_i;
   HEAP32[(($229)>>2)]=$or22_i_i;
   label = 303; break;
  case 230: 
   var $230=HEAP32[((((1924)|0))>>2)];
   var $cmp24_i_i=($224|0)==($230|0);
   if ($cmp24_i_i) { label = 231; break; } else { label = 232; break; }
  case 231: 
   var $231=HEAP32[((((1912)|0))>>2)];
   var $add26_i_i=((($231)+($sub18_i_i))|0);
   HEAP32[((((1912)|0))>>2)]=$add26_i_i;
   HEAP32[((((1924)|0))>>2)]=$225;
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
   var $cmp34_i_i=($and33_i_i|0)==1;
   if ($cmp34_i_i) { label = 233; break; } else { var $oldfirst_0_i_i = $224;var $qsize_0_i_i = $sub18_i_i;label = 280; break; }
  case 233: 
   var $and37_i_i=$234 & -8;
   var $shr_i55_i=$234 >>> 3;
   var $cmp38_i_i=($234>>>0) < 256;
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
   var $arrayidx_i58_i=((1944+($shl_i57_i<<2))|0);
   var $239=$arrayidx_i58_i;
   var $cmp41_i_i=($236|0)==($239|0);
   if ($cmp41_i_i) { label = 237; break; } else { label = 235; break; }
  case 235: 
   var $240=$236;
   var $241=HEAP32[((((1920)|0))>>2)];
   var $cmp42_i_i=($240>>>0) < ($241>>>0);
   if ($cmp42_i_i) { label = 245; break; } else { label = 236; break; }
  case 236: 
   var $bk43_i_i=(($236+12)|0);
   var $242=HEAP32[(($bk43_i_i)>>2)];
   var $cmp44_i_i=($242|0)==($224|0);
   if ($cmp44_i_i) { label = 237; break; } else { label = 245; break; }
  case 237: 
   var $cmp46_i60_i=($238|0)==($236|0);
   if ($cmp46_i60_i) { label = 238; break; } else { label = 239; break; }
  case 238: 
   var $shl48_i_i=1 << $shr_i55_i;
   var $neg_i_i=$shl48_i_i ^ -1;
   var $243=HEAP32[((((1904)|0))>>2)];
   var $and49_i_i=$243 & $neg_i_i;
   HEAP32[((((1904)|0))>>2)]=$and49_i_i;
   label = 279; break;
  case 239: 
   var $cmp54_i_i=($238|0)==($239|0);
   if ($cmp54_i_i) { label = 240; break; } else { label = 241; break; }
  case 240: 
   var $fd68_pre_i_i=(($238+8)|0);
   var $fd68_pre_phi_i_i = $fd68_pre_i_i;label = 243; break;
  case 241: 
   var $244=$238;
   var $245=HEAP32[((((1920)|0))>>2)];
   var $cmp57_i_i=($244>>>0) < ($245>>>0);
   if ($cmp57_i_i) { label = 244; break; } else { label = 242; break; }
  case 242: 
   var $fd59_i_i=(($238+8)|0);
   var $246=HEAP32[(($fd59_i_i)>>2)];
   var $cmp60_i_i=($246|0)==($224|0);
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
   var $cmp75_i_i=($251|0)==($247|0);
   if ($cmp75_i_i) { label = 252; break; } else { label = 247; break; }
  case 247: 
   var $add_ptr16_sum2930_i_i=$cond15_i_i | 8;
   var $add_ptr224_sum126_i=((($add_ptr16_sum2930_i_i)+($tsize_291_i))|0);
   var $fd78_i_i=(($tbase_292_i+$add_ptr224_sum126_i)|0);
   var $252=$fd78_i_i;
   var $253=HEAP32[(($252)>>2)];
   var $254=$253;
   var $255=HEAP32[((((1920)|0))>>2)];
   var $cmp81_i_i=($254>>>0) < ($255>>>0);
   if ($cmp81_i_i) { label = 251; break; } else { label = 248; break; }
  case 248: 
   var $bk82_i_i=(($253+12)|0);
   var $256=HEAP32[(($bk82_i_i)>>2)];
   var $cmp83_i_i=($256|0)==($247|0);
   if ($cmp83_i_i) { label = 249; break; } else { label = 251; break; }
  case 249: 
   var $fd85_i_i=(($251+8)|0);
   var $257=HEAP32[(($fd85_i_i)>>2)];
   var $cmp86_i_i=($257|0)==($247|0);
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
   var $cmp97_i_i=($259|0)==0;
   if ($cmp97_i_i) { label = 253; break; } else { var $R_0_i_i = $259;var $RP_0_i_i = $258;label = 254; break; }
  case 253: 
   var $add_ptr224_sum132_i=((($add_ptr16_sum56_i_i)+($tsize_291_i))|0);
   var $child_i_i=(($tbase_292_i+$add_ptr224_sum132_i)|0);
   var $arrayidx99_i_i=$child_i_i;
   var $260=HEAP32[(($arrayidx99_i_i)>>2)];
   var $cmp100_i_i=($260|0)==0;
   if ($cmp100_i_i) { var $R_1_i_i = 0;label = 259; break; } else { var $R_0_i_i = $260;var $RP_0_i_i = $arrayidx99_i_i;label = 254; break; }
  case 254: 
   var $RP_0_i_i;
   var $R_0_i_i;
   var $arrayidx103_i_i=(($R_0_i_i+20)|0);
   var $261=HEAP32[(($arrayidx103_i_i)>>2)];
   var $cmp104_i_i=($261|0)==0;
   if ($cmp104_i_i) { label = 255; break; } else { var $R_0_i_i = $261;var $RP_0_i_i = $arrayidx103_i_i;label = 254; break; }
  case 255: 
   var $arrayidx107_i_i=(($R_0_i_i+16)|0);
   var $262=HEAP32[(($arrayidx107_i_i)>>2)];
   var $cmp108_i_i=($262|0)==0;
   if ($cmp108_i_i) { label = 256; break; } else { var $R_0_i_i = $262;var $RP_0_i_i = $arrayidx107_i_i;label = 254; break; }
  case 256: 
   var $263=$RP_0_i_i;
   var $264=HEAP32[((((1920)|0))>>2)];
   var $cmp112_i_i=($263>>>0) < ($264>>>0);
   if ($cmp112_i_i) { label = 258; break; } else { label = 257; break; }
  case 257: 
   HEAP32[(($RP_0_i_i)>>2)]=0;
   var $R_1_i_i = $R_0_i_i;label = 259; break;
  case 258: 
   _abort();
   throw "Reached an unreachable!";
  case 259: 
   var $R_1_i_i;
   var $cmp120_i64_i=($249|0)==0;
   if ($cmp120_i64_i) { label = 279; break; } else { label = 260; break; }
  case 260: 
   var $add_ptr16_sum26_i_i=((($tsize_291_i)+(28))|0);
   var $add_ptr224_sum127_i=((($add_ptr16_sum26_i_i)+($cond15_i_i))|0);
   var $index_i65_i=(($tbase_292_i+$add_ptr224_sum127_i)|0);
   var $265=$index_i65_i;
   var $266=HEAP32[(($265)>>2)];
   var $arrayidx123_i_i=((2208+($266<<2))|0);
   var $267=HEAP32[(($arrayidx123_i_i)>>2)];
   var $cmp124_i_i=($247|0)==($267|0);
   if ($cmp124_i_i) { label = 261; break; } else { label = 263; break; }
  case 261: 
   HEAP32[(($arrayidx123_i_i)>>2)]=$R_1_i_i;
   var $cond41_i_i=($R_1_i_i|0)==0;
   if ($cond41_i_i) { label = 262; break; } else { label = 269; break; }
  case 262: 
   var $268=HEAP32[(($265)>>2)];
   var $shl131_i_i=1 << $268;
   var $neg132_i_i=$shl131_i_i ^ -1;
   var $269=HEAP32[((((1908)|0))>>2)];
   var $and133_i_i=$269 & $neg132_i_i;
   HEAP32[((((1908)|0))>>2)]=$and133_i_i;
   label = 279; break;
  case 263: 
   var $270=$249;
   var $271=HEAP32[((((1920)|0))>>2)];
   var $cmp137_i_i=($270>>>0) < ($271>>>0);
   if ($cmp137_i_i) { label = 267; break; } else { label = 264; break; }
  case 264: 
   var $arrayidx143_i_i=(($249+16)|0);
   var $272=HEAP32[(($arrayidx143_i_i)>>2)];
   var $cmp144_i_i=($272|0)==($247|0);
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
   var $cmp156_i_i=($R_1_i_i|0)==0;
   if ($cmp156_i_i) { label = 279; break; } else { label = 269; break; }
  case 269: 
   var $273=$R_1_i_i;
   var $274=HEAP32[((((1920)|0))>>2)];
   var $cmp160_i_i=($273>>>0) < ($274>>>0);
   if ($cmp160_i_i) { label = 278; break; } else { label = 270; break; }
  case 270: 
   var $parent165_i_i=(($R_1_i_i+24)|0);
   HEAP32[(($parent165_i_i)>>2)]=$249;
   var $add_ptr16_sum2728_i_i=$cond15_i_i | 16;
   var $add_ptr224_sum128_i=((($add_ptr16_sum2728_i_i)+($tsize_291_i))|0);
   var $child166_i_i=(($tbase_292_i+$add_ptr224_sum128_i)|0);
   var $arrayidx167_i_i=$child166_i_i;
   var $275=HEAP32[(($arrayidx167_i_i)>>2)];
   var $cmp168_i_i=($275|0)==0;
   if ($cmp168_i_i) { label = 274; break; } else { label = 271; break; }
  case 271: 
   var $276=$275;
   var $277=HEAP32[((((1920)|0))>>2)];
   var $cmp172_i_i=($276>>>0) < ($277>>>0);
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
   var $cmp185_i_i=($279|0)==0;
   if ($cmp185_i_i) { label = 279; break; } else { label = 275; break; }
  case 275: 
   var $280=$279;
   var $281=HEAP32[((((1920)|0))>>2)];
   var $cmp189_i_i=($280>>>0) < ($281>>>0);
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
   var $cmp215_i_i=($qsize_0_i_i>>>0) < 256;
   if ($cmp215_i_i) { label = 281; break; } else { label = 286; break; }
  case 281: 
   var $shl221_i_i=$shr214_i_i << 1;
   var $arrayidx223_i_i=((1944+($shl221_i_i<<2))|0);
   var $285=$arrayidx223_i_i;
   var $286=HEAP32[((((1904)|0))>>2)];
   var $shl226_i_i=1 << $shr214_i_i;
   var $and227_i_i=$286 & $shl226_i_i;
   var $tobool228_i_i=($and227_i_i|0)==0;
   if ($tobool228_i_i) { label = 282; break; } else { label = 283; break; }
  case 282: 
   var $or232_i_i=$286 | $shl226_i_i;
   HEAP32[((((1904)|0))>>2)]=$or232_i_i;
   var $arrayidx223_sum_pre_i_i=((($shl221_i_i)+(2))|0);
   var $_pre_i67_i=((1944+($arrayidx223_sum_pre_i_i<<2))|0);
   var $F224_0_i_i = $285;var $_pre_phi_i68_i = $_pre_i67_i;label = 285; break;
  case 283: 
   var $arrayidx223_sum25_i_i=((($shl221_i_i)+(2))|0);
   var $287=((1944+($arrayidx223_sum25_i_i<<2))|0);
   var $288=HEAP32[(($287)>>2)];
   var $289=$288;
   var $290=HEAP32[((((1920)|0))>>2)];
   var $cmp236_i_i=($289>>>0) < ($290>>>0);
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
   var $cmp254_i_i=($shr253_i_i|0)==0;
   if ($cmp254_i_i) { var $I252_0_i_i = 0;label = 289; break; } else { label = 287; break; }
  case 287: 
   var $cmp258_i_i=($qsize_0_i_i>>>0) > 16777215;
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
   var $shr281_i_i=$qsize_0_i_i >>> ($add280_i_i>>>0);
   var $and282_i_i=$shr281_i_i & 1;
   var $add283_i_i=$and282_i_i | $shl279_i_i;
   var $I252_0_i_i = $add283_i_i;label = 289; break;
  case 289: 
   var $I252_0_i_i;
   var $arrayidx287_i_i=((2208+($I252_0_i_i<<2))|0);
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
   var $296=HEAP32[((((1908)|0))>>2)];
   var $shl294_i_i=1 << $I252_0_i_i;
   var $and295_i_i=$296 & $shl294_i_i;
   var $tobool296_i_i=($and295_i_i|0)==0;
   if ($tobool296_i_i) { label = 290; break; } else { label = 291; break; }
  case 290: 
   var $or300_i_i=$296 | $shl294_i_i;
   HEAP32[((((1908)|0))>>2)]=$or300_i_i;
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
   var $cmp306_i_i=($I252_0_i_i|0)==31;
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
   var $cmp319_i_i=($and318_i_i|0)==($qsize_0_i_i|0);
   if ($cmp319_i_i) { label = 299; break; } else { label = 295; break; }
  case 295: 
   var $shr322_i_i=$K305_0_i_i >>> 31;
   var $arrayidx325_i_i=(($T_0_i69_i+16+($shr322_i_i<<2))|0);
   var $303=HEAP32[(($arrayidx325_i_i)>>2)];
   var $cmp327_i_i=($303|0)==0;
   var $shl326_i_i=$K305_0_i_i << 1;
   if ($cmp327_i_i) { label = 296; break; } else { var $K305_0_i_i = $shl326_i_i;var $T_0_i69_i = $303;label = 294; break; }
  case 296: 
   var $304=$arrayidx325_i_i;
   var $305=HEAP32[((((1920)|0))>>2)];
   var $cmp332_i_i=($304>>>0) < ($305>>>0);
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
   var $311=HEAP32[((((1920)|0))>>2)];
   var $cmp346_i_i=($310>>>0) < ($311>>>0);
   if ($cmp346_i_i) { label = 302; break; } else { label = 300; break; }
  case 300: 
   var $312=$309;
   var $cmp350_i_i=($312>>>0) < ($311>>>0);
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
   var $sp_0_i_i_i = ((2352)|0);label = 305; break;
  case 305: 
   var $sp_0_i_i_i;
   var $base_i_i_i=(($sp_0_i_i_i)|0);
   var $317=HEAP32[(($base_i_i_i)>>2)];
   var $cmp_i_i_i=($317>>>0) > ($316>>>0);
   if ($cmp_i_i_i) { label = 307; break; } else { label = 306; break; }
  case 306: 
   var $size_i_i_i=(($sp_0_i_i_i+4)|0);
   var $318=HEAP32[(($size_i_i_i)>>2)];
   var $add_ptr_i_i_i=(($317+$318)|0);
   var $cmp2_i_i_i=($add_ptr_i_i_i>>>0) > ($316>>>0);
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
   var $cmp_i16_i=($and_i15_i|0)==0;
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
   var $cmp9_i_i=($add_ptr7_i_i>>>0) < ($add_ptr8_i_i>>>0);
   var $cond13_i_i=$cmp9_i_i ? $316 : $add_ptr7_i_i;
   var $add_ptr14_i_i=(($cond13_i_i+8)|0);
   var $322=$add_ptr14_i_i;
   var $sub16_i_i=((($tsize_291_i)-(40))|0);
   var $add_ptr_i11_i_i=(($tbase_292_i+8)|0);
   var $323=$add_ptr_i11_i_i;
   var $and_i_i_i=$323 & 7;
   var $cmp_i12_i_i=($and_i_i_i|0)==0;
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
   HEAP32[((((1928)|0))>>2)]=$325;
   HEAP32[((((1916)|0))>>2)]=$sub5_i_i_i;
   var $or_i_i_i=$sub5_i_i_i | 1;
   var $add_ptr4_sum_i_i_i=((($cond_i_i_i)+(4))|0);
   var $head_i_i_i=(($tbase_292_i+$add_ptr4_sum_i_i_i)|0);
   var $326=$head_i_i_i;
   HEAP32[(($326)>>2)]=$or_i_i_i;
   var $add_ptr6_sum_i_i_i=((($tsize_291_i)-(36))|0);
   var $head7_i_i_i=(($tbase_292_i+$add_ptr6_sum_i_i_i)|0);
   var $327=$head7_i_i_i;
   HEAP32[(($327)>>2)]=40;
   var $328=HEAP32[((((1896)|0))>>2)];
   HEAP32[((((1932)|0))>>2)]=$328;
   var $head_i19_i=(($cond13_i_i+4)|0);
   var $329=$head_i19_i;
   HEAP32[(($329)>>2)]=27;
   assert(16 % 1 === 0);HEAP32[(($add_ptr14_i_i)>>2)]=HEAP32[(((((2352)|0)))>>2)];HEAP32[((($add_ptr14_i_i)+(4))>>2)]=HEAP32[((((((2352)|0)))+(4))>>2)];HEAP32[((($add_ptr14_i_i)+(8))>>2)]=HEAP32[((((((2352)|0)))+(8))>>2)];HEAP32[((($add_ptr14_i_i)+(12))>>2)]=HEAP32[((((((2352)|0)))+(12))>>2)];
   HEAP32[((((2352)|0))>>2)]=$tbase_292_i;
   HEAP32[((((2356)|0))>>2)]=$tsize_291_i;
   HEAP32[((((2364)|0))>>2)]=0;
   HEAP32[((((2360)|0))>>2)]=$322;
   var $add_ptr2414_i_i=(($cond13_i_i+28)|0);
   var $330=$add_ptr2414_i_i;
   HEAP32[(($330)>>2)]=7;
   var $331=(($cond13_i_i+32)|0);
   var $cmp2715_i_i=($331>>>0) < ($add_ptr_i_i_i>>>0);
   if ($cmp2715_i_i) { var $add_ptr2416_i_i = $330;label = 313; break; } else { label = 314; break; }
  case 313: 
   var $add_ptr2416_i_i;
   var $332=(($add_ptr2416_i_i+4)|0);
   HEAP32[(($332)>>2)]=7;
   var $333=(($add_ptr2416_i_i+8)|0);
   var $334=$333;
   var $cmp27_i_i=($334>>>0) < ($add_ptr_i_i_i>>>0);
   if ($cmp27_i_i) { var $add_ptr2416_i_i = $332;label = 313; break; } else { label = 314; break; }
  case 314: 
   var $cmp28_i_i=($cond13_i_i|0)==($316|0);
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
   var $cmp36_i_i=($sub_ptr_sub_i_i>>>0) < 256;
   if ($cmp36_i_i) { label = 316; break; } else { label = 321; break; }
  case 316: 
   var $shl_i21_i=$shr_i_i << 1;
   var $arrayidx_i22_i=((1944+($shl_i21_i<<2))|0);
   var $337=$arrayidx_i22_i;
   var $338=HEAP32[((((1904)|0))>>2)];
   var $shl39_i_i=1 << $shr_i_i;
   var $and40_i_i=$338 & $shl39_i_i;
   var $tobool_i_i=($and40_i_i|0)==0;
   if ($tobool_i_i) { label = 317; break; } else { label = 318; break; }
  case 317: 
   var $or44_i_i=$338 | $shl39_i_i;
   HEAP32[((((1904)|0))>>2)]=$or44_i_i;
   var $arrayidx_sum_pre_i_i=((($shl_i21_i)+(2))|0);
   var $_pre_i_i=((1944+($arrayidx_sum_pre_i_i<<2))|0);
   var $F_0_i_i = $337;var $_pre_phi_i_i = $_pre_i_i;label = 320; break;
  case 318: 
   var $arrayidx_sum10_i_i=((($shl_i21_i)+(2))|0);
   var $339=((1944+($arrayidx_sum10_i_i<<2))|0);
   var $340=HEAP32[(($339)>>2)];
   var $341=$340;
   var $342=HEAP32[((((1920)|0))>>2)];
   var $cmp46_i_i=($341>>>0) < ($342>>>0);
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
   var $cmp59_i_i=($shr58_i_i|0)==0;
   if ($cmp59_i_i) { var $I57_0_i_i = 0;label = 324; break; } else { label = 322; break; }
  case 322: 
   var $cmp63_i_i=($sub_ptr_sub_i_i>>>0) > 16777215;
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
   var $shr86_i_i=$sub_ptr_sub_i_i >>> ($add85_i_i>>>0);
   var $and87_i_i=$shr86_i_i & 1;
   var $add88_i_i=$and87_i_i | $shl84_i_i;
   var $I57_0_i_i = $add88_i_i;label = 324; break;
  case 324: 
   var $I57_0_i_i;
   var $arrayidx91_i_i=((2208+($I57_0_i_i<<2))|0);
   var $index_i_i=(($189+28)|0);
   var $I57_0_c_i_i=$I57_0_i_i;
   HEAP32[(($index_i_i)>>2)]=$I57_0_c_i_i;
   var $arrayidx92_i_i=(($189+20)|0);
   HEAP32[(($arrayidx92_i_i)>>2)]=0;
   var $344=(($189+16)|0);
   HEAP32[(($344)>>2)]=0;
   var $345=HEAP32[((((1908)|0))>>2)];
   var $shl95_i_i=1 << $I57_0_i_i;
   var $and96_i_i=$345 & $shl95_i_i;
   var $tobool97_i_i=($and96_i_i|0)==0;
   if ($tobool97_i_i) { label = 325; break; } else { label = 326; break; }
  case 325: 
   var $or101_i_i=$345 | $shl95_i_i;
   HEAP32[((((1908)|0))>>2)]=$or101_i_i;
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
   var $cmp106_i_i=($I57_0_i_i|0)==31;
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
   var $cmp120_i_i=($and119_i_i|0)==($sub_ptr_sub_i_i|0);
   if ($cmp120_i_i) { label = 334; break; } else { label = 330; break; }
  case 330: 
   var $shr123_i_i=$K105_0_i_i >>> 31;
   var $arrayidx126_i_i=(($T_0_i_i+16+($shr123_i_i<<2))|0);
   var $348=HEAP32[(($arrayidx126_i_i)>>2)];
   var $cmp128_i_i=($348|0)==0;
   var $shl127_i_i=$K105_0_i_i << 1;
   if ($cmp128_i_i) { label = 331; break; } else { var $K105_0_i_i = $shl127_i_i;var $T_0_i_i = $348;label = 329; break; }
  case 331: 
   var $349=$arrayidx126_i_i;
   var $350=HEAP32[((((1920)|0))>>2)];
   var $cmp133_i_i=($349>>>0) < ($350>>>0);
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
   var $353=HEAP32[((((1920)|0))>>2)];
   var $cmp147_i_i=($352>>>0) < ($353>>>0);
   if ($cmp147_i_i) { label = 337; break; } else { label = 335; break; }
  case 335: 
   var $354=$351;
   var $cmp150_i_i=($354>>>0) < ($353>>>0);
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
   var $355=HEAP32[((((1916)|0))>>2)];
   var $cmp250_i=($355>>>0) > ($nb_0>>>0);
   if ($cmp250_i) { label = 339; break; } else { label = 340; break; }
  case 339: 
   var $sub253_i=((($355)-($nb_0))|0);
   HEAP32[((((1916)|0))>>2)]=$sub253_i;
   var $356=HEAP32[((((1928)|0))>>2)];
   var $357=$356;
   var $add_ptr255_i=(($357+$nb_0)|0);
   var $358=$add_ptr255_i;
   HEAP32[((((1928)|0))>>2)]=$358;
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
   var $cmp=($mem|0)==0;
   if ($cmp) { label = 140; break; } else { label = 2; break; }
  case 2: 
   var $add_ptr=((($mem)-(8))|0);
   var $0=$add_ptr;
   var $1=HEAP32[((((1920)|0))>>2)];
   var $cmp1=($add_ptr>>>0) < ($1>>>0);
   if ($cmp1) { label = 139; break; } else { label = 3; break; }
  case 3: 
   var $head=((($mem)-(4))|0);
   var $2=$head;
   var $3=HEAP32[(($2)>>2)];
   var $and=$3 & 3;
   var $cmp2=($and|0)==1;
   if ($cmp2) { label = 139; break; } else { label = 4; break; }
  case 4: 
   var $and5=$3 & -8;
   var $add_ptr_sum=((($and5)-(8))|0);
   var $add_ptr6=(($mem+$add_ptr_sum)|0);
   var $4=$add_ptr6;
   var $and8=$3 & 1;
   var $tobool9=($and8|0)==0;
   if ($tobool9) { label = 5; break; } else { var $p_0 = $0;var $psize_0 = $and5;label = 56; break; }
  case 5: 
   var $prev_foot=$add_ptr;
   var $5=HEAP32[(($prev_foot)>>2)];
   var $cmp13=($and|0)==0;
   if ($cmp13) { label = 140; break; } else { label = 6; break; }
  case 6: 
   var $add_ptr_sum231=(((-8)-($5))|0);
   var $add_ptr16=(($mem+$add_ptr_sum231)|0);
   var $6=$add_ptr16;
   var $add17=((($5)+($and5))|0);
   var $cmp18=($add_ptr16>>>0) < ($1>>>0);
   if ($cmp18) { label = 139; break; } else { label = 7; break; }
  case 7: 
   var $7=HEAP32[((((1924)|0))>>2)];
   var $cmp22=($6|0)==($7|0);
   if ($cmp22) { label = 54; break; } else { label = 8; break; }
  case 8: 
   var $shr=$5 >>> 3;
   var $cmp25=($5>>>0) < 256;
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
   var $arrayidx=((1944+($shl<<2))|0);
   var $12=$arrayidx;
   var $cmp29=($9|0)==($12|0);
   if ($cmp29) { label = 12; break; } else { label = 10; break; }
  case 10: 
   var $13=$9;
   var $cmp31=($13>>>0) < ($1>>>0);
   if ($cmp31) { label = 20; break; } else { label = 11; break; }
  case 11: 
   var $bk34=(($9+12)|0);
   var $14=HEAP32[(($bk34)>>2)];
   var $cmp35=($14|0)==($6|0);
   if ($cmp35) { label = 12; break; } else { label = 20; break; }
  case 12: 
   var $cmp42=($11|0)==($9|0);
   if ($cmp42) { label = 13; break; } else { label = 14; break; }
  case 13: 
   var $shl45=1 << $shr;
   var $neg=$shl45 ^ -1;
   var $15=HEAP32[((((1904)|0))>>2)];
   var $and46=$15 & $neg;
   HEAP32[((((1904)|0))>>2)]=$and46;
   var $p_0 = $6;var $psize_0 = $add17;label = 56; break;
  case 14: 
   var $cmp50=($11|0)==($12|0);
   if ($cmp50) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $fd67_pre=(($11+8)|0);
   var $fd67_pre_phi = $fd67_pre;label = 18; break;
  case 16: 
   var $16=$11;
   var $cmp53=($16>>>0) < ($1>>>0);
   if ($cmp53) { label = 19; break; } else { label = 17; break; }
  case 17: 
   var $fd56=(($11+8)|0);
   var $17=HEAP32[(($fd56)>>2)];
   var $cmp57=($17|0)==($6|0);
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
   var $cmp74=($22|0)==($18|0);
   if ($cmp74) { label = 27; break; } else { label = 22; break; }
  case 22: 
   var $add_ptr16_sum265=((($add_ptr_sum231)+(8))|0);
   var $fd78=(($mem+$add_ptr16_sum265)|0);
   var $23=$fd78;
   var $24=HEAP32[(($23)>>2)];
   var $25=$24;
   var $cmp80=($25>>>0) < ($1>>>0);
   if ($cmp80) { label = 26; break; } else { label = 23; break; }
  case 23: 
   var $bk82=(($24+12)|0);
   var $26=HEAP32[(($bk82)>>2)];
   var $cmp83=($26|0)==($18|0);
   if ($cmp83) { label = 24; break; } else { label = 26; break; }
  case 24: 
   var $fd86=(($22+8)|0);
   var $27=HEAP32[(($fd86)>>2)];
   var $cmp87=($27|0)==($18|0);
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
   var $cmp100=($29|0)==0;
   if ($cmp100) { label = 28; break; } else { var $R_0 = $29;var $RP_0 = $28;label = 29; break; }
  case 28: 
   var $add_ptr16_sum262=((($add_ptr_sum231)+(16))|0);
   var $child=(($mem+$add_ptr16_sum262)|0);
   var $arrayidx103=$child;
   var $30=HEAP32[(($arrayidx103)>>2)];
   var $cmp104=($30|0)==0;
   if ($cmp104) { var $R_1 = 0;label = 34; break; } else { var $R_0 = $30;var $RP_0 = $arrayidx103;label = 29; break; }
  case 29: 
   var $RP_0;
   var $R_0;
   var $arrayidx108=(($R_0+20)|0);
   var $31=HEAP32[(($arrayidx108)>>2)];
   var $cmp109=($31|0)==0;
   if ($cmp109) { label = 30; break; } else { var $R_0 = $31;var $RP_0 = $arrayidx108;label = 29; break; }
  case 30: 
   var $arrayidx113=(($R_0+16)|0);
   var $32=HEAP32[(($arrayidx113)>>2)];
   var $cmp114=($32|0)==0;
   if ($cmp114) { label = 31; break; } else { var $R_0 = $32;var $RP_0 = $arrayidx113;label = 29; break; }
  case 31: 
   var $33=$RP_0;
   var $cmp118=($33>>>0) < ($1>>>0);
   if ($cmp118) { label = 33; break; } else { label = 32; break; }
  case 32: 
   HEAP32[(($RP_0)>>2)]=0;
   var $R_1 = $R_0;label = 34; break;
  case 33: 
   _abort();
   throw "Reached an unreachable!";
  case 34: 
   var $R_1;
   var $cmp127=($20|0)==0;
   if ($cmp127) { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; } else { label = 35; break; }
  case 35: 
   var $add_ptr16_sum263=((($add_ptr_sum231)+(28))|0);
   var $index=(($mem+$add_ptr16_sum263)|0);
   var $34=$index;
   var $35=HEAP32[(($34)>>2)];
   var $arrayidx130=((2208+($35<<2))|0);
   var $36=HEAP32[(($arrayidx130)>>2)];
   var $cmp131=($18|0)==($36|0);
   if ($cmp131) { label = 36; break; } else { label = 38; break; }
  case 36: 
   HEAP32[(($arrayidx130)>>2)]=$R_1;
   var $cond278=($R_1|0)==0;
   if ($cond278) { label = 37; break; } else { label = 44; break; }
  case 37: 
   var $37=HEAP32[(($34)>>2)];
   var $shl138=1 << $37;
   var $neg139=$shl138 ^ -1;
   var $38=HEAP32[((((1908)|0))>>2)];
   var $and140=$38 & $neg139;
   HEAP32[((((1908)|0))>>2)]=$and140;
   var $p_0 = $6;var $psize_0 = $add17;label = 56; break;
  case 38: 
   var $39=$20;
   var $40=HEAP32[((((1920)|0))>>2)];
   var $cmp143=($39>>>0) < ($40>>>0);
   if ($cmp143) { label = 42; break; } else { label = 39; break; }
  case 39: 
   var $arrayidx149=(($20+16)|0);
   var $41=HEAP32[(($arrayidx149)>>2)];
   var $cmp150=($41|0)==($18|0);
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
   var $cmp162=($R_1|0)==0;
   if ($cmp162) { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; } else { label = 44; break; }
  case 44: 
   var $42=$R_1;
   var $43=HEAP32[((((1920)|0))>>2)];
   var $cmp165=($42>>>0) < ($43>>>0);
   if ($cmp165) { label = 53; break; } else { label = 45; break; }
  case 45: 
   var $parent170=(($R_1+24)|0);
   HEAP32[(($parent170)>>2)]=$20;
   var $add_ptr16_sum264=((($add_ptr_sum231)+(16))|0);
   var $child171=(($mem+$add_ptr16_sum264)|0);
   var $arrayidx172=$child171;
   var $44=HEAP32[(($arrayidx172)>>2)];
   var $cmp173=($44|0)==0;
   if ($cmp173) { label = 49; break; } else { label = 46; break; }
  case 46: 
   var $45=$44;
   var $46=HEAP32[((((1920)|0))>>2)];
   var $cmp176=($45>>>0) < ($46>>>0);
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
   var $cmp189=($48|0)==0;
   if ($cmp189) { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; } else { label = 50; break; }
  case 50: 
   var $49=$48;
   var $50=HEAP32[((((1920)|0))>>2)];
   var $cmp192=($49>>>0) < ($50>>>0);
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
   var $cmp211=($and210|0)==3;
   if ($cmp211) { label = 55; break; } else { var $p_0 = $6;var $psize_0 = $add17;label = 56; break; }
  case 55: 
   HEAP32[((((1912)|0))>>2)]=$add17;
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
   var $cmp225=($55>>>0) < ($add_ptr6>>>0);
   if ($cmp225) { label = 57; break; } else { label = 139; break; }
  case 57: 
   var $add_ptr6_sum258=((($and5)-(4))|0);
   var $head228=(($mem+$add_ptr6_sum258)|0);
   var $56=$head228;
   var $57=HEAP32[(($56)>>2)];
   var $and229=$57 & 1;
   var $phitmp=($and229|0)==0;
   if ($phitmp) { label = 139; break; } else { label = 58; break; }
  case 58: 
   var $and237=$57 & 2;
   var $tobool238=($and237|0)==0;
   if ($tobool238) { label = 59; break; } else { label = 112; break; }
  case 59: 
   var $58=HEAP32[((((1928)|0))>>2)];
   var $cmp240=($4|0)==($58|0);
   if ($cmp240) { label = 60; break; } else { label = 62; break; }
  case 60: 
   var $59=HEAP32[((((1916)|0))>>2)];
   var $add243=((($59)+($psize_0))|0);
   HEAP32[((((1916)|0))>>2)]=$add243;
   HEAP32[((((1928)|0))>>2)]=$p_0;
   var $or244=$add243 | 1;
   var $head245=(($p_0+4)|0);
   HEAP32[(($head245)>>2)]=$or244;
   var $60=HEAP32[((((1924)|0))>>2)];
   var $cmp246=($p_0|0)==($60|0);
   if ($cmp246) { label = 61; break; } else { label = 140; break; }
  case 61: 
   HEAP32[((((1924)|0))>>2)]=0;
   HEAP32[((((1912)|0))>>2)]=0;
   label = 140; break;
  case 62: 
   var $61=HEAP32[((((1924)|0))>>2)];
   var $cmp251=($4|0)==($61|0);
   if ($cmp251) { label = 63; break; } else { label = 64; break; }
  case 63: 
   var $62=HEAP32[((((1912)|0))>>2)];
   var $add254=((($62)+($psize_0))|0);
   HEAP32[((((1912)|0))>>2)]=$add254;
   HEAP32[((((1924)|0))>>2)]=$p_0;
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
   var $cmp264=($57>>>0) < 256;
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
   var $arrayidx274=((1944+($shl273<<2))|0);
   var $67=$arrayidx274;
   var $cmp275=($64|0)==($67|0);
   if ($cmp275) { label = 68; break; } else { label = 66; break; }
  case 66: 
   var $68=$64;
   var $69=HEAP32[((((1920)|0))>>2)];
   var $cmp278=($68>>>0) < ($69>>>0);
   if ($cmp278) { label = 76; break; } else { label = 67; break; }
  case 67: 
   var $bk281=(($64+12)|0);
   var $70=HEAP32[(($bk281)>>2)];
   var $cmp282=($70|0)==($4|0);
   if ($cmp282) { label = 68; break; } else { label = 76; break; }
  case 68: 
   var $cmp291=($66|0)==($64|0);
   if ($cmp291) { label = 69; break; } else { label = 70; break; }
  case 69: 
   var $shl294=1 << $shr263;
   var $neg295=$shl294 ^ -1;
   var $71=HEAP32[((((1904)|0))>>2)];
   var $and296=$71 & $neg295;
   HEAP32[((((1904)|0))>>2)]=$and296;
   label = 110; break;
  case 70: 
   var $cmp300=($66|0)==($67|0);
   if ($cmp300) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $fd317_pre=(($66+8)|0);
   var $fd317_pre_phi = $fd317_pre;label = 74; break;
  case 72: 
   var $72=$66;
   var $73=HEAP32[((((1920)|0))>>2)];
   var $cmp303=($72>>>0) < ($73>>>0);
   if ($cmp303) { label = 75; break; } else { label = 73; break; }
  case 73: 
   var $fd306=(($66+8)|0);
   var $74=HEAP32[(($fd306)>>2)];
   var $cmp307=($74|0)==($4|0);
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
   var $cmp329=($79|0)==($75|0);
   if ($cmp329) { label = 83; break; } else { label = 78; break; }
  case 78: 
   var $fd333=(($mem+$and5)|0);
   var $80=$fd333;
   var $81=HEAP32[(($80)>>2)];
   var $82=$81;
   var $83=HEAP32[((((1920)|0))>>2)];
   var $cmp335=($82>>>0) < ($83>>>0);
   if ($cmp335) { label = 82; break; } else { label = 79; break; }
  case 79: 
   var $bk338=(($81+12)|0);
   var $84=HEAP32[(($bk338)>>2)];
   var $cmp339=($84|0)==($75|0);
   if ($cmp339) { label = 80; break; } else { label = 82; break; }
  case 80: 
   var $fd342=(($79+8)|0);
   var $85=HEAP32[(($fd342)>>2)];
   var $cmp343=($85|0)==($75|0);
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
   var $cmp358=($87|0)==0;
   if ($cmp358) { label = 84; break; } else { var $R327_0 = $87;var $RP355_0 = $86;label = 85; break; }
  case 84: 
   var $add_ptr6_sum236=((($and5)+(8))|0);
   var $child356=(($mem+$add_ptr6_sum236)|0);
   var $arrayidx362=$child356;
   var $88=HEAP32[(($arrayidx362)>>2)];
   var $cmp363=($88|0)==0;
   if ($cmp363) { var $R327_1 = 0;label = 90; break; } else { var $R327_0 = $88;var $RP355_0 = $arrayidx362;label = 85; break; }
  case 85: 
   var $RP355_0;
   var $R327_0;
   var $arrayidx369=(($R327_0+20)|0);
   var $89=HEAP32[(($arrayidx369)>>2)];
   var $cmp370=($89|0)==0;
   if ($cmp370) { label = 86; break; } else { var $R327_0 = $89;var $RP355_0 = $arrayidx369;label = 85; break; }
  case 86: 
   var $arrayidx374=(($R327_0+16)|0);
   var $90=HEAP32[(($arrayidx374)>>2)];
   var $cmp375=($90|0)==0;
   if ($cmp375) { label = 87; break; } else { var $R327_0 = $90;var $RP355_0 = $arrayidx374;label = 85; break; }
  case 87: 
   var $91=$RP355_0;
   var $92=HEAP32[((((1920)|0))>>2)];
   var $cmp381=($91>>>0) < ($92>>>0);
   if ($cmp381) { label = 89; break; } else { label = 88; break; }
  case 88: 
   HEAP32[(($RP355_0)>>2)]=0;
   var $R327_1 = $R327_0;label = 90; break;
  case 89: 
   _abort();
   throw "Reached an unreachable!";
  case 90: 
   var $R327_1;
   var $cmp390=($77|0)==0;
   if ($cmp390) { label = 110; break; } else { label = 91; break; }
  case 91: 
   var $add_ptr6_sum246=((($and5)+(20))|0);
   var $index394=(($mem+$add_ptr6_sum246)|0);
   var $93=$index394;
   var $94=HEAP32[(($93)>>2)];
   var $arrayidx395=((2208+($94<<2))|0);
   var $95=HEAP32[(($arrayidx395)>>2)];
   var $cmp396=($75|0)==($95|0);
   if ($cmp396) { label = 92; break; } else { label = 94; break; }
  case 92: 
   HEAP32[(($arrayidx395)>>2)]=$R327_1;
   var $cond279=($R327_1|0)==0;
   if ($cond279) { label = 93; break; } else { label = 100; break; }
  case 93: 
   var $96=HEAP32[(($93)>>2)];
   var $shl403=1 << $96;
   var $neg404=$shl403 ^ -1;
   var $97=HEAP32[((((1908)|0))>>2)];
   var $and405=$97 & $neg404;
   HEAP32[((((1908)|0))>>2)]=$and405;
   label = 110; break;
  case 94: 
   var $98=$77;
   var $99=HEAP32[((((1920)|0))>>2)];
   var $cmp408=($98>>>0) < ($99>>>0);
   if ($cmp408) { label = 98; break; } else { label = 95; break; }
  case 95: 
   var $arrayidx414=(($77+16)|0);
   var $100=HEAP32[(($arrayidx414)>>2)];
   var $cmp415=($100|0)==($75|0);
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
   var $cmp427=($R327_1|0)==0;
   if ($cmp427) { label = 110; break; } else { label = 100; break; }
  case 100: 
   var $101=$R327_1;
   var $102=HEAP32[((((1920)|0))>>2)];
   var $cmp430=($101>>>0) < ($102>>>0);
   if ($cmp430) { label = 109; break; } else { label = 101; break; }
  case 101: 
   var $parent437=(($R327_1+24)|0);
   HEAP32[(($parent437)>>2)]=$77;
   var $add_ptr6_sum247=((($and5)+(8))|0);
   var $child438=(($mem+$add_ptr6_sum247)|0);
   var $arrayidx439=$child438;
   var $103=HEAP32[(($arrayidx439)>>2)];
   var $cmp440=($103|0)==0;
   if ($cmp440) { label = 105; break; } else { label = 102; break; }
  case 102: 
   var $104=$103;
   var $105=HEAP32[((((1920)|0))>>2)];
   var $cmp443=($104>>>0) < ($105>>>0);
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
   var $cmp456=($107|0)==0;
   if ($cmp456) { label = 110; break; } else { label = 106; break; }
  case 106: 
   var $108=$107;
   var $109=HEAP32[((((1920)|0))>>2)];
   var $cmp459=($108>>>0) < ($109>>>0);
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
   var $110=HEAP32[((((1924)|0))>>2)];
   var $cmp479=($p_0|0)==($110|0);
   if ($cmp479) { label = 111; break; } else { var $psize_1 = $add262;label = 113; break; }
  case 111: 
   HEAP32[((((1912)|0))>>2)]=$add262;
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
   var $cmp494=($psize_1>>>0) < 256;
   if ($cmp494) { label = 114; break; } else { label = 119; break; }
  case 114: 
   var $shl500=$shr493 << 1;
   var $arrayidx501=((1944+($shl500<<2))|0);
   var $111=$arrayidx501;
   var $112=HEAP32[((((1904)|0))>>2)];
   var $shl503=1 << $shr493;
   var $and504=$112 & $shl503;
   var $tobool505=($and504|0)==0;
   if ($tobool505) { label = 115; break; } else { label = 116; break; }
  case 115: 
   var $or508=$112 | $shl503;
   HEAP32[((((1904)|0))>>2)]=$or508;
   var $arrayidx501_sum_pre=((($shl500)+(2))|0);
   var $_pre=((1944+($arrayidx501_sum_pre<<2))|0);
   var $F502_0 = $111;var $_pre_phi = $_pre;label = 118; break;
  case 116: 
   var $arrayidx501_sum245=((($shl500)+(2))|0);
   var $113=((1944+($arrayidx501_sum245<<2))|0);
   var $114=HEAP32[(($113)>>2)];
   var $115=$114;
   var $116=HEAP32[((((1920)|0))>>2)];
   var $cmp511=($115>>>0) < ($116>>>0);
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
   var $cmp528=($shr527|0)==0;
   if ($cmp528) { var $I526_0 = 0;label = 122; break; } else { label = 120; break; }
  case 120: 
   var $cmp532=($psize_1>>>0) > 16777215;
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
   var $shr554=$psize_1 >>> ($add553>>>0);
   var $and555=$shr554 & 1;
   var $add556=$and555 | $shl552;
   var $I526_0 = $add556;label = 122; break;
  case 122: 
   var $I526_0;
   var $arrayidx559=((2208+($I526_0<<2))|0);
   var $index560=(($p_0+28)|0);
   var $I526_0_c=$I526_0;
   HEAP32[(($index560)>>2)]=$I526_0_c;
   var $arrayidx562=(($p_0+20)|0);
   HEAP32[(($arrayidx562)>>2)]=0;
   var $118=(($p_0+16)|0);
   HEAP32[(($118)>>2)]=0;
   var $119=HEAP32[((((1908)|0))>>2)];
   var $shl565=1 << $I526_0;
   var $and566=$119 & $shl565;
   var $tobool567=($and566|0)==0;
   if ($tobool567) { label = 123; break; } else { label = 124; break; }
  case 123: 
   var $or570=$119 | $shl565;
   HEAP32[((((1908)|0))>>2)]=$or570;
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
   var $cmp576=($I526_0|0)==31;
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
   var $cmp585=($and584|0)==($psize_1|0);
   if ($cmp585) { label = 132; break; } else { label = 128; break; }
  case 128: 
   var $shr588=$K575_0 >>> 31;
   var $arrayidx591=(($T_0+16+($shr588<<2))|0);
   var $122=HEAP32[(($arrayidx591)>>2)];
   var $cmp593=($122|0)==0;
   var $shl592=$K575_0 << 1;
   if ($cmp593) { label = 129; break; } else { var $K575_0 = $shl592;var $T_0 = $122;label = 127; break; }
  case 129: 
   var $123=$arrayidx591;
   var $124=HEAP32[((((1920)|0))>>2)];
   var $cmp597=($123>>>0) < ($124>>>0);
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
   var $127=HEAP32[((((1920)|0))>>2)];
   var $cmp610=($126>>>0) < ($127>>>0);
   if ($cmp610) { label = 135; break; } else { label = 133; break; }
  case 133: 
   var $128=$125;
   var $cmp613=($128>>>0) < ($127>>>0);
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
   var $129=HEAP32[((((1936)|0))>>2)];
   var $dec=((($129)-(1))|0);
   HEAP32[((((1936)|0))>>2)]=$dec;
   var $cmp628=($dec|0)==0;
   if ($cmp628) { var $sp_0_in_i = ((2360)|0);label = 137; break; } else { label = 140; break; }
  case 137: 
   var $sp_0_in_i;
   var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
   var $cmp_i=($sp_0_i|0)==0;
   var $next4_i=(($sp_0_i+8)|0);
   if ($cmp_i) { label = 138; break; } else { var $sp_0_in_i = $next4_i;label = 137; break; }
  case 138: 
   HEAP32[((((1936)|0))>>2)]=-1;
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
if (memoryInitializer) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    applyData(Module['readBinary'](memoryInitializer));
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      applyData(data);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;
var initialStackTop;
var preloadStartTime = null;
var calledMain = false;
var calledRun = false;
dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun && shouldRunNow) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}
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
  } finally {
    calledMain = true;
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
  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371
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
      new DataRequest(0, 6961, 0, 0).open('GET', '/reduce_float_kernel.cl');
    new DataRequest(6961, 14189, 0, 0).open('GET', '/reduce_float2_kernel.cl');
    new DataRequest(14189, 21875, 0, 0).open('GET', '/reduce_float4_kernel.cl');
    new DataRequest(21875, 28803, 0, 0).open('GET', '/reduce_int_kernel.cl');
    new DataRequest(28803, 35995, 0, 0).open('GET', '/reduce_int2_kernel.cl');
    new DataRequest(35995, 43642, 0, 0).open('GET', '/reduce_int4_kernel.cl');
    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;
    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = '../build/latest/reduce.data';
    var REMOTE_PACKAGE_NAME = 'reduce.data';
    var PACKAGE_UUID = '90c8ae74-e28c-4ef5-a35c-83c44175c38a';
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
          DataRequest.prototype.requests["/reduce_float_kernel.cl"].onload();
          DataRequest.prototype.requests["/reduce_float2_kernel.cl"].onload();
          DataRequest.prototype.requests["/reduce_float4_kernel.cl"].onload();
          DataRequest.prototype.requests["/reduce_int_kernel.cl"].onload();
          DataRequest.prototype.requests["/reduce_int2_kernel.cl"].onload();
          DataRequest.prototype.requests["/reduce_int4_kernel.cl"].onload();
          Module['removeRunDependency']('datafile_../build/latest/reduce.data');
    };
    Module['addRunDependency']('datafile_../build/latest/reduce.data');
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
//@ sourceMappingURL=reduce.js.map