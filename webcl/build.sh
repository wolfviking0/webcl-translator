#!/bin/sh

echo "\n"
echo "*********************************"
echo "*    BUILD TRANSLATOR SAMPLE    *"
echo "*********************************"
echo "\n"

make clean

make 

make VAL=1

echo "\n"
echo "**************************"
echo "*    BUILD OSX SAMPLE    *"
echo "**************************"
echo "\n"

cd ../../webcl-osx-sample

make clean

make 

make VAL=1

echo "\n"
echo "******************************"
echo "*    BUILD OCLTOYS SAMPLE    *"
echo "******************************"
echo "\n"

cd ../webcl-ocltoys

make clean

make 

make VAL=1

echo "\n"
echo "*****************************"
echo "*    BUILD DAVIBU SAMPLE    *"
echo "*****************************"
echo "\n"

cd ../webcl-davibu

make clean

make 

make VAL=1



