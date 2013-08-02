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
	python $(EMSCRIPTEN)/tools/file_packager.py DXTCompressor_kernel.data --preload DXTCompressor_kernel.cl --pre-run > DXTCompressor_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) DXTCompressor.cpp -O2 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o DXTCompressor.js
					
clean:
	$(CXX) --clear-cache

	
	
