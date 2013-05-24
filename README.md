webcl-emscripten
================

WebCL inside Emscripten (https://github.com/kripken/emscripten)

Experimental version of emscripten for convert OpenCL c++ code to WebCL.

Need Firefox 21 and WebCL plugin from Nokia research (http://webcl.nokiaresearch.com)

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

Launch Sample :
---------------

You can launch index.html for try some sample, by default use GPU mode, you can change parameter using index.html?mode=cpu or index.html?mode=gpu

1) hello_world OK

2) hello_world_2 OK

3) qjulia WORK IN PROGRESS 

4) reduce WORK IN PROGRESS

