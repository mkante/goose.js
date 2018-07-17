'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DDL_NAME_MATCHER = exports.isoFormat = exports.migrationNameParser = exports.makeSeedLName = exports.makeDDLName = undefined;

var _dateformat = require('dateformat');

var _dateformat2 = _interopRequireDefault(_dateformat);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DDL_NAME_MATCHER = /^\d{4}_\d{2}_\d{2}_(\d{13})_(.*)/;

var uniqScriptName = function uniqScriptName(defaultSuffix, suffix) {
  var nameSuffix = !suffix ? defaultSuffix : suffix.trim();
  var date = new Date();
  var millisec = date.getTime();
  var name = (0, _dateformat2.default)(date, 'yyyy_MM_dd') + '_' + millisec + '_' + nameSuffix;
  return name;
};

var makeDDLName = function makeDDLName(suffix) {
  return uniqScriptName('DDL', suffix);
};

var makeSeedLName = function makeSeedLName(suffix) {
  return uniqScriptName('SEED', suffix);
};

var migrationNameParser = function migrationNameParser(fileName) {
  var matches = fileName.match(DDL_NAME_MATCHER);
  return {
    id: _lodash2.default.get(matches, '[1]', null),
    name: fileName,
    suffix: _lodash2.default.get(matches, '[2]', null)
  };
};

var isoFormat = function isoFormat(date) {
  return (0, _dateformat2.default)(date, 'isoDateTime');
};

exports.makeDDLName = makeDDLName;
exports.makeSeedLName = makeSeedLName;
exports.migrationNameParser = migrationNameParser;
exports.isoFormat = isoFormat;
exports.DDL_NAME_MATCHER = DDL_NAME_MATCHER;