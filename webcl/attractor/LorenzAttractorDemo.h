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

#ifndef LORENZATTRACTORDEMO_H_
#define LORENZATTRACTORDEMO_H_

#include "Demo.h"
#include <vector>

class LorenzAttractorDemo: public Demo
{
    friend void Demo::create(Type type);

    GLuint m_vboPos;
    GLuint m_vboColor;
    GLuint m_vaoParticles;
    GLuint m_program;

    std::vector<GLuint> m_fbo;
    std::vector<GLuint> m_tex;

    GLuint m_vaoScreen;

    LorenzAttractorDemo();
    ~LorenzAttractorDemo();

public:
    virtual void render(float simTime) override;

    virtual void update() override;

    virtual void init() override;
};

#endif
