//
//  PetalParticle.h
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-24.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#ifndef __Sakura_GL_Toy__PetalParticle__
#define __Sakura_GL_Toy__PetalParticle__

#include "kazmath.h"
#include "Drawable.h"

class ParticlePrototype : public Drawable
{
public:
    ParticlePrototype();
    ~ParticlePrototype(){}
    
    void setShader(GLuint shader);
    void draw(kmMat4 camMatrix, kmMat4 transform, kmVec3 lightDir);
    void draw(kmMat4& camMatrix);
    
private:
    kmMat4 _transform;
    
    GLint mvpAttribute;
    GLint transformAttribute;
    GLint positionAttribute;
    GLint modelAttribute;
    GLint lightDirAttribute;
};

#endif /* defined(__Sakura_GL_Toy__PetalParticle__) */
