import fs from 'fs';
import extraFS from 'fs-extra';
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
  files: function f(path, regex = /.*/, fullPaths = true) {
    if (!this.isDir(path)) {
      throw new FileNotDirectory(`path: ${path} is not a directory`);
    }

    let list = [];
    try {
      list = fs.readdirSync(path);
      // Append root path to files
      if (fullPaths) {
        list = _(list).filter(it => regex.test(it))
          .map(it => Path.join(path, it))
          .value();
      }
    } catch (e) {
      log.error(e.message, e);
    }
    return list;
  },
  /*
  rm: function f(path) {
    let bool = false;
    if (!path) {
      return bool;
    }
    try {
      fs.unlinkSync(path);
      bool = true;
    } catch (e) {
      log.error(e);
    }
    return bool;
  },
  */
  put: function f(path, content) {
    return fs.writeFileSync(path, content);
  },
  read: function f(path) {
    const bytes = fs.readFileSync(path);
    return `${bytes}`;
  },
  mkdir: function f(path, mode) {
    try {
      fs.mkdirSync(path, mode);
    } catch (e) {
      log.error(e);
    }
  },
  cp: async function f(src, desc) {
    return extraFS.copySync(src, desc);
  },
  mkdtemp: function f(prefix, mode) {
    return fs.mkdtempSync(prefix, mode);
  },
};
