#include <SDKApplication.hpp>

int 
SDKSample::initialize()
{
    sampleCommon = new streamsdk::SDKCommon();
    int defaultOptions = 9;

    if(multiDevice)
        defaultOptions = 8;

    
    streamsdk::Option *optionList = new streamsdk::Option[defaultOptions];
    if(!optionList)
    {
        std::cout<<"Error. Failed to allocate memory (optionList)\n";
        return 0;
    }
    optionList[0]._sVersion = "";
    optionList[0]._lVersion = "device";
    
    if(multiDevice)
        optionList[0]._description = "Execute the openCL kernel on a device [cpu|gpu|all]";
    else
        optionList[0]._description = "Execute the openCL kernel on a device [cpu|gpu]";

    optionList[0]._type = streamsdk::CA_ARG_STRING;
    optionList[0]._value = &deviceType;

    optionList[1]._sVersion = "q";
    optionList[1]._lVersion = "quiet";
    optionList[1]._description = "Quiet mode. Suppress all text output.";
    optionList[1]._type = streamsdk::CA_NO_ARGUMENT;
    optionList[1]._value = &quiet;

    optionList[2]._sVersion = "e";
    optionList[2]._lVersion = "verify";
    optionList[2]._description = "Verify results against reference implementation.";
    optionList[2]._type = streamsdk::CA_NO_ARGUMENT;
    optionList[2]._value = &verify;

    optionList[3]._sVersion = "t";
    optionList[3]._lVersion = "timing";
    optionList[3]._description = "Print timing.";
    optionList[3]._type = streamsdk::CA_NO_ARGUMENT;
    optionList[3]._value = &timing;

    optionList[4]._sVersion = "";
    optionList[4]._lVersion = "dump";
    optionList[4]._description = "Dump binary image for all devices";
    optionList[4]._type = streamsdk::CA_ARG_STRING;
    optionList[4]._value = &dumpBinary;

    optionList[5]._sVersion = "";
    optionList[5]._lVersion = "load";
    optionList[5]._description = "Load binary image and execute on device";
    optionList[5]._type = streamsdk::CA_ARG_STRING;
    optionList[5]._value = &loadBinary;

    optionList[6]._sVersion = "";
    optionList[6]._lVersion = "flags";
    optionList[6]._description = "Specify compiler flags to build kernel";
    optionList[6]._type = streamsdk::CA_ARG_STRING;
    optionList[6]._value = &flags;

    optionList[7]._sVersion = "p";
    optionList[7]._lVersion = "platformId";
    optionList[7]._description = "Select platformId to be used[0 to N-1 where N is number platforms available].";
    optionList[7]._type = streamsdk::CA_ARG_INT;
    optionList[7]._value = &platformId;

    if(multiDevice == false)
    {
        optionList[8]._sVersion = "d";
        optionList[8]._lVersion = "deviceId";
        optionList[8]._description = "Select deviceId to be used[0 to N-1 where N is number devices available].";
        optionList[8]._type = streamsdk::CA_ARG_INT;
        optionList[8]._value = &deviceId;
    }

    sampleArgs = new streamsdk::SDKCommandArgs(defaultOptions, optionList);
    if(!sampleArgs)
    {
        std::cout<<"Failed to allocate memory. (sampleArgs)\n";
        return 0;
    }
                
    return 1;
}

void SDKSample::printStats(std::string *statsStr, std::string * stats, int n)
{
    if(timing)
    {
        streamsdk::Table sampleStats;

        sampleStats._numColumns = n;
        sampleStats._numRows = 1;
        sampleStats._columnWidth = 25;
        sampleStats._delim = '$';
        
        sampleStats._dataItems = "";
        for(int i=0; i < n; ++i)
        {
            sampleStats._dataItems.append( statsStr[i] + "$");
        }
        sampleStats._dataItems.append("$");

        for(int i=0; i < n; ++i)
        {
            sampleStats._dataItems.append( stats[i] + "$");
        }

        sampleCommon->printTable(&sampleStats);
    }
}

int SDKSample::parseCommandLine(int argc, char**argv)
{
    if(sampleArgs==NULL)
    {
        std::cout<<"Error. Command line parser not initialized.\n";
        return 0;
    }
    else
    {
        if(!sampleArgs->parse(argv,argc))
        {
            usage();
            return 0;
        }

        if(sampleArgs->isArgSet("h",true))
        {
            usage();
            return 1;
        }

        if(sampleArgs->isArgSet("p",true) || sampleArgs->isArgSet("platformId",false))
            enablePlatform = true;

        if(sampleArgs->isArgSet("d",true) || sampleArgs->isArgSet("deviceId",false))
            enableDeviceId = true;
    }

    /* check about the validity of the device type */

    if(multiDevice)
    {   
        if(!((deviceType.compare("cpu") == 0 ) 
              || (deviceType.compare("gpu") ==0) 
              || (deviceType.compare("all") ==0)))
        {
            std::cout << "Error. Invalid device options. "
                      << "only \"cpu\" or \"gpu\" or \"all\" supported\n";
            usage();
            return 0;
        }
    }
    else
    {
        if(!((deviceType.compare("cpu") == 0 ) || (deviceType.compare("gpu") ==0)))
        {
            std::cout << "Error. Invalid device options. "
                      << "only \"cpu\" or \"gpu\" or \"all\" supported\n";
            usage();
            return 0;
        }    
    }

    if(dumpBinary.size() != 0 && loadBinary.size() != 0)
    {
        std::cout << "Error. --dump and --load options are mutually exclusive\n";
        usage();
        return 0;
    }

    if(loadBinary.size() != 0 && flags.size() != 0)
    {
        std::cout << "Error. --flags and --load options are mutually exclusive\n";
        usage();
        return 0;
    }

    if(validatePlatfromAndDeviceOptions() == 0)
    {
        std::cout << "validatePlatfromAndDeviceOptions failed.\n ";
        return 0;
    }

    return 1;
}

int SDKSample::validatePlatfromAndDeviceOptions()
{
    cl_int status = CL_SUCCESS;
    cl_uint numPlatforms;
    cl_platform_id platform = NULL;
    status = clGetPlatformIDs(0, NULL, &numPlatforms);
    if(status != CL_SUCCESS)
    {
        std::cout<<"Error: clGetPlatformIDs failed. Error code : ";
        std::cout << streamsdk::getOpenCLErrorCodeStr(status) << std::endl;
        return 0;
    }

    if (0 < numPlatforms) 
    {
        // Validate platformId
        if(platformId >= numPlatforms)
        {
            if(numPlatforms - 1 == 0)
                std::cout << "platformId should be 0" << std::endl;
            else
                std::cout << "platformId should be 0 to " << numPlatforms - 1 << std::endl;
            usage();
            return 0;
        }

        // Get selected platform
        cl_platform_id* platforms = new cl_platform_id[numPlatforms];
        status = clGetPlatformIDs(numPlatforms, platforms, NULL);
        if(status != CL_SUCCESS)
        {
            std::cout<<"Error: clGetPlatformIDs failed. Error code : ";
            std::cout << streamsdk::getOpenCLErrorCodeStr(status) << std::endl;
            return 0;
        }

        // Print all platforms
        for (unsigned i = 0; i < numPlatforms; ++i) 
        {
            char pbuf[100];
            status = clGetPlatformInfo(platforms[i],
                                       CL_PLATFORM_VENDOR,
                                       sizeof(pbuf),
                                       pbuf,
                                       NULL);

            if(status != CL_SUCCESS)
            {
                std::cout<<"Error: clGetPlatformInfo failed. Error code : ";
                std::cout << streamsdk::getOpenCLErrorCodeStr(status) << std::endl;
                return 0;
            }

            std::cout << "Platform " << i << " : " << pbuf << std::endl;
        }

        // Get AMD platform
        for (unsigned i = 0; i < numPlatforms; ++i) 
        {
            char pbuf[100];
            status = clGetPlatformInfo(platforms[i],
                                       CL_PLATFORM_VENDOR,
                                       sizeof(pbuf),
                                       pbuf,
                                       NULL);

            if(status != CL_SUCCESS)
            {
                std::cout<<"Error: clGetPlatformInfo failed. Error code : ";
                std::cout << streamsdk::getOpenCLErrorCodeStr(status) << std::endl;
                return 0;
            }

            platform = platforms[i];
            if (!strcmp(pbuf, "Advanced Micro Devices, Inc.")) 
            {
                break;
            }
        }

        if(isPlatformEnabled())
            platform = platforms[platformId];


        // Check for AMD platform
        char pbuf[100];
        status = clGetPlatformInfo(platform,
                                   CL_PLATFORM_VENDOR,
                                   sizeof(pbuf),
                                   pbuf,
                                   NULL);

        if(status != CL_SUCCESS)
        {
            std::cout<<"Error: clGetPlatformInfo failed. Error code : ";
            std::cout << streamsdk::getOpenCLErrorCodeStr(status) << std::endl;
            return 0;
        }
        if (!strcmp(pbuf, "Advanced Micro Devices, Inc.")) 
            amdPlatform = true; 


        cl_device_type dType = CL_DEVICE_TYPE_GPU;
        if(deviceType.compare("cpu") == 0)
            dType = CL_DEVICE_TYPE_CPU;
        if(deviceType.compare("gpu") == 0)
            dType = CL_DEVICE_TYPE_GPU;
        else
            dType = CL_DEVICE_TYPE_ALL;

        // Check for GPU
        if(dType == CL_DEVICE_TYPE_GPU)
        {
            cl_context_properties cps[3] = 
            {
                CL_CONTEXT_PLATFORM, 
                (cl_context_properties)platform, 
                0
            };

            cl_context context = clCreateContextFromType(cps,
                                                        dType,
                                                        NULL,
                                                        NULL,
                                                        &status);

            if(status == CL_DEVICE_NOT_FOUND)
            {
                dType = CL_DEVICE_TYPE_CPU;
                gpu = false;
            }

            clReleaseContext(context);
        }

        // Get device count
        cl_uint deviceCount = 0;
        status = clGetDeviceIDs(platform, dType, 0, NULL, &deviceCount);
        if(status != CL_SUCCESS)
        {
            std::cout<<"Error: clGetDeviceIDs failed. Error code : ";
            std::cout << streamsdk::getOpenCLErrorCodeStr(status) << std::endl;
            return 0;
        }

        // Validate deviceId
        if(deviceId >= deviceCount)
        {
            if(deviceCount - 1 == 0)
                std::cout << "deviceId should be 0" << std::endl;
            else
                std::cout << "deviceId should be 0 to " << deviceCount - 1 << std::endl;
            usage();
            return 0;
        }

        delete[] platforms;
    }
    return 1;
}

void SDKSample::usage()
{
    if(sampleArgs==NULL)
        std::cout<<"Error. Command line parser not initialized.\n";
    else
    {
        std::cout<<"Usage\n";
        std::cout<<sampleArgs->help();
    }
}

SDKSample::SDKSample(std::string sampleName, bool enableMultiDevice)
{
    name = sampleName;
    sampleCommon = NULL;
    sampleArgs = NULL;
    quiet = 0;
    verify = 0;
    timing = 0;
    deviceType = "gpu";
    multiDevice = enableMultiDevice;
    deviceId = 0;
    platformId = 0;
    enablePlatform = false;
    enableDeviceId = false;
    gpu = true;
    amdPlatform = false;
}

SDKSample::SDKSample(const char* sampleName, bool enableMultiDevice)
{
    name = sampleName;
    sampleCommon = NULL;
    sampleArgs = NULL;
    quiet = 0;
    verify = 0;
    timing = 0;
    deviceType = "gpu";
    multiDevice = enableMultiDevice;
    deviceId = 0;
    platformId = 0;
    enablePlatform = false;
    enableDeviceId = false;
    gpu = true;
    amdPlatform = false;
}

SDKSample::~SDKSample()
{
    delete sampleCommon;
    delete sampleArgs;
}
