#ifndef SDKCOMMANDARGS_HPP_
#define SDKCOMMANDARGS_HPP_

#include <iostream>
#include <iomanip>
#include <sstream>
#include <string>
#include <ctime>
#include <string.h>

namespace streamsdk
{
enum CmdArgsEnum
{
  CA_ARG_INT,
  CA_ARG_FLOAT, 
  CA_ARG_DOUBLE, 
  CA_ARG_STRING,
  CA_NO_ARGUMENT
};

struct Option
{
  std::string  _sVersion;
  std::string  _lVersion;
  std::string  _description;
  CmdArgsEnum  _type;
  void *       _value;
};

class SDKCommandArgs
{
    private:
        int _numArgs;
        int _argc;
        int _seed;
        char ** _argv;
        Option * _options;
        SDKCommandArgs(void) {
            _options = NULL; 
            _numArgs = 0; 
            _argc = 0; 
            _argv = NULL;
            _seed = 123;}
        int match(char ** argv, int argc);
      
    public:
        SDKCommandArgs(int numArgs,
        Option * options
          ) 
        : _numArgs(numArgs), _options(options)
        {}
        ~SDKCommandArgs();
        int AddOption(Option* op);
        int DeleteOption(Option* op);
        int parse(char ** argv, int argc);
        bool isArgSet(std::string arg, bool shortVer = false);
        std::string help(void);
};
}

#endif
