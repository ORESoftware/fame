#!/usr/bin/env node
'use strict';

// core
import util = require('util');
import readline = require('readline');

//npm
import async = require('async');
import cp = require('child_process');

const dashdash = require('dashdash');
import stdio = require('json-stdio');

//project
import {createParser} from './parser';
import {CliOptions, cliOptions} from './cli-options';
import {log} from './logger';
import chalk from "chalk";
import {EVCb} from './index';

const Table = require('cli-table');
const table = new Table({
  // colWidths: [200, 100, 100, 100, 100, 100, 100],
  head: ['           Author             ', 'Files Modified', 'Commits', 'Added Lines', 'Removed Lines', 'Total Line Changes', 'Net Lines Added']
});


const sortByName = <any>{
  'author': 0,
  'filesmodified': 1,
  'commits': 2,
  'addedlines': 3,
  'removedlines': 4,
  'totallinechanges': 5,
  'netlinesadded': 6
};


const flattenDeep = function (a: Array<any>): Array<any> {
  return a.reduce((acc, val) => Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
};

const allowUnknown = process.argv.includes('--allow-unknown');
const parser = dashdash.createParser({options: cliOptions, allowUnknown});
const opts = <CliOptions>parser.parse({options: cliOptions});

if (opts.help) {
  {
    const help = parser.help({includeEnv: true}).trimRight();
    console.log('usage: node foo.js [OPTIONS]\n' + 'options:\n' + help);
    process.exit(0);
  }
}

if (opts.completion) {
  {
    const code = parser.bashCompletion({name: 'fame'});
    console.log(code);
    process.exit(0);
  }
}

const sortOrder = opts.order.toLowerCase().startsWith('asc') ? 'asc' : 'desc';


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

const mapAndFilter = (v: Array<any>): Array<any> => {
  return v.map(v => String(v || '').trim()).filter(Boolean);
};

const authors = mapAndFilter(flattenDeep([opts.author])).map(v => String(v).trim());
authors.length && log.info('Author must match at least one of:', authors);

const branch = opts.branch || opts._args[0] || 'HEAD';
log.info('SHA/Branch:', branch);

const exts = mapAndFilter(flattenDeep([opts.extensions, opts.endswith])).map(v => String(v).trim());
exts.length && log.info('Filenames must end with at least one of:', exts);

const matches = flattenDeep([opts.match]).filter(Boolean).map(v => new RegExp(String(v).trim()));
matches.length && log.info('Files must match at least one of:', matches);

const nonMatches = flattenDeep([opts.not_match]).filter(Boolean).map(v => new RegExp(String(v).trim()));
nonMatches.length && log.info('Files must not match:', nonMatches);


const doesFileMatch = function (f: string) {
  if (exts.length < 1) {
    return true;
  }
  return exts.some(ext => String(f).endsWith(ext));
};

const doesFileMatchRegex = function (f: string) {
  if (matches.length < 1) {
    return true;
  }
  return matches.some(ext => ext.test(f));
};

const doesFileNotMatchRegex = function (f: string) {
  if (nonMatches.length < 1) {
    return true;
  }
  return !nonMatches.some(ext => ext.test(f));
};


const getAuthor = function () {
  return authors.map(a => ` --author='${a}' `).join('');
};

async.autoInject({
    
    checkIfBranchExists(getBranchName: string, cb: EVCb<boolean>) {
      const k = cp.spawn('bash');
      k.stdin.end(`git show ${getBranchName};`);
      k.once('exit', code => {
        if (code > 0) {
          log.error(`Branch/sha with name "${getBranchName}" does not exist locally.`);
        }
        cb(code, true);
      });
    },
    
    getBranchName(cb: EVCb<string>) {
      const k = cp.spawn('bash');
      k.stdin.end(`git rev-parse --abbrev-ref '${branch}';`);
      
      let stdout = '';
      k.stdout.on('data', d => {
        stdout += String(d || '').trim();
      });
      
      k.once('exit', code => {
        if (code > 0) {
          log.error(`Branch/sha with name "${branch}" does not exist locally.`);
        } else {
          log.info('Full branch name:', stdout);
        }
        cb(code, stdout);
      });
    },
    
    getCommitCount(getBranchName: string, cb: EVCb<number>) {
      
      const k = cp.spawn('bash');
      k.stdin.end(`git rev-list --count '${getBranchName}';`);
      
      let stdout = '';
      k.stdout.on('data', function (d) {
        stdout += String(d || '').trim();
      });
      
      k.once('exit', code => {
        
        if (code > 0) {
          log.error(`Could not get commit count for branch => "${getBranchName}".`);
        }
        
        let num = null;
        
        try {
          num = Number.parseInt(stdout);
        } catch (err) {
          return cb(err);
        }
        
        cb(code, num);
        
      });
    },
    
    getValuesByAuthor(getBranchName: string, checkIfBranchExists: boolean, getCommitCount: number, cb: EVCb<any>) {
      
      const k = cp.spawn('bash');
      k.stdin.write(`git log '${getBranchName}' ${getAuthor()} --max-count=50000 --numstat --pretty="%ae"`);
      k.stdin.end('\n');
      
      const results = {} as { [key: string]: AuthorType };
      let currentAuthor = '';
      let commitNumber = 1;
      
      const getPercentage = () => {
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
      
      k.stdout.pipe(createParser()).on('data', d => {
          
          const values = String(d || '').split(/\s+/g);
          
          if (!values[0]) {
            return;
          }
          
          if (values[1] && values[2]) {
            
            const v = results[currentAuthor];
            
            if (!v) {
              throw new Error('No available author with email:' + currentAuthor);
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
            
            return;
          }
          
          currentAuthor = values[0];
          
          if (!results[currentAuthor]) {
            results[currentAuthor] = getNewAuthor(currentAuthor);
          }
          
          readline.clearLine(process.stdout, 0);  // clear current text
          readline.cursorTo(process.stdout, 0);   // move cursor to beginning of line
          process.stdout.write(`${chalk.bold('fame:')} processing commit no.: ${commitNumber}, finished: ${getPercentage()}%`);
          commitNumber++;
          results[currentAuthor].commits++;
          
          
        })
        .once('error', cb)
        .once('end', () => {
          
          const mapped = {} as { [key: string]: any };
          
          for (const k of  Object.keys(results)) {
            
            const v = results[k];
            const z = mapped[k] = {} as any;
            
            v.totals = totals;
            z.author = v.author;
            z.files = [v.files, '/', `${(100 * v.files / totals.files).toFixed(2)}%`].join(' ');
            z.commits = [v.commits, '/', `${(100 * v.commits / getCommitCount).toFixed(2)}%`].join(' ');
            z.added = v.added;
            z.removed = v.removed;
            z.changes = v.changes;
            z.overall = v.overall;
          }
          
          cb(null, {mapped, byAuth: results});
          
        });
      
    }
  },
  
  (err, results) => {
    
    if (err) {
      log.error(err);
      return process.exit(1);
    }
    
    
    console.log('\n');
    
    const {mapped, byAuth} = results.getValuesByAuthor;
    
    const rows: Array<any> = [];
    
    for (const k of Object.keys(byAuth)) {
      
      delete byAuth[k].uniqueFiles;
      
      if (opts.json) {
        stdio.log(byAuth[k]);
      }
      
      if (opts.table || !opts.json) {
        rows.push(Object.values(mapped[k]));
      }
    }
    
    
    const cleaned = String(opts.sort || '').split(',')
      .map(v => String(v || '').trim())
      .filter(Boolean)
      .map(v => String(v).toLowerCase().replace(/\s/g, ''));
    
    if (opts.sort && cleaned.length < 1) {
      log.warn('A --sort option was set, but apparently only had had empty space.');
    }
    
    const sortListd = cleaned.map(v => {
      
      let num = null;
      try {
        num = Number.parseInt(v);
      } catch (e) {
        // ignore
      }
      
      if (Number.isInteger(num)) {
        return num;
      }
      
      
      if (v in sortByName) {
        return sortByName[v];
      }
      
      throw 'Could not find column number for: ' + v;
      
    });
    
    
    if (opts.table || !opts.json) {
      
      
      if (sortListd.length > 0) {
        
        rows.sort((a, b) => {
          
          for (let num of sortListd) {
            
            
            let anum, bnum;
            
            if (num === 0) {
              anum = String(a[num]).trim();
              bnum = String(b[num]).trim();
            } else {
              anum = Number.parseInt(String(a[num]).trim().split(' ')[0]);
              bnum = Number.parseInt(String(b[num]).trim().split(' ')[0]);
            }
            
            
            if (anum > bnum) {
              if (sortOrder === 'desc') {
                return -1;
              }
              return 1;
            }
            
            if (bnum > anum) {
              if (sortOrder === 'desc') {
                return 1;
              }
              return -1
            }
            
          }
          
          return 0;
        });
      }
      
      
      for (const r of rows) {
        table.push(r);
      }
      
      
      const str = table.toString().split('\n').map((v: string) => '  ' + v).join('\n');
      console.log(str);
    }
    
    console.log('\n');
    
  });