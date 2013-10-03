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

OLD=0

ifeq ($(OLD),1)
FOLDER=old
$(info ************  Old Library : Enabled ************)
else
FOLDER=latest
$(info ************  Old Library : Disabled ************)
endif
$(info )
$(info )

DEBUG = -O0 -s OPENCL_OLD_VERSION=$(OLD) -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_PROFILE=1 -s OPENCL_DEBUG=1 -s OPENCL_STACK_TRACE=1 -s OPENCL_CHECK_SET_POINTER=1 -s OPENCL_CHECK_VALID_OBJECT=1

NO_DEBUG = -02 -s OPENCL_OLD_VERSION=$(OLD) -s WARN_ON_UNDEFINED_SYMBOLS=0 -s OPENCL_PROFILE=0 -s OPENCL_DEBUG=0 -s OPENCL_STACK_TRACE=0 -s OPENCL_CHECK_SET_POINTER=0 -s OPENCL_CHECK_VALID_OBJECT=0

#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#
# BUILD
#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#		

all: \
	hello_world_sample 				\
	hello_world_cuda_sample		\
	hello_world_2_sample			\
	convolution_sample 				\
	reduce_sample 						\
	scan_sample 							\
	qjulia_sample 						\
	mandelbulb_sample 				\
	fft_sample								\
	dxt_sample								\

#	smallpt_sample						\
#	video_sample							\

hello_world_sample:
	$(call chdir,hello_world/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_cl.c $(DEBUG) -o ../build/$(FOLDER)/hello_world.js

hello_world_cuda_sample:
	$(call chdir,hello_world_cuda/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_cuda.c $(DEBUG) -o ../build/$(FOLDER)/hello_world_cuda.js

# Not yet working -> issue #315
hello_world_2_sample: 
	$(call chdir,hello_world_2/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_2.cpp $(DEBUG) \
	--preload-file hello_world_2.cl \
	-o ../build/$(FOLDER)/hello_world_2.js

# Not yet working -> issue #315
convolution_sample:
	$(call chdir,convolution/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) convolution.cpp $(DEBUG) \
	--preload-file convolution_kernel.cl \
	-o ../build/$(FOLDER)/convolution.js

# Need memory 1024 * 1024 * 20
# V1 :
# V2 : OPENCL_CHECK_VALID_OBJECT=0 9.69 ms / 9.71 ms / 9.70 ms
# V2 : OPENCL_CHECK_VALID_OBJECT=1 9.76 ms / 9.81 ms / 10.09 ms
scan_sample:
	$(call chdir,scan/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) scan.c -s TOTAL_MEMORY=1024*1024*20 $(NO_DEBUG) \
	--preload-file scan_kernel.cl \
	-o ../build/$(FOLDER)/scan.js

reduce_sample:
	$(call chdir,reduce/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) reduce.c $(DEBUG) \
	--preload-file reduce_float_kernel.cl --preload-file reduce_float2_kernel.cl --preload-file reduce_float4_kernel.cl --preload-file reduce_int_kernel.cl --preload-file reduce_int2_kernel.cl --preload-file reduce_int4_kernel.cl \
	-o ../build/$(FOLDER)/reduce.js

qjulia_sample:
	$(call chdir,qjulia/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) qjulia.c -s LEGACY_GL_EMULATION=1 $(DEBUG) \
	--preload-file qjulia_kernel.cl \
	-o ../build/$(FOLDER)/qjulia.js

mandelbulb_sample:
	$(call chdir,mandelbulb/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) mandelbulbGPU.c displayfunc.c -s LEGACY_GL_EMULATION=1 $(DEBUG) \
	--preload-file mandelbulb_kernel.cl \
	-o ../build/$(FOLDER)/mandelbulb.js

#smallpt_sample:
#	$(call chdir,smallpt/)
#	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) smallptGPU.c displayfunc.c -s LEGACY_GL_EMULATION=1 $(DEBUG) \
#	--preload-file rendering_kernel_custom.cl --preload-file scenes/caustic.scn --preload-file scenes/caustic3.scn --preload-file scenes/complex.scn --preload-file scenes/cornell_large.scn --preload-file scenes/cornell.scn --preload-file scenes/simple.scn \
#	-o ../build/$(FOLDER)/smallpt.js

fft_sample:
	$(call chdir,fft/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) fft_execute.cpp fft_kernelstring.cpp fft_setup.cpp main.cpp $(DEBUG) \
	--preload-file param.txt \
	-o ../build/$(FOLDER)/fft.js
	
dxt_sample:
	$(call chdir,dxtcompressor/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) -O0 ./common/src/oclUtils.cpp check.cpp block.cpp -I./common/inc -I./shared/inc -s BUILD_AS_WORKER=1 -s EXPORTED_FUNCTIONS='["_checkResult"]' -o ../build/dxtcompressor_worker.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) -O0 ./common/src/oclUtils.cpp ./shared/src/cmd_arg_reader.cpp ./shared/src/shrUtils.cpp block.cpp  DXTCompressor.cpp -I./common/inc -I./shared/inc $(DEBUG) \
	--preload-file data/lena_ref.dds --preload-file data/lena.ppm --preload-file DXTCompressor_kernel.cl \
	-o ../build/$(FOLDER)/dxtcompressor.js

#video_sample:
#	$(call chdir,decodevideo/)
#	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) GLRenderFrame.cpp OVDecodeRender.cpp OVDecodeTest.cpp SDKUtil/SDKApplication.cpp SDKUtil/SDKBitMap.cpp SDKUtil/SDKCommandArgs.cpp SDKUtil/SDKCommon.cpp SDKUtil/SDKFile.cpp SDKUtil/SDKThread.cpp -I./SDKUtil/include -I./ -O0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_OLD_VERSION=1 \
#	--preload-file OVDecodeRender_Kernels.cl --preload-file verifyH264.image --preload-file verifyMPEG.image --preload-file OVDecodeDataH264.zip --preload-file OVDecodeDataMPEG.zip \
#	-o ../build/$(FOLDER)/videodecode.js
		

clean:
	rm -f build/$(FOLDER)/*.data
	rm -f build/$(FOLDER)/*.js
	rm -f build/$(FOLDER)/*.map
	$(CXX) --clear-cache

	
	
