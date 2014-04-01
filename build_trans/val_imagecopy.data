// copy image1 to image2 using image read function

__kernel void image_copy(__read_only image2d_t image1, __write_only image2d_t image2)
{

	const int xout = get_global_id(0);
	const int yout = get_global_id(1);
	const sampler_t sampler=CLK_NORMALIZED_COORDS_FALSE | CLK_ADDRESS_CLAMP | CLK_FILTER_NEAREST;
	float4 pixel;
	
	pixel = read_imagef(image1, sampler, (int2)(xout,yout));
	write_imagef(image2, (int2)(xout,yout), pixel);
}