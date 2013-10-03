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
STATICTOP = STATIC_BASE + 3808;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
/* memory initializer */ allocate([105,110,116,101,114,111,112,0,103,112,117,0,0,0,0,0,99,112,117,0,0,0,0,0,69,112,115,105,108,111,110,32,61,32,37,102,10,0,0,0,67,114,101,97,116,105,110,103,32,84,101,120,116,117,114,101,32,37,100,32,120,32,37,100,46,46,46,10,0,0,0,0,67,111,110,110,101,99,116,105,110,103,32,116,111,32,37,115,32,37,115,46,46,46,10,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,97,32,99,111,109,109,97,110,100,32,113,117,101,117,101,33,10,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,114,101,116,114,105,101,118,101,32,99,111,109,112,117,116,101,32,100,101,118,105,99,101,115,32,102,111,114,32,99,111,110,116,101,120,116,33,10,0,102,97,108,115,101,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,97,32,99,111,109,112,117,116,101,32,99,111,110,116,101,120,116,33,10,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,108,111,99,97,116,101,32,99,111,109,112,117,116,101,32,100,101,118,105,99,101,33,10,0,0,0,0,0,0,0,0,69,114,114,111,114,32,114,101,97,100,105,110,103,32,102,114,111,109,32,102,105,108,101,32,37,115,10,0,0,0,0,0,69,114,114,111,114,32,114,101,97,100,105,110,103,32,115,116,97,116,117,115,32,102,111,114,32,102,105,108,101,32,37,115,10,0,0,0,0,0,0,0,69,114,114,111,114,32,111,112,101,110,105,110,103,32,102,105,108,101,32,37,115,10,0,0,91,67,76,95,73,78,86,65,76,73,68,95,87,79,82,75,95,71,82,79,85,80,95,83,73,90,69,93,32,100,101,116,101,99,116,101,100,58,32,108,111,99,97,108,95,115,105,122,101,91,37,100,93,32,61,32,37,100,32,109,117,115,116,32,98,101,32,108,101,115,115,32,116,104,97,110,32,116,104,101,32,100,101,118,105,99,101,32,109,97,120,32,119,111,114,107,32,105,116,101,109,115,32,115,105,122,101,91,37,100,93,32,61,32,37,108,117,10,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,114,101,116,114,105,101,118,101,32,100,101,118,105,99,101,32,105,110,102,111,33,10,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,114,101,116,114,105,101,118,101,32,107,101,114,110,101,108,32,119,111,114,107,32,103,114,111,117,112,32,105,110,102,111,33,32,37,100,10,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,99,111,109,112,117,116,101,32,107,101,114,110,101,108,33,10,0,0,0,0,0,0,0,0,81,74,117,108,105,97,75,101,114,110,101,108,0,0,0,0,116,114,117,101,0,0,0,0,67,114,101,97,116,105,110,103,32,107,101,114,110,101,108,32,39,37,115,39,46,46,46,10,0,0,0,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,98,117,105,108,100,32,112,114,111,103,114,97,109,32,101,120,101,99,117,116,97,98,108,101,33,10,0,0,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,99,111,109,112,117,116,101,32,112,114,111,103,114,97,109,33,10,0,0,0,0,0,0,0,10,37,115,32,40,37,100,41,10,37,115,32,40,37,100,41,10,37,115,0,0,0,0,0,35,100,101,102,105,110,101,32,72,69,73,71,72,84,0,0,35,100,101,102,105,110,101,32,87,73,68,84,72,0,0,0,69,114,114,111,114,58,32,70,97,105,108,101,100,32,116,111,32,108,111,97,100,32,107,101,114,110,101,108,32,115,111,117,114,99,101,33,10,0,0,0,113,106,117,108,105,97,95,107,101,114,110,101,108,46,99,108,0,0,0,0,0,0,0,0,76,111,97,100,105,110,103,32,107,101,114,110,101,108,32,115,111,117,114,99,101,32,102,114,111,109,32,102,105,108,101,32,39,37,115,39,46,46,46,10,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,79,112,101,110,67,76,32,97,114,114,97,121,33,10,0,65,110,105,109,97,116,101,100,32,61,32,37,115,10,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,104,111,115,116,32,105,109,97,103,101,32,98,117,102,102,101,114,33,10,0,0,0,0,65,108,108,111,99,97,116,105,110,103,32,99,111,109,112,117,116,101,32,114,101,115,117,108,116,32,105,109,97,103,101,32,105,110,32,104,111,115,116,32,109,101,109,111,114,121,46,46,46,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,114,101,97,116,101,32,99,111,109,112,117,116,101,32,114,101,115,117,108,116,33,32,69,114,114,111,114,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,117,112,32,99,111,109,112,117,116,101,32,107,101,114,110,101,108,33,32,69,114,114,111,114,32,37,100,10,0,0,0,0,0,0,0,81,106,117,108,105,97,32,114,101,113,117,105,114,101,115,32,105,109,97,103,101,115,58,32,73,109,97,103,101,115,32,110,111,116,32,115,117,112,112,111,114,116,101,100,32,111,110,32,116,104,105,115,32,100,101,118,105,99,101,46,0,0,0,0,85,110,97,98,108,101,32,116,111,32,113,117,101,114,121,32,100,101,118,105,99,101,32,102,111,114,32,105,109,97,103,101,32,115,117,112,112,111,114,116,0,0,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,99,111,110,110,101,99,116,32,116,111,32,99,111,109,112,117,116,101,32,100,101,118,105,99,101,33,32,69,114,114,111,114,32,37,100,10,0,0,70,97,105,108,101,100,32,116,111,32,115,101,116,117,112,32,79,112,101,110,71,76,32,115,116,97,116,101,33,0,0,0,70,97,105,108,101,100,32,116,111,32,114,101,97,100,32,98,117,102,102,101,114,33,32,37,100,10,0,0,0,0,0,0,70,97,105,108,101,100,32,116,111,32,101,110,113,117,101,117,101,32,107,101,114,110,101,108,33,32,37,100,10,0,0,0,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,10,0,0,0,0,99,111,112,121,105,110,103,0,97,116,116,97,99,104,101,100,0,0,0,0,0,0,0,0,91,37,115,93,32,67,111,109,112,117,116,101,58,32,37,51,46,50,102,32,109,115,32,32,68,105,115,112,108,97,121,58,32,37,51,46,50,102,32,102,112,115,32,40,37,115,41,10,0,0,0,0,0,0,0,0,69,114,114,111,114,32,37,100,32,102,114,111,109,32,82,101,99,111,109,112,117,116,101,33,10,0,0,0,0,0,0,0,83,104,117,116,116,105,110,103,32,100,111,119,110,46,46,46,10,0,0,0,0,0,0,0,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,45,10,0,83,116,97,114,116,105,110,103,32,101,118,101,110,116,32,108,111,111,112,46,46,46,10,0,67,80,85,0,0,0,0,0,71,80,85,0,0,0,0,0,80,97,114,97,109,101,116,101,114,32,100,101,116,101,99,116,32,37,115,32,100,101,118,105,99,101,10,0,0,0,0,0,37,115,10,0,0,0,0,0,10,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,95,10,0,0,0,32,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,128,191,0,0,128,191,0,0,128,63,0,0,128,191,0,0,128,63,0,0,128,63,0,0,128,191,0,0,128,63,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,20,0,0,0,0,0,0,225,13,0,0,0,0,0,0,8,25,0,0,0,0,0,0,0,2,0,0,0,0,0,0,8,25,0,0,0,0,0,0,25,0,0,0,25,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,30,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,86,142,190,125,63,245,190,68,139,108,190,215,163,112,62,4,86,142,62,125,63,245,62,0,0,0,0,0,0,0,0,4,86,142,190,125,63,245,190,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,166,155,68,59,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,62,102,102,230,62,0,0,128,63,0,0,128,63,0,0,128,62,102,102,230,62,0,0,128,63,0,0,128,63,0,0,128,62,102,102,230,62,0,0,128,63,0,0,128,63,193,132,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
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
      },getTypeSizeBits:function (type) {  
        var _size = null;
        switch(type) {
          case webcl.UNSIGNED_INT8:
          case webcl.SIGNED_INT8:
            _size = 1;
            break;
          case webcl.UNSIGNED_INT16:
          case webcl.SIGNED_INT16:
            _size = 2;
            break;  
          default:
            _size = 4;
            break;
        }
        return _size;
      },setPointerWithArray:function (ptr,array,type) {  
        switch(type) {
          case webcl.UNSIGNED_INT8:
          case webcl.SIGNED_INT8:
            for (var i = 0; i < array.length; i++) {
              HEAP8[(((ptr)+(i))|0)]=array[i];      
            }
            break;
          case webcl.UNSIGNED_INT16:          
          case webcl.SIGNED_INT16:
            for (var i = 0; i < array.length; i++) {
              HEAP16[(((ptr)+(i*2))>>1)]=array[i];      
            }
            break;
          case webcl.UNSIGNED_INT32:
          case webcl.SIGNED_INT32:
            for (var i = 0; i < array.length; i++) {
              HEAP32[(((ptr)+(i*4))>>2)]=array[i];      
            }
            break;       
          default:
            for (var i = 0; i < array.length; i++) {
              HEAPF32[(((ptr)+(i*4))>>2)]=array[i];      
            }
            break;
        }
      },getPointerToValue:function (ptr,size,type) {  
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
      },getPointerToEmptyArray:function (size,type) {  
        var _host_ptr = null;
        switch(type) {
          case webcl.SIGNED_INT8:
            _host_ptr = new Int8Array(size);
            break;
          case webcl.SIGNED_INT16:
            _host_ptr = new Int16Array(size>>(Int16Array.BYTES_PER_ELEMENT>>1));
            break;
          case webcl.SIGNED_INT32:
            _host_ptr = new Int32Array(size>>(Int32Array.BYTES_PER_ELEMENT>>1));
            break;
          case webcl.UNSIGNED_INT8:
            _host_ptr = new Uint8Array(size);
            break;
          case webcl.UNSIGNED_INT16:
            _host_ptr = new Uint16Array(size>>(Uint16Array.BYTES_PER_ELEMENT>>1));
            break;
          case webcl.UNSIGNED_INT32:
            _host_ptr = new Uint32Array(size>>(Uint32Array.BYTES_PER_ELEMENT>>1));
            break;       
          default:
            _host_ptr = new Float32Array(size>>(Float32Array.BYTES_PER_ELEMENT>>1));
            break;
        }
        return _host_ptr;
      },getPointerToArray:function (ptr,size,type) {  
        var _host_ptr = null;
        switch(type) {
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
          default:
            _host_ptr = HEAPF32.subarray((ptr)>>2,(ptr+size)>>2)
            break;
        }
        return _host_ptr;
      },getPointerToArrayBuffer:function (ptr,size,type) {  
        var _host_ptr = new ArrayBuffer(size);
        switch(type) {
          case webcl.UNSIGNED_INT8:
          case webcl.SIGNED_INT8:
            for (var i = 0; i < size; i++) {
              _host_ptr[i] = HEAP8[(((ptr)+(i))|0)];      
            }
            break;
          case webcl.UNSIGNED_INT16:          
          case webcl.SIGNED_INT16:
            for (var i = 0; i < size>>1; i++) {
              _host_ptr[i] = HEAP16[(((ptr)+(i*2))>>1)];      
            }
            break;
          case webcl.UNSIGNED_INT32:
          case webcl.SIGNED_INT32:
            for (var i = 0; i < size>>2; i++) {
              _host_ptr[i] = HEAP32[(((ptr)+(i*4))>>2)];      
            }
            break;     
          default:
            for (var i = 0; i < size>>2; i++) {
              _host_ptr[i] = HEAPF32[(((ptr)+(i*4))>>2)];      
            }
            break;
        }
        return _host_ptr;
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
      }};function _webclPrintStackTrace(param_value,param_value_size) {
      var _size = HEAP32[((param_value_size)>>2)] ;
      if (_size == 0) {
        HEAP32[((param_value_size)>>2)]=CL.stack_trace.length /* Size of char stack */;
      } else {
        writeStringToMemory(CL.stack_trace, param_value);
      }
      return webcl.SUCCESS;
    }
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module.print('exit(' + status + ') called');
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
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
    }function _glutFullScreen() {
      GLUT.windowX = 0; // TODO
      GLUT.windowY = 0; // TODO
      GLUT.windowWidth  = Module['canvas'].width;
      GLUT.windowHeight = Module['canvas'].height;
      document.addEventListener('fullscreenchange', GLUT.onFullScreenEventChange, true);
      document.addEventListener('mozfullscreenchange', GLUT.onFullScreenEventChange, true);
      document.addEventListener('webkitfullscreenchange', GLUT.onFullScreenEventChange, true);
      GLUT.requestFullScreen();
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
      return Module.ctx ? 1 /* a new GLUT window ID for the created context */ : 0 /* failure */;
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
  function _glutReshapeFunc(func) {
      GLUT.reshapeFunc = func;
    }
  function _glutKeyboardFunc(func) {
      GLUT.keyboardFunc = func;
    }
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
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
  function _clReleaseKernel(kernel) {
      CL.webclBeginStackTrace("clReleaseKernel",[kernel]);
      try {
        if (kernel in CL.cl_objects) {
          CL.webclCallStackTrace(CL.cl_objects[kernel]+".release",[]);
          //CL.cl_objects[kernel].release();
          delete CL.cl_objects[kernel];
          CL.cl_objects_counter--;
          //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + kernel);
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
  function _clReleaseProgram(program) {
      CL.webclBeginStackTrace("clReleaseProgram",[program]);
      try {
        if (program in CL.cl_objects) {
          CL.webclCallStackTrace(CL.cl_objects[program]+".release",[]);
          CL.cl_objects[program].release();
          delete CL.cl_objects[program];
          CL.cl_objects_counter--;
          //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + program);
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
  function _clReleaseCommandQueue(command_queue) {
      CL.webclBeginStackTrace("clReleaseCommandQueue",[command_queue]);
      try {
        if (command_queue in CL.cl_objects) {
          CL.webclCallStackTrace(CL.cl_objects[command_queue]+".release",[]);
          //CL.cl_objects[command_queue].release();
          delete CL.cl_objects[command_queue];
          CL.cl_objects_counter--;
          //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + command_queue);
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
  function _clReleaseMemObject(memobj) {
      CL.webclBeginStackTrace("clReleaseMemObject",[memobj]);
      try {
        if (memobj in CL.cl_objects) {
          CL.webclCallStackTrace(CL.cl_objects[memobj]+".release",[]);
          //CL.cl_objects[memobj].release();
          delete CL.cl_objects[memobj];
          CL.cl_objects_counter--;
          //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + memobj);
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
  function _clReleaseContext(context) {
      CL.webclBeginStackTrace("clReleaseContext",[context]);
      try {
        if (context in CL.cl_objects) {
          CL.webclCallStackTrace(CL.cl_objects[context]+".release",[]);
          //CL.cl_objects[context].release();
          delete CL.cl_objects[context];
          CL.cl_objects_counter--;
          //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + context);
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
  function _glViewport(x0, x1, x2, x3) { Module.ctx.viewport(x0, x1, x2, x3) }
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
  var GLImmediateSetup={};function _glMatrixMode(mode) {
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
  function _glLoadIdentity() {
      GL.immediate.matricesModified = true;
      GL.immediate.matrix.lib.mat4.identity(GL.immediate.matrix[GL.immediate.currentMatrix]);
    }
  function _glClear(x0) { Module.ctx.clear(x0) }
  function _glutSwapBuffers() {}
  function _glClearColor(x0, x1, x2, x3) { Module.ctx.clearColor(x0, x1, x2, x3) }
  function _glFinish() { Module.ctx.finish() }
  function _glBindTexture(target, texture) {
      Module.ctx.bindTexture(target, texture ? GL.textures[texture] : null);
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
  function _glDisableClientState(cap) {
      _glEnableClientState(cap, 1);
    }
  function _glBegin(mode) {
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
    }function _glColor3f(r, g, b) {
      _glColor4f(r, g, b, 1);
    }
  function _glTexCoord2i(u, v) {
      assert(GL.immediate.mode >= 0); // must be in begin/end
      GL.immediate.vertexData[GL.immediate.vertexCounter++] = u;
      GL.immediate.vertexData[GL.immediate.vertexCounter++] = v;
      GL.immediate.addRendererComponent(GL.immediate.TEXTURE0, 2, Module.ctx.FLOAT);
    }var _glTexCoord2f=_glTexCoord2i;
  function _glVertex3f(x, y, z) {
      assert(GL.immediate.mode >= 0); // must be in begin/end
      GL.immediate.vertexData[GL.immediate.vertexCounter++] = x;
      GL.immediate.vertexData[GL.immediate.vertexCounter++] = y;
      GL.immediate.vertexData[GL.immediate.vertexCounter++] = z || 0;
      assert(GL.immediate.vertexCounter << 2 < GL.MAX_TEMP_BUFFER_SIZE);
      GL.immediate.addRendererComponent(GL.immediate.VERTEX, 3, Module.ctx.FLOAT);
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
  function _clSetKernelArg(kernel,arg_index,arg_size,arg_value) {
      CL.webclBeginStackTrace("clSetKernelArg",[kernel,arg_index,arg_size,arg_value]);
      try {
        if (kernel in CL.cl_objects) {
          if (CL.cl_objects[kernel].sig.length > arg_index) {
            var _sig = CL.cl_objects[kernel].sig[arg_index];
            if (_sig == webcl.LOCAL) {
              var _array = new Uint32Array([arg_size]);
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
                var _array = CL.getPointerToArray(arg_value,arg_size,_sig);
                CL.webclCallStackTrace(CL.cl_objects[kernel]+".setArg",[arg_index,_array]);
                // WD --> 
                //CL.cl_objects[kernel].setArg(arg_index,_array);
                // WebKit -->              
                var _size = (arg_size>>(CL.getTypeSizeBits(_sig)>>1));
                if ( _size > 1) {
                  var _values = new Array(_size);
                  for (var i = 0; i < _values.length; i++) {
                    if (_sig == webcl.FLOAT) {
                      _values[i] = HEAPF32[(((arg_value)+(i*4))>>2)];   
                    } else {
                      _values[i] = HEAP32[(((arg_value)+(i*4))>>2)];
                    }
                  }
                  var _type;
                  if (_size == 2) {
                    _type = WebCLKernelArgumentTypes.VEC2;
                  } else if (_size == 3) {
                    _type = WebCLKernelArgumentTypes.VEC3;
                  } else if (_size == 4) {
                    _type = WebCLKernelArgumentTypes.VEC4;
                  }
                  if (_sig == webcl.FLOAT) {
                    CL.cl_objects[kernel].setArg(arg_index,_values,WebCLKernelArgumentTypes.FLOAT | _type)
                  } else {
                    CL.cl_objects[kernel].setArg(arg_index,_values,WebCLKernelArgumentTypes.INT | _type)
                  }  
                } else {
                  if (_sig == webcl.FLOAT) {
                    var _value = HEAPF32[((arg_value)>>2)];
                    CL.cl_objects[kernel].setArg(arg_index,_value,WebCLKernelArgumentTypes.FLOAT)
                  } else {
                    var _value = HEAP32[((arg_value)>>2)];
                    CL.cl_objects[kernel].setArg(arg_index,_value,WebCLKernelArgumentTypes.INT)
                  }                
                }
              }
            }
          } else {
            CL.webclEndStackTrace([webcl.INVALID_KERNEL],CL.cl_objects[kernel]+" doesn't contains sig array","");
            return webcl.INVALID_KERNEL;          
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
  function _clEnqueueReadBuffer(command_queue,buffer,blocking_read,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
      CL.webclBeginStackTrace("clEnqueueReadBuffer",[command_queue,buffer,blocking_read,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event]);
      if (CL.cl_pn_type == 0) console.info("/!\\ clEnqueueReadBuffer : you don't call clSetTypePointer for ptr parameter");
      try { 
        if (command_queue in CL.cl_objects) {
          if (buffer in CL.cl_objects) {
            var _host_ptr = CL.getPointerToEmptyArray(cb,CL.cl_pn_type);
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
            if (ptr)
              CL.setPointerWithArray(ptr,_host_ptr,CL.cl_pn_type);
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
  function _rand_r(seed) { // XXX ignores the seed
      return Math.floor(Math.random()*0x80000000);
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
          CL.cl_pn_type = 0;
          CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
          return 0; 
        }
        var _host_ptr = null;
        if (flags_i64_1 & (1 << 4) /* CL_MEM_ALLOC_HOST_PTR */) {
          _host_ptr = new ArrayBuffer(size);
        } else if (host_ptr != 0 && (flags_i64_1 & (1 << 5) /* CL_MEM_COPY_HOST_PTR */)) {
          _host_ptr = CL.getPointerToArrayBuffer(host_ptr,size,CL.cl_pn_type);
        } else if (flags_i64_1 & ~_flags) {
          // /!\ For the CL_MEM_USE_HOST_PTR (1 << 3)... 
          // may be i can do fake it using the same behavior than CL_MEM_COPY_HOST_PTR --> @steven What do you thing ??
          console.error("clCreateBuffer : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
        }
        CL.webclCallStackTrace( CL.cl_objects[context]+".createBuffer",[_flags,size,_host_ptr]);
        if (_host_ptr != null) {
          _buffer = CL.cl_objects[context].createBuffer(_flags,size,_host_ptr);
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
      try { 
        if (program in CL.cl_objects) {
          if (device in CL.cl_objects) {
            CL.webclCallStackTrace(""+CL.cl_objects[program]+".getBuildInfo",[device,param_name]);
            var _info = CL.cl_objects[program].getBuildInfo(CL.cl_objects[device], param_name);
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
  function _clGetKernelWorkGroupInfo(kernel,device,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetKernelWorkGroupInfo",[kernel,device,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (kernel in CL.cl_objects) {
          if (device in CL.cl_objects) {
            CL.webclCallStackTrace(""+CL.cl_objects[kernel]+".getWorkGroupInfo",[device,param_name]);
            var _info = CL.cl_objects[kernel].getWorkGroupInfo(CL.cl_objects[device], param_name);
            if(typeof(_info) == "number") {
              if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
            } else if (_info instanceof Int32Array) {
              for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
                if (param_value != 0) HEAP32[(((param_value)+(i*4))>>2)]=_info[i];
              }
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=_info.length * 4;
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
    }function _fstat(fildes, buf) {
      // int fstat(int fildes, struct stat *buf);
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/fstat.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      return _stat(stream.path, buf);
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
            HEAP32[((num_devices)>>2)]=_devices.length /* Num of device */;
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
  function _clGetContextInfo(context,param_name,param_value_size,param_value,param_value_size_ret) {
      CL.webclBeginStackTrace("clGetContextInfo",[context,param_name,param_value_size,param_value,param_value_size_ret]);
      try { 
        if (context in CL.cl_objects) {
          CL.webclCallStackTrace(""+CL.cl_objects[context]+".getInfo",[param_name]);
          var _info = CL.cl_objects[context].getInfo(param_name);
          if(typeof(_info) == "number") {
            if (param_value != 0) HEAP32[((param_value)>>2)]=_info;
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
          } else if(typeof(_info) == "boolean") {
            if (param_value != 0) (_info == true) ? HEAP32[((param_value)>>2)]=1 : HEAP32[((param_value)>>2)]=0;
            if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
          } else if(typeof(_info) == "object") {
            if ( (_info instanceof WebCLPlatform) || (_info instanceof WebCLContextProperties)) {
              var _id = CL.udid(_info);
              if (param_value != 0) HEAP32[((param_value)>>2)]=_id;
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=4;
            } else if (_info instanceof Array) {
              for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
                var _id = CL.udid(_info[i]);
                if (param_value != 0) HEAP32[(((param_value)+(i*4))>>2)]=_id;
              }
              if (param_value_size_ret != 0) HEAP32[((param_value_size_ret)>>2)]=_info.length*4;
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
        } else {
          CL.webclEndStackTrace([webcl.INVALID_CONTEXT],"context are NULL","");
          return webcl.INVALID_CONTEXT;
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
  function _glVertexPointer(size, type, stride, pointer) {
      GL.immediate.setClientAttribute(GL.immediate.VERTEX, size, type, stride, pointer);
    }
  function _glClientActiveTexture(texture) {
      GL.immediate.clientActiveTexture = texture - 0x84C0; // GL_TEXTURE0
    }
  function _glTexCoordPointer(size, type, stride, pointer) {
      GL.immediate.setClientAttribute(GL.immediate.TEXTURE0 + GL.immediate.clientActiveTexture, size, type, stride, pointer);
    }
  function _glDeleteTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = HEAP32[(((textures)+(i*4))>>2)];
        var texture = GL.textures[id];
        Module.ctx.deleteTexture(texture);
        texture.name = 0;
        GL.textures[id] = null;
      }
    }
  function _glGenTextures(n, textures) {
      for (var i = 0; i < n; i++) {
        var id = GL.getNewId(GL.textures);
        var texture = Module.ctx.createTexture();
        texture.name = id;
        GL.textures[id] = texture;
        HEAP32[(((textures)+(i*4))>>2)]=id;
      }
    }
  function _glTexParameteri(x0, x1, x2) { Module.ctx.texParameteri(x0, x1, x2) }
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
GL.immediate.setupFuncs(); Browser.moduleContextCreatedCallbacks.push(function() { GL.immediate.init() });
GLEmulation.init();
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var FUNCTION_TABLE = [0,0,_Shutdown,0,_Display,0,_Idle,0,_Keyboard,0,_Reshape,0];
// EMSCRIPTEN_START_FUNCS
function _print_stack() {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $size=sp;
 var $webcl_stack;
 var $call=_printf(((1816)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
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
 var $call4=_printf(((1808)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$4,tempVarArgs)); STACKTOP=tempVarArgs;
 var $call5=_printf(((1488)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
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
function _Keyboard($key, $x, $y) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $key_addr;
   var $x_addr;
   var $y_addr;
   var $fStepSize;
   $key_addr=$key;
   $x_addr=$x;
   $y_addr=$y;
   $fStepSize=0.05000000074505806;
   var $0=$key_addr;
   var $conv=($0&255);
   switch(($conv|0)) {
   case 119:{
    label = 12; break;
   }
   case 120:{
    label = 13; break;
   }
   case 113:{
    label = 14; break;
   }
   case 122:{
    label = 15; break;
   }
   case 97:{
    label = 16; break;
   }
   case 100:{
    label = 17; break;
   }
   case 101:{
    label = 18; break;
   }
   case 99:{
    label = 19; break;
   }
   case 27:{
    label = 2; break;
   }
   case 102:{
    label = 20; break;
   }
   case 32:{
    label = 3; break;
   }
   case 105:{
    label = 4; break;
   }
   case 115:{
    label = 5; break;
   }
   case 43: case 61:{
    label = 6; break;
   }
   case 45:{
    label = 9; break;
   }
   default: {
   label = 21; break;
   }
   } break; 
  case 2: 
   _exit(0);
   throw "Reached an unreachable!";
  case 3: 
   var $1=HEAP32[((3808)>>2)];
   var $tobool=($1|0)!=0;
   var $lnot=$tobool ^ 1;
   var $lnot_ext=($lnot&1);
   HEAP32[((3808)>>2)]=$lnot_ext;
   var $2=HEAP32[((3808)>>2)];
   var $tobool2=($2|0)!=0;
   var $cond=$tobool2 ? (((688)|0)) : (((208)|0));
   var $call=_printf(((1024)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$cond,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[((1992)>>2)]=1;
   label = 21; break;
  case 4: 
   var $3=HEAP32[((1992)>>2)];
   var $cmp=($3>>>0) > 0;
   var $cond5=$cmp ? 0 : 1;
   HEAP32[((1992)>>2)]=$cond5;
   label = 21; break;
  case 5: 
   var $4=HEAP32[((1984)>>2)];
   var $cmp7=($4>>>0) > 0;
   var $cond9=$cmp7 ? 0 : 1;
   HEAP32[((1984)>>2)]=$cond9;
   label = 21; break;
  case 6: 
   var $5=HEAPF32[((2072)>>2)];
   var $cmp11=$5 >= (0.0020000000949949026);
   if ($cmp11) { label = 7; break; } else { label = 8; break; }
  case 7: 
   var $6=HEAPF32[((2072)>>2)];
   var $mul=($6)*((0.9523810148239136));
   HEAPF32[((2072)>>2)]=$mul;
   label = 8; break;
  case 8: 
   var $7=HEAPF32[((2072)>>2)];
   var $conv13=$7;
   var $call14=_printf(((32)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempVarArgs)>>3)]=$conv13,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[((1992)>>2)]=1;
   label = 21; break;
  case 9: 
   var $8=HEAPF32[((2072)>>2)];
   var $cmp16=$8 < (0.009999999776482582);
   if ($cmp16) { label = 10; break; } else { label = 11; break; }
  case 10: 
   var $9=HEAPF32[((2072)>>2)];
   var $mul19=($9)*((1.0499999523162842));
   HEAPF32[((2072)>>2)]=$mul19;
   label = 11; break;
  case 11: 
   var $10=HEAPF32[((2072)>>2)];
   var $conv21=$10;
   var $call22=_printf(((32)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAPF64[((tempVarArgs)>>3)]=$conv21,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[((1992)>>2)]=1;
   label = 21; break;
  case 12: 
   var $11=HEAPF32[((((2016)|0))>>2)];
   var $add=($11)+((0.05000000074505806));
   HEAPF32[((((2016)|0))>>2)]=$add;
   label = 21; break;
  case 13: 
   var $12=HEAPF32[((((2016)|0))>>2)];
   var $sub=($12)-((0.05000000074505806));
   HEAPF32[((((2016)|0))>>2)]=$sub;
   label = 21; break;
  case 14: 
   var $13=HEAPF32[((((2020)|0))>>2)];
   var $add26=($13)+((0.05000000074505806));
   HEAPF32[((((2020)|0))>>2)]=$add26;
   label = 21; break;
  case 15: 
   var $14=HEAPF32[((((2020)|0))>>2)];
   var $sub28=($14)-((0.05000000074505806));
   HEAPF32[((((2020)|0))>>2)]=$sub28;
   label = 21; break;
  case 16: 
   var $15=HEAPF32[((((2024)|0))>>2)];
   var $add30=($15)+((0.05000000074505806));
   HEAPF32[((((2024)|0))>>2)]=$add30;
   label = 21; break;
  case 17: 
   var $16=HEAPF32[((((2024)|0))>>2)];
   var $sub32=($16)-((0.05000000074505806));
   HEAPF32[((((2024)|0))>>2)]=$sub32;
   label = 21; break;
  case 18: 
   var $17=HEAPF32[((((2028)|0))>>2)];
   var $add34=($17)+((0.05000000074505806));
   HEAPF32[((((2028)|0))>>2)]=$add34;
   label = 21; break;
  case 19: 
   var $18=HEAPF32[((((2028)|0))>>2)];
   var $sub36=($18)-((0.05000000074505806));
   HEAPF32[((((2028)|0))>>2)]=$sub36;
   label = 21; break;
  case 20: 
   _glutFullScreen();
   label = 21; break;
  case 21: 
   HEAP32[((1904)>>2)]=1;
   _glutPostRedisplay();
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _Idle() {
 var label = 0;
 _glutPostRedisplay();
 return;
}
function _main($argc, $argv) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $retval;
   var $argc_addr=sp;
   var $argv_addr;
   var $i;
   var $use_gpu;
   $retval=0;
   HEAP32[(($argc_addr)>>2)]=$argc;
   $argv_addr=$argv;
   $use_gpu=1;
   $i=0;
   label = 2; break;
  case 2: 
   var $0=$i;
   var $1=HEAP32[(($argc_addr)>>2)];
   var $cmp=($0|0) < ($1|0);
   if ($cmp) { label = 3; break; } else { var $3 = 0;label = 4; break; }
  case 3: 
   var $2=$argv_addr;
   var $tobool=($2|0)!=0;
   var $3 = $tobool;label = 4; break;
  case 4: 
   var $3;
   if ($3) { label = 5; break; } else { label = 17; break; }
  case 5: 
   var $4=$i;
   var $5=$argv_addr;
   var $arrayidx=(($5+($4<<2))|0);
   var $6=HEAP32[(($arrayidx)>>2)];
   var $tobool1=($6|0)!=0;
   if ($tobool1) { label = 7; break; } else { label = 6; break; }
  case 6: 
   label = 16; break;
  case 7: 
   var $7=$i;
   var $8=$argv_addr;
   var $arrayidx2=(($8+($7<<2))|0);
   var $9=HEAP32[(($arrayidx2)>>2)];
   var $call=_strstr($9, ((24)|0));
   var $tobool3=($call|0)!=0;
   if ($tobool3) { label = 8; break; } else { label = 9; break; }
  case 8: 
   $use_gpu=0;
   label = 15; break;
  case 9: 
   var $10=$i;
   var $11=$argv_addr;
   var $arrayidx5=(($11+($10<<2))|0);
   var $12=HEAP32[(($arrayidx5)>>2)];
   var $call6=_strstr($12, ((16)|0));
   var $tobool7=($call6|0)!=0;
   if ($tobool7) { label = 10; break; } else { label = 11; break; }
  case 10: 
   $use_gpu=1;
   label = 14; break;
  case 11: 
   var $13=$i;
   var $14=$argv_addr;
   var $arrayidx10=(($14+($13<<2))|0);
   var $15=HEAP32[(($arrayidx10)>>2)];
   var $call11=_strstr($15, ((8)|0));
   var $tobool12=($call11|0)!=0;
   if ($tobool12) { label = 12; break; } else { label = 13; break; }
  case 12: 
   HEAP32[((2648)>>2)]=1;
   label = 13; break;
  case 13: 
   label = 14; break;
  case 14: 
   label = 15; break;
  case 15: 
   label = 16; break;
  case 16: 
   var $16=$i;
   var $inc=((($16)+(1))|0);
   $i=$inc;
   label = 2; break;
  case 17: 
   var $17=$use_gpu;
   var $cmp17=($17|0)==1;
   var $cond=$cmp17 ? (((1768)|0)) : (((1760)|0));
   var $call18=_printf(((1776)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$cond,tempVarArgs)); STACKTOP=tempVarArgs;
   var $18=$argv_addr;
   _glutInit($argc_addr, $18);
   _glutInitDisplayMode(18);
   var $19=HEAP32[((1864)>>2)];
   var $20=HEAP32[((2064)>>2)];
   _glutInitWindowSize($19, $20);
   _glutInitWindowPosition(100, 100);
   var $21=$argv_addr;
   var $arrayidx19=(($21)|0);
   var $22=HEAP32[(($arrayidx19)>>2)];
   var $call20=_glutCreateWindow($22);
   var $23=$use_gpu;
   var $call21=_Initialize($23);
   var $cmp22=($call21|0)==0;
   if ($cmp22) { label = 18; break; } else { label = 19; break; }
  case 18: 
   _glutDisplayFunc(4);
   _glutIdleFunc(6);
   _glutReshapeFunc(10);
   _glutKeyboardFunc(8);
   var $call24=_atexit(2);
   var $call25=_printf(((1736)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   _glutMainLoop();
   label = 19; break;
  case 19: 
   STACKTOP = sp;
   return 0;
  default: assert(0, "bad label: " + label);
 }
}
Module["_main"] = _main;
function _Initialize($gpu) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $retval;
   var $gpu_addr;
   var $err;
   var $image_support=sp;
   $gpu_addr=$gpu;
   var $call=_SetupGraphics();
   $err=$call;
   var $0=$err;
   var $cmp=($0|0)!=0;
   if ($cmp) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $call1=_printf(((1392)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $1=$err;
   var $call2=_end($1);
   var $2=$err;
   _exit($2);
   throw "Reached an unreachable!";
  case 3: 
   var $3=$gpu_addr;
   var $call3=_SetupComputeDevices($3);
   $err=$call3;
   var $4=$err;
   var $cmp4=($4|0)!=0;
   if ($cmp4) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $5=$err;
   var $call6=_printf(((1344)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$5,tempVarArgs)); STACKTOP=tempVarArgs;
   var $6=$err;
   var $call7=_end($6);
   var $7=$err;
   _exit($7);
   throw "Reached an unreachable!";
  case 5: 
   var $8=HEAP32[((3784)>>2)];
   var $9=$image_support;
   var $call9=_clGetDeviceInfo($8, 4118, 4, $9, 0);
   $err=$call9;
   var $10=$err;
   var $cmp10=($10|0)!=0;
   if ($cmp10) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $call12=_printf(((1296)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $11=$err;
   var $call13=_end($11);
   var $12=$err;
   _exit($12);
   throw "Reached an unreachable!";
  case 7: 
   var $13=HEAP32[(($image_support)>>2)];
   var $cmp15=($13|0)==0;
   if ($cmp15) { label = 8; break; } else { label = 9; break; }
  case 8: 
   var $call17=_printf(((1232)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=-10;
   label = 14; break;
  case 9: 
   var $call19=_SetupComputeKernel();
   $err=$call19;
   var $14=$err;
   var $cmp20=($14|0)!=0;
   if ($cmp20) { label = 10; break; } else { label = 11; break; }
  case 10: 
   var $15=$err;
   var $call22=_printf(((1184)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$15,tempVarArgs)); STACKTOP=tempVarArgs;
   var $16=$err;
   var $call23=_end($16);
   var $17=$err;
   _exit($17);
   throw "Reached an unreachable!";
  case 11: 
   var $call25=_CreateComputeResult();
   $err=$call25;
   var $18=$err;
   var $cmp26=($18|0)!=0;
   if ($cmp26) { label = 12; break; } else { label = 13; break; }
  case 12: 
   var $19=$err;
   var $call28=_printf(((1136)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$19,tempVarArgs)); STACKTOP=tempVarArgs;
   var $20=$err;
   var $call29=_end($20);
   var $21=$err;
   _exit($21);
   throw "Reached an unreachable!";
  case 13: 
   _RandomColor(((2120)|0));
   _RandomColor(((2104)|0));
   _RandomColor(((2088)|0));
   $retval=0;
   label = 14; break;
  case 14: 
   var $22=$retval;
   STACKTOP = sp;
   return $22;
  default: assert(0, "bad label: " + label);
 }
}
function _Display() {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $uiStartTime=sp;
   var $err;
   var $uiEndTime=(sp)+(8);
   var $0=HEAP32[((3736)>>2)];
   var $inc=((($0)+(1))|0);
   HEAP32[((3736)>>2)]=$inc;
   var $call$0=_GetCurrentTime();
   var $call$1=tempRet0;
   var $st$0$0=(($uiStartTime)|0);
   HEAP32[(($st$0$0)>>2)]=$call$0;
   var $st$1$1=(($uiStartTime+4)|0);
   HEAP32[(($st$1$1)>>2)]=$call$1;
   _glClearColor(0, 0, 0, 0);
   _glClear(16384);
   var $1=HEAP32[((3808)>>2)];
   var $tobool=($1|0)!=0;
   if ($tobool) { label = 2; break; } else { label = 3; break; }
  case 2: 
   _UpdateMu(2008, ((2048)|0), ((2032)|0));
   var $2=HEAPF32[((2008)>>2)];
   _Interpolate(((2016)|0), $2, ((2048)|0), ((2032)|0));
   _UpdateColor(2080, ((2120)|0), ((2104)|0));
   var $3=HEAPF32[((2080)>>2)];
   _Interpolate(((2088)|0), $3, ((2120)|0), ((2104)|0));
   label = 3; break;
  case 3: 
   var $call1=_Recompute();
   $err=$call1;
   var $4=$err;
   var $cmp=($4|0)!=0;
   if ($cmp) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $5=$err;
   var $call3=_printf(((1608)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$5,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call4=_end(1);
   _exit(1);
   throw "Reached an unreachable!";
  case 5: 
   var $6=HEAP32[((3728)>>2)];
   _RenderTexture($6);
   _ReportInfo();
   _glFinish();
   var $call6$0=_GetCurrentTime();
   var $call6$1=tempRet0;
   var $st$2$0=(($uiEndTime)|0);
   HEAP32[(($st$2$0)>>2)]=$call6$0;
   var $st$3$1=(($uiEndTime+4)|0);
   HEAP32[(($st$3$1)>>2)]=$call6$1;
   var $ld$4$0=(($uiStartTime)|0);
   var $7$0=HEAP32[(($ld$4$0)>>2)];
   var $ld$5$1=(($uiStartTime+4)|0);
   var $7$1=HEAP32[(($ld$5$1)>>2)];
   var $ld$6$0=(($uiEndTime)|0);
   var $8$0=HEAP32[(($ld$6$0)>>2)];
   var $ld$7$1=(($uiEndTime+4)|0);
   var $8$1=HEAP32[(($ld$7$1)>>2)];
   _ReportStats($7$0, $7$1, $8$0, $8$1);
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _Reshape($w, $h) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $w_addr;
   var $h_addr;
   $w_addr=$w;
   $h_addr=$h;
   var $0=$w_addr;
   var $1=$h_addr;
   _glViewport(0, 0, $0, $1);
   _glMatrixMode(5888);
   _glLoadIdentity();
   _glMatrixMode(5889);
   _glLoadIdentity();
   _glClear(16384);
   var $2=$w_addr;
   var $3=HEAP32[((1864)>>2)];
   var $mul=($3<<1);
   var $cmp=($2|0) > ($mul|0);
   if ($cmp) { label = 3; break; } else { label = 2; break; }
  case 2: 
   var $4=$h_addr;
   var $5=HEAP32[((2064)>>2)];
   var $mul1=($5<<1);
   var $cmp2=($4|0) > ($mul1|0);
   if ($cmp2) { label = 3; break; } else { label = 6; break; }
  case 3: 
   var $6=$w_addr;
   HEAP32[((1864)>>2)]=$6;
   var $7=$h_addr;
   HEAP32[((2064)>>2)]=$7;
   _Cleanup();
   var $ld$0$0=((3776)|0);
   var $8$0=HEAP32[(($ld$0$0)>>2)];
   var $ld$1$1=((3780)|0);
   var $8$1=HEAP32[(($ld$1$1)>>2)];
   var $$etemp$2$0=4;
   var $$etemp$2$1=0;
   var $cmp3=(($8$0|0) == ($$etemp$2$0|0)) & (($8$1|0) == ($$etemp$2$1|0));
   var $conv=($cmp3&1);
   var $call=_Initialize($conv);
   var $cmp4=($call|0)!=0;
   if ($cmp4) { label = 4; break; } else { label = 5; break; }
  case 4: 
   _Shutdown();
   label = 5; break;
  case 5: 
   label = 6; break;
  case 6: 
   var $9=$w_addr;
   HEAP32[((1864)>>2)]=$9;
   var $10=$h_addr;
   HEAP32[((2064)>>2)]=$10;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _Shutdown() {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $call=_printf(((1664)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call1=_printf(((1640)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   _Cleanup();
   var $call2=_end(0);
   _exit(0);
   throw "Reached an unreachable!";
  case 2: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _Cleanup() {
 var label = 0;
 var $0=HEAP32[((3800)>>2)];
 var $call=_clFinish($0);
 var $1=HEAP32[((3760)>>2)];
 var $call1=_clReleaseKernel($1);
 var $2=HEAP32[((3752)>>2)];
 var $call2=_clReleaseProgram($2);
 var $3=HEAP32[((3800)>>2)];
 var $call3=_clReleaseCommandQueue($3);
 var $4=HEAP32[((3744)>>2)];
 var $call4=_clReleaseMemObject($4);
 var $5=HEAP32[((3792)>>2)];
 var $call5=_clReleaseContext($5);
 HEAP32[((3800)>>2)]=0;
 HEAP32[((3760)>>2)]=0;
 HEAP32[((3752)>>2)]=0;
 HEAP32[((3744)>>2)]=0;
 HEAP32[((3768)>>2)]=0;
 HEAP32[((3792)>>2)]=0;
 return;
}
function _UpdateMu($t, $a, $b) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $t_addr;
   var $a_addr;
   var $b_addr;
   var $seed=sp;
   $t_addr=$t;
   $a_addr=$a;
   $b_addr=$b;
   var $0=$t_addr;
   var $1=HEAPF32[(($0)>>2)];
   var $add=($1)+((0.009999999776482582));
   HEAPF32[(($0)>>2)]=$add;
   var $call$0=_GetCurrentTime();
   var $call$1=tempRet0;
   var $conv$0=$call$0;
   var $conv=$conv$0;
   HEAP32[(($seed)>>2)]=$conv;
   var $2=$t_addr;
   var $3=HEAPF32[(($2)>>2)];
   var $cmp=$3 >= 1;
   if ($cmp) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $4=$t_addr;
   HEAPF32[(($4)>>2)]=0;
   var $5=$b_addr;
   var $arrayidx=(($5)|0);
   var $6=HEAPF32[(($arrayidx)>>2)];
   var $7=$a_addr;
   var $arrayidx2=(($7)|0);
   HEAPF32[(($arrayidx2)>>2)]=$6;
   var $8=$b_addr;
   var $arrayidx3=(($8+4)|0);
   var $9=HEAPF32[(($arrayidx3)>>2)];
   var $10=$a_addr;
   var $arrayidx4=(($10+4)|0);
   HEAPF32[(($arrayidx4)>>2)]=$9;
   var $11=$b_addr;
   var $arrayidx5=(($11+8)|0);
   var $12=HEAPF32[(($arrayidx5)>>2)];
   var $13=$a_addr;
   var $arrayidx6=(($13+8)|0);
   HEAPF32[(($arrayidx6)>>2)]=$12;
   var $14=$b_addr;
   var $arrayidx7=(($14+12)|0);
   var $15=HEAPF32[(($arrayidx7)>>2)];
   var $16=$a_addr;
   var $arrayidx8=(($16+12)|0);
   HEAPF32[(($arrayidx8)>>2)]=$15;
   var $call9=_rand_r($seed);
   var $conv10=($call9|0);
   var $mul=($conv10)*(2);
   var $div=($mul)/(2147483648);
   var $sub=($div)-(1);
   var $17=$b_addr;
   var $arrayidx11=(($17)|0);
   HEAPF32[(($arrayidx11)>>2)]=$sub;
   var $call12=_rand_r($seed);
   var $conv13=($call12|0);
   var $mul14=($conv13)*(2);
   var $div15=($mul14)/(2147483648);
   var $sub16=($div15)-(1);
   var $18=$b_addr;
   var $arrayidx17=(($18+4)|0);
   HEAPF32[(($arrayidx17)>>2)]=$sub16;
   var $call18=_rand_r($seed);
   var $conv19=($call18|0);
   var $mul20=($conv19)*(2);
   var $div21=($mul20)/(2147483648);
   var $sub22=($div21)-(1);
   var $19=$b_addr;
   var $arrayidx23=(($19+8)|0);
   HEAPF32[(($arrayidx23)>>2)]=$sub22;
   var $call24=_rand_r($seed);
   var $conv25=($call24|0);
   var $mul26=($conv25)*(2);
   var $div27=($mul26)/(2147483648);
   var $sub28=($div27)-(1);
   var $20=$b_addr;
   var $arrayidx29=(($20+12)|0);
   HEAPF32[(($arrayidx29)>>2)]=$sub28;
   label = 3; break;
  case 3: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _Interpolate($m, $t, $a, $b) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $m_addr;
   var $t_addr;
   var $a_addr;
   var $b_addr;
   var $i;
   $m_addr=$m;
   $t_addr=$t;
   $a_addr=$a;
   $b_addr=$b;
   $i=0;
   label = 2; break;
  case 2: 
   var $0=$i;
   var $cmp=($0|0) < 4;
   if ($cmp) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $1=$t_addr;
   var $sub=(1)-($1);
   var $2=$i;
   var $3=$a_addr;
   var $arrayidx=(($3+($2<<2))|0);
   var $4=HEAPF32[(($arrayidx)>>2)];
   var $mul=($sub)*($4);
   var $5=$t_addr;
   var $6=$i;
   var $7=$b_addr;
   var $arrayidx1=(($7+($6<<2))|0);
   var $8=HEAPF32[(($arrayidx1)>>2)];
   var $mul2=($5)*($8);
   var $add=($mul)+($mul2);
   var $9=$i;
   var $10=$m_addr;
   var $arrayidx3=(($10+($9<<2))|0);
   HEAPF32[(($arrayidx3)>>2)]=$add;
   label = 4; break;
  case 4: 
   var $11=$i;
   var $inc=((($11)+(1))|0);
   $i=$inc;
   label = 2; break;
  case 5: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _UpdateColor($t, $a, $b) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $t_addr;
   var $a_addr;
   var $b_addr;
   $t_addr=$t;
   $a_addr=$a;
   $b_addr=$b;
   var $0=$t_addr;
   var $1=HEAPF32[(($0)>>2)];
   var $add=($1)+((0.009999999776482582));
   HEAPF32[(($0)>>2)]=$add;
   var $2=$t_addr;
   var $3=HEAPF32[(($2)>>2)];
   var $cmp=$3 >= 1;
   if ($cmp) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $4=$t_addr;
   HEAPF32[(($4)>>2)]=0;
   var $5=$b_addr;
   var $arrayidx=(($5)|0);
   var $6=HEAPF32[(($arrayidx)>>2)];
   var $7=$a_addr;
   var $arrayidx1=(($7)|0);
   HEAPF32[(($arrayidx1)>>2)]=$6;
   var $8=$b_addr;
   var $arrayidx2=(($8+4)|0);
   var $9=HEAPF32[(($arrayidx2)>>2)];
   var $10=$a_addr;
   var $arrayidx3=(($10+4)|0);
   HEAPF32[(($arrayidx3)>>2)]=$9;
   var $11=$b_addr;
   var $arrayidx4=(($11+8)|0);
   var $12=HEAPF32[(($arrayidx4)>>2)];
   var $13=$a_addr;
   var $arrayidx5=(($13+8)|0);
   HEAPF32[(($arrayidx5)>>2)]=$12;
   var $14=$b_addr;
   var $arrayidx6=(($14+12)|0);
   var $15=HEAPF32[(($arrayidx6)>>2)];
   var $16=$a_addr;
   var $arrayidx7=(($16+12)|0);
   HEAPF32[(($arrayidx7)>>2)]=$15;
   var $17=$b_addr;
   _RandomColor($17);
   label = 3; break;
  case 3: 
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _Recompute() {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 96)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $retval;
   var $values=sp;
   var $sizes=(sp)+(40);
   var $global=(sp)+(80);
   var $local=(sp)+(88);
   var $err;
   var $v;
   var $s;
   var $a;
   var $size_x;
   var $size_y;
   var $0=HEAP32[((3760)>>2)];
   var $tobool=($0|0)!=0;
   if ($tobool) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $1=HEAP32[((3744)>>2)];
   var $tobool1=($1|0)!=0;
   if ($tobool1) { label = 4; break; } else { label = 3; break; }
  case 3: 
   $retval=0;
   label = 18; break;
  case 4: 
   $err=0;
   $v=0;
   $s=0;
   $a=0;
   var $2=$v;
   var $inc=((($2)+(1))|0);
   $v=$inc;
   var $arrayidx=(($values+($2<<2))|0);
   HEAP32[(($arrayidx)>>2)]=3744;
   var $3=$v;
   var $inc2=((($3)+(1))|0);
   $v=$inc2;
   var $arrayidx3=(($values+($3<<2))|0);
   HEAP32[(($arrayidx3)>>2)]=2016;
   var $4=$v;
   var $inc4=((($4)+(1))|0);
   $v=$inc4;
   var $arrayidx5=(($values+($4<<2))|0);
   HEAP32[(($arrayidx5)>>2)]=2088;
   var $5=$v;
   var $inc6=((($5)+(1))|0);
   $v=$inc6;
   var $arrayidx7=(($values+($5<<2))|0);
   HEAP32[(($arrayidx7)>>2)]=2072;
   var $6=$s;
   var $inc8=((($6)+(1))|0);
   $s=$inc8;
   var $arrayidx9=(($sizes+($6<<2))|0);
   HEAP32[(($arrayidx9)>>2)]=4;
   var $7=$s;
   var $inc10=((($7)+(1))|0);
   $s=$inc10;
   var $arrayidx11=(($sizes+($7<<2))|0);
   HEAP32[(($arrayidx11)>>2)]=16;
   var $8=$s;
   var $inc12=((($8)+(1))|0);
   $s=$inc12;
   var $arrayidx13=(($sizes+($8<<2))|0);
   HEAP32[(($arrayidx13)>>2)]=16;
   var $9=$s;
   var $inc14=((($9)+(1))|0);
   $s=$inc14;
   var $arrayidx15=(($sizes+($9<<2))|0);
   HEAP32[(($arrayidx15)>>2)]=4;
   var $10=HEAP32[((3808)>>2)];
   var $tobool16=($10|0)!=0;
   if ($tobool16) { label = 6; break; } else { label = 5; break; }
  case 5: 
   var $11=HEAP32[((1904)>>2)];
   var $tobool18=($11|0)!=0;
   if ($tobool18) { label = 6; break; } else { label = 13; break; }
  case 6: 
   HEAP32[((1904)>>2)]=0;
   $err=0;
   $a=0;
   label = 7; break;
  case 7: 
   var $12=$a;
   var $13=$s;
   var $cmp=($12>>>0) < ($13>>>0);
   if ($cmp) { label = 8; break; } else { label = 10; break; }
  case 8: 
   var $14=HEAP32[((3760)>>2)];
   var $15=$a;
   var $16=$a;
   var $arrayidx20=(($sizes+($16<<2))|0);
   var $17=HEAP32[(($arrayidx20)>>2)];
   var $18=$a;
   var $arrayidx21=(($values+($18<<2))|0);
   var $19=HEAP32[(($arrayidx21)>>2)];
   var $call=_clSetKernelArg($14, $15, $17, $19);
   var $20=$err;
   var $or=$20 | $call;
   $err=$or;
   label = 9; break;
  case 9: 
   var $21=$a;
   var $inc22=((($21)+(1))|0);
   $a=$inc22;
   label = 7; break;
  case 10: 
   var $22=$err;
   var $tobool23=($22|0)!=0;
   if ($tobool23) { label = 11; break; } else { label = 12; break; }
  case 11: 
   $retval=-10;
   label = 18; break;
  case 12: 
   label = 13; break;
  case 13: 
   var $23=HEAP32[((((2640)|0))>>2)];
   $size_x=$23;
   var $24=HEAP32[((((2644)|0))>>2)];
   $size_y=$24;
   var $25=HEAP32[((1920)>>2)];
   var $26=$size_x;
   var $call27=_DivideUp($25, $26);
   var $27=$size_x;
   var $mul=(Math.imul($call27,$27)|0);
   var $arrayidx28=(($global)|0);
   HEAP32[(($arrayidx28)>>2)]=$mul;
   var $28=HEAP32[((1960)>>2)];
   var $29=$size_y;
   var $call29=_DivideUp($28, $29);
   var $30=$size_y;
   var $mul30=(Math.imul($call29,$30)|0);
   var $arrayidx31=(($global+4)|0);
   HEAP32[(($arrayidx31)>>2)]=$mul30;
   var $31=$size_x;
   var $arrayidx32=(($local)|0);
   HEAP32[(($arrayidx32)>>2)]=$31;
   var $32=$size_y;
   var $arrayidx33=(($local+4)|0);
   HEAP32[(($arrayidx33)>>2)]=$32;
   var $33=HEAP32[((3800)>>2)];
   var $34=HEAP32[((3760)>>2)];
   var $arraydecay=(($global)|0);
   var $arraydecay34=(($local)|0);
   var $call35=_clEnqueueNDRangeKernel($33, $34, 2, 0, $arraydecay, $arraydecay34, 0, 0, 0);
   $err=$call35;
   var $35=$err;
   var $tobool36=($35|0)!=0;
   if ($tobool36) { label = 14; break; } else { label = 15; break; }
  case 14: 
   var $36=$err;
   var $call38=_printf(((1456)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$36,tempVarArgs)); STACKTOP=tempVarArgs;
   var $37=$err;
   $retval=$37;
   label = 18; break;
  case 15: 
   var $call40=_clSetTypePointer(4314);
   var $38=HEAP32[((3800)>>2)];
   var $39=HEAP32[((3744)>>2)];
   var $40=HEAP32[((1864)>>2)];
   var $41=HEAP32[((2064)>>2)];
   var $mul41=(Math.imul($40,$41)|0);
   var $42=HEAP32[((1928)>>2)];
   var $mul42=(Math.imul($mul41,$42)|0);
   var $mul43=($mul42<<2);
   var $43=HEAP32[((3728)>>2)];
   var $call44=_clEnqueueReadBuffer($38, $39, 1, 0, $mul43, $43, 0, 0, 0);
   $err=$call44;
   var $44=$err;
   var $cmp45=($44|0)!=0;
   if ($cmp45) { label = 16; break; } else { label = 17; break; }
  case 16: 
   var $45=$err;
   var $call47=_printf(((1424)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$45,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call48=_end(1);
   $retval=$call48;
   label = 18; break;
  case 17: 
   $retval=0;
   label = 18; break;
  case 18: 
   var $46=$retval;
   STACKTOP = sp;
   return $46;
  default: assert(0, "bad label: " + label);
 }
}
function _RenderTexture($pvData) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $pvData_addr;
   $pvData_addr=$pvData;
   _glDisable(2896);
   var $0=HEAP32[((1864)>>2)];
   var $1=HEAP32[((2064)>>2)];
   _glViewport(0, 0, $0, $1);
   _glMatrixMode(5889);
   _glLoadIdentity();
   _glMatrixMode(5888);
   _glLoadIdentity();
   _glMatrixMode(5890);
   _glLoadIdentity();
   var $2=HEAP32[((1944)>>2)];
   _glEnable($2);
   var $3=HEAP32[((1944)>>2)];
   var $4=HEAP32[((2656)>>2)];
   _glBindTexture($3, $4);
   var $5=$pvData_addr;
   var $tobool=($5|0)!=0;
   if ($tobool) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $6=HEAP32[((1944)>>2)];
   var $7=HEAP32[((1920)>>2)];
   var $8=HEAP32[((1960)>>2)];
   var $9=HEAP32[((1968)>>2)];
   var $10=HEAP32[((1936)>>2)];
   var $11=$pvData_addr;
   _glTexSubImage2D($6, 0, 0, 0, $7, $8, $9, $10, $11);
   label = 3; break;
  case 3: 
   _glDisableClientState(32888);
   _glDisableClientState(32884);
   _glBegin(7);
   _glColor3f(1, 1, 1);
   _glTexCoord2i(0, 0);
   _glVertex3f(-1, -1, 0);
   _glColor3f(1, 1, 1);
   _glTexCoord2i(0, 1);
   _glVertex3f(-1, 1, 0);
   _glColor3f(1, 1, 1);
   _glTexCoord2i(1, 1);
   _glVertex3f(1, 1, 0);
   _glColor3f(1, 1, 1);
   _glTexCoord2i(1, 0);
   _glVertex3f(1, -1, 0);
   _glEnd();
   var $12=HEAP32[((1944)>>2)];
   _glBindTexture($12, 0);
   var $13=HEAP32[((1944)>>2)];
   _glDisable($13);
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ReportInfo() {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $iX;
   var $iY;
   var $iX14;
   var $iY15;
   var $0=HEAP32[((1984)>>2)];
   var $tobool=($0|0)!=0;
   if ($tobool) { label = 2; break; } else { label = 3; break; }
  case 2: 
   $iX=20;
   $iY=20;
   var $1=$iX;
   var $sub=((($1)-(1))|0);
   var $conv=($sub|0);
   var $2=HEAP32[((2064)>>2)];
   var $3=$iY;
   var $sub1=((($2)-($3))|0);
   var $sub2=((($sub1)-(1))|0);
   var $conv3=($sub2|0);
   _DrawText($conv, $conv3, 0, ((2696)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $4=$iX;
   var $sub4=((($4)-(2))|0);
   var $conv5=($sub4|0);
   var $5=HEAP32[((2064)>>2)];
   var $6=$iY;
   var $sub6=((($5)-($6))|0);
   var $sub7=((($sub6)-(2))|0);
   var $conv8=($sub7|0);
   _DrawText($conv5, $conv8, 0, ((2696)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $7=$iX;
   var $conv9=($7|0);
   var $8=HEAP32[((2064)>>2)];
   var $9=$iY;
   var $sub10=((($8)-($9))|0);
   var $conv11=($sub10|0);
   _DrawText($conv9, $conv11, 1, ((2696)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 3; break;
  case 3: 
   var $10=HEAP32[((1992)>>2)];
   var $tobool12=($10|0)!=0;
   if ($tobool12) { label = 4; break; } else { label = 8; break; }
  case 4: 
   var $11=HEAP32[((((1976)|0))>>2)];
   $iX14=$11;
   var $12=HEAP32[((2064)>>2)];
   var $13=HEAP32[((((1980)|0))>>2)];
   var $sub16=((($12)-($13))|0);
   $iY15=$sub16;
   var $14=HEAP32[((1864)>>2)];
   var $15=$iX14;
   var $sub17=((($14)-($15))|0);
   var $sub18=((($sub17)-(1))|0);
   var $call=_strlen(((3216)|0));
   var $mul=((($call)*(10))&-1);
   var $sub19=((($sub18)-($mul))|0);
   var $conv20=($sub19>>>0);
   var $16=HEAP32[((2064)>>2)];
   var $17=$iY15;
   var $sub21=((($16)-($17))|0);
   var $sub22=((($sub21)-(1))|0);
   var $conv23=($sub22|0);
   _DrawText($conv20, $conv23, 0, ((3216)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $18=HEAP32[((1864)>>2)];
   var $19=$iX14;
   var $sub24=((($18)-($19))|0);
   var $sub25=((($sub24)-(2))|0);
   var $call26=_strlen(((3216)|0));
   var $mul27=((($call26)*(10))&-1);
   var $sub28=((($sub25)-($mul27))|0);
   var $conv29=($sub28>>>0);
   var $20=HEAP32[((2064)>>2)];
   var $21=$iY15;
   var $sub30=((($20)-($21))|0);
   var $sub31=((($sub30)-(2))|0);
   var $conv32=($sub31|0);
   _DrawText($conv29, $conv32, 0, ((3216)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $22=HEAP32[((1864)>>2)];
   var $23=$iX14;
   var $sub33=((($22)-($23))|0);
   var $call34=_strlen(((3216)|0));
   var $mul35=((($call34)*(10))&-1);
   var $sub36=((($sub33)-($mul35))|0);
   var $conv37=($sub36>>>0);
   var $24=HEAP32[((2064)>>2)];
   var $25=$iY15;
   var $sub38=((($24)-($25))|0);
   var $conv39=($sub38|0);
   _DrawText($conv37, $conv39, 1, ((3216)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $26=HEAP32[((1992)>>2)];
   var $cmp=($26>>>0) > 200;
   if ($cmp) { label = 5; break; } else { label = 6; break; }
  case 5: 
   var $cond = 0;label = 7; break;
  case 6: 
   var $27=HEAP32[((1992)>>2)];
   var $add=((($27)+(1))|0);
   var $cond = $add;label = 7; break;
  case 7: 
   var $cond;
   HEAP32[((1992)>>2)]=$cond;
   label = 8; break;
  case 8: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _ReportStats($uiStartTime$0, $uiStartTime$1, $uiEndTime$0, $uiEndTime$1) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $uiStartTime_addr=sp;
   var $uiEndTime_addr=(sp)+(8);
   var $fMs;
   var $fFps;
   var $st$0$0=(($uiStartTime_addr)|0);
   HEAP32[(($st$0$0)>>2)]=$uiStartTime$0;
   var $st$1$1=(($uiStartTime_addr+4)|0);
   HEAP32[(($st$1$1)>>2)]=$uiStartTime$1;
   var $st$2$0=(($uiEndTime_addr)|0);
   HEAP32[(($st$2$0)>>2)]=$uiEndTime$0;
   var $st$3$1=(($uiEndTime_addr+4)|0);
   HEAP32[(($st$3$1)>>2)]=$uiEndTime$1;
   var $ld$4$0=(($uiEndTime_addr)|0);
   var $0$0=HEAP32[(($ld$4$0)>>2)];
   var $ld$5$1=(($uiEndTime_addr+4)|0);
   var $0$1=HEAP32[(($ld$5$1)>>2)];
   var $ld$6$0=(($uiStartTime_addr)|0);
   var $1$0=HEAP32[(($ld$6$0)>>2)];
   var $ld$7$1=(($uiStartTime_addr+4)|0);
   var $1$1=HEAP32[(($ld$7$1)>>2)];
   var $call=_SubtractTime($0$0, $0$1, $1$0, $1$1);
   var $2=HEAPF64[((1912)>>3)];
   var $add=($2)+($call);
   HEAPF64[((1912)>>3)]=$add;
   var $3=HEAPF64[((1912)>>3)];
   var $tobool=$3 != 0;
   if ($tobool) { label = 2; break; } else { label = 5; break; }
  case 2: 
   var $4=HEAP32[((3736)>>2)];
   var $tobool1=($4|0)!=0;
   if ($tobool1) { label = 3; break; } else { label = 5; break; }
  case 3: 
   var $5=HEAP32[((3736)>>2)];
   var $6=HEAP32[((2000)>>2)];
   var $cmp=($5>>>0) > ($6>>>0);
   if ($cmp) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $7=HEAPF64[((1912)>>3)];
   var $mul=($7)*(1000);
   var $8=HEAP32[((3736)>>2)];
   var $conv=($8|0);
   var $div=($mul)/($conv);
   $fMs=$div;
   var $9=$fMs;
   var $div3=($9)/(1000);
   var $div4=(1)/($div3);
   $fFps=$div4;
   var $ld$8$0=((3776)|0);
   var $10$0=HEAP32[(($ld$8$0)>>2)];
   var $ld$9$1=((3780)|0);
   var $10$1=HEAP32[(($ld$9$1)>>2)];
   var $$etemp$10$0=4;
   var $$etemp$10$1=0;
   var $cmp5=(($10$0|0) == ($$etemp$10$0|0)) & (($10$1|0) == ($$etemp$10$1|0));
   var $cond=$cmp5 ? (((1768)|0)) : (((1760)|0));
   var $11=$fMs;
   var $12=$fFps;
   var $13=HEAP32[((2648)>>2)];
   var $tobool7=($13|0)!=0;
   var $cond8=$tobool7 ? (((1536)|0)) : (((1528)|0));
   var $call9=_printf(((1552)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$cond,HEAPF64[(((tempVarArgs)+(8))>>3)]=$11,HEAPF64[(((tempVarArgs)+(16))>>3)]=$12,HEAP32[(((tempVarArgs)+(24))>>2)]=$cond8,tempVarArgs)); STACKTOP=tempVarArgs;
   HEAP32[((3736)>>2)]=0;
   HEAPF64[((1912)>>3)]=0;
   label = 5; break;
  case 5: 
   STACKTOP = sp;
   return;
  default: assert(0, "bad label: " + label);
 }
}
function _SubtractTime($uiEndTime$0, $uiEndTime$1, $uiStartTime$0, $uiStartTime$1) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 16)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $uiEndTime_addr=sp;
 var $uiStartTime_addr=(sp)+(8);
 var $st$0$0=(($uiEndTime_addr)|0);
 HEAP32[(($st$0$0)>>2)]=$uiEndTime$0;
 var $st$1$1=(($uiEndTime_addr+4)|0);
 HEAP32[(($st$1$1)>>2)]=$uiEndTime$1;
 var $st$2$0=(($uiStartTime_addr)|0);
 HEAP32[(($st$2$0)>>2)]=$uiStartTime$0;
 var $st$3$1=(($uiStartTime_addr+4)|0);
 HEAP32[(($st$3$1)>>2)]=$uiStartTime$1;
 var $ld$4$0=(($uiEndTime_addr)|0);
 var $0$0=HEAP32[(($ld$4$0)>>2)];
 var $ld$5$1=(($uiEndTime_addr+4)|0);
 var $0$1=HEAP32[(($ld$5$1)>>2)];
 var $ld$6$0=(($uiStartTime_addr)|0);
 var $1$0=HEAP32[(($ld$6$0)>>2)];
 var $ld$7$1=(($uiStartTime_addr+4)|0);
 var $1$1=HEAP32[(($ld$7$1)>>2)];
 var $sub$0 = _i64Subtract($0$0,$0$1,$1$0,$1$1); var $sub$1 = tempRet0;
 var $conv=(($sub$0>>>0)+(($sub$1>>>0)*4294967296));
 var $mul=((1e-9))*($conv);
 STACKTOP = sp;
 return $mul;
}
function _DrawText($x, $y, $light, $format, varrp) {
 var label = 0;
 var $x_addr;
 var $y_addr;
 var $light_addr;
 var $format_addr;
 $x_addr=$x;
 $y_addr=$y;
 $light_addr=$light;
 $format_addr=$format;
 return;
}
function _DivideUp($a, $b) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $a_addr;
   var $b_addr;
   $a_addr=$a;
   $b_addr=$b;
   var $0=$a_addr;
   var $1=$b_addr;
   var $rem=(((($0|0))%(($1|0)))&-1);
   var $cmp=($rem|0)!=0;
   if ($cmp) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $2=$a_addr;
   var $3=$b_addr;
   var $div=(((($2|0))/(($3|0)))&-1);
   var $add=((($div)+(1))|0);
   var $cond = $add;label = 4; break;
  case 3: 
   var $4=$a_addr;
   var $5=$b_addr;
   var $div1=(((($4|0))/(($5|0)))&-1);
   var $cond = $div1;label = 4; break;
  case 4: 
   var $cond;
   return $cond;
  default: assert(0, "bad label: " + label);
 }
}
function _RandomColor($v) {
 var label = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 8)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 var $v_addr;
 var $seed=sp;
 $v_addr=$v;
 var $call$0=_GetCurrentTime();
 var $call$1=tempRet0;
 var $conv$0=$call$0;
 var $conv=$conv$0;
 HEAP32[(($seed)>>2)]=$conv;
 var $call1=_rand_r($seed);
 var $conv2=($call1|0);
 var $mul=($conv2)*(2);
 var $div=($mul)/(2147483648);
 var $sub=($div)-(1);
 var $0=$v_addr;
 var $arrayidx=(($0)|0);
 HEAPF32[(($arrayidx)>>2)]=$sub;
 var $call3=_rand_r($seed);
 var $conv4=($call3|0);
 var $mul5=($conv4)*(2);
 var $div6=($mul5)/(2147483648);
 var $sub7=($div6)-(1);
 var $1=$v_addr;
 var $arrayidx8=(($1+4)|0);
 HEAPF32[(($arrayidx8)>>2)]=$sub7;
 var $call9=_rand_r($seed);
 var $conv10=($call9|0);
 var $mul11=($conv10)*(2);
 var $div12=($mul11)/(2147483648);
 var $sub13=($div12)-(1);
 var $2=$v_addr;
 var $arrayidx14=(($2+8)|0);
 HEAPF32[(($arrayidx14)>>2)]=$sub13;
 var $3=$v_addr;
 var $arrayidx15=(($3+12)|0);
 HEAPF32[(($arrayidx15)>>2)]=1;
 STACKTOP = sp;
 return;
}
function _GetCurrentTime() {
 var label = 0;
 var $call=_emscripten_get_now();
 var $mul=((($call)*(1000000))&-1);
 var $conv$0=$mul;
 var $conv$1=(($mul|0) < 0 ? -1 : 0);
 return (tempRet0=$conv$1,$conv$0);
}
function _SetupGraphics() {
 var label = 0;
 var $0=HEAP32[((1864)>>2)];
 var $1=HEAP32[((2064)>>2)];
 _CreateTexture($0, $1);
 _glClearColor(0, 0, 0, 0);
 _glDisable(2929);
 _glActiveTexture(33984);
 var $2=HEAP32[((1864)>>2)];
 var $3=HEAP32[((2064)>>2)];
 _glViewport(0, 0, $2, $3);
 _glMatrixMode(5888);
 _glLoadIdentity();
 _glMatrixMode(5889);
 _glLoadIdentity();
 HEAPF32[((((2688)|0))>>2)]=0;
 HEAPF32[((((2692)|0))>>2)]=0;
 var $4=HEAP32[((1864)>>2)];
 var $conv=($4|0);
 HEAPF32[((((2680)|0))>>2)]=$conv;
 HEAPF32[((((2684)|0))>>2)]=0;
 var $5=HEAP32[((1864)>>2)];
 var $conv1=($5|0);
 HEAPF32[((((2672)|0))>>2)]=$conv1;
 var $6=HEAP32[((2064)>>2)];
 var $conv2=($6|0);
 HEAPF32[((((2676)|0))>>2)]=$conv2;
 HEAPF32[((((2664)|0))>>2)]=0;
 var $7=HEAP32[((2064)>>2)];
 var $conv3=($7|0);
 HEAPF32[((((2668)|0))>>2)]=$conv3;
 _glEnableClientState(32884);
 _glEnableClientState(32888);
 _glVertexPointer(2, 5126, 0, 1872);
 _glClientActiveTexture(33984);
 _glTexCoordPointer(2, 5126, 0, 2664);
 return 0;
}
function _SetupComputeDevices($gpu) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 2136)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $retval;
   var $gpu_addr;
   var $err=sp;
   var $returned_size=(sp)+(8);
   var $device_count;
   var $device_ids=(sp)+(16);
   var $i;
   var $device_found;
   var $device_type=(sp)+(80);
   var $vendor_name=(sp)+(88);
   var $device_name=(sp)+(1112);
   $gpu_addr=$gpu;
   var $0=$gpu_addr;
   var $tobool=($0|0)!=0;
   var $cond=$tobool ? 4 : 2;
   var $conv$0=$cond;
   var $conv$1=(($cond|0) < 0 ? -1 : 0);
   var $st$0$0=((3776)|0);
   HEAP32[(($st$0$0)>>2)]=$conv$0;
   var $st$1$1=((3780)|0);
   HEAP32[(($st$1$1)>>2)]=$conv$1;
   var $ld$2$0=((3776)|0);
   var $1$0=HEAP32[(($ld$2$0)>>2)];
   var $ld$3$1=((3780)|0);
   var $1$1=HEAP32[(($ld$3$1)>>2)];
   var $call=_clGetDeviceIDs(0, $1$0, $1$1, 1, 3784, 0);
   HEAP32[(($err)>>2)]=$call;
   var $2=HEAP32[(($err)>>2)];
   var $cmp=($2|0)!=0;
   if ($cmp) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $call2=_printf(((264)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call3=_end(1);
   $retval=$call3;
   label = 20; break;
  case 3: 
   var $call4=_clCreateContext(0, 1, 3784, 0, 0, $err);
   HEAP32[((3792)>>2)]=$call4;
   var $3=HEAP32[((3792)>>2)];
   var $tobool5=($3|0)!=0;
   if ($tobool5) { label = 5; break; } else { label = 4; break; }
  case 4: 
   var $call7=_printf(((216)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call8=_end(1);
   $retval=$call8;
   label = 20; break;
  case 5: 
   var $4=HEAP32[((3792)>>2)];
   var $arraydecay=(($device_ids)|0);
   var $5=$arraydecay;
   var $call10=_clGetContextInfo($4, 4225, 64, $5, $returned_size);
   HEAP32[(($err)>>2)]=$call10;
   var $6=HEAP32[(($err)>>2)];
   var $tobool11=($6|0)!=0;
   if ($tobool11) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $call13=_printf(((152)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call14=_end(1);
   $retval=$call14;
   label = 20; break;
  case 7: 
   var $7=HEAP32[(($returned_size)>>2)];
   var $div=(((($7>>>0))/(4))&-1);
   $device_count=$div;
   $i=0;
   $device_found=0;
   $i=0;
   label = 8; break;
  case 8: 
   var $8=$i;
   var $9=$device_count;
   var $cmp16=($8>>>0) < ($9>>>0);
   if ($cmp16) { label = 9; break; } else { label = 13; break; }
  case 9: 
   var $10=$i;
   var $arrayidx=(($device_ids+($10<<2))|0);
   var $11=HEAP32[(($arrayidx)>>2)];
   var $12=$device_type;
   var $call18=_clGetDeviceInfo($11, 4096, 8, $12, 0);
   var $ld$4$0=(($device_type)|0);
   var $13$0=HEAP32[(($ld$4$0)>>2)];
   var $ld$5$1=(($device_type+4)|0);
   var $13$1=HEAP32[(($ld$5$1)>>2)];
   var $ld$6$0=((3776)|0);
   var $14$0=HEAP32[(($ld$6$0)>>2)];
   var $ld$7$1=((3780)|0);
   var $14$1=HEAP32[(($ld$7$1)>>2)];
   var $cmp19=(($13$0|0) == ($14$0|0)) & (($13$1|0) == ($14$1|0));
   if ($cmp19) { label = 10; break; } else { label = 11; break; }
  case 10: 
   var $15=$i;
   var $arrayidx22=(($device_ids+($15<<2))|0);
   var $16=HEAP32[(($arrayidx22)>>2)];
   HEAP32[((3784)>>2)]=$16;
   $device_found=1;
   label = 13; break;
  case 11: 
   label = 12; break;
  case 12: 
   var $17=$i;
   var $inc=((($17)+(1))|0);
   $i=$inc;
   label = 8; break;
  case 13: 
   var $18=$device_found;
   var $tobool24=($18|0)!=0;
   if ($tobool24) { label = 15; break; } else { label = 14; break; }
  case 14: 
   var $call26=_printf(((264)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call27=_end(1);
   $retval=$call27;
   label = 20; break;
  case 15: 
   var $19=HEAP32[((3792)>>2)];
   var $20=HEAP32[((3784)>>2)];
   var $$etemp$8$0=0;
   var $$etemp$8$1=0;
   var $call29=_clCreateCommandQueue($19, $20, $$etemp$8$0, $$etemp$8$1, $err);
   HEAP32[((3800)>>2)]=$call29;
   var $21=HEAP32[((3800)>>2)];
   var $tobool30=($21|0)!=0;
   if ($tobool30) { label = 17; break; } else { label = 16; break; }
  case 16: 
   var $call32=_printf(((104)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call33=_end(1);
   $retval=$call33;
   label = 20; break;
  case 17: 
   var $22=$vendor_name;
   _memset($22, 0, 1024);
   var $23=$device_name;
   _memset($23, 0, 1024);
   var $24=HEAP32[((3784)>>2)];
   var $arraydecay35=(($vendor_name)|0);
   var $call36=_clGetDeviceInfo($24, 4140, 1024, $arraydecay35, $returned_size);
   HEAP32[(($err)>>2)]=$call36;
   var $25=HEAP32[((3784)>>2)];
   var $arraydecay37=(($device_name)|0);
   var $call38=_clGetDeviceInfo($25, 4139, 1024, $arraydecay37, $returned_size);
   var $26=HEAP32[(($err)>>2)];
   var $or=$26 | $call38;
   HEAP32[(($err)>>2)]=$or;
   var $27=HEAP32[(($err)>>2)];
   var $cmp39=($27|0)!=0;
   if ($cmp39) { label = 18; break; } else { label = 19; break; }
  case 18: 
   var $call42=_printf(((528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   label = 19; break;
  case 19: 
   var $call44=_printf(((1664)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $arraydecay45=(($vendor_name)|0);
   var $arraydecay46=(($device_name)|0);
   var $call47=_printf(((80)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$arraydecay45,HEAP32[(((tempVarArgs)+(8))>>2)]=$arraydecay46,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=0;
   label = 20; break;
  case 20: 
   var $28=$retval;
   STACKTOP = sp;
   return $28;
  default: assert(0, "bad label: " + label);
 }
}
function _SetupComputeKernel() {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 2120)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $retval;
   var $err=sp;
   var $i;
   var $source=(sp)+(8);
   var $length=(sp)+(16);
   var $width_macro;
   var $height_macro;
   var $preprocess=(sp)+(24);
   var $len=(sp)+(32);
   var $buffer=(sp)+(40);
   var $returned_size=(sp)+(2088);
   var $max_workgroup_size=(sp)+(2096);
   var $max_workgroup_item_size=(sp)+(2104);
   HEAP32[(($err)>>2)]=0;
   $i=0;
   HEAP32[(($source)>>2)]=0;
   HEAP32[(($length)>>2)]=0;
   var $0=HEAP32[((3760)>>2)];
   var $tobool=($0|0)!=0;
   if ($tobool) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $1=HEAP32[((3760)>>2)];
   var $call=_clReleaseKernel($1);
   label = 3; break;
  case 3: 
   HEAP32[((3760)>>2)]=0;
   var $2=HEAP32[((3752)>>2)];
   var $tobool1=($2|0)!=0;
   if ($tobool1) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $3=HEAP32[((3752)>>2)];
   var $call3=_clReleaseProgram($3);
   label = 5; break;
  case 5: 
   HEAP32[((3752)>>2)]=0;
   var $call5=_printf(((1664)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call6=_printf(((944)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=((920)|0),tempVarArgs)); STACKTOP=tempVarArgs;
   var $call7=_LoadTextFromFile(((920)|0), $source, $length);
   HEAP32[(($err)>>2)]=$call7;
   var $4=HEAP32[(($source)>>2)];
   var $tobool8=($4|0)!=0;
   if ($tobool8) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $5=HEAP32[(($err)>>2)];
   var $tobool9=($5|0)!=0;
   if ($tobool9) { label = 7; break; } else { label = 8; break; }
  case 7: 
   var $call11=_printf(((880)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call12=_end(1);
   $retval=$call12;
   label = 32; break;
  case 8: 
   $width_macro=((864)|0);
   $height_macro=((848)|0);
   var $6=HEAP32[(($source)>>2)];
   var $call14=_strlen($6);
   var $add=((($call14)+(1024))|0);
   var $call15=_malloc($add);
   HEAP32[(($preprocess)>>2)]=$call15;
   var $7=HEAP32[(($preprocess)>>2)];
   var $8=$width_macro;
   var $9=HEAP32[((1864)>>2)];
   var $10=$height_macro;
   var $11=HEAP32[((2064)>>2)];
   var $12=HEAP32[(($source)>>2)];
   var $call16=_sprintf($7, ((824)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 40)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$8,HEAP32[(((tempVarArgs)+(8))>>2)]=$9,HEAP32[(((tempVarArgs)+(16))>>2)]=$10,HEAP32[(((tempVarArgs)+(24))>>2)]=$11,HEAP32[(((tempVarArgs)+(32))>>2)]=$12,tempVarArgs)); STACKTOP=tempVarArgs;
   var $13=HEAP32[((3792)>>2)];
   var $call17=_clCreateProgramWithSource($13, 1, $preprocess, 0, $err);
   HEAP32[((3752)>>2)]=$call17;
   var $14=HEAP32[((3752)>>2)];
   var $tobool18=($14|0)!=0;
   if ($tobool18) { label = 9; break; } else { label = 10; break; }
  case 9: 
   var $15=HEAP32[(($err)>>2)];
   var $cmp=($15|0)!=0;
   if ($cmp) { label = 10; break; } else { label = 11; break; }
  case 10: 
   var $call21=_printf(((776)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call22=_end(1);
   $retval=$call22;
   label = 32; break;
  case 11: 
   var $16=HEAP32[(($source)>>2)];
   _free($16);
   var $17=HEAP32[(($preprocess)>>2)];
   _free($17);
   var $18=HEAP32[((3752)>>2)];
   var $call24=_clBuildProgram($18, 0, 0, 0, 0, 0);
   HEAP32[(($err)>>2)]=$call24;
   var $19=HEAP32[(($err)>>2)];
   var $cmp25=($19|0)!=0;
   if ($cmp25) { label = 12; break; } else { label = 13; break; }
  case 12: 
   var $call27=_printf(((728)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $20=HEAP32[((3752)>>2)];
   var $21=HEAP32[((3784)>>2)];
   var $arraydecay=(($buffer)|0);
   var $call28=_clGetProgramBuildInfo($20, $21, 4483, 2048, $arraydecay, $len);
   var $arraydecay29=(($buffer)|0);
   var $call30=_printf(((1808)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$arraydecay29,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call31=_end(1);
   $retval=$call31;
   label = 32; break;
  case 13: 
   var $call33=_printf(((696)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=((672)|0),tempVarArgs)); STACKTOP=tempVarArgs;
   var $22=HEAP32[((3752)>>2)];
   var $call34=_clCreateKernel($22, ((672)|0), $err);
   HEAP32[((3760)>>2)]=$call34;
   var $23=HEAP32[((3760)>>2)];
   var $tobool35=($23|0)!=0;
   if ($tobool35) { label = 14; break; } else { label = 15; break; }
  case 14: 
   var $24=HEAP32[(($err)>>2)];
   var $cmp37=($24|0)!=0;
   if ($cmp37) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $call39=_printf(((624)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call40=_end(1);
   $retval=$call40;
   label = 32; break;
  case 16: 
   var $25=HEAP32[((3760)>>2)];
   var $26=HEAP32[((3784)>>2)];
   var $call42=_clGetKernelWorkGroupInfo($25, $26, 4528, 4, 3208, 0);
   HEAP32[(($err)>>2)]=$call42;
   var $27=HEAP32[(($err)>>2)];
   var $cmp43=($27|0)!=0;
   if ($cmp43) { label = 17; break; } else { label = 18; break; }
  case 17: 
   var $28=HEAP32[(($err)>>2)];
   var $call45=_printf(((568)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$28,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call46=_end(1);
   _exit(1);
   throw "Reached an unreachable!";
  case 18: 
   HEAP32[(($returned_size)>>2)]=0;
   HEAP32[(($max_workgroup_size)>>2)]=0;
   var $29=HEAP32[((3784)>>2)];
   var $30=$max_workgroup_size;
   var $call48=_clGetDeviceInfo($29, 4100, 4, $30, $returned_size);
   HEAP32[(($err)>>2)]=$call48;
   var $31=HEAP32[(($err)>>2)];
   var $cmp49=($31|0)!=0;
   if ($cmp49) { label = 19; break; } else { label = 20; break; }
  case 19: 
   var $call51=_printf(((528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call52=_end(1);
   $retval=$call52;
   label = 32; break;
  case 20: 
   HEAP32[(($returned_size)>>2)]=0;
   HEAP32[(($err)>>2)]=0;
   var $32=HEAP32[((3784)>>2)];
   var $33=$max_workgroup_item_size;
   var $call54=_clGetDeviceInfo($32, 4101, 12, $33, $returned_size);
   HEAP32[(($err)>>2)]=$call54;
   var $34=HEAP32[(($err)>>2)];
   var $cmp55=($34|0)!=0;
   if ($cmp55) { label = 21; break; } else { label = 22; break; }
  case 21: 
   var $call57=_printf(((528)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $call58=_end(1);
   $retval=$call58;
   label = 32; break;
  case 22: 
   var $35=HEAP32[((3208)>>2)];
   var $cmp60=($35>>>0) > 1;
   if ($cmp60) { label = 23; break; } else { label = 24; break; }
  case 23: 
   var $36=HEAP32[((3208)>>2)];
   var $37=HEAP32[((1856)>>2)];
   var $div=(((($36>>>0))/(($37>>>0)))&-1);
   var $cond = $div;label = 25; break;
  case 24: 
   var $38=HEAP32[((3208)>>2)];
   var $cond = $38;label = 25; break;
  case 25: 
   var $cond;
   HEAP32[((((2640)|0))>>2)]=$cond;
   var $39=HEAP32[((3208)>>2)];
   var $40=HEAP32[((((2640)|0))>>2)];
   var $div61=(((($39>>>0))/(($40>>>0)))&-1);
   HEAP32[((((2644)|0))>>2)]=$div61;
   $i=0;
   label = 26; break;
  case 26: 
   var $41=$i;
   var $cmp62=($41|0) < 2;
   if ($cmp62) { label = 27; break; } else { label = 31; break; }
  case 27: 
   var $42=$i;
   var $arrayidx=((2640+($42<<2))|0);
   var $43=HEAP32[(($arrayidx)>>2)];
   var $44=$i;
   var $arrayidx63=(($max_workgroup_item_size+($44<<2))|0);
   var $45=HEAP32[(($arrayidx63)>>2)];
   var $cmp64=($43>>>0) > ($45>>>0);
   if ($cmp64) { label = 28; break; } else { label = 29; break; }
  case 28: 
   var $46=$i;
   var $47=$i;
   var $arrayidx66=((2640+($47<<2))|0);
   var $48=HEAP32[(($arrayidx66)>>2)];
   var $49=$i;
   var $50=$i;
   var $arrayidx67=(($max_workgroup_item_size+($50<<2))|0);
   var $51=HEAP32[(($arrayidx67)>>2)];
   var $call68=_printf(((408)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 32)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$46,HEAP32[(((tempVarArgs)+(8))>>2)]=$48,HEAP32[(((tempVarArgs)+(16))>>2)]=$49,HEAP32[(((tempVarArgs)+(24))>>2)]=$51,tempVarArgs)); STACKTOP=tempVarArgs;
   var $52=$i;
   var $arrayidx69=(($max_workgroup_item_size+($52<<2))|0);
   var $53=HEAP32[(($arrayidx69)>>2)];
   var $54=$i;
   var $arrayidx70=((2640+($54<<2))|0);
   HEAP32[(($arrayidx70)>>2)]=$53;
   label = 29; break;
  case 29: 
   label = 30; break;
  case 30: 
   var $55=$i;
   var $inc=((($55)+(1))|0);
   $i=$inc;
   label = 26; break;
  case 31: 
   var $call72=_printf(((1664)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=0;
   label = 32; break;
  case 32: 
   var $56=$retval;
   STACKTOP = sp;
   return $56;
  default: assert(0, "bad label: " + label);
 }
}
function _CreateComputeResult() {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $retval;
   var $err;
   $err=0;
   var $0=HEAP32[((3728)>>2)];
   var $tobool=($0|0)!=0;
   if ($tobool) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $1=HEAP32[((3728)>>2)];
   _free($1);
   label = 3; break;
  case 3: 
   var $call=_printf(((1080)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   var $2=HEAP32[((1920)>>2)];
   var $3=HEAP32[((1960)>>2)];
   var $mul=(Math.imul($2,$3)|0);
   var $4=HEAP32[((1928)>>2)];
   var $mul1=(Math.imul($mul,$4)|0);
   var $mul2=($mul1<<2);
   var $call3=_malloc($mul2);
   HEAP32[((3728)>>2)]=$call3;
   var $5=HEAP32[((3728)>>2)];
   var $tobool4=($5|0)!=0;
   if ($tobool4) { label = 5; break; } else { label = 4; break; }
  case 4: 
   var $call6=_printf(((1040)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=-1;
   label = 10; break;
  case 5: 
   var $6=HEAP32[((3728)>>2)];
   var $7=HEAP32[((1920)>>2)];
   var $8=HEAP32[((1960)>>2)];
   var $mul8=(Math.imul($7,$8)|0);
   var $9=HEAP32[((1928)>>2)];
   var $mul9=(Math.imul($mul8,$9)|0);
   var $mul10=($mul9<<2);
   _memset($6, 0, $mul10);
   var $10=HEAP32[((3744)>>2)];
   var $tobool11=($10|0)!=0;
   if ($tobool11) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $11=HEAP32[((3744)>>2)];
   var $call13=_clReleaseMemObject($11);
   label = 7; break;
  case 7: 
   HEAP32[((3744)>>2)]=0;
   var $12=HEAP32[((3792)>>2)];
   var $13=HEAP32[((1928)>>2)];
   var $mul15=($13<<2);
   var $14=HEAP32[((1920)>>2)];
   var $mul16=(Math.imul($mul15,$14)|0);
   var $15=HEAP32[((1960)>>2)];
   var $mul17=(Math.imul($mul16,$15)|0);
   var $$etemp$0$0=2;
   var $$etemp$0$1=0;
   var $call18=_clCreateBuffer($12, $$etemp$0$0, $$etemp$0$1, $mul17, 0, 0);
   HEAP32[((3744)>>2)]=$call18;
   var $16=HEAP32[((3744)>>2)];
   var $tobool19=($16|0)!=0;
   if ($tobool19) { label = 9; break; } else { label = 8; break; }
  case 8: 
   var $call21=_printf(((992)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=-1;
   label = 10; break;
  case 9: 
   $retval=0;
   label = 10; break;
  case 10: 
   var $17=$retval;
   STACKTOP = sp;
   return $17;
  default: assert(0, "bad label: " + label);
 }
}
function _LoadTextFromFile($file_name, $result_string, $string_len) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; STACKTOP = (STACKTOP + 80)|0; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $retval;
   var $file_name_addr;
   var $result_string_addr;
   var $string_len_addr;
   var $fd;
   var $file_len;
   var $file_status=sp;
   var $ret;
   $file_name_addr=$file_name;
   $result_string_addr=$result_string;
   $string_len_addr=$string_len;
   var $0=$string_len_addr;
   HEAP32[(($0)>>2)]=0;
   var $1=$file_name_addr;
   var $call=_open($1, 0, (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 1)|0,STACKTOP = (((STACKTOP)+7)&-8),(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=0,tempVarArgs)); STACKTOP=tempVarArgs;
   $fd=$call;
   var $2=$fd;
   var $cmp=($2|0)==-1;
   if ($cmp) { label = 2; break; } else { label = 3; break; }
  case 2: 
   var $3=$file_name_addr;
   var $call1=_printf(((384)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$3,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=-1;
   label = 8; break;
  case 3: 
   var $4=$fd;
   var $call2=_fstat($4, $file_status);
   $ret=$call2;
   var $5=$ret;
   var $tobool=($5|0)!=0;
   if ($tobool) { label = 4; break; } else { label = 5; break; }
  case 4: 
   var $6=$file_name_addr;
   var $call4=_printf(((344)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$6,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=-1;
   label = 8; break;
  case 5: 
   var $st_size=(($file_status+36)|0);
   var $7=HEAP32[(($st_size)>>2)];
   $file_len=$7;
   var $8=$file_len;
   var $add=((($8)+(1))|0);
   var $call6=_calloc($add, 1);
   var $9=$result_string_addr;
   HEAP32[(($9)>>2)]=$call6;
   var $10=$fd;
   var $11=$result_string_addr;
   var $12=HEAP32[(($11)>>2)];
   var $13=$file_len;
   var $call7=_read($10, $12, $13);
   $ret=$call7;
   var $14=$ret;
   var $tobool8=($14|0)!=0;
   if ($tobool8) { label = 7; break; } else { label = 6; break; }
  case 6: 
   var $15=$file_name_addr;
   var $call10=_printf(((312)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 8)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$15,tempVarArgs)); STACKTOP=tempVarArgs;
   $retval=-1;
   label = 8; break;
  case 7: 
   var $16=$fd;
   var $call12=_close($16);
   var $17=$file_len;
   var $18=$string_len_addr;
   HEAP32[(($18)>>2)]=$17;
   $retval=0;
   label = 8; break;
  case 8: 
   var $19=$retval;
   STACKTOP = sp;
   return $19;
  default: assert(0, "bad label: " + label);
 }
}
function _CreateTexture($width, $height) {
 var label = 0;
 var tempVarArgs = 0;
 var sp  = STACKTOP; (assert((STACKTOP|0) < (STACK_MAX|0))|0);
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $width_addr;
   var $height_addr;
   $width_addr=$width;
   $height_addr=$height;
   var $0=HEAP32[((2656)>>2)];
   var $tobool=($0|0)!=0;
   if ($tobool) { label = 2; break; } else { label = 3; break; }
  case 2: 
   _glDeleteTextures(1, 2656);
   label = 3; break;
  case 3: 
   HEAP32[((2656)>>2)]=0;
   var $1=$width_addr;
   var $2=$height_addr;
   var $call=_printf(((48)|0), (tempVarArgs=STACKTOP,STACKTOP = (STACKTOP + 16)|0,(assert((STACKTOP|0) < (STACK_MAX|0))|0),HEAP32[((tempVarArgs)>>2)]=$1,HEAP32[(((tempVarArgs)+(8))>>2)]=$2,tempVarArgs)); STACKTOP=tempVarArgs;
   var $3=$width_addr;
   HEAP32[((1920)>>2)]=$3;
   var $4=$height_addr;
   HEAP32[((1960)>>2)]=$4;
   var $5=HEAP32[((2136)>>2)];
   _glActiveTexture($5);
   _glGenTextures(1, 2656);
   var $6=HEAP32[((1944)>>2)];
   var $7=HEAP32[((2656)>>2)];
   _glBindTexture($6, $7);
   var $8=HEAP32[((1944)>>2)];
   _glTexParameteri($8, 10240, 9728);
   var $9=HEAP32[((1944)>>2)];
   _glTexParameteri($9, 10241, 9728);
   var $10=HEAP32[((1944)>>2)];
   var $11=HEAP32[((1952)>>2)];
   var $12=HEAP32[((1920)>>2)];
   var $13=HEAP32[((1960)>>2)];
   var $14=HEAP32[((1968)>>2)];
   var $15=HEAP32[((1936)>>2)];
   _glTexImage2D($10, 0, $11, $12, $13, 0, $14, $15, 0);
   var $16=HEAP32[((1944)>>2)];
   _glBindTexture($16, 0);
   STACKTOP = sp;
   return;
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
   var $0=HEAP32[((((2168)|0))>>2)];
   var $shr3=$0 >>> ($shr>>>0);
   var $and4=$shr3 & 3;
   var $cmp5=($and4|0)==0;
   if ($cmp5) { label = 12; break; } else { label = 5; break; }
  case 5: 
   var $neg=$shr3 & 1;
   var $and7=$neg ^ 1;
   var $add8=((($and7)+($shr))|0);
   var $shl=$add8 << 1;
   var $arrayidx=((2208+($shl<<2))|0);
   var $1=$arrayidx;
   var $arrayidx_sum=((($shl)+(2))|0);
   var $2=((2208+($arrayidx_sum<<2))|0);
   var $3=HEAP32[(($2)>>2)];
   var $fd9=(($3+8)|0);
   var $4=HEAP32[(($fd9)>>2)];
   var $cmp10=($1|0)==($4|0);
   if ($cmp10) { label = 6; break; } else { label = 7; break; }
  case 6: 
   var $shl12=1 << $add8;
   var $neg13=$shl12 ^ -1;
   var $and14=$0 & $neg13;
   HEAP32[((((2168)|0))>>2)]=$and14;
   label = 11; break;
  case 7: 
   var $5=$4;
   var $6=HEAP32[((((2184)|0))>>2)];
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
   var $12=HEAP32[((((2176)|0))>>2)];
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
   var $arrayidx66=((2208+($shl65<<2))|0);
   var $13=$arrayidx66;
   var $arrayidx66_sum=((($shl65)+(2))|0);
   var $14=((2208+($arrayidx66_sum<<2))|0);
   var $15=HEAP32[(($14)>>2)];
   var $fd69=(($15+8)|0);
   var $16=HEAP32[(($fd69)>>2)];
   var $cmp70=($13|0)==($16|0);
   if ($cmp70) { label = 15; break; } else { label = 16; break; }
  case 15: 
   var $shl72=1 << $add64;
   var $neg73=$shl72 ^ -1;
   var $and74=$0 & $neg73;
   HEAP32[((((2168)|0))>>2)]=$and74;
   label = 20; break;
  case 16: 
   var $17=$16;
   var $18=HEAP32[((((2184)|0))>>2)];
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
   var $23=HEAP32[((((2176)|0))>>2)];
   var $cmp99=($23|0)==0;
   if ($cmp99) { label = 26; break; } else { label = 21; break; }
  case 21: 
   var $24=HEAP32[((((2188)|0))>>2)];
   var $shr101=$23 >>> 3;
   var $shl102=$shr101 << 1;
   var $arrayidx103=((2208+($shl102<<2))|0);
   var $25=$arrayidx103;
   var $26=HEAP32[((((2168)|0))>>2)];
   var $shl105=1 << $shr101;
   var $and106=$26 & $shl105;
   var $tobool107=($and106|0)==0;
   if ($tobool107) { label = 22; break; } else { label = 23; break; }
  case 22: 
   var $or110=$26 | $shl105;
   HEAP32[((((2168)|0))>>2)]=$or110;
   var $arrayidx103_sum_pre=((($shl102)+(2))|0);
   var $_pre=((2208+($arrayidx103_sum_pre<<2))|0);
   var $F104_0 = $25;var $_pre_phi = $_pre;label = 25; break;
  case 23: 
   var $arrayidx103_sum104=((($shl102)+(2))|0);
   var $27=((2208+($arrayidx103_sum104<<2))|0);
   var $28=HEAP32[(($27)>>2)];
   var $29=$28;
   var $30=HEAP32[((((2184)|0))>>2)];
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
   HEAP32[((((2176)|0))>>2)]=$sub91;
   HEAP32[((((2188)|0))>>2)]=$21;
   var $31=$fd69;
   var $mem_0 = $31;label = 341; break;
  case 27: 
   var $32=HEAP32[((((2172)|0))>>2)];
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
   var $arrayidx_i=((2472+($add20_i<<2))|0);
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
   var $39=HEAP32[((((2184)|0))>>2)];
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
   var $arrayidx94_i=((2472+($52<<2))|0);
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
   var $55=HEAP32[((((2172)|0))>>2)];
   var $and103_i=$55 & $neg_i;
   HEAP32[((((2172)|0))>>2)]=$and103_i;
   label = 67; break;
  case 51: 
   var $56=$41;
   var $57=HEAP32[((((2184)|0))>>2)];
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
   var $60=HEAP32[((((2184)|0))>>2)];
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
   var $63=HEAP32[((((2184)|0))>>2)];
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
   var $66=HEAP32[((((2184)|0))>>2)];
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
   var $70=HEAP32[((((2176)|0))>>2)];
   var $cmp191_i=($70|0)==0;
   if ($cmp191_i) { label = 75; break; } else { label = 70; break; }
  case 70: 
   var $71=HEAP32[((((2188)|0))>>2)];
   var $shr194_i=$70 >>> 3;
   var $shl195_i=$shr194_i << 1;
   var $arrayidx196_i=((2208+($shl195_i<<2))|0);
   var $72=$arrayidx196_i;
   var $73=HEAP32[((((2168)|0))>>2)];
   var $shl198_i=1 << $shr194_i;
   var $and199_i=$73 & $shl198_i;
   var $tobool200_i=($and199_i|0)==0;
   if ($tobool200_i) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $or204_i=$73 | $shl198_i;
   HEAP32[((((2168)|0))>>2)]=$or204_i;
   var $arrayidx196_sum_pre_i=((($shl195_i)+(2))|0);
   var $_pre_i=((2208+($arrayidx196_sum_pre_i<<2))|0);
   var $F197_0_i = $72;var $_pre_phi_i = $_pre_i;label = 74; break;
  case 72: 
   var $arrayidx196_sum2_i=((($shl195_i)+(2))|0);
   var $74=((2208+($arrayidx196_sum2_i<<2))|0);
   var $75=HEAP32[(($74)>>2)];
   var $76=$75;
   var $77=HEAP32[((((2184)|0))>>2)];
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
   HEAP32[((((2176)|0))>>2)]=$rsize_0_i;
   HEAP32[((((2188)|0))>>2)]=$40;
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
   var $79=HEAP32[((((2172)|0))>>2)];
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
   var $arrayidx_i119=((2472+($idx_0_i<<2))|0);
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
   var $arrayidx93_i=((2472+($add91_i<<2))|0);
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
   var $88=HEAP32[((((2176)|0))>>2)];
   var $sub117_i=((($88)-($and144))|0);
   var $cmp118_i=($rsize_3_lcssa_i>>>0) < ($sub117_i>>>0);
   if ($cmp118_i) { label = 98; break; } else { var $nb_0 = $and144;label = 160; break; }
  case 98: 
   var $89=$v_3_lcssa_i;
   var $90=HEAP32[((((2184)|0))>>2)];
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
   var $arrayidx183_i=((2472+($103<<2))|0);
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
   var $106=HEAP32[((((2172)|0))>>2)];
   var $and193_i=$106 & $neg_i141;
   HEAP32[((((2172)|0))>>2)]=$and193_i;
   label = 133; break;
  case 117: 
   var $107=$92;
   var $108=HEAP32[((((2184)|0))>>2)];
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
   var $111=HEAP32[((((2184)|0))>>2)];
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
   var $114=HEAP32[((((2184)|0))>>2)];
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
   var $117=HEAP32[((((2184)|0))>>2)];
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
   var $arrayidx288_i=((2208+($shl287_i<<2))|0);
   var $121=$arrayidx288_i;
   var $122=HEAP32[((((2168)|0))>>2)];
   var $shl290_i=1 << $shr282_i;
   var $and291_i=$122 & $shl290_i;
   var $tobool292_i=($and291_i|0)==0;
   if ($tobool292_i) { label = 137; break; } else { label = 138; break; }
  case 137: 
   var $or296_i=$122 | $shl290_i;
   HEAP32[((((2168)|0))>>2)]=$or296_i;
   var $arrayidx288_sum_pre_i=((($shl287_i)+(2))|0);
   var $_pre_i146=((2208+($arrayidx288_sum_pre_i<<2))|0);
   var $F289_0_i = $121;var $_pre_phi_i147 = $_pre_i146;label = 140; break;
  case 138: 
   var $arrayidx288_sum16_i=((($shl287_i)+(2))|0);
   var $123=((2208+($arrayidx288_sum16_i<<2))|0);
   var $124=HEAP32[(($123)>>2)];
   var $125=$124;
   var $126=HEAP32[((((2184)|0))>>2)];
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
   var $arrayidx354_i=((2472+($I315_0_i<<2))|0);
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
   var $132=HEAP32[((((2172)|0))>>2)];
   var $shl361_i=1 << $I315_0_i;
   var $and362_i=$132 & $shl361_i;
   var $tobool363_i=($and362_i|0)==0;
   if ($tobool363_i) { label = 145; break; } else { label = 146; break; }
  case 145: 
   var $or367_i=$132 | $shl361_i;
   HEAP32[((((2172)|0))>>2)]=$or367_i;
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
   var $141=HEAP32[((((2184)|0))>>2)];
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
   var $147=HEAP32[((((2184)|0))>>2)];
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
   var $153=HEAP32[((((2176)|0))>>2)];
   var $cmp155=($nb_0>>>0) > ($153>>>0);
   if ($cmp155) { label = 165; break; } else { label = 161; break; }
  case 161: 
   var $sub159=((($153)-($nb_0))|0);
   var $154=HEAP32[((((2188)|0))>>2)];
   var $cmp161=($sub159>>>0) > 15;
   if ($cmp161) { label = 162; break; } else { label = 163; break; }
  case 162: 
   var $155=$154;
   var $add_ptr165=(($155+$nb_0)|0);
   var $156=$add_ptr165;
   HEAP32[((((2188)|0))>>2)]=$156;
   HEAP32[((((2176)|0))>>2)]=$sub159;
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
   HEAP32[((((2176)|0))>>2)]=0;
   HEAP32[((((2188)|0))>>2)]=0;
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
   var $162=HEAP32[((((2180)|0))>>2)];
   var $cmp183=($nb_0>>>0) < ($162>>>0);
   if ($cmp183) { label = 166; break; } else { label = 167; break; }
  case 166: 
   var $sub187=((($162)-($nb_0))|0);
   HEAP32[((((2180)|0))>>2)]=$sub187;
   var $163=HEAP32[((((2192)|0))>>2)];
   var $164=$163;
   var $add_ptr190=(($164+$nb_0)|0);
   var $165=$add_ptr190;
   HEAP32[((((2192)|0))>>2)]=$165;
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
   var $168=HEAP32[((((2144)|0))>>2)];
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
   HEAP32[((((2152)|0))>>2)]=$call_i_i;
   HEAP32[((((2148)|0))>>2)]=$call_i_i;
   HEAP32[((((2156)|0))>>2)]=-1;
   HEAP32[((((2160)|0))>>2)]=-1;
   HEAP32[((((2164)|0))>>2)]=0;
   HEAP32[((((2612)|0))>>2)]=0;
   var $call6_i_i=_time(0);
   var $xor_i_i=$call6_i_i & -16;
   var $and7_i_i=$xor_i_i ^ 1431655768;
   HEAP32[((((2144)|0))>>2)]=$and7_i_i;
   label = 171; break;
  case 171: 
   var $add_i149=((($nb_0)+(48))|0);
   var $169=HEAP32[((((2152)|0))>>2)];
   var $sub_i150=((($nb_0)+(47))|0);
   var $add9_i=((($169)+($sub_i150))|0);
   var $neg_i151=(((-$169))|0);
   var $and11_i=$add9_i & $neg_i151;
   var $cmp12_i=($and11_i>>>0) > ($nb_0>>>0);
   if ($cmp12_i) { label = 172; break; } else { var $mem_0 = 0;label = 341; break; }
  case 172: 
   var $170=HEAP32[((((2608)|0))>>2)];
   var $cmp15_i=($170|0)==0;
   if ($cmp15_i) { label = 174; break; } else { label = 173; break; }
  case 173: 
   var $171=HEAP32[((((2600)|0))>>2)];
   var $add17_i152=((($171)+($and11_i))|0);
   var $cmp19_i=($add17_i152>>>0) <= ($171>>>0);
   var $cmp21_i=($add17_i152>>>0) > ($170>>>0);
   var $or_cond1_i=$cmp19_i | $cmp21_i;
   if ($or_cond1_i) { var $mem_0 = 0;label = 341; break; } else { label = 174; break; }
  case 174: 
   var $172=HEAP32[((((2612)|0))>>2)];
   var $and26_i=$172 & 4;
   var $tobool27_i=($and26_i|0)==0;
   if ($tobool27_i) { label = 175; break; } else { var $tsize_1_i = 0;label = 198; break; }
  case 175: 
   var $173=HEAP32[((((2192)|0))>>2)];
   var $cmp29_i=($173|0)==0;
   if ($cmp29_i) { label = 181; break; } else { label = 176; break; }
  case 176: 
   var $174=$173;
   var $sp_0_i_i = ((2616)|0);label = 177; break;
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
   var $179=HEAP32[((((2148)|0))>>2)];
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
   var $180=HEAP32[((((2600)|0))>>2)];
   var $add51_i=((($180)+($ssize_0_i))|0);
   var $cmp52_i=($ssize_0_i>>>0) > ($nb_0>>>0);
   var $cmp54_i158=($ssize_0_i>>>0) < 2147483647;
   var $or_cond_i159=$cmp52_i & $cmp54_i158;
   if ($or_cond_i159) { label = 185; break; } else { var $tsize_0758385_i = 0;label = 197; break; }
  case 185: 
   var $181=HEAP32[((((2608)|0))>>2)];
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
   var $182=HEAP32[((((2180)|0))>>2)];
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
   var $185=HEAP32[((((2152)|0))>>2)];
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
   var $186=HEAP32[((((2612)|0))>>2)];
   var $or_i165=$186 | 4;
   HEAP32[((((2612)|0))>>2)]=$or_i165;
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
   var $187=HEAP32[((((2600)|0))>>2)];
   var $add147_i=((($187)+($tsize_291_i))|0);
   HEAP32[((((2600)|0))>>2)]=$add147_i;
   var $188=HEAP32[((((2604)|0))>>2)];
   var $cmp148_i=($add147_i>>>0) > ($188>>>0);
   if ($cmp148_i) { label = 202; break; } else { label = 203; break; }
  case 202: 
   HEAP32[((((2604)|0))>>2)]=$add147_i;
   label = 203; break;
  case 203: 
   var $189=HEAP32[((((2192)|0))>>2)];
   var $cmp154_i=($189|0)==0;
   if ($cmp154_i) { label = 204; break; } else { var $sp_0105_i = ((2616)|0);label = 211; break; }
  case 204: 
   var $190=HEAP32[((((2184)|0))>>2)];
   var $cmp156_i=($190|0)==0;
   var $cmp159_i168=($tbase_292_i>>>0) < ($190>>>0);
   var $or_cond8_i=$cmp156_i | $cmp159_i168;
   if ($or_cond8_i) { label = 205; break; } else { label = 206; break; }
  case 205: 
   HEAP32[((((2184)|0))>>2)]=$tbase_292_i;
   label = 206; break;
  case 206: 
   HEAP32[((((2616)|0))>>2)]=$tbase_292_i;
   HEAP32[((((2620)|0))>>2)]=$tsize_291_i;
   HEAP32[((((2628)|0))>>2)]=0;
   var $191=HEAP32[((((2144)|0))>>2)];
   HEAP32[((((2204)|0))>>2)]=$191;
   HEAP32[((((2200)|0))>>2)]=-1;
   var $i_02_i_i = 0;label = 207; break;
  case 207: 
   var $i_02_i_i;
   var $shl_i_i=$i_02_i_i << 1;
   var $arrayidx_i_i=((2208+($shl_i_i<<2))|0);
   var $192=$arrayidx_i_i;
   var $arrayidx_sum_i_i=((($shl_i_i)+(3))|0);
   var $193=((2208+($arrayidx_sum_i_i<<2))|0);
   HEAP32[(($193)>>2)]=$192;
   var $arrayidx_sum1_i_i=((($shl_i_i)+(2))|0);
   var $194=((2208+($arrayidx_sum1_i_i<<2))|0);
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
   HEAP32[((((2192)|0))>>2)]=$197;
   HEAP32[((((2180)|0))>>2)]=$sub5_i_i;
   var $or_i_i=$sub5_i_i | 1;
   var $add_ptr4_sum_i_i=((($cond_i_i)+(4))|0);
   var $head_i_i=(($tbase_292_i+$add_ptr4_sum_i_i)|0);
   var $198=$head_i_i;
   HEAP32[(($198)>>2)]=$or_i_i;
   var $add_ptr6_sum_i_i=((($tsize_291_i)-(36))|0);
   var $head7_i_i=(($tbase_292_i+$add_ptr6_sum_i_i)|0);
   var $199=$head7_i_i;
   HEAP32[(($199)>>2)]=40;
   var $200=HEAP32[((((2160)|0))>>2)];
   HEAP32[((((2196)|0))>>2)]=$200;
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
   var $206=HEAP32[((((2192)|0))>>2)];
   var $207=HEAP32[((((2180)|0))>>2)];
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
   HEAP32[((((2192)|0))>>2)]=$211;
   HEAP32[((((2180)|0))>>2)]=$sub5_i30_i;
   var $or_i31_i=$sub5_i30_i | 1;
   var $add_ptr4_sum_i32_i=((($cond_i28_i)+(4))|0);
   var $head_i33_i=(($208+$add_ptr4_sum_i32_i)|0);
   var $212=$head_i33_i;
   HEAP32[(($212)>>2)]=$or_i31_i;
   var $add_ptr6_sum_i34_i=((($add212_i)+(4))|0);
   var $head7_i35_i=(($208+$add_ptr6_sum_i34_i)|0);
   var $213=$head7_i35_i;
   HEAP32[(($213)>>2)]=40;
   var $214=HEAP32[((((2160)|0))>>2)];
   HEAP32[((((2196)|0))>>2)]=$214;
   label = 338; break;
  case 218: 
   var $215=HEAP32[((((2184)|0))>>2)];
   var $cmp215_i=($tbase_292_i>>>0) < ($215>>>0);
   if ($cmp215_i) { label = 219; break; } else { label = 220; break; }
  case 219: 
   HEAP32[((((2184)|0))>>2)]=$tbase_292_i;
   label = 220; break;
  case 220: 
   var $add_ptr224_i=(($tbase_292_i+$tsize_291_i)|0);
   var $sp_1101_i = ((2616)|0);label = 221; break;
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
   var $227=HEAP32[((((2192)|0))>>2)];
   var $cmp20_i_i=($224|0)==($227|0);
   if ($cmp20_i_i) { label = 229; break; } else { label = 230; break; }
  case 229: 
   var $228=HEAP32[((((2180)|0))>>2)];
   var $add_i_i=((($228)+($sub18_i_i))|0);
   HEAP32[((((2180)|0))>>2)]=$add_i_i;
   HEAP32[((((2192)|0))>>2)]=$225;
   var $or22_i_i=$add_i_i | 1;
   var $add_ptr17_sum39_i_i=((($add_ptr4_sum_i50_i)+(4))|0);
   var $head23_i_i=(($tbase_292_i+$add_ptr17_sum39_i_i)|0);
   var $229=$head23_i_i;
   HEAP32[(($229)>>2)]=$or22_i_i;
   label = 303; break;
  case 230: 
   var $230=HEAP32[((((2188)|0))>>2)];
   var $cmp24_i_i=($224|0)==($230|0);
   if ($cmp24_i_i) { label = 231; break; } else { label = 232; break; }
  case 231: 
   var $231=HEAP32[((((2176)|0))>>2)];
   var $add26_i_i=((($231)+($sub18_i_i))|0);
   HEAP32[((((2176)|0))>>2)]=$add26_i_i;
   HEAP32[((((2188)|0))>>2)]=$225;
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
   var $arrayidx_i58_i=((2208+($shl_i57_i<<2))|0);
   var $239=$arrayidx_i58_i;
   var $cmp41_i_i=($236|0)==($239|0);
   if ($cmp41_i_i) { label = 237; break; } else { label = 235; break; }
  case 235: 
   var $240=$236;
   var $241=HEAP32[((((2184)|0))>>2)];
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
   var $243=HEAP32[((((2168)|0))>>2)];
   var $and49_i_i=$243 & $neg_i_i;
   HEAP32[((((2168)|0))>>2)]=$and49_i_i;
   label = 279; break;
  case 239: 
   var $cmp54_i_i=($238|0)==($239|0);
   if ($cmp54_i_i) { label = 240; break; } else { label = 241; break; }
  case 240: 
   var $fd68_pre_i_i=(($238+8)|0);
   var $fd68_pre_phi_i_i = $fd68_pre_i_i;label = 243; break;
  case 241: 
   var $244=$238;
   var $245=HEAP32[((((2184)|0))>>2)];
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
   var $255=HEAP32[((((2184)|0))>>2)];
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
   var $264=HEAP32[((((2184)|0))>>2)];
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
   var $arrayidx123_i_i=((2472+($266<<2))|0);
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
   var $269=HEAP32[((((2172)|0))>>2)];
   var $and133_i_i=$269 & $neg132_i_i;
   HEAP32[((((2172)|0))>>2)]=$and133_i_i;
   label = 279; break;
  case 263: 
   var $270=$249;
   var $271=HEAP32[((((2184)|0))>>2)];
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
   var $274=HEAP32[((((2184)|0))>>2)];
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
   var $277=HEAP32[((((2184)|0))>>2)];
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
   var $281=HEAP32[((((2184)|0))>>2)];
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
   var $arrayidx223_i_i=((2208+($shl221_i_i<<2))|0);
   var $285=$arrayidx223_i_i;
   var $286=HEAP32[((((2168)|0))>>2)];
   var $shl226_i_i=1 << $shr214_i_i;
   var $and227_i_i=$286 & $shl226_i_i;
   var $tobool228_i_i=($and227_i_i|0)==0;
   if ($tobool228_i_i) { label = 282; break; } else { label = 283; break; }
  case 282: 
   var $or232_i_i=$286 | $shl226_i_i;
   HEAP32[((((2168)|0))>>2)]=$or232_i_i;
   var $arrayidx223_sum_pre_i_i=((($shl221_i_i)+(2))|0);
   var $_pre_i67_i=((2208+($arrayidx223_sum_pre_i_i<<2))|0);
   var $F224_0_i_i = $285;var $_pre_phi_i68_i = $_pre_i67_i;label = 285; break;
  case 283: 
   var $arrayidx223_sum25_i_i=((($shl221_i_i)+(2))|0);
   var $287=((2208+($arrayidx223_sum25_i_i<<2))|0);
   var $288=HEAP32[(($287)>>2)];
   var $289=$288;
   var $290=HEAP32[((((2184)|0))>>2)];
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
   var $arrayidx287_i_i=((2472+($I252_0_i_i<<2))|0);
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
   var $296=HEAP32[((((2172)|0))>>2)];
   var $shl294_i_i=1 << $I252_0_i_i;
   var $and295_i_i=$296 & $shl294_i_i;
   var $tobool296_i_i=($and295_i_i|0)==0;
   if ($tobool296_i_i) { label = 290; break; } else { label = 291; break; }
  case 290: 
   var $or300_i_i=$296 | $shl294_i_i;
   HEAP32[((((2172)|0))>>2)]=$or300_i_i;
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
   var $305=HEAP32[((((2184)|0))>>2)];
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
   var $311=HEAP32[((((2184)|0))>>2)];
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
   var $sp_0_i_i_i = ((2616)|0);label = 305; break;
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
   HEAP32[((((2192)|0))>>2)]=$325;
   HEAP32[((((2180)|0))>>2)]=$sub5_i_i_i;
   var $or_i_i_i=$sub5_i_i_i | 1;
   var $add_ptr4_sum_i_i_i=((($cond_i_i_i)+(4))|0);
   var $head_i_i_i=(($tbase_292_i+$add_ptr4_sum_i_i_i)|0);
   var $326=$head_i_i_i;
   HEAP32[(($326)>>2)]=$or_i_i_i;
   var $add_ptr6_sum_i_i_i=((($tsize_291_i)-(36))|0);
   var $head7_i_i_i=(($tbase_292_i+$add_ptr6_sum_i_i_i)|0);
   var $327=$head7_i_i_i;
   HEAP32[(($327)>>2)]=40;
   var $328=HEAP32[((((2160)|0))>>2)];
   HEAP32[((((2196)|0))>>2)]=$328;
   var $head_i19_i=(($cond13_i_i+4)|0);
   var $329=$head_i19_i;
   HEAP32[(($329)>>2)]=27;
   assert(16 % 1 === 0);HEAP32[(($add_ptr14_i_i)>>2)]=HEAP32[(((((2616)|0)))>>2)];HEAP32[((($add_ptr14_i_i)+(4))>>2)]=HEAP32[((((((2616)|0)))+(4))>>2)];HEAP32[((($add_ptr14_i_i)+(8))>>2)]=HEAP32[((((((2616)|0)))+(8))>>2)];HEAP32[((($add_ptr14_i_i)+(12))>>2)]=HEAP32[((((((2616)|0)))+(12))>>2)];
   HEAP32[((((2616)|0))>>2)]=$tbase_292_i;
   HEAP32[((((2620)|0))>>2)]=$tsize_291_i;
   HEAP32[((((2628)|0))>>2)]=0;
   HEAP32[((((2624)|0))>>2)]=$322;
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
   var $arrayidx_i22_i=((2208+($shl_i21_i<<2))|0);
   var $337=$arrayidx_i22_i;
   var $338=HEAP32[((((2168)|0))>>2)];
   var $shl39_i_i=1 << $shr_i_i;
   var $and40_i_i=$338 & $shl39_i_i;
   var $tobool_i_i=($and40_i_i|0)==0;
   if ($tobool_i_i) { label = 317; break; } else { label = 318; break; }
  case 317: 
   var $or44_i_i=$338 | $shl39_i_i;
   HEAP32[((((2168)|0))>>2)]=$or44_i_i;
   var $arrayidx_sum_pre_i_i=((($shl_i21_i)+(2))|0);
   var $_pre_i_i=((2208+($arrayidx_sum_pre_i_i<<2))|0);
   var $F_0_i_i = $337;var $_pre_phi_i_i = $_pre_i_i;label = 320; break;
  case 318: 
   var $arrayidx_sum10_i_i=((($shl_i21_i)+(2))|0);
   var $339=((2208+($arrayidx_sum10_i_i<<2))|0);
   var $340=HEAP32[(($339)>>2)];
   var $341=$340;
   var $342=HEAP32[((((2184)|0))>>2)];
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
   var $arrayidx91_i_i=((2472+($I57_0_i_i<<2))|0);
   var $index_i_i=(($189+28)|0);
   var $I57_0_c_i_i=$I57_0_i_i;
   HEAP32[(($index_i_i)>>2)]=$I57_0_c_i_i;
   var $arrayidx92_i_i=(($189+20)|0);
   HEAP32[(($arrayidx92_i_i)>>2)]=0;
   var $344=(($189+16)|0);
   HEAP32[(($344)>>2)]=0;
   var $345=HEAP32[((((2172)|0))>>2)];
   var $shl95_i_i=1 << $I57_0_i_i;
   var $and96_i_i=$345 & $shl95_i_i;
   var $tobool97_i_i=($and96_i_i|0)==0;
   if ($tobool97_i_i) { label = 325; break; } else { label = 326; break; }
  case 325: 
   var $or101_i_i=$345 | $shl95_i_i;
   HEAP32[((((2172)|0))>>2)]=$or101_i_i;
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
   var $350=HEAP32[((((2184)|0))>>2)];
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
   var $353=HEAP32[((((2184)|0))>>2)];
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
   var $355=HEAP32[((((2180)|0))>>2)];
   var $cmp250_i=($355>>>0) > ($nb_0>>>0);
   if ($cmp250_i) { label = 339; break; } else { label = 340; break; }
  case 339: 
   var $sub253_i=((($355)-($nb_0))|0);
   HEAP32[((((2180)|0))>>2)]=$sub253_i;
   var $356=HEAP32[((((2192)|0))>>2)];
   var $357=$356;
   var $add_ptr255_i=(($357+$nb_0)|0);
   var $358=$add_ptr255_i;
   HEAP32[((((2192)|0))>>2)]=$358;
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
   var $1=HEAP32[((((2184)|0))>>2)];
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
   var $7=HEAP32[((((2188)|0))>>2)];
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
   var $arrayidx=((2208+($shl<<2))|0);
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
   var $15=HEAP32[((((2168)|0))>>2)];
   var $and46=$15 & $neg;
   HEAP32[((((2168)|0))>>2)]=$and46;
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
   var $arrayidx130=((2472+($35<<2))|0);
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
   var $38=HEAP32[((((2172)|0))>>2)];
   var $and140=$38 & $neg139;
   HEAP32[((((2172)|0))>>2)]=$and140;
   var $p_0 = $6;var $psize_0 = $add17;label = 56; break;
  case 38: 
   var $39=$20;
   var $40=HEAP32[((((2184)|0))>>2)];
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
   var $43=HEAP32[((((2184)|0))>>2)];
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
   var $46=HEAP32[((((2184)|0))>>2)];
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
   var $50=HEAP32[((((2184)|0))>>2)];
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
   HEAP32[((((2176)|0))>>2)]=$add17;
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
   var $58=HEAP32[((((2192)|0))>>2)];
   var $cmp240=($4|0)==($58|0);
   if ($cmp240) { label = 60; break; } else { label = 62; break; }
  case 60: 
   var $59=HEAP32[((((2180)|0))>>2)];
   var $add243=((($59)+($psize_0))|0);
   HEAP32[((((2180)|0))>>2)]=$add243;
   HEAP32[((((2192)|0))>>2)]=$p_0;
   var $or244=$add243 | 1;
   var $head245=(($p_0+4)|0);
   HEAP32[(($head245)>>2)]=$or244;
   var $60=HEAP32[((((2188)|0))>>2)];
   var $cmp246=($p_0|0)==($60|0);
   if ($cmp246) { label = 61; break; } else { label = 140; break; }
  case 61: 
   HEAP32[((((2188)|0))>>2)]=0;
   HEAP32[((((2176)|0))>>2)]=0;
   label = 140; break;
  case 62: 
   var $61=HEAP32[((((2188)|0))>>2)];
   var $cmp251=($4|0)==($61|0);
   if ($cmp251) { label = 63; break; } else { label = 64; break; }
  case 63: 
   var $62=HEAP32[((((2176)|0))>>2)];
   var $add254=((($62)+($psize_0))|0);
   HEAP32[((((2176)|0))>>2)]=$add254;
   HEAP32[((((2188)|0))>>2)]=$p_0;
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
   var $arrayidx274=((2208+($shl273<<2))|0);
   var $67=$arrayidx274;
   var $cmp275=($64|0)==($67|0);
   if ($cmp275) { label = 68; break; } else { label = 66; break; }
  case 66: 
   var $68=$64;
   var $69=HEAP32[((((2184)|0))>>2)];
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
   var $71=HEAP32[((((2168)|0))>>2)];
   var $and296=$71 & $neg295;
   HEAP32[((((2168)|0))>>2)]=$and296;
   label = 110; break;
  case 70: 
   var $cmp300=($66|0)==($67|0);
   if ($cmp300) { label = 71; break; } else { label = 72; break; }
  case 71: 
   var $fd317_pre=(($66+8)|0);
   var $fd317_pre_phi = $fd317_pre;label = 74; break;
  case 72: 
   var $72=$66;
   var $73=HEAP32[((((2184)|0))>>2)];
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
   var $83=HEAP32[((((2184)|0))>>2)];
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
   var $92=HEAP32[((((2184)|0))>>2)];
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
   var $arrayidx395=((2472+($94<<2))|0);
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
   var $97=HEAP32[((((2172)|0))>>2)];
   var $and405=$97 & $neg404;
   HEAP32[((((2172)|0))>>2)]=$and405;
   label = 110; break;
  case 94: 
   var $98=$77;
   var $99=HEAP32[((((2184)|0))>>2)];
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
   var $102=HEAP32[((((2184)|0))>>2)];
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
   var $105=HEAP32[((((2184)|0))>>2)];
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
   var $109=HEAP32[((((2184)|0))>>2)];
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
   var $110=HEAP32[((((2188)|0))>>2)];
   var $cmp479=($p_0|0)==($110|0);
   if ($cmp479) { label = 111; break; } else { var $psize_1 = $add262;label = 113; break; }
  case 111: 
   HEAP32[((((2176)|0))>>2)]=$add262;
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
   var $arrayidx501=((2208+($shl500<<2))|0);
   var $111=$arrayidx501;
   var $112=HEAP32[((((2168)|0))>>2)];
   var $shl503=1 << $shr493;
   var $and504=$112 & $shl503;
   var $tobool505=($and504|0)==0;
   if ($tobool505) { label = 115; break; } else { label = 116; break; }
  case 115: 
   var $or508=$112 | $shl503;
   HEAP32[((((2168)|0))>>2)]=$or508;
   var $arrayidx501_sum_pre=((($shl500)+(2))|0);
   var $_pre=((2208+($arrayidx501_sum_pre<<2))|0);
   var $F502_0 = $111;var $_pre_phi = $_pre;label = 118; break;
  case 116: 
   var $arrayidx501_sum245=((($shl500)+(2))|0);
   var $113=((2208+($arrayidx501_sum245<<2))|0);
   var $114=HEAP32[(($113)>>2)];
   var $115=$114;
   var $116=HEAP32[((((2184)|0))>>2)];
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
   var $arrayidx559=((2472+($I526_0<<2))|0);
   var $index560=(($p_0+28)|0);
   var $I526_0_c=$I526_0;
   HEAP32[(($index560)>>2)]=$I526_0_c;
   var $arrayidx562=(($p_0+20)|0);
   HEAP32[(($arrayidx562)>>2)]=0;
   var $118=(($p_0+16)|0);
   HEAP32[(($118)>>2)]=0;
   var $119=HEAP32[((((2172)|0))>>2)];
   var $shl565=1 << $I526_0;
   var $and566=$119 & $shl565;
   var $tobool567=($and566|0)==0;
   if ($tobool567) { label = 123; break; } else { label = 124; break; }
  case 123: 
   var $or570=$119 | $shl565;
   HEAP32[((((2172)|0))>>2)]=$or570;
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
   var $124=HEAP32[((((2184)|0))>>2)];
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
   var $127=HEAP32[((((2184)|0))>>2)];
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
   var $129=HEAP32[((((2200)|0))>>2)];
   var $dec=((($129)-(1))|0);
   HEAP32[((((2200)|0))>>2)]=$dec;
   var $cmp628=($dec|0)==0;
   if ($cmp628) { var $sp_0_in_i = ((2624)|0);label = 137; break; } else { label = 140; break; }
  case 137: 
   var $sp_0_in_i;
   var $sp_0_i=HEAP32[(($sp_0_in_i)>>2)];
   var $cmp_i=($sp_0_i|0)==0;
   var $next4_i=(($sp_0_i+8)|0);
   if ($cmp_i) { label = 138; break; } else { var $sp_0_in_i = $next4_i;label = 137; break; }
  case 138: 
   HEAP32[((((2200)|0))>>2)]=-1;
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
function _calloc($n_elements, $elem_size) {
 var label = 0;
 label = 1; 
 while(1) switch(label) {
  case 1: 
   var $cmp=($n_elements|0)==0;
   if ($cmp) { var $req_0 = 0;label = 4; break; } else { label = 2; break; }
  case 2: 
   var $mul=(Math.imul($elem_size,$n_elements)|0);
   var $or=$elem_size | $n_elements;
   var $tobool=($or>>>0) > 65535;
   if ($tobool) { label = 3; break; } else { var $req_0 = $mul;label = 4; break; }
  case 3: 
   var $div=(((($mul>>>0))/(($n_elements>>>0)))&-1);
   var $cmp1=($div|0)==($elem_size|0);
   var $mul_=$cmp1 ? $mul : -1;
   var $req_0 = $mul_;label = 4; break;
  case 4: 
   var $req_0;
   var $call=_malloc($req_0);
   var $cmp4=($call|0)==0;
   if ($cmp4) { label = 7; break; } else { label = 5; break; }
  case 5: 
   var $head=((($call)-(4))|0);
   var $0=$head;
   var $1=HEAP32[(($0)>>2)];
   var $and6=$1 & 3;
   var $cmp7=($and6|0)==0;
   if ($cmp7) { label = 7; break; } else { label = 6; break; }
  case 6: 
   _memset($call, 0, $req_0);
   label = 7; break;
  case 7: 
   return $call;
  default: assert(0, "bad label: " + label);
 }
}
Module["_calloc"] = _calloc;
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
      new DataRequest(0, 10531, 0, 0).open('GET', '/qjulia_kernel.cl');
    if (!Module.expectedDataFileDownloads) {
      Module.expectedDataFileDownloads = 0;
      Module.finishedDataFileDownloads = 0;
    }
    Module.expectedDataFileDownloads++;
    var PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    var PACKAGE_NAME = '../build/old/qjulia.data';
    var REMOTE_PACKAGE_NAME = 'qjulia.data';
    var PACKAGE_UUID = '6695ee3c-5826-4449-aab2-b06f3f9525f9';
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
          DataRequest.prototype.requests["/qjulia_kernel.cl"].onload();
          Module['removeRunDependency']('datafile_../build/old/qjulia.data');
    };
    Module['addRunDependency']('datafile_../build/old/qjulia.data');
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
//@ sourceMappingURL=qjulia.js.map