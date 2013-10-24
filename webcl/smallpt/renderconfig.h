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

#ifndef _RENDERCONFIG_H
#define	_RENDERCONFIG_H

#include <stdio.h>
#include <stdlib.h>
#include <fstream>
#include <iostream>
#include <string>
#include <sstream>
#include <stdexcept>
#include <vector>

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
#include "renderdevice.h"

extern double WallClockTime();

using namespace std;

class RenderConfig {
public:
	RenderConfig(const string &sceneFileName, const unsigned int w,
		const unsigned int h, const bool useCPUs, const bool useGPUs,
		const unsigned int forceGPUWorkSize);
	~RenderConfig();

	void ReInitScene() {
		// Flush everything
		for (size_t i = 0; i < renderDevices.size(); ++i)
			renderDevices[i]->Finish();

		currentSample = 0;

		// Redownload the scene
		for (size_t i = 0; i < renderDevices.size(); ++i)
			renderDevices[i]->UpdateSceneBuffer(spheres);
	}

	void ReInit(const int reallocBuffers) {
		// Flush everything
		for (size_t i = 0; i < renderDevices.size(); ++i)
			renderDevices[i]->Finish();

		// Check if I have to reallocate buffers
		if (reallocBuffers) {
			delete pixels;
			pixels = new unsigned int[width * height];
			// Test colors
			for (size_t i = 0; i < width * height; ++i)
				pixels[i] = i;

			// Update devices
			UpdateDeviceWorkload(false);
		}

		UpdateCamera();

		currentSample = 0;
	}

	void Execute() {
		// Run the kernels
		if (currentSample < 20) {
			ExecuteKernels();
			currentSample++;
		} else {
			// After first 20 samples, continue to execute kernels for more and more time
			double startTime = WallClockTime();
			const float k = min(currentSample - 20u, 100u) / 100.f;
			const float tresholdTime = 0.5f * k;
			for (;;) {
				ExecuteKernels();
				currentSample++;

				const float elapsedTime = WallClockTime() - startTime;
				if (elapsedTime > tresholdTime)
					break;
			}
		}

		CheckDeviceWorkload();
	}

	void RestartWorkloadProcedure() {
		if (renderDevices.size() > 1) {
			for (size_t i = 0; i < renderDevices.size(); ++i)
				renderDevices[i]->ResetPerformance();

			UpdateDeviceWorkload(true);

			timeFirstWorkloadUpdate = WallClockTime();
			workLoadProfiling = true;
		}
	}

	const VECTOR_CLASS<RenderDevice *> &GetRenderDevice() const { return renderDevices; }

	const bool IsProfiling() const { return workLoadProfiling; }

	const double GetPerfIndex(size_t deviceIndex) const {
		return renderDevicesPerfIndex[deviceIndex];
	}

	void IncPerfIndex(const size_t deviceIndex) {
		renderDevicesPerfIndex[deviceIndex] *= 1.05;

		UpdateDeviceWorkload(false);
	}

	void DecPerfIndex(const size_t deviceIndex) {
		renderDevicesPerfIndex[deviceIndex] *= 0.95;

		UpdateDeviceWorkload(false);
	}

	unsigned int selectedDevice;
	char captionBuffer[512];

	unsigned int width, height;
	unsigned int currentSample;
	unsigned int *pixels;

	Camera *camera;
	Sphere *spheres;
	unsigned int sphereCount;
	int currentSphere;

private:
	void CheckDeviceWorkload() {
		// Check if I have to update the workload
		double t = WallClockTime();

		if (workLoadProfiling && (t - timeFirstWorkloadUpdate > 10.0)) {
			UpdateDeviceWorkload(true);
			workLoadProfiling = false;
		}
	}

	void UpdateDeviceWorkload(bool calculateNewLoad) {
		cerr << "Updating OpenCL Device workloads"<< endl;

		if (calculateNewLoad) {
			// Define how to spread the workload
			renderDevicesPerfIndex.resize(renderDevices.size(), 1.f);

			for (size_t i = 0; i < renderDevices.size(); ++i)
				renderDevicesPerfIndex[i] = renderDevices[i]->GetPerformance();
		}

		double totalPerformance = 0.0;
		for (size_t i = 0; i < renderDevices.size(); ++i)
			totalPerformance += renderDevicesPerfIndex[i];

		const unsigned int totalWorkload = width * height;

		// Set the workload for each device
		unsigned int workOffset = 0;
		for (size_t i = 0; i < renderDevices.size(); ++i) {
			const unsigned int workLeft = totalWorkload - workOffset;
			unsigned int workAmount;
			if (workLeft <= 0) {
				workOffset = totalWorkload; // After the last pixel
				workAmount = 1;
			} else {
				if (i == renderDevices.size() - 1) {
					// The last device has to complete the work
					workAmount = workLeft;
				} else
					workAmount = workLeft * renderDevicesPerfIndex[i] / totalPerformance;
			}

			renderDevices[i]->SetWorkLoad(workOffset, workAmount, width, height, pixels);

			workOffset += workAmount;
		}

		currentSample = 0;
	}

	void ExecuteKernels() {
		for (size_t i = 0; i < renderDevices.size(); ++i)
			renderDevices[i]->SetArgs(currentSample);

		// Start the rendering threads
		////threadStartBarrier->wait();

		// Wait for job done signal (any reference to Bush is not itended...)
		//threadEndBarrier->wait();
	}

	void UpdateCamera() {
		vsub(camera->dir, camera->target, camera->orig);
		vnorm(camera->dir);

		const Vec up = {0.f, 1.f, 0.f};
		const float fov = (FLOAT_PI / 180.f) * 45.f;
		vxcross(camera->x, camera->dir, up);
		vnorm(camera->x);
		vsmul(camera->x, width * fov / height, camera->x);

		vxcross(camera->y, camera->x, camera->dir);
		vnorm(camera->y);
		vsmul(camera->y, fov, camera->y);

		// Update devices
		for (size_t i = 0; i < renderDevices.size(); ++i)
			renderDevices[i]->UpdateCameraBuffer(camera);
	}

	void ReadScene(const char *fileName);

	void SetUpOpenCL(const bool useCPUs, const bool useGPUs,
		const unsigned int forceGPUWorkSize);

	// OpenCL fields
	VECTOR_CLASS<RenderDevice *> renderDevices;
	vector<double> renderDevicesPerfIndex;
	//boost::barrier *threadStartBarrier;
	//boost::barrier *threadEndBarrier;

	double timeFirstWorkloadUpdate;
	bool workLoadProfiling;
};

#endif	/* _RENDERCONFIG_H */
