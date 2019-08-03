'use strict';

export default [
  
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
    names: ['completion'],
    type: 'bool',
    help: 'Print bash completion code to stdout.'
  },
  
  {
    names: ['sort', 's'],
    type: 'string',
    help: 'Sort columns by name, comma separated, in order of priority. Use --asc or --desc to change direction.',
    default: ''
  },
  
  {
    names: ['order'],
    type: 'string',
    help: 'Sort ascending, or descending. Default is descending. Use like --order=asc, --order=desc',
    default: 'desc'
  },
  
  {
    names: ['verbose', 'v'],
    type: 'arrayOfBool',
    help: 'Verbose output. Use multiple times for more verbose.'
  },
  
  {
    // `names` or a single `name`. First element is the `opts.KEY`.
    names: ['branch', 'sha', 'b'],
    // See "Option specs" below for types.
    type: 'string',
    default: '',
    help: 'Git branch/sha to inspect, defaults to "HEAD".'
  },
  
  {
    // `names` or a single `name`. First element is the `opts.KEY`.
    names: ['extensions', 'extension', 'ext'],
    // See "Option specs" below for types.
    type: 'arrayOfString',
    help: 'Which file extensions to include.',
    default: []
  },
  
  {
    names: ['endswith', 'ends-with'],
    // See "Option specs" below for types.
    type: 'arrayOfString',
    help: 'Which file extensions to include.',
    default: []
  },
  
  {
    // `names` or a single `name`. First element is the `opts.KEY`.
    names: ['author'],
    // See "Option specs" below for types.
    type: 'arrayOfString',
    help: 'Which authors to include.',
    default: []
  },
  
  {
    // `names` or a single `name`. First element is the `opts.KEY`.
    names: ['match'],
    // See "Option specs" below for types.
    type: 'arrayOfString',
    help: 'Which file extensions to include.',
    default: ['\.*']
  },
  
  {
    // `names` or a single `name`. First element is the `opts.KEY`.
    names: ['not-match'],
    // See "Option specs" below for types.
    type: 'arrayOfString',
    help: 'Which file extensions to exclude.',
    default: []
  },
  
  {
    // `names` or a single `name`. First element is the `opts.KEY`.
    names: ['json'],
    // See "Option specs" below for types.
    type: 'bool',
    help: 'Write results in the form of JSON to stdout.',
  },
  
  {
    // `names` or a single `name`. First element is the `opts.KEY`.
    names: ['table'],
    // See "Option specs" below for types.
    type: 'bool',
    help: 'Force output table, if --json option is used.',
  }

];
