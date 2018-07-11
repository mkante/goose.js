import { assert } from 'chai';
import ConfigProps from '../../src/ConfigProperties';
// import Log from '../src/utils/Log';

describe(__filename, () => {
  describe('Constructor', () => {
    const obj = new ConfigProps();
    it('Check default propertis', () => {
      assert.equal('goose_migrations', obj.defaultMigrationTable);
      assert.isNull(obj.defaultDatabase);
      assert.isNull(obj.dbEnv('prod'));
      assert.equal('db/migrations', obj.paths.migrations);
      assert.equal('db/seeds', obj.paths.seeds);
    });
  });

  describe('#readFile', () => {
    const f1 = 'path/to/wrong/file';
    const f2 = `${__dirname}/../resources/config1.json`;
    const f3 = `${__dirname}/../resources/config1.yml`;
    const f4 = `${__dirname}/../resources/config1.js`;
    const badJson = `${__dirname}/../resources/bad-config1.js`;

    it(f1, async () => {
      const data = await ConfigProps.readFile(f1);
      assert.isNull(data);
    });
    it(f2, async () => {
      const data = await ConfigProps.readFile(f2);
      assert.equal('goose_migrations', data.enviroments.default_migration_table);
    });
    it(f3, async () => {
      const data = await ConfigProps.readFile(f3);
      assert.equal('goose_migrations', data.enviroments.default_migration_table);
    });
    it(f4, async () => {
      const data = await ConfigProps.readFile(f4);
      assert.equal('goose_migrations', data.enviroments.default_migration_table);
    });
    it(badJson, async () => {
      try {
        await ConfigProps.readFile(badJson);
        assert.fail('Should throw error');
      } catch (e) {
        assert.isOk(/module/.test(e.message));
      }
    });
  });
});
