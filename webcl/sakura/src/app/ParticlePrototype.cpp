//
//  PetalParticle.cpp
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-24.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#include "ParticlePrototype.h"

ParticlePrototype::ParticlePrototype() : Drawable()
{
    kmVec3Fill(&scale, 0.2,0.2,0.2);
    kmQuaternionFill(&rotation, 1.0, 0.0, 0.0, 0.0);
}

void ParticlePrototype::setShader(GLuint shaderHandle)
{
    shader = shaderHandle;
    mvpAttribute = glGetUniformLocation(shader, "MVP");
    transformAttribute = glGetAttribLocation(shader, "normal");
    positionAttribute = glGetAttribLocation(shader, "position");
    modelAttribute = glGetUniformLocation(shader,"modelMatrix");
    lightDirAttribute = glGetUniformLocation(shader, "worldLightPos");
}

void ParticlePrototype::draw(kmMat4 camMatrix, kmMat4 transform, kmVec3 lightDir)
{
    glBindVertexArray(vao);
    
    kmMat4 mvp;
    kmMat4Identity(&mvp);
    kmMat4Multiply(&mvp, &camMatrix, &transform);
    _transform = transform;
    
    glUseProgram(shader);
    glUniformMatrix4fv(mvpAttribute, 1, GL_FALSE, &mvp.mat[0]);
    glUniformMatrix4fv(modelAttribute, 1, GL_FALSE, &transform.mat[0]);
    glUniform3f(lightDirAttribute, lightDir.x, lightDir.y, lightDir.z);
    
    glEnableVertexAttribArray(positionAttribute);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    
    glVertexAttribPointer(positionAttribute, 3, GL_FLOAT, GL_FALSE,
                          sizeof(GLfloat)*6, 0);
    
    glEnableVertexAttribArray(transformAttribute);
    glVertexAttribPointer(transformAttribute, 3, GL_FLOAT, GL_FALSE,
                          sizeof(GLfloat)*6, (void*)(sizeof(GLfloat)*3));
    
    glDrawArrays(GL_TRIANGLES, 0, vCount);
    
    glDisableVertexAttribArray(positionAttribute);
    glDisableVertexAttribArray(transformAttribute);

}

void ParticlePrototype::draw(kmMat4& camMatrix)
{
    glBindVertexArray(vao);
    
    kmMat4 mvp;
    kmMat4Identity(&mvp);
    kmMat4Multiply(&mvp, &camMatrix, &_transform);
    
    glUseProgram(shader);
    glUniformMatrix4fv(mvpAttribute, 1, GL_FALSE, &mvp.mat[0]);
    
    glEnableVertexAttribArray(positionAttribute);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    
    glVertexAttribPointer(positionAttribute, 3, GL_FLOAT, GL_FALSE,
                          sizeof(GLfloat)*6, 0);
    
    glEnableVertexAttribArray(transformAttribute);
    glVertexAttribPointer(transformAttribute, 3, GL_FLOAT, GL_FALSE,
                          sizeof(GLfloat)*6, (void*)(sizeof(GLfloat)*3));
    
    glDrawArrays(GL_TRIANGLES, 0, vCount);
    
    glDisableVertexAttribArray(positionAttribute);
    glDisableVertexAttribArray(transformAttribute);
}
