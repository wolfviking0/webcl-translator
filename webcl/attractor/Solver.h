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

#ifndef SOLVER_H_
#define SOLVER_H_

#include <vector>

class Solver
{

private:

    Solver(const Solver &) = delete;
    void operator=(const Solver &) = delete;

protected:

    Solver () {}
    virtual ~Solver () {}

public:

    static Solver *get();

    enum Type
    {
        LorenzAttractorOpenCL,
    };

    static void create(Type type);

    virtual void init() = 0;

    virtual void step(float time, float deltaTime) = 0;

    virtual void cleanup() = 0;

};


#endif
