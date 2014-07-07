//
//  CLParticleSystem.h
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-23.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#ifndef __Sakura_GL_Toy__CLParticleSystem__
#define __Sakura_GL_Toy__CLParticleSystem__

#include "ParticlePrototype.h"
#include "kazmath.h"
#ifdef __EMSCRIPTEN__
#include <CL/OpenCL.h>
#else
#include <OpenCL/OpenCL.h>
#endif

class CLParticleSystem
{
public:
    CLParticleSystem(ParticlePrototype* particlePrototype);
    ~CLParticleSystem();
    void update(kmMat4 cameraMatrix);
    void drawParticles(kmMat4 camMatrix, kmVec3 lightDirection);
private:

    void initCL();
    void createBuffers();
    ParticlePrototype* particle;

    kmMat4* matrices;
    float* velocities;
    float* rotations;

    cl_platform_id platform;
    cl_device_id device;
    cl_context context;
    cl_command_queue queue;
    cl_program program;
    cl_int programHandle;
    cl_kernel kernel;

    cl_mem matrixBuffer;
    cl_mem velBuffer;
    cl_mem rotBuffer;
    cl_mem camMatrix;
};

#endif /* defined(__Sakura_GL_Toy__CLParticleSystem__) */
