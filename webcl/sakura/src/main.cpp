//
//  main.cpp
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-14.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

/* TODO
 * Model Loading
 o Lighting + Shading on Petals
 o Draw Call Batching
 o DoF Post Process
 o Bloom Post Process
 */

//define to make sure that gl3 is always included instead of gl
#define GLFW_INCLUDE_GLCOREARB

#include <stdlib.h>
#include <stdio.h>
#ifndef __EMSCRIPTEN__
    #define GLFW_INCLUDE_GLU
    #include <GLFW/glfw3.h>
#else
    #define GLFW_INCLUDE_GLU
    #include <GL/glfw.h>
    #include <emscripten/emscripten.h>
#endif
#include "PetalView.h"

PetalView* pView = 0;

static void error_callback(int error, const char* description)
{
    fputs(description, stderr);
}

#ifdef __EMSCRIPTEN__
void emscripten_loop_callback()
{
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    pView->update();
    pView->draw();

    glfwSwapBuffers();
    glfwPollEvents();
}

static void key_callback(int key, int action)
#else
static void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
#endif
{
    #ifdef __EMSCRIPTEN__
    if ((key == 255 /*ESC*/ || key == 81 /*q*/ ) && action == GLFW_PRESS) {
        glViewport(0, 0, 0, 0);
        glfwCloseWindow();
        glfwTerminate();
        delete pView;
        //
        emscripten_cancel_main_loop();
        //
        exit(0);
    }
    #else
        if (key == GLFW_KEY_ESCAPE && action == GLFW_PRESS)
        glfwSetWindowShouldClose(window, GL_TRUE);
    #endif
}

int main(int argc, const char * argv[])
{
    #ifndef __EMSCRIPTEN__
        glfwSetErrorCallback(error_callback);
    #endif

    if (!glfwInit())
    exit(EXIT_FAILURE);

    #ifndef __EMSCRIPTEN__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 2);


    GLFWwindow* window = glfwCreateWindow(512,512, "Sakura Toy", NULL, NULL);
    if (!window)
    {
        glfwTerminate();
        exit(EXIT_FAILURE);
    }
    glfwMakeContextCurrent(window);
    #else
        glfwOpenWindow( 512, 512, 8,8,8,0,0,0, GLFW_WINDOW);
        glfwSetWindowTitle("Sakura Toy");
    #endif

    printf("OpenGL version supported by this platform (%s): \n", glGetString(GL_VERSION));


    #ifndef __EMSCRIPTEN__
        glfwSetKeyCallback(window, key_callback);
    #else
        glfwSetKeyCallback(key_callback);
    #endif

    glClearColor(0.8f, 0.5f, 0.5f, 1.0f);
    glEnable(GL_CULL_FACE);
    glEnable(GL_DEPTH_TEST);
    glCullFace(GL_BACK);

    pView = new PetalView(25, 1.0f);

    #ifdef __EMSCRIPTEN__
        emscripten_set_main_loop(emscripten_loop_callback,-1,0);
    #else

        while(!glfwWindowShouldClose(window))
        {
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

            pView->update();
            pView->draw();

            glfwSwapBuffers(window);
            glfwPollEvents();
        }

        delete pView;

        exit(EXIT_SUCCESS);
    #endif
}

