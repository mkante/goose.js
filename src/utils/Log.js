import chalk from 'chalk';

const { log } = console;

const debug = (...args) => {
  log.apply(console, ['DEBUG: '] + args);
};

const warn = (...args) => {
  log(chalk.yellow(['WARN: '] + args));
};

const info = (...args) => {
  log.apply(console, ['INFO:'] + args);
};

const error = (...args) => {
  log(chalk.red(['ERROR: '] + args));
};

export default {
  debug,
  warn,
  error,
  info,
};
