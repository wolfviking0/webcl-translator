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

/*
 * Based on smallpt, a Path Tracer by Kevin Beason, 2008
 * Modified by David Bucciarelli to show the output via OpenGL/GLUT, ported
 * to C, work with float, fixed RR, ported to OpenCL, etc.
 */

#include "displayfunc.h"

using namespace std;

int main(int argc, char *argv[]) {
	try {
		cerr << "Usage: " << argv[0] << endl;
		cerr << "Usage: " << argv[0] << " <use CPU devices (0 or 1)> <use GPU devices (0 or 1)> <GPU workgroup size (0=default value or anything > 0 and power of 2)> <window width> <window height> <scene file>" << endl;

		// It is important to initialize OpenGL before OpenCL
		unsigned int width;
		unsigned int height;
		if (argc == 7) {
			width = atoi(argv[4]);
			height = atoi(argv[5]);
		} else if (argc == 1) {
			width = 512;
			height = 512;
		} else
			exit(-1);

		InitGlut(argc, argv, width, height);

		if (argc == 7)
			config = new RenderConfig(argv[6], width, height,
					(atoi(argv[1]) == 1), (atoi(argv[2]) == 1), atoi(argv[3]));
		else if (argc == 1)
			config = new RenderConfig("scenes/cornell.scn", width, height, true, true, 0);
		else
			exit(-1);

		RunGlut();
	} catch (cl::Error err) {
		cerr << "ERROR: " << err.what() << "(" << err.err() << ")" << endl;
	}

	return EXIT_SUCCESS;
}
