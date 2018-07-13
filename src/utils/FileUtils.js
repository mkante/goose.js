import fs from 'fs';
import Path from 'path';
import _ from 'lodash';
import Logger from './Logger';
import { FileNotDirectory } from '../Error';

const log = Logger(__filename);

export default {
  exists: (path) => {
    let bool = false;
    try {
      bool = fs.existsSync(path);
    } catch (e) {
      log.error(e.message, e);
    }
    return bool;
  },
  isDir: (path) => {
    let bool = false;
    try {
      bool = fs.lstatSync(path).isDirectory();
    } catch (e) {
      log.error(e.message, e);
    }
    return bool;
  },
  isFile: (path) => {
    let bool = false;
    try {
      bool = fs.lstatSync(path).isFile(path);
    } catch (e) {
      log.error(e.message, e);
    }
    return bool;
  },
  files: function f(path, regex = /.*/) {
    if (!this.isDir(path)) {
      throw new FileNotDirectory(`path: ${path} is not a directory`);
    }

    let list = [];
    try {
      list = fs.readdirSync(path);
      list = _(list).filter(it => regex.test(it))
        .map(it => Path.join(path, it))
        .value();
    } catch (e) {
      log.error(e.message, e);
    }
    return list;
  },
};
