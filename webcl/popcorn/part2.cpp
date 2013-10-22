#include <stdio.h>

#include "cll.h"
#include "util.h"

#include <math.h>
#include <vector>

#ifdef __EMSCRIPTEN__
    #include <GL/gl.h>
    #include <GL/glext.h>
#else
    #include <OpenGL/gl.h>
    #include <OpenGL/glext.h>
#endif

static GLfloat ProjectionMatrix[16];

#ifndef HAVE_BUILTIN_SINCOS
#define sincos _sincos
static void
sincos (double a, double *s, double *c)
{
  *s = sin (a);
  *c = cos (a);
}
#endif

/**
 * Multiplies two 4x4 matrices.
 *
 * The result is stored in matrix m.
 *
 * @param m the first matrix to multiply
 * @param n the second matrix to multiply
 */
static void
multiply(GLfloat *m, const GLfloat *n)
{
   GLfloat tmp[16];
   const GLfloat *row, *column;
   div_t d;
   int i, j;

   for (i = 0; i < 16; i++) {
      tmp[i] = 0;
      d = div(i, 4);
      row = n + d.quot * 4;
      column = m + d.rem;
      for (j = 0; j < 4; j++)
         tmp[i] += row[j] * column[j * 4];
   }
   memcpy(m, &tmp, sizeof tmp);
}

/**
 * Rotates a 4x4 matrix.
 *
 * @param[in,out] m the matrix to rotate
 * @param angle the angle to rotate
 * @param x the x component of the direction to rotate to
 * @param y the y component of the direction to rotate to
 * @param z the z component of the direction to rotate to
 */
static void
rotate(GLfloat *m, GLfloat angle, GLfloat x, GLfloat y, GLfloat z)
{
   double s, c;

   sincos(angle, &s, &c);
   GLfloat r[16] = {
      x * x * (1 - c) + c,     y * x * (1 - c) + z * s, x * z * (1 - c) - y * s, 0,
      x * y * (1 - c) - z * s, y * y * (1 - c) + c,     y * z * (1 - c) + x * s, 0,
      x * z * (1 - c) + y * s, y * z * (1 - c) - x * s, z * z * (1 - c) + c,     0,
      0, 0, 0, 1
   };

   multiply(m, r);
}

/**
 * Creates an identity 4x4 matrix.
 *
 * @param m the matrix make an identity matrix
 */
static void
identity(GLfloat *m)
{
   GLfloat t[16] = {
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0,
   };

   memcpy(m, t, sizeof(t));
}

/**
 * Translates a 4x4 matrix.
 *
 * @param[in,out] m the matrix to translate
 * @param x the x component of the direction to translate to
 * @param y the y component of the direction to translate to
 * @param z the z component of the direction to translate to
 */
static void
translate(GLfloat *m, GLfloat x, GLfloat y, GLfloat z)
{
   GLfloat t[16] = { 1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  x, y, z, 1 };

   multiply(m, t);
}

/**
 * Calculate a perspective projection transformation.
 *
 * @param m the matrix to save the transformation in
 * @param fovy the field of view in the y direction
 * @param aspect the view aspect ratio
 * @param zNear the near clipping plane
 * @param zFar the far clipping plane
 */
void perspective(GLfloat *m, GLfloat fovy, GLfloat aspect, GLfloat zNear, GLfloat zFar)
{
   GLfloat tmp[16];
   identity(tmp);

   double sine, cosine, cotangent, deltaZ;
   GLfloat radians = fovy / 2 * M_PI / 180;

   deltaZ = zFar - zNear;
   sincos(radians, &sine, &cosine);

   if ((deltaZ == 0) || (sine == 0) || (aspect == 0))
      return;

   cotangent = cosine / sine;

   tmp[0] = cotangent / aspect;
   tmp[5] = cotangent;
   tmp[10] = -(zFar + zNear) / deltaZ;
   tmp[11] = -1;
   tmp[14] = -2 * zNear * zFar / deltaZ;
   tmp[15] = 0;

   memcpy(m, tmp, sizeof(tmp));
}

void CL::loadData(float* pos, float* vel, float* col)
{

    #ifdef __APPLE__
    gl_shaders.push_back(compileShader("popcorn_osx", GL_VERTEX_SHADER));
    gl_shaders.push_back(compileShader("popcorn_osx", GL_FRAGMENT_SHADER));
    #else
    gl_shaders.push_back(compileShader("popcorn", GL_VERTEX_SHADER));
    gl_shaders.push_back(compileShader("popcorn", GL_FRAGMENT_SHADER));
    #endif

    //store the number of particles and the size in bytes of our arrays
    //num = pos.size();
    //array_size = num * sizeof(Vec4);
    num = 20000;
    array_size =  num * sizeof(float) * 4;

    //create VBOs (defined in util.cpp)
    // p_vbo = createVBO(pos, array_size, GL_ARRAY_BUFFER, GL_DYNAMIC_DRAW);
    // c_vbo = createVBO(col, array_size, GL_ARRAY_BUFFER, GL_DYNAMIC_DRAW);

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // build shader program

    m_program = glCreateProgram();
    if ( !m_program )
        printf("unable to create GLSL program\n");

    glBindAttribLocation(m_program, 0, "a_position");
    glBindAttribLocation(m_program, 1, "a_color");

    for ( auto it = gl_shaders.begin(); it != gl_shaders.end(); ++it )
        glAttachShader(m_program, *it);

    glLinkProgram(m_program);

    GLint res;
    glGetProgramiv(m_program, GL_LINK_STATUS, &res);
 
    if ( res == GL_FALSE )
    {
        glDeleteProgram(m_program);
        printf("GLSL program build failed\n");
    }
    

    glUseProgram(m_program);

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // create VBOs
    glGenBuffers(1, &p_vbo);
    glBindBuffer(GL_ARRAY_BUFFER, p_vbo);
    glBufferData(GL_ARRAY_BUFFER, array_size, pos, GL_DYNAMIC_DRAW);

    glGenBuffers(1, &c_vbo);
    glBindBuffer(GL_ARRAY_BUFFER, c_vbo);
    glBufferData(GL_ARRAY_BUFFER, array_size, col, GL_DYNAMIC_DRAW);

    #ifdef __EMSCRIPTEN__
        glGenVertexArrays( 1, &p_vao );
        glBindVertexArray(p_vao);

        glEnableVertexAttribArray(0);
        glEnableVertexAttribArray(1);

        glBindBuffer(GL_ARRAY_BUFFER, p_vbo);
        glVertexAttribPointer( 0, 4, GL_FLOAT, GL_FALSE, 0, NULL );

        glBindBuffer(GL_ARRAY_BUFFER, c_vbo);
        glVertexAttribPointer( 1, 4, GL_FLOAT, GL_FALSE, 0, NULL );
    #else 
        glGenVertexArraysAPPLE( 1, &p_vao );
        glBindVertexArrayAPPLE(p_vao);

        glEnableVertexAttribArrayARB(0);
        glEnableVertexAttribArrayARB(1);

        glBindBuffer(GL_ARRAY_BUFFER, p_vbo);
        glVertexAttribPointerARB( 0, 4, GL_FLOAT, GL_FALSE, 0, NULL );

        glBindBuffer(GL_ARRAY_BUFFER, c_vbo);
        glVertexAttribPointerARB( 1, 4, GL_FLOAT, GL_FALSE, 0, NULL );
    #endif

    GLint loc = glGetUniformLocation(m_program, "u_pointSize");
    glUniform1f(loc,1.0f);

    //make sure OpenGL is finished before we proceed
    glFinish();

    glEnable(GL_BLEND);
    glBlendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA,GL_ONE,GL_ONE_MINUS_SRC_ALPHA);

    printf("gl interop!\n");
    // create OpenCL buffer from GL VBO
    cl_vbos.push_back(cl::BufferGL(context, CL_MEM_READ_WRITE, p_vbo, &err));
    //printf("v_vbo: %s\n", oclErrorString(err));
    cl_vbos.push_back(cl::BufferGL(context, CL_MEM_READ_WRITE, c_vbo, &err));
    //we don't need to push any data here because it's already in the VBO


    //create the OpenCL only arrays
    cl_velocities = cl::Buffer(context, CL_MEM_WRITE_ONLY, array_size, NULL, &err);
    cl_pos_gen = cl::Buffer(context, CL_MEM_WRITE_ONLY, array_size, NULL, &err);
    cl_vel_gen = cl::Buffer(context, CL_MEM_WRITE_ONLY, array_size, NULL, &err);
 
    printf("Pushing data to the GPU\n");
    //push our CPU arrays to the GPU
    //data is tightly packed in std::vector starting with the adress of the first element
    #ifdef __EMSCRIPTEN__
        clSetTypePointer(CL_FLOAT);
    #endif
    err = queue.enqueueWriteBuffer(cl_velocities, CL_TRUE, 0, array_size, vel, NULL, &event);
    #ifdef __EMSCRIPTEN__
        clSetTypePointer(CL_FLOAT);
    #endif
    err = queue.enqueueWriteBuffer(cl_pos_gen, CL_TRUE, 0, array_size, pos, NULL, &event);
    #ifdef __EMSCRIPTEN__
        clSetTypePointer(CL_FLOAT);
    #endif
    err = queue.enqueueWriteBuffer(cl_vel_gen, CL_TRUE, 0, array_size, vel, NULL, &event);
    queue.finish();
}

void CL::popCorn()
{
    printf("in popCorn\n");
    //initialize our kernel from the program
    //kernel = clCreateKernel(program, "part1", &err);
    //printf("clCreateKernel: %s\n", oclErrorString(err));
    try{
        kernel = cl::Kernel(program, "part2", &err);
    }
    catch (cl::Error er) {
        printf("ERROR: %s(%s)\n", er.what(), oclErrorString(er.err()));
    }

    //set the arguements of our kernel
    try
    {
        err = kernel.setArg(0, cl_vbos[0]); //position vbo
        err = kernel.setArg(1, cl_vbos[1]); //color vbo
        err = kernel.setArg(2, cl_velocities);
        err = kernel.setArg(3, cl_pos_gen);
        err = kernel.setArg(4, cl_vel_gen);
    }
    catch (cl::Error er) {
        printf("ERROR: %s(%s)\n", er.what(), oclErrorString(er.err()));
    }
    //Wait for the command queue to finish these commands before proceeding
    queue.finish();
}



void CL::runKernel()
{
    //this will update our system by calculating new velocity and updating the positions of our particles
    //Make sure OpenGL is done using our VBOs
    glFinish();
    // map OpenGL buffer object for writing from OpenCL
    //this passes in the vector of VBO buffer objects (position and color)
    err = queue.enqueueAcquireGLObjects(&cl_vbos, NULL, &event);
    //printf("acquire: %s\n", oclErrorString(err));
    queue.finish();

    float dt = .01f;
    kernel.setArg(5, dt); //pass in the timestep
    //execute the kernel
    err = queue.enqueueNDRangeKernel(kernel, cl::NullRange, cl::NDRange(num), cl::NullRange, NULL, &event); 
    //printf("clEnqueueNDRangeKernel: %s\n", oclErrorString(err));
    queue.finish();

    //Release the VBOs so OpenGL can play with them
    err = queue.enqueueReleaseGLObjects(&cl_vbos, NULL, &event);
    //printf("release gl: %s\n", oclErrorString(err));
    queue.finish();

     // render particles
    glClear(GL_COLOR_BUFFER_BIT);

     // set MVP
    GLfloat model_view[16];
    GLfloat model_view_projection[16];
    GLfloat transform[16];
   
    identity(transform);

    perspective(ProjectionMatrix, 60.0, 800 / (float)600, 1.0, 1024.0);

    /* Translate and rotate the gear */
    memcpy(model_view, transform, sizeof (model_view));
    translate(model_view, 0, 0, -1.f);

    /* Create and set the ModelViewProjectionMatrix */
    memcpy(model_view_projection, ProjectionMatrix, sizeof(model_view_projection));
    multiply(model_view_projection, model_view);

    GLuint hMVP = glGetUniformLocation(m_program, "u_matViewProjection");



    glUniformMatrix4fv(hMVP, 1, GL_FALSE, model_view_projection);
     
    #ifdef __EMSCRIPTEN__
        glBindVertexArray(p_vao);
    #else
        glBindVertexArrayAPPLE(p_vao);
    #endif

    glDrawArrays(GL_POINTS, 0, 20000 );

    glFinish();

}


