/*
 * Copyright 1993-2009 NVIDIA Corporation.  All rights reserved.
 *
 * NVIDIA Corporation and its licensors retain all intellectual property and 
 * proprietary rights in and to this software and related documentation. 
 * Any use, reproduction, disclosure, or distribution of this software 
 * and related documentation without an express license agreement from
 * NVIDIA Corporation is strictly prohibited.
 *
 * Please refer to the applicable NVIDIA end user license agreement (EULA) 
 * associated with this source code for terms and conditions that govern 
 * your use of this NVIDIA software.
 * 
 */
 
#ifndef OCL_UTILS_H
#define OCL_UTILS_H

// Common headers:  Cross-API utililties and OpenCL header
#include <shrUtils.h>

#define CL_NV_DEVICE_COMPUTE_CAPABILITY_MAJOR       0x4000
#define CL_NV_DEVICE_COMPUTE_CAPABILITY_MINOR       0x4001
#define CL_NV_DEVICE_REGISTERS_PER_BLOCK            0x4002
#define CL_NV_DEVICE_WARP_SIZE                      0x4003
#define CL_NV_DEVICE_GPU_OVERLAP                    0x4004
#define CL_NV_DEVICE_KERNEL_EXEC_TIMEOUT            0x4005
#define CL_NV_DEVICE_INTEGRATED_MEMORY              0x4006

#ifdef __APPLE__
	#include <OpenCL/OpenCL.h>
#else
	#include <CL/cl.h>
#endif

// reminders for output window and build log
#ifdef _WIN32
    #pragma message ("Note: including shrUtils.h")
    #pragma message ("Note: including cl.h")
#endif

// SDK Version 
#define oclSDKVERSION "4788711"

// Un-comment the following #define to enable profiling code in SDK apps
//#define GPU_PROFILING

// Short version of shrCheckErrorEX(), specific to OpenCL error checking
// Checks input code against CL_SUCCESS and performs error handling if no match.  
// Note:  Use shrCheckError() if input AND reference need to be specified as args 
// *********************************************************************
#define oclCheckError(ciErrNum) shrCheckError(ciErrNum, CL_SUCCESS) 

//////////////////////////////////////////////////////////////////////////////
//! Gets the platform ID for NVIDIA if available, otherwise default to platform 0
//!
//! @return the id 
//! @param clSelectedPlatformID         OpenCL platform ID
//////////////////////////////////////////////////////////////////////////////
extern "C" cl_int oclGetPlatformID(cl_platform_id* clSelectedPlatformID);

//////////////////////////////////////////////////////////////////////////////
//! Print info about the device
//!
//! @param iLogMode       enum LOGBOTH, LOGCONSOLE, LOGFILE
//! @param device         OpenCL id of the device
//////////////////////////////////////////////////////////////////////////////
extern "C" void oclPrintDevInfo(int iLogMode, cl_device_id device);

//////////////////////////////////////////////////////////////////////////////
//! Print the device name
//!
//! @param iLogMode       enum LOGBOTH, LOGCONSOLE, LOGFILE
//! @param device         OpenCL id of the device
//////////////////////////////////////////////////////////////////////////////
extern "C" void oclPrintDevName(int iLogMode, cl_device_id device);

//////////////////////////////////////////////////////////////////////////////
//! Gets the id of the first device from the context
//!
//! @return the id 
//! @param cxGPUContext         OpenCL context
//////////////////////////////////////////////////////////////////////////////
extern "C" cl_device_id oclGetFirstDev(cl_context cxGPUContext);

//////////////////////////////////////////////////////////////////////////////
//! Gets the id of the nth device from the context
//!
//! @return the id or -1 when out of range
//! @param cxGPUContext         OpenCL context
//! @param device_idx            index of the device of interest
//////////////////////////////////////////////////////////////////////////////
extern "C" cl_device_id oclGetDev(cl_context cxGPUContext, unsigned int device_idx);

//////////////////////////////////////////////////////////////////////////////
//! Gets the id of device with maximal FLOPS from the context
//!
//! @return the id 
//! @param cxGPUContext         OpenCL context
//////////////////////////////////////////////////////////////////////////////
extern "C" cl_device_id oclGetMaxFlopsDev(cl_context cxGPUContext);

//////////////////////////////////////////////////////////////////////////////
//! Loads a Program file and prepends the cPreamble to the code.
//!
//! @return the source string if succeeded, 0 otherwise
//! @param cFilename        program filename
//! @param cPreamble        code that is prepended to the loaded file, typically a set of #defines or a header
//! @param szFinalLength    returned length of the code string
//////////////////////////////////////////////////////////////////////////////
extern "C" char* oclLoadProgSource(const char* cFilename, const char* cPreamble, size_t* szFinalLength);

//////////////////////////////////////////////////////////////////////////////
//! Get the binary (PTX) of the program associated with the device
//!
//! @param cpProgram    OpenCL program
//! @param cdDevice     device of interest
//! @param binary       returned code
//! @param length       length of returned code
//////////////////////////////////////////////////////////////////////////////
extern "C" void oclGetProgBinary( cl_program cpProgram, cl_device_id cdDevice, char** binary, size_t* length);

//////////////////////////////////////////////////////////////////////////////
//! Get and log the binary (PTX) from the OpenCL compiler for the requested program & device
//!
//! @param cpProgram                   OpenCL program
//! @param cdDevice                    device of interest
//! @param const char*  cPtxFileName   optional PTX file name
//////////////////////////////////////////////////////////////////////////////
extern "C" void oclLogPtx(cl_program cpProgram, cl_device_id cdDevice, const char* cPtxFileName);

//////////////////////////////////////////////////////////////////////////////
//! Get and log the Build Log from the OpenCL compiler for the requested program & device
//!
//! @param cpProgram    OpenCL program
//! @param cdDevice     device of interest
//////////////////////////////////////////////////////////////////////////////
extern "C" void oclLogBuildInfo(cl_program cpProgram, cl_device_id cdDevice);

// Helper function for De-allocating cl objects
// *********************************************************************
extern "C" void oclDeleteMemObjs(cl_mem* cmMemObjs, int iNumObjs);

#endif
