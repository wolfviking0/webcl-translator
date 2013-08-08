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
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) ./common/src/oclUtils.cpp check.cpp block.cpp -I./common/inc -I./shared/inc -o check.js -s BUILD_AS_WORKER=1 -s EXPORTED_FUNCTIONS='["_checkResult"]'
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) ./common/src/oclUtils.cpp ./shared/src/cmd_arg_reader.cpp ./shared/src/shrUtils.cpp block.cpp  DXTCompressor.cpp -I./common/inc -I./shared/inc -O2 -s DISABLE_EXCEPTION_CATCHING=0 -s ASM_JS=0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o DXTCompressor.js

gcc:
	g++ ./common/src/oclUtils.cpp ./shared/src/cmd_arg_reader.cpp ./shared/src/shrUtils.cpp block.cpp DXTCompressor.cpp -I../ -I./common/inc -I./shared/inc -framework OpenCL -D_MACOS -o DXTCompressor.out
					
clean:
	$(CXX) --clear-cache

	
	
