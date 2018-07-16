import Path from 'path';
import _ from 'lodash';
import FileUtils from './utils/FileUtils';
import DatabaseHandler from './DatabaseHandler';
import Inspector from './MigrationInspector';
import { makeDDLName } from './utils/Helpers';
import Views from './Views';
import out from './utils/Out';

export default class {
  constructor(config) {
    this.config = config;
  }

  /**
   * Initialize a new project
   * @param format
   * @returns {Promise<*>}
   */
  async init(format = 'json') {
    const {
      homeDir,
      templateDir,
      templateConfig,
      templateConfigYAML,
    } = this.config;

    out.print('Initializing respository');
    try {
      let confContent = templateConfig;
      let confFile = Path.join(homeDir, 'config.json');
      if (`${format}`.toLowerCase() === 'yaml') {
        confFile = Path.join(homeDir, 'config.yml');
        confContent = templateConfigYAML;
      }

      FileUtils.cp(templateDir, homeDir);
      FileUtils.put(confFile, confContent);
    } catch (e) {
      out.error(e.message);
      return Promise.reject(e);
    }
    out.print('Complete.');
    return Promise.resolve();
  }

  /**
   * Create migration file
   * @param name
   * @returns {Promise<void>}
   */
  async create(name) {
    const { homeDir } = this.config;
    const newMigrationName = makeDDLName(name);
    const dir = Path.join(homeDir, newMigrationName);
    const upTemplate = '// Add migration UP SQL statements.';
    const downTemplate = '// Add rollback SQL statements.';
    FileUtils.mkdir(dir);
    FileUtils.put(Path.join(dir, 'up.sql'), upTemplate);
    FileUtils.put(Path.join(dir, 'down.sql'), downTemplate);
    out.print(`New migration create: ${newMigrationName}`);
    return dir;
  }

  /**
   * Create migration file
   * @param name
   * @returns {Promise<void>}
   */
  async status() {
    return this.runScope(async (inspector) => {
      const cachedFiles = await inspector.cachedFiles();
      const freshFiles = await inspector.freshFiles();

      const mergedFiles = cachedFiles.concat(freshFiles);
      Views.printStatus(mergedFiles);

      return { cachedFiles, freshFiles };
    });
  }

  /**
   * Run function in transaction scope
   * @param callback
   * @returns {Promise<*>}
   */
  async runScope(callback) {
    let db = null;
    let result = null;
    out.print(`Current environment: ${this.config.environment}`);
    const dbConfig = this.config.database;
    const migrationDir = this.config.paths.migrations;
    try {
      db = await DatabaseHandler.create(dbConfig);
      const inspector = new Inspector(db, migrationDir);
      result = await callback(inspector, db);
      db.close();
    } catch (e) {
      if (db) db.close();
      throw e;
    }
    return result;
  }
}
