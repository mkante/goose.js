'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Logger = require('./Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _Error = require('../Error');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _Logger2.default)(__filename);

exports.default = {
  exists: function exists(path) {
    var bool = false;
    try {
      bool = _fs2.default.existsSync(path);
    } catch (e) {
      log.error(e.message, e);
    }
    return bool;
  },
  isDir: function isDir(path) {
    var bool = false;
    try {
      bool = _fs2.default.lstatSync(path).isDirectory();
    } catch (e) {
      log.error(e.message, e);
    }
    return bool;
  },
  isFile: function isFile(path) {
    var bool = false;
    try {
      bool = _fs2.default.lstatSync(path).isFile(path);
    } catch (e) {
      log.error(e.message, e);
    }
    return bool;
  },
  files: function f(path) {
    var regex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : /.*/;
    var fullPaths = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    if (!this.isDir(path)) {
      throw new _Error.FileNotDirectory('path: ' + path + ' is not a directory');
    }

    var list = [];
    try {
      list = _fs2.default.readdirSync(path);
      // Append root path to files
      list = (0, _lodash2.default)(list).filter(function (it) {
        return regex.test(it);
      }).map(function (it) {
        // eslint-disable-line
        return fullPaths ? _path2.default.join(path, it) : it;
      }).value();
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
    return _fs2.default.writeFileSync(path, content);
  },
  read: function f(path) {
    var bytes = _fs2.default.readFileSync(path);
    return '' + bytes;
  },
  mkdir: function f(path, mode) {
    try {
      _fs2.default.mkdirSync(path, mode);
    } catch (e) {
      log.error(e);
    }
  },
  cp: async function f(src, desc) {
    return _fsExtra2.default.copySync(src, desc);
  },
  mkdtemp: function f(prefix, mode) {
    return _fs2.default.mkdtempSync(prefix, mode);
  }
};