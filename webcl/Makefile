#
#  Makefile
#  Licence : https://github.com/wolfviking0/webcl-translator/blob/master/LICENSE
#
#  Created by Anthony Liot.
#  Copyright (c) 2013 Anthony Liot. All rights reserved.
#

EMSCRIPTEN_ROOT:=../../emscripten

#EMSCRIPTEN_ROOT = /Volumes/APPLE_MEDIA/WORKSPACE/webcl/webcl-translator/emscripten
#LLVM_ROOT = /Volumes/APPLE_MEDIA/WORKSPACE/compilo/llvm/bin
#VALIDATOR = $(LLVM_ROOT)/webcl-validator

CXX = $(EMSCRIPTEN_ROOT)/em++

CHDIR_SHELL := $(SHELL)
define chdir
   $(eval _D=$(firstword $(1) $(@D)))
   $(info $(MAKE): cd $(_D)) $(eval SHELL = cd $(_D); $(CHDIR_SHELL))
endef

DEB=0
VAL=0

ifeq ($(VAL),1)
PREFIX = val_
VALIDATOR = '[""]' # Enable validator without parameter
$(info ************  Mode VALIDATOR : Enabled ************)
else
PREFIX = 
VALIDATOR = '[]' # disable validator
$(info ************  Mode VALIDATOR : Disabled ************)
endif

DEBUG = -O0 -s CL_VALIDATOR=$(VAL) -s CL_VAL_PARAM=$(VALIDATOR) -s CL_PRINT_TRACE=1 -s DISABLE_EXCEPTION_CATCHING=0 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s CL_DEBUG=1 -s CL_GRAB_TRACE=1 -s CL_CHECK_VALID_OBJECT=1

NO_DEBUG = -02 -s CL_VALIDATOR=$(VAL) -s CL_VAL_PARAM=$(VALIDATOR) -s WARN_ON_UNDEFINED_SYMBOLS=0  -s CL_DEBUG=0 -s CL_GRAB_TRACE=0 -s CL_PRINT_TRACE=0 -s CL_CHECK_VALID_OBJECT=0

ifeq ($(DEB),1)
MODE=$(DEBUG)
EMCCDEBUG = EMCC_DEBUG
$(info ************  Mode DEBUG : Enabled ************)
else
MODE=$(NO_DEBUG)
EMCCDEBUG = EMCCDEBUG
$(info ************  Mode DEBUG : Disabled ************)
endif

$(info )
$(info )


#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#
# BUILD
#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#		

all: all_1 all_2 all_3

all_1: \
	imagecopy_sample			\

all_2: \
	eventprofiling_sample		\
	particles_sample			\

all_3: \
	attractor_sample			\
	dxt_sample					\
	
#	fft_sample					\
#	video_sample				\

all_osx: \
	mandelbulb_sample_osx \
	smallpt_sample_osx \
	attractor_sample_osx \

imagecopy_sample:
	$(call chdir,imagecopy/)
	JAVA_HEAP_SIZE=8096m $(EMCCDEBUG)=1 $(CXX) image_copy.cpp $(MODE) \
	--preload-file image_copy.cl \
	-o ../build/$(PREFIX)imagecopy.js

eventprofiling_sample:
	$(call chdir,eventprofiling/)
	JAVA_HEAP_SIZE=8096m $(EMCCDEBUG)=1 $(CXX) event_profiling.cpp $(MODE) -s TOTAL_MEMORY=1024*1024*50 \
	--preload-file event_profiling.cl \
	-o ../build/$(PREFIX)eventprofiling.js

#JAVA_HEAP_SIZE=8096m $(EMCCDEBUG)=1 $(CXX) -O0 ./common/src/oclUtils.cpp check.cpp block.cpp -I./common/inc -I./shared/inc -s BUILD_AS_WORKER=1 -s EXPORTED_FUNCTIONS='["_checkResult"]' -o ../build/$(PREFIX)$(FOLDER)/dxtcompressor_worker.js
dxt_sample:
	$(call chdir,dxtcompressor/)
	JAVA_HEAP_SIZE=8096m $(EMCCDEBUG)=1 $(CXX) ./common/src/oclUtils.cpp ./shared/src/cmd_arg_reader.cpp ./shared/src/shrUtils.cpp block.cpp  DXTCompressor.cpp -I./common/inc -I./shared/inc -s LEGACY_GL_EMULATION=1 $(MODE) -s CL_VAL_PARAM='["-cl-mad-enable"]' \
	--preload-file data/lena_ref.dds --preload-file data/lena.ppm --preload-file DXTCompressor_kernel.cl \
	-o ../build/$(PREFIX)dxtcompressor.js
	
attractor_sample:
	$(call chdir,attractor/)
	JAVA_HEAP_SIZE=8096m $(EMCCDEBUG)=1 $(CXX) -std=c++11 Application.cpp Demo.cpp error.cpp global.cpp gltools.cpp LorenzAttractorDemo.cpp LorenzAttractorOpenCLSolver.cpp main.cpp Solver.cpp -I ./ -I $(EMCC)/system/include/ -s TOTAL_MEMORY=1024*1024*128 -s FULL_ES2=1 $(MODE) \
	--preload-file kernel/lorenz.cl	--preload-file shader/lorenz.frag --preload-file shader/lorenz.vert \
	-o ../build/$(PREFIX)attractor.js

particles_sample:
	$(call chdir,particles/)
	JAVA_HEAP_SIZE=8096m $(EMCCDEBUG)=1 $(CXX) \
		cll.cpp \
		main.cpp \
		part2.cpp \
		util.cpp \
	$(MODE) -s TOTAL_MEMORY=1024*1024*200 -s GL_UNSAFE_OPTS=0 -s GL_MAX_TEMP_BUFFER_SIZE=1024*1024*50 -s LEGACY_GL_EMULATION=1 \
	--preload-file part2.cl \
	-o ../build/$(PREFIX)particles.js	
	
attractor_sample_osx:
	$(call chdir,attractor/)
	clang++ -02 -std=c++11 Application.cpp Demo.cpp error.cpp global.cpp gltools.cpp LorenzAttractorDemo.cpp LorenzAttractorOpenCLSolver.cpp main.cpp Solver.cpp -I ./ -I $(EMCC)/system/include/ -framework OpenCL -framework OpenGL -framework GLUT \
	-o attractor.out

clean:
	$(call chdir,build/)
	rm -rf tmp/	
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

	
	
