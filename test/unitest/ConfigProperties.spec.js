import { assert } from 'chai';
import { default as ConfigProps, jsonConfigTemplate } from '../../src/ConfigProperties';
import Logger from '../../src/utils/Logger';

const log = Logger(__filename);
const envDefault = jsonConfigTemplate.environments;

describe(__filename, () => {
  describe('Constructor', () => {
    const obj = new ConfigProps();
    it('Check default properties', () => {
      assert.equal(obj.defaultMigrationTable, envDefault.default_migration_table);
      assert.isNull(obj.defaultDatabase);
      assert.isNull(obj.getEnvironmentDatabase('prod'));
      assert.isNull(obj.database);
      assert.equal(jsonConfigTemplate.paths.migrations, obj.paths.migrations);
      assert.equal(jsonConfigTemplate.paths.seeds, obj.paths.seeds);
    });
  });

  describe('#readFile', () => {
    const f1 = 'path/to/wrong/file';
    const f2 = `${__dirname}/../resources/config1.json`;
    const f3 = `${__dirname}/../resources/config1.yml`;
    const f4 = `${__dirname}/../resources/config1.js`;
    const badJson = `${__dirname}/../resources/bad-config1.json`;

    it(f1, async () => {
      const data = await ConfigProps.readFile(f1);
      assert.isNull(data);
    });
    it(f2, async () => {
      const data = await ConfigProps.readFile(f2);
      assert.equal('goose_migrations', data.environments.default_migration_table);
    });
    it(f3, async () => {
      const data = await ConfigProps.readFile(f3);
      assert.equal('goose_migrations', data.environments.default_migration_table);
    });
    it(f4, async () => {
      const data = await ConfigProps.readFile(f4);
      assert.equal('goose_migrations', data.environments.default_migration_table);
    });
    it(badJson, async () => {
      try {
        await ConfigProps.readFile(badJson);
        assert.fail('Should throw error');
      } catch (e) {
        log.error(e.message);
        assert.isOk(/Unexpected token/.test(e.message));
      }
    });
  });

  describe('#from', () => {
    it('Instance from config file', async () => {
      const f1 = `${__dirname}/../resources/config1.json`;
      const conf = await ConfigProps.from(f1);
      assert.equal('goose_migrations', conf.defaultMigrationTable);
      assert.isNull(conf.database);
      assert.isNull(conf.environment);
    });
  });
});
