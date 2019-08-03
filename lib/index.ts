

export const r2gSmokeTest = async () => {
  return true;
};


export type EVCb<T, E = any> = (err: E, val?: T) => void;

export interface CliOptions {
  order: string,
  sort: string,
  asc: boolean,
  desc: boolean,
  extensions: Array<string>,
  endswith: Array<string>,
  table: boolean,
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