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

#ifndef DEMO_H_
#define DEMO_H_

class Demo
{

private:

    Demo(const Demo &) = delete;
    void operator=(const Demo &) = delete;

protected:

    Demo() {}
    virtual ~Demo() {}

public:

    static Demo *get();

    enum Type
    {
        LorenzAttractor,
    };

    static void create(Type type);

    virtual void render(float simTime) = 0;
    virtual void update() = 0;
    virtual void init() = 0;
    virtual void resizeWindow(int width, int height) = 0;
};

#endif
