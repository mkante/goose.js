#!/usr/bin/env node

import Path from 'path';
import Yarg from 'yargs';
import Command from './Command';
import ConfigProperties from './ConfigProperties';
import out from './utils/Out';
import Logger from './utils/Logger';
import FileUtils from './utils/FileUtils';

const log = Logger(__filename);
const CONF_FILE = Path.join('.', 'goose.json');

/**
 * Create command instance
 * @param arg
 * @returns {Command}
 */
const createInstance = (arg) => {
  const { conf, env } = arg;
  out.info(`Using config file: ${conf}`);
  if (!FileUtils.isFile(conf)) {
    throw new Error('Config file is missing');
  }
  const config = ConfigProperties.readFile(conf);
  config.environment = env || config.defaultDatabase;
  out.info(`Using environment: ${config.environment}\n`);

  return new Command(config);
};

/**
 * Error handler
 * @param callback
 * @returns {Promise<void>}
 */
const safe = async (callback) => {
  let result = null;
  try {
    result = await callback();
  } catch (e) {
    out.error(e.message);
    log.error(e);
  }
  return result;
};

const Handler = {
  /**
   * Init command handler
   * @param arg
   * @returns {Promise<void>}
   */
  init: arg => safe(async () => {
    const conf = new ConfigProperties({ homeDir: '.' });
    const cmd = new Command(conf);
    await cmd.init(arg.format);
  }),

  /**
   * Create command handler
   * @param arg
   * @returns {Promise<void>}
   */
  create: arg => safe(async () => {
    const cmd = createInstance(arg);
    await cmd.create(arg.name);
  }),

  /**
   * Status command handler
   * @param arg
   * @returns {Promise<void>}
   */
  status: arg => safe(async () => {
    const cmd = createInstance(arg);
    await cmd.status();
  }),

  /**
   * Migrate up command handler
   * @param arg
   * @returns {Promise<void>}
   */
  up: arg => safe(async () => {
    const cmd = createInstance(arg);
    return cmd.up(arg.timestamp);
  }),

  /**
   * Migrate down command handler
   * @param arg
   * @returns {Promise<void>}
   */
  down: arg => safe(async () => {
    const cmd = createInstance(arg);
    await cmd.down(arg.timestamp);
  }),
};

const { argv } = Yarg
  .usage('Usage: $0 <command> [options]')
  // init command
  .command('init', 'Initialize the project',
    it => it.option('format', { default: 'json', alias: 'f' }),
    Handler.init)
  // status command
  .command('status', 'Migration status', {}, Handler.status)
  // create command
  .command('create [name]', 'Create new migration file',
    opts => opts.option('timestamp', {
      default: 0,
      alias: 't',
      description: 'Timestamp',
    }),
    Handler.create)
  // up command
  .command('up', 'Run migration',
    opts => opts.option('timestamp', {
      alias: 't',
      description: 'Timestamp',
    }),
    Handler.up)
  // down
  .command('down', 'Rollback migration',
    opts => opts.option('timestamp', {
      alias: 't',
      description: 'Timestamp',
    }),
    Handler.down)
  .demandCommand()
  .option('help', { description: 'Show help ', alias: 'h' })
  .option('version', { description: 'Show version number', alias: 'v' })
  .option('env', { description: 'Set database environment', alias: 'e' })
  .option('conf', { description: 'Use config file', alias: 'c', default: CONF_FILE });

export default { argv, Handler };
