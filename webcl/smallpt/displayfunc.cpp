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

#ifdef WIN32
#define _USE_MATH_DEFINES
#endif
#include <cmath>

#include "displayfunc.h"

RenderConfig *config;

static bool printHelp = true;
static bool showWorkLoad = true;

double WallClockTime() {
#if defined(__linux__) || defined(__APPLE__)
	struct timeval t;
	gettimeofday(&t, NULL);

	return t.tv_sec + t.tv_usec / 1000000.0;
#elif defined (WIN32)
	return GetTickCount() / 1000.0;
#else
	Unsupported Platform !!!
#endif
}

static double totalElapsedTime = 0.0;

static void UpdateRendering() {
	int startSampleCount = config->currentSample;
	if (startSampleCount == 0)
		totalElapsedTime = 0.0;

	double startTime = WallClockTime();
	config->Execute();
	const double elapsedTime = WallClockTime() - startTime;
	totalElapsedTime += elapsedTime;

	const int samples = config->currentSample - startSampleCount;
	const double sampleSec = samples * config->height * config->width / elapsedTime;
	sprintf(config->captionBuffer, "[Rendering time %.3f sec (pass %d)][Avg. sample/sec %.1fK][Instant sample/sec %.1fK]",
			elapsedTime, config->currentSample,
			config->currentSample * config->height * config->width / totalElapsedTime / 1000.f,
			sampleSec / 1000.f);
}

static void PrintString(void *font, const char *string) {
	int len, i;

	len = (int)strlen(string);
	for (i = 0; i < len; i++)
		glutBitmapCharacter(font, string[i]);
}

static void PrintHelpAndDevices() {
	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glColor4f(0.f, 0.f, 0.f, 0.5f);
	glRecti(10, 80, 630, 440);
	glDisable(GL_BLEND);

	glColor3f(1.f, 1.f, 1.f);
	glRasterPos2i(320 - glutBitmapLength(GLUT_BITMAP_9_BY_15, (unsigned char *)"Help & Devices") / 2, 420);
	PrintString(GLUT_BITMAP_9_BY_15, "Help & Devices");

	// Help
	glRasterPos2i(60, 390);
	PrintString(GLUT_BITMAP_9_BY_15, "h - toggle Help");
	glRasterPos2i(60, 375);
	PrintString(GLUT_BITMAP_9_BY_15, "arrow Keys - rotate camera left/right/up/down");
	glRasterPos2i(60, 360);
	PrintString(GLUT_BITMAP_9_BY_15, "a and d - move camera left and right");
	glRasterPos2i(60, 345);
	PrintString(GLUT_BITMAP_9_BY_15, "w and s - move camera forward and backward");
	glRasterPos2i(60, 330);
	PrintString(GLUT_BITMAP_9_BY_15, "r and f - move camera up and down");
	glRasterPos2i(60, 315);
	PrintString(GLUT_BITMAP_9_BY_15, "PageUp and PageDown - move camera target up and down");
	glRasterPos2i(60, 300);
	PrintString(GLUT_BITMAP_9_BY_15, "+ and - - to select next/previous object");
	glRasterPos2i(60, 285);
	PrintString(GLUT_BITMAP_9_BY_15, "2, 3, 4, 5, 6, 8, 9 - to move selected object");
	glRasterPos2i(60, 270);
	PrintString(GLUT_BITMAP_9_BY_15, "l - reset load balancing procedure");
	glRasterPos2i(60, 255);
	PrintString(GLUT_BITMAP_9_BY_15, "k - toggle workload visualization");
	glRasterPos2i(60, 240);
	PrintString(GLUT_BITMAP_9_BY_15, "n, m - select previous/next OpenCL device");
	glRasterPos2i(60, 225);
	PrintString(GLUT_BITMAP_9_BY_15, "v, b - increase/decrease the worload of the selected OpenCL device");

	// Devices
	const VECTOR_CLASS<RenderDevice *> devices = config->GetRenderDevice();
	double minPerf = devices[0]->GetPerformance();
	double totalPerf = config->GetPerfIndex(0);
	double totalAmount = devices[0]->GetWorkAmount();
	for (size_t i = 1; i < devices.size(); ++i) {
		minPerf = min(minPerf, devices[i]->GetPerformance());
		totalPerf += config->GetPerfIndex(i);
		totalAmount += devices[i]->GetWorkAmount();
	}

	glColor3f(1.0f, 0.5f, 0.f);
	int offset = 85;
	char buff[512];
	for (size_t i = 0; i < devices.size(); ++i) {
		sprintf(buff, "[%s][Prf Idx %.2f][Asgnd Prf Idx %.2f][Wrkld done %.1f%%]", devices[i]->GetName().c_str(),
				devices[i]->GetPerformance() / minPerf,
				config->GetPerfIndex(i) / totalPerf,
				100.0 * devices[i]->GetWorkAmount() / totalAmount);

		// Check if it is the selected device
		if (i == config->selectedDevice) {
				glColor3f(0.f, 0.f, 1.f);
				glRecti(10, offset - 5, 630, offset + 10);
				glColor3f(1.0f, 0.5f, 0.f);
		}

		glRasterPos2i(15, offset);
		PrintString(GLUT_BITMAP_9_BY_15, buff);

		offset += 16;
	}

	glRasterPos2i(12, offset);
	PrintString(GLUT_BITMAP_9_BY_15, "OpenCL Devices:");
}

static void PrintCaptions() {
	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glColor4f(0.f, 0.f, 0.f, 0.8f);
	glRecti(0, config->height - 15,
			config->width - 1, config->height - 1);
	glRecti(0, 0, config->width - 1, 20);
	glDisable(GL_BLEND);

	// Caption line 0
	if (config->IsProfiling()) {
		glColor3f(1.f, 0.f, 0.f);
		glRasterPos2i(4, 5);
		PrintString(GLUT_BITMAP_8_BY_13, "[Profiling]");
		glColor3f(1.f, 1.f, 1.f);
		glRasterPos2i(4 + glutBitmapLength(GLUT_BITMAP_8_BY_13, (unsigned char*)"[Profiling]"), 5);
		PrintString(GLUT_BITMAP_8_BY_13, config->captionBuffer);
	} else {
		glColor3f(1.f, 1.f, 1.f);
		glRasterPos2i(4, 5);
		PrintString(GLUT_BITMAP_8_BY_13, config->captionBuffer);
	}

	// Title
	glRasterPos2i(4, config->height - 10);
	PrintString(GLUT_BITMAP_8_BY_13, "SmallptGPU V2.0 (Written by David Bucciarelli)");
}

void displayFunc(void) {
	glRasterPos2i(0, 0);
	glDrawPixels(config->width, config->height, GL_RGBA, GL_UNSIGNED_BYTE, config->pixels);

	if (showWorkLoad) {
		const VECTOR_CLASS<RenderDevice *> devices = config->GetRenderDevice();
		int start = 0;
		for (size_t i = 0; i < devices.size(); ++i) {
			const int end = (devices[i]->GetWorkOffset() + devices[i]->GetWorkAmount()) / config->width;

			switch (i % 4) {
				case 0:
					glColor3f(1.f, 0.f, 0.f);
					break;
				case 1:
					glColor3f(0.f, 1.f, 0.f);
					break;
				case 2:
					glColor3f(0.f, 0.f, 1.f);
					break;
				case 3:
					glColor3f(1.f, 1.f, 0.f);
					break;
			}
			glRecti(0, start, 10, end);
			glBegin(GL_LINES);
			glVertex2i(0, start);
			glVertex2i(config->width, start);
			glVertex2i(0, end);
			glVertex2i(config->width, end);
			glEnd();


			glColor3f(1.f, 1.f, 1.f);
			glRasterPos2i(12, (start + end) / 2);
			PrintString(GLUT_BITMAP_8_BY_13, devices[i]->GetName().c_str());
			start = end + 1;
		}
	}

	PrintCaptions();

	if (printHelp) {
		glPushMatrix();
		glLoadIdentity();
		glOrtho(-0.5, 639.5, -0.5, 479.5, -1.0, 1.0);

		PrintHelpAndDevices();

		glPopMatrix();
	}

	glutSwapBuffers();
}

void reshapeFunc(int newWidth, int newHeight) {
	config->width = newWidth;
	config->height = newHeight;

	glViewport(0, 0, newWidth, newHeight);
	glLoadIdentity();
	glOrtho(0.f, newWidth - 1.0f, 0.f, newHeight - 1.0f, -1.f, 1.f);

	config->ReInit(true);

	glutPostRedisplay();
}

#define MOVE_STEP 10.0f
#define ROTATE_STEP (2.f * M_PI / 180.f)
void keyFunc(unsigned char key, int x, int y) {
	switch (key) {
		case 'p': {
			FILE *f = fopen("image.ppm", "w"); // Write image to PPM file.
			if (!f) {
				fprintf(stderr, "Failed to open image file: image.ppm\n");
			} else {
				fprintf(f, "P3\n%d %d\n%d\n", config->width, config->height, 255);

				for (int y = (int)(config->height - 1); y >= 0; --y) {
					unsigned char *p = (unsigned char *)(&config->pixels[y * config->width]);
					for (unsigned int x = 0; x < config->width; ++x, p += 4)
						fprintf(f, "%d %d %d ", p[0], p[1], p[2]);
				}

				fclose(f);
			}
			break;
		}
		case 27: /* Escape key */
			cerr << "Releasing resources" << endl;
			delete config;
			cerr << "Done." << endl;
			exit(0);
			break;
		case ' ': /* Refresh display */
			config->ReInit(1);
			break;
		case 'l':
			config->ReInit(0);
			config->RestartWorkloadProcedure();
			break;
		case 'a': {
			Vec dir = config->camera->x;
			vnorm(dir);
			vsmul(dir, -MOVE_STEP, dir);
			vadd(config->camera->orig, config->camera->orig, dir);
			vadd(config->camera->target, config->camera->target, dir);
			config->ReInit(0);
			break;
		}
		case 'd': {
			Vec dir = config->camera->x;
			vnorm(dir);
			vsmul(dir, MOVE_STEP, dir);
			vadd(config->camera->orig, config->camera->orig, dir);
			vadd(config->camera->target, config->camera->target, dir);
			config->ReInit(0);
			break;
		}
		case 'w': {
			Vec dir = config->camera->dir;
			vsmul(dir, MOVE_STEP, dir);
			vadd(config->camera->orig, config->camera->orig, dir);
			vadd(config->camera->target, config->camera->target, dir);
			config->ReInit(0);
			break;
		}
		case 's': {
			Vec dir = config->camera->dir;
			vsmul(dir, -MOVE_STEP, dir);
			vadd(config->camera->orig, config->camera->orig, dir);
			vadd(config->camera->target, config->camera->target, dir);
			config->ReInit(0);
			break;
		}
		case 'r':
			config->camera->orig.y += MOVE_STEP;
			config->camera->target.y += MOVE_STEP;
			config->ReInit(0);
			break;
		case 'f':
			config->camera->orig.y -= MOVE_STEP;
			config->camera->target.y -= MOVE_STEP;
			config->ReInit(0);
			break;
		case '+':
			config->currentSphere = (config->currentSphere + 1) % config->sphereCount;
			fprintf(stderr, "Selected sphere %d (%f %f %f)\n", config->currentSphere,
					config->spheres[config->currentSphere].p.x,
							config->spheres[config->currentSphere].p.y,
							config->spheres[config->currentSphere].p.z);
			config->ReInitScene();
			break;
		case '-':
			config->currentSphere = (config->currentSphere + (config->sphereCount - 1)) % config->sphereCount;
			fprintf(stderr, "Selected sphere %d (%f %f %f)\n", config->currentSphere,
					config->spheres[config->currentSphere].p.x,
							config->spheres[config->currentSphere].p.y,
							config->spheres[config->currentSphere].p.z);
			config->ReInitScene();
			break;
		case '4':
			config->spheres[config->currentSphere].p.x -= 0.5f * MOVE_STEP;
			config->ReInitScene();
			break;
		case '6':
			config->spheres[config->currentSphere].p.x += 0.5f * MOVE_STEP;
			config->ReInitScene();
			break;
		case '8':
			config->spheres[config->currentSphere].p.z -= 0.5f * MOVE_STEP;
			config->ReInitScene();
			break;
		case '2':
			config->spheres[config->currentSphere].p.z += 0.5f * MOVE_STEP;
			config->ReInitScene();
			break;
		case '9':
			config->spheres[config->currentSphere].p.y += 0.5f * MOVE_STEP;
			config->ReInitScene();
			break;
		case '3':
			config->spheres[config->currentSphere].p.y -= 0.5f * MOVE_STEP;
			config->ReInitScene();
			break;
		case 'h':
			printHelp = (!printHelp);
			break;
		case 'k':
			showWorkLoad = (!showWorkLoad);
			break;
		case 'n':
			config->selectedDevice = (config->selectedDevice + config->GetRenderDevice().size() - 1) %
					config->GetRenderDevice().size();
			break;
		case 'm':
			config->selectedDevice = (config->selectedDevice + 1) % config->GetRenderDevice().size();
			break;
		case 'v':
			if (config->IsProfiling())
				cerr << "Please, wait for the end of the profiling phase" << endl;
			else
				config->DecPerfIndex(config->selectedDevice);
			break;
		case 'b':
			if (config->IsProfiling())
				cerr << "Please, wait for the end of the profiling phase" << endl;
			else
			config->IncPerfIndex(config->selectedDevice);
			break;
		default:
			break;
	}
}

void specialFunc(int key, int x, int y) {
	switch (key) {
		case GLUT_KEY_UP: {
			Vec t = config->camera->target;
			vsub(t, t, config->camera->orig);
			t.y = t.y * cos(-ROTATE_STEP) + t.z * sin(-ROTATE_STEP);
			t.z = -t.y * sin(-ROTATE_STEP) + t.z * cos(-ROTATE_STEP);
			vadd(t, t, config->camera->orig);
			config->camera->target = t;
			config->ReInit(0);
			break;
		}
		case GLUT_KEY_DOWN: {
			Vec t = config->camera->target;
			vsub(t, t, config->camera->orig);
			t.y = t.y * cos(ROTATE_STEP) + t.z * sin(ROTATE_STEP);
			t.z = -t.y * sin(ROTATE_STEP) + t.z * cos(ROTATE_STEP);
			vadd(t, t, config->camera->orig);
			config->camera->target = t;
			config->ReInit(0);
			break;
		}
		case GLUT_KEY_LEFT: {
			Vec t = config->camera->target;
			vsub(t, t, config->camera->orig);
			t.x = t.x * cos(-ROTATE_STEP) - t.z * sin(-ROTATE_STEP);
			t.z = t.x * sin(-ROTATE_STEP) + t.z * cos(-ROTATE_STEP);
			vadd(t, t, config->camera->orig);
			config->camera->target = t;
			config->ReInit(0);
			break;
		}
		case GLUT_KEY_RIGHT: {
			Vec t = config->camera->target;
			vsub(t, t, config->camera->orig);
			t.x = t.x * cos(ROTATE_STEP) - t.z * sin(ROTATE_STEP);
			t.z = t.x * sin(ROTATE_STEP) + t.z * cos(ROTATE_STEP);
			vadd(t, t, config->camera->orig);
			config->camera->target = t;
			config->ReInit(0);
			break;
		}
		case GLUT_KEY_PAGE_UP:
			config->camera->target.y += MOVE_STEP;
			config->ReInit(0);
			break;
		case GLUT_KEY_PAGE_DOWN:
			config->camera->target.y -= MOVE_STEP;
			config->ReInit(0);
			break;
		default:
			break;
	}
}

void idleFunc(void) {
	UpdateRendering();

	glutPostRedisplay();
}

void InitGlut(int argc, char *argv[], unsigned int width, unsigned int height) {
	glutInitWindowSize(width, height);
	glutInitWindowPosition(0, 0);
	glutInitDisplayMode(GLUT_RGB | GLUT_DOUBLE);
	glutInit(&argc, argv);

	glutCreateWindow("SmallptGPU V2.0 (Written by David Bucciarelli)");
}

void RunGlut() {
	glutReshapeFunc(reshapeFunc);
	glutKeyboardFunc(keyFunc);
	glutSpecialFunc(specialFunc);
	glutDisplayFunc(displayFunc);
	glutIdleFunc(idleFunc);

	glMatrixMode(GL_PROJECTION);
	glViewport(0, 0, config->width, config->height);
	glLoadIdentity();
	glOrtho(0.f, config->width - 1.f, 0.f, config->height - 1.f, -1.f, 1.f);

	glutMainLoop();
}
