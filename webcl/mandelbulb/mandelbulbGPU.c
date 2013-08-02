/*
Copyright (c) 2009 David Bucciarelli (davibu@interfree.it)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

This code is based on Keenan Crane's qjulia available at http://www.cs.caltech.edu/~keenan/project_qjulia.html
The idea of Ambient Occlusion and Mandelbulb comes from Tom Beddard's http://www.subblue.com/blog/2009/9/20/quaternion_julia
and Enforcer's http://www.fractalforums.com/mandelbulb-implementation/realtime-renderingoptimisations/
*/

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>
#include <math.h>

// Jens's patch for MacOS
#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/cl.h>
#endif

#include "displayfunc.h"

/* Options */
static int useCPU = 0;
static int useGPU = 1;

/* OpenCL variables */
static cl_context context;
static cl_device_id *devices = NULL;
static cl_mem pixelBuffer;
static cl_mem configBuffer;
static cl_command_queue commandQueue;
static cl_program program;
static cl_kernel kernel;
static unsigned int workGroupSize = 1;
static char *kernelFileName = "mandelbulb_kernel.cl";

static void FreeBuffers() {
	cl_int status = clReleaseMemObject(pixelBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to release OpenCL pixel buffer: %d\n", status);
		exit(-1);
    }

	status = clReleaseMemObject(configBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to release OpenCL config buffer: %d\n", status);
		exit(-1);
	}

	free(pixels);
}

static void AllocateBuffers() {
	const int pixelCount = config.width * config.height;
	pixels = (float *)malloc(3 * sizeof(float) * pixelCount);

	cl_int status;
	cl_uint sizeBytes = 3 * sizeof(float) * pixelCount;
    pixelBuffer = clCreateBuffer(
            context,
            CL_MEM_READ_WRITE | CL_MEM_COPY_HOST_PTR,
            sizeBytes,
            pixels,
            &status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to create OpenCL pixel buffer: %d\n", status);
		exit(-1);
    }

	sizeBytes = sizeof(RenderingConfig);
	configBuffer = clCreateBuffer(
			context,
			CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR,
			sizeBytes,
			&config,
			&status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to create OpenCL output buffer: %d\n", status);
		exit(-1);
	}
}

static char *ReadSources(const char *fileName) {
	FILE *file = fopen(fileName, "r");
	if (!file) {
		fprintf(stderr, "Failed to open file '%s'\n", fileName);
		exit(-1);
	}

	if (fseek(file, 0, SEEK_END)) {
		fprintf(stderr, "Failed to seek file '%s'\n", fileName);
		exit(-1);
	}

	long size = ftell(file);
	if (size == 0) {
		fprintf(stderr, "Failed to check position on file '%s'\n", fileName);
		exit(-1);
	}

	rewind(file);

	char *src = (char *)malloc(sizeof(char) * size + 1);
	if (!src) {
		fprintf(stderr, "Failed to allocate memory for file '%s'\n", fileName);
		exit(-1);
	}

	fprintf(stderr, "Reading file '%s' (size %ld bytes)\n", fileName, size);
	size_t res = fread(src, 1, sizeof(char) * size, file);
	if (res != sizeof(char) * size) {
		fprintf(stderr, "Failed to read file '%s' (read %ld)\n", fileName, res);
		exit(-1);
	}
	src[size] = '\0'; /* NULL terminated */

	fclose(file);

	return src;

}

static void SetUpOpenCL() {
	cl_device_type dType;
	if (useCPU) {
		if (useGPU)
			dType = CL_DEVICE_TYPE_ALL;
		else
			dType = CL_DEVICE_TYPE_CPU;
	} else {
		if (useGPU)
			dType = CL_DEVICE_TYPE_GPU;
		else
			dType = CL_DEVICE_TYPE_DEFAULT;
	}

    cl_uint numPlatforms;
	cl_platform_id platform = NULL;
	cl_int status = clGetPlatformIDs(0, NULL, &numPlatforms);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to get OpenCL platforms\n");
		exit(-1);
	}

	if (numPlatforms > 0) {
		cl_platform_id *platforms = (cl_platform_id *)malloc(sizeof(cl_platform_id) * numPlatforms);
		status = clGetPlatformIDs(numPlatforms, platforms, NULL);
			if (status != CL_SUCCESS) {
			fprintf(stderr, "Failed to get OpenCL platform IDs\n");
			exit(-1);
		}

		unsigned int i;
		for (i = 0; i < numPlatforms; ++i) {
			char pbuf[100];
			status = clGetPlatformInfo(platforms[i],
					CL_PLATFORM_VENDOR,
					sizeof(pbuf),
					pbuf,
					NULL);

			status = clGetPlatformIDs(numPlatforms, platforms, NULL);
			if (status != CL_SUCCESS) {
				fprintf(stderr, "Failed to get OpenCL platform IDs\n");
				exit(-1);
			}

			fprintf(stderr, "OpenCL Platform %d: %s\n", i, pbuf);
		}

		platform = platforms[0];
		free(platforms);
	}

	cl_context_properties cps[3] ={
		CL_CONTEXT_PLATFORM,
		(cl_context_properties) platform,
		0
	};

	cl_context_properties *cprops = (NULL == platform) ? NULL : cps;

	context = clCreateContextFromType(
			cprops,
			dType,
			NULL,
			NULL,
			&status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to open OpenCL context\n");
		exit(-1);
	}

    /* Get the size of device list data */
	size_t deviceListSize;
    status = clGetContextInfo(
			context,
            CL_CONTEXT_DEVICES,
            0,
            NULL,
            &deviceListSize);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to get OpenCL context info size: %d\n", status);
		exit(-1);
	}

    devices = (cl_device_id *)malloc(deviceListSize);
    if (devices == NULL) {
		fprintf(stderr, "Failed to allocate memory for OpenCL device list: %d\n", status);
		exit(-1);
    }

    /* Get the device list data */
    status = clGetContextInfo(
            context,
            CL_CONTEXT_DEVICES,
            deviceListSize,
            devices,
            NULL);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to get OpenCL context info: %d\n", status);
		exit(-1);
    }

	/* Print devices list */
	unsigned int i;
	for (i = 0; i < deviceListSize / sizeof(cl_device_id); ++i) {
		cl_device_type type = 0;
		status = clGetDeviceInfo(devices[i],
				CL_DEVICE_TYPE,
				sizeof(cl_device_type),
				&type,
				NULL);
		if (status != CL_SUCCESS) {
			fprintf(stderr, "Failed to get OpenCL device info: %d\n", status);
			exit(-1);
		}

		char *stype;
		switch (type) {
			case CL_DEVICE_TYPE_ALL:
				stype = "TYPE_ALL";
				break;
			case CL_DEVICE_TYPE_DEFAULT:
				stype = "TYPE_DEFAULT";
				break;
			case CL_DEVICE_TYPE_CPU:
				stype = "TYPE_CPU";
				break;
			case CL_DEVICE_TYPE_GPU:
				stype = "TYPE_GPU";
				break;
			default:
				stype = "TYPE_UNKNOWN";
				break;
		}
		fprintf(stderr, "OpenCL Device %d: Type = %s\n", i, stype);

		char buf[256];
		status = clGetDeviceInfo(devices[i],
				CL_DEVICE_NAME,
				sizeof(char[256]),
				&buf,
				NULL);
		if (status != CL_SUCCESS) {
			fprintf(stderr, "Failed to get OpenCL device info: %d\n", status);
			exit(-1);
		}

		fprintf(stderr, "OpenCL Device %d: Name = %s\n", i, buf);

		cl_uint units = 0;
		status = clGetDeviceInfo(devices[i],
				CL_DEVICE_MAX_COMPUTE_UNITS,
				sizeof(cl_uint),
				&units,
				NULL);
		if (status != CL_SUCCESS) {
			fprintf(stderr, "Failed to get OpenCL device info: %d\n", status);
			exit(-1);
		}

		fprintf(stderr, "OpenCL Device %d: Compute units = %u\n", i, units);

		size_t gsize = 0;
		status = clGetDeviceInfo(devices[i],
				CL_DEVICE_MAX_WORK_GROUP_SIZE,
				sizeof(size_t),
				&gsize,
				NULL);
		if (status != CL_SUCCESS) {
			fprintf(stderr, "Failed to get OpenCL device info: %d\n", status);
			exit(-1);
		}

		fprintf(stderr, "OpenCL Device %d: Max. work group size = %d\n", i, (unsigned int)gsize);
	}

	cl_command_queue_properties prop = 0;
	commandQueue = clCreateCommandQueue(
			context,
			devices[0],
			prop,
			&status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to create OpenCL command queue: %d\n", status);
		exit(-1);
    }

	/*------------------------------------------------------------------------*/

	AllocateBuffers();

	/*------------------------------------------------------------------------*/

	/* Create the kernel program */
	const char *sources = ReadSources(kernelFileName);
	program = clCreateProgramWithSource(
        context,
        1,
        &sources,
        NULL,
        &status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to open OpenCL kernel sources: %d\n", status);
		exit(-1);
    }

	status = clBuildProgram(program, 1, devices, "-I.", NULL, NULL);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to build OpenCL kernel: %d\n", status);

        size_t retValSize;
		status = clGetProgramBuildInfo(
				program,
				devices[0],
				CL_PROGRAM_BUILD_LOG,
				0,
				NULL,
				&retValSize);
        if (status != CL_SUCCESS) {
            fprintf(stderr, "Failed to get OpenCL kernel info size: %d\n", status);
			exit(-1);
		}

        char *buildLog = (char *)malloc(retValSize + 1);
        status = clGetProgramBuildInfo(
				program,
				devices[0],
				CL_PROGRAM_BUILD_LOG,
				retValSize,
				buildLog,
				NULL);
		if (status != CL_SUCCESS) {
            fprintf(stderr, "Failed to get OpenCL kernel info: %d\n", status);
			exit(-1);
		}
        buildLog[retValSize] = '\0';

		fprintf(stderr, "OpenCL Programm Build Log: %s\n", buildLog);
		exit(-1);
    }

	kernel = clCreateKernel(program, "MandelbulbGPU", &status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to create OpenCL kernel: %d\n", status);
		exit(-1);
    }

	// LordCRC's patch for better workGroupSize
	size_t gsize = 0;
	status = clGetKernelWorkGroupInfo(kernel,
			devices[0],
			CL_KERNEL_WORK_GROUP_SIZE,
			sizeof(size_t),
			&gsize,
			NULL);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to get OpenCL kernel work group size info: %d\n", status);
		exit(-1);
	}

	workGroupSize = (unsigned int) gsize;
	fprintf(stderr, "OpenCL Device 0: kernel work group size = %d\n", workGroupSize);
}

static void SetEnableAccumulationKernelArg(const int enableAccumulation, const float x, const float y) {
	cl_int status = clSetKernelArg(
		kernel,
		2,
		sizeof(int),
		(void *)&(enableAccumulation));
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #2: %d\n", status);
		exit(-1);
	}

	status = clSetKernelArg(
		kernel,
		3,
		sizeof(float),
		(void *)&(x));
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #3: %d\n", status);
		exit(-1);
	}

	status = clSetKernelArg(
		kernel,
		4,
		sizeof(float),
		(void *)&(y));
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #4: %d\n", status);
		exit(-1);
	}
}

static void ExecuteKernel() {
	/* Enqueue a kernel run call */
	cl_event event;
	size_t globalThreads[1];
	globalThreads[0] = config.width * config.height;
	if (globalThreads[0] % workGroupSize != 0)
		globalThreads[0] = (globalThreads[0] / workGroupSize + 1) * workGroupSize;
	size_t localThreads[1];
	localThreads[0] = workGroupSize;

	if (!config.actvateFastRendering && (config.superSamplingSize > 1)) {
		int x, y;
		for (y = 0; y < config.superSamplingSize; ++y) {
			for (x = 0; x < config.superSamplingSize; ++x) {
				const float sampleX = (x + 0.5f) / config.superSamplingSize;
				const float sampleY = (y + 0.5f) / config.superSamplingSize;

				if ((x == 0) && (y == 0)) {
					// First pass
					SetEnableAccumulationKernelArg(0, sampleX, sampleY);

					cl_int status = clEnqueueNDRangeKernel(
							commandQueue,
							kernel,
							1,
							NULL,
							globalThreads,
							localThreads,
							0,
							NULL,
							NULL);
					if (status != CL_SUCCESS) {
						fprintf(stderr, "Failed to enqueue OpenCL work: %d\n", status);
						exit(-1);
					}
				} else if ((x == config.superSamplingSize - 1) && (y == config.superSamplingSize - 1)) {
					// Last pass
					SetEnableAccumulationKernelArg(1, sampleX, sampleY);
					cl_int status = clEnqueueNDRangeKernel(
							commandQueue,
							kernel,
							1,
							NULL,
							globalThreads,
							localThreads,
							0,
							NULL,
							&event);
					if (status != CL_SUCCESS) {
						fprintf(stderr, "Failed to enqueue OpenCL work: %d\n", status);
						exit(-1);
					}

					/* Wait for the kernel call to finish execution */
          /*
					status = clWaitForEvents(1, &event);
					if (status != CL_SUCCESS) {
						fprintf(stderr, "Failed to wait the end of OpenCL execution: %d\n", status);
						exit(-1);
					}
					clReleaseEvent(event);
          */
          clFinish(commandQueue);
				} else {
					SetEnableAccumulationKernelArg(1, sampleX, sampleY);

					cl_int status = clEnqueueNDRangeKernel(
							commandQueue,
							kernel,
							1,
							NULL,
							globalThreads,
							localThreads,
							0,
							NULL,
							NULL);
					if (status != CL_SUCCESS) {
						fprintf(stderr, "Failed to enqueue OpenCL work: %d\n", status);
						exit(-1);
					}
				}
			}
		}
	} else {
		SetEnableAccumulationKernelArg(0, 0.f, 0.f);
		cl_int status = clEnqueueNDRangeKernel(
				commandQueue,
				kernel,
				1,
				NULL,
				globalThreads,
				localThreads,
				0,
				NULL,
				&event);
		if (status != CL_SUCCESS) {
			fprintf(stderr, "Failed to enqueue OpenCL work: %d\n", status);
			exit(-1);
		}

		/* Wait for the kernel call to finish execution */
    /*
		status = clWaitForEvents(1, &event);
		if (status != CL_SUCCESS) {
			fprintf(stderr, "Failed to wait the end of OpenCL execution: %d\n", status);
			exit(-1);
		}
		clReleaseEvent(event);
    */
    clFinish(commandQueue);
	}
}

void UpdateRendering() {
	double startTime = WallClockTime();

	/* Set kernel arguments */
	cl_int 	status = clSetKernelArg(
			kernel,
			0,
			sizeof(cl_mem),
			(void *)&pixelBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #1: %d\n", status);
		exit(-1);
	}

	status = clSetKernelArg(
			kernel,
			1,
			sizeof(cl_mem),
			(void *)&configBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #2: %d\n", status);
		exit(-1);
	}

	//--------------------------------------------------------------------------

	ExecuteKernel();

	//--------------------------------------------------------------------------

	/* Enqueue readBuffer */
	cl_event event;
	status = clEnqueueReadBuffer(
			commandQueue,
			pixelBuffer,
			CL_TRUE,
			0,
			3 * config.width * config.height * sizeof(float),
			pixels,
			0,
			NULL,
			&event);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to read the OpenCL pixel buffer: %d\n", status);
		exit(-1);
	}

	/* Wait for read buffer to finish execution */
  /*
	status = clWaitForEvents(1, &event);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to wait the read of OpenCL pixel buffer: %d\n", status);
		exit(-1);
	}
	clReleaseEvent(event);
  */
  clFinish(commandQueue);

	if (!config.actvateFastRendering && (config.superSamplingSize > 1)) {
		// I have to normalize values. I could do this with a GPU kernel too.
		unsigned int i;
		const float invSampleCount = 1.f / (config.superSamplingSize * config.superSamplingSize);
		for (i = 0; i < 3 * config.width * config.height; ++i)
			pixels[i] *= invSampleCount;
	}

	/*------------------------------------------------------------------------*/

	const double elapsedTime = WallClockTime() - startTime;
	double sampleSec = config.height * config.width / elapsedTime;
	if (!config.actvateFastRendering && (config.superSamplingSize > 1))
		sampleSec *= config.superSamplingSize * config.superSamplingSize;
	sprintf(captionBuffer, "Rendering time %.3f sec - Sample/sec %.1fK", elapsedTime, sampleSec /1024.f);
}

void ReInit(const int reallocBuffers) {
	// Check if I have to reallocate buffers
	if (reallocBuffers) {
		FreeBuffers();
		UpdateCamera();
		AllocateBuffers();
	} else {
		UpdateCamera();

		/* Enqueue writeBuffer */
		cl_event event;
		cl_int status = clEnqueueWriteBuffer(
				commandQueue,
				configBuffer,
				CL_TRUE,
				0,
				sizeof(RenderingConfig),
				&config,
				0,
				NULL,
				&event);
		if (status != CL_SUCCESS) {
			fprintf(stderr, "Failed to write the OpenCL camera buffer: %d\n", status);
			exit(-1);
		}

		/* Wait for read buffer to finish execution */
    /*
		status = clWaitForEvents(1, &event);
		if (status != CL_SUCCESS) {
			fprintf(stderr, "Failed to wait the read of OpenCL camera buffer: %d\n", status);
			exit(-1);
		}
		clReleaseEvent(event);
    */
    clFinish(commandQueue);
	}

}

int main(int argc, char *argv[]) {
	fprintf(stderr, "Usage: %s\n", argv[0]);
	fprintf(stderr, "Usage: %s <use CPU device (0 or 1)> <use GPU device (0 or 1)> <kernel file name> <window width> <window height>\n", argv[0]);

	config.width = 512;
	config.height = 512;
	config.enableShadow = 1;
	config.superSamplingSize = 2;

	config.actvateFastRendering = 1;
	config.maxIterations = 6;
	config.epsilon = 0.001f ;

	config.light[0] = 5.f;
	config.light[1] = 10.f;
	config.light[2] = 15.f;

	config.mu[0] = -0.188f;
	config.mu[1] = 0.413f;
	config.mu[2] = -0.263f;
	config.mu[3] = 0.6f;

  /*
	if (argc == 6) {
		useCPU = atoi(argv[1]);
		useGPU = atoi(argv[2]);
		kernelFileName = argv[3];

		config.width = atoi(argv[4]);
		config.height = atoi(argv[5]);
	} else if (argc == 1) {
		// Nothing
	} else
		exit(-1);
  */
  
	vinit(config.camera.orig, 1.f, 2.f, 8.f);
	vinit(config.camera.target, 0.f, 0.f, 0.f);

	UpdateCamera();

	/*------------------------------------------------------------------------*/

	SetUpOpenCL();

	/*------------------------------------------------------------------------*/

	InitGlut(argc, argv, "MadelbulbGPU V1.0 (Written by David Bucciarelli)");

    glutMainLoop();

	return 0;
}
