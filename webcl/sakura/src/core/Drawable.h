//
//  Drawable.h
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-14.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#ifndef DRAWABLE
#define DRAWABLE

#include "kazmath.h"
#include <OpenGL/gl3.h>


class Drawable
{
public:
    
    Drawable();
    Drawable(kmVec3 pos, kmQuaternion rotation, kmVec3 scale, GLfloat verts[], size_t bufferSize);

    virtual ~Drawable(){}
    
    virtual void setShader(GLuint shaderHandle);
    virtual void draw(kmMat4& camMatrix);
    
    void setUniformArray(const char* uniformName, const float* values, int valueCount);
    void setMesh(char* meshResourceName);

    kmVec3 position;
    kmVec3 scale;
    kmQuaternion rotation;
    
    kmMat4 scaleMatrix;
    kmMat4 posMatrix;
    kmMat4 rotationMatrix;
    kmMat4 modelMatrix;

    
protected:
    kmMat4 vp;
    int numVerts;
    int vCount;
    GLuint vbo;
    GLuint shader;
    GLuint vao;
};

#endif
