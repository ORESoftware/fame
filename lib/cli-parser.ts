'use strict';

import * as path from "path";
import cliOpts from "./cli-options";
import {CliParser} from "@oresoftware/cli";

export default new CliParser(cliOpts, {
  allowUnknown: process.argv.indexOf('--allow-unknown') > 1 || process.argv.indexOf('--allow_unknown') > 1,
  commandName: 'fame <?branch>',
  commandExamples: [
    'fame         # default branch is HEAD',
    'fame master  # use master branch',
    'fame dev     # use dev branch'
  ]
});
