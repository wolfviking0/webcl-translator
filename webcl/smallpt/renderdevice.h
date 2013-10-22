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

#ifndef _RENDERDEVICE_H
#define	_RENDERDEVICE_H

#include <iostream>
#include <string>
#include <cstdlib>

#define __CL_ENABLE_EXCEPTIONS
#define __NO_STD_VECTOR
#define __NO_STD_STRING

#if defined(__APPLE__)
#include <CL/cl.hpp>
#else
#include <CL/cl.hpp>
#endif

//#include <boost/thread/thread.hpp>
//#include <boost/thread/barrier.hpp>

#include "camera.h"
#include "geom.h"

using namespace std;

class RenderDevice {
public:
	RenderDevice(const cl::Device &dev, const string &kernelFileName,
			const unsigned int forceGPUWorkSize,
			Camera *camera, Sphere *spheres,
			const unsigned int sceneSphereCount/*,
			boost::barrier *startBarrier, boost::barrier *endBarrier*/);
	~RenderDevice();

	void SetWorkLoad(const unsigned int offset, const unsigned int amount,
		const unsigned int screenWidth,	const unsigned int screenHeght,
		unsigned int *screenPixels);

	void SetArgs(const unsigned int count) {
		currentSample = count;
	}

	void UpdateCameraBuffer(Camera *camera) {
		queue->enqueueWriteBuffer(
				*cameraBuffer,
				CL_FALSE,
				0,
				sizeof(Camera),
				camera);
	}

	void UpdateSceneBuffer(Sphere *spheres) {
		queue->enqueueWriteBuffer(
				*sphereBuffer,
				CL_FALSE,
				0,
				sizeof(Sphere) * sphereCount,
				spheres);
	}

	void ResetPerformance() {
		exeTime = 0.0;
		exeUnitCount = 0.0;
	}

	void Finish() {
		queue->finish();
	}

	double GetPerformance() const {
		return ((exeTime == 0.0) || (exeUnitCount == 0.0)) ? 1.0 : (exeUnitCount / exeTime);
	}

	const string &GetName() const { return deviceName; }
	unsigned int GetWorkOffset() const { return workOffset; }
	size_t GetWorkAmount() const { return workAmount; }

private:
	static void RenderThread(RenderDevice *renderDevice);

	string ReadSources(const string &fileName);

	void SetKernelArgs() {
		kernel->setArg(0, *colorBuffer);
		kernel->setArg(1, *seedBuffer);
		kernel->setArg(2, *sphereBuffer);
		kernel->setArg(3, *cameraBuffer);
		kernel->setArg(4, sphereCount);
		kernel->setArg(5, width);
		kernel->setArg(6, height);
		kernel->setArg(7, currentSample);
		kernel->setArg(8, *pixelBuffer);
		kernel->setArg(9, workOffset);
		kernel->setArg(10, workAmount);
	}

	void ExecuteKernel() {
		size_t w = workAmount;
		if (w % workGroupSize != 0)
			w = (w / workGroupSize + 1) * workGroupSize;

		// This release the old event too
		kernelExecutionTime = cl::Event();
		queue->enqueueNDRangeKernel(*kernel, cl::NullRange,
			cl::NDRange(w), cl::NDRange(workGroupSize),
			NULL, &kernelExecutionTime);

		exeUnitCount += workAmount;
	}

	void ReadPixelBuffer() {
		queue->enqueueReadBuffer(
				*pixelBuffer,
				CL_FALSE,
				0,
				sizeof(unsigned int) * workAmount,
				&pixels[workOffset]);
	}

	void FinishExecuteKernel() {
		kernelExecutionTime.wait();

		// Check kernel execution time
		cl_ulong t1, t2;
		kernelExecutionTime.getProfilingInfo<cl_ulong>(CL_PROFILING_COMMAND_START, &t1);
		kernelExecutionTime.getProfilingInfo<cl_ulong>(CL_PROFILING_COMMAND_END, &t2);
		exeTime += (t2 - t1) / 1e9;
	}

	string deviceName;
	// boost::thread *renderThread;
	// boost::barrier *threadStartBarrier;
	// boost::barrier *threadEndBarrier;

	cl::Context *context;
	cl::CommandQueue *queue;
	cl::Kernel *kernel;
	size_t workGroupSize;

	unsigned int workOffset;
	unsigned int workAmount;

	// Kernel args
	unsigned int sphereCount;
	unsigned int width;
	unsigned int height;
	unsigned int currentSample;

	// Buffers
	cl::Buffer *colorBuffer;
	cl::Buffer *pixelBuffer;
	cl::Buffer *seedBuffer;
	cl::Buffer *sphereBuffer;
	cl::Buffer *cameraBuffer;
	unsigned int *pixels;
	Vec *colors;
	unsigned int *seeds;

	// Execution profiling
	cl::Event kernelExecutionTime;
	double exeUnitCount;
	double exeTime;
};

#endif	/* _RENDERDEVICE_H */

