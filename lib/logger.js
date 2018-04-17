"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
exports.log = {
    info: console.log.bind(console, chalk_1.default.bold('fame:')),
    error: console.error.bind(console, chalk_1.default.red.bold.underline('fame error:'))
};
