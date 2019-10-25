'use strict';

import * as path from "path";

export const fmhome = path.resolve(process.env.HOME + '/.fame');
export const fnhomeConf = path.resolve(fmhome + '/fame.conf.json');
export const magicString = '✔❤☆';