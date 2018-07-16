'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _knex = require('knex');

var _knex2 = _interopRequireDefault(_knex);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Error = require('./Error');

var _Logger = require('./utils/Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _FileUtils = require('./utils/FileUtils');

var _FileUtils2 = _interopRequireDefault(_FileUtils);

var _Helpers = require('./utils/Helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var log = (0, _Logger2.default)(__filename);

/**
 * Returns provider connection settings.
 * @param provider
 * @param params
 * @returns {*}
 */
var getConnecionConfig = function getConnecionConfig(provider, params) {
  var map = {
    mysql: {
      client: 'mysql',
      connection: {
        host: _lodash2.default.get(params, 'host'),
        port: _lodash2.default.get(params, 'port'),
        user: _lodash2.default.get(params, 'user'),
        password: _lodash2.default.get(params, 'pass'),
        database: _lodash2.default.get(params, 'database')
      }
    },
    pgsql: {
      client: 'pg',
      connection: {
        host: _lodash2.default.get(params, 'host'),
        port: _lodash2.default.get(params, 'port'),
        user: _lodash2.default.get(params, 'user'),
        password: _lodash2.default.get(params, 'pass'),
        database: _lodash2.default.get(params, 'database')
      },
      searchPath: _lodash2.default.get(params, 'searchPath', ['public'])
    },
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: _lodash2.default.get(params, 'filename')
      }
    }
  };
  return map[provider];
};

var Handler = function () {
  function Handler() {
    _classCallCheck(this, Handler);
  }

  _createClass(Handler, [{
    key: 'initializeTable',
    value: async function initializeTable(tableNameOverride) {
      var tableName = !tableNameOverride ? this.mTable : tableNameOverride;
      var exists = await this.tableExists(tableName);
      if (exists) {
        log.debug('Table already exists ' + tableName);
        return null;
      }
      return this.createMigrationTable(tableName);
    }
  }, {
    key: 'tableExists',


    /**
     *
     * @param tableName
     * @returns {Promise<boolean>}
     */
    value: async function tableExists(tableName) {
      var bool = false;
      try {
        bool = await this.connection.hasTable(tableName);
      } catch (e) {
        //
      }
      return bool;
    }

    /**
     * Drop table if exists.
     * @param table
     * @returns {Promise<void>}
     */

  }, {
    key: 'dropTableIfExists',
    value: async function dropTableIfExists(table) {
      return this.connection.dropTableIfExists(table);
    }

    /**
     * Create migration table
     * @param tableName
     * @returns {Promise<void>}
     */

  }, {
    key: 'createMigrationTable',
    value: async function createMigrationTable(tableName) {
      var _this = this;

      return this.connection.createTable(tableName, function (table) {
        table.string('id').notNullable();
        table.string('name').notNullable();
        table.timestamp('start_time').notNullable();
        table.timestamp('end_time').notNullable();
        table.timestamp('created_at').defaultTo(_this.knex.fn.now()).notNullable();
      });
    }

    /**
     * Close the connection
     */

  }, {
    key: 'close',
    value: async function close() {
      return this.knex.destroy();
    }

    /**
     * Select all migrations
     * @param table
     * @returns {Promise<void>}
     */

  }, {
    key: 'allFiles',
    value: async function allFiles() {
      return this.knex.orderBy('id', 'desc').orderBy('name', 'desc').orderBy('created_at', 'desc').from(this.mTable);
    }

    /**
     * Execute a migration file
     * @param table
     * @returns {Promise<void>}
     */

  }, {
    key: 'truncate',
    value: async function truncate(tableName) {
      return this.knex(tableName).truncate();
    }

    /**
     * Execute a migration file
     * @param table
     * @returns {Promise<void>}
     */

  }, {
    key: 'exec',
    value: async function exec(id, filePath, name) {
      var SQL = _FileUtils2.default.read(filePath);
      log.debug('SQL file content: ' + SQL);

      var lines = Handler.splitStatements(SQL);
      var startTime = (0, _Helpers.isoFormat)(new Date());
      for (var i in lines) {
        // eslint-disable-line
        var line = lines[i];
        await this.connection.raw(line); // eslint-disable-line
      }
      var endTime = (0, _Helpers.isoFormat)(new Date());
      await this.knex.insert({
        id: id,
        name: name,
        start_time: startTime,
        end_time: endTime
      }).into(this.mTable);
      return Promise.resolve(lines.length);
    }

    /**
     *
     * @param context
     * @returns {*}
     */

  }, {
    key: 'connection',
    get: function get() {
      return this.knex.schema;
    }
  }], [{
    key: 'create',

    /**
     * Create instance
     * @param provider
     * @param params
     */
    value: async function create(params) {
      var provider = params.provider;

      if (!Handler.validProvider(provider)) {
        throw new _Error.DBInvalidProvider('Wrong database provider ' + provider);
      }

      var instance = new Handler();
      instance.provider = provider;
      instance.config = getConnecionConfig(provider, params);
      instance.mTable = 'goose_migrations';
      instance.knex = (0, _knex2.default)(instance.config);
      await instance.initializeTable();
      return instance;
    }

    /**
     * Validate database provider
     * @param provider
     * @returns {boolean}
     */

  }, {
    key: 'validProvider',
    value: function validProvider(provider) {
      return (/(mysql)|(sqlite)|(pgsql)/.test(('' + provider).toLowerCase())
      );
    }
  }, {
    key: 'splitStatements',
    value: function splitStatements(text) {
      if (!text) {
        return [];
      }
      var lines = text.trim().split(';'); // eslint-disable-line
      return (0, _lodash2.default)(lines).map(function (it) {
        return it.trim();
      }).value(); // trim every line
    }
  }]);

  return Handler;
}();

exports.default = Handler;