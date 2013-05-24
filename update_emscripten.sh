#!/bin/bash
# Starting hg script

echo "Update Emscripten Git"
cd emscripten/
git reset --hard
git pull

