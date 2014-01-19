webcl-translator
================

![logo](http://wolfviking0.github.io/webcl-translator/images/webcl.png)

General :
---------

webcl-translator is an OpenCL to WebCL converter, it's based on the [Emscripten](https://github.com/kripken/emscripten) LLVM-to-JavaScript compiler.

Need Firefox 24 and [WebCL plugin](http://webcl.nokiaresearch.com) from Nokia research

or

Need [webkit-webcl](https://github.com/SRA-SiliconValley/webkit-webcl) from Samsung research.

Links to **demos**, **tutorial**, **patch**, etc: [Wiki](https://github.com/wolfviking0/webcl-translator/wiki)

#### Automator :

At the top of the repositories, you can use _python automator.py_ for update all the samples repositories and automaticaly build all the demos.

You can call _python automator.py -h_ for call the automator script help.

#### Validator :

You can use the [webcl-validator](https://github.com/KhronosGroup/webcl-validator) with the webcl-translator. You need to add the LLVM_VALIDATOR_ROOT inside the ~/.emscripten config file.

If you build a sample using settings _-s CL_VALIDATOR=1_, automaticaly all the .cl file embedded are modify by the validator. You can specify parameter to the webcl-validator using _-s CL_VAL_PARAM='["-DPARAM1","-DPARAM2"]'_.

#### Settings.js :

The sample are using a Settings.js file who automaticaly add parameter to all the webcl-translator samples. When you launch the translator.html file (and all the html samples files from the samples repositories), you can add some parameter:

	&gl=on/off 			:	Add a canvas inside the webpage				
	&validator=on/off 	:	Enable the validator, call val_.....js samples 
	&profile=on/off 	:	Enable the console profile of the browser	
	&export=on/off		:	Open a new page with stack_tracer (if enabled)


Samples repositories :
----------------------

[OSX Samples](https://github.com/wolfviking0/webcl-osx-sample)

[OCLToys](https://github.com/wolfviking0/webcl-ocltoys)

[David Bucciarelli](https://github.com/wolfviking0/webcl-davibu)

[OpenCL Book Samples](https://github.com/wolfviking0/webcl-book-samples)

License :
---------

webcl-translator is MIT licensed, see LICENSE.
