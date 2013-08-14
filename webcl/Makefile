EMCC:=../../emscripten
	
EMSCRIPTEN = $(EMCC)
CXX = $(EMSCRIPTEN)/emcc
AR = $(EMSCRIPTEN)/emar
EMCONFIGURE = $(EMSCRIPTEN)/emconfigure
EMMAKE = $(EMSCRIPTEN)/emmake

CHDIR_SHELL := $(SHELL)
define chdir
   $(eval _D=$(firstword $(1) $(@D)))
   $(info $(MAKE): cd $(_D)) $(eval SHELL = cd $(_D); $(CHDIR_SHELL))
endef

SMALLPT_DATA = \
	rendering_kernel_custom.cl\
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

all: \
	helloworld_sample 	\
	helloworld2_sample 	\
	convolution_sample 	\
	reduce_sample 		\
	scan_sample 		\
	displacement_sample \
	qjulia_sample 		\
	mandelbulb_sample 	\
	smallpt_sample		\
	fft_sample			\
	dxt_sample			\
	video_sample		\

helloworld_sample:
	$(call chdir,hello_world/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_cl.c -O2 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_STACK_TRACE=1 -s OPENCL_DEBUG=1 -o ../build/hello_world.js

helloworld2_sample:
	$(call chdir,hello_world_2/)
	python $(EMSCRIPTEN)/tools/file_packager.py ../build/hello_world_2.data --preload hello_world_2.cl --pre-run > ../build/hello_world_2_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_2.cpp -O2 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_DEBUG=1 -o ../build/hello_world_2.js

convolution_sample:
	$(call chdir,convolution/)
	python $(EMSCRIPTEN)/tools/file_packager.py ../build/convolution_kernel.data --preload convolution_kernel.cl --pre-run > ../build/convolution_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) convolution.cpp -O2 -s ASM_JS=0 -s ALLOW_MEMORY_GROWTH=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_DEBUG=1 -o ../build/convolution.js

reduce_sample:
	$(call chdir,reduce/)
	python $(EMSCRIPTEN)/tools/file_packager.py ../build/reduce_kernel.data --preload reduce_float_kernel.cl reduce_float2_kernel.cl reduce_float4_kernel.cl reduce_int_kernel.cl reduce_int2_kernel.cl reduce_int4_kernel.cl --pre-run > ../build/reduce_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) reduce.c -O2 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s ALLOW_MEMORY_GROWTH=1 -s ASM_JS=0 -s OPENCL_DEBUG=1 -o ../build/reduce.js

scan_sample:
	$(call chdir,scan/)
	python $(EMSCRIPTEN)/tools/file_packager.py ../build/scan_kernel.data --preload scan_kernel.cl --pre-run > ../build/scan_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) scan.c -O2 -s ASM_JS=0 -s ALLOW_MEMORY_GROWTH=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_DEBUG=1 -o ../build/scan.js

qjulia_sample:
	$(call chdir,qjulia/)
	python $(EMSCRIPTEN)/tools/file_packager.py ../build/qjulia_kernel.data --preload qjulia_kernel.cl --pre-run > ../build/qjulia_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) qjulia.c -O2 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o ../build/qjulia.js

displacement_sample:
	$(call chdir,displacement/)
	python $(EMSCRIPTEN)/tools/file_packager.py ../build/displacement_kernel.data --preload displacement_kernel.cl stpeters_probe.pfm  phong.frag phong.vert skybox.frag skybox.vert fresnel.frag fresnel.vert --pre-run > ../build/displacement_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) displacement.c -O2 -s ALLOW_MEMORY_GROWTH=1 -s ASM_JS=0 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_DEBUG=1 -s GL_DEBUG=0 -o ../build/displacement.js

mandelbulb_sample:
	$(call chdir,mandelbulb/)
	python $(EMSCRIPTEN)/tools/file_packager.py ../build/mandelbulb_kernel.data --preload mandelbulb_kernel.cl --pre-run > ../build/mandelbulb_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) mandelbulbGPU.c displayfunc.c -O2 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o ../build/mandelbulb.js

smallpt_sample:
	$(call chdir,smallpt/)
	python $(EMSCRIPTEN)/tools/file_packager.py ../build/smallpt_kernel.data --preload $(SMALLPT_DATA) --pre-run > ../build/smallpt_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) smallptGPU.c displayfunc.c -O2 -s ASM_JS=0 -s ALLOW_MEMORY_GROWTH=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_DEBUG=1 -s OPENGL_DEBUG=1 -o ../build/smallpt.js

fft_sample:
	$(call chdir,fft/)
	python $(EMSCRIPTEN)/tools/file_packager.py ../build/fft_kernel.data --preload param.txt --pre-run > ../build/fft_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) fft_execute.cpp fft_kernelstring.cpp fft_setup.cpp main.cpp -O2 -s ALLOW_MEMORY_GROWTH=1 -s ASM_JS=0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o ../build/fft.js
	
dxt_sample:
	$(call chdir,dxtcompressor/)
	python $(EMSCRIPTEN)/tools/file_packager.py ../build/dxtcompressor_kernel.data --preload DXTCompressor_kernel.cl data/lena_ref.dds data/lena.ppm --pre-run > ../build/dxtcompressor_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) -O2 ./common/src/oclUtils.cpp check.cpp block.cpp -I./common/inc -I./shared/inc -s BUILD_AS_WORKER=1 -s EXPORTED_FUNCTIONS='["_checkResult"]' -o ../build/dxtcompressor_worker.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) -O2 ./common/src/oclUtils.cpp ./shared/src/cmd_arg_reader.cpp ./shared/src/shrUtils.cpp block.cpp  DXTCompressor.cpp -I./common/inc -I./shared/inc -s DISABLE_EXCEPTION_CATCHING=0 -s ASM_JS=0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o ../build/dxtcompressor.js

video_sample:
	$(call chdir,decodevideo/)
	python $(EMSCRIPTEN)/tools/file_packager.py ../build/videodecode_kernel.data --preload OVDecodeRender_Kernels.cl verifyH264.image verifyMPEG.image OVDecodeDataH264.zip OVDecodeDataMPEG.zip --pre-run > ../build/videodecode_kernel.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) GLRenderFrame.cpp OVDecodeRender.cpp OVDecodeTest.cpp SDKUtil/SDKApplication.cpp SDKUtil/SDKBitMap.cpp SDKUtil/SDKCommandArgs.cpp SDKUtil/SDKCommon.cpp SDKUtil/SDKFile.cpp SDKUtil/SDKThread.cpp -I./SDKUtil/include -I./ -O0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o ../build/videodecode.js
		

clean:
	rm -f build/*.data
	rm -f build/*.js
	$(CXX) --clear-cache

	
	
