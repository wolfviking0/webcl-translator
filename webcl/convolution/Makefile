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
	python $(EMSCRIPTEN)/tools/file_packager.py convolution.data --preload Convolution.cl --pre-run > convolution_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) Convolution.cpp -O2 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_DEBUG=1 -o convolution.js
					
clean:
	$(CXX) --clear-cache

	
	
