#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const path = require("path");
const async = require("async");
const cp = require("child_process");
const JSONStdio = require("json-stdio");
const parser_1 = require("./parser");
const child = path.resolve(__dirname + '/child.js');
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
}, function (err, results) {
    if (err)
        throw err;
    console.log('results:');
    results.getValuesByAuthor.forEach(function (v) {
        console.log(util.inspect(v));
    });
    process.exit(0);
});
