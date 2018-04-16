'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const stream = require("stream");
exports.createParser = function () {
    let lastLineData = '';
    return new stream.Transform({
        objectMode: true,
        transform: function (chunk, encoding, cb) {
            let self = this;
            let data = String(chunk);
            if (lastLineData) {
                data = lastLineData + data;
            }
            let lines = data.split('\n');
            lastLineData = lines.splice(lines.length - 1, 1)[0];
            lines.forEach(function (l) {
                l && self.push(l);
            });
            cb();
        },
        flush: function (cb) {
            if (lastLineData) {
                this.push(lastLineData);
            }
            lastLineData = '';
            cb();
        }
    });
};
exports.default = exports.createParser;
