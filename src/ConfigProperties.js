import _ from 'lodash';
import readYaml from 'read-yaml';
import YAML from 'json2yaml';
import Path from 'path';
import FileUtils from './utils/FileUtils';
import Out from './utils/Out';

const jsonConfigTemplate = {
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
      // collation: 'utf8_unicode_ci',
    },
  },
  paths: {
    migrations: 'db/migrations',
    seeds: 'db/seeds',
  },
};


export default class {
  constructor(params) {
    this.homeDir = _.get(params, 'homeDir');
    this.environments = _.get(params, 'environments', {});
    this.environments.default_migration_table = _.get(params,
      'environments.default_migration_table',
      jsonConfigTemplate.environments.default_migration_table);

    this.paths = {
      migrations: _.get(params, 'paths.migrations', 'db/migrations'),
      seeds: _.get(params, 'paths.seeds', 'db/seeds'),
    };
  }
  get templateDir() {
    return Path.join(__dirname, '../template');
  }
  get templateConfig() {
    return JSON.stringify(jsonConfigTemplate, null, 2);
  }
  get templateConfigYAML() {
    return YAML.stringify(jsonConfigTemplate);
  }
  get defaultMigrationTable() {
    return _.get(this.environments, 'default_migration_table', null);
  }
  get defaultDatabase() {
    return _.get(this.environments, 'default_database', null);
  }
  dbEnv(env) {
    return _.get(this.environments, env, null);
  }
  get dbEnvDefault() {
    return this.dbEnv(this.defaultDatabase);
  }
  static async from(filePath) {
    const data = await this.readFile(filePath);
    return new this.constructor(data);
  }
  static async readFile(filePath) {
    if (!FileUtils.exists(filePath)) {
      Out.warn(`Can't resolve config file: ${filePath}`);
      return null;
    }

    let parsedObj = null;

    if (/\.(json)|(js)$/.test(filePath)) {
      // read json file
      parsedObj = require(filePath);  // eslint-disable-line
    } else if (/\.yml$/.test(filePath)) {
      // const text = fs.readFileSync(filePath, 'utf8');
      parsedObj = readYaml.sync(filePath);
    } else {
      Out.warn(`Bad config file format, only json|yml are supported, found: ${filePath}`);
    }
    return parsedObj;
  }
}
