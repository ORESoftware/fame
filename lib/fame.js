#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const async = require("async");
const cp = require("child_process");
const dashdash = require('dashdash');
const JSONStdio = require("json-stdio");
const _ = require("lodash");
const parser_1 = require("./parser");
const cli_options_1 = require("./cli-options");
const Table = require('cli-table');
const table = new Table({
    head: ['           Author             ', 'Files Modified Count', 'Commits', 'Added Lines', 'Removed Lines', 'Changes', 'Overall']
});
const opts = dashdash.parse({ options: cli_options_1.cliOptions });
const getNewAuthor = function (auth) {
    return {
        author: auth,
        commits: 0,
        files: 0,
        added: 0,
        removed: 0,
        changes: 0,
        overall: 0,
        uniqueFiles: {}
    };
};
const branch = opts.branch;
console.log('Branch:', branch);
const exts = _.flattenDeep(opts.extensions).filter(v => v);
console.log('File extensions:', exts.length > 0 ? exts : '(all files)');
const regex = _.flattenDeep(opts.regex).filter(v => v).map(v => new RegExp(v));
console.log('File regex:', regex.length ? regex : '(all files)');
const doesFileMatch = function (f) {
    if (exts.length < 1) {
        return true;
    }
    return exts.some(function (ext) {
        return String(f).endsWith(ext);
    });
};
const doesFileMatchRegex = function (f) {
    if (regex.length < 1) {
        return true;
    }
    return regex.some(function (ext) {
        return ext.test(f);
    });
};
async.autoInject({
    checkIfBranchExists: function (cb) {
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
    getValuesByAuthor: function (checkIfBranchExists, cb) {
        const k = cp.spawn('bash');
        const p = parser_1.createParser();
        k.stdin.write(`git log ${branch} --numstat --pretty="%ae"`);
        k.stdin.end('\n');
        const results = {};
        let currentAuthor = '';
        let commitNumber = 1;
        k.stdout.pipe(p).on('data', function (d) {
            const values = String(d).split(/\s+/g);
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
                    readline.clearLine(process.stdout, 0);
                    readline.cursorTo(process.stdout, 0);
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
            this.removeAllListeners();
            cb(null, results);
        });
    }
}, function (err, results) {
    if (err)
        throw err;
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
