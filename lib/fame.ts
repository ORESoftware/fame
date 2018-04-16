#!/usr/bin/env node
'use strict';

// core
import util = require('util');

//npm
import async = require('async');
import cp = require('child_process');

//project
import {createParser} from './parser';

// git log --pretty=format:'{"email":"%ae"}'
// git log --author="<authorname>" --pretty=tformat: --numstat
// git log  --pretty=tformat: --numstat --pretty=format:'{"author":"%ae"}'
// git log master --numstat --pretty="%ae"

export interface AuthorType {
  commits: number,
  changes: number,
  overall: number,
  added: number,
  removed: number,
  author: string,
  files: number,
  uniqueFiles: { [key: string]: boolean }
}

const getNewAuthor = function (auth: string): AuthorType {
  return {
    commits: 0,
    changes: 0,
    overall: 0,
    added: 0,
    removed: 0,
    author: auth,
    files: 0,
    uniqueFiles: {}
  }
};

async.autoInject({
    
    getValuesByAuthor: function (cb: Function) {
      
      const k = cp.spawn('bash');
      const p = createParser();
      
      k.stdin.write(`git log master --numstat --pretty="%ae"`);
      k.stdin.end('\n');
      
      const results = {} as { [key: string]: AuthorType };
      let currentAuthor = '';
      
      k.stdout.pipe(p).on('data', function (d: string) {
        
        const values = String(d).split(/\s+/g);
        // console.log('newline values:', values);
        
        if (values[0]) {
          
          if (values[1] && values[2]) {
            
            const v = results[currentAuthor];
            
            if (!v) {
              throw new Error('no available author with email:' + currentAuthor);
            }
            
            const f = String(values[2]);
            
            if (f.startsWith('node_modules/') || f.startsWith('/node_modules/')) {
              return;
            }
            
            if (String(values[2]).endsWith('.js')) {
              values[0] !== '-' && (v.added += parseInt(values[0]));
              values[1] !== '-' && values[1] !== '-' && (v.changes += Math.abs(parseInt(values[0]) - parseInt(values[1])));
              values[1] !== '-' && (v.removed += parseInt(values[1]));
            }
            
            if (!v.uniqueFiles[values[2]]) {
              v.uniqueFiles[values[2]] = true;
              v.files++;
            }
          }
          else {
            
            currentAuthor = values[0];
            if (!results[currentAuthor]) {
              results[currentAuthor] = getNewAuthor(currentAuthor);
            }
            
            results[currentAuthor].commits++;
          }
          
        }
        
      })
      .once('error', cb)
      .once('end', function () {
        // v.overall = v.added - v.removed;
        cb(null, results);
      });
      
    }
  },
  
  function (err, results) {
    
    if (err) throw err;
    
    console.log('results:');
    Object.keys(results.getValuesByAuthor).forEach(function(k){
      delete results.getValuesByAuthor[k].uniqueFiles;
      console.log(util.inspect(results.getValuesByAuthor[k]));
    });
    
    process.exit(0);
    
  });