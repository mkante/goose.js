'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Filter migration all the migrations above/below cursorId
 * @param array
 * @param cursorId
 * @returns {*}
 */
var _class = function () {
  function _class() {
    var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, _class);

    this.id = id;
  }

  /**
   * Returns all elements greater than CursorId
   */


  _createClass(_class, [{
    key: 'downList',
    value: function downList() {
      var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var cursorId = this.id;

      if (cursorId == null) {
        var item = _lodash2.default.last(array);
        return item ? [item] : [];
      }
      return (0, _lodash2.default)(array).filter(function (it) {
        return cursorId === 0 || it.id >= cursorId;
      }).value();
    }

    /**
     * Returns all elements greater than CursorId
     */

  }, {
    key: 'upList',
    value: function upList() {
      var array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var cursorId = this.id;

      if (cursorId == null) {
        var item = _lodash2.default.first(array);
        return item ? [item] : [];
      }
      return (0, _lodash2.default)(array).filter(function (it) {
        return cursorId === 0 || it.id <= cursorId;
      }).value();
    }
  }]);

  return _class;
}();

exports.default = _class;