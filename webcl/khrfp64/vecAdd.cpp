#define __CL_ENABLE_EXCEPTIONS

#include <CL/cl.hpp>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <math.h>

// OpenCL kernel. Each work item takes care of one element of c
const char *kernelSource =                                      "\n" \
"#pragma OPENCL EXTENSION cl_khr_fp64 : enable                    \n" \
"__kernel void vecAdd(  __global double *a,                       \n" \
"                       __global double *b,                       \n" \
"                       __global double *c,                       \n" \
"                       const unsigned int n)                    \n" \
"{                                                               \n" \
"    //Get our global thread ID                                  \n" \
"    int id = get_global_id(0);                                  \n" \
"                                                                \n" \
"    //Make sure we do not go out of bounds                      \n" \
"    if (id < n)                                                 \n" \
"        c[id] = a[id] + b[id];                                  \n" \
"}                                                               \n" \
                                                                "\n" ;


int main(int argc, char *argv[])
{

    // Length of vectors
    unsigned int n = 1000;

    // Host input vectors
    double *h_a;
    double *h_b;
    // Host output vector
    double *h_c;
    double *h_c2;

    // Device input buffers
    cl::Buffer d_a;
    cl::Buffer d_b;
    // Device output buffer
    cl::Buffer d_c;

    // Size, in bytes, of each vector
    size_t bytes = n*sizeof(double);

    // Allocate memory for each vector on host
    h_a = new double[n];
    h_b = new double[n];
    h_c = new double[n];
    //h_c2 = new double[n];

    // Initialize vectors on host
    for(int i = 0; i < n; i++ )
    {
        h_a[i] = sinf(i)*sinf(i);
        h_b[i] = cosf(i)*cosf(i);
        //h_c2[i] = h_a[i] + h_b[i];
    }
    /*
    double res = 0;
    for(int i = 0; i < n; i++ )
    {
        res += h_c2[i];
        printf("%f / %d : %f\n",res,n,res/n);
    }

    printf("List 1:\n");
    for(int i = 0; i < n; i++ )
    {
        printf("%f, ",h_a[i]);
    }
    printf("\n");

    printf("List 2:\n");
    for(int i = 0; i < n; i++ )
    {
        printf("%f, ",h_b[i]);
    }
    printf("\n");

    printf("List 3:\n");
    for(int i = 0; i < n; i++ )
    {
        printf("%f, ",h_c2[i]);
    }
    printf("\n--> %f\n",res/double(n));
    */
    cl_int err = CL_SUCCESS;
    try {

        // Query platforms
        std::vector<cl::Platform> platforms;
        cl::Platform::get(&platforms);
        if (platforms.size() == 0) {
            std::cout << "Platform size 0\n";
            return -1;
         }

        // Get list of devices on default platform and create context
        cl_context_properties properties[] =
           { CL_CONTEXT_PLATFORM, (cl_context_properties)(platforms[0])(), 0};
        cl::Context context(CL_DEVICE_TYPE_GPU, properties);
        std::vector<cl::Device> devices = context.getInfo<CL_CONTEXT_DEVICES>();

        // Create command queue for first device
        cl::CommandQueue queue(context, devices[0], 0, &err);

        // Create device memory buffers
        d_a = cl::Buffer(context, CL_MEM_READ_ONLY, bytes);
        d_b = cl::Buffer(context, CL_MEM_READ_ONLY, bytes);
        d_c = cl::Buffer(context, CL_MEM_WRITE_ONLY, bytes);

        // Bind memory buffers
        queue.enqueueWriteBuffer(d_a, CL_TRUE, 0, bytes, h_a);
        queue.enqueueWriteBuffer(d_b, CL_TRUE, 0, bytes, h_b);

        //Build kernel from source string
        cl::Program::Sources source(1,
            std::make_pair(kernelSource,strlen(kernelSource)));
        cl::Program program_ = cl::Program(context, source);
        program_.build(devices);

        // Create kernel object
        cl::Kernel kernel(program_, "vecAdd", &err);

        // Bind kernel arguments to kernel
        kernel.setArg(0, d_a);
        kernel.setArg(1, d_b);
        kernel.setArg(2, d_c);
        kernel.setArg(3, n);

        // Number of work items in each local work group
        cl::NDRange localSize(64);
        // Number of total work items - localSize must be devisor
        cl::NDRange globalSize((int)(ceil(n/(float)64)*64));

        // Enqueue kernel
        cl::Event event;
        queue.enqueueNDRangeKernel(
            kernel,
            cl::NullRange,
            globalSize,
            localSize,
            NULL,
            &event);

        // Block until kernel completion
        event.wait();

        // Read back d_c
        queue.enqueueReadBuffer(d_c, CL_TRUE, 0, bytes, h_c);
        }
    catch (cl::Error err) {
         std::cerr
            << "ERROR: "<<err.what()<<"("<<err.err()<<")"<<std::endl;
    }

    double sum = 0;
    printf("Final list:\n");
    for(int i = 0; i < n; i++ )
    {
        printf("%f, ",h_c[i]);
        sum += h_c[i];
    }
    printf("\n--> %f\n",sum/n);

    // Sum up vector c and print result divided by n, this should equal 1 within error
    /*
    double sum = 0;
    for(int i=0; i<n; i++)
        sum += h_c[i];
    std::cout<<"final result: "<<sum/n<<std::endl;
    */
    // Release host memory
    delete(h_a);
    delete(h_b);
    delete(h_c);

    return 0;
}
