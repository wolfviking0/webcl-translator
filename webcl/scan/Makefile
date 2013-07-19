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
	python $(EMSCRIPTEN)/tools/file_packager.py scan_kernel.data --preload scan_kernel.cl --pre-run > scan_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) scan.c -O2 -s ASM_JS=0 -s ALLOW_MEMORY_GROWTH=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_DEBUG=1 -o scan.js
					
clean:
	$(CXX) --clear-cache

	
	
