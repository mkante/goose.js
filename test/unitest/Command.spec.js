import { assert } from 'chai';
import FileUtils from '../../src/utils/FileUtils';
import Command from '../../src/Command';
import Logger from '../../src/utils/Logger';
import ConfigProperties from '../../src/ConfigProperties';

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
});
