import _ from 'lodash';
import fileExists from 'file-exists';
import readYaml from 'read-yaml';
import Log from './utils/Log';

export default class {
  constructor(params) {
    this.homeDir = _.get(params, 'homeDir');
    this.environments = _.get(params, 'environments', {});
    this.environments.default_migration_table = _.get(params,
      'environments.default_migration_table',
      'goose_migrations');

    this.paths = {
      migrations: _.get(params, 'paths.migrations', 'db/migrations'),
      seeds: _.get(params, 'paths.seeds', 'db/seeds'),
    };
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
  static async from(filePath) {
    const data = await this.readFile(filePath);
    return new this.constructor(data);
  }
  static async readFile(filePath) {
    try {
      await fileExists(filePath);
    } catch (e) {
      Log.warn(`Can't resolve config file: ${filePath}`);
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
      Log.warn(`Bad config file format, only json|yml are supported, found: ${filePath}`);
    }
    return parsedObj;
  }
}
