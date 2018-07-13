import chalk from 'chalk';

const { log: out } = console;

const debug = (...args) => {
  out.apply(console, ['DEBUG: '] + args);
};

const warn = (...args) => {
  out(chalk.yellow(['WARN: '] + args));
};

const info = (...args) => {
  out.apply(console, ['INFO:'] + args);
};

const error = (...args) => {
  out(chalk.red(['ERROR: '] + args));
};

export default {
  debug,
  warn,
  error,
  info,
};
