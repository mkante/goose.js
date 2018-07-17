'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _dateformat = require('dateformat');

var _dateformat2 = _interopRequireDefault(_dateformat);

var _Out = require('./utils/Out');

var _Out2 = _interopRequireDefault(_Out);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var column = function column(value, size) {
  if (!size) {
    return value;
  }

  var text = '';
  for (var i = 0; i < size; i += 1) {
    var char = _lodash2.default.get(value, '[' + i + ']', ' ');
    text = '' + text + char;
  }
  return text;
};

exports.default = {
  printStatus: function printStatus(files) {
    _Out2.default.print('');
    var C1 = 5;
    var C2 = 8;
    var C3 = 15;
    var C4 = 20;
    _Out2.default.print(column('', C1), column('STATUS', C2), column('ID', C3), column('DATE', C4), column('NAME'));
    _Out2.default.print('');
    _lodash2.default.each(files, function (it) {
      var formatedDate = '-';
      var mStatus = '-';
      var mId = it.id;
      var mName = it.name;
      if (it.date) {
        formatedDate = (0, _dateformat2.default)(it.date, 'yyyy-mm-dd h:MM:ss');
        mStatus = it.status;
      }

      _Out2.default.print(column('', C1), column(mStatus, C2), column(mId, C3), column(formatedDate, C4), column(mName));
    });
    _Out2.default.print('');
  }
};