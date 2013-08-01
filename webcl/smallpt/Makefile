EMCC:=../../emscripten
	
EMSCRIPTEN = $(EMCC)
CXX = $(EMSCRIPTEN)/emcc
AR = $(EMSCRIPTEN)/emar
EMCONFIGURE = $(EMSCRIPTEN)/emconfigure
EMMAKE = $(EMSCRIPTEN)/emmake

KERNELS = \
	camera.h \
	geomfunc.h \
	simplernd.h \
	geom.h \
	vec.h \
	preprocessed_rendering_kernel_dl.cl\
	preprocessed_rendering_kernel.cl\
	rendering_kernel_dl.cl\
	rendering_kernel.cl\
	rendering_kernel_custom.cl

SCENES = \
	scenes/caustic.scn\
	scenes/caustic3.scn\
	scenes/complex.scn\
	scenes/cornell_large.scn\
	scenes/cornell.scn\
	scenes/simple.scn
		
#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#
# BUILD
#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#		
all:
	python $(EMSCRIPTEN)/tools/file_packager.py smallpt_kernel.data --preload $(KERNELS) --pre-run > smallpt_kernels.js
	python $(EMSCRIPTEN)/tools/file_packager.py smallpt_scenes.data --preload $(SCENES) --pre-run > smallpt_scenes.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) smallptGPU.c displayfunc.c -O2 -s ASM_JS=0 -s ALLOW_MEMORY_GROWTH=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_DEBUG=1 -s OPENGL_DEBUG=1 -o smallpt.js
					
clean:
	$(CXX) --clear-cache

	
	
