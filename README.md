webcl-emscripten
================

WebCL inside Emscripten (https://github.com/kripken/emscripten)

Experimental version of emscripten for convert OpenCL c++ code to WebCL.

Need Firefox 22 and WebCL plugin from Nokia research (https://github.com/SRA-SiliconValley/webkit-webcl)

or

Need webkit-webcl from Samsung research (http://webcl.nokiaresearch.com)

Patch of Emscripten :
---------------------

	Add : system/include/CL/cl_ext.h
	Add : system/include/CL/cl_gl_ext.h
	Add : system/include/CL/cl_gl.h
	Add : system/include/CL/cl_platform.h
	Add : system/include/CL/cl.h
	Add : system/include/CL/opencl.h
	Add : src/library_opencl.h

	Change : src/settings.js
		line 180 => var OPENCL_DEBUG = 0; // Print out debugging information from our OpenCL implementation.
	Change : src/module.js
		line 400 => var libraries = ['library.js', 'library_browser.js', 'library_sdl.js', 'library_gl.js', 'library_glut.js', 'library_xlib.js', 'library_egl.js', 'library_gc.js', 'library_jansson.js', 'library_openal.js', 'library_glfw.js', 'library_opencl.js'].concat(additionalLibraries);


Build Sample :
--------------

Call makefile inside the different sample folder

Launch Sample :
---------------

Call index.html for try some sample, by default use GPU mode, you can change parameter using index.html?mode=cpu or index.html?mode=gpu

					|------------------|------------------|			
					|    NOKIA PLUGIN  | SAMSUNG WEBKIT   |
    |---------------|------------------|------------------|
	| hello_world	|		 OK		   |	   OK		  |
	| hello_world_2	|		 OK		   |	   OK		  |
	| convolution	|		 OK		   |	   OK		  |
	| reduce		| 	 BAD RESULT	   |   BAD RESULT     |
	| qjulia		| WORK IN PROGRESS | WORK IN PROGRESS |
	| displacement	| WORK IN PROGRESS | WORK IN PROGRESS |
	| histogram		| WORK IN PROGRESS | WORK IN PROGRESS |
	|---------------|------------------|------------------|
