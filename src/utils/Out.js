import chalk from 'chalk';

const { log } = console;

const debug = (...args) => {
  log(['DEBUG: '] + args);
};

const print = (...args) => {
  log.apply(console, args);
};

const warn = (...args) => {
  log(chalk.yellow(['WARN: '] + args));
};

const info = (...args) => {
  log(['INFO: '] + args);
};

const error = (...args) => {
  log(chalk.red(['ERROR: '] + args));
};

export default {
  debug,
  warn,
  error,
  info,
  print,
};
