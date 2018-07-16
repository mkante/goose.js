import { assert } from 'chai';
import Path from 'path';
import Logger from '../../src/utils/Logger';
import DatabaseHandler from '../../src/DatabaseHandler';
import Inspector from '../../src/MigrationInspector';
import { mysql as mysqlConfg } from '../database';

const log = Logger(__filename);
const migrationDir = Path.join('.', 'test', 'resources', 'db_migrations');
let db = null;

const createInspector = async () => {
  db = await DatabaseHandler.create(mysqlConfg);
  return new Inspector(db, migrationDir);
};

const migrateUp = async (id, name) => {
  const file = Path.join(migrationDir, name, 'up.sql');
  return db.exec(id, file, name);
};

const getSqlUpFile = name => Path.join(migrationDir, name, 'up.sql');
const getSqlDownFile = name => Path.join(migrationDir, name, 'down.sql');

describe(__filename, () => {
  describe('#localFiles', () => {
    it('Should returns 2 migrations', async () => {
      const inspector = await createInspector();

      const files = await inspector.localFiles();
      log.info(`Files: ${files}`);
      let upFile1 = getSqlUpFile('2018_06_15_1531703913460_DDL1');
      let downFile2 = getSqlDownFile('2018_06_15_1531703913460_DDL1');
      assert.equal(2, files.length, '2 files found');
      assert.equal(1531703913460, files[0].id);
      assert.equal('2018_06_15_1531703913460_DDL1', files[0].name);
      assert.equal(upFile1, files[0].sqlUpFile);
      assert.equal(downFile2, files[0].sqlDownFile);

      upFile1 = getSqlUpFile('2018_06_15_1531703956888_DDL2');
      downFile2 = getSqlDownFile('2018_06_15_1531703956888_DDL2');
      assert.equal(1531703956888, files[1].id);
      assert.equal('2018_06_15_1531703956888_DDL2', files[1].name);
      assert.equal(upFile1, files[1].sqlUpFile);
      assert.equal(downFile2, files[1].sqlDownFile);
      db.close();
    });
  });

  describe('#cachedFiles', () => {
    it('Should returns 1 cached migrations', async () => {
      const inspector = await createInspector();
      await db.dropTableIfExists('goose_migrations');
      await db.initializeTable();

      await migrateUp(1531703913460, '2018_06_15_1531703913460_DDL1');

      const files = await inspector.cachedFiles();
      log.info(`Files: ${files}`);
      assert.equal(1, files.length, '2 files found');
      assert.equal(1531703913460, files[0].id);
      assert.equal('2018_06_15_1531703913460_DDL1', files[0].name);
      assert.equal(getSqlUpFile('2018_06_15_1531703913460_DDL1'), files[0].sqlUpFile);
      assert.equal(getSqlDownFile('2018_06_15_1531703913460_DDL1'), files[0].sqlDownFile);
      db.close();
    });
  });

  describe('#freshFiles', () => {
    it('Should returns 1 fresh migration', async () => {
      const inspector = await createInspector();
      await db.dropTableIfExists('goose_migrations');
      await db.initializeTable();

      await migrateUp(1531703913460, '2018_06_15_1531703913460_DDL1');

      const files = await inspector.freshFiles();
      log.info(`Files: ${files}`);
      assert.equal(1, files.length, '1 files found');
      assert.equal('2018_06_15_1531703956888_DDL2', files[0].name);
      db.close();
    });
  });
});
