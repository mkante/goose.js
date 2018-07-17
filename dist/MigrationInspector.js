'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _FileUtils = require('./utils/FileUtils');

var _FileUtils2 = _interopRequireDefault(_FileUtils);

var _Helpers = require('./utils/Helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Sort array
 * @param array
 * @param direction, default to asc
 * @returns {*}
 */
var sortByDate = function sortByDate(array) {
  var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'asc';
  return _lodash2.default.orderBy(array, [_lodash2.default.identity()], [direction]);
};

var rowAdaptor = function f(row) {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    startTime: row.start_time,
    endTime: row.end_time,
    date: row.created_at
  };
};

/**
 * Add up and down SQL files path
 * @param rootDir
 * @param it
 * @returns {*}
 */
var addUpDownFiles = function addUpDownFiles(rootDir, it) {
  _lodash2.default.set(it, 'sqlUpFile', _path2.default.join(rootDir, it.name, 'up.sql'));
  _lodash2.default.set(it, 'sqlDownFile', _path2.default.join(rootDir, it.name, 'down.sql'));
  return it;
};

var _class = function () {
  function _class(databaseHandler, migrationFolder) {
    _classCallCheck(this, _class);

    this.db = databaseHandler;
    this.folder = migrationFolder;
  }

  /**
   * Returns local migration files
   */


  _createClass(_class, [{
    key: 'localFiles',
    value: async function localFiles() {
      var _this = this;

      var files = _FileUtils2.default.files(this.folder, _Helpers.DDL_NAME_MATCHER, false);
      // sort files
      files = sortByDate(files);
      return (0, _lodash2.default)(files).map(_Helpers.migrationNameParser).map(function (it) {
        return addUpDownFiles(_this.folder, it);
      }).value();
    }

    /**
     * Returns cached migrations
     */

  }, {
    key: 'cachedFiles',
    value: async function cachedFiles() {
      var _this2 = this;

      var rows = await this.db.allFiles();
      return (0, _lodash2.default)(rows).map(rowAdaptor).map(function (it) {
        return addUpDownFiles(_this2.folder, it);
      }).value();
    }

    /**
     * Returns recent migrations
     */

  }, {
    key: 'freshFiles',
    value: async function freshFiles() {
      var cachedFiles = await this.cachedFiles();
      var exclude = (0, _lodash2.default)(cachedFiles).map(function (it) {
        return it.name;
      }).value();
      var localFiles = await this.localFiles();
      return (0, _lodash2.default)(localFiles).filter(function (it) {
        return !exclude.includes(it.name);
      }).value();
    }

    /**
     * Returns merged migrations
     */

  }, {
    key: 'mergedFiles',
    value: async function mergedFiles() {
      var rows = await this.cachedFiles();
      return (0, _lodash2.default)(rows).filter(function (it) {
        return it.status === 'up';
      }).value();
    }

    /**
     * Returns reverted migrations
     */

  }, {
    key: 'revertedFiles',
    value: async function revertedFiles() {
      var rows = await this.cachedFiles();
      return (0, _lodash2.default)(rows).filter(function (it) {
        return it.status !== 'up';
      }).value();
    }

    /**
     * Returns files ready for migration
     */

  }, {
    key: 'stagedFiles',
    value: async function stagedFiles() {
      var mergedFiles = await this.mergedFiles();
      var exclude = (0, _lodash2.default)(mergedFiles).map(function (it) {
        return it.name;
      }).value();

      var revertedFiles = await this.revertedFiles();
      var localFiles = await this.localFiles();

      var group = revertedFiles.concat(localFiles);
      return (0, _lodash2.default)(group).filter(function (it) {
        return !exclude.includes(it.name);
      }).uniqBy(function (it) {
        return it.id;
      }).sortBy(function (it) {
        return it.id;
      }).value();
    }
  }]);

  return _class;
}();

exports.default = _class;