//
//  ObjParser.cpp
//  Sakura GL Toy
//
//  Created by Kyle Halladay on 2014-06-14.
//  Copyright (c) 2014 Kyle Halladay. All rights reserved.
//

#include "ObjParser.h"
#include <stdlib.h>
#include <stdio.h>
#include <vector>
#include <string.h>
#include "ResourceLoader.h"

ObjParser::ObjParser(char* objFileName)
{
    ResourceLoader loader;
    char* url = loader.getFilePathToResource(objFileName);
    size_t size = 0;
    fileContents = loader.getContentsOfResourceAtPath(url, size);

}

GLfloat* ObjParser::getVertexArray(int& count)
{
    std::vector<char*> vertices;
    
    char contentsCopy[strlen(fileContents)];
    strcpy(contentsCopy, fileContents);
    
    char* iter = strtok(contentsCopy, "v");
    
    //strtok twice to get past blender header stuff in the file
    iter = strtok(NULL, "v");
    iter = strtok(NULL, "v");
    
    while (iter)
    {
        vertices.push_back(iter);
        iter = strtok(NULL, "v");
    }
    
    std::vector<char*> verticesWithoutNormals;

    for (int i = 0; i < vertices.size(); i++)
    {
        char* loopIter = strtok(vertices.at(i), "\n");
        if (loopIter[0] != 'n')
        {
            vertices[i] = loopIter;
            verticesWithoutNormals.push_back(loopIter);
        }
    }
    
    GLfloat* verts = (GLfloat*)malloc(sizeof(GLfloat)*verticesWithoutNormals.size()*3);
    int index = 0;
    
    for (int i = 0; i < verticesWithoutNormals.size(); i++)
    {
        char* loopIter = strtok(verticesWithoutNormals[i], " ");
        while(loopIter)
        {
            verts[index++] = atof(loopIter);
            loopIter = strtok(NULL, " ");
        }
    }
    
    
    count = (int)verticesWithoutNormals.size()*3;
        
    return verts;
}

GLfloat* ObjParser::getNormalsArray(int &count)
{
    std::vector<char*> vertices;
    
    char contentsCopy[strlen(fileContents)];
    strcpy(contentsCopy, fileContents);
    
    char* iter = strtok(contentsCopy, "v");
    
    //strtok twice to get past blender header stuff in the file
    iter = strtok(NULL, "v");
    iter = strtok(NULL, "v");
    
    while (iter)
    {
        vertices.push_back(iter);
        iter = strtok(NULL, "v");
    }
    
    std::vector<char*> normals;
    
    for (int i = 0; i < vertices.size(); i++)
    {
        char* loopIter = strtok(vertices.at(i), "\n");

        if (loopIter[0] == 'n')
        {
            vertices[i] = loopIter;
            normals.push_back(loopIter);
        }
    }
    
    GLfloat* verts = (GLfloat*)malloc(sizeof(GLfloat)*normals.size()*3);
  
    int index = 0;
    
    for (int i = 0; i < normals.size(); i++)
    {
        char* loopIter = strtok(normals[i], " ");

        while(loopIter)
        {
            if (loopIter[0] != 'n')
            {
                verts[index++] = atof(loopIter);
            }
            loopIter = strtok(NULL, " ");
        }
    }
    
    
    count =(int)normals.size()*3;
    
    return verts;
}

GLfloat* ObjParser::getObjectDataArray(int& count)
{
    int vertNum = 0;
    GLfloat* verts = getVertexArray(vertNum);
    
    int normNum = 0;
    GLfloat* norms = getNormalsArray(normNum);
    
    int iNum = 0;
    Index* indices = getIndexArray(iNum);
    
    GLfloat* vnCombined = (GLfloat*)malloc(sizeof(GLfloat)*iNum*6);
    
    for (int i = 0; i < iNum; i++)
    {
        vnCombined[i*6] = verts[indices[i].vert*3];
        vnCombined[i*6+1] = verts[indices[i].vert*3+1];
        vnCombined[i*6+2] = verts[indices[i].vert*3+2];
        vnCombined[i*6+3] = norms[indices[i].normal*3];
        vnCombined[i*6+4] = norms[indices[i].normal*3+1];
        vnCombined[i*6+5] = norms[indices[i].normal*3+2];
    }
    
    free(verts);
    free(norms);
    free(indices);
    
    count = iNum;
    return vnCombined;
}


ObjParser::Index* ObjParser::getIndexArray(int& count)
{
    std::vector<char*> triangles;
    char contentsCopy[strlen(fileContents)];
    strcpy(contentsCopy, fileContents);

    char* iter = strtok(contentsCopy, "f");
    iter =strtok(NULL, "f");
    
    while (iter)
    {
        triangles.push_back(iter);
        iter = strtok(nullptr, "f");
    }
    
    std::vector<char*>combinedIndices;
    
    for (int i = 0; i < triangles.size(); i++)
    {
       char* loopIter = strtok(triangles.at(i), " ");
        
        while(loopIter)
        {
            if (loopIter[0] != '\n' && loopIter[0] != ' ')
            {
                combinedIndices.push_back(loopIter);
            }
            loopIter = strtok(NULL, " ");
        }
    }
    
    Index* indexArray = (Index*)malloc(sizeof(Index)*combinedIndices.size());
    
    for (int i = 0; i < combinedIndices.size(); i++)
    {
        int component = 0;
        char* loopIter = strtok(combinedIndices[i], "//");
        while(loopIter)
        {
            
            //sub 1 so that the indices are 0 indexed.
            if (component++ == 0)
            {
                indexArray[i].vert = atoi(loopIter)-1;
            }
            else
            {
                indexArray[i].normal = atoi(loopIter)-1;
            }
            loopIter = strtok(NULL, "//");
        }
    }
    
    count = (int)combinedIndices.size();
    return indexArray;
}