#define WRAP_BOUNDS 0
#define IX(i,j,k) ((i) + ((j)*(NX)) + ((k)*(NX)*(NY)))
#define IXL(i,j,k) ((i) + ((j)*(BLOCK_SIZE_WITH_PAD)) + ((k)*(BLOCK_SIZE_WITH_PAD)*(BLOCK_SIZE_WITH_PAD)))
#define LERP(a,b,t) (((1.0)-(t))*(a) + ((t)*(b)))

int mod_int (int a, int b)
{
  if(b < 0) //you can check for b == 0 separately and do what you want
    return mod_int(-a, -b);
  int ret = a % b;
  if(ret < 0)
    ret+=b;
  return ret;
}

float get_data(__global float * x, int i, int j, int k)
{
  //If I basically have a 2D grid then the 3 way check gives bad results
  //if(i < 0 || i >= NX || j < 0 || j >= NY || k < 0 || k >= NZ)
  //if(i < 0 || i >= NX || j < 0 || j >= NY)
  //{
  //	return 0.0f;
  //}

  
  i = clamp(i,0,NX-1);
  j = clamp(j,0,NY-1);
  k = clamp(k,0,NZ-1);
  
  return x[IX(i,j,k)];
}

float get_data_local(__local float * x, int i, int j, int k)
{
  i = clamp(i,0,BLOCK_SIZE_WITH_PAD-1);
  j = clamp(j,0,BLOCK_SIZE_WITH_PAD-1);
  k = clamp(k,0,BLOCK_SIZE_WITH_PAD-1);
  
  return x[IXL(i,j,k)];
}

float get_interpolated_value(
      __global float * x,
      float3 pos,
      float h)
{
   float3 ph = pos/h;
	//The grid world pos is 0-1.
   int3 idx0 = {convert_int(ph.x), convert_int(ph.y), convert_int(ph.z)};
   int3 idx1 = {
            convert_int(clamp(idx0.x + 1, 0,NX-1)),
	          convert_int(clamp(idx0.y + 1, 0,NY-1)),
            convert_int(clamp(idx0.z + 1, 0,NZ-1))
            };
  
  
	//Calculate t per component
   //float it,jt,kt;
   float3 t = { 
            pos.x - idx0.x*h,
            pos.y - idx0.y*h,
            pos.z - idx0.z*h
            };


	//assert (t.x < 1.0 && t.x >= 0);
	//assert (t.y < 1.0 && t.y >= 0);
	//assert (t.z < 1.0 && t.z >= 0);

	// Assume a cube wt.xh 8 points
	//Front face
	//Top Front Lerp
	float xFrontLeftTop = x[IX(idx0.x,idx1.y,idx0.z)];
	float xFrontRightTop = x[IX(idx1.x,idx1.y,idx0.z)];
	float xFrontTopInterp = mix(xFrontLeftTop, xFrontRightTop, t.x);
	//Bottom Front Lerp
	float xFrontLeftBottom = x[IX(idx0.x,idx0.y,idx0.z)];
	float xFrontRightBottom = x[IX(idx1.x,idx0.y,idx0.z)];
	float xFrontBottomInterp = mix(xFrontLeftBottom, xFrontRightBottom, t.x);

	//Back face
	//Top Back Lerp
	float xBackLeftTop = x[IX(idx0.x,idx1.y,idx1.z)];
	float xBackRightTop = x[IX(idx1.x,idx1.y,idx1.z)];
	float xBackTopInterp = mix(xBackLeftTop, xBackRightTop, t.x);
	//Bottom Back Lerp
	float xBackLeftBottom = x[IX(idx0.x,idx0.y,idx1.z)];
	float xBackRightBottom = x[IX(idx1.x,idx0.y,idx1.z)];
	float xBackBottomInterp = mix(xBackLeftBottom, xBackRightBottom, t.x);


	//Now get middle of front -The bilinear interp of the front face
	float xBiLerpFront = mix(xFrontBottomInterp, xFrontTopInterp,t.y);

	//Now get middle of back -The bilinear interp of the back face
	float xBiLerpBack = mix(xBackBottomInterp, xBackTopInterp, t.y);

	//Now get the interpolated point between the points calculated in 
   //the front and back faces - The trilinear interp part
	float xTriLerp = mix(xBiLerpFront, xBiLerpBack, t.z);

	return xTriLerp;
}

__kernel void advect_forward_euler(
      const float delta_time,
      int3  dims,
      const float H, 
      __global float *q,
      __global float * q_prev, 
      __global float * u_prev, 
      __global float * v_prev, 
      __global float * w_prev
//      __global float4 * debugData1,
//      __global float4 * debugData2,
//      __global float4 * debugData3
                                   )
{
  int id = get_global_id(0);


  float dt = -delta_time*NX;

  int slice_size = NX*NY;
  int row_size = NX;
  int k = id / slice_size;
  int j = (id - k*slice_size) / row_size;
  int i = id - j*row_size - k*slice_size;

  float3 pos = {i*H, j*H, k*H};

  //debugData1[id] = pos.xyzx;

  float3 orig_vel = {
           u_prev[IX(i,j,k)],
           v_prev[IX(i,j,k)],
           w_prev[IX(i,j,k)] 
  };

  //debugData1[id] = orig_vel.xyzx;

  float3 new_pos = {
           pos.x+(dt*orig_vel.x),
           pos.y+(dt*orig_vel.y),
           pos.z+(dt*orig_vel.z)
  };

  //debugData1[id] = new_pos.xyzx;

#if !WRAP_BOUNDS
	new_pos.x   = clamp(new_pos.x,0.0f,NX-1.0f);
	new_pos.y   = clamp(new_pos.y,0.0f,NY-1.0f);
	new_pos.z   = clamp(new_pos.z,0.0f,NZ-1.0f);
#endif
    
    
  //Have to interpolate at new point
	float traced_q;
  traced_q = get_interpolated_value( q_prev, new_pos, H);
		
  
  q[id] = traced_q;
  
}



__kernel void advectRK2(
            const float delta_time,
            int3  dims,
            const float H,
            __global float *q,
            __global float * q_prev,
            __global float * u_prev,
            __global float * v_prev,
            __global float * w_prev
//            __global float4 * debugData1,
//            __global float4 * debugData2,
//            __global float4 * debugData3
                        )
{
  int id = get_global_id(0);
  
  
	float dt = -delta_time*NX;
  
	//FOR_EACH_FACE
	//{
  int slice_size = NX*NY;
  int row_size = NX;
  int k = id / slice_size;
  int j = (id - k*slice_size) / row_size;
  int i = id - j*row_size - k*slice_size;
  
  float3 pos = {i*H, j*H, k*H};
  float3 orig_vel = {u_prev[IX(i,j,k)],v_prev[IX(i,j,k)],w_prev[IX(i,j,k)]};
  
  
  //RK2
  // What is u(x)?  value(such as velocity) at x i guess
  //y = x + dt*u(x + (dt/2)*u(x))
  
  //backtrace based upon current velocity at cell center.
  float halfDT = 0.5f*dt;
  float3 halfway_position = {
    pos.x+(halfDT*orig_vel.x),
    pos.y+(halfDT*orig_vel.y),
    pos.z+(halfDT*orig_vel.z)
  };
  
#if !WRAP_BOUNDS
  halfway_position.x  = clamp(halfway_position.x,0.0f,NX-1.0f);
  halfway_position.y  = clamp(halfway_position.y,0.0f,NY-1.0f);
  halfway_position.z  = clamp(halfway_position.z,0.0f,NZ-1.0f);
#endif
  
  float3 halfway_vel;
  halfway_vel.x = get_interpolated_value(u_prev, halfway_position,H);
  halfway_vel.y = get_interpolated_value(v_prev, halfway_position,H);
  halfway_vel.z = get_interpolated_value(w_prev, halfway_position,H);
  
  float3 backtraced_position;
  backtraced_position.x  = pos.x + dt*halfway_vel.x;
  backtraced_position.y  = pos.y + dt*halfway_vel.y;
  backtraced_position.z  = pos.z + dt*halfway_vel.z;
  
  
#if !WRAP_BOUNDS
  backtraced_position.x  = clamp(backtraced_position.x,0.0f,NX-1.0f);
  backtraced_position.y  = clamp(backtraced_position.y,0.0f,NY-1.0f);
  backtraced_position.z  = clamp(backtraced_position.z,0.0f,NZ-1.0f);
#endif
  
  
  //Have to interpolate at new point
  float traced_q;
  traced_q = get_interpolated_value(q_prev, backtraced_position,H);
  
  //Has to be set on u
  q[IX(i,j,k)] = traced_q;

	//}
}


__kernel void advect_velocity_RK2(
                         const float delta_time,
                         int3  dims,
                         const float H,
                         __global float * u,
                         __global float * v,
                         __global float * w,
                         __global float * u_prev,
                         __global float * v_prev,
                         __global float * w_prev
//                         __global float4 * debugData1,
//                         __global float4 * debugData2,
//                         __global float4 * debugData3
                                  )

{
  int id = get_global_id(0);
  
	float dt = -delta_time*NX;
  
  int slice_size = NX*NY;
  int row_size = NX;
  int k = id / slice_size;
  int j = (id - k*slice_size) / row_size;
  int i = id - j*row_size - k*slice_size;
  
  
  float3 pos = {i*H,j*H,k*H};
  float3 orig_vel = {u_prev[IX(i,j,k)],v_prev[IX(i,j,k)],w_prev[IX(i,j,k)]};
  
  //RK2
  // What is u(x)?  value(such as velocity) at x i guess
  //y = x + dt*u(x + (dt/2)*u(x))
  
  //backtrace based upon current velocity at cell center.
  float halfDT = 0.5f*dt;
  float3 halfway_position = {
    pos.x+(halfDT*orig_vel.x),
    pos.y+(halfDT*orig_vel.y),
    pos.z+(halfDT*orig_vel.z)
  };
  
#if !WRAP_BOUNDS
  halfway_position.x  = clamp(halfway_position.x,0.0f,NX-1.0f);
  halfway_position.y  = clamp(halfway_position.y,0.0f,NY-1.0f);
  halfway_position.z  = clamp(halfway_position.z,0.0f,NZ-1.0f);
#endif
  
  float3 halfway_vel;
  halfway_vel.x = get_interpolated_value(u_prev, halfway_position,H);
  halfway_vel.y = get_interpolated_value(v_prev, halfway_position,H);
  halfway_vel.z = get_interpolated_value(w_prev, halfway_position,H);
  
  float3 backtraced_position;
  backtraced_position.x  = pos.x + dt*halfway_vel.x;
  backtraced_position.y  = pos.y + dt*halfway_vel.y;
  backtraced_position.z  = pos.z + dt*halfway_vel.z;
  
  
#if !WRAP_BOUNDS
  backtraced_position.x  = clamp(backtraced_position.x,0.0f,NX-1.0f);
  backtraced_position.y  = clamp(backtraced_position.y,0.0f,NY-1.0f);
  backtraced_position.z  = clamp(backtraced_position.z,0.0f,NZ-1.0f);
#endif
  
  
  //Have to interpolate at new point
  float3 traced_velocity;
  traced_velocity.x = get_interpolated_value(u_prev, backtraced_position,H);
  traced_velocity.y = get_interpolated_value(v_prev, backtraced_position,H);
  traced_velocity.z = get_interpolated_value(w_prev, backtraced_position,H);
  
  //Has to be set on u
  u[IX(i,j,k)] = traced_velocity.x;
  v[IX(i,j,k)] = traced_velocity.y;
  w[IX(i,j,k)] = traced_velocity.z;
  
}

__kernel void advect_velocity_forward_euler(
                                  const float delta_time,
                                  int3  dims,
                                  const float H,
                                  __global float * u,
                                  __global float * v,
                                  __global float * w,
                                  __global float * u_prev,
                                  __global float * v_prev,
                                  __global float * w_prev
//                                  __global float4 * debugData1,
//                                  __global float4 * debugData2,
//                                  __global float4 * debugData3
                                            )

{
  int id = get_global_id(0);
  int slice_size = NX*NY;
  int row_size = NX;
  int k = id / slice_size;
  int j = (id - k*slice_size) / row_size;
  int i = id - j*row_size - k*slice_size;
  
  float dt =  -delta_time * NX;
  
  float3 pos = {i*H,j*H,k*H};
  float3 orig_vel = {u_prev[IX(i,j,k)],v_prev[IX(i,j,k)],w_prev[IX(i,j,k)]};
  
  float3 new_pos = {
    pos.x+(dt*orig_vel.x),
    pos.y+(dt*orig_vel.y),
    pos.z+(dt*orig_vel.z)
  };
  
#if !WRAP_BOUNDS
  new_pos.x  = clamp(new_pos.x,0.0f,NX-1.0f);
  new_pos.y  = clamp(new_pos.y,0.0f,NY-1.0f);
  new_pos.z  = clamp(new_pos.z,0.0f,NZ-1.0f);
#endif
  
  float3 new_vel;
  new_vel.x = get_interpolated_value(u_prev, new_pos,H);
  new_vel.y = get_interpolated_value(v_prev, new_pos,H);
  new_vel.z = get_interpolated_value(w_prev, new_pos,H);
  
  
  //Has to be set on u
  u[IX(i,j,k)] = new_vel.x;
  v[IX(i,j,k)] = new_vel.y;
  w[IX(i,j,k)] = new_vel.z;

//  if(id == 112)
//  {
//    printf("dt = %3.2f\n",dt);
//    printf("NX = %d\n",NX);
//    printf("pos = %3.2f,%3.2f,%3.2f\n",pos.x,pos.y,pos.z);
//    printf("new_pos = %3.2f,%3.2f,%3.2f\n",new_pos.x,new_pos.y,new_pos.z);
//    
//  }
//  
}

float4 safe_normalize(float4 p)
{
  float4 v = p;
  float l = length(v);
  if(l > 0.0f)
  {
    v = normalize(v);
  }
  else
  {
    v.xyzw =  0.0f;
  }
  return v;
}

float4 get_curl(
                __global float * u,
                __global float * v,
                __global float * w,
                int i, int j, int k)
{
	float dwdj = 0.5f*(get_data(w, i, j+1, k) - get_data(w,i, j-1, k));
	float dwdi = 0.5f*(get_data(w, i+1, j, k) - get_data(w,i-1, j, k));

	float dudk = 0.5f*(get_data(u, i, j, k+1)-get_data(u, i, j, k-1));
	float dudj = 0.5f*(get_data(u, i, j+1, k)-get_data(u, i, j-1, k));
	
	float dvdk = 0.5f*(get_data(v, i, j, k+1)-get_data(v, i, j, k-1));
	float dvdi = 0.5f*(get_data(v, i+1, j, k)-get_data(v, i-1, j, k));
	
  float4 out = {dwdj-dvdk, dudk-dwdi, dvdi-dudj,0.0f};
  return out;
}
__kernel void vorticity_confinement(__global float *u,
                                    __global float *v,
                                    __global float* w,
                                    __global float * u_prev,
                                    __global float * v_prev,
                                    __global float * w_prev,
                                    int3 n,
                                    float e,
                                    float dt)
{
  int id = get_global_id(0);
  int slice_size = NX*NY;
  int row_size = NX;
  int k = id / slice_size;
  int j = (id - k*slice_size) / row_size;
  int i = id - j*row_size - k*slice_size;
  
  //if(i < 1 || j < 1 || (NZ > 1 && k < 1) || i > NX -1 || j > NY-1 || (NZ > 1 && k > NZ-1) || (NZ == 1 && k > 1))
  if(i < 1 || j < 1 || k < 0 || i >= NX -1 || j >= NY-1 ||  k > NZ )
    return;
  
  /*
	float4 curl;
  float4 curl_iplus1;
  float4 curl_iminus1;
  float4 curl_jplus1;
  float4 curl_jminus1;
  float4 curl_kplus1;
  float4 curl_kminus1;
  
  float4 norm;
  float4 f;
  */
  
    // calculate gradient of curl magnitude
    float4 curl_iplus1 = get_curl(u_prev,v_prev, w_prev, i+1, j, k);
    float4 curl_iminus1= get_curl(u_prev,v_prev, w_prev, i-1, j, k);
    
    float4 curl_jplus1 = get_curl(u_prev,v_prev, w_prev, i, j+1, k);
    float4 curl_jminus1= get_curl(u_prev,v_prev, w_prev, i, j-1, k);
    
    float4 curl_kplus1 = get_curl(u_prev,v_prev, w_prev, i, j, k+1);
    float4 curl_kminus1 = get_curl(u_prev,v_prev, w_prev, i, j, k-1);
    
    float dcdi = 0.5f*(length(curl_iplus1) - length(curl_iminus1));
    float dcdj = 0.5f*(length(curl_jplus1) - length(curl_jminus1));
    float dcdk = 0.5f*(length(curl_kplus1) - length(curl_kminus1));
    
    float4 norm = {0.0f, 0.0f, 0.0f, 0.0f};
    norm.x = dcdi;
    norm.y = dcdj;
    norm.z = dcdk;
    norm.w = 0.0f;
    
    norm = safe_normalize(norm);
    
    float4 curl = get_curl(u_prev,v_prev, w_prev, i, j, k);
    
    //float e = 0.5f;
    
    float4 f = cross(norm, curl);
    
    u[IX(i,j,k)] += f.x * e * dt;
    v[IX(i,j,k)] += f.y * e * dt;
    w[IX(i,j,k)] += f.z * e * dt;
    
}

__kernel void calculate_divergence(
            __global float *divergence,
            __global float *u,
            __global float *v,
            __global float *w,
           // int i, int j, int k, 
            int3 n,
            float dt )
{
	{
    int id = get_global_id(0);
    int slice_size = NX*NY;
    int row_size = NX;
    int k = id / slice_size;
    int j = (id - k*slice_size) / row_size;
    int i = id - j*row_size - k*slice_size;
    
		float du = get_data(u,i+1,j,k) - get_data(u,i-1,j,k);
		float dv = get_data(v,i,j+1,k) - get_data(v,i,j-1,k);
		float dw = get_data(w,i,j,k+1) - get_data(w,i,j,k-1);
		float div = 0.5f*(du + dv + dw);
    
		divergence[IX(i,j,k)] = div;
    
    barrier(CLK_GLOBAL_MEM_FENCE);
	}
}

__kernel void zero_pressure( __global float *pressure)
{
  int id = get_global_id(0);
  
	pressure[id]  = 0.0f;
  
}

__kernel void vector_dot_product(
                                    __global float* a,
                                    __global float* b,
                                    int n) {
 
}

__kernel void laplacian_mtx_vec_mult(
                                     __global float *out,
                                     __global float* x,
                                     int3 n) {
  
  int id = get_global_id(0);
  int slice_size = NX*NY;
  int row_size = NX;
  int k = id / slice_size;
  int j = (id - k*slice_size) / row_size;
  int i = id - j*row_size - k*slice_size;
 
  
  float sum = 0.0f;
  sum += -6.0f * x[id];
  sum += get_data(x,i-1,j,k);
  sum += get_data(x,i+1,j,k);
  sum += get_data(x,i,j-1,k);
  sum += get_data(x,i,j+1,k);
  sum += get_data(x,i,j,k-1);
  sum += get_data(x,i,j,k+1);
  
  out[id] = sum;
}

__kernel void pressure_solve(
          __global float *pressure,
          __global float *pressure_prev,
          __global float *divergence,
         // int i, int j, int k, 
          int3 n,
          float dt)
{
  int id = get_global_id(0);
  int slice_size = NX*NY;
  int row_size = NX;
  int k = id / slice_size;
  int j = (id - k*slice_size) / row_size;
  int i = id - j*row_size - k*slice_size;
  
  
	

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

__kernel void pressure_apply(__global float *u,
                    __global float *v,
                    __global float *w,
                    __global float *pressure,
                    //int i, int j, int k, 
                    int3 n,
                    float dt)
{
  int id = get_global_id(0);
  int slice_size = NX*NY;
  int row_size = NX;
  int k = id / slice_size;
  int j = (id - k*slice_size) / row_size;
  int i = id - j*row_size - k*slice_size;
  
//  int lid = get_local_id(0);
//  int local_slice_size = BLOCK_SIZE*BLOCK_SIZE;
//  int local_row_size = BLOCK_SIZE;
//  int lk = lid / local_slice_size;
//  int lj = (lid - lk*local_slice_size) / local_row_size;
//  int li = lid - lj*local_row_size - lk*local_slice_size;
//  
//  
//  //Put stuff into local memory
//  local float local_pressure[(BLOCK_SIZE_WITH_PAD)*(BLOCK_SIZE_WITH_PAD)*(BLOCK_SIZE_WITH_PAD)];//Should be 10*10*10 = 1000
//  //Handle normal case
//  int local_index = IXL(li+1, lj+1, lk+1);
//  local_pressure[local_index] = pressure[id];
//  
//  //Handle edge cases
//  //The left face
//  if(li == 0){
//    local_pressure[IXL(li, lj+1, lk+1)] = get_data(pressure, i-1,j,k);
//  }
//  //The right face
//  if(li == BLOCK_SIZE-1){
//    local_pressure[IXL(li+2, lj+1, lk+1)] = get_data(pressure, i+1,j,k);
//  }
//  //the top face
//  if(lj == 0){
//    local_pressure[IXL(li+1, lj, lk+1)] = get_data(pressure, i,j-1,k);
//  }
//  //the bottom face
//  if(lj == BLOCK_SIZE-1){
//    local_pressure[IXL(li+1, lj+2, lk+1)] = get_data(pressure, i,j+1,k);
//  }
//  //the front face
//  if(lk == 0){
//    local_pressure[IXL(li+1, lj+1, lk)] = get_data(pressure, i,j,k-1);
//  }
//  //the bottom face
//  if(lk == BLOCK_SIZE-1){
//    local_pressure[IXL(li+1, lj+1, lk+2)] = get_data(pressure, i,j,k+1);
//  }
//  
//  
//  barrier(CLK_LOCAL_MEM_FENCE);
  
  
  // calculate pressure gradient
  float dpdi = 0.5f*(get_data(pressure,i+1, j, k)-get_data(pressure,i-1, j, k));
  float dpdj = 0.5f*(get_data(pressure,i, j+1, k)-get_data(pressure,i, j-1, k));
  float dpdk = 0.5f*(get_data(pressure,i, j, k+1)-get_data(pressure,i, j, k-1));
  
//  float dpdi = 0.5f*(get_data_local(local_pressure,li+2, lj+1, lk+1)-get_data_local(local_pressure,li, lj+1, lk+1));
//  float dpdj = 0.5f*(get_data_local(local_pressure,li+1, lj+2, lk+1)-get_data_local(local_pressure,li+1, lj, lk+1));
//  float dpdk = 0.5f*(get_data_local(local_pressure,li+1, lj+1, lk+2)-get_data_local(local_pressure,li+1, lj+1, lk));
  
  u[IX(i, j, k)] -=  dpdi;
  v[IX(i, j, k)] -=  dpdj;
  w[IX(i, j, k)] -=  dpdk;
}


