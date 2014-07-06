//
//  ShaderPlane.cpp
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-07-01.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#include "ShaderPlane.h"
#include "ShaderLoader.h"

#define EPSILON 0.0000001

ShaderPlane::ShaderPlane(char* vsName, char* fsName) : Drawable()
{
    //the shader is going to put this in ndc space, need to have the z
    //value just shy of far clip
    float verts[] = {
        1.0f,  1.0f, 1.0f - EPSILON, 1.0f, 0.0f, // Top-right
        -1.0f,  1.0f, 1.0f - EPSILON, 0.0f, 0.0f, // Top-left
        -1.0f, -1.0f, 1.0f - EPSILON, 1.0f, 1.0f,  // Bottom-left
        1.0f, -1.0f, 1.0f - EPSILON, 0.0f, 1.0f // Bottom-right
    };
    
    GLuint elements[] = {
        0, 1, 2,
        2, 3, 0
    };
    
    vCount = 4;
    
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(GLfloat)*vCount*5, verts, GL_STATIC_DRAW);
    
    glGenBuffers(1, &ebo);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(elements), elements, GL_STATIC_DRAW);
    
    ShaderLoader loader;
    setShader(loader.loadShaderFromResources(vsName, fsName));
    
}

void ShaderPlane::setShader(GLuint shaderHandle)
{
    shader = shaderHandle;
    positionAttribute = glGetAttribLocation(shader, "position");
    uvAttribute = glGetAttribLocation(shader, "texcoord");
    screenSizeUniform = glGetUniformLocation(shader, "screenSize");
}

void ShaderPlane::draw(kmMat4 camMatrix)
{
    glBindVertexArray(vao);
    
    glUseProgram(shader);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glEnableVertexAttribArray(positionAttribute);
    glEnableVertexAttribArray(uvAttribute);
    
    GLint screenSize[4];

    glGetIntegerv( GL_VIEWPORT, screenSize );
    glUniform2f(screenSizeUniform, screenSize[2], screenSize[3]);

    glVertexAttribPointer(positionAttribute, 3, GL_FLOAT, GL_FALSE,
                          sizeof(GLfloat)*5, 0);
    
    glEnableVertexAttribArray(uvAttribute);
    glVertexAttribPointer(uvAttribute, 2, GL_FLOAT, GL_FALSE,
                          sizeof(GLfloat)*5, (void*)(sizeof(GLfloat)*3));
    
    glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
    
    glDisableVertexAttribArray(positionAttribute);
    glDisableVertexAttribArray(uvAttribute);
}


