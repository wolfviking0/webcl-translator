//
//  ShaderLoader.h
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-14.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#ifndef SHADERLOADER
#define SHADERLOADER

#include <GL/glew.h>

#ifndef __EMSCRIPTEN__
    #define GLFW_INCLUDE_GLU
    #include <GLFW/glfw3.h>
#else
    #define GLFW_INCLUDE_GLU
    #include <GL/glfw.h>
#endif

#include <GL/gl.h>
#include <GL/glut.h>

#include <map>

using namespace std;

class ShaderLoader
{
public:
    ShaderLoader(){}
    ~ShaderLoader(){}

    GLuint loadShaderFromResources(char* vertShaderName, char* fragShaderName);

protected:
    map<char*, GLuint> loadedShaders;

};

#endif
