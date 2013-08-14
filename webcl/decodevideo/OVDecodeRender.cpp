/* ============================================================

Copyright (c) 2011 Advanced Micro Devices, Inc.  All rights reserved.
 
Redistribution and use of this material is permitted under the following 
conditions:
 
Redistributions must retain the above copyright notice and all terms of this 
license.
 
In no event shall anyone redistributing or accessing or using this material 
commence or participate in any arbitration or legal action relating to this 
material against Advanced Micro Devices, Inc. or any copyright holders or 
contributors. The foregoing shall survive any expiration or termination of 
this license or any agreement or access or use related to this material. 

ANY BREACH OF ANY TERM OF THIS LICENSE SHALL RESULT IN THE IMMEDIATE REVOCATION 
OF ALL RIGHTS TO REDISTRIBUTE, ACCESS OR USE THIS MATERIAL.

THIS MATERIAL IS PROVIDED BY ADVANCED MICRO DEVICES, INC. AND ANY COPYRIGHT 
HOLDERS AND CONTRIBUTORS "AS IS" IN ITS CURRENT CONDITION AND WITHOUT ANY 
REPRESENTATIONS, GUARANTEE, OR WARRANTY OF ANY KIND OR IN ANY WAY RELATED TO 
SUPPORT, INDEMNITY, ERROR FREE OR UNINTERRUPTED OPERA TION, OR THAT IT IS FREE 
FROM DEFECTS OR VIRUSES.  ALL OBLIGATIONS ARE HEREBY DISCLAIMED - WHETHER 
EXPRESS, IMPLIED, OR STATUTORY - INCLUDING, BUT NOT LIMITED TO, ANY IMPLIED 
WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
ACCURACY, COMPLETENESS, OPERABILITY, QUALITY OF SERVICE, OR NON-INFRINGEMENT. 
IN NO EVENT SHALL ADVANCED MICRO DEVICES, INC. OR ANY COPYRIGHT HOLDERS OR 
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, REVENUE, DATA, OR PROFITS; OR 
BUSINESS INTERRUPTION) HOWEVER CAUSED OR BASED ON ANY THEORY OF LIABILITY 
ARISING IN ANY WAY RELATED TO THIS MATERIAL, EVEN IF ADVISED OF THE POSSIBILITY 
OF SUCH DAMAGE. THE ENTIRE AND AGGREGATE LIABILITY OF ADVANCED MICRO DEVICES, 
INC. AND ANY COPYRIGHT HOLDERS AND CONTRIBUTORS SHALL NOT EXCEED TEN DOLLARS 
(US $10.00). ANYONE REDISTRIBUTING OR ACCESSING OR USING THIS MATERIAL ACCEPTS 
THIS ALLOCATION OF RISK AND AGREES TO RELEASE ADVANCED MICRO DEVICES, INC. AND 
ANY COPYRIGHT HOLDERS AND CONTRIBUTORS FROM ANY AND ALL LIABILITIES, 
OBLIGATIONS, CLAIMS, OR DEMANDS IN EXCESS OF TEN DOLLARS (US $10.00). THE 
FOREGOING ARE ESSENTIAL TERMS OF THIS LICENSE AND, IF ANY OF THESE TERMS ARE 
CONSTRUED AS UNENFORCEABLE, FAIL IN ESSENTIAL PURPOSE, OR BECOME VOID OR 
DETRIMENTAL TO ADVANCED MICRO DEVICES, INC. OR ANY COPYRIGHT HOLDERS OR 
CONTRIBUTORS FOR ANY REASON, THEN ALL RIGHTS TO REDISTRIBUTE, ACCESS OR USE 
THIS MATERIAL SHALL TERMINATE IMMEDIATELY. MOREOVER, THE FOREGOING SHALL 
SURVIVE ANY EXPIRATION OR TERMINATION OF THIS LICENSE OR ANY AGREEMENT OR 
ACCESS OR USE RELATED TO THIS MATERIAL.

NOTICE IS HEREBY PROVIDED, AND BY REDISTRIBUTING OR ACCESSING OR USING THIS 
MATERIAL SUCH NOTICE IS ACKNOWLEDGED, THAT THIS MATERIAL MAY BE SUBJECT TO 
RESTRICTIONS UNDER THE LAWS AND REGULATIONS OF THE UNITED STATES OR OTHER 
COUNTRIES, WHICH INCLUDE BUT ARE NOT LIMITED TO, U.S. EXPORT CONTROL LAWS SUCH 
AS THE EXPORT ADMINISTRATION REGULATIONS AND NATIONAL SECURITY CONTROLS AS 
DEFINED THEREUNDER, AS WELL AS STATE DEPARTMENT CONTROLS UNDER THE U.S. 
MUNITIONS LIST. THIS MATERIAL MAY NOT BE USED, RELEASED, TRANSFERRED, IMPORTED,
EXPORTED AND/OR RE-EXPORTED IN ANY MANNER PROHIBITED UNDER ANY APPLICABLE LAWS, 
INCLUDING U.S. EXPORT CONTROL LAWS REGARDING SPECIFICALLY DESIGNATED PERSONS, 
COUNTRIES AND NATIONALS OF COUNTRIES SUBJECT TO NATIONAL SECURITY CONTROLS. 
MOREOVER, THE FOREGOING SHALL SURVIVE ANY EXPIRATION OR TERMINATION OF ANY 
LICENSE OR AGREEMENT OR ACCESS OR USE RELATED TO THIS MATERIAL.

NOTICE REGARDING THE U.S. GOVERNMENT AND DOD AGENCIES: This material is 
provided with "RESTRICTED RIGHTS" and/or "LIMITED RIGHTS" as applicable to 
computer software and technical data, respectively. Use, duplication, 
distribution or disclosure by the U.S. Government and/or DOD agencies is 
subject to the full extent of restrictions in all applicable regulations, 
including those found at FAR52.227 and DFARS252.227 et seq. and any successor 
regulations thereof. Use of this material by the U.S. Government and/or DOD 
agencies is acknowledgment of the proprietary rights of any copyright holders 
and contributors, including those of Advanced Micro Devices, Inc., as well as 
the provisions of FAR52.227-14 through 23 regarding privately developed and/or 
commercial computer software.

This license forms the entire agreement regarding the subject matter hereof and 
supersedes all proposals and prior discussions and writings between the parties 
with respect thereto. This license does not affect any ownership, rights, title,
or interest in, or relating to, this material. No terms of this license can be 
modified or waived, and no breach of this license can be excused, unless done 
so in a writing signed by all affected parties. Each term of this license is 
separately enforceable. If any term of this license is determined to be or 
becomes unenforceable or illegal, such term shall be reformed to the minimum 
extent necessary in order for this license to remain in effect in accordance 
with its terms as modified by such reformation. This license shall be governed 
by and construed in accordance with the laws of the State of Texas without 
regard to rules on conflicts of law of any state or jurisdiction or the United 
Nations Convention on the International Sale of Goods. All disputes arising out 
of this license shall be subject to the jurisdiction of the federal and state 
courts in Austin, Texas, and all defenses are hereby waived concerning personal 
jurisdiction and venue of these courts.

============================================================ */

#include "OVDecodeRender.h"


typedef enum
{
  DEC_GEN_NOERR = 0,
  DEC_OPEN_NOERR = 0,
  DEC_CLOSE_NOERR = 0,  
  DEC_SUCCEED = 0,
  DEC_EOS =1,
  DEC_NEED_DATA = 2,
  DEC_INVALID_PARAM = 3,
  DEC_ERRMASK = 0x8000
//  DEC_ERRMASK = 0x80000000
}DecErrCode;

typedef enum
{
  P_Frame = 0,
  B_Frame = 1,
  I_Frame = 2,
  SP_Frame = 3,
  SI_Frame = 4,
  NUM_Frame_TYPES = 5
} FrameType;

#ifndef _STANDARD_TYPEDEFS_DEFINED_ 
#define _STANDARD_TYPEDEFS_DEFINED_ 
//---------------------------------------------------------------------------------------- 
// Define sized-based typedefs up to 32-bits. 
//---------------------------------------------------------------------------------------- 
typedef signed char             int8; 
typedef unsigned char           uint8; 
 
typedef signed short            int16; 
typedef unsigned short          uint16; 
 
typedef signed int              int32; 
typedef unsigned int            uint32; 
 
//---------------------------------------------------------------------------------------- 
// Define 64-bit typedefs, depending on the compiler and operating system. 
//---------------------------------------------------------------------------------------- 
#ifdef __GNUC__ 
typedef long long               int64; 
typedef unsigned long long      uint64; 
 
#else                                        // not __GNUC__ 
#ifdef _WIN32 
typedef __int64                 int64; 
typedef unsigned __int64        uint64; 
 
#else                                        // not _WIN32 
#error Unsupported compiler and/or operating system 
#endif                                       // end ifdef _WIN32 
 
#endif                                       // end ifdef __GNUC__ 
 
//---------------------------------------------------------------------------------------- 
// Define other generic typedefs. 
//---------------------------------------------------------------------------------------- 
typedef unsigned int            uint; 
typedef unsigned long           ulong; 
 
//**************************************************************************************** 
// End of _STANDARD_TYPEDEFS_DEFINED_ 
//**************************************************************************************** 
#endif 


typedef enum
{
  VC1_Codec = 0,
  H264_Codec = 1,
  MPEG2VLD_Codec = 2,
  NUM_Codec_TYPES = 3
} CodecType;

std::string codecFormat;
CodecType OurCurrCodec = H264_Codec;                // H.264 is default unless commandline override.
MPEG2_picture_parameter_2 curPicParam2_mpeg2VLD; 
//mpeg2_PicParams curPicParam2_mpeg2;  
bool  redisplay_last_frame_only = true;        // Use when debugging if to do only one frame.

std::string g_output_file_name = "DecodedPicture.yuv";

ovd_bitstream_data g_decoded_frame;
int                g_decoded_frame_size;
int                g_frame_num;
FrameType          g_frame_type;
extern HANDLE      g_continue_ovd;
bool               enable_gaussian_blur = false;
void               *ppParsePicList;
int                iRet;
unsigned int       sliceNum;
ov_session         session;
cl_int             err;
int                video_width;
int                video_height;
unsigned int       oWidth;
unsigned int       oHeight;
void               *host_ptr;

HANDLE                    g_continue_ovd;
HWND                      g_hwnd;
HDC                       g_hdc;
HGLRC                     g_glCtx;
MSG                       msg;
BOOL                      EndLoop = FALSE;
int                       iFramesDecoded;
bool                      verify;

ovd_picture_parameter    picture_parameter;
ovd_bitstream_data       bitstream_data;
unsigned int             bitstream_data_max_size;
unsigned int             slice_data_control_size;
ovd_slice_data_control  *slice_data_control;
H264_picture_parameter_2 pic_parameter_2;
unsigned int             pic_parameter_2_size;
unsigned int             pic_parameter_2_sizeVLD;
unsigned int             num_event_in_wait_list;

GLuint tex;    //Texture to display
_int64 timeStart = 0;

// OpenCL memory buffers
cl_mem             pitch_removed_buffer;
cl_mem             rgb_buffer;              //width x height 2D Image
#ifdef USE_GL_INTEROP
cl_mem             rgb_buffer_transposed;   //height x width 2D Image
#endif

// buffer required for Recursive Gaussian
cl_mem             post_processed_buffer0;

cl_command_queue   cl_cmd_queue;
cl_program         program;

// Kernels
cl_kernel          remove_pitch_kernel;
cl_kernel          nv12_to_rgb_kernel;
cl_kernel          post_processing_kernel_transpose;    //Transpose kernel
cl_kernel          post_processing_kernel_RG;           //RecursiveGaussian kernel

// Local Threads for all the kernels
size_t localThreads_remove_pitch_kernel[] = {1, 1};
size_t localThreads_nv12_to_rgb_kernel[] = {1, 1};
size_t localThreads_post_processing_kernel_transpose[] = {1, 1};
size_t localThreads_post_processing_kernel_RG;

OPContextHandle    ovdContext;
#define         MAX_OUTPUT_SUF      3
OPMemHandle     output_surfaces[MAX_OUTPUT_SUF];
OPMemHandle     queued_surface;
OPMemHandle     output_surface;
cl_device_id    clDeviceID;
cl_platform_id  platform;
int             video_pitch;

#ifdef _WIN32
LRESULT CALLBACK WndProc(HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam);
#endif

/////////////////////////////////////////////////////////////////
// Functions
/////////////////////////////////////////////////////////////////

cl_platform_id OVDecodeRender::getPlatformID()
{
    cl_uint numPlatforms;
    cl_platform_id platform = NULL;
    cl_int err = clGetPlatformIDs(0, NULL, &numPlatforms);
    if(err != CL_SUCCESS)
    {
        std::cout<<"clGetPlatformID failed";
        return NULL;
    }

    
    if (0 < numPlatforms) {
        cl_platform_id* platforms = new cl_platform_id[numPlatforms];
        err = clGetPlatformIDs(numPlatforms, platforms, NULL);
        if(err != CL_SUCCESS)
        {
            std::cout<<"clGetPlatformID failed";
            return NULL;
        }
            
        if(isPlatformEnabled())
        {
            platform = platforms[platformId];
        }
        else
        {
            for (unsigned i = 0; i < numPlatforms; ++i) {
                char pbuf[100];
                err = clGetPlatformInfo(
                             platforms[i],
                             CL_PLATFORM_VENDOR,
                             sizeof(pbuf),
                             pbuf,
                             NULL);
                if(err != CL_SUCCESS)
                {
                    std::cout<<"clGetPlatformInfo failed";
                    return NULL;
                }

                if (!strcmp(pbuf, "Advanced Micro Devices, Inc.")) {
                    platform = platforms[i];
                    break;
                }
            }
        }
        delete platforms;
    }
    return platform;
}


// Create GL context
void OVDecodeRender::enableOpenGL(HWND &hwnd, HDC &hdc, HGLRC &hrc, cl_platform_id platform, cl_context &context, cl_device_id &interopDevice)
{
    cl_int status;
    BOOL ret = FALSE;
    DISPLAY_DEVICE dispDevice;
    DWORD deviceNum;
    int  pfmt;
    PIXELFORMATDESCRIPTOR  pfd; 
    pfd.nSize           = sizeof(PIXELFORMATDESCRIPTOR); 
    pfd.nVersion        = 1; 
    pfd.dwFlags         = PFD_DRAW_TO_WINDOW | PFD_SUPPORT_OPENGL  | PFD_DOUBLEBUFFER ;
    pfd.iPixelType      = PFD_TYPE_RGBA; 
    pfd.cColorBits      = 24; 
    pfd.cRedBits        = 8; 
    pfd.cRedShift       = 0; 
    pfd.cGreenBits      = 8; 
    pfd.cGreenShift     = 0; 
    pfd.cBlueBits       = 8; 
    pfd.cBlueShift      = 0; 
    pfd.cAlphaBits      = 8;
    pfd.cAlphaShift     = 0; 
    pfd.cAccumBits      = 0; 
    pfd.cAccumRedBits   = 0; 
    pfd.cAccumGreenBits = 0; 
    pfd.cAccumBlueBits  = 0; 
    pfd.cAccumAlphaBits = 0; 
    pfd.cDepthBits      = 24; 
    pfd.cStencilBits    = 8; 
    pfd.cAuxBuffers     = 0; 
    pfd.iLayerType      = PFD_MAIN_PLANE;
    pfd.bReserved       = 0; 
    pfd.dwLayerMask     = 0;
    pfd.dwVisibleMask   = 0; 
    pfd.dwDamageMask    = 0;

    ZeroMemory(&pfd, sizeof(PIXELFORMATDESCRIPTOR));

    dispDevice.cb = sizeof(DISPLAY_DEVICE);

    DWORD displayDevices = 0;
    DWORD connectedDisplays = 0;

    int xCoordinate = 0;
    int yCoordinate = 0;
    int xCoordinate1 = 0;

    for (deviceNum = 0; EnumDisplayDevices(NULL, deviceNum, &dispDevice, 0); deviceNum++) 
    {
        if (dispDevice.StateFlags & DISPLAY_DEVICE_MIRRORING_DRIVER) 
        {
                continue;
        }

        if(!(dispDevice.StateFlags & DISPLAY_DEVICE_ACTIVE))
        {
            std::cout<<"Display device "<<deviceNum<<" is not connected!!"<<std::endl;
            continue;
        }

        DEVMODE deviceMode;

        // initialize the DEVMODE structure
        ZeroMemory(&deviceMode, sizeof(deviceMode));
        deviceMode.dmSize = sizeof(deviceMode);
        deviceMode.dmDriverExtra = 0;

        
        EnumDisplaySettings(dispDevice.DeviceName, ENUM_CURRENT_SETTINGS, &deviceMode);

        xCoordinate = deviceMode.dmPosition.x;
        yCoordinate = deviceMode.dmPosition.y;

        WNDCLASS windowclass;
        windowclass.style = CS_OWNDC;
        windowclass.lpfnWndProc = WndProc;
        windowclass.cbClsExtra = 0;
        windowclass.cbWndExtra = 0;
        windowclass.hInstance = NULL;//hInstance;
        windowclass.hIcon = LoadIcon(NULL, IDI_APPLICATION);
        windowclass.hCursor = LoadCursor(NULL, IDC_ARROW);
        windowclass.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);
        windowclass.lpszMenuName = NULL;
        windowclass.lpszClassName = "GLRenderer";
        RegisterClass(&windowclass);

        g_hwnd = CreateWindow("GLRenderer", 
                              "OpenGL Texture Renderer", 
                              WS_CAPTION | WS_POPUPWINDOW | WS_VISIBLE, 
                              isDeviceIdEnabled() ? xCoordinate1 : xCoordinate, 
                              yCoordinate,
                              screen_width, 
                              screen_height, 
                              NULL, 
                              NULL, 
                              windowclass.hInstance, 
                              NULL);

        hdc = GetDC(hwnd);

        if (!hdc) 
        {
            continue ;
        }

        pfmt = ChoosePixelFormat(hdc, 
                    &pfd);
        if(pfmt == 0) 
        {
            std::cout<<"Failed choosing the requested PixelFormat.\n";
            //return NULL;
        }

        ret = SetPixelFormat(hdc, pfmt, &pfd);
        
        if(ret == FALSE) 
        {
            std::cout<<"Failed to set the requested PixelFormat.\n";
        }
        
        hrc = wglCreateContext(hdc);
        if(hrc == NULL) 
        {
            std::cerr<<"Failed to create a GL context"<<std::endl;
        }

        ret = wglMakeCurrent(hdc, hrc);
        if(ret == FALSE) 
        {
            std::cout<<"Failed to bind GL rendering context";
        }	
        displayDevices++;

        cl_context_properties properties[] = 
        {
                CL_CONTEXT_PLATFORM, (cl_context_properties) platform,
                CL_GL_CONTEXT_KHR,   (cl_context_properties) hrc,
                CL_WGL_HDC_KHR,      (cl_context_properties) hdc,
                0
        };
        
        if (!clGetGLContextInfoKHR) 
        {
               clGetGLContextInfoKHR = (clGetGLContextInfoKHR_fn) clGetExtensionFunctionAddress("clGetGLContextInfoKHR");
               if (!clGetGLContextInfoKHR) 
               {
                    std::cerr<<"Failed to query proc address for clGetGLContextInfoKHR";
               }
        }
        
        size_t deviceSize = 0;
        status = clGetGLContextInfoKHR(properties, 
                                      CL_CURRENT_DEVICE_FOR_GL_CONTEXT_KHR,
                                      0, 
                                      NULL, 
                                      &deviceSize);
        if(status != CL_SUCCESS)
            std::cerr<<"clGetGLContextInfoKHR failed!!";
        
        if (deviceSize == 0) 
        {
            // no interopable CL device found, cleanup
            wglMakeCurrent(NULL, NULL);
            wglDeleteContext(hrc);
            DeleteDC(hdc);
            hdc = NULL;
            hrc = NULL;
            DestroyWindow(hwnd);
            // try the next display
            continue;
        }
        else 
        {
            if (deviceId == 0)
            {
                ShowWindow(g_hwnd, SW_SHOW);
                //Found a winner 
                break;
            }
            else if (deviceId != connectedDisplays)
            {
                connectedDisplays++;
                wglMakeCurrent(NULL, NULL);
                wglDeleteContext(hrc);
                DeleteDC(hdc);
                hdc = NULL;
                hrc = NULL;
                DestroyWindow(g_hwnd);
                if (xCoordinate >= 0)
                {
                    xCoordinate1 += deviceMode.dmPelsWidth;
                    // try the next display
                }
                else 
                {
                    xCoordinate1 -= deviceMode.dmPelsWidth;
                }

                continue;
            } 
            else 
            {
                ShowWindow(g_hwnd, SW_SHOW);
                //Found a winner 
                break;
            }
        }
    }

     if (!hrc || !hdc) 
     {
        std::cerr<<"No GL context bound";
     }

     cl_context_properties properties[] = 
     {
            CL_CONTEXT_PLATFORM, (cl_context_properties) platform,
            CL_GL_CONTEXT_KHR,   (cl_context_properties) hrc,
            CL_WGL_HDC_KHR,      (cl_context_properties) hdc,
            0
     };

     status = clGetGLContextInfoKHR( properties, 
                                    CL_CURRENT_DEVICE_FOR_GL_CONTEXT_KHR,
                                    sizeof(cl_device_id), 
                                    &interopDevice, 
                                    NULL);
     if(status != CL_SUCCESS)
        std::cerr<<"clGetGLContextInfoKHR failed!!";
    
     // Create OpenCL context from device's id
    context = clCreateContext(properties,
                                 1,
                                 &interopDevice,
                                 0,
                                 0,
                                 &status);
    if(status != CL_SUCCESS)
        std::cerr<<"clCreateContext failed!!";

    std::cout<<"display devices "<<displayDevices<<std::endl;

    // OpenGL animation code goes here
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    // setup texture mapping
    glEnable(GL_TEXTURE_2D);
}

bool OVDecodeRender::createKernels()
{
    cl_int status;

    // create a CL program using the kernel source 
    streamsdk::SDKFile kernelFile;
    std::string kernelPath = sampleCommon->getPath();
    if(isLoadBinaryEnabled())
    {
        kernelPath.append(loadBinary.c_str());
        if(!kernelFile.readBinaryFromFile(kernelPath.c_str()))
        {
            std::cout << "Failed to load kernel file : " << kernelPath << std::endl;
            return SDK_FAILURE;
        }

        const char * binary = kernelFile.source().c_str();
        size_t binarySize = kernelFile.source().size();
        program = clCreateProgramWithBinary((cl_context)ovdContext,
                                            1,
                                            &clDeviceID, 
                                            (const size_t *)&binarySize,
                                            (const unsigned char**)&binary,
                                            NULL,
                                            &status);
        if(!sampleCommon->checkVal(status,
                                   CL_SUCCESS,
                                   "clCreateProgramWithBinary failed."))
        {
            return SDK_FAILURE;
        }

    }
    else
    {
        kernelPath.append("OVDecodeRender_Kernels.cl");
        if(!kernelFile.open(kernelPath.c_str()))
        {
            std::cout << "Failed to load kernel file : " << kernelPath << std::endl;
            return SDK_FAILURE;
        }

        const char * source = kernelFile.source().c_str();
        size_t sourceSize[] = {strlen(source)};
        program = clCreateProgramWithSource((cl_context)ovdContext,
                                            1,
                                            &source,
                                            sourceSize,
                                            &status);
        if(!sampleCommon->checkVal(status,
                                   CL_SUCCESS,
                                   "clCreateProgramWithSource failed."))
        {
            return SDK_FAILURE;
        }
    }

#ifdef USE_GL_INTEROP
    std::string flagsStr("-D USE_GL_INTEROP");
#else
    std::string flagsStr("");
#endif

    // Get additional options
    if(isComplierFlagsSpecified())
    {
        streamsdk::SDKFile flagsFile;
        std::string flagsPath = sampleCommon->getPath();
        flagsPath.append(flags.c_str());
        if(!flagsFile.open(flagsPath.c_str()))
        {
            std::cout << "Failed to load flags file: " << flagsPath << std::endl;
            return SDK_FAILURE;
        }
        flagsFile.replaceNewlineWithSpaces();
        const char * flags = flagsFile.source().c_str();
        flagsStr.append(flags);
    }

    if(flagsStr.size() != 0)
        std::cout << "Build Options are : " << flagsStr.c_str() << std::endl;
    

    /* create a cl program executable for all the devices specified */
    status = clBuildProgram(program, 
                            1, 
                            &clDeviceID, 
                            flagsStr.c_str(), 
                            NULL, 
                            NULL);
    if(status != CL_SUCCESS)
    {
        if(status == CL_BUILD_PROGRAM_FAILURE)
        {
            cl_int logStatus;
            char * buildLog = NULL;
            size_t buildLogSize = 0;
            logStatus = clGetProgramBuildInfo(program, 
                                              clDeviceID, 
                                              CL_PROGRAM_BUILD_LOG, 
                                              buildLogSize, 
                                              buildLog, 
                                              &buildLogSize);
            if(!sampleCommon->checkVal(logStatus,
                                       CL_SUCCESS,
                                       "clGetProgramBuildInfo failed."))
            {
                return SDK_FAILURE;
            }
            
            buildLog = (char*)malloc(buildLogSize);
            if(buildLog == NULL)
            {
                sampleCommon->error("Failed to allocate host memory.(buildLog)");
                return SDK_FAILURE;
            }
            memset(buildLog, 0, buildLogSize);

            logStatus = clGetProgramBuildInfo(program, 
                                              clDeviceID, 
                                              CL_PROGRAM_BUILD_LOG, 
                                              buildLogSize, 
                                              buildLog, 
                                              NULL);
            if(!sampleCommon->checkVal(logStatus,
                                       CL_SUCCESS,
                                       "clGetProgramBuildInfo failed."))
            {
                  free(buildLog);
                  return SDK_FAILURE;
            }

            std::cout << " \n\t\t\tBUILD LOG\n";
            std::cout << " ************************************************\n";
            std::cout << buildLog << std::endl;
            std::cout << " ************************************************\n";
            free(buildLog);
        }

        if(!sampleCommon->checkVal(status,
                                   CL_SUCCESS,
                                   "clBuildProgram failed."))
        {
            return SDK_FAILURE;
        }
    }

    /* get a kernel object handle for a kernel with the given name */
    remove_pitch_kernel = clCreateKernel(program, "removePitch", &status);
    CHECK_OPENCL_ERROR(status, "Error: clCreateKernel. (removePitch)\n");

    size_t temp = 0;
    err = clGetKernelWorkGroupInfo(remove_pitch_kernel,
        clDeviceID,
        CL_KERNEL_WORK_GROUP_SIZE,
        sizeof(temp),
        &temp,
        0);
    CHECK_OPENCL_ERROR(status, "clGetKernelWorkGroupInfo failed");

    while(localThreads_remove_pitch_kernel[0] *
          localThreads_remove_pitch_kernel[1] < temp)
    {
        if(2 * localThreads_remove_pitch_kernel[0] *
           localThreads_remove_pitch_kernel[1] <= temp)
            localThreads_remove_pitch_kernel[0] *= 2;

        if(2 * localThreads_remove_pitch_kernel[0] *
           localThreads_remove_pitch_kernel[1] <= temp)
            localThreads_remove_pitch_kernel[1] *= 2;
    }

    nv12_to_rgb_kernel = clCreateKernel(program, "NV12toRGB", &status);
    CHECK_OPENCL_ERROR(status, "Error: clCreateKernel. (NV12toRGB)\n");

    err = clGetKernelWorkGroupInfo(nv12_to_rgb_kernel,
        clDeviceID,
        CL_KERNEL_WORK_GROUP_SIZE,
        sizeof(temp),
        &temp,
        0);
    CHECK_OPENCL_ERROR(status, "clGetKernelWorkGroupInfo failed");

    while(localThreads_nv12_to_rgb_kernel[0] * 
          localThreads_nv12_to_rgb_kernel[1] < temp)
    {
        if(2 * localThreads_nv12_to_rgb_kernel[0] *
           localThreads_nv12_to_rgb_kernel[1] <= temp)
            localThreads_nv12_to_rgb_kernel[0] *= 2;

        if(2 * localThreads_nv12_to_rgb_kernel[0] *
           localThreads_nv12_to_rgb_kernel[1] <= temp)
            localThreads_nv12_to_rgb_kernel[1] *= 2;
    }

    post_processing_kernel_transpose = clCreateKernel(program, 
                                                      "transpose_kernel", 
                                                      &status);
    CHECK_OPENCL_ERROR(status, "Error: clCreateKernel. (transpose_kernel)\n");

    err = clGetKernelWorkGroupInfo(post_processing_kernel_transpose,
        clDeviceID,
        CL_KERNEL_WORK_GROUP_SIZE,
        sizeof(temp),
        &temp,
        0);
    CHECK_OPENCL_ERROR(err, "clGetKernelWorkGroupInfo failed");

    while(localThreads_post_processing_kernel_transpose[0] * 
          localThreads_post_processing_kernel_transpose[1] < temp)
    {
        if(2 * localThreads_post_processing_kernel_transpose[0] * 
           localThreads_post_processing_kernel_transpose[1] <= temp)
            localThreads_post_processing_kernel_transpose[0] *= 2;

        if(2 * localThreads_post_processing_kernel_transpose[0] *
           localThreads_post_processing_kernel_transpose[1] <= temp)
            localThreads_post_processing_kernel_transpose[1] *= 2;
    }

    post_processing_kernel_RG = clCreateKernel(program, 
                                               "RecursiveGaussian_kernel", 
                                               &status);
    CHECK_OPENCL_ERROR(status, "Error: clCreateKernel. (RecursiveGaussian_kernel)\n");

    err = clGetKernelWorkGroupInfo(post_processing_kernel_RG,
        clDeviceID,
        CL_KERNEL_WORK_GROUP_SIZE,
        sizeof(temp),
        &temp,
        0);
    CHECK_OPENCL_ERROR(err,"clGerKernelWorkGroupInfo failed");
    localThreads_post_processing_kernel_RG = temp;

    return SDK_SUCCESS;
}

bool OVDecodeRender::runRemovePitchKernel(size_t globalThreads[2],
                          size_t localThreads[2],
                          size_t offset[2])
{
    cl_int status = 0;

    // Set up kernel arguments
    status = clSetKernelArg(remove_pitch_kernel, 
                            0, 
                            sizeof(cl_mem), 
                            &output_surface);
    CHECK_OPENCL_ERROR(status, "Error: clSetKernelArg! (output_surface)\n");

    status = clSetKernelArg(remove_pitch_kernel, 
                            1, 
                            sizeof(cl_mem), 
                            &pitch_removed_buffer);
    CHECK_OPENCL_ERROR(status, "Error: clSetKernelArg! (pitch_removed_buffer)\n");

    status = clSetKernelArg(remove_pitch_kernel, 
                            2, 
                            sizeof(int), 
                            &video_pitch);
    CHECK_OPENCL_ERROR(status, "Error: clSetKernelArg! (video_pitch)\n");

    status = clEnqueueNDRangeKernel(cl_cmd_queue,
                                    remove_pitch_kernel,
                                    2,
                                    offset,
                                    globalThreads,
                                    localThreads,
                                    0, 0, 0);
    CHECK_OPENCL_ERROR(status, "Error: clEnqueueNDRangeKernel failed! (remove_pitch_kernel)\n");

    status = clFinish(cl_cmd_queue);
    CHECK_OPENCL_ERROR(status, "Error: clFinish failed!\n");

    offset[0] = 0;
    offset[1] = globalThreads[1];

    globalThreads[1] /= 2;
    localThreads[1] /= 2;

    status = clEnqueueNDRangeKernel(cl_cmd_queue,
                                    remove_pitch_kernel,
                                    2,
                                    offset,
                                    globalThreads,
                                    localThreads,
                                    0, 0, 0);
    CHECK_OPENCL_ERROR(status, "Error: clEnqueueNDRangeKernel failed! (remove_pitch_kernel)\n");

    status = clFinish(cl_cmd_queue);
    CHECK_OPENCL_ERROR(status, "Error: clFinish failed!\n");

    return SDK_SUCCESS;
}

bool OVDecodeRender::runNV12ToRGBKernel(size_t globalThreads[2],
                        size_t localThreads[2])
{
    cl_int status = 0;
    // Set up kernel arguments
    status = clSetKernelArg(nv12_to_rgb_kernel, 
                            0, 
                            sizeof(cl_mem), 
                            &pitch_removed_buffer);
    CHECK_OPENCL_ERROR(status, "Error: clSetKernelArg!\n");

#ifdef USE_GL_INTEROP
    /* Acquire rgb_buffer from GL */
    status = clEnqueueAcquireGLObjects(cl_cmd_queue, 
                                       1, 
                                       &rgb_buffer, 
                                       0, 
                                       0,
                                       NULL);
    CHECK_OPENCL_ERROR(status, "Error: clEnqueueAcquireGLObjects!\n");
#endif

    status = clSetKernelArg(nv12_to_rgb_kernel, 
                            1, 
                            sizeof(cl_mem), 
                            &rgb_buffer);
    CHECK_OPENCL_ERROR(status, "Error: clSetKernelArg!\n");

    status = clEnqueueNDRangeKernel(cl_cmd_queue,
                                    nv12_to_rgb_kernel,
                                    2,
                                    0,
                                    globalThreads,
                                    localThreads,
                                    0, 0, 0);
    CHECK_OPENCL_ERROR(status, "Error: clEnqueueNDRangeKernel!\n");

    status = clFinish(cl_cmd_queue);
    CHECK_OPENCL_ERROR(status, "Error: clFinish!\n");

#ifdef USE_GL_INTEROP
    /* Now OpenGL gets control of rgb_buffer */
    status = clEnqueueReleaseGLObjects(cl_cmd_queue, 
                                       1, 
                                       &rgb_buffer, 
                                       0, 
                                       0, 
                                       0);
    CHECK_OPENCL_ERROR(status, "Error: clEnqueueReleaseGLObjects!\n");

    status = clFinish(cl_cmd_queue);
    CHECK_OPENCL_ERROR(status, "Error: clFinish!\n");
#endif

    return SDK_SUCCESS;
}

/**
* Custom type for Gaussian parameters 
* precomputation
*/
typedef struct _GaussParms
{
    float nsigma; 
    float alpha;
    float ema; 
    float ema2; 
    float b1; 
    float b2; 
    float a0; 
    float a1; 
    float a2; 
    float a3; 
    float coefp; 
    float coefn; 
} GaussParms, *pGaussParms;
GaussParms oclGP;

/* initialize Gaussian parameters */ 
float fSigma = 10.0f;               // filter sigma (blur factor)
int iOrder = 0;                     // filter order

void computeGaussParms(float fSigma, int iOrder, GaussParms* pGP)
{
    // pre-compute filter coefficients
    pGP->nsigma = fSigma; // note: fSigma is range-checked and clamped >= 0.1f upstream
    pGP->alpha = 1.695f / pGP->nsigma;
    pGP->ema = exp(-pGP->alpha);
    pGP->ema2 = exp(-2.0f * pGP->alpha);
    pGP->b1 = -2.0f * pGP->ema;
    pGP->b2 = pGP->ema2;
    pGP->a0 = 0.0f;
    pGP->a1 = 0.0f;
    pGP->a2 = 0.0f;
    pGP->a3 = 0.0f;
    pGP->coefp = 0.0f;
    pGP->coefn = 0.0f;

    switch (iOrder) 
    {
    case 0: 
        {
            const float k = (1.0f - pGP->ema)*(1.0f - pGP->ema) / 
                (1.0f + (2.0f * pGP->alpha * pGP->ema) - pGP->ema2);
            pGP->a0 = k;
            pGP->a1 = k * (pGP->alpha - 1.0f) * pGP->ema;
            pGP->a2 = k * (pGP->alpha + 1.0f) * pGP->ema;
            pGP->a3 = -k * pGP->ema2;
        } 
        break;
    case 1: 
        {
            pGP->a0 = (1.0f - pGP->ema) * (1.0f - pGP->ema);
            pGP->a1 = 0.0f;
            pGP->a2 = -pGP->a0;
            pGP->a3 = 0.0f;
        } 
        break;
    case 2: 
        {
            const float ea = exp(-pGP->alpha);
            const float k = -(pGP->ema2 - 1.0f)/(2.0f * pGP->alpha * pGP->ema);
            float kn = -2.0f * (-1.0f + (3.0f * ea) - (3.0f * ea * ea) + (ea * ea * ea));
            kn /= (((3.0f * ea) + 1.0f + (3.0f * ea * ea) + (ea * ea * ea)));
            pGP->a0 = kn;
            pGP->a1 = -kn * (1.0f + (k * pGP->alpha)) * pGP->ema;
            pGP->a2 = kn * (1.0f - (k * pGP->alpha)) * pGP->ema;
            pGP->a3 = -kn * pGP->ema2;
        } 
        break;
    default:
        // note: iOrder is range-checked and clamped to 0-2 upstream
        return;
    }
    pGP->coefp = (pGP->a0 + pGP->a1)/(1.0f + pGP->b1 + pGP->b2);
    pGP->coefn = (pGP->a2 + pGP->a3)/(1.0f + pGP->b1 + pGP->b2);
}

int OVDecodeRender::runPostProcessingKernels(int width, int height)
{
    cl_int status;
    cl_event events[2];

    /*** Set appropriate arguments to the kernel (Recursive Gaussian) ***/

#ifdef USE_GL_INTEROP
    /* Acquire rgb_buffer from GL */
    status = clEnqueueAcquireGLObjects(cl_cmd_queue, 
                                       1, 
                                       &rgb_buffer, 
                                       0, 
                                       0,
                                       NULL);
    CHECK_OPENCL_ERROR(status, "Error: clEnqueueAcquireGLObjects!\n");
#endif

    /* input : input buffer image */
    status = clSetKernelArg(post_processing_kernel_RG,
                            0,
                            sizeof(cl_mem),
                            &rgb_buffer);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* output : temp Buffer */
    status = clSetKernelArg(
        post_processing_kernel_RG,
        1,
        sizeof(cl_mem),
        &post_processed_buffer0);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* image width */ 
    status = clSetKernelArg(post_processing_kernel_RG,
        2,
        sizeof(cl_int),
        &width);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* image height */ 
    status = clSetKernelArg(post_processing_kernel_RG,
        3,
        sizeof(cl_int),
        &height);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Gaussian parameter : a0 */ 
    status = clSetKernelArg(post_processing_kernel_RG,
        4,
        sizeof(cl_float),
        &oclGP.a0);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Gaussian parameter : a1 */
    status = clSetKernelArg(post_processing_kernel_RG,
        5,
        sizeof(cl_float),
        &oclGP.a1);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Gaussian parameter : a2 */
    status = clSetKernelArg(post_processing_kernel_RG,
        6,
        sizeof(cl_float),
        &oclGP.a2);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Gaussian parameter : a3 */
    status = clSetKernelArg(post_processing_kernel_RG,
        7,
        sizeof(cl_float),
        &oclGP.a3);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Gaussian parameter : b1 */
    status = clSetKernelArg(post_processing_kernel_RG,
        8,
        sizeof(cl_float),
        &oclGP.b1);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Gaussian parameter : b2 */
    status = clSetKernelArg(post_processing_kernel_RG,
        9,
        sizeof(cl_float),
        &oclGP.b2);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Gaussian parameter : coefp */
    status = clSetKernelArg(post_processing_kernel_RG,
        10,
        sizeof(cl_float),
        &oclGP.coefp);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Gaussian parameter : coefn */
    status = clSetKernelArg(post_processing_kernel_RG,
        11,
        sizeof(cl_float),
        &oclGP.coefn);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* set global index and group size */
    size_t globalThreads[] = {width, 1};
    size_t localThreads[] = {1, 1};

    while(localThreads[0] < localThreads_post_processing_kernel_RG)
    {
        if(width % (2 * localThreads[0]) == 0)
            localThreads[0] *= 2;
        else
            break;
    }

    /* 
    * Enqueue a kernel run call.
    */
    status = clEnqueueNDRangeKernel(
        cl_cmd_queue,
        post_processing_kernel_RG,
        2,
        NULL,
        globalThreads,
        localThreads,
        0,
        NULL,
        &events[0]);

    CHECK_OPENCL_ERROR(status, "clEnqueueNDRangeKernel(post_processing_kernel_RG) failed!\n");

    /* Wait for kernel to finish */
    status = clWaitForEvents(1, &events[0]);
    CHECK_OPENCL_ERROR(status, "clWaitForEvents failed!\n");

    /*** Set appropriate arguments to the kernel (Transpose) ***/

#ifdef USE_GL_INTEROP
     /* output : input buffer image  */
    status = clSetKernelArg(
        post_processing_kernel_transpose,
        0,
        sizeof(cl_mem),
        &rgb_buffer_transposed);
   CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");
#else
    /* output : input buffer image  */
    status = clSetKernelArg(
        post_processing_kernel_transpose,
        0,
        sizeof(cl_mem),
        &rgb_buffer);
   CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");
#endif

    /* input : temp Buffer */
    status = clSetKernelArg(
        post_processing_kernel_transpose,
        1,
        sizeof(cl_mem),
        &post_processed_buffer0);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* local memory for block transpose */ 
    status = clSetKernelArg(post_processing_kernel_transpose,
        2,
        localThreads_post_processing_kernel_transpose[1] * 
        localThreads_post_processing_kernel_transpose[1] * sizeof(cl_uchar4),
        NULL);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* image width */ 
    status = clSetKernelArg(post_processing_kernel_transpose,
        3,
        sizeof(cl_int),
        &width);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* image height */ 
    status = clSetKernelArg(post_processing_kernel_transpose,
        4,
        sizeof(cl_int),
        &height);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* block_size */
    status = clSetKernelArg(post_processing_kernel_transpose,
        5,
        sizeof(cl_int),
        &localThreads_post_processing_kernel_transpose[1]);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* group dimensions for transpose kernel */
    size_t localThreadsT[] = {localThreads_post_processing_kernel_transpose[1], 
                              localThreads_post_processing_kernel_transpose[1]};
    size_t globalThreadsT[] = {width, height};

    /* Enqueue Transpose Kernel */
    status = clEnqueueNDRangeKernel(
        cl_cmd_queue,
        post_processing_kernel_transpose,
        2,
        NULL,
        globalThreadsT,
        localThreadsT,
        0,
        NULL,
        &events[1]);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Wait for transpose Kernel to finish */
    status = clWaitForEvents(1, &events[0]);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Set Arguments for Recursive Gaussian Kernel 
    Image is now transposed  
    new_width = height
    new_height = width */
#ifdef USE_GL_INTEROP
    /* input : input buffer image */
    status = clSetKernelArg(
        post_processing_kernel_RG,
        0,
        sizeof(cl_mem),
        &rgb_buffer_transposed);
#else
    /* input : input buffer image */
    status = clSetKernelArg(
        post_processing_kernel_RG,
        0,
        sizeof(cl_mem),
        &rgb_buffer);
#endif
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* output : temp Buffer */
    status = clSetKernelArg(
        post_processing_kernel_RG,
        1,
        sizeof(cl_mem),
        &post_processed_buffer0);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* image width : swap with height */ 
    status = clSetKernelArg(post_processing_kernel_RG,
        2,
        sizeof(cl_int),
        &height);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* image height */ 
    status = clSetKernelArg(post_processing_kernel_RG,
        3, 
        sizeof(cl_int),
        &width);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Set new global index */
    globalThreads[0] = height;
    globalThreads[1] = 1;

    localThreads[0] = 1;

    while(localThreads[0] < localThreads_post_processing_kernel_RG)
    {
        if(height % (2 * localThreads[0]) == 0)
            localThreads[0] *= 2;
        else
            break;
    }

    status = clEnqueueNDRangeKernel(
        cl_cmd_queue,
        post_processing_kernel_RG,
        2,
        NULL,
        globalThreads,
        localThreads,
        0,
        NULL,
        &events[1]);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Wait for Recursive Gaussian Kernel to finish */
    status = clWaitForEvents(1, &events[1]);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Set Arguments to Transpose Kernel */

    /* output : output buffer image  */
    status = clSetKernelArg(
        post_processing_kernel_transpose,
        0,
        sizeof(cl_mem),
        &rgb_buffer);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* input : temp Buffer */
    status = clSetKernelArg(
        post_processing_kernel_transpose,
        1,
        sizeof(cl_mem),
        &post_processed_buffer0);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* local memory for block transpose */ 
    status = clSetKernelArg(post_processing_kernel_transpose,
        2,
        localThreads_post_processing_kernel_transpose[1] * 
        localThreads_post_processing_kernel_transpose[1] * sizeof(cl_uchar4),
        NULL);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* image width : is height actually as the image is currently transposed*/ 
    status = clSetKernelArg(post_processing_kernel_transpose,
        3,
        sizeof(cl_int),
        &height);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* image height */ 
    status = clSetKernelArg(post_processing_kernel_transpose,
        4,
        sizeof(cl_int),
        &width);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* block_size */
    status = clSetKernelArg(post_processing_kernel_transpose,
        5,
        sizeof(cl_int),
        &localThreads_post_processing_kernel_transpose[1]);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* group dimensions for transpose kernel */
    globalThreadsT[0] = height;
    globalThreadsT[1] = width;

    /* Enqueue final Transpose Kernel */
    status = clEnqueueNDRangeKernel(
        cl_cmd_queue,
        post_processing_kernel_transpose,
        2,
        NULL,
        globalThreadsT,
        localThreadsT,
        0,
        NULL,
        &events[1]);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    /* Wait for transpose kernel to finish execution */
    status = clWaitForEvents(1, &events[1]);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

#ifdef USE_GL_INTEROP
    /* Now OpenGL gets control of rgb_buffer */
    status = clEnqueueReleaseGLObjects(cl_cmd_queue, 
                                       1, 
                                       &rgb_buffer, 
                                       0, 
                                       0, 
                                       0);
    CHECK_OPENCL_ERROR(status, "clEnqueueReleaseGLObjects failed");

    status = clFinish(cl_cmd_queue);
    CHECK_OPENCL_ERROR(status, "Error: clFinish!\n");
#endif

    status = clReleaseEvent(events[0]);
    CHECK_OPENCL_ERROR(status, "clSetKernelArg failed!\n");

    return SDK_SUCCESS;
}

int OVDecodeRender::decodeParserRenderInit(HWND hPrntWHnd, HDC hdc, HGLRC hrc)
{	  
    FILE *fw = NULL;
    char sz[128];
    int *voidPtr=0x0;

    /* Get devices which support Open Decode */
    unsigned int numDevices = 0;
    bool status = OVDecodeGetDeviceInfo(&numDevices, 0);
    if(!status)
    {
        std::cout << "OVDecodeGetDeviceInfo failed!\n";
        return false;
    }
    

    if(numDevices == 0)
    {
        std::cout << "No suitable devices found!\n" << std::endl;
        return SDK_FAILURE;
    }
    
    
    ovdecode_device_info *deviceInfo = new ovdecode_device_info[numDevices];
    status = OVDecodeGetDeviceInfo(&numDevices, deviceInfo);
    if(!status)
    {
        std::cout << "OVDecodeGetDeviceInfo failed!\n";
        return false;
    }
    

    unsigned int ovDeviceID = 0;
    for(unsigned int i = 0; i < numDevices; i++)
    {
        ovdecode_cap *caps = new ovdecode_cap[deviceInfo[i].decode_cap_size];
        status = OVDecodeGetDeviceCap(deviceInfo[i].device_id,
                                      deviceInfo[i].decode_cap_size, 
                                      caps);
        if(!status)
        {
            std::cout << "OVDecodeGetDeviceCap failed!\n";
            return false;
        }

        // break if device found and keep device id
        for(unsigned int j = 0; j < deviceInfo[i].decode_cap_size; j++)
        {
            if(caps[j].output_format == OVD_NV12_INTERLEAVED_AMD)
            {
                if (OurCurrCodec == MPEG2VLD_Codec)
                {
                    if(caps[j].profile == OVD_MPEG2_VLD)
                    {
                        ovDeviceID = deviceInfo[i].device_id;
                        std::cout << "ovDeviceID found!\n";
                            break;
                    }
                }
                else
                {
                    if(caps[j].profile == OVD_H264_HIGH_41)
                    {
                        ovDeviceID = deviceInfo[i].device_id;
                        std::cout << "ovDeviceID found!\n";
                            break;
                    }
                }
            }
        }
        if((cl_device_id)ovDeviceID == clDeviceID)
        {
            // Suitable device found - bail out
            break;
        }
    }

    if(ovDeviceID == 0)
    {
        std::cout << "No suitable devices found!\n" << std::endl;
        return -1;
    }
    
    std::cout<<"ovDeviceID value is "<<clDeviceID<<std::endl;

    /* 
    * for render avivo720 bit stream
    */
    if (OurCurrCodec == MPEG2VLD_Codec)
    {
        std::string exePath = sampleCommon->getPath();
        std::string fileName = std::string(exePath.c_str());
        fileName.append("OVDecodeDataMPEG\\picturepar2-%03i.bit");

        memset(sz, 0, 128);
        _snprintf(sz, 127, fileName.c_str(), 0);
        fw = fopen(sz, "rb");
        
        //
        // Set file pointer to beginning of file
        //
        
        int result;
        result = fseek( fw, 0x0, SEEK_SET);
        //
        // Error check Fseek: 0==successful call.
        // If successful, fseek and _fseeki64 returns 0. 
        // Otherwise, it returns a nonzero value. On devices incapable 
        // of seeking, the return value is undefined. 
        //
        if( result) 
        {
        std::cout << "\nError in Fseek picturepar2\n"; 
        return false;
        }
        
        if (fw) {
            
                fread(&curPicParam2_mpeg2VLD, sizeof(char), sizeof curPicParam2_mpeg2VLD, fw);
                fclose(fw);
            }
            else
            {
                return DEC_INVALID_PARAM;
            }

            //
            // Get Picture Parameter 1 data from file. We need video_width and video_height.
            // 
            
            memset(sz, 0, 128);
            fileName = std::string(exePath.c_str());
            fileName.append("OVDecodeDataMPEG\\picturepar1-%03i.bit");

            _snprintf(sz, 127, fileName.c_str(), 0);
             fw = fopen(sz, "rb");
             result = fseek( fw, 0x0, SEEK_SET);
            if( result) 
            {
                std::cout << "\nError in Fseek on picturepar1 file\n"; 
                return false;
            }
            if (fw) {
                fread(&picture_parameter, sizeof(char), sizeof(ovd_picture_parameter), fw);
                fclose(fw);
                }
            else{
                return DEC_INVALID_PARAM;
            }
        //
        // We need to convert
        //
        video_width  = (picture_parameter.width_in_mb * 16); 
        video_height = (picture_parameter.height_in_mb * 16);
                
    }
    else	
    {
            video_width = 720;
            video_height = 480;
    }
    
    sliceNum = 1;

    video_pitch = video_width % 256;
    if(video_pitch != 0)
        video_pitch = video_width + (256 - video_pitch);
    else 
        video_pitch = video_width;

    /* 
     * 4) Create an OVD Session
     */
    
    ovdecode_profile profile;
        
    if (OurCurrCodec == MPEG2VLD_Codec){
        profile = OVD_MPEG2_VLD;
        std::cout << "\nOVD_MPEG2_VLD\n";
    }else{
        profile = OVD_H264_HIGH_41;
        std::cout << "\nOVD_H264_HIGH_41\n";
    }   
    
    ovdecode_format  oFormat = OVD_NV12_INTERLEAVED_AMD;
    oWidth  = video_width;
    oHeight = video_height;

    std::cout << "\n oWidth=" << oWidth << " video_height=" << video_height << std::endl;


    session = OVDecodeCreateSession(
            ovdContext, 
            ovDeviceID,
            profile,
            oFormat,
            oWidth,
            oHeight);
    if(session == NULL) 
    {
        std::cout << "\nOVDecodeCreateSession failed.\n";
        return SDK_FAILURE;
    }

    /* 
     * 5) Write output buffer to memory
     */
    cl_cmd_queue = clCreateCommandQueue((cl_context)ovdContext, 
                                        clDeviceID, 
                                        0, 
                                        &err);
    CHECK_OPENCL_ERROR(err,"\nCreate command queue failed! Error : ");

    /* 
     * 6) Set up Frame info
     */  

    
    slice_data_control_size = sliceNum * sizeof(ovd_slice_data_control);
    slice_data_control      = (ovd_slice_data_control*)malloc(slice_data_control_size);
    
    if (OurCurrCodec == MPEG2VLD_Codec){
        pic_parameter_2_sizeVLD  = sizeof(MPEG2_picture_parameter_2);
    }
    else	{
        pic_parameter_2_size = sizeof(H264_picture_parameter_2);
    }
    
    num_event_in_wait_list  = 0;
    bitstream_data_max_size = video_width*video_height*3/2;
    bitstream_data          = (ovd_bitstream_data)malloc(bitstream_data_max_size);
    CHECK_ALLOCATION(bitstream_data,"Couldn't allocate memory for bitstream_data\n");
    CHECK_ALLOCATION(slice_data_control,"Couldn't allocate memory for slice_data_control\n");
    
    // Size of NV12 format
    int host_ptr_size = oHeight * video_pitch * 3/2;
    host_ptr = malloc(host_ptr_size);
    CHECK_ALLOCATION(host_ptr,"\nmalloc failed\n");

    /* 
     * 7) Create output buffer
     */
    for(int i=0; i<MAX_OUTPUT_SUF ;i++)
    {
         output_surfaces[i] = clCreateBuffer((cl_context)ovdContext, 
                                        CL_MEM_READ_WRITE,
                                        host_ptr_size, 
                                        NULL, 
                                        &err);
        CHECK_OPENCL_ERROR(err,"\nclCreateBuffer returned error ");
    }
    output_surface = output_surfaces[0];
    queued_surface = NULL;

    // RGBA host buffer
    g_decoded_frame_size = oHeight * oWidth * 4;
    g_decoded_frame = (ovd_bitstream_data)malloc(g_decoded_frame_size);
    CHECK_ALLOCATION(g_decoded_frame, "\nmalloc failed\n");

#ifdef USE_GL_INTEROP
    /* 
     * Create texture object 
     */
    glGenTextures(1, &tex);
    glBindTexture(GL_TEXTURE_2D, tex);

    /* Set parameters */
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    glTexImage2D(GL_TEXTURE_2D, 
                 0, 
                 GL_RGBA, 
                 (GLsizei)oWidth,
                 (GLsizei)oHeight, 
                 0, 
                 GL_RGBA, 
                 GL_UNSIGNED_BYTE,
                 0);
    glBindTexture(GL_TEXTURE_2D, 0);

    // Create output buffer to render using GL
    rgb_buffer = clCreateFromGLTexture2D((cl_context)ovdContext,
                                         CL_MEM_READ_WRITE,
                                         GL_TEXTURE_2D,
                                         0,
                                         tex,
                                         &err);

#else
    // Create buffer to store the output of NV12ToRGBA kernel
    rgb_buffer = clCreateBuffer((cl_context)ovdContext, 
                                CL_MEM_READ_WRITE,
                                oHeight * oWidth * 4, 
                                NULL, 
                                &err);
#endif

    CHECK_OPENCL_ERROR(err ,"clCreateBuffer returned error %d");

#ifdef USE_GL_INTEROP
    cl_image_format imageFormat;
    imageFormat.image_channel_data_type = CL_UNORM_INT8;
    imageFormat.image_channel_order = CL_RGBA;

    //Create rgb_buffer_transposed image
    rgb_buffer_transposed = clCreateImage2D((cl_context)ovdContext,
                                            CL_MEM_READ_WRITE,
                                            &imageFormat,
                                            oHeight,
                                            oWidth,
                                            0,
                                            0,
                                            &err);
    CHECK_OPENCL_ERROR(err,"clCreateImage2D returned error ");
#endif

    // Create buffer to store the output of RemovePitch 
    int pitch_removed_size = oHeight * oWidth * 3/2;
    pitch_removed_buffer = clCreateBuffer((cl_context)ovdContext, 
                                          CL_MEM_READ_WRITE,
                                          pitch_removed_size, 
                                          NULL, 
                                          &err);
    CHECK_OPENCL_ERROR(err ,"\nclCreateBuffer returned error ");

    // Create Post processing buffer
    post_processed_buffer0 = clCreateBuffer((cl_context)ovdContext, 
                                            CL_MEM_READ_WRITE,
                                            oHeight * oWidth * 4, 
                                            NULL, 
                                            &err);
    CHECK_OPENCL_ERROR(err, "\nclCreateBuffer returned error ");

    // Load kernels from file, build programs and create kernels
    if(createKernels())
    {
        std::cout << "Create kernels failed!\n" << std::endl;
        return false;
    }

    /* compute Gaussian parameters */
    computeGaussParms(fSigma, iOrder, &oclGP);

    return SDK_SUCCESS;
}



int OVDecodeRender::readPictureData(int					      frameNum,
                    ovd_picture_parameter    *picture_parameter,
                    H264_picture_parameter_2 *picture_parameter2,
                    unsigned int              pic_parameter_2_size,
                    ovd_bitstream_data        bitstream_data,			
                    unsigned int             *bitstream_data_size,
                    unsigned int              bitstream_data_max_size,
                    ovd_slice_data_control   *slice_data_control,	
                    unsigned int              slice_data_size)
{
    FILE *fw = NULL;
    char sz[128];
    int  sliceNum;
    sliceNum = slice_data_size/sizeof(ovd_slice_data_control);

    std::string exePath = sampleCommon->getPath();
    std::string fileName = std::string(exePath.c_str());
    fileName.append("OVDecodeDataH264\\picturepar1-%03i.bit");
    memset(sz, 0, 128);
    _snprintf(sz, 127, fileName.c_str(), frameNum);
    fw = fopen(sz, "rb");
    if (fw) {
        fread(picture_parameter, sizeof(char), sizeof(ovd_picture_parameter), fw);
        fclose(fw);
    }
    else	{
        return DEC_INVALID_PARAM;
    }

    fileName = std::string(exePath.c_str());
    fileName.append("OVDecodeDataH264\\picturepar2-%03i.bit");
    memset(sz, 0, 128);
    _snprintf(sz, 127, fileName.c_str(), frameNum);
    fw = fopen(sz, "rb");
    if (fw)	{
        fread(picture_parameter2, sizeof(char), sizeof(H264_picture_parameter_2), fw);
        fclose(fw);
    }
    else	{
        return DEC_INVALID_PARAM;
    }
    
    fileName = std::string(exePath.c_str());
    fileName.append("OVDecodeDataH264\\datacontrol-%03i.bit");
    memset(sz, 0, 128);
    _snprintf(sz, 127, fileName.c_str(), frameNum);
    fw = fopen(sz, "rb");
    if (fw)	{
        fread(slice_data_control, sizeof(char), slice_data_size, fw);
        fclose(fw);
    }
    else	{
        return DEC_INVALID_PARAM;
    }

    fileName = std::string(exePath.c_str());
    fileName.append("OVDecodeDataH264\\bitstream-%03i.bit");
    memset(sz, 0, 128);
    _snprintf(sz, 127, fileName.c_str(), frameNum);
    fw = fopen(sz, "rb");
    if (fw)    {
         fseek( fw, 0L, SEEK_END );
         (*bitstream_data_size) = ftell( fw );
         fclose(fw);
    }
    else	{
        return DEC_INVALID_PARAM;
    }

    fw = fopen(sz, "rb");
    if (fw)	{
        if(bitstream_data_max_size < (*bitstream_data_size))
            bitstream_data_max_size = (*bitstream_data_size);
        fread(bitstream_data, sizeof(char), bitstream_data_max_size, fw);
        fclose(fw);
    }
    else	{
        return DEC_INVALID_PARAM;
    }

    return DEC_SUCCEED;
}

int OVDecodeRender::readPictureDataMPeg_2VLD(int        frameNum,
                    ovd_picture_parameter               *picture_parameter,
                     MPEG2_picture_parameter_2          *curPicParam2_mpeg2VLD,
                    unsigned int                        pic_parameter_2_sizeVLD,
                    ovd_bitstream_data                  bitstream_data,
                    unsigned int                        *bitstream_data_size,
                    unsigned int                        bitstream_data_max_size,
                    ovd_slice_data_control              *slice_data_control,
                    unsigned int                        slice_data_size)
{
    FILE *fw = NULL;
    char sz[128];
    unsigned int result;
    //
    // Get Compressed Bitstream data from file.
    // 
    memset(sz, 0, 128);
                
    std::string exePath = sampleCommon->getPath();
    std::string fileName = std::string(exePath.c_str());
    fileName.append("OVDecodeDataMPEG\\bitstream-%03i.bit");
    _snprintf(sz, 127, fileName.c_str(), frameNum);
                
    fw = fopen(sz, "rb");
    if (fw)    {
         result=fseek( fw, 0L, SEEK_END );
         if( result) 
        {
            std::cout << "\nError in Fseek on bitstream file\n"; 
            return DEC_INVALID_PARAM;
        }
         (*bitstream_data_size) = ftell( fw );
         fclose(fw);
    }
    else	{
        std::cout << "\n read bs fail \n";
        return DEC_INVALID_PARAM;
    }

    fw = fopen(sz, "rb");
    if (fw)	{
        if(bitstream_data_max_size < (*bitstream_data_size))
            bitstream_data_max_size = (*bitstream_data_size);
        fread(bitstream_data, sizeof(char), bitstream_data_max_size, fw);
        fclose(fw);
    }
    else	{
        return DEC_INVALID_PARAM;
    }
    
    //
    // Get Picture Parameter 2 data from file
    // 
    
    fileName = std::string(exePath.c_str());
    fileName.append("OVDecodeDataMPEG\\picturepar2-%03i.bit"); 
    memset(curPicParam2_mpeg2VLD,0, pic_parameter_2_sizeVLD); 
    memset(sz, 0, 128);
    _snprintf(sz, 127, fileName.c_str(), frameNum);
    fw = fopen(sz, "rb");
    result = fseek( fw, 0x0, SEEK_SET);
    if( result) 
    {
        std::cout << "\nError in Fseek on picturepar2 file\n"; 
        return DEC_INVALID_PARAM;
    }
    if (fw) {
        fread(curPicParam2_mpeg2VLD, sizeof(char), pic_parameter_2_sizeVLD, fw);
        fclose(fw);
    }
        else	{
        std::cout << "\n read PIC Parameter2 failed \n";
        return DEC_INVALID_PARAM;
    }
    //
    // Get Picture Parameter 1 data from file.
    // 
    fileName = std::string(exePath.c_str());
    fileName.append("OVDecodeDataMPEG\\picturepar1-%03i.bit"); 
    memset(sz, 0, 128);
    _snprintf(sz, 127, fileName.c_str(), frameNum);
    fw = fopen(sz, "rb");
    result = fseek( fw, 0x0, SEEK_SET);
    if( result) 
    {
        std::cout << "\nError in Fseek on picturepar1 file\n"; 
        return DEC_INVALID_PARAM;
    }
    if (fw) {
        fread(picture_parameter, sizeof(char), sizeof(ovd_picture_parameter), fw);
        fclose(fw);
        }
        else	{
        return DEC_INVALID_PARAM;
    }
    //
    // Get OVD_SLICE_CONTROL_DATA
    // 
    
    fileName = std::string(exePath.c_str());
    fileName.append("OVDecodeDataMPEG\\datacontrol-%03i.bit"); 
    memset(sz, 0, 128);
    _snprintf(sz, 127, fileName.c_str(), frameNum);
    fw = fopen(sz, "rb");
    result = fseek( fw, 0x0, SEEK_SET);
    if( result) 
    {
        std::cout << "\nError in Fseek on datacontrol file\n"; 
        return DEC_INVALID_PARAM;
    }
    if(fw){
        fread(slice_data_control, sizeof(char), slice_data_size, fw);
        
        fclose(fw);
    }
    else{
        std::cout << "\n read slice Control failed \n";
        return DEC_INVALID_PARAM;
    }

    return DEC_SUCCEED;
}

int OVDecodeRender::run(){
     // Run only for a single frame and checks results against a previous valid run
    if(verify)
    {
        if(decodeParserRender(g_hwnd, g_hdc, g_glCtx) != CL_SUCCESS)
            return SDK_FAILURE;
        return SDK_SUCCESS;
    }
    else
    {
        while(!EndLoop) 
        {
            if(PeekMessage( &msg, NULL, 0, 0, PM_REMOVE)) 
            {
                if(msg.message == WM_QUIT) 
                    EndLoop = TRUE;
                else 
                {
                    TranslateMessage(&msg);
                    DispatchMessage(&msg);
                }
            } 
            else
            {
                if(decodeParserRender(g_hwnd, g_hdc, g_glCtx) != CL_SUCCESS)
                    return 1;
                SetEvent(g_continue_ovd);
            }
        }
    }
    return SDK_SUCCESS;
}

int OVDecodeRender::cleanup(){
    // Destroy resources
    if(decodeParserRenderDestroy() != CL_SUCCESS)
        return SDK_FAILURE;
    return SDK_SUCCESS;
}

int OVDecodeRender::setup(){

    cl_int status = CL_SUCCESS;
    cl_device_type dType;
    if(deviceType.compare("cpu") == 0)
    {
        OPENCL_EXPECTED_ERROR("This sample cannot run on CPU");
    }
    else //deviceType = "gpu" 
    {
        dType = CL_DEVICE_TYPE_GPU;
        if(isThereGPU() == false)
        {
            std::cout << "GPU not found. " << std::endl;
            OPENCL_EXPECTED_ERROR("Error: Unsupported on CPU");
        }
    }
    if(strcmp(codecFormat.c_str(),""))
    {
        if(!strcmp(codecFormat.c_str(),"h264"))
            OurCurrCodec = H264_Codec;
        else if(!strcmp(codecFormat.c_str(),"mpeg"))
            OurCurrCodec = MPEG2VLD_Codec;
        else
        {
            std::cout<<"Invalid Codec format selected(Choose from h264|mpeg)"<<std::endl;
            return SDK_FAILURE;
        }
    }

    if(decodeParserRenderInit(g_hwnd, g_hdc, g_glCtx) != CL_SUCCESS)
        return SDK_FAILURE;
    return SDK_SUCCESS;
}

int OVDecodeRender::verifyResults(){return SDK_SUCCESS;}

int OVDecodeRender::genBinaryImage(){
    streamsdk::bifData binaryData;
    binaryData.kernelName = std::string("OVDecodeRender_Kernels.cl");
    binaryData.flagsStr = std::string("");
    if(isComplierFlagsSpecified())
        binaryData.flagsFileName = std::string(flags.c_str());

    binaryData.binaryName = std::string(dumpBinary.c_str());
    int status = sampleCommon->generateBinaryImage(binaryData);
    return (status == 0) ? SDK_FAILURE : SDK_SUCCESS;
    return SDK_SUCCESS;}

int OVDecodeRender::initialize()
{
    // Call base class Initialize to get default configuration
    if(!this->SDKSample::initialize())
        return SDK_FAILURE;

    streamsdk::Option * codecType = new streamsdk::Option;
    if(!codecType)
    {
        std::cout<<"Error. Failed to allocate memory (optionList)\n";
        return SDK_FAILURE;
    }
    
    codecType->_lVersion = "codec";
    codecType->_description = "Selecting the Codec for Decoding (h264 or mpeg2)";
    codecType->_type = streamsdk::CA_ARG_STRING;
    codecType->_value = &codecFormat;//OurCurrCodec;
    sampleArgs->AddOption(codecType);
    delete codecType;

    return SDK_SUCCESS;
}

bool OVDecodeRender::decodeParserRender(HWND hPrntWHnd, HDC hdc, HGLRC hrc)
{  
    QueryPerformanceCounter((LARGE_INTEGER*)&timeStart);

    FrameType frameType = P_Frame;
    bool      skip_display;
    unsigned int frame_num;
    unsigned int bitstream_data_read_size;

    printf("\n Frame: %d\n", iFramesDecoded);

    if (OurCurrCodec == MPEG2VLD_Codec){

    std::cout << "\n Decode_Parser_Render MPEG2\n";

    iRet = readPictureDataMPeg_2VLD( iFramesDecoded,
            &picture_parameter,
            &curPicParam2_mpeg2VLD,
            pic_parameter_2_sizeVLD,
            bitstream_data,
            &bitstream_data_read_size,
            bitstream_data_max_size,
            slice_data_control,
            slice_data_control_size);

    if(curPicParam2_mpeg2VLD.picIntra )
        frameType = I_Frame;
    else if(curPicParam2_mpeg2VLD.picBackwardPrediction )
        frameType = B_Frame;
    else
        frameType = P_Frame;

    frame_num = curPicParam2_mpeg2VLD.DecodedPictureIndex;
    }else{

    std::cout << "\n Decode_Parser_Render H.264\n";

        iRet = readPictureData(iFramesDecoded,
               &picture_parameter,
               &pic_parameter_2,
               pic_parameter_2_size,
               bitstream_data,
               &bitstream_data_read_size,
               bitstream_data_max_size,
               slice_data_control,     // 32 bytes
               slice_data_control_size);// 224 bytes

        if(pic_parameter_2.intra_flag )
            frameType = I_Frame;
        else if(pic_parameter_2.reference )
            frameType = B_Frame;
        else
            frameType = P_Frame;

            frame_num = pic_parameter_2.frame_num;
    }

    if(iRet==DEC_EOS || iRet==DEC_SUCCEED)
        iFramesDecoded++;
    else
    {
        std::cout << "Read Picture data failed!\n";
        return SDK_FAILURE;
    }
        
    /* 
     * 8) Decode Picture
     */    
    OPEventHandle eventRunVideoProgram;
    OVresult res;

    if (OurCurrCodec == MPEG2VLD_Codec){
        res = OVDecodePicture(session,
               &picture_parameter,
               &curPicParam2_mpeg2VLD,  
               pic_parameter_2_sizeVLD,
               &bitstream_data, 
               bitstream_data_read_size,
               slice_data_control, 
               slice_data_control_size, 
               output_surface,// WHSU
               num_event_in_wait_list,
               NULL,
               &eventRunVideoProgram,
               0);
                        
        }else{

        res = OVDecodePicture(session,
               &picture_parameter,
               &pic_parameter_2,  
               pic_parameter_2_size,
               &bitstream_data, 
               bitstream_data_read_size,
               slice_data_control, 
               slice_data_control_size, 
               output_surface,
               num_event_in_wait_list,
               NULL,
               &eventRunVideoProgram,
               0);
        }
    if (!res) 
    {
        printf("\nOVDecodePicture returned error %fd", err);
        return false;
    }

    /* 
     * 9) Wait for Decode session completes
     */
    err = clWaitForEvents(1, (cl_event *)&(eventRunVideoProgram));
    CHECK_OPENCL_ERROR(err, "\nlWaitForEvents returned error ");

    skip_display = false;
    if(frame_num != 0 && (frameType == I_Frame || frameType == P_Frame))
    {
        if(queued_surface == NULL)
        {
            skip_display = true;
            queued_surface = output_surface;
            output_surface = output_surfaces[1];
        }
        else
        {
            OPMemHandle tmp_surface = output_surface;
            output_surface = queued_surface;
            queued_surface = tmp_surface;
        }
    }


    if(skip_display == false)
    {
        // Remove pitch kernel
        // outputBuffer from decode -> pitch_removed_buffer
        size_t offset[] = {0, 0};
        size_t globalThreads[] = {oWidth, oHeight};
        size_t localThreads[] = {localThreads_remove_pitch_kernel[0],
                                 localThreads_remove_pitch_kernel[1]};

        if(runRemovePitchKernel(globalThreads, 
                                localThreads, 
                                offset))
        {
            std::cout << "runRemovePitchKernel failed!\n";
            return SDK_FAILURE;
        }

        globalThreads[0] = oWidth;
        globalThreads[1] = oHeight;

        localThreads[0] = localThreads_nv12_to_rgb_kernel[0];
        localThreads[1] = localThreads_nv12_to_rgb_kernel[1];

        // Conversion kernel
        // pitch_removed_buffer -> rgb_buffer
        if(runNV12ToRGBKernel(globalThreads, localThreads))
        {
            std::cout << "runNV12ToRGBKernel failed!\n";
            return SDK_FAILURE;
        }

        if(enable_gaussian_blur)
        {
            if(runPostProcessingKernels(oWidth, oHeight))
            {
                std::cout << "runPostProcessingKernels failed!\n";
                return SDK_FAILURE;
            }
        }

    #ifndef USE_GL_INTEROP
         // Read from RGB buffer to host buffer and compare results
         err = clEnqueueReadBuffer(cl_cmd_queue, 
             rgb_buffer, 
             CL_TRUE, 
             0, 
             oWidth * oHeight * 4, 
             g_decoded_frame, 
             0, 
             NULL, 
             0);
        CHECK_OPENCL_ERROR(err, "\nclEnqueueReadBuffer returned error ";
    #endif

        // Verify the first frame data against a reference data
        if(verify)
        {
#ifdef USE_GL_INTEROP
            /* Enqueue Read Image */
            size_t origin[] = {0, 0, 0};
            size_t region[] = {oWidth, oHeight, 1};

            /* Read output of 2D copy */
            err = clEnqueueReadImage(cl_cmd_queue,
                rgb_buffer,
                1,
                origin,
                region,
                0,
                0,
                g_decoded_frame,
                0, 0, 0);
            CHECK_OPENCL_ERROR(err, "\nclEnqueueReadImage returned error ");
#endif

            // Code To create a fresh a Gold File
            /*FILE *fr = NULL;
            std::string verifyFile;
            if(OurCurrCodec == H264_Codec)
                verifyFile = std::string("verifyH264.image");
            else if(OurCurrCodec == MPEG2VLD_Codec)
                verifyFile = std::string("verifyMPEG.image");
            else
                return SDK_FAILURE;

            fr = fopen(verifyFile.c_str(),"wb");
            if(!fr)
            {
                std::cout<<"Failed to create verify.image";
                return 1;
            }
            fwrite((const void*)g_decoded_frame,4,oWidth*oHeight,fr);
            fclose(fr);
            std::cout<<"File written\n"<<verifyFile.c_str();
            return SDK_SUCCESS*/
            
            unsigned char *temp = (unsigned char *)malloc(oWidth * oHeight * 4);
            CHECK_ALLOCATION(temp,"Memory Allocation (temp) failed");

            // Read data from verify file to temp
            FILE *fr = NULL;
            std::string verifyFile;
            if(OurCurrCodec == H264_Codec)
                verifyFile = std::string("verifyH264.image");
            else if(OurCurrCodec == MPEG2VLD_Codec)
                verifyFile = std::string("verifyMPEG.image");
            else
                return SDK_FAILURE;

            fr = fopen(verifyFile.c_str(), "rb");;
            if(!fr)
            {
                std::cout << "Failed to open verification file!\n";
                return 1;
            }

            fread(temp, 4, oWidth * oHeight, fr);
            fclose(fr);

            float absError = 0;
            float relError = 0;

            for(unsigned int i = 0; i < oWidth * oHeight * 4; i++)
                absError += g_decoded_frame[i] - temp[i];

            relError = absError / (oWidth * oHeight * 4);

            std::cout << "\nAbsolute Error : " << absError;
            std::cout << "\nRelative Error : " << relError;

            // Compare g_decoded_frame against temp
            if(abs(relError) < 1.0f)
            {
                std::cout << "\nVerification : Passed!\n";
                if(temp)
                {
                    free(temp);
                    temp = NULL;
                }
            }
            else
            {
                std::cout << "\nVerification : Failed!\n";
                if(temp)
                {
                    free(temp);
                    temp = NULL;
                }
                return 1;
            }
        }
        else
        {
            /* Signal UI to Render 1 Frame */
            // Post Message
            g_frame_num = iFramesDecoded;
            g_frame_type = frameType;
            renderOneFrame(g_decoded_frame, hdc, g_frame_num, hPrntWHnd);
            // Wait for event
            WaitForSingleObject(g_continue_ovd, INFINITE);
        } 
    }

    // CleanUp
    if(eventRunVideoProgram)
    {
        err = clReleaseEvent((cl_event)eventRunVideoProgram);
        CHECK_OPENCL_ERROR(err,"clReleaseEvent failed!\n");
    }
    std::cout << std::endl;

    return SDK_SUCCESS;
}


bool OVDecodeRender::decodeParserRenderDestroy()
{
    for(int i=0; i<MAX_OUTPUT_SUF ;i++)
    {
        err = clReleaseMemObject((cl_mem)output_surfaces[i]);
        CHECK_OPENCL_ERROR(err,"\nclReleaseMemObject returned error ");
    }
    
    if(g_decoded_frame)
    {
        free(g_decoded_frame);
        g_decoded_frame = NULL;
    }
    if(host_ptr)
        free(host_ptr);
    if(bitstream_data)
        free(bitstream_data);
    if(slice_data_control)
        free(slice_data_control);


    bool ovdErr = OVDecodeDestroySession(session);
    if(!ovdErr) 
    {
        std::cout << "Error releasing OVD Session" << std::endl;
        return SDK_FAILURE;
    }

    if((cl_context)ovdContext) 
    {
        err = clReleaseContext((cl_context)ovdContext);
        CHECK_OPENCL_ERROR(err,"Error releasing cl context");
    }

    return SDK_SUCCESS;
}

