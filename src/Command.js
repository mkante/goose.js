import Path from 'path';
import _ from 'lodash';
import FileUtils from './utils/FileUtils';
import DatabaseHandler from './DatabaseHandler';
import Inspector from './MigrationInspector';
import { makeDDLName } from './utils/Helpers';
import Views from './Views';
import out from './utils/Out';

/**
 * TODO: I don't like this method signature find a better way
 * Run migrations
 * @param db
 * @param array
 * @param sqlFile
 * @returns {Promise<void>}
 */
const doMigrations = async function f(db, array, useSqlUpFile = true) {
  for (const item of array) { // eslint-disable-line
    if (!item) {
      continue;
    }
    const { id, name } = item;
    const filePath = useSqlUpFile ? item.sqlUpFile : item.sqlDownFile;

    if (!FileUtils.isFile(filePath)) {
      out.warn(`Missing migration: ${filePath}`);
      continue;
    }
    await db.exec(id, filePath, name);
  }
};

export default class Command {
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
    const upTemplate = '-- Add migration UP SQL statements.';
    const downTemplate = '-- Add rollback SQL statements.';
    FileUtils.mkdir(dir);
    FileUtils.put(Path.join(dir, 'up.sql'), upTemplate);
    FileUtils.put(Path.join(dir, 'down.sql'), downTemplate);
    out.print(`New migration create: ${newMigrationName}`);
    return dir;
  }

  /**
   * Get migration status
   * @param name
   * @returns {Promise<void>}
   */
  async status() {
    return this.transactionScope(async (inspector) => {
      const cachedFiles = await inspector.cachedFiles();
      const freshFiles = await inspector.freshFiles();

      const mergedFiles = cachedFiles.concat(freshFiles);
      Views.printStatus(mergedFiles);

      return { cachedFiles, freshFiles };
    });
  }

  /**
   * Run migration up
   * @param name
   * @returns {Promise<void>}
   */
  async up(cursorId) {
    return this.transactionScope(async (inspector, db) => {
      const files = await inspector.freshFiles();
      const filteredList = Command.filterByCursor(files, cursorId);
      await doMigrations(db, filteredList, true);
      return filteredList;
    });
  }

  /**
   * Run migration down
   * @param name
   * @returns {Promise<void>}
   */
  async down(cursorId) {
    return this.transactionScope(async (inspector, db) => {
      const files = await inspector.cachedFiles();
      const filteredList = Command.filterByCursor(files, cursorId);
      await doMigrations(db, filteredList, false);
      return filteredList;
    });
  }

  /**
   * Run function in transaction scope
   * @param callback
   * @returns {Promise<*>}
   */
  async transactionScope(callback) {
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

  /**
   * Filter migration all the migrations above cursorId
   * @param array
   * @param cursorId
   * @returns {*}
   */
  static filterByCursor(array, cursorId) {
    if (!array) {
      return [];
    }
    if (!cursorId) {
      return array;
    }
    return _(array).filter(it => it.id <= cursorId).value();
  }
}
