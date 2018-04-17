export const cliOptions = [
  
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
    // `names` or a single `name`. First element is the `opts.KEY`.
    names: ['branch'],
    // See "Option specs" below for types.
    type: 'string',
    default: 'master',
    help: 'Git branch to inspect, defaults to "master" branch.'
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
    // `names` or a single `name`. First element is the `opts.KEY`.
    names: ['regex'],
    // See "Option specs" below for types.
    type: 'arrayOfString',
    help: 'Which file extensions to include.',
    default: ['\.*']
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