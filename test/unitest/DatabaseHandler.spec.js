import { assert } from 'chai';
import Logger from '../../src/utils/Logger';
import DatabaseHandler from '../../src/DatabaseHandler';
import { mysql as mysqlConfg } from '../database';

const log = Logger(__filename);

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
      const obj = await DatabaseHandler.create('mysql', mysqlConfg);
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
      const obj = await DatabaseHandler.create('mysql', mysqlConfg);
      await obj.truncate('goose_migrations')
      log.info('Table truncated');
      await obj.dropTableIfExists('users');
      log.info('Table user deleted');

      await obj.exec('bird1', './test/resources/create-user-1.sql');
      const files = await obj.allFiles();
      assert.isTrue(await obj.tableExists('users'));
      assert.equal(1, files.length, 'rows size == 1');
      assert.equal('bird1', files[0].file);

      const users = await obj.knex.select()
        .from('users')
        .orderBy('id', 'asc');

      assert.equal(2, users.length, 'user rows size == 2');
      assert.equal('Jackie Jan', users[0].name);
      assert.equal('Bruce lee', users[1].name);
      obj.close();
    });
  });
});
