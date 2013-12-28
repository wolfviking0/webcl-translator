#include <stdio.h>
#include <stdlib.h>
#include <vector>
#include <iostream>
#include <cmath>
#include <fstream>
#include <ctime>
 
using namespace std;
#ifdef __APPLE__
#include <OpenCL/opencl.h>
#else
#include <CL/opencl.h>
#endif
 
#define DIM 300
#define MAX_SOURCE_SIZE (0x100000)
 
int main(int argc, char *argv[])
{
    cl_platform_id platform_id = NULL;
    cl_device_id device_id = NULL;
    cl_context context = NULL;
    cl_command_queue command_queue = NULL;
    cl_mem Amobj = NULL;
    cl_mem Bmobj = NULL;
    cl_mem Cmobj = NULL;
    cl_program program = NULL;
    cl_kernel kernel = NULL;
    cl_uint ret_num_devices;
    cl_uint ret_num_platforms;
    cl_int ret;
     
    int use_gpu = 1;
    int i = 0;
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
    size_t global_item_size[2];
	int t = ceil((DIM+0.0)/128);
	if(t <= 128){
		global_item_size[0]=t;
		global_item_size[1]=128;
	}else{
		cout << "Too many work items" << endl;
		exit(1);
	}
    FILE *fp;
    const char fileName[] = "./event_profiling.cl";
    size_t source_size;
    char *source_str;
 
    /* Load kernel source file */
    fp = fopen(fileName, "r");
    if (!fp) {
        fprintf(stderr, "Failed to load kernel.\n");
        exit(1);
    }
    source_str = (char *)malloc(MAX_SOURCE_SIZE);
    source_size = fread( source_str, 1, MAX_SOURCE_SIZE, fp );
    fclose( fp );
 
    /* Initialize input data */
	//fstream f;
	//f.open("inp",ios::in);
 
	/* Getting input from a text file */
	int *MAT_A;
	int *MAT_B;
	MAT_A = (int *)malloc(DIM*DIM*sizeof(int));
	MAT_B = (int *)malloc(DIM*DIM*sizeof(int));
 
	//int c;
	//f >> c;
	//int count_rows=0;
	//int count_mat=0;
	//int count_col=0;
	
	/*
	while(!f.eof()){
		if(count_mat == 0){
			MAT_A[(DIM*count_rows)+count_col] = c;
		}else if(count_mat == 1){
			MAT_B[(DIM*count_rows)+count_col] = c;
		}
		count_col++;
		if(count_col == DIM){
			count_col=0;
			count_rows++;
		}
		if(count_rows == DIM){
			count_rows=0;
			count_mat++;
		}
		f >> c;
	}*/
	/* Initialize output data */
	int *output;
	output = (int *)malloc(DIM*DIM*sizeof(int));
	for(int i=0;i<DIM;i++){
		for(int j=0;j<DIM;j++){
			output[DIM*i+j] = 0;
		}
	}
 
	cl_event event[5];
    /* Get Platform/Device Information */ 
    ret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms);
	if(ret!=CL_SUCCESS){
		cout << "clGetPlatformIDs fail" << endl;
	}
    ret = clGetDeviceIDs( platform_id, use_gpu ? CL_DEVICE_TYPE_GPU : CL_DEVICE_TYPE_CPU, 1, &device_id, &ret_num_devices);
    if(ret!=CL_SUCCESS){
		cout << "clGetDeviceIDs fail" << endl;
	}
    /* Create OpenCL Context */
    context = clCreateContext( NULL, 1, &device_id, NULL, NULL, &ret);
 
    /* Create command queue */
    command_queue = clCreateCommandQueue(context, device_id, CL_QUEUE_PROFILING_ENABLE, &ret);
 
    /* Create Buffer Object */
    Amobj = clCreateBuffer(context, CL_MEM_READ_ONLY, DIM*DIM*sizeof(int), NULL, &ret);
    Bmobj = clCreateBuffer(context, CL_MEM_READ_ONLY, DIM*DIM*sizeof(int), NULL, &ret);
    Cmobj = clCreateBuffer(context, CL_MEM_READ_WRITE, DIM*DIM*sizeof(int), NULL, &ret);
 
    /* Copy input data to the memory buffer */
    CL_SET_TYPE_POINTER(CL_SIGNED_INT32);
    ret = clEnqueueWriteBuffer(command_queue, Amobj, CL_TRUE, 0, DIM*DIM*sizeof(int), MAT_A, 0, NULL, event);
	if(ret!=CL_SUCCESS){
		cout << "clEnqueueWriteBuffer input fail" << endl;
	}
	CL_SET_TYPE_POINTER(CL_SIGNED_INT32);
    ret = clEnqueueWriteBuffer(command_queue, Bmobj, CL_TRUE, 0, DIM*DIM*sizeof(int), MAT_B, 0, NULL, event+1);
    if(ret!=CL_SUCCESS){
		cout << "clEnqueueWriteBuffer element_in_rows fail" << endl;
	}
	CL_SET_TYPE_POINTER(CL_SIGNED_INT32);
	ret = clEnqueueWriteBuffer(command_queue, Cmobj, CL_TRUE, 0, DIM*DIM*sizeof(int), output, 0, NULL, event+2);
	if(ret != CL_SUCCESS){
		cout << "clEnqueueWriteBuffer output fail" << endl;
	}
 
    /* Create kernel program from source file */ 
    program = clCreateProgramWithSource(context, 1, (const char **)&source_str, (const size_t *)&source_size, &ret);
    ret     = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);
    if(ret!=CL_SUCCESS){
		cout << "clBuildProgram fail" << " ";
		if(ret == CL_BUILD_PROGRAM_FAILURE){
			cout << "CL_BUILD_PROGRAM_FAILURE" ;
			size_t build_log_size=sizeof(char)*900;
			char * build_log=  new char[900];
			size_t *build_log_ret;
			ret =  clGetProgramBuildInfo(program,device_id,CL_PROGRAM_BUILD_LOG,build_log_size,build_log,build_log_ret);
			for(int i=0;i<(*build_log_ret)/sizeof(char);i++){
				cout << build_log[i];
			}
		}
		cout << endl;
	}
 
    /* Create data parallel OpenCL kernel */
    kernel = clCreateKernel(program, "ker", &ret);
 
    /* Set OpenCL kernel arguments*/ 
    ret = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void *)&Amobj);
	if(ret!=CL_SUCCESS){
		cout << "clSetKernelArg 0 fail" << endl;
	}    
	ret = clSetKernelArg(kernel, 1, sizeof(cl_mem), (void *)&Bmobj);
	if(ret!=CL_SUCCESS){
		cout << "clSetKernelArg 1 fail" << endl;
	}
	ret = clSetKernelArg(kernel, 2, sizeof(cl_mem) , (void *)&Cmobj);
	if(ret!=CL_SUCCESS){
		cout << "clSetKernelArg 2 fail" << endl;
	}
 
	int width = DIM;
	ret = clSetKernelArg(kernel, 3, sizeof(cl_int) , (void *)&width);
	if(ret!=CL_SUCCESS){
		cout << "clSetKernelArg 3 fail" << endl;
	}
 
     /* Execute OpenCL kernel as data parallel */
    ret = clEnqueueNDRangeKernel(command_queue, kernel, 2, NULL, 
                                 global_item_size, NULL, 0, NULL, event+3);
    if(ret!=CL_SUCCESS){
		cout << "clEnqueueNDRangeKernel fail" << endl;
		if(ret == CL_OUT_OF_RESOURCES){
			cout << "Kernel out of resources!!!" << endl;
		}
	}
 
 	CL_SET_TYPE_POINTER(CL_SIGNED_INT32);
	ret = clEnqueueReadBuffer(command_queue, Cmobj, CL_TRUE, 0, DIM*DIM*sizeof(int), output, 0, NULL, event+4);
	if(ret!=CL_SUCCESS){
		cout << "clEnqueueReadBuffer fail" << endl;
	}
 
	long long start=0,end=0,time1=0,time2=0,time3=0;
 
	for(int i=0;i<5;i++){
 
		/*
                 * clGetEventProfilingInfo returns profiling information for the command associated with event if profiling is enabled.
                 *
                 * param 1: Specifies the event object.
                 * param 2: Specifies the profiling data to query. It can be of four types:
                 *          CL_PROFILING_COMMAND_QUEUED - A 64-bit value that describes the current device time counter in 
                 *                                        nanoseconds when the command identified by event is enqueued in a
                 *                                        command-queue by the host. 
                 *          CL_PROFILING_COMMAND_SUBMIT - A 64-bit value that describes the current device time counter in
                 *                                        nanoseconds when the command identified by event that has been 
                 *                                        enqueued is submitted by 
                 *                                        the host to the device associated with the commandqueue. 
                 *          CL_PROFILING_COMMAND_START  - A 64-bit value that describes the current device time counter in 
                 *                                        nanoseconds when the command identified by event starts execution on 
                 *                                        the device. 
                 *          CL_PROFILING_COMMAND_END    - A 64-bit value that describes the current device time counter in 
                 *                                        nanoseconds when the command identified by event has finished execution 
                 *                                        on the device. 
                 * param 3: Specifies the size in bytes of memory pointed to by param 4. This size must be greater than or equal to 64
                 * param 4: A pointer to memory where the appropriate result being queried is returned. If NULL, it is ignored.
                 * param 5: Returns the actual size in bytes of data copied to param 4. If NULL, it is ignored.  
                 */
		ret = clGetEventProfilingInfo(event[i],CL_PROFILING_COMMAND_START,sizeof(double),&start,NULL);
		if(ret != CL_SUCCESS){
			cout << "clGetEventProfilingInfo start fail" << endl;
		}
		ret = clGetEventProfilingInfo(event[i],CL_PROFILING_COMMAND_END,sizeof(double),&end,NULL);
		if(ret != CL_SUCCESS){
			cout << "clGetEventProfilingInfo end fail" << endl;
		}
		time1 += (end-start);
		if(i==3){
			time2 += (end - start);
		}
		if(i==4){
			time3 += (end-start);
		}
	}
	cout << "Loop 1 : " << (time1-time2-time3+0.0)/1000000000 << endl;
	cout << "Loop 2 : " <<(time2+0.0)/1000000000 << endl;
	cout << "Loop 3 : " <<(time3+0.0)/1000000000 << endl;
 
    /* Transfer result to host */
 	/*
	for(int i=0;i<DIM;i++){
		for(int j=0;j<DIM-1;j++){
			cout << output[DIM*i+j] << " ";
		}
		cout << output[DIM*i+(DIM-1)] << endl;
	}
 	*/
 
    /* Finalization */
    ret = clFlush(command_queue);
    ret = clFinish(command_queue);
    ret = clReleaseKernel(kernel);
    ret = clReleaseProgram(program);
    ret = clReleaseMemObject(Amobj);
    ret = clReleaseMemObject(Bmobj);
    ret = clReleaseMemObject(Cmobj);
    ret = clReleaseCommandQueue(command_queue);
    ret = clReleaseContext(context);
 
    free(source_str);
    free(output);
 
    return 0;
}