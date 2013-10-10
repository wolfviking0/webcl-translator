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

#include "OpenCVFrameCaptor.h"

#include <iostream>
#include <sstream>

#include <chrono>

#include "error.h"
#include "global.h"

//using namespace cv;
using namespace std;

OpenCVFrameCaptor::OpenCVFrameCaptor() : FrameCaptor ()
{
    m_writer = nullptr;
}

OpenCVFrameCaptor::~OpenCVFrameCaptor()
{
    cleanup();
}

void OpenCVFrameCaptor::init()
{
    int windowWidth = global::par().getInt("windowWidth");
    int windowHeight = global::par().getInt("windowHeight");

    CvSize size;
    size.width = windowWidth;
    size.height = windowHeight;
    m_writer = new cv::VideoWriter(global::par().getString("exportFilename"), CV_FOURCC('H','F','Y','U'), 30.,  size);

    if ( m_writer == nullptr || !m_writer->isOpened() )
        error::throw_ex("unable to initialise cv::VideoWriter",__FILE__,__LINE__);

    startThread();
}

void OpenCVFrameCaptor::capture()
{
    if ( !m_writer )
        return;

    int windowWidth = global::par().getInt("windowWidth");
    int windowHeight = global::par().getInt("windowHeight");

    cv::Mat frame = cv::Mat(windowHeight,windowWidth,CV_8UC3);
    // TODO memory management to avoid constant reallocation

    if ( frame.empty() )
        error::throw_ex("unable to initialize cv::Mat frame object",__FILE__,__LINE__);

    glPixelStorei(GL_PACK_ALIGNMENT, (frame.step & 3) ? 1 : 4);
    glPixelStorei(GL_PACK_ROW_LENGTH, frame.step/frame.elemSize());
    glReadPixels(0, 0, frame.cols, frame.rows, GL_BGR, GL_UNSIGNED_BYTE, frame.data);

    {
        // push frame in the queue
        lock_guard<mutex> lock(m_mutex);
        m_frames.push(frame); // shallow copy
    }

}

void OpenCVFrameCaptor::worker()
{
    while(1)
    {
        cv::Mat frame;

        {
            lock_guard<mutex> lock(m_mutex);
            if ( m_frames.empty() )
            {
                if ( m_stage == finishing )
                {
                    m_stage = finished;
                    return;
                }
            }
            else
            {
                // pop frame from the queue
                frame = m_frames.front();
                m_frames.pop();
            }
        }

        if ( frame.empty() )
        {
            this_thread::sleep_for(chrono::milliseconds(10));
        }
        else
        {
            // write frame
            cv::flip(frame, frame, 0);
            (*m_writer) << frame;
        }

    }
}

void OpenCVFrameCaptor::release()
{
    stopThread();

    cleanup();
}

void OpenCVFrameCaptor::cleanup()
{
    if ( m_writer )
    {
        m_writer->release();
        delete m_writer;
    }
}
