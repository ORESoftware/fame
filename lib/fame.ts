#!/usr/bin/env node
'use strict';

// core
import util = require('util');
import readline = require('readline');

//npm
import async = require('async');
import cp = require('child_process');
const dashdash = require('dashdash');
import JSONStdio = require('json-stdio');
import _ = require('lodash');

//project
import {createParser} from './parser';
import {cliOptions} from './cli-options';
const Table = require('cli-table');
const table = new Table({
  // colWidths: [200, 100, 100, 100, 100, 100, 100],
  head: ['           Author             ', 'Files Modified Count', 'Commits', 'Added Lines', 'Removed Lines', 'Changes', 'Overall']
});

const opts = dashdash.parse({options: cliOptions});

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
    author: auth,
    commits: 0,
    files: 0,
    added: 0,
    removed: 0,
    changes: 0,
    overall: 0,
    uniqueFiles: {}
  }
};

const branch = opts.branch;
console.log('Branch:', branch);
const exts = _.flattenDeep(opts.extensions).filter(v => v);
console.log('File extensions:', exts.length > 0 ? exts : '(all files)');
const regex = _.flattenDeep(opts.regex).filter(v => v).map(v => new RegExp(v));
console.log('File regex:', regex.length ? regex : '(all files)');

const doesFileMatch = function (f: string) {
  if (exts.length < 1) {
    return true;
  }
  return exts.some(function (ext) {
    return String(f).endsWith(ext);
  });
};

const doesFileMatchRegex = function (f: string) {
  if (regex.length < 1) {
    return true;
  }
  return regex.some(function (ext) {
    return ext.test(f);
  });
};

async.autoInject({
    
    checkIfBranchExists: function (cb: Function) {
      const k = cp.spawn('bash');
      k.stdin.end(`git show-ref --quiet refs/heads/${branch};\n`);
      k.once('exit', function (code) {
        if (code > 0) {
          console.error(`Branch with name "${branch}" does not exist locally.`);
          return process.exit(1);
        }
        cb(null, true);
      });
    },
    
    getValuesByAuthor: function (checkIfBranchExists: boolean, cb: Function) {
      
      const k = cp.spawn('bash');
      const p = createParser();
      
      k.stdin.write(`git log ${branch} --numstat --pretty="%ae"`);
      k.stdin.end('\n');
      
      const results = {} as { [key: string]: AuthorType };
      let currentAuthor = '';
      let commitNumber = 1;
      
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
            
            const dfm = doesFileMatch(f);
            const dfmr = doesFileMatchRegex(f);
            
            console.log('file:', f);
            console.log('dfm:', dfm);
            console.log('dfmr:', dfmr);
            
            if (dfm && dfmr) {
              values[0] !== '-' && (v.added += parseInt(values[0]));
              values[1] !== '-' && values[1] !== '-' && (v.changes += Math.abs(parseInt(values[0]) - parseInt(values[1])));
              values[1] !== '-' && (v.removed += parseInt(values[1]));
              
              if (!v.uniqueFiles[f]) {
                v.uniqueFiles[f] = true;
                v.files++;
              }
            }
            
          }
          else {
            
            currentAuthor = values[0];
            if (!results[currentAuthor]) {
              results[currentAuthor] = getNewAuthor(currentAuthor);
            }
            
            // process.stdout.write('+');
            
            readline.clearLine(process.stdout, 0);  // clear current text
            readline.cursorTo(process.stdout, 0);  // move cursor to beginning of line
            
            process.stdout.write('processing commit: ' + commitNumber++);
            
            results[currentAuthor].commits++;
          }
          
        }
        
      })
      .once('error', function (err) {
        this.removeAllListeners();
        cb(err);
      })
      .once('end', function () {
        // v.overall = v.added - v.removed;
        this.removeAllListeners();
        cb(null, results);
      });
      
    }
  },
  
  function (err, results) {
    
    if (err) throw err;
    
    console.log('\n');
    
    Object.keys(results.getValuesByAuthor).forEach(function (k) {
      
      delete results.getValuesByAuthor[k].uniqueFiles;
      if (opts.json) {
        JSONStdio.logToStdout(results.getValuesByAuthor[k]);
      }
      
      if (opts.table || !opts.json) {
        table.push(Object.values(results.getValuesByAuthor[k]));
      }
      
    });
    
    if (opts.table || !opts.json) {
      console.log(table.toString());
    }
    
    console.log('\n');
    
    setTimeout(function () {
      process.exit(0);
    }, 10);
    
  });