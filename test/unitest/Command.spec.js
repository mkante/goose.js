import { assert } from 'chai';
import Path from 'path';
import FileUtils from '../../src/utils/FileUtils';
import Command from '../../src/Command';
import Logger from '../../src/utils/Logger';
import ConfigProperties from '../../src/ConfigProperties';
import { mysql as mysqlConfig } from '../database';
import {
  resetMigration,
  makeDatabaseHandler,
  makeTestConfig
} from './Helpers';

const log = Logger(__filename);

const testTempDir = () => FileUtils.mkdtemp('/tmp/goose_test');


describe(__filename, () => {
  describe('#init', () => {
    it('Initialize with json config', async () => {
      const tmpDir = testTempDir()
      log.info(`Temp directory: ${tmpDir}`);
      const cmd = new Command(new ConfigProperties({
        homeDir: tmpDir,
      }));

      assert.isTrue(FileUtils.isDir(tmpDir), `temp ${tmpDir} directory exists`);
      await cmd.init();
      const files = FileUtils.files(tmpDir);
      log.info(`Init directory content: ${files}`);
      assert.isTrue(files.length > 0, 'Directory not empty');
      assert.isTrue(FileUtils.isFile(`${tmpDir}/config.json`), 'config.js file exists');
      assert.isTrue(FileUtils.isDir(`${tmpDir}/db`), '/db folder exists');
    });

    it('Initialize with YAML config', async () => {
      const tmpDir = testTempDir();
      const cmd = new Command(new ConfigProperties({ homeDir: tmpDir }));

      assert.isTrue(FileUtils.isDir(tmpDir), `Temp ${tmpDir} directory exists`);
      await cmd.init('yaml');
      const files = FileUtils.files(tmpDir);
      log.info(`Init directory content: ${files}`);
      assert.isTrue(files.length > 0, 'Directory not empty');
      assert.isTrue(FileUtils.isFile(`${tmpDir}/config.yml`), 'config.js file exists');
      assert.isTrue(FileUtils.isDir(`${tmpDir}/db`), '/db folder exists');
    });
  });

  describe('#create', () => {
    it('Create with default parameter', async () => {
      const tmpDir = testTempDir();
      log.info(`Temp directory: ${tmpDir}`);
      const cmd = new Command(new ConfigProperties({
        homeDir: tmpDir,
      }));

      const directory = await cmd.create();
      assert.isTrue(FileUtils.isDir(directory), `Migration ${directory} directory was created`);
      const files = FileUtils.files(directory);
      log.info(`Directory content: ${files}`);
      assert.equal(2, files.length, 'up.sql and down.sql files');
      assert.isTrue(FileUtils.isFile(`${directory}/up.sql`), 'down.sql file exists');
      assert.isTrue(FileUtils.isFile(`${directory}/down.sql`), 'down.sql file exists');
    });
  });

  describe('#status', () => {
    it('Create with default parameter', async () => {
      const conf = makeTestConfig();

      const cmd = new Command(conf);
      const result = await cmd.status();
      assert.equal(1, result.cachedFiles.length);
      assert.equal(2, result.freshFiles.length);
    });
  });

  describe('#filterByCursor', () => {
    it('array === undefined && cursorId === undefined', () => {
      const list = Command.filterByCursor();
      assert.equal(0, list.length);
    });
    it('cursorId === undefined', () => {
      const list = Command.filterByCursor([{ id: 10 }, { id: 11 }]);
      assert.equal(1, list.length);
      assert.equal(10, list[0].id);
    });
    it('cursorId === 0', () => {
      const list = Command.filterByCursor([{ id: 100 }, { id: 200 }], 0);
      assert.equal(1, list.length);
      assert.equal(100, list[0].id);
    });
    it('cursorId === 5', () => {
      const list = Command.filterByCursor([{ id: 2 }, { id: 5 }, { id: 6 }], 5);
      assert.equal(2, list.length);
      assert.equal(2, list[0].id);
      assert.equal(5, list[1].id);
    });
  });

  describe('#transactionScope', () => {
    it('Return result from transaction', async () => {
      const conf = makeTestConfig();
      const cmd = new Command(conf);
      const result = await cmd.transactionScope(() => 100);
      assert.equal(100, result);
    });
    it('Throw error in transaction', async () => {
      const conf = makeTestConfig();
      const cmd = new Command(conf);
      try {
        await cmd.transactionScope(() => {
          throw new Error('Error1');
        });
        assert.true(false);
      } catch (e) {
        assert.equal('Error1', e.message);
      }
    });
  });

  describe('#up', () => {
    it('Migrate 1 file', async () => {
      const conf = makeTestConfig();
      const db = await makeDatabaseHandler();
      await resetMigration(db);
      const cmd = new Command(conf);
      let status = await cmd.status();
      assert.equal(0, status.cachedFiles.length);
      assert.equal(3, status.freshFiles.length);

      const migrated = await cmd.up();
      assert.equal(1, migrated.length);
      assert.equal(1531703913460, migrated[0].id);

      status = await cmd.status();
      assert.equal(1, status.cachedFiles.length);
      assert.equal(2, status.freshFiles.length);
      db.close();
    });
  });
});
