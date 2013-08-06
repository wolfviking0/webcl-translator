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
	python $(EMSCRIPTEN)/tools/file_packager.py DXTCompressor_images.data --preload data/lena_ref.dds data/lena.ppm --pre-run > DXTCompressor_images.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) ./common/src/oclUtils.cpp ./shared/src/cmd_arg_reader.cpp ./shared/src/shrUtils.cpp block.cpp DXTCompressor.cpp -I./common/inc -I./shared/inc -O0 -s ALLOW_MEMORY_GROWTH=1 -s ASM_JS=0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o DXTCompressor.js
					
clean:
	$(CXX) --clear-cache

	
	
