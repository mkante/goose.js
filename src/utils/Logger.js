import Log4JS from 'log4js';

export default (name) => {
  const log = Log4JS.getLogger(name);
  log.level = process.env.NODE_LEVEL;
  return log;
};
