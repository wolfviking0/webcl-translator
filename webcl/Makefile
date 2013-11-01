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

DEBUG = -O0 -s OPENCL_PRINT_TRACE=1 -s DISABLE_EXCEPTION_CATCHING=0 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_PROFILE=1 -s OPENCL_DEBUG=1 -s OPENCL_GRAB_TRACE=1 -s OPENCL_CHECK_SET_POINTER=1 -s OPENCL_CHECK_VALID_OBJECT=1

NO_DEBUG = -03 -s WARN_ON_UNDEFINED_SYMBOLS=0 -s OPENCL_PROFILE=1 -s OPENCL_DEBUG=0 -s OPENCL_GRAB_TRACE=0 -s OPENCL_PRINT_TRACE=0 -s OPENCL_CHECK_SET_POINTER=0 -s OPENCL_CHECK_VALID_OBJECT=0

DEB=0

ifeq ($(DEB),1)
MODE=$(DEBUG)
$(info ************  Mode DEBUG : Enabled ************)
else
MODE=$(NO_DEBUG)
$(info ************  Mode DEBUG : Disabled ************)
endif
$(info )
$(info )

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
	mandelbulb_sample 			\
	qjulia_sample 				\
	smallpt_sample              \
	attractor_sample			\
	dxt_sample					\
	
#	fft_sample					\
#	video_sample				\

all_osx: \
	mandelbulb_sample_osx \
	qjulia_sample_osx \
	smallpt_sample_osx \
	attractor_sample_osx \

hello_world_sample:
	$(call chdir,hello_world/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_cl.c $(MODE) -o ../build/hello_world.js

hello_world_cuda_sample:
	$(call chdir,hello_world_cuda/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_cuda.c $(MODE) -o ../build/hello_world_cuda.js

# Not yet working -> issue #315
hello_world_2_sample: 
	$(call chdir,hello_world_2/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) hello_world_2.cpp $(MODE) \
	--preload-file hello_world_2.cl \
	-o ../build/hello_world_2.js

# Not yet working -> issue #315
convolution_sample:
	$(call chdir,convolution/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) convolution.cpp $(MODE) \
	--preload-file convolution_kernel.cl \
	-o ../build/convolution.js

# Need memory 1024 * 1024 * 20
scan_sample:
	$(call chdir,scan/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) scan.c -s TOTAL_MEMORY=1024*1024*20 $(MODE) \
	--preload-file scan_kernel.cl \
	-o ../build/scan.js

reduce_sample:
	$(call chdir,reduce/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) reduce.c -s TOTAL_MEMORY=1024*1024*50 $(MODE) \
	--preload-file reduce_float_kernel.cl --preload-file reduce_float2_kernel.cl --preload-file reduce_float4_kernel.cl --preload-file reduce_int_kernel.cl --preload-file reduce_int2_kernel.cl --preload-file reduce_int4_kernel.cl \
	-o ../build/reduce.js

mandelbulb_sample:
	$(call chdir,mandelbulb/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) mandelbulbGPU.c displayfunc.c -s LEGACY_GL_EMULATION=1 $(MODE) \
	--preload-file mandelbulb_kernel.cl \
	-o ../build/mandelbulb.js

qjulia_sample:
	$(call chdir,qjulia/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) qjulia.c -s LEGACY_GL_EMULATION=1 $(MODE) \
	--preload-file qjulia_kernel.cl \
	-o ../build/qjulia.js

dxt_sample:
	$(call chdir,dxtcompressor/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) -O0 ./common/src/oclUtils.cpp check.cpp block.cpp -I./common/inc -I./shared/inc -s BUILD_AS_WORKER=1 -s EXPORTED_FUNCTIONS='["_checkResult"]' -o ../build/$(FOLDER)/dxtcompressor_worker.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) -O0 ./common/src/oclUtils.cpp ./shared/src/cmd_arg_reader.cpp ./shared/src/shrUtils.cpp block.cpp  DXTCompressor.cpp -I./common/inc -I./shared/inc -s LEGACY_GL_EMULATION=1 $(MODE) \
	--preload-file data/lena_ref.dds --preload-file data/lena.ppm --preload-file DXTCompressor_kernel.cl \
	-o ../build/dxtcompressor.js
	
attractor_sample:
	$(call chdir,attractor/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) Application.cpp Demo.cpp error.cpp global.cpp gltools.cpp LorenzAttractorDemo.cpp LorenzAttractorOpenCLSolver.cpp main.cpp Solver.cpp -I ./ -I $(EMCC)/system/include/ -s TOTAL_MEMORY=1024*1024*128 -s FULL_ES2=1 $(MODE) \
	--preload-file kernel/lorenz.cl	--preload-file shader/lorenz.frag --preload-file shader/lorenz.vert \
	-o ../build/attractor.js

smallpt_sample:
	$(call chdir,smallpt/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) renderconfig.cpp renderdevice.cpp smallptGPU.cpp displayfunc.cpp -s TOTAL_MEMORY=1024*1024*50 -s LEGACY_GL_EMULATION=1 $(MODE) \
	--preload-file rendering_kernel.cl --preload-file scene_build_complex.pl --preload-file scenes/caustic.scn --preload-file scenes/caustic3.scn --preload-file scenes/complex.scn --preload-file scenes/cornell_large.scn --preload-file scenes/cornell.scn --preload-file scenes/simple.scn \
	-o ../build/smallpt.js	

mandelbulb_sample_osx:
	$(call chdir,mandelbulb/)
	clang++ -02 mandelbulbGPU.c displayfunc.c -I ./ -I $(EMCC)/system/include/ -framework OpenCL -framework OpenGL -framework GLUT \
	-o mandelbulb.out

qjulia_sample_osx:
	$(call chdir,qjulia/)
	clang++ -02 qjulia.c -I ./ -I $(EMCC)/system/include/ -framework OpenCL -framework OpenGL -framework GLUT \
	-o qjulia.out

attractor_sample_osx:
	$(call chdir,attractor/)
	clang++ -02 Application.cpp Demo.cpp error.cpp global.cpp gltools.cpp LorenzAttractorDemo.cpp LorenzAttractorOpenCLSolver.cpp main.cpp Solver.cpp -I ./ -I $(EMCC)/system/include/ -framework OpenCL -framework OpenGL -framework GLUT \
	-o attractor.out

smallpt_sample_osx:
	$(call chdir,smallpt/)
	clang++ -02 renderconfig.cpp renderdevice.cpp smallptGPU.cpp displayfunc.cpp -I ./ -I $(EMCC)/system/include/ -framework OpenCL -framework OpenGL -framework GLUT \
	-o smallpt.out	


#smalllux_sample_osx:
#	$(call chdir,smalllux/)
#	clang++ -02 displayfunc.cpp intersectiondevice.cpp mesh.cpp path.cpp qbvhaccel.cpp renderthread.cpp scene.cpp smallluxGPU.cpp plymesh/rply.cpp core/bbox.cpp core/matrix4x4.cpp core/transform.cpp -I./core -I./plymesh -I ./ -I $(EMCC)/system/include/ -framework OpenCL -framework OpenGL -framework GLUT \
#	-o smalllux.out	

#fft_sample:
#	$(call chdir,fft/)
#	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) fft_execute.cpp fft_kernelstring.cpp fft_setup.cpp main.cpp $(DEBUG) \
#	--preload-file param.txt \
#	-o ../build/fft.js
	
#video_sample:
#	$(call chdir,decodevideo/)
#	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) GLRenderFrame.cpp OVDecodeRender.cpp OVDecodeTest.cpp SDKUtil/SDKApplication.cpp SDKUtil/SDKBitMap.cpp SDKUtil/SDKCommandArgs.cpp SDKUtil/SDKCommon.cpp SDKUtil/SDKFile.cpp SDKUtil/SDKThread.cpp -I./SDKUtil/include -I./ -O0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_OLD_VERSION=1 \
#	--preload-file OVDecodeRender_Kernels.cl --preload-file verifyH264.image --preload-file verifyMPEG.image --preload-file OVDecodeDataH264.zip --preload-file OVDecodeDataMPEG.zip \
#	-o ../build/videodecode.js
		

clean:
	$(call chdir,build/)
	mkdir tmp
	cp memoryprofiler.js tmp/
	cp settings.js tmp/
	rm -f *.data
	rm -f *.js
	rm -f *.map
	cp tmp/memoryprofiler.js ./
	cp tmp/settings.js ./
	rm -rf tmp/
	$(CXX) --clear-cache

	
	
