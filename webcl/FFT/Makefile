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
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) fft_execute.cpp fft_kernelstring.cpp fft_setup.cpp main.cpp -O2 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o FFT.js
					
clean:
	$(CXX) --clear-cache

	
	
