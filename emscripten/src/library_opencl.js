var LibraryOpenCL = {  
  $CL__deps: ['$GL'],
  $CL: {
    // Private array of chars to use
    cl_digits: '123456789'.split(''),
    cl_bitshift: {2:1,4:2,8:3,16:4,32:5},
    cl_objects: {},
    cl_objects_size: 0,

    udid: function (obj) {
      
      var _id;
      
      if (obj !== undefined) {
         _id = obj.udid;
         
#if OPENCL_DEBUG         
         console.info("udid() : get udid property: "+ obj + ".udid = "+_id+ " - "+(_id !== undefined));
#endif

         if (_id !== undefined) {
           return _id;
         }
      }

      var _uuid = [];

      for (var i = 0; i < 7; i++) _uuid[i] = CL.cl_digits[0 | Math.random()*CL.cl_digits.length];

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
        Object.defineProperty(obj, "udid", { value : _id,writable : false });
        CL.cl_objects_size++;
        CL.cl_objects[_id]=obj;
#if OPENCL_DEBUG             
        console.info("udid() : set udid property: "+ obj + ".udid = "+_id+ " - "+(_id !== undefined) + " --> Size : " + CL.cl_objects_size);
#endif      
      }

      return _id;      
    },

    isFloat: function(ptr,size) {
      var _begin  = {{{ makeGetValue('ptr', '0', 'float') }}};
      var _middle = {{{ makeGetValue('ptr', 'size>>1', 'float') }}};
      var _end    = {{{ makeGetValue('ptr', 'size', 'float') }}};

      if ((_begin + _middle + _end).toFixed(20) > 0 ) {
        return 1;
      } else {
        return 0;
      } 
    },

    catchError: function(e) {
      console.error(e);
      var _error = -1;

      if (e instanceof WebCLException) {
        var _str=e.message;
        var _n=_str.lastIndexOf(" ");
        _error = _str.substr(_n+1,_str.length-_n-1);
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
  webclPrintStackTrace: function(stack_string,stack_size) {
    var _size = {{{ makeGetValue('stack_size', '0', 'i32') }}} ;
    
    if (_size == 0) {
      {{{ makeSetValue('stack_size', '0', 'CL.stack_trace.length', 'i32') }}} /* Num of devices */;
    } else {
      writeStringToMemory(CL.stack_trace, stack_string);
    }
  },
#endif

  clGetPlatformIDs: function(num_entries,platforms,num_platforms) {

    // Test UDID 
    // for (var i = 0 ; i < 100000; i++) {
    //   CL.udid();
    // }

#if OPENCL_STACK_TRACE
    CL.webclBeginStackTrace("clGetPlatformIDs",[num_entries,platforms,num_platforms]);
#endif

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
           
            for (var i = 0; i < _info.length; i++) {
              if (param_value != 0) {{{ makeSetValue('param_value', 'i*4', '_info[i]', 'i32') }}};
            }
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size>>2,_info.length)', 'i32') }}};
          
          } else if (_info instanceof WebCLPlatform) {
         
            var _id = CL.udid(_info);
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};
          
          } else {
            console.error("clGetDeviceInfo : "+typeof(_info)+" not yet implemented");
          }
        } else {
          console.error("clGetDeviceInfo : "+typeof(_info)+" not yet implemented");
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
              if (!(_webcl instanceof WebCLGL)){
                _sharedContext = Module.ctx;
#if OPENCL_STACK_TRACE
                CL.webclCallStackTrace(""+webcl+".getExtension",["KHR_GL_SHARING"]);
#endif              
                _webcl = webcl.getExtension("KHR_GL_SHARING");
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

      if (_webcl instanceof WebCLGL) {   
        _prop = {platform: _platform, devices: _devices, deviceType: _deviceType, sharedContext: _sharedContext};
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
              if (!(_webcl instanceof WebCLGL)){
                _sharedContext = Module.ctx;

#if OPENCL_STACK_TRACE
                CL.webclCallStackTrace(""+webcl+".getExtension",["KHR_GL_SHARING"]);
#endif              
                _webcl = webcl.getExtension("KHR_GL_SHARING");
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

      if (_webcl instanceof WebCLGL) {
        _prop = {platform: _platform, devices: _devices, deviceType: _deviceType, sharedContext: _sharedContext};
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
        CL.cl_objects_size--;

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

            for (var i = 0; i < _info.length; i++) {
              var _id = CL.udid(_info[i]);
              if (param_value != 0) {{{ makeSetValue('param_value', 'i*4', '_id', 'i32') }}};
            }
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', 'Math.min(param_value_size>>2,_info.length)', 'i32') }}};

          } else {
            console.error("clGetContextInfo : "+typeof(_info)+" not yet implemented");
          }
        } else {
          console.error("clGetContextInfo : "+typeof(_info)+" not yet implemented");
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
        CL.cl_objects_size--;

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

        } else if(typeof(_info) == "object") {

          if ( (_info instanceof WebCLDevice) || (_info instanceof WebCLContext)) {
         
            var _id = CL.udid(_info);
            if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
            if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '1', 'i32') }}};

          } else {
            console.error("clGetCommandQueueInfo : "+typeof(_info)+" not yet implemented");
          }
        } else {
          console.error("clGetCommandQueueInfo : "+typeof(_info)+" not yet implemented");
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
        _host_ptr = new ArrayBuffer(size);

        var _size = size >> 2;

        if (CL.isFloat(host_ptr, _size)) {
          for (var i = 0; i < _size; i++ ) {
            _host_ptr[i] = {{{ makeGetValue('host_ptr', 'i*4', 'float') }}};
          }
        } else {
          for (var i = 0; i < _size; i++ ) {
            _host_ptr[i] = {{{ makeGetValue('host_ptr', 'i*4', 'i32') }}};
          }
        }
      } else if (flags_i64_1 & ~_flags) {
        // /!\ For the CL_MEM_USE_HOST_PTR (1 << 3)... 
        // may be i can do fake it using the same behavior than CL_MEM_COPY_HOST_PTR --> @steven What do you thing ??

        console.error("clCreateBuffer : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
      }

#if OPENCL_STACK_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".clCreateBuffer",[_flags,size,_host_ptr]);
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
    
    console.error("clCreateSubBuffer: Not yet implemented\n");
  },

  clCreateImage2D: function(context,flags_i64_1,flags_i64_2,image_format,image_width,image_height,image_row_pitch,host_ptr,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
    console.error("clCreateImage2D: Not yet implemented\n");
  },

  clCreateImage3D: function(context,flags_i64_1,flags_i64_2,image_format,image_width,image_height,image_depth,image_row_pitch,image_slice_pitch,host_ptr,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
    console.error("clCreateImage3D: Not yet implemented\n");
  },

  clRetainMemObject: function(memobj) {
    console.error("clRetainMemObject: Not yet implemented\n");
  },

  clReleaseMemObject: function(memobj) {
    console.error("clReleaseMemObject: Not yet implemented\n");
  },

  clGetSupportedImageFormats: function(context,flags_i64_1,flags_i64_2,image_type,num_entries,image_formats,num_image_formats) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
    console.error("clGetSupportedImageFormats: Not yet implemented\n");
  },

  clGetMemObjectInfo: function(memobj,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetMemObjectInfo: Not yet implemented\n");
  },

  clGetImageInfo: function(image,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetImageInfo: Not yet implemented\n");
  },

  clSetMemObjectDestructorCallback: function(memobj,pfn_notify,user_data) {
    console.error("clSetMemObjectDestructorCallback: Not yet implemented\n");
  },

  clCreateSampler: function(context,normalized_coords,addressing_mode,filter_mode,cl_errcode_ret) {
    console.error("clCreateSampler: Not yet implemented\n");
  },

  clRetainSampler: function(sampler) {
    console.error("clRetainSampler: Not yet implemented\n");
  },

  clReleaseSampler: function(sampler) {
    console.error("clReleaseSampler: Not yet implemented\n");
  },

  clGetSamplerInfo: function(sampler,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetSamplerInfo: Not yet implemented\n");
  },

  clCreateProgramWithSource: function(context,count,strings,lengths,cl_errcode_ret) {
    console.error("clCreateProgramWithSource: Not yet implemented\n");
  },

  clCreateProgramWithBinary: function(context,num_devices,device_list,lengths,inaries,cl_binary_status,cl_errcode_ret) {
    console.error("clCreateProgramWithBinary: Not yet implemented\n");
  },

  clRetainProgram: function(program) {
    console.error("clRetainProgram: Not yet implemented\n");
  },

  clReleaseProgram: function(program) {
    console.error("clReleaseProgram: Not yet implemented\n");
  },

  clBuildProgram: function(program,num_devices,device_list,options,pfn_notify,user_data) {
    console.error("clBuildProgram: Not yet implemented\n");
  },

  clUnloadCompiler: function() {
    console.error("clUnloadCompiler: Not yet implemented\n");
  },

  clGetProgramInfo: function(program,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetProgramInfo: Not yet implemented\n");
  },

  clGetProgramBuildInfo: function(program,device,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetProgramBuildInfo: Not yet implemented\n");
  },

  clCreateKernel: function(program,kernel_name,cl_errcode_ret) {
    console.error("clCreateKernel: Not yet implemented\n");
  },

  clCreateKernelsInProgram: function(program,num_kernels,kernels,num_kernels_ret) {
    console.error("clCreateKernelsInProgram: Not yet implemented\n");
  },

  clRetainKernel: function(kernel) {
    console.error("clRetainKernel: Not yet implemented\n");
  },

  clReleaseKernel: function(kernel) {
    console.error("clReleaseKernel: Not yet implemented\n");
  },

  clSetKernelArg: function(kernel,arg_index,arg_size,arg_value) {
    console.error("clSetKernelArg: Not yet implemented\n");
  },

  clGetKernelInfo: function(kernel,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetKernelInfo: Not yet implemented\n");
  },

  clGetKernelWorkGroupInfo: function(kernel,device,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetKernelWorkGroupInfo: Not yet implemented\n");
  },

  clWaitForEvents: function(num_events,event_list) {
    console.error("clWaitForEvents: Not yet implemented\n");
  },

  clGetEventInfo: function(event,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetEventInfo: Not yet implemented\n");
  },

  clCreateUserEvent: function(context,cl_errcode_ret) {
    console.error("clCreateUserEvent: Not yet implemented\n");
  },

  clRetainEvent: function(event) {
    console.error("clRetainEvent: Not yet implemented\n");
  },

  clReleaseEvent: function(event) {
    console.error("clReleaseEvent: Not yet implemented\n");
  },

  clSetUserEventStatus: function(event,execution_status) {
    console.error("clSetUserEventStatus: Not yet implemented\n");
  },

  clSetEventCallback: function(event,command_exec_callback_type,pfn_notify,user_data) {
    console.error("clSetEventCallback: Not yet implemented\n");
  },

  clGetEventProfilingInfo: function(event,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetEventProfilingInfo: Not yet implemented\n");
  },

  clFlush: function(command_queue) {
    console.error("clFlush: Not yet implemented\n");
  },

  clFinish: function(command_queue) {
    console.error("clFinish: Not yet implemented\n");
  },

  clEnqueueReadBuffer: function(command_queue,buffer,blocking_read,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueReadBuffer: Not yet implemented\n");
  },

  clEnqueueReadBufferRect: function(command_queue,buffer,blocking_read,buffer_origin,host_origin,region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueReadBufferRect: Not yet implemented\n");
  },

  clEnqueueWriteBuffer: function(command_queue,buffer,blocking_write,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueWriteBuffer: Not yet implemented\n");
  },

  clEnqueueWriteBufferRect: function(command_queue,buffer,blocking_write,buffer_origin,host_origin,region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueWriteBufferRect: Not yet implemented\n");
  },

  clEnqueueCopyBuffer: function(command_queue,src_buffer,dst_buffer,src_offset,dst_offset,cb,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueCopyBuffer: Not yet implemented\n");
  },

  clEnqueueReadImage: function(command_queue,image,blocking_read,origin,region,row_pitch,slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueReadImage: Not yet implemented\n");
  },

  clEnqueueWriteImage: function(command_queue,image,blocking_write,origin,region,input_row_pitch,input_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueWriteImage: clEnqueueWriteImage: Not yet implemented\n");
  },

  clEnqueueCopyImage: function(command_queue,src_image,dst_image,src_origin,dst_origin,region,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueCopyImage: Not yet implemented\n");
  },

  clEnqueueCopyImageToBuffer: function(command_queue,src_image,dst_buffer,src_origin,region,dst_offset,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueCopyImageToBuffer: Not yet implemented\n");
  },

  clEnqueueCopyBufferToImage: function(command_queue,src_buffer,dst_image,src_offset,dst_origin,region,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueCopyBufferToImage: Not yet implemented\n");
  },

  clEnqueueMapBuffer: function(command_queue,buffer,blocking_map,map_flags_i64_1,map_flags_i64_2,offset,cb,num_events_in_wait_list,event_wait_list,event,cl_errcode_ret) {
    // Assume the map_flags is i32 
    assert(map_flags_i64_2 == 0, 'Invalid map flags i64');

    console.error("clEnqueueMapBuffer: Not yet implemented\n");
  },

  clEnqueueMapImage: function(command_queue,image,blocking_map,map_flags_i64_1,map_flags_i64_2,origin,region,image_row_pitch,image_slice_pitch,num_events_in_wait_list,event_wait_list,event,cl_errcode_ret) {
    // Assume the map_flags is i32 
    assert(map_flags_i64_2 == 0, 'Invalid map flags i64');
    
    console.error("clEnqueueMapImage: Not yet implemented\n");
  },

  clEnqueueUnmapMemObject: function(command_queue,memobj,mapped_ptr,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueUnmapMemObject: Not yet implemented\n");
  },

  clEnqueueNDRangeKernel: function(command_queue,kernel,work_dim,global_work_offset,global_work_size,local_work_size,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueNDRangeKernel: Not yet implemented\n");
  },

  clEnqueueTask: function(command_queue,kernel,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueTask: Not yet implemented\n");
  },

  clEnqueueNativeKernel: function(command_queue,user_func,args,cb_args,num_mem_objects,mem_list,args_mem_loc,num_events_in_wait_list,event_wait_list,event) {
    console.error("clEnqueueNativeKernel: Not yet implemented\n");
  },

  clEnqueueMarker: function(command_queue,event) {
    console.error("clEnqueueMarker: Not yet implemented\n");
  },

  clEnqueueWaitForEvents: function(command_queue,num_events,event_list) {
    console.error("clEnqueueWaitForEvents: Not yet implemented\n");
  },

  clEnqueueBarrier: function(command_queue) {
    console.error("clEnqueueBarrier: Not yet implemented\n");
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

