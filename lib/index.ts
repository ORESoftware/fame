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

const command = [
  'git',
  'log',
  `--format='%ae'`,
  ' | uniq'
];

export interface LinesType {
  added: number,
  removed: number,
  file: string,
  author: string
  diff: number
}

async.autoInject({
  
  findAuthors: function (cb: Function) {
    
    const k = cp.spawn('bash');
    const p = createParser();
    
    const authors: Array<string> = [];
    k.stdin.write(command.join(' '));
    k.stdin.end('\n');
    
    k.stdout.pipe(p).on('data', function (d: string) {
      try {
        authors.push(String(d).trim());
      }
      catch (err) {
        log.error(err.stack);
      }
    })
    .once('error', cb)
    .once('end', function () {
      console.log('This repo has the following authors:');
      
      const auths = {};
      
      authors.forEach(function (v) {
        if (!auths[v]) {
          auths[v] = true;
          console.log(v);
        }
      });
      cb(null, Object.keys(auths));
    });
    
  },
  
  getValuesByAuthor: function (findAuthors: Array<string>, cb: Function) {
    
    async.mapLimit(findAuthors, 3, function (auth, cb) {
      
      console.log('Analyzing commits for author:', auth);
      
      const k = cp.spawn('bash');
      const p = createParser();
      
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
            
            if(String(values[2]).endsWith('.js')){
              values[0] !== '-' && (v.added += parseInt(values[0]));
              values[1] !== '-' && values[1] !== '-' && (v.changes += Math.abs(parseInt(values[0]) - parseInt(values[1])));
              values[1] !== '-' &&  (v.removed += parseInt(values[1]));
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
      .once('error', cb)
      .once('end', function () {
        v.overall = v.added - v.removed;
        cb(null, v);
      });
      
    }, cb);
    
  },
  
}, function (err, results) {
  
  if (err) throw err;
  
  console.log('results:');
  results.getValuesByAuthor.forEach(function (v) {
    console.log(util.inspect(v));
  });
  
  process.exit(0);
  
});