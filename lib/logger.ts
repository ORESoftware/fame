
import chalk from 'chalk';

export const log = {
  info: console.log.bind(console, chalk.bold('fame:')),
  warn: console.log.bind(console, chalk.yellow('fame warning:')),
  error: console.error.bind(console, chalk.red.bold.underline('fame error:'))
};