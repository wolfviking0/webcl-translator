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
	python $(EMSCRIPTEN)/tools/file_packager.py mandelbulb_kernel.data --preload mandelbulb_kernel.cl --pre-run > mandelbulb_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) mandelbulbGPU.c displayfunc.c -O3 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o mandelbulb.js
					
clean:
	$(CXX) --clear-cache

	
	
