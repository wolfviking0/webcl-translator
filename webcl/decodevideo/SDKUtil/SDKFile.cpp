#include "SDKFile.hpp"

#if defined(_WIN32) || defined(__CYGWIN__)
#include <direct.h>
#define GETCWD _getcwd
#else // !_WIN32
#include <cstring>
#include <cstdlib>
#include <unistd.h>
#define GETCWD ::getcwd
#endif // !_WIN32

namespace streamsdk
{

std::string
getCurrentDir()
{
    const   size_t  pathSize = 4096;
    char    currentDir[pathSize];

    // Check if we received the path
    if (GETCWD(currentDir, pathSize) != NULL) {
        return std::string(currentDir);
    }

    return  std::string("");
}

bool
SDKFile::writeBinaryToFile(const char* fileName, const char* birary, size_t numBytes)
{
    FILE *output = NULL;
    output = fopen(fileName, "wb");
    if(output == NULL)
        return false;

    fwrite(birary, sizeof(char), numBytes, output);
    fclose(output);

    return true;
}


bool
SDKFile::readBinaryFromFile(const char* fileName)
{
    FILE * input = NULL;
    size_t size = 0;
    char* binary = NULL;

    input = fopen(fileName, "rb");
    if(input == NULL)
    {
        return false;
    }

    fseek(input, 0L, SEEK_END); 
    size = ftell(input);
    rewind(input);
    binary = (char*)malloc(size);
    if(binary == NULL)
    {
        return false;
    }
    fread(binary, sizeof(char), size, input);
    fclose(input);
    source_.assign(binary, size);
    free(binary);

    return true;
}




bool
SDKFile::open(
    const char* fileName)   //!< file name
{
    size_t      size;
    char*       str;

    // Open file stream
    std::fstream f(fileName, (std::fstream::in | std::fstream::binary));

    // Check if we have opened file stream
    if (f.is_open()) {
        size_t  sizeFile;
        // Find the stream size
        f.seekg(0, std::fstream::end);
        size = sizeFile = (size_t)f.tellg();
        f.seekg(0, std::fstream::beg);

        str = new char[size + 1];
        if (!str) {
            f.close();
            return  false;
        }

        // Read file
        f.read(str, sizeFile);
        f.close();
        str[size] = '\0';

        source_  = str;

        delete[] str;

        return true;
    }

    return false;
}

} // namespace streamsdk
