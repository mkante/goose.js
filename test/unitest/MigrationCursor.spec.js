import { assert } from 'chai';
import MigrationCursor from '../../src/MigrationCursor';


describe(__filename, () => {
  describe('#downList', () => {
    it('array === undefined && cursorId === undefined', () => {
      const cursor = new MigrationCursor();
      assert.equal(0, cursor.downList().length);
    });
    it('cursorId === null', () => {
      const cursor = new MigrationCursor();
      const list = cursor.downList([{ id: 10 }, { id: 11 }]);
      assert.equal(1, list.length);
      assert.equal(11, list[0].id);
    });
    it('cursorId === 0', () => {
      const cursor = new MigrationCursor(0);
      const list = cursor.downList([{ id: 100 }, { id: 200 }]);
      assert.equal(2, list.length);
      assert.equal(100, list[0].id);
      assert.equal(200, list[1].id);
    });
    it('cursorId === 5', () => {
      const cursor = new MigrationCursor(5);
      const list = cursor.downList([{ id: 2 }, { id: 5 }, { id: 6 }]);
      assert.equal(2, list.length);
      assert.equal(5, list[0].id);
      assert.equal(6, list[1].id);
    });
  });

  describe('#upList', () => {
    it('array === undefined && cursorId === undefined', () => {
      const cursor = new MigrationCursor();
      assert.equal(0, cursor.upList().length);
    });
    it('cursorId === null', () => {
      const cursor = new MigrationCursor();
      const list = cursor.upList([{ id: 10 }, { id: 11 }]);
      assert.equal(1, list.length);
      assert.equal(10, list[0].id);
    });
    it('cursorId === 0', () => {
      const cursor = new MigrationCursor(0);
      const list = cursor.upList([{ id: 100 }, { id: 200 }]);
      assert.equal(2, list.length);
      assert.equal(100, list[0].id);
      assert.equal(200, list[1].id);
    });
    it('cursorId === 5', () => {
      const cursor = new MigrationCursor(5);
      const list = cursor.upList([{ id: 2 }, { id: 5 }, { id: 6 }]);
      assert.equal(2, list.length);
      assert.equal(2, list[0].id);
      assert.equal(5, list[1].id);
    });
  });
});
