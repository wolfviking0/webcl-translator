//
//  ShaderLoader.cpp
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-14.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#include "ShaderLoader.h"
#include "ResourceLoader.h"
#include <assert.h>
#include <string>
#include <vector>

GLuint ShaderLoader::loadShaderFromResources(char* vertShaderName, char* fragShaderName)
{
    GLuint linkedProgram;

    char combinedName[strlen(vertShaderName)+strlen(fragShaderName)];
    strncpy(combinedName, vertShaderName, sizeof(combinedName));
    strcat(combinedName, fragShaderName);

    linkedProgram = loadedShaders[combinedName];

    if (linkedProgram)
    {
        return linkedProgram;
    }
    ResourceLoader loader;

    const char* vFilePath = loader.getFilePathToResource(vertShaderName);
    assert(vFilePath);

    const char* fFilePath = loader.getFilePathToResource(fragShaderName);
    assert(fFilePath);

    size_t vFileLen = 0;
    const GLchar* vertSource = loader.getContentsOfResourceAtPath(vFilePath, vFileLen);

    size_t fFileLen = 0;
    const GLchar* fragSource = loader.getContentsOfResourceAtPath(fFilePath, fFileLen);

    int logLen;
    GLuint vHdl, fHdl;

    vHdl = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vHdl, 1, &vertSource, NULL);
    glCompileShader(vHdl);

    GLint res = GL_FALSE;
    glGetShaderiv( vHdl, GL_COMPILE_STATUS, &res );
    if( res == GL_FALSE ) {
        glGetShaderiv(vHdl, GL_INFO_LOG_LENGTH, &logLen);
        if ( logLen > 0 )
        {
            char error[logLen];
            glGetShaderInfoLog(vHdl, logLen, NULL, &error[0]);
            printf("glCompileShader %s : %s\n", vFilePath, error);
        }
    }

    fHdl = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fHdl, 1, &fragSource, NULL);
    glCompileShader(fHdl);

    res = GL_FALSE;
    glGetShaderiv( fHdl, GL_COMPILE_STATUS, &res );
    if( res == GL_FALSE ) {
        glGetShaderiv(fHdl, GL_INFO_LOG_LENGTH, &logLen);
        if ( logLen > 0 )
        {
            char error[logLen];
            glGetShaderInfoLog(fHdl, logLen, NULL, &error[0]);
            printf("glCompileShader %s : %s\n", fFilePath, error);
        }
    }

    linkedProgram = glCreateProgram();
    glAttachShader(linkedProgram, vHdl);
    glAttachShader(linkedProgram, fHdl);
    //glBindFragDataLocation(linkedProgram, 0, "fragCol");

    glLinkProgram(linkedProgram);

    res = GL_FALSE;
    glGetProgramiv(linkedProgram, GL_LINK_STATUS, &res);
    //if ( res == GL_FALSE )
    {
        GLint logSize;
        glGetProgramiv( linkedProgram, GL_INFO_LOG_LENGTH, &logSize );

        if (logSize > 0)
        {
            std::vector <char> shaderLog(logSize);
            GLsizei written;
            glGetProgramInfoLog(linkedProgram, logSize, &written, shaderLog.data());
            printf("%s\n",shaderLog.data());
        }

        if ( res == GL_FALSE )
        {
            glDeleteProgram(linkedProgram);
            printf("GLSL program build failed : %s : %d\n",__FILE__,__LINE__);
        }
    }

    loadedShaders[combinedName] = linkedProgram;

    return linkedProgram;
}
