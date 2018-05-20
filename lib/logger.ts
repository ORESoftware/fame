
import chalk from 'chalk';

export const log = {
  info: console.log.bind(console, chalk.bold('fame:')),
  error: console.error.bind(console, chalk.red.bold.underline('fame error:'))
};