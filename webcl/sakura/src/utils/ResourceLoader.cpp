//
//  ResourceLoader.cpp
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-15.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#include "ResourceLoader.h"
#ifndef __EMSCRIPTEN__
#include <CoreFoundation/CoreFoundation.h>
#endif

#define MAX_SOURCE_SIZE (0x100000)

char* ResourceLoader::getFilePathToResource(const char* fileName)
{
    CFBundleRef mainBundle = CFBundleGetMainBundle();
    CFStringRef filename = CFStringCreateWithCString(NULL, fileName, kCFStringEncodingASCII);

    CFURLRef resourcesURL = CFBundleCopyResourceURL(mainBundle, filename, NULL, NULL);
    assert(resourcesURL);

    char* filepath = (char*)malloc(sizeof(char)*512);
    assert(CFURLGetFileSystemRepresentation(resourcesURL, true, (UInt8*)filepath, 200));

    return filepath;
}

char* ResourceLoader::getContentsOfResourceAtPath(const char* filePath, size_t &size)
{
    FILE *fp;

    fp = fopen(filePath, "r");
    if (!fp) {
        fprintf(stderr, "Failed to load file contents.\n");
    }
    char* dest = (char*)malloc(MAX_SOURCE_SIZE);
    size = fread(dest, 1, MAX_SOURCE_SIZE, fp);
    fclose(fp);
    return dest;
}
