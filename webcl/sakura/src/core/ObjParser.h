//
//  ObjParser.h
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-14.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#ifndef OBJPARSER
#define OBJPARSER

#include <GL/gl.h>
#include <GL/glut.h>

class ObjParser
{
    typedef struct
    {
        GLuint vert;
        GLuint normal;
    }Index;

public:
    ObjParser(char* objFileName);
    ~ObjParser(){}

    GLfloat* getObjectDataArray(int& count);

private:
    Index* getIndexArray(int& count);
    GLfloat* getVertexArray(int& count);
    GLfloat* getNormalsArray(int& count);

    char* fileContents;
};

#endif
