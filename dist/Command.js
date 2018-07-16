'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _FileUtils = require('./utils/FileUtils');

var _FileUtils2 = _interopRequireDefault(_FileUtils);

var _DatabaseHandler = require('./DatabaseHandler');

var _DatabaseHandler2 = _interopRequireDefault(_DatabaseHandler);

var _MigrationInspector = require('./MigrationInspector');

var _MigrationInspector2 = _interopRequireDefault(_MigrationInspector);

var _Helpers = require('./utils/Helpers');

var _Views = require('./Views');

var _Views2 = _interopRequireDefault(_Views);

var _Out = require('./utils/Out');

var _Out2 = _interopRequireDefault(_Out);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(config) {
    _classCallCheck(this, _class);

    this.config = config;
  }

  /**
   * Initialize a new project
   * @param format
   * @returns {Promise<*>}
   */


  _createClass(_class, [{
    key: 'init',
    value: async function init() {
      var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'json';
      var _config = this.config,
          homeDir = _config.homeDir,
          templateDir = _config.templateDir,
          templateConfig = _config.templateConfig,
          templateConfigYAML = _config.templateConfigYAML;


      _Out2.default.print('Initializing respository');
      try {
        var confContent = templateConfig;
        var confFile = _path2.default.join(homeDir, 'config.json');
        if (('' + format).toLowerCase() === 'yaml') {
          confFile = _path2.default.join(homeDir, 'config.yml');
          confContent = templateConfigYAML;
        }

        _FileUtils2.default.cp(templateDir, homeDir);
        _FileUtils2.default.put(confFile, confContent);
      } catch (e) {
        _Out2.default.error(e.message);
        return Promise.reject(e);
      }
      _Out2.default.print('Complete.');
      return Promise.resolve();
    }

    /**
     * Create migration file
     * @param name
     * @returns {Promise<void>}
     */

  }, {
    key: 'create',
    value: async function create(name) {
      var homeDir = this.config.homeDir;

      var newMigrationName = (0, _Helpers.makeDDLName)(name);
      var dir = _path2.default.join(homeDir, newMigrationName);
      var upTemplate = '-- Add migration UP SQL statements.';
      var downTemplate = '-- Add rollback SQL statements.';
      _FileUtils2.default.mkdir(dir);
      _FileUtils2.default.put(_path2.default.join(dir, 'up.sql'), upTemplate);
      _FileUtils2.default.put(_path2.default.join(dir, 'down.sql'), downTemplate);
      _Out2.default.print('New migration create: ' + newMigrationName);
      return dir;
    }

    /**
     * Create migration file
     * @param name
     * @returns {Promise<void>}
     */

  }, {
    key: 'status',
    value: async function status() {
      return this.runScope(async function (inspector) {
        var cachedFiles = await inspector.cachedFiles();
        var freshFiles = await inspector.freshFiles();

        var mergedFiles = cachedFiles.concat(freshFiles);
        _Views2.default.printStatus(mergedFiles);

        return { cachedFiles: cachedFiles, freshFiles: freshFiles };
      });
    }

    /**
     * Run function in transaction scope
     * @param callback
     * @returns {Promise<*>}
     */

  }, {
    key: 'runScope',
    value: async function runScope(callback) {
      var db = null;
      var result = null;
      _Out2.default.print('Current environment: ' + this.config.environment);
      var dbConfig = this.config.database;
      var migrationDir = this.config.paths.migrations;
      try {
        db = await _DatabaseHandler2.default.create(dbConfig);
        var inspector = new _MigrationInspector2.default(db, migrationDir);
        result = await callback(inspector, db);
        db.close();
      } catch (e) {
        if (db) db.close();
        throw e;
      }
      return result;
    }
  }]);

  return _class;
}();

exports.default = _class;