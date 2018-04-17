"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = {
    info: console.log.bind(console, 'fame:'),
    error: console.error.bind(console, 'fame error:')
};
