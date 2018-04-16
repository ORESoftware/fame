#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const async = require("async");
const cp = require("child_process");
const parser_1 = require("./parser");
const command = [
    'git',
    'log',
    `--format='%ae' | uniq`,
];
async.autoInject({
    findAuthors: function (cb) {
        const k = cp.spawn('bash');
        const p = parser_1.createParser();
        const authors = [];
        k.stdin.write(command.join(' '));
        k.stdin.end('\n');
        k.stdout.pipe(p).on('data', function (d) {
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
    getValuesByAuthor: function (findAuthors, cb) {
        async.mapLimit(findAuthors, 3, function (auth, cb) {
            console.log('Analyzing commits for author:', auth);
            const k = cp.spawn('bash');
            const p = parser_1.createParser();
            k.stdin.write(`git log master --author="${auth}" --pretty=tformat: --numstat`);
            k.stdin.end('\n');
            const uniqueFiles = {};
            const v = {
                commits: 0,
                changes: 0,
                overall: 0,
                added: 0,
                removed: 0,
                author: auth,
                files: 0
            };
            k.stdout.pipe(p).on('data', function (d) {
                try {
                    const values = String(d).split(/\s+/g);
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
                .once('error', cb)
                .once('end', function () {
                v.overall = v.added - v.removed;
                cb(null, v);
            });
        }, cb);
    },
}, function (err, results) {
    if (err)
        throw err;
    console.log('results:');
    results.getValuesByAuthor.forEach(function (v) {
        console.log(util.inspect(v));
    });
    process.exit(0);
});
