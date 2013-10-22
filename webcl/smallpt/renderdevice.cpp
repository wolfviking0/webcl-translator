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

#include <fstream>

#include "renderdevice.h"

RenderDevice::RenderDevice(const cl::Device &device, const string &kernelFileName,
		const unsigned int forceGPUWorkSize,
		Camera *camera, Sphere *spheres, const unsigned int sceneSphereCount/*,
		boost::barrier *startBarrier, boost::barrier *endBarrier*/) :
	/*renderThread(NULL), threadStartBarrier(startBarrier), threadEndBarrier(endBarrier),*/
	sphereCount(sceneSphereCount), colorBuffer(NULL), pixelBuffer(NULL), seedBuffer(NULL),
	pixels(NULL), colors(NULL), seeds(NULL), exeUnitCount(0.0), exeTime(0.0) {
	deviceName = device.getInfo<CL_DEVICE_NAME > ().c_str();

	// Allocate a context with the selected device
	cl::Platform platform = device.getInfo<CL_DEVICE_PLATFORM>();
	VECTOR_CLASS<cl::Device> devices;
	devices.push_back(device);
	cl_context_properties cps[3] = {
		CL_CONTEXT_PLATFORM, (cl_context_properties)platform(), 0
	};
	context = new cl::Context(devices, cps);

	// Allocate the queue for this device
	cl_command_queue_properties prop = CL_QUEUE_PROFILING_ENABLE;
	queue = new cl::CommandQueue(*context, device, prop);

	// Create the kernel
	string src = ReadSources(kernelFileName);

	// Compile sources
	cl::Program::Sources source(1, make_pair(src.c_str(), src.length()));
	cl::Program program = cl::Program(*context, source);
	try {
		VECTOR_CLASS<cl::Device> buildDevice;
		buildDevice.push_back(device);
#if defined(__APPLE__)
		program.build(buildDevice, "-I. -D__APPLE__");
#else
		program.build(buildDevice, "-I.");
#endif
		cl::string result = program.getBuildInfo<CL_PROGRAM_BUILD_LOG>(device);
		cerr << "[Device::" << deviceName << "]" << " Compilation result: " << result.c_str() << endl;
	} catch (cl::Error err) {
		cl::string strError = program.getBuildInfo<CL_PROGRAM_BUILD_LOG>(device);
		cerr << "[Device::" << deviceName << "]" << " Compilation error:" << endl << strError.c_str() << endl;

		throw err;
	}

	kernel = new cl::Kernel(program, "RadianceGPU");

	kernel->getWorkGroupInfo<size_t>(device, CL_KERNEL_WORK_GROUP_SIZE, &workGroupSize);
	cerr << "[Device::" << deviceName << "]" << " Suggested work group size: " << workGroupSize << endl;

	// Force workgroup size if applicable and required
	if ((forceGPUWorkSize > 0) && (device.getInfo<CL_DEVICE_TYPE>() == CL_DEVICE_TYPE_GPU)) {
		workGroupSize = forceGPUWorkSize;
		cerr << "[Device::" << deviceName << "]" << " Forced work group size: " << workGroupSize << endl;
	}

	// Create the thread for the rendering
	//renderThread = new boost::thread(boost::bind(RenderDevice::RenderThread, this));

	// Create camera buffer
	cameraBuffer = new cl::Buffer(*context,
#if defined (__APPLE__)
			CL_MEM_READ_ONLY, // CL_MEM_USE_HOST_PTR is very slow with Apple's OpenCL
#else
			CL_MEM_READ_ONLY | CL_MEM_USE_HOST_PTR,
#endif
				sizeof(Camera),
				camera);
	cerr << "[Device::" << deviceName << "] Camera buffer size: " << (sizeof(Camera) / 1024) << "Kb" << endl;

	sphereBuffer = new cl::Buffer(*context,
#if defined (__APPLE__)
			CL_MEM_READ_ONLY, // CL_MEM_USE_HOST_PTR is very slow with Apple's OpenCL
#else
			CL_MEM_READ_ONLY | CL_MEM_USE_HOST_PTR,
#endif
			sizeof(Sphere) * sphereCount,
			spheres);
	cerr << "[Device::" << deviceName << "] Scene buffer size: " << (sizeof(Sphere) * sphereCount / 1024) << "Kb" << endl;
}

RenderDevice::~RenderDevice() {
	/*
	if (renderThread) {
		renderThread->interrupt();
		renderThread->join();

		delete renderThread;
	}
	*/

	delete queue;
	delete kernel;

	delete sphereBuffer;
	delete cameraBuffer;

	if (colorBuffer)
		delete colorBuffer;
	if (pixelBuffer)
		delete pixelBuffer;
	if (seedBuffer)
		delete seedBuffer;
	if (colors)
		delete colors;
	if (seeds)
		delete seeds;

	delete context;
}

void RenderDevice::RenderThread(RenderDevice *renderDevice) {
	try {
		//for (;;) {
			//renderDevice->threadStartBarrier->wait();

			renderDevice->SetKernelArgs();
			renderDevice->ExecuteKernel();
			renderDevice->ReadPixelBuffer();
			renderDevice->FinishExecuteKernel();
			renderDevice->Finish();

			//renderDevice->threadEndBarrier->wait();
		//}
	// } catch (boost::thread_interrupted) {
	// 	cerr << "[Device::" << renderDevice->GetName() << "] Rendering thread halted" << endl;
	} catch (cl::Error err) {
		cerr << "[Device::" << renderDevice->GetName() << "] ERROR: " << err.what() << "(" << err.err() << ")" << endl;
	}
}

string RenderDevice::ReadSources(const string &fileName) {
	fstream file;
	file.exceptions(ifstream::eofbit | ifstream::failbit | ifstream::badbit);
	file.open(fileName.c_str(), fstream::in | fstream::binary);

	string prog(istreambuf_iterator<char>(file), (istreambuf_iterator<char>()));
	cerr << "[Device::" << deviceName << "] Kernel file size " << prog.length() << "bytes" << endl;

	return prog;
}

void RenderDevice::SetWorkLoad(const unsigned int offset, const unsigned int amount,
		const unsigned int screenWidth,	const unsigned int screenHeght,
		unsigned int *screenPixels) {
	if (colorBuffer)
		delete colorBuffer;
	if (pixelBuffer)
		delete pixelBuffer;
	if (seedBuffer)
		delete seedBuffer;

	if (colors)
		delete colors;
	if (seeds)
		delete seeds;

	workOffset = offset;
	workAmount = amount;
	width = screenWidth;
	height = screenHeght;
	pixels = screenPixels;

	colors = new Vec[workAmount];
	colorBuffer = new cl::Buffer(*context,
#if defined (__APPLE__)
			CL_MEM_READ_WRITE, // CL_MEM_USE_HOST_PTR is very slow with Apple's OpenCL
#else
			CL_MEM_READ_WRITE | CL_MEM_USE_HOST_PTR,
#endif
			sizeof(Vec) * workAmount,
			colors);
	cerr << "[Device::" << deviceName << "] Color buffer size: " << (sizeof(Vec) * workAmount / 1024) << "Kb" << endl;

	pixelBuffer = new cl::Buffer(*context,
			CL_MEM_WRITE_ONLY,
			sizeof(unsigned int) * workAmount,
			&pixels[workOffset]);
	cerr << "[Device::" << deviceName << "] Pixel buffer size: " << (sizeof(unsigned int) * workAmount / 1024) << "Kb" << endl;

	seeds = new unsigned int[workAmount * 2];
	for (size_t i = 0; i < workAmount * 2; i++) {
		seeds[i] = rand();
		if (seeds[i] < 2)
			seeds[i] = 2;
	}

	seedBuffer = new cl::Buffer(*context,
#if defined (__APPLE__)
			CL_MEM_READ_WRITE, // CL_MEM_USE_HOST_PTR is very slow with Apple's OpenCL
#else
			CL_MEM_READ_WRITE | CL_MEM_USE_HOST_PTR,
#endif
			sizeof(unsigned int) * workAmount * 2,
			seeds);
	cerr << "[Device::" << deviceName << "] Seeds buffer size: " << (sizeof(unsigned int) * 2 * workAmount / 1024) << "Kb" << endl;

	currentSample = 0;
}
