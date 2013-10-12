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

#include "Application.h"
#include "LorenzAttractorDemo.h"
#include "Solver.h"
#include "Demo.h"
#ifndef __EMSCRIPTEN__     
    #include "FrameCaptor.h"
#else
    #include <emscripten/emscripten.h>
#endif

#include "global.h"
#include "error.h"

#ifdef __EMSCRIPTEN__
static bool glfwWindowShouldClose = false;
static int framesLastSecond = 0;
static int lastSecond = 0;
static int curFrame = 0;
#endif
  
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
#else
void key_callback(int key,int action)  
#endif  
{
    if (key == GLFW_KEY_ESC && action == GLFW_PRESS) {
#ifndef __EMSCRIPTEN__      
        glfwSetWindowShouldClose(window, GL_TRUE);
#else
        glfwWindowShouldClose = true;
#endif    
    }
}

void cursor_pos_callback(GLFWwindow* window, double dx,double dy)
{
    if (Application::get())
        Application::get()->setCursorPos(float(dx),float(dy));
}

void Application::init()
{
    // initialize GLFW and create window, setup callbacks
#ifndef __EMSCRIPTEN__
    glfwSetErrorCallback(error_callback);
#endif
    
    if( !glfwInit() )
        error::throw_ex("unable to initialize GLFW",__FILE__,__LINE__);

    int windowWidth = global::par().getInt("windowWidth");
    int windowHeight = global::par().getInt("windowHeight");
    std::string windowTitle = global::par().getString("windowTitle");

#ifndef __EMSCRIPTEN__
    m_window = glfwCreateWindow(windowWidth, windowHeight, windowTitle.c_str(), nullptr, nullptr);
#else 
    glfwOpenWindow(windowWidth, windowHeight, 5, 6, 5, 0, 0, 0, GLFW_WINDOW);
    glfwSetWindowTitle(windowTitle.c_str());
#endif      

#ifndef __EMSCRIPTEN__
    if( !m_window )
    {
        glfwTerminate();
        error::throw_ex("unable to create GLFW window",__FILE__,__LINE__);
    }

    glfwMakeContextCurrent(m_window);

    if ( glewInit() != GLEW_OK )
        error::throw_ex("unable to initialize GLEW",__FILE__,__LINE__);

    glfwSetKeyCallback(m_window,key_callback);
#else
    glfwSetKeyCallback(key_callback);    
#endif    
    //glfwSetCursorPosCallback(m_window, cursor_pos_callback);

    glViewport(0, 0, windowWidth, windowHeight);

    #ifdef __EMSCRIPTEN__
    
        setupLorenzAttractor();

    #endif

}

#ifdef __EMSCRIPTEN__

void Application::run()
{
    mainLoop();
}

void Application::mainLoop()
{
    if (glfwWindowShouldClose == true) {

        emscripten_cancel_main_loop();
            
        glfwCloseWindow();

        m_window = nullptr;

        glfwTerminate();

        return ;
    }

    float realTime = getRealTime();
    ++framesLastSecond;
    if ( lastSecond != (int)realTime )
    {
        lastSecond = (int)realTime;
        std::cout << "FPS: " << framesLastSecond << std::endl;
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

    glfwDestroyWindow(m_window);

    m_window = nullptr;

    glfwTerminate();

}

void Application::mainLoop()
{
    int framesLastSecond = 0;
    int lastSecond = 0;

    int curFrame = 0;
    int exportStartFrame = global::par().getInt("exportStartFrame");
    int simulationEndFrame = global::par().getInt("simulationEndFrame");
    
    while (!glfwWindowShouldClose(m_window))          
    {
        float realTime = getRealTime();
        ++framesLastSecond;
        if ( lastSecond != (int)realTime )
        {
            lastSecond = (int)realTime;
            std::cout << "FPS: " << framesLastSecond << std::endl;
            framesLastSecond = 0;
        }

        // render and swap buffers
        Demo::get()->render(m_simTime);

        glfwSwapBuffers(m_window);     
  
        // export the rendered frame      
        if ( FrameCaptor::get() && curFrame >= exportStartFrame )
            FrameCaptor::get()->capture();

        // check if we should stop the simulation
        if ( simulationEndFrame && curFrame == simulationEndFrame )
            break;

        // step simulation
        Solver::get()->step(m_simTime,m_simDeltaTime);

        // exchanges information between solver and renderer if not already shared
        Demo::get()->update();

        // process UI events
        glfwPollEvents();

        m_simTime += m_simDeltaTime;

        ++curFrame;

        //if ( curFrame%20 == 0 )
        //    std::cout << "simTime: " << m_simTime << std::endl;
    }   
    if ( FrameCaptor::get() )
        FrameCaptor::get()->release();  
}

#endif

void Application::setCursorPos(float x, float y)
{
    m_cursorX = x;
    m_cursorY = y;
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

    int nX = 2;//256;
    int nY = 2;//256;
    int nZ = 2;//256;
    int nParticles = nX*nY*nZ;

    global::par().setInt("nParticles",nParticles);

    global::par().setString("vertexShaderFilename","shader/lorenz.vert");
    global::par().setString("fragmentShaderFilename","shader/lorenz.frag");

    global::par().setString("kernelFilename","kernel/lorenz.cl");
    
    // Not enable filtering and cl_gl interop for now
    //global::par().enable("CL_GL_interop");
    //global::par().enable("filtering");

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
                    lifetime[idx] = 6.f+32.f*float(rand())/RAND_MAX;
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

#ifndef __EMSCRIPTEN__     
    if ( global::par().isEnabled("export") )
        FrameCaptor::create(FrameCaptor::OpenCV);
#endif    
}

