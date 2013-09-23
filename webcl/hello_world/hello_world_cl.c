//
// File:       hello.c
//
// Abstract:   A simple "Hello World" compute example showing basic usage of OpenCL which
//             calculates the mathematical square (X[i] = pow(X[i],2)) for a buffer of
//             floating point values.
//             
//
// Version:    <1.0>
//
// Disclaimer: IMPORTANT:  This Apple software is supplied to you by Apple Inc. ("Apple")
//             in consideration of your agreement to the following terms, and your use,
//             installation, modification or redistribution of this Apple software
//             constitutes acceptance of these terms.  If you do not agree with these
//             terms, please do not use, install, modify or redistribute this Apple
//             software.
//
//             In consideration of your agreement to abide by the following terms, and
//             subject to these terms, Apple grants you a personal, non - exclusive
//             license, under Apple's copyrights in this original Apple software ( the
//             "Apple Software" ), to use, reproduce, modify and redistribute the Apple
//             Software, with or without modifications, in source and / or binary forms;
//             provided that if you redistribute the Apple Software in its entirety and
//             without modifications, you must retain this notice and the following text
//             and disclaimers in all such redistributions of the Apple Software. Neither
//             the name, trademarks, service marks or logos of Apple Inc. may be used to
//             endorse or promote products derived from the Apple Software without specific
//             prior written permission from Apple.  Except as expressly stated in this
//             notice, no other rights or licenses, express or implied, are granted by
//             Apple herein, including but not limited to any patent rights that may be
//             infringed by your derivative works or by other works in which the Apple
//             Software may be incorporated.
//
//             The Apple Software is provided by Apple on an "AS IS" basis.  APPLE MAKES NO
//             WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED
//             WARRANTIES OF NON - INFRINGEMENT, MERCHANTABILITY AND FITNESS FOR A
//             PARTICULAR PURPOSE, REGARDING THE APPLE SOFTWARE OR ITS USE AND OPERATION
//             ALONE OR IN COMBINATION WITH YOUR PRODUCTS.
//
//             IN NO EVENT SHALL APPLE BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL OR
//             CONSEQUENTIAL DAMAGES ( INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//             SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//             INTERRUPTION ) ARISING IN ANY WAY OUT OF THE USE, REPRODUCTION, MODIFICATION
//             AND / OR DISTRIBUTION OF THE APPLE SOFTWARE, HOWEVER CAUSED AND WHETHER
//             UNDER THEORY OF CONTRACT, TORT ( INCLUDING NEGLIGENCE ), STRICT LIABILITY OR
//             OTHERWISE, EVEN IF APPLE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Copyright ( C ) 2008 Apple Inc. All Rights Reserved.
//

////////////////////////////////////////////////////////////////////////////////
#define MIN_ERROR       (1e-7)

#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#ifdef __EMSCRIPTEN__
    #include <GL/gl.h>
    #include <GL/glut.h>
    #include <CL/opencl.h>
#else
#include <OpenCL/opencl.h>
#endif

////////////////////////////////////////////////////////////////////////////////

// Use a static data size for simplicity
//
#define DATA_SIZE (1024)

////////////////////////////////////////////////////////////////////////////////

// Simple compute kernel which computes the square of an input array 
//
const char *KernelSource = "\n" \
"__kernel void square(                                                       \n" \
"   __global float* input,                                              \n" \
"   __global float* output,                                             \n" \
"   const unsigned int count)                                           \n" \
"{                                                                      \n" \
"   int i = get_global_id(0);                                           \n" \
"   if(i < count)                                                       \n" \
"       output[i] = input[i] * input[i];                                \n" \
"}                                                                      \n" \
"\n";

////////////////////////////////////////////////////////////////////////////////
#ifdef __EMSCRIPTEN__
void print_stack() {
    printf("\n___________________________________\n");
    int size = 0;
    webclPrintStackTrace(NULL,&size);

    char* webcl_stack = (char*)malloc(size+1);
    webcl_stack[size] = '\0';
    
    webclPrintStackTrace(webcl_stack,&size);
    printf("%s\n",webcl_stack);

    printf("___________________________________\n");
    free(webcl_stack);
}
#endif

int end(int e) {
    #ifdef __EMSCRIPTEN__
        print_stack();
    #endif
    return e;
}

void pfn_notify_program(cl_program program, void *user_data) {
    printf("%d) %d : pfn_notify call\n",(int)user_data,(int)program); 
}

int main(int argc, char** argv)
{
    cl_uint err;
    cl_uint num_platforms;
    cl_platform_id first_platform_id;

    // Need this for cl_gl interop
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_DEPTH);
    glutInitWindowSize (256, 256);
    glutCreateWindow (argv[0]);

    // Parse command line options
    //
    int counter = 0;
    int i = 0;
    int use_gpu = 1;
    for(; i < argc && argv; i++)
    {
        if(!argv[i])
            continue;
            
        if(strstr(argv[i], "cpu"))
            use_gpu = 0;        

        else if(strstr(argv[i], "gpu"))
            use_gpu = 1;
    }

    printf("Parameter detect %s device\n",use_gpu==1?"GPU":"CPU");

    printf("TEST : clGetPlatformIDs\n");
    printf("-----------------------\n");

    err = clGetPlatformIDs(0, NULL, NULL);
    printf("%d) %d\n",++counter,err);

    err = clGetPlatformIDs(0, &first_platform_id, NULL);
    printf("%d) %d - %d\n",++counter,err,(int)first_platform_id);

    err = clGetPlatformIDs(0, NULL, &num_platforms);
    printf("%d) %d - %d\n",++counter,err,num_platforms);

    err = clGetPlatformIDs(2, NULL, &num_platforms);
    printf("%d) %d - %d\n",++counter,err,num_platforms);

    err = clGetPlatformIDs(1, &first_platform_id, NULL);
    printf("%d) %d - %d\n",++counter,err,(int)first_platform_id);

    err = clGetPlatformIDs(1, &first_platform_id, &num_platforms);
    printf("%d) %d - %d - %d\n",++counter,err,(int)first_platform_id,num_platforms);

    printf("\nTEST : clGetPlatformInfo\n");
    printf("-----------------------\n");
    char buffer[1024];
    size_t size = 0;
    
    err = clGetPlatformInfo(0, CL_PLATFORM_PROFILE, 1024, buffer, NULL );
    printf("%d) %d - %s\n",++counter,err,buffer);

    err = clGetPlatformInfo(0, CL_PLATFORM_VENDOR, 1024, buffer, NULL);
    printf("%d) %d - %s\n",++counter,err,buffer);    

    err = clGetPlatformInfo(first_platform_id, CL_PLATFORM_PROFILE, 1024, buffer, NULL);
    printf("%d) %d - %s\n",++counter,err,buffer);

    err = clGetPlatformInfo(first_platform_id, CL_PLATFORM_VERSION, 1024, NULL, NULL);
    printf("%d) %d\n",++counter,err);

    err = clGetPlatformInfo(first_platform_id, CL_PLATFORM_VENDOR, 1024, buffer, &size);
    printf("%d) %d - %s - %d\n",++counter,err,buffer,size); 

    printf("\nTEST : clGetDeviceIDs\n");
    printf("-----------------------\n");   

    cl_device_id first_device_id;
    cl_uint num_devices;

    cl_device_type array_type[5] = {CL_DEVICE_TYPE_ALL,CL_DEVICE_TYPE_GPU,CL_DEVICE_TYPE_DEFAULT,CL_DEVICE_TYPE_ACCELERATOR,CL_DEVICE_TYPE_CPU};

    for (int i = 0 ; i < 5 ; i ++) {
        printf("clGetDeviceIDs type : %llu\n",array_type[i]);
        err = clGetDeviceIDs(0, array_type[i], 0, 0, 0 );
        printf("%d) %d\n",++counter,err);

        err = clGetDeviceIDs(0, 0, 0, 0, 0 );
        printf("%d) %d\n",++counter,err);

        err = clGetDeviceIDs(0, array_type[i], 1, 0, &num_devices );
        printf("%d) %d - %d\n",++counter,err,(int)num_devices);

        err = clGetDeviceIDs(0, array_type[i], 1, &first_device_id, 0 );
        printf("%d) %d - %d\n",++counter,err,(int)first_device_id);

        err = clGetDeviceIDs(0, array_type[i], 2, &first_device_id, &num_devices );
        printf("%d) %d - %d - %d\n",++counter,err,(int)first_device_id,(int)num_devices);

        err = clGetDeviceIDs(first_platform_id, array_type[i], 1, 0, &num_devices );
        printf("%d) %d - %d - %d\n",++counter,err,(int)first_platform_id,(int)num_devices);

        err = clGetDeviceIDs(first_platform_id, array_type[i], 1, &first_device_id, 0 );
        printf("%d) %d - %d - %d\n",++counter,err,(int)first_platform_id,(int)first_device_id);

        err = clGetDeviceIDs(first_platform_id, array_type[i], 2, &first_device_id, &num_devices );
        printf("%d) %d - %d - %d - %d\n",++counter,err,(int)first_platform_id,(int)first_device_id,(int)num_devices);
    }

    printf("\nTEST : clGetDeviceInfo\n");
    printf("-----------------------\n");   

    cl_device_info array_info[75] = {CL_DEVICE_TYPE,CL_DEVICE_VENDOR_ID,CL_DEVICE_MAX_COMPUTE_UNITS,CL_DEVICE_MAX_WORK_ITEM_DIMENSIONS,CL_DEVICE_MAX_WORK_GROUP_SIZE ,CL_DEVICE_MAX_WORK_ITEM_SIZES,CL_DEVICE_PREFERRED_VECTOR_WIDTH_CHAR,CL_DEVICE_PREFERRED_VECTOR_WIDTH_SHORT,CL_DEVICE_PREFERRED_VECTOR_WIDTH_INT,CL_DEVICE_PREFERRED_VECTOR_WIDTH_LONG,CL_DEVICE_PREFERRED_VECTOR_WIDTH_FLOAT,CL_DEVICE_PREFERRED_VECTOR_WIDTH_DOUBLE,CL_DEVICE_MAX_CLOCK_FREQUENCY,CL_DEVICE_ADDRESS_BITS,CL_DEVICE_MAX_READ_IMAGE_ARGS,CL_DEVICE_MAX_WRITE_IMAGE_ARGS,CL_DEVICE_MAX_MEM_ALLOC_SIZE,CL_DEVICE_IMAGE2D_MAX_WIDTH,CL_DEVICE_IMAGE2D_MAX_HEIGHT,CL_DEVICE_IMAGE3D_MAX_WIDTH,CL_DEVICE_IMAGE3D_MAX_HEIGHT,CL_DEVICE_IMAGE3D_MAX_DEPTH,CL_DEVICE_IMAGE_SUPPORT,CL_DEVICE_MAX_PARAMETER_SIZE,CL_DEVICE_MAX_SAMPLERS,CL_DEVICE_MEM_BASE_ADDR_ALIGN,CL_DEVICE_MIN_DATA_TYPE_ALIGN_SIZE,CL_DEVICE_SINGLE_FP_CONFIG,CL_DEVICE_GLOBAL_MEM_CACHE_TYPE,CL_DEVICE_GLOBAL_MEM_CACHELINE_SIZE,CL_DEVICE_GLOBAL_MEM_CACHE_SIZE,CL_DEVICE_GLOBAL_MEM_SIZE,CL_DEVICE_MAX_CONSTANT_BUFFER_SIZE,CL_DEVICE_MAX_CONSTANT_ARGS,CL_DEVICE_LOCAL_MEM_TYPE,CL_DEVICE_LOCAL_MEM_SIZE,CL_DEVICE_ERROR_CORRECTION_SUPPORT,CL_DEVICE_PROFILING_TIMER_RESOLUTION,CL_DEVICE_ENDIAN_LITTLE,CL_DEVICE_AVAILABLE,CL_DEVICE_COMPILER_AVAILABLE,CL_DEVICE_EXECUTION_CAPABILITIES,CL_DEVICE_QUEUE_PROPERTIES,CL_DEVICE_NAME,CL_DEVICE_VENDOR ,CL_DRIVER_VERSION,CL_DEVICE_PROFILE,CL_DEVICE_VERSION,CL_DEVICE_EXTENSIONS,CL_DEVICE_PLATFORM,CL_DEVICE_DOUBLE_FP_CONFIG ,CL_DEVICE_PREFERRED_VECTOR_WIDTH_HALF,CL_DEVICE_HOST_UNIFIED_MEMORY,CL_DEVICE_NATIVE_VECTOR_WIDTH_CHAR,CL_DEVICE_NATIVE_VECTOR_WIDTH_SHORT,CL_DEVICE_NATIVE_VECTOR_WIDTH_INT,CL_DEVICE_NATIVE_VECTOR_WIDTH_LONG,CL_DEVICE_NATIVE_VECTOR_WIDTH_FLOAT,CL_DEVICE_NATIVE_VECTOR_WIDTH_DOUBLE,CL_DEVICE_NATIVE_VECTOR_WIDTH_HALF,CL_DEVICE_OPENCL_C_VERSION  ,CL_DEVICE_LINKER_AVAILABLE  ,CL_DEVICE_BUILT_IN_KERNELS  ,CL_DEVICE_IMAGE_MAX_BUFFER_SIZE,CL_DEVICE_IMAGE_MAX_ARRAY_SIZE,CL_DEVICE_PARENT_DEVICE,CL_DEVICE_PARTITION_MAX_SUB_DEVICES,CL_DEVICE_PARTITION_PROPERTIES,CL_DEVICE_PARTITION_AFFINITY_DOMAIN,CL_DEVICE_PARTITION_TYPE,CL_DEVICE_REFERENCE_COUNT,CL_DEVICE_PREFERRED_INTEROP_USER_SYNC,CL_DEVICE_PRINTF_BUFFER_SIZE,CL_DEVICE_IMAGE_PITCH_ALIGNMENT,CL_DEVICE_IMAGE_BASE_ADDRESS_ALIGNMENT};

    size = 0;
    cl_int value = 0;

    for (int i = 0 ; i < 75 ; i ++) {
        err = clGetDeviceInfo(first_device_id, array_info[i], sizeof(cl_int), &value, &size);
        printf("%d) %d : %d - %d => %d\n",++counter,array_info[i],err,size,value);        
    }
   
    // Return char *
    // CL_DEVICE_EXTENSIONS

    size = 0;
    char extensions[1024];

    err = clGetDeviceInfo(first_device_id, CL_DEVICE_EXTENSIONS, 1024, &extensions, &size);
    printf("%d) %d : %d - %d => %s\n",++counter,CL_DEVICE_EXTENSIONS,err,size,extensions);       

    // Return array[3]
    //CL_DEVICE_MAX_WORK_ITEM_SIZES

    cl_int array[3];
    err = clGetDeviceInfo(first_device_id, CL_DEVICE_MAX_WORK_ITEM_SIZES, sizeof(array), &array, &size);
    printf("%d) %d : %d - %d => %d, %d , %d\n",++counter,CL_DEVICE_MAX_WORK_ITEM_SIZES,err,size,array[0],array[1],array[2]);       

    // Return 64 bit
    //CL_DEVICE_MAX_MEM_ALLOC_SIZE
    //CL_DEVICE_GLOBAL_MEM_SIZE

    cl_ulong ul;
    err = clGetDeviceInfo(first_device_id, CL_DEVICE_MAX_MEM_ALLOC_SIZE, sizeof(cl_ulong), &ul, &size);
    printf("%d) %d : %d - %d => %llu\n",++counter,CL_DEVICE_MAX_MEM_ALLOC_SIZE,err,size,ul);       
    
    ul = 0;
    err = clGetDeviceInfo(first_device_id, CL_DEVICE_GLOBAL_MEM_SIZE, sizeof(cl_ulong), &ul, &size);
    printf("%d) %d : %d - %d => %llu\n",++counter,CL_DEVICE_GLOBAL_MEM_SIZE,err,size,ul);     


    printf("\nTEST : clCreateContext\n");
    printf("-----------------------\n");   

    cl_int cl_errcode_ret = 0;
    cl_context context;
    cl_context contextFromType;

    context = clCreateContext(0,0,0,NULL,NULL,&cl_errcode_ret);
    printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)context);       

    context = clCreateContext(0,1,0,NULL,NULL,&cl_errcode_ret);
    printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)context);   

    context = clCreateContext(0,0,&first_device_id,NULL,NULL,&cl_errcode_ret);
    printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)context);    

    context = clCreateContext(0,1,&first_device_id,NULL,NULL,&cl_errcode_ret);
    printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)context);   

    {
        cl_context_properties properties[] = { 
            CL_CONTEXT_PLATFORM,
            (cl_context_properties)0,
            CL_CGL_SHAREGROUP_KHR,
            (cl_context_properties)0,
            0
        };

        context = clCreateContext(properties,1,&first_device_id,NULL,NULL,&cl_errcode_ret);
        printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)context); 
    }

    {    
        cl_context_properties properties[] = { 
            CL_CONTEXT_PLATFORM,
            (cl_context_properties)first_platform_id,
            CL_GL_CONTEXT_KHR,
            (cl_context_properties)0,
            CL_CGL_SHAREGROUP_KHR,
            (cl_context_properties)0,            
            0
        };  

        context = clCreateContext(properties,1,&first_device_id,NULL,NULL,&cl_errcode_ret);
        printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)context); 
    }

    {
        cl_context_properties properties[] = { 
            CL_CONTEXT_PLATFORM,
            (cl_context_properties)first_platform_id,
            0
        };

        context = clCreateContext(properties,1,&first_device_id,NULL,NULL,&cl_errcode_ret);
        printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)context); 
    }

    printf("\nTEST : clCreateContextFromType\n");
    printf("-----------------------\n");   

    for (int i = 0 ; i < 5 ; i ++) {
        printf("clCreateContextFromType type : %llu\n",array_type[i]);
        contextFromType = clCreateContextFromType(0,array_type[i],NULL,NULL,&cl_errcode_ret);
        
        printf("%d) %d : %llu => %d\n",++counter,cl_errcode_ret,array_type[i],(int)contextFromType); 

        {

            contextFromType = clCreateContextFromType(0,array_type[i],NULL,NULL,&cl_errcode_ret);
            printf("%d) %d : %llu => %d\n",++counter,cl_errcode_ret,array_type[i],(int)contextFromType); 

            cl_context_properties properties[] = { 
                CL_CONTEXT_PLATFORM,
                (cl_context_properties)0,
                CL_CGL_SHAREGROUP_KHR,
                (cl_context_properties)0,
                0
            };

            contextFromType = clCreateContextFromType(properties,array_type[i],NULL,NULL,&cl_errcode_ret);
            printf("%d) %d : %llu => %d\n",++counter,cl_errcode_ret,array_type[i],(int)contextFromType); 
        }

        {    
            cl_context_properties properties[] = { 
                CL_CONTEXT_PLATFORM,
                (cl_context_properties)first_platform_id,
                CL_GL_CONTEXT_KHR,
                (cl_context_properties)0,
                CL_CGL_SHAREGROUP_KHR,
                (cl_context_properties)0,    
                0
            };  

            contextFromType = clCreateContextFromType(properties,array_type[i],NULL,NULL,&cl_errcode_ret);
            printf("%d) %d : %llu => %d\n",++counter,cl_errcode_ret,array_type[i],(int)contextFromType); 
        }

        {
            cl_context_properties properties[] = { 
                CL_CONTEXT_PLATFORM,
                (cl_context_properties)first_platform_id,
                0
            };

            contextFromType = clCreateContextFromType(properties,array_type[i],NULL,NULL,&cl_errcode_ret);
            printf("%d) %d : %llu => %d\n",++counter,cl_errcode_ret,array_type[i],(int)contextFromType); 
        }
    }

    printf("\nTEST : clGetContextInfo\n");
    printf("-----------------------\n");   
    
    size = 0;
    value = 0;

    cl_context_info array_context_info[5] = {CL_CONTEXT_REFERENCE_COUNT,CL_CONTEXT_NUM_DEVICES,CL_CONTEXT_DEVICES,CL_CONTEXT_PROPERTIES,CL_CONTEXT_PLATFORM};

    for (int i = 0; i < 5; i++) {
        err = clGetContextInfo(contextFromType, array_context_info[i], sizeof(cl_int), &value, &size);
        printf("%d) %d : %d - %d => %d\n",++counter,array_context_info[i],err,size,value);   
    }


    printf("\nTEST : clReleaseContext\n");
    printf("-----------------------\n");   

    err = clReleaseContext(NULL);
    printf("%d) %d : %d\n",++counter,err,0); 

    err = clReleaseContext(contextFromType);
    printf("%d) %d : %d\n",++counter,err,(int)contextFromType); 

    printf("\nTEST : clCreateCommandQueue\n");
    printf("-----------------------\n");   

    cl_command_queue queue;
    queue = clCreateCommandQueue(0,0,0,&cl_errcode_ret);
    printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)queue); 

    queue = clCreateCommandQueue(context,0,0,&cl_errcode_ret);
    printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)queue); 

    queue = clCreateCommandQueue(context,first_device_id,0,&cl_errcode_ret);
    printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)queue); 

    queue = clCreateCommandQueue(context,first_device_id,CL_QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE,&cl_errcode_ret);
    printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)queue); 
    
    queue = clCreateCommandQueue(context,first_device_id,CL_QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE|CL_QUEUE_PROFILING_ENABLE,&cl_errcode_ret);
    printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)queue); 

    queue = clCreateCommandQueue(context,first_device_id,CL_QUEUE_PROFILING_ENABLE,&cl_errcode_ret);
    printf("%d) %d : %d\n",++counter,cl_errcode_ret,(int)queue); 


    printf("\nTEST : clGetCommandQueueInfo\n");
    printf("-----------------------\n");   

    cl_command_queue queue_to_release = clCreateCommandQueue(context,first_device_id,CL_QUEUE_PROFILING_ENABLE,&cl_errcode_ret);
    cl_command_queue_info array_command_info[4] = {CL_QUEUE_CONTEXT,CL_QUEUE_DEVICE,CL_QUEUE_REFERENCE_COUNT,CL_QUEUE_PROPERTIES};

    for (int i = 0; i < 4; i++) {
        err = clGetCommandQueueInfo(queue_to_release, array_command_info[i], sizeof(cl_int), &value, &size);
        printf("%d) %d : %d - %d => %d\n",++counter,array_command_info[i],err,size,value);   
    }

    printf("\nTEST : clReleaseCommandQueue\n");
    printf("-----------------------\n");  

    err = clReleaseCommandQueue(NULL);
    printf("%d) %d : %d\n",++counter,err,0); 

    err = clReleaseCommandQueue(queue_to_release);
    printf("%d) %d : %d\n",++counter,err,(int)queue_to_release); 

    printf("\nTEST : clCreateBuffer\n");
    printf("-----------------------\n");  

    cl_mem_flags array_buffer_flags[3] = {CL_MEM_READ_WRITE,CL_MEM_WRITE_ONLY,CL_MEM_READ_ONLY};
    cl_mem buff;

    int pixelCount = 10;

    float * pixels = (float *)malloc(3 * sizeof(float) * pixelCount);
    cl_uint sizeBytes = 3 * sizeof(float) * pixelCount;

    int * pixels2 = (int *)malloc(3 * sizeof(int) * pixelCount);
    cl_uint sizeBytes2 = 3 * sizeof(int) * pixelCount;

    for(i = 0; i < pixelCount; i++) {
        pixels[i] = rand() / (float)RAND_MAX;
        pixels2[i] = (int)(100 * (rand() / (float)RAND_MAX));
    }

    for (int i = 0; i < 3; i++) {
        buff = clCreateBuffer(context, array_buffer_flags[i], sizeof(cl_int), NULL, &cl_errcode_ret);
        printf("%d) %lld : %d - %d\n",++counter,array_buffer_flags[i],(int)buff,cl_errcode_ret);   

        buff = clCreateBuffer(context, array_buffer_flags[i] | CL_MEM_ALLOC_HOST_PTR, sizeBytes, NULL , &cl_errcode_ret);
        printf("%d) %lld : %d - %d\n",++counter,array_buffer_flags[i],(int)buff,cl_errcode_ret);   

        clSetTypePointer(CL_FLOAT);
        buff = clCreateBuffer(context, array_buffer_flags[i] | CL_MEM_COPY_HOST_PTR, sizeBytes ,pixels, &cl_errcode_ret);
        printf("%d) %lld : %d - %d\n",++counter,array_buffer_flags[i],(int)buff,cl_errcode_ret);   

        clSetTypePointer(CL_SIGNED_INT32);
        buff = clCreateBuffer(context, array_buffer_flags[i] | CL_MEM_COPY_HOST_PTR, sizeBytes2, pixels2, &cl_errcode_ret);
        printf("%d) %lld : %d - %d\n",++counter,array_buffer_flags[i],(int)buff,cl_errcode_ret);     

        buff = clCreateBuffer(context, array_buffer_flags[i] | CL_MEM_USE_HOST_PTR, sizeBytes2, pixels2, &cl_errcode_ret);
        printf("%d) %lld : %d - %d\n",++counter,array_buffer_flags[i],(int)buff,cl_errcode_ret);                   
    }

    printf("\nTEST : clCreateSubBuffer\n");
    printf("--------------------------\n");  

    cl_buffer_region region1 = 
    {
        0 * sizeof(int), 
        5 * sizeof(int)
    };

    cl_buffer_region region2 = 
    {
        -1 * sizeof(int), 
        5 * sizeof(int)
    };

    cl_buffer_region region3 = 
    {
        6 * sizeof(int), 
        2 * sizeof(int)
    };

    cl_buffer_region region4 = 
    {
        6 * sizeof(int), 
        -2 * sizeof(int)
    };
        
    cl_mem subbuffer = NULL;

    for (int i = 0; i < 3; i++) {
        subbuffer = clCreateSubBuffer(buff,array_buffer_flags[i],CL_BUFFER_CREATE_TYPE_REGION,&region2,&cl_errcode_ret);
        printf("%d) %lld : %d - %d\n",++counter,array_buffer_flags[i],(int)subbuffer,cl_errcode_ret);   

        subbuffer = clCreateSubBuffer(buff,array_buffer_flags[i],CL_BUFFER_CREATE_TYPE_REGION,&region3,&cl_errcode_ret);
        printf("%d) %lld : %d - %d\n",++counter,array_buffer_flags[i],(int)subbuffer,cl_errcode_ret);   

        subbuffer = clCreateSubBuffer(buff,array_buffer_flags[i],CL_BUFFER_CREATE_TYPE_REGION,&region4,&cl_errcode_ret);
        printf("%d) %lld : %d - %d\n",++counter,array_buffer_flags[i],(int)subbuffer,cl_errcode_ret);   

        subbuffer = clCreateSubBuffer(buff,array_buffer_flags[i],CL_BUFFER_CREATE_TYPE_REGION,&region3,&cl_errcode_ret);
        printf("%d) %lld : %d - %d\n",++counter,array_buffer_flags[i],(int)subbuffer,cl_errcode_ret);           
    }

    printf("\nTEST : clCreateImage2D\n");
    printf("--------------------------\n");  

    cl_mem image;
 
    cl_image_format img_fmt;
    img_fmt.image_channel_order = CL_RGBA;
    img_fmt.image_channel_data_type = CL_FLOAT;

    cl_image_format img_fmt2;
    img_fmt2.image_channel_order = CL_RGBA;
    img_fmt2.image_channel_data_type = CL_UNORM_INT8;

    cl_image_format img_fmt3;
    img_fmt3.image_channel_order = CL_ARGB;
    img_fmt3.image_channel_data_type = CL_UNSIGNED_INT32;

    size_t width, height;
    width = height = 10;
 
    for (int i = 0; i < 3; i++) {
        image = clCreateImage2D(context, array_buffer_flags[i], &img_fmt, width, height, 0, 0, &cl_errcode_ret);
        printf("%d) %lld : %d - %d (%dx%d)\n",++counter,array_buffer_flags[i],(int)image,cl_errcode_ret,img_fmt.image_channel_order ,img_fmt.image_channel_data_type );           

        image = clCreateImage2D(context, array_buffer_flags[i], &img_fmt3, width, height, 0, 0, &cl_errcode_ret);
        printf("%d) %lld : %d - %d (%dx%d)\n",++counter,array_buffer_flags[i],(int)image,cl_errcode_ret,img_fmt3.image_channel_order ,img_fmt3.image_channel_data_type );           
    
        image = clCreateImage2D(context, array_buffer_flags[i] | CL_MEM_COPY_HOST_PTR, &img_fmt2, width, height, 0, pixels2, &cl_errcode_ret);
        printf("%d) %lld : %d - %d (%dx%d)\n",++counter,array_buffer_flags[i],(int)image,cl_errcode_ret,img_fmt2.image_channel_order ,img_fmt2.image_channel_data_type );    

        image = clCreateImage2D(context, array_buffer_flags[i], &img_fmt2, width, height, 0, 0, &cl_errcode_ret);
        printf("%d) %lld : %d - %d (%dx%d)\n",++counter,array_buffer_flags[i],(int)image,cl_errcode_ret,img_fmt2.image_channel_order ,img_fmt2.image_channel_data_type );              
    }

    printf("\nTEST : clGetMemObjectInfo\n");
    printf("---------------------------\n");   

    cl_mem_info array_mem_info[9] = {CL_MEM_TYPE,CL_MEM_FLAGS,CL_MEM_SIZE,CL_MEM_HOST_PTR,CL_MEM_MAP_COUNT,CL_MEM_REFERENCE_COUNT,CL_MEM_REFERENCE_COUNT,CL_MEM_ASSOCIATED_MEMOBJECT,CL_MEM_OFFSET};

    for (int i = 0; i < 9; i++) {
        err = clGetMemObjectInfo(subbuffer, array_mem_info[i], sizeof(cl_int), &value, &size);
        printf("%d) %d : %d - %d => %d\n",++counter,array_mem_info[i],err,size,value);   
    }
    
    err = clGetMemObjectInfo(buff, array_mem_info[8], sizeof(cl_int), &value, &size);
    printf("%d) %d : %d - %d => %d\n",++counter,array_mem_info[8],err,size,value);       

    printf("\nTEST : clGetImageInfo\n");
    printf("-----------------------\n");   

    cl_mem_info array_img_info[7] = {CL_IMAGE_FORMAT,CL_IMAGE_ELEMENT_SIZE,CL_IMAGE_ROW_PITCH,CL_IMAGE_ROW_PITCH,CL_IMAGE_WIDTH,CL_IMAGE_HEIGHT,CL_IMAGE_DEPTH};

    for (int i = 0; i < 7; i++) {
        err = clGetImageInfo(image, array_img_info[i], sizeof(cl_int), &value, &size);
        printf("%d) %d : %d - %d => %d\n",++counter,array_img_info[i],err,size,value);   
    }

    printf("\nTEST : clReleaseMemObject\n");
    printf("-----------------------\n");  

    err = clReleaseMemObject(NULL);
    printf("%d) %d : %d\n",++counter,err,0); 

    err = clReleaseMemObject(subbuffer);
    printf("%d) %d : %d\n",++counter,err,(int)subbuffer); 

    err = clReleaseMemObject(image);
    printf("%d) %d : %d\n",++counter,err,(int)image); 


    printf("\nTEST : clGetSupportedImageFormats\n");
    printf("-----------------------------------\n");  

    cl_uint uiNumSupportedFormats = 0;

    for (int i = 0; i < 3; i++) {
        err = clGetSupportedImageFormats(context, array_buffer_flags[i] , CL_MEM_OBJECT_IMAGE2D, 0, NULL, &uiNumSupportedFormats);
        printf("\n%d) %d : %d\n",++counter,err,(int)uiNumSupportedFormats); 

        cl_image_format ImageFormats[uiNumSupportedFormats];

        err = clGetSupportedImageFormats(context, array_buffer_flags[i] , CL_MEM_OBJECT_IMAGE2D, uiNumSupportedFormats, ImageFormats, NULL);

        for(unsigned int i = 0; i < uiNumSupportedFormats; i++) {  
            printf("%d) %d : (%dx%d)\n",++counter,err,(int)ImageFormats[i].image_channel_order,(int)ImageFormats[i].image_channel_data_type); 
        }
    }
                
    printf("\nTEST : clCreateSampler\n");
    printf("--------------------------\n");  

    cl_addressing_mode addr[5] = {CL_ADDRESS_NONE,CL_ADDRESS_CLAMP_TO_EDGE,CL_ADDRESS_CLAMP,CL_ADDRESS_REPEAT,CL_ADDRESS_MIRRORED_REPEAT};
    cl_filter_mode filter[2] = {CL_FILTER_NEAREST,CL_FILTER_LINEAR};
    cl_int boolean[2] = {CL_TRUE,CL_FALSE};
      
    for (int i = 0; i < 5 ; i++) {
      for (int j = 0; j < 2 ; j++) {
        for (int k = 0; k < 2 ; k++) {
          cl_sampler sampler = clCreateSampler ( context, boolean[k], addr[i], filter[j], &cl_errcode_ret);
          printf("%d) %d - %d (%dx%dx%d)\n",++counter,(int)sampler,cl_errcode_ret,boolean[k], addr[i], filter[j]); 
 
        } 
      } 
    }
    
    cl_sampler sampler = clCreateSampler ( context, CL_FALSE, CL_ADDRESS_NONE, CL_FILTER_NEAREST, &cl_errcode_ret);
    
    printf("\nTEST : clGetSamplerInfo\n");
    printf("-----------------------\n");   
    
    cl_sampler_info array_sampler_info[5] = {CL_SAMPLER_REFERENCE_COUNT,CL_SAMPLER_CONTEXT,CL_SAMPLER_NORMALIZED_COORDS,CL_SAMPLER_ADDRESSING_MODE,CL_SAMPLER_FILTER_MODE};

    for (int i = 0; i < 5; i++) {
        err = clGetSamplerInfo(sampler, array_sampler_info[i], sizeof(cl_int), &value, &size);
        printf("%d) %d : %d - %d => %d\n",++counter,array_sampler_info[i],err,size,value);   
    }
    
    printf("\nTEST : clReleaseSampler\n");
    printf("-----------------------\n");  

    err = clReleaseSampler(NULL);
    printf("%d) %d : %d\n",++counter,err,0); 

    err = clReleaseSampler(sampler);
    printf("%d) %d : %d\n",++counter,err,(int)sampler); 

    printf("\nTEST : clCreateProgramWithSource\n");
    printf("-----------------------\n");  
    
    cl_program program = clCreateProgramWithSource(context, 1, (const char **) & KernelSource, NULL, &cl_errcode_ret);
    printf("%d) %d - %d\n",++counter,(int)program,cl_errcode_ret); 
    
    printf("\nTEST : clReleaseProgram\n");
    printf("-------------------------\n");  

    cl_program program2 = clCreateProgramWithSource(context, 1, (const char **) & KernelSource, NULL, &cl_errcode_ret);
    err = clReleaseProgram(NULL);
    printf("%d) %d : %d\n",++counter,err,0); 

    err = clReleaseProgram(program2);
    printf("%d) %d : %d\n",++counter,err,(int)program2); 

    printf("\nTEST : clBuildProgram\n");
    printf("-------------------------\n");  
    err = clBuildProgram(program, 0, NULL, NULL, NULL, NULL);
    printf("%d) %d : %d\n",++counter,err,(int)program); 

    err = clBuildProgram(program, 1, first_device_id, NULL, NULL, NULL);
    printf("%d) %d : %d\n",++counter,err,(int)program,(int)first_device_id); 

    char* options[14];
    options[0] = strdup("-D name");
    options[1] = strdup("-D name=definition");
    options[2] = strdup("-cl-opt-disable");
    options[3] = strdup("-cl-single-precision-constant");
    options[4] = strdup("-cl-denorms-are-zero");
    options[5] = strdup("-cl-mad-enable");
    options[6] = strdup("-cl-no-signed-zeros");
    options[7] = strdup("-cl-unsafe-math-optimizations");
    options[8] = strdup("-cl-finite-math-only");
    options[9] = strdup("-cl-fast-relaxed-math");
    options[10] = strdup("-W");
    options[11] = strdup("-Werror");
    options[12] = strdup("-cl-std=");

    for (int i = 0; i < 14; i++) {
        err = clBuildProgram(program, 1, first_device_id, options[i], NULL, NULL);
        printf("%d) %d : %d : %s\n",++counter,err,(int)program,(int)first_device_id,options[i]); 
    }

    err = clBuildProgram(program, 1, first_device_id, NULL, pfn_notify_program,++counter);    
    printf("%d) %d : %d : %d\n",++counter,err,(int)program,(int)first_device_id,pfn_notify_program); 

    printf("\nTEST : clGetProgramBuildInfo\n");
    printf("-----------------------\n");   
    
    size = 0;
    value = 0;

    cl_program_build_info array_program_build_info[3] = {CL_PROGRAM_BUILD_STATUS,CL_PROGRAM_BUILD_OPTIONS,CL_PROGRAM_BUILD_LOG};

    for (int i = 0; i < 3; i++) {
        err = clGetProgramBuildInfo(program, first_device_id, array_program_build_info[i], sizeof(cl_int), &value, &size);
        printf("%d) %d : %d - %d => %d\n",++counter,array_program_build_info[i],err,size,value);   
    }

    printf("\nTEST : clGetProgramInfo\n");
    printf("-----------------------\n");   
    
    size = 0;
    value = 0;

    cl_program_info array_program_info[7] = {CL_PROGRAM_REFERENCE_COUNT,CL_PROGRAM_CONTEXT,CL_PROGRAM_NUM_DEVICES,CL_PROGRAM_DEVICES,CL_PROGRAM_SOURCE,CL_PROGRAM_BINARY_SIZES,CL_PROGRAM_BINARIES};

    for (int i = 0; i < 7; i++) {
        err = clGetProgramInfo(program, array_program_info[i], sizeof(cl_int), &value, &size);
        printf("%d) %d : %d - %d => %d\n",++counter,array_program_info[i],err,size,value);   
    }

    printf("\nTEST : clCreateKernel\n");
    printf("-----------------------\n");   
    cl_kernel kernel;

    kernel = clCreateKernel(program, 0, &err);
    printf("%d) %d : %d\n",++counter,(int)program,err);

    kernel = clCreateKernel(program, "", &err);
    printf("%d) %d : %d\n",++counter,(int)program,err);

    kernel = clCreateKernel(program, "square", &err);
    printf("%d) %d : %d\n",++counter,(int)program,err);

    printf("\nTEST : clCreateKernelsInProgram\n");
    printf("---------------------------------\n");   
    
    err = clCreateKernelsInProgram(program,0,NULL,&size);
    printf("%d) %d : %d - %d\n",++counter,(int)program,err,size);

    cl_kernel kernel2;

    err = clCreateKernelsInProgram(program,1,&kernel2,&size);
    printf("%d) %d : %d - %d => %d\n",++counter,(int)program,err,size,(int)kernel2);

    printf("\nTEST : clReleaseKernel\n");
    printf("-----------------------\n");   

    err = clReleaseKernel(NULL);
    printf("%d) %d : %d\n",++counter,err,0); 

    err = clReleaseKernel(kernel2);
    printf("%d) %d : %d\n",++counter,err,(int)kernel2); 

    printf("\nTEST : clSetKernelArg\n");
    printf("-----------------------\n");   

    unsigned int count = 512;
    float data[count];
    for(i = 0; i < count; i++)
        data[i] = rand() / (float)RAND_MAX;

    cl_mem input = clCreateBuffer(context,  CL_MEM_READ_ONLY,  sizeof(float) * count, NULL, NULL);
    cl_mem output = clCreateBuffer(context, CL_MEM_WRITE_ONLY, sizeof(float) * count, NULL, NULL);

    err = 0;
    err  = clSetKernelArg(kernel, 0, sizeof(cl_mem), &input);
    printf("%d) %d : %d - %d => %d\n",++counter,(int)kernel, 0, sizeof(cl_mem), (int)input);

    err |= clSetKernelArg(kernel, 1, sizeof(cl_mem), &output);
    printf("%d) %d : %d - %d => %d\n",++counter,(int)kernel, 1, sizeof(cl_mem), (int)output);    

    err |= clSetKernelArg(kernel, 2, 1024, NULL);
    printf("%d) %d : %d - %d => %d\n",++counter,(int)kernel, 2, 1024, NULL);   

    err |= clSetKernelArg(kernel, 3, 1024, NULL);
    printf("%d) %d : %d - %d => %d\n",++counter,(int)kernel, 3, sizeof(unsigned int), (int)count);    

    err |= clSetKernelArg(kernel, 2, sizeof(unsigned int), &count);
    printf("%d) %d : %d - %d => %d\n",++counter,(int)kernel, 2, sizeof(unsigned int), (int)count);    
    
    
    printf("\nTEST : clGetKernelWorkGroupInfo\n");
    printf("---------------------------------\n");   
    
    size = 0;
    value = 0;

    cl_kernel_work_group_info array_kernel_work_info[6] = {CL_KERNEL_GLOBAL_WORK_SIZE,CL_KERNEL_WORK_GROUP_SIZE,CL_KERNEL_COMPILE_WORK_GROUP_SIZE,CL_KERNEL_LOCAL_MEM_SIZE,CL_KERNEL_PREFERRED_WORK_GROUP_SIZE_MULTIPLE,CL_KERNEL_PRIVATE_MEM_SIZE};

    for (int i = 0; i < 6; i++) {
        err = clGetKernelWorkGroupInfo(kernel, first_device_id, array_kernel_work_info[i], sizeof(cl_int), &value, &size);
        printf("%d) %d : %d - %d => %d\n",++counter,array_kernel_work_info[i],err,size,value);   
    }

    printf("\nTEST : clGetKernelInfo\n");
    printf("-----------------------\n");   
    
    size = 0;
    value = 0;

    cl_kernel_info array_kernel_info[6] = {CL_KERNEL_FUNCTION_NAME,CL_KERNEL_NUM_ARGS,CL_KERNEL_REFERENCE_COUNT,CL_KERNEL_CONTEXT,CL_KERNEL_PROGRAM,CL_KERNEL_ATTRIBUTES};

    for (int i = 0; i < 6; i++) {
        err = clGetKernelInfo(kernel, array_kernel_info[i], sizeof(cl_int), &value, &size);
        printf("%d) %d : %d - %d => %d\n",++counter,array_kernel_info[i],err,size,value);   
    }

    printf("\n\n\n\n\n\n\nTEST : Hello World Sample\n");
    printf("-----------------------\n");   
    //main_2(argc,argv);
    printf("\n\n\n\n\n\n\n");

    return end(EXIT_SUCCESS);
}

int __main(int argc, char** argv)
{
    int err;                            // error code returned from api calls
      
    float data[DATA_SIZE];              // original data set given to device
    float results[DATA_SIZE];           // results returned from device
    unsigned int correct;               // number of correct results returned

    size_t global;                      // global domain size for our calculation
    size_t local;                       // local domain size for our calculation

    cl_device_id device_id;             // compute device id 
    cl_context context;                 // compute context
    cl_command_queue commands;          // compute command queue
    cl_program program;                 // compute program
    cl_kernel kernel;                   // compute kernel
    
    cl_mem input;                       // device memory used for the input array
    cl_mem output;                      // device memory used for the output array
    
    int i;

    // Parse command line options
    //
    int use_gpu = 1;
    for(i = 0; i < argc && argv; i++)
    {
        if(!argv[i])
            continue;
            
        if(strstr(argv[i], "cpu"))
            use_gpu = 0;        

        else if(strstr(argv[i], "gpu"))
            use_gpu = 1;
    }

    printf("Parameter detect %s device\n",use_gpu==1?"GPU":"CPU");

    // Fill our data set with random float values
    //
    unsigned int count = DATA_SIZE;
    for(i = 0; i < count; i++)
        data[i] = rand() / (float)RAND_MAX;
    
    printf("Call : clGetDeviceIDs ...\n");
    err = clGetDeviceIDs(NULL, use_gpu ? CL_DEVICE_TYPE_GPU : CL_DEVICE_TYPE_CPU, 1, &device_id, NULL);
    if (err != CL_SUCCESS)
    {
        printf("Error: Failed to create a device group!\n");
        return end(EXIT_FAILURE);
    }

    // Create a compute context 
    //
    printf("Call : clCreateContext ...\n");    
    context = clCreateContext(0, 1, &device_id, NULL, NULL, &err);
    if (!context)
    {
        printf("Error: Failed to create a compute context!\n");
        return end(EXIT_FAILURE);
    }
    
    size_t returned_size;
    cl_char vendor_name[1024] = {0};
    cl_char device_name[1024] = {0};
    cl_bool image_support;
        
    printf("Call : clGetDeviceInfo ...\n");    
    err = clGetDeviceInfo(device_id, CL_DEVICE_VENDOR, sizeof(vendor_name), vendor_name, &returned_size);
    if (err != CL_SUCCESS)
    {
        printf("Error: Failed to retrieve device info : CL_DEVICE_VENDOR!\n");
    }

    err = clGetDeviceInfo(device_id, CL_DEVICE_NAME, sizeof(device_name), device_name, &returned_size);
        if (err != CL_SUCCESS)
    {
        printf("Error: Failed to retrieve device info : CL_DEVICE_NAME!\n");
    }

    err = clGetDeviceInfo(device_id, CL_DEVICE_IMAGE_SUPPORT, sizeof(device_name), &image_support, &returned_size);
    if (err != CL_SUCCESS)
    {
        printf("Error: Failed to retrieve device info : CL_DEVICE_IMAGE_SUPPORT!\n");
    }
    
    unsigned int device_count;
    cl_device_id device_ids[16];

    printf("Call : clGetContextInfo ...\n");    
    err = clGetContextInfo(context, CL_CONTEXT_DEVICES, sizeof(device_ids), device_ids, &returned_size);
    if(err)
    {
        printf("Error: Failed to retrieve compute devices for context!\n");
        return end(EXIT_FAILURE);
    }
    
    device_count = returned_size / sizeof(cl_device_id);
    
    // Create a command commands
    //
    printf("Call : clCreateCommandQueue ...\n");    
    commands = clCreateCommandQueue(context, device_id, 0, &err);
    if (!commands)
    {
        printf("Error: Failed to create a command commands!\n");
        return end(EXIT_FAILURE);
    }

    // Create the compute program from the source buffer
    //
    printf("Call : clCreateProgramWithSource ...\n");      
    program = clCreateProgramWithSource(context, 1, (const char **) & KernelSource, NULL, &err);
    if (!program)
    {
        printf("Error: Failed to create compute program!\n");
        return end(EXIT_FAILURE);
    }

    // Build the program executable
    //
    printf("Call : clBuildProgram ...\n");          
    err = clBuildProgram(program, 0, NULL, NULL, NULL, NULL);
    if (err != CL_SUCCESS)
    {
        size_t len;
        char buffer[2048];

        printf("Error: Failed to build program executable!\n");
        clGetProgramBuildInfo(program, device_id, CL_PROGRAM_BUILD_LOG, sizeof(buffer), buffer, &len);
        printf("%s\n", buffer);
        return end(1);
    }

    // Create the compute kernel in the program we wish to run
    //
    printf("Call : clCreateKernel ...\n");              
    kernel = clCreateKernel(program, "square", &err);
    if (!kernel || err != CL_SUCCESS)
    {
        printf("Error: Failed to create compute kernel!\n");
        return end(1);
    }

    // Create the input and output arrays in device memory for our calculation
    //
    printf("Call : clCreateBuffer ...\n");                  
    input = clCreateBuffer(context,  CL_MEM_READ_ONLY,  sizeof(float) * count, NULL, NULL);
    output = clCreateBuffer(context, CL_MEM_WRITE_ONLY, sizeof(float) * count, NULL, NULL);
    if (!input || !output)
    {
        printf("Error: Failed to allocate device memory!\n");
        return end(1);
    }    
    
    // Write our data set into the input array in device memory 
    //
    printf("Call : clEnqueueWriteBuffer ...\n");                      
    err = clEnqueueWriteBuffer(commands, input, CL_TRUE, 0, sizeof(float) * count, data, 0, NULL, NULL);
    if (err != CL_SUCCESS)
    {
        printf("Error: Failed to write to source array!\n");
        return end(1);
    }

    // Set the arguments to our compute kernel
    //
    printf("Call : clSetKernelArg ...\n");                          
    err = 0;
    err  = clSetKernelArg(kernel, 0, sizeof(cl_mem), &input);
    err |= clSetKernelArg(kernel, 1, sizeof(cl_mem), &output);
    err |= clSetKernelArg(kernel, 2, sizeof(unsigned int), &count);
    if (err != CL_SUCCESS)
    {
        printf("Error: Failed to set kernel arguments! %d\n", err);
        return end(1);
    }

    // Get the maximum work group size for executing the kernel on the device
    //
    printf("Call : clGetKernelWorkGroupInfo ...\n");                              
    err = clGetKernelWorkGroupInfo(kernel, device_id, CL_KERNEL_WORK_GROUP_SIZE, sizeof(local), &local, NULL);
    if (err != CL_SUCCESS)
    {
        printf("Error: Failed to retrieve kernel work group info! %d\n", err);
        return end(1);
    }

    // Execute the kernel over the entire range of our 1d input data set
    // using the maximum number of work group items for this device
    //
    global = count;
    printf("Call : clEnqueueNDRangeKernel ...\n");                                  
    err = clEnqueueNDRangeKernel(commands, kernel, 1, NULL, &global, &local, 0, NULL, NULL);
    if (err)
    {
        printf("Error: Failed to execute kernel!\n");
        return end(EXIT_FAILURE);
    }

    // Wait for the command commands to get serviced before reading back results
    //
    printf("Call : clFinish ...\n");        
    clFinish(commands);

    // Read back the results from the device to verify the output
    //
    printf("Call : clEnqueueReadBuffer ...\n");            
    err = clEnqueueReadBuffer( commands, output, CL_TRUE, 0, sizeof(float) * count, results, 0, NULL, NULL );  
    if (err != CL_SUCCESS)
    {
        printf("Error: Failed to read output array! %d\n", err);
        return end(1);
    }
    
    // Validate our results
    //
    correct = 0;
    for(i = 0; i < count; i++)
    {
        #ifdef __EMSCRIPTEN__
        if ((results[i] - (data[i] * data[i])) < MIN_ERROR)
        #else    
        if(results[i] == data[i] * data[i])
        #endif
            correct++;
    }
    
    printf("Connecting to \"%s\" \"%s\" ... Image Support %d : Devices count %d\n", vendor_name, device_name, image_support, device_count);
    
    // Print a brief summary detailing the results
    //
    printf("Computed '%d/%d' correct values!\n", correct, count);
    
    // Shutdown and cleanup
    //
    clReleaseMemObject(input);
    clReleaseMemObject(output);
    clReleaseProgram(program);
    clReleaseKernel(kernel);
    clReleaseCommandQueue(commands);
    clReleaseContext(context);

    return end(EXIT_SUCCESS);
}

