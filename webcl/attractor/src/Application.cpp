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
#include <cstring>
#include <memory>

#include "Application.h"
#include "LorenzAttractorDemo.h"
#include "Solver.h"
#include "Demo.h"

#ifdef USE_FRAME_CAPTOR
	#include "FrameCaptor.h"
#endif

#ifdef __EMSCRIPTEN__
	#include <emscripten/emscripten.h>
#endif

#include "global.h"
#include "error.h"

using namespace std;

static Application *instance = nullptr;

Application *Application::get()
{
    if(!instance)
    {
        instance = new Application();
        instance->init();
    }

    return instance;
}

Application::Application()
{
    m_window = nullptr;
    m_simTime = 0.f;
    m_simDeltaTime = 0.f;
    m_cursorX = 0.f;
    m_cursorY = 0.f;
}

Application::~Application()
{
    if ( m_window )
    {	
		#ifndef __EMSCRIPTEN__
	        glfwDestroyWindow(m_window);
	    #else
		    glfwCloseWindow();
	    #endif
        m_window = nullptr;
    }
}

void error_callback(int error, const char* description)
{
    error::throw_ex(description);
}

#ifndef __EMSCRIPTEN__

void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
    if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
        glfwSetWindowShouldClose(window, GL_TRUE);
}

void cursor_pos_callback(GLFWwindow* window, double dx,double dy)
{
    if (Application::get())
        Application::get()->setCursorPos(float(dx),float(dy));
}

void framebuffer_size_callback(GLFWwindow* window, int width, int height)
{
    if (Application::get())
        Application::get()->resizeWindow(width, height);

}

#else

bool bFullScreen;

void key_callback(int key, int action)
{
    if ((key == 255 /*ESC*/ || key == 81 /*q*/ ) && action == GLFW_PRESS) {
        glViewport(0, 0, 0, 0);
        glfwCloseWindow();
		glfwTerminate();
        //
        emscripten_cancel_main_loop();  
        //
        exit(0);
    } else if (key == 32 /* */ && action == GLFW_PRESS) {

    } else if (key == 70 /*f*/ && action == GLFW_PRESS) {
        bFullScreen = !bFullScreen;
        if (bFullScreen)
        {
            glfwOpenWindow( 512, 512, 8, 8, 8, 0, 0, 0, GLFW_FULLSCREEN);
        } else {
            glfwOpenWindow( 512, 512, 8, 8, 8, 0, 0, 0, GLFW_WINDOW);
        }
    }
}

void cursor_pos_callback(int dx,int dy)
{
    if (Application::get())
        Application::get()->setCursorPos(float(dx),float(dy));
}

void framebuffer_size_callback(int width, int height)
{
    if (Application::get())
    	Application::get()->resizeWindow(width, height);

}

#endif

void Application::resizeWindow(int width, int height)
{
    glViewport(0, 0, width, height);
    //Demo::get()->resizeWindow(width, height);
}

void Application::init()
{
    // initialize GLFW and create window, setup callbacks
	#ifndef __EMSCRIPTEN__
	    glfwSetErrorCallback(error_callback);
	#endif
	
    if( !glfwInit() )
        error::throw_ex("unable to initialize GLFW",__FILE__,__LINE__);

    int windowWidth = 512;
    int windowHeight = 512;
    string windowTitle = global::par().getString("windowTitle");

	#ifndef __EMSCRIPTEN__
    	m_window = glfwCreateWindow(windowWidth, windowHeight, windowTitle.c_str(), nullptr, nullptr);
    	if( !m_window ) {
	#else
		int b_window = glfwOpenWindow( windowWidth, windowHeight, 8,8,8,0,0,0, GLFW_WINDOW);
	    glfwSetWindowTitle(windowTitle.c_str());
	    if( !b_window ) {
    #endif    
       
       	glfwTerminate();
        error::throw_ex("unable to create GLFW window",__FILE__,__LINE__);
    }
    
	#ifndef __EMSCRIPTEN__
	    glfwMakeContextCurrent(m_window);
	#endif
	
    if ( glewInit() != GLEW_OK )
        error::throw_ex("unable to initialize GLEW",__FILE__,__LINE__);

	#ifndef __EMSCRIPTEN__
	    glfwSetKeyCallback(m_window,key_callback);
	    glfwSetCursorPosCallback(m_window, cursor_pos_callback);
    	glfwSetFramebufferSizeCallback(m_window,framebuffer_size_callback);
	#else
		glfwSetKeyCallback(key_callback);
	    glfwSetMousePosCallback(cursor_pos_callback);
	    glfwSetWindowSizeCallback(framebuffer_size_callback);
	#endif
	
    glViewport(0, 0, windowWidth, windowHeight);
}

#ifdef __EMSCRIPTEN__

// Global
int framesLastSecond = 0;
int lastSecond = 0;
int curFrame = 0;
    
void emscripten_loop_callback()
{
    if (Application::get())
        Application::get()->mainLoop();
}

void Application::run()
{
    setupLorenzAttractor();
    
    emscripten_set_main_loop(emscripten_loop_callback,-1,0);
    
}

void Application::mainLoop()
{
	float realTime = getRealTime();
    
    ++framesLastSecond;
    if ( lastSecond != (int)realTime )
    {
        lastSecond = (int)realTime;
        printf("[%s] Particles: %d  Display: %d fps (%s%s)\n",
            (global::par().getInt("gpuDevice")) ? "GPU" : "CPU", global::par().getInt("nParticles"),
            framesLastSecond, global::par().isEnabled("CL_GL_interop") ? "attached" : "copying",global::par().isEnabled("filtering") ? "&filter" : "");
        framesLastSecond = 0;
    }

    // render and swap buffers
    Demo::get()->render(m_simTime);
	
	glfwSwapBuffers();

    // step simulation
    Solver::get()->step(m_simTime,m_simDeltaTime);

    // exchanges information between solver and renderer if not already shared
    Demo::get()->update();

    // process UI events
    glfwPollEvents();

    m_simTime += m_simDeltaTime;

	++curFrame;
}
    
#else

void Application::run()
{
    setupLorenzAttractor();

    mainLoop();
	
	#ifndef __EMSCRIPTEN__
	   glfwDestroyWindow(m_window);
	#else
	   glfwCloseWindow();
	#endif
	
    m_window = nullptr;

	glfwTerminate();

}

void Application::mainLoop()
{
    int framesLastSecond = 0;
    int lastSecond = 0;

    int curFrame = 0;

	#ifdef USE_FRAME_CAPTOR
    	int exportStartFrame = global::par().getInt("exportStartFrame");
	    int simulationEndFrame = global::par().getInt("simulationEndFrame");
	#endif
	
    while (!glfwWindowShouldClose(m_window))
    {
        float realTime = getRealTime();
        ++framesLastSecond;
        if ( lastSecond != (int)realTime )
        {
            lastSecond = (int)realTime;
            cout << "FPS: " << framesLastSecond << endl;
            framesLastSecond = 0;
        }

        // render and swap buffers
        Demo::get()->render(m_simTime);
	
		glfwSwapBuffers(m_window);

        // export the rendered frame
        #ifdef USE_FRAME_CAPTOR
        if ( FrameCaptor::get() && curFrame >= exportStartFrame )
            FrameCaptor::get()->capture();
		#endif
		
        #ifdef USE_FRAME_CAPTOR
        // check if we should stop the simulation
        if ( simulationEndFrame && curFrame == simulationEndFrame )
            break;
        #endif

        // step simulation
        Solver::get()->step(m_simTime,m_simDeltaTime);

        // exchanges information between solver and renderer if not already shared
        Demo::get()->update();

        // process UI events
        glfwPollEvents();

        m_simTime += m_simDeltaTime;

        ++curFrame;

        //if ( curFrame%20 == 0 )
        //    cout << "simTime: " << m_simTime << endl;
    }

	#ifdef USE_FRAME_CAPTOR
    if ( FrameCaptor::get() )
        FrameCaptor::get()->release();
    #endif
}

#endif

void Application::getWindowSize(int &width, int &height) const
{
	#ifndef __EMSCRIPTEN__
		glfwGetWindowSize(m_window, &width, &height);
	#else
		glfwGetWindowSize(&width, &height);
	#endif
}

void Application::setCursorPos(float x, float y)
{
    m_cursorX = x;
    m_cursorY = y;
}

void Application::getCursorPos(float &x, float &y) const
{
    x = m_cursorX;
    y = m_cursorY;
}

void Application::getCursorPos01(float &x, float &y) const
{
    int width = -1, height = -1;
    getWindowSize(width, height);
    x = m_cursorX/float(width);
    y = m_cursorY/float(height);
}

void Application::setCursorRay(float *origin, float *dir)
{
    memcpy(m_cursorRayOrigin,origin,4*sizeof(float));
    memcpy(m_cursorRayDir,dir,4*sizeof(float));
}

void Application::getCursorRay(float *origin, float *dir) const
{
    memcpy(origin,m_cursorRayOrigin,4*sizeof(float));
    memcpy(dir,m_cursorRayDir,4*sizeof(float));
}

float Application::getRealTime()
{
    return glfwGetTime();
}

float Application::getSimTime()
{
    return m_simTime;
}

void Application::setupLorenzAttractor()
{
    m_simTime = 0.f;
    m_simDeltaTime = 1.f/60.f;

    int nX = 128;
    int nY = 128;
    int nZ = 128;
    int nParticles = nX*nY*nZ;

    global::par().setInt("nParticles",nParticles);

    global::par().setString("vertexShaderFilename","shader/lorenz.vert");
    global::par().setString("fragmentShaderFilename","shader/lorenz.frag");

    global::par().setString("kernelFilename","kernel/lorenz.cl");
    // global::par().enable("CL_GL_interop");
    // global::par().disable("filtering");

    void *onePiece = nullptr;
    //if ( posix_memalign(&buffer, 16, 8*nParticles*sizeof(float)) || buffer == nullptr )
    onePiece = (float*) malloc(9*nParticles*sizeof(float)); // float4 pos, float4 color, float lifetime
    if ( onePiece == nullptr )
        error::throw_ex("memory allocation failed",__FILE__,__LINE__);
    // TODO write a reasonable memory manager, for now just keep the memory allocated till the end of the application

    float *pos = (float *)onePiece;
    float *color = pos + 4*nParticles;
    float *lifetime = pos + 8*nParticles;

    memset(color,0,4*nParticles*sizeof(float));

#if 0
    auto initState = [](float *pos, float x, float y, float z, float spread)
    {
        pos[0] = x+spread*(2.f*float(rand())/RAND_MAX-1.f);
        pos[1] = x+spread*(2.f*float(rand())/RAND_MAX-1.f);
        pos[2] = x+spread*(2.f*float(rand())/RAND_MAX-1.f);
        pos[3] = 1.f;
    };

    for( int i = 0; i < nParticles; ++i )
    {
        /*
        if ( i < nParticles*0.1 )
            initState(&pos[4*i],-10.f,0.f,30.f,20.f);
        else if ( i < nParticles*0.2 )
            initState(&pos[4*i],10.f,10.f,10.f,20.f);
        else if ( i < nParticles*0.3 )
            initState(&pos[4*i],-10.f,-10.f,100.f,20.f);
        else*/
        initState(pos+4*i,0.f,0.f,0.f,100.f);
    }
#endif

    {
        float side = 100.f;
        for( int i = 0; i < nX; ++i )
        {
            for( int j = 0; j < nY; ++j )
            {
                for( int k = 0; k < nZ; ++k )
                {
                    int idx = (i*nY+j)*nZ+k;
                    lifetime[idx] = 0.f+30.f*float(rand())/RAND_MAX;
                    idx *= 4;
                    pos[idx+0] = side*float(2*i-nX)/float(nX);
                    pos[idx+1] = side*float(2*j-nY)/float(nY);
                    pos[idx+2] = side*float(2*k-nZ)/float(nZ);
                    pos[idx+3] = 1.f;
                }
            }
        }
    }

    global::par().setPtr("pos",(void*)pos);
    global::par().setPtr("color",(void*)color);
    global::par().setPtr("lifetime",(void*)lifetime);

    Demo::create(Demo::LorenzAttractor);
    Solver::create(Solver::LorenzAttractorOpenCL);

	#ifdef USE_FRAME_CAPTOR
    	if ( global::par().isEnabled("export") )
        	FrameCaptor::create(FrameCaptor::OpenCV);
    #endif
}

