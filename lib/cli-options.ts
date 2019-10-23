'use strict';

import {asOptions, OptionsToType, Type} from "@oresoftware/cli";


export default asOptions([
  
  {
    name: 'version',
    type: Type.Boolean,
    help: 'Print tool version and exit.'
  },
  
  {
    name: 'help',
    short: 'h',
    type: Type.Boolean,
    help: 'Print this help and exit.'
  },
  
  {
    name: 'completion',
    type: Type.Boolean,
    help: 'Print bash completion code to stdout.'
  },
  
  {
    name: 'sort',
    short: 's',
    type: Type.String,
    help: 'Sort columns by name, comma separated, in order of priority. Use --asc or --desc to change direction.',
    default: ''
  },
  
  {
    name: 'order',
    type: Type.String,
    help: 'Sort ascending, or descending. Default is descending. Use like --order=asc, --order=desc',
    default: 'desc'
  },
  
  {
    name: 'verbose',
    short: 'v',
    type: Type.ArrayOfBoolean,
    help: 'Verbose output. Use multiple times for more verbose.'
  },
  
  {
    name: 'branch',
    short: 'b',
    type: Type.String,
    default: '',
    help: 'Git branch/sha to inspect, defaults to "HEAD".'
  },
  
  {
    name: 'sha',
    type: Type.String,
    default: '',
    help: 'Git branch/sha to inspect, defaults to "HEAD".'
  },
  
  {
    name: 'extensions',
    type: Type.ArrayOfString,
    help: 'Which file extensions to include.',
    default: []
  },
  
  {
    name: 'extension',
    type: Type.ArrayOfString,
    help: 'Which file extensions to include.',
    default: []
  },
  
  {
    name: 'ext',
    type: Type.ArrayOfString,
    help: 'Which file extensions to include.',
    default: []
  },
  
  {
    name: 'endswith',
    type: Type.ArrayOfString,
    help: 'Which file extensions to include.',
    default: []
  },
  
  {
    name: 'ends_with',
    type: Type.ArrayOfString,
    help: 'Which file extensions to include.',
    default: []
  },
  
  {
    name: 'author',
    type: Type.ArrayOfString,
    help: 'Which authors to include.',
    default: []
  },
  
  {
    name: 'match',
    type: Type.ArrayOfString,
    help: 'Which file extensions to include.',
    default: ['\.*']
  },
  
  {
    name: 'not_match',
    type: Type.ArrayOfString,
    help: 'Which file extensions to exclude.',
    default: []
  },
  
  {
    name: 'add',
    type: Type.Boolean,
    help: 'Create user name alias.',
  },
  
  {
    name: 'ignore_email_warning',
    type: Type.Boolean,
    help: 'Ignore email warning.',
  },
  
  {
    name: 'json',
    type: Type.Boolean,
    help: 'Write results in the form of JSON to stdout.',
  },
  
  {
    name: 'table',
    type: Type.Boolean,
    help: 'Force output table, if --json option is used.',
  }

]);
