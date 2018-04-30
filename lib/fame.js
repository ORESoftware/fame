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
const logger_1 = require("./logger");
const chalk_1 = require("chalk");
const Table = require('cli-table');
const table = new Table({
    head: ['           Author             ', 'Files Modified', 'Commits', 'Added Lines', 'Removed Lines', 'Changes', 'Overall']
});
const opts = dashdash.parse({ options: cli_options_1.cliOptions });
const getNewAuthor = function (auth) {
    return {
        author: auth,
        files: 0,
        commits: 0,
        added: 0,
        removed: 0,
        changes: 0,
        overall: 0,
        uniqueFiles: {},
    };
};
const authors = _.flattenDeep([opts.author]).filter(v => v).map(v => String(v).trim());
authors.length && logger_1.log.info('Author must match at least one of:', authors);
const branch = opts.branch || opts._args[0] || 'master';
logger_1.log.info('SHA/Branch:', branch);
const exts = _.flattenDeep([opts.extensions]).filter(v => v).map(v => String(v).trim());
exts.length && logger_1.log.info('Filenames must end with at least one of:', exts);
const matches = _.flattenDeep([opts.match]).filter(v => v).map(v => new RegExp(String(v).trim()));
matches.length && logger_1.log.info('Files must match at least one of:', matches);
const nonMatches = _.flattenDeep([opts.not_match]).filter(v => v).map(v => new RegExp(String(v).trim()));
nonMatches.length && logger_1.log.info('Files must not match:', nonMatches);
const doesFileMatch = function (f) {
    if (exts.length < 1) {
        return true;
    }
    return exts.some(function (ext) {
        return String(f).endsWith(ext);
    });
};
const doesFileMatchRegex = function (f) {
    if (matches.length < 1) {
        return true;
    }
    return matches.some(function (ext) {
        return ext.test(f);
    });
};
const doesFileNotMatchRegex = function (f) {
    if (nonMatches.length < 1) {
        return true;
    }
    return !nonMatches.some(function (ext) {
        return ext.test(f);
    });
};
const getAuthor = function () {
    return authors.map(function (a) {
        return `--author=${a}`;
    })
        .join(' ');
};
async.autoInject({
    checkIfBranchExists: function (cb) {
        const k = cp.spawn('bash');
        k.stdin.end(`git show ${branch};\n`);
        k.once('exit', function (code) {
            if (code > 0) {
                logger_1.log.error(`Branch/sha with name "${branch}" does not exist locally.`);
                process.exit(1);
            }
            else {
                cb(null, true);
            }
        });
    },
    getCommitCount: function (cb) {
        const k = cp.spawn('bash');
        k.stdin.end(`git rev-list --count ${branch};\n`);
        let stdout = '';
        k.stdout.on('data', function (d) {
            stdout += String(d);
        });
        k.once('exit', function (code) {
            if (code > 0) {
                logger_1.log.error(`Could not get commit count for branch => "${branch}".`);
                process.exit(1);
            }
            else {
                cb(null, Number.parseInt(stdout));
            }
        });
    },
    getValuesByAuthor: function (checkIfBranchExists, getCommitCount, cb) {
        const k = cp.spawn('bash');
        const p = parser_1.createParser();
        k.stdin.write(`git log ${branch} ${getAuthor()} --numstat --pretty="%ae"`);
        k.stdin.end('\n');
        const results = {};
        let currentAuthor = '';
        let commitNumber = 1;
        const getPercentage = function () {
            return ((commitNumber / getCommitCount) * 100).toFixed(2);
        };
        const uniqueFiles = {};
        const totals = {
            added: 0,
            changed: 0,
            removed: 0,
            files: 0,
            overall: 0,
            commits: getCommitCount
        };
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
                    const dfmnm = doesFileNotMatchRegex(f);
                    if (dfm && dfmr && dfmnm) {
                        let added, changed, removed, overall;
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
                    readline.clearLine(process.stdout, 0);
                    readline.cursorTo(process.stdout, 0);
                    process.stdout.write(`${chalk_1.default.bold('fame:')} processing commit no.: ${commitNumber}, finished: ${getPercentage()}%`);
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
            this.removeAllListeners();
            const mapped = {};
            Object.keys(results).forEach(function (k) {
                const v = results[k], z = mapped[k] = {};
                v.totals = totals;
                z.author = v.author;
                z.files = [v.files, '/', `${(100 * v.files / totals.files).toFixed(2)}%`].join(' ');
                z.commits = [v.commits, '/', `${(100 * v.commits / getCommitCount).toFixed(2)}%`].join(' ');
                z.added = v.added;
                z.removed = v.removed;
                z.changes = v.changes;
                z.overall = v.overall;
            });
            cb(null, { mapped, byAuth: results });
        });
    }
}, function (err, results) {
    if (err)
        throw err;
    console.log('\n');
    const { mapped, byAuth } = results.getValuesByAuthor;
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
        const str = table.toString().split('\n').map((v) => '  ' + v).join('\n');
        console.log(str);
    }
    console.log('\n');
    setTimeout(function () {
        process.exit(0);
    }, 10);
});
