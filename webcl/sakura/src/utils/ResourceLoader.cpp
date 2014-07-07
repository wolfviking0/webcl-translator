//
//  ResourceLoader.cpp
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-15.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#include <stdio.h>
#include <string.h>
#include "ResourceLoader.h"
#ifndef __EMSCRIPTEN__
#include <CoreFoundation/CoreFoundation.h>
#endif

#define MAX_SOURCE_SIZE (0x100000)

char* ResourceLoader::getFilePathToResource(const char* fileName)
{
    #ifdef __EMSCRIPTEN__
    char* filepath = (char*)malloc(sizeof(char)*512);
    memset(filepath,0x00,sizeof(char)*512);
    memcpy(filepath,fileName,strlen(fileName));
    #else
    CFBundleRef mainBundle = CFBundleGetMainBundle();
    CFStringRef filename = CFStringCreateWithCString(NULL, fileName, kCFStringEncodingASCII);

    CFURLRef resourcesURL = CFBundleCopyResourceURL(mainBundle, filename, NULL, NULL);
    assert(resourcesURL);

    char* filepath = (char*)malloc(sizeof(char)*512);
    assert(CFURLGetFileSystemRepresentation(resourcesURL, true, (UInt8*)filepath, 200));
    #endif
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
