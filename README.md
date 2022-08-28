webcl-translator
================

![logo](http://wolfviking0.github.io/webcl-translator/images/webcl.png)

Requirement :
-------------
	
[Python3](http://python.org)

[NodeJS](http://nodejs.org)

ie: 
    brew cmake node acorn python3

How To (OSX) :
--------------

#### Step 1 (BUILD LLVM + BINARYEN + WEBCL-VALIDATOR) :

	cd <YOUR_ROOT_DIRECTORY>
    git clone git@github.com:llvm/llvm-project.git

	// cd llvm-project/tools/clang/tools
	// git clone git@github.com:wolfviking0/webcl-validator.git
	// Disable the validor for now need more work to mske it up to date.
    // echo "add_clang_subdirectory(webcl-validator)" >> CMakeLists.txt

	cd <YOUR_ROOT_DIRECTORY>/llvm-project
	mkdir build
	cmake ../llvm -DCMAKE_BUILD_TYPE=Release -DLLVM_ENABLE_PROJECTS='lld;clang' -DLLVM_TARGETS_TO_BUILD="host;WebAssembly" -DLLVM_INCLUDE_EXAMPLES=OFF -DLLVM_INCLUDE_TESTS=OFF -DCMAKE_INSTALL_PREFIX=<YOUR_ROOT_DIRECTORY>/install

	cd <YOUR_ROOT_DIRECTORY>
    git clone git@github.com:WebAssembly/binaryen.git
	cd <YOUR_ROOT_DIRECTORY>/binaryen
	git submodule init
	git submodule update
	mkdir build
	cmake ../ -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/Users/anthony.liot/Desktop/GitHub/install
	

#### Step 2 (WEBCL-TRANSLATOR) :

	cd <YOUR_ROOT_DIRECTORY>
	git clone git@github.com:wolfviking0/webcl-translator.git

	cd webcl-translator/emscripten
	./emcc --generate-config

	# Edit the file and change the path to the LLVM_ROOT and BINARYEN_ROOT
	vim .emscripten
	'''
	LLVM_ROOT = '/Users/anthony.liot/Desktop/GitHub/install/bin' # directory
	BINARYEN_ROOT = '/Users/anthony.liot/Desktop/GitHub/install/bin' # directory
	'''

















#####
#####
OLD DOCUMENTATIONS
#####
#####

Requirement :
-------------

[Python2.7](http://python.org)

[NodeJS](http://nodejs.org)

[Emscripten Tutorial](https://github.com/kripken/emscripten/wiki/LLVM-Backend)

[Emscripten Fastcomp](https://github.com/kripken/emscripten-fastcomp.git)

[Emscripten Fastcomp Clang](https://github.com/kripken/emscripten-fastcomp-clang.git)

[WebCL Validator](https://github.com/KhronosGroup/webcl-validator)

How To (OSX) :
--------------

#### Step 1 :

	install python and nodejs on your system

	cd YOUR_ROOT_DIRECTORY
	git clone https://github.com/kripken/emscripten-fastcomp.git -b incoming
	cd emscripten-fastcomp/tools/
	git clone https://github.com/kripken/emscripten-fastcomp-clang.git -b incoming clang
	build the llvm/clang emscripten-fastcomp using "configure --enable-optimized --disable-assertions --enable-targets=host,js"

	cd YOUR_ROOT_DIRECTORY
	git clone https://github.com/KhronosGroup/webcl-validator
	build the llvm/clang webcl-validator
	go inside your binary build folder and type :
	"install_name_tool -change libclv_standalone.dylib @executable_path/../lib/libclv_standalone.dylib"

#### Step 2 :

	cd YOUR_ROOT_DIRECTORY
	git clone https://github.com/wolfviking0/webcl-translator
	cd webcl-translator/
	git submodule init
	git submodule update
	
#### Step 3 :

	cd YOUR_ROOT_DIRECTORY
	rm ~/.emscripten
	rm -rf ~/.emscripten_cache
	cd webcl-translator/emscripten
	./emcc --help
	open ~/.emscripten
	set LLVM_ROOT with your llvm path
	add LLVM_VALIDATOR_ROOT with your webcl-validator path
	
#### Step 4 :

	cd YOUR_ROOT_DIRECTORY/webcl-translator
	python automator.py --help
	or
	cd YOUR_ROOT_DIRECTORY/webcl-translator/webcl
	make
	

General :
---------

webcl-translator is an OpenCL to WebCL converter, it's based on the [Emscripten](https://github.com/kripken/emscripten) LLVM-to-JavaScript compiler.

Need [webkit-webcl](https://github.com/SRA-SiliconValley/webkit-webcl) from Samsung research for OS X 10.8, you can use my custom version of [webkit-webcl](https://github.com/wolfviking0/webcl-webkit) for OS X 10.9.

Links to **demos**, **tutorial**, **patch**, etc: [Wiki](https://github.com/wolfviking0/webcl-translator/wiki)

#### Automator :

At the top of the repositories, you can use _python automator.py_ for update all the samples repositories and automaticaly build all the demos.

You can call _python automator.py -h_ for call the automator script help.

#### Validator :

You can use the [webcl-validator](https://github.com/KhronosGroup/webcl-validator) with the webcl-translator. You need to add the LLVM_VALIDATOR_ROOT inside the ~/.emscripten config file.

If you build a sample using settings -s CL_VALIDATOR=1, automaticaly all the .cl file embedded are modify by the validator. You can specify parameter to the webcl-validator using -s CL_VAL_PARAM='["-DPARAM1","-DPARAM2"]'.

#### Settings.js :

The sample are using a Settings.js file who automaticaly add parameter to all the webcl-translator samples. When you launch the translator.html file (and all the html samples files from the samples repositories), you can add some parameter:

	&gl=on/off 			:	Add a canvas inside the webpage				
	&validator=on/off 	:	Enable the validator, call val_.....js samples 
	&profile=on/off 	:	Enable the console profile of the browser	
	&export=on/off		:	Open a new page with stack_tracer (if enabled)


[Samples repositories](https://docs.google.com/spreadsheets/d/1-YZrJ8odGWFLl3yy5txhys4w4-DHSjv95sHnh06pyhs/edit#gid=0) :
----------------------

[OSX Samples](https://github.com/wolfviking0/webcl-osx-sample)

[OCLToys](https://github.com/wolfviking0/webcl-ocltoys)

[David Bucciarelli](https://github.com/wolfviking0/webcl-davibu)

[OpenCL Book Samples](https://github.com/wolfviking0/webcl-book-samples)

[OpenCL Nvidia Samples](https://github.com/wolfviking0/webcl-ocl-nvidia)

License :
---------

webcl-translator is MIT licensed, see LICENSE.
