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

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#if defined(__linux__) || defined(__APPLE__) ||  defined(__EMSCRIPTEN__) 
#include <sys/time.h>
#elif defined (WIN32)
#include <windows.h>
#else
	Unsupported Platform !!!
#endif
    
#ifdef WIN32
#define _USE_MATH_DEFINES
#endif
#include <math.h>

#include "displayfunc.h"

extern int end(int);
extern void ReInit(const int);
extern void ReInitScene();
extern void UpdateRendering();
extern void UpdateCamera();

float *pixels;
char captionBuffer[256];
RenderingConfig config;

static int printHelp = 1;

double WallClockTime() {
#if defined(__linux__) || defined(__APPLE__)
	struct timeval t;
	gettimeofday(&t, NULL);

	return t.tv_sec + t.tv_usec / 1000000.0;
#elif defined (WIN32)
	return GetTickCount() / 1000.0;
#elif defined (__EMSCRIPTEN__)
	return (emscripten_get_now() / 1000.0);
#else
	Unsupported Platform !!!
#endif
}

unsigned int TextureIds[3];
static unsigned int TextureTarget = GL_TEXTURE_2D;
static unsigned int TextureInternal             = GL_RGB;
static unsigned int TextureInternal2            = GL_RGBA;
static unsigned int TextureFormat               = GL_RGB;
static unsigned int TextureFormat2              = GL_RGBA;
static unsigned int TextureType                 = GL_FLOAT;
static unsigned int ActiveTextureUnit           = GL_TEXTURE1_ARB;
static size_t TextureTypeSize                   = sizeof(float);

static float VertexPos[4][2]            = { { -1.0f, -1.0f },
                                            { +1.0f, -1.0f },
                                            { +1.0f, +1.0f },
                                            { -1.0f, +1.0f } };
static float TexCoords[4][2];

static void PrintString(void *font, const char *string) {
#ifndef __EMSCRIPTEN__
  int len, i;

	len = (int)strlen(string);
	for (i = 0; i < len; i++)
		glutBitmapCharacter(font, string[i]);
#endif
}

static void PrintHelp() {
#ifndef __EMSCRIPTEN__
	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	glColor4f(0.f, 0.f, 0.f, 0.5f);
	glRecti(40, 40, 600, 440);

	glColor3f(1.f, 1.f, 1.f);
	glRasterPos2i(300, 420);
	PrintString(GLUT_BITMAP_HELVETICA_18, "Help");

	glRasterPos2i(60, 390);
	PrintString(GLUT_BITMAP_HELVETICA_18, "h - toggle Help");
	glRasterPos2i(60, 360);
	PrintString(GLUT_BITMAP_HELVETICA_18, "arrow Keys - rotate camera");
	glRasterPos2i(60, 330);
	PrintString(GLUT_BITMAP_HELVETICA_18, "Mouse button 0 + Mouse X, Y - rotate camera around the center");
	glRasterPos2i(60, 300);
	PrintString(GLUT_BITMAP_HELVETICA_18, "Shift + Mouse button 0 + Mouse X, Y - rotate camera");
	glRasterPos2i(60, 270);
	PrintString(GLUT_BITMAP_HELVETICA_18, "Mouse button 2 + Mouse X, Y - rotate light");
	glRasterPos2i(60, 240);
	PrintString(GLUT_BITMAP_HELVETICA_18, "a, s, d, w - move camera");
	glRasterPos2i(60, 210);
	PrintString(GLUT_BITMAP_HELVETICA_18, "1, 2 - decrease, increase epsilon");
	glRasterPos2i(60, 180);
	PrintString(GLUT_BITMAP_HELVETICA_18, "3, 4 - decrease, increase max. iterations");
	glRasterPos2i(60, 150);
	PrintString(GLUT_BITMAP_HELVETICA_18, "3, 4 - decrease, increase max. iterations");
	glRasterPos2i(60, 120);
	PrintString(GLUT_BITMAP_HELVETICA_18, "5, 6 - decrease, increase samples per pixel");
	glRasterPos2i(60, 90);
	PrintString(GLUT_BITMAP_HELVETICA_18, "Mouse button 0 on red rectangles - change Mu values");
	glRasterPos2i(60, 60);
	PrintString(GLUT_BITMAP_HELVETICA_18, "l - toggle shadow/AO");

	glDisable(GL_BLEND);
#endif
}

void UpdateCamera() {
	vsub(config.camera.dir, config.camera.target, config.camera.orig);
	vnorm(config.camera.dir);

	const Vec up = {0.f, 1.f, 0.f};
	vxcross(config.camera.x, config.camera.dir, up);
	vnorm(config.camera.x);
	vsmul(config.camera.x, config.width * .5135f / config.height, config.camera.x);

	vxcross(config.camera.y, config.camera.x, config.camera.dir);
	vnorm(config.camera.y);
	vsmul(config.camera.y, .5135f, config.camera.y);
}

#define MU_RECT_SIZE 64
static void DrawJulia(const int id, const int origX, const int origY, const float cR, const float cI) {
	float buffer[MU_RECT_SIZE][MU_RECT_SIZE][4];
	const float invSize = 3.f / MU_RECT_SIZE;
	int i, j;
	for (j = 0; j < MU_RECT_SIZE; ++j) {
		for (i = 0; i < MU_RECT_SIZE; ++i) {
			float x = i * invSize - 1.5f;
			float y = j * invSize - 1.5f;

			int iter;
			for (iter = 0; iter < 64; ++iter) {
				const float x2 = x * x;
				const float y2 = y * y;
				if (x2 + y2 > 4.f)
					break;

				const float newx = x2 - y2 +cR;
				const float newy = 2.f * x * y + cI;
				x = newx;
				y = newy;
			}

			buffer[i][j][0] = iter / 64.f;
			buffer[i][j][1] = 0.f;
			buffer[i][j][2] = 0.f;
			buffer[i][j][3] = 0.5f;
		}
	}

#ifndef __EMSCRIPTEN__
	glRasterPos2i(origX, origY);
	glDrawPixels(MU_RECT_SIZE, MU_RECT_SIZE, GL_RGBA, GL_FLOAT, buffer);
#else
 	glEnable( TextureTarget );
    glBindTexture( TextureTarget, TextureIds[id] );

    if(buffer) {
        glTexSubImage2D(TextureTarget, 0, 0, 0, MU_RECT_SIZE, MU_RECT_SIZE, TextureFormat2, TextureType, buffer);
    }

  	glBegin(GL_TRIANGLE_STRIP);
    glTexCoord2i( 0, 0 ); glVertex3f( origX, origY, 0 );
    glTexCoord2i( 0, 1 ); glVertex3f( origX, origY+MU_RECT_SIZE, 0 );
    glTexCoord2i( 1, 0 ); glVertex3f( origX+MU_RECT_SIZE, origY, 0 );
    glTexCoord2i( 1, 1 ); glVertex3f( origX+MU_RECT_SIZE,origY+MU_RECT_SIZE, 0 );
    glEnd();

    glDisable( TextureTarget );
    glBindTexture( TextureTarget, 0 );
#endif
  
}

static void 
RenderTexture( float *pvData )
{
    glDisable( GL_LIGHTING );
 
    // Setup our screen
    glViewport(0,0,config.width, config.height);
    glMatrixMode(GL_PROJECTION);
    
    GLfloat matrixData[] = { 2.0/config.width,        0,  0,  0,
                              0, 2.0/config.height,  0,  0,
                                    0,        0, 1,  0,
                                   -1,        -1,  0,  1 };
    glLoadMatrixf(matrixData); // test loadmatrix
    glMatrixMode( GL_MODELVIEW );
    glLoadIdentity();

    glEnable( TextureTarget );
    glBindTexture( TextureTarget, TextureIds[0] );

    if(pvData) {
        glTexSubImage2D(TextureTarget, 0, 0, 0, config.width, config.height, TextureFormat, TextureType, pvData);
    }

  	glBegin(GL_TRIANGLE_STRIP);
    glTexCoord2i( 0, 0 ); glVertex3f( 0, 0, 0 );
    glTexCoord2i( 0, 1 ); glVertex3f( 0, config.height, 0 );
    glTexCoord2i( 1, 0 ); glVertex3f( config.width, 0, 0 );
    glTexCoord2i( 1, 1 ); glVertex3f( config.width, config.height, 0 );
    glEnd();

    glDisable( TextureTarget );
    glBindTexture( TextureTarget, 0 );

}

void displayFunc(void) {
	UpdateRendering();

	glClear(GL_COLOR_BUFFER_BIT);
  
#ifndef __EMSCRIPTEN__
  glRasterPos2i(0, 0);
  glDrawPixels(config.width, config.height, GL_RGB, GL_FLOAT, pixels);
#else
  RenderTexture(pixels);    
#endif
  
#ifndef __EMSCRIPTEN__
	// Caption line 0
	glColor3f(1.f, 1.f, 1.f);
	glRasterPos2i(4, 10);
	PrintString(GLUT_BITMAP_HELVETICA_18, captionBuffer);

	// Caption line 1
	char captionBuffer2[256];
	sprintf(captionBuffer2, "Shadow/AO %d - SuperSampling %dx%d - Fast rendering (%s)",
			config.enableShadow, config.superSamplingSize, config.superSamplingSize,
			config.actvateFastRendering ? "active" : "not active");
	glRasterPos2i(4, 30);
	PrintString(GLUT_BITMAP_HELVETICA_18, captionBuffer2);
	// Caption line 2
	sprintf(captionBuffer2, "Epsilon %.5f - Max. Iter. %u",
			config.epsilon, config.maxIterations);
	glRasterPos2i(4, 50);
	PrintString(GLUT_BITMAP_HELVETICA_18, captionBuffer2);
	// Caption line 3
	sprintf(captionBuffer2, "Mu = (%.3f, %.3f, %.3f, %.3f)",
			config.mu[0], config.mu[1], config.mu[2], config.mu[3]);
	glRasterPos2i(4, 70);
	PrintString(GLUT_BITMAP_HELVETICA_18, captionBuffer2);
#endif
  
	// Draw Mu costant
	glEnable(GL_BLEND);
	glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
	const int baseMu1 = config.width - MU_RECT_SIZE - 2;
	const int baseMu2 = 1;
	DrawJulia(1,baseMu1, baseMu2, config.mu[0], config.mu[1]);
	const int baseMu3 = config.width - MU_RECT_SIZE - 2;
	const int baseMu4 = MU_RECT_SIZE + 2;
	DrawJulia(2,baseMu3, baseMu4, config.mu[2], config.mu[3]);
	glDisable(GL_BLEND);

	glColor3f(1.f, 1.f, 1.f);
	const int mu1 = baseMu1 + MU_RECT_SIZE * (config.mu[0] + 1.5f) / 3.f;
	const int mu2 = baseMu2 + MU_RECT_SIZE * (config.mu[1] + 1.5f) / 3.f;
	glBegin(GL_LINES);
	glVertex2i(mu1 - 4, mu2);
	glVertex2i(mu1 + 4, mu2);
	glVertex2i(mu1, mu2 - 4);
	glVertex2i(mu1, mu2 + 4);
	glEnd();

	const int mu3 = baseMu3 + MU_RECT_SIZE * (config.mu[2] + 1.5f) / 3.f;
	const int mu4 = baseMu4 + MU_RECT_SIZE * (config.mu[3] + 1.5f) / 3.f;
	glBegin(GL_LINES);
	glVertex2i(mu3 - 4, mu4);
	glVertex2i(mu3 + 4, mu4);
	glVertex2i(mu3, mu4 - 4);
	glVertex2i(mu3, mu4 + 4);
	glEnd();

#ifndef __EMSCRIPTEN__
	// Title
	glColor3f(1.f, 1.f, 1.f);
	glRasterPos2i(4, config.height - 16);
	PrintString(GLUT_BITMAP_HELVETICA_18, "MandelbulbGPU V1.0 (Written by David Bucciarelli)");
  
	if (printHelp) {
		glPushMatrix();
		glLoadIdentity();
		glOrtho(-0.5, 639.5, -0.5, 479.5, -1.0, 1.0);

		PrintHelp();

		glPopMatrix();
	}
#endif

    glFlush();
    
    glutSwapBuffers();
}

static double lastUserInputTime;

void reshapeFunc(int newWidth, int newHeight) {
	config.width = newWidth;
	config.height = newHeight;

	glViewport(0, 0, config.width, config.height);
	glLoadIdentity();
	glOrtho(-0.5f, config.width - 0.5f, -0.5f, config.height - 0.5f, -1.f, 1.f);

	ReInit(1);

	glutPostRedisplay();
}

#define MOVE_STEP 0.5f
#define ROTATE_STEP (2.f * M_PI / 180.f)
void keyFunc(unsigned char key, int x, int y) {
	switch (key) {
		case 'p': {
			FILE *f = fopen("image.ppm", "w"); // Write image to PPM file.
			if (!f) {
				fprintf(stderr, "Failed to open image file: image.ppm\n");
			} else {
				fprintf(f, "P3\n%d %d\n%d\n", config.width, config.height, 255);

				unsigned int x, y;
				for (y = 0; y < config.height; ++y) {
					for (x = 0; x < config.width; ++x) {
						const int offset = 3 * (x + (config.height - y - 1) * config.width);
						const int r = toInt(pixels[offset]);
						const int g = toInt(pixels[offset + 1]);
						const int b = toInt(pixels[offset + 2]);
						fprintf(f, "%d %d %d ", r, g, b);
					}
				}

				fclose(f);
			}
			break;
		}
		case 27: /* Escape key */
			fprintf(stderr, "Done.\n");
#ifdef __EMSCRIPTEN__
			end(0);
      		webclEndProfile();
#endif			
			exit(0);
			break;
		case ' ': /* Refresh display */
			break;
		case 'a': {
			Vec dir = config.camera.x;
			vnorm(dir);
			vsmul(dir, -MOVE_STEP, dir);
			vadd(config.camera.orig, config.camera.orig, dir);
			vadd(config.camera.target, config.camera.target, dir);
			break;
		}
		case 'd': {
			Vec dir = config.camera.x;
			vnorm(dir);
			vsmul(dir, MOVE_STEP, dir);
			vadd(config.camera.orig, config.camera.orig, dir);
			vadd(config.camera.target, config.camera.target, dir);
			break;
		}
		case 'w': {
			Vec dir = config.camera.dir;
			vsmul(dir, MOVE_STEP, dir);
			vadd(config.camera.orig, config.camera.orig, dir);
			vadd(config.camera.target, config.camera.target, dir);
			break;
		}
		case 's': {
			Vec dir = config.camera.dir;
			vsmul(dir, -MOVE_STEP, dir);
			vadd(config.camera.orig, config.camera.orig, dir);
			vadd(config.camera.target, config.camera.target, dir);
			break;
		}
		case 'r':
			config.camera.orig.y += MOVE_STEP;
			config.camera.target.y += MOVE_STEP;
			break;
		case 'f':
			config.camera.orig.y -= MOVE_STEP;
			config.camera.target.y -= MOVE_STEP;
			break;
		case 'l':
			config.enableShadow = (!config.enableShadow);
			break;
		case 'h':
			printHelp = (!printHelp);
			break;
		case '1':
			config.epsilon *= 0.75f;
			break;
		case '2':
			config.epsilon *= 1.f / 0.75f;
			break;
		case '3':
			config.maxIterations = max(1, config.maxIterations - 1);
			break;
		case '4':
			config.maxIterations = min(12, config.maxIterations + 1);
			break;
		case '5':
			config.superSamplingSize = max(1, config.superSamplingSize - 1);
			break;
		case '6':
			config.superSamplingSize = min(5, config.superSamplingSize + 1);
			break;
		default:
			break;
	}

	ReInit(0);
	glutPostRedisplay();
	lastUserInputTime = WallClockTime();
}


static void rotateLightX(const float k) {
	const float y = config.light[1];
	const float z = config.light[2];
	config.light[1] = y * cos(k) + z * sin(k);
	config.light[2] = -y * sin(k) + z * cos(k);
}

static void rotateLightY(const float k) {
	const float x = config.light[0];
	const float z = config.light[2];
	config.light[0] = x * cos(k) - z * sin(k);
	config.light[2] = x * sin(k) + z * cos(k);
}

static void rotateCameraXbyOrig(const float k) {
	Vec t = config.camera.orig;
	config.camera.orig.y = t.y * cos(k) + t.z * sin(k);
	config.camera.orig.z = -t.y * sin(k) + t.z * cos(k);
}

static void rotateCameraYbyOrig(const float k) {
	Vec t = config.camera.orig;
	config.camera.orig.x = t.x * cos(k) - t.z * sin(k);
	config.camera.orig.z = t.x * sin(k) + t.z * cos(k);
}

static void rotateCameraX(const float k) {
	Vec t = config.camera.target;
	vsub(t, t, config.camera.orig);
	t.y = t.y * cos(k) + t.z * sin(k);
	t.z = -t.y * sin(k) + t.z * cos(k);
	vadd(t, t, config.camera.orig);
	config.camera.target = t;
}

static void rotateCameraY(const float k) {
	Vec t = config.camera.target;
	vsub(t, t, config.camera.orig);
	t.x = t.x * cos(k) - t.z * sin(k);
	t.z = t.x * sin(k) + t.z * cos(k);
	vadd(t, t, config.camera.orig);
	config.camera.target = t;
}

void specialFunc(int key, int x, int y) {
	switch (key) {
		case GLUT_KEY_UP:
			rotateCameraX(-ROTATE_STEP);
			break;
		case GLUT_KEY_DOWN:
			rotateCameraX(ROTATE_STEP);
			break;
		case GLUT_KEY_LEFT:
			rotateCameraY(-ROTATE_STEP);
			break;
		case GLUT_KEY_RIGHT:
			rotateCameraY(ROTATE_STEP);
			break;
		case GLUT_KEY_PAGE_UP:
			config.camera.target.y += MOVE_STEP;
			break;
		case GLUT_KEY_PAGE_DOWN:
			config.camera.target.y -= MOVE_STEP;
			break;
		default:
			break;
	}

	ReInit(0);
	glutPostRedisplay();
	lastUserInputTime = WallClockTime();
}

static int mouseButton0 = 0;
static int shiftMouseButton0 = 0;
static int muMouseButton0 = 0;
static int mouseButton2 = 0;
static int mouseGrabLastX = 0;
static int mouseGrabLastY = 0;

void mouseFunc(int button, int state, int x, int y) {
	if (button == 0) {
		if (state == GLUT_DOWN) {
			// Record start position
			mouseGrabLastX = x;
			mouseGrabLastY = y;
			mouseButton0 = 1;

			int mod = glutGetModifiers();
			if (mod == GLUT_ACTIVE_SHIFT)
				shiftMouseButton0 = 1;
			else {
				shiftMouseButton0 = 0;

				const int ry = config.height - y - 1;
				const int baseMu1 = config.width - MU_RECT_SIZE - 2;
				const int baseMu2 = 1;
				const int baseMu3 = config.width - MU_RECT_SIZE - 2;
				const int baseMu4 = MU_RECT_SIZE + 2;
				
				if ((x >= baseMu1 && x <= baseMu1 + MU_RECT_SIZE) &&
						(ry >= baseMu2 && ry <= baseMu2 + MU_RECT_SIZE)) {
					muMouseButton0 = 1;
					config.mu[0] = 3.f * (x - baseMu1) / (float)MU_RECT_SIZE - 1.5f;
					config.mu[1] = 3.f * (ry - baseMu2) / (float)MU_RECT_SIZE - 1.5f;
					ReInit(0);
					glutPostRedisplay();
				} else if ((x >= baseMu3 && x <= baseMu3 + MU_RECT_SIZE) &&
						(ry >= baseMu4 && ry <= baseMu4 + MU_RECT_SIZE)) {
					muMouseButton0 = 1;
					config.mu[2] = 3.f * (x - baseMu3) / (float)MU_RECT_SIZE - 1.5f;
					config.mu[3] = 3.f * (ry - baseMu4) / (float)MU_RECT_SIZE - 1.5f;
					ReInit(0);
					glutPostRedisplay();
				} else
					muMouseButton0 = 0;
			}
		} else if (state == GLUT_UP) {
			mouseButton0 = 0;
			shiftMouseButton0 = 0;
			muMouseButton0 = 0;
		}
	} else if (button == 2) {
		if (state == GLUT_DOWN) {
			// Record start position
			mouseGrabLastX = x;
			mouseGrabLastY = y;
			mouseButton2 = 1;
		} else if (state == GLUT_UP) {
			mouseButton2 = 0;
		}
	}
	lastUserInputTime = WallClockTime();
}

void motionFunc(int x, int y) {
	int needRedisplay = 1;

	if (mouseButton0) {
		const int ry = config.height - y - 1;
		const int baseMu1 = config.width - MU_RECT_SIZE - 2;
		const int baseMu2 = 1;
		const int baseMu3 = config.width - MU_RECT_SIZE - 2;
		const int baseMu4 = MU_RECT_SIZE + 2;

		// Check if the click was over first Mu red rectangle
		if (muMouseButton0 && (x >= baseMu1 && x <= baseMu1 + MU_RECT_SIZE) &&
				(ry >= baseMu2 && ry <= baseMu2 + MU_RECT_SIZE)) {
			config.mu[0] = 3.f * (x - baseMu1) / (float)MU_RECT_SIZE - 1.5f;
			config.mu[1] = 3.f * (ry - baseMu2) / (float)MU_RECT_SIZE - 1.5f;
			ReInit(0);
		} else if (muMouseButton0 && (x >= baseMu3 && x <= baseMu3 + MU_RECT_SIZE) &&
				(ry >= baseMu4 && ry <= baseMu4 + MU_RECT_SIZE)) {
			config.mu[2] = 3.f * (x - baseMu3) / (float)MU_RECT_SIZE - 1.5f;
			config.mu[3] = 3.f * (ry - baseMu4) / (float)MU_RECT_SIZE - 1.5f;
			ReInit(0);
		} else if (!muMouseButton0) {
			const int distX = x - mouseGrabLastX;
			const int distY = y - mouseGrabLastY;

			if (!shiftMouseButton0) {
				vclr(config.camera.target);
				rotateCameraYbyOrig(0.2f * distX * ROTATE_STEP);
				rotateCameraXbyOrig(0.2f * distY * ROTATE_STEP);
			} else {
				rotateCameraY(0.1f * distX * ROTATE_STEP);
				rotateCameraX(0.1f * distY * ROTATE_STEP);
			}

			mouseGrabLastX = x;
			mouseGrabLastY = y;

			ReInit(0);
		}
	} else if (mouseButton2) {
		const int distX = x - mouseGrabLastX;
		const int distY = y - mouseGrabLastY;

		rotateLightX(-0.2f * distY * ROTATE_STEP);
		rotateLightY(-0.2f * distX * ROTATE_STEP);

		mouseGrabLastX = x;
		mouseGrabLastY = y;

		ReInit(0);
	} else
		needRedisplay = 0;

	if (needRedisplay) {
		glutPostRedisplay();
		lastUserInputTime = WallClockTime();
	}
}

void timerFunc(const int id) {
	// Check the time since last screen update
	const double elapsedTime = WallClockTime() - lastUserInputTime;

	if (elapsedTime > 5.0) {
		if (config.actvateFastRendering) {
			// Enable supersampling
			config.actvateFastRendering = 0;
			glutPostRedisplay();
		}
	} else
		config.actvateFastRendering = 1;

	glutTimerFunc(1000, timerFunc, 0);
}

static void CreateTexture(unsigned int width, unsigned int height)
{    
    
    printf("Creating Texture 1 %d x %d...\n", width, height);
  	printf("Creating Texture 2 %d x %d...\n", MU_RECT_SIZE, MU_RECT_SIZE);
	printf("Creating Texture 3 %d x %d...\n", MU_RECT_SIZE, MU_RECT_SIZE);

#ifndef __EMSCRIPTEN__
    glActiveTextureARB(ActiveTextureUnit);
#else
    glActiveTexture(ActiveTextureUnit);
#endif
    
    glGenTextures( 3, TextureIds );

    for (int i = 0; i < 3; i++) {
    	
    	glBindTexture(TextureTarget, TextureIds[i]);

#ifndef __EMSCRIPTEN__
    	glTexParameteri(TextureTarget, GL_TEXTURE_WRAP_S, GL_CLAMP);
    	glTexParameteri(TextureTarget, GL_TEXTURE_WRAP_T, GL_CLAMP);
#endif
    	glTexParameteri(TextureTarget, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    	glTexParameteri(TextureTarget, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    	if (i==0)
    		glTexImage2D(TextureTarget, 0, TextureInternal, width, height, 0, TextureFormat, TextureType, 0);
    	else
    		glTexImage2D(TextureTarget, 0, TextureInternal2, MU_RECT_SIZE, MU_RECT_SIZE, 0, TextureFormat2, TextureType, 0);
    	glBindTexture(TextureTarget, 0);
	}
}

static int 
SetupGraphics(void)
{
    CreateTexture(config.width, config.height);

    glClearColor (0.0, 0.0, 0.0, 0.0);

    glDisable(GL_DEPTH_TEST);
    glActiveTexture(GL_TEXTURE0);
    glViewport(0, 0, config.width, config.height);
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();

    TexCoords[3][0] = 0.0f;
    TexCoords[3][1] = 0.0f;
    TexCoords[2][0] = config.width;
    TexCoords[2][1] = 0.0f;
    TexCoords[1][0] = config.width;
    TexCoords[1][1] = config.height;
    TexCoords[0][0] = 0.0f;
    TexCoords[0][1] = config.height;

    glEnableClientState(GL_VERTEX_ARRAY);
    glEnableClientState(GL_TEXTURE_COORD_ARRAY);
    glVertexPointer(2, GL_FLOAT, 0, VertexPos);
    glClientActiveTexture(GL_TEXTURE0);
    glTexCoordPointer(2, GL_FLOAT, 0, TexCoords);
    return GL_NO_ERROR;
}

void InitGlut(int argc, char *argv[], char *windowTittle) {
	lastUserInputTime = WallClockTime();

  glutInitWindowSize(config.width, config.height);
  glutInitWindowPosition(0,0);
  glutInitDisplayMode(GLUT_RGB | GLUT_DOUBLE);
	glutInit(&argc, argv);

	glutCreateWindow(windowTittle);

  glutReshapeFunc(reshapeFunc);
  glutKeyboardFunc(keyFunc);
  glutSpecialFunc(specialFunc);
  glutDisplayFunc(displayFunc);
	glutMouseFunc(mouseFunc);
	glutMotionFunc(motionFunc);
	glutTimerFunc(1000, timerFunc, 0);

	glMatrixMode(GL_PROJECTION);
  
  SetupGraphics();
}
