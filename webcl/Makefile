#
#  Makefile
#  Licence : https://github.com/wolfviking0/webcl-translator/blob/master/LICENSE
#
#  Created by Anthony Liot.
#  Copyright (c) 2013 Anthony Liot. All rights reserved.
#

# Default parameter
DEB  		= 0
VAL  		= 0
NAT  		= 0
ORIG 		= 0
FAST 		= 1
NODEJS 	= 0

# Chdir function
CHDIR_SHELL := $(SHELL)
define chdir
   $(eval _D=$(firstword $(1) $(@D)))
   $(info $(MAKE): cd $(_D)) $(eval SHELL = cd $(_D); $(CHDIR_SHELL))
endef

# Current Folder
CURRENT_ROOT:=$(PWD)

# Emscripten Folder
EMSCRIPTEN_ROOT:=$(CURRENT_ROOT)/../emscripten

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
ifeq ($(ORIG),1)
$(info ************ EMSCRIPTEN : SUBMODULE     = 0 ************)

EMSCRIPTEN_ROOT:=$(CURRENT_ROOT)/../../emscripten
else
$(info ************ EMSCRIPTEN : SUBMODULE     = 1 ************)
endif

CXX = $(EMSCRIPTEN_ROOT)/em++
CC  = $(EMSCRIPTEN_ROOT)/emcc

PRELOAD_FILE = --preload-file
BUILD_FOLDER = $(CURRENT_ROOT)/js/
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

ifeq ($(NODEJS),1)
$(info ************ EMSCRIPTEN : NODE JS       = 1 ************)

PREFIX = node_

PRELOAD_FILE = --embed-file

else
$(info ************ EMSCRIPTEN : NODE JS       = 0 ************)
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


SOURCES_imagecopy				=	image_copy.cpp
SOURCES_eventprofiling	=	event_profiling.cpp
SOURCES_dxtcompressor		=	./common/src/oclUtils.cpp ./shared/src/cmd_arg_reader.cpp ./shared/src/shrUtils.cpp block.cpp DXTCompressor.cpp
SOURCES_particles				=	cll.cpp main.cpp part2.cpp util.cpp
SOURCES_attractor				=	src/Application.cpp src/Demo.cpp src/error.cpp src/global.cpp src/gltools.cpp src/LorenzAttractorDemo.cpp src/LorenzAttractorOpenCLSolver.cpp src/main.cpp src/Solver.cpp
SOURCES_fluids					= 	cl-helper.c main.c
SOURCES_sakura					= src/utils/ResourceLoader.cpp src/core/Camera.cpp src/core/Drawable.cpp src/core/ObjParser.cpp src/core/ShaderLoader.cpp src/app/CLParticleSystem.cpp src/app/ParticlePrototype.cpp src/app/PetalView.cpp src/app/ShaderPlane.cpp src/main.cpp kazmath/aabb.c kazmath/GL/mat4stack.c kazmath/GL/matrix.c kazmath/mat3.c kazmath/mat4.c kazmath/plane.c kazmath/quaternion.c kazmath/ray2.c kazmath/ray3.c kazmath/utility.c kazmath/vec2.c kazmath/vec3.c kazmath/vec4.c

INCLUDES_imagecopy			=	-I./
INCLUDES_eventprofiling	=	-I./
INCLUDES_dxtcompressor 	= 	-I./common/inc -I./shared/inc
INCLUDES_particles			=	-I$(EMSCRIPTEN_ROOT)/system/include/
INCLUDES_attractor			=	-I./ -I$(EMSCRIPTEN_ROOT)/system/include/
INCLUDES_fluids					=	-I./ -I$(EMSCRIPTEN_ROOT)/system/include/
INCLUDES_sakura					=	-I./ -I./kazmath/ -I./kazmath/GL/ -I./src/ -I./src/core/ -I./src/app/ -I./src/utils/ -I$(EMSCRIPTEN_ROOT)/system/include/

ifeq ($(NAT),0)

KERNEL_imagecopy			= 	$(PRELOAD_FILE) image_copy.cl
KERNEL_eventprofiling	= 	$(PRELOAD_FILE) event_profiling.cl
KERNEL_dxtcompressor	=	$(PRELOAD_FILE) data/lena_ref.dds $(PRELOAD_FILE) data/lena.ppm $(PRELOAD_FILE) DXTCompressor_kernel.cl
KERNEL_particles			= 	$(PRELOAD_FILE) part2.cl
KERNEL_attractor			= 	$(PRELOAD_FILE) kernel/lorenz.cl $(PRELOAD_FILE) shader/lorenz.frag $(PRELOAD_FILE) shader/lorenz.vert
KERNEL_fluids					= 	$(PRELOAD_FILE) kernels.cl
KERNEL_sakura					= 	$(PRELOAD_FILE) res/flat_petal.mtl $(PRELOAD_FILE) res/tri_petal_normals.obj $(PRELOAD_FILE) src/kernel/kernel_petal_motion.cl $(PRELOAD_FILE) src/shaders/fs_background.h $(PRELOAD_FILE) src/shaders/fs_diffuse.h $(PRELOAD_FILE) src/shaders/vs_diffuse.h $(PRELOAD_FILE) src/shaders/vs_ndcPlane.h

CFLAGS_eventprofiling	=	-s TOTAL_MEMORY=1024*1024*100
CFLAGS_dxtcompressor	= 	-s GL_FFP_ONLY=1 -s LEGACY_GL_EMULATION=1
CFLAGS_particles			= 	-s GL_FFP_ONLY=1 -s LEGACY_GL_EMULATION=1 -s TOTAL_MEMORY=1024*1024*256
CFLAGS_attractor			= 	-s FULL_ES2=1 -s TOTAL_MEMORY=1024*1024*256 -std=c++11
CFLAGS_fluids					= 	-s GL_FFP_ONLY=1 -s LEGACY_GL_EMULATION=1 -s TOTAL_MEMORY=1024*1024*512
CFLAGS_sakura					= 	-s FULL_ES2=1 -s TOTAL_MEMORY=1024*1024*256

VALPARAM_imagecopy			=	-s CL_VAL_PARAM='[""]'
VALPARAM_eventprofiling	=	-s CL_VAL_PARAM='[""]'
VALPARAM_particles			=	-s CL_VAL_PARAM='[""]'
VALPARAM_attractor			=	-s CL_VAL_PARAM='[""]'
VALPARAM_dxtcompressor	=	-s CL_VAL_PARAM='["-cl-mad-enable"]'
VALPARAM_fluids					=	-s CL_VAL_PARAM='["-DNX:96","-DNY:96","-DNZ:1","-DBLOCK_SIZE:8","-DWGSIZE:1","-DBLOCK_SIZE_WITH_PAD:1"]'
VALPARAM_sakura					=	-s CL_VAL_PARAM='[""]'

else

CFLAGS_attractor	= 	-std=c++11

COPY_imagecopy			= 	cp image_copy.cl $(BUILD_FOLDER) &&
COPY_eventprofiling	= 	cp event_profiling.cl $(BUILD_FOLDER) &&
COPY_dxtcompressor	=	mkdir -p $(BUILD_FOLDER)data/ && cp data/lena_ref.dds $(BUILD_FOLDER)data/ && cp data/lena.ppm $(BUILD_FOLDER)data/ && cp DXTCompressor_kernel.cl $(BUILD_FOLDER) &&
COPY_particles			= 	cp part2.cl $(BUILD_FOLDER) &&
COPY_attractor			=	mkdir -p $(BUILD_FOLDER)kernel/ && mkdir -p $(BUILD_FOLDER)shader/ && cp kernel/lorenz.cl $(BUILD_FOLDER)kernel/ && cp shader/lorenz_nat.frag $(BUILD_FOLDER)shader/lorenz.frag && cp shader/lorenz_nat.vert $(BUILD_FOLDER)shader/lorenz.vert &&
COPY_fluids					= 	cp kernels.cl $(BUILD_FOLDER) &&
COPY_sakura					= 	mkdir -p $(BUILD_FOLDER)src/ && mkdir -p $(BUILD_FOLDER)src/shaders/ && mkdir -p $(BUILD_FOLDER)src/kernel/ && mkdir -p $(BUILD_FOLDER)res/ && cp res/flat_petal.mtl $(BUILD_FOLDER)res/ && cp res/tri_petal_normals.obj $(BUILD_FOLDER)res/ && cp src/kernel/kernel_petal_motion.cl $(BUILD_FOLDER)src/kernel/ && cp src/shaders/*.h $(BUILD_FOLDER)src/shaders/ &&

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
	attractor_sample fluids_sample sakura_sample

# Create build folder is necessary))
mkdir:
	mkdir -p $(BUILD_FOLDER);

imagecopy_sample: mkdir
	$(call chdir,imagecopy/)
	$(COPY_imagecopy) 			$(GLOBAL) $(CXX) 	$(CFLAGS) $(CFLAGS_imagecopy)				$(SOURCES_imagecopy) 			$(VALPARAM_imagecopy)				$(KERNEL_imagecopy) 			$(INCLUDES_imagecopy) 			-o $(BUILD_FOLDER)$(PREFIX)imagecopy$(EXTENSION)

eventprofiling_sample: mkdir
	$(call chdir,eventprofiling/)
	$(COPY_eventprofiling) 	$(GLOBAL) $(CXX) 	$(CFLAGS) $(CFLAGS_eventprofiling)	$(SOURCES_eventprofiling)	$(VALPARAM_eventprofiling)	$(KERNEL_eventprofiling) 	$(INCLUDESeventprofiling) 	-o $(BUILD_FOLDER)$(PREFIX)eventprofiling$(EXTENSION)

dxt_sample: mkdir
	$(call chdir,dxtcompressor/)
	$(COPY_dxtcompressor) 	$(GLOBAL) $(CXX) 	$(CFLAGS) $(CFLAGS_dxtcompressor) 	$(SOURCES_dxtcompressor) 	$(VALPARAM_dxtcompressor)		$(KERNEL_dxtcompressor) 	$(INCLUDES_dxtcompressor) 	-o $(BUILD_FOLDER)$(PREFIX)dxtcompressor$(EXTENSION)

particles_sample: mkdir
	$(call chdir,particles/)
	$(COPY_particles) 			$(GLOBAL) $(CXX) 	$(CFLAGS) $(CFLAGS_particles) 			$(SOURCES_particles) 			$(VALPARAM_particles) 			$(KERNEL_particles) 			$(INCLUDES_particles) 			-o $(BUILD_FOLDER)$(PREFIX)particles$(EXTENSION)

attractor_sample: mkdir
	$(call chdir,attractor/)
	$(COPY_attractor) 			$(GLOBAL) $(CXX) 	$(CFLAGS) $(CFLAGS_attractor) 			$(SOURCES_attractor) 			$(VALPARAM_attractor) 			$(KERNEL_attractor) 			$(INCLUDES_attractor) 			-o $(BUILD_FOLDER)$(PREFIX)attractor$(EXTENSION)

fluids_sample: mkdir
	$(call chdir,fluids/)
	$(COPY_fluids) 					$(GLOBAL) $(CC) 	$(CFLAGS) $(CFLAGS_fluids) 					$(SOURCES_fluids) 				$(VALPARAM_fluids) 					$(KERNEL_fluids) 					$(INCLUDES_fluids) 					-o $(BUILD_FOLDER)$(PREFIX)fluids$(EXTENSION)

sakura_sample: mkdir
	$(call chdir,sakura/)
	$(COPY_sakura) 					$(GLOBAL) $(CXX) 	$(CFLAGS) $(CFLAGS_sakura) 					$(SOURCES_sakura) 				$(VALPARAM_sakura) 					$(KERNEL_sakura) 					$(INCLUDES_sakura) 					-o $(BUILD_FOLDER)$(PREFIX)sakura$(EXTENSION)

clean:
	rm -rf bin/
	mkdir -p bin/
	mkdir -p tmp/
	cp js/memoryprofiler.js tmp/ && cp js/settings.js tmp/ && cp js/index.html tmp/
	rm -rf js/
	mkdir js/
	cp tmp/memoryprofiler.js js/ && cp tmp/settings.js js/ && cp tmp/index.html js/
	rm -rf tmp/
	$(EMSCRIPTEN_ROOT)/emcc --clear-cache
