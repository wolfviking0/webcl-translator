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
//#version 100

precision mediump float;

//layout( location = 0 ) out vec4 FragColor;

varying vec4 color;
varying vec2 texCoord;

uniform int task;

uniform sampler2D Texture0;

uniform float windowWidth;
uniform float windowHeight;

void main()
{    
    gl_FragColor = color;
}