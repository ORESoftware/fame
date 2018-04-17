"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliOptions = [
    {
        name: 'version',
        type: 'bool',
        help: 'Print tool version and exit.'
    },
    {
        names: ['help', 'h'],
        type: 'bool',
        help: 'Print this help and exit.'
    },
    {
        names: ['verbose', 'v'],
        type: 'arrayOfBool',
        help: 'Verbose output. Use multiple times for more verbose.'
    },
    {
        names: ['branch'],
        type: 'string',
        default: 'master',
        help: 'Git branch to inspect, defaults to "master" branch.'
    },
    {
        names: ['extensions', 'extension', 'ext'],
        type: 'arrayOfString',
        help: 'Which file extensions to include.',
        default: []
    },
    {
        names: ['regex'],
        type: 'arrayOfString',
        help: 'Which file extensions to include.',
        default: ['\.*']
    },
    {
        names: ['json'],
        type: 'bool',
        help: 'Write results in the form of JSON to stdout.',
    },
    {
        names: ['table'],
        type: 'bool',
        help: 'Force output table, if --json option is used.',
    }
];
