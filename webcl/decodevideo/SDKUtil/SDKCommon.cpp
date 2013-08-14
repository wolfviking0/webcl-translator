#include <SDKCommon.hpp>



namespace streamsdk
{
SDKCommon::SDKCommon()
{
    
}

SDKCommon::~SDKCommon()
{
    while(!_timers.empty())
    {
        Timer *temp = _timers.back();
        _timers.pop_back();
        delete temp;
    }
}

/* Returns the path of executable being generated */
std::string
SDKCommon::getPath()
{
#ifdef _WIN32
    char buffer[MAX_PATH];
#ifdef UNICODE
    if(!GetModuleFileName(NULL, (LPWCH)buffer, sizeof(buffer)))
        throw std::string("GetModuleFileName() failed!");
#else
    if(!GetModuleFileName(NULL, buffer, sizeof(buffer)))
        throw std::string("GetModuleFileName() failed!");
#endif
    std::string str(buffer);
    /* '\' == 92 */
    int last = (int)str.find_last_of((char)92);
#else
    char buffer[PATH_MAX + 1];
    ssize_t len;
    if((len = readlink("/proc/self/exe",buffer, sizeof(buffer) - 1)) == -1)
        throw std::string("readlink() failed!");
    buffer[len] = '\0';
    std::string str(buffer);
    /* '/' == 47 */
    int last = (int)str.find_last_of((char)47);
#endif
    return str.substr(0, last + 1);
}

/*
 * Prints no more than 256 elements of the given array.
 * Prints full array if length is less than 256.
 * Prints Array name followed by elements.
 */
template<typename T> 
void SDKCommon::printArray(
    std::string header, 
    const T * data, 
    const int width,
    const int height) const
{
    std::cout<<"\n"<<header<<"\n";
    for(int i = 0; i < height; i++)
    {
        for(int j = 0; j < width; j++)
        {
            std::cout<<data[i*width+j]<<" ";
        }
        std::cout<<"\n";
    }
    std::cout<<"\n";
}

template<typename T> 
int SDKCommon::fillRandom(
         T * arrayPtr, 
         const int width,
         const int height,
         const T rangeMin,
         const T rangeMax,
         unsigned int seed)
{
    if(!arrayPtr)
    {
        error("Cannot fill array. NULL pointer.");
        return 0;
    }

    if(!seed)
        seed = (unsigned int)time(NULL);

    srand(seed);
    double range = double(rangeMax - rangeMin) + 1.0; 

    /* random initialisation of input */
    for(int i = 0; i < height; i++)
        for(int j = 0; j < width; j++)
        {
            int index = i*width + j;
            arrayPtr[index] = rangeMin + T(range*rand()/(RAND_MAX + 1.0)); 
        }

    return 1;
}

template<typename T> 
int SDKCommon::fillPos(
         T * arrayPtr, 
         const int width,
         const int height)
{
    if(!arrayPtr)
    {
        error("Cannot fill array. NULL pointer.");
        return 0;
    }

    /* initialisation of input with positions*/
    for(T i = 0; i < height; i++)
        for(T j = 0; j < width; j++)
        {
            T index = i*width + j;
            arrayPtr[index] = index;
        }

    return 1;
}

template<typename T> 
int SDKCommon::fillConstant(
         T * arrayPtr, 
         const int width,
         const int height,
         const T val)
{
    if(!arrayPtr)
    {
        error("Cannot fill array. NULL pointer.");
        return 0;
    }

    /* initialisation of input with constant value*/
    for(int i = 0; i < height; i++)
        for(int j = 0; j < width; j++)
        {
            int index = i*width + j;
            arrayPtr[index] = val;
        }

    return 1;
}

template<typename T>
T SDKCommon::roundToPowerOf2(T val)
{
    int bytes = sizeof(T);

    val--;
    for(int i = 0; i < bytes; i++)
        val |= val >> (1<<i);  
    val++;

    return val;
}

template<typename T>
int SDKCommon::isPowerOf2(T val)
{
    long long _val = val;
    if((_val & (-_val))-_val == 0 && _val != 0)
        return 1;
    else
        return 0;
}
const char* 
getOpenCLErrorCodeStr(std::string input)
{
    return "unknown error code"; 
}

template<typename T>
const char* 
getOpenCLErrorCodeStr(T input)
{
    int errorCode = (int)input;
    switch(errorCode)
    {
        case CL_DEVICE_NOT_FOUND:
            return "CL_DEVICE_NOT_FOUND";
        case CL_DEVICE_NOT_AVAILABLE:
            return "CL_DEVICE_NOT_AVAILABLE";               
        case CL_COMPILER_NOT_AVAILABLE:
            return "CL_COMPILER_NOT_AVAILABLE";           
        case CL_MEM_OBJECT_ALLOCATION_FAILURE:
            return "CL_MEM_OBJECT_ALLOCATION_FAILURE";      
        case CL_OUT_OF_RESOURCES:
            return "CL_OUT_OF_RESOURCES";                    
        case CL_OUT_OF_HOST_MEMORY:
            return "CL_OUT_OF_HOST_MEMORY";                 
        case CL_PROFILING_INFO_NOT_AVAILABLE:
            return "CL_PROFILING_INFO_NOT_AVAILABLE";        
        case CL_MEM_COPY_OVERLAP:
            return "CL_MEM_COPY_OVERLAP";                    
        case CL_IMAGE_FORMAT_MISMATCH:
            return "CL_IMAGE_FORMAT_MISMATCH";               
        case CL_IMAGE_FORMAT_NOT_SUPPORTED:
            return "CL_IMAGE_FORMAT_NOT_SUPPORTED";         
        case CL_BUILD_PROGRAM_FAILURE:
            return "CL_BUILD_PROGRAM_FAILURE";              
        case CL_MAP_FAILURE:
            return "CL_MAP_FAILURE";                         
        case CL_MISALIGNED_SUB_BUFFER_OFFSET:
            return "CL_MISALIGNED_SUB_BUFFER_OFFSET";
        case CL_EXEC_STATUS_ERROR_FOR_EVENTS_IN_WAIT_LIST:
            return "CL_EXEC_STATUS_ERROR_FOR_EVENTS_IN_WAIT_LIST";
        case CL_INVALID_VALUE:
            return "CL_INVALID_VALUE";                      
        case CL_INVALID_DEVICE_TYPE:
            return "CL_INVALID_DEVICE_TYPE";               
        case CL_INVALID_PLATFORM:
            return "CL_INVALID_PLATFORM";                   
        case CL_INVALID_DEVICE:
            return "CL_INVALID_DEVICE";                    
        case CL_INVALID_CONTEXT:
            return "CL_INVALID_CONTEXT";                    
        case CL_INVALID_QUEUE_PROPERTIES:
            return "CL_INVALID_QUEUE_PROPERTIES";           
        case CL_INVALID_COMMAND_QUEUE:
            return "CL_INVALID_COMMAND_QUEUE";              
        case CL_INVALID_HOST_PTR:
            return "CL_INVALID_HOST_PTR";                   
        case CL_INVALID_MEM_OBJECT:
            return "CL_INVALID_MEM_OBJECT";                  
        case CL_INVALID_IMAGE_FORMAT_DESCRIPTOR:
            return "CL_INVALID_IMAGE_FORMAT_DESCRIPTOR";    
        case CL_INVALID_IMAGE_SIZE:
             return "CL_INVALID_IMAGE_SIZE";                 
        case CL_INVALID_SAMPLER:
            return "CL_INVALID_SAMPLER";                    
        case CL_INVALID_BINARY:
            return "CL_INVALID_BINARY";                     
        case CL_INVALID_BUILD_OPTIONS:
            return "CL_INVALID_BUILD_OPTIONS";              
        case CL_INVALID_PROGRAM:
            return "CL_INVALID_PROGRAM";                    
        case CL_INVALID_PROGRAM_EXECUTABLE:
            return "CL_INVALID_PROGRAM_EXECUTABLE";          
        case CL_INVALID_KERNEL_NAME:
            return "CL_INVALID_KERNEL_NAME";                
        case CL_INVALID_KERNEL_DEFINITION:
            return "CL_INVALID_KERNEL_DEFINITION";          
        case CL_INVALID_KERNEL:
            return "CL_INVALID_KERNEL";                     
        case CL_INVALID_ARG_INDEX:
            return "CL_INVALID_ARG_INDEX";                   
        case CL_INVALID_ARG_VALUE:
            return "CL_INVALID_ARG_VALUE";                   
        case CL_INVALID_ARG_SIZE:
            return "CL_INVALID_ARG_SIZE";                    
        case CL_INVALID_KERNEL_ARGS:
            return "CL_INVALID_KERNEL_ARGS";                
        case CL_INVALID_WORK_DIMENSION:
            return "CL_INVALID_WORK_DIMENSION";              
        case CL_INVALID_WORK_GROUP_SIZE:
            return "CL_INVALID_WORK_GROUP_SIZE";             
        case CL_INVALID_WORK_ITEM_SIZE:
            return "CL_INVALID_WORK_ITEM_SIZE";             
        case CL_INVALID_GLOBAL_OFFSET:
            return "CL_INVALID_GLOBAL_OFFSET";              
        case CL_INVALID_EVENT_WAIT_LIST:
            return "CL_INVALID_EVENT_WAIT_LIST";             
        case CL_INVALID_EVENT:
            return "CL_INVALID_EVENT";                      
        case CL_INVALID_OPERATION:
            return "CL_INVALID_OPERATION";                 
        case CL_INVALID_GL_OBJECT:
            return "CL_INVALID_GL_OBJECT";                  
        case CL_INVALID_BUFFER_SIZE:
            return "CL_INVALID_BUFFER_SIZE";                 
        case CL_INVALID_MIP_LEVEL:
            return "CL_INVALID_MIP_LEVEL";                   
        case CL_INVALID_GLOBAL_WORK_SIZE:
            return "CL_INVALID_GLOBAL_WORK_SIZE";            
        case CL_INVALID_GL_SHAREGROUP_REFERENCE_KHR:
            return "CL_INVALID_GL_SHAREGROUP_REFERENCE_KHR";
        case CL_PLATFORM_NOT_FOUND_KHR:
            return "CL_PLATFORM_NOT_FOUND_KHR";
        //case CL_INVALID_PROPERTY_EXT:
        //    return "CL_INVALID_PROPERTY_EXT";
        case CL_DEVICE_PARTITION_FAILED_EXT:
            return "CL_DEVICE_PARTITION_FAILED_EXT";
        case CL_INVALID_PARTITION_COUNT_EXT:
            return "CL_INVALID_PARTITION_COUNT_EXT";
        default:
            return "unknown error code";
    }

    return "unknown error code";
}


template<typename T>
int SDKDeviceInfo::checkVal(
    T input, 
    T reference, 
    std::string message,
    bool isAPIerror) const
{
    if(input==reference)
    {
        return 1;
    }
    else
    {
        if(isAPIerror)
        {
            std::cout<<"Error: "<< message << " Error code : ";
            std::cout << getOpenCLErrorCodeStr(input) << std::endl;
        }
        else
            error(message);   
        return 0;
    }
}


// Set all information for a given device id
int 
SDKDeviceInfo::setDeviceInfo(cl_device_id deviceId)
{
    cl_int status = CL_SUCCESS;

    //Get device type
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_TYPE, 
                    sizeof(cl_device_type), 
                    &dType, 
                    NULL);
    if(!checkVal(status, CL_SUCCESS, "clGetDeviceIDs(CL_DEVICE_TYPE) failed"))
        return 0;

    //Get vender ID
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_VENDOR_ID, 
                    sizeof(cl_uint), 
                    &venderId, 
                    NULL);
    if(!checkVal(status, CL_SUCCESS, "clGetDeviceIDs(CL_DEVICE_VENDOR_ID) failed"))
        return 0;

    //Get max compute units
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_COMPUTE_UNITS, 
                    sizeof(cl_uint), 
                    &maxComputeUnits, 
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_COMPUTE_UNITS) failed"))
        return 0;

    //Get max work item dimensions
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_WORK_ITEM_DIMENSIONS,
                    sizeof(cl_uint),
                    &maxWorkItemDims,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_WORK_ITEM_DIMENSIONS) failed"))
        return 0;

    //Get max work item sizes
    delete maxWorkItemSizes;
    maxWorkItemSizes = new size_t[maxWorkItemDims];
    if(maxWorkItemSizes == NULL)
    {
        error("Failed to allocate memory(maxWorkItemSizes)");
        return 0;
    }
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_WORK_ITEM_SIZES,
                    maxWorkItemDims * sizeof(size_t),
                    maxWorkItemSizes,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_WORK_ITEM_DIMENSIONS) failed"))
        return 0;

    // Maximum work group size
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_WORK_GROUP_SIZE,
                    sizeof(size_t),
                    &maxWorkGroupSize,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_WORK_GROUP_SIZE) failed"))
        return 0;

    // Preferred vector sizes of all data types
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_PREFERRED_VECTOR_WIDTH_CHAR,
                    sizeof(cl_uint),
                    &preferredCharVecWidth,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_PREFERRED_VECTOR_WIDTH_CHAR) failed"))
        return 0;

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_PREFERRED_VECTOR_WIDTH_SHORT,
                    sizeof(cl_uint),
                    &preferredShortVecWidth,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_PREFERRED_VECTOR_WIDTH_SHORT) failed"))
        return 0;

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_PREFERRED_VECTOR_WIDTH_INT,
                    sizeof(cl_uint),
                    &preferredIntVecWidth,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_PREFERRED_VECTOR_WIDTH_INT) failed"))
        return 0;

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_PREFERRED_VECTOR_WIDTH_LONG,
                    sizeof(cl_uint),
                    &preferredLongVecWidth,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_PREFERRED_VECTOR_WIDTH_LONG) failed"))
        return 0;

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_PREFERRED_VECTOR_WIDTH_FLOAT,
                    sizeof(cl_uint),
                    &preferredFloatVecWidth,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_PREFERRED_VECTOR_WIDTH_FLOAT) failed"))
        return 0;

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_PREFERRED_VECTOR_WIDTH_DOUBLE,
                    sizeof(cl_uint),
                    &preferredDoubleVecWidth,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_PREFERRED_VECTOR_WIDTH_DOUBLE) failed"))
        return 0;

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_PREFERRED_VECTOR_WIDTH_HALF,
                    sizeof(cl_uint),
                    &preferredHalfVecWidth,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_PREFERRED_VECTOR_WIDTH_HALF) failed"))
        return 0;

    // Clock frequency
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_CLOCK_FREQUENCY,
                    sizeof(cl_uint),
                    &maxClockFrequency,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_CLOCK_FREQUENCY) failed"))
        return 0;

    // Address bits
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_ADDRESS_BITS,
                    sizeof(cl_uint),
                    &addressBits,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_ADDRESS_BITS) failed"))
        return 0;

    // Maximum memory alloc size
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_MEM_ALLOC_SIZE,
                    sizeof(cl_ulong),
                    &maxMemAllocSize,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_MEM_ALLOC_SIZE) failed"))
        return 0;

    // Image support
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_IMAGE_SUPPORT,
                    sizeof(cl_bool),
                    &imageSupport,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_IMAGE_SUPPORT) failed"))
        return 0;

    // Maximum read image arguments
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_READ_IMAGE_ARGS,
                    sizeof(cl_uint),
                    &maxReadImageArgs,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_READ_IMAGE_ARGS) failed"))
        return 0;

    // Maximum write image arguments
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_WRITE_IMAGE_ARGS,
                    sizeof(cl_uint),
                    &maxWriteImageArgs,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_WRITE_IMAGE_ARGS) failed"))
        return 0;

    // 2D image and 3D dimensions
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_IMAGE2D_MAX_WIDTH,
                    sizeof(size_t),
                    &image2dMaxWidth,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_IMAGE2D_MAX_WIDTH) failed"))
        return 0;

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_IMAGE2D_MAX_HEIGHT,
                    sizeof(size_t),
                    &image2dMaxHeight,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_IMAGE2D_MAX_HEIGHT) failed"))
        return 0;

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_IMAGE3D_MAX_WIDTH,
                    sizeof(size_t),
                    &image3dMaxWidth,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_IMAGE3D_MAX_WIDTH) failed"))
        return 0;

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_IMAGE3D_MAX_HEIGHT,
                    sizeof(size_t),
                    &image3dMaxHeight,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_IMAGE3D_MAX_HEIGHT) failed"))
        return 0;

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_IMAGE3D_MAX_DEPTH,
                    sizeof(size_t),
                    &image3dMaxDepth,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_IMAGE3D_MAX_DEPTH) failed"))
        return 0;

    // Maximum samplers
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_SAMPLERS,
                    sizeof(cl_uint),
                    &maxSamplers,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_SAMPLERS) failed"))
        return 0;

    // Maximum parameter size
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_PARAMETER_SIZE,
                    sizeof(size_t),
                    &maxParameterSize,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_PARAMETER_SIZE) failed"))
        return 0;

    // Memory base address align
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MEM_BASE_ADDR_ALIGN,
                    sizeof(cl_uint),
                    &memBaseAddressAlign,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MEM_BASE_ADDR_ALIGN) failed"))
        return 0;

    // Minimum data type align size
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MIN_DATA_TYPE_ALIGN_SIZE,
                    sizeof(cl_uint),
                    &minDataTypeAlignSize,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MIN_DATA_TYPE_ALIGN_SIZE) failed"))
        return 0;

    // Single precision floating point configuration
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_SINGLE_FP_CONFIG,
                    sizeof(cl_device_fp_config),
                    &singleFpConfig,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_SINGLE_FP_CONFIG) failed"))
        return 0;

    // Double precision floating point configuration
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_DOUBLE_FP_CONFIG,
                    sizeof(cl_device_fp_config),
                    &doubleFpConfig,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_DOUBLE_FP_CONFIG) failed"))
        return 0;

    // Global memory cache type
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_GLOBAL_MEM_CACHE_TYPE,
                    sizeof(cl_device_mem_cache_type),
                    &globleMemCacheType,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_GLOBAL_MEM_CACHE_TYPE) failed"))
        return 0;

    // Global memory cache line size
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_GLOBAL_MEM_CACHELINE_SIZE,
                    sizeof(cl_uint),
                    &globalMemCachelineSize,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_GLOBAL_MEM_CACHELINE_SIZE) failed"))
        return 0;

    // Global memory cache size
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_GLOBAL_MEM_CACHE_SIZE,
                    sizeof(cl_ulong),
                    &globalMemCacheSize,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_GLOBAL_MEM_CACHE_SIZE) failed"))
        return 0;

    // Global memory size
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_GLOBAL_MEM_SIZE,
                    sizeof(cl_ulong),
                    &globalMemSize,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_GLOBAL_MEM_SIZE) failed"))
        return 0;

    // Maximum constant buffer size
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_CONSTANT_BUFFER_SIZE,
                    sizeof(cl_ulong),
                    &maxConstBufSize,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_CONSTANT_BUFFER_SIZE) failed"))
        return 0;

    // Maximum constant arguments
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_MAX_CONSTANT_ARGS,
                    sizeof(cl_uint),
                    &maxConstArgs,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_MAX_CONSTANT_ARGS) failed"))
        return 0;

    // Local memory type
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_LOCAL_MEM_TYPE,
                    sizeof(cl_device_local_mem_type),
                    &localMemType,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_LOCAL_MEM_TYPE) failed"))
        return 0;

    // Local memory size
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_LOCAL_MEM_SIZE,
                    sizeof(cl_ulong),
                    &localMemSize,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_LOCAL_MEM_SIZE) failed"))
        return 0;

    // Error correction support
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_ERROR_CORRECTION_SUPPORT,
                    sizeof(cl_bool),
                    &errCorrectionSupport,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_ERROR_CORRECTION_SUPPORT) failed"))
        return 0;

    // Profiling timer resolution
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_PROFILING_TIMER_RESOLUTION,
                    sizeof(size_t),
                    &timerResolution,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_PROFILING_TIMER_RESOLUTION) failed"))
        return 0;

    // Endian little
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_ENDIAN_LITTLE,
                    sizeof(cl_bool),
                    &endianLittle,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_ENDIAN_LITTLE) failed"))
        return 0;

    // Device available
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_AVAILABLE,
                    sizeof(cl_bool),
                    &available,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_AVAILABLE) failed"))
        return 0;

    // Device compiler available
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_COMPILER_AVAILABLE,
                    sizeof(cl_bool),
                    &compilerAvailable,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_COMPILER_AVAILABLE) failed"))
        return 0;

    // Device execution capabilities
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_EXECUTION_CAPABILITIES,
                    sizeof(cl_device_exec_capabilities),
                    &execCapabilities,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_EXECUTION_CAPABILITIES) failed"))
        return 0;

    // Device queue properities
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_QUEUE_PROPERTIES,
                    sizeof(cl_command_queue_properties),
                    &queueProperties,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_QUEUE_PROPERTIES) failed"))
        return 0;

    // Platform
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_PLATFORM,
                    sizeof(cl_platform_id),
                    &platform,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_PLATFORM) failed"))
        return 0;

    // Device name
    size_t tempSize = 0;
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_NAME,
                    0,
                    NULL,
                    &tempSize);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_NAME) failed"))
        return 0;

    delete name;
    name = new char[tempSize];
    if(name == NULL)
    {
        error("Failed to allocate memory(name)");
        return 0;
    }

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_NAME,
                    sizeof(char) * tempSize,
                    name,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_NAME) failed"))
        return 0;

    // Vender name
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_VENDOR,
                    0,
                    NULL,
                    &tempSize);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_VENDOR) failed"))
        return 0;

    delete venderName;
    venderName = new char[tempSize];
    if(venderName == NULL)
    {
        error("Failed to allocate memory(venderName)");
        return 0;
    }

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_VENDOR,
                    sizeof(char) * tempSize,
                    venderName,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_VENDOR) failed"))
        return 0;

    // Driver name
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DRIVER_VERSION,
                    0,
                    NULL,
                    &tempSize);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DRIVER_VERSION) failed"))
        return 0;

    delete driverVersion;
    driverVersion = new char[tempSize];
    if(driverVersion == NULL)
    {
        error("Failed to allocate memory(driverVersion)");
        return 0;
    }

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DRIVER_VERSION,
                    sizeof(char) * tempSize,
                    driverVersion,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DRIVER_VERSION) failed"))
        return 0;

    // Device profile
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_PROFILE,
                    0,
                    NULL,
                    &tempSize);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_PROFILE) failed"))
        return 0;

    delete profileType;
    profileType = new char[tempSize];
    if(profileType == NULL)
    {
        error("Failed to allocate memory(profileType)");
        return 0;
    }

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_PROFILE,
                    sizeof(char) * tempSize,
                    profileType,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_PROFILE) failed"))
        return 0;

    // Device version
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_VERSION,
                    0,
                    NULL,
                    &tempSize);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_VERSION) failed"))
        return 0;

    delete deviceVersion;
    deviceVersion = new char[tempSize];
    if(deviceVersion == NULL)
    {
        error("Failed to allocate memory(deviceVersion)");
        return 0;
    }

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_VERSION,
                    sizeof(char) * tempSize,
                    deviceVersion,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_VERSION) failed"))
        return 0;

    // Device extensions
    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_EXTENSIONS,
                    0,
                    NULL,
                    &tempSize);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_EXTENSIONS) failed"))
        return 0;

    delete extensions;
    extensions = new char[tempSize];
    if(extensions == NULL)
    {
        error("Failed to allocate memory(extensions)");
        return 0;
    }

    status = clGetDeviceInfo(
                    deviceId, 
                    CL_DEVICE_EXTENSIONS,
                    sizeof(char) * tempSize,
                    extensions,
                    NULL);
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetDeviceIDs(CL_DEVICE_EXTENSIONS) failed"))
        return 0;

    // Device parameters of OpenCL 1.1 Specification
#ifdef CL_VERSION_1_1
    std::string deviceVerStr(deviceVersion);
    size_t vStart = deviceVerStr.find(" ", 0);
    size_t vEnd = deviceVerStr.find(" ", vStart + 1);
    std::string vStrVal = deviceVerStr.substr(vStart + 1, vEnd - vStart - 1);
    if(vStrVal.compare("1.0") > 0)
    {
        // Native vector sizes of all data types
        status = clGetDeviceInfo(
                        deviceId, 
                        CL_DEVICE_NATIVE_VECTOR_WIDTH_CHAR,
                        sizeof(cl_uint),
                        &nativeCharVecWidth,
                        NULL);
        if(!checkVal(
                status, 
                CL_SUCCESS, 
                "clGetDeviceIDs(CL_DEVICE_NATIVE_VECTOR_WIDTH_CHAR) failed"))
            return 0;

        status = clGetDeviceInfo(
                        deviceId, 
                        CL_DEVICE_NATIVE_VECTOR_WIDTH_SHORT,
                        sizeof(cl_uint),
                        &nativeShortVecWidth,
                        NULL);
        if(!checkVal(
                status, 
                CL_SUCCESS, 
                "clGetDeviceIDs(CL_DEVICE_NATIVE_VECTOR_WIDTH_SHORT) failed"))
            return 0;

        status = clGetDeviceInfo(
                        deviceId, 
                        CL_DEVICE_NATIVE_VECTOR_WIDTH_INT,
                        sizeof(cl_uint),
                        &nativeIntVecWidth,
                        NULL);
        if(!checkVal(
                status, 
                CL_SUCCESS, 
                "clGetDeviceIDs(CL_DEVICE_NATIVE_VECTOR_WIDTH_INT) failed"))
            return 0;

        status = clGetDeviceInfo(
                        deviceId, 
                        CL_DEVICE_NATIVE_VECTOR_WIDTH_LONG,
                        sizeof(cl_uint),
                        &nativeLongVecWidth,
                        NULL);
        if(!checkVal(
                status, 
                CL_SUCCESS, 
                "clGetDeviceIDs(CL_DEVICE_NATIVE_VECTOR_WIDTH_LONG) failed"))
            return 0;

        status = clGetDeviceInfo(
                        deviceId, 
                        CL_DEVICE_NATIVE_VECTOR_WIDTH_FLOAT,
                        sizeof(cl_uint),
                        &nativeFloatVecWidth,
                        NULL);
        if(!checkVal(
                status, 
                CL_SUCCESS, 
                "clGetDeviceIDs(CL_DEVICE_NATIVE_VECTOR_WIDTH_FLOAT) failed"))
            return 0;

        status = clGetDeviceInfo(
                        deviceId, 
                        CL_DEVICE_NATIVE_VECTOR_WIDTH_DOUBLE,
                        sizeof(cl_uint),
                        &nativeDoubleVecWidth,
                        NULL);
        if(!checkVal(
                status, 
                CL_SUCCESS, 
                "clGetDeviceIDs(CL_DEVICE_NATIVE_VECTOR_WIDTH_DOUBLE) failed"))
            return 0;

        status = clGetDeviceInfo(
                        deviceId, 
                        CL_DEVICE_NATIVE_VECTOR_WIDTH_HALF,
                        sizeof(cl_uint),
                        &nativeHalfVecWidth,
                        NULL);
        if(!checkVal(
                status, 
                CL_SUCCESS, 
                "clGetDeviceIDs(CL_DEVICE_NATIVE_VECTOR_WIDTH_HALF) failed"))
            return 0;

        // Host unified memory
        status = clGetDeviceInfo(
                        deviceId, 
                        CL_DEVICE_HOST_UNIFIED_MEMORY,
                        sizeof(cl_bool),
                        &hostUnifiedMem,
                        NULL);
        if(!checkVal(
                status, 
                CL_SUCCESS, 
                "clGetDeviceIDs(CL_DEVICE_HOST_UNIFIED_MEMORY) failed"))
            return 0;

        // Device OpenCL C version
        status = clGetDeviceInfo(
                        deviceId, 
                        CL_DEVICE_OPENCL_C_VERSION,
                        0,
                        NULL,
                        &tempSize);
        if(!checkVal(
                status, 
                CL_SUCCESS, 
                "clGetDeviceIDs(CL_DEVICE_OPENCL_C_VERSION) failed"))
            return 0;

        delete openclCVersion;
        openclCVersion = new char[tempSize];
        if(openclCVersion == NULL)
        {
            error("Failed to allocate memory(openclCVersion)");
            return 0;
        }

        status = clGetDeviceInfo(
                        deviceId, 
                        CL_DEVICE_OPENCL_C_VERSION,
                        sizeof(char) * tempSize,
                        openclCVersion,
                        NULL);
        if(!checkVal(
                status, 
                CL_SUCCESS, 
                "clGetDeviceIDs(CL_DEVICE_OPENCL_C_VERSION) failed"))
            return 0;

    }
#endif


    return 1;
}

template<typename T>
int SDKCommon::checkVal(
    T input, 
    T reference, 
    std::string message,
    bool isAPIerror) const
{
    if(input==reference)
    {
        return 1;
    }
    else
    {
        if(isAPIerror)
        {
            std::cout<<"Error: "<< message << " Error code : ";
            std::cout << getOpenCLErrorCodeStr(input) << std::endl;
        }
        else
            error(message);   
        return 0;
    }
}

template<typename T>
std::string SDKCommon::toString(T t, std::ios_base &(*r)(std::ios_base&))
{
  std::ostringstream output;
  output << r << t;
  return output.str();
}

/*
 * Displays the platform name,  device ids and device names for given platform
 */
int SDKCommon::displayDevices(cl_platform_id platform, cl_device_type deviceType)
{
    cl_int status;

    // Get platform name
    char platformVendor[1024];
    status = clGetPlatformInfo(platform, CL_PLATFORM_VENDOR, sizeof(platformVendor), platformVendor, NULL);
    if(!checkVal(status, CL_SUCCESS, "clGetPlatformInfo failed"))
        return 0;
    
    std::cout << "\nSelected Platform Vendor : " << platformVendor << std::endl;

    // Get number of devices available 
    cl_uint deviceCount = 0;
    status = clGetDeviceIDs(platform, deviceType, 0, NULL, &deviceCount);
    if(!checkVal(status, CL_SUCCESS, "clGetDeviceIDs failed"))
        return 0;

    cl_device_id* deviceIds = (cl_device_id*)malloc(sizeof(cl_device_id) * deviceCount);
    if(deviceIds == NULL)
    {
        error("Failed to allocate memory(deviceIds)");
        return 0;
    }

    // Get device ids
    status = clGetDeviceIDs(platform, deviceType, deviceCount, deviceIds, NULL);
    if(!checkVal(status, CL_SUCCESS, "clGetDeviceIDs failed"))
        return 0;

    // Print device index and device names
    for(cl_uint i = 0; i < deviceCount; ++i)
    {
        char deviceName[1024];
        status = clGetDeviceInfo(deviceIds[i], CL_DEVICE_NAME, sizeof(deviceName), deviceName, NULL);
        
        if(!checkVal(status, CL_SUCCESS, "clGetDeviceInfo failed"))
            return 0;
        
        std::cout << "Device " << i << " : " << deviceName << std::endl;
    }

    free(deviceIds);
    
    return 1;
}

int 
SDKCommon::displayPlatformAndDevices(
cl_platform_id platform, const cl_device_id* devices, const int deviceCount)
{
    cl_int status;

    // Get platform name
    char platformVendor[1024];
    status = clGetPlatformInfo(platform, CL_PLATFORM_VENDOR, sizeof(platformVendor), platformVendor, NULL);
    if(!checkVal(status, CL_SUCCESS, "clGetPlatformInfo failed"))
        return 0;
    
    std::cout << "\nSelected Platform Vendor : " << platformVendor << std::endl;

    // Print device index and device names
    for(cl_int i = 0; i < deviceCount; ++i)
    {
        char deviceName[1024];
        status = clGetDeviceInfo(devices[i], CL_DEVICE_NAME, sizeof(deviceName), deviceName, NULL);
        
        if(!checkVal(status, CL_SUCCESS, "clGetDeviceInfo failed"))
            return 0;
        
        std::cout << "Device " << i << " : " << deviceName << std::endl;
    }

    return 1;

}


int 
SDKCommon::validateDeviceId(int deviceId, int deviceCount)
{
    // Validate deviceIndex
    if(deviceId >= (int)deviceCount)
    {
        std::cout << "DeviceId should be < " << deviceCount << std::endl;
        return 0;
    }

    return 1;
}

int
SDKCommon::generateBinaryImage(const bifData &binaryData)
{
    cl_int status = CL_SUCCESS;

    /*
     * Have a look at the available platforms and pick either
     * the AMD one if available or a reasonable default.
     */
    cl_uint numPlatforms;
    cl_platform_id platform = NULL;
    status = clGetPlatformIDs(0, NULL, &numPlatforms);
    if(!checkVal(status, CL_SUCCESS,"clGetPlatformIDs failed."))
        return 0;

    if (0 < numPlatforms) 
    {
        cl_platform_id* platforms = new cl_platform_id[numPlatforms];
        status = clGetPlatformIDs(numPlatforms, platforms, NULL);
        if(!checkVal(status, CL_SUCCESS,"clGetPlatformIDs failed."))
            return 0;

        char platformName[100];
        for (unsigned i = 0; i < numPlatforms; ++i) 
        {
            status = clGetPlatformInfo(
                        platforms[i],
                        CL_PLATFORM_VENDOR,
                        sizeof(platformName),
                        platformName,
                        NULL);

            if(!checkVal(status, CL_SUCCESS, "clGetPlatformInfo failed."))
                return 0;

            platform = platforms[i];
            if (!strcmp(platformName, "Advanced Micro Devices, Inc.")) 
                break;
        }
        std::cout << "Platform found : " << platformName << "\n";
        delete[] platforms;
    }

    if(NULL == platform)
    {
        error("NULL platform found so Exiting Application.");
        return 0;
    }

    /*
     * If we could find our platform, use it. Otherwise use just available platform.
     */
    cl_context_properties cps[5] = 
    {
        CL_CONTEXT_PLATFORM, 
        (cl_context_properties)platform, 
        CL_CONTEXT_OFFLINE_DEVICES_AMD,
        (cl_context_properties)1,
        0
    };

    cl_context context = clCreateContextFromType(
                            cps,
                            CL_DEVICE_TYPE_ALL,
                            NULL,
                            NULL,
                            &status);

    if(!checkVal(status, CL_SUCCESS, "clCreateContextFromType failed."))
        return 0;

    /* create a CL program using the kernel source */
    SDKFile kernelFile;
    std::string kernelPath = getPath();
    kernelPath.append(binaryData.kernelName.c_str());
    if(!kernelFile.open(kernelPath.c_str()))
    {
        std::cout << "Failed to load kernel file : " << kernelPath << std::endl;
        return 0;
    }
    const char * source = kernelFile.source().c_str();
    size_t sourceSize[] = {strlen(source)};
    cl_program program = clCreateProgramWithSource(
                            context,
                            1,
                            &source,
                            sourceSize,
                            &status);
    if(!checkVal(status, CL_SUCCESS, "clCreateProgramWithSource failed."))
        return 0;

    std::string flagsStr = std::string(binaryData.flagsStr.c_str());

    // Get additional options
    if(binaryData.flagsFileName.size() != 0)
    {
        streamsdk::SDKFile flagsFile;
        std::string flagsPath = getPath();
        flagsPath.append(binaryData.flagsFileName.c_str());
        if(!flagsFile.open(flagsPath.c_str()))
        {
            std::cout << "Failed to load flags file: " << flagsPath << std::endl;
            return 0;
        }
        flagsFile.replaceNewlineWithSpaces();
        const char * flags = flagsFile.source().c_str();
        flagsStr.append(flags);
    }

    if(flagsStr.size() != 0)
        std::cout << "Build Options are : " << flagsStr.c_str() << std::endl;

    /* create a cl program executable for all the devices specified */
    status = clBuildProgram(
                program,
                0,
                NULL,
                flagsStr.c_str(),
                NULL,
                NULL);

    checkVal(status, CL_SUCCESS, "clBuildProgram failed.");

    size_t numDevices;
    status = clGetProgramInfo(
                program, 
                CL_PROGRAM_NUM_DEVICES,
                sizeof(numDevices),
                &numDevices,
                NULL );
    if(!checkVal(
            status, 
            CL_SUCCESS, 
            "clGetProgramInfo(CL_PROGRAM_NUM_DEVICES) failed."))
        return 0;

    std::cout << "Number of devices found : " << numDevices << "\n\n";
    cl_device_id *devices = (cl_device_id *)malloc( sizeof(cl_device_id) * numDevices );
    if(devices == NULL)
    {
        error("Failed to allocate host memory.(devices)");
        return 0;
    }
    /* grab the handles to all of the devices in the program. */
    status = clGetProgramInfo(
                program, 
                CL_PROGRAM_DEVICES, 
                sizeof(cl_device_id) * numDevices,
                devices,
                NULL );
    if(!checkVal(
            status,
            CL_SUCCESS,
            "clGetProgramInfo(CL_PROGRAM_DEVICES) failed."))
        return 0;

    /* figure out the sizes of each of the binaries. */
    size_t *binarySizes = (size_t*)malloc( sizeof(size_t) * numDevices );
    if(devices == NULL)
    {
        error("Failed to allocate host memory.(binarySizes)");
        return 0;
    }
    
    status = clGetProgramInfo(
                program, 
                CL_PROGRAM_BINARY_SIZES,
                sizeof(size_t) * numDevices, 
                binarySizes, 
                NULL);
    if(!checkVal(
            status,
            CL_SUCCESS,
            "clGetProgramInfo(CL_PROGRAM_BINARY_SIZES) failed."))
        return 0;

    size_t i = 0;
    /* copy over all of the generated binaries. */
    char **binaries = (char **)malloc( sizeof(char *) * numDevices );
    if(binaries == NULL)
    {
        error("Failed to allocate host memory.(binaries)");
        return 0;
    }

    for(i = 0; i < numDevices; i++)
    {
        if(binarySizes[i] != 0)
        {
            binaries[i] = (char *)malloc( sizeof(char) * binarySizes[i]);
            if(binaries[i] == NULL)
            {
                error("Failed to allocate host memory.(binaries[i])");
                return 0;
            }
        }
        else
        {
            binaries[i] = NULL;
        }
    }
    status = clGetProgramInfo(
                program, 
                CL_PROGRAM_BINARIES,
                sizeof(char *) * numDevices, 
                binaries, 
                NULL);
    if(!checkVal(
            status,
            CL_SUCCESS,
            "clGetProgramInfo(CL_PROGRAM_BINARIES) failed."))
        return 0;

    /* dump out each binary into its own separate file. */
    for(i = 0; i < numDevices; i++)
    {
        char fileName[100];
        sprintf(fileName, "%s.%d", binaryData.binaryName.c_str(), (int)i);
        char deviceName[1024];
        status = clGetDeviceInfo(
                    devices[i], 
                    CL_DEVICE_NAME, 
                    sizeof(deviceName),
                    deviceName, 
                    NULL);
        if(!checkVal(
                status,
                CL_SUCCESS,
                "clGetDeviceInfo(CL_DEVICE_NAME) failed."))
            return 0;

        if(binarySizes[i] != 0)
        {
            printf( "%s binary kernel: %s\n", deviceName, fileName);
            streamsdk::SDKFile BinaryFile;
            if(!BinaryFile.writeBinaryToFile(fileName, 
                                             binaries[i], 
                                             binarySizes[i]))
            {
                std::cout << "Failed to load kernel file : " << fileName << std::endl;
                return 0;
            }
        }
        else
        {
            printf(
                "%s binary kernel(%s) : %s\n", 
                deviceName, 
                fileName,
                "Skipping as there is no binary data to write!");
        }
    }

    // Release all resouces and memory
    for(i = 0; i < numDevices; i++)
    {
        if(binaries[i] != NULL)
        {
            free(binaries[i]);
            binaries[i] = NULL;
        }
    }

    if(binaries != NULL)
    {
        free(binaries);
        binaries = NULL;
    }

    if(binarySizes != NULL)
    {
        free(binarySizes);
        binarySizes = NULL;
    }

    if(devices != NULL)
    {
        free(devices);
        devices = NULL;
    }

    status = clReleaseProgram(program);
    if(!checkVal(status, CL_SUCCESS, "clReleaseProgram failed."))
        return 0;

    status = clReleaseContext(context);
    if(!checkVal(status, CL_SUCCESS, "clReleaseContext failed."))
        return 0;

    return 1;
}

int
SDKCommon::getPlatform(cl_platform_id &platform, int platformId, bool platformIdEnabled)
{
    cl_uint numPlatforms;
    cl_int status = clGetPlatformIDs(0, NULL, &numPlatforms);
    if(!checkVal(status, CL_SUCCESS, "clGetPlatformIDs failed."))
        return 0;

    if (0 < numPlatforms) 
    {
        cl_platform_id* platforms = new cl_platform_id[numPlatforms];
        status = clGetPlatformIDs(numPlatforms, platforms, NULL);
        if(!checkVal(status, CL_SUCCESS, "clGetPlatformIDs failed."))
            return 0;

        if(platformIdEnabled)
        {
            platform = platforms[platformId];
        }
        else
        {
            char platformName[100];
            for (unsigned i = 0; i < numPlatforms; ++i) 
            {
                status = clGetPlatformInfo(platforms[i],
                                           CL_PLATFORM_VENDOR,
                                           sizeof(platformName),
                                           platformName,
                                           NULL);

                if(!checkVal(status, CL_SUCCESS, "clGetPlatformInfo failed."))
                    return 0;

                platform = platforms[i];
                if (!strcmp(platformName, "Advanced Micro Devices, Inc.")) 
                {
                    break;
                }
            }
            std::cout << "Platform found : " << platformName << "\n";
        }
        delete[] platforms;
    }

    if(NULL == platform)
    {
        error("NULL platform found so Exiting Application.");
        return 0;
    }

    return 1;
}


int
SDKCommon::buildOpenCLProgram(cl_program &program, const cl_context context, const buildProgramData &buildData)
{
    cl_int status = CL_SUCCESS;
    SDKFile kernelFile;
    std::string kernelPath = getPath();
    if(buildData.binaryName.size() != 0)
    {
        kernelPath.append(buildData.binaryName.c_str());
        if(!kernelFile.readBinaryFromFile(kernelPath.c_str()))
        {
            std::cout << "Failed to load kernel file : " << kernelPath << std::endl;
            return 0;
        }

        const char * binary = kernelFile.source().c_str();
        size_t binarySize = kernelFile.source().size();
        program = clCreateProgramWithBinary(context,
                                            1,
                                            &buildData.devices[buildData.deviceId], 
                                            (const size_t *)&binarySize,
                                            (const unsigned char**)&binary,
                                            NULL,
                                            &status);
        if(!checkVal(status, CL_SUCCESS, "clCreateProgramWithBinary failed."))
            return 0;
    }
    else
    {
        kernelPath.append(buildData.kernelName.c_str());
        if(!kernelFile.open(kernelPath.c_str()))
        {
            std::cout << "Failed to load kernel file: " << kernelPath << std::endl;
            return 0;
        }
        const char * source = kernelFile.source().c_str();
        size_t sourceSize[] = {strlen(source)};
        program = clCreateProgramWithSource(context,
                                            1,
                                            &source,
                                            sourceSize,
                                            &status);
        if(!checkVal(status, CL_SUCCESS, "clCreateProgramWithSource failed."))
            return 0;
    }

    std::string flagsStr = std::string(buildData.flagsStr.c_str());

    // Get additional options
    if(buildData.flagsFileName.size() != 0)
    {
        streamsdk::SDKFile flagsFile;
        std::string flagsPath = getPath();
        flagsPath.append(buildData.flagsFileName.c_str());
        if(!flagsFile.open(flagsPath.c_str()))
        {
            std::cout << "Failed to load flags file: " << flagsPath << std::endl;
            return 0;
        }
        flagsFile.replaceNewlineWithSpaces();
        const char * flags = flagsFile.source().c_str();
        flagsStr.append(flags);
    }

    if(flagsStr.size() != 0)
        std::cout << "Build Options are : " << flagsStr.c_str() << std::endl;

    /* create a cl program executable for all the devices specified */
    status = clBuildProgram(program, 1, &buildData.devices[buildData.deviceId], flagsStr.c_str(), NULL, NULL);
    if(status != CL_SUCCESS)
    {
        if(status == CL_BUILD_PROGRAM_FAILURE)
        {
            cl_int logStatus;
            char *buildLog = NULL;
            size_t buildLogSize = 0;
            logStatus = clGetProgramBuildInfo (
                            program, 
                            buildData.devices[buildData.deviceId], 
                            CL_PROGRAM_BUILD_LOG, 
                            buildLogSize, 
                            buildLog, 
                            &buildLogSize);
            if(!checkVal(logStatus, CL_SUCCESS, "clGetProgramBuildInfo failed."))
                return 0;

            buildLog = (char*)malloc(buildLogSize);
            if(buildLog == NULL)
            {
                error("Failed to allocate host memory. (buildLog)");
                return 0;
            }
            memset(buildLog, 0, buildLogSize);

            logStatus = clGetProgramBuildInfo (
                            program, 
                            buildData.devices[buildData.deviceId], 
                            CL_PROGRAM_BUILD_LOG, 
                            buildLogSize, 
                            buildLog, 
                            NULL);
            if(!checkVal(logStatus, CL_SUCCESS, "clGetProgramBuildInfo failed."))
            {
                free(buildLog);
                return 0;
            }

            std::cout << " \n\t\t\tBUILD LOG\n";
            std::cout << " ************************************************\n";
            std::cout << buildLog << std::endl;
            std::cout << " ************************************************\n";
            free(buildLog);
        }

        if(!checkVal(status, CL_SUCCESS, "clBuildProgram failed."))
            return 0;
    }

    return 1;
}

bool
SDKCommon::compare(const float *refData, const float *data, 
                        const int length, const float epsilon)
{
    float error = 0.0f;
    float ref = 0.0f;

    for(int i = 1; i < length; ++i) 
    {
        float diff = refData[i] - data[i];
        error += diff * diff;
        ref += refData[i] * refData[i];
    }

    float normRef =::sqrtf((float) ref);
    if (::fabs((float) ref) < 1e-7f) {
        return false;
    }
    float normError = ::sqrtf((float) error);
    error = normError / normRef;

    return error < epsilon;
}

bool
SDKCommon::compare(const double *refData, const double *data, 
                        const int length, const double epsilon)
{
    double error = 0.0;
    double ref = 0.0;

    for(int i = 1; i < length; ++i) 
    {
        double diff = refData[i] - data[i];
        error += diff * diff;
        ref += refData[i] * refData[i];
    }

    double normRef =::sqrt((double) ref);
    if (::fabs((double) ref) < 1e-7) {
        return false;
    }
    double normError = ::sqrt((double) error);
    error = normError / normRef;

    return error < epsilon;
}

size_t
SDKCommon::getLocalThreads(const size_t globalThreads,
                           const size_t maxWorkItemSize)
{
    if(maxWorkItemSize < globalThreads)
    {
        if(globalThreads%maxWorkItemSize == 0)
            return maxWorkItemSize;
        else
        {
            for(size_t i=maxWorkItemSize-1; i > 0; --i)
            {
                if(globalThreads%i == 0)
                    return i;
            }
        }
    }
    else
    {
        return globalThreads;
    }

    return 1;
}

int SDKCommon::createTimer()
{
    Timer* newTimer = new Timer;
    newTimer->_start = 0;
    newTimer->_clocks = 0;

#ifdef _WIN32
    QueryPerformanceFrequency((LARGE_INTEGER*)&newTimer->_freq);
#else
    newTimer->_freq = (long long)1.0E3;
#endif
    
    /* Push back the address of new Timer instance created */
    _timers.push_back(newTimer);

    /*if(_numTimers == 1)
    {
        _timers = newTimer; 
    }
    else
    {
        Timer *save = _timers;

        _timers = new Timer[_numTimers];
        memcpy(_timers,save,sizeof(Timer)*(_numTimers-1));
        _timers[_numTimers-1] = *newTimer;
        delete newTimer;
        newTimer = 0;

        if(_numTimers <= 2 )
        {
            delete save; 
        }
        else
        {
            delete[] save;
        }
        save = 0;
    }*/

    return (int)(_timers.size() - 1);
}

int SDKCommon::resetTimer(int handle)
{
    if(handle >= (int)_timers.size())
    {
        error("Cannot reset timer. Invalid handle.");
        return 0;
    }

    (_timers[handle]->_start) = 0;
    (_timers[handle]->_clocks) = 0;
    return 1;
}

int SDKCommon::startTimer(int handle)
{
    if(handle >= (int)_timers.size())
    {
        error("Cannot reset timer. Invalid handle.");
        return 0;
    }

#ifdef _WIN32
    QueryPerformanceCounter((LARGE_INTEGER*)&(_timers[handle]->_start));	
#else
    struct timeval s;
    gettimeofday(&s, 0);
    _timers[handle]->_start = (long long)s.tv_sec * (long long)1.0E3 + (long long)s.tv_usec / (long long)1.0E3;
#endif

    return 1;
}

int SDKCommon::stopTimer(int handle)
{
    long long n=0;

    if(handle >= (int)_timers.size())
    {
        error("Cannot reset timer. Invalid handle.");
        return 0;
    }

#ifdef _WIN32
    QueryPerformanceCounter((LARGE_INTEGER*)&(n));	
#else
    struct timeval s;
    gettimeofday(&s, 0);
    n = (long long)s.tv_sec * (long long)1.0E3+ (long long)s.tv_usec / (long long)1.0E3;
#endif

    n -= _timers[handle]->_start;
    _timers[handle]->_start = 0;
    _timers[handle]->_clocks += n;

    return 1;
}

double SDKCommon::readTimer(int handle)
{
    if(handle >= (int)_timers.size())
    {
        error("Cannot read timer. Invalid handle.");
        return 0;
    }

    double reading = double(_timers[handle]->_clocks);
    reading = double(reading / _timers[handle]->_freq);

    return reading;
}

void SDKCommon::printTable(Table *t)
{
    if(t == NULL)
    {
        error("Cannot print table, NULL pointer.");
        return;
    }

    int count = 0;
    // Skip delimiters at beginning.
    std::string::size_type curIndex = t->_dataItems.find_first_not_of(t->_delim, 0);
    // Find first "non-delimiter".
    std::string::size_type nextIndex = 
        t->_dataItems.find_first_of(t->_delim, curIndex);

    while (std::string::npos != nextIndex || std::string::npos != curIndex)
    {
        // Found a token, add it to the vector.
        // tokens.push_back(str.substr(curIndex, nextIndex - curIndex));
        std::cout<<std::setw(t->_columnWidth)<<std::left
                 <<t->_dataItems.substr(curIndex, nextIndex - curIndex);				 
        // Skip delimiters.  Note the "not_of"
        curIndex = t->_dataItems.find_first_not_of(t->_delim, nextIndex);
        // Find next "non-delimiter"
        nextIndex = t->_dataItems.find_first_of(t->_delim, curIndex);
        
        count++;

        if(count%t->_numColumns==0)
            std::cout<<"\n";
    }	
}

bool 
SDKCommon::fileToString(std::string &fileName, std::string &str)
{
    size_t      size;
    char*       buf;

    // Open file stream
    std::fstream f(fileName.c_str(), (std::fstream::in | std::fstream::binary));

    // Check if we have opened file stream
    if (f.is_open()) 
    {
        size_t  sizeFile;

        // Find the stream size
        f.seekg(0, std::fstream::end);
        size = sizeFile = (size_t)f.tellg();
        f.seekg(0, std::fstream::beg);

        buf = new char[size + 1];
        if (!buf) {
            f.close();
            return  false;
        }

        // Read file
        f.read(buf, sizeFile);
        f.close();
        str[size] = '\0';

        str = buf;

        return true;
    }
    else
    {
        error("Converting file to string. Cannot open file.");
        str = "";	
        return false;
    }
}

void 
SDKCommon::error(const char* errorMsg) const
{
    std::cout<<"Error: "<<errorMsg<<std::endl;
}

void 
SDKCommon::error(std::string errorMsg) const
{
    std::cout<<"Error: "<<errorMsg<<std::endl;
}

void 
SDKCommon::expectedError(const char* errorMsg) const
{
    std::cout<<"Expected Error: "<<errorMsg<<std::endl;
}

void 
SDKCommon::expectedError(std::string errorMsg) const
{
    std::cout<<"Expected Error: "<<errorMsg<<std::endl;
}

/////////////////////////////////////////////////////////////////
// Template Instantiations 
/////////////////////////////////////////////////////////////////
template 
void SDKCommon::printArray<short>(const std::string, 
        const short*, int, int)const;
template 
void SDKCommon::printArray<unsigned char>(const std::string, 
        const unsigned char *, int, int)const;
template 
void SDKCommon::printArray<unsigned int>(const std::string, 
        const unsigned int *, int, int)const;
template 
void SDKCommon::printArray<int>(const std::string, 
        const int *, int, int)const;
template 
void SDKCommon::printArray<long>(const std::string, 
        const long*, int, int)const;
template 
void SDKCommon::printArray<float>(const std::string, 
        const float*, int, int)const;
template 
void SDKCommon::printArray<double>(const std::string, 
        const double*, int, int)const;

template 
int SDKCommon::fillRandom<unsigned char>(unsigned char* arrayPtr, 
        const int width, const int height, 
        unsigned char rangeMin, unsigned char rangeMax, unsigned int seed);	
template 
int SDKCommon::fillRandom<unsigned int>(unsigned int* arrayPtr, 
        const int width, const int height, 
        unsigned int rangeMin, unsigned int rangeMax, unsigned int seed);	
template 
int SDKCommon::fillRandom<int>(int* arrayPtr, 
        const int width, const int height, 
        int rangeMin, int rangeMax, unsigned int seed);	
template 
int SDKCommon::fillRandom<long>(long* arrayPtr, 
        const int width, const int height, 
        long rangeMin, long rangeMax, unsigned int seed);	
template 
int SDKCommon::fillRandom<float>(float* arrayPtr, 
        const int width, const int height, 
        float rangeMin, float rangeMax, unsigned int seed);	
template 
int SDKCommon::fillRandom<double>(double* arrayPtr, 
        const int width, const int height, 
        double rangeMin, double rangeMax, unsigned int seed);	

template 
short SDKCommon::roundToPowerOf2<short>(short val);
template 
unsigned int SDKCommon::roundToPowerOf2<unsigned int>(unsigned int val);
template 
int SDKCommon::roundToPowerOf2<int>(int val);
template 
long SDKCommon::roundToPowerOf2<long>(long val);

template
int SDKCommon::isPowerOf2<short>(short val);
template
int SDKCommon::isPowerOf2<unsigned int>(unsigned int val);
template
int SDKCommon::isPowerOf2<int>(int val);
template
int SDKCommon::isPowerOf2<long>(long val);

template<> 
int SDKCommon::fillPos<short>(short * arrayPtr, const int width, const int height);
template<> 
int SDKCommon::fillPos<unsigned int>(unsigned int * arrayPtr, const int width, const int height);
template<> 
int SDKCommon::fillPos<int>(int * arrayPtr, const int width, const int height);
template<> 
int SDKCommon::fillPos<long>(long * arrayPtr, const int width, const int height);

template<> 
int SDKCommon::fillConstant<short>(short * arrayPtr, 
        const int width, const int height, 
        const short val);
template<> 
int SDKCommon::fillConstant(unsigned int * arrayPtr, 
        const int width, const int height, 
        const unsigned int val);
template<> 
int SDKCommon::fillConstant(int * arrayPtr, 
        const int width, const int height, 
        const int val);
template<> 
int SDKCommon::fillConstant(long * arrayPtr, 
        const int width, const int height, 
        const long val);
template<> 
int SDKCommon::fillConstant(long * arrayPtr, 
        const int width, const int height, 
        const long val);
template<> 
int SDKCommon::fillConstant(long * arrayPtr, 
        const int width, const int height, 
        const long val);


template
const char* getOpenCLErrorCodeStr<int>(int input);

template
int SDKCommon::checkVal<char>(char input, char reference, std::string message, bool isAPIerror) const;
template
int SDKCommon::checkVal<std::string>(std::string input, std::string reference, std::string message, bool isAPIerror) const;
template
int SDKCommon::checkVal<short>(short input, short reference, std::string message, bool isAPIerror) const;
template
int SDKCommon::checkVal<unsigned int>(unsigned int  input, unsigned int  reference, std::string message, bool isAPIerror) const;
template
int SDKCommon::checkVal<int>(int input, int reference, std::string message, bool isAPIerror) const;
template
int SDKCommon::checkVal<long>(long input, long reference, std::string message, bool isAPIerror) const;


template
std::string SDKCommon::toString<char>(char t, std::ios_base &(*r)(std::ios_base&));
template
std::string SDKCommon::toString<short>(short t, std::ios_base &(*r)(std::ios_base&));
template
std::string SDKCommon::toString<unsigned int>(unsigned int t, std::ios_base &(*r)(std::ios_base&));
template
std::string SDKCommon::toString<int>(int t, std::ios_base &(*r)(std::ios_base&));
template
std::string SDKCommon::toString<long>(long t, std::ios_base &(*r)(std::ios_base&));
template
std::string SDKCommon::toString<float>(float t, std::ios_base &(*r)(std::ios_base&));
template
std::string SDKCommon::toString<double>(double t, std::ios_base &(*r)(std::ios_base&));
}


