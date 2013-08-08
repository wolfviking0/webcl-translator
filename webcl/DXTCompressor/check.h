#ifndef CHECK_H
#define CHECK_H

#define SIZE (512 / 4) * (512 / 4) * 8 

struct CheckData {
	int 	dxtheader;
	int 	width;
	int 	height;
  unsigned int refSize;
  unsigned int ref[ SIZE ];
  unsigned int genSize;
  unsigned int gen[ SIZE ];
  char message[ 256 ];
	float	result;
};

extern "C" {
	void checkResult(char *data, int size);
}
#endif //CHECK_H
