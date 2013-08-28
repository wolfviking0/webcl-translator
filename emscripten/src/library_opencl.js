var LibraryOpenCL = {  
  $CL__deps: ['$GL'],
  $CL: {
    
  },

  clGetPlatformIDs: function(num_entries,platforms,num_platforms) {
    console.error("clGetPlatformIDs: Not yet implemented\n");
  },

  clGetPlatformInfo: function(platform,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetPlatformInfo: Not yet implemented\n");
  },

  clGetDeviceIDs: function(platform,device_type_i64_1,device_type_i64_2,num_entries,devices,num_devices) {
    // Assume the device_type is i32 
    assert(device_type_i64_2 == 0, 'Invalid device_type i64');
        
    console.error("clGetDeviceIDs: Not yet implemented\n");
  },

  clGetDeviceInfo: function(device,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetDeviceInfo: Not yet implemented\n");
  },

  clCreateContext: function(properties,num_devices,devices,pfn_notify,user_data,cl_errcode_ret) {
    console.error("clCreateContext: Not yet implemented\n");
  },

  clCreateContextFromType: function(properties,device_type_i64_1,device_type_i64_2,pfn_notify,user_data,cl_errcode_ret) {
    // Assume the device_type is i32 
    assert(device_type_i64_2 == 0, 'Invalid device_type i64');
    
    console.error("clCreateContextFromType: Not yet implemented\n");
  },

  clRetainContext: function(context) {
    console.error("clRetainContext: Not yet implemented\n");
  },

  clReleaseContext: function(context) {
    console.error("clReleaseContext: Not yet implemented\n");
  },

  clGetContextInfo: function(context,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetContextInfo: Not yet implemented\n");
  },

  clCreateCommandQueue: function(context,device,properties,cl_errcode_ret) {
    console.error("clCreateCommandQueue: Not yet implemented\n");
  },

  clRetainCommandQueue: function(command_queue) {
    console.error("clRetainCommandQueue: Not yet implemented\n");
  },

  clReleaseCommandQueue: function(command_queue) {
    console.error("clReleaseCommandQueue: Not yet implemented\n");
  },

  clGetCommandQueueInfo: function(command_queue,param_name,param_value_size,param_value,param_value_size_ret) {
    console.error("clGetCommandQueueInfo: Not yet implemented\n");
  },

  clCreateBuffer: function(context,flags_i64_1,flags_i64_2,size,host_ptr,cl_errcode_ret) {
    // Assume the flags is i32 
    assert(flags_i64_2 == 0, 'Invalid flags i64');
    
    console.error("clCreateBuffer: Not yet implemented\n");
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

