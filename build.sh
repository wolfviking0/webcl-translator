#!/bin/sh

cd ../

root_repositories="$(pwd)/"

page_repositories="$(pwd)/webcl-website/"

echo "\n"
echo "The current root repositories is '$root_repositories'."
echo "\n"

list_repositories=("webcl-translator/webcl" "webcl-osx-sample" "webcl-ocltoys" "webcl-davibu")
page_subfolder=("build_trans" "build_osx" "build_toys" "build_davibu")

for param in "$*"
do
    echo "Parameter : $param"
    echo "\n"
done

makefile=""

for param_makefile in "$@"
do
    echo $param_makefile | grep "copy"  1>/dev/null
    if [ ! `echo $?` -eq 0 ]
    then
        makefile=$makefile" "$param_makefile
    fi

done

# First clean 
for ((i = 0; i < 4; i++))
do
    element=${list_repositories[i]}
    
    cd "$root_repositories$element"
    
    echo $param | grep "onlycopy"  1>/dev/null
    if [ ! `echo $?` -eq 0 ]
    then
        # clean
        make clean $makefile
    fi
    
    cd "$root_repositories"
done

# Build or/and Copy
for ((i = 0; i < 4; i++))
do
    element=${list_repositories[i]}
    folder=${page_subfolder[i]}

    cd "$root_repositories$element"
    echo $(pwd)

    echo $param | grep "onlycopy"  1>/dev/null
    if [ ! `echo $?` -eq 0 ]
    then
        # clean
        make clean $makefile

        # build
        make $makefile
    fi
    echo $param | grep "copy"  1>/dev/null
    if [ `echo $?` -eq 0 ]
    then
        cp -rf $(pwd)/build/ $page_repositories$folder
    fi
    
    cd "$root_repositories"
done




