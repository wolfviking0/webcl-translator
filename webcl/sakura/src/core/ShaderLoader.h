//
//  ShaderLoader.h
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-14.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#ifndef SHADERLOADER
#define SHADERLOADER

#include <OpenGL/gl3.h>
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