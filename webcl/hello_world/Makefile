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
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_cl.c -O2 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_STACK_TRACE=1 -s OPENCL_DEBUG=1 -o hello_world.js
					
clean:
	$(CXX) --clear-cache

	
	
