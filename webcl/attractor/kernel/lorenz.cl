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
					float time,
					float deltaTime ) 	
{
	int gid = get_global_id(0);
	
	float4 pos = posArray[gid];
	
	lifetimeArray[gid] -= deltaTime;	
	if ( lifetimeArray[gid] < 0.f )
	{
		lifetimeArray[gid] = 32.f;
		float fgid = as_float(gid);		
		pos = (float4) ( 5.f*sin(fgid*36245.434+pos.x), 5.f*sin(fgid*56509.678+pos.y), 64.f+sin(fgid*12655.678+pos.z), 1.f );
	}
	 	
	float4 vel = (float4)(par.x*(pos.y-pos.x), pos.x*(par.z-pos.z)-pos.y, pos.y*pos.x-par.y*pos.z, 0.f);
			
	posArray[gid] = pos + vel*(deltaTime*par.w);
	colorArray[gid] = baseColor + 0.1f*fast_normalize(vel);
}
