[Video](http://www.youtube.com/watch?v=xD-gS1JBKeU)

[Original source](https://github.com/kristofe/OpenCLFluids)

Fluid solver written in C and OpenCL which switch between the two. Final project for High Performance Scientific Computing.

The project writeup and discussion as well as presentation slides can be found in the /writeup folder.

The serial c code is in second_order_solver.h and the opencl calls are in cl_solver.h and the kernels are in kernels.cl. The entry point for the entire simulation is in main.c.  The grid size is specified in the three #defines of NX, NY, NZ.  Turning on OpenCL is in the #define USE_OPENCL  at the top of main.c.   

The code was built and tested only on Mac OS X 10.7.5.  Linux build steps are in there and compiled with the class VM but crashed during runtime.  I haven't tested on a native installation of linux.
TO BUILD:
On Mac: make mac
On Linux: make linux

TO RUN:
./fluidsim

The screen will start out black.  Just click and drag your mouse to see something happen.  Also hit the "v" key to see the velocity field.

There are a few keyboard commands that are printed to screen which are the following:

Add densities with the left mouse button
Add velocities with the left mouse button and dragging the mouse
Toggle density/velocity display with the 'v' key
Clear the simulation by pressing the 'x' key
switch poisson solvers from jacobi to conjugate gradient by pressing the 'c' key
switch advection scheme from RK2 to MacCormack by pressing the 'm' key
toggle vorticity confinement by pressing the 'o' key
Quit by pressing the 'q' key

The code is offered under the MIT license.
