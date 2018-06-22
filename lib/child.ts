'use strict';

import {createParser} from "./parser";
import cp = require('child_process');
import JSONStdio = require('json-stdio');

const k = cp.spawn('bash');
const p = createParser();

const auth = String(process.env.FAME_AUTH || '').trim();

if(!auth){
  throw new Error('no author passed as env var.');
}

k.stdin.write(`git log master --author="${auth}" --pretty=tformat: --numstat`);
k.stdin.end('\n');

const uniqueFiles = {} as { [key: string]: boolean };

const v = {
  commits: 0,
  changes: 0,
  overall: 0,
  added: 0,
  removed: 0,
  author: auth,
  files: 0
};

k.stdout.pipe(p).on('data', function (d: string) {
  
  try {
    const values = String(d).split(/\s+/g);
    // console.log('newline values:', values);
    
    if (values[0] && values[1] && values[2]) {
      
      v.commits++;
      
      const f = String(values[2]);
      
      if (f.startsWith('node_modules/') || f.startsWith('/node_modules/')) {
        return;
      }
      
      if (String(values[2]).endsWith('.js')) {
        values[0] !== '-' && (v.added += parseInt(values[0]));
        values[1] !== '-' && values[1] !== '-' && (v.changes += Math.abs(parseInt(values[0]) - parseInt(values[1])));
        values[1] !== '-' && (v.removed += parseInt(values[1]));
      }
      
      if (!uniqueFiles[values[2]]) {
        uniqueFiles[values[2]] = true;
        v.files++;
      }
    }
  }
  catch (err) {
    log.error(err.stack);
  }
})
.once('error', function (err) {
  console.error(err.stack || err);
  process.exit(1);
})
.once('end', function () {
  v.overall = v.added - v.removed;
  JSONStdio.logToStdout(v);
  process.exit(0);
  
});