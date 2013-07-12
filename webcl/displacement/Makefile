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
	python $(EMSCRIPTEN)/tools/file_packager.py displacement_kernel.data --preload displacement_kernel.cl --pre-run > displacement_kernel.js
	python $(EMSCRIPTEN)/tools/file_packager.py displacement_shader.data --preload phong.frag phong.vert skybox.frag skybox.vert fresnel.frag fresnel.vert --pre-run > displacement_shader.js
	python $(EMSCRIPTEN)/tools/file_packager.py displacement_image.data --preload stpeters_probe.pfm --pre-run > displacement_image.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) displacement.c -O2 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_DEBUG=1 -s OPENGL_DEBUG=1 -o displacement.js
					
clean:
	$(CXX) --clear-cache

	
	
