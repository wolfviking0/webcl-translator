#ifndef __DEFINE__H
#define __DEFINE__H

//---------------------------------------------------------------------------------------- 
// Define sized-based typedefs up to 32-bits. 
//---------------------------------------------------------------------------------------- 
typedef signed char             int8; 
typedef unsigned char           uint8; 
 
typedef signed short            int16; 
typedef unsigned short          uint16; 
 
typedef signed int              int32; 
typedef unsigned int            uint32; 

typedef struct mpeg2_BufferDescription {
  uint32 dwTypeIndex;
  uint32 dwBufferIndex;
  uint32 dwDataOffset;
  uint32 dwDataSize;
  uint32 dwFirstMBaddress;
  uint32 dwNumMBsInBuffer;
  uint32 dwWidth;
  uint32 dwHeight;
  uint32 dwStride;
  uint32 dwReservedBits;
} _mpeg2_BufferDescription;

typedef struct mpeg2_MBctrl
{
    uint16 wMBaddress;
    uint16 wMBtype;
    uint32 wMB_SNL;
    uint16 wPatternCode;
    char   bNumCoef[6];
    uint32 MVector[4];
} _mpeg2_MBctrl;

typedef struct _mpeg2_PicParams{
    uint16 wDecodedPictureIndex;
    uint16 wDeblockedPictureIndex;

    uint16 wForwardRefPictureIndex;
    uint16 wBackwardRefPictureIndex;

    uint16 wPicWidthInMBminus1;
    uint16 wPicHeightInMBminus1;

    uint8 bMacroblockWidthMinus1;
    uint8 bMacroblockHeightMinus1;

    uint8 bBlockWidthMinus1;
    uint8 bBlockHeightMinus1;

    uint8 bBPPminus1;

    uint8 bPicStructure;
    uint8 bSecondField;
    uint8 bPicIntra;
    uint8 bPicBackwardPrediction;

    uint8 bBidirectionalAveragingMode;
    uint8 bMVprecisionAndChromaRelation;
    uint8 bChromaFormat;

    uint8 bPicScanFixed;
    uint8 bPicScanMethod;
    uint8 bPicReadbackRequests;

    uint8 bRcontrol;
    uint8 bPicSpatialResid8;
    uint8 bPicOverflowBlocks;
    uint8 bPicExtrapolation;

    uint8 bPicDeblocked;
    uint8 bPicDeblockConfined;
    uint8 bPic4MVallowed;
    uint8 bPicOBMC;
    uint8 bPicBinPB;
    uint8 bMV_RPS;

    uint8 bReservedBits;

    uint16 wBitstreamFcodes;
    uint16 wBitstreamPCEelements;
    uint8 bBitstreamConcealmentNeed;
    uint8 bBitstreamConcealmentMethod;
    
//here is for DXVA of mpeg2_vld(udec engine)
    uint8 bMP1_mode;

    // sequence header
    uint8 load_intra_quantiser_matrix;      // if 1, indicates intra_quantiser_matrix contains new intra quant matrix values.
    uint8 load_nonintra_quantiser_matrix;   // if 1, indicates nonintra_quantiser_matrix contains new non-intra quant matrix values.
    uint8 reserved_quantiser_alignement[2]; // dummy for alignment
    uint8 intra_quantiser_matrix[64];       // if load_intra_quant_matrix is 1, contains new intra quant matrix values.
    uint8 nonintra_quantiser_matrix[64];    // if load_intra_quant_matrix is 1, contains new non-intra quant matrix values.

    uint8 load_chroma_intra_quantiser_matrix;
    uint8 chroma_intra_quantiser_matrix[64];
    uint8 load_chroma_nonintra_quantiser_matrix;
    uint8 chroma_nonintra_quantiser_matrix[64];
    
    // sequence extension
    uint8 profile_and_level_indication;     // profile and level indication, sequence extension
    uint8 progressive_sequence;
    uint8 chroma_format;                    // chroma format. It should be always 0x1 (4:2:0)

    // picture header
    uint8 picture_coding_type;              // pic_coding_type; Table 6-12

    // picture coding extension
    uint8 f_code[2][2];                     // f-codes; picture coding extension
    uint8 intra_dc_precision;               // intra_dc_precision
    uint8 pic_structure;                    // pic_structure. 0x1 - top field; 0x2 - bottom field; 0x3 - frame.
    uint8 top_field_first;                  // top_field_first flag
    uint8 frame_pred_frame_dct;             // frame_pred_frame_dct flag
    uint8 concealment_motion_vectors;       // concealment motion vectors
    uint8 q_scale_type;                     // q_scale_type
    uint8 intra_vlc_format;                 // intra_vlc_format
    uint8 alternate_scan;                   // alternate_scan
    uint8 repeat_first_field;
    uint8 chroma_420_type;
    uint8 progressive_frame;
    uint8 composite_display_flag;
    uint8 v_axis;
    uint8 field_sequence;
    uint8 sub_carrier;
    uint8 sub_carrier_phase;
    uint8 burst_amplitude;
//end of DXVA of mpeg2_vld

    uint32 dwPicWidthDisplayed;
    uint32 dwPicHeightDisplayed;
    uint32 error_b_pic;
} mpeg2_PicParams;

#endif
