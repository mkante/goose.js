'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _FileUtils = require('./utils/FileUtils');

var _FileUtils2 = _interopRequireDefault(_FileUtils);

var _DatabaseHandler = require('./DatabaseHandler');

var _DatabaseHandler2 = _interopRequireDefault(_DatabaseHandler);

var _MigrationInspector = require('./MigrationInspector');

var _MigrationInspector2 = _interopRequireDefault(_MigrationInspector);

var _Helpers = require('./utils/Helpers');

var _ConfigProperties = require('./ConfigProperties');

var _ConfigProperties2 = _interopRequireDefault(_ConfigProperties);

var _Views = require('./Views');

var _Views2 = _interopRequireDefault(_Views);

var _Out = require('./utils/Out');

var _Out2 = _interopRequireDefault(_Out);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * TODO: I don't like this method signature find a better way
 * Run migrations
 * @param db
 * @param array
 * @param sqlFile
 * @returns {Promise<void>}
 */
var doMigrations = async function f(db, array) {
  var useSqlUpFile = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = array[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;
      // eslint-disable-line
      if (!item) {
        continue;
      }
      var id = item.id,
          name = item.name;

      var filePath = useSqlUpFile ? item.sqlUpFile : item.sqlDownFile;

      if (!_FileUtils2.default.isFile(filePath)) {
        _Out2.default.warn('Missing migration: ' + filePath);
        continue;
      }

      if (useSqlUpFile) {
        await db.merge(id, filePath, name);
      } else {
        await db.revert(id, filePath);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
};

var Command = function () {
  function Command(config) {
    _classCallCheck(this, Command);

    this.config = config;
  }

  /**
   * Initialize a new project
   * @param format
   * @returns {Promise<*>}
   */


  _createClass(Command, [{
    key: 'init',
    value: async function init() {
      var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'json';
      var _config = this.config,
          homeDir = _config.homeDir,
          templateDir = _config.templateDir;


      _Out2.default.print('Initializing respository');
      try {
        var confContent = _ConfigProperties2.default.templateConfig();
        var confFile = _path2.default.join(homeDir, 'goosefile.json');

        if (('' + format).toLowerCase() === 'yaml') {
          confFile = _path2.default.join(homeDir, 'goosefile.yml');
          confContent = _ConfigProperties2.default.templateConfigYAML();
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
      var newMigrationName = (0, _Helpers.makeDDLName)(name);
      var dir = _path2.default.join(this.config.migrationsDir, newMigrationName);
      var upTemplate = '-- Add migration UP SQL statements.';
      var downTemplate = '-- Add rollback SQL statements.';
      _FileUtils2.default.mkdir(dir);
      _FileUtils2.default.put(_path2.default.join(dir, 'up.sql'), upTemplate);
      _FileUtils2.default.put(_path2.default.join(dir, 'down.sql'), downTemplate);
      _Out2.default.print('New migration create: ' + newMigrationName);
      return dir;
    }

    /**
     * Get migration status
     * @param name
     * @returns {Promise<void>}
     */

  }, {
    key: 'status',
    value: async function status() {
      return this.transactionScope(async function (inspector) {
        var cachedFiles = await inspector.cachedFiles();
        var freshFiles = await inspector.freshFiles();

        var consolidate = cachedFiles.concat(freshFiles);
        consolidate = (0, _lodash2.default)(consolidate).uniqBy(function (it) {
          return it.id;
        }).sortBy(function (it) {
          return it.id;
        }).value();
        _Views2.default.printStatus(consolidate);

        return { cachedFiles: cachedFiles, freshFiles: freshFiles };
      });
    }

    /**
     * Run migration up
     * @param name
     * @returns {Promise<void>}
     */

  }, {
    key: 'up',
    value: async function up(cursorId) {
      return this.transactionScope(async function (inspector, db) {
        var files = await inspector.stagedFiles();
        var filteredList = Command.filterByCursor(files, cursorId, _lodash2.default.first);
        await doMigrations(db, filteredList, true);
        return filteredList;
      });
    }

    /**
     * Run migration down
     * @param name
     * @returns {Promise<void>}
     */

  }, {
    key: 'down',
    value: async function down(cursorId) {
      return this.transactionScope(async function (inspector, db) {
        var files = await inspector.cachedFiles();
        var filteredList = Command.filterByCursor(files, cursorId, _lodash2.default.last);
        await doMigrations(db, filteredList, false);
        return filteredList;
      });
    }

    /**
     * Run function in transaction scope
     * @param callback
     * @returns {Promise<*>}
     */

  }, {
    key: 'transactionScope',
    value: async function transactionScope(callback) {
      var db = null;
      var result = null;
      var environment = this.config.environment;

      _Out2.default.info('Using environment: ' + environment);
      var dbConfig = this.config.database;
      if (!dbConfig) {
        throw new Error('No database found for environment: ' + environment);
      }
      try {
        db = await _DatabaseHandler2.default.create(dbConfig);
        var inspector = new _MigrationInspector2.default(db, this.config.migrationsDir);
        result = await callback(inspector, db);
        db.close();
      } catch (e) {
        if (db) db.close();
        throw e;
      }
      return result;
    }

    /**
     * Filter migration all the migrations above cursorId
     * @param array
     * @param cursorId
     * @returns {*}
     */

  }], [{
    key: 'filterByCursor',
    value: function filterByCursor(array, cursorId) {
      var nextIdFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _lodash2.default.first;

      if (!array) {
        return [];
      }
      if (!cursorId) {
        var item = nextIdFunc(array);
        return item ? [item] : [];
      }
      return (0, _lodash2.default)(array).filter(function (it) {
        return cursorId === 0 || it.id <= cursorId;
      }).value();
    }
  }]);

  return Command;
}();

exports.default = Command;