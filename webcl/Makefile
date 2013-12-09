EMSCRIPTEN_ROOT:=../../emscripten

#EMSCRIPTEN_ROOT = /Volumes/APPLE_MEDIA/WORKSPACE/webcl/webcl-translator/emscripten
#LLVM_ROOT = /Volumes/APPLE_MEDIA/WORKSPACE/compilo/llvm/bin
#VALIDATOR = $(LLVM_ROOT)/webcl-validator

CXX = $(EMSCRIPTEN_ROOT)/emcc

CHDIR_SHELL := $(SHELL)
define chdir
   $(eval _D=$(firstword $(1) $(@D)))
   $(info $(MAKE): cd $(_D)) $(eval SHELL = cd $(_D); $(CHDIR_SHELL))
endef

DEB=0
VAL=0

ifeq ($(VAL),1)
PREFIX = val_
$(info ************  Mode VALIDATOR : Enabled ************)
else
PREFIX = 
$(info ************  Mode VALIDATOR : Disabled ************)
endif

DEBUG = -O0 -s OPENCL_VALIDATOR=$(VAL) -s OPENCL_PRINT_TRACE=1 -s DISABLE_EXCEPTION_CATCHING=0 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s OPENCL_PROFILE=1 -s OPENCL_DEBUG=1 -s OPENCL_GRAB_TRACE=1 -s OPENCL_CHECK_VALID_OBJECT=1

NO_DEBUG = -03 -s OPENCL_VALIDATOR=$(VAL) -s WARN_ON_UNDEFINED_SYMBOLS=0 -s OPENCL_PROFILE=1 -s OPENCL_DEBUG=0 -s OPENCL_GRAB_TRACE=0 -s OPENCL_PRINT_TRACE=0 -s OPENCL_CHECK_VALID_OBJECT=0

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
	imagecopy_sample			\
	eventprofiling_sample		\
	convolution_sample 			\
	attractor_sample			\
	dxt_sample					\
	
#	fft_sample					\
#	video_sample				\

all_osx: \
	mandelbulb_sample_osx \
	smallpt_sample_osx \
	attractor_sample_osx \

# Not yet working -> issue #315
hello_world_sample: 
	$(call chdir,hello_world/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=$(DEB) $(CXX) hello_world.cpp $(MODE) \
	--preload-file hello_world.cl \
	-o ../build/$(PREFIX)hello_world.js

# Not yet working -> issue #315
convolution_sample:
	$(call chdir,convolution/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=$(DEB) $(CXX) convolution.cpp $(MODE) \
	--preload-file convolution_kernel.cl \
	-o ../build/$(PREFIX)convolution.js

imagecopy_sample:
	$(call chdir,imagecopy/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=$(DEB) $(CXX) image_copy.cpp $(MODE) \
	--preload-file image_copy.cl \
	-o ../build/$(PREFIX)imagecopy.js

eventprofiling_sample:
	$(call chdir,eventprofiling/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=$(DEB) $(CXX) event_profiling.cpp $(MODE) -s TOTAL_MEMORY=1024*1024*50 \
	--preload-file event_profiling.cl \
	-o ../build/$(PREFIX)eventprofiling.js

#JAVA_HEAP_SIZE=8096m EMCC_DEBUG=$(DEB) $(CXX) -O0 ./common/src/oclUtils.cpp check.cpp block.cpp -I./common/inc -I./shared/inc -s BUILD_AS_WORKER=1 -s EXPORTED_FUNCTIONS='["_checkResult"]' -o ../build/$(PREFIX)$(FOLDER)/dxtcompressor_worker.js
dxt_sample:
	$(call chdir,dxtcompressor/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=$(DEB) $(CXX) ./common/src/oclUtils.cpp ./shared/src/cmd_arg_reader.cpp ./shared/src/shrUtils.cpp block.cpp  DXTCompressor.cpp -I./common/inc -I./shared/inc  -s GL_FFP_ONLY=1 -s LEGACY_GL_EMULATION=1 $(MODE) \
	--preload-file data/lena_ref.dds --preload-file data/lena.ppm --preload-file DXTCompressor_kernel.cl \
	-o ../build/$(PREFIX)dxtcompressor.js
	
attractor_sample:
	$(call chdir,attractor/)
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=$(DEB) $(CXX) Application.cpp Demo.cpp error.cpp global.cpp gltools.cpp LorenzAttractorDemo.cpp LorenzAttractorOpenCLSolver.cpp main.cpp Solver.cpp -I ./ -I $(EMCC)/system/include/ -s TOTAL_MEMORY=1024*1024*128 -s FULL_ES2=1 $(MODE) \
	--preload-file kernel/lorenz.cl	--preload-file shader/lorenz.frag --preload-file shader/lorenz.vert \
	-o ../build/$(PREFIX)attractor.js
	
attractor_sample_osx:
	$(call chdir,attractor/)
	clang++ -02 Application.cpp Demo.cpp error.cpp global.cpp gltools.cpp LorenzAttractorDemo.cpp LorenzAttractorOpenCLSolver.cpp main.cpp Solver.cpp -I ./ -I $(EMCC)/system/include/ -framework OpenCL -framework OpenGL -framework GLUT \
	-o attractor.out

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

	
	
