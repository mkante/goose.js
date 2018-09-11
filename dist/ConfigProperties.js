'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonConfigTemplate = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _readYaml = require('read-yaml');

var _readYaml2 = _interopRequireDefault(_readYaml);

var _json2yaml = require('json2yaml');

var _json2yaml2 = _interopRequireDefault(_json2yaml);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _FileUtils = require('./utils/FileUtils');

var _FileUtils2 = _interopRequireDefault(_FileUtils);

var _Out = require('./utils/Out');

var _Out2 = _interopRequireDefault(_Out);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var jsonConfigTemplate = {
  environments: {
    default_migration_table: 'goose_migrations',
    default_database: 'development',
    development: {
      adapter: 'mysql',
      host: 'localhost',
      // name: 'production_db',
      user: 'root',
      pass: '',
      port: 3306,
      charset: 'utf8',
      database: ''
      // collation: 'utf8_unicode_ci',
    }
  },
  paths: {
    migrations: 'db/migrations',
    seeds: 'db/seeds'
  }
};

exports.jsonConfigTemplate = jsonConfigTemplate;

var Config = function () {
  function Config(params) {
    _classCallCheck(this, Config);

    this.homeDir = _lodash2.default.get(params, 'homeDir', '.');

    this.environments = _lodash2.default.get(params, 'environments', {});
    this.environments.default_migration_table = _lodash2.default.get(params, 'environments.default_migration_table', jsonConfigTemplate.environments.default_migration_table);

    this.environments.default_database = _lodash2.default.get(params, 'environments.default_database');

    this.paths = {
      migrations: _lodash2.default.get(params, 'paths.migrations', jsonConfigTemplate.paths.migrations),
      seeds: _lodash2.default.get(params, 'paths.seeds', jsonConfigTemplate.paths.seeds)
    };
    this.environment = null;
  }

  _createClass(Config, [{
    key: 'getEnvironmentDatabase',
    value: function getEnvironmentDatabase(envName) {
      return _lodash2.default.get(this.environments, envName, null);
    }
  }, {
    key: 'templateDir',
    get: function get() {
      return _path2.default.join(__dirname, '../template');
    }
  }, {
    key: 'defaultMigrationTable',
    get: function get() {
      return _lodash2.default.get(this.environments, 'default_migration_table', null);
    }
  }, {
    key: 'defaultDatabase',
    get: function get() {
      return _lodash2.default.get(this.environments, 'default_database', null);
    }
  }, {
    key: 'database',
    get: function get() {
      return this.getEnvironmentDatabase(this.environment);
    }
  }, {
    key: 'migrationsDir',
    get: function get() {
      return _path2.default.join(this.homeDir, this.paths.migrations);
    }
  }, {
    key: 'seedsDir',
    get: function get() {
      return _path2.default.join(this.homeDir, this.paths.seeds);
    }
  }], [{
    key: 'templateConfig',
    value: function templateConfig() {
      return JSON.stringify(jsonConfigTemplate, null, 2);
    }
  }, {
    key: 'templateConfigYAML',
    value: function templateConfigYAML() {
      return _json2yaml2.default.stringify(jsonConfigTemplate);
    }
  }, {
    key: 'from',
    value: async function from(filePath) {
      var data = await this.readFile(filePath);
      return new Config(data);
    }
  }, {
    key: 'readFile',
    value: async function readFile(filePath) {
      if (!_FileUtils2.default.exists(filePath)) {
        _Out2.default.warn('Can\'t resolve config file: ' + filePath);
        return null;
      }

      var parsedObj = null;

      if (/\.json$/.test(filePath)) {
        // read json file
        parsedObj = JSON.parse(_FileUtils2.default.read(filePath));
      } else if (/\.js$/.test(filePath)) {
        // read json file
        parsedObj = require(filePath); // eslint-disable-line
      } else if (/\.yml$/.test(filePath)) {
        // const text = fs.readFileSync(filePath, 'utf8');
        parsedObj = _readYaml2.default.sync(filePath);
      } else {
        _Out2.default.warn('Bad config file format, only json|yml are supported, found: ' + filePath);
      }
      return parsedObj;
    }
  }]);

  return Config;
}();

exports.default = Config;