# 1 "<stdin>"
# 1 "<built-in>"
# 1 "<command-line>"
# 1 "<stdin>"
# 26 "<stdin>"
# 1 "renderconfig.h" 1
# 27 "renderconfig.h"
# 1 "camera.h" 1
# 27 "camera.h"
# 1 "vec.h" 1
# 27 "vec.h"
typedef struct {
 float x, y, z;
} Vec;
# 28 "camera.h" 2

typedef struct {

 Vec orig, target;

 Vec dir, x, y;
} Camera;
# 28 "renderconfig.h" 2

typedef struct {
 unsigned int width, height;
 int superSamplingSize;
 int actvateFastRendering;
 int enableShadow;

 unsigned int maxIterations;
 float epsilon;
 float mu[4];
 float light[3];
 Camera camera;
} RenderingConfig;
# 27 "<stdin>" 2





static float4 QuatMult(const float4 q1, const float4 q2) {
 float4 r;


 r.x = q1.x * q2.x - q1.y * q2.y - q1.z * q2.z - q1.w * q2.w;

 r.y = q1.x * q2.y + q1.y * q2.x + q1.z * q2.w - q1.w * q2.z;

 r.z = q1.x * q2.z - q1.y * q2.w + q1.z * q2.x + q1.w * q2.y;

 r.w = q1.x * q2.w + q1.y * q2.z - q1.z * q2.y + q1.w * q2.x;

 return r;
}

static float4 QuatSqr(const float4 q) {
 float4 r;

 r.x = q.x * q.x - q.y * q.y - q.z * q.z - q.w * q.w;
 r.y = 2.f * q.x * q.y;
 r.z = 2.f * q.x * q.z;
 r.w = 2.f * q.x * q.w;

 return r;
}

static void IterateIntersect(float4 *q, float4 *qp,
  const float4 c, const uint maxIterations) {
 float4 q0 = *q;
 float4 qp0 = *qp;

 for (uint i = 0; i < maxIterations; ++i) {
  qp0 = 2.f * QuatMult(q0, qp0);
  q0 = QuatSqr(q0) + c;

  if (dot(q0, q0) > 1e1f)
   break;
 }

 *q = q0;
 *qp = qp0;
}

static float IntersectJulia(const float4 eyeRayOrig, const float4 eyeRayDir,
  const float4 c, const uint maxIterations, const float epsilon,
  float4 *hitPoint, uint *steps) {
 float dist;
 float4 r0 = eyeRayOrig;

 uint s = 0;
 do {
  float4 z = r0;
  float4 zp = (float4) (1.f, 0.f, 0.f, 0.f);

  IterateIntersect(&z, &zp, c, maxIterations);

  const float normZP = length(zp);


  if (normZP == 0.f)
   break;

  const float normZ = length(z);
  dist = 0.5f * normZ * log(normZ) / normZP;

  r0 += eyeRayDir * dist;
  s++;
 } while ((dist > epsilon) && (dot(r0, r0) < 4.f));

 *hitPoint = r0;
 *steps = s;
 return dist;
}



float IntersectFloorSphere(const float4 eyeRayOrig, const float4 eyeRayDir) {
 const float4 op = ((float4)(0.f, -1000.f - 2.f, 0.f, 0.f)) - eyeRayOrig;
 const float b = dot(op, eyeRayDir);
 float det = b * b - dot(op, op) + 1000.f * 1000.f;

 if (det < 0.f)
  return -1.f;
 else
  det = sqrt(det);

 float t = b - det;
 if (t > 0.f)
  return t;
 else {

  return -1.f;
 }
}

float IntersectBoundingSphere(const float4 eyeRayOrig, const float4 eyeRayDir) {
 const float4 op = -eyeRayOrig;
 const float b = dot(op, eyeRayDir);
 float det = b * b - dot(op, op) + 4.f;

 if (det < 0.f)
  return -1.f;
 else
  det = sqrt(det);

 float t = b - det;
 if (t > 0.f)
  return t;
 else {
  t = b + det;

  if (t > 0.f) {

   return 0.0f;
  } else
   return -1.f;
 }
}

static float4 NormEstimate(const float4 p, const float4 c,
  const float delta, const uint maxIterations) {
 float4 N;
 float4 qP = p;
 float gradX, gradY, gradZ;

 float4 gx1 = qP - (float4)(1e-4f, 0.f, 0.f, 0.f);
 float4 gx2 = qP + (float4)(1e-4f, 0.f, 0.f, 0.f);
 float4 gy1 = qP - (float4)(0.f, 1e-4f, 0.f, 0.f);
 float4 gy2 = qP + (float4)(0.f, 1e-4f, 0.f, 0.f);
 float4 gz1 = qP - (float4)(0.f, 0.f, 1e-4f, 0.f);
 float4 gz2 = qP + (float4)(0.f, 0.f, 1e-4f, 0.f);

 for (uint i = 0; i < maxIterations; ++i) {
  gx1 = QuatSqr(gx1) + c;
  gx2 = QuatSqr(gx2) + c;
  gy1 = QuatSqr(gy1) + c;
  gy2 = QuatSqr(gy2) + c;
  gz1 = QuatSqr(gz1) + c;
  gz2 = QuatSqr(gz2) + c;
 }

 gradX = length(gx2) - length(gx1);
 gradY = length(gy2) - length(gy1);
 gradZ = length(gz2) - length(gz1);

 N = normalize((float4)(gradX, gradY, gradZ, 0.f));

 return N;
}

static float4 Phong(const float4 light, const float4 eye, const float4 pt,
  const float4 N, const float4 diffuse) {
 const float4 ambient = (float4) (0.05f, 0.05f, 0.05f, 0.f);
 float4 L = normalize(light - pt);
 float NdotL = dot(N, L);
 if (NdotL < 0.f)
  return diffuse * ambient;

 const float specularExponent = 30.f;
 const float specularity = 0.65f;

 float4 E = normalize(eye - pt);
 float4 H = (L + E) * (float)0.5f;

 return diffuse * NdotL +
   specularity * pow(dot(N, H), specularExponent) +
   diffuse * ambient;
}

__kernel void JuliaGPU(
 __global float *pixels,
 const __global RenderingConfig *config,
 const int enableAccumulation,
 const float sampleX,
 const float sampleY) {
    const int gid = get_global_id(0);
 const unsigned width = config->width;
 const unsigned height = config->height;

 const unsigned int x = gid % width;
 const int y = gid / width;


 if (y >= height)
  return;

 const float epsilon = config->actvateFastRendering ? (config->epsilon * (1.f / 0.75f)) : config->epsilon;
 const uint maxIterations = max(1u,
   config->actvateFastRendering ? (config->maxIterations - 1) : config->maxIterations);

 const float4 mu = (float4)(config->mu[0], config->mu[1], config->mu[2], config->mu[3]);
 const float4 light = (float4)(config->light[0], config->light[1], config->light[2], 0.f);
 const __global Camera *camera = &config->camera;





 const float invWidth = 1.f / width;
 const float invHeight = 1.f / height;
 const float kcx = (x + sampleX) * invWidth - .5f;
 const float4 kcx4 = (float4)kcx;
 const float kcy = (y + sampleY) * invHeight - .5f;
 const float4 kcy4 = (float4)kcy;

 const float4 cameraX = (float4)(camera->x.x, camera->x.y, camera->x.z, 0.f);
 const float4 cameraY = (float4)(camera->y.x, camera->y.y, camera->y.z, 0.f);
 const float4 cameraDir = (float4)(camera->dir.x, camera->dir.y, camera->dir.z, 0.f);
 const float4 cameraOrig = (float4)(camera->orig.x, camera->orig.y, camera->orig.z, 0.f);

 const float4 eyeRayDir = normalize(cameraX * kcx4 + cameraY * kcy4 + cameraDir);
 const float4 eyeRayOrig = eyeRayDir * (float4)0.1f + cameraOrig;





 float distSet = IntersectBoundingSphere(eyeRayOrig, eyeRayDir);
 float4 hitPoint;
 if (distSet >= 0.f) {




  uint steps;
  float4 rayOrig = eyeRayOrig + eyeRayDir * (float4)distSet;
  distSet = IntersectJulia(rayOrig, eyeRayDir, mu, maxIterations,
    epsilon, &hitPoint, &steps);
  if (distSet > epsilon)
   distSet = -1.f;
 }





 float distFloor = IntersectFloorSphere(eyeRayOrig, eyeRayDir);





 int doShade = 0;
 int useAO = 1;
 float4 diffuse, n, color;
 if ((distSet < 0.f) && (distFloor < 0.f)) {

  color = (float4)(0.f, 0.1f, 0.3f, 0.f);
 } else if ((distSet >= 0.f) && ((distFloor < 0.f) || (distSet <= distFloor))) {

  diffuse = (float4) (1.f, 0.35f, 0.15f, 0.f);
  n = NormEstimate(hitPoint, mu, distSet, maxIterations);
  doShade = 1;
 } else if ((distFloor >= 0.f) && ((distSet < 0.f) || (distFloor <= distSet))) {

  hitPoint = eyeRayOrig + eyeRayDir * (float4)distFloor;
  n = hitPoint - ((float4)(0.f, -1000.f - 2.f, 0.f, 0.f));
  n = normalize(n);

  const int ix = (hitPoint.x > 0.f) ? hitPoint.x : (1.f - hitPoint.x);
  const int iz = (hitPoint.z > 0.f) ? hitPoint.z : (1.f - hitPoint.z);
  if ((ix + iz) % 2)
   diffuse = (float4) (0.75f, 0.75f, 0.75f, 0.f);
  else
   diffuse = (float4) (0.75f, 0.f, 0.f, 0.f);
  doShade = 1;
  useAO = 0;
 }





 if (doShade) {
  float shadowFactor = 1.f;
  if (config->enableShadow) {
   float4 L = normalize(light - hitPoint);
   float4 rO = hitPoint + n * 1e-2f;
   float4 shadowHitPoint;


   float shadowDistSet = IntersectBoundingSphere(rO, L);
   if (shadowDistSet >= 0.f) {
    uint steps;

    rO = rO + L * (float4)shadowDistSet;
    shadowDistSet = IntersectJulia(rO, L, mu, maxIterations, epsilon,
      &shadowHitPoint, &steps);
    if (shadowDistSet < epsilon) {
     if (useAO) {

      shadowFactor = 0.6f - min(steps / 255.f, 0.5f);
     } else
      shadowFactor = 0.6f;
    }
   } else
    shadowDistSet = -1.f;
  }





  color = Phong(light, eyeRayOrig, hitPoint, n, diffuse) * shadowFactor;
 }





 int offset = 3 * (x + y * width);
 color = clamp(color, (float4)(0.f, 0.f ,0.f, 0.f), (float4)(1.f, 1.f ,1.f, 0.f));
 if (enableAccumulation) {
  pixels[offset++] += color.s0;
  pixels[offset++] += color.s1;
  pixels[offset] += color.s2;
 } else {
  pixels[offset++] = color.s0;
  pixels[offset++] = color.s1;
  pixels[offset] = color.s2;
 }
}
