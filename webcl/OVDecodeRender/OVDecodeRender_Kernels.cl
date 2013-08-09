/* ============================================================

Copyright (c) 2011 Advanced Micro Devices, Inc.  All rights reserved.
 
Redistribution and use of this material is permitted under the following 
conditions:
 
Redistributions must retain the above copyright notice and all terms of this 
license.
 
In no event shall anyone redistributing or accessing or using this material 
commence or participate in any arbitration or legal action relating to this 
material against Advanced Micro Devices, Inc. or any copyright holders or 
contributors. The foregoing shall survive any expiration or termination of 
this license or any agreement or access or use related to this material. 

ANY BREACH OF ANY TERM OF THIS LICENSE SHALL RESULT IN THE IMMEDIATE REVOCATION 
OF ALL RIGHTS TO REDISTRIBUTE, ACCESS OR USE THIS MATERIAL.

THIS MATERIAL IS PROVIDED BY ADVANCED MICRO DEVICES, INC. AND ANY COPYRIGHT 
HOLDERS AND CONTRIBUTORS "AS IS" IN ITS CURRENT CONDITION AND WITHOUT ANY 
REPRESENTATIONS, GUARANTEE, OR WARRANTY OF ANY KIND OR IN ANY WAY RELATED TO 
SUPPORT, INDEMNITY, ERROR FREE OR UNINTERRUPTED OPERA TION, OR THAT IT IS FREE 
FROM DEFECTS OR VIRUSES.  ALL OBLIGATIONS ARE HEREBY DISCLAIMED - WHETHER 
EXPRESS, IMPLIED, OR STATUTORY - INCLUDING, BUT NOT LIMITED TO, ANY IMPLIED 
WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
ACCURACY, COMPLETENESS, OPERABILITY, QUALITY OF SERVICE, OR NON-INFRINGEMENT. 
IN NO EVENT SHALL ADVANCED MICRO DEVICES, INC. OR ANY COPYRIGHT HOLDERS OR 
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, REVENUE, DATA, OR PROFITS; OR 
BUSINESS INTERRUPTION) HOWEVER CAUSED OR BASED ON ANY THEORY OF LIABILITY 
ARISING IN ANY WAY RELATED TO THIS MATERIAL, EVEN IF ADVISED OF THE POSSIBILITY 
OF SUCH DAMAGE. THE ENTIRE AND AGGREGATE LIABILITY OF ADVANCED MICRO DEVICES, 
INC. AND ANY COPYRIGHT HOLDERS AND CONTRIBUTORS SHALL NOT EXCEED TEN DOLLARS 
(US $10.00). ANYONE REDISTRIBUTING OR ACCESSING OR USING THIS MATERIAL ACCEPTS 
THIS ALLOCATION OF RISK AND AGREES TO RELEASE ADVANCED MICRO DEVICES, INC. AND 
ANY COPYRIGHT HOLDERS AND CONTRIBUTORS FROM ANY AND ALL LIABILITIES, 
OBLIGATIONS, CLAIMS, OR DEMANDS IN EXCESS OF TEN DOLLARS (US $10.00). THE 
FOREGOING ARE ESSENTIAL TERMS OF THIS LICENSE AND, IF ANY OF THESE TERMS ARE 
CONSTRUED AS UNENFORCEABLE, FAIL IN ESSENTIAL PURPOSE, OR BECOME VOID OR 
DETRIMENTAL TO ADVANCED MICRO DEVICES, INC. OR ANY COPYRIGHT HOLDERS OR 
CONTRIBUTORS FOR ANY REASON, THEN ALL RIGHTS TO REDISTRIBUTE, ACCESS OR USE 
THIS MATERIAL SHALL TERMINATE IMMEDIATELY. MOREOVER, THE FOREGOING SHALL 
SURVIVE ANY EXPIRATION OR TERMINATION OF THIS LICENSE OR ANY AGREEMENT OR 
ACCESS OR USE RELATED TO THIS MATERIAL.

NOTICE IS HEREBY PROVIDED, AND BY REDISTRIBUTING OR ACCESSING OR USING THIS 
MATERIAL SUCH NOTICE IS ACKNOWLEDGED, THAT THIS MATERIAL MAY BE SUBJECT TO 
RESTRICTIONS UNDER THE LAWS AND REGULATIONS OF THE UNITED STATES OR OTHER 
COUNTRIES, WHICH INCLUDE BUT ARE NOT LIMITED TO, U.S. EXPORT CONTROL LAWS SUCH 
AS THE EXPORT ADMINISTRATION REGULATIONS AND NATIONAL SECURITY CONTROLS AS 
DEFINED THEREUNDER, AS WELL AS STATE DEPARTMENT CONTROLS UNDER THE U.S. 
MUNITIONS LIST. THIS MATERIAL MAY NOT BE USED, RELEASED, TRANSFERRED, IMPORTED,
EXPORTED AND/OR RE-EXPORTED IN ANY MANNER PROHIBITED UNDER ANY APPLICABLE LAWS, 
INCLUDING U.S. EXPORT CONTROL LAWS REGARDING SPECIFICALLY DESIGNATED PERSONS, 
COUNTRIES AND NATIONALS OF COUNTRIES SUBJECT TO NATIONAL SECURITY CONTROLS. 
MOREOVER, THE FOREGOING SHALL SURVIVE ANY EXPIRATION OR TERMINATION OF ANY 
LICENSE OR AGREEMENT OR ACCESS OR USE RELATED TO THIS MATERIAL.

NOTICE REGARDING THE U.S. GOVERNMENT AND DOD AGENCIES: This material is 
provided with "RESTRICTED RIGHTS" and/or "LIMITED RIGHTS" as applicable to 
computer software and technical data, respectively. Use, duplication, 
distribution or disclosure by the U.S. Government and/or DOD agencies is 
subject to the full extent of restrictions in all applicable regulations, 
including those found at FAR52.227 and DFARS252.227 et seq. and any successor 
regulations thereof. Use of this material by the U.S. Government and/or DOD 
agencies is acknowledgment of the proprietary rights of any copyright holders 
and contributors, including those of Advanced Micro Devices, Inc., as well as 
the provisions of FAR52.227-14 through 23 regarding privately developed and/or 
commercial computer software.

This license forms the entire agreement regarding the subject matter hereof and 
supersedes all proposals and prior discussions and writings between the parties 
with respect thereto. This license does not affect any ownership, rights, title,
or interest in, or relating to, this material. No terms of this license can be 
modified or waived, and no breach of this license can be excused, unless done 
so in a writing signed by all affected parties. Each term of this license is 
separately enforceable. If any term of this license is determined to be or 
becomes unenforceable or illegal, such term shall be reformed to the minimum 
extent necessary in order for this license to remain in effect in accordance 
with its terms as modified by such reformation. This license shall be governed 
by and construed in accordance with the laws of the State of Texas without 
regard to rules on conflicts of law of any state or jurisdiction or the United 
Nations Convention on the International Sale of Goods. All disputes arising out 
of this license shall be subject to the jurisdiction of the federal and state 
courts in Austin, Texas, and all defenses are hereby waived concerning personal 
jurisdiction and venue of these courts.

============================================================ */


//#define SATURATE_MANUALLY

// Remove pitch kernel
__kernel void removePitch(__global uchar* input,
                          __global uchar *output,
                          int video_pitch)
{
    int x = get_global_id(0);
    int y = get_global_id(1);
    
    int pos_output = x + y * get_global_size(0);
    int pos_input = x + y * video_pitch;
    
    output[pos_output] = input[pos_input];
}

#ifdef USE_GL_INTEROP
__constant sampler_t imageSampler = CLK_NORMALIZED_COORDS_FALSE | CLK_ADDRESS_CLAMP | CLK_FILTER_NEAREST;
#endif

// Convert NV12 format to RGBA
__kernel void NV12toRGB(__global uchar *input,
#ifdef USE_GL_INTEROP
                        write_only image2d_t output)
#else
                        __global uchar4 *output)
#endif
{
    int2 id = (int2)(get_global_id(0), get_global_id(1));
    
    uint width = get_global_size(0);
    uint height = get_global_size(1);
    
    float Y = convert_float(input[id.x + id.y * width]);
    float U = convert_float(input[width * height + (id.y >> 1) * width + (id.x >> 1) * 2]);
    float V = convert_float(input[width * height + (id.y >> 1) * width + (id.x >> 1) * 2 + 1]);

#ifdef USE_GL_INTEROP
    int2 pos = (int2)(id.x, height - id.y - 1);
    float B = (1.164*(Y-16.0) + 2.018*(U-128.0))/255.0;
    float G = (1.164*(Y-16.0) - 0.813*(V-128.0) - 0.391*(U-128.0))/255.0;
    float R = (1.164*(Y-16.0) + 1.596*(V-128.0))/255.0;
    write_imagef(output, pos, (float4)(R, G, B, 1.0));
#else
    float B = (1.164*(Y-16.0) + 2.018*(U-128.0));
    float G = (1.164*(Y-16.0) - 0.813*(V-128.0) - 0.391*(U-128.0));
    float R = (1.164*(Y-16.0) + 1.596*(V-128.0));

#ifdef SATURATE_MANUALLY
    if(B < 0)
        B = 0;
    if(B > 255)
        B = 255;
        
    if(G < 0)
        G = 0;
    if(G > 255)
        G = 255;
        
    if(R < 0)
        R = 0;
    if(R > 255)
        R = 255;
    
    uchar BLUE = convert_uchar(B);
    uchar GREEN = convert_uchar(G);
    uchar RED = convert_uchar(R);
#else
    uchar BLUE = convert_uchar_sat(B);
    uchar GREEN = convert_uchar_sat(G);
    uchar RED = convert_uchar_sat(R);
#endif
    output[id.x + width * (height - id.y - 1)] = (uchar4)(RED, GREEN, BLUE, 255);
#endif
}

/*
 * Transpose Kernel 
 * input image is transposed by reading the data into a block
 * and writing it to output image
 */
__kernel void transpose_kernel
#ifdef USE_GL_INTEROP
                      (write_only image2d_t output,
#else
                      (__global uchar4 *output,
#endif
                      __global uchar4  *input,
                      __local  uchar4 *block,
                      const    uint    width,
                      const    uint    height,
                      const    uint blockSize)
{
    uint globalIdx = get_global_id(0);
    uint globalIdy = get_global_id(1);
    
    uint localIdx = get_local_id(0);
    uint localIdy = get_local_id(1);
    
    /* copy from input to local memory */
    block[localIdy * blockSize + localIdx] = input[globalIdy*width + globalIdx];

    /* wait until the whole block is filled */
    barrier(CLK_LOCAL_MEM_FENCE);

    /* calculate the corresponding raster indices of source and target */
    uint sourceIndex = localIdy * blockSize + localIdx;
    uint targetIndex = globalIdy + globalIdx * height; 
    
#ifdef USE_GL_INTEROP
    int2 pos = (int2)(globalIdy, globalIdx);
    float4 temp = convert_float4(block[sourceIndex]) / 255.0f;
    write_imagef(output, pos, temp);
#else
    output[targetIndex] = block[sourceIndex];
#endif
}

#ifdef USE_GL_INTEROP
__kernel void copy(read_only image2d_t input,
                   __global uchar4 *output)
{
    int2 coord = (int2)(get_global_id(0), get_global_size(1) - get_global_id(1) - 1);
    int pos = get_global_id(0) + get_global_size(0) * get_global_id(1);
    float4 temp = read_imagef(input, imageSampler, coord) * 255.0;
    output[pos] = convert_uchar4_sat(temp);
}
#endif
    
/*  Recursive Gaussian filter
 *  parameters:	
 *      input - pointer to input data 
 *      output - pointer to output data 
 *      width  - image width
 *      iheight  - image height
 *      a0-a3, b1, b2, coefp, coefn - gaussian parameters
 */
__kernel void RecursiveGaussian_kernel(
#ifdef USE_GL_INTEROP
                                       read_only image2d_t input,
#else
                                       __global uchar4* input,
#endif
                                       __global uchar4* output, 
                                       const int width, const int height, 
                                       const float a0, const float a1, 
                                       const float a2, const float a3, 
                                       const float b1, const float b2, 
                                       const float coefp, const float coefn)
{
    // compute x : current column ( kernel executes on 1 column )
    unsigned int x = get_global_id(0);

    if (x >= width) 
    return;

    // start forward filter pass
    float4 xp = (float4)0.0f;  // previous input
    float4 yp = (float4)0.0f;  // previous output
    float4 yb = (float4)0.0f;  // previous output by 2

    for (int y = 0; y < height; y++) 
    {
        int pos = x + y * width;
#ifdef USE_GL_INTEROP
        int2 coord = (int2)(x, y);
        float4 temp = convert_float4(read_imagef(input, imageSampler, coord) * 255.0);
#else
        float4 temp = convert_float4(input[pos]);
#endif
        float4 xc = temp;
        float4 yc = (a0 * xc) + (a1 * xp) - (b1 * yp) - (b2 * yb);
        output[pos] = (uchar4)(yc.x, yc.y, yc.z, yc.w);
        xp = xc; 
        yb = yp; 
        yp = yc; 

    }
     barrier(CLK_GLOBAL_MEM_FENCE);

    // start reverse filter pass: ensures response is symmetrical
    float4 xn = (float4)(0.0f);
    float4 xa = (float4)(0.0f);
    float4 yn = (float4)(0.0f);
    float4 ya = (float4)(0.0f);

    for (int y = height - 1; y > -1; y--) 
    {
        int pos = x + y * width;
#ifdef USE_GL_INTEROP
        int2 coord = (int2)(x, y);
        float4 temp = convert_float4(read_imagef(input, imageSampler, coord) * 255.0);
#else
        float4 temp = convert_float4(input[pos]);
#endif
        float4 xc =  temp;
        float4 yc = (a2 * xn) + (a3 * xa) - (b1 * yn) - (b2 * ya);
        xa = xn; 
        xn = xc; 
        ya = yn; 
        yn = yc;
        float4 temp2 = convert_float4(output[pos]) + yc;
        output[pos] = convert_uchar4(temp2);
    }
}