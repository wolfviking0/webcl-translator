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
*/

/*
 * Based on smallpt, a Path Tracer by Kevin Beason, 2008
 * Modified by David Bucciarelli to show the output via OpenGL/GLUT, ported
 * to C, work with float, fixed RR, ported to OpenCL, etc.
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

#include "camera.h"
#include "scene.h"
#include "displayfunc.h"

/* Options */
static int useGPU = 1;
static int forceWorkSize = 0;

/* OpenCL variables */
static cl_context context;
static cl_mem colorBuffer;
static cl_mem pixelBuffer;
static cl_mem seedBuffer;
static cl_mem sphereBuffer;
static cl_mem cameraBuffer;
static cl_command_queue commandQueue;
static cl_program program;
static cl_kernel kernel;
static unsigned int workGroupSize = 1;
static char *kernelFileName = "rendering_kernel.cl";

static Vec *colors;
static unsigned int *seeds;
Camera camera;
static int currentSample = 0;
Sphere *spheres;
unsigned int sphereCount;

static void FreeBuffers() {
	cl_int status = clReleaseMemObject(colorBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to release OpenCL color buffer: %d\n", status);
		exit(-1);
    }

	status = clReleaseMemObject(pixelBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to release OpenCL pixel buffer: %d\n", status);
		exit(-1);
    }

	status = clReleaseMemObject(seedBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to release OpenCL seed buffer: %d\n", status);
		exit(-1);
    }

	free(seeds);
	free(colors);
	free(pixels);
}

static void AllocateBuffers() {
	const int pixelCount = width * height;
	int i;
	colors = (Vec *)malloc(sizeof(Vec) * pixelCount);

	seeds = (unsigned int *)malloc(sizeof(unsigned int) * pixelCount * 2);
	for (i = 0; i < pixelCount * 2; i++) {
		seeds[i] = rand();
		if (seeds[i] < 2)
			seeds[i] = 2;
	}

	pixels = (unsigned int *)malloc(sizeof(unsigned int) * pixelCount);
	// Test colors
	for(i = 0; i < pixelCount; ++i)
		pixels[i] = i;

	cl_int status;
	cl_uint sizeBytes = sizeof(Vec) * width * height;
    colorBuffer = clCreateBuffer(
            context,
            CL_MEM_READ_WRITE,
            sizeBytes,
            NULL,
            &status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to create OpenCL output buffer: %d\n", status);
		exit(-1);
    }

	sizeBytes = sizeof(unsigned int) * width * height;
    pixelBuffer = clCreateBuffer(
            context,
            CL_MEM_WRITE_ONLY,
            sizeBytes,
            NULL,
            &status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to create OpenCL pixel buffer: %d\n", status);
		exit(-1);
    }

	sizeBytes = sizeof(unsigned int) * width * height * 2;
	seedBuffer = clCreateBuffer(
            context,
            CL_MEM_READ_WRITE,
            sizeBytes,
            NULL,
            &status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to create OpenCL seed buffer: %d\n", status);
		exit(-1);
    }
	status = clEnqueueWriteBuffer(
			commandQueue,
			seedBuffer,
			CL_TRUE,
			0,
			sizeBytes,
			seeds,
			0,
			NULL,
			NULL);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to write the OpenCL seeds buffer: %d\n", status);
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

	if (useGPU)
		dType = CL_DEVICE_TYPE_GPU;
	else
		dType = CL_DEVICE_TYPE_CPU;

	// Select the platform

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

	// Select the device

	cl_device_id devices[32];
	cl_uint deviceCount;
	status = clGetDeviceIDs(platform, CL_DEVICE_TYPE_ALL, 32, devices, &deviceCount);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to get OpenCL device IDs\n");
		exit(-1);
	}

	int deviceFound = 0;
	cl_device_id selectedDevice;
	unsigned int i;
	for (i = 0; i < deviceCount; ++i) {
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
				if (!useGPU && !deviceFound) {
					selectedDevice = devices[i];
					deviceFound = 1;
				}
				break;
			case CL_DEVICE_TYPE_GPU:
				stype = "TYPE_GPU";
				if (useGPU && !deviceFound) {
					selectedDevice = devices[i];
					deviceFound = 1;
				}
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

	if (!deviceFound) {
		fprintf(stderr, "Unable to select an appropriate device\n");
		exit(-1);
	}

	// Create the context

	cl_context_properties cps[3] = {
		CL_CONTEXT_PLATFORM,
		(cl_context_properties) platform,
		0
	};

	cl_context_properties *cprops = (NULL == platform) ? NULL : cps;
	context = clCreateContext(
			cprops,
			1,
			&selectedDevice,
			NULL,
			NULL,
			&status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to open OpenCL context\n");
		exit(-1);
	}

    /* Get the device list data */
	size_t deviceListSize;
    status = clGetContextInfo(
            context,
            CL_CONTEXT_DEVICES,
            32,
            devices,
            &deviceListSize);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to get OpenCL context info: %d\n", status);
		exit(-1);
    }

	/* Print devices list */
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
		fprintf(stderr, "[SELECTED] OpenCL Device %d: Type = %s\n", i, stype);

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

		fprintf(stderr, "[SELECTED] OpenCL Device %d: Name = %s\n", i, buf);

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

		fprintf(stderr, "[SELECTED] OpenCL Device %d: Compute units = %u\n", i, units);

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

		fprintf(stderr, "[SELECTED] OpenCL Device %d: Max. work group size = %d\n", i, (unsigned int)gsize);
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

	sphereBuffer = clCreateBuffer(
            context,
#ifdef __APPLE__
            CL_MEM_READ_WRITE, // NOTE: not READ_ONLY because of Apple's OpenCL bug
#else
			CL_MEM_READ_ONLY,
#endif
            sizeof(Sphere) * sphereCount,
            NULL,
            &status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to create OpenCL scene buffer: %d\n", status);
		exit(-1);
    }
	status = clEnqueueWriteBuffer(
			commandQueue,
			sphereBuffer,
			CL_TRUE,
			0,
			sizeof(Sphere) * sphereCount,
			spheres,
			0,
			NULL,
			NULL);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to write the OpenCL scene buffer: %d\n", status);
		exit(-1);
	}

	cameraBuffer = clCreateBuffer(
            context,
#ifdef __APPLE__
            CL_MEM_READ_WRITE, // NOTE: not READ_ONLY because of Apple's OpenCL bug
#else
			CL_MEM_READ_ONLY,
#endif
            sizeof(Camera),
            NULL,
            &status);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to create OpenCL camera buffer: %d\n", status);
		exit(-1);
    }
	status = clEnqueueWriteBuffer(
			commandQueue,
			cameraBuffer,
			CL_TRUE,
			0,
			sizeof(Camera),
			&camera,
			0,
			NULL,
			NULL);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to write the OpenCL camera buffer: %d\n", status);
		exit(-1);
	}

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

#ifdef __APPLE__
	status = clBuildProgram(program, 1, devices, "-I. -D__APPLE__", NULL, NULL);
#else
	status = clBuildProgram(program, 1, devices, "-I. ", NULL, NULL);
#endif
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

	kernel = clCreateKernel(program, "RadianceGPU", &status);
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

	if (forceWorkSize > 0) {
		fprintf(stderr, "OpenCL Device 0: forced kernel work group size = %d\n", forceWorkSize);
		workGroupSize = forceWorkSize;
	}
}

static void ExecuteKernel() {
	/* Enqueue a kernel run call */
	size_t globalThreads[1];
	globalThreads[0] = width * height;
	if (globalThreads[0] % workGroupSize != 0)
		globalThreads[0] = (globalThreads[0] / workGroupSize + 1) * workGroupSize;
	size_t localThreads[1];
	localThreads[0] = workGroupSize;

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

void UpdateRendering() {
	double startTime = WallClockTime();
	int startSampleCount = currentSample;

	/* Set kernel arguments */
	cl_int status = clSetKernelArg(
			kernel,
			0,
			sizeof(cl_mem),
			(void *)&colorBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #1: %d\n", status);
		exit(-1);
	}

	status = clSetKernelArg(
			kernel,
			1,
			sizeof(cl_mem),
			(void *)&seedBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #2: %d\n", status);
		exit(-1);
	}

	status = clSetKernelArg(
			kernel,
			2,
			sizeof(cl_mem),
			(void *)&sphereBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #3: %d\n", status);
		exit(-1);
	}

	status = clSetKernelArg(
			kernel,
			3,
			sizeof(cl_mem),
			(void *)&cameraBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #4: %d\n", status);
		exit(-1);
	}

	status = clSetKernelArg(
			kernel,
			4,
			sizeof(unsigned int),
			(void *)&sphereCount);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #5: %d\n", status);
		exit(-1);
	}

	status = clSetKernelArg(
			kernel,
			5,
			sizeof(int),
			(void *)&width);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #6: %d\n", status);
		exit(-1);
	}

	status = clSetKernelArg(
			kernel,
			6,
			sizeof(int),
			(void *)&height);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #7: %d\n", status);
		exit(-1);
	}

	status = clSetKernelArg(
			kernel,
			7,
			sizeof(int),
			(void *)&currentSample);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #8: %d\n", status);
		exit(-1);
	}

	status = clSetKernelArg(
			kernel,
			8,
			sizeof(cl_mem),
			(void *)&pixelBuffer);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set OpenCL arg. #9: %d\n", status);
		exit(-1);
	}

	//--------------------------------------------------------------------------

	if (currentSample < 20) {
		ExecuteKernel();
		currentSample++;
	} else {
		/* After first 20 samples, continue to execute kernels for more and more time */
		const float k = min(currentSample - 20, 100) / 100.f;
		const float tresholdTime = 0.5f * k;
		for (;;) {
			ExecuteKernel();
			clFinish(commandQueue);
			currentSample++;

			const float elapsedTime = WallClockTime() - startTime;
			if (elapsedTime > tresholdTime)
				break;
		}
	}

	//--------------------------------------------------------------------------

	/* Enqueue readBuffer */
	status = clEnqueueReadBuffer(
			commandQueue,
			pixelBuffer,
			CL_TRUE,
			0,
			width * height * sizeof(unsigned int),
			pixels,
			0,
			NULL,
			NULL);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to read the OpenCL pixel buffer: %d\n", status);
		exit(-1);
	}

	/*------------------------------------------------------------------------*/

	const double elapsedTime = WallClockTime() - startTime;
	const int samples = currentSample - startSampleCount;
	const double sampleSec = samples * height * width / elapsedTime;
	sprintf(captionBuffer, "Rendering time %.3f sec (pass %d)  Sample/sec  %.1fK\n",
			elapsedTime, currentSample, sampleSec / 1000.f);
}

void ReInitScene() {
	currentSample = 0;

	// Redownload the scene

	cl_int status = clEnqueueWriteBuffer(
			commandQueue,
			sphereBuffer,
			CL_TRUE,
			0,
			sizeof(Sphere) * sphereCount,
			spheres,
			0,
			NULL,
			NULL);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to write the OpenCL scene buffer: %d\n", status);
		exit(-1);
	}
}

void ReInit(const int reallocBuffers) {
	// Check if I have to reallocate buffers
	if (reallocBuffers) {
		FreeBuffers();
		UpdateCamera();
		AllocateBuffers();
	} else
		UpdateCamera();

	cl_int status = clEnqueueWriteBuffer(
			commandQueue,
			cameraBuffer,
			CL_TRUE,
			0,
			sizeof(Camera),
			&camera,
			0,
			NULL,
			NULL);
	if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to write the OpenCL camera buffer: %d\n", status);
		exit(-1);
	}

	currentSample = 0;
}

int main(int argc, char *argv[]) {
	amiSmallptCPU = 0;

	fprintf(stderr, "Usage: %s\n", argv[0]);
	fprintf(stderr, "Usage: %s <use CPU/GPU device (0=CPU or 1=GPU)> <workgroup size (0=default value or anything > 0 and power of 2)> <kernel file name> <window width> <window height> <scene file>\n", argv[0]);

	if (argc == 7) {
		useGPU = atoi(argv[1]);
		forceWorkSize = atoi(argv[2]);
		kernelFileName = argv[3];
		width = atoi(argv[4]);
		height = atoi(argv[5]);
		ReadScene(argv[6]);
	} else if (argc == 1) {
		spheres = CornellSpheres;
		sphereCount = sizeof(CornellSpheres) / sizeof(Sphere);

		vinit(camera.orig, 50.f, 45.f, 205.6f);
		vinit(camera.target, 50.f, 45 - 0.042612f, 204.6);
	} else
		exit(-1);

	UpdateCamera();

	/*------------------------------------------------------------------------*/

	SetUpOpenCL();

	/*------------------------------------------------------------------------*/

	InitGlut(argc, argv, "SmallPT GPU V1.6 (Written by David Bucciarelli)");

    glutMainLoop();

	return 0;
}
