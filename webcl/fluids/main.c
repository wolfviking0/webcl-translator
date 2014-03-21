#define USE_OPENCL 1
#define USE_OPENCL_ON_CPU 0

#define RUN_TIMINGS 0

//GRID DIMENSIONS
#define NX 32
#define NY 32
#define NZ 1
#define H  1.0f

#ifdef __EMSCRIPTEN__
  #define GL_SHARING_EXTENSION "KHR_GL_SHARING" 
#elif __APPLE__
  #define GL_SHARING_EXTENSION "cl_APPLE_gl_sharing"
#else
  #define GL_SHARING_EXTENSION "cl_khr_gl_sharing"
#endif

#include <stdlib.h>
#include <stdio.h>
#include <stdbool.h>

#ifdef __APPLE__
  #include <OpenGL/gl.h>
  #include <OpenGL/glu.h> 
  #include <GLUT/glut.h>
  #include <OpenGL/CGLDevice.h>
  #include <OpenGL/CGLCurrent.h>
  #include <OpenGL/CGLTypes.h>
  #include <OpenCL/opencl.h>
  #include <OpenCL/cl_gl_ext.h>


#elif WIN32
#include "GL/glut.h"
#else
#include <GL/glut.h>
#endif

#include "cl-helper.h"
#include "timing.h"

//#include <OpenGL/glut.h>

//#include "combustion_particle_system.h"
#include "second_order_solver.h"
#include "cl_solver.h"



float dt;
float force, source;
int dvel;

float * g_u, * g_v, * g_w, * g_u_prev, * g_v_prev, * g_w_prev;
float * g_dens, * g_dens_prev;
float * g_heat, * g_heat_prev;
float * g_curl;
float * g_compressibility;
float * g_divergence;
float * g_pressure, *g_pressure_prev;
float * g_laplacian_matrix;
float * g_cg_r, *g_cg_d, *g_cg_q;

int win_id;
int win_x, win_y;
int mouse_down[3];
int omx, omy, mx, my;

int step;
int maccormack;
int vorticity;
int useCG;

CLData clData;


//OpenCL globals
int dims[3] = { NX, NY, NZ};


void init_opencl()
{
#if 1
	create_context_on("", "", 0, &clData.ctx, &clData.queue, 0);
#elif !__APPLE__
   create_context_on(CHOOSE_INTERACTIVELY, CHOOSE_INTERACTIVELY, 0, &clData.ctx, &clData.queue, 0);
#else
#if USE_OPENCL_ON_CPU
  create_context_on("Apple", "Intel", 0, &clData.ctx, &clData.queue, 0);
 #elif __EMSCRIPTEN__
   create_context_on("Apple", "GeForce", 0, &clData.ctx, &clData.queue, 0);
#else
   create_context_on("Apple", "GeForce", 0, &clData.ctx, &clData.queue, 0);
#endif
#endif
  
  set_device_id(&clData);
  
   init_cl_data(&clData,H,NX*NY*NZ,4, NX,NY,NZ);
}

void transfer_buffers_to_gpu()
{
   transfer_cl_float_buffer_to_device(&clData,clData.buf_divergence,g_divergence,clData.n,true);
   transfer_cl_float_buffer_to_device(&clData,clData.buf_dens,g_dens,clData.n,true);
   transfer_cl_float_buffer_to_device(&clData,clData.buf_dens_prev,g_dens_prev,clData.n,true);
   transfer_cl_float_buffer_to_device(&clData,clData.buf_u_prev,g_u_prev,clData.n,true);
   transfer_cl_float_buffer_to_device(&clData,clData.buf_v_prev,g_v_prev,clData.n,true);
   transfer_cl_float_buffer_to_device(&clData,clData.buf_w_prev,g_w_prev,clData.n,true);
   transfer_cl_float_buffer_to_device(&clData,clData.buf_u,g_u,clData.n,true);
   transfer_cl_float_buffer_to_device(&clData,clData.buf_v,g_v,clData.n,true);
   transfer_cl_float_buffer_to_device(&clData,clData.buf_w,g_w,clData.n,true);
   transfer_cl_float_buffer_to_device(&clData,clData.buf_pressure,g_pressure,clData.n,true);
   transfer_cl_float_buffer_to_device(&clData,clData.buf_pressure_prev,g_pressure_prev,clData.n,true);
   
   
   //transfer_cl_int_buffer_to_device(&clData,clData.buf_dims,dims,3,true);
  
//   transfer_cl_float_buffer_to_device(&clData,clData.buf_debug_data1,clData.debug_data1,clData.dn*clData.n,true);
//   transfer_cl_float_buffer_to_device(&clData,clData.buf_debug_data2,clData.debug_data2,clData.dn*clData.n,true);
//   transfer_cl_float_buffer_to_device(&clData,clData.buf_debug_data3,clData.debug_data3,clData.dn*clData.n,true);
}

void transfer_buffers_to_cpu()
{
   transfer_cl_float_buffer_from_device(&clData,clData.buf_divergence,g_divergence,clData.n,true);
   transfer_cl_float_buffer_from_device(&clData,clData.buf_dens,g_dens,clData.n,true);
   transfer_cl_float_buffer_from_device(&clData,clData.buf_u_prev,g_u_prev,clData.n,true);
   transfer_cl_float_buffer_from_device(&clData,clData.buf_v_prev,g_v_prev,clData.n,true);
   transfer_cl_float_buffer_from_device(&clData,clData.buf_w_prev,g_w_prev,clData.n,true);
   transfer_cl_float_buffer_from_device(&clData,clData.buf_u,g_u,clData.n,true);
   transfer_cl_float_buffer_from_device(&clData,clData.buf_v,g_v,clData.n,true);
   transfer_cl_float_buffer_from_device(&clData,clData.buf_w,g_w,clData.n,true);
   transfer_cl_float_buffer_from_device(&clData,clData.buf_pressure,g_pressure,clData.n,true);
   transfer_cl_float_buffer_from_device(&clData,clData.buf_pressure_prev,g_pressure_prev,clData.n,true);
//   transfer_cl_float_buffer_from_device(&clData,clData.buf_debug_data1,clData.debug_data1,clData.dn*clData.n,true);
//   transfer_cl_float_buffer_from_device(&clData,clData.buf_debug_data2,clData.debug_data2,clData.dn*clData.n,true);
//   transfer_cl_float_buffer_from_device(&clData,clData.buf_debug_data3,clData.debug_data3,clData.dn*clData.n,true);
  
}


void flush_cl_queue()
{
   CALL_CL_GUARDED(clFinish, (clData.queue));
}

static void free_data ( void )
{
	if ( g_u ) free ( g_u );
	if ( g_v ) free ( g_v );
	if ( g_w ) free ( g_w );
	if ( g_u_prev ) free ( g_u_prev );
	if ( g_v_prev ) free ( g_v_prev );
	if ( g_w_prev ) free ( g_w_prev );
	if ( g_dens ) free ( g_dens );
	if ( g_dens_prev ) free ( g_dens_prev );
	if ( g_curl ) free ( g_curl );
	if ( g_heat ) free (g_heat);
	if ( g_heat_prev) free(g_heat_prev);
	if (g_compressibility) free (g_compressibility);
	if (g_divergence) free (g_divergence);
	if (g_pressure) free (g_pressure);
	if (g_pressure_prev) free (g_pressure_prev);
  if (g_laplacian_matrix) free (g_laplacian_matrix);
  if (g_cg_r) free (g_cg_r);
  if (g_cg_d) free (g_cg_d);
  if (g_cg_q) free (g_cg_q);
  
	
}

static void clear_data ( void )
{
	int i, size=NX*NY*NZ;

	for ( i=0 ; i<size ; i++ ) {
		g_u[i] = g_v[i] = g_w[i] = g_u_prev[i] = g_v_prev[i] = g_w_prev[i] =
			g_dens[i] = g_dens_prev[i] = g_curl[i] = 
			g_heat[i] = g_heat_prev[i] = g_compressibility[i] = 
			g_divergence[i] = g_pressure[i] = g_pressure_prev[i]  = 0.0f;
	}
  
  //memset(g_laplacian_matrix,0.0f, sizeof(float)*size*size);
	
	//particle_system->clear();
}

static int allocate_data ( void )
{
	int size = NX*NY*NZ;

	g_u				= (float *) malloc ( size*sizeof(float) );
	g_v				= (float *) malloc ( size*sizeof(float) );
	g_w				= (float *) malloc ( size*sizeof(float) );
	g_u_prev		= (float *) malloc ( size*sizeof(float) );
	g_v_prev		= (float *) malloc ( size*sizeof(float) );
	g_w_prev		= (float *) malloc ( size*sizeof(float) );
	g_dens			= (float *) malloc ( size*sizeof(float) );	
	g_dens_prev		= (float *) malloc ( size*sizeof(float) );
	g_curl			= (float *) malloc ( size*sizeof(float) );
	g_heat			= (float *) malloc ( size*sizeof(float) );
	g_heat_prev		= (float *) malloc ( size*sizeof(float) );
	g_divergence	= (float *) malloc ( size*sizeof(float) );
	g_pressure		= (float *) malloc ( size*sizeof(float) );
	g_pressure_prev	= (float *) malloc ( size*sizeof(float) );
	g_compressibility =  (float *) malloc ( size*sizeof(float) );
  
  g_cg_r =  (float *) malloc ( size*sizeof(float) );
	g_cg_d =  (float *) malloc ( size*sizeof(float) );
	g_cg_q =  (float *) malloc ( size*sizeof(float) );
  
	if ( !g_u || !g_v || !g_u_prev || !g_v_prev || !g_dens || !g_dens_prev || !g_curl || !g_compressibility
		|| !g_pressure || !g_pressure_prev || !g_divergence) {
		fprintf ( stderr, "cannot allocate data\n" );
		return ( 0 );
	}
	
	//particle_system = new CombustionParticleSystem(100,win_x,win_y,N);
  g_laplacian_matrix = (float *) malloc ( size*size*sizeof(float) );
  

  
	return ( 1 );
}


/*
  ----------------------------------------------------------------------
   OpenGL specific drawing routines
  ----------------------------------------------------------------------
*/

static void pre_display ( void )
{
	glViewport ( 0, 0, win_x, win_y );
	glMatrixMode ( GL_PROJECTION );
	glLoadIdentity ();
	gluOrtho2D ( 0.0, 1.0, 0.0, 1.0 );
	glClearColor ( 0.0f, 0.0f, 0.0f, 1.0f );
	glClear ( GL_COLOR_BUFFER_BIT );
}

static void post_display ( void )
{
	glutSwapBuffers ();
}

static void draw_velocity ( void )
{
	int i, j;
	float x, y, h;

	h = 1.0f/NX;

	glColor3f ( 1.0f, 1.0f, 1.0f );
	glLineWidth ( 1.0f );

	glBegin ( GL_LINES );

		for ( i=0 ; i<NX ; i++ ) {
			//x = (i-0.5f)*h;
			x = (i+0.5f)*h;

			for ( j=0 ; j<NY ; j++ ) {
				//y = (j-0.5f)*h;
				y = (j+0.5f)*h;

				glColor3f(1.0,1.0,1.0);
				glVertex2f ( x, y );
				glColor3f(1.0,0.0,0.0);
				glVertex2f ( x+g_u[IX(i,j,0)], y+g_v[IX(i,j,0)] );
			}
		}

	glColor3f(1.0,1.0,1.0);
	glEnd ();
}

static void draw_pressure ( void )
{
	int i, j;
	float x, y, h, d00, d01, d10, d11;

	h = 1.0f/NX;

	glBegin ( GL_QUADS );

		for ( i=0 ; i<NX ; i++ ) {
			x = (i-0.0f)*h;
			for ( j=0 ; j<NY ; j++ ) {
				y = (j-0.0f)*h;

				d00 = 255.0f * fabs(get_data(g_divergence,i,j,0));
				d01 = 255.0f * fabs(get_data(g_divergence,i,j+1,0));
				d10 = 255.0f * fabs(get_data(g_divergence,i+1,j,0));
				d11 = 255.0f * fabs(get_data(g_divergence,i+1,j+1,0));

				glColor3f ( d00, d00, d00 ); glVertex2f ( x, y );
				glColor3f ( d10, d10, d10 ); glVertex2f ( x+h, y );
				glColor3f ( d11, d11, d11 ); glVertex2f ( x+h, y+h );
				glColor3f ( d01, d01, d01 ); glVertex2f ( x, y+h );
			}
		}

	glEnd ();
}

static void draw_density ( void )
{
	int i, j;
	float x, y, h, d00, d01, d10, d11;

	h = 1.0f/NX;

	glBegin ( GL_QUADS );

		for ( i=0 ; i<NX ; i++ ) {
			x = (i-0.0f)*h;
			for ( j=0 ; j<NY ; j++ ) {
				y = (j-0.0f)*h;

				d00 = get_data(g_dens,i,j,0);
				d01 = get_data(g_dens,i,j+1,0);
				d10 = get_data(g_dens,i+1,j,0);
				d11 = get_data(g_dens,i+1,j+1,0);

				glColor3f ( d00, d00, d00 ); glVertex2f ( x, y );
				glColor3f ( d10, d10, d10 ); glVertex2f ( x+h, y );
				glColor3f ( d11, d11, d11 ); glVertex2f ( x+h, y+h );
				glColor3f ( d01, d01, d01 ); glVertex2f ( x, y+h );
			}
		}

	glEnd ();
}
/*
  ----------------------------------------------------------------------
   relates mouse movements to forces sources
  ----------------------------------------------------------------------
*/

//static void get_from_UI ( float * d, float * u, float * v, float * heat, float * compressibility, CombustionParticleSystem* cps )
static void get_from_UI ( float * d, float * u, float * v, float * heat, float * compressibility)
{
	int i, j, size = NX*NY*NZ;

	/*
	for ( i=0 ; i<size ; i++ ) {
		u[i] = v[i] = w[i] = d[i] = 0.0f;
	}
	*/

	if ( !mouse_down[0] && !mouse_down[2] ) return;

	i = (int)((       mx /(float)win_x)*NX);
	j = (int)(((win_y-my)/(float)win_y)*NY);

	if ( i<2 || i>=NX-1 || j<2 || j>=NY-1 ) return;

	if ( mouse_down[0] ) {
		/*
		compressibility[IX(i,j)] = 1.0f;
		compressibility[IX(i+1,j)] = 1.0f;
		compressibility[IX(i,j+1)] = 1.0f;
		compressibility[IX(i+1,j+1)] = 1.0f;
		heat[IX(i,j)] = 0.05f;
     */
		d[IX(i,j,0)] = source;

		float diffx = mx - omx;
		float diffy = win_y - my - omy;
		
		if(abs(diffx) > 0.000001)
			diffx = diffx/diffx * diffx<0.0f?-1.0f:1.0f;
		if(abs(diffy) > 0.000001)
			diffy = diffy/diffy * diffy<0.0f?-1.0f:1.0f;
		
		u[IX(i,j,0)] = 0.1f * force * diffx;
		v[IX(i,j,0)] = 0.1f * force * diffy;

//		u[IX(i-1,j,0)] = 0.075f *  force;
//		u[IX(i,j,0)] = 0.075f *  force;
//		u[IX(i+1,j,0)] = 0.075f *  force;
//		v[IX(i,j+1,0)] = 0.5f * force * diffy;
	}

	/*
	if ( mouse_down[2] ) {
		cps->trigger(mx, my, 100);
		//d[IX(i,j)] = source;
	}
	*/

	omx = mx;
	omy = win_y-my;

	return;
}

/*
  ----------------------------------------------------------------------
   GLUT callback routines
  ----------------------------------------------------------------------
*/

static void key_func ( unsigned char key, int x, int y )
{
	switch ( key )
	{
		case 'x':
		case 'X':
			clear_data ();
			break;

		case 'q':
		case 'Q':
		case 27: // ESCAPE KEY
			free_data ();
			exit ( 0 );
			break;

		case 'v':
		case 'V':
			dvel = !dvel;
			break;

		case 's':
		case 'S':
			step = 1;
			break;
		case 'c':
		case 'C':
			useCG = !useCG;
			printf("Using %s solver\n",useCG?"Conjugate Gradient":"Jacobi");
			break;
      
		case 'm':
		case 'M':
			maccormack = !maccormack;
			printf("MacCormack = %s\n",maccormack?"true":"false");
			break;

		case 'o':
		case 'O':
			vorticity = !vorticity;
			printf("Vorticity = %s\n",vorticity?"true":"false");
			break;
	}
}

static void mouse_func ( int button, int state, int x, int y )
{
	omx = mx = x;
	omy = my = y;

	mouse_down[button] = state == GLUT_DOWN;
}

static void motion_func ( int x, int y )
{
	mx = x;
	my = y;
}

static void reshape_func ( int width, int height )
{
	glutSetWindow ( win_id );
	glutReshapeWindow ( width, height );

	win_x = width;
	win_y = height;
	//particle_system->update_win(win_x,win_xy);
}

static void idle_func ( void )
{
	//if(step)
	{
		get_from_UI ( g_dens_prev, g_u_prev, g_v_prev, g_heat,g_compressibility);
    
		//blur(g_u_prev,g_v_prev,g_w_prev, dt);
		
		
#if USE_OPENCL
      
  transfer_buffers_to_gpu();
    
  run_cl_advect_velocity(&clData, dt);
      
  flush_cl_queue();
  
    
  run_cl_calculate_divergence(&clData, dt);
   
  run_cl_zero_pressure(&clData);
  
  if(useCG)
  {
    transfer_cl_float_buffer_from_device(&clData,clData.buf_pressure,g_pressure,clData.n,true);
    transfer_cl_float_buffer_from_device(&clData,clData.buf_divergence,g_divergence,clData.n,true);
    
    run_cl_cg_no_mtx(&clData,g_pressure, g_divergence,  g_cg_r, g_cg_d, g_cg_q, clData.n, 10, 0.0001f);
    
    flush_cl_queue();
    
    transfer_cl_float_buffer_to_device(&clData,clData.buf_pressure,g_pressure,clData.n,true);
    
    
  }else{
    //This has to run the whole kernel and iterate at the cpu because
    // opencl only can sync at the workgroup level when we need
    // global synchronization
    for(int i = 0; i < 20; ++i)
    {
      run_cl_pressure_solve(&clData, dt);
    }
  }
    
  run_cl_pressure_apply(&clData, dt);
    
    
  flush_cl_queue();
    
  run_cl_advect_density(&clData, dt);
    
    if(vorticity){
      run_cl_vorticity_confinement(&clData, dt,0.5f);
    }
  transfer_buffers_to_cpu();
    
    
#else
    if(maccormack){
			advect_velocity_maccormack(dt, g_u, g_v, g_w, g_u_prev, g_v_prev, g_w_prev);
		} else {
			//advect_velocity_forward_euler(dt, g_u, g_v, g_w, g_u_prev, g_v_prev, g_w_prev);
			advect_velocity_RK2(dt, g_u, g_v, g_w, g_u_prev, g_v_prev, g_w_prev);
		}
    
    //project(dt,g_u,g_v, g_w, g_divergence, g_pressure, g_pressure_prev);
    project(dt,g_u,g_v, g_w, g_divergence, g_pressure, g_pressure_prev, g_laplacian_matrix,g_cg_r, g_cg_d, g_cg_q,useCG);
    
    
		advectRK2(dt,g_dens,g_dens_prev, g_u, g_v, g_w);
    
    if(vorticity) {
			vorticity_confinement(dt, g_u, g_v, g_w, g_u_prev, g_v_prev, g_w_prev);
		}
#endif
		

    
		SWAP(g_u,g_u_prev);
		SWAP(g_v,g_v_prev);
		SWAP(g_dens, g_dens_prev);
    
		//copy_grid(g_u,g_u_prev);
		//copy_grid(g_v,g_v_prev);
		//copy_grid(g_dens, g_dens_prev);
    
		step = 0;
	}

	//#ifndef __EMSCRIPTEN__
	//	glutSetWindow ( win_id );
	//#endif
	glutPostRedisplay ();



}

static void display_func ( void )
{
	pre_display ();



		if ( dvel )
    {
      draw_pressure();
      draw_velocity ();
    }
		else
    {
      draw_density ();
    }

	post_display ();
}





/*
#define NXTEST 2
#define NYTEST 2
#define NZTEST 1
#define IXTEST(i,j,k) ((i) + ((j)*(NXTEST)) + ((k)*(NXTEST)*(NYTEST)))
void run_tests()
{
	float test_grid[NXTEST*NYTEST*NZTEST];
	test_grid[IXTEST(0,0,0)] = -1.0f;
	test_grid[IXTEST(1,0,0)] = 1.0f;
	test_grid[IXTEST(0,1,0)] = -2.0f;
	test_grid[IXTEST(1,1,0)] = 3.0f;

	float value = get_interpolated_value(test_grid,1.5f,0.5f,0.5f,1.0f,2,2,1);
}
 */


void readMatrix(float* m, int n){
  FILE *fp;
  fp = fopen("spd-mat.txt","r");
  //if(fp != NULL)
    //printf("file opened\n");
  // For the rest, read in the values
  for(int i = 0; i < n; i++){
    for(int j = 0; j < n; j++){
      fscanf(fp, "%e", &m[i+j*n]);
      //printf("%3.6f ", m[i+j*n]);
    }
    //printf("\n");
  }
  
  
  fclose(fp);
}

void runTimings(){
  int ntrips = 10;
  char device_name[256];
  
  timestamp_type time1, time2;
  
  ////////////////////////////////////////////////////
  ///GPU TIMINGS
  ////////////////////////////////////////////////////
  
  init_opencl();
  load_cl_kernels(&clData);
  allocate_cl_buffers(&clData);
  
 
  print_device_info_from_queue(clData.queue);
  get_device_name_from_queue(clData.queue, device_name, 256);
  
  transfer_buffers_to_gpu();
  
  double advectionVelocityTimeGPU, advectionDensityTimeGPU, divergenceTimeGPU, projectJacobiTimeGPU, projectCGTimeGPU, pressureApplyTimeGPU;

    
  transfer_buffers_to_gpu();

  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    run_cl_advect_velocity(&clData, dt);
  }
  flush_cl_queue();
  get_timestamp(&time2);
  advectionVelocityTimeGPU = timestamp_diff_in_seconds(time1,time2)/ntrips;



  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    run_cl_calculate_divergence(&clData, dt);
  }
  flush_cl_queue();
  get_timestamp(&time2);
  divergenceTimeGPU = timestamp_diff_in_seconds(time1,time2)/ntrips;

  transfer_buffers_to_cpu();
  flush_cl_queue();
  
  //This needs ntrips different divergence matrices to get accurate timings.
  //This is because by the time the second time it is called it will detect
  //the system is solved and exit after one matrix
  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    transfer_cl_float_buffer_from_device(&clData,clData.buf_pressure,g_pressure,clData.n,true);
    transfer_cl_float_buffer_from_device(&clData,clData.buf_divergence,g_divergence,clData.n,true);
    
    run_cl_cg_no_mtx(&clData,g_pressure, g_divergence,  g_cg_r, g_cg_d, g_cg_q, clData.n, 10, 0.0001f);
    flush_cl_queue();
    
    transfer_cl_float_buffer_to_device(&clData,clData.buf_pressure,g_pressure,clData.n,true);
  }
  flush_cl_queue();
  get_timestamp(&time2);
  projectCGTimeGPU = timestamp_diff_in_seconds(time1,time2)/ntrips;




  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    for(int i = 0; i < 20; ++i)
    {
      run_cl_pressure_solve(&clData, dt);
    }
  }
  flush_cl_queue();
  get_timestamp(&time2);
  projectJacobiTimeGPU = timestamp_diff_in_seconds(time1,time2)/ntrips;



  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    run_cl_pressure_apply(&clData, dt);
  }
  flush_cl_queue();
  get_timestamp(&time2);
  pressureApplyTimeGPU = timestamp_diff_in_seconds(time1,time2)/ntrips;

  

  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    run_cl_advect_density(&clData, dt);
  }
  flush_cl_queue();
  get_timestamp(&time2);
  advectionDensityTimeGPU = timestamp_diff_in_seconds(time1,time2)/ntrips;

  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t", device_name,NX,NY,NZ,"GPU","Advection Velocity",advectionVelocityTimeGPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/advectionVelocityTimeGPU);
  
  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t", device_name,NX,NY,NZ,"GPU","Advection Density",advectionDensityTimeGPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/advectionDensityTimeGPU);
  
  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t", device_name,NX,NY,NZ,"GPU", "Divergence",divergenceTimeGPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/divergenceTimeGPU);
  
  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t", device_name,NX,NY,NZ,"GPU", "Projection Jacobi",projectJacobiTimeGPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/projectJacobiTimeGPU);
  
  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t",device_name,NX,NY,NZ,"GPU", "Projection Conjugate Gradient",projectCGTimeGPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/projectCGTimeGPU);
  
  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t", device_name,NX,NY,NZ,"GPU","Pressure Apply",pressureApplyTimeGPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/pressureApplyTimeGPU);
  

  cleanup_cl(&clData);
  
  
  
  
  ////////////////////////////////////////////////////
  ///CPU TIMINGS
  ////////////////////////////////////////////////////
  double advectionVelocityTimeCPU, advectionDensityTimeCPU, divergenceTimeCPU, projectJacobiTimeCPU, projectCGTimeCPU, pressureApplyTimeCPU;

  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    advect_velocity_RK2(dt, g_u, g_v, g_w, g_u_prev, g_v_prev, g_w_prev);
  }
  get_timestamp(&time2);
  advectionVelocityTimeCPU = timestamp_diff_in_seconds(time1,time2)/ntrips;


  //project(dt,g_u,g_v, g_w, g_divergence, g_pressure, g_pressure_prev, g_laplacian_matrix,useCG);
  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    calculate_divergence(g_divergence, g_u, g_v, g_w, dt);
  }
  get_timestamp(&time2);
  divergenceTimeCPU = timestamp_diff_in_seconds(time1,time2)/ntrips;


  //This needs ntrips different divergence matrices to get accurate timings.
  //This is because by the time the second time it is called it will detect
  //the system is solved and exit after one matrix
  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    pressure_solve_cg_no_matrix(g_pressure, g_divergence, g_cg_r, g_cg_d, g_cg_q);
  }
  get_timestamp(&time2);
  projectCGTimeCPU = timestamp_diff_in_seconds(time1,time2)/ntrips;

  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    pressure_solve(g_pressure,g_pressure_prev, g_divergence, dt);
  }
  get_timestamp(&time2);
  projectJacobiTimeCPU = timestamp_diff_in_seconds(time1,time2)/ntrips;

  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    pressure_apply(g_u, g_v, g_w, g_pressure, dt);
  }
  get_timestamp(&time2);
  pressureApplyTimeCPU = timestamp_diff_in_seconds(time1,time2)/ntrips;


  get_timestamp(&time1);
  for(int i = 0; i < ntrips; ++i)
  {
    advectRK2(dt,g_dens,g_dens_prev, g_u, g_v, g_w);
  }
  get_timestamp(&time2);
  advectionDensityTimeCPU = timestamp_diff_in_seconds(time1,time2)/ntrips;


  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t", device_name,NX,NY,NZ,"CPU","Advection Velocity",advectionVelocityTimeCPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/advectionVelocityTimeCPU);
  
  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t", device_name,NX,NY,NZ,"CPU","Advection Density",advectionDensityTimeCPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/advectionDensityTimeCPU);
  
  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t", device_name,NX,NY,NZ,"CPU","Divergence",divergenceTimeCPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/divergenceTimeCPU);
  
  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t", device_name,NX,NY,NZ,"CPU","Projection Jacobi",projectJacobiTimeCPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/projectJacobiTimeCPU);
  
  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t", device_name,NX,NY,NZ,"CPU","Projection Conjugate Gradient",projectCGTimeCPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/projectCGTimeCPU);
  
  printf("%s\t%dx%dx%d\t%s\t%s\t %3.6f\ts\t", device_name,NX,NY,NZ,"CPU","Pressure Apply",pressureApplyTimeCPU);
  printf("%.3f\tMegaCells/s\n",(NX*NY*NZ)*1e-6/pressureApplyTimeCPU);
  
}




void testCG(){
  int N = 100;
  //read n=100 spd matrix from file
  float A[N*N];
  readMatrix(A, N);
  
  //run cg on it to see if it converges
  
  
  //When porting cg to opencl  only the mtx-vec multiply and the
  //dot-product(reduction) are run on the GPU everything is on the GPU
  int i = 0;
  int imax = 1000;
  float tol = 0.000001f;
  float r[N];
  float b[N];
  float d[N];
  float x[N];
  float q[N];
 
  for(int i = 0; i < N; i++){
    x[i] = 0.0f;
    b[i] = rand()/(float)RAND_MAX * 100.0f;
    r[i] = b[i];
    d[i] = r[i];
  }
  
  float rnew = dot(r,r,N);
  float rold = 0.0f;

  float r0 = rnew;
  //while(i < imax && rnew > 0.0000001*r0) {
  while(i < imax && rnew > tol) {
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
  
  //Check the answer
  float ax[N];
  int goodMatrix = 1;
  mtx_times_vec(ax,A,x,N);
  for(int i = 0; i < N; i++){
    float diff = ax[i] - b[i];
    if(fabs(diff) > 0.01f){
      goodMatrix = 0;
      printf("CG Result mismatch at idx %d ax[%d] = %3.6f != b[%d] = %3.6f\n", i,i,ax[i],i,b[i]);
    }
  }
  if(goodMatrix){
    printf("CG Converged and Solved Ax=b\n");
  }else{
    printf("CG did not solve Ax=b\n");
  }

  printf("CG Terminated with iterations %d, and rnew %3.6f\n",i, rnew);
  
  
  
}



static void test_opencl_opengl_interop()
{
  cl_int status;

	cl_device_id renderer;

	#ifndef __EMSCRIPTEN__  
  CGLContextObj gl_context = CGLGetCurrentContext();
//  const char * err = CGLErrorString(kCGLContext);
  
  CGLShareGroupObj kCGLShareGroup = CGLGetShareGroup(gl_context);
  
  cl_context_properties properties[] = {
    CL_CONTEXT_PROPERTY_USE_CGL_SHAREGROUP_APPLE,
    (cl_context_properties)kCGLShareGroup, 0
  };

  clData.ctx = clCreateContext(properties, 0, 0, 0, 0, &status);
  CHECK_CL_ERROR(status, "clCreateContext");
  
  // And now we can ask OpenCL which particular device is being used by
  // OpenGL to do the rendering, currently:

  clGetGLContextInfoAPPLE(clData.ctx, gl_context,
                          CL_CGL_DEVICE_FOR_CURRENT_VIRTUAL_SCREEN_APPLE, sizeof(renderer),
                          &renderer, NULL);
  #else
	
    cl_context_properties cps[] = {
    CL_GL_CONTEXT_KHR, (cl_context_properties) 0, CL_WGL_HDC_KHR, (cl_context_properties) 0, 0};
            
    //Probably won't work because &dev should correspond to glContext
     clData.ctx = clCreateContext(cps, 1, &renderer, NULL, NULL, &status);

  CHECK_CL_ERROR(status, "clCreateContext");

  #endif
  
  cl_uint id_in_use;
  clGetDeviceInfo(renderer, CL_DEVICE_VENDOR_ID, sizeof(cl_uint),
                  &id_in_use, NULL);
  
  clData.device = renderer;
  
  cl_command_queue_properties qprops = 0;
  
  clData.queue = clCreateCommandQueue(clData.ctx, clData.device, qprops, &status);
  CHECK_CL_ERROR(status, "clCreateCommandQueue");
  
  
  
  
  int extensionExists = 0;
  
  size_t extensionSize;
  int ciErrNum = clGetDeviceInfo( clData.device, CL_DEVICE_EXTENSIONS, 0, NULL, &extensionSize );
  char* extensions = (char*) malloc( extensionSize);
  ciErrNum = clGetDeviceInfo( clData.device, CL_DEVICE_EXTENSIONS, extensionSize, extensions, &extensionSize);
  
  char * pch;
  //printf ("Splitting extensions string \"%s\" into tokens:\n",extensions);
  pch = strtok (extensions," ");
  while (pch != NULL)
  {
    printf ("%s\n",pch);
    if(strcmp(pch, GL_SHARING_EXTENSION) == 0) {
      printf("Device supports gl sharing\n");
      extensionExists = 1;
      break;
    }
    pch = strtok (NULL, " ");
  }
  
  
  
}

void run_opencl_test(){
  
  init_opencl();
  load_cl_kernels(&clData);
  allocate_cl_buffers(&clData);
  transfer_buffers_to_gpu();
   
  flush_cl_queue();
   
  run_cl_advect_density(&clData, dt);
   
  flush_cl_queue();
   
  transfer_buffers_to_cpu();
   
  flush_cl_queue();
   
  
//  printf("dens[%d] = %3.2f\n",IX(16,3,0),g_dens[IX(16,3,0)]);
//  
//  if(g_dens[IX(16,3,0)] > 0.0f)
//  {
//    printf("Success!!\n");
//  }
//
//  for (int i = 0; i < clData.n; ++i)
//  {
//    if(i == 112) {
//      int j = i*clData.dn;
//      printf("debug_data1[%d] = %3.2f, %3.2f, %3.2f, %3.2f\n",i,clData.debug_data1[j], clData.debug_data1[j+1], clData.debug_data1[j+2], clData.debug_data1[j+3]);
//    }
//    
//  }
   
  cleanup_cl(&clData);

  
}

static void open_glut_window ( void )
{
	glutInitDisplayMode ( GLUT_RGBA | GLUT_DOUBLE );
  glutInitWindowPosition ( 0, 0 );
	glutInitWindowSize ( win_x, win_y );
  win_id = glutCreateWindow ( "Fluids" );
  
  
  
	glClearColor ( 0.0f, 0.0f, 0.0f, 1.0f );
	glClear ( GL_COLOR_BUFFER_BIT );
	glutSwapBuffers ();
	glClear ( GL_COLOR_BUFFER_BIT );
	glutSwapBuffers ();
  
	pre_display ();
  
	glutKeyboardFunc ( key_func );
	glutMouseFunc ( mouse_func );
	glutMotionFunc ( motion_func );
	glutReshapeFunc ( reshape_func );
	glutIdleFunc ( idle_func );
	glutDisplayFunc ( display_func );
}

int main ( int argc, char ** argv )
{
  //testCG();
  win_x = 512;
	win_y = 512;
  
  
	glutInit ( &argc, argv );
  
	open_glut_window ();
 
  //test_opencl_opengl_interop();
  
  
  dt = 0.1f;
  force = 10.0f;
  source = 10.0f;
	

	printf ( "\n\nHow to use this demo:\n\n" );
	printf ( "\t Add densities with the left mouse button\n" );
	printf ( "\t Add velocities with the left mouse button and dragging the mouse\n" );
	printf ( "\t Toggle density/velocity display with the 'v' key\n" );
	printf ( "\t Clear the simulation by pressing the 'x' key\n" );
  printf ( "\t switch poisson solvers from jacobi to conjugate gradient by pressing the 'c' key\n" );
  printf ( "\t switch advection scheme from RK2 to MacCormack by pressing the 'm' key\n" );
  printf ( "\t toggle vorticity confinement by pressing the 'o' key\n" );
  
	printf ( "\t Quit by pressing the 'q' key\n" );

	dvel = 0;

	step = 0;
	maccormack = 0;
	vorticity = 0;
  useCG = 0;
	
	if ( !allocate_data () ) exit ( 1 );
	clear_data ();
  

  
  //setupMatrix(g_laplacian_matrix);

//	FOR_EACH_FACE
//	{
//		//if(i < NX - NX*0.4 && i > NX*0.4 
//		//	&&
//		//   j < NY - NY*0.4 && j > NY*0.4 )
//		{
//			g_u_prev[IX(i,j,0)] =  -0.01 * cosf(3.14159 * 2.0 * i/NX);
//			g_v_prev[IX(i,j,0)] =  0.01 * sinf(3.14159 * 2.0 * j/NY);
//		}
//	}

#if RUN_TIMINGS
  runTimings();
  exit(0);
#endif
  
	copy_grid(g_u_prev, g_u);
	copy_grid(g_v_prev, g_v);
  
  g_dens_prev[IX(16,3,0)] = 10.0f;
  //g_u_prev[IX(16,3,0)] = 10.0f;
  
	/*
	calculate_divergence(g_divergence, g_u_prev, g_v_prev, g_w_prev, dt);
	pressure_solve(g_pressure,g_pressure_prev, g_divergence, dt);
	pressure_apply(g_u_prev, g_v_prev, g_w_prev, g_pressure, dt);
	//project(dt,g_u_prev,g_v_prev, g_w_prev, g_divergence, g_pressure, g_pressure_prev);
	SWAP(g_u_prev,g_u);
	SWAP(g_v_prev,g_v);
	SWAP(g_w_prev,g_w);

	if(!check_divergence(g_u_prev, g_v_prev, g_w_prev))
	{
		printf("Initial field wasn't divergence free!\n");
	}
	*/


//print_platforms_devices();
//  run_opencl_test();
  
//	run_tests();
   
  
#if USE_OPENCL
   init_opencl();
   load_cl_kernels(&clData);
   allocate_cl_buffers(&clData);
  
  
   transfer_buffers_to_gpu();
   
   flush_cl_queue();
#endif
   
   
  

	glutMainLoop ();

#if USE_OPENCL
   cleanup_cl(&clData);
#endif
  
	exit ( 0 );
}

