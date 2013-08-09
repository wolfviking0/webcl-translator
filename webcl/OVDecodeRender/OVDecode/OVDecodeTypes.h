#ifndef __OVDECODETYPES_H__
#define __OVDECODETYPES_H__

#define OVresult    bool
#define ov_handle  void *
#define ov_session void *
#define ovd_bitstream_data unsigned char *

#define OPContextHandle void *
#define OPMemHandle void *
#define OPEventHandle void *

typedef struct {
    unsigned int    device_id;
    unsigned int    max_decode_stream;
    unsigned int    decode_cap_size;
} ovdecode_device_info;

// OpenVideo Decode Profile 
typedef enum
{
	OVD_H264_BASELINE_41 = 1,// H.264 bitstream acceleration baseline profile up to level 4.1
	OVD_H264_MAIN_41,		 // H.264 bitstream acceleration main profile up to level 4.1
	OVD_H264_HIGH_41,		 // H.264 bitstream acceleration high profile up to level 4.1
	OVD_VC1_SIMPLE,			 // VC-1 bitstream acceleration simple profile
	OVD_VC1_MAIN,			 // VC-1 bitstream acceleration main profile
	OVD_VC1_ADVANCED,		 // VC-1 bitstream acceleration advanced profile
	OVD_MPEG2_VLD,			 // VC-1 bitstream acceleration advanced profile
	OVD_H264_BASELINE_51,    // H.264 bitstream acceleration baseline profile up to level 5.1
	OVD_H264_MAIN_51,		 // H.264 bitstream acceleration main profile up to level 5.1
	OVD_H264_HIGH_51,		 // H.264 bitstream acceleration high profile up to level 5.1
	OVD_H264_STEREO_HIGH,	 // H.264 bitstream acceleration stereo high profile
} ovdecode_profile;

// OpenVideo Decode Format
typedef enum
{
    OVD_NV12_INTERLEAVED_AMD = 1, // NV12 Linear Interleaved
    OVD_YV12_INTERLEAVED_AMD
} ovdecode_format;

typedef struct {
    ovdecode_profile    profile;         // codec information about the decode capability
    ovdecode_format     output_format;   // decode output format supported in this device
} ovdecode_cap;

typedef struct
{
    unsigned int    codec_type;
    unsigned int    profile; 
    unsigned int    level; 
    unsigned int    width_in_mb;
    unsigned int    height_in_mb;

    unsigned int    decode_flag;                // Reserved for future features - always 0
    void           *reserved_reference [16];    // Reserved - Not used for bitstream decoding
    unsigned int    reserved [15];              // Reserved for future features - always 0

} ovd_picture_parameter;

typedef struct 
{
    unsigned int    SliceBitsInBuffer;
    unsigned int    SliceDataLocation;     
    unsigned int    SliceBytesInBuffer;
    unsigned int    reserved[5];

} ovd_slice_data_control;

typedef struct
{
    unsigned char     bScalingLists4x4[6][16];
    unsigned char     bScalingLists8x8[2][64];
} ovd_qm_data;

//H.264 picture_parameter_2 structure
typedef struct {
    unsigned short    viewOrderIndex;
    unsigned short    viewID;
    unsigned short    numOfAnchorRefsInL0;
    unsigned short    viewIDofAnchorRefsInL0[15];
    unsigned short    numOfAnchorRefsInL1;
    unsigned short    viewIDofAnchorRefsInL1[15];
    unsigned short    numOfNonAnchorRefsInL0;
    unsigned short    viewIDofNonAnchorRefsInL0[15];
    unsigned short    numOfNonAnchorRefsInL1;
    unsigned short    viewIDofNonAnchorRefsInL1[15];
} mvcElement_t;

typedef struct
{
	union	{
		struct {
			unsigned int    residual_colour_transform_flag	: 1;
			unsigned int    delta_pic_always_zero_flag		: 1;
			unsigned int    gaps_in_frame_num_value_allowed_flag	: 1;
			unsigned int    frame_mbs_only_flag			: 1;
			unsigned int    mb_adaptive_frame_field_flag		: 1;
			unsigned int    direct_8x8_inference_flag		: 1;
			unsigned int    sps_reserved			: 26;
		} sps_flag;
		unsigned int  flag;
	} sps_info;
	
	union {
		struct {
			unsigned int    entropy_coding_mode_flag		: 1;
			unsigned int    pic_order_present_flag		: 1;
			unsigned int    weighted_pred_flag			: 1;
			unsigned int    weighted_bipred_idc			: 2;
			unsigned int    deblocking_filter_control_present_flag	: 1;
			unsigned int    constrained_intra_pred_flag		: 1;
			unsigned int    redundant_pic_cnt_present_flag	: 1;
			unsigned int    transform_8x8_mode_flag		: 1;
			unsigned int    pps_reserved			: 23;
		} pps_flag;
		unsigned int  flag;
	} pps_info;
	
	unsigned int    picture_structure;
	unsigned char   chroma_format;
	unsigned char   bit_depth_luma_minus8;
	unsigned char   bit_depth_chroma_minus8;
	unsigned char   log2_max_frame_num_minus4;

	unsigned char   pic_order_cnt_type;
	unsigned char   log2_max_pic_order_cnt_lsb_minus4;
	unsigned char   num_ref_frames;
	unsigned char   reserved_8bit;
	char            pic_init_qp_minus26;
	char            pic_init_qs_minus26;
	char            chroma_qp_index_offset;
	char            second_chroma_qp_index_offset;
	
	unsigned char	num_slice_groups_minus1; 
	unsigned char	slice_group_map_type;
	unsigned char	num_ref_idx_l0_active_minus1;
	unsigned char	num_ref_idx_l1_active_minus1;
	
	unsigned short	slice_group_change_rate_minus1;
	unsigned short	reserved_16bit;
	
	unsigned char	scaling_lists_4x4[6][16];
	unsigned char	scaling_lists_8x8[2][64];
	
	unsigned int	frame_num;
	unsigned int	frame_num_list[16];	// bit 31 is used to indicate long/short term
	int		curr_field_order_cnt_list[2];
	int		field_order_cnt_list[16][2];

	int		intra_flag;
	int		reference;

	struct {
		unsigned int	numViews;
		unsigned int	viewID0;
		mvcElement_t	mvcElements [1];	// Allocate numViews-1 elements here
	} mvc;

	unsigned int	reserved[128];

} H264_picture_parameter_2;


// VC-1 picture_parameter_2 structure
typedef struct
{
	union	{
		struct {
			unsigned int	postprocflag		: 1;
			unsigned int	pulldown			: 1;
			unsigned int	interlace			: 1;
			unsigned int	tfcntrflag		    : 1;
			unsigned int	finterpflag		    : 1;
			unsigned int	sps_reserved1		: 1;
			unsigned int	psf			        : 1;
			unsigned int	second_field		: 1;
			unsigned int	sps_reserved2		: 24;
		} sps_flag;
		unsigned int	flag;
	} sps_info;
	
	union	{
		struct {
			unsigned int	panscan_flag		: 1;
			unsigned int	refdist_flag		: 1;
			unsigned int	loopfilter		    : 1;
			unsigned int	fastuvmc			: 1;
			unsigned int	extended_mv		    : 1;
			unsigned int	dquant			    : 2;
			unsigned int	vstransform		    : 1;
			unsigned int	overlap			    : 1;
			unsigned int	quantizer			: 2;
			unsigned int	extended_dmv		: 1;
			unsigned int	maxbframes		    : 3;
			unsigned int	rangered			: 1;
			unsigned int	syncmarker		    : 1;
			unsigned int	multires			: 1;
			unsigned int	reserved			: 2;
			unsigned int	range_mapy_flag		: 1;
			unsigned int	range_mapy		    : 3;
			unsigned int	range_mapuv_flag	: 1;
			unsigned int	range_mapuv		    : 3;
			unsigned int	vc1_pps_reserved	: 4;
		} pps_flag;
		unsigned int	flag;
	} pps_info;
	
	unsigned int	picture_structure;
	unsigned int	chroma_format;
	unsigned int	reserved [128];
} VC1_picture_parameter_2;


typedef struct
{
    unsigned short    DecodedPictureIndex;
    unsigned short    DeblockedPictureIndex;
    unsigned short    ForwardRefPictureIndex;
    unsigned short    BackwardRefPictureIndex;

    unsigned short    picWidthInMBminus1;
    unsigned short    picHeightInMBminus1;

    unsigned char     macroblockWidthMinus1;
    unsigned char     macroblockHeightMinus1;
    unsigned char     blockWidthMinus1;
    unsigned char     blockHeightMinus1;

    unsigned char     bppminus1;
    unsigned char     picStructure;
    unsigned char     secondField;
    unsigned char     picIntra;

    unsigned char     picBackwardPrediction;
    unsigned char     bidirectionalAveragingMode;
    unsigned char     mvprecisionAndChromaRelation;
    unsigned char     chromaFormat;

    unsigned char     picScanFixed;
    unsigned char     picScanMethod;
    unsigned char     picReadbackRequests;
    unsigned char     rcontrol;

    unsigned char     picSpatialResid8;
    unsigned char     picOverflowBlocks;
    unsigned char     picExtrapolation;
    unsigned char     picDeblocked;

    unsigned char     picDeblockConfined;
    unsigned char     pic4MVallowed;
    unsigned char     picOBMC;
    unsigned char     picBinPB;

    unsigned char     mvRPS;
    unsigned char     reservedBits;

    union
    {
        struct 
        {
            unsigned short  fcode11 : 4;
            unsigned short  fcode10 : 4;
            unsigned short  fcode01 : 4;
            unsigned short  fcode00 : 4;
        }fields;
        unsigned short      value;
    } FCodes;

    union
    {
        struct  
        {
            unsigned short  reservedBits        : 3;
            unsigned short  progressiveFrame    : 1;
            unsigned short  chroma420Type       : 1;
            unsigned short  repeatFirstField    : 1;
            unsigned short  alternateScan       : 1;
            unsigned short  intraVLCFormat      : 1;
            unsigned short  quantScaleType      : 1;
            unsigned short  concealmentMVs      : 1;
            unsigned short  frameDCTPrediction  : 1;
            unsigned short  topFieldFirst       : 1;
            unsigned short  picStructure        : 2;
            unsigned short  intraDCPrecision    : 2;
        }fields;
        unsigned short      value;  
    } BistreamPCElements;

    unsigned char       bitstreamConcealmentNeed;
    unsigned char       bitstreamConcealmentMethod; 
   
	unsigned char	scaling_lists_8x8[4][64];

	unsigned int    picture_coding_type;
	unsigned int	reserved[128];
   
} MPEG2_picture_parameter_2;

#endif // #ifndef __OVDECODETYPES_H__