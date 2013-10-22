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

#include "renderconfig.h"

RenderConfig::RenderConfig(const string &sceneFileName, const unsigned int w,
		const unsigned int h, const bool useCPUs, const bool useGPUs,
		const unsigned int forceGPUWorkSize) :
		selectedDevice(0), width(w), height(h), currentSample(0)/*,
		threadStartBarrier(NULL), threadEndBarrier(NULL)*/ {
	captionBuffer[0] = 0;
	renderDevicesPerfIndex.resize(renderDevices.size(), 1.f);

	ReadScene(sceneFileName.c_str());
	SetUpOpenCL(useCPUs, useGPUs, forceGPUWorkSize);

	// Do the profiling only if there is more than 1 device
	workLoadProfiling = (renderDevices.size() > 1);
	timeFirstWorkloadUpdate = WallClockTime();
}

RenderConfig::~RenderConfig() {
	for (size_t i = 0; i < renderDevices.size(); ++i)
		delete renderDevices[i];

	delete pixels;
	delete camera;
	delete spheres;

	/*
	if (threadStartBarrier)
		delete threadStartBarrier;
	if (threadEndBarrier)
		delete threadEndBarrier;
	*/
}

void RenderConfig::ReadScene(const char *fileName) {
	fprintf(stderr, "Reading scene: %s\n", fileName);

	FILE *f = fopen(fileName, "r");
	if (!f) {
		fprintf(stderr, "Failed to open file: %s\n", fileName);
		exit(-1);
	}

	/* Read the camera position */
	camera = new Camera();
	int c = fscanf(f, "camera %f %f %f  %f %f %f\n",
			&camera->orig.x, &camera->orig.y, &camera->orig.z,
			&camera->target.x, &camera->target.y, &camera->target.z);
	if (c != 6) {
		fprintf(stderr, "Failed to read 6 camera parameters: %d\n", c);
		exit(-1);
	}

	/* Read the sphere count */
	c = fscanf(f, "size %u\n", &sphereCount);
	if (c != 1) {
		fprintf(stderr, "Failed to read sphere count: %d\n", c);
		exit(-1);
	}
	fprintf(stderr, "Scene size: %d\n", sphereCount);

	/* Read all spheres */
	spheres = new Sphere[sphereCount];
	unsigned int i;
	for (i = 0; i < sphereCount; i++) {
		Sphere *s = &spheres[i];
		int mat;
		int c = fscanf(f, "sphere %f  %f %f %f  %f %f %f  %f %f %f  %d\n",
				&s->rad,
				&s->p.x, &s->p.y, &s->p.z,
				&s->e.x, &s->e.y, &s->e.z,
				&s->c.x, &s->c.y, &s->c.z,
				&mat);
		switch (mat) {
			case 0:
				s->refl = DIFF;
				break;
			case 1:
				s->refl = SPEC;
				break;
			case 2:
				s->refl = REFR;
				break;
			default:
				fprintf(stderr, "Failed to read material type for sphere #%d: %d\n", i, mat);
				exit(-1);
				break;
		}
		if (c != 11) {
			fprintf(stderr, "Failed to read sphere #%d: %d\n", i, c);
			exit(-1);
		}
	}

	fclose(f);
}

void RenderConfig::SetUpOpenCL(const bool useCPUs, const bool useGPUs,
		const unsigned int forceGPUWorkSize) {
	// Platform info
	VECTOR_CLASS<cl::Platform> platforms;
	cl::Platform::get(&platforms);
	for (size_t i = 0; i < platforms.size(); ++i)
		cerr << "OpenCL Platform " << i << ": " <<
			platforms[i].getInfo<CL_PLATFORM_VENDOR>().c_str() << endl;

	if (platforms.size() == 0)
		throw runtime_error("Unable to find an appropiate OpenCL platform");

	// Just use the first platform available
	cl::Platform platform = platforms[0];

	// Get the list of devices available on the platform
	VECTOR_CLASS<cl::Device> devices;
	platform.getDevices(CL_DEVICE_TYPE_ALL, &devices);

	// Device info
	VECTOR_CLASS<cl::Device> selectedDevices;
	for (size_t i = 0; i < devices.size(); ++i) {
		cl_int type = devices[i].getInfo<CL_DEVICE_TYPE>();
		cerr << "OpenCL Device name " << i << ": " <<
				devices[i].getInfo<CL_DEVICE_NAME>().c_str() << endl;

		string stype;
		switch (type) {
			case CL_DEVICE_TYPE_ALL:
				stype = "TYPE_ALL";
				break;
			case CL_DEVICE_TYPE_DEFAULT:
				stype = "TYPE_DEFAULT";
				break;
			case CL_DEVICE_TYPE_CPU:
				stype = "TYPE_CPU";
				if (useCPUs)
					selectedDevices.push_back(devices[i]);
				break;
			case CL_DEVICE_TYPE_GPU:
				stype = "TYPE_GPU";
				if (useGPUs)
					selectedDevices.push_back(devices[i]);
				break;
			default:
				stype = "TYPE_UNKNOWN";
				break;
		}

		cerr << "OpenCL Device type " << i << ": " << stype << endl;
		cerr << "OpenCL Device units " << i << ": " <<
				devices[i].getInfo<CL_DEVICE_MAX_COMPUTE_UNITS>() << endl;
	}

	if (selectedDevices.size() == 0)
		throw runtime_error("Unable to find an appropiate OpenCL device");
	else {
		// Allocate devices
		//threadStartBarrier = new boost::barrier(selectedDevices.size() + 1);
		//threadEndBarrier = new boost::barrier(selectedDevices.size() + 1);

		for (size_t i = 0; i < selectedDevices.size(); ++i) {
			renderDevices.push_back(new RenderDevice(
				selectedDevices[i], "rendering_kernel.cl", forceGPUWorkSize,
				camera, spheres, sphereCount/*,
				threadStartBarrier, threadEndBarrier*/));
		}

		cerr << "OpenCL Device used: ";
		for (size_t i = 0; i < renderDevices.size(); ++i)
			cerr << "[" << renderDevices[i]->GetName() << "]";
		cerr << endl;
	}

	pixels = new unsigned int[width * height];
	// Test colors
	for (size_t i = 0; i < width * height; ++i)
		pixels[i] = i;

	UpdateDeviceWorkload(true);
	ReInitScene();
	ReInit(false);
}
