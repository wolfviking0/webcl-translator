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

__kernel void kernelStep( __global float4 *posArray,
					__global float4 *colorArray,
					__global float *lifetimeArray,
					float4 baseColor,					
					float4 par,
					float4 rayOrigin,
					float4 rayDir,
					float time,
					float deltaTime ) 	
{
	int gid = get_global_id(0);
	
	float4 pos = posArray[gid];

	const float lifetime = 30.;	
	
	lifetimeArray[gid] -= deltaTime;	
	if ( lifetimeArray[gid] < 0 )
	{
		lifetimeArray[gid] = lifetime;							
		float r = 0.005*(((float)gid)/10000.+100.);		
		int num = gid%10000;
		float phi = 0.02*3.14159*(gid%100);
		num = num/100;		
		float theta = 0.01*3.14159*((float)num);
		float sintheta = sin(theta);
		float4 offset = (float4)(r*sintheta*cos(phi),r*sintheta*sin(phi),r*cos(theta),0.0); 
		pos = rayOrigin+100.0*rayDir+0.2*offset;										
	}		
	 	
	float4 vel = (float4)(par.x*(pos.y-pos.x), pos.x*(par.z-pos.z)-pos.y, pos.y*pos.x-par.y*pos.z, 0);
			
	posArray[gid] = pos + vel*(deltaTime*par.w);
	
	colorArray[gid] = baseColor + 0.1*fast_normalize(vel);
	
	const float decayTime = 1.0;
	const float birthTime = 1.0;
		
	if ( lifetimeArray[gid] < decayTime )
	{
		colorArray[gid].w *= lifetimeArray[gid]/decayTime;
	}
	else if ( lifetimeArray[gid] > lifetime - birthTime )
	{
		float tmp = (lifetime-lifetimeArray[gid])/birthTime;
		colorArray[gid].w *= 2.0*(1.0-4.0*(tmp-0.5)*(tmp-0.5)) + tmp;
	}
		 
}
