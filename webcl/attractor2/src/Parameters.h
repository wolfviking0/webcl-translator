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

#ifndef PARAMETERS_H_
#define PARAMETERS_H_

#include <unordered_map>
#include <string>

#include <GL/gl.h>

class Parameters
{
    std::unordered_map<std::string,int> ipar;
    std::unordered_map<std::string,GLuint> gluipar;
    std::unordered_map<std::string,float> fpar;
    std::unordered_map<std::string,std::string> spar;
    std::unordered_map<std::string,uintptr_t> ppar;

public:

    void clear()
    {
        ipar.clear();
        gluipar.clear();
        fpar.clear();
        spar.clear();
        ppar.clear();
    }

    void setInt(const std::string &key, int val)
    {
        ipar[key] = val;
    }

    int getInt(const std::string &key, int def = 0) const
    {
        auto it = ipar.find(key);
        if ( it != ipar.end() )
            return it->second;
        return def;
    }

    void clearInt(const std::string &key)
    {
        ipar.erase(key);
    }

    void setGLuint(const std::string &key, unsigned val)
    {
        gluipar[key] = val;
    }

    int getGLuint(const std::string &key, unsigned def = 0) const
    {
        auto it = gluipar.find(key);
        if ( it != gluipar.end() )
            return it->second;
        return def;
    }

    void clearGLuint(const std::string &key)
    {
        gluipar.erase(key);
    }

    void setFloat(const std::string &key, float val)
    {
        fpar[key] = val;
    }

    float getFloat(const std::string &key, float def = 0.f) const
    {
        auto it = fpar.find(key);
        if ( it != fpar.end() )
            return it->second;
        return def;
    }

    void clearFloat(const std::string &key)
    {
        fpar.erase(key);
    }

    void setString(const std::string &key, const std::string &val)
    {
        spar[key] = val;
    }

    std::string getString(const std::string &key, std::string def = std::string() ) const
    {
        auto it = spar.find(key);
        if ( it != spar.end() )
            return it->second;
        return def;
    }

    void clearString(const std::string &key)
    {
        spar.erase(key);
    }

    void setPtr(const std::string &key, void *ptr)
    {
        ppar[key] = (uintptr_t)ptr;
    }

    void *getPtr(const std::string &key, void *def = nullptr) const
    {
        auto it = ppar.find(key);
        if ( it != ppar.end() )
            return (void*)it->second;
        return def;
    }

    void clearPtr(const std::string &key)
    {
        ppar.erase(key);
    }

    void enable(const std::string &key)
    {
        setInt(key,1);
    }

    void disable(const std::string &key)
    {
        setInt(key,0);
    }

    bool isEnabled(const std::string &key)
    {
        return getInt(key) != 0 ? true : false;
    }
};


#endif /* PARAMETERS_H_ */
