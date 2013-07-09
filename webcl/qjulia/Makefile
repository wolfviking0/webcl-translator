EMCC:=../../emscripten
	
EMSCRIPTEN = $(EMCC)
CXX = $(EMSCRIPTEN)/emcc
AR = $(EMSCRIPTEN)/emar
EMCONFIGURE = $(EMSCRIPTEN)/emconfigure
EMMAKE = $(EMSCRIPTEN)/emmake

#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#
# BUILD
#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#		
all:
	python $(EMSCRIPTEN)/tools/file_packager.py qjulia_kernel.data --preload qjulia_kernel.cl --pre-run > qjulia_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) qjulia.c -O2 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_DEBUG=1 -s OPENGL_DEBUG=1 -o qjulia.js
					
clean:
	$(CXX) --clear-cache

	
	
