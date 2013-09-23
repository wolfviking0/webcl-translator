var LibraryOpenCL = {  

  $CL__deps: ['$GL'],
  $CL: {
    // Private array of chars to use
    cl_digits: [1,2,3,4,5,6,7,8,9,0],
    // Kernel parser
    cl_kernels_sig: {},
    // Pointer type (void*)
    cl_pn_type: 0,
    cl_objects: {},

#if OPENCL_DEBUG
    cl_objects_counter: 0,
#endif

    init: function() {
      if (typeof(webcl) === "undefined") {
        webcl = window.WebCL;
        if (typeof(webcl) === "undefined") {
          console.error("This browser has not WebCL implementation !!! \n");
          console.error("Use WebKit Samsung or Firefox Nokia plugin\n");     
        }
      }
    },
    
    udid: function (obj) {    
      var _id;

      if (obj !== undefined) {

        //if ( obj.hasOwnProperty('udid') ) {
        //  _id = obj.udid;

        //  if (_id !== undefined) {
        //    return _id;
        //  }
        //}
      }

      var _uuid = [];

      _uuid[0] = CL.cl_digits[0 | Math.random()*CL.cl_digits.length-1]; // First digit of udid can't be 0
      for (var i = 1; i < 8; i++) _uuid[i] = CL.cl_digits[0 | Math.random()*CL.cl_digits.length];

      _id = _uuid.join('');

#if OPENCL_DEBUG
      if (_id in CL.cl_objects) {
        console.error("/!\\ **********************");
        console.error("/!\\ UDID not unique !!!!!!");
        console.error("/!\\ **********************");        
      }
#endif
    
      // /!\ Call udid when you add inside cl_objects if you pass object in parameter
      if (obj !== undefined) {
        //Object.defineProperty(obj, "udid", { value : _id,writable : false });
        CL.cl_objects[_id]=obj;
#if OPENCL_DEBUG             
        CL.cl_objects_counter++,
        console.info("Counter++ HashMap Object : " + CL.cl_objects_counter + " - Udid : " + _id);
#endif      
      }

      return _id;      
    },

    parseKernel: function(kernel_string) {
      
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
        
        var _parameter = new Array(_kernel_parameter.length)
        for (var i = 0; i < _kernel_parameter.length; i ++) {

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
          } else if (_string.indexOf("uchar") >= 0 ) {
            _value = webcl.UNSIGNED_INT8;
          } else if (_string.indexOf("unsigned char") >= 0 ) {
            _value = webcl.UNSIGNED_INT8;
          } else if (_string.indexOf("uint") >= 0 ) {
            _value = webcl.UNSIGNED_INT32;
          } else if (_string.indexOf("unsigned int") >= 0 ) {
            _value = webcl.UNSIGNED_INT32;
          } else if (_string.indexOf("int") >= 0 ) {
            _value = webcl.SIGNED_INT32;
          } else {
#if OPENCL_DEBUG   
            console.error("Unknow parameter type use float by default ...");   
#endif        
            _value = webcl.FLOAT;
          }
          
          _parameter[i] = _value;
        }
        
        _kernel_struct[_kernels_name] = _parameter;
        
        _kernel_start = kernel_string.indexOf("__kernel");
      }
      
#if OPENCL_DEBUG
      for (var name in _kernel_struct) {
        console.info("Kernel NAME : " + name);      
        console.info("Kernel PARAMETER NUM : "+_kernel_struct[name].length);
      }
#endif 
    
      return _kernel_struct;
    },

    getTypeSizeBits: function(type) {  
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
        case webcl.UNSIGNED_INT32:          
        case webcl.SIGNED_INT32:
        case webcl.FLOAT:        
          _size = 4;
          break;      
        default:
          console.info("Use size for default type FLOAT, call clSetTypePointer() for set the pointer type ...\n");
          _size = 4;
          break;
      }
      
      return _size;
    },
    
    setPointerWithArray: function(ptr,array,type) {  
      switch(type) {
        case webcl.UNSIGNED_INT8:
        case webcl.SIGNED_INT8:
          for (var i = 0; i < array.length; i++) {
            {{{ makeSetValue('ptr', 'i', 'array[i]', 'i8') }}};      
          }
          break;
        case webcl.UNSIGNED_INT16:          
        case webcl.SIGNED_INT16:
          for (var i = 0; i < array.length; i++) {
            {{{ makeSetValue('ptr', 'i*2', 'array[i]', 'i16') }}};      
          }
          break;
        case webcl.UNSIGNED_INT32:
        case webcl.SIGNED_INT32:
          for (var i = 0; i < array.length; i++) {
            {{{ makeSetValue('ptr', 'i*4', 'array[i]', 'i32') }}};      
          }
          break;
        case webcl.FLOAT:
          for (var i = 0; i < array.length; i++) {
            {{{ makeSetValue('ptr', 'i*4', 'array[i]', 'float') }}};      
          }
          break;        
        default:
          console.info("Use default type FLOAT, call clSetTypePointer() for set the pointer type ...\n");
          for (var i = 0; i < array.length; i++) {
            {{{ makeSetValue('ptr', 'i*4', 'array[i]', 'i32') }}};      
          }
          break;
      }
    },
    
    getPointerToValue: function(ptr,size,type) {  
      var _value = null;
            
      switch(type) {
        case webcl.SIGNED_INT8:
        case webcl.UNSIGNED_INT8:          
          _value = {{{ makeGetValue('ptr', '0', 'i8') }}}
          break;
        case webcl.SIGNED_INT16:
        case webcl.UNSIGNED_INT16:
          _value = {{{ makeGetValue('ptr', '0', 'i16') }}}
          break;
        case webcl.SIGNED_INT32:
        case webcl.UNSIGNED_INT32:
          _value = {{{ makeGetValue('ptr', '0', 'i32') }}}
          break;
        case webcl.FLOAT:
          _value = {{{ makeGetValue('ptr', '0', 'float') }}}
          break;          
        default:
          console.info("Use default type FLOAT, call clSetTypePointer() for set the pointer type ...\n");
          _value = {{{ makeGetValue('ptr', '0', 'float') }}}
          break;
      }
      
      return _value;
    },
    
    getPointerToEmptyArray: function(size,type) {  
      var _host_ptr = null;
            
      switch(type) {
        case webcl.SIGNED_INT8:
          _host_ptr = new Int8Array(getTypeSizeBits(size));
          break;
        case webcl.SIGNED_INT16:
          _host_ptr = new Int16Array(getTypeSizeBits(size));
          break;
        case webcl.SIGNED_INT32:
          _host_ptr = new Int32Array(getTypeSizeBits(size));
          break;
        case webcl.UNSIGNED_INT8:
          _host_ptr = new UInt8Array(getTypeSizeBits(size));
          break;
        case webcl.UNSIGNED_INT16:
          _host_ptr = new UInt16Array(getTypeSizeBits(size));
          break;
        case webcl.UNSIGNED_INT32:
          _host_ptr = new UInt32Array(getTypeSizeBits(size));
          break;
        case webcl.FLOAT:
          _host_ptr = new Float32Array(getTypeSizeBits(size));
          break;          
        default:
          console.info("Use default type FLOAT, call clSetTypePointer() for set the pointer type ...\n");
          _host_ptr = new Float32Array(getTypeSizeBits(size));
          break;
      }
      
      return _host_ptr;
    },

    getPointerToArray: function(ptr,size,type) {  
      var _host_ptr = null;
            
      switch(type) {
        case webcl.SIGNED_INT8:
          _host_ptr = {{{ makeHEAPView('8','ptr','ptr+size') }}}
          break;
        case webcl.SIGNED_INT16:
          _host_ptr = {{{ makeHEAPView('16','ptr','ptr+size') }}}
          break;
        case webcl.SIGNED_INT32:
          _host_ptr = {{{ makeHEAPView('32','ptr','ptr+size') }}}
          break;
        case webcl.UNSIGNED_INT8:
          _host_ptr = {{{ makeHEAPView('U8','ptr','ptr+size') }}}
          break;
        case webcl.UNSIGNED_INT16:
          _host_ptr = {{{ makeHEAPView('U16','ptr','ptr+size') }}}
          break;
        case webcl.UNSIGNED_INT32:
          _host_ptr = {{{ makeHEAPView('U32','ptr','ptr+size') }}}
          break;
        case webcl.FLOAT:
          _host_ptr = {{{ makeHEAPView('F32','ptr','ptr+size') }}}
          break;          
        default:
          console.info("Use default type FLOAT, call clSetTypePointer() for set the pointer type ...\n");
          _host_ptr = {{{ makeHEAPView('F32','ptr','ptr+size') }}}
          break;
      }
      
      return _host_ptr;
    },
    
    getPointerToArrayBuffer: function(ptr,size,type) {  
      return CL.getPointerToArray(ptr,size,type).buffer;
    },

    catchError: function(e) {
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
    },

#if OPENCL_STACK_TRACE    
    stack_trace: "// Javascript webcl Stack Trace\n",

    webclBeginStackTrace: function(name,parameter) {
      CL.stack_trace += "\n" + name + "("

      CL.webclCallParameterStackTrace(parameter);

      CL.stack_trace += ")\n";
    },
        
    webclCallStackTrace: function(name,parameter) {
      CL.stack_trace += "\t->" + name + "("

      CL.webclCallParameterStackTrace(parameter);

      CL.stack_trace += ")\n";
    },

    webclCallParameterStackTrace: function(parameter) {
      for (var i = 0; i < parameter.length - 1 ; i++) {
        CL.stack_trace += parameter[i] + ",";
      }

      if (parameter.length >= 1) {
        CL.stack_trace += parameter[parameter.length - 1];
      }
    },

    webclEndStackTrace: function(result,message,exception) {
      CL.stack_trace += "\t\t=>Result (" + result[0];
      if (result.length >= 2) {
        CL.stack_trace += " : ";
      }

      for (var i = 1; i < result.length - 1 ; i++) {
        CL.stack_trace += ( result[i] == 0 ? '0' : {{{ makeGetValue('result[i]', '0', 'i32') }}} ) + " - ";
      }

      if (result.length >= 2) {
        CL.stack_trace +=  ( result[result.length - 1] == 0 ? '0' : {{{ makeGetValue('result[result.length - 1]', '0', 'i32') }}} );
      }

      CL.stack_trace += ") - Message (" + message + ") - Exception (" + exception + ")\n";
    },
#endif
  },

#if OPENCL_STACK_TRACE
  webclPrintStackTrace: function(param_value,param_value_size) {
    var _size = {{{ makeGetValue('param_value_size', '0', 'i32') }}} ;
    
    if (_size == 0) {
      {{{ makeSetValue('param_value_size', '0', 'CL.stack_trace.length', 'i32') }}} /* Size of char stack */;
    } else {
      writeStringToMemory(CL.stack_trace, param_value);
    }
    
    return webcl.SUCCESS;
  },
#endif

  clSetTypePointer: function(pn_type) {
    /*pn_type : CL_SIGNED_INT8,CL_SIGNED_INT16,CL_SIGNED_INT32,CL_UNSIGNED_INT8,CL_UNSIGNED_INT16,CL_UNSIGNED_INT32,CL_FLOAT*/
#if OPENCL_DEBUG    
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
#endif   
    CL.cl_pn_type = pn_type;
    return webcl.SUCCESS;
  },

  clGetPlatformIDs: function(num_entries,platforms,num_platforms) {

    // Test UDID 
    // for (var i = 0 ; i < 100000; i++) {
    //   CL.udid();
    // }

#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetPlatformIDs",[num_entries,platforms,num_platforms]);
#endif

    // Init webcl variable if necessary
    CL.init();

    if ( num_entries == 0 && platforms != 0) {
#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"num_entries is equal to zero and platforms is not NULL","");
#endif
      return webcl.INVALID_VALUE;
    }

    if ( num_platforms == 0 && platforms == 0) {
#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"both num_platforms and platforms are NULL","");
#endif
      return webcl.INVALID_VALUE;
    }

    try { 

#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace(webcl+".getPlatforms",[]);
#endif
      var _platforms = webcl.getPlatforms();

      if (num_platforms != 0) {
        {{{ makeSetValue('num_platforms', '0', 'Math.min(num_entries,_platforms.length)', 'i32') }}} /* Num of platforms */;
      } 

      if (platforms != 0) {
        for (var i = 0; i < Math.min(num_entries,_platforms.length); i++) {
          var _id = CL.udid(_platforms[i]);
          {{{ makeSetValue('platforms', 'i*4', '_id', 'i32') }}};
        }
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,platforms,num_platforms],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,platforms,num_platforms],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetPlatformInfo: function(platform,param_name,param_value_size,param_value,param_value_size_ret) {
    
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetPlatformInfo",[platform,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (platform in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[platform]+".getInfo",[param_name]);
#endif        

        var _info = CL.cl_objects[platform].getInfo(param_name);

        if (param_value != 0) {
          writeStringToMemory(_info, param_value);
        }
      
        if (param_value_size_ret != 0) {
          {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size,_info.length)', 'i32') }}};
        }
           
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_PLATFORM],"platform are NULL","");
#endif
        return webcl.INVALID_PLATFORM;
      }

    } catch (e) {
      var _error = CL.catchError(e);
      var _info = "undefined";

      if (param_value != 0) {
        writeStringToMemory(_info, param_value);
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size,_info.length)', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;

  },

  clGetDeviceIDs: function(platform,device_type_i64_1,device_type_i64_2,num_entries,devices,num_devices) {
    // Assume the device_type is i32 
    assert(device_type_i64_2 == 0, 'Invalid device_type i64');

#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetDeviceIDs",[platform,device_type_i64_1,num_entries,devices,num_devices]);
#endif
    
    // Init webcl variable if necessary
    CL.init();

    if ( num_entries == 0 && device_type_i64_1 != 0) {
#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"num_entries is equal to zero and device_type is not NULL","");
#endif
      return webcl.INVALID_VALUE;
    }

    if ( num_devices == 0 && device_type_i64_1 == 0) {
#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"both num_devices and device_type are NULL","");
#endif
      return webcl.INVALID_VALUE;
    }

    try {

      if ((platform in CL.cl_objects) || (platform == 0)) {

        // If platform is NULL use the first platform found ...
        if (platform == 0) {
#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(webcl+".getPlatforms",[]);
#endif          
          var _platforms = webcl.getPlatforms();
          if (_platforms.length == 0) {
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_PLATFORM],"platform is not a valid platform","");
#endif
            return webcl.INVALID_PLATFORM;  
          }

          // Create a new UDID 
          platform = CL.udid(_platforms[0]);
        } 

        var _platform = CL.cl_objects[platform];

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(_platform+".getDevices",[device_type_i64_1]);
#endif       
        
        var _devices = _platform.getDevices(device_type_i64_1);

        if (num_devices != 0) {
          {{{ makeSetValue('num_devices', '0', 'Math.min(num_entries,_devices.length)', 'i32') }}} /* Num of device */;
        } 

        if (devices != 0) {
          for (var i = 0; i < Math.min(num_entries,_devices.length); i++) {
            var _id = CL.udid(_devices[i]);
            {{{ makeSetValue('devices', 'i*4', '_id', 'i32') }}};
          }
        }

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_PLATFORM],"platform is not a valid platform","");
#endif
        return webcl.INVALID_PLATFORM;       
      }

    } catch (e) {

      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,devices,num_devices],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,devices,num_devices],"","");
#endif
    return webcl.SUCCESS;

  },

  clGetDeviceInfo: function(device,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetDeviceInfo",[device,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (device in CL.cl_objects) {

        var _object = CL.cl_objects[device];

        if (param_name == 4107 /*DEVICE_PREFERRED_VECTOR_WIDTH_DOUBLE*/) {
#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+webcl+".getExtension",["KHR_FP64"]);
#endif              
          _object = webcl.getExtension("KHR_FP64");
        }

        if (param_name == 4148 /*DEVICE_PREFERRED_VECTOR_WIDTH_HALF*/) {
#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+webcl+".getExtension",["KHR_FP16"]);
#endif    
          _object = webcl.getExtension("KHR_FP16");
        }

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+_object+".getInfo",[param_name]);
#endif        

        var _info = _object.getInfo(param_name);
        
        if(typeof(_info) == "number") {

          if (param_value_size == 8) {
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i64') }}};
          } else {
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
          } 
          
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else if(typeof(_info) == "boolean") {

          if (param_value != 0) (_info == true) ? {{{ makeSetValue('param_value', '0', '1', 'i32') }}} : {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else if(typeof(_info) == "string") {

          if (param_value != 0) writeStringToMemory(_info, param_value);
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size,_info.length)', 'i32') }}};

        } else if(typeof(_info) == "object") {
          
          if (_info instanceof Int32Array) {
           
            for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
              if (param_value != 0) {{{ makeSetValue('param_value', 'i*4', '_info[i]', 'i32') }}};
            }
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size>>2,_info.length)', 'i32') }}};
          
          } else if (_info instanceof WebCLPlatform) {
         
            var _id = CL.udid(_info);
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};
          
          } else if (_info == null) {

            if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else {
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
            return webcl.INVALID_VALUE;
          }
        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
          return webcl.INVALID_VALUE;
        }

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_DEVICE],"device are NULL","");
#endif
        return webcl.INVALID_DEVICE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateContext: function(properties,num_devices,devices,pfn_notify,user_data,cl_errcode_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clCreateContext",[properties,num_devices,devices,pfn_notify,user_data,cl_errcode_ret]);
#endif

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
        var _idxDevice = {{{ makeGetValue('devices', 'i*4', 'i32') }}};
        if (_idxDevice in CL.cl_objects) {
          _devices.push(CL.cl_objects[_idxDevice]);
        } else {
          if (cl_errcode_ret != 0) {
            {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_DEVICE', 'i32') }}};
          }

#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([0,cl_errcode_ret],"devices contains an invalid device","");
#endif
          return 0;  
        }
      }

      // Verify the property
      if (properties != 0) {
        var _propertiesCounter = 0;
        while(1) {
          var _readprop = {{{ makeGetValue('properties', '_propertiesCounter*4', 'i32') }}};
          if (_readprop == 0) break;

          switch (_readprop) {
            case webcl.CONTEXT_PLATFORM:
              _propertiesCounter ++;
              var _idxPlatform = {{{ makeGetValue('properties', '_propertiesCounter*4', 'i32') }}};
              if (_idxPlatform in CL.cl_objects) {
                _platform = CL.cl_objects[_idxPlatform];
              } else {
                if (cl_errcode_ret != 0) {
                  {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_PLATFORM', 'i32') }}};
                }

#if OPENCL_STACK_TRACE
                CL.webclEndStackTrace([0,cl_errcode_ret],"platform value specified in properties is not a valid platform","");
#endif
                return 0;  
              }
              break;

            // /!\ This part, it's for the CL_GL_Interop --> @steven can you check if you are agree ??
            case (0x200A) /*CL_GLX_DISPLAY_KHR*/:
            case (0x2008) /*CL_GL_CONTEXT_KHR*/:
            case (0x200C) /*CL_CGL_SHAREGROUP_KHR*/:            
              _propertiesCounter ++;

              // Just one is enough 
              if (typeof(WebCLGL) !== "undefined") {
                if (!(_webcl instanceof WebCLGL)){
                  _sharedContext = Module.ctx;
#if OPENCL_STACK_TRACE
                  CL.webclCallStackTrace(""+webcl+".getExtension",["KHR_GL_SHARING"]);
#endif              
                  _webcl = webcl.getExtension("KHR_GL_SHARING");
                }
              }
              break;

            default:
              if (cl_errcode_ret != 0) {
                {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_PROPERTY', 'i32') }}};
              }

#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([0,cl_errcode_ret],"context property name '"+_readprop+"' in properties is not a supported property name","");
#endif
              return 0; 
          };

          _propertiesCounter ++;
        }
      }

      var _prop;
      if (typeof(WebCLGL) !== "undefined") {
        if (_webcl instanceof WebCLGL) {   
          _prop = {platform: _platform, devices: _devices, deviceType: _deviceType, sharedContext: _sharedContext};
        }
      } else {
        _prop = {platform: _platform, devices: _devices, deviceType: _deviceType};
      }
      
#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace(_webcl+".createContext",[_prop]);
#endif      
      _context = _webcl.createContext(_prop)

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_context);

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateContextFromType: function(properties,device_type_i64_1,device_type_i64_2,pfn_notify,user_data,cl_errcode_ret) {
    // Assume the device_type is i32 
    assert(device_type_i64_2 == 0, 'Invalid device_type i64');
    
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clCreateContextFromType",[properties,device_type_i64_1,pfn_notify,user_data,cl_errcode_ret]);
#endif

    // Init webcl variable if necessary
    CL.init();

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
          var _readprop = {{{ makeGetValue('properties', '_propertiesCounter*4', 'i32') }}};
          if (_readprop == 0) break;

          switch (_readprop) {
            case webcl.CONTEXT_PLATFORM:
              _propertiesCounter ++;
              var _idxPlatform = {{{ makeGetValue('properties', '_propertiesCounter*4', 'i32') }}};
              if (_idxPlatform in CL.cl_objects) {
                _platform = CL.cl_objects[_idxPlatform];
              } else {
                if (cl_errcode_ret != 0) {
                  {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_PLATFORM', 'i32') }}};
                }

#if OPENCL_STACK_TRACE
                CL.webclEndStackTrace([0,cl_errcode_ret],"platform value specified in properties is not a valid platform","");
#endif
                return 0;  
              }
              break;

            // /!\ This part, it's for the CL_GL_Interop --> @steven can you check if you are agree like for the clCreateContext ??
            case (0x200A) /*CL_GLX_DISPLAY_KHR*/:
            case (0x2008) /*CL_GL_CONTEXT_KHR*/:
            case (0x200C) /*CL_CGL_SHAREGROUP_KHR*/:            
              _propertiesCounter ++;
              
              // Just one is enough
              if (typeof(WebCLGL) !== "undefined") { 
                if (!(_webcl instanceof WebCLGL)){
                  _sharedContext = Module.ctx;

#if OPENCL_STACK_TRACE
                  CL.webclCallStackTrace(""+webcl+".getExtension",["KHR_GL_SHARING"]);
#endif              
                  _webcl = webcl.getExtension("KHR_GL_SHARING");
                }
              }
              break;

            default:
              if (cl_errcode_ret != 0) {
                {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_PROPERTY', 'i32') }}};
              }

#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([0,cl_errcode_ret],"context property name '"+_readprop+"' in properties is not a supported property name","");
#endif
              return 0; 
          };

          _propertiesCounter ++;
        }
      }

      var _prop;

      if (typeof(WebCLGL) !== "undefined") {
        if (_webcl instanceof WebCLGL) {
          _prop = {platform: _platform, devices: _devices, deviceType: _deviceType, sharedContext: _sharedContext};
        }
      } else {
        _prop = {platform: _platform, devices: _devices, deviceType: _deviceType};
      }
      
#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace(_webcl+".createContext",[_prop]);
#endif      
      _context = _webcl.createContext(_prop)

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_context);

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clRetainContext: function(context) {
    console.error("clRetainContext: Not yet implemented\n");
    return webcl.INVALID_VALUE;
  },

  clReleaseContext: function(context) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clReleaseContext",[context]);
#endif

    try {

      if (context in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(CL.cl_objects[context]+".release",[]);
#endif        
        CL.cl_objects[context].release();
        delete CL.cl_objects[context];
#if OPENCL_DEBUG             
        CL.cl_objects_counter--,
        console.info("Counter- HashMap Object : " + CL.cl_objects_counter);
#endif      


      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_CONTEXT],CL.cl_objects[context]+" is not a valid OpenCL context","");
#endif
        return webcl.INVALID_CONTEXT;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetContextInfo: function(context,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetContextInfo",[context,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (context in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[context]+".getInfo",[param_name]);
#endif        

        var _info = CL.cl_objects[context].getInfo(param_name);

        if(typeof(_info) == "number") {

          if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else if(typeof(_info) == "boolean") {

          if (param_value != 0) (_info == true) ? {{{ makeSetValue('param_value', '0', '1', 'i32') }}} : {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else if(typeof(_info) == "object") {

          if ( (_info instanceof WebCLPlatform) || (_info instanceof WebCLContextProperties)) {
         
            var _id = CL.udid(_info);
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else if (_info instanceof Array) {

            for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
              var _id = CL.udid(_info[i]);
              if (param_value != 0) {{{ makeSetValue('param_value', 'i*4', '_id', 'i32') }}};
            }
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size>>2,_info.length)', 'i32') }}};

          } else if (_info == null) {

            if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else {
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
            return webcl.INVALID_VALUE;
          }
        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
          return webcl.INVALID_VALUE;
        }
           
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_CONTEXT],"context are NULL","");
#endif
        return webcl.INVALID_CONTEXT;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateCommandQueue: function(context,device,properties_1,properties_2,cl_errcode_ret) {
    // Assume the properties is i32 
    assert(properties_2 == 0, 'Invalid properties i64');

#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clCreateCommandQueue",[context,device,properties_1,cl_errcode_ret]);
#endif

    var _id = null;
    var _command = null;

    // Context must be created
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
#endif
      return 0; 
    }

    if (device == 0) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_DEVICE', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"device '"+device+"' is not a valid device","");
#endif
      return 0; 
    }

    try { 

#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createCommandQueue",[properties_1]);
#endif      

      _command = CL.cl_objects[context].createCommandQueue(device,properties_1);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_command);

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clRetainCommandQueue: function(command_queue) {
    console.error("clRetainCommandQueue: Not yet implemented\n");
    return webcl.INVALID_VALUE;
  },

  clReleaseCommandQueue: function(command_queue) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clReleaseCommandQueue",[command_queue]);
#endif

    try {

      if (command_queue in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(CL.cl_objects[command_queue]+".release",[]);
#endif        
        CL.cl_objects[command_queue].release();
        delete CL.cl_objects[command_queue];
#if OPENCL_DEBUG             
        CL.cl_objects_counter--,
        console.info("Counter- HashMap Object : " + CL.cl_objects_counter);
#endif    

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],CL.cl_objects[command_queue]+" is not a valid OpenCL command_queue","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetCommandQueueInfo: function(command_queue,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetCommandQueueInfo",[command_queue,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".getInfo",[param_name]);
#endif        

        var _info = CL.cl_objects[command_queue].getInfo(param_name);

        if(typeof(_info) == "number") {

          if (param_value_size == 8) {
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i64') }}};
          } else {
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
          } 

          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else if(typeof(_info) == "object") {

          if ( (_info instanceof WebCLDevice) || (_info instanceof WebCLContext)) {
         
            var _id = CL.udid(_info);
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else if (_info == null) {

            if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else {
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
            return webcl.INVALID_VALUE;
          }
        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
          return webcl.INVALID_VALUE;
        }
           
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateBuffer: function(context,flags_i64_1,flags_i64_2,size,host_ptr,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clCreateBuffer",[flags_i64_1,size,host_ptr,cl_errcode_ret]);
#endif

    var _id = null;
    var _buffer = null;

    // Context must be created
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
#endif
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
          {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};
        }

#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
#endif

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

#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createBuffer",[_flags,size,_host_ptr]);
#endif      
      if (_host_ptr != null)
        _buffer = CL.cl_objects[context].createBuffer(_flags,size,_host_ptr);
      else
        _buffer = CL.cl_objects[context].createBuffer(_flags,size);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_buffer);

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateSubBuffer: function(buffer,flags_i64_1,flags_i64_2,buffer_create_type,buffer_create_info,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clCreateSubBuffer",[buffer,flags_i64_1,buffer_create_type,buffer_create_info,cl_errcode_ret]);
#endif

    var _id = null;
    var _subbuffer = null;

    // Context must be created
    if (!(buffer in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_MEM_OBJECT', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"Mem object '"+buffer+"' is not a valid buffer","");
#endif
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
          {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};
        }

#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
#endif

        return 0; 
      }
    
      if (flags_i64_1 & ~_flags) {
        console.error("clCreateSubBuffer : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
      }

      if (buffer_create_info != 0) {
        _origin = {{{ makeGetValue('buffer_create_info', '0', 'i32') }}};
        _sizeInBytes = {{{ makeGetValue('buffer_create_info', '4', 'i32') }}};
      } else {
        if (cl_errcode_ret != 0) {
          {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};
        }

#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([0,cl_errcode_ret],"buffer_create_info is NULL","");
#endif

        return 0; 
      }

#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace( CL.cl_objects[buffer]+".createSubBuffer",[_flags,_origin,_sizeInBytes]);
#endif      

      _subbuffer = CL.cl_objects[buffer].createSubBuffer(_flags,_origin,_sizeInBytes);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_subbuffer);

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateImage2D: function(context,flags_i64_1,flags_i64_2,image_format,image_width,image_height,image_row_pitch,host_ptr,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clCreateImage2D",[context,flags_i64_1,image_format,image_width,image_height,image_row_pitch,host_ptr,cl_errcode_ret]);
#endif

    var _id = null;
    var _image = null;

    // Context must be created
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
#endif
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
          {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};
        }

#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
#endif

        return 0; 
      }

      var _host_ptr = null;
      var _channel_order = webcl.RGBA;
      var _channel_type = webcl.UNORM_INT8;

      if (image_format != 0) {
        _channel_order = {{{ makeGetValue('image_format', '0', 'i32') }}};
        _channel_type = {{{ makeGetValue('image_format', '4', 'i32') }}};
      } else {
        if (cl_errcode_ret != 0) {
          {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_IMAGE_FORMAT_DESCRIPTOR', 'i32') }}};
        }

#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([0,cl_errcode_ret],"image_format is NULL","");
#endif

        return 0; 
      }

      // There are no possibility to know the size of the host_ptr --> @steven What do you thing ?
      var _sizeInByte = 0;
      var _size = 0;
      if (host_ptr != 0 ) {
        if (cl_errcode_ret != 0) {
          {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_HOST_PTR', 'i32') }}};
        }

#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([0,cl_errcode_ret],"Can't have the size of the host_ptr","");
#endif

        return 0;
      }
        
      if (flags_i64_1 & (1 << 4) /* CL_MEM_ALLOC_HOST_PTR */) {
        _host_ptr = new ArrayBuffer(_sizeInByte);
      } else if (host_ptr != 0 && (flags_i64_1 & (1 << 5) /* CL_MEM_COPY_HOST_PTR */)) {
        _host_ptr = CL.getPointerToArrayBuffer(host_ptr,size,CL.cl_pn_type);
      } else if (flags_i64_1 & ~_flags) {
        // /!\ For the CL_MEM_USE_HOST_PTR (1 << 3)... 
        // ( Same question : clCreateBuffer )
        // may be i can do fake it using the same behavior than CL_MEM_COPY_HOST_PTR --> @steven What do you thing ??

        console.error("clCreateImage2D : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
      }

      var _descriptor = {channelOrder:_channel_order, channelType:_channel_type, width:image_width, height:image_height, rowPitch:image_row_pitch }

#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createImage",[_flags,_descriptor,_host_ptr]);
#endif      

      if (_host_ptr != null)
        _image = CL.cl_objects[context].createImage(_flags,_descriptor,_host_ptr);
      else
        _image = CL.cl_objects[context].createImage(_flags,_descriptor);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_image);

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateImage3D: function(context,flags_i64_1,flags_i64_2,image_format,image_width,image_height,image_depth,image_row_pitch,image_slice_pitch,host_ptr,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
    console.error("clCreateImage3D: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};
    }

    return 0;
  },

  clRetainMemObject: function(memobj) {
    console.error("clRetainMemObject: Not yet implemented\n");

    return webcl.INVALID_VALUE;
  },

  clReleaseMemObject: function(memobj) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clReleaseMemObject",[memobj]);
#endif

    try {

      if (memobj in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(CL.cl_objects[memobj]+".release",[]);
#endif        
        CL.cl_objects[memobj].release();
        delete CL.cl_objects[memobj];
#if OPENCL_DEBUG             
        CL.cl_objects_counter--,
        console.info("Counter- HashMap Object : " + CL.cl_objects_counter);
#endif    

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],CL.cl_objects[memobj]+" is not a valid OpenCL memobj","");
#endif
        return webcl.INVALID_MEM_OBJECT;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetSupportedImageFormats: function(context,flags_i64_1,flags_i64_2,image_type,num_entries,image_formats,num_image_formats) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');

#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetSupportedImageFormats",[context,flags_i64_1,image_type,num_entries,image_formats,num_image_formats]);
#endif

    // Context must be created
    if (!(context in CL.cl_objects)) {
#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([webcl.INVALID_CONTEXT],"context '"+context+"' is not a valid context","");
#endif
      return webcl.INVALID_CONTEXT; 
    }

    if (image_type != webcl.MEM_OBJECT_IMAGE2D) {
#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([webcl.CL_INVALID_VALUE],"image_type "+image_type+" are not valid","");
#endif
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

#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_VALUE],"values specified "+flags_i64_1+" in flags are not valid","");
#endif

        return webcl.INVALID_VALUE; 
      }

      if (flags_i64_1 & ~_flags) {
        console.error("clGetSupportedImageFormats : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
      }

#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace(CL.cl_objects[context]+".getSupportedImageFormats",[_flags]);
#endif        

      var _descriptor_list = CL.cl_objects[context].getSupportedImageFormats(_flags);

      var _counter = 0;
      for (var i = 0; i < Math.min(num_entries,_descriptor_list.length); i++) {
        var _descriptor = _descriptor_list[i];

        if (image_formats != 0) {
          {{{ makeSetValue('image_formats', '_counter*4', '_descriptor.channelOrder', 'i32') }}};
          _counter++;
          {{{ makeSetValue('image_formats', '_counter*4', '_descriptor.channelType', 'i32') }}};
          _counter++;
        }
      }

      if (num_image_formats != 0) {
        {{{ makeSetValue('num_image_formats', '0', '_descriptor_list.length', 'i32') }}};
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetMemObjectInfo: function(memobj,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetMemObjectInfo",[memobj,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (memobj in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[memobj]+".getInfo",[param_name]);
#endif        

        var _info = CL.cl_objects[memobj].getInfo(param_name);

        if(typeof(_info) == "number") {

          if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else if(typeof(_info) == "object") {

          if (_info instanceof WebCLBuffer) {
         
            var _id = CL.udid(_info);
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else if (_info == null) {

            if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else {
            console.error("clGetMemObjectInfo : "+typeof(_info)+" not yet implemented");
          }
        } else {
          console.error("clGetMemObjectInfo : "+typeof(_info)+" not yet implemented");
        }
           
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"memobj are NULL","");
#endif
        return webcl.INVALID_MEM_OBJECT;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetImageInfo: function(image,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetImageInfo",[image,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (image in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[image]+".getInfo",[param_name]);
#endif        

        var _info = CL.cl_objects[image].getInfo(param_name);

        switch (param_name) {
          case (webcl.IMAGE_FORMAT) :
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info.channelOrder', 'i32') }}};
            if (param_value != 0) {{{ makeSetValue('param_value', '4', '_info.channelType', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};
            break;
          case (webcl.IMAGE_ELEMENT_SIZE) :
            //  Not sure how I can know the element size ... It's depending of the channelType I suppose --> @steven Your opinion about that ??
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '4', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};
            break;
          case (webcl.IMAGE_ROW_PITCH) :
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info.rowPitch', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};
            break;
          case (webcl.IMAGE_WIDTH) :
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info.width', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};
            break;
          case (webcl.IMAGE_HEIGHT) :
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info.height', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};
            break;
          default:
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_VALUE],param_name+" not yet implemente","");
#endif
            return webcl.INVALID_VALUE;
        }
           
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"image are NULL","");
#endif
        return webcl.INVALID_MEM_OBJECT;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clSetMemObjectDestructorCallback: function(memobj,pfn_notify,user_data) {
    console.error("clSetMemObjectDestructorCallback: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    return webcl.INVALID_VALUE;
  },

  clCreateSampler: function(context,normalized_coords,addressing_mode,filter_mode,cl_errcode_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clCreateSampler",[context,normalized_coords,addressing_mode,filter_mode,cl_errcode_ret]);
#endif

    var _id = null;
    var _sampler = null;

    // Context must be created
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
#endif
      return 0; 
    }

    try {
    
#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createSampler",[normalized_coords,addressing_mode,filter_mode]);
#endif      

      _sampler = CL.cl_objects[context].createSampler(normalized_coords,addressing_mode,filter_mode);
      
    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_sampler);

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clRetainSampler: function(sampler) {
    console.error("clRetainSampler: Not yet implemented\n");

    return webcl.INVALID_VALUE;
  },

  clReleaseSampler: function(sampler) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clReleaseSampler",[sampler]);
#endif

    try {

      if (sampler in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(CL.cl_objects[sampler]+".release",[]);
#endif        
        CL.cl_objects[sampler].release();
        delete CL.cl_objects[sampler];
#if OPENCL_DEBUG             
        CL.cl_objects_counter--,
        console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + sampler);
#endif   

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_SAMPLER],CL.cl_objects[sampler]+" is not a valid OpenCL sampler","");
#endif
        return webcl.INVALID_SAMPLER;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clGetSamplerInfo: function(sampler,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetSamplerInfo",[sampler,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (sampler in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[sampler]+".getInfo",[param_name]);
#endif        

        var _info = CL.cl_objects[sampler].getInfo(param_name);
        
        if(typeof(_info) == "number") {

          if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else if(typeof(_info) == "boolean") {

          if (param_value != 0) (_info == true) ? {{{ makeSetValue('param_value', '0', '1', 'i32') }}} : {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else if(typeof(_info) == "object") {

          if (_info instanceof WebCLContext) {
     
            var _id = CL.udid(_info);
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else if (_info == null) {

            if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else {
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
            return webcl.INVALID_VALUE;
          }
        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
          return webcl.INVALID_VALUE;
        }
       
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_CONTEXT],"sampler are NULL","");
#endif
        return webcl.INVALID_SAMPLER;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }

      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateProgramWithSource: function(context,count,strings,lengths,cl_errcode_ret) {
    
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clCreateProgramWithSource",[context,count,strings,lengths,cl_errcode_ret]);
#endif

    var _id = null;
    var _program = null;

    // Context must be created
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
#endif
      return 0; 
    }
        
    try {
  
      var _string = Pointer_stringify({{{ makeGetValue('strings', '0', 'i32') }}}); 
  
      CL.cl_kernels_sig = CL.parseKernel(_string);

#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createProgramWithSource",[_string]);
#endif      

      _program = CL.cl_objects[context].createProgram(_string);
  
    } catch (e) {
      var _error = CL.catchError(e);

      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_program);

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateProgramWithBinary: function(context,num_devices,device_list,lengths,binaries,cl_binary_status,cl_errcode_ret) {
    console.error("clCreateProgramWithBinary: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");
    
    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};
    }

    return 0;

  },

  clRetainProgram: function(program) {
    console.error("clRetainProgram: Not yet implemented\n");

    return webcl.INVALID_VALUE;
  },

  clReleaseProgram: function(program) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clReleaseProgram",[program]);
#endif

    try {

      if (program in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(CL.cl_objects[program]+".release",[]);
#endif        
        CL.cl_objects[program].release();
        delete CL.cl_objects[program];
#if OPENCL_DEBUG             
        CL.cl_objects_counter--,
        console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + program);
#endif   

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_SAMPLER],CL.cl_objects[program]+" is not a valid OpenCL program","");
#endif
        return webcl.INVALID_PROGRAM;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;

  },

  clBuildProgram: function(program,num_devices,device_list,options,pfn_notify,user_data) {

#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clBuildProgram",[program,num_devices,device_list,options,pfn_notify,user_data]);
#endif

    // Program must be created
    if (!(program in CL.cl_objects)) {

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program '"+program+"' is not a valid program","");
#endif

      return webcl.INVALID_PROGRAM; 
    }

    try {

      var _devices = [];
      var _option = (options == 0) ? "" : Pointer_stringify(options); 

      if (device_list != 0 && num_devices > 0 ) {
        for (var i = 0; i < num_devices ; i++) {
          var _device = {{{ makeGetValue('device_list', 'i*4', 'i32') }}}
          if (_device in CL.cl_objects) {
            _devices.push(CL.cl_objects[_device]);
          }
        }
      }

      // Need to call this code inside the callback event WebCLCallback.
      // if (pfn_notify != 0) {
      //  FUNCTION_TABLE[pfn_notify](program, user_data);
      // }

#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace(CL.cl_objects[program]+".build",[_devices,_option]);
#endif        
      
      CL.cl_objects[program].build(_devices,_option,null,null);

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;      

  },

  clUnloadCompiler: function() {
    console.error("clUnloadCompiler: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");
    
    return webcl.INVALID_VALUE;;
  },

  clGetProgramInfo: function(program,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetProgramInfo",[program,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (program in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[program]+".getInfo",[param_name]);
#endif        

        var _info = CL.cl_objects[program].getInfo(param_name);

        if(typeof(_info) == "number") {

          if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else if(typeof(_info) == "string") {
          if (param_value != 0) {
            writeStringToMemory(_info, param_value);
          }
        
          if (param_value_size_ret != 0) {
            {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size,_info.length)', 'i32') }}};
          }
        } else if(typeof(_info) == "object") {

          if (_info instanceof WebCLContext) {
     
            var _id = CL.udid(_info);
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else if (_info instanceof Array) {

            for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
              var _id = CL.udid(_info[i]);
              if (param_value != 0) {{{ makeSetValue('param_value', 'i*4', '_id', 'i32') }}};
            }
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size>>2,_info.length)', 'i32') }}};

          } else if (_info == null) {

            if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else {
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
            return webcl.INVALID_VALUE;
          }
        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
          return webcl.INVALID_VALUE;
        }
       
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program are NULL","");
#endif
        return webcl.INVALID_PROGRAM;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }

      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetProgramBuildInfo: function(program,device,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetProgramBuildInfo",[program,device,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (program in CL.cl_objects) {
      
        if (device in CL.cl_objects) {

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[program]+".getBuildInfo",[device,param_name]);
#endif        

          var _info = CL.cl_objects[program].getBuildInfo(CL.cl_objects[device], param_name);

          if(typeof(_info) == "number") {

            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else if(typeof(_info) == "string") {
            if (param_value != 0) {
              writeStringToMemory(_info, param_value);
            }
          
            if (param_value_size_ret != 0) {
              {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size,_info.length)', 'i32') }}};
            }
          } else {
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
            return webcl.INVALID_VALUE;
          }
        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_DEVICE],"device are NULL","");
#endif
          return webcl.INVALID_DEVICE;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program are NULL","");
#endif
        return webcl.INVALID_PROGRAM;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }

      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateKernel: function(program,kernel_name,cl_errcode_ret) {
    
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clCreateKernel",[program,kernel_name,cl_errcode_ret]);
#endif

    var _id = null;
    var _kernel = null;
    var _name = (kernel_name == 0) ? "" : Pointer_stringify(kernel_name);

    // program must be created
    if (!(program in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_PROGRAM', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"program '"+program+"' is not a valid program","");
#endif
      return 0; 
    }

    try {
    
#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace( CL.cl_objects[program]+".createKernel",[_name]);
#endif      

      _kernel = CL.cl_objects[program].createKernel(_name);
      
      Object.defineProperty(_kernel, "name", { value : _name,writable : false });
      Object.defineProperty(_kernel, "sig", { value : CL.cl_kernels_sig[_name],writable : false });

#if OPENCL_DEBUG
      console.info("clCreateKernel : Kernel '"+_kernel.name+"', has "+_kernel.sig+" parameters !!!!");
#endif      
      
    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_kernel);

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateKernelsInProgram: function(program,num_kernels,kernels,num_kernels_ret) {
    
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clCreateKernelsInProgram",[program,num_kernels,kernels,num_kernels_ret]);
#endif

    // program must be created
    if (!(program in CL.cl_objects)) {

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program '"+program+"' is not a valid program","");
#endif
      return webcl.INVALID_PROGRAM; 
    }

    try {
    
#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace( CL.cl_objects[program]+".createKernelsInProgram",[]);
#endif      

      var _kernels = CL.cl_objects[program].createKernelsInProgram();

      for (var i = 0; i < Math.min(num_kernels,_kernels.length); i++) {
        var _id = CL.udid(_kernels[i]);
        if (kernels != 0) {{{ makeSetValue('kernels', 'i*4', '_id', 'i32') }}};
        
        var _name = _kernels[i].getInfo(webcl.KERNEL_FUNCTION_NAME);

        Object.defineProperty(_kernels[i], "name", { value : _name,writable : false });
        Object.defineProperty(_kernels[i], "sig", { value : CL.cl_kernels_sig[_name],writable : false });

#if OPENCL_DEBUG
        console.info("clCreateKernelsInProgram : Kernel '"+_kernels[i].name+"', has "+_kernels[i].sig+" parameters !!!!");
#endif  

      }
           
      if (num_kernels_ret != 0) {{{ makeSetValue('num_kernels_ret', '0', 'Math.min(num_kernels,_kernels.length)', 'i32') }}};

    } catch (e) {

      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif
      return _error; 
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clRetainKernel: function(kernel) {
    console.error("clRetainKernel: Not yet implemented\n");

    return webcl.INVALID_VALUE;
  },

  clReleaseKernel: function(kernel) {

#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clReleaseKernel",[kernel]);
#endif

    try {

      if (kernel in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(CL.cl_objects[kernel]+".release",[]);
#endif        
        CL.cl_objects[kernel].release();
        delete CL.cl_objects[kernel];
#if OPENCL_DEBUG             
        CL.cl_objects_counter--,
        console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + kernel);
#endif   

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],CL.cl_objects[kernel]+" is not a valid OpenCL kernel","");
#endif
        return webcl.INVALID_KERNEL;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clSetKernelArg: function(kernel,arg_index,arg_size,arg_value) {

#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clSetKernelArg",[kernel,arg_index,arg_size,arg_value]);
#endif

    try {

      if (kernel in CL.cl_objects) {
        
        if (CL.cl_objects[kernel].sig.length > arg_index) {
    
          var _sig = CL.cl_objects[kernel].sig[arg_index];

          console.info("Arg kernel("+CL.cl_objects[kernel].name+") type : "+_sig);

          if (_sig == webcl.LOCAL) {

            console.info("Arg is LOCAL");

            var _array = new Uint32Array([arg_size]);

#if OPENCL_STACK_TRACE
            CL.webclCallStackTrace(CL.cl_objects[kernel]+".setArg",[arg_index,_array]);
#endif     
            CL.cl_objects[kernel].setArg(arg_index,_array);

          } else {

            var _value = {{{ makeGetValue('arg_value', '0', 'i32') }}};

            if (_value in CL.cl_objects) {

              console.info("Arg is an MemoryObject");
              
#if OPENCL_STACK_TRACE
              CL.webclCallStackTrace(CL.cl_objects[kernel]+".setArg",[arg_index,CL.cl_objects[_value]]);
#endif        
              CL.cl_objects[kernel].setArg(arg_index,CL.cl_objects[_value]);

            } else {

              console.info("Arg is an ArrayBufferView : "+arg_size);

              var _array = CL.getPointerToArray(arg_value,arg_size,_sig);

#if OPENCL_STACK_TRACE
              CL.webclCallStackTrace(CL.cl_objects[kernel]+".setArg",[arg_index,_array]);
#endif        
              CL.cl_objects[kernel].setArg(arg_index,_array);
            }
          }
        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_KERNEL],CL.cl_objects[kernel]+" doesn't contains sig array","");
#endif
          return webcl.INVALID_KERNEL;          
        }

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],CL.cl_objects[kernel]+" is not a valid OpenCL kernel","");
#endif
        return webcl.INVALID_KERNEL;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clGetKernelInfo: function(kernel,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetKernelInfo",[kernel,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (kernel in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[kernel]+".getInfo",[param_name]);
#endif        

        var _info = CL.cl_objects[kernel].getInfo(param_name);

        if(typeof(_info) == "number") {

          if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else if(typeof(_info) == "string") {
          if (param_value != 0) {
            writeStringToMemory(_info, param_value);
          }
        
          if (param_value_size_ret != 0) {
            {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size,_info.length)', 'i32') }}};
          }
        } else if(typeof(_info) == "object") {

          if ( (_info instanceof WebCLContext) || (_info instanceof WebCLProgram) ){
     
            var _id = CL.udid(_info);
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else if (_info == null) {

            if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else {
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
            return webcl.INVALID_VALUE;
          }
        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
          return webcl.INVALID_VALUE;
        }
       
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"kernel are NULL","");
#endif
        return webcl.INVALID_KERNEL;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }

      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetKernelWorkGroupInfo: function(kernel,device,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetKernelWorkGroupInfo",[kernel,device,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (kernel in CL.cl_objects) {
      
        if (device in CL.cl_objects) {

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[kernel]+".getWorkGroupInfo",[device,param_name]);
#endif        

          var _info = CL.cl_objects[kernel].getWorkGroupInfo(CL.cl_objects[device], param_name);

          if(typeof(_info) == "number") {

            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else if (_info instanceof Int32Array) {
           
            for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
              if (param_value != 0) {{{ makeSetValue('param_value', 'i*4', '_info[i]', 'i32') }}};
            }
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size>>2,_info.length)', 'i32') }}};
          
          } else {
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
            return webcl.INVALID_VALUE;
          }
        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_DEVICE],"device are NULL","");
#endif
          return webcl.INVALID_DEVICE;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"kernel are NULL","");
#endif
        return webcl.INVALID_KERNEL;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }

      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clWaitForEvents: function(num_events,event_list) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clWaitForEvents",[num_events,event_list]);
#endif

    try {

      var _events = [];

      for (var i = 0; i < num_events; i++) {
        var _event = {{{ makeGetValue('event_list', 'i*4', 'i32') }}};
        if (_event in CL.cl_objects) {
          _events.push(_event) 
        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
          return webcl.INVALID_EVENT;    
        }
      }

#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace(""+webcl+".waitForEvents",[_events]);
#endif      
      webcl.waitForEvents(_events);


    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetEventInfo: function(event,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetEventInfo",[event,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (event in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[event]+".getInfo",[param_name]);
#endif        

        var _info = CL.cl_objects[event].getInfo(param_name);

        if(typeof(_info) == "number") {

          if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else if(typeof(_info) == "object") {

          if ( (_info instanceof WebCLContext) || (_info instanceof WebCLCommandQueue) ){
     
            var _id = CL.udid(_info);
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else if (_info == null) {

            if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else {
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_EVENT],typeof(_info)+" not yet implemented","");
#endif
            return webcl.INVALID_EVENT;
          }
        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_EVENT],typeof(_info)+" not yet implemented","");
#endif
          return webcl.INVALID_EVENT;
        }
       
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_EVENT],"event are NULL","");
#endif
        return webcl.INVALID_EVENT;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }

      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateUserEvent: function(context,cl_errcode_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clCreateUserEvent",[context,cl_errcode_ret]);
#endif

    var _id = null;
    var _event = null;

    // Context must be created
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
#endif
      return 0; 
    }

    try {
    
#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createUserEvent",[]);
#endif      

      _event = CL.cl_objects[context].createUserEvent();
      
    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_event);

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;

  },

  clRetainEvent: function(event) {
    console.error("clRetainKernel: Not yet implemented\n");

    return webcl.INVALID_VALUE;
  },

  clReleaseEvent: function(event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clReleaseEvent",[event]);
#endif

    try {

      if (event in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(CL.cl_objects[event]+".release",[]);
#endif        
        CL.cl_objects[event].release();
        delete CL.cl_objects[event];
#if OPENCL_DEBUG             
        CL.cl_objects_counter--,
        console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + event);
#endif   
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_EVENT],CL.cl_objects[event]+" is not a valid OpenCL event","");
#endif
        return webcl.INVALID_EVENT;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clSetUserEventStatus: function(event,execution_status) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clSetUserEventStatus",[event,execution_status]);
#endif

    try {

      if (event in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(CL.cl_objects[event]+".setUserEventStatus",[execution_status]);
#endif        

        CL.cl_objects[event].setUserEventStatus(execution_status);

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_EVENT],CL.cl_objects[event]+" is not a valid OpenCL event","");
#endif
        return webcl.INVALID_EVENT;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clSetEventCallback: function(event,command_exec_callback_type,pfn_notify,user_data) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clSetEventCallback",[event,command_exec_callback_type,pfn_notify,user_data]);
#endif

    try {

      if (event in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(CL.cl_objects[event]+".setCallback",[command_exec_callback_type,pfn_notify,user_data]);
#endif        

        console.error("/!\\ todo clSetEventCallback not yet finish to implement");
        CL.cl_objects[event].setCallback(command_exec_callback_type);

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_EVENT],CL.cl_objects[event]+" is not a valid OpenCL event","");
#endif
        return webcl.INVALID_EVENT;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clGetEventProfilingInfo: function(event,param_name,param_value_size,param_value,param_value_size_ret) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetEventProfilingInfo",[event,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

    try { 

      if (event in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[event]+".getProfilingInfo",[param_name]);
#endif        

        var _info = CL.cl_objects[event].getProfilingInfo(param_name);

        if(typeof(_info) == "number") {

          if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

        } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_EVENT],typeof(_info)+" not yet implemented","");
#endif
          return webcl.INVALID_EVENT;
        }
       
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_EVENT],"event are NULL","");
#endif
        return webcl.INVALID_EVENT;
      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }

      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clFlush: function(command_queue) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clFlush",[command_queue]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".flush",[]);
#endif        

        CL.cl_objects[command_queue].flush();

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clFinish: function(command_queue) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clFinish",[command_queue]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".finish",[]);
#endif        

        CL.cl_objects[command_queue].finish();

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif
      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clEnqueueReadBuffer: function(command_queue,buffer,blocking_read,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueReadBuffer",[command_queue,buffer,blocking_read,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if (buffer in CL.cl_objects) {

          var _host_ptr = CL.getPointerToEmptyArray(CL.cl_pn_type);
          var _event_wait_list = [];
          var _event = null;

          for (var i = 0; i < num_events_in_wait_list; i++) {
            var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
            if (_event_wait in CL.cl_objects) {
              _event_wait_list.push(_event_wait);
            } else {
#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
              return webcl.INVALID_EVENT;    
            }
          } 

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueReadBuffer",[CL.cl_objects[buffer],blocking_read,offset,cb,_host_ptr,_event_wait_list,_event]);
#endif        
          CL.cl_objects[command_queue].enqueueReadBuffer(CL.cl_objects[buffer],blocking_read,offset,cb,_host_ptr,_event_wait_list,_event);

          //if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};

          if (ptr) {
            CL.setPointerWithArray(ptr,_host_ptr,CL.cl_pn_type);
          }

      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"buffer are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;    
  },

  clEnqueueReadBufferRect: function(command_queue,buffer,blocking_read,buffer_origin,host_origin,region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueReadBufferRect",[command_queue,buffer,blocking_read,buffer_origin,host_origin,region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if (buffer in CL.cl_objects) {

          var _host_ptr = CL.getPointerToEmptyArray(CL.cl_pn_type);
          var _event_wait_list = [];
          var _event = null;
          var _buffer_origin = [];
          var _host_origin = [];
          var _region = [];

          for (var i = 0; i < 3; i++) {
            _buffer_origin.push({{{ makeGetValue('buffer_origin', 'i*4', 'i32') }}});
            _host_origin.push({{{ makeGetValue('host_origin', 'i*4', 'i32') }}});
            _region.push({{{ makeGetValue('region', 'i*4', 'i32') }}});            
          }

          for (var i = 0; i < num_events_in_wait_list; i++) {
            var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
            if (_event_wait in CL.cl_objects) {
              _event_wait_list.push(_event_wait);
            } else {
#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
              return webcl.INVALID_EVENT;    
            }
          } 

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueReadBufferRect",[CL.cl_objects[buffer],blocking_read,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list,_event]);
#endif     
   
          //CL.cl_objects[command_queue].enqueueReadBufferRect(CL.cl_objects[buffer],blocking_read,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list,_event);
          CL.cl_objects[command_queue].enqueueReadBufferRect(CL.cl_objects[buffer],blocking_read,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list);

          //if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};

          if (ptr) {
            CL.setPointerWithArray(ptr,_host_ptr,CL.cl_pn_type);
          }
          
      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"buffer are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;    
  },

  clEnqueueWriteBuffer: function(command_queue,buffer,blocking_write,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueWriteBuffer",[command_queue,buffer,blocking_write,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if (buffer in CL.cl_objects) {

          var _event;
          var _event_wait_list = [];
          var _host_ptr = CL.getPointerToArray(ptr,cb,CL.cl_pn_type);

          for (var i = 0; i < num_events_in_wait_list; i++) {
            var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
            if (_event_wait in CL.cl_objects) {
              _event_wait_list.push(_event_wait);
            } else {
#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
              return webcl.INVALID_EVENT;    
            }
          } 

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueWriteBuffer",[CL.cl_objects[buffer],blocking_write,offset,cb,_host_ptr,_event_wait_list,_event]);
#endif    
  
          CL.cl_objects[command_queue].enqueueWriteBuffer(CL.cl_objects[buffer],blocking_write,offset,cb,_host_ptr,_event_wait_list);    
          // CL.cl_objects[command_queue].enqueueWriteBuffer(CL.cl_objects[buffer],blocking_write,offset,cb,_host_ptr,_event_wait_list,_event);
          // if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};

      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"buffer are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;  
  },

  clEnqueueWriteBufferRect: function(command_queue,buffer,blocking_write,buffer_origin,host_origin,region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueWriteBufferRect",[command_queue,buffer,blocking_write,buffer_origin,host_origin,region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if (buffer in CL.cl_objects) {

          var _event;
          var _event_wait_list = [];
          
          var _host_ptr = CL.getPointerToArray(ptr,cb,CL.cl_pn_type);

          var _buffer_origin = [];
          var _host_origin = [];
          var _region = [];

          for (var i = 0; i < 3; i++) {
            _buffer_origin.push({{{ makeGetValue('buffer_origin', 'i*4', 'i32') }}});
            _host_origin.push({{{ makeGetValue('host_origin', 'i*4', 'i32') }}});
            _region.push({{{ makeGetValue('region', 'i*4', 'i32') }}});            
          }

          for (var i = 0; i < num_events_in_wait_list; i++) {
            var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
            if (_event_wait in CL.cl_objects) {
              _event_wait_list.push(_event_wait);
            } else {
#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
              return webcl.INVALID_EVENT;    
            }
          } 

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueWriteBufferRect",[CL.cl_objects[buffer],blocking_write,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list,_event]);   
#endif    

          CL.cl_objects[command_queue].enqueueWriteBufferRect(CL.cl_objects[buffer],blocking_write,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list);   
         
          //CL.cl_objects[command_queue].enqueueWriteBufferRect(CL.cl_objects[buffer],blocking_write,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list,_event);   
          // if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};  

      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"buffer are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;  
  },

  clEnqueueCopyBuffer: function(command_queue,src_buffer,dst_buffer,src_offset,dst_offset,cb,num_events_in_wait_list,event_wait_list,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueCopyBuffer",[command_queue,src_buffer,dst_buffer,src_offset,dst_offset,cb,num_events_in_wait_list,event_wait_list,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if ((src_buffer in CL.cl_objects) && (dst_buffer in CL.cl_objects)) {

          var _event;
          var _event_wait_list = [];

          for (var i = 0; i < num_events_in_wait_list; i++) {
            var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
            if (_event_wait in CL.cl_objects) {
              _event_wait_list.push(_event_wait);
            } else {
#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
              return webcl.INVALID_EVENT;    
            }
          } 

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueCopyBuffer",[CL.cl_objects[src_buffer],CL.cl_objects[dst_buffer],src_offset,dst_offset,cb,_event_wait_list,_event]);
#endif    
  
          CL.cl_objects[command_queue].enqueueCopyBuffer(CL.cl_objects[src_buffer],CL.cl_objects[dst_buffer],src_offset,dst_offset,cb,_event_wait_list);    
          // CL.cl_objects[command_queue].enqueueCopyBuffer(CL.cl_objects[src_buffer],CL.cl_objects[dst_buffer],src_offset,dst_offset,cb,_event_wait_list,_event);  
          // if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};

      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"buffer are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS;  
  },

  clEnqueueReadImage: function(command_queue,image,blocking_read,origin,region,row_pitch,slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueReadImage",[command_queue,image,blocking_read,origin,region,row_pitch,slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if (image in CL.cl_objects) {

          var _host_ptr = CL.getPointerToEmptyArray(CL.cl_pn_type);
          var _event_wait_list = [];
          var _event = null;

          var _origin = [];
          var _region = [];

          for (var i = 0; i < 2; i++) {
            _origin.push({{{ makeGetValue('origin', 'i*4', 'i32') }}});
            _region.push({{{ makeGetValue('region', 'i*4', 'i32') }}});            
          }          

          for (var i = 0; i < num_events_in_wait_list; i++) {
            var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
            if (_event_wait in CL.cl_objects) {
              _event_wait_list.push(_event_wait);
            } else {
#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
              return webcl.INVALID_EVENT;    
            }
          } 

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueReadImage",[CL.cl_objects[image],blocking_read,_origin,_region,row_pitch,_host_ptr,_event_wait_list,_event]);
#endif        
          CL.cl_objects[command_queue].enqueueReadImage(CL.cl_objects[image],blocking_read,_origin,_region,row_pitch,_host_ptr,_event_wait_list);
          
          //CL.cl_objects[command_queue].enqueueReadImage(CL.cl_objects[image],blocking_read,_origin,_region,row_pitch,_host_ptr,_event_wait_list,_event);
          //if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};

          if (ptr) {
            CL.setPointerWithArray(ptr,_host_ptr,CL.cl_pn_type);
          }

      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"image are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS; 
  },

  clEnqueueWriteImage: function(command_queue,image,blocking_write,origin,region,input_row_pitch,input_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueWriteImage",[command_queue,image,blocking_write,origin,region,input_row_pitch,input_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if (image in CL.cl_objects) {

          var _event;
          var _event_wait_list = [];
          
          var _host_ptr = CL.getPointerToArray(ptr,cb,CL.cl_pn_type);

          var _origin = [];
          var _region = [];

          for (var i = 0; i < 2; i++) {
            _origin.push({{{ makeGetValue('origin', 'i*4', 'i32') }}});
            _region.push({{{ makeGetValue('region', 'i*4', 'i32') }}});            
          }

          for (var i = 0; i < num_events_in_wait_list; i++) {
            var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
            if (_event_wait in CL.cl_objects) {
              _event_wait_list.push(_event_wait);
            } else {
#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
              return webcl.INVALID_EVENT;    
            }
          } 

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueWriteImage",[CL.cl_objects[image],blocking_write,_origin,_region,row_pitch,_host_ptr,_event_wait_list,_event]);
#endif        
          CL.cl_objects[command_queue].enqueueWriteImage(CL.cl_objects[image],blocking_write,_origin,_region,row_pitch,_host_ptr,_event_wait_list);
          
          //CL.cl_objects[command_queue].enqueueWriteImage(CL.cl_objects[image],blocking_write,_origin,_region,row_pitch,_host_ptr,_event_wait_list);
          //if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};

      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"image are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;  
  },

  clEnqueueCopyImage: function(command_queue,src_image,dst_image,src_origin,dst_origin,region,num_events_in_wait_list,event_wait_list,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueCopyImage",[command_queue,src_image,dst_image,src_origin,dst_origin,region,num_events_in_wait_list,event_wait_list,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if ((src_image in CL.cl_objects) && (dst_image in CL.cl_objects)) {

          var _event;
          var _event_wait_list = [];

          var _src_origin = [];
          var _dest_origin = [];
          var _region = [];

          for (var i = 0; i < 2; i++) {
            _src_origin.push({{{ makeGetValue('src_origin', 'i*4', 'i32') }}});
            _dest_origin.push({{{ makeGetValue('dst_origin', 'i*4', 'i32') }}});
            _region.push({{{ makeGetValue('region', 'i*4', 'i32') }}});            
          }

          for (var i = 0; i < num_events_in_wait_list; i++) {
            var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
            if (_event_wait in CL.cl_objects) {
              _event_wait_list.push(_event_wait);
            } else {
#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
              return webcl.INVALID_EVENT;    
            }
          } 

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueCopyImage",[CL.cl_objects[src_buffer],CL.cl_objects[dst_buffer],_src_origin,_dest_origin,_region,_event_wait_list,_event]);
#endif    
  
          CL.cl_objects[command_queue].enqueueCopyImage(CL.cl_objects[src_buffer],CL.cl_objects[dst_buffer],_src_origin,_dest_origin,_region,_event_wait_list);    
          // CL.cl_objects[command_queue].enqueueCopyImage(CL.cl_objects[src_buffer],CL.cl_objects[dst_buffer],_src_origin,_dest_origin,_region,_event_wait_list,_event);    
          // if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};

      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"buffer are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS;
  },

  clEnqueueCopyImageToBuffer: function(command_queue,src_image,dst_buffer,src_origin,region,dst_offset,num_events_in_wait_list,event_wait_list,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueCopyImageToBuffer",[command_queue,src_image,dst_buffer,src_origin,region,dst_offset,num_events_in_wait_list,event_wait_list,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if ((src_image in CL.cl_objects) && (dst_buffer in CL.cl_objects)) {

          var _event;
          var _event_wait_list = [];

          var _src_origin = [];
          var _region = [];

          for (var i = 0; i < 2; i++) {
            _src_origin.push({{{ makeGetValue('src_origin', 'i*4', 'i32') }}});
            _region.push({{{ makeGetValue('region', 'i*4', 'i32') }}});            
          }

          for (var i = 0; i < num_events_in_wait_list; i++) {
            var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
            if (_event_wait in CL.cl_objects) {
              _event_wait_list.push(_event_wait);
            } else {
#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
              return webcl.INVALID_EVENT;    
            }
          } 

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueCopyImageToBuffer",[CL.cl_objects[src_image],CL.cl_objects[dst_buffer],_src_origin,_region,dst_offset,_event_wait_list,_event]);
#endif    
  
          CL.cl_objects[command_queue].enqueueCopyImageToBuffer(CL.cl_objects[src_image],CL.cl_objects[dst_buffer],_src_origin,_region,dst_offset,_event_wait_list);    
          // CL.cl_objects[command_queue].enqueueCopyImageToBuffer(CL.cl_objects[src_image],CL.cl_objects[dst_buffer],_src_origin,_region,dst_offset,_event_wait_list,_event);    
          // if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};

      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"buffer / image are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS;
  },

  clEnqueueCopyBufferToImage: function(command_queue,src_buffer,dst_image,src_offset,dst_origin,region,num_events_in_wait_list,event_wait_list,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueCopyBufferToImage",[command_queue,src_buffer,dst_image,src_offset,dst_origin,region,num_events_in_wait_list,event_wait_list,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if ((src_buffer in CL.cl_objects) && (dst_image in CL.cl_objects)) {

          var _event;
          var _event_wait_list = [];

          var _dest_origin = [];
          var _region = [];

          for (var i = 0; i < 2; i++) {
            _dest_origin.push({{{ makeGetValue('dst_origin', 'i*4', 'i32') }}});
            _region.push({{{ makeGetValue('region', 'i*4', 'i32') }}});            
          }

          for (var i = 0; i < num_events_in_wait_list; i++) {
            var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
            if (_event_wait in CL.cl_objects) {
              _event_wait_list.push(_event_wait);
            } else {
#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
              return webcl.INVALID_EVENT;    
            }
          } 

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueCopyBufferToImage",[CL.cl_objects[src_buffer],CL.cl_objects[dst_image],src_offset,_dest_origin,_region,_event_wait_list,_event]);
#endif    
  
          CL.cl_objects[command_queue].enqueueCopyBufferToImage(CL.cl_objects[src_buffer],CL.cl_objects[dst_image],src_offset,_dest_origin,_region,_event_wait_list);    
          // CL.cl_objects[command_queue].enqueueCopyBufferToImage(CL.cl_objects[src_buffer],CL.cl_objects[dst_image],src_offset,_dest_origin,_region,_event_wait_list,_event);   
          // if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};

      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"buffer / image are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS;
  },

  clEnqueueMapBuffer: function(command_queue,buffer,blocking_map,map_flags_i64_1,map_flags_i64_2,offset,cb,num_events_in_wait_list,event_wait_list,event,cl_errcode_ret) {
    // Assume the map_flags is i32 
    assert(map_flags_i64_2 == 0, 'Invalid map flags i64');

    console.error("clEnqueueMapBuffer: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    return webcl.INVALID_VALUE; 
  },

  clEnqueueMapImage: function(command_queue,image,blocking_map,map_flags_i64_1,map_flags_i64_2,origin,region,image_row_pitch,image_slice_pitch,num_events_in_wait_list,event_wait_list,event,cl_errcode_ret) {
    // Assume the map_flags is i32 
    assert(map_flags_i64_2 == 0, 'Invalid map flags i64');
    
    console.error("clEnqueueMapImage: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    return webcl.INVALID_VALUE; 
  },

  clEnqueueUnmapMemObject: function(command_queue,memobj,mapped_ptr,num_events_in_wait_list,event_wait_list,event) {
    
    console.error("clEnqueueUnmapMemObject: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    return webcl.INVALID_VALUE; 
  },

  clEnqueueNDRangeKernel: function(command_queue,kernel,work_dim,global_work_offset,global_work_size,local_work_size,num_events_in_wait_list,event_wait_list,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueNDRangeKernel",[command_queue,kernel,work_dim,global_work_offset,global_work_size,local_work_size,num_events_in_wait_list,event_wait_list,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if (kernel in CL.cl_objects) {

          var _event;
          var _event_wait_list = [];

          // Workink Draft take CLuint[3]
          var _global_work_offset = [];
          var _global_work_size = [];
          var _local_work_size = [];

          // Webkit take UInt32Array
          //var _global_work_offset = global_work_offset == 0 ? null : new Int32Array(work_dim);
          //var _global_work_size = new Int32Array(work_dim);
          //var _local_work_size = local_work_size == 0 ? null : new Int32Array(work_dim);

          for (var i = 0; i < work_dim; i++) {
            _global_work_size.push({{{ makeGetValue('global_work_size', 'i*4', 'i32') }}});

            if (global_work_offset != 0)
              _global_work_offset.push({{{ makeGetValue('global_work_offset', 'i*4', 'i32') }}});
            
            if (local_work_size != 0)
              _local_work_size.push({{{ makeGetValue('local_work_size', 'i*4', 'i32') }}});
            
            //_global_work_size[i] = {{{ makeGetValue('global_work_size', 'i*4', 'i32') }}};

            //if (_global_work_offset)
            //  _global_work_offset[i] = {{{ makeGetValue('global_work_offset', 'i*4', 'i32') }}};
            
            //if (_local_work_size)
            //  _local_work_size[i] = {{{ makeGetValue('local_work_size', 'i*4', 'i32') }}};
          }

          for (var i = 0; i < num_events_in_wait_list; i++) {
            var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
            if (_event_wait in CL.cl_objects) {
              _event_wait_list.push(_event_wait);
            } else {
#if OPENCL_STACK_TRACE
              CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
              return webcl.INVALID_EVENT;    
            }
          } 

#if OPENCL_DEBUG
          console.info("Global [ "+ _global_work_size +" ]")
          console.info("Local [ "+ _local_work_size +" ]")
          console.info("Offset [ "+ _global_work_offset +" ]")          
#endif

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueNDRangeKernel",[CL.cl_objects[kernel],work_dim,_global_work_offset,_global_work_size,_local_work_size,_event_wait_list,_event]);
#endif    
  
          CL.cl_objects[command_queue].enqueueNDRangeKernel(CL.cl_objects[kernel],work_dim,_global_work_offset,_global_work_size,_local_work_size,_event_wait_list);    
          // CL.cl_objects[command_queue].enqueueNDRangeKernel(CL.cl_objects[kernel],work_dim,_global_work_offset,_global_work_size,_local_work_size,_event_wait_list,_event); 
          // if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};

      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"kernel are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS;    

  },

  clEnqueueTask: function(command_queue,kernel,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueTask: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    return webcl.INVALID_VALUE; 
  },

  clEnqueueNativeKernel: function(command_queue,user_func,args,cb_args,num_mem_objects,mem_list,args_mem_loc,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueNativeKernel: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    return webcl.INVALID_VALUE; 
  },

  clEnqueueMarker: function(command_queue,event) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueMarker",[command_queue,event]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

        if (kernel in CL.cl_objects) {

          var _event;

#if OPENCL_STACK_TRACE
          CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueMarker",[_event]);
#endif    
  
          CL.cl_objects[command_queue].enqueueMarker(_event);    
          // if (event != 0) {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};

      } else {
#if OPENCL_STACK_TRACE
          CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"kernel are NULL","");
#endif
          return webcl.INVALID_MEM_OBJECT;
        }
      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS; 
  },

  clEnqueueWaitForEvents: function(command_queue,num_events,event_list) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueWaitForEvents",[command_queue,num_events,event_list]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {
  
        var _events;

        for (var i = 0; i < num_events; i++) {
          var _event = {{{ makeGetValue('event_list', 'i*4', 'i32') }}};
          if (_event in CL.cl_objects) {
            _events.push(_event);
          } else {
#if OPENCL_STACK_TRACE
            CL.webclEndStackTrace([webcl.INVALID_EVENT],"",e.message);
#endif    
            return webcl.INVALID_EVENT;    
          }
        } 

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueWaitForEvents",[_events]);
#endif    
    
        CL.cl_objects[command_queue].enqueueWaitForEvents(_events);   

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS; 
  },

  clEnqueueBarrier: function(command_queue) {
#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clEnqueueBarrier",[command_queue]);
#endif

    try { 

      if (command_queue in CL.cl_objects) {

#if OPENCL_STACK_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueBarrier",[]);
#endif    
    
        CL.cl_objects[command_queue].enqueueBarrier();   

      } else {
#if OPENCL_STACK_TRACE
        CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"command_queue are NULL","");
#endif
        return webcl.INVALID_COMMAND_QUEUE;
      }

    } catch (e) {
      var _error = CL.catchError(e);

#if OPENCL_STACK_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if OPENCL_STACK_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS; 
  },

  clGetExtensionFunctionAddress: function(func_name) {
    console.error("clGetExtensionFunctionAddress: Not yet implemented\n");
  },

  clCreateFromGLBuffer: function(context,flags_i64_1,flags_i64_2,bufobj,errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
    console.error("clCreateFromGLBuffer: Not yet implemented\n");
  },

  clCreateFromGLTexture: function(context,flags_i64_1,flags_i64_2,target,miplevel,texture,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
    console.error("clCreateFromGLTexture: Not yet implemented\n");
  },

  clCreateFromGLTexture2D: function(context,flags_i64_1,flags_i64_2,target,miplevel,texture,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
    console.error("clCreateFromGLTexture2D: Not yet implemented\n");
  },

  clCreateFromGLTexture3D: function(context,flags_i64_1,flags_i64_2,target,miplevel,texture,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
    console.error("clCreateFromGLTexture3D: Not yet implemented\n");
  },

  clCreateFromGLRenderbuffer: function(context,flags_i64_1,flags_i64_2,renderbuffer,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
    console.error("clCreateFromGLRenderbuffer: Not yet implemented\n");
  },

  clGetGLObjectInfo: function(memobj,gl_object_type,gl_object_name) {
    console.error("clGetGLObjectInfo: Not yet implemented\n");
  },

  clGetGLTextureInfo: function(memobj,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetGLTextureInfo: Not yet implemented\n");
  },

  clEnqueueAcquireGLObjects: function(command_queue,num_objects,mem_objects,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueAcquireGLObjects: Not yet implemented\n");
  },

  clEnqueueReleaseGLObjects: function(command_queue,num_objects,mem_objects,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueReleaseGLObjects: Not yet implemented\n");
  },

};

autoAddDeps(LibraryOpenCL, '$CL');
mergeInto(LibraryManager.library, LibraryOpenCL);

