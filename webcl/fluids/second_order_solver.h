#ifndef SECOND_ORDER_SOLVER_H
#define SECOND_ORDER_SOLVER_H

#define WRAP_BOUNDS 0
#define USE_U_BLAS 0

#if USE_U_BLAS

#pragma warning(disable: 4244 4267 4996)
#include <boost/numeric/ublas/vector.hpp>
#include <boost/numeric/ublas/io.hpp>
#include <boost/numeric/ublas/matrix_sparse.hpp>
using namespace boost::numeric;

#include "conjugate_gradient.h"

#endif

#include <assert.h>
#include <math.h>

//#define H ((1.0f)/(NX))

#if NZ > 1
#define IX(i,j,k) ((i) + ((j)*(NX)) + ((k)*(NX)*(NY)))

#define FOR_EACH_INTERNAL_CELL \
   for(int k = 1; k < NZ-1; k++)  \
      for(int j = 1; j < NY-1; j++) \
         for(int i = 1; i < NX-1; i++) 

#else
#define IX(i,j,k) ((i) + ((j)*(NX)))

#define FOR_EACH_INTERNAL_CELL \
   for(int k = 0; k < NZ; k++)  \
      for(int j = 1; j < NY-1; j++) \
         for(int i = 1; i < NX-1; i++) 
#endif 

#define IXBLAS(i,j,k) ((i) + ((k)*(NX)) + ((j)*(NX)*(NZ)))

//#define LERP(a,b,t) (((1.0f)-(t))*(a) + ((t)*(b)))
#define CLAMP(low, high, x)  (((x) > (high)) ? (high) : (((x) < (low)) ? (low) : (x)))
#define MIX(a,b,t) (((1.0f)-(t))*(a) + ((t)*(b)))
#define CLAMPCL(x,low, high)  (((x) > (high)) ? (high) : (((x) < (low)) ? (low) : (x)))

#define SWAP(x0,x) {float * tmp=x0;x0=x;x=tmp;}

#define FOR_EACH_CELL \
   for(int k = 0; k < NZ; k++)  \
        for(int j = 0; j < NY; j++) \
           for(int i = 0; i < NX; i++) 

  #define FOR_EACH_FACE \
     for(int k = 0; k < NZ; k++) \
        for(int j = 0; j < NY; j++) \
           for(int i = 0; i < NX; i++) 

  typedef struct float3 {
    float x;
    float y;
    float z;
    
    
  } float3;

  typedef struct int3 {
    int x;
    int y;
    int z;
    
    
  } int3;



  float3 clampf3(float3 src, float min, float max) {
    float3 ret = src;
    ret.x = CLAMP(min, max, ret.x);
    ret.y = CLAMP(min, max, ret.y);
    ret.z = CLAMP(min, max, ret.z);
    return ret;
  }

  int3 clampi3(int3 src, float min, float max) {
    int3 ret = src;
    ret.x = CLAMP(min, max, ret.x);
    ret.y = CLAMP(min, max, ret.y);
    ret.z = CLAMP(min, max, ret.z);
    return ret;
  }

  static void copy_grid(float *source, float * dest)
  {
    int size = NX*NY*NZ;
    for(int i = 0; i < size; ++i)
    {
      dest[i] = source[i];
    }
  }

  float min(float a, float b) {
    return a>b?b:a;
  }

  float max(float a, float b) {
    return b>a?b:a;
  }


  int mod (int a, int b)
  {
//    if(b < 0) //you can check for b == 0 separately and do what you want
//      return mod(-a, -b);
//    int ret = a % b;
//    if(ret < 0)
//      ret+=b;
//    return ret;
    
    int ret = a % b;
    if(ret < 0)
      ret+=b;
    return ret;
  }

  float get_data(float * x, int i, int j, int k)
  {
    //If I basically have a 2D grid then the 3 way check gives bad results 
    //if(i < 0 || i >= NX || j < 0 || j >= NY || k < 0 || k >= NZ)
    //if(i < 0 || i >= NX || j < 0 || j >= NY)
    //{
    //	return 0.0f;
    //}
  #if WRAP_BOUNDS
    //Wrap around boundaries
    i = mod(i , NX);
    j = mod(j , NY);
    k = mod(k , NZ);
  #else
    i = CLAMPCL(i,0,NX-1);
    j = CLAMPCL(j,0,NY-1);
    k = CLAMPCL(k,0,NZ-1);
  #endif
    
    return x[IX(i,j,k)];
  }

float get_data_z(float * x, int i, int j, int k)
{
  //If I basically have a 2D grid then the 3 way check gives bad results
  if(i < 0 || i >= NX  || j < 0 || j >= NY || k < 0 || k >= NZ)
  {
      return 0.0f;
  }
//  i = mod(i , NX);
//  j = mod(j , NY);
//  k = mod(k , NZ);
//
//  i = CLAMPCL(i,0,NX-1);
//  j = CLAMPCL(j,0,NY-1);
//  k = CLAMPCL(k,0,NZ-1);
  
  return x[IX(i,j,k)];
}
  float get_interpolated_value(float * x, float3 pos, float h, int3 n)
  {
    
  #if WRAP_BOUNDS
    //IF WANT WRAP AROUND COMMENT THIS OUT
    int inc_i = pos.x<0?-1:1;
    int inc_j = pos.y<0?-1:1;
    int inc_k = pos.z<0?-1:1;
    int i0 = mod(pos.x / h , n.x);
    int j0 = mod(pos.y / h , n.y);
    int k0 = mod(pos.z / h , n.z);
    int i1 = mod(i0 + inc_i, n.x);
    int j1 = mod(j0 + inc_j, n.y);
    int k1 = mod(k0 + inc_k, n.z);
    
    //Calculate t per component
    float it = fabs(pos.x - i0*h);
    float jt = fabs(pos.y - j0*h);
    float kt = fabs(pos.z - k0*h);
  #else
    //The grid world pos is 0-1.
    int i0 = pos.x / h;
    int j0 = pos.y / h;
    int k0 = pos.z / h;
    int i1 = CLAMP(0,n.x-1, i0 + 1);
    int j1 = CLAMP(0,n.y-1, j0 + 1);
    int k1 = CLAMP(0,n.z-1, k0 + 1);
    
    //Calculate t per component
    float it = (pos.x - i0*h);
    float jt = (pos.y - j0*h);
    float kt = (pos.z - k0*h);


    assert (it < 1.0 && it >= 0);
    assert (jt < 1.0 && jt >= 0);
    assert (kt < 1.0 && kt >= 0);
  #endif

    // Assume a cube with 8 points
    //Front face
    //Top Front MIX
    float xFrontLeftTop = x[IX(i0,j1,k0)];
    float xFrontRightTop = x[IX(i1,j1,k0)];
    float xFrontTopInterp = MIX(xFrontLeftTop, xFrontRightTop, it);
    //Bottom Front MIX
    float xFrontLeftBottom = x[IX(i0,j0,k0)];
    float xFrontRightBottom = x[IX(i1,j0,k0)];
    float xFrontBottomInterp = MIX(xFrontLeftBottom, xFrontRightBottom, it);

    //Back face
    //Top Back MIX
    float xBackLeftTop = x[IX(i0,j1,k1)];
    float xBackRightTop = x[IX(i1,j1,k1)];
    float xBackTopInterp = MIX(xBackLeftTop, xBackRightTop, it);
    //Bottom Back MIX
    float xBackLeftBottom = x[IX(i0,j0,k1)];
    float xBackRightBottom = x[IX(i1,j0,k1)];
    float xBackBottomInterp = MIX(xBackLeftBottom, xBackRightBottom, it);


    //Now get middle of front -The bilinear interp of the front face
    float xBiLerpFront = MIX(xFrontBottomInterp, xFrontTopInterp,jt);

    //Now get middle of back -The bilinear interp of the back face
    float xBiLerpBack = MIX(xBackBottomInterp, xBackTopInterp, jt);

    //Now get the interpolated point between the points calculated in the front and back faces - The trilinear interp part
    float xTriLerp = MIX(xBiLerpFront, xBiLerpBack, kt);

    return xTriLerp;
  }

  float Modf(float x, float y)
  {
    if(0 == y)
    {
      return x;
    }
    return x - y * floor(x/y);
  }

  float length3(float3 *v)
  {
    float l = v->x*v->x + v->y*v->y + v->z*v->z;
    
    if(l)
      return sqrtf(l);
    
    return 0.0f;
    
  }

  float3 subtract(float3 *a, float3 *b)
  {
    float3 out = { a->x - b->x,a->y - b->y,a->z - b->z};
    return out;
  }

  float3 cross3(float3 *a, float3 *b)
  {
    float3 out = {
      a->y*b->z - a->z*b->y,
      a->z*b->x - a->x*b->z,
      a->x*b->y - a->y*b->x
    };
    return out;

  }

void safe_normalize3(float3 *v)
{
  float l = v->x*v->x + v->y*v->y + v->z*v->z;
  if(l > 0.0f)
  {
    float invSqrt = 1.0f/sqrtf(l);
    v->x = v->x * invSqrt;
    v->y = v->y * invSqrt;
    v->z = v->z * invSqrt;
  }
  else
  {
    v->x = v->y = v->z = 0.0f;
  }
}

float3 get_curl(float * u, float * v, float * w, int i, int j, int k)
{
	float dwdj = 0.5f*(get_data(w, i, j+1, k) - get_data(w,i, j-1, k));
	float dwdi = 0.5f*(get_data(w, i+1, j, k) - get_data(w,i-1, j, k));
	
	float dudk = 0.5f*(get_data(u, i, j, k+1)-get_data(u, i, j, k-1));
	float dudj = 0.5f*(get_data(u, i, j+1, k)-get_data(u, i, j-1, k));
	
	float dvdk = 0.5f*(get_data(v, i, j, k+1)-get_data(v, i, j, k-1));
	float dvdi = 0.5f*(get_data(v, i+1, j, k)-get_data(v, i-1, j, k));
	
  float3 out = {dwdj-dvdk, dudk-dwdi, dvdi-dudj};
  return out;
}

void vorticity_confinement(float dt, float *u, float *v, float* w, float * u_prev, float * v_prev, float * w_prev)
{
	float3 curl;
  float3 curl_iplus1;
  float3 curl_iminus1;
  float3 curl_jplus1;
  float3 curl_jminus1;
  float3 curl_kplus1;
  float3 curl_kminus1;
  
  float3 n;
  float3 f;
  
	FOR_EACH_INTERNAL_CELL
	{
    // calculate gradient of curl magnitude
    curl_iplus1 = get_curl(u_prev,v_prev, w_prev, i+1, j, k);
    curl_iminus1= get_curl(u_prev,v_prev, w_prev, i-1, j, k);
    
    curl_jplus1 = get_curl(u_prev,v_prev, w_prev, i, j+1, k);
    curl_jminus1= get_curl(u_prev,v_prev, w_prev, i, j-1, k);
    
    curl_kplus1 = get_curl(u_prev,v_prev, w_prev, i, j, k+1);
    curl_kminus1 = get_curl(u_prev,v_prev, w_prev, i, j, k-1 );
    
    float dcdi = 0.5f*(length3(&curl_iplus1) - length3(&curl_iminus1));
    float dcdj = 0.5f*(length3(&curl_jplus1) - length3(&curl_jminus1));
    float dcdk = 0.5f*(length3(&curl_kplus1) - length3(&curl_kminus1));
    
    n.x = dcdi;
    n.y = dcdj;
    n.z = dcdk;
    
    safe_normalize3(&n);
    
    curl = get_curl(u_prev,v_prev, w_prev, i, j, k );
    
    float e = 0.5f;
    
    f = cross3(&n, &curl);
    
    u[IX(i,j,k)] += f.x * e * dt;
    v[IX(i,j,k)] += f.y * e * dt;
    w[IX(i,j,k)] += f.z * e * dt;
    
	}
}

void advect_velocity_maccormack(float delta_time, float *u, float *v, float *w, float * u_prev, float * v_prev, float * w_prev)
{
  int3 dims = {NX,NY,NZ};
	float dt = delta_time*NX;
    //2nd Order MacCormack Method. See: http://physbam.stanford.edu/~aselle/papers/7/
	FOR_EACH_FACE
	{
		//McCormack Advection Formula
		//phi_hat_n_plus_one = A(phi_dims)
		//phi_hat_n = A^reverse(phi_hat_n_plus_one)
		//phi_n_plus_one = phi_hat_n_plus_one + (phi_n - phi_hat_dims)/2

		float3 pos = {i*H,j*H,k*H};
		float3 phi_n = {u_prev[IX(i,j,k)],v_prev[IX(i,j,k)],w_prev[IX(i,j,k)]};
    
		float3 phi_hat_n_plus_one_sample_position = {
			pos.x-(dt*phi_n.x),
			pos.y-(dt*phi_n.y),
			pos.z-(dt*phi_n.z)
    };
    
#if !WRAP_BOUNDS
		phi_hat_n_plus_one_sample_position.x  = CLAMPCL(phi_hat_n_plus_one_sample_position.x,0.0f,NX-1);
		phi_hat_n_plus_one_sample_position.y  = CLAMPCL(phi_hat_n_plus_one_sample_position.y,0.0f,NY-1);
		phi_hat_n_plus_one_sample_position.z  = CLAMPCL(phi_hat_n_plus_one_sample_position.z,0.0f,NZ-1);
#endif
    
		float3 phi_hat_n_plus_one;
		phi_hat_n_plus_one.x = get_interpolated_value(u_prev, phi_hat_n_plus_one_sample_position,H,dims);
		phi_hat_n_plus_one.y = get_interpolated_value(v_prev, phi_hat_n_plus_one_sample_position,H,dims);
		phi_hat_n_plus_one.z = get_interpolated_value(w_prev, phi_hat_n_plus_one_sample_position,H,dims);
    
		float3 phi_hat_n_sample_position;
		phi_hat_n_sample_position.x  = phi_hat_n_plus_one_sample_position.x + dt*phi_hat_n_plus_one.x;
		phi_hat_n_sample_position.y  = phi_hat_n_plus_one_sample_position.y + dt*phi_hat_n_plus_one.y;
		phi_hat_n_sample_position.z  = phi_hat_n_plus_one_sample_position.z + dt*phi_hat_n_plus_one.z;
    
    
#if !WRAP_BOUNDS
		phi_hat_n_sample_position.x  = CLAMPCL(phi_hat_n_sample_position.x,0.0f,NX-1);
		phi_hat_n_sample_position.y  = CLAMPCL(phi_hat_n_sample_position.y,0.0f,NY-1);
		phi_hat_n_sample_position.z  = CLAMPCL(phi_hat_n_sample_position.z,0.0f,NZ-1);
#endif
    
		float3 phi_hat_n;
		phi_hat_n.x = get_interpolated_value(u_prev, phi_hat_n_sample_position,H,dims);
		phi_hat_n.y = get_interpolated_value(v_prev, phi_hat_n_sample_position,H,dims);
		phi_hat_n.z = get_interpolated_value(w_prev, phi_hat_n_sample_position,H,dims);
    

		
		//constraid the sample values to the eight corners min and max values of the original backtraced sample
		//phi_hat_n_plus_ont_sample_position. This prevents "overshoot".
		
		float3 constraint_samples[8];

		//int indices[3] = {i,j,k};
		int3 indices = {
			(int)(phi_hat_n_plus_one_sample_position.x/H),
			(int)(phi_hat_n_plus_one_sample_position.y/H),
			(int)(phi_hat_n_plus_one_sample_position.z/H)
		};

		
		constraint_samples[0].x = get_data(u_prev,indices.x,indices.y,indices.z);
		constraint_samples[0].y = get_data(v_prev,indices.x,indices.y,indices.z);
		constraint_samples[0].z = get_data(w_prev,indices.x,indices.y,indices.z);

		constraint_samples[1].x = get_data(u_prev,indices.x+1,indices.y,indices.z);
		constraint_samples[1].y = get_data(v_prev,indices.x+1,indices.y,indices.z);
		constraint_samples[1].z = get_data(w_prev,indices.x+1,indices.y,indices.z);

		constraint_samples[2].x = get_data(u_prev,indices.x+1,indices.y+1,indices.z);
		constraint_samples[2].y = get_data(v_prev,indices.x+1,indices.y+1,indices.z);
		constraint_samples[2].z = get_data(w_prev,indices.x+1,indices.y+1,indices.z);

		constraint_samples[3].x = get_data(u_prev,indices.x,indices.y+1,indices.z);
		constraint_samples[3].y = get_data(v_prev,indices.x,indices.y+1,indices.z);
		constraint_samples[3].z = get_data(w_prev,indices.x,indices.y+1,indices.z);

		constraint_samples[4].x = get_data(u_prev,indices.x,indices.y,indices.z+1);
		constraint_samples[4].y = get_data(v_prev,indices.x,indices.y,indices.z+1);
		constraint_samples[4].z = get_data(w_prev,indices.x,indices.y,indices.z+1);

		constraint_samples[5].x = get_data(u_prev,indices.x+1,indices.y,indices.z+1);
		constraint_samples[5].y = get_data(v_prev,indices.x+1,indices.y,indices.z+1);
		constraint_samples[5].z = get_data(w_prev,indices.x+1,indices.y,indices.z+1);

		constraint_samples[6].x = get_data(u_prev,indices.x+1,indices.y+1,indices.z+1);
		constraint_samples[6].y = get_data(v_prev,indices.x+1,indices.y+1,indices.z+1);
		constraint_samples[6].z = get_data(w_prev,indices.x+1,indices.y+1,indices.z+1);

		constraint_samples[7].x = get_data(u_prev,indices.x,indices.y+1,indices.z+1);
		constraint_samples[7].y = get_data(v_prev,indices.x,indices.y+1,indices.z+1);
		constraint_samples[7].z = get_data(w_prev,indices.x,indices.y+1,indices.z+1);


		float3 phiMin;
		phiMin.x = min(min(min(min(min(min(min(
			constraint_samples[0].x, constraint_samples[1].x), constraint_samples[2].x),constraint_samples[3].x),
			constraint_samples[4].x),constraint_samples[5].x),constraint_samples[6].x),constraint_samples[7].x);

		phiMin.y = min(min(min(min(min(min(min(
			constraint_samples[0].y, constraint_samples[1].y), constraint_samples[2].y),constraint_samples[3].y),
			constraint_samples[4].y),constraint_samples[5].y),constraint_samples[6].y),constraint_samples[7].y);

		phiMin.z = min(min(min(min(min(min(min(
			constraint_samples[0].z, constraint_samples[1].z), constraint_samples[2].z),constraint_samples[3].z),
			constraint_samples[4].z),constraint_samples[5].z),constraint_samples[6].z),constraint_samples[7].z);


		float3 phiMax;
		phiMax.x = max(max(max(max(max(max(max(
			constraint_samples[0].x, constraint_samples[1].x), constraint_samples[2].x),constraint_samples[3].x),
			constraint_samples[4].x),constraint_samples[5].x),constraint_samples[6].x),constraint_samples[7].x);

		phiMax.y = max(max(max(max(max(max(max(
			constraint_samples[0].y, constraint_samples[1].y), constraint_samples[2].y),constraint_samples[3].y),
			constraint_samples[4].y),constraint_samples[5].y),constraint_samples[6].y),constraint_samples[7].y);

		phiMax.z = max(max(max(max(max(max(max(
			constraint_samples[0].z, constraint_samples[1].z), constraint_samples[2].z),constraint_samples[3].z),
			constraint_samples[4].z),constraint_samples[5].z),constraint_samples[6].z),constraint_samples[7].z);


		float3 phi_n_plus_one;
		phi_n_plus_one.x = phi_hat_n_plus_one.x + 0.5*(phi_n.x - phi_hat_n.x);
		phi_n_plus_one.y = phi_hat_n_plus_one.y + 0.5*(phi_n.y - phi_hat_n.y);
		phi_n_plus_one.z = phi_hat_n_plus_one.z + 0.5*(phi_n.z - phi_hat_n.z);
    
		float3 velocity_sample_position;
		velocity_sample_position.x = phi_hat_n_plus_one_sample_position.x + phi_n_plus_one.x;
		velocity_sample_position.y = phi_hat_n_plus_one_sample_position.y + phi_n_plus_one.y;
		velocity_sample_position.z = phi_hat_n_plus_one_sample_position.z + phi_n_plus_one.z;
		//
		//velocity_sample_position.x = pos.x + dt*phi_n_plus_one.x;
		//velocity_sample_position.y = pos.y + dt*phi_n_plus_one.y;
		//velocity_sample_position.z = pos.z + dt*phi_n_plus_one.z;
    
#if !WRAP_BOUNDS
		velocity_sample_position.x  = CLAMPCL(velocity_sample_position.x,0.0f,NX-1);
		velocity_sample_position.y  = CLAMPCL(velocity_sample_position.y,0.0f,NY-1);
		velocity_sample_position.z  = CLAMPCL(velocity_sample_position.z,0.0f,NZ-1);
#endif

		//Now sample the velocity there
		float3 velocity;
		velocity.x = get_interpolated_value(u_prev, velocity_sample_position,H,dims);
		velocity.y = get_interpolated_value(v_prev, velocity_sample_position,H,dims);
		velocity.z = get_interpolated_value(w_prev, velocity_sample_position,H,dims);
    
		/*float velocity[3] = {
			phi_n_plus_one[0], 
			phi_n_plus_one[1], 
			phi_n_plus_one[2] 
		};
		*/
			
		
		u[IX(i,j,k)] = max(min(velocity.x,phiMax.x), phiMin.x);
		v[IX(i,j,k)] = max(min(velocity.y,phiMax.y), phiMin.y);
		w[IX(i,j,k)] = max(min(velocity.z,phiMax.z), phiMin.z);
		
		/*	
		u[IX(i,j,k)] = velocity[0];
		v[IX(i,j,k)] = velocity[1];
		w[IX(i,j,k)] = velocity[2];
		*/	
		
		
	}
  
}

void advectRK2(float delta_time, float *q, float * q_prev, float * u_prev, float * v_prev, float * w_prev)
{
	float dt = -delta_time*NX;
  int3 dims = {NX,NY,NZ};
  //TODO: Implement 2nd Order MacCormack Method see: http://physbam.stanford.edu/~aselle/papers/7/
	FOR_EACH_FACE
	{
    
		float3 pos = {i*H,j*H,k*H};
		float3 orig_vel = {u_prev[IX(i,j,k)],v_prev[IX(i,j,k)],w_prev[IX(i,j,k)]};
    
    
		//RK2
		// What is u(x)?  value(such as velocity) at x i guess
		//y = x + dt*u(x + (dt/2)*u(x))
    
		//backtrace based upon current velocity at cell center.
		float halfDT = 0.5*dt;
		float3 halfway_position = {
			pos.x+(halfDT*orig_vel.x),
			pos.y+(halfDT*orig_vel.y),
			pos.z+(halfDT*orig_vel.z)
    };
    
#if !WRAP_BOUNDS
		halfway_position.x  = CLAMPCL(halfway_position.x,0.0f,NX-1);
		halfway_position.y  = CLAMPCL(halfway_position.y,0.0f,NY-1);
		halfway_position.z  = CLAMPCL(halfway_position.z,0.0f,NZ-1);
#endif
    
		float3 halfway_vel;
		halfway_vel.x = get_interpolated_value(u_prev, halfway_position,H,dims);
		halfway_vel.y = get_interpolated_value(v_prev, halfway_position,H,dims);
		halfway_vel.z = get_interpolated_value(w_prev, halfway_position,H,dims);
    
		float3 backtraced_position;
		backtraced_position.x  = pos.x + dt*halfway_vel.x;
		backtraced_position.y  = pos.y + dt*halfway_vel.y;
		backtraced_position.z  = pos.z + dt*halfway_vel.z;
    
    
#if !WRAP_BOUNDS
		backtraced_position.x  = CLAMPCL(backtraced_position.x,0.0f,NX-1);
		backtraced_position.y  = CLAMPCL(backtraced_position.y,0.0f,NY-1);
		backtraced_position.z  = CLAMPCL(backtraced_position.z,0.0f,NZ-1);
#endif
    
    
		//Have to interpolate at new point
		float traced_q;
		traced_q = get_interpolated_value(q_prev, backtraced_position,H,dims);
		
		//Has to be set on u
		q[IX(i,j,k)] = traced_q;
	}
  
}

void advect_velocity_RK2(float delta_time, float *u, float *v, float *w, 
	float * u_prev, float * v_prev, float * w_prev)
{
  //advectRK2(delta_time,u,u_prev,u_prev,v_prev,w_prev);
  //advectRK2(delta_time,v,v_prev,u_prev,v_prev,w_prev);
  //advectRK2(delta_time,w,w_prev,u_prev,v_prev,w_prev);
  //return;
  
	float dt = -delta_time*NX;
  int3 dims = {NX,NY,NZ};
	FOR_EACH_FACE
	{

    float3 pos = {i*H,j*H,k*H};
		float3 orig_vel = {u_prev[IX(i,j,k)],v_prev[IX(i,j,k)],w_prev[IX(i,j,k)]};
    
		//RK2
		// What is u(x)?  value(such as velocity) at x i guess
		//y = x + dt*u(x + (dt/2)*u(x))
    
		//backtrace based upon current velocity at cell center.
		float halfDT = 0.5*dt;
		float3 halfway_position = {
			pos.x+(halfDT*orig_vel.x),
			pos.y+(halfDT*orig_vel.y),
			pos.z+(halfDT*orig_vel.z)
    };
    
#if !WRAP_BOUNDS
		halfway_position.x  = CLAMPCL(halfway_position.x,0.0f,NX-1);
		halfway_position.y  = CLAMPCL(halfway_position.y,0.0f,NY-1);
		halfway_position.z  = CLAMPCL(halfway_position.z,0.0f,NZ-1);
#endif
    
		float3 halfway_vel;
		halfway_vel.x = get_interpolated_value(u_prev, halfway_position,H,dims);
		halfway_vel.y = get_interpolated_value(v_prev, halfway_position,H,dims);
		halfway_vel.z = get_interpolated_value(w_prev, halfway_position,H,dims);
    
		float3 backtraced_position;
		backtraced_position.x  = pos.x + dt*halfway_vel.x;
		backtraced_position.y  = pos.y + dt*halfway_vel.y;
		backtraced_position.z  = pos.z + dt*halfway_vel.z;
    
    
#if !WRAP_BOUNDS
		backtraced_position.x  = CLAMPCL(backtraced_position.x,0.0f,NX-1);
		backtraced_position.y  = CLAMPCL(backtraced_position.y,0.0f,NY-1);
		backtraced_position.z  = CLAMPCL(backtraced_position.z,0.0f,NZ-1);
#endif


		//Have to interpolate at new point
		float3 traced_velocity;
		traced_velocity.x = get_interpolated_value(u_prev, backtraced_position,H,dims);
		traced_velocity.y = get_interpolated_value(v_prev, backtraced_position,H,dims);
		traced_velocity.z = get_interpolated_value(w_prev, backtraced_position,H,dims);
		
		//Has to be set on u
		u[IX(i,j,k)] = traced_velocity.x;
		v[IX(i,j,k)] = traced_velocity.y;
		w[IX(i,j,k)] = traced_velocity.z;

	}

}

void advect_velocity_forward_euler(float delta_time, float *u, float *v, float *w, 
	float * u_prev, float * v_prev, float * w_prev)
{
	float dt =  -delta_time * NX;
  int3 dims = {NX,NY,NZ};
	// TODO: Calculate new velocities and store in target
	// Then save the result to our object
	FOR_EACH_FACE
	{

    float3 pos = {i*H,j*H,k*H};
    float3 orig_vel = {u_prev[IX(i,j,k)],v_prev[IX(i,j,k)],w_prev[IX(i,j,k)]};
			
		float3 new_pos = {
			pos.x+(dt*orig_vel.x),
			pos.y+(dt*orig_vel.y),
			pos.z+(dt*orig_vel.z)
    };

#if !WRAP_BOUNDS
		new_pos.x  = CLAMPCL(new_pos.x,0.0f,NX-1);
		new_pos.y  = CLAMPCL(new_pos.y,0.0f,NY-1);
		new_pos.z  = CLAMPCL(new_pos.z,0.0f,NZ-1);
#endif

		float3 new_vel;
		new_vel.x = get_interpolated_value(u_prev, new_pos,H,dims);
		new_vel.y = get_interpolated_value(v_prev, new_pos,H,dims);
		new_vel.z = get_interpolated_value(w_prev, new_pos,H,dims);


		//Has to be set on u
		u[IX(i,j,k)] = new_vel.x;
		v[IX(i,j,k)] = new_vel.y;
		w[IX(i,j,k)] = new_vel.z;
	}

}

void blur(float *u, float *v, float *w, float dt)
{
	FOR_EACH_CELL
	{
		float bu = 0.25*(get_data(u,i+1,j,k) + get_data(u,i-1,j,k) + get_data(u,i,j+1,k) + get_data(u,i,j-1,k));
		float bv = 0.25*(get_data(v,i+1,j,k) + get_data(v,i-1,j,k) + get_data(v,i,j+1,k) + get_data(v,i,j-1,k));
		float bw = 0.25*(get_data(w,i+1,j,k) + get_data(w,i-1,j,k) + get_data(w,i,j+1,k) + get_data(w,i,j-1,k));

		float t0 = 0.999f;
		float t1 = 1.0f- t0;
		u[IX(i,j,k)] = t0*u[IX(i,j,k)] + t1*bu;
		v[IX(i,j,k)] = t0*v[IX(i,j,k)] + t1*bv;
		w[IX(i,j,k)] = t0*w[IX(i,j,k)] + t1*bw;
	}
}

bool check_divergence(float *u, float *v, float *w)
{
	FOR_EACH_CELL
	{
		float du = get_data(u,i+1,j,k) - get_data(u,i-1,j,k);
		float dv = get_data(v,i,j+1,k) - get_data(v,i,j-1,k);
		float dw = get_data(w,i,j,k+1) - get_data(w,i,j,k-1);
		float div = 0.5*(du + dv + dw);

		if(div > 0.001)
		{
			printf("Velocity field is not divergence free\n");
			return false;
		}
	}
	return true;

}

/////////////////////////////////////////////////////////////////////////////////
#if USE_U_BLAS

inline double get_data_ublas_vec(ublas::vector<double>& x, int i, int j, int k) 
{
	if(i < 0 || i >= NX || j < 0 || j >= NY || k < 0 || k >= NZ)
	{
		return 0.0f;
	}

	return x[IXBLAS(i,j,k)];
}

void updateMatrix(ublas::compressed_matrix<double,ublas::row_major>& mtx)
{
	FOR_EACH_CELL
	{
		int index = IX(i,j,k);
		if(i > 0 ){
			mtx(index,IX(i-1,j,k)) = 1;
		}
		if(i < NX - 1){
			mtx(index,IX(i+1,j,k)) = 1;
		}
		if(j > 0){
			mtx(index,IX(i,j-1,k)) = 1;
		}
		if(j < NY - 1)
		{
			mtx(index,IX(i,j+1,k)) = 1;
		}
		if(k > 0) {
			mtx(index,IX(i,j,k-1)) = 1;
		}
		if(k < NZ - 1) {
			mtx(index,IX(i,j,k+1)) = 1;
		}
		mtx(index,index) = 6;//neighbors; //This was the bug!!!!!!
	}
}

void printMatrix(const ublas::compressed_matrix<double,ublas::row_major>& m, int size)
{
	for(int i = 0; i < size; i++)
	{
		for(int j = 0; j < size; j++)
		{
			printf("%3.0f\t",m(i,j));	
		}
		printf("\n");
	}
}

void project(double dt, float *u, float *v, float *w, float *pressure, float *divergence)
{
   // TODO: Solve Ax = b for pressure
   // 1. Contruct b
   // 2. Construct A 
   // 3. Solve for p
   // Subtract pressure from our velocity and save in target
	//Obviously these shouldn't be constructed and destructed each timestep!
	int size = NX*NY*NZ;
	ublas::vector<double> b(size);
	ublas::vector<double> x(size);
	ublas::compressed_matrix<double,ublas::row_major> A(size,size);

	//set x = 0;
	std::fill(x.begin(), x.end(), 0.0);
	double mtxScale = 1.0/(H*H);
	FOR_EACH_CELL
	{
		//Construct b
		//calculate the negative divergence of each cell
		double du = get_data(u,i+1,j,k) - get_data(u,i-1,j,k);
		double dv = get_data(v,i,j+1,k) - get_data(v,i,j-1,k);
		double dw = get_data(w,i,j,k+1) - get_data(w,i,j,k-1);
		double divergence = 0.5*(du + dv + dw);

		b[IX(i,j,k)] = -divergence; 
	}


	//construct A
	updateMatrix(A);

	//printMatrix(A, size);
	//Solve for p
	cg_solve(A,b,x,50, 0.01);

	for(int i = 0; i < size; ++i)
	{
		pressure[i] = x[i];
	}

   // Subtract pressure  gradient from our velocity and save in target
	double rho = 1.0;
	double scale = 1.0;//dt/(rho*H);
	FOR_EACH_CELL
	{
		float dup = 0.5f * (get_data_ublas_vec(x,i+1,j,k) - get_data_ublas_vec(x,i-1,j,k));
		float dvp = 0.5f * (get_data_ublas_vec(x,i,j+1,k) - get_data_ublas_vec(x,i,j-1,k));
		float dwp = 0.5f * (get_data_ublas_vec(x,i,j,k+1) - get_data_ublas_vec(x,i,j,k-1));
		u[IX(i,j,k)] = u[IX(i,j,k)] - (scale * dup); 
		v[IX(i,j,k)] = v[IX(i,j,k)] - (scale * dvp); 
		w[IX(i,j,k)] = w[IX(i,j,k)] - (scale * dwp); 
		
	}

   // IMPLEMENT THIS IS A SANITY CHECK: assert (checkDivergence());
   check_divergence(u,v,w);
}
#else 


void calculate_divergence(float *divergence, float *u, float *v, float *w, float dt)
{
	FOR_EACH_CELL
	{
		float du = get_data(u,i+1,j,k) - get_data(u,i-1,j,k);
		float dv = get_data(v,i,j+1,k) - get_data(v,i,j-1,k);
		float dw = get_data(w,i,j,k+1) - get_data(w,i,j,k-1);
		float div = 0.5*(du + dv + dw);

		divergence[IX(i,j,k)] = div;
	}
}

void pressure_solve(float *pressure, float *pressure_prev,  float *divergence, float dt)
{
	FOR_EACH_CELL
	{
		pressure[IX(i,j,k)] = 0.0f;
	}
	

	for (int ii=0; ii < 40; ++ii)
    {
		FOR_EACH_CELL
		{
			// jacobi solver
			float p = -get_data(divergence,i,j,k);

			float a = get_data(pressure,i-1, j, k);
			float b = get_data(pressure,i+1, j, k);
			float c = get_data(pressure,i, j+1, k);
			float d = get_data(pressure,i, j-1, k);
			float e = get_data(pressure,i, j, k-1);
			float f = get_data(pressure,i, j, k+1);
			float v = (p+(a+b+c+d+e+f))/6.0f;
			pressure[IX(i,j,k)] = v;
		}
		
//      float* tmp = pressure;
//      pressure = pressure_prev;
//      pressure_prev = tmp;
		//std::swap(read, write);
	}
}

void pressure_apply(float *u, float *v, float *w, float *pressure, float dt)
{

	FOR_EACH_CELL
	{
		// calculate pressure gradient
		float dpdi = 0.5f*(get_data(pressure,i+1, j, k)-get_data(pressure,i-1, j, k));
		float dpdj = 0.5f*(get_data(pressure,i, j+1, k)-get_data(pressure,i, j-1, k));
		float dpdk = 0.5f*(get_data(pressure,i, j, k+1)-get_data(pressure,i, j, k-1));

		u[IX(i, j, k)] -=  dpdi;
		v[IX(i, j, k)] -=  dpdj;
		w[IX(i, j, k)] -=  dpdk;
	}
}
float dot(float* a, float* b, int n){
  float sum = 0;
  for(int i = 0; i < n; i++)
    sum += a[i] * b[i];
  return sum;
}

void mtx_times_vec(float *out, float* A, float* x, int n) {
  
  for(int row = 0; row < n; row++){
    float sum = 0.0f;
    for(int col = 0; col < n; col++){
      sum += A[col + row*n] * x[col];
    }
    out[row] = sum;
  }
}

void mtx_times_vec_for_laplacian(float *out, float* x, int n) {
  
  int size = NX*NY*NZ;
  FOR_EACH_CELL
  {
    int idx = IX(i,j,k);
    
    float sum = 0.0f;
    sum += -6 * x[idx];
    sum += get_data(x,i-1,j,k);
    sum += get_data(x,i+1,j,k);
    sum += get_data(x,i,j-1,k);
    sum += get_data(x,i,j+1,k);
    sum += get_data(x,i,j,k-1);
    sum += get_data(x,i,j,k+1);
    
    out[idx] = sum;
  }
}

void cg_no_matrix(float* x, float *b, float *r, float *d, float *q, int N, int maxIter, float tol){
  //When porting cg to opencl  only the mtx-vec multiply and the
  //dot-product(reduction) are run on the GPU everything is on the GPU
  int i = 0;
  int imax = maxIter;
//  float r[N];
//  float d[N];
//  float q[N];
  
  for(int i = 0; i < N; i++){
    x[i] = 0.0f;
    r[i] = b[i];//b-Ax
    d[i] = r[i];
  }
  
  float rnew = dot(r,r,N);
  float rold = 0.0f;
  
  float r0 = rnew;
  while(i < imax && rnew > 0.0000001*r0) {
    mtx_times_vec_for_laplacian(q,d,N);
    float alpha = rnew/(dot(d,q,N));
    
    for(int j = 0; j < N; j++){
      x[j] += alpha*d[j];
    }
    
    for(int j = 0; j < N; j++){
      r[j] -= alpha*q[j];
    }
    
    rold = rnew;
    rnew = dot(r,r,N);
    
    float beta = rnew/rold;
    
    for(int j = 0; j < N; j++){
      d[j] = r[j] + beta*d[j];
    }
    
    i++;
  }
  
  //printf("CG Terminated with iterations %d, and rnew %3.6f\n",i, rnew);
  
  
  
}


void slowCG(float* A, float* x, float *b, int N, int maxIter, float tol){
  //When porting cg to opencl  only the mtx-vec multiply and the
  //dot-product(reduction) are run on the GPU everything is on the GPU
  int i = 0;
  int imax = maxIter;
  float r[N];
  float d[N];
  float q[N];
  
  for(int i = 0; i < N; i++){
    x[i] = 0.0f;
    r[i] = b[i];//b-Ax
    d[i] = r[i];
  }
  
  float rnew = dot(r,r,N);
  float rold = 0.0f;
  
  float r0 = rnew;
  while(i < imax && rnew > 0.0000001*r0) {
    mtx_times_vec(q,A,d,N);
    float alpha = rnew/(dot(d,q,N));
    
    for(int j = 0; j < N; j++){
      x[j] += alpha*d[j];
    }
    
    for(int j = 0; j < N; j++){
      r[j] -= alpha*q[j];
    }
    
    rold = rnew;
    rnew = dot(r,r,N);
    
    float beta = rnew/rold;
    
    for(int j = 0; j < N; j++){
      d[j] = r[j] + beta*d[j];
    }
    
    i++;
  }
  
  printf("CG Terminated with iterations %d, and rnew %3.6f\n",i, rnew);
  
  
  
}

void setupMatrix(float * mtx){
  int size = NX*NY*NZ;
    FOR_EACH_CELL
    {
      int index = IX(i,j,k);
      if(i > 0 )
      {
        mtx[size*index+IX(i-1,j,k)] = 1;
      }
      if(i < NX - 1)
      {
        mtx[size*index+IX(i+1,j,k)] = 1;
      }
      if(j > 0)
      {
        mtx[size*index+IX(i,j-1,k)] = 1;
      }
      if(j < NY - 1)
      {
        mtx[size*index+IX(i,j+1,k)] = 1;
      }
      if(k > 0)
      {
        mtx[size*index+IX(i,j,k-1)] = 1;
      }
      if(k < NZ - 1)
      {
        mtx[size*index+IX(i,j,k+1)] = 1;
      }
      mtx[index*size+index] = -6;//This is used for conjugate gradient method because i will have positive divergences on the right hand side (the "b" in Ax = b)
    }
}
void pressure_solve_cg_no_matrix(float* pressure, float* divergence, float *r, float *d, float *q){
  cg_no_matrix(pressure, divergence, r, d, q, NX*NY*NZ, 10, 0.00f);
}
void pressure_solve_cg_slow(float* pressure, float* divergence, float * mtx){
  slowCG(mtx, pressure, divergence, NX*NY*NZ, 10, 0.00f);
}
void project(double dt, float *u, float *v, float *w, float *divergence, float *pressure, float *pressure_prev, float * laplacian, float *r, float *d, float *q, int useCG)
{
	calculate_divergence(divergence, u, v, w, dt);
	//pressure_solve_cg_slow(pressure, divergence, laplacian);
  if(useCG){
    pressure_solve_cg_no_matrix(pressure, divergence,r,d,q);
  }else{
    pressure_solve(pressure,pressure_prev, divergence, dt);
  }
	pressure_apply(u, v, w, pressure, dt);
   // IMPLEMENT THIS IS A SANITY CHECK: assert (checkDivergence());
   check_divergence(u,v,w);
}
#endif //USE_U_BLAS

#endif