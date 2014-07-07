//
//  CLParticleSystem.cpp
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-23.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#include "CLParticleSystem.h"
#include <stdio.h>
#include "ResourceLoader.h"
#define NUM_PARTICLES 2000

CLParticleSystem::CLParticleSystem(ParticlePrototype* particlePrototype)
{
    particle = particlePrototype;

    initCL();
    createBuffers();
}

void CLParticleSystem::update(kmMat4 cameraMatrix)
{

    clEnqueueWriteBuffer(queue, camMatrix, true, 0, sizeof(float)*16, &cameraMatrix.mat, 0, NULL, NULL);

    size_t workGroupSize = 8;
    size_t workItemCount = NUM_PARTICLES;
    if (workItemCount % workGroupSize != 0)
        workItemCount = (workItemCount/ workGroupSize + 1) * workGroupSize;

    cl_uint status = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void*)&rotBuffer);
    if (status != CL_SUCCESS) {
        fprintf(stderr, "Failed to set rotation Arg%d\n", status);
        exit(-1);
    }

    status = clSetKernelArg(kernel, 1, sizeof(cl_mem), (void*)&velBuffer);
    if (status != CL_SUCCESS) {
        fprintf(stderr, "Failed to set velocity Arg%d\n", status);
        exit(-1);
    }

    status = clSetKernelArg(kernel, 2, sizeof(cl_mem), (void*)&matrixBuffer);
    if (status != CL_SUCCESS) {
        fprintf(stderr, "Failed to set matrix Arg%d\n", status);
        exit(-1);
    }

    status = clSetKernelArg(kernel, 3, sizeof(cl_mem), (void*)&camMatrix);
    if (status != CL_SUCCESS) {
        fprintf(stderr, "Failed to set cam matrix Arg%d\n", status);
        exit(-1);
    }

    clEnqueueNDRangeKernel(queue,
                           kernel,
                           1,
                           NULL,
                           &workItemCount,
                           &workGroupSize,
                           0,
                           NULL,
                           NULL);

    clFinish(queue);

    clEnqueueReadBuffer(queue, matrixBuffer, CL_TRUE, 0, sizeof(float)*NUM_PARTICLES*16, matrices, 0, NULL, NULL);


}

void CLParticleSystem::createBuffers()
{
    matrices = (kmMat4*)malloc(sizeof(kmMat4) * NUM_PARTICLES);
    velocities = (float*)malloc(sizeof(float) * NUM_PARTICLES * 3);
    rotations = (float*)malloc(sizeof(float) * NUM_PARTICLES * 4);

    kmMat4 translation;
    kmMat4 rotation;
    kmQuaternion quat;
    kmMat4 scale;

    for (int i = 0; i < NUM_PARTICLES; i++)
    {
        kmMat4Identity(&matrices[i]);
        kmMat4Translation(&translation, rand()%250-rand()%250, rand()%100-rand()%100, -15-rand()%100);

        kmQuaternionFill(&quat, 1.0 * (rand()%(i+1)),(rand()%(i+1)), 0.0, 300);
        kmQuaternionNormalize(&quat, &quat);

        kmMat4RotationQuaternion(&rotation, &quat);
        kmMat4Scaling(&scale, 0.5,0.5,0.5);

        kmMat4Multiply(&matrices[i], &scale,   &matrices[i]);
        kmMat4Multiply(&matrices[i], &rotation,   &matrices[i]);
        kmMat4Multiply(&matrices[i],  &translation, &matrices[i]);
    }
    cl_int status;

    matrixBuffer = clCreateBuffer(context, CL_MEM_READ_WRITE | CL_MEM_COPY_HOST_PTR, sizeof(float)*NUM_PARTICLES*16, matrices, &status);
    if (status != CL_SUCCESS)
    {
        fprintf(stderr, "Failed to create matrix buffer %d\n", status);
        exit(-1);
    }

    for (int i = 0; i < NUM_PARTICLES*3; i+=3)
    {
        velocities[i] = 0.04 + (rand()%4) * 0.01;
        velocities[i+1] = -0.08 + (rand()%4) * 0.01;
        velocities[i+2] = 0.0;
    }

    velBuffer = clCreateBuffer(context, CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR, sizeof(float)*NUM_PARTICLES*3, velocities, &status);
    if (status != CL_SUCCESS)
    {
        fprintf(stderr, "Failed to create velocity buffer %d\n", status);
        exit(-1);
    }

    for (int i = 0; i < NUM_PARTICLES*4; i+=4)
    {

        kmQuaternion q;
        kmQuaternionFill(&q, (rand()%10) * 0.1, (rand()%10) * 0.1,(rand()%10) * 0.11, 100+rand()%100);
        kmQuaternionNormalize(&q, &q);
        rotations[i] = q.x;
        rotations[i+1] = q.y;
        rotations[i+2] = q.z;
        rotations[i+3] = q.w;


    }

    rotBuffer = clCreateBuffer(context, CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR, sizeof(float)*NUM_PARTICLES*4, rotations, &status);
    if (status != CL_SUCCESS)
    {
        fprintf(stderr, "Failed to create rotation buffer %d\n", status);
        exit(-1);
    }

    camMatrix = clCreateBuffer(context, CL_MEM_READ_ONLY, sizeof(float)*16, NULL, &status);
    if (status != CL_SUCCESS)
    {
        fprintf(stderr, "Failed to create matrix buffer %d\n", status);
        exit(-1);
    }

}

void CLParticleSystem::drawParticles(kmMat4 cameraMatrix,kmVec3 lightDirection)
{
    for (int i = 0; i < NUM_PARTICLES; i++)
    {
        particle->draw(cameraMatrix, matrices[i], lightDirection);
    }
}

void CLParticleSystem::initCL()
{
    ResourceLoader loader;

    cl_int status;

    clGetPlatformIDs(1, &platform, NULL);
    clGetDeviceIDs(platform, CL_DEVICE_TYPE_GPU, 1, &device, NULL);
    context = clCreateContext(NULL, 1, &device, NULL, NULL, NULL);
    queue = clCreateCommandQueue(context, device, 0, &status);

    if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to create OpenCL command queue %d\n", status);
		exit(-1);
	}

    char name[128];

    clGetDeviceInfo(device, CL_DEVICE_NAME, 128, name, NULL);
    fprintf(stdout, "Got CL Device using the %s\n", name);

    const char* kernelName = "src/kernel/kernel_petal_motion.cl";
    const char* kernelSourcePath = loader.getFilePathToResource(kernelName); //getKernelSource(kernelName);

    size_t sourceSize = 0;
    char* kernelSource = loader.getContentsOfResourceAtPath(kernelSourcePath, sourceSize);

    program = clCreateProgramWithSource(context, 1, (const char**)&kernelSource, (const size_t*)&sourceSize, &status);

    if (status != CL_SUCCESS) {
		fprintf(stderr, "Failed to set create OpenCL program %d\n", status);
		exit(-1);
	}

    status = clBuildProgram(program, 1, &device, NULL, NULL, NULL);

    if (status != CL_SUCCESS) {
        fprintf(stderr, "Failed to build OpenCL program %d\n", status);
        char buffer[2048];
        size_t length;
        clGetProgramBuildInfo(program, device, CL_PROGRAM_BUILD_LOG, sizeof(buffer), buffer, &length);
        fprintf(stderr, "%s\n", buffer);
        exit(-1);
    }

    kernel = clCreateKernel(program, "stepParticles", &status);
    if (status != CL_SUCCESS) {
        fprintf(stderr, "Failed to create kernel %d\n", status);
        exit(-1);
    }
}

CLParticleSystem::~CLParticleSystem()
{
    clReleaseMemObject(matrixBuffer);
    clReleaseMemObject(velBuffer);
    clReleaseMemObject(rotBuffer);
    clReleaseMemObject(camMatrix);
    clReleaseKernel(kernel);
    clReleaseProgram(program);
    clReleaseCommandQueue(queue);
    clReleaseDevice(device);
    clReleaseContext(context);
    free(matrices);
    free(velocities);
    free(rotations);
}
