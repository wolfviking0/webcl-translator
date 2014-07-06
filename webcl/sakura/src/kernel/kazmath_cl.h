//
//  kazmath_cl.h
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-07-01.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//



typedef struct quat
{
    float x,y,z,w;
}quat;

typedef struct vec
{
    float x,y,z;
}vec;

typedef struct vec4
{
    float x,y,z,w;
}vec4;

typedef struct mat4
{
    float m[16];
}mat4;

bool mat4Inverse(mat4* pOut, const mat4* pM) {
    mat4 tmp;
    float det;
    int i;
    
    tmp.m[0] = pM->m[5]  * pM->m[10] * pM->m[15] -
    pM->m[5]  * pM->m[11] * pM->m[14] -
    pM->m[9]  * pM->m[6]  * pM->m[15] +
    pM->m[9]  * pM->m[7]  * pM->m[14] +
    pM->m[13] * pM->m[6]  * pM->m[11] -
    pM->m[13] * pM->m[7]  * pM->m[10];
    
    tmp.m[4] = -pM->m[4]  * pM->m[10] * pM->m[15] +
    pM->m[4]  * pM->m[11] * pM->m[14] +
    pM->m[8]  * pM->m[6]  * pM->m[15] -
    pM->m[8]  * pM->m[7]  * pM->m[14] -
    pM->m[12] * pM->m[6]  * pM->m[11] +
    pM->m[12] * pM->m[7]  * pM->m[10];
    
    tmp.m[8] = pM->m[4]  * pM->m[9] * pM->m[15] -
    pM->m[4]  * pM->m[11] * pM->m[13] -
    pM->m[8]  * pM->m[5] * pM->m[15] +
    pM->m[8]  * pM->m[7] * pM->m[13] +
    pM->m[12] * pM->m[5] * pM->m[11] -
    pM->m[12] * pM->m[7] * pM->m[9];
    
    tmp.m[12] = -pM->m[4]  * pM->m[9] * pM->m[14] +
    pM->m[4]  * pM->m[10] * pM->m[13] +
    pM->m[8]  * pM->m[5] * pM->m[14] -
    pM->m[8]  * pM->m[6] * pM->m[13] -
    pM->m[12] * pM->m[5] * pM->m[10] +
    pM->m[12] * pM->m[6] * pM->m[9];
    
    tmp.m[1] = -pM->m[1]  * pM->m[10] * pM->m[15] +
    pM->m[1]  * pM->m[11] * pM->m[14] +
    pM->m[9]  * pM->m[2] * pM->m[15] -
    pM->m[9]  * pM->m[3] * pM->m[14] -
    pM->m[13] * pM->m[2] * pM->m[11] +
    pM->m[13] * pM->m[3] * pM->m[10];
    
    tmp.m[5] = pM->m[0]  * pM->m[10] * pM->m[15] -
    pM->m[0]  * pM->m[11] * pM->m[14] -
    pM->m[8]  * pM->m[2] * pM->m[15] +
    pM->m[8]  * pM->m[3] * pM->m[14] +
    pM->m[12] * pM->m[2] * pM->m[11] -
    pM->m[12] * pM->m[3] * pM->m[10];
    
    tmp.m[9] = -pM->m[0]  * pM->m[9] * pM->m[15] +
    pM->m[0]  * pM->m[11] * pM->m[13] +
    pM->m[8]  * pM->m[1] * pM->m[15] -
    pM->m[8]  * pM->m[3] * pM->m[13] -
    pM->m[12] * pM->m[1] * pM->m[11] +
    pM->m[12] * pM->m[3] * pM->m[9];
    
    tmp.m[13] = pM->m[0]  * pM->m[9] * pM->m[14] -
    pM->m[0]  * pM->m[10] * pM->m[13] -
    pM->m[8]  * pM->m[1] * pM->m[14] +
    pM->m[8]  * pM->m[2] * pM->m[13] +
    pM->m[12] * pM->m[1] * pM->m[10] -
    pM->m[12] * pM->m[2] * pM->m[9];
    
    tmp.m[2] = pM->m[1]  * pM->m[6] * pM->m[15] -
    pM->m[1]  * pM->m[7] * pM->m[14] -
    pM->m[5]  * pM->m[2] * pM->m[15] +
    pM->m[5]  * pM->m[3] * pM->m[14] +
    pM->m[13] * pM->m[2] * pM->m[7] -
    pM->m[13] * pM->m[3] * pM->m[6];
    
    tmp.m[6] = -pM->m[0]  * pM->m[6] * pM->m[15] +
    pM->m[0]  * pM->m[7] * pM->m[14] +
    pM->m[4]  * pM->m[2] * pM->m[15] -
    pM->m[4]  * pM->m[3] * pM->m[14] -
    pM->m[12] * pM->m[2] * pM->m[7] +
    pM->m[12] * pM->m[3] * pM->m[6];
    
    tmp.m[10] = pM->m[0]  * pM->m[5] * pM->m[15] -
    pM->m[0]  * pM->m[7] * pM->m[13] -
    pM->m[4]  * pM->m[1] * pM->m[15] +
    pM->m[4]  * pM->m[3] * pM->m[13] +
    pM->m[12] * pM->m[1] * pM->m[7] -
    pM->m[12] * pM->m[3] * pM->m[5];
    
    tmp.m[14] = -pM->m[0]  * pM->m[5] * pM->m[14] +
    pM->m[0]  * pM->m[6] * pM->m[13] +
    pM->m[4]  * pM->m[1] * pM->m[14] -
    pM->m[4]  * pM->m[2] * pM->m[13] -
    pM->m[12] * pM->m[1] * pM->m[6] +
    pM->m[12] * pM->m[2] * pM->m[5];
    
    tmp.m[3] = -pM->m[1] * pM->m[6] * pM->m[11] +
    pM->m[1] * pM->m[7] * pM->m[10] +
    pM->m[5] * pM->m[2] * pM->m[11] -
    pM->m[5] * pM->m[3] * pM->m[10] -
    pM->m[9] * pM->m[2] * pM->m[7] +
    pM->m[9] * pM->m[3] * pM->m[6];
    
    tmp.m[7] = pM->m[0] * pM->m[6] * pM->m[11] -
    pM->m[0] * pM->m[7] * pM->m[10] -
    pM->m[4] * pM->m[2] * pM->m[11] +
    pM->m[4] * pM->m[3] * pM->m[10] +
    pM->m[8] * pM->m[2] * pM->m[7] -
    pM->m[8] * pM->m[3] * pM->m[6];
    
    tmp.m[11] = -pM->m[0] * pM->m[5] * pM->m[11] +
    pM->m[0] * pM->m[7] * pM->m[9] +
    pM->m[4] * pM->m[1] * pM->m[11] -
    pM->m[4] * pM->m[3] * pM->m[9] -
    pM->m[8] * pM->m[1] * pM->m[7] +
    pM->m[8] * pM->m[3] * pM->m[5];
    
    tmp.m[15] = pM->m[0] * pM->m[5] * pM->m[10] -
    pM->m[0] * pM->m[6] * pM->m[9] -
    pM->m[4] * pM->m[1] * pM->m[10] +
    pM->m[4] * pM->m[2] * pM->m[9] +
    pM->m[8] * pM->m[1] * pM->m[6] -
    pM->m[8] * pM->m[2] * pM->m[5];
    
    det = pM->m[0] * tmp.m[0] + pM->m[1] * tmp.m[4] + pM->m[2] * tmp.m[8] + pM->m[3] * tmp.m[12];
    
    if (det == 0) {
        return false;
    }
    
    det = 1.0 / det;
    
    for (i = 0; i < 16; i++) {
        pOut->m[i] = tmp.m[i] * det;
    }
    
    return true;
}

vec* vecMultiplyMat4(vec* pOut, const vec* pV, const mat4* pM) {
    vec4 v;
    
    v.x = pV->x * pM->m[0] + pV->y * pM->m[4] + pV->z * pM->m[8] + pM->m[12];
    v.y = pV->x * pM->m[1] + pV->y * pM->m[5] + pV->z * pM->m[9] + pM->m[13];
    v.z = pV->x * pM->m[2] + pV->y * pM->m[6] + pV->z * pM->m[10] + pM->m[14];
    v.w = pV->x * pM->m[3] + pV->y * pM->m[7] + pV->z * pM->m[11] + pM->m[15];
    
    pOut->x = v.x / v.w;
    pOut->y = v.y / v.w;
    pOut->z = v.z / v.w;
    
    return pOut;
}

mat4* multiplyMatrices(mat4* pOut, const mat4* pM1, const mat4* pM2)
{
	float mat[16];
    
	const float *m1 = pM1->m, *m2 = pM2->m;
    
	pOut->m[0] = m1[0] * m2[0] + m1[4] * m2[1] + m1[8] * m2[2] + m1[12] * m2[3];
	pOut->m[1] = m1[1] * m2[0] + m1[5] * m2[1] + m1[9] * m2[2] + m1[13] * m2[3];
	pOut->m[2] = m1[2] * m2[0] + m1[6] * m2[1] + m1[10] * m2[2] + m1[14] * m2[3];
	pOut->m[3] = m1[3] * m2[0] + m1[7] * m2[1] + m1[11] * m2[2] + m1[15] * m2[3];
    
	pOut->m[4] = m1[0] * m2[4] + m1[4] * m2[5] + m1[8] * m2[6] + m1[12] * m2[7];
	pOut->m[5] = m1[1] * m2[4] + m1[5] * m2[5] + m1[9] * m2[6] + m1[13] * m2[7];
	pOut->m[6] = m1[2] * m2[4] + m1[6] * m2[5] + m1[10] * m2[6] + m1[14] * m2[7];
	pOut->m[7] = m1[3] * m2[4] + m1[7] * m2[5] + m1[11] * m2[6] + m1[15] * m2[7];
    
	pOut->m[8] = m1[0] * m2[8] + m1[4] * m2[9] + m1[8] * m2[10] + m1[12] * m2[11];
	pOut->m[9] = m1[1] * m2[8] + m1[5] * m2[9] + m1[9] * m2[10] + m1[13] * m2[11];
	pOut->m[10] = m1[2] * m2[8] + m1[6] * m2[9] + m1[10] * m2[10] + m1[14] * m2[11];
	pOut->m[11] = m1[3] * m2[8] + m1[7] * m2[9] + m1[11] * m2[10] + m1[15] * m2[11];
    
	pOut->m[12] = m1[0] * m2[12] + m1[4] * m2[13] + m1[8] * m2[14] + m1[12] * m2[15];
	pOut->m[13] = m1[1] * m2[12] + m1[5] * m2[13] + m1[9] * m2[14] + m1[13] * m2[15];
	pOut->m[14] = m1[2] * m2[12] + m1[6] * m2[13] + m1[10] * m2[14] + m1[14] * m2[15];
	pOut->m[15] = m1[3] * m2[12] + m1[7] * m2[13] + m1[11] * m2[14] + m1[15] * m2[15];
    
    
    
	return pOut;
}

void translateMatrix(mat4* pOut, vec* t)
{
    pOut->m[12] += t->x;
    pOut->m[13] += t->y;
    pOut->m[14] += t->z;
}

void buildRotationMatrix(mat4* pOut, quat* pQ)
{
    float xx = pQ->x * pQ->x;
    float xy = pQ->x * pQ->y;
    float xz = pQ->x * pQ->z;
    float xw = pQ->x * pQ->w;
    
    float yy = pQ->y * pQ->y;
    float yz = pQ->y * pQ->z;
    float yw = pQ->y * pQ->w;
    
    float zz = pQ->z * pQ->z;
    float zw = pQ->z * pQ->w;
    
    pOut->m[0] = 1 - 2 * (yy + zz);
    pOut->m[1] = 2 * (xy + zw);
    pOut->m[2] = 2 * (xz - yw);
    pOut->m[3] = 0;
    
    pOut->m[4] = 2 * (xy - zw);
    pOut->m[5] = 1 - 2 * (xx + zz);
    pOut->m[6] = 2 * (yz + xw);
    pOut->m[7] = 0.0;
    
    pOut->m[8] = 2 * (xz + yw);
    pOut->m[9] = 2 * (yz - xw);
    pOut->m[10] = 1 - 2 * (xx + yy);
    pOut->m[11] = 0.0;
    
    
    pOut->m[15] = 1.0;
}
