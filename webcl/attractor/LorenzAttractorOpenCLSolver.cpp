// Copyright (c) 2013 Andrey Tuganov
//
// The zlib/libpng license
//
// This software is provided 'as-is', without any express or implied warranty. In no event will the authors be held liable for any damages arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose, including commercial applications, and to alter it and redistribute it freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
//
// 2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
//
// 3. This notice may not be removed or altered from any source distribution.


#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <cmath>

// TODO platform specific
#ifndef __EMSCRIPTEN__
  #include <GL/glx.h>
#endif

using namespace std;

#include "global.h"
#include "error.h"

#include "LorenzAttractorOpenCLSolver.h"

LorenzAttractorOpenCLSolver::LorenzAttractorOpenCLSolver() : Solver ()
{
}

LorenzAttractorOpenCLSolver::~LorenzAttractorOpenCLSolver()
{
}

void LorenzAttractorOpenCLSolver::init()
{
    try
    {
        __init();
    }
    catch (const cl::Error &e)
    {
        // catch OpenCL specific exceptions and rethrow
        stringstream ss;
        ss << "OpenCL error, " << e.what() << " " << e.err() << endl;
        error::throw_ex(ss.str().c_str(),__FILE__,__LINE__);
    }
}

void LorenzAttractorOpenCLSolver::__init()
{
    vector<cl::Platform> platforms;
    cl::Platform::get(&platforms);

    if( platforms.empty() )
        error::throw_ex("no OpenCL platforms found",__FILE__,__LINE__);

    // TODO check if interop is supported
    //global::par().disable("CL_GL_interop");

    cl_context_properties context_properties[] =
    {
#ifndef __EMSCRIPTEN__      
        CL_GL_CONTEXT_KHR, (cl_context_properties) glXGetCurrentContext(),
        CL_GLX_DISPLAY_KHR, (cl_context_properties) glXGetCurrentDisplay(),
#else
        CL_GL_CONTEXT_KHR, (cl_context_properties) 0,
        CL_GLX_DISPLAY_KHR, (cl_context_properties) 0,
        
#endif                
        CL_CONTEXT_PLATFORM, (cl_context_properties) platforms[0](),
        0
    };

    m_context = cl::Context (CL_DEVICE_TYPE_DEFAULT, context_properties);

    vector<cl::Device> devices = m_context.getInfo<CL_CONTEXT_DEVICES>();

    if( devices.empty() )
        error::throw_ex("no OpenCL devices found",__FILE__,__LINE__);

    // TODO need a machine with multiple gpu

    string kernelFilename(global::par().getString("kernelFilename"));

    ifstream file(kernelFilename, ios::in);
    if ( !file.is_open() )
        error::throw_ex("unable to open kernel file",__FILE__,__LINE__);

    ostringstream ss;
    ss << file.rdbuf();
    file.close();

    string strSrc = ss.str();
    const char *charSrc = strSrc.c_str();

    cl::Program::Sources sources(1, make_pair(charSrc, 0));

    m_program = cl::Program(m_context, sources);

    try
    {
        m_program.build(devices);
    }
    catch (const cl::Error &e)
    {
        cerr << "OpenCL build failed:" << endl;
        cerr << m_program.getBuildInfo<CL_PROGRAM_BUILD_LOG>(devices[0]) << endl;
        throw e;
    }

    m_kernelStep = cl::Kernel(m_program, "kernelStep");

    m_queue = cl::CommandQueue(m_context, devices[0], 0);

    int nParticles = global::par().getInt("nParticles");

    if ( global::par().isEnabled("CL_GL_interop") )
    {
        // init GL buffers for CLGL interop
        m_memPos = cl::BufferGL( m_context, CL_MEM_READ_WRITE, global::par().getGLuint("vboPos"));
        m_memColor = cl::BufferGL( m_context, CL_MEM_READ_WRITE, global::par().getGLuint("vboColor"));

        m_buffers.reserve(2);
        m_buffers.push_back(m_memPos);
        m_buffers.push_back(m_memColor);
    }
    else
    {
        // no interop
        #ifdef __EMSCRIPTEN__
            clSetTypePointer(CL_FLOAT);
        #endif
        m_memPos = cl::Buffer( m_context, CL_MEM_READ_WRITE | CL_MEM_COPY_HOST_PTR, 4*nParticles*sizeof(float), global::par().getPtr("pos"));
        #ifdef __EMSCRIPTEN__
            clSetTypePointer(CL_FLOAT);
        #endif        
        m_memColor = cl::Buffer( m_context, CL_MEM_READ_WRITE | CL_MEM_COPY_HOST_PTR, 4*nParticles*sizeof(float), global::par().getPtr("color"));
    }
    #ifdef __EMSCRIPTEN__
        clSetTypePointer(CL_FLOAT);
    #endif
    m_memLifetime = cl::Buffer( m_context, CL_MEM_READ_WRITE | CL_MEM_COPY_HOST_PTR, nParticles*sizeof(float), global::par().getPtr("lifetime"));
}

void LorenzAttractorOpenCLSolver::step(float time,float deltaTime)
{
    try
    {
        __step(time, deltaTime);
    }
    catch (const cl::Error &e)
    {
        // catch OpenCL specific exceptions and rethrow
        stringstream ss;
        ss << "OpenCL error, " << e.what() << " " << e.err() << endl;
        error::throw_ex(ss.str().c_str(),__FILE__,__LINE__);
    }
}

void LorenzAttractorOpenCLSolver::__step(float time, float deltaTime)
{
    // base particle color (will be subtly changed inside the kernel)
    float baseColor[] = {0.5f+0.2f*sinf(time*0.11f),0.5f+0.2f*sinf(time*0.14f),0.5f+0.2f*cosf(time*0.19f),0.03f};

    // three coefficients of the Lorenz attractor, the forth one is time warp
    float par[] = {15.f+10.f*sinf(time*0.1f)*cosf(time*0.27f), 8.f/3.f+2.f*sinf(time*0.13f)*cosf(time*0.23f), 28.f+5.f*sinf(time*0.17f)*cosf(time*0.11f), 0.1f};

    bool bInterop = global::par().isEnabled("CL_GL_interop");
    if ( bInterop )
    {
        // acquire VBOs
        m_queue.enqueueAcquireGLObjects(&m_buffers);
    }

    // setup arguments and launch kernels
    m_kernelStep.setArg(0, m_memPos);
    m_kernelStep.setArg(1, m_memColor);
    m_kernelStep.setArg(2, m_memLifetime);
    m_kernelStep.setArg(3, 4*sizeof(float), baseColor);
    m_kernelStep.setArg(4, 4*sizeof(float), par);
    m_kernelStep.setArg(5, time);
    m_kernelStep.setArg(6, deltaTime);


    int nParticles = global::par().getInt("nParticles");
    m_queue.enqueueNDRangeKernel( m_kernelStep, cl::NullRange, cl::NDRange(nParticles), cl::NullRange);

    if ( bInterop )
    {
        // release VBOs
        m_queue.enqueueReleaseGLObjects(&m_buffers);
    }

    m_queue.finish(); // don't let OpenGL read unfinished VBOs

    if ( !bInterop )
    {
        // update particles in case of no interop (slow)
        #ifdef __EMSCRIPTEN__
            clSetTypePointer(CL_FLOAT);
        #endif
        m_queue.enqueueReadBuffer( m_memPos, CL_TRUE, 0, 4*nParticles*sizeof(float), global::par().getPtr("pos") );
        
        #ifdef __EMSCRIPTEN__
            clSetTypePointer(CL_FLOAT);
        #endif
        m_queue.enqueueReadBuffer( m_memColor, CL_TRUE, 0, 4*nParticles*sizeof(float), global::par().getPtr("color") );
    }
}

