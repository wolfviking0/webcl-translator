#!/bin/sh
#
#  install.sh
#  Licence : https://github.com/wolfviking0/webcl-translator/blob/master/LICENSE
#
#  Created by Anthony Liot.
#  Copyright (c) 2013 Anthony Liot. All rights reserved.
#

cd ../

root_repositories="$(pwd)/"

echo "\n"
echo "The current root repositories is '$root_repositories'."
echo "\n"

list_repositories=("webcl-osx-sample" "webcl-ocltoys" "webcl-davibu")

for ((i = 0; i < 3; i++))
do
    repo=${list_repositories[i]}
    directory=$root_repositories$repo
    
    if [ -d "$root_repositories$repo" ]; then
      cd "$directory"
        
      git reset --hard
      git pull

      cd "$root_repositories"
    else
      git clone https://github.com/wolfviking0/$repo.git
    fi
    
    echo "\n"
done




