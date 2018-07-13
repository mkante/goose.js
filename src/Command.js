import Path from 'path';
import FileUtils from './utils/FileUtils';
import out from './utils/Out';

export default class {
  constructor(config) {
    this.config = config;
  }

  /**
   * Initialize a new project
   * @returns {Promise<void>}
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
}
