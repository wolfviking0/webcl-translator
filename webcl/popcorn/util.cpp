#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string>
#include <string.h>
#include <iostream>
#include <fstream>
#include <sstream>

//OpenGL stuff
#include <GL/glew.h>

#include "cll.h"
#include "util.h"

GLuint compileShader( const char* fname, GLenum type )
{
    std::string filename(fname);

    std::ifstream file(filename.c_str());
    if(!file.is_open())
    {
        std::string str("unable to open shader file ");
        str += filename;
        printf("%s\n",str.c_str());
    }

    GLuint shader = glCreateShader(type);
    if (!shader)
        printf("unable to create shader object\n");

    std::stringstream ss;
    ss << file.rdbuf();
    file.close();

    std::string strSrc = ss.str();

    const GLchar* charSrc[] = {strSrc.c_str()};

    glShaderSource(shader, 1, charSrc, NULL);

    glCompileShader( shader );

    GLint res;
    glGetShaderiv( shader, GL_COMPILE_STATUS, &res );
    if( res == GL_FALSE )
    {
        glDeleteShader(shader);

        std::string str("failed to compile shader ");
        str += filename;
        printf("%s\n",str.c_str());

    }

    return shader;
}

GLuint createVBO(const void* data, int dataSize, GLenum target, GLenum usage)
{
    GLuint id = 0;  // 0 is reserved, glGenBuffersARB() will return non-zero id if success

    glGenBuffers(1, &id);                        // create a vbo
    glBindBuffer(target, id);                    // activate vbo id to use
    glBufferData(target, dataSize, data, usage); // upload data to video card

    // check data size in VBO is same as input array, if not return 0 and delete VBO
    int bufferSize = 0;
    glGetBufferParameteriv(target, GL_BUFFER_SIZE, &bufferSize);
    if(dataSize != bufferSize)
    {
        glDeleteBuffers(1, &id);
        id = 0;
        //cout << "[createVBO()] Data size is mismatch with input array\n";
        printf("[createVBO()] Data size is mismatch with input array\n");
    }
    //this was important for working inside blender!
    glBindBuffer(target, 0);
    return id;      // return VBO id
}



// Helper function to get error string
// *********************************************************************
const char* oclErrorString(cl_int error)
{
    static const char* errorString[] = {
        "CL_SUCCESS",
        "CL_DEVICE_NOT_FOUND",
        "CL_DEVICE_NOT_AVAILABLE",
        "CL_COMPILER_NOT_AVAILABLE",
        "CL_MEM_OBJECT_ALLOCATION_FAILURE",
        "CL_OUT_OF_RESOURCES",
        "CL_OUT_OF_HOST_MEMORY",
        "CL_PROFILING_INFO_NOT_AVAILABLE",
        "CL_MEM_COPY_OVERLAP",
        "CL_IMAGE_FORMAT_MISMATCH",
        "CL_IMAGE_FORMAT_NOT_SUPPORTED",
        "CL_BUILD_PROGRAM_FAILURE",
        "CL_MAP_FAILURE",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "CL_INVALID_VALUE",
        "CL_INVALID_DEVICE_TYPE",
        "CL_INVALID_PLATFORM",
        "CL_INVALID_DEVICE",
        "CL_INVALID_CONTEXT",
        "CL_INVALID_QUEUE_PROPERTIES",
        "CL_INVALID_COMMAND_QUEUE",
        "CL_INVALID_HOST_PTR",
        "CL_INVALID_MEM_OBJECT",
        "CL_INVALID_IMAGE_FORMAT_DESCRIPTOR",
        "CL_INVALID_IMAGE_SIZE",
        "CL_INVALID_SAMPLER",
        "CL_INVALID_BINARY",
        "CL_INVALID_BUILD_OPTIONS",
        "CL_INVALID_PROGRAM",
        "CL_INVALID_PROGRAM_EXECUTABLE",
        "CL_INVALID_KERNEL_NAME",
        "CL_INVALID_KERNEL_DEFINITION",
        "CL_INVALID_KERNEL",
        "CL_INVALID_ARG_INDEX",
        "CL_INVALID_ARG_VALUE",
        "CL_INVALID_ARG_SIZE",
        "CL_INVALID_KERNEL_ARGS",
        "CL_INVALID_WORK_DIMENSION",
        "CL_INVALID_WORK_GROUP_SIZE",
        "CL_INVALID_WORK_ITEM_SIZE",
        "CL_INVALID_GLOBAL_OFFSET",
        "CL_INVALID_EVENT_WAIT_LIST",
        "CL_INVALID_EVENT",
        "CL_INVALID_OPERATION",
        "CL_INVALID_GL_OBJECT",
        "CL_INVALID_BUFFER_SIZE",
        "CL_INVALID_MIP_LEVEL",
        "CL_INVALID_GLOBAL_WORK_SIZE",
    };

    const int errorCount = sizeof(errorString) / sizeof(errorString[0]);

    const int index = -error;

    return (index >= 0 && index < errorCount) ? errorString[index] : "";

}

