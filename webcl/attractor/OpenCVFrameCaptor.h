// Copyright (c) 2013 Andrey Tuganov
//
// The zlib/libpng license
//
// This software is provided 'as-is', without any express or implied warranty. In no event will the authors be held liable for any damages arising from the use of this software.
//
// Permission is granted to anyone to use this software for any purpose, including commercial applications, and to alter it and redistribute it freely, subject to the following restrictions:
//
// 1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
//
// 2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
//
// 3. This notice may not be removed or altered from any source distribution.

#ifndef OPENCVFRAMECAPTOR_H_
#define OPENCVFRAMECAPTOR_H_

#include "FrameCaptor.h"

#include <opencv2/opencv.hpp>
#include <opencv2/video/video.hpp>

#include <queue>

class OpenCVFrameCaptor: public FrameCaptor
{
    friend void FrameCaptor::create(Type type);

    std::queue<cv::Mat> m_frames;
    cv::VideoWriter *m_writer;

    void __init();
    void __capture();

    void cleanup();

    OpenCVFrameCaptor();
    ~OpenCVFrameCaptor();

public:

    virtual void init() override;
    virtual void capture() override;
    virtual void release() override;
    virtual void worker() override;
};

#endif /* OPENCVFRAMECAPTOR_H_ */
