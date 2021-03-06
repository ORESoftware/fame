#!/usr/bin/env node
'use strict';

/*

 the files in .r2g/tests will be copied to this location:

 $HOME/.r2g/temp/project/tests/*

 they do not need to be .js files, but they need to have a hashbang,
 so that r2g knows how to run the file.
 
 the test files in .r2g/tests can load non-test files from .r2g/fixtures.

*/


const assert = require('assert');
const path = require('path');
const cp = require('child_process');
const os = require('os');
const fs = require('fs');
const EE = require('events');


process.on('unhandledRejection', (reason, p) => {
  // note: unless we force process to exit with 1, process may exit with 0 upon an unhandledRejection
  console.error(reason);
  process.exit(1);
});


const k = cp.spawn('bash');

k.stdin.end('fame --sort=0 --order=asc');

k.stdout.pipe(process.stdout);
k.stderr.pipe(process.stderr);


k.once('exit', code => {
  process.exit(0);
});



// your test goes here
// assert.strictEqual(true, false, 'whoops');
