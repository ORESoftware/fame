#!/usr/bin/env bash

get_latest_fame(){
  . "$HOME/.oresoftware/bash/fame.sh"
}

fame(){

 if ! type -f fame &> /dev/null || ! which fame &> /dev/null; then

    echo "Installing 'fame' NPM package globally..."

    npm i -s -g 'fame' || {
       echo -e "Could not install fame package globally.";
       echo -e "Please check your permissions to install global NPM packages.";
       return 1;
    }

 fi

 command fame $@;
}

export -f fame;