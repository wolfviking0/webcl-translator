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

#include <iostream>

#include "global.h"
#include "Application.h"

using namespace std;


int main(int argc, char *argv[])
{
    global::par().setString("windowTitle","Demo AT");

/*
    global::par().enable("export");
    global::par().setString("exportFilename","/media/ext4-data/No-Backup/opengl-export/1.avi");
    global::par().setInt("exportStartFrame",100);
    global::par().setInt("simulationEndFrame",6000);
*/
        // Parse command line options
    //
    int use_gpu = 1;
    int use_interop = 0;
    int use_filter = 0;
    
    for(int i = 0; i < argc && argv; i++)
    {
        if(!argv[i])
            continue;
          
        if(strstr(argv[i], "cpu"))
            use_gpu = 0;        

        else if(strstr(argv[i], "gpu"))
            use_gpu = 1;
      
        else if(strstr(argv[i], "interop"))
            use_interop = 1;
    }

    printf("Parameter detect %s device\n",use_gpu==1?"GPU":"CPU");

    global::par().setInt("gpuDevice",use_gpu);
    
    if (use_interop == 1)
      global::par().enable("CL_GL_interop");
    else
      global::par().disable("CL_GL_interop");

    if (use_filter == 1)
      global::par().enable("filtering");
    else
      global::par().disable("filtering");


    Application *app = Application::get();
    if ( app == nullptr )
    {
        cerr << "ERROR: failed to create application" << endl;
        exit( EXIT_FAILURE );
    }

    try
    {
        app->run();
    }
    catch(const exception &e)
    {
        cerr << "ERROR: " << e.what() << endl;
        exit( EXIT_FAILURE );
    }
    catch(...)
    {
        cerr << "ERROR: unknown exception" << endl;
        exit( EXIT_FAILURE );
    }

    return 0;
}




