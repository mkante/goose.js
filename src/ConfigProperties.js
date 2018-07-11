import _ from 'lodash';
import fileExists from 'file-exists';
import readYaml from 'read-yaml';
import fs from 'fs';
import Log from './utils/Log';

export default class {
  constructor({ homeDir, environments = {}, paths = {} }) {
    this.homeDir = homeDir;
    this.environments = environments;
    this.paths = {
      migrations: _.get(paths, 'migrations', 'db/migrations'),
      seeds: _.get(paths, 'seeds', 'db/seeds'),
    };
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

    if (/\.json$/.test(filePath)) {
      // read json file
      parsedObj = require(filePath);  // eslint-disable-line
    } else if (/\.yml$/.test(filePath)) {
      const text = fs.readFileSync(filePath, 'utf8');
      parsedObj = readYaml.sync(text);
    } else {
      Log.warn(`Bad config file format, only json|yml are supported, found: ${filePath}`);
    }

    return parsedObj;
  }
}
