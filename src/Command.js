import fs from 'fs';
import out from './utils/Out';

export default class {
  constructor(config) {
    this.config = config;
  }

  /**
   * Initialize a new project
   * @returns {Promise<void>}
   */
  async init() {
    const { homeDir, templateDir } = this.config;
    out.info('Initializing respository');
    await fs.copyFile(templateDir, homeDir);
    out.info('Complete.');
  }
}
