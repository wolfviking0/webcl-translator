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

//layout( location = 0 ) out vec4 FragColor;

attribute out vec4 FragColor;

in vec2 texCoord;
in vec4 color;

uniform int task;

uniform sampler2D Texture0;

uniform float windowWidth;
uniform float windowHeight;

uniform float blurPar[3] = float[]( /* #, #, */ 0.6, 0.15, 0.05 );                                   
 
vec4 gammaCorrection()
{
    float gamma = 0.1;
    vec4 c = texture(Texture0, texCoord);
    float l = (c.r+c.g+c.b)/3.0;
    c.xyz *= pow(l,gamma)/l; 
    return c;
}
                                   
vec4 blurX()
{    
    float step = 1./windowHeight;
    vec4 c = blurPar[0]*texture(Texture0, texCoord);      
    for( int i = 1; i < 3; i++ )
    {        
         c += blurPar[i]*texture( Texture0, texCoord + vec2(0,step*i));
         c += blurPar[i]*texture( Texture0, texCoord - vec2(0,step*i));
    }        
    return c;      
}

vec4 blurY()
{   
    float step = 1./windowWidth;
    vec4 c = blurPar[0]*texture(Texture0, texCoord);      
    for( int i = 1; i < 3; i++ )
    {        
         c += blurPar[i]*texture( Texture0, texCoord + vec2(step*i,0));
         c += blurPar[i]*texture( Texture0, texCoord - vec2(step*i,0));
    }
    return c;    
}

vec4 render()
{    
    return color;    
}

void main()
{    
    if ( task == 0 )
        FragColor = render();
    else if ( task == 3 )
        FragColor = gammaCorrection();
    else if ( task == 1 )
        FragColor = blurX();
    else if ( task == 2 )
        FragColor = blurY();    
}