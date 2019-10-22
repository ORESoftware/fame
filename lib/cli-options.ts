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
    names: ['branch', 'sha', 'b'],
    type: 'string',
    default: '',
    help: 'Git branch/sha to inspect, defaults to "HEAD".'
  },
  
  {
    names: ['extensions', 'extension', 'ext'],
    type: 'arrayOfString',
    help: 'Which file extensions to include.',
    default: []
  },
  
  {
    names: ['endswith', 'ends-with'],
    type: 'arrayOfString',
    help: 'Which file extensions to include.',
    default: []
  },
  
  {
    names: ['author'],
    type: 'arrayOfString',
    help: 'Which authors to include.',
    default: []
  },
  
  {
    names: ['match'],
    type: 'arrayOfString',
    help: 'Which file extensions to include.',
    default: ['\.*']
  },
  
  {
    names: ['not-match'],
    type: 'arrayOfString',
    help: 'Which file extensions to exclude.',
    default: []
  },
  
  {
    names: ['add'],
    type: 'bool',
    help: 'Create user name alias.',
  },
  
  {
    names: ['ignore-email-warning'],
    type: 'bool',
    help: 'Ignore email warning.',
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
