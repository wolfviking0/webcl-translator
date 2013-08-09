// OVDecode.h
// The following ifdef block is the standard way of creating macros which make exporting 
// from a DLL simpler. All files within this DLL are compiled with the OVDECODE_EXPORTS
// symbol defined on the command line. this symbol should not be defined on any project
// that uses this DLL. This way any other project whose source files include this file see 
// OVDECODE_API functions as being imported from a DLL, whereas this DLL sees symbols
// defined with this macro as being exported.
#ifndef __OVDECODE_H__
#define __OVDECODE_H__

#ifndef OPENVIDEOAPI
#ifdef _WIN32
#define OPENVIDEOAPI __stdcall
#else
#define OPENVIDEOAPI
#endif
#endif // OPENVIDEOAPI

#include "OVDecodeTypes.h"

#ifdef __cplusplus
extern "C" {
#endif // __cplusplus

    int OPENVIDEOAPI fnOVDecode(void);

    /* 
     * This function is used by the application to query the available decode devices. 
     * The ovdecode_device_info contains a unique device_id and the size of the 
     * decode_cap structure for each available device. The decode_cap size is the 
     * size of the decode_cap structure that the application should provide in 
     * the OVDecodeGetDeviceCap call. 
     */
    OVresult OPENVIDEOAPI OVDecodeGetDeviceInfo (
        unsigned int			 *num_device,
        ovdecode_device_info	 *device_info);

    /*
     * This function is used by application to query the decoder capability that includes 
     * codec information and output format that the device can support.
     */
    OVresult OPENVIDEOAPI OVDecodeGetDeviceCap (
        unsigned int  device_id,
        unsigned int  num_of_decode_cap,
        ovdecode_cap *decode_cap_list);

    /*
     * This function is used by the application to create the decode handle from the 
     * platform memory handle. The decode handle can be used in the OVDecodePicture 
     * function as the output decode buffer. The application can create multiple 
     * output buffers to queue up the decode job. 
     */
    ov_handle OPENVIDEOAPI OVCreateOVDHandleFromOPHandle (
        OPMemHandle    platform_memhandle);

    /* 
     * This function is used by the application to release the decode handle. 
     * After release, the handle is invalid and should not be used for decode picture. 
     */
    OVresult OPENVIDEOAPI OVReleaseOVDHandle (
        ov_handle    decode_handle);

    /* 
     * This function is used by the application to acquire the memory objects that 
     * have been created from OpenCL. These objects need to be acquired before they 
     * can be used by the decode function. 
     */
    OVresult OPENVIDEOAPI OVAcquireObject (
        ov_session   session,
        unsigned int  num_handle,
        ov_handle   *decode_handle,
        unsigned int  num_event_in_wait_list,
        OPEventHandle    *event_wait_list,
        OPEventHandle    *event);

    /* 
     * This function is used by the application to release the memory objects that 
     * have been created from OpenCL. The objects need to be released before they 
     * can be used by OpenCL. 
     */
    OVresult OPENVIDEOAPI OVReleaseObject (
        ov_session   session,
        unsigned int  num_handle,
        ov_handle   *decode_handle,
        unsigned int  num_event_in_wait_list,
        OPEventHandle    *event_wait_list,
        OPEventHandle    *event);

    /* 
     * This function is used by the application to create the decode session for 
     * each decoding stream. After the session creation, the decoder is ready to 
     * accept the decode picture job from the application. For multiple streams 
     * decoding, the application can create multiple sessions within the same 
     * platform context and the application is responsible to manage the input and 
     * output buffers for each corresponding decode session.
     */
    ov_session OPENVIDEOAPI OVDecodeCreateSession (
        OPContextHandle        platform_context,
        unsigned int     device_id,
        ovdecode_profile profile,
        ovdecode_format  output_format,
        unsigned int     output_width,
        unsigned int     output_height);

    /* 
     * This function is used by the application to decode a single picture. For multiple 
     * streams decoding, the decode picture jobs from different streams can be interleaved 
     * in any order.
     */
    OVresult OPENVIDEOAPI OVDecodePicture (
        ov_session    session,
        ovd_picture_parameter  *picture_parameter_1,
        void                   *picture_parameter_2,
        unsigned int            picture_parameter_2_size,
        ovd_bitstream_data     *bitstream_data,
        unsigned int            bitstream_data_size,
        ovd_slice_data_control *slice_data_control,
        unsigned int            slice_data_control_size,
        OPMemHandle             output_handle,
        unsigned int            num_event_in_wait_list,
        OPEventHandle          *event_wait_list,
        OPEventHandle          *event,
        unsigned int            picture_id);

    /* 
     * This function is used by the application to destroy the decode session. Destroying a 
     * session will release all associated hardware resources.  No further decoding work 
     * can be performed with the session after it is destroyed.
     */
    OVresult OPENVIDEOAPI OVDecodeDestroySession (
        ov_session session);

#ifdef __cplusplus
};
#endif //  __cplusplus

#endif // __OVDECODE_H__