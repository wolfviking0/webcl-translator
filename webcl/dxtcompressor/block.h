/*
 * Copyright 1993-2009 NVIDIA Corporation.  All rights reserved.
 *
 * NVIDIA Corporation and its licensors retain all intellectual property and 
 * proprietary rights in and to this software and related documentation. 
 * Any use, reproduction, disclosure, or distribution of this software 
 * and related documentation without an express license agreement from
 * NVIDIA Corporation is strictly prohibited.
 *
 * Please refer to the applicable NVIDIA end user license agreement (EULA) 
 * associated with this source code for terms and conditions that govern 
 * your use of this NVIDIA software.
 * 
 */

// Helper structs and functions to validate the output of the compressor.
// We cannot simply do a bitwise compare, because different compilers produce different
// results for different targets due to floating point arithmetic.

#ifndef BLOCK_H
#define BLOCK_H

#include <oclUtils.h>

union Color32 {
    struct {
        unsigned char b, g, r, a;
    };
    unsigned int u;
};

union Color16 {
    struct {
        unsigned short b : 5;
        unsigned short g : 6;
        unsigned short r : 5;
    };
    unsigned short u;
};

struct BlockDXT1
{
    Color16 col0;
    Color16 col1;
    union {
        unsigned char row[4];
        unsigned int indices;
    };
    
    void decompress(Color32 colors[16]) const;
};

int compareColors(const Color32 * b0, const Color32 * b1);

int compareBlock(const BlockDXT1 * b0, const BlockDXT1 * b1);

#endif //BLOCK_H
