webcl-translator
================

Requires Python2.7, ie sudo ln -s /usr/bin/python2.7 /usr/bin/python2

Translate OpenCL Code to WebCL

Experimental version of emscripten (https://github.com/kripken/emscripten) for convert OpenCL c++ code to WebCL.

Need Firefox 24 and WebCL plugin from Nokia research (http://webcl.nokiaresearch.com)

or

Need webkit-webcl from Samsung research (https://github.com/SRA-SiliconValley/webkit-webcl)

#### warning

* The webcl-translator is changing, The library_opencl.js is being rewritten for more respect of the WD Khronos, for use the first version of the library just build your sample using in the makefile : -s OPENCL_OLD_VERSION=1
* The new implementation of the webcl-translator start to implement a stack tracer for have the stack of opencl/webcl call.
* The library_cuda.js is not yet implemented is just an empty wrapper for experimental stuff, nothing more.

Patch of Emscripten :
---------------------

	// System files
	Add : system/include/CL/cl_ext.h
	Add : system/include/CL/cl_gl_ext.h
	Add : system/include/CL/cl_gl.h
	Add : system/include/CL/cl_platform.h
	Add : system/include/CL/cl.h
	Add : system/include/CL/opencl.h
	Add : system/include/cuda/cuda.h
	Add : system/include/cuda/cudaGL.h	
	// Src files
	Add : src/library_old_opencl.h
	Add : src/library_opencl.h
	Add : src/library_cuda.h

	Change : src/settings.js
		line 203 => var OPENCL_DEBUG = 0; // Print out debugging information from our OpenCL implementation.
		line 204 => var OPENCL_STACK_TRACE = 0 // Print all the wecl call
		line 205 => var OPENCL_OLD_VERSION = 0 // Use old opencl version (without respect WD)
	Change : src/module.js
		line 429 => 
			var library_opencl = 'library_opencl.js';
    		if (OPENCL_OLD_VERSION) { 
      			library_opencl = 'library_old_opencl.js';
    		}
			var libraries = ['library.js', 'library_path.js', 'library_fs.js', 'library_memfs.js', 'library_sockfs.js', 'library_tty.js', 'library_browser.js', 'library_sdl.js', 'library_gl.js', 'library_glut.js', 'library_xlib.js', 'library_egl.js', 'library_gc.js', 'library_jansson.js', 'library_openal.js', 'library_glfw.js', 'library_cuda.js', library_opencl].concat(additionalLibraries);

Build Sample :
--------------

Just use Makefile inside webcl folder, call : make [folder sample name]_sample (make reduce_sample)

Launch Sample :
---------------

Call index.html inside webcl/build/ folder, by default use GPU mode and sample hello_world, you can change parameter and sample using index.html?sample=[0-11]&mode=cpu or index.html?sample=[0-10]&mode=gpu&param=interop


					|------------------|------------------|			
					|    NOKIA PLUGIN  | SAMSUNG WEBKIT   |
    |---------------|------------------|------------------|
	| hello_world	|		 OK		   |	   OK		  |
	| hello_world_2	|		 OK		   |	   OK		  |
	| convolution	|		 OK		   |	   OK		  |
	| reduce		|   OK (Only GPU)  |   OK (Only GPU)  |
	| scan   		|		 OK		   |	   OK		  |
	| mandelbulb	|		 OK		   |	   OK		  |
	| qjulia 		| 	 BAD RESULT    |	   OK  		  |
	| smallpt  		| WORK IN PROGRESS | WORK IN PROGRESS |
	| FFT			| WORK IN PROGRESS | WORK IN PROGRESS |
	| DXTCompressor |   OK (Only GPU)  |   OK (Only GPU)  |
	| OVDecodeRender| WORK IN PROGRESS | WORK IN PROGRESS |
	|---------------|------------------|------------------|
	
Sources Sample :
-----------------


http://developer.apple.com/library/mac/#samplecode/OpenCL_Hello_World_Example/

https://code.google.com/p/opencl-book-samples/								

https://developer.apple.com/library/mac/#samplecode/OpenCL_Matrix_Transpose_Example/

https://developer.apple.com/library/mac/#samplecode/OpenCL_Parallel_Reduction_Example/

https://developer.apple.com/library/mac/#samplecode/OpenCL_Parallel_Prefix_Sum_Example/

http://davibu.interfree.it/opencl/mandelbulbgpu/mandelbulbGPU.html

https://developer.apple.com/library/mac/#samplecode/OpenCL_RayTraced_Quaternion_Julia-Set_Example/

http://davibu.interfree.it/opencl/smallptgpu/smallptGPU.html

http://developer.apple.com/library/mac/#samplecode/OpenCL_FFT/

https://code.google.com/p/simulation-opencl/

http://developer.amd.com/tools-and-sdks/heterogeneous-computing/amd-accelerated-parallel-processing-app-sdk/samples-demos/

	
Videos :
--------

http://www.youtube.com/watch?v=KSQmXV3RHLQ

http://www.youtube.com/watch?v=bIzmZmEc32Y

License :
--------

webcl-translator is MIT licensed, see LICENSE.

