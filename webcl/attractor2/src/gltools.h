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

#ifndef GLTOOLS_H_
#define GLTOOLS_H_

#include <GL/glew.h>

#ifndef __EMSCRIPTEN__
	#define GLFW_INCLUDE_GLU
	#include <GLFW/glfw3.h>
#else
	#define GLFW_INCLUDE_GLU
	#include <GL/glfw.h>

#endif

#include <glm/glm.hpp>
#include <string>
#include <list>

namespace gltools
{

GLuint loadTex2D(const std::string &filename);

GLuint compileShader(const std::string &filename, GLenum type);

class ShaderContainer : public std::list<GLuint>
{
public:
    ~ShaderContainer();
};

};

#endif /* GLTOOLS_H_ */
