//
//  Drawable.cpp
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-14.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#include <stdio.h>
#include "Drawable.h"
#include "ObjParser.h"


Drawable::Drawable()
{
    position = KM_VEC3_ZERO;
    kmQuaternionFill(&rotation, 0.0, 1.0, 0.0, 0.0);
    kmVec3Fill(&scale, 1.0, 1.0, 1.0);
    
    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);
    glGenBuffers(1, &vbo);
}

Drawable::Drawable(kmVec3 pos, kmQuaternion rot, kmVec3 scl, GLfloat verts[], size_t bufferSize) : position(pos), rotation(rot), scale(scl)
{
    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);
    
    glGenBuffers(1, &vbo);
    numVerts = (int)bufferSize/sizeof(GL_FLOAT);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, bufferSize, verts, GL_STATIC_DRAW);
   
}

void Drawable::setMesh(char *meshResourceName)
{
    ObjParser parser(meshResourceName);
    
    vCount = 0;
    GLfloat* verts = parser.getObjectDataArray(vCount);
    
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(GLfloat)*vCount*6, verts, GL_STATIC_DRAW);
    
    free(verts);
    
    
}

//todo: make this more generic. for now this will serve our purposes
void Drawable::setUniformArray(const char* uniformName, const float* values, int valueCount)
{
    glUseProgram(shader);

    GLuint attr = glGetUniformLocation(shader, uniformName);
    if (valueCount == 2)
    {
        glUniform2f(attr, values[0], values[1]);
    }
    if (valueCount == 3)
    {
        glUniform3f(attr, values[0], values[1], values[2]);
    }
}

void Drawable::setShader(GLuint shaderHandle)
{
    shader = shaderHandle;
}

void Drawable::draw(kmMat4& camMatrix)
{
   
}
