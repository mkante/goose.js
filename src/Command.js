import Path from 'path';
import _ from 'lodash';
import FileUtils from './utils/FileUtils';
import DatabaseHandler from './DatabaseHandler';
import Inspector from './MigrationInspector';
import { makeDDLName } from './utils/Helpers';
import ConfigProperties from './ConfigProperties';
import Views from './Views';
import out from './utils/Out';
import MigrationCursor from './MigrationCursor';

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

    if (useSqlUpFile) {
      await db.merge(id, filePath, name);
    } else {
      await db.revert(id, filePath);
    }
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
    } = this.config;

    out.print('Initializing respository');
    try {
      let confContent = ConfigProperties.templateConfig();
      let confFile = Path.join(homeDir, 'goosefile.json');

      if (`${format}`.toLowerCase() === 'yaml') {
        confFile = Path.join(homeDir, 'goosefile.yml');
        confContent = ConfigProperties.templateConfigYAML();
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
    const newMigrationName = makeDDLName(name);
    const dir = Path.join(this.config.migrationsDir, newMigrationName);
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
      const mergeFiles = await inspector.mergedFiles();

      let consolidate = cachedFiles.concat(freshFiles);
      consolidate = _(consolidate).uniqBy(it => it.id)
        .sortBy(it => it.id)
        .value()
        .reverse(); // Reverse to show more natural display order
      Views.printStatus(consolidate);

      return { cachedFiles, freshFiles, mergeFiles };
    });
  }

  /**
   * Run migration up
   * @param name
   * @returns {Promise<void>}
   */
  async up(cursorId) {
    return this.transactionScope(async (inspector, db) => {
      const files = await inspector.stagedFiles();
      const cursor = new MigrationCursor(cursorId);
      const filteredList = cursor.upList(files);
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
      const files = await inspector.mergedFiles();
      const cursor = new MigrationCursor(cursorId);
      const filteredList = cursor.downList(files);
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
    const { environment } = this.config;
    out.info(`Using environment: ${environment}`);
    const dbConfig = this.config.database;
    if (!dbConfig) {
      throw new Error(`No database found for environment: ${environment}`);
    }
    try {
      db = await DatabaseHandler.create(dbConfig);
      const inspector = new Inspector(db, this.config.migrationsDir);
      result = await callback(inspector, db);
      db.close();
    } catch (e) {
      if (db) db.close();
      throw e;
    }
    return result;
  }
}
