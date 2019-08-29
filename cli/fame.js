#!/usr/bin/env node
'use strict';


if (process.env.oresoftware_dev === 'yes') {
  console.log('We are transpiling via tsc');
  const path = require('path');
  const cp = require('child_process');
  const projectRoot = path.dirname(__dirname);
  const {run} = require('./run-tsc-if-script');
  cp.execSync(run(projectRoot), {encoding: 'utf8'});
}


require('../dist/cli');