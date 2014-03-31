#
#  Makefile
#  Licence : https://github.com/wolfviking0/webcl-translator/blob/master/LICENSE
#
#  Created by Anthony Liot.
#  Copyright (c) 2013 Anthony Liot. All rights reserved.
#

# Default parameter
DEB = 0
VAL = 0
NAT = 0
ORIG= 0
FAST= 1

# Chdir function
CHDIR_SHELL := $(SHELL)
define chdir
   $(eval _D=$(firstword $(1) $(@D)))
   $(info $(MAKE): cd $(_D)) $(eval SHELL = cd $(_D); $(CHDIR_SHELL))
endef

# Current Folder
CURRENT_ROOT:=$(PWD)

# Emscripten Folder
EMSCRIPTEN_ROOT:=$(CURRENT_ROOT)/../../emscripten

# Native build
ifeq ($(NAT),1)
$(info ************ NATIVE : DEPENDENCIES (GLEW / GLFW3) ************)

CXX = clang++
CC  = clang

BUILD_FOLDER = $(CURRENT_ROOT)/bin/
EXTENSION = .out

ifeq ($(DEB),1)
$(info ************ NATIVE : DEBUG = 1                   ************)

CFLAGS = -O0 -framework OpenCL -framework OpenGL -framework GLUT -framework CoreFoundation -framework AppKit -framework IOKit -framework CoreVideo -framework CoreGraphics -lGLEW -lglfw3

else
$(info ************ NATIVE : DEBUG = 0                   ************)

CFLAGS = -O2 -framework OpenCL -framework OpenGL -framework GLUT -framework CoreFoundation -framework AppKit -framework IOKit -framework CoreVideo -framework CoreGraphics -lGLEW -lglfw3

endif

# Emscripten build
else
ifeq ($(ORIG),0)
$(info ************ EMSCRIPTEN : SUBMODULE     = 1 ************)

EMSCRIPTEN_ROOT:=$(CURRENT_ROOT)/../emscripten
else
$(info ************ EMSCRIPTEN : SUBMODULE     = 0 ************)
endif

CXX = $(EMSCRIPTEN_ROOT)/em++
CC  = $(EMSCRIPTEN_ROOT)/emcc

BUILD_FOLDER = $(CURRENT_ROOT)/build/
EXTENSION = .js
GLOBAL =

ifeq ($(DEB),1)
$(info ************ EMSCRIPTEN : DEBUG         = 1 ************)

GLOBAL += EMCC_DEBUG=1

CFLAGS = -s OPT_LEVEL=1 -s DEBUG_LEVEL=1 -s CL_PRINT_TRACE=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s CL_DEBUG=1 -s CL_GRAB_TRACE=1 -s CL_CHECK_VALID_OBJECT=1
else
$(info ************ EMSCRIPTEN : DEBUG         = 0 ************)

CFLAGS = -s OPT_LEVEL=3 -s DEBUG_LEVEL=0 -s CL_PRINT_TRACE=0 -s DISABLE_EXCEPTION_CATCHING=0 -s WARN_ON_UNDEFINED_SYMBOLS=1 -s CL_DEBUG=0 -s CL_GRAB_TRACE=0 -s CL_CHECK_VALID_OBJECT=0
endif

ifeq ($(VAL),1)
$(info ************ EMSCRIPTEN : VALIDATOR     = 1 ************)

PREFIX = val_

CFLAGS += -s CL_VALIDATOR=1
else
$(info ************ EMSCRIPTEN : VALIDATOR     = 0 ************)
endif

ifeq ($(FAST),1)
$(info ************ EMSCRIPTEN : FAST_COMPILER = 1 ************)

GLOBAL += EMCC_FAST_COMPILER=1
else
$(info ************ EMSCRIPTEN : FAST_COMPILER = 0 ************)
endif

endif

SOURCES_imagecopy		=	image_copy.cpp
SOURCES_eventprofiling	=	event_profiling.cpp
SOURCES_dxtcompressor	=	./common/src/oclUtils.cpp ./shared/src/cmd_arg_reader.cpp ./shared/src/shrUtils.cpp block.cpp DXTCompressor.cpp
SOURCES_particles		=	cll.cpp main.cpp part2.cpp util.cpp
SOURCES_attractor		=	src/Application.cpp src/Demo.cpp src/error.cpp src/global.cpp src/gltools.cpp src/LorenzAttractorDemo.cpp src/LorenzAttractorOpenCLSolver.cpp src/main.cpp src/Solver.cpp
SOURCES_fluids			= 	cl-helper.c main.c

INCLUDES_dxtcompressor 	= 	-I./common/inc -I./shared/inc
INCLUDES_particles		=	-I$(EMSCRIPTEN_ROOT)/system/include/
INCLUDES_attractor		=	-I./ -I$(EMSCRIPTEN_ROOT)/system/include/
INCLUDES_fluids			=	-I./ -I$(EMSCRIPTEN_ROOT)/system/include/

ifeq ($(NAT),0)

KERNEL_imagecopy		= 	--preload-file image_copy.cl
KERNEL_eventprofiling	= 	--preload-file event_profiling.cl
KERNEL_dxtcompressor	=	--preload-file data/lena_ref.dds --preload-file data/lena.ppm --preload-file DXTCompressor_kernel.cl
KERNEL_particles		= 	--preload-file part2.cl
KERNEL_attractor		= 	--preload-file kernel/lorenz.cl --preload-file shader/lorenz.frag --preload-file shader/lorenz.vert
KERNEL_fluids			= 	--preload-file kernels.cl

CFLAGS_eventprofiling	=	-s TOTAL_MEMORY=1024*1024*100
CFLAGS_dxtcompressor	= 	-s GL_FFP_ONLY=1 -s LEGACY_GL_EMULATION=1
CFLAGS_particles		= 	-s GL_FFP_ONLY=1 -s LEGACY_GL_EMULATION=1 -s TOTAL_MEMORY=1024*1024*256
CFLAGS_attractor		= 	-s FULL_ES2=1 -s TOTAL_MEMORY=1024*1024*256
CFLAGS_fluids			= 	-s GL_FFP_ONLY=1 -s LEGACY_GL_EMULATION=1 -s TOTAL_MEMORY=1024*1024*512

VALPARAM_dxtcompressor	=	-s CL_VAL_PARAM='["-cl-mad-enable"]'
VALPARAM_fluids			=	-s CL_VAL_PARAM='["-DNX:96","-DNY:96","-DNZ:1","-DBLOCK_SIZE:8","-DWGSIZE:1","-DBLOCK_SIZE_WITH_PAD:1"]'

else

COPY_imagecopy		= 	cp image_copy.cl $(BUILD_FOLDER) &&
COPY_eventprofiling	= 	cp event_profiling.cl $(BUILD_FOLDER) &&
COPY_dxtcompressor	=	mkdir -p $(BUILD_FOLDER)data/ && cp data/lena_ref.dds $(BUILD_FOLDER)data/ && cp data/lena.ppm $(BUILD_FOLDER)data/ && cp DXTCompressor_kernel.cl $(BUILD_FOLDER) &&
COPY_particles		= 	cp part2.cl $(BUILD_FOLDER) &&
COPY_attractor		=	mkdir -p $(BUILD_FOLDER)kernel/ && mkdir -p $(BUILD_FOLDER)shader/ && cp kernel/lorenz.cl $(BUILD_FOLDER)kernel/ && cp shader/lorenz_nat.frag $(BUILD_FOLDER)shader/lorenz.frag && cp shader/lorenz_nat.vert $(BUILD_FOLDER)shader/lorenz.vert &&
COPY_fluids			= 	cp kernels.cl $(BUILD_FOLDER) &&

endif

.PHONY:    
	all clean

all: \
	all_1 all_2 all_3

all_1: \
	imagecopy_sample dxt_sample

all_2: \
	eventprofiling_sample particles_sample

all_3: \
	attractor_sample fluids_sample

imagecopy_sample:
	$(call chdir,imagecopy/)
	$(COPY_imagecopy) 		$(GLOBAL) $(CXX) 	$(CFLAGS) $(CFLAGS_imagecopy)		$(SOURCES_imagecopy) 		$(KERNEL_imagecopy) -o $(BUILD_FOLDER)$(PREFIX)imagecopy$(EXTENSION) 
 
eventprofiling_sample:
	$(call chdir,eventprofiling/)
	$(COPY_eventprofiling) 	$(GLOBAL) $(CXX) 	$(CFLAGS) $(CFLAGS_eventprofiling)	$(SOURCES_eventprofiling)	$(KERNEL_eventprofiling) -o $(BUILD_FOLDER)$(PREFIX)eventprofiling$(EXTENSION) 

dxt_sample:
	$(call chdir,dxtcompressor/)
	$(COPY_dxtcompressor) 	$(GLOBAL) $(CXX) 	$(CFLAGS) $(CFLAGS_dxtcompressor) 	$(SOURCES_dxtcompressor) 	$(KERNEL_dxtcompressor) $(INCLUDES_dxtcompressor) $(VALPARAM_dxtcompressor) -o $(BUILD_FOLDER)$(PREFIX)dxtcompressor$(EXTENSION) 

particles_sample:
	$(call chdir,particles/)
	$(COPY_particles) 		$(GLOBAL) $(CXX) 	$(CFLAGS) $(CFLAGS_particles) 		$(SOURCES_particles) 		$(KERNEL_particles) $(INCLUDES_particles) -o $(BUILD_FOLDER)$(PREFIX)particles$(EXTENSION) 

attractor_sample:
	$(call chdir,attractor/)
	$(COPY_attractor) 		$(GLOBAL) $(CXX) 	$(CFLAGS) $(CFLAGS_attractor) 		$(SOURCES_attractor) 		$(KERNEL_attractor) $(INCLUDES_attractor) -o $(BUILD_FOLDER)$(PREFIX)attractor$(EXTENSION) 

fluids_sample:
	$(call chdir,fluids/)
	$(COPY_fluids) 			$(GLOBAL) $(CC) 	$(CFLAGS) $(CFLAGS_fluids) 			$(SOURCES_fluids) 			$(KERNEL_fluids) $(INCLUDES_fluids) $(VALPARAM_fluids) -o $(BUILD_FOLDER)$(PREFIX)fluids$(EXTENSION) 


clean:
	rm -rf bin/
	mkdir bin/
	mkdir tmp/
	cp js/memoryprofiler.js tmp/ && cp js/settings.js tmp/ && cp js/index.html tmp/
	rm -rf js/
	mkdir js/
	cp tmp/memoryprofiler.js js/ && cp tmp/settings.js js/ && cp tmp/index.html js/
	rm -rf tmp/
	../emscripten/emcc --clear-cache

	









