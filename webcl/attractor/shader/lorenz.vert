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

//#version 400

//layout(location = 0) in vec4 vertexPos;
//layout(location = 1) in vec4 vertexColor;
//layout(location = 2) in vec2 vertexTexCoord;

attribute vec4 vertexPos;
attribute vec4 vertexColor;
attribute vec2 vertexTexCoord;

varying vec4 color;
varying vec2 texCoord;

uniform mat4 MVP;

void main()
{    
    texCoord = vertexTexCoord;
    color = vertexColor;
    gl_Position = MVP*vertexPos;    
}