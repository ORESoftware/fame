#!/usr/bin/env bash



all_export="yep";

if [[ ! "$SHELLOPTS" =~ "allexport" ]]; then
    all_export="nope";
    set -a;
fi



fame_get_latest(){
  . "$BASH_SOURCE";  # source this file
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

 command "$FUNCNAME" "$@";

}


if [ "$all_export" == "nope" ]; then
  set +a;
fi

