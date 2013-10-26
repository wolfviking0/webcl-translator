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

#version 100

precision mediump float;

uniform int u_task;

uniform float u_width;
uniform float u_height;

varying vec4 v_color;
varying vec2 v_texCoord;

uniform sampler2D Texture0;

vec4 gammaCorrection()
{
    float gamma = 0.1;
    vec4 c = texture2D(Texture0, gl_PointCoord);
    float l = (c.r+c.g+c.b)/3.0;
    c.xyz *= pow(l,gamma)/l; 
    return c;
}

vec4 blurX()
{    
    float step = 1./u_height;
    vec4 c = 0.6 * texture2D(Texture0, gl_PointCoord);      
    
    c += 0.15 * texture2D( Texture0, gl_PointCoord + vec2(0,step));
    c += 0.15 * texture2D( Texture0, gl_PointCoord - vec2(0,step));

    c += 0.05 * texture2D( Texture0, gl_PointCoord + vec2(0,step * 2.0));
    c += 0.05 * texture2D( Texture0, gl_PointCoord - vec2(0,step * 2.0));
      
    return c;      
}

vec4 blurY()
{   
    float step = 1./u_width;
    vec4 c = 0.6 * texture2D(Texture0, gl_PointCoord);      

    c += 0.15 * texture2D( Texture0, gl_PointCoord + vec2(0,step));
    c += 0.15 * texture2D( Texture0, gl_PointCoord - vec2(0,step));

    c += 0.05 * texture2D( Texture0, gl_PointCoord + vec2(0,step * 2.0));
    c += 0.05 * texture2D( Texture0, gl_PointCoord - vec2(0,step * 2.0));
      
    return c;    
}

vec4 render()
{    
    vec4 color = (0.6 + 0.4 * v_color) * texture2D(Texture0, gl_PointCoord);
    //return color * mix(vec4(v_color.r, v_color.g, v_color.b, color.w), vec4(0.0, 0.2, 0.2, color.w), color.w);
    return v_color;
}

void main()
{    
    if ( u_task == 0 )
        gl_FragColor = render();
    else if ( u_task == 3 )
        gl_FragColor = gammaCorrection();
    else if ( u_task == 1 )
        gl_FragColor = blurX();
    else if ( u_task == 2 )
        gl_FragColor = blurY();   
}
