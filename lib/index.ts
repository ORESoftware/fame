#!/usr/bin/env node
'use strict';

// core
import util = require('util');
import path = require('path');

//npm
import async = require('async');
import cp = require('child_process');
import JSONStdio = require('json-stdio');

//project
import {createParser} from './parser';

// git log --pretty=format:'{"email":"%ae"}'
// git log --author="<authorname>" --pretty=tformat: --numstat
// git log  --pretty=tformat: --numstat --pretty=format:'{"author":"%ae"}'
// git log master --numstat --pretty="%ae"

const child = path.resolve(__dirname + '/child.js');

const command = [
  'git',
  'log',
  `--format='%ae' | uniq`,
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
        
        const k = cp.spawn('node', [child], {
          env: Object.assign({}, process.env, {
            FAME_AUTH: auth
          })
        });
        
        const p = JSONStdio.createParser();
        
        let value = {};
        
        k.stdout.pipe(p)
        .once('error', function (err) {
          this.removeAllListeners();
          cb(err);
        })
        .once(JSONStdio.stdEventName, function (v) {
          value = v;
        })
        .once('end', function () {
          this.removeAllListeners();
          cb(null, value);
        });
        
      }, cb);
      
    },
    
  },
  
  function (err, results) {
    
    if (err) throw err;
    
    console.log('results:');
    results.getValuesByAuthor.forEach(function (v) {
      console.log(util.inspect(v));
    });
    
    process.exit(0);
    
  });