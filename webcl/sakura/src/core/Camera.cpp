//
//  Camera.cpp
//  RayFly
//
//  Created by Kyle Halladay on 10/27/2013.
//  Copyright (c) 2013 Kyle Halladay. All rights reserved.
//

#include "Camera.h"
#include <stdio.h>

Camera::Camera(float fov, float aspectRatio, float near, float far)
{
    kmMat4Identity(&cTransform);
    kmMat4Identity(&cProjMatrix);

    kmMat4PerspectiveProjection(&cProjMatrix, fov, aspectRatio, near, far);
   // printf("");

}

void Camera::lookAt(kmVec3 lookAt)
{
    kmMat4 lookAtMatrix;
    kmMat4Identity(&lookAtMatrix);
    
    kmVec3 eye;
    kmVec3Fill(&eye,cTransform.mat[12], cTransform.mat[13], cTransform.mat[14]);
    
    kmVec3 center;
    kmVec3Fill(&center, lookAt.x, lookAt.y, lookAt.z);
    
    kmVec3 up;
    kmVec3Fill(&up, 0.0f, 1.0f, 0.0f);
    
    kmMat4LookAt(&lookAtMatrix, &eye, &center, &up);
    kmMat4Inverse(&lookAtMatrix, &lookAtMatrix);
    kmMat4Assign(&cTransform, &lookAtMatrix);

}


void Camera::translate(kmVec3 translation)
{
    kmMat4 transMatrix;
    kmMat4Translation(&transMatrix, translation.x, translation.y, translation.z);
    kmMat4Multiply(&cTransform, &cTransform, &transMatrix);
    

}

void Camera::rotate(kmQuaternion rotation)
{
    kmMat4 rot;
    kmMat4RotationQuaternion(&rot, &rotation);
    kmMat4Multiply(&cTransform, &cTransform, &rot);
    

}

void Camera::setPosition(kmVec3 position)
{
    cTransform.mat[12] = position.x;
    cTransform.mat[13] = position.y;
    cTransform.mat[14] = position.z;

}


kmVec3 Camera::getForwardVector()
{
    return KM_VEC3_NEG_Z;
}

kmVec3 Camera::getRightVector()
{
    return KM_VEC3_POS_X;
}

kmMat4 Camera::getViewProjectionMatrix()
{
    
    kmMat4Inverse(&invT, &cTransform);
    kmMat4Multiply(&cMVP, &cProjMatrix, &invT);
    
    return cMVP;
}

