#ifndef CL_SOLVER_H
#define CL_SOLVER_H

/// IF YOU PLAN ON RUNNING THIS ON THE CPU CHANGE TO 1
#if __APPLE__
#if USE_OPENCL_ON_CPU
#define WGSIZE 1
#else
#define WGSIZE 256
#endif
#else
#define WGSIZE 1
#endif

#define BLOCK_SIZE 8
//Has to be BLOCK_SIZE + 2
#define BLOCK_SIZE_WITH_PAD 10

#include "cl-helper.h"
#include <math.h>

typedef struct CLData {
  cl_device_id device;
  cl_context ctx;
  cl_command_queue queue;
  cl_kernel advect_velocity_kernel;
  cl_kernel advect_density_kernel;
  cl_kernel vorticity_confinement_kernel;
  cl_kernel pressure_apply_kernel;
  cl_kernel pressure_solve_kernel;
  cl_kernel calculate_divergence_kernel;
  cl_kernel zero_pressure_kernel;
  cl_kernel laplacian_mtx_vec_mult_kernel;
  cl_kernel vector_dot_product_kernel;
  
  cl_mem buf_u;
  cl_mem buf_v;
  cl_mem buf_w;
  cl_mem buf_u_prev;
  cl_mem buf_v_prev;
  cl_mem buf_w_prev;
  cl_mem buf_dens;
  cl_mem buf_dens_prev;
  cl_mem buf_pressure;
  cl_mem buf_pressure_prev;
  cl_mem buf_divergence;
  cl_mem buf_cg_q;
  cl_mem buf_cg_d;
 
  cl_mem buf_debug_data1;
  cl_mem buf_debug_data2;
  cl_mem buf_debug_data3;
  
  cl_int status;
  
//  float *debug_data1;
//  float *debug_data2;
//  float *debug_data3;
//  
  float h;
  int n;
  int dn;
  int dims[3];
  
} CLData;

void set_device_id(CLData * clData){
  cl_device_id dev;
  CALL_CL_GUARDED(clGetCommandQueueInfo,
                  (clData->queue, CL_QUEUE_DEVICE, sizeof dev, &dev, NULL));
  
  clData->device = dev;
}

void init_cl_data(CLData * clData, float h, int n, int dn, int nx, int ny, int nz)
{
  clData->h = h;
  clData->n = n;
  clData->dn = dn;
  clData->dims[0] = nx;
  clData->dims[1] = ny;
  clData->dims[2] = nz;
//  clData->debug_data1 = (float*)malloc(sizeof(float)*n*dn);
//  clData->debug_data2 = (float*)malloc(sizeof(float)*n*dn);
//  clData->debug_data3 = (float*)malloc(sizeof(float)*n*dn);
  
}

cl_kernel load_single_cl_kernel(CLData *clData, const char* filename, const char* kernel_name)
{

  char *knl_text = read_file(filename);
  char options[256];
  sprintf(options,"-DNX=%u -DNY=%u -DNZ=%u -DWGSIZE=%u -DBLOCK_SIZE=%u -DBLOCK_SIZE_WITH_PAD=%u",NX,NY,NZ,WGSIZE,BLOCK_SIZE,BLOCK_SIZE_WITH_PAD);
  cl_kernel kernel = kernel_from_string( clData->ctx, knl_text, kernel_name, options);
  free(knl_text);
  return kernel;
}

void load_cl_kernels(CLData *clData)
{

  clData->advect_density_kernel = 
                     load_single_cl_kernel(clData,"kernels.cl","advectRK2");

//  clData->advect_velocity_kernel =
//                       load_single_cl_kernel(clData,"kernels.cl","advect_velocity_forward_euler");

  clData->advect_velocity_kernel =
                     load_single_cl_kernel(clData,"kernels.cl","advect_velocity_RK2");
  
  clData->vorticity_confinement_kernel =
                     load_single_cl_kernel(clData,"kernels.cl","vorticity_confinement");

  clData->pressure_apply_kernel =
                     load_single_cl_kernel(clData,"kernels.cl","pressure_apply");
  clData->pressure_solve_kernel =
                     load_single_cl_kernel(clData,"kernels.cl","pressure_solve");
  clData->calculate_divergence_kernel =
                     load_single_cl_kernel(clData,"kernels.cl","calculate_divergence");
  clData->zero_pressure_kernel =
                     load_single_cl_kernel(clData,"kernels.cl","zero_pressure");
  
  clData->laplacian_mtx_vec_mult_kernel =
                     load_single_cl_kernel(clData,"kernels.cl","laplacian_mtx_vec_mult");
  clData->vector_dot_product_kernel =
                     load_single_cl_kernel(clData,"kernels.cl","vector_dot_product");
  
}


void allocate_cl_buffers(CLData *clData)
{
 
  clData->buf_u = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                     sizeof(float) * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");
  
  clData->buf_v = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                     sizeof(float) * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");
  
  clData->buf_w = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                     sizeof(float) * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");

  clData->buf_u_prev = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                     sizeof(float) * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");
  
  clData->buf_v_prev = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                     sizeof(float) * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");
  
  clData->buf_w_prev = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                     sizeof(float) * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");


  clData->buf_dens_prev = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                        sizeof(float) * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");
  
  clData->buf_dens = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                   sizeof(float) * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");

   
  clData->buf_pressure_prev = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                   sizeof(float) * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");

  clData->buf_pressure = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                   sizeof(float) * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");
   
   
  clData->buf_divergence = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                   sizeof(float) * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");
  
  clData->buf_cg_q = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                   sizeof(float) * clData->n, 0, &clData->status);
  
  clData->buf_cg_d = clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                   sizeof(float) * clData->n, 0, &clData->status);
  
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");
  
  clData->buf_debug_data1= clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                         sizeof(float) * clData->dn * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");
  
  clData->buf_debug_data2= clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                         sizeof(float) * clData->dn * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");
  
  clData->buf_debug_data3= clCreateBuffer(clData->ctx, CL_MEM_READ_WRITE,
                                         sizeof(float) * clData->dn * clData->n, 0, &clData->status);
  CHECK_CL_ERROR(clData->status, "clCreateBuffer");
}


void transfer_cl_float_buffer_to_device(
                                        CLData *clData,
                                        cl_mem buf, 
                                        float * memory, 
                                        int size, 
                                        cl_bool blocking)
{
   CALL_CL_GUARDED(clEnqueueWriteBuffer, ( 
            clData->queue, 
            buf, 
            blocking, 
            0, 
            size*sizeof(float), 
            memory, 
            0, 
            NULL,
            NULL));
}

void transfer_cl_int_buffer_to_device(
                                       CLData *clData,
                                       cl_mem buf, 
                                       int * memory, 
                                       int size, 
                                       cl_bool blocking)
{
   CALL_CL_GUARDED(clEnqueueWriteBuffer, ( clData->queue, buf, blocking, 0, size*sizeof(int), memory, 0, NULL, NULL));
}


void transfer_cl_float_buffer_from_device(
                                          CLData *clData,
                                          cl_mem buf, 
                                          float * memory, 
                                          int size, 
                                          cl_bool blocking)
{
   CALL_CL_GUARDED(clEnqueueReadBuffer, (
                                        clData->queue, buf,
                                         blocking, //blocking
                                        0, //offset
                                        size * sizeof(float), memory,
                                        0, NULL, NULL));
}
void cleanup_cl(CLData *clData) {

  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_u));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_v));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_w));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_u_prev));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_v_prev));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_w_prev));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_dens));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_dens_prev));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_divergence));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_pressure));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_pressure_prev));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_cg_q));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_cg_d));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_debug_data1));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_debug_data2));
  CALL_CL_GUARDED(clReleaseMemObject, (clData->buf_debug_data3));
  
  CALL_CL_GUARDED(clReleaseKernel, (clData->advect_velocity_kernel));
  CALL_CL_GUARDED(clReleaseKernel, (clData->advect_density_kernel));
  CALL_CL_GUARDED(clReleaseKernel, (clData->vorticity_confinement_kernel));
  CALL_CL_GUARDED(clReleaseKernel, (clData->pressure_solve_kernel));
  CALL_CL_GUARDED(clReleaseKernel, (clData->pressure_apply_kernel));
  CALL_CL_GUARDED(clReleaseKernel, (clData->calculate_divergence_kernel));
  CALL_CL_GUARDED(clReleaseKernel, (clData->zero_pressure_kernel));
  CALL_CL_GUARDED(clReleaseKernel, (clData->laplacian_mtx_vec_mult_kernel));
  CALL_CL_GUARDED(clReleaseKernel, (clData->vector_dot_product_kernel));
  
  CALL_CL_GUARDED(clReleaseCommandQueue, (clData->queue));
  CALL_CL_GUARDED(clReleaseContext, (clData->ctx));
  
  
//  free(clData->debug_data1);
//  free(clData->debug_data2);
//  free(clData->debug_data3);
}


void run_cl_advect_density(CLData * clData, float dt)
{
   SET_8_KERNEL_ARGS(
                 clData->advect_density_kernel,
                 dt,
                 clData->dims,
                 clData->h,
                 clData->buf_dens,
                 clData->buf_dens_prev,
                 clData->buf_u,
                 clData->buf_v,
                 clData->buf_w
//                 clData->buf_debug_data1,
//                 clData->buf_debug_data2,
//                 clData->buf_debug_data3
                    );
    
    size_t ldim[] = { WGSIZE };
    size_t gdim[] = { clData->n};
    
    CALL_CL_GUARDED(clEnqueueNDRangeKernel,
                    (clData->queue, clData->advect_density_kernel,
                     /*dimensions*/ 1, NULL, gdim, ldim,
                     0, NULL, NULL));

}

void run_cl_advect_velocity(CLData * clData, float dt)
{
  SET_9_KERNEL_ARGS(
                     clData->advect_velocity_kernel,
                     dt,
                     clData->dims,
                     clData->h,
                     clData->buf_u,
                     clData->buf_v,
                     clData->buf_w,
                     clData->buf_u_prev,
                     clData->buf_v_prev,
                     clData->buf_w_prev
//                     clData->buf_debug_data1,
//                     clData->buf_debug_data2,
//                     clData->buf_debug_data3
                    );
  
  size_t ldim[] = { WGSIZE };
  size_t gdim[] = { clData->n};
  
  CALL_CL_GUARDED(clEnqueueNDRangeKernel,
                  (clData->queue, clData->advect_velocity_kernel,
                   /*dimensions*/ 1, NULL, gdim, ldim,
                   0, NULL, NULL));
  
}

void run_cl_vorticity_confinement(CLData * clData, float dt, float e)
{
  SET_9_KERNEL_ARGS(
                    clData->vorticity_confinement_kernel,
                    clData->buf_u,
                    clData->buf_v,
                    clData->buf_w,
                    clData->buf_u_prev,
                    clData->buf_v_prev,
                    clData->buf_w_prev,
                    clData->dims,
                    dt,
                    e
                    );
  
  size_t ldim[] = { WGSIZE };
  size_t gdim[] = { clData->n};
  
  CALL_CL_GUARDED(clEnqueueNDRangeKernel,
                  (clData->queue, clData->vorticity_confinement_kernel,
                   /*dimensions*/ 1, NULL, gdim, ldim,
                   0, NULL, NULL));
  
}

void run_cl_calculate_divergence(CLData * clData, float dt)
{
  SET_6_KERNEL_ARGS(
                     clData->calculate_divergence_kernel,
                     clData->buf_divergence,
                     clData->buf_u,
                     clData->buf_v,
                     clData->buf_w,
                     clData->dims,
                     dt);
  
  size_t ldim[] = { WGSIZE };
  size_t gdim[] = { clData->n};
  
  CALL_CL_GUARDED(clEnqueueNDRangeKernel,
                  (clData->queue, clData->calculate_divergence_kernel,
                   /*dimensions*/ 1, NULL, gdim, ldim,
                   0, NULL, NULL));
  
}

void run_laplacian_mtx_vec_mult(CLData * clData)
{
  SET_3_KERNEL_ARGS(
                    clData->laplacian_mtx_vec_mult_kernel,
                    clData->buf_cg_q,
                    clData->buf_cg_d,
                    clData->dims);
  
  size_t ldim[] = { WGSIZE };
  size_t gdim[] = { clData->n};
  
  CALL_CL_GUARDED(clEnqueueNDRangeKernel,
                  (clData->queue, clData->laplacian_mtx_vec_mult_kernel,
                   /*dimensions*/ 1, NULL, gdim, ldim,
                   0, NULL, NULL));
  
}


float dot_vec(float* a, float* b, int n){
  float sum = 0;
    for(int i = 0; i < n; i++)
      sum += a[i] * b[i];
    return sum;
  }

void mtx_times_vec_for_laplacian(float *out, float* x, int n);

  void run_cl_cg_no_mtx(CLData *clData,float* x, float *b, float *r, float *d, float *q, int N, int maxIter, float tol){
    //x = pressure
    //b = divergence
    
    
    //When porting cg to opencl  only the mtx-vec multiply and the
    //dot-product(reduction) are run on the GPU everything is on the GPU
    int i = 0;
    int imax = maxIter;
//    float r[N];
//    float d[N];
//    float q[N];
    
    for(int i = 0; i < N; i++){
      x[i] = q[i] = 0.0f;
      r[i] = b[i];//b-Ax
      d[i] = r[i];
    }
    
    
    float rnew = dot_vec(r,r,N);
    float rold = 0.0f;
    
    float r0 = rnew;
    while(i < imax && rnew > 0.0000001*r0) {
      transfer_cl_float_buffer_to_device(clData,clData->buf_cg_q,q,clData->n,true);
      transfer_cl_float_buffer_to_device(clData,clData->buf_cg_d,d,clData->n,true);
      run_laplacian_mtx_vec_mult(clData);
      transfer_cl_float_buffer_from_device(clData,clData->buf_cg_q,q,clData->n,true);
      transfer_cl_float_buffer_from_device(clData,clData->buf_cg_d,d,clData->n,true);
      //mtx_times_vec_for_laplacian(q,d,N);
      float alpha = rnew/(dot_vec(d,q,N));
      
      for(int j = 0; j < N; j++){
        x[j] += alpha*d[j];
      }
      
      for(int j = 0; j < N; j++){
        r[j] -= alpha*q[j];
      }
      
      rold = rnew;
      rnew = dot_vec(r,r,N);
      
      float beta = rnew/rold;
      
      for(int j = 0; j < N; j++){
        d[j] = r[j] + beta*d[j];
      }
      
      i++;
    }
    //printf("CG Terminated with iterations %d, and rnew %3.6f\n",i, rnew);
  }

  void run_cl_pressure_solve(CLData * clData, float dt)
  {
    SET_5_KERNEL_ARGS(
                      clData->pressure_solve_kernel,
                      clData->buf_pressure,
                      clData->buf_pressure_prev,
                      clData->buf_divergence,
                    clData->dims,
                    dt);
  
  size_t ldim[] = { WGSIZE };
  size_t gdim[] = { clData->n};
  
  CALL_CL_GUARDED(clEnqueueNDRangeKernel,
                  (clData->queue, clData->pressure_solve_kernel,
                   /*dimensions*/ 1, NULL, gdim, ldim,
                   0, NULL, NULL));
  
  //swap pressure buffers
//  cl_mem tmp = clData->buf_pressure;
//  clData->buf_pressure = clData->buf_pressure_prev;
//  clData->buf_pressure_prev = tmp;
  
}

void run_cl_pressure_apply(CLData * clData, float dt)
{
  SET_6_KERNEL_ARGS(
                    clData->pressure_apply_kernel,
                    clData->buf_u,
                    clData->buf_v,
                    clData->buf_w,
                    clData->buf_pressure,
                    clData->dims,
                    dt);
  
  size_t ldim[] = { WGSIZE };
  size_t gdim[] = { clData->n};
  
  CALL_CL_GUARDED(clEnqueueNDRangeKernel,
                  (clData->queue, clData->pressure_apply_kernel,
                   /*dimensions*/ 1, NULL, gdim, ldim,
                   0, NULL, NULL));
  
}
void run_cl_zero_pressure(CLData * clData)
{
  SET_1_KERNEL_ARG( clData->zero_pressure_kernel, clData->buf_pressure);
  
  size_t ldim[] = { WGSIZE };
  size_t gdim[] = { clData->n};
  
  CALL_CL_GUARDED(clEnqueueNDRangeKernel,
                  (clData->queue, clData->zero_pressure_kernel,
                   /*dimensions*/ 1, NULL, gdim, ldim,
                   0, NULL, NULL));
  
}

#endif //CL_SOLVER_H
