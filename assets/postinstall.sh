#!/usr/bin/env bash

set -e;

if [[ "$skip_postinstall" == "yes" ]]; then
  echo "skipping fame postinstall routine.";
  exit 0;
fi

export skip_postinstall="yes";

if [[ "$oresoftware_local_dev" == "yes" ]]; then
    echo "Running the fame postinstall script in oresoftware local development env."
fi


mkdir -p "$HOME/.oresoftware/bash" || {
  echo "could not create oresoftware/bash dir."
  exit 1;
}


cat assets/shell.sh > "$HOME/.oresoftware/bash/fame.sh" || {
  echo "Could not create oresoftware/bash/fame.sh file."
  exit 1;
}

cat assets/completion.sh > "$HOME/.oresoftware/bash/fame.completion.sh" || {
  echo "Could not create oresoftware/bash/fame.sh file."
  exit 1;
}


(

    shell_file="node_modules/@oresoftware/shell/assets/shell.sh";
    [ -f "$shell_file" ] && cat "$shell_file" > "$HOME/.oresoftware/shell.sh" && {
        echo "Successfully copied @oresoftware/shell/assets/shell.sh to $HOME/.oresoftware/shell.sh";
        exit 0;
    }

    shell_file="../shell/assets/shell.sh";
    [ -f "$shell_file" ] &&  cat "../shell/assets/shell.sh" > "$HOME/.oresoftware/shell.sh" && {
        echo "Successfully copied @oresoftware/shell/assets/shell.sh to $HOME/.oresoftware/shell.sh";
        exit 0;
    }

    curl -H 'Cache-Control: no-cache' \
         "https://raw.githubusercontent.com/oresoftware/shell/master/assets/shell.sh?$(date +%s)" \
          --output "$HOME/.oresoftware/shell.sh" 2> /dev/null || {
           echo "curl command failed to read shell.sh";
           exit 1;
    }
)


echo; echo -e "${fame_green} => fame was installed successfully.${fame_no_color}";
echo -e "Add the following line to your .bashrc/.bash_profile files:";
echo -e "${fame_cyan} . \"\$HOME/.oresoftware/shell.sh\"${fame_no_color}"; echo;



