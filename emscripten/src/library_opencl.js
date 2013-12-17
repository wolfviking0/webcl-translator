//
//  library_opencl.js
//  Licence : https://github.com/wolfviking0/webcl-translator/blob/master/LICENSE
//
//  Created by Anthony Liot.
//  Copyright (c) 2013 Anthony Liot. All rights reserved.
//

var LibraryOpenCL = {  

  $CL__deps: ['$GL'],
  $CL: {
    // Init
    cl_init: 0,
    // Extensions
    cl_extensions: ["KHR_GL_SHARING","KHR_fp16","KHR_fp64"],
    // Private array of chars to use
    cl_digits: [1,2,3,4,5,6,7,8,9,0],
    // Kernel parser
    cl_kernels_sig: {},
    // Structs Kernels parser
    cl_structs_sig: {},
    // Pointer type (void*)
    cl_pn_type: [],
    cl_objects: {},
    cl_objects_retains: {},

#if CL_VALIDATOR
    cl_validator: {},
    cl_validator_argsize: {},
#endif    

#if CL_PROFILE
    cl_elapsed_time: 0,
    cl_objects_counter: 0,
#endif

    init: function() {
      if (CL.cl_init == 0) {
#if CL_VALIDATOR
        console.log('%c WebCL-Translator + Validator V2.0 by Anthony Liot & Steven Eliuk ! ', 'background: #222; color: #bada55');
#else        
        console.log('%c WebCL-Translator V2.0 by Anthony Liot & Steven Eliuk ! ', 'background: #222; color: #bada55');
#endif        
        var nodejs = (typeof window === 'undefined');
        if(nodejs) {
          webcl = require('../webcl');
        } else {
          if (typeof(webcl) === "undefined") {
            webcl = window.WebCL;
          }
        }

        if (webcl == undefined) {
          alert("Unfortunately your system does not support WebCL. " +
          "Make sure that you have WebKit Samsung or Firefox Nokia plugin");

          console.error("Unfortunately your system does not support WebCL.\n");
          console.error("Make sure that you have WebKit Samsung or Firefox Nokia plugin\n");  
        } else {
          // Add webcl constant for parser
          webcl["SAMPLER"]          = 0x1300;
          webcl["IMAGE2D"]          = 0x1301;
          webcl["UNSIGNED_LONG"]    = 0x1302;

          for (var i = 0; i < CL.cl_extensions.length; i ++) {

#if CL_GRAB_TRACE
              CL.webclCallStackTrace(""+webcl+".enableExtension",[CL.cl_extensions[i]]);
#endif  
            if (webcl.enableExtension(CL.cl_extensions[i])) {
              console.info("WebCL Init : extension "+CL.cl_extensions[i]+" supported.");
            } else {
              console.info("WebCL Init : extension "+CL.cl_extensions[i]+" not supported !!!");
            }
          }
          CL.cl_init = 1;
        }
      }

      return CL.cl_init;
    },
    
    udid: function (obj) {    
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

#if CL_DEBUG
      if (_id in CL.cl_objects) {
        console.error("/!\\ **********************");
        console.error("/!\\ UDID not unique !!!!!!");
        console.error("/!\\ **********************");        
      }
#endif
    
      // /!\ Call udid when you add inside cl_objects if you pass object in parameter
      if (obj !== undefined) {
        Object.defineProperty(obj, "udid", { value : _id,writable : false });
        CL.cl_objects[_id]=obj;
#if CL_PROFILE             
        CL.cl_objects_counter++;
        //console.info("Counter++ HashMap Object : " + CL.cl_objects_counter + " - Udid : " + _id);
#endif      
      }

      return _id;      
    },

    stringType: function(pn_type) {
      switch(pn_type) {
        case webcl.SIGNED_INT8:
          return 'INT8';
        case webcl.SIGNED_INT16:
          return 'INT16';
        case webcl.SIGNED_INT32:
          return 'INT32';
        case webcl.UNSIGNED_INT8:
          return 'UINT8';
        case webcl.UNSIGNED_INT16:
          return 'UINT16';
        case webcl.UNSIGNED_INT32:
          return 'UINT32';
        case webcl.UNSIGNED_LONG:
          return 'ULONG';          
        case webcl.FLOAT:
          return 'FLOAT';
        case webcl.LOCAL:
          return '__local';   
        case webcl.SAMPLER:
          return 'sampler_t';   
        case webcl.IMAGE2D:
          return 'image2d_t';          
        default:
          if (typeof(pn_type) == "string") return 'struct';
          return 'UNKNOWN';
      }
    },

    parseType: function(string) {
      var _value = -1;
    
      // First ulong for the webcl validator
      if ( (string.indexOf("ulong") >= 0 ) || (string.indexOf("unsigned long") >= 0 ) ) {
        // \todo : long ???? 
        _value = webcl.UNSIGNED_LONG;  
      } else if (string.indexOf("float") >= 0 ) {
        _value = webcl.FLOAT;
      } else if ( (string.indexOf("uchar") >= 0 ) || (string.indexOf("unsigned char") >= 0 ) ) {
        _value = webcl.UNSIGNED_INT8;
      } else if ( string.indexOf("char") >= 0 ) {
        _value = webcl.SIGNED_INT8;
      } else if ( (string.indexOf("ushort") >= 0 ) || (string.indexOf("unsigned short") >= 0 ) ) {
        _value = webcl.UNSIGNED_INT16;
      } else if ( string.indexOf("short") >= 0 ) {
        _value = webcl.SIGNED_INT16;                     
      } else if ( (string.indexOf("uint") >= 0 ) || (string.indexOf("unsigned int") >= 0 ) ) {
        _value = webcl.UNSIGNED_INT32;          
      } else if ( ( string.indexOf("int") >= 0 ) || ( string.indexOf("enum") >= 0 ) ) {
        _value = webcl.SIGNED_INT32;
      } else if ( string.indexOf("image2d_t") >= 0 ) {
        _value = webcl.IMAGE2D;
      } else if ( string.indexOf("sampler_t") >= 0 ) {
        _value = webcl.SAMPLER;
      }

      return _value;
    },

    parseStruct: function(kernel_string,struct_name) {

      // Experimental parse of Struct
      // Search kernel function like 'struct_name { }' or '{ } struct_name'
      // --------------------------------------------------------------------------------
      // Step 1 : Search pattern struct_name { }
      // Step 2 : if no result : Search pattern { } struct_name
      // Step 3 : if no result : return
      // Step 4 : split by ; // Num of variable of the structure  : int toto; float tata;
      // Step 5 : split by , // Num of variable for each type     : float toto,tata,titi;
      // Step 6 : Search pattern [num] // Array Variable          : float toto[4];
      // Step 7 : Search type of the line
      // Step 8 : if exist add type else search other struct
      // --------------------------------------------------------------------------------

      CL.cl_structs_sig[struct_name] = [];

      // search pattern : struct_name { } ;
      var _re_before = new RegExp(struct_name+"[\ ]"+"\{([^}]+)\}");

      // search pattern : { } struct_name;
      var _re_after = new RegExp("\{([^}]+)\}"+"[\ ]"+struct_name);

      var _res = kernel_string.match(_re_before);
      var _contains_struct = "";
      
      if (_res != null && _res.length == 2) {
        _contains_struct = _res[1];
      } else {
        _res = kernel_string.match(_re_after);
        if (_res != null && _res.length == 2) {
            _contains_struct = _res[1];
        } else {
#if CL_DEBUG   
          console.error("Unknow Structure '"+struct_name+"', not found inside the kernel ...");
#endif
          return;
        }
      }

      var _var = _contains_struct.split(";");
      for (var i = 0; i < _var.length-1; i++ ) {
        // Need for unsigned int width, height;
        var _subvar = _var[i].split(","); 
        
        // Get type of the line
        var _type = CL.parseType(_var[i]);
      
        // Need for float mu[4];
        var _arrayNum = 0;
        _res = _var[i].match(/[0-9]+/); 
        if (_res != null) _arrayNum = _res;
      
        if ( _type != -1) {
          for (var j = 0; j < Math.max(_subvar.length,_arrayNum) ; j++ ) {
            CL.cl_structs_sig[struct_name].push(_type);
          }
        } else {
          // Search name of the parameter
          var _struct = _subvar[0].replace(/^\s+|\s+$/g, ""); // trim
          var _name = "";
          var _start = _struct.lastIndexOf(" "); 
          for (var j = _start - 1; j >= 0 ; j--) {
            var _chara = _struct.charAt(j);
            if (_chara == ' ' && _name.length > 0) {
              break;
            } else if (_chara != ' ') {
              _name = _chara + _name;
            }
          }
          
          // If struct is unknow search it
          if (!(_name in CL.cl_structs_sig && CL.cl_structs_sig[_name].length > 0)) {
            CL.parseStruct(kernel_string,_name);
          }

          for (var j = 0; j < Math.max(_subvar.length,_arrayNum) ; j++ ) {
            CL.cl_structs_sig[struct_name] = CL.cl_structs_sig[struct_name].concat(CL.cl_structs_sig[_name]);  
          }
        }
      }
    },

    parseKernel: function(kernel_string) {

#if 0
      console.info("Original Kernel String : ");
      console.info("--------------------------------------------------------------------");
      console.info(kernel_string);
      console.info("--------------------------------------------------------------------");
#endif

      // Experimental parse of Kernel
      // ----------------------------
      //
      // /!\ The minify kernel could be use by the program but some trouble with line
      // /!\ containing macro #define, for the moment only use the minify kernel for 
      // /!\ parsing __kernel and struct
      //
      // Search kernel function like __kernel ... NAME ( p1 , p2 , p3)  
      // --------------------------------------------------------------------------------
      // Step 1 : Minimize kernel removing all the comment and \r \n \t and multispace
      // Step 2 : Search pattern __kernel ... ( ... )
      // Step 3 : For each kernel
      // Step 3 . 1 : Search Open Brace
      // Step 3 . 2 : Search Kernel Name
      // Step 3 . 3 : Search Kernel Parameter
      // Step 3 . 4 : Grab { name : [ param, ... ] }
      // --------------------------------------------------------------------------------

      // Remove all comments ...
      var _mini_kernel_string  = kernel_string.replace(/(?:((["'])(?:(?:\\\\)|\\\2|(?!\\\2)\\|(?!\2).|[\n\r])*\2)|(\/\*(?:(?!\*\/).|[\n\r])*\*\/)|(\/\/[^\n\r]*(?:[\n\r]+|$))|((?:=|:)\s*(?:\/(?:(?:(?!\\*\/).)|\\\\|\\\/|[^\\]\[(?:\\\\|\\\]|[^]])+\])+\/))|((?:\/(?:(?:(?!\\*\/).)|\\\\|\\\/|[^\\]\[(?:\\\\|\\\]|[^]])+\])+\/)[gimy]?\.(?:exec|test|match|search|replace|split)\()|(\.(?:exec|test|match|search|replace|split)\((?:\/(?:(?:(?!\\*\/).)|\\\\|\\\/|[^\\]\[(?:\\\\|\\\]|[^]])+\])+\/))|(<!--(?:(?!-->).)*-->))/g
, "");
      
      // Remove all char \n \r \t ...
      _mini_kernel_string = _mini_kernel_string.replace(/\n/g, " ");
      _mini_kernel_string = _mini_kernel_string.replace(/\r/g, " ");

      // Remove all the multispace
      _mini_kernel_string = _mini_kernel_string.replace(/\s{2,}/g, " ");

      // Search pattern : __kernel ... ( ... )
      // var _matches = _mini_kernel_string.match(/__kernel[A-Za-z0-9_\s]+\(([^)]+)\)/g);
      // if (_matches == null) {
      //   console.error("/!\\ Not found kernel !!!");
      //   return;
      // }

      // Search kernel (Pattern doesn't work with extra __attribute__)
      var _matches = [];
      var _found = 1;
      var _stringKern = _mini_kernel_string;
      var _security = 10;

      // Search all the kernel
      while (_found && _security) {
        // Just in case no more than 10 loop
        _security --;

        var _kern = _stringKern.indexOf("__kernel");
        if (_kern == -1) {
          _found = 0;
          continue;
        }

        _stringKern = _stringKern.substr(_kern + 8,_stringKern.length - _kern);
        
        var _brace = _stringKern.indexOf("{");
        var _stringKern2 = _stringKern.substr(0,_brace);
        var _braceOpen = _stringKern2.lastIndexOf("(");
        var _braceClose = _stringKern2.lastIndexOf(")");
        var _stringKern3 = _stringKern2.substr(0,_braceOpen);
        var _space = _stringKern3.lastIndexOf(" ");

        _stringKern2 = _stringKern2.substr(_space,_braceClose);

        // Add the kernel result like name_kernel(..., ... ,...)
        _matches.push(_stringKern2);
      }

      // For each kernel ....
      for (var i = 0; i < _matches.length; i ++) {
        // Search the open Brace
        var _brace = _matches[i].lastIndexOf("(");

        // Part before '('
        var _first_part = _matches[i].substr(0,_brace);
        _first_part = _first_part.replace(/^\s+|\s+$/g, ""); // trim

        // Part after ')'
        var _second_part = _matches[i].substr(_brace+1,_matches[i].length-_brace-2);
        _second_part = _second_part.replace(/^\s+|\s+$/g, ""); // trim

        // Search name part
        var _name = _first_part.substr(_first_part.lastIndexOf(" ") + 1);

        // Do not reparse again if the file was already parse (ie: Reduce sample)
        if (_name in CL.cl_kernels_sig) return;

        // Search parameter part
        var _param = [];

#if CL_VALIDATOR        
        var _param_validator = [];
        var _param_argsize_validator = [];
#endif        
        var _array = _second_part.split(","); 
        for (var j = 0; j < _array.length; j++) {
          var _type = CL.parseType(_array[j]);

          if (_array[j].indexOf("__local") >= 0 ) {
            _param.push(webcl.LOCAL);

#if CL_VALIDATOR
            if (_array[j].indexOf("ulong _wcl") == -1 ) {
              _param_validator.push(_param.length - 1);
            } else {
              _param_argsize_validator.push(_param.length - 1);
            }
#endif    

          } else if (_type == -1) {
                       
            _array[j] = _array[j].replace(/^\s+|\s+$/g, "");
            _array[j] = _array[j].replace("*", "");

            var _start = _array[j].lastIndexOf(" "); 
            if (_start != -1) {
              var _kernels_struct_name = "";
              // Search Parameter type Name
              for (var k = _start - 1; k >= 0 ; k--) {

                var _chara = _array[j].charAt(k);
                if (_chara == ' ' && _kernels_struct_name.length > 0) {
                  break;
                } else if (_chara != ' ') {
                  _kernels_struct_name = _chara + _kernels_struct_name;
                }
              }

              // Parse struct only if is not already inside the map
              if (!(_kernels_struct_name in CL.cl_structs_sig))
                CL.parseStruct(_mini_kernel_string, _kernels_struct_name);
            
              // Add the name of the struct inside the map of param kernel
              _param.push(_kernels_struct_name);         

            } else {
#if CL_DEBUG
              console.error("Unknow parameter type inside '"+_array[j]+"', can be a struct, use float by default ...");
#endif        
              _param.push(webcl.FLOAT);
            }

          } else {
            _param.push(_type);

#if CL_VALIDATOR
            if (_array[j].indexOf("ulong _wcl") == -1 ) {
              _param_validator.push(_param.length - 1);
            } else {
              _param_argsize_validator.push(_param.length - 1);
            }
#endif    
          }
        }        

        CL.cl_kernels_sig[_name] = _param;

#if CL_VALIDATOR        
        CL.cl_validator[_name] = _param_validator;
        CL.cl_validator_argsize[_name] = _param_argsize_validator;
#endif
      }

#if 0         
      console.info("Mini Kernel String : ");
      console.info("--------------------------------------------------------------------");
      console.info(_mini_kernel_string);
      console.info("--------------------------------------------------------------------");
#endif

      for (var name in CL.cl_kernels_sig) {
        var _length = CL.cl_kernels_sig[name].length;
        var _str = "";
        for (var i = 0; i < _length ; i++) {
          var _type = CL.cl_kernels_sig[name][i];
          _str += _type + "("+CL.stringType(_type)+")";
          if (i < _length - 1) _str += ", ";
        }

        console.info("Kernel " + name + "(" + _length + ")");  
        console.info("\t" + _str);  

#if CL_VALIDATOR
        console.info("\tValidator Info : ");
        console.info("\t\tARG PARAM KERNEL"); 
        var _str = "( ";
        var _length = CL.cl_validator[name].length;
        for (var i = 0 ; i < _length ; i++) {
            _str += CL.cl_validator[name][i];
            if (i < _length - 1) _str += ", ";
        }
        _str += " )";
        console.info("\t\t\t"+_str);
        console.info("\t\tARG SIZE PARAM KERNEL (ulong _wcl...)"); 
        var _str = "( ";
        var _length = CL.cl_validator_argsize[name].length;
        for (var i = 0 ; i < _length ; i++) {
            _str += CL.cl_validator_argsize[name][i];
            if (i < _length - 1) _str += ", ";
        }
        _str += " )";
        console.info("\t\t\t"+_str);
#endif

      }

      for (var name in CL.cl_structs_sig) {
        var _length = CL.cl_structs_sig[name].length;
        var _str = "";
        for (var i = 0; i < _length ; i++) {
          var _type = CL.cl_structs_sig[name][i];
          _str += _type + "("+CL.stringType(_type)+")";
          if (i < _length - 1) _str += ", ";
        }

        console.info("\n\tStruct " + name + "(" + _length + ")");  
        console.info("\t\t" + _str);              
      }

      return _mini_kernel_string;

    },

    getImageSizeType: function (image) {
      var _sizeType = 0;

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+CL.cl_objects[image]+".getInfo",[webcl.IMAGE_FORMAT]);
#endif   
      
      var _info = CL.cl_objects[image].getInfo(webcl.IMAGE_FORMAT);

      switch (_info.channelType) {
        case webcl.SNORM_INT8:
        case webcl.SIGNED_INT8:
        case webcl.UNORM_INT8:        
        case webcl.UNSIGNED_INT8:
          _sizeType = 1;
          break;
        case webcl.SNORM_INT16:
        case webcl.SIGNED_INT16:
        case webcl.UNORM_INT16:        
        case webcl.UNSIGNED_INT16:
        case webcl.HALF_FLOAT:
          _sizeType = 2;      
          break;
        case webcl.SIGNED_INT32:
        case webcl.UNSIGNED_INT32:      
        case webcl.FLOAT:
          _sizeType = 4;
          break;
        default:
          console.error("getImageSizeType : This channel type is not yet implemented => "+_info.channelType);
      }

      return _sizeType;
    },


    getImageFormatType: function (image) {
      var _type = 0;

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+CL.cl_objects[image]+".getInfo",[webcl.IMAGE_FORMAT]);
#endif   

      var _info = CL.cl_objects[image].getInfo(webcl.IMAGE_FORMAT);

      switch (_info.channelType) {
        case webcl.SNORM_INT8:
        case webcl.SIGNED_INT8:
          _type = webcl.SIGNED_INT8;
          break;
        case webcl.UNORM_INT8:        
        case webcl.UNSIGNED_INT8:
          _type = webcl.UNSIGNED_INT8;
          break;
        case webcl.SNORM_INT16:
        case webcl.SIGNED_INT16:
          _type = webcl.SIGNED_INT16;
          break;
        case webcl.UNORM_INT16:        
        case webcl.UNSIGNED_INT16:
          _type = webcl.UNSIGNED_INT16;
          break;
        case webcl.SIGNED_INT32:
          _type = SIGNED_INT32;
        case webcl.UNSIGNED_INT32:
          _type = UNSIGNED_INT32;
          break;        
        case webcl.FLOAT:
          _type = webcl.FLOAT;
          break;
        default:
          console.error("getImageFormatType : This channel type is not yet implemented => "+_info.channelType);
      }

      return _type;
    },

    getImageSizeOrder: function (image) {
      var _sizeOrder = 0;

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+CL.cl_objects[image]+".getInfo",[webcl.IMAGE_FORMAT]);
#endif   

      var _info = CL.cl_objects[image].getInfo(webcl.IMAGE_FORMAT);

      switch (_info.channelOrder) {
        case webcl.R:
        case webcl.A:
        case webcl.INTENSITY:
        case webcl.LUMINANCE:
          _sizeOrder = 1;
          break;
        case webcl.RG:
        case webcl.RA:
          _sizeOrder = 2;
          break;
        case webcl.RGB:
          _sizeOrder = 3;
          break; 
        case webcl.RGBA:
        case webcl.BGRA:
        case webcl.ARGB:      
          _sizeOrder = 4;
          break;        
        default:
          console.error("getImageFormatType : This channel order is not yet implemented => "+_info.channelOrder);
      }

      return _sizeOrder;
    },

    getCopyPointerToArray: function(ptr,size,type) { 

      var _host_ptr = null;

      if (type.length == 0) {
#if CL_DEBUG
        console.error("getCopyPointerToArray : error unknow type with length null "+type);
#endif
      }

      if (type.length == 1) {
        switch(type[0][0]) {
          case webcl.SIGNED_INT8:
            _host_ptr = new Int8Array( {{{ makeHEAPView('8','ptr','ptr+size') }}} );
            break;
          case webcl.SIGNED_INT16:
            _host_ptr = new Int16Array( {{{ makeHEAPView('16','ptr','ptr+size') }}} );
            break;
          case webcl.SIGNED_INT32:
            _host_ptr = new Int32Array( {{{ makeHEAPView('32','ptr','ptr+size') }}} );
            break;
          case webcl.UNSIGNED_INT8:
            _host_ptr = new Uint8Array( {{{ makeHEAPView('U8','ptr','ptr+size') }}} );
            break;
          case webcl.UNSIGNED_INT16:
            _host_ptr = new Uint16Array( {{{ makeHEAPView('U16','ptr','ptr+size') }}} );
            break;
          case webcl.UNSIGNED_INT32:
            _host_ptr = new Uint32Array( {{{ makeHEAPView('U32','ptr','ptr+size') }}} );
            break;         
          default:
            _host_ptr = new Float32Array( {{{ makeHEAPView('F32','ptr','ptr+size') }}} );
            break;
        }
      } else {
        _host_ptr = new Float32Array( {{{ makeHEAPView('F32','ptr','ptr+size') }}} );
        /*
        console.info("------");
        _host_ptr = new DataView(new ArrayBuffer(size));

        var _offset = 0;
        for (var i = 0; i < type.length; i++) {
          var _type = type[i][0];
          var _num = type[i][1];
          switch(_type) {
            case webcl.SIGNED_INT8:
              _host_ptr.setInt8(_offset,new Int8Array( {{{ makeHEAPView('8','ptr+_offset','ptr+_offset+_num') }}} ));
              console.info("setInt8 : "+_offset+ " - "+(_offset+_num)+" / "+size );
              _offset += _num;
              break;
            case webcl.SIGNED_INT16:
              _host_ptr.setInt16(_offset,new Int16Array( {{{ makeHEAPView('16','ptr+_offset','ptr+_offset+_num*2') }}} ));
              console.info("setInt16 : "+_offset+ " - "+(_offset+_num*2)+" / "+size );
              _offset += 2*_num;
              break;
            case webcl.SIGNED_INT32:
              _host_ptr.setInt32(_offset,new Int32Array( {{{ makeHEAPView('32','ptr+_offset','ptr+_offset+_num*4') }}} ));
              console.info("setInt32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
              _offset += 4*_num;
              break;
            case webcl.UNSIGNED_INT8:
              _host_ptr.setUint8(_offset,new Uint8Array( {{{ makeHEAPView('U8','ptr+_offset','ptr+_offset+_num') }}} ));
              console.info("setUint8 : "+_offset+ " - "+(_offset+_num)+" / "+size );
              _offset += _num;
              break;
            case webcl.UNSIGNED_INT16:
              host_ptr.setUint16(_offset,new Uint16Array( {{{ makeHEAPView('U16','ptr+_offset','ptr+_offset+_num*2') }}} ));
              console.info("setUint16 : "+_offset+ " - "+(_offset+_num*2)+" / "+size );
              _offset += 2*_num;
              break;
            case webcl.UNSIGNED_INT32:
              _host_ptr.setUint32(_offset,new Uint32Array( {{{ makeHEAPView('U32','ptr+_offset','ptr+_offset+_num*4') }}} ));
              console.info("setUint32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
              _offset += 4*_num;
              break;         
            default:
              _host_ptr.setFloat32(_offset,new Float32Array( {{{ makeHEAPView('F32','ptr+_offset','ptr+_offset+_num*4') }}} ));
              console.info("setFloat32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
              _offset += 4*_num;
              break;
          }
        }*/
      }

      return _host_ptr;
    },

    getReferencePointerToArray: function(ptr,size,type) {  
      var _host_ptr = null;

      if (type.length == 0) {
#if CL_DEBUG        
        console.error("getCopyPointerToArray : error unknow type with length null "+type);
#endif
      }

      if (type.length == 1) {
        switch(type[0][0]) {
          case webcl.SIGNED_INT8:
            _host_ptr = {{{ makeHEAPView('8','ptr','ptr+size') }}};
            break;
          case webcl.SIGNED_INT16:
            _host_ptr = {{{ makeHEAPView('16','ptr','ptr+size') }}};
            break;
          case webcl.SIGNED_INT32:
            _host_ptr = {{{ makeHEAPView('32','ptr','ptr+size') }}};
            break;
          case webcl.UNSIGNED_INT8:
            _host_ptr = {{{ makeHEAPView('U8','ptr','ptr+size') }}};
            break;
          case webcl.UNSIGNED_INT16:
            _host_ptr = {{{ makeHEAPView('U16','ptr','ptr+size') }}};
            break;
          case webcl.UNSIGNED_INT32:
            _host_ptr = {{{ makeHEAPView('U32','ptr','ptr+size') }}};
            break;         
          default:
            _host_ptr = {{{ makeHEAPView('F32','ptr','ptr+size') }}};
            break;
        }
      } else {
        _host_ptr = {{{ makeHEAPView('F32','ptr','ptr+size') }}};
        /*
        console.info("------");
        _host_ptr = new DataView(new ArrayBuffer(size));

        var _offset = 0;
        for (var i = 0; i < type.length; i++) {
          var _type = type[i][0];
          var _num = type[i][1];
          switch(_type) {
            case webcl.SIGNED_INT8:
              _host_ptr.setInt8(_offset,{{{ makeHEAPView('8','ptr+_offset','ptr+_offset+_num') }}} );
              console.info("setInt8 : "+_offset+ " - "+(_offset+_num)+" / "+size );
              _offset += _num;
              break;
            case webcl.SIGNED_INT16:
              _host_ptr.setInt16(_offset,{{{ makeHEAPView('16','ptr+_offset','ptr+_offset+_num*2') }}} );
              console.info("setInt16 : "+_offset+ " - "+(_offset+_num*2)+" / "+size );
              _offset += 2*_num;
              break;
            case webcl.SIGNED_INT32:
              _host_ptr.setInt32(_offset,{{{ makeHEAPView('32','ptr+_offset','ptr+_offset+_num*4') }}} );
              console.info("setInt32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
              _offset += 4*_num;
              break;
            case webcl.UNSIGNED_INT8:
              _host_ptr.setUint8(_offset,{{{ makeHEAPView('U8','ptr+_offset','ptr+_offset+_num') }}} );
              console.info("setUint8 : "+_offset+ " - "+(_offset+_num)+" / "+size );
              _offset += _num;
              break;
            case webcl.UNSIGNED_INT16:
              host_ptr.setUint16(_offset,{{{ makeHEAPView('U16','ptr+_offset','ptr+_offset+_num*2') }}} );
              console.info("setUint16 : "+_offset+ " - "+(_offset+_num*2)+" / "+size );
              _offset += 2*_num;
              break;
            case webcl.UNSIGNED_INT32:
              _host_ptr.setUint32(_offset,{{{ makeHEAPView('U32','ptr+_offset','ptr+_offset+_num*4') }}} );
              console.info("setUint32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
              _offset += 4*_num;
              break;         
            default:
              _host_ptr.setFloat32(_offset,{{{ makeHEAPView('F32','ptr+_offset','ptr+_offset+_num*4') }}} );
              console.info("setFloat32 : "+_offset+ " - "+(_offset+_num*4)+" / "+size );
              _offset += 4*_num;
              break;
          }
        }*/
      }

      return _host_ptr;
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

#if CL_GRAB_TRACE     
    stack_trace: "// Javascript webcl Stack Trace\n(*) => all the stack_trace are print before the JS function call except for enqueueReadBuffer\n",

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
        if ( 
          (parameter[i] instanceof Uint8Array)    ||
          (parameter[i] instanceof Uint16Array)   ||
          (parameter[i] instanceof Uint32Array)   ||
          (parameter[i] instanceof Int8Array)     ||
          (parameter[i] instanceof Int16Array)    ||
          (parameter[i] instanceof Int32Array)    ||
          (parameter[i] instanceof Float32Array)  ||          
          (parameter[i] instanceof ArrayBuffer)   ||            
          (parameter[i] instanceof Array)){ 

          CL.stack_trace += "[";  
          for (var j = 0; j < Math.min(25,parameter[i].length - 1) ; j++) {
            CL.stack_trace += parameter[i][j] + ",";
          }
          if (parameter[i].length > 25) {
            CL.stack_trace += " ... ,";
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
        if ( 
          (parameter[parameter.length - 1] instanceof Uint8Array)    ||
          (parameter[parameter.length - 1] instanceof Uint16Array)   ||
          (parameter[parameter.length - 1] instanceof Uint32Array)   ||
          (parameter[parameter.length - 1] instanceof Int8Array)     ||
          (parameter[parameter.length - 1] instanceof Int16Array)    ||
          (parameter[parameter.length - 1] instanceof Int32Array)    ||
          (parameter[parameter.length - 1] instanceof Float32Array)  ||          
          (parameter[parameter.length - 1] instanceof ArrayBuffer)   ||  
          (parameter[parameter.length - 1] instanceof Array)){ 

          CL.stack_trace += "[";  
          for (var j = 0; j < Math.min(25,parameter[parameter.length - 1].length - 1) ; j++) {
            CL.stack_trace += parameter[parameter.length - 1][j] + ",";
          }
          if (parameter[parameter.length - 1].length > 25) {
            CL.stack_trace += " ... ,";
          }
          if (parameter[parameter.length - 1].length >= 1) {
            CL.stack_trace += parameter[parameter.length - 1][parameter[parameter.length - 1].length - 1];
          }
          CL.stack_trace += "]";
        } else {
          CL.stack_trace += parameter[parameter.length - 1]; 
        }
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

#if CL_PRINT_TRACE
      console.info(CL.stack_trace);
      //alert(CL.stack_trace); // Useful for step by step debugging
      CL.stack_trace = "";
#endif   

    },
#endif
  },

  webclBeginProfile: function(name) {
#if CL_PROFILE
    // start profiling
    if (typeof window !== 'undefined') // Not nodejs
      console.profile(Pointer_stringify(name));
    CL.cl_elapsed_time = Date.now();
#endif
    return 0;
  },

  webclEndProfile: function() {
#if CL_PROFILE
    CL.cl_elapsed_time = Date.now() - CL.cl_elapsed_time;
    
    if (typeof window !== 'undefined') // Not nodejs
      console.profileEnd();
    
    console.info("Profiling : WebCL Object : " + CL.cl_objects_counter);
    var count = 0;
    for (obj in CL.cl_objects) {
      console.info("\t"+(count++)+" : "+CL.cl_objects[obj]);
    }
    console.info("Profiling : Elapsed Time : " + CL.cl_elapsed_time + " ms");
#endif
    return 0;
  },

  webclPrintStackTrace: function(param_value,param_value_size) {
#if CL_GRAB_TRACE
    var _size = {{{ makeGetValue('param_value_size', '0', 'i32') }}} ;
    
    if (_size == 0) {
      {{{ makeSetValue('param_value_size', '0', 'CL.stack_trace.length', 'i32') }}} /* Size of char stack */;
    } else {
      writeStringToMemory(CL.stack_trace, param_value);
    }
#else
    {{{ makeSetValue('param_value_size', '0', '0', 'i32') }}}
#endif    
    return webcl.SUCCESS;
  },


  clSetTypePointer: function(pn_type, num_pn_type) {
    /*pn_type : CL_SIGNED_INT8,CL_SIGNED_INT16,CL_SIGNED_INT32,CL_UNSIGNED_INT8,CL_UNSIGNED_INT16,CL_UNSIGNED_INT32,CL_FLOAT*/
    
    // Clean
    CL.cl_pn_type = [];

#if CL_DEBUG    
    var _debug = "clSetTypePointer : ("+num_pn_type+") [";
#endif    

    var _old_pn_type = -1;
    var _num_pn_type = 0;
    for (var i = 0; i < num_pn_type ; i++) {
      var _pn_type = {{{ makeGetValue('pn_type', 'i*4', 'i32') }}}

      if (_pn_type != _old_pn_type) {
        if (_num_pn_type > 0)
          CL.cl_pn_type.push([_old_pn_type,_num_pn_type]);       

        _old_pn_type = _pn_type;
        _num_pn_type = 1;
      } else {
        _num_pn_type ++;
      }

#if CL_DEBUG    
      if (i > 0) {
        _debug += ",";
      }

      _debug += CL.stringType(_pn_type);
#endif

    }

    if (_num_pn_type > 0)
      CL.cl_pn_type.push([_old_pn_type,_num_pn_type]);       
  
#if CL_DEBUG    
    _debug += "]";
    console.info(_debug);
#endif

    return webcl.SUCCESS;
  },
  
  clGetPlatformIDs: function(num_entries,platforms,num_platforms) {

#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetPlatformIDs",[num_entries,platforms,num_platforms]);
#endif

    // Init webcl variable if necessary
    if (CL.init() == 0) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"webcl is not found !!!!","");
#endif
      return webcl.INVALID_VALUE;
    }

    if ( num_entries == 0 && platforms != 0) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"num_entries is equal to zero and platforms is not NULL","");
#endif
      return webcl.INVALID_VALUE;
    }

    if ( num_platforms == 0 && platforms == 0) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"both num_platforms and platforms are NULL","");
#endif
      return webcl.INVALID_VALUE;
    }

    var _platforms = null;

    try { 

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(webcl+".getPlatforms",[]);
#endif
      _platforms = webcl.getPlatforms();

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,platforms,num_platforms],"",e.message);
#endif
      return _error;
    }

    if (num_platforms != 0) {
      {{{ makeSetValue('num_platforms', '0', '_platforms.length', 'i32') }}} /* Num of platforms */;
    } 

    if (platforms != 0) {
      for (var i = 0; i < Math.min(num_entries,_platforms.length); i++) {
        var _id = CL.udid(_platforms[i]);
        {{{ makeSetValue('platforms', 'i*4', '_id', 'i32') }}};
      }
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,platforms,num_platforms],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetPlatformInfo: function(platform,param_name,param_value_size,param_value,param_value_size_ret) {
    
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetPlatformInfo",[platform,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

#if CL_CHECK_VALID_OBJECT
    if (!(platform in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_PLATFORM],"platform are not in the map","");
#endif
      return webcl.INVALID_PLATFORM;
    }
#endif    
  
    var _info = null;
  
    try { 

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+CL.cl_objects[platform]+".getInfo",[param_name]);
#endif        

      _info = CL.cl_objects[platform].getInfo(param_name);
      
    } catch (e) {
      
      var _error = CL.catchError(e);
      var _info = "undefined";

      if (param_value != 0) {
        writeStringToMemory(_info, param_value);
      }
  
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '_info.length', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }
    
    if (param_value != 0) {
      writeStringToMemory(_info, param_value);
    }
  
    if (param_value_size_ret != 0) {
      {{{ makeSetValue('param_value_size_ret', '0', '_info.length', 'i32') }}};
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;

  },

  clGetDeviceIDs: function(platform,device_type_i64_1,device_type_i64_2,num_entries,devices,num_devices) {
    // Assume the device_type is i32 
    assert(device_type_i64_2 == 0, 'Invalid device_type i64');

#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetDeviceIDs",[platform,device_type_i64_1,num_entries,devices,num_devices]);
#endif
    
    // Init webcl variable if necessary
    if (CL.init() == 0) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"webcl is not found !!!!","");
#endif
      return webcl.INVALID_VALUE;
    }

    if ( num_entries == 0 && devices != 0) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"num_entries is equal to zero and device is not NULL","");
#endif
      return webcl.INVALID_VALUE;
    }

    if ( num_devices == 0 && devices == 0) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"both num_devices and device are NULL","");
#endif
      return webcl.INVALID_VALUE;
    }

    if ( platform != 0 && !(platform in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_PLATFORM],"platform is not a valid platform","");
#endif
      return webcl.INVALID_PLATFORM;  
    }

    var _device = null;

    try {

      // If platform is NULL use the first platform found ...
      if (platform == 0) {
#if CL_GRAB_TRACE
        CL.webclCallStackTrace(webcl+".getPlatforms",[]);
#endif          
        var _platforms = webcl.getPlatforms();
        if (_platforms.length == 0) {
#if CL_GRAB_TRACE
          CL.webclEndStackTrace([webcl.INVALID_PLATFORM],"platform not found","");
#endif
          return webcl.INVALID_PLATFORM;  
        }

        // Create a new UDID 
        platform = CL.udid(_platforms[0]);
      } 

      var _platform = CL.cl_objects[platform];

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(_platform+".getDevices",[device_type_i64_1]);
#endif       
        
      _devices = _platform.getDevices(device_type_i64_1);

    } catch (e) {

      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,devices,num_devices],"",e.message);
#endif
      return _error;
    }

    if (num_devices != 0) {
      {{{ makeSetValue('num_devices', '0', '_devices.length', 'i32') }}} /* Num of device */;
    } 

    if (devices != 0) {
      for (var i = 0; i < Math.min(num_entries,_devices.length); i++) {
        var _id = CL.udid(_devices[i]);
        {{{ makeSetValue('devices', 'i*4', '_id', 'i32') }}};
      }
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,devices,num_devices],"","");
#endif
    return webcl.SUCCESS;

  },

  clGetDeviceInfo: function(device,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetDeviceInfo",[device,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

#if CL_CHECK_VALID_OBJECT
      if (!(device in CL.cl_objects)) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_DEVICE],"device are not in the map","");
#endif
        return webcl.INVALID_DEVICE;
      }
#endif
  
    var  _info = null;

    try { 

        var _object = CL.cl_objects[device];

#if CL_GRAB_TRACE
        CL.webclCallStackTrace(""+_object+".getInfo",[param_name]);
#endif        

        _info = _object.getInfo(param_name);

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }
        
    if(typeof(_info) == "number") {

      if (param_value_size == 8) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i64') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '8', 'i32') }}};
      } else {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};
      } 
      
    } else if(typeof(_info) == "boolean") {

      if (param_value != 0) (_info == true) ? {{{ makeSetValue('param_value', '0', '1', 'i32') }}} : {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

    } else if(typeof(_info) == "string") {

      if (param_value != 0) writeStringToMemory(_info, param_value);
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '_info.length', 'i32') }}};

    } else if(typeof(_info) == "object") {
      
      if (_info instanceof Int32Array) {
       
        for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
          if (param_value != 0) {{{ makeSetValue('param_value', 'i*4', '_info[i]', 'i32') }}};
        }
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '_info.length * 4', 'i32') }}};
      
      } else if (_info instanceof WebCLPlatform) {
     
        var _id = CL.udid(_info);
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};
      
      } else if (_info == null) {

        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

      } else {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
        return webcl.INVALID_VALUE;
      }
    } else {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
      return webcl.INVALID_VALUE;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateContext: function(properties,num_devices,devices,pfn_notify,user_data,cl_errcode_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateContext",[properties,num_devices,devices,pfn_notify,user_data,cl_errcode_ret]);
#endif

    // Init webcl variable if necessary
    if (CL.init() == 0) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"webcl is not found !!!!","");
#endif
      return webcl.INVALID_VALUE;
    }
    
    var _id = null;
    var _context = null;

    try { 

      var _platform = null;
      var _devices = [];
      var _deviceType = null;
      var _glclSharedContext = false;

      // Verify the device, theorically on OpenCL there are CL_INVALID_VALUE when devices or num_devices is null,
      // WebCL can work using default device / platform, we check only if parameter are set.
      for (var i = 0; i < num_devices; i++) {
        var _idxDevice = {{{ makeGetValue('devices', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT        
        if (_idxDevice in CL.cl_objects) {
#endif          
          _devices.push(CL.cl_objects[_idxDevice]);
#if CL_CHECK_VALID_OBJECT        
        } else {
          if (cl_errcode_ret != 0) {
            {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_DEVICE', 'i32') }}};
          }

#if CL_GRAB_TRACE
          CL.webclEndStackTrace([0,cl_errcode_ret],"devices contains an invalid device","");
#endif
          return 0;  
        }
#endif        
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
#if CL_CHECK_VALID_OBJECT              
              if (_idxPlatform in CL.cl_objects) {
#endif                
                _platform = CL.cl_objects[_idxPlatform];
#if CL_CHECK_VALID_OBJECT
              } else {
                if (cl_errcode_ret != 0) {
                  {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_PLATFORM', 'i32') }}};
                }

#if CL_GRAB_TRACE
                CL.webclEndStackTrace([0,cl_errcode_ret],"platform value specified in properties is not a valid platform","");
#endif
                return 0;  
              }
#endif              
              break;

            // /!\ This part, it's for the CL_GL_Interop
            case (0x200A) /*CL_GLX_DISPLAY_KHR*/:
            case (0x2008) /*CL_GL_CONTEXT_KHR*/:
            case (0x200C) /*CL_CGL_SHAREGROUP_KHR*/:            
              _propertiesCounter ++;
              _glclSharedContext = true;
              
              break;

            default:
              if (cl_errcode_ret != 0) {
                {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_PROPERTY', 'i32') }}};
              }

#if CL_GRAB_TRACE
              CL.webclEndStackTrace([0,cl_errcode_ret],"context property name '"+_readprop+"' in properties is not a supported property name","");
#endif
              return 0; 
          };

          _propertiesCounter ++;
        }
      }

      var _prop = {platform: _platform, devices: _devices, deviceType: _deviceType};
      
#if CL_GRAB_TRACE
      var _str = "{platform: "+_platform+", devices: "+_devices+", deviceType: "+_deviceType+"}";
      CL.webclCallStackTrace(webcl+".createContext",[_str]);
#endif      
      if (_glclSharedContext)
        _context = webcl.createContext(Module.ctx, _prop);
      else
        _context = webcl.createContext(_prop);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_context);

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateContextFromType: function(properties,device_type_i64_1,device_type_i64_2,pfn_notify,user_data,cl_errcode_ret) {
    // Assume the device_type is i32 
    assert(device_type_i64_2 == 0, 'Invalid device_type i64');
    
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateContextFromType",[properties,device_type_i64_1,pfn_notify,user_data,cl_errcode_ret]);
#endif

    // Init webcl variable if necessary
    if (CL.init() == 0) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"webcl is not found !!!!","");
#endif
      return webcl.INVALID_VALUE;
    }

    var _id = null;
    var _context = null;

    try { 

      var _platform = null;
      var _devices = null;
      var _deviceType = device_type_i64_1;
      var _glclSharedContext = false;

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
#if CL_CHECK_VALID_OBJECT              
              if (_idxPlatform in CL.cl_objects) {
#endif                
                _platform = CL.cl_objects[_idxPlatform];
#if CL_CHECK_VALID_OBJECT      
              } else {
                if (cl_errcode_ret != 0) {
                  {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_PLATFORM', 'i32') }}};
                }

#if CL_GRAB_TRACE
                CL.webclEndStackTrace([0,cl_errcode_ret],"platform value specified in properties is not a valid platform","");
#endif
                return 0;  
              }
#endif              
              break;

            // /!\ This part, it's for the CL_GL_Interop
            case (0x200A) /*CL_GLX_DISPLAY_KHR*/:
            case (0x2008) /*CL_GL_CONTEXT_KHR*/:
            case (0x200C) /*CL_CGL_SHAREGROUP_KHR*/:            
              _propertiesCounter ++;
              _glclSharedContext = true;
              break;

            default:
              if (cl_errcode_ret != 0) {
                {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_PROPERTY', 'i32') }}};
              }

#if CL_GRAB_TRACE
              CL.webclEndStackTrace([0,cl_errcode_ret],"context property name '"+_readprop+"' in properties is not a supported property name","");
#endif
              return 0; 
          };

          _propertiesCounter ++;
        }
      }

      var _prop = {platform: _platform, devices: _devices, deviceType: _deviceType};
      
#if CL_GRAB_TRACE
      var _str = "{platform: "+_platform+", devices: "+_devices+", deviceType: "+_deviceType+"}";
      CL.webclCallStackTrace(webcl+".createContext",[_str]);
#endif      
      if (_glclSharedContext)
        _context = webcl.createContext(Module.ctx, _prop);
      else
        _context = webcl.createContext(_prop);
     
    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_context);

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clRetainContext: function(context) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clRetainContext",[context]);
#endif

#if CL_CHECK_VALID_OBJECT
    if (!(context in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_CONTEXT],CL.cl_objects[context]+" is not a valid OpenCL context","");
#endif
      return webcl.INVALID_CONTEXT;
    }
#endif 

    CL.cl_objects_retains[context] = CL.cl_objects[context];
       
#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clReleaseContext: function(context) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clReleaseContext",[context]);
#endif

#if CL_CHECK_VALID_OBJECT
    if (!(context in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_CONTEXT],CL.cl_objects[context]+" is not a valid OpenCL context","");
#endif
      return webcl.INVALID_CONTEXT;
    }
#endif  

    // If is an object retain don't release it ...
    if (context in CL.cl_objects_retains) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif      
      return webcl.SUCCESS;
    }

    try {

#if CL_GRAB_TRACE
        CL.webclCallStackTrace(CL.cl_objects[context]+".release",[]);
#endif        
        CL.cl_objects[context].release();
        delete CL.cl_objects[context];
#if CL_PROFILE             
        CL.cl_objects_counter--;
        //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + context);
#endif         

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetContextInfo: function(context,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetContextInfo",[context,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

#if CL_CHECK_VALID_OBJECT
    if (!(context in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_CONTEXT],CL.cl_objects[context]+" is not a valid OpenCL context","");
#endif
      return webcl.INVALID_CONTEXT;
    }
#endif 

    var _info = null;

    try { 

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+CL.cl_objects[context]+".getInfo",[param_name]);
#endif        

      _info = CL.cl_objects[context].getInfo(param_name);

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

    if(typeof(_info) == "number") {

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

    } else if(typeof(_info) == "boolean") {

      if (param_value != 0) (_info == true) ? {{{ makeSetValue('param_value', '0', '1', 'i32') }}} : {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

    } else if(typeof(_info) == "object") {

      if ( (_info instanceof WebCLPlatform) || ((typeof(WebCLContextProperties) !== "undefined") && (_info instanceof WebCLContextProperties)) ) {
     
        var _id = CL.udid(_info);
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

      } else if (_info instanceof Array) {

        for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
          var _id = CL.udid(_info[i]);
          if (param_value != 0) {{{ makeSetValue('param_value', 'i*4', '_id', 'i32') }}};
        }
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '_info.length*4', 'i32') }}};

      } else if (_info == null) {

        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

      } else {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
        return webcl.INVALID_VALUE;
      }
    } else {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
      return webcl.INVALID_VALUE;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateCommandQueue: function(context,device,properties_1,properties_2,cl_errcode_ret) {
    // Assume the properties is i32 
    assert(properties_2 == 0, 'Invalid properties i64');

#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateCommandQueue",[context,device,properties_1,cl_errcode_ret]);
#endif

    var _id = null;
    var _command = null;

    // Context must be created
#if CL_CHECK_VALID_OBJECT    
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
#endif
      return 0; 
    }
#endif    

    // Context must be created
#if CL_CHECK_VALID_OBJECT    
    if (!(device in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_DEVICE', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"device '"+device+"' is not a valid device","");
#endif
      return 0; 
    }
#endif    

    try { 

#if CL_GRAB_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createCommandQueue",[CL.cl_objects[device],properties_1]);
#endif      

      _command = CL.cl_objects[context].createCommandQueue(CL.cl_objects[device],properties_1);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_command);

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clRetainCommandQueue: function(command_queue) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clRetainCommandQueue",[command_queue]);
#endif

#if CL_CHECK_VALID_OBJECT
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],CL.cl_objects[context]+" is not a valid OpenCL command_queue","");
#endif
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 

    CL.cl_objects_retains[command_queue] = CL.cl_objects[command_queue];
#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clReleaseCommandQueue: function(command_queue) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clReleaseCommandQueue",[command_queue]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],CL.cl_objects[command_queue]+" is not a valid OpenCL command_queue","");
#endif
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif

    // If is an object retain don't release it ...
    if (command_queue in CL.cl_objects_retains) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
      return webcl.SUCCESS;
    }

    try {

#if CL_GRAB_TRACE
        CL.webclCallStackTrace(CL.cl_objects[command_queue]+".release",[]);
#endif        
        CL.cl_objects[command_queue].release();
        delete CL.cl_objects[command_queue];
#if CL_PROFILE             
        CL.cl_objects_counter--;
        //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + command_queue);
#endif    

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetCommandQueueInfo: function(command_queue,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetCommandQueueInfo",[command_queue,param_name,param_value_size,param_value,param_value_size_ret]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],CL.cl_objects[command_queue]+" is not a valid OpenCL command_queue","");
#endif
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif

    var _info = null;

    try { 

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".getInfo",[param_name]);
#endif        

      _info = CL.cl_objects[command_queue].getInfo(param_name);

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

    if(typeof(_info) == "number") {

      if (param_value_size == 8) {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i64') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '8', 'i32') }}};            
      } else {
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};            
      } 

    } else if(typeof(_info) == "object") {

      if ( (_info instanceof WebCLDevice) || (_info instanceof WebCLContext)) {
     
        var _id = CL.udid(_info);
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

      } else if (_info == null) {

        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

      } else {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
        return webcl.INVALID_VALUE;
      }
    } else {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
      return webcl.INVALID_VALUE;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateBuffer__deps: ['clEnqueueWriteBuffer'],
  clCreateBuffer: function(context,flags_i64_1,flags_i64_2,size,host_ptr,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateBuffer",[context,flags_i64_1,size,host_ptr,cl_errcode_ret]);
#endif
#if CL_CHECK_SET_POINTER    
    if (CL.cl_pn_type.length == 0 && host_ptr != 0) console.info("/!\\ clCreateBuffer : you don't call clSetTypePointer for host_ptr parameter");
#endif

    var _id = null;
    var _buffer = null;

    // Context must be created
#if CL_CHECK_VALID_OBJECT    
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
#endif
      return 0; 
    }
#endif
    
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

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
#endif

      return 0; 
    }

    var _host_ptr = null;

    if (flags_i64_1 & (1 << 4) /* CL_MEM_ALLOC_HOST_PTR */) {
      _host_ptr = new ArrayBuffer(size);
    } else if ( (host_ptr != 0 && (flags_i64_1 & (1 << 5) /* CL_MEM_COPY_HOST_PTR */)) || (host_ptr != 0 && (flags_i64_1 & (1 << 3) /* CL_MEM_USE_HOST_PTR */)) ) {      
      _host_ptr = CL.getCopyPointerToArray(host_ptr,size,CL.cl_pn_type);      
    } else if (flags_i64_1 & ~_flags) {
      console.error("clCreateBuffer : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
    }

    try {

#if CL_GRAB_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createBuffer",[_flags,size,_host_ptr]);
#endif      
    
      if (_host_ptr != null) {
        _buffer = CL.cl_objects[context].createBuffer(_flags,size,_host_ptr);
      } else
        _buffer = CL.cl_objects[context].createBuffer(_flags,size);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }
      
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_buffer);

    // \todo need to be remove when firefox will be support hot_ptr
    /**** **** **** **** **** **** **** ****/
    if (_host_ptr != null) {
      if (navigator.userAgent.toLowerCase().indexOf('firefox') != -1) {
        // Search command
        var commandqueue = null;
        for (var obj in CL.cl_objects) {
          if (CL.cl_objects[obj] instanceof WebCLCommandQueue) {
            commandqueue = CL.cl_objects[obj];
            break;
          }
        }
        
        if (commandqueue != null) {
          _clEnqueueWriteBuffer(obj,_id,true,0,size,host_ptr,0,0,0);
        } else {
          if (cl_errcode_ret != 0) {
            {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};
          }

#if CL_CHECK_SET_POINTER    
          CL.cl_pn_type = [];
#endif
#if CL_GRAB_TRACE
          CL.webclEndStackTrace([0,cl_errcode_ret],"Firefox doesn't support host_ptr (Not found command queue)","");
#endif
          return 0; 
        }
      }
    }
    /**** **** **** **** **** **** **** ****/

#if CL_CHECK_SET_POINTER    
    CL.cl_pn_type = [];
#endif    
#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateSubBuffer: function(buffer,flags_i64_1,flags_i64_2,buffer_create_type,buffer_create_info,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateSubBuffer",[buffer,flags_i64_1,buffer_create_type,buffer_create_info,cl_errcode_ret]);
#endif

    var _id = null;
    var _subbuffer = null;

    // Context must be created
#if CL_CHECK_VALID_OBJECT    
    if (!(buffer in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_MEM_OBJECT', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"Mem object '"+buffer+"' is not a valid buffer","");
#endif
      return 0; 
    }
#endif
    
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

#if CL_GRAB_TRACE
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

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"buffer_create_info is NULL","");
#endif

      return 0; 
    }

    try {

#if CL_GRAB_TRACE
      CL.webclCallStackTrace( CL.cl_objects[buffer]+".createSubBuffer",[_flags,_origin,_sizeInBytes]);
#endif      

      _subbuffer = CL.cl_objects[buffer].createSubBuffer(_flags,_origin,_sizeInBytes);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_subbuffer);

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateImage2D: function(context,flags_i64_1,flags_i64_2,image_format,image_width,image_height,image_row_pitch,host_ptr,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateImage2D",[context,flags_i64_1,image_format,image_width,image_height,image_row_pitch,host_ptr,cl_errcode_ret]);
#endif

    var _id = null;
    var _image = null;

    // Context must be created
#if CL_CHECK_VALID_OBJECT    
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
#endif
      return 0; 
    }
#endif    
    
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

#if CL_GRAB_TRACE
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

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"image_format is NULL","");
#endif

      return 0; 
    }

    var _type = webcl.FLOAT;
    var _sizeType = 4;
    var _sizeOrder = 1;    

    switch (_channel_type) {
      case webcl.SNORM_INT8:
      case webcl.SIGNED_INT8:
        _sizeType = 1;
        _type = webcl.SIGNED_INT8;
        break;
      case webcl.UNORM_INT8:        
      case webcl.UNSIGNED_INT8:
        _sizeType = 1;
        _type = webcl.UNSIGNED_INT8;
        break;
      case webcl.SNORM_INT16:
      case webcl.SIGNED_INT16:
        _sizeType = 2;
        _type = webcl.SIGNED_INT16;
        break;
      case webcl.UNORM_INT16:        
      case webcl.UNSIGNED_INT16:
      case webcl.HALF_FLOAT:
        _sizeType = 2;      
        _type = webcl.UNSIGNED_INT16;
        break;
      case webcl.SIGNED_INT32:
        _sizeType = 4;
        _type = SIGNED_INT32;
      case webcl.UNSIGNED_INT32:
        _sizeType = 4;
        _type = UNSIGNED_INT32;
        break;        
      case webcl.FLOAT:
        _sizeType = 4;
        _type = webcl.FLOAT;
        break;
      default:
        console.error("clCreateImage2D : This channel type is not yet implemented => "+_channel_type);
    }

    switch (_channel_order) {
      case webcl.R:
      case webcl.A:
      case webcl.INTENSITY:
      case webcl.LUMINANCE:
        _sizeOrder = 1;
        break;
      case webcl.RG:
      case webcl.RA:
        _sizeOrder = 2;
        break;
      case webcl.RGB:
        _sizeOrder = 3;
        break; 
      case webcl.RGBA:
      case webcl.BGRA:
      case webcl.ARGB:      
        _sizeOrder = 4;
        break;        
      default:
        console.error("clCreateImage2D : This channel order is not yet implemented => "+_channel_order);
    }

    var _size = image_width * image_height * _sizeOrder;

    console.info("/!\\ clCreateImage2D : Compute the size of ptr with image Info '"+_size+"'... need to be more tested");

//     if (host_ptr != 0 ) {
//       if (cl_errcode_ret != 0) {
//         {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_HOST_PTR', 'i32') }}};
//       }
// #if CL_GRAB_TRACE
//       CL.webclEndStackTrace([0,cl_errcode_ret],"Can't have the size of the host_ptr","");
// #endif
//       return 0;
//     }
      
    if (flags_i64_1 & (1 << 4) /* CL_MEM_ALLOC_HOST_PTR */) {
      _host_ptr = new ArrayBuffer(_size);
    } else if ( (host_ptr != 0 && (flags_i64_1 & (1 << 5) /* CL_MEM_COPY_HOST_PTR */)) || (host_ptr != 0 && (flags_i64_1 & (1 << 3) /* CL_MEM_USE_HOST_PTR */)) ) {      
      _host_ptr = CL.getCopyPointerToArray(host_ptr,_size,_type);
    } else if (flags_i64_1 & ~_flags) {
      console.error("clCreateImage2D : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
    }

    var _descriptor = {channelOrder:_channel_order, channelType:_channel_type, width:image_width, height:image_height, rowPitch:image_row_pitch }

    try {

#if CL_GRAB_TRACE
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

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_image);

#if CL_GRAB_TRACE
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
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clRetainMemObject",[memobj]);
#endif

#if CL_CHECK_VALID_OBJECT
    if (!(memobj in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],CL.cl_objects[memobj]+" is not a valid OpenCL memobj","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 

    CL.cl_objects_retains[memobj] = CL.cl_objects[memobj];

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif        

    return webcl.SUCCESS;
  },

  clReleaseMemObject: function(memobj) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clReleaseMemObject",[memobj]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(memobj in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],CL.cl_objects[memobj]+" is not a valid OpenCL memobj","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif

    // If is an object retain don't release it ...
    if (memobj in CL.cl_objects_retains) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif      
      return webcl.SUCCESS;
    }

    try {

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(CL.cl_objects[memobj]+".release",[]);
#endif        
      CL.cl_objects[memobj].release();
      delete CL.cl_objects[memobj];
#if CL_PROFILE             
      CL.cl_objects_counter--;
      //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + memobj);
#endif    

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetSupportedImageFormats: function(context,flags_i64_1,flags_i64_2,image_type,num_entries,image_formats,num_image_formats) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');

#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetSupportedImageFormats",[context,flags_i64_1,image_type,num_entries,image_formats,num_image_formats]);
#endif

    // Context must be created
#if CL_CHECK_VALID_OBJECT    
    if (!(context in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_CONTEXT],"context '"+context+"' is not a valid context","");
#endif
      return webcl.INVALID_CONTEXT; 
    }
#endif
    if (image_type != webcl.MEM_OBJECT_IMAGE2D) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.CL_INVALID_VALUE],"image_type "+image_type+" are not valid","");
#endif
      return webcl.CL_INVALID_VALUE;       
    }
    
    var _flags;

    if (flags_i64_1 & webcl.MEM_READ_WRITE) {
      _flags = webcl.MEM_READ_WRITE;
    } else if (flags_i64_1 & webcl.MEM_WRITE_ONLY) {
      _flags = webcl.MEM_WRITE_ONLY;
    } else if (flags_i64_1 & webcl.MEM_READ_ONLY) {
      _flags = webcl.MEM_READ_ONLY;
    } else {

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],"values specified "+flags_i64_1+" in flags are not valid","");
#endif

      return webcl.INVALID_VALUE; 
    }

    if (flags_i64_1 & ~_flags) {
      console.error("clGetSupportedImageFormats : This flag is not yet implemented => "+(flags_i64_1 & ~_flags));
    }

    var _descriptor_list = null;

    try {

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(CL.cl_objects[context]+".getSupportedImageFormats",[_flags]);
#endif        

      _descriptor_list = CL.cl_objects[context].getSupportedImageFormats(_flags);

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

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

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetMemObjectInfo: function(memobj,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetMemObjectInfo",[memobj,param_name,param_value_size,param_value,param_value_size_ret]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(memobj in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],CL.cl_objects[memobj]+" is not a valid OpenCL memobj","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif

    var _info = null;

    try { 

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+CL.cl_objects[memobj]+".getInfo",[param_name]);
#endif        

      _info = CL.cl_objects[memobj].getInfo(param_name);

    } catch (e) {

      var _error = CL.catchError(e);

      if (param_value != 0) {
        {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

    if(typeof(_info) == "number") {

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

    } else if(typeof(_info) == "object") {

      if (_info instanceof WebCLBuffer) {
     
        var _id = CL.udid(_info);
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

      } else if (_info == null) {

        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

      } else {
        console.error("clGetMemObjectInfo : "+typeof(_info)+" not yet implemented");
      }
    } else {
      console.error("clGetMemObjectInfo : "+typeof(_info)+" not yet implemented");
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetImageInfo: function(image,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetImageInfo",[image,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

#if CL_CHECK_VALID_OBJECT    
    if (!(image in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"image '"+image+"' is not a valid image","");
#endif
      return webcl.INVALID_MEM_OBJECT; 
    }
#endif

    var _info = null;

    try { 

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+CL.cl_objects[image]+".getInfo",[param_name]);
#endif        

      _info = CL.cl_objects[image].getInfo(param_name);

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

    var _sizeType = CL.getImageSizeType(image);
    
    switch (param_name) {
      case (webcl.IMAGE_FORMAT) :
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info.channelOrder', 'i32') }}};
        if (param_value != 0) {{{ makeSetValue('param_value', '4', '_info.channelType', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '8', 'i32') }}};
        break;
      case (webcl.IMAGE_ELEMENT_SIZE) :
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_sizeType', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};
        break;
      case (webcl.IMAGE_ROW_PITCH) :
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info.rowPitch', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};
        break;
      case (webcl.IMAGE_WIDTH) :
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info.width', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};
        break;
      case (webcl.IMAGE_HEIGHT) :
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info.height', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};
        break;
      default:
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_VALUE],param_name+" not yet implemente","");
#endif
        return webcl.INVALID_VALUE;
    } 

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif

    return webcl.SUCCESS;
  },

  clSetMemObjectDestructorCallback: function(memobj,pfn_notify,user_data) {
    console.error("clSetMemObjectDestructorCallback: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    return webcl.INVALID_VALUE;
  },

  clCreateSampler: function(context,normalized_coords,addressing_mode,filter_mode,cl_errcode_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateSampler",[context,normalized_coords,addressing_mode,filter_mode,cl_errcode_ret]);
#endif

    var _id = null;
    var _sampler = null;

    // Context must be created
#if CL_CHECK_VALID_OBJECT    
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
#endif
      return 0; 
    }
#endif
    try {
    
#if CL_GRAB_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createSampler",[normalized_coords,addressing_mode,filter_mode]);
#endif      

      _sampler = CL.cl_objects[context].createSampler(normalized_coords,addressing_mode,filter_mode);
      
    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_sampler);

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clRetainSampler: function(sampler) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clRetainSampler",[sampler]);
#endif

#if CL_CHECK_VALID_OBJECT
    if (!(sampler in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_SAMPLER],CL.cl_objects[sampler]+" is not a valid OpenCL sampler","");
#endif
      return webcl.INVALID_SAMPLER;
    }
#endif 

    CL.cl_objects_retains[sampler] = CL.cl_objects[sampler];

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif        
    return webcl.SUCCESS;
  },

  clReleaseSampler: function(sampler) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clReleaseSampler",[sampler]);
#endif

#if CL_CHECK_VALID_OBJECT
    if (!(sampler in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_SAMPLER],CL.cl_objects[sampler]+" is not a valid OpenCL sampler","");
#endif
      return webcl.INVALID_SAMPLER;
    }
#endif

    // If is an object retain don't release it ...
    if (sampler in CL.cl_objects_retains) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif      
      return webcl.SUCCESS;
    }

    try {

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(CL.cl_objects[sampler]+".release",[]);
#endif        
      CL.cl_objects[sampler].release();
      delete CL.cl_objects[sampler];
#if CL_PROFILE             
      CL.cl_objects_counter--;
      //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + sampler);
#endif   

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clGetSamplerInfo: function(sampler,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetSamplerInfo",[sampler,param_name,param_value_size,param_value,param_value_size_ret]);
#endif

#if CL_CHECK_VALID_OBJECT
    if (!(sampler in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_SAMPLER],CL.cl_objects[sampler]+" is not a valid OpenCL sampler","");
#endif
      return webcl.INVALID_SAMPLER;
    }
#endif
  
    var _info = null;

    try { 

#if CL_GRAB_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[sampler]+".getInfo",[param_name]);
#endif        

        _info = CL.cl_objects[sampler].getInfo(param_name);
            
    } catch (e) {

      var _error = CL.catchError(e);

      if (param_value != 0) {
        {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }

      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }
        
    if(typeof(_info) == "number") {

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

    } else if(typeof(_info) == "boolean") {

      if (param_value != 0) (_info == true) ? {{{ makeSetValue('param_value', '0', '1', 'i32') }}} : {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

    } else if(typeof(_info) == "object") {

      if (_info instanceof WebCLContext) {
 
        var _id = CL.udid(_info);
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

      } else if (_info == null) {

        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

      } else {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
        return webcl.INVALID_VALUE;
      }
    } else {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
      return webcl.INVALID_VALUE;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateProgramWithSource: function(context,count,strings,lengths,cl_errcode_ret) {
    
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateProgramWithSource",[context,count,strings,lengths,cl_errcode_ret]);
#endif

    var _id = null;
    var _program = null;

    // Context must be created
#if CL_CHECK_VALID_OBJECT    
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"context '"+context+"' is not a valid context","");
#endif
      return 0; 
    }
#endif   

    try {
      
      var _string = "";

      for (var i = 0; i < count; i++) {
        if (lengths) {
          var _len = {{{ makeGetValue('lengths', 'i*4', 'i32') }}};
          if (_len < 0) {
            _string += Pointer_stringify({{{ makeGetValue('strings', 'i*4', 'i32') }}});   
          } else {
            _string += Pointer_stringify({{{ makeGetValue('strings', 'i*4', 'i32') }}}, _len);   
          }
        } else {
          _string += Pointer_stringify({{{ makeGetValue('strings', 'i*4', 'i32') }}}); 
        }
      }

      CL.parseKernel(_string);

#if CL_GRAB_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createProgramWithSource",[_string]);
#endif      

      _program = CL.cl_objects[context].createProgram(_string);
  
    } catch (e) {
      var _error = CL.catchError(e);

      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_program);

#if CL_GRAB_TRACE
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
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clRetainProgram",[program]);
#endif

#if CL_CHECK_VALID_OBJECT
    if (!(program in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_PROGRAM],CL.cl_objects[program]+" is not a valid OpenCL program","");
#endif
      return webcl.INVALID_PROGRAM;
    }
#endif 

    CL.cl_objects_retains[program] = CL.cl_objects[program];
        
#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif   
    return webcl.SUCCESS;
  },

  clReleaseProgram: function(program) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clReleaseProgram",[program]);
#endif

#if CL_CHECK_VALID_OBJECT
    if (!(program in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_SAMPLER],CL.cl_objects[program]+" is not a valid OpenCL program","");
#endif
      return webcl.INVALID_PROGRAM;
    }
#endif

    // If is an object retain don't release it ...
    if (program in CL.cl_objects_retains) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif      
      return webcl.SUCCESS;
    }

    try {

#if CL_GRAB_TRACE
        CL.webclCallStackTrace(CL.cl_objects[program]+".release",[]);
#endif        
        CL.cl_objects[program].release();
        delete CL.cl_objects[program];
#if CL_PROFILE             
        CL.cl_objects_counter--;
        //console.info("Counter-- HashMap Object : " + CL.cl_objects_counter + " - Udid : " + program);
#endif   

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;

  },

  clBuildProgram: function(program,num_devices,device_list,options,pfn_notify,user_data) {

#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clBuildProgram",[program,num_devices,device_list,options,pfn_notify,user_data]);
#endif
#if CL_CHECK_VALID_OBJECT
    // Program must be created
    if (!(program in CL.cl_objects)) {

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program '"+program+"' is not a valid program","");
#endif

      return webcl.INVALID_PROGRAM; 
    }
#endif
    try {

      var _devices = [];
      var _option = (options == 0) ? "" : Pointer_stringify(options); 

      // \todo need to be remove when webkit work with -D
      // if (navigator.userAgent.toLowerCase().indexOf('firefox') == -1) {
      //   _option = _option.replace(/-D/g, "-D ");
      //   _option = _option.replace(/-D\s{2,}/g, "-D ");
      // }

      if (device_list != 0 && num_devices > 0 ) {
        for (var i = 0; i < num_devices ; i++) {
          var _device = {{{ makeGetValue('device_list', 'i*4', 'i32') }}}
#if CL_CHECK_VALID_OBJECT          
          if (_device in CL.cl_objects) {
#endif            
            _devices.push(CL.cl_objects[_device]);
#if CL_CHECK_VALID_OBJECT
          }
#endif          
        }
      }

      // If device_list is NULL value, the program executable is built for all devices associated with program.
      if (_devices.length == 0) {
#if CL_GRAB_TRACE
        CL.webclCallStackTrace(CL.cl_objects[program]+".getInfo",[webcl.PROGRAM_DEVICES]);
#endif          
        _devices = CL.cl_objects[program].getInfo(webcl.PROGRAM_DEVICES); 
      }

      var _callback = null
      if (pfn_notify != 0) {
        _callback = function() { FUNCTION_TABLE[pfn_notify](program, user_data) };
      }

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(CL.cl_objects[program]+".build",[_devices,_option,_callback]);
#endif        
      
      CL.cl_objects[program].build(_devices,_option,_callback);

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;      

  },

  clUnloadCompiler: function() {
    console.error("clUnloadCompiler: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");
    
    return webcl.INVALID_VALUE;;
  },

  clGetProgramInfo: function(program,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetProgramInfo",[program,param_name,param_value_size,param_value,param_value_size_ret]);
#endif
#if CL_CHECK_VALID_OBJECT
    // Program must be created
    if (!(program in CL.cl_objects)) {

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program '"+program+"' is not a valid program","");
#endif

      return webcl.INVALID_PROGRAM; 
    }
#endif

    var _info = null;

    try { 
#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+CL.cl_objects[program]+".getInfo",[param_name]);
#endif        

      _info = CL.cl_objects[program].getInfo(param_name);
    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }

      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

    if(typeof(_info) == "number") {

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

    } else if(typeof(_info) == "string") {
      if (param_value != 0) {
        writeStringToMemory(_info, param_value);
      }

      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '_info.length', 'i32') }}};
      }
    } else if(typeof(_info) == "object") {

      if (_info instanceof WebCLContext) {

        var _id = CL.udid(_info);
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

      } else if (_info instanceof Array) {

        for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
          var _id = CL.udid(_info[i]);
          if (param_value != 0) {{{ makeSetValue('param_value', 'i*4', '_id', 'i32') }}};
        }
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '_info.length * 4', 'i32') }}};

      } else if (_info == null) {

        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

      } else {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
        return webcl.INVALID_VALUE;
      }
    } else {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
      return webcl.INVALID_VALUE;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetProgramBuildInfo: function(program,device,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetProgramBuildInfo",[program,device,param_name,param_value_size,param_value,param_value_size_ret]);
#endif
#if CL_CHECK_VALID_OBJECT
    // Program must be created
    if (!(program in CL.cl_objects)) {

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program '"+program+"' is not a valid program","");
#endif

      return webcl.INVALID_PROGRAM; 
    }
    if (!(device in CL.cl_objects)) {

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"device '"+device+"' is not a valid device","");
#endif

      return webcl.INVALID_DEVICE; 
    }

#endif

    var _info = null;

    try { 

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+CL.cl_objects[program]+".getBuildInfo",[device,param_name]);
#endif        

      _info = CL.cl_objects[program].getBuildInfo(CL.cl_objects[device], param_name);

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {
        {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      }

      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

    if(typeof(_info) == "number") {

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

    } else if(typeof(_info) == "string") {
      if (param_value != 0) {
        writeStringToMemory(_info, param_value);
      }
    
      if (param_value_size_ret != 0) {
        {{{ makeSetValue('param_value_size_ret', '0', '_info.length', 'i32') }}};
      }
    } else {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_VALUE],typeof(_info)+" not yet implemented","");
#endif
      return webcl.INVALID_VALUE;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateKernel: function(program,kernel_name,cl_errcode_ret) {
    
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateKernel",[program,kernel_name,cl_errcode_ret]);
#endif

    var _id = null;
    var _kernel = null;
    var _name = (kernel_name == 0) ? "" : Pointer_stringify(kernel_name);

    // program must be created
#if CL_CHECK_VALID_OBJECT    
    if (!(program in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_PROGRAM', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"program '"+program+"' is not a valid program","");
#endif
      return 0; 
    }
#endif
    try {
    
#if CL_GRAB_TRACE
      CL.webclCallStackTrace( CL.cl_objects[program]+".createKernel",[_name]);
#endif      

      _kernel = CL.cl_objects[program].createKernel(_name);
      
      Object.defineProperty(_kernel, "name", { value : _name,writable : false });
      Object.defineProperty(_kernel, "sig", { value : CL.cl_kernels_sig[_name],writable : false });

#if CL_VALIDATOR
      Object.defineProperty(_kernel, "val_param", { value : CL.cl_validator[_name],writable : false });
      Object.defineProperty(_kernel, "val_param_argsize", { value : CL.cl_validator_argsize[_name],writable : false });
#endif

#if CL_DEBUG
      console.info("clCreateKernel : Kernel '"+_kernel.name+"', has "+_kernel.sig+" parameters !!!!");
#if CL_VALIDATOR
      console.info("\tValidator info");
      console.info("\t\t" + _kernel.val_param);
      console.info("\t\t" + _kernel.val_param_argsize);        
#endif
#endif      
      
    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {
        {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
      }

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {
      {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    }

    _id = CL.udid(_kernel);

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateKernelsInProgram: function(program,num_kernels,kernels,num_kernels_ret) {
    
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateKernelsInProgram",[program,num_kernels,kernels,num_kernels_ret]);
#endif

    // program must be created
#if CL_CHECK_VALID_OBJECT
    if (!(program in CL.cl_objects)) {

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_PROGRAM],"program '"+program+"' is not a valid program","");
#endif
      return webcl.INVALID_PROGRAM; 
    }
#endif
    try {
    
#if CL_GRAB_TRACE
      CL.webclCallStackTrace( CL.cl_objects[program]+".createKernelsInProgram",[]);
#endif      

      var _kernels = CL.cl_objects[program].createKernelsInProgram();

      for (var i = 0; i < Math.min(num_kernels,_kernels.length); i++) {
        var _id = CL.udid(_kernels[i]);
        if (kernels != 0) {{{ makeSetValue('kernels', 'i*4', '_id', 'i32') }}};
        
        var _name = _kernels[i].getInfo(webcl.KERNEL_FUNCTION_NAME);

        Object.defineProperty(_kernels[i], "name", { value : _name,writable : false });
        Object.defineProperty(_kernels[i], "sig", { value : CL.cl_kernels_sig[_name],writable : false });

#if CL_VALIDATOR
        Object.defineProperty(_kernels[i], "val_param", { value : CL.cl_validator[_name],writable : false });
        Object.defineProperty(_kernels[i], "val_param_argsize", { value : CL.cl_validator_argsize[_name],writable : false });
#endif

#if CL_DEBUG
        console.info("clCreateKernelsInProgram : Kernel '"+_kernels[i].name+"', has "+_kernels[i].sig+" parameters !!!!");
#if CL_VALIDATOR
        console.info("\tValidator info");
        console.info("\t\t" + _kernels[i].val_param);
        console.info("\t\t" + _kernels[i].val_param_argsize);        
#endif
#endif  

      }
           
      if (num_kernels_ret != 0) {{{ makeSetValue('num_kernels_ret', '0', '_kernels.length', 'i32') }}};

    } catch (e) {

      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif
      return _error; 
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clRetainKernel: function(kernel) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clRetainKernel",[kernel]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(kernel in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLKernel '"+kernel+"' are not inside the map","");
#endif
      return webcl.INVALID_KERNEL;
    }
#endif 

    CL.cl_objects_retains[kernel] = CL.cl_objects[kernel];

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif   
    return webcl.SUCCESS;
  },

  clReleaseKernel: function(kernel) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clReleaseKernel",[kernel]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(kernel in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLKernel '"+kernel+"' are not inside the map","");
#endif
      return webcl.INVALID_KERNEL;
    }
#endif

    // If is an object retain don't release it ...
    if (kernel in CL.cl_objects_retains) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif   
      return webcl.SUCCESS;
    }

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(CL.cl_objects[kernel]+".release",[]);
#endif    

    try {

      CL.cl_objects[kernel].release();
        
    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

    delete CL.cl_objects[kernel];

#if CL_PROFILE             
    CL.cl_objects_counter--;
#endif   

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },  

  clSetKernelArg: function(kernel,arg_index,arg_size,arg_value) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clSetKernelArg",[kernel,arg_index,arg_size,arg_value]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(kernel in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],CL.cl_objects[kernel]+" is not a valid OpenCL kernel","");
#endif
      return webcl.INVALID_KERNEL;
    }
#endif
    if (CL.cl_objects[kernel].sig.length < arg_index) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],CL.cl_objects[kernel]+" doesn't contains sig array","");
#endif
      return webcl.INVALID_KERNEL;          
    }

    var _kernel = CL.cl_objects[kernel];

#if CL_VALIDATOR
    var _posarg = _kernel.val_param[arg_index];
#else
    var _posarg = arg_index;
#endif

    var _sig = _kernel.sig[_posarg];
    
    try {

      // LOCAL ARG
      if (_sig == webcl.LOCAL) {

        var _array = new Uint32Array([arg_size]);

#if CL_GRAB_TRACE
        CL.webclCallStackTrace(_kernel+".setArg<<__local>>",[_posarg,_array]);
#endif     
        _kernel.setArg(_posarg,_array);

#if CL_VALIDATOR 
        var _sizearg = new Int32Array([arg_size]);

        if (_kernel.val_param_argsize.indexOf(_posarg+1) >= 0) {
#if CL_GRAB_TRACE
          CL.webclCallStackTrace(_kernel+".setArg<<VALIDATOR>>",[_posarg+1,_sizearg]);
#endif        
          _kernel.setArg(_posarg+1,_sizearg);
        }
#endif

      } else {

        var _value = {{{ makeGetValue('arg_value', '0', 'i32') }}};

        // WEBCL OBJECT ARG
        if (_value in CL.cl_objects) {

#if CL_GRAB_TRACE
          CL.webclCallStackTrace(_kernel+".setArg",[_posarg,CL.cl_objects[_value]]);
#endif        
          _kernel.setArg(_posarg,CL.cl_objects[_value]);

#if CL_VALIDATOR 

#if CL_GRAB_TRACE
          CL.webclCallStackTrace(CL.cl_objects[_value]+".getInfo",[webcl.MEM_SIZE]);
#endif     
          var _size = CL.cl_objects[_value].getInfo(webcl.MEM_SIZE);
          var _sizearg = new Int32Array([_size]);

          if (_kernel.val_param_argsize.indexOf(_posarg+1) >= 0) {
#if CL_GRAB_TRACE
            CL.webclCallStackTrace(_kernel+".setArg<<VALIDATOR>>",[_posarg+1,_sizearg]);
#endif        
            _kernel.setArg(_posarg+1,_sizearg);
          }
#endif    

        } else {

          var _array = CL.getReferencePointerToArray(arg_value,arg_size,[[_sig,1]]);
         
#if CL_GRAB_TRACE
          CL.webclCallStackTrace(_kernel+".setArg",[_posarg,_array]);
#endif        
          _kernel.setArg(_posarg,_array);

#if CL_VALIDATOR
          var _sizearg = new Int32Array([arg_size]);

          if (_kernel.val_param_argsize.indexOf(_posarg+1) >= 0) {
#if CL_GRAB_TRACE
            CL.webclCallStackTrace(_kernel+".setArg<<VALIDATOR>>",[_posarg+1,_sizearg]);
#endif        
            _kernel.setArg(_posarg+1,_sizearg);
          }
#endif
        }
      }
    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clGetKernelInfo: function(kernel,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetKernelInfo",[kernel,param_name,param_value_size,param_value,param_value_size_ret]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(kernel in CL.cl_objects)) {
      if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLKernel '"+kernel+"' are not inside the map","");
#endif
      return webcl.INVALID_KERNEL;
    }
#endif 
#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[kernel]+".getInfo",[param_name]);
#endif   

    try { 

      var _info = CL.cl_objects[kernel].getInfo(param_name);

      if(typeof(_info) == "number") {

        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

      } else if(typeof(_info) == "string") {

        if (param_value != 0) writeStringToMemory(_info, param_value);
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '_info.length', 'i32') }}};
    
      } else if(typeof(_info) == "object") {

        if ( (_info instanceof WebCLContext) || (_info instanceof WebCLProgram) ){
   
          var _id = CL.udid(_info);
          if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

        } else {

          console.error("clGetKernelInfo: unknow type of info '"+_info+"'")

          if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

        }
      } else {

        console.error("clGetKernelInfo: unknow type of info '"+_info+"'")

        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

      }
    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetKernelWorkGroupInfo: function(kernel,device,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetKernelWorkGroupInfo",[kernel,device,param_name,param_value_size,param_value,param_value_size_ret]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(kernel in CL.cl_objects)) {
      if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLKernel '"+kernel+"' are not inside the map","");
#endif
      return webcl.INVALID_KERNEL;
    }
#endif 
#if CL_CHECK_VALID_OBJECT
    if (!(device in CL.cl_objects)) {
      if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_DEVICE],"WebCLDevice '"+device+"' are not inside the map","");
#endif
      return webcl.INVALID_DEVICE;
    }
#endif 

    try {

      var _info = CL.cl_objects[kernel].getWorkGroupInfo(CL.cl_objects[device], param_name);

      if(typeof(_info) == "number") {

        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

      } else if (_info instanceof Int32Array) {
       
        for (var i = 0; i < Math.min(param_value_size>>2,_info.length); i++) {
          if (param_value != 0) {{{ makeSetValue('param_value', 'i*4', '_info[i]', 'i32') }}};
        }
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '_info.length * 4', 'i32') }}};
      
      } else {

        console.error("clGetKernelWorkGroupInfo: unknow type of info '"+_info+"'")
        
        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

      }

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
      
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clWaitForEvents: function(num_events,event_list) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clWaitForEvents",[num_events,event_list]);
#endif

    var _events = [];

    for (var i = 0; i < num_events; i++) {
      var _event = {{{ makeGetValue('event_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT  
      if (!(_event in CL.cl_objects)) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_EVENT],"WebCLEvent '"+_event+"' are not inside the map","");
#endif    
        return webcl.INVALID_EVENT; 
      }
#endif
      
      _events.push(CL.cl_objects[_event]) 
    }

    try {

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+webcl+".waitForEvents",[_events]);
#endif      
      webcl.waitForEvents(_events);

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif
      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clGetEventInfo: function(event,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetEventInfo",[event,param_name,param_value_size,param_value,param_value_size_ret]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(event in CL.cl_objects)) {
      if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_EVENT],"WebCLEvent '"+event+"' are not inside the map","");
#endif
      return webcl.INVALID_EVENT;
    }
#endif 

    try { 

      var _info = CL.cl_objects[event].getInfo(param_name);

      if(typeof(_info) == "number") {

        if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

      } else if(typeof(_info) == "object") {

        if ( (_info instanceof WebCLContext) || (_info instanceof WebCLCommandQueue) ){
   
          var _id = CL.udid(_info);
          if (param_value != 0) {{{ makeSetValue('param_value', '0', '_id', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

        } else {

          console.error("clGetEventInfo: unknow type of info '"+_info+"'")

          if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
          if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

        }
      } else {

        console.error("clGetEventInfo: unknow type of info '"+_info+"'")

        if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
        if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

      }
    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clCreateUserEvent: function(context,cl_errcode_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateUserEvent",[context,cl_errcode_ret]);
#endif
#if CL_CHECK_VALID_OBJECT      
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"WebCLContext '"+context+"' are not inside the map","");
#endif
      return 0; 
    }
#endif

    var _id = null;
    var _event = null;
    
#if CL_GRAB_TRACE
    CL.webclCallStackTrace( CL.cl_objects[context]+".createUserEvent",[]);
#endif 

    try {
     
      _event = CL.cl_objects[context].createUserEvent();
      
    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};

    _id = CL.udid(_event);

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;

  },

  clRetainEvent: function(event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clRetainEvent",[event]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(event in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_EVENT],"WebCLEvent '"+event+"' are not inside the map","");
#endif
      return webcl.INVALID_EVENT;
    }
#endif 

    CL.cl_objects_retains[event] = CL.cl_objects[event];
       
#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif           
    return webcl.SUCCESS;
  },

  clReleaseEvent: function(event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clReleaseEvent",[event]);
#endif
#if CL_CHECK_VALID_OBJECT
    if (!(event in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_EVENT],"WebCLEvent '"+event+"' are not inside the map","");
#endif
      return webcl.INVALID_EVENT;
    }
#endif

    // If is an object retain don't release it ...
    if (event in CL.cl_objects_retains) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif   
      return webcl.SUCCESS;
    }

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(CL.cl_objects[event]+".release",[]);
#endif    

    try {

      CL.cl_objects[event].release();
        
    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

    delete CL.cl_objects[event];

#if CL_PROFILE             
    CL.cl_objects_counter--;
#endif   

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clSetUserEventStatus: function(event,execution_status) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clSetUserEventStatus",[event,execution_status]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(event in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_EVENT],"WebCLEvent '"+event+"' are not inside the map","");
#endif 

      return webcl.INVALID_EVENT;
    }
#endif

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(CL.cl_objects[event]+".setUserEventStatus",[execution_status]);
#endif        

    try {

        CL.cl_objects[event].setUserEventStatus(execution_status);

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clSetEventCallback: function(event,command_exec_callback_type,pfn_notify,user_data) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clSetEventCallback",[event,command_exec_callback_type,pfn_notify,user_data]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(event in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_EVENT],"WebCLEvent '"+event+"' are not inside the map","");
#endif 

      return webcl.INVALID_EVENT;
    }
#endif

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(CL.cl_objects[event]+".setCallback",[command_exec_callback_type,pfn_notify,user_data]);
#endif        

    console.error("/!\\ todo clSetEventCallback not yet finish to implement");
    try {

      CL.cl_objects[event].setCallback(command_exec_callback_type);

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clGetEventProfilingInfo: function(event,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetEventProfilingInfo",[event,param_name,param_value_size,param_value,param_value_size_ret]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(event in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_EVENT],"WebCLEvent '"+event+"' are not inside the map","");
#endif 

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

      return webcl.INVALID_EVENT;
    }
#endif 

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[event]+".getProfilingInfo",[param_name]);
#endif        

    try { 

      var _info = CL.cl_objects[event].getProfilingInfo(param_name);

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clFlush: function(command_queue) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clFlush",[command_queue]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif 
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".flush",[]);
#endif        

    try {
        
      CL.cl_objects[command_queue].flush();

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif
      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;
  },

  clFinish: function(command_queue) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clFinish",[command_queue]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif 
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".finish",[]);
#endif        

    try {

      CL.cl_objects[command_queue].finish();

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif
      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;
  },

  clEnqueueReadBuffer: function(command_queue,buffer,blocking_read,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueReadBuffer",[command_queue,buffer,blocking_read,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_SET_POINTER    
    if (CL.cl_pn_type.length == 0) console.info("/!\\ clEnqueueReadBuffer : you don't call clSetTypePointer for ptr parameter");
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif 
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(buffer in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+buffer+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 
 
    var _event_wait_list = [];
    var _host_ptr = CL.getReferencePointerToArray(ptr,cb,CL.cl_pn_type);
  
    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT   
      if (!(_event_wait in CL.cl_objects)) {
#if CL_CHECK_SET_POINTER    
        CL.cl_pn_type = [];
#endif 
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif

      _event_wait_list.push(CL.cl_objects[_event_wait]);
    } 

    try {

      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueReadBuffer(CL.cl_objects[buffer],blocking_read,offset,cb,_host_ptr,_event_wait_list,_event);
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      }
      else {
        CL.cl_objects[command_queue].enqueueReadBuffer(CL.cl_objects[buffer],blocking_read,offset,cb,_host_ptr,_event_wait_list);
      }

#if CL_GRAB_TRACE
      // It's the only callStackTrace call after the call for have info about the read host ptr
      CL.webclCallStackTrace("(*)"+CL.cl_objects[command_queue]+".enqueueReadBuffer",[CL.cl_objects[buffer],blocking_read,offset,cb,_host_ptr,_event_wait_list,_event]);
#endif       

    } catch (e) {
      var _error = CL.catchError(e);
        
#if CL_CHECK_SET_POINTER    
      CL.cl_pn_type = [];
#endif 
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_CHECK_SET_POINTER    
    CL.cl_pn_type = [];
#endif        
#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;    
  },

  clEnqueueReadBufferRect: function(command_queue,buffer,blocking_read,buffer_origin,host_origin,region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueReadBufferRect",[command_queue,buffer,blocking_read,buffer_origin,host_origin,region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_SET_POINTER    
    if (CL.cl_pn_type.length == 0) console.info("/!\\ clEnqueueReadBufferRect : you don't call clSetTypePointer for ptr parameter");
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif 
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(buffer in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+buffer+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 

    var _event_wait_list = [];
    
    var _buffer_origin = [];
    var _host_origin = [];
    var _region = [];

    for (var i = 0; i < 3; i++) {
      _buffer_origin.push({{{ makeGetValue('buffer_origin', 'i*4', 'i32') }}});
      _host_origin.push({{{ makeGetValue('host_origin', 'i*4', 'i32') }}});
      _region.push({{{ makeGetValue('region', 'i*4', 'i32') }}});            
    }

    console.info("/!\\ clEnqueueReadBufferRect : Check the size of the ptr '"+_region.reduce(function (a, b) { return a * b; })+"'... need to be more tested");
    var _host_ptr = CL.getReferencePointerToArray(ptr,_region.reduce(function (a, b) { return a * b; }),CL.cl_pn_type);

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT   
      if (!(_event_wait in CL.cl_objects)) {
#if CL_CHECK_SET_POINTER    
        CL.cl_pn_type = [];
#endif 
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif

      _event_wait_list.push(CL.cl_objects[_event_wait]);
    } 

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueReadBufferRect",[CL.cl_objects[buffer],blocking_read,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list,_event]);
#endif     
   
    try {

      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueReadBufferRect(CL.cl_objects[buffer],blocking_read,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list,_event);
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      }
      else CL.cl_objects[command_queue].enqueueReadBufferRect(CL.cl_objects[buffer],blocking_read,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list);

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_CHECK_SET_POINTER    
      CL.cl_pn_type = [];
#endif   
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_CHECK_SET_POINTER    
    CL.cl_pn_type = [];
#endif   
#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS;    
  },

  clEnqueueWriteBuffer: function(command_queue,buffer,blocking_write,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueWriteBuffer",[command_queue,buffer,blocking_write,offset,cb,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_SET_POINTER    
    if (CL.cl_pn_type.length == 0) console.info("/!\\ clEnqueueWriteBuffer : you don't call clSetTypePointer for ptr parameter");
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif 
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(buffer in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+buffer+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 

    var _event_wait_list = [];
    var _host_ptr = CL.getReferencePointerToArray(ptr,cb,CL.cl_pn_type);

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT   
      if (!(_event_wait in CL.cl_objects)) {
#if CL_CHECK_SET_POINTER    
        CL.cl_pn_type = [];
#endif 
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif

      _event_wait_list.push(CL.cl_objects[_event_wait]);
    } 

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueWriteBuffer",[CL.cl_objects[buffer],blocking_write,offset,cb,_host_ptr,_event_wait_list,_event]);
#endif    

    try {
          
      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueWriteBuffer(CL.cl_objects[buffer],blocking_write,offset,cb,_host_ptr,_event_wait_list,_event);    
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      }
      else CL.cl_objects[command_queue].enqueueWriteBuffer(CL.cl_objects[buffer],blocking_write,offset,cb,_host_ptr,_event_wait_list);    

    } catch (e) {
      var _error = CL.catchError(e);
 
#if CL_CHECK_SET_POINTER    
      CL.cl_pn_type = [];
#endif 
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_CHECK_SET_POINTER    
    CL.cl_pn_type = [];
#endif 
#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;  
  },

  clEnqueueWriteBufferRect: function(command_queue,buffer,blocking_write,buffer_origin,host_origin,region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueWriteBufferRect",[command_queue,buffer,blocking_write,buffer_origin,host_origin,region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_SET_POINTER    
    if (CL.cl_pn_type.length == 0) console.info("/!\\ clEnqueueWriteBufferRect : you don't call clSetTypePointer for ptr parameter");
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif 
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(buffer in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+buffer+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 

    var _event_wait_list = [];
    
    var _host_ptr = CL.getReferencePointerToArray(ptr,cb,CL.cl_pn_type);

    var _buffer_origin = [];
    var _host_origin = [];
    var _region = [];

    for (var i = 0; i < 3; i++) {
      _buffer_origin.push({{{ makeGetValue('buffer_origin', 'i*4', 'i32') }}});
      _host_origin.push({{{ makeGetValue('host_origin', 'i*4', 'i32') }}});
      _region.push({{{ makeGetValue('region', 'i*4', 'i32') }}});            
    }

    console.info("/!\\ clEnqueueWriteBufferRect : Check the size of the ptr '"+_region.reduce(function (a, b) { return a * b; })+"'... need to be more tested");
    var _host_ptr = CL.getReferencePointerToArray(ptr,_region.reduce(function (a, b) { return a * b; }),CL.cl_pn_type);

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT   
      if (!(_event_wait in CL.cl_objects)) {
#if CL_CHECK_SET_POINTER    
        CL.cl_pn_type = [];
#endif 
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif

      _event_wait_list.push(CL.cl_objects[_event_wait]);
    } 

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueWriteBufferRect",[CL.cl_objects[buffer],blocking_write,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list,_event]);   
#endif    

    try {

      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueWriteBufferRect(CL.cl_objects[buffer],blocking_write,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list,_event);   
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};  
      }
      else CL.cl_objects[command_queue].enqueueWriteBufferRect(CL.cl_objects[buffer],blocking_write,_buffer_origin,_host_origin,_region,buffer_row_pitch,buffer_slice_pitch,host_row_pitch,host_slice_pitch,_host_ptr,_event_wait_list);  
       
    } catch (e) {
      var _error = CL.catchError(e);

#if CL_CHECK_SET_POINTER    
      CL.cl_pn_type = [];
#endif 
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_CHECK_SET_POINTER    
    CL.cl_pn_type = [];
#endif  
#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;  
  },

  clEnqueueCopyBuffer: function(command_queue,src_buffer,dst_buffer,src_offset,dst_offset,cb,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueCopyBuffer",[command_queue,src_buffer,dst_buffer,src_offset,dst_offset,cb,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif 
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(src_buffer in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+src_buffer+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(dst_buffer in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+dst_buffer+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 

    var _event_wait_list = [];

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT   
      if (!(_event_wait in CL.cl_objects)) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif

      _event_wait_list.push(CL.cl_objects[_event_wait]);
    } 

#if CL_GRAB_TRACE
      CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueCopyBuffer",[CL.cl_objects[src_buffer],CL.cl_objects[dst_buffer],src_offset,dst_offset,cb,_event_wait_list,_event]);
#endif  

    try {
  
      if (event != 0) {
        var _event = new WebCLEvent(); 
        CL.cl_objects[command_queue].enqueueCopyBuffer(CL.cl_objects[src_buffer],CL.cl_objects[dst_buffer],src_offset,dst_offset,cb,_event_wait_list,_event);    
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      }
      else CL.cl_objects[command_queue].enqueueCopyBuffer(CL.cl_objects[src_buffer],CL.cl_objects[dst_buffer],src_offset,dst_offset,cb,_event_wait_list);    

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS;  
  },

  clEnqueueReadImage: function(command_queue,image,blocking_read,origin,region,row_pitch,slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueReadImage",[command_queue,image,blocking_read,origin,region,row_pitch,slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif 
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(image in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+image+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 

    var _event_wait_list = [];

    var _origin = new Int32Array(2);
    var _region = new Int32Array(2);
    var _size = CL.getImageSizeType(image);
    var _channel = CL.getImageFormatType(image);

    for (var i = 0; i < 2; i++) {
      _origin[i] = ({{{ makeGetValue('origin', 'i*4', 'i32') }}});
      _region[i] = ({{{ makeGetValue('region', 'i*4', 'i32') }}});  
      _size *= _region[i];     
    }          

    console.info("/!\\ clEnqueueReadImage : Check the size of the ptr '"+_size+"'... need to be more tested");
    var _host_ptr = CL.getReferencePointerToArray(ptr,_size,[_channel,1]);

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT   
      if (!(_event_wait in CL.cl_objects)) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif
        
      _event_wait_list.push(CL.cl_objects[_event_wait]);
    } 

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueReadImage",[CL.cl_objects[image],blocking_read,_origin,_region,row_pitch,_host_ptr,_event_wait_list,_event]);
#endif  

    try {      

      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueReadImage(CL.cl_objects[image],blocking_read,_origin,_region,row_pitch,_host_ptr,_event_wait_list, _event);
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      }
      else CL.cl_objects[command_queue].enqueueReadImage(CL.cl_objects[image],blocking_read,_origin,_region,row_pitch,_host_ptr,_event_wait_list);

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    return webcl.SUCCESS; 
  },

  clEnqueueWriteImage: function(command_queue,image,blocking_write,origin,region,input_row_pitch,input_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueWriteImage",[command_queue,image,blocking_write,origin,region,input_row_pitch,input_slice_pitch,ptr,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif 
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(image in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+image+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 

    var _event_wait_list = [];

    var _origin = new Int32Array(2);
    var _region = new Int32Array(2);

    var _size = CL.getImageSizeType(image);
    var _channel = CL.getImageFormatType(image);

    for (var i = 0; i < 2; i++) {
      _origin[i] = ({{{ makeGetValue('origin', 'i*4', 'i32') }}});
      _region[i] = ({{{ makeGetValue('region', 'i*4', 'i32') }}});  
      _size *= _region[i];     
    }          

    console.info("/!\\ clEnqueueWriteImage : Check the size of the ptr '"+_size+"'... need to be more tested");
    var _host_ptr = CL.getReferencePointerToArray(ptr,_size,[_channel,1]);

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT   
      if (!(_event_wait in CL.cl_objects)) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif

      _event_wait_list.push(CL.cl_objects[_event_wait]);

    } 

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueWriteImage",[CL.cl_objects[image],blocking_write,_origin,_region,input_row_pitch,_host_ptr,_event_wait_list,_event]);
#endif        
          
    try {

      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueWriteImage(CL.cl_objects[image],blocking_write,_origin,_region,input_row_pitch,_host_ptr,_event_wait_list,_event);
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      }
      else CL.cl_objects[command_queue].enqueueWriteImage(CL.cl_objects[image],blocking_write,_origin,_region,input_row_pitch,_host_ptr,_event_wait_list);

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif   
      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif

    return webcl.SUCCESS;  
  },

  clEnqueueCopyImage: function(command_queue,src_image,dst_image,src_origin,dst_origin,region,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueCopyImage",[command_queue,src_image,dst_image,src_origin,dst_origin,region,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(src_image in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+src_image+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(dst_image in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+dst_image+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif

    var _event_wait_list = [];

    var _src_origin = new Int32Array(2);
    var _dest_origin = new Int32Array(2);
    var _region = new Int32Array(2);

    for (var i = 0; i < 2; i++) {
      _src_origin[i] = ({{{ makeGetValue('src_origin', 'i*4', 'i32') }}});
      _dest_origin[i] = ({{{ makeGetValue('dst_origin', 'i*4', 'i32') }}});
      _region[i] = ({{{ makeGetValue('region', 'i*4', 'i32') }}});            
    }

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT   
      if (!(_event_wait in CL.cl_objects)) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif
      _event_wait_list.push(CL.cl_objects[_event_wait]);
    } 

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueCopyImage",[CL.cl_objects[src_image],CL.cl_objects[dst_image],_src_origin,_dest_origin,_region,_event_wait_list,_event]);
#endif 

    try {

      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueCopyImage(CL.cl_objects[src_image],CL.cl_objects[dst_image],_src_origin,_dest_origin,_region,_event_wait_list,_event);    
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      }
      else CL.cl_objects[command_queue].enqueueCopyImage(CL.cl_objects[src_image],CL.cl_objects[dst_image],_src_origin,_dest_origin,_region,_event_wait_list);    

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }
          
#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS;
  },

  clEnqueueCopyImageToBuffer: function(command_queue,src_image,dst_buffer,src_origin,region,dst_offset,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueCopyImageToBuffer",[command_queue,src_image,dst_buffer,src_origin,region,dst_offset,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(src_image in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+src_image+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(dst_buffer in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+dst_buffer+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 

    var _event_wait_list = [];

    var _src_origin = [];
    var _region = [];

    for (var i = 0; i < 2; i++) {
      _src_origin.push({{{ makeGetValue('src_origin', 'i*4', 'i32') }}});
      _region.push({{{ makeGetValue('region', 'i*4', 'i32') }}});            
    }

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT   
      if (!(_event_wait in CL.cl_objects)) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif

      _event_wait_list.push(CL.cl_objects[_event_wait]);
    } 

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueCopyImageToBuffer",[CL.cl_objects[src_image],CL.cl_objects[dst_buffer],_src_origin,_region,dst_offset,_event_wait_list,_event]);
#endif    
  
    try {

      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueCopyImageToBuffer(CL.cl_objects[src_image],CL.cl_objects[dst_buffer],_src_origin,_region,dst_offset,_event_wait_list,_event);    
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      }
      else CL.cl_objects[command_queue].enqueueCopyImageToBuffer(CL.cl_objects[src_image],CL.cl_objects[dst_buffer],_src_origin,_region,dst_offset,_event_wait_list);    

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS;
  },

  clEnqueueCopyBufferToImage: function(command_queue,src_buffer,dst_image,src_offset,dst_origin,region,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueCopyBufferToImage",[command_queue,src_buffer,dst_image,src_offset,dst_origin,region,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(src_buffer in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+src_buffer+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(dst_image in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLBuffer '"+dst_image+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif 

    var _event_wait_list = [];

    var _dest_origin = new Int32Array(2); 
    var _region = new Int32Array(2); 

    for (var i = 0; i < 2; i++) {
      _dest_origin[i] = {{{ makeGetValue('dst_origin', 'i*4', 'i32') }}};
      _region[i] = {{{ makeGetValue('region', 'i*4', 'i32') }}};            
    }

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT   
      if (!(_event_wait in CL.cl_objects)) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif

      _event_wait_list.push(CL.cl_objects[_event_wait]);
    } 

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueCopyBufferToImage",[CL.cl_objects[src_buffer],CL.cl_objects[dst_image],src_offset,_dest_origin,_region,_event_wait_list,_event]);
#endif    
  
    try {

      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueCopyBufferToImage(CL.cl_objects[src_buffer],CL.cl_objects[dst_image],src_offset,_dest_origin,_region,_event_wait_list,_event);    
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      }
      else CL.cl_objects[command_queue].enqueueCopyBufferToImage(CL.cl_objects[src_buffer],CL.cl_objects[dst_image],src_offset,_dest_origin,_region,_event_wait_list);    

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS;
  },

  clEnqueueMapBuffer: function(command_queue,buffer,blocking_map,map_flags_i64_1,map_flags_i64_2,offset,cb,num_events_in_wait_list,event_wait_list,event,cl_errcode_ret) {
#if ASSERTIONS       
    // Assume the map_flags is i32 
    assert(map_flags_i64_2 == 0, 'Invalid map flags i64');
#endif

    console.error("clEnqueueMapBuffer: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    return webcl.INVALID_VALUE; 
  },

  clEnqueueMapImage: function(command_queue,image,blocking_map,map_flags_i64_1,map_flags_i64_2,origin,region,image_row_pitch,image_slice_pitch,num_events_in_wait_list,event_wait_list,event,cl_errcode_ret) {
#if ASSERTIONS    
    // Assume the map_flags is i32 
    assert(map_flags_i64_2 == 0, 'Invalid map flags i64');
#endif

    console.error("clEnqueueMapImage: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    return webcl.INVALID_VALUE; 
  },

  clEnqueueUnmapMemObject: function(command_queue,memobj,mapped_ptr,num_events_in_wait_list,event_wait_list,event) {
    
    console.error("clEnqueueUnmapMemObject: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    return webcl.INVALID_VALUE; 
  },

  clEnqueueNDRangeKernel: function(command_queue,kernel,work_dim,global_work_offset,global_work_size,local_work_size,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueNDRangeKernel",[command_queue,kernel,work_dim,global_work_offset,global_work_size,local_work_size,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif 
#if CL_CHECK_VALID_OBJECT   
    if (!(kernel in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLKernel '"+kernel+"' are not inside the map","");
#endif
      return webcl.INVALID_KERNEL;
    }
#endif 

    var _event_wait_list = [];

    var _global_work_offset = [];
    var _global_work_size = [];
    var _local_work_size = [];

    for (var i = 0; i < work_dim; i++) {
      _global_work_size.push({{{ makeGetValue('global_work_size', 'i*4', 'i32') }}});

      if (global_work_offset != 0)
        _global_work_offset.push({{{ makeGetValue('global_work_offset', 'i*4', 'i32') }}});
    
      if (local_work_size != 0)
        _local_work_size.push({{{ makeGetValue('local_work_size', 'i*4', 'i32') }}});
    }

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT   
      if (!(_event_wait in CL.cl_objects)) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_KERNEL],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif 
       
      _event_wait_list.push(CL.cl_objects[_event_wait]);
    }

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueNDRangeKernel",[CL.cl_objects[kernel],work_dim,_global_work_offset,_global_work_size,_local_work_size,_event_wait_list,_event]);
#endif    
           
    try { 
      
      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueNDRangeKernel(CL.cl_objects[kernel],work_dim,_global_work_offset,_global_work_size,_local_work_size,_event_wait_list,_event);  
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      }
      else CL.cl_objects[command_queue].enqueueNDRangeKernel(CL.cl_objects[kernel],work_dim,_global_work_offset,_global_work_size,_local_work_size,_event_wait_list);  

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
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
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueMarker",[command_queue,event]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif     

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueMarker",[_event]);
#endif    

    try { 

      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueMarker(_event);    
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      }
      else CL.cl_objects[command_queue].enqueueMarker();    

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS; 
  },

  clEnqueueWaitForEvents: function(command_queue,num_events,event_list) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueWaitForEvents",[command_queue,num_events,event_list]);
#endif
#if CL_CHECK_VALID_OBJECT       
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif
      return webcl.INVALID_COMMAND_QUEUE; 
    }
#endif

    var _events = [];

    for (var i = 0; i < num_events; i++) {
      var _event = {{{ makeGetValue('event_list', 'i*4', 'i32') }}};
#if CL_CHECK_VALID_OBJECT       
      if (!(_event in CL.cl_objects)) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([0,cl_errcode_ret],"WebCLEvent '"+_event+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT; 
      }
#endif
      
      _events.push(CL.cl_objects[_event])

    } 
     
#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueWaitForEvents",[_events]);
#endif  

    try { 
      
      CL.cl_objects[command_queue].enqueueWaitForEvents(_events);   

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS; 
  },

  clEnqueueBarrier: function(command_queue) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueBarrier",[command_queue]);
#endif
#if CL_CHECK_VALID_OBJECT       
    if (!(command_queue in CL.cl_objects)) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif
      return webcl.INVALID_COMMAND_QUEUE; 
    }
#endif

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueBarrier",[]);
#endif    
    
    try {
      
      CL.cl_objects[command_queue].enqueueBarrier(); 

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS; 
  },

  clGetExtensionFunctionAddress: function(func_name) {
    console.error("clGetExtensionFunctionAddress: Not yet implemented\n");
    return webcl.INVALID_VALUE;
  },

  clCreateFromGLBuffer: function(context,flags_i64_1,flags_i64_2,bufobj,cl_errcode_ret) {
#if ASSERTIONS    
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
#endif
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateFromGLBuffer",[context,flags_i64_1,bufobj,cl_errcode_ret]);
#endif
#if CL_CHECK_VALID_OBJECT       
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"WebCLContext '"+context+"' are not inside the map","");
#endif
      return 0; 
    }
#endif
 
    var _id = null;
    var _buffer = null;
    var _flags;

    if (flags_i64_1 & webcl.MEM_READ_WRITE) {
      _flags = webcl.MEM_READ_WRITE;
    } else if (flags_i64_1 & webcl.MEM_WRITE_ONLY) {
      _flags = webcl.MEM_WRITE_ONLY;
    } else if (flags_i64_1 & webcl.MEM_READ_ONLY) {
      _flags = webcl.MEM_READ_ONLY;
    } else {
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
#endif
      return 0; 
    }

#if CL_GRAB_TRACE
    CL.webclCallStackTrace( CL.cl_objects[context]+".createFromGLBuffer",[_flags,GL.buffers[bufobj]]);
#endif   

    try {

      _buffer = CL.cl_objects[context].createFromGLBuffer(_flags,GL.buffers[bufobj]);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};

    _id = CL.udid(_buffer);

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateFromGLTexture: function(context,flags_i64_1,flags_i64_2,target,miplevel,texture,cl_errcode_ret) {
#if ASSERTIONS    
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
#endif
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateFromGLTexture",[context,flags_i64_1,target,miplevel,texture,cl_errcode_ret]);
#endif
#if CL_CHECK_VALID_OBJECT       
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"WebCLContext '"+context+"' are not inside the map","");
#endif
      return 0; 
    }
#endif

    var _id = null;
    var _buffer = null;
    var _flags;

    if (flags_i64_1 & webcl.MEM_READ_WRITE) {
      _flags = webcl.MEM_READ_WRITE;
    } else if (flags_i64_1 & webcl.MEM_WRITE_ONLY) {
      _flags = webcl.MEM_WRITE_ONLY;
    } else if (flags_i64_1 & webcl.MEM_READ_ONLY) {
      _flags = webcl.MEM_READ_ONLY;
    } else {
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
#endif
      return 0; 
    }

#if CL_GRAB_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createFromGLTexture",[_flags, target, miplevel, GL.textures[texture]]);
#endif      

    try {
      
      _buffer = CL.cl_objects[context].createFromGLTexture(_flags, target, miplevel, GL.textures[texture]);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};

    _id = CL.udid(_buffer);

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateFromGLTexture2D: function(context,flags_i64_1,flags_i64_2,target,miplevel,texture,cl_errcode_ret) {
#if ASSERTIONS    
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
#endif
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateFromGLTexture2D",[context,flags_i64_1,target,miplevel,texture,cl_errcode_ret]);
#endif
#if CL_CHECK_VALID_OBJECT       
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"WebCLContext '"+context+"' are not inside the map","");
#endif
      return 0; 
    }
#endif

    var _id = null;
    var _buffer = null;
    var _flags;

    if (flags_i64_1 & webcl.MEM_READ_WRITE) {
      _flags = webcl.MEM_READ_WRITE;
    } else if (flags_i64_1 & webcl.MEM_WRITE_ONLY) {
      _flags = webcl.MEM_WRITE_ONLY;
    } else if (flags_i64_1 & webcl.MEM_READ_ONLY) {
      _flags = webcl.MEM_READ_ONLY;
    } else {
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
#endif
      return 0; 
    }


#if CL_GRAB_TRACE
    CL.webclCallStackTrace( CL.cl_objects[context]+".createFromGLTexture",[_flags, target, miplevel, GL.textures[texture]]);
#endif    

    try {

      _buffer = CL.cl_objects[context].createFromGLTexture(_flags, target, miplevel, GL.textures[texture]);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};
    
    _id = CL.udid(_buffer);

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;
  },

  clCreateFromGLTexture3D: function(context,flags_i64_1,flags_i64_2,target,miplevel,texture,cl_errcode_ret) {
#if ASSERTIONS
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
#endif    
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateFromGLTexture3D",[context,flags_i64_1,target,miplevel,texture,cl_errcode_ret]);
#endif

    console.error("clCreateImage3D: Can't be implemented - Differences between WebCL and OpenCL 1.1\n");

    if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};

    return 0;
  },

  clCreateFromGLRenderbuffer: function(context,flags_i64_1,flags_i64_2,renderbuffer,cl_errcode_ret) {
#if ASSERTIONS    
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
#endif
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clCreateFromGLRenderbuffer",[context,flags_i64_1,renderbuffer,cl_errcode_ret]);
#endif
#if CL_CHECK_VALID_OBJECT       
    if (!(context in CL.cl_objects)) {
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_CONTEXT', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"WebCLContext '"+context+"' are not inside the map","");
#endif
      return 0; 
    }
#endif

    var _id = null;
    var _buffer = null;    
    var _flags;

    if (flags_i64_1 & webcl.MEM_READ_WRITE) {
      _flags = webcl.MEM_READ_WRITE;
    } else if (flags_i64_1 & webcl.MEM_WRITE_ONLY) {
      _flags = webcl.MEM_WRITE_ONLY;
    } else if (flags_i64_1 & webcl.MEM_READ_ONLY) {
      _flags = webcl.MEM_READ_ONLY;
    } else {
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', 'webcl.INVALID_VALUE', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"values specified "+flags_i64_1+" in flags are not valid","");
#endif
      return 0; 
    }

#if CL_GRAB_TRACE
      CL.webclCallStackTrace( CL.cl_objects[context]+".createFromGLRenderbuffer",[_flags, GL.renderbuffers[renderbuffer]]);
#endif      
    try {

      _buffer = CL.cl_objects[context].createFromGLRenderbuffer(_flags, GL.renderbuffers[renderbuffer]);

    } catch (e) {
      var _error = CL.catchError(e);
    
      if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', '_error', 'i32') }}};
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([0,cl_errcode_ret],"",e.message);
#endif
      return 0; // NULL Pointer
    }

    if (cl_errcode_ret != 0) {{{ makeSetValue('cl_errcode_ret', '0', '0', 'i32') }}};

    _id = CL.udid(_buffer);

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([_id,cl_errcode_ret],"","");
#endif

    return _id;  
  },

  clGetGLObjectInfo: function(memobj,gl_object_type,gl_object_name) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetGLObjectInfo",[memobj,gl_object_type,gl_object_name]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!memobj in CL.cl_objects) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"WebCLBuffer '"+memobj+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[memobj]+".getGLObjectInfo",[]);
#endif        

    try { 

      var _info = CL.cl_objects[memobj].getGLObjectInfo();

      if (gl_object_type != 0) {{{ makeSetValue('gl_object_type', '0', '_info.type', 'i32') }}};
      if (gl_object_name != 0) {{{ makeSetValue('gl_object_name', '0', '_info.glObject', 'i32') }}};  

    } catch (e) {

      var _error = CL.catchError(e);

      if (gl_object_type != 0) {{{ makeSetValue('gl_object_type', '0', '0', 'i32') }}};
      if (gl_object_name != 0) {{{ makeSetValue('gl_object_name', '0', '0', 'i32') }}};

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,gl_object_type,gl_object_name],"",e.message);
#endif
      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,gl_object_type,gl_object_name],"","");
#endif

    return webcl.SUCCESS;
  },

  clGetGLTextureInfo: function(memobj,param_name,param_value_size,param_value,param_value_size_ret) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clGetGLTextureInfo",[memobj,param_name,param_value_size,param_value,param_value_size_ret]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!memobj in CL.cl_objects) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"WebCLBuffer '"+memobj+"' are not inside the map","");
#endif
      return webcl.INVALID_MEM_OBJECT;
    }
#endif

#if CL_GRAB_TRACE
        CL.webclCallStackTrace(""+CL.cl_objects[memobj]+".getGLTextureInfo",[param_name]);
#endif        

    try {
      
      var _info = CL.cl_objects[memobj].getGLTextureInfo(param_name);

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '_info', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '4', 'i32') }}};

    } catch (e) {
      var _error = CL.catchError(e);

      if (param_value != 0) {{{ makeSetValue('param_value', '0', '0', 'i32') }}};
      if (param_value_size_ret != 0) {{{ makeSetValue('param_value_size_ret', '0', '0', 'i32') }}};
    
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error,param_value,param_value_size_ret],"",e.message);
#endif
      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS,param_value,param_value_size_ret],"","");
#endif
    return webcl.SUCCESS;
  },

  clEnqueueAcquireGLObjects: function(command_queue,num_objects,mem_objects,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueAcquireGLObjects",[command_queue,num_objects,mem_objects,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!command_queue in CL.cl_objects) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif
      
    var _event_wait_list = [];
    var _mem_objects = [];

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};

#if CL_CHECK_VALID_OBJECT   
      if (!_event_wait in CL.cl_objects) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_EVENT],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif
      
      _event_wait_list.push(CL.cl_objects[_event_wait]);
    }

    for (var i = 0; i < num_objects; i++) {
      var _id = {{{ makeGetValue('mem_objects', 'i*4', 'i32') }}};

#if CL_CHECK_VALID_OBJECT   
      if (!_id in CL.cl_objects) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"WebCLBuffer '"+_id+"' are not inside the map","");
#endif
        return webcl.INVALID_MEM_OBJECT;
      }
#endif
      
      _mem_objects.push(CL.cl_objects[_id]);
    }

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueAcquireGLObjects",[_mem_objects,_event_wait_list,_event]);
#endif    

    try { 

      if (event != 0) {
        var _event = new WebCLEvent();
        CL.cl_objects[command_queue].enqueueAcquireGLObjects(_mem_objects,_event_wait_list,_event); 
        {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};
      } 
      else CL.cl_objects[command_queue].enqueueAcquireGLObjects(_mem_objects,_event_wait_list);    

    } catch (e) {
      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS;
  },

  clEnqueueReleaseGLObjects: function(command_queue,num_objects,mem_objects,num_events_in_wait_list,event_wait_list,event) {
#if CL_GRAB_TRACE
    CL.webclBeginStackTrace("clEnqueueReleaseGLObjects",[command_queue,num_objects,mem_objects,num_events_in_wait_list,event_wait_list,event]);
#endif
#if CL_CHECK_VALID_OBJECT   
    if (!command_queue in CL.cl_objects) {
#if CL_GRAB_TRACE
      CL.webclEndStackTrace([webcl.INVALID_COMMAND_QUEUE],"WebCLCommandQueue '"+command_queue+"' are not inside the map","");
#endif
      return webcl.INVALID_COMMAND_QUEUE;
    }
#endif
      
    var _event_wait_list = [];
    var _mem_objects = [];

    for (var i = 0; i < num_events_in_wait_list; i++) {
      var _event_wait = {{{ makeGetValue('event_wait_list', 'i*4', 'i32') }}};

#if CL_CHECK_VALID_OBJECT   
      if (!_event_wait in CL.cl_objects) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_EVENT],"WebCLEvent '"+_event_wait+"' are not inside the map","");
#endif
        return webcl.INVALID_EVENT;
      }
#endif
      
      _event_wait_list.push(CL.cl_objects[_event_wait]);
    }

    for (var i = 0; i < num_objects; i++) {
      var _id = {{{ makeGetValue('mem_objects', 'i*4', 'i32') }}};

#if CL_CHECK_VALID_OBJECT   
      if (!_id in CL.cl_objects) {
#if CL_GRAB_TRACE
        CL.webclEndStackTrace([webcl.INVALID_MEM_OBJECT],"WebCLBuffer '"+_id+"' are not inside the map","");
#endif
        return webcl.INVALID_MEM_OBJECT;
      }
#endif
      
      _mem_objects.push(CL.cl_objects[_id]);
    }

#if CL_GRAB_TRACE
    CL.webclCallStackTrace(""+CL.cl_objects[command_queue]+".enqueueReleaseGLObjects",[_mem_objects,_event_wait_list,_event]);
#endif    

    try { 

        if (event != 0) {
          var _event = new WebCLEvent();
          CL.cl_objects[command_queue].enqueueReleaseGLObjects(_mem_objects,_event_wait_list,_event);    
          {{{ makeSetValue('event', '0', 'CL.udid(_event)', 'i32') }}};  
        }
        else CL.cl_objects[command_queue].enqueueReleaseGLObjects(_mem_objects,_event_wait_list);      

    } catch (e) {

      var _error = CL.catchError(e);

#if CL_GRAB_TRACE
      CL.webclEndStackTrace([_error],"",e.message);
#endif

      return _error;
    }

#if CL_GRAB_TRACE
    CL.webclEndStackTrace([webcl.SUCCESS],"","");
#endif
    
    return webcl.SUCCESS;
  },

};

autoAddDeps(LibraryOpenCL, '$CL');
mergeInto(LibraryManager.library, LibraryOpenCL);

