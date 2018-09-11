#!/usr/bin/env node
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _Command = require('./Command');

var _Command2 = _interopRequireDefault(_Command);

var _ConfigProperties = require('./ConfigProperties');

var _ConfigProperties2 = _interopRequireDefault(_ConfigProperties);

var _Out = require('./utils/Out');

var _Out2 = _interopRequireDefault(_Out);

var _Logger = require('./utils/Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _FileUtils = require('./utils/FileUtils');

var _FileUtils2 = _interopRequireDefault(_FileUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _Logger2.default)(__filename);
var CONF_FILE = _path2.default.join('.', 'goosefile.json');

/**
 * Create command instance
 * @param arg
 * @returns {Command}
 */
var createInstance = async function createInstance(arg) {
  var conf = arg.conf,
      env = arg.env;

  var homeDir = _path2.default.dirname(conf);
  _Out2.default.info('Using config file: ' + conf);
  _Out2.default.info('Using home folder: ' + homeDir);
  if (!_FileUtils2.default.isFile(conf)) {
    throw new Error('Config file is missing');
  }
  var config = await _ConfigProperties2.default.from(conf);
  config.environment = env || config.defaultDatabase;
  config.homeDir = homeDir;

  return new _Command2.default(config);
};

/**
 * Error handler
 * @param callback
 * @returns {Promise<void>}
 */
var safe = async function safe(callback) {
  var result = null;
  try {
    result = await callback();
  } catch (e) {
    _Out2.default.error(e.message);
    log.error(e);
  }
  return result;
};

var Handler = {
  /**
   * Init command handler
   * @param arg
   * @returns {Promise<void>}
   */
  init: function init(arg) {
    return safe(async function () {
      var conf = new _ConfigProperties2.default({ homeDir: '.' });
      var cmd = new _Command2.default(conf);
      await cmd.init(arg.format);
    });
  },

  /**
   * Create command handler
   * @param arg
   * @returns {Promise<void>}
   */
  create: function create(arg) {
    return safe(async function () {
      var cmd = await createInstance(arg);
      await cmd.create(arg.name);
    });
  },

  /**
   * Status command handler
   * @param arg
   * @returns {Promise<void>}
   */
  status: function status(arg) {
    return safe(async function () {
      var cmd = await createInstance(arg);
      await cmd.status();
    });
  },

  /**
   * Migrate up command handler
   * @param arg
   * @returns {Promise<void>}
   */
  up: function up(arg) {
    return safe(async function () {
      var cmd = await createInstance(arg);
      return cmd.up(arg.timestamp);
    });
  },

  /**
   * Migrate down command handler
   * @param arg
   * @returns {Promise<void>}
   */
  down: function down(arg) {
    return safe(async function () {
      var cmd = await createInstance(arg);
      await cmd.down(arg.timestamp);
    });
  }
};

var _Yarg$usage$command$c = _yargs2.default.usage('Usage: $0 <command> [options]')
// init command
.command('init', 'Initialize the project', function (it) {
  return it.option('format', { default: 'json', alias: 'f' });
}, Handler.init)
// status command
.command('status', 'Migration status', {}, Handler.status)
// create command
.command('create [name]', 'Create new migration file', function (opts) {
  return opts.option('timestamp', {
    default: null,
    alias: 't',
    description: 'Timestamp'
  });
}, Handler.create)
// up command
.command('up', 'Run migration', function (opts) {
  return opts.option('timestamp', {
    alias: 't',
    description: 'Timestamp'
  });
}, Handler.up)
// down
.command('down', 'Rollback migration', function (opts) {
  return opts.option('timestamp', {
    alias: 't',
    description: 'Timestamp'
  });
}, Handler.down).demandCommand().option('help', { description: 'Show help ', alias: 'h' }).option('version', { description: 'Show version number', alias: 'v' }).option('env', { description: 'Set database environment', alias: 'e' }).option('conf', { description: 'Use config file', alias: 'c', default: CONF_FILE }),
    argv = _Yarg$usage$command$c.argv;

exports.default = { argv: argv, Handler: Handler };