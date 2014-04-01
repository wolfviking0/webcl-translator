__kernel void ker(__global int * A, __global int * B, __global int * C, int width)
{
	int row_no = 128*get_global_id(0) + get_global_id(1);
 
	int sum = 0;
	if(row_no < width){
		for(int i=0;i<width;i++){
			sum = 0;
			for(int j=0;j<width;j++){
				sum = sum + (A[width*row_no+j]*B[width*j+i]);
			}
			C[width*row_no+i] = sum;
		}
	}
}
