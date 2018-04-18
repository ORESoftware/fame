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
import {log} from './logger';
import chalk from "chalk";
const Table = require('cli-table');
const table = new Table({
  // colWidths: [200, 100, 100, 100, 100, 100, 100],
  head: ['           Author             ', 'Files Modified', 'Commits', 'Added Lines', 'Removed Lines', 'Changes', 'Overall']
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
  uniqueFiles: { [key: string]: boolean },
  totals?: {
    added: number,
    removed: number,
    files: number,
    commits: number,
    changed: number
  }
}

// echo '<h1>hello, world</h1>' | /Applications/Firefox.app/Contents/MacOS/firefox /dev/fd/0
// echo '<h1>hello, world</h1>' | "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" /dev/fd/0

// download:
// https://ftp.mozilla.org/pub/firefox/releases/6.0.1/source/firefox-6.0.1.source.tar.bz2

// unzip:
// bzip2 -d firefox-6.0.1.source.tar.bz2

const getNewAuthor = function (auth: string): AuthorType {
  return {
    author: auth,
    files: 0,
    commits: 0,
    added: 0,
    removed: 0,
    changes: 0,
    overall: 0,
    uniqueFiles: {},
  }
};

const authors = _.flattenDeep([opts.author]).filter(v => v).map(v => String(v).trim());
authors.length && log.info('Author must match at least one of:', authors);
const branch = opts.branch;
log.info('Branch:', branch);
const exts = _.flattenDeep([opts.extensions]).filter(v => v).map(v => String(v).trim());
exts.length && log.info('Filenames must end with at least one of:', exts);
const matches = _.flattenDeep([opts.match]).filter(v => v).map(v => new RegExp(String(v).trim()));
matches.length && log.info('Files must match at least one of:', matches);
const nonMatches = _.flattenDeep([opts.not_match]).filter(v => v).map(v => new RegExp(String(v).trim()));
nonMatches.length && log.info('Files must not match:', nonMatches);

const doesFileMatch = function (f: string) {
  if (exts.length < 1) {
    return true;
  }
  return exts.some(function (ext) {
    return String(f).endsWith(ext);
  });
};

const doesFileMatchRegex = function (f: string) {
  if (matches.length < 1) {
    return true;
  }
  return matches.some(function (ext) {
    return ext.test(f);
  });
};

const doesFileNotMatchRegex = function (f: string) {
  if (nonMatches.length < 1) {
    return true;
  }
  return !nonMatches.some(function (ext) {
    return ext.test(f);
  });
};

const getAuthor = function () {
  return authors.map(function (a) {
    return `--author=${a}`
  })
  .join(' ');
};

async.autoInject({
    
    // checkIfBranchExists: function (cb: Function) {
    //   const k = cp.spawn('bash');
    //   k.stdin.end(`git show-ref --quiet refs/heads/${branch};\n`);
    //   k.once('exit', function (code) {
    //     if (code > 0) {
    //       console.error(`Branch with name "${branch}" does not exist locally.`);
    //       process.exit(1);
    //     }
    //     else {
    //       cb(null, true);
    //     }
    //   });
    // },
    
    checkIfBranchExists: function (cb: Function) {
      const k = cp.spawn('bash');
      k.stdin.end(`git show  ${branch};\n`);
      k.once('exit', function (code) {
        if (code > 0) {
          console.error(`Branch/sha with name "${branch}" does not exist locally.`);
          process.exit(1);
        }
        else {
          cb(null, true);
        }
      });
    },
    
    getCommitCount: function (cb: Function) {
      // git rev-list --count master
      
      const k = cp.spawn('bash');
      k.stdin.end(`git rev-list --count ${branch};\n`);
      let stdout = '';
      k.stdout.on('data', function (d) {
        stdout += String(d);
      });
      k.once('exit', function (code) {
        if (code > 0) {
          console.error(`Could not get commit count for branch => "${branch}".`);
          process.exit(1);
        }
        else {
          cb(null, Number.parseInt(stdout));
        }
      });
    },
    
    getValuesByAuthor: function (checkIfBranchExists: boolean, getCommitCount: number, cb: Function) {
      
      const k = cp.spawn('bash');
      const p = createParser();
      
      k.stdin.write(`git log ${branch} ${getAuthor()} --numstat --pretty="%ae"`);
      k.stdin.end('\n');
      
      const results = {} as { [key: string]: AuthorType };
      let currentAuthor = '';
      let commitNumber = 1;
      
      const getPercentage = function () {
        return ((commitNumber / getCommitCount) * 100).toFixed(2);
      };
      
      const uniqueFiles = {} as { [key: string]: true };
      
      const totals = {
        added: 0,
        changed: 0,
        removed: 0,
        files: 0,
        overall: 0,
        commits: getCommitCount
      };
      
      k.stdout.pipe(p).on('data', function (d: string) {
        
        const values = String(d).split(/\s+/g);
        // log.info('newline values:', values);
        
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
            const dfmnm = doesFileNotMatchRegex(f);
            
            if (dfm && dfmr && dfmnm) {
              
              let added: number, changed: number, removed: number, overall: number;
              
              {
                values[0] !== '-'
                && (added = parseInt(values[0]))
                && Number.isInteger(added)
                && (v.added += added)
                && (totals.added += added);
              }
              
              {
                values[0] !== '-'
                && values[1] !== '-'
                && (changed = parseInt(values[0]) + parseInt(values[1]))
                && Number.isInteger(changed)
                && (v.changes += changed)
                && (totals.changed += changed);
              }
              
              {
                values[0] !== '-'
                && values[1] !== '-'
                && (overall = parseInt(values[0]) - parseInt(values[1]))
                && Number.isInteger(overall)
                && (v.overall += overall)
                && (totals.overall += overall);
              }
              
              {
                values[1] !== '-'
                && (removed = parseInt(values[1]))
                && Number.isInteger(removed)
                && (v.removed += removed)
                && (totals.removed += removed);
              }
              
              if (!v.uniqueFiles[f]) {
                v.uniqueFiles[f] = true;
                v.files++;
              }
              
              if (!uniqueFiles[f]) {
                uniqueFiles[f] = true;
                totals.files++;
              }
            }
            
          }
          else {
            
            currentAuthor = values[0];
            if (!results[currentAuthor]) {
              results[currentAuthor] = getNewAuthor(currentAuthor);
            }
            
            readline.clearLine(process.stdout, 0);  // clear current text
            readline.cursorTo(process.stdout, 0);   // move cursor to beginning of line
            process.stdout.write(`${chalk.bold('fame:')} processing commit no.: ${commitNumber}, finished: ${getPercentage()}%`);
            commitNumber++;
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
        
        const mapped = {} as { [key: string]: any };
        
        Object.keys(results).forEach(function (k: string) {
          const v = results[k], z = mapped[k] = {} as any;
          v.totals = totals;
          z.author = v.author;
          z.files = [v.files, '/', `${(100 * v.files / totals.files).toFixed(2)}%`].join(' ');
          z.commits = [v.commits, '/', `${(100 * v.commits / getCommitCount).toFixed(2)}%`].join(' ');
          z.added = v.added;
          z.removed = v.removed;
          z.changes = v.changes;
          z.overall = v.overall;
        });
        
        cb(null, {mapped, byAuth: results});
      });
      
    }
  },
  
  function (err, results) {
    
    if (err) throw err;
    
    console.log('\n');
    
    const {mapped, byAuth} = results.getValuesByAuthor;
    
    Object.keys(byAuth).forEach(function (k) {
      
      delete byAuth[k].uniqueFiles;
      if (opts.json) {
        JSONStdio.logToStdout(byAuth[k]);
      }
      
      if (opts.table || !opts.json) {
        table.push(Object.values(mapped[k]));
      }
      
    });
    
    if (opts.table || !opts.json) {
      const str = table.toString().split('\n').map((v:string) => '  ' + v).join('\n');
      console.log(str);
    }
    
    console.log('\n');
    
    setTimeout(function () {
      process.exit(0);
    }, 10);
    
  });