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
	python $(EMSCRIPTEN)/tools/file_packager.py FFT_param.data --preload param.txt --pre-run > FFT_param.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) fft_execute.cpp fft_kernelstring.cpp fft_setup.cpp main.cpp -O0 -s ALLOW_MEMORY_GROWTH=1 -s ASM_JS=0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o FFT.js
					
clean:
	$(CXX) --clear-cache

	
	
