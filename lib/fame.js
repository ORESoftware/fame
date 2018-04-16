#!/usr/bin/env node
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const async = require("async");
const cp = require("child_process");
const parser_1 = require("./parser");
const getNewAuthor = function (auth) {
    return {
        commits: 0,
        changes: 0,
        overall: 0,
        added: 0,
        removed: 0,
        author: auth,
        files: 0,
        uniqueFiles: {}
    };
};
async.autoInject({
    getValuesByAuthor: function (cb) {
        const k = cp.spawn('bash');
        const p = parser_1.createParser();
        k.stdin.write(`git log master --numstat --pretty="%ae"`);
        k.stdin.end('\n');
        const results = {};
        let currentAuthor = '';
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
            cb(null, results);
        });
    }
}, function (err, results) {
    if (err)
        throw err;
    console.log('results:');
    Object.keys(results.getValuesByAuthor).forEach(function (k) {
        delete results.getValuesByAuthor[k].uniqueFiles;
        console.log(util.inspect(results.getValuesByAuthor[k]));
    });
    process.exit(0);
});
