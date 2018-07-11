import chalk from 'chalk';

const { log } = console;

const debug = (...args) => {
  log.apply(args);
};

const warn = (...args) => {
  log.apply(chalk.yellow(args));
};

const info = (...args) => {
  log.apply(args);
};

const error = (...args) => {
  log.apply(chalk.red(args));
};

export default {
  debug,
  warn,
  error,
  info,
};
