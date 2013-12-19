#!/bin/sh
#
#  build.sh
#  Licence : https://github.com/wolfviking0/webcl-translator/blob/master/LICENSE
#
#  Created by Anthony Liot.
#  Copyright (c) 2013 Anthony Liot. All rights reserved.
#

START=$(date +%s)

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

# Remove parameter useless for makefile
for param_makefile in "$@"
do
    echo $param_makefile | grep "clean\|copy"  1>/dev/null
    if [ ! `echo $?` -eq 0 ]
    then
      makefile=$makefile" "$param_makefile
    fi

done

echo $makefile

# First clean only if asked
echo $param | grep "clean"  1>/dev/null
if [ `echo $?` -eq 0 ]
then
  for ((i = 0; i < 4; i++))
  do
      element=${list_repositories[i]}
      
      cd "$root_repositories$element"
  
      echo $param | grep "onlycopy"  1>/dev/null
      if [ ! `echo $?` -eq 0 ]
      then
          echo "Clean : $(pwd)"
            
          # clean
          make clean $makefile
      fi
      
      cd "$root_repositories"
  
      echo "\n"
  done
fi

# Build or/and Copy
for ((i = 0; i < 4; i++))
do
    element=${list_repositories[i]}
    folder=${page_subfolder[i]}

    cd "$root_repositories$element"

    # If not onlycopy or onlyclean
    echo $param | grep "onlycopy\|onlyclean"  1>/dev/null
    if [ ! `echo $?` -eq 0 ]
    then
        echo "Build : $(pwd)"
        
        # build
        make $makefile
    fi
    
    # If copy or onlycopy
    echo $param | grep "copy"  1>/dev/null
    if [ `echo $?` -eq 0 ]
    then
        echo "Copy : $(pwd)/build/"
            
        cp -rf $(pwd)/build/ $page_repositories$folder
    fi
    
    cd "$root_repositories"

    echo "\n"
done

END=$(date +%s)

ELAPSED=$(($END - $START))

echo "Build complete in $(($ELAPSED / 60)):$(($ELAPSED % 60)) minutes"



