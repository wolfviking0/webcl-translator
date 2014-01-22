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

#include "Solver.h"
#include "Demo.h"
#include "LorenzAttractorOpenCLSolver.h"

#include "error.h"

static Solver *instance = nullptr;

using namespace std;

Solver *Solver::get()
{
    return instance;
}

void Solver::create(Type type)
{
    if ( Demo::get() == nullptr )
        error::throw_ex("demo must be create before solver",__FILE__,__LINE__);

    switch ( type )
    {
        case LorenzAttractorOpenCL:
            instance = new LorenzAttractorOpenCLSolver();
            break;
        default:
            break;
    }

    if ( instance == nullptr )
        error::throw_ex("unable to create solver",__FILE__,__LINE__);

    instance->init();
}
