//
//  Camera.h
//  RayFly
//
//  Created by Kyle Halladay on 10/27/2013.
//  Copyright (c) 2013 Kyle Halladay. All rights reserved.
//

#ifndef __KDTreeSandbox__Camera__
#define __KDTreeSandbox__Camera__

#include "kazmath.h"

class Camera
{
    
public:
    Camera(float fov, float aspectRatio, float near, float far);
    Camera();
    ~Camera(){}
    
    float minMaxVerticalAngle;
    
    kmVec3 getForwardVector();
    kmVec3 getRightVector();
    void translate(kmVec3 translation);
    void rotate(kmQuaternion rotation);
    void setPosition(kmVec3 position);
    void setRotation(kmQuaternion rotation);
    
    void lookAt(kmVec3 lookAt);
    
    kmMat4 getViewProjectionMatrix();
    
private:
    kmMat4 cTransform;
    kmMat4 cProjMatrix;
    
    kmMat4 cMVP;
    kmMat4 invT;
};


#endif /* defined(__RayFly__Camera__) */
