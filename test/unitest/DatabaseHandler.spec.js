import { assert } from 'chai';
import Logger from '../../src/utils/Logger';
import DatabaseHandler from '../../src/DatabaseHandler';
import { mysql as mysqlConfg } from '../database';
import { isoFormat } from '../../src/utils/Helpers';

const log = Logger(__filename);
const isoFormatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

describe(__filename, () => {
  it('#validProvider', () => {
    assert.isTrue(!DatabaseHandler.validProvider(), 'no parameter');
    assert.isTrue(!DatabaseHandler.validProvider('more'), 'Wrong provider');
    assert.isTrue(DatabaseHandler.validProvider('mySQL'), 'no parameter');
    assert.isTrue(DatabaseHandler.validProvider('pgsql'), 'no parameter');
    assert.isTrue(DatabaseHandler.validProvider('sqlite'), 'no parameter');
  });
  describe('#create', () => {
    it('New instance', async () => {
      const obj = await DatabaseHandler.create(mysqlConfg);
      log.info('config:', obj.config);
      assert.equal('mysql', obj.provider);
      assert.equal('127.0.0.1', obj.config.connection.host);
      assert.equal('test', obj.config.connection.user);
      assert.equal('test', obj.config.connection.password);
      assert.isTrue(await obj.tableExists('goose_migrations'));
      await obj.dropTableIfExists('goose_migrations');
      assert.isFalse(await obj.tableExists('goose_migrations'));
      obj.close();
    });
  });
  describe('#exec', () => {
    it('Run migration file', async () => {
      const obj = await DatabaseHandler.create(mysqlConfg);
      await obj.dropTableIfExists('goose_migrations');
      await obj.initializeTable();
      await obj.dropTableIfExists('users');
      log.info('Table user deleted');

      await obj.exec(10, './test/resources/create-user-1.sql', 'bird1');
      const files = await obj.allFiles();
      assert.isTrue(await obj.tableExists('users'));
      assert.equal(1, files.length, 'rows size == 1');

      log.info('Migration rows: ', files);

      const startTime = isoFormat(files[0].start_time);
      const endTime = isoFormat(files[0].end_time);
      const createAt = isoFormat(files[0].created_at);
      assert.equal(10, files[0].id);
      assert.equal('bird1', files[0].name);
      assert.isTrue(isoFormatRegex.test(startTime), `Start time ISO: ${startTime}`);
      assert.isTrue(isoFormatRegex.test(endTime), `End time ISO: ${endTime}`);
      assert.isTrue(isoFormatRegex.test(createAt), `Created at ISO: ${createAt}`);

      const users = await obj.knex.select()
        .orderBy('id', 'asc')
        .from('users');

      assert.equal(2, users.length, 'user rows size == 2');
      assert.equal('Jackie Jan', users[0].name);
      assert.equal('Bruce lee', users[1].name);
      obj.close();
    });
  });
});
