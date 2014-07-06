//
//  ShaderPlane.h
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-07-01.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#ifndef __Sakura_GL_Toy__ShaderPlane__
#define __Sakura_GL_Toy__ShaderPlane__

#include "Drawable.h"

class ShaderPlane : public Drawable
{
public:
    ShaderPlane(char* vsName, char* fsName);
    ~ShaderPlane(){}
    
    void setShader(GLuint shader);
    void draw(kmMat4 camMatrix);
private:
    GLuint ebo;
    GLint positionAttribute;
    GLint uvAttribute;
    GLint screenSizeUniform;
};


#endif /* defined(__Sakura_GL_Toy__ShaderPlane__) */
