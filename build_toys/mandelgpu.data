/***************************************************************************
 *   Copyright (C) 1998-2013 by authors (see AUTHORS.txt )                 *
 *                                                                         *
 *   This file is part of OCLToys.                                         *
 *                                                                         *
 *   OCLToys is free software; you can redistribute it and/or modify       *
 *   it under the terms of the GNU General Public License as published by  *
 *   the Free Software Foundation; either version 3 of the License, or     *
 *   (at your option) any later version.                                   *
 *                                                                         *
 *   OCLToys is distributed in the hope that it will be useful,            *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
 *   GNU General Public License for more details.                          *
 *                                                                         *
 *   You should have received a copy of the GNU General Public License     *
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>. *
 *                                                                         *
 *   OCLToys website: http://code.google.com/p/ocltoys                     *
 ***************************************************************************/

 int colormap(const int maxIterations, int i) {
	if (i == maxIterations)
		return 0;
	else {
		i = i % 512;
		if (i > 255)
			return 511 - i;
		else
			return i;
	}
}

__kernel void mandelGPU(
		__global uint *pixels,
		const int width,
		const int height,
		const float scale,
		const float offsetX,
		const float offsetY,
		const int maxIterations
		) {
	const int gid = get_global_id(0);
	const int gid4 = 4 * gid;
	// Szaq's patch for NVIDIA OpenCL and Windows
	const float4 maxSize = (float4)max(width, height);
	const float4 kx = (scale / 2.f) * width;
	const float4 ky = (scale / 2.f) * height;

	const uint4 tid =  (uint4)(gid4, gid4 + 1, gid4 + 2, gid4 +3);
	// Szaq's patch for NVIDIA OpenCL and Windows
	const uint4 width4 = (uint4)width;
	const uint4 screenX = tid % width4;
	const uint4 screenY = tid / width4;

	// Check if we have something to do
	if ((screenY.s0 >= height) ||
			(screenY.s1 >= height) ||
			(screenY.s2 >= height) ||
			(screenY.s3 >= height))
		return;

	const float4 fscreenX = convert_float4(screenX);
	const float4 fscreenY = convert_float4(screenY);

	const float4 x0 = ((fscreenX * ((float4)scale)) - kx) / maxSize + (float4)offsetX;
	const float4 y0 = ((fscreenY * ((float4)scale)) - ky) / maxSize + (float4)offsetY;

	float4 x = x0;
	float4 y = y0;
	float4 x2 = x * x;
	float4 y2 = y * y;

	const float4 two = 2.f;
	int4 iter = 0;
	const int4 maxIterations4 = maxIterations;
	const int4 one = (int4)( 1, 1, 1, 1);
	for (;;) {
		y = ((float4)2.f) * x * y + y0;
		x = x2 - y2 + x0;

		x2 = x * x;
		y2 = y * y;

		const float4 x2y2 = x2 + y2;
		const int4 notEscaped = (x2y2 <= (float4)4.f);
		const int4 notMaxIter = (iter < maxIterations4);
		const int4 notHaveToExit = (notEscaped && notMaxIter);
		if (!any(notHaveToExit))
			break;

		iter += (one & notHaveToExit);
	}

	const int s0 = colormap(maxIterations, iter.s0);
	const int s1 = colormap(maxIterations, iter.s1);
	const int s2 = colormap(maxIterations, iter.s2);
	const int s3 = colormap(maxIterations, iter.s3);

	pixels[gid] = s0 | (s1 << 8) | (s2 << 16) | (s3 << 24);
}
