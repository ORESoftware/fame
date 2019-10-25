'use strict';

export const r2gSmokeTest = async () => {
  return true;
};


export type EVCb<T, E = any> = (err: E, val?: T) => void;


export interface FameConf {
  'display names': {
    [key: string]: {
      emails: Array<string>
    }
  }
}


export interface AuthorType {
  commits: number,
  changes: number,
  overall: number,
  added: number,
  removed: number,
  author: string,
  files: number,
  uniqueFiles: { [key: string]: boolean },
  totals?: {
    added: number,
    removed: number,
    files: number,
    commits: number,
    changed: number
  }
}


export interface CliOptions {
  add: boolean,
  order: string,
  sort: string,
  asc: boolean,
  ignore_email_warning: boolean,
  desc: boolean,
  extensions: Array<string>,
  endswith: Array<string>,
  table: boolean,
  version: boolean,
  json: boolean,
  not_match: Array<string>,
  match: Array<string>,
  author: Array<string>,
  branch: string,
  verbose: Array<boolean>,
  help: boolean,
  completion: boolean,
  _args: Array<string>
}