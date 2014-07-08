//
//  PetalView.h
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-14.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#ifndef PETALVIEW
#define PETALVIEW

#include "ShaderLoader.h"
#include "ShaderPlane.h"
#include "CLParticleSystem.h"
#include "Camera.h"
#include "kazmath.h"

class PetalView
{
public:
    PetalView(int petalCount,float aspect, int use_gpu);
    ~PetalView(){}

    void update();
    void draw();

private:
    void initPetals(int use_gpu);

    ShaderPlane* bgPlane;
    unsigned int petalCount;
    Camera* camera;
    CLParticleSystem* particleSystem;
    ShaderLoader* shaderLoader;
    double xPos, yPos;
    kmVec3 lightDirection;
};

#endif
