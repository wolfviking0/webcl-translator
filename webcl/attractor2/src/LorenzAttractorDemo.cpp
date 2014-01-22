// Copyright (c) 2013 Andrey Tuganov
//
// The zlib/libpng license
//
// This software is provided 'as-is', without any express or implied warranty. In no event will the authors be held liable for any damages arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose, including commercial applications, and to alter it and redistribute it freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
//
// 2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
//
// 3. This notice may not be removed or altered from any source distribution.

#include "gltools.h"

#include <iostream>
#include <string>
#include <vector>

#include <glm/gtc/matrix_transform.hpp>
//#include <glm/gtx/color_space.hpp>

#include "LorenzAttractorDemo.h"
#include "Application.h"
#include "global.h"
#include "error.h"

using namespace std;

LorenzAttractorDemo::LorenzAttractorDemo() : Demo ()
{
    m_program = 0;
    m_vboPos = 0;
    m_vboColor = 0;
    m_vaoParticles = 0;
    m_vaoScreen = 0;
}

LorenzAttractorDemo::~LorenzAttractorDemo()
{
}

void LorenzAttractorDemo::init()
{
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // read and compile shaders, push them into the container
    gltools::ShaderContainer shaders;


    shaders.push_back( gltools::compileShader(global::par().getString("vertexShaderFilename"), GL_VERTEX_SHADER) );
    shaders.push_back( gltools::compileShader(global::par().getString("fragmentShaderFilename"), GL_FRAGMENT_SHADER) );

    string geometryShaderFilename (global::par().getString("geometryShaderFilename"));
    if ( !geometryShaderFilename.empty() )
        shaders.push_back( gltools::compileShader(geometryShaderFilename, GL_GEOMETRY_SHADER) );

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // build shader program

    m_program = glCreateProgram();
    if ( !m_program )
        error::throw_ex("unable to create GLSL program",__FILE__,__LINE__);

    glBindAttribLocation(m_program, 0, "vertexPos");
    glBindAttribLocation(m_program, 1, "vertexColor");
    glBindAttribLocation(m_program, 2, "vertexTexCoord");

    for ( auto it = shaders.cbegin(); it != shaders.cend(); ++it )
        glAttachShader(m_program, *it);

    glLinkProgram(m_program);

    GLint res;
    glGetProgramiv(m_program, GL_LINK_STATUS, &res);
    //if ( res == GL_FALSE )
    {
        GLint logSize;
        glGetProgramiv( m_program, GL_INFO_LOG_LENGTH, &logSize );

        if (logSize > 0)
        {
            vector <char> shaderLog(logSize);
            GLsizei written;
            glGetProgramInfoLog(m_program, logSize, &written, shaderLog.data());
            cerr << shaderLog.data() << endl;
        }

        if ( res == GL_FALSE )
        {
            glDeleteProgram(m_program);
            error::throw_ex("GLSL program build failed",__FILE__,__LINE__);
        }
    }

    glUseProgram(m_program);

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // create VBOs

    int nParticles = global::par().getInt("nParticles");

    glGenBuffers(1, &m_vboPos);
    glBindBuffer(GL_ARRAY_BUFFER, m_vboPos);
    glBufferData(GL_ARRAY_BUFFER, nParticles*4*sizeof(float), global::par().getPtr("pos"), GL_DYNAMIC_DRAW);

    glGenBuffers(1, &m_vboColor);
    glBindBuffer(GL_ARRAY_BUFFER, m_vboColor);
    glBufferData(GL_ARRAY_BUFFER, nParticles*4*sizeof(float), global::par().getPtr("color"), GL_DYNAMIC_DRAW);

    glGenVertexArrays( 1, &m_vaoParticles );
    glBindVertexArray(m_vaoParticles);

    glEnableVertexAttribArray(0);
    glEnableVertexAttribArray(1);

    glBindBuffer(GL_ARRAY_BUFFER, m_vboPos);
    glVertexAttribPointer( 0, 4, GL_FLOAT, GL_FALSE, 0, nullptr );

    glBindBuffer(GL_ARRAY_BUFFER, m_vboColor);
    glVertexAttribPointer( 1, 4, GL_FLOAT, GL_FALSE, 0, nullptr );

    // let the solver know the handles for interoperation
    if ( global::par().isEnabled("CL_GL_interop") )
    {
        global::par().setGLuint("vboPos",m_vboPos);
        global::par().setGLuint("vboColor",m_vboColor);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // init frame buffers for filtering

    int nFrameBuffers = global::par().isEnabled("filtering") ? 3 : 0;
    m_fbo.resize(nFrameBuffers+1);
    m_tex.resize(nFrameBuffers);
    m_fbo.back() = 0;

    int windowWidth = -1, windowHeight = -1;
    Application::get()->getWindowSize(windowWidth, windowHeight);

    if ( nFrameBuffers )
    {
        glGenFramebuffers(nFrameBuffers, m_fbo.data());

        glGenTextures(nFrameBuffers, m_tex.data());

        for( int i = 0; i < nFrameBuffers; ++i )
        {
            glBindFramebuffer(GL_FRAMEBUFFER, m_fbo[i]);

            if ( i > 0 )
                glActiveTexture(GL_TEXTURE0);

            glBindTexture(GL_TEXTURE_2D, m_tex[i]);
            glTexImage2D(GL_TEXTURE_2D,0,GL_RGBA,windowWidth,windowHeight,0,GL_RGBA,GL_UNSIGNED_BYTE,NULL);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
            glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
            glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, m_tex[i], 0);
            GLenum drawBuffers[] = {GL_COLOR_ATTACHMENT0};
            glDrawBuffers(1, drawBuffers);
        }
        glBindFramebuffer(GL_FRAMEBUFFER, 0);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // setup a fullscreen billboard for filtering

    if ( nFrameBuffers )
    {
        GLfloat verts[] = {    -1.0f, -1.0f, 0.0f, 1.0f, -1.0f, 0.0f, 1.0f, 1.0f, 0.0f,
                            -1.0f, -1.0f, 0.0f, 1.0f, 1.0f, 0.0f, -1.0f, 1.0f, 0.0f    };

        GLfloat tex_coords[] = { 0.0f, 0.0f, 1.0f, 0.0f, 1.0f, 1.0f,
                                 0.0f, 0.0f, 1.0f, 1.0f, 0.0f, 1.0f    };

        GLuint vbo[2];
        glGenBuffers(2, vbo);

        glBindBuffer(GL_ARRAY_BUFFER, vbo[0]);
        glBufferData(GL_ARRAY_BUFFER, 6*3*sizeof(float), verts, GL_STATIC_DRAW);

        glBindBuffer(GL_ARRAY_BUFFER, vbo[1]);
        glBufferData(GL_ARRAY_BUFFER, 6*2* sizeof(float), tex_coords, GL_STATIC_DRAW);

        glGenVertexArrays( 1, &m_vaoScreen );
        glBindVertexArray(m_vaoScreen);

        glBindBuffer(GL_ARRAY_BUFFER, vbo[0]);
        glVertexAttribPointer( 0, 3, GL_FLOAT, GL_FALSE, 0, nullptr );
        glEnableVertexAttribArray(0);

        glBindBuffer(GL_ARRAY_BUFFER, vbo[1]);
        glVertexAttribPointer( 2, 2, GL_FLOAT, GL_FALSE, 0, nullptr );
        glEnableVertexAttribArray(2);

        glBindVertexArray(0);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    // enable blending

    glEnable(GL_BLEND);
    glBlendFuncSeparate(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA,GL_ONE,GL_ONE_MINUS_SRC_ALPHA);

}

void LorenzAttractorDemo::resizeWindow(int width, int height)
{
    for( int i = 0; i < m_tex.size(); ++i )
    {
        glBindTexture(GL_TEXTURE_2D, m_tex[i]);
        glTexImage2D(GL_TEXTURE_2D,0,GL_RGBA,width,height,0,GL_RGBA,GL_UNSIGNED_BYTE,NULL);
    }
}

void LorenzAttractorDemo::render(float simTime)
{
    int nParticles = global::par().getInt("nParticles");
    int windowWidth = -1, windowHeight = -1;
    Application::get()->getWindowSize(windowWidth, windowHeight);
    float aspectRatio = float(windowWidth)/float(windowHeight);

    // set uniforms
    GLuint hTime = glGetUniformLocation(m_program, "time");
    glUniform1f(hTime,simTime);

    GLuint hMVP = glGetUniformLocation(m_program, "MVP");
    GLuint hTask = glGetUniformLocation(m_program, "task");

    // set MVP

    float eyeDist = 100.f;
    float eyeAzimuth = simTime*0.4f;
    float eyeZ = 25.f;
    glm::vec3 eye(eyeDist*cos(eyeAzimuth),eyeDist*sin(eyeAzimuth),eyeZ);
    //glm::vec3 eye(eyeDist,0.f,0.f);

    glm::mat4 identityMatrix = glm::mat4(1.f);

    glm::mat4 M = glm::mat4(1.f);
    glm::mat4 V  = glm::lookAt(eye, glm::vec3(0.f,0.f,eyeZ), glm::vec3(0.f,0.f,1.f) );
    glm::mat4 P = glm::perspective(25.f, aspectRatio, 10.f, 200.0f);
    glm::mat4 MVP = P*V*M;

    // set cursor ray
    float cursorX = 0.f, cursorY = 0.f;
    Application::get()->getCursorPos01(cursorX, cursorY);
    cursorX = cursorX*2.f-1.f;
    cursorY = 1.f-cursorY*2.f;
    glm::vec4 rayFront(cursorX,cursorY,-1.f,1.f);
    glm::vec4 rayBack(cursorX,cursorY,1.f,1.f);
    glm::mat4 invMVP = glm::inverse(MVP);
    rayFront = invMVP*rayFront;
    rayBack = invMVP*rayBack;
    rayFront = rayFront/rayFront.w;
    rayBack = rayBack/rayBack.w;
    glm::vec4 rayDir = glm::normalize(rayBack-rayFront);
    Application::get()->setCursorRay(&rayFront.x,&rayDir.x);

    //float hue = 180.f*(1.f+sin(time*0.1f));
    //glm::vec3 color = glm::rgbColor(glm::vec3(hue,1.f,1.f));
    //loc = glGetUniformLocation(m_program, "color");
    //glUniform3fv(loc, 1, &color[0]);

    GLuint hWindowWidth = glGetUniformLocation(m_program, "windowWidth");
    glUniform1f(hWindowWidth,float(windowWidth));

    GLuint hWindowHeight = glGetUniformLocation(m_program, "windowHeight");
    glUniform1f(hWindowHeight,float(windowHeight));

    // render particles
    glBindFramebuffer(GL_FRAMEBUFFER, m_fbo[0]);
    glClear(GL_COLOR_BUFFER_BIT);
    glUniform1i(hTask,0);
    glUniformMatrix4fv(hMVP, 1, GL_FALSE, &MVP[0][0]);
    glBindVertexArray(m_vaoParticles);
    glPointSize(1.f);
    glDrawArrays(GL_POINTS, 0, nParticles );

    glFinish();

    // apply filters
    for ( int i = 1; i < (int)m_fbo.size(); ++i )
    {
        glBindFramebuffer(GL_FRAMEBUFFER, m_fbo[i]);
        glActiveTexture(GL_TEXTURE0);
        glBindTexture(GL_TEXTURE_2D, m_tex[i-1]);
        glClear(GL_COLOR_BUFFER_BIT);
        glUniform1i(hTask,i);
        glUniformMatrix4fv(hMVP, 1, GL_FALSE, &identityMatrix[0][0]);
        glBindVertexArray(m_vaoScreen);
        glDrawArrays(GL_TRIANGLES, 0, 6);
        glFinish();
    }
}

void LorenzAttractorDemo::update()
{
    // update particles in case of no interop (slow)
    bool bInterop = global::par().isEnabled("CL_GL_interop");
    if ( !bInterop )
    {
        glBindBuffer(GL_ARRAY_BUFFER, m_vboPos);
        glBufferSubData(GL_ARRAY_BUFFER, 0, global::par().getInt("nParticles")*4*sizeof(float), global::par().getPtr("pos"));

        glBindBuffer(GL_ARRAY_BUFFER, m_vboColor);
        glBufferSubData(GL_ARRAY_BUFFER, 0, global::par().getInt("nParticles")*4*sizeof(float), global::par().getPtr("color"));
    }
}
