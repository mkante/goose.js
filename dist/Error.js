'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DBTableExists = exports.DBInvalidProvider = exports.FileNotDirectory = exports.FileNotFound = undefined;

var _errors = require('errors');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FileNotFound = _errors2.default.create({ name: 'FileNotFound' });
var FileNotDirectory = _errors2.default.create({ name: 'FileNotDirectory' });
var DBInvalidProvider = _errors2.default.create({ name: 'DBInvalidProvider' });
var DBTableExists = _errors2.default.create({ name: 'DBTableExists' });

exports.FileNotFound = FileNotFound;
exports.FileNotDirectory = FileNotDirectory;
exports.DBInvalidProvider = DBInvalidProvider;
exports.DBTableExists = DBTableExists;