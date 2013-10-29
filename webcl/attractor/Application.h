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

#ifndef APPLICATION_H_
#define APPLICATION_H_

class Application
{

protected:

    float m_cursorX;
    float m_cursorY;

    float m_simTime;
    float m_simDeltaTime;

    float m_eyeDist;
    
private:

    Application();
    virtual ~Application();

    Application(const Application &) = delete;
    void operator=(const Application &) = delete;

    void setupLorenzAttractor();

public:

    static Application *get();

    enum Type
    {
        appParticlesDemo,
    };

    static void create(Type type);

    void init ();
    void run ();
    void zoomIn ();
    void zoomOut ();

    float getRealTime();
    float getSimTime();

};

#endif
