/*****************************************************************************
 *                                 jugCLer                                   *
 *              realtime raytracing experiment: OpenCL kernel                *
 *                                                                           *
 *  Copyright (C) 2013  Holger Bettag               (hobold@vectorizer.org)  *
 *                                                                           *
 *  This program is free software; you can redistribute it and/or modify     *
 *  it under the terms of the GNU General Public License as published by     *
 *  the Free Software Foundation; either version 2 of the License, or        *
 *  (at your option) any later version.                                      *
 *                                                                           *
 *  This program is distributed in the hope that it will be useful,          *
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of           *
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the            *
 *  GNU General Public License for more details.                             *
 *                                                                           *
 *  You should have received a copy of the GNU General Public License along  *
 *  with this program; if not, write to the Free Software Foundation, Inc.,  *
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.              *
 *****************************************************************************/

/***************
 *  view rays  *
 ***************/
struct Ray {
	float3 base;
	float3 dir;
};

/************************
 *  perspective camera  *
 ************************/
struct Camera {
	const float3 eye; // eye point
	const float3 sky; // sky vector
	const float3 viewCenter; // center of view rect
	const float3 viewRight; // horizontal direction of view rect
	const float3 viewUp; // vertical direction of view rect
	const int imgWidth; // image width in pixels
	const int imgHeight; // image height in pixels
};

// ray through center of pixel

struct Ray camMakePrimaryRay(__global const struct Camera* restrict c,
		const int x, const int y) {
	const int imgWidth = c->imgWidth;
	const int imgHeight = c->imgHeight;
	const float ratio = imgWidth / (float)imgHeight;

	// start from relative pixel coordinates in [0.0 .. 1.0]
	// with y axis pointing down, pixel center is at (+0.5, +0.5)
	float fx = ((float) x + 0.5f) / imgWidth;
	float fy = ((float) y + 0.5f) / imgHeight;

	// map to [-1.0 .. 1.0], with y axis pointing down, because ...
	// ... GLUT y-flips the bitmap later on
	fx = (2.0f * fx - 1.0f) * ratio;
	fy = 2.0f * fy - 1.0f;

	// ray direction is from eye to that point in view rect  

	return (struct Ray) {
		c->eye, fast_normalize(c->viewCenter
				+ fx * c->viewRight + fy * c->viewUp - c->eye)
	};
}

/************
 *  sphere  *
 ************/
struct Sphere {
	// geometry of sphere
	const float3 center;
	const float radius;

	// material
	const float3 color; // pigment
	const float ambient; // ambient amount
	const float diffuse; // diffuse amount
	const float highlight; // highlight intensity
	const float roughness; // controls highlight size
	const float reflection; // weight of reflected ray
};

// return smallest positive t

float sphIntersect(__global const struct Sphere* restrict s,
		const struct Ray ray) {
	// translate sphere center to origin, i.e. translate ray base
	float3 base = ray.base - s->center;

	// quadratic coefficients
	// immediately divide out leading coefficient
	// and immediately multiply b by -0.5 to simplify further computation
	float a = dot(ray.dir, ray.dir);
	float b = dot(base, ray.dir) / -a;
	float c = (dot(base, base) - s->radius * s->radius) / a;

	// so now we have to solve:   t*t - 2.0*t*b + c = 0;
	a = b * b - c; // discriminant

	float t = MAXFLOAT; // initialize as "ray misses sphere"

	if (a >= 0.0f) {
		// if ray hits sphere
		a = sqrt(a);
		float tmp = b - a; // check near hit
		if (tmp > 0.0f) {
			// if near hit is > 0, keep it
			t = tmp;
		} else {
			tmp = b + a; // check far hit
			if (tmp > 0.0f) {
				// if far hit is > 0, keep it
				t = tmp;
			}
		}
	}
	return t; // return hit or miss
}

// normal vector at point, unit length

float3 sphNormal(__global const struct Sphere* restrict s, const float3 where) {
	return fast_normalize(where - s->center);
}

/*********************
 *  scene container  *
 *********************/
struct Scene {
	const struct Camera cam; // the camera
	const float3 lightDir; // direction towards light
	const int numSpheres; // number of valid spheres
	const struct Sphere spheres[84]; // storage space for the spheres
};


/****************
 *  trace rays  *
 ****************/
// returns true if light ray is blocked

bool shadow(const struct Ray ray, __global const struct Scene* restrict scene) {
	for (int i = scene->numSpheres - 1; i >= 0; i--) {
		if (sphIntersect(&(scene->spheres[i]), ray) < MAXFLOAT) {
			return true;
		}
	}
	return false;
}

// returns color for ray

float3 trace(struct Ray ray, __global const struct Scene* restrict scene) {
	float weight = 1.0f; // weight of remaining reflected ray, if any
	int rayDepth = 0; // number of reflections so far
	float3 result = {0.0f, 0.0f, 0.0f}; // accumulates ray intensities

	float floorDist; // distance to floor
	int sphereIdx; // closest valid sphere hit, if any
	float sphereDist; // distance to closest valid sphere hit, if any

	float3 normal;
	float3 position;
	float3 reflected;
	float3 color;
	float3 ambientColor;
	float ambient;
	float diffuse;
	float highlight;
	float roughness;
	float reflection;

	const float3 lightDir = scene->lightDir; // direction towards to light

	while ((weight > 0.004f) && (rayDepth < 10)) { // loop over reflections
		rayDepth++;

		// test ground floor (at y = 0) first
		floorDist = MAXFLOAT;
		if (ray.dir.y != 0.0f) {
			floorDist = -ray.base.y / ray.dir.y; // in terms of ray parameter t
			if (floorDist < 0.0f) {
				floorDist = MAXFLOAT; // floor is behind camera, so it's a miss
			}
		}

		sphereIdx = -1; // remember closest valid sphere hit
		sphereDist = MAXFLOAT; // and that hit's distance

		for (int i = scene->numSpheres - 1; i >= 0; i--) { // test all spheres
			float dist = sphIntersect(&(scene->spheres[i]), ray);
			if (dist < sphereDist) {
				sphereDist = dist; // remember closest hit
				sphereIdx = i;
			}
		}

		// initialize as default material (for floor)
		ambient = 0.3f;
		diffuse = 0.7f;
		highlight = 0.0f;
		roughness = 0.05f;
		reflection = 0.0f;

		// did we hit anything?  
		if (fmin(sphereDist, floorDist) >= MAXFLOAT) {
			// we missed the floor and all spheres, so it's sky dome color
			color = (float3) (0.7f, 0.8f, 0.9f) * (1.0f - ray.dir.y)
					+ (float3) (0.1f, 0.1f, 0.9f) * ray.dir.y;
		} else {
			// what is closer, floor or sphere?
			if (floorDist < sphereDist) {
				// ray did hit the floor, make checkerboard pattern
				position = ray.base + floorDist * ray.dir; // location of floor hit
				float2 checker;
				checker.x = 0.125f * position.x + 0.5f;
				checker.y = 0.125f * position.z + 0.5f;

				// fake floor antialiasing by blurring the pattern with distance
				float toggle = fabs(checker.x - floor(checker.x) - 0.5f);
				toggle = fmax(toggle, fabs(checker.y - floor(checker.y) - 0.5f));
				toggle = fmax(toggle, (float) (((int) (floor(checker.x)) ^
						(int) (floor(checker.y))) & 1) - toggle);
				float m = fast_distance(position, scene->cam.eye);
				m = 100000.0f / (m * m * (16.0f * ((float) rayDepth) - 15.0f));
				float b = 0.5f * m - 0.5f;
				toggle = m * toggle - b;
				toggle = clamp(toggle, 0.0f, 1.0f);

				color = (float3) (0.9f, 0.9f, 0.1f) * toggle
						+ (float3) (0.1f, 0.9f, 0.1f) * (1.0f - toggle);
				normal = (float3) (0.0f, 1.0f, 0.0f); // floor normal
			} else {
				// ray did hit a sphere
				position = ray.base + sphereDist * ray.dir; // location of sphere hit
				normal = sphNormal(&(scene->spheres[sphereIdx]), position); // normal

				// sphere material
				color = scene->spheres[sphereIdx].color;
				ambient = scene->spheres[sphereIdx].ambient;
				diffuse = scene->spheres[sphereIdx].diffuse;
				highlight = scene->spheres[sphereIdx].highlight;
				roughness = scene->spheres[sphereIdx].roughness;
				reflection = scene->spheres[sphereIdx].reflection;
			}
			// light that point

			// cheat to avoid erroneous self intersections
			position += 0.0008f * normal;

			// reflected direction
			reflected = ray.dir - ((2.0f * dot(normal, ray.dir)) * normal);

			// fake ambient illumination: mix average floor and sky colors depending
			// on y component of surface normal
			ambientColor = 1.65f * (color + 0.1f) * mix((float3) (0.4f, 0.45f, 0.9f),
					(float3) (0.5f, 0.9f, 0.1f) * lightDir.y,
					(float3) (0.5f - 0.5f * normal.y)) * ambient;

			float brightness = 0.0f;
			float cosAngle = 0.0f; // temporary for diffuse and highlight

			if (!shadow((struct Ray) {
					position, lightDir}, scene)) {
			// if light source is visible, add its diffuse contribution
			cosAngle = dot(lightDir, normal);
			cosAngle = fmax(cosAngle, 0.0f); // only if we're facing the light
			brightness = diffuse*cosAngle;

			// add specular highlight, i.e. a reflection of the light source	
			cosAngle = dot(reflected, lightDir);
			cosAngle = fmax(cosAngle, 0.0f); // if reflection is towards light

			// resize highlight (shrinks with increasing factor)
			cosAngle = ((cosAngle - 1.0f) / roughness) + 1.0f;
			cosAngle = fmax(cosAngle, 0.0f); // only if inside the highlight
			cosAngle = cosAngle * cosAngle * highlight;
		}
			// ambient and diffuse contributions + highlight
			color = (color * brightness) + ambientColor + (float3) (cosAngle);
		}
		result += color * weight; // add weighted contribution of (reflected) ray
		weight *= reflection; // diminish weight of further reflections

		// follow the reflected ray next
		ray.base = position;
		ray.dir = reflected;
	}

	return result;
}

// trace a ray through each pixel

__kernel
void render_gpu(__global const struct Scene* restrict scene, __global uchar4* restrict Image) {
	const int imgWidth = scene->cam.imgWidth;
	const int imgHeight = scene->cam.imgHeight;

	const int gid = get_global_id(0);
	if (gid > imgWidth * imgHeight)
		return;

	const int x = gid % imgWidth;
	const int y = gid / imgWidth;

	// trace the ray through that pixel
	struct Ray ray = camMakePrimaryRay(&(scene->cam), x, y);
	float3 color = trace(ray, scene);

	// apply 2x2 ordered dithering during conversion from float to uchar
	float dither = (float) ((((x^y) & 1) << 1) + (y & 1)) * 0.25f;
	Image[y * imgWidth + x].x =
			(unsigned char) (fmin(color.x, 1.0f) * 255.125f + dither);
	Image[y * imgWidth + x].y =
			(unsigned char) (fmin(color.y, 1.0f) * 255.125f + dither);
	Image[y * imgWidth + x].z =
			(unsigned char) (fmin(color.z, 1.0f) * 255.125f + dither);
}
