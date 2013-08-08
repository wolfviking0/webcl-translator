#include "check.h"
#include "block.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten/emscripten.h>

extern "C" {
	void checkResult(char *data, int size) {
		
    CheckData* c = (CheckData*)data;

    if (c->refSize != SIZE || c->genSize != SIZE) {
      c->result = -2.f;
      emscripten_worker_respond(data, size);
    }

    // compare the reference image data to the sample/generated image
    float rms = 0;
    for (uint y = 0; y < c->height; y += 4)
      {
        for (uint x = 0; x < c->width; x += 4)
        {
          // binary comparison of data
          uint referenceBlockIdx = ((y/4) * (c->width/4) + (x/4));
          uint resultBlockIdx = ((y/4) * (c->width/4) + (x/4));        

          int cmp = compareBlock(((BlockDXT1 *)c->gen) + resultBlockIdx, ((BlockDXT1 *)c->ref) + referenceBlockIdx);

          // log deviations, if any
          if (cmp != 0.0f) 
          {
            compareBlock(((BlockDXT1 *)c->gen) + resultBlockIdx, ((BlockDXT1 *)c->ref) + referenceBlockIdx);
          }
          rms += cmp;
        }
    }

    rms /= c->width * c->height * 3;

    c->result = rms;

    emscripten_worker_respond(data, size);
  }
}