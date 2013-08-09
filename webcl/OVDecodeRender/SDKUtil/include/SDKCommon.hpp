#ifndef SDKCOMMON_HPP_
#define SDKCOMMON_HPP_


#include "SDKFile.hpp"

#include <iostream>
#include <fstream>
#include <iomanip>
#include <sstream>
#include <string>
#include <ctime>
#include <cmath>
#include <time.h>
#include <stdlib.h>
#include <string.h>
#include <vector>
#include <malloc.h>

#include <CL/opencl.h>

#ifdef _WIN32
#include <windows.h>
#else
#include <sys/time.h>
#ifndef __EMSCRIPTEN__
#include <linux/limits.h>
#endif
#endif

#if defined(__MINGW32__) && !defined(__MINGW64_VERSION_MAJOR)
#define _aligned_malloc __mingw_aligned_malloc 
#define _aligned_free  __mingw_aligned_free 
#endif // __MINGW32__  and __MINGW64_VERSION_MAJOR


#ifndef _WIN32
#if defined(__INTEL_COMPILER)
#pragma warning(disable : 1125)
#endif
#endif

#define SDK_SUCCESS 0
#define SDK_FAILURE 1
#define SDK_EXPECTED_FAILURE 2

#define CHECK_ALLOCATION(actual, msg) \
        if(actual == NULL) \
        { \
            sampleCommon->error(msg); \
            std::cout << "Location : " << __FILE__ << ":" << __LINE__<< std::endl; \
            return SDK_FAILURE; \
        }

#define CHECK_ERROR(actual, reference, msg) \
        if(actual != reference) \
        { \
            sampleCommon->error(msg); \
            std::cout << "Location : " << __FILE__ << ":" << __LINE__<< std::endl; \
            return SDK_FAILURE; \
        }

#define CHECK_OPENCL_ERROR(actual, msg) \
        if(!sampleCommon->checkVal(actual, CL_SUCCESS, msg)) \
        { \
            std::cout << "Location : " << __FILE__ << ":" << __LINE__<< std::endl; \
            return SDK_FAILURE; \
        } 

#define OPENCL_EXPECTED_ERROR(msg) \
        { \
            sampleCommon->expectedError(msg); \
            return SDK_EXPECTED_FAILURE; \
        }

namespace streamsdk
{

const char* getOpenCLErrorCodeStr(std::string input);

template<typename T>
const char* getOpenCLErrorCodeStr(T input);

struct bifData
{
    std::string kernelName;
    std::string flagsFileName;
    std::string flagsStr;
    std::string binaryName;

    bifData()
    {
        kernelName = std::string("");
        flagsFileName = std::string("");
        flagsStr = std::string("");
        binaryName = std::string("");
    }
};

struct buildProgramData
{
    std::string kernelName;
    std::string flagsFileName;
    std::string flagsStr;
    std::string binaryName;
    cl_device_id* devices;
    int deviceId;
    buildProgramData()
    {
        kernelName = std::string("");
        flagsFileName = std::string("");
        flagsStr = std::string("");
        binaryName = std::string("");
    }
};

struct Timer
{
    std::string name;
    long long _freq;
    long long _clocks;
    long long _start;
};

struct Table
{
    int _numColumns;
    int _numRows;
    int _columnWidth;
    std::string _delim;
    std::string _dataItems;
};

class SDKDeviceInfo
{
public :
    cl_device_type dType;
    cl_uint venderId;
    cl_uint maxComputeUnits;
    cl_uint maxWorkItemDims;
    size_t* maxWorkItemSizes;
    size_t maxWorkGroupSize;
    cl_uint preferredCharVecWidth;
    cl_uint preferredShortVecWidth;
    cl_uint preferredIntVecWidth;
    cl_uint preferredLongVecWidth;
    cl_uint preferredFloatVecWidth;
    cl_uint preferredDoubleVecWidth;
    cl_uint preferredHalfVecWidth;
    cl_uint nativeCharVecWidth;
    cl_uint nativeShortVecWidth;
    cl_uint nativeIntVecWidth;
    cl_uint nativeLongVecWidth;
    cl_uint nativeFloatVecWidth;
    cl_uint nativeDoubleVecWidth;
    cl_uint nativeHalfVecWidth;
    cl_uint maxClockFrequency;
    cl_uint addressBits;
    cl_ulong maxMemAllocSize;
    cl_bool imageSupport;
    cl_uint maxReadImageArgs;
    cl_uint maxWriteImageArgs;
    size_t image2dMaxWidth;
    size_t image2dMaxHeight;
    size_t image3dMaxWidth;
    size_t image3dMaxHeight;
    size_t image3dMaxDepth;
    size_t maxSamplers;
    size_t maxParameterSize;
    cl_uint memBaseAddressAlign;
    cl_uint minDataTypeAlignSize;
    cl_device_fp_config singleFpConfig;
    cl_device_fp_config doubleFpConfig;
    cl_device_mem_cache_type globleMemCacheType;
    cl_uint globalMemCachelineSize;
    cl_ulong globalMemCacheSize;
    cl_ulong globalMemSize;
    cl_ulong maxConstBufSize;
    cl_uint maxConstArgs;
    cl_device_local_mem_type localMemType;
    cl_ulong localMemSize;
    cl_bool errCorrectionSupport;
    cl_bool hostUnifiedMem;
    size_t timerResolution;
    cl_bool endianLittle;
    cl_bool available;
    cl_bool compilerAvailable;
    cl_device_exec_capabilities execCapabilities;
    cl_command_queue_properties queueProperties;
    cl_platform_id platform;
    char* name;
    char* venderName;
    char* driverVersion;
    char* profileType;
    char* deviceVersion;
    char* openclCVersion;
    char* extensions;

    SDKDeviceInfo()
    {
        dType = CL_DEVICE_TYPE_GPU;
        venderId = 0;
        maxComputeUnits = 0;
        maxWorkItemDims = 0;
        maxWorkItemSizes = NULL;
        maxWorkGroupSize = 0;
        preferredCharVecWidth = 0;
        preferredShortVecWidth = 0;
        preferredIntVecWidth = 0;
        preferredLongVecWidth = 0;
        preferredFloatVecWidth = 0;
        preferredDoubleVecWidth = 0;
        preferredHalfVecWidth = 0;
        nativeCharVecWidth = 0;
        nativeShortVecWidth = 0;
        nativeIntVecWidth = 0;
        nativeLongVecWidth = 0;
        nativeFloatVecWidth = 0;
        nativeDoubleVecWidth = 0;
        nativeHalfVecWidth = 0;
        maxClockFrequency = 0;
        addressBits = 0;
        maxMemAllocSize = 0;
        imageSupport = CL_FALSE;
        maxReadImageArgs = 0;
        maxWriteImageArgs = 0;
        image2dMaxWidth = 0;
        image2dMaxHeight = 0;
        image3dMaxWidth = 0;
        image3dMaxHeight = 0;
        image3dMaxDepth = 0;
        maxSamplers = 0;
        maxParameterSize = 0;
        memBaseAddressAlign = 0;
        minDataTypeAlignSize = 0;
        singleFpConfig = CL_FP_ROUND_TO_NEAREST | CL_FP_INF_NAN;
        doubleFpConfig = CL_FP_FMA |
                         CL_FP_ROUND_TO_NEAREST |
                         CL_FP_ROUND_TO_ZERO |
                         CL_FP_ROUND_TO_INF |
                         CL_FP_INF_NAN |
                         CL_FP_DENORM;
        globleMemCacheType = CL_NONE;
        globalMemCachelineSize = CL_NONE;
        globalMemCacheSize = 0;
        globalMemSize = 0;
        maxConstBufSize = 0;
        maxConstArgs = 0;
        localMemType = CL_LOCAL;
        localMemSize = 0;
        errCorrectionSupport = CL_FALSE;
        hostUnifiedMem = CL_FALSE;
        timerResolution = 0;
        endianLittle = CL_FALSE;
        available = CL_FALSE;
        compilerAvailable = CL_FALSE;
        execCapabilities = CL_EXEC_KERNEL;
        queueProperties = 0;
        platform = 0;
        name = NULL;
        venderName = NULL;
        driverVersion = NULL;
        profileType = NULL;
        deviceVersion = NULL;
        openclCVersion = NULL;
        extensions = NULL;
    };

    ~SDKDeviceInfo()
    {
        delete maxWorkItemSizes;
        delete name;
        delete venderName;
        delete driverVersion;
        delete profileType;
        delete deviceVersion;
        delete openclCVersion;
        delete extensions;
    };

    // Set all information for a given device id
    int setDeviceInfo(cl_device_id deviceId);
private :

    template<typename T>
    int checkVal(T input, T reference, std::string message, bool isAPIerror = true) const;

    void error(std::string errorMsg) const
    {
        std::cout<<"Error: "<<errorMsg<<"\n";
    };

};

class SDKCommon
{
private:
    //Timing 
    //Timer *_timers;
    //int _numTimers;
    std::vector<Timer*> _timers;
    
public: 
    SDKCommon();
    ~SDKCommon();
    std::string getPath();
    void error(const char* errorMsg) const;	
    void error(std::string errorMsg) const;
    void expectedError(const char* errorMsg) const;	
    void expectedError(std::string errorMsg) const;
    bool fileToString(std::string &file, std::string &str);
    bool compare(const float *refData, const float *data, 
                    const int length, const float epsilon = 1e-6f); 
    bool compare(const double *refData, const double *data, 
                    const int length, const double epsilon = 1e-6); 
    int displayDevices(cl_platform_id platform, cl_device_type deviceType);
    int displayPlatformAndDevices(cl_platform_id platform, const cl_device_id* device, const int deviceCount);
    int validateDeviceId(int deviceId, int deviceCount);
    int generateBinaryImage(const bifData &binaryData);
    int getPlatform(cl_platform_id &platform, int platformId, bool platformIdEnabled);
    int buildOpenCLProgram(cl_program &program, const cl_context context, const buildProgramData &buildData);

    template<typename T> 
    void printArray(
             const std::string header,
             const T * data, 
             const int width,
             const int height) const;

    template<typename T> 
    int fillRandom(
             T * arrayPtr, 
             const int width,
             const int height,
             const T rangeMin,
             const T rangeMax,
             unsigned int seed=0);	
    
    template<typename T> 
    int fillPos(
             T * arrayPtr, 
             const int width,
             const int height);
    
    template<typename T> 
    int fillConstant(
             T * arrayPtr, 
             const int width,
             const int height,
             const T val);

    
    template<typename T>
    T roundToPowerOf2(T val);

    template<typename T>
    int isPowerOf2(T val);
    
    /* Set default(isAPIerror) parameter to false 
     * if checkVaul is used to check otherthan OpenCL API error code 
     */
    template<typename T> 
    int checkVal(
        T input, 
        T reference, 
        std::string message, bool isAPIerror = true) const;

    template<typename T>
    std::string toString(T t, std::ios_base & (*r)(std::ios_base&)); 

    size_t
    getLocalThreads(size_t globalThreads, size_t maxWorkitemSize);

    // Timing 
    int createTimer();
    int resetTimer(int handle);
    int startTimer(int handle);
    int stopTimer(int handle);
    double readTimer(int handle);

    void printTable(Table* t);
}; 

} // namespace amd

#endif
