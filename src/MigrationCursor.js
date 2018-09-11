import _ from 'lodash';

/**
 * Filter migration all the migrations above/below cursorId
 * @param array
 * @param cursorId
 * @returns {*}
 */
export default class {
  constructor(id = null) {
    this.id = id;
  }

  /**
   * Returns all elements greater than CursorId
   */
  downList(array = []) {
    const cursorId = this.id;

    if (cursorId == null) {
      const item = _.last(array);
      return item ? [item] : [];
    }
    return _(array).filter(it => (cursorId === 0) || (it.id >= cursorId)).value();
  }

  /**
   * Returns all elements greater than CursorId
   */
  upList(array = []) {
    const cursorId = this.id;

    if (cursorId == null) {
      const item = _.first(array);
      return item ? [item] : [];
    }
    return _(array).filter(it => (cursorId === 0) || (it.id <= cursorId)).value();
  }
}
