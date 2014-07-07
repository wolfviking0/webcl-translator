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
    GLint Result = GL_FALSE;
    GLuint vHdl, fHdl;

    vHdl = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vHdl, 1, &vertSource, NULL);
    glCompileShader(vHdl);

    glGetShaderiv(vHdl, GL_COMPILE_STATUS, &Result);
    glGetShaderiv(vHdl, GL_INFO_LOG_LENGTH, &logLen);
    if ( logLen > 0 )
    {
        char error[logLen];
        glGetShaderInfoLog(vHdl, logLen, NULL, &error[0]);
        printf("%s\n", error);
    }

    fHdl = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fHdl, 1, &fragSource, NULL);
    glCompileShader(fHdl);

    glGetShaderiv(fHdl, GL_COMPILE_STATUS, &Result);
    glGetShaderiv(fHdl, GL_INFO_LOG_LENGTH, &logLen);
    if ( logLen > 0 )
    {
        char error[logLen];
        glGetShaderInfoLog(fHdl, logLen, NULL, &error[0]);
        printf("%s\n", error);
    }

    linkedProgram = glCreateProgram();
    glAttachShader(linkedProgram, vHdl);
    glAttachShader(linkedProgram, fHdl);
    glBindFragDataLocation(linkedProgram, 0, "fragCol");

    glLinkProgram(linkedProgram);


    glGetProgramiv(linkedProgram, GL_LINK_STATUS, &Result);
    glGetProgramiv(linkedProgram, GL_INFO_LOG_LENGTH, &logLen);
    if ( logLen > 0 )
    {
        char error[logLen];
        glGetShaderInfoLog(vHdl, logLen, NULL, &error[0]);
        printf("%s\n", error);
    }

    loadedShaders[combinedName] = linkedProgram;

    return linkedProgram;
}
