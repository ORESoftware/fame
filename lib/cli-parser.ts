'use strict';

import * as path from "path";
import cliOpts from "./cli-options";
import {CliParser} from "@oresoftware/cli";

export default new CliParser(cliOpts, {
  allowUnknown: true,
  commandName: 'fame <?branch>',
  commandExamples: [
    'fame         # default branch is HEAD',
    'fame master  # use master branch',
    'fame dev     # use dev branch'
  ]
});
