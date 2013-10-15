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

#ifndef LORENZATTRACTOROPENCLSOLVER_H_
#define LORENZATTRACTOROPENCLSOLVER_H_

#include "Solver.h"

#ifndef __CL_ENABLE_EXCEPTIONS
#define __CL_ENABLE_EXCEPTIONS
#endif
#include <CL/cl.hpp>

#include <vector>

class LorenzAttractorOpenCLSolver : public Solver
{
    friend void Solver::create(Type type);

    cl::Context m_context;
    cl::Program m_program;
    cl::Kernel m_kernelStep;
    cl::CommandQueue m_queue;

    // memory objects
    cl::Buffer m_memPos;
    cl::Buffer m_memColor;
    cl::Buffer m_memLifetime;
    std::vector <cl::Memory> m_buffers; // the same memory objects, needed in vector form for interop interface


    void __init();
    void __step(float time, float deltaTime);

    LorenzAttractorOpenCLSolver();
    ~LorenzAttractorOpenCLSolver();

public:

    virtual void init() override;
    virtual void step(float time, float deltaTime) override;

    virtual void cleanup();

};

#endif
