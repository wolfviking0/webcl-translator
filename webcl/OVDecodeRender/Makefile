EMCC:=../../emscripten
	
EMSCRIPTEN = $(EMCC)
CXX = $(EMSCRIPTEN)/emcc
AR = $(EMSCRIPTEN)/emar
EMCONFIGURE = $(EMSCRIPTEN)/emconfigure
EMMAKE = $(EMSCRIPTEN)/emmake

#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#
# BUILD
#----------------------------------------------------------------------------------------#
#----------------------------------------------------------------------------------------#		
all:
	#python $(EMSCRIPTEN)/tools/file_packager.py OVDecodeRender_H264.data --preload ./OVDecodeDataH264/ --pre-run > OVDecodeRender_H264.js
	#python $(EMSCRIPTEN)/tools/file_packager.py OVDecodeRender_MPEG.data --preload ./OVDecodeDataMPEG/ --pre-run > OVDecodeRender_MPEG.js
	python $(EMSCRIPTEN)/tools/file_packager.py OVDecodeRender_kernel.data --preload OVDecodeRender_Kernels.cl --pre-run > OVDecodeRender_kernel.js
	python $(EMSCRIPTEN)/tools/file_packager.py OVDecodeRender_verify.data --preload verifyH264.image verifyMPEG.image --pre-run > OVDecodeRender_verify.js
	JAVA_HEAP_SIZE=8096m EMCC_DEBUG=1 $(CXX) GLRenderFrame.cpp OVDecodeRender.cpp OVDecodeTest.cpp SDKUtil/SDKApplication.cpp SDKUtil/SDKBitMap.cpp SDKUtil/SDKCommandArgs.cpp SDKUtil/SDKCommon.cpp SDKUtil/SDKFile.cpp SDKUtil/SDKThread.cpp -I./SDKUtil/include -I./ -O0 -s OPENCL_DEBUG=1 -s WARN_ON_UNDEFINED_SYMBOLS=1 -o OVDecodeRender.js
					
clean:
	$(CXX) --clear-cache

	
	
