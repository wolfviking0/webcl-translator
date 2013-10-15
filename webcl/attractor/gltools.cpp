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
#include <fstream>
#include <sstream>

#include <vector>
#include <algorithm>

#include "error.h"

using namespace std;

namespace gltools
{

/*
GLuint loadTex2D(const string &filename)
{
    return SOIL_load_OGL_texture( filename.c_str(), SOIL_LOAD_AUTO, SOIL_CREATE_NEW_ID,
                SOIL_FLAG_MIPMAPS | SOIL_FLAG_INVERT_Y | SOIL_FLAG_NTSC_SAFE_RGB | SOIL_FLAG_COMPRESS_TO_DXT );
}
*/

GLuint compileShader( const string &filename, GLenum type )
{

    ifstream file(filename.c_str());
    if(!file.is_open())
    {
        string str("unable to open shader file ");
        str += filename;
        error::throw_ex(str.c_str(),__FILE__,__LINE__);
    }

    GLuint shader = glCreateShader(type);
    if (!shader)
        error::throw_ex("unable to create shader object",__FILE__,__LINE__);

    stringstream ss;
    ss << file.rdbuf();
    file.close();

    string strSrc = ss.str();

    const GLchar* charSrc[] = {strSrc.c_str()};

    glShaderSource(shader, 1, charSrc, NULL);

    glCompileShader( shader );

    GLint res;
    glGetShaderiv( shader, GL_COMPILE_STATUS, &res );
    if( res == GL_FALSE )
    {
        cerr << "Shader compile log: " << filename << endl;

        GLint logSize;
        glGetShaderiv( shader, GL_INFO_LOG_LENGTH, &logSize );

        if (logSize > 0)
        {
            vector <char> shaderLog(logSize);
            GLsizei written;
            glGetShaderInfoLog(shader, logSize, &written, shaderLog.data());
            cerr << shaderLog.data() << endl;
        }

        glDeleteShader(shader);

        string str("failed to compile shader ");
        str += filename;
        error::throw_ex(str.c_str(),__FILE__,__LINE__);
    }

    return shader;
}

ShaderContainer::~ShaderContainer()
{
    for_each(begin(),end(),glDeleteShader);
}

}
