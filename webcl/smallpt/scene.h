/*
Copyright (c) 2009 David Bucciarelli (davibu@interfree.it)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

#ifndef _SCENE_H
#define	_SCENE_H

#include "geomfunc.h"

#define WALL_RAD 1e4f
static Sphere CornellSpheres[] = { /* Scene: radius, position, emission, color, material */
	{ WALL_RAD, {WALL_RAD + 1.f, 40.8f, 81.6f}, {0.f, 0.f, 0.f}, {.75f, .25f, .25f}, DIFF }, /* Left */
	{ WALL_RAD, {-WALL_RAD + 99.f, 40.8f, 81.6f}, {0.f, 0.f, 0.f}, {.25f, .25f, .75f}, DIFF }, /* Rght */
	{ WALL_RAD, {50.f, 40.8f, WALL_RAD}, {0.f, 0.f, 0.f}, {.75f, .75f, .75f}, DIFF }, /* Back */
	{ WALL_RAD, {50.f, 40.8f, -WALL_RAD + 270.f}, {0.f, 0.f, 0.f}, {0.f, 0.f, 0.f}, DIFF }, /* Frnt */
	{ WALL_RAD, {50.f, WALL_RAD, 81.6f}, {0.f, 0.f, 0.f}, {.75f, .75f, .75f}, DIFF }, /* Botm */
	{ WALL_RAD, {50.f, -WALL_RAD + 81.6f, 81.6f}, {0.f, 0.f, 0.f}, {.75f, .75f, .75f}, DIFF }, /* Top */
	{ 16.5f, {27.f, 16.5f, 47.f}, {0.f, 0.f, 0.f}, {.9f, .9f, .9f}, SPEC }, /* Mirr */
	{ 16.5f, {73.f, 16.5f, 78.f}, {0.f, 0.f, 0.f}, {.9f, .9f, .9f}, REFR }, /* Glas */
	{ 7.f, {50.f, 81.6f - 15.f, 81.6f}, {12.f, 12.f, 12.f}, {0.f, 0.f, 0.f}, DIFF } /* Lite */
};

#ifdef SCENE_TEST
static const Sphere spheres[] = { /* Scene: radius, position, emission, color, material */
	{ 1000.f, {0.f, -1000.f, 0.f}, {0.f, 0.f, 0.f}, {.75f, .75f, .75f}, DIFF }, /* Ground */
	{ 15.f, {10.f, 15.f, 0.0f}, {0.f, 0.f, 0.f}, {.75f, 0.f, 0.f}, DIFF }, /* Red */
	{ 20.f, {-40.f, 20.f, 0.0f}, {0.f, 0.f, 0.f}, {0.f, 0.f, .75f}, DIFF }, /* Blue */
	{ 10.f, {-5.f, 10.f, 20.0f}, {0.f, 0.f, 0.f}, {0.f, .75f, .0f}, DIFF }, /* Blue */
	{ 10.f, {-30.f, 100.0f, 20.f}, {12.f, 12.f, 12.f}, {0.f, 0.f, 0.f}, DIFF } /* Lite */
};
#endif

#endif	/* _SCENE_H */

