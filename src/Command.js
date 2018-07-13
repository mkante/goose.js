import Path from 'path';
import FileUtils from './utils/FileUtils';
import { makeDDLName } from './utils/Helpers';
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
    FileUtils.put(`${dir}/up.sql`, upTemplate);
    FileUtils.put(`${dir}/down.sql`, downTemplate);
    out.print(`New migration create: ${newMigrationName}`);
    return dir;
  }
}
