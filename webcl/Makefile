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

DEBUG = -O0 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_PROFILE=1 -s OPENCL_DEBUG=1 -s OPENCL_STACK_TRACE=1 -s OPENCL_CHECK_SET_POINTER=1 -s OPENCL_CHECK_VALID_OBJECT=1

NO_DEBUG = -02 -s WARN_ON_UNDEFINED_SYMBOLS=0 -s OPENCL_PROFILE=0 -s OPENCL_DEBUG=0 -s OPENCL_STACK_TRACE=0 -s OPENCL_CHECK_SET_POINTER=0 -s OPENCL_CHECK_VALID_OBJECT=0

#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#
# BUILD
#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#		

all: \
	hello_world_sample 			\
	hello_world_cuda_sample		\
	hello_world_2_sample		\
	convolution_sample 			\
	reduce_sample 				\
	scan_sample 				\
	qjulia_sample 				\
	mandelbulb_sample 			\
	smallpt_sample				\
	fft_sample					\
	dxt_sample					\
	video_sample				\

hello_world_sample:
	$(call chdir,hello_world/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_cl.c $(NO_DEBUG) -o ../build/hello_world.js

hello_world_cuda_sample:
	$(call chdir,hello_world_cuda/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_cuda.c $(DEBUG) -o ../build/hello_world_cuda.js

# Not yet working -> issue #315
hello_world_2_sample: 
	$(call chdir,hello_world_2/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_2.cpp $(DEBUG) \
	--preload-file hello_world_2.cl \
	-o ../build/hello_world_2.js

# Not yet working -> issue #315
convolution_sample:
	$(call chdir,convolution/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) convolution.cpp $(DEBUG) \
	--preload-file convolution_kernel.cl \
	-o ../build/convolution.js

# Need memory 1024 * 1024 * 20
# V1 :
# V2 : OPENCL_CHECK_VALID_OBJECT=0 9.69 ms / 9.71 ms / 9.70 ms
# V2 : OPENCL_CHECK_VALID_OBJECT=1 9.76 ms / 9.81 ms / 10.09 ms
scan_sample:
	$(call chdir,scan/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) scan.c -s TOTAL_MEMORY=1024*1024*20 $(NO_DEBUG) \
	--preload-file scan_kernel.cl \
	-o ../build/scan.js

reduce_sample:
	$(call chdir,reduce/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) reduce.c $(DEBUG) \
	--preload-file reduce_float_kernel.cl --preload-file reduce_float2_kernel.cl --preload-file reduce_float4_kernel.cl --preload-file reduce_int_kernel.cl --preload-file reduce_int2_kernel.cl --preload-file reduce_int4_kernel.cl \
	-o ../build/reduce.js

qjulia_sample:
	$(call chdir,qjulia/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) qjulia.c -O2 -s ASM_JS=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s LEGACY_GL_EMULATION=1 -s OPENCL_OLD_VERSION=0 -s OPENCL_STACK_TRACE=0 -s OPENCL_DEBUG=0 \
	--preload-file qjulia_kernel.cl \
	-o ../build/qjulia.js

mandelbulb_sample:
	$(call chdir,mandelbulb/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) mandelbulbGPU.c displayfunc.c -O2 -s ASM_JS=0 -s LEGACY_GL_EMULATION=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_OLD_VERSION=1 \
	--preload-file mandelbulb_kernel.cl \
	-o ../build/mandelbulb.js

smallpt_sample:
	$(call chdir,smallpt/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) smallptGPU.c displayfunc.c -O2 -s ASM_JS=0 -s LEGACY_GL_EMULATION=1 -s ALLOW_MEMORY_GROWTH=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_OLD_VERSION=1 -s OPENCL_DEBUG=1 -s OPENGL_DEBUG=1 \
	--preload-file rendering_kernel_custom.cl --preload-file scenes/caustic.scn --preload-file scenes/caustic3.scn --preload-file scenes/complex.scn --preload-file scenes/cornell_large.scn --preload-file scenes/cornell.scn --preload-file scenes/simple.scn \
	-o ../build/smallpt.js

fft_sample:
	$(call chdir,fft/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) fft_execute.cpp fft_kernelstring.cpp fft_setup.cpp main.cpp -O2 -s ALLOW_MEMORY_GROWTH=1 -s ASM_JS=0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_OLD_VERSION=1 \
	--preload-file param.txt \
	-o ../build/fft.js
	
dxt_sample:
	$(call chdir,dxtcompressor/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) -O0 ./common/src/oclUtils.cpp check.cpp block.cpp -I./common/inc -I./shared/inc -s BUILD_AS_WORKER=1 -s EXPORTED_FUNCTIONS='["_checkResult"]' -o ../build/dxtcompressor_worker.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) -O0 ./common/src/oclUtils.cpp ./shared/src/cmd_arg_reader.cpp ./shared/src/shrUtils.cpp block.cpp  DXTCompressor.cpp -I./common/inc -I./shared/inc -s ASM_JS=0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_OLD_VERSION=1 \
	--preload-file data/lena_ref.dds --preload-file data/lena.ppm --preload-file DXTCompressor_kernel.cl \
	-o ../build/dxtcompressor.js

video_sample:
	$(call chdir,decodevideo/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) GLRenderFrame.cpp OVDecodeRender.cpp OVDecodeTest.cpp SDKUtil/SDKApplication.cpp SDKUtil/SDKBitMap.cpp SDKUtil/SDKCommandArgs.cpp SDKUtil/SDKCommon.cpp SDKUtil/SDKFile.cpp SDKUtil/SDKThread.cpp -I./SDKUtil/include -I./ -O0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_OLD_VERSION=1 \
	--preload-file OVDecodeRender_Kernels.cl --preload-file verifyH264.image --preload-file verifyMPEG.image --preload-file OVDecodeDataH264.zip --preload-file OVDecodeDataMPEG.zip \
	-o ../build/videodecode.js
		

clean:
	#rm -f build/*.data
	#rm -f build/*.js
	$(CXX) --clear-cache

	
	
