//
//  ResourceLoader.h
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-15.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#ifndef RESOURCELOADER
#define RESOURCELOADER
#include <stdio.h>
#include <stdlib.h>

class ResourceLoader
{
public:
    ResourceLoader(){}
    ~ResourceLoader(){}
    char* getFilePathToResource(const char* fileName);
    char* getContentsOfResourceAtPath(const char* filePath, size_t &size);
};

#endif