import { assert } from 'chai';
import FileUtils from '../../src/utils/FileUtils';
import Command from '../../src/Command';
import Logger from '../../src/utils/Logger';
import ConfigProperties from '../../src/ConfigProperties';

const log = Logger(__filename);

describe(__filename, () => {
  describe('#init', () => {
    it('Initialize with json config', async () => {
      const tmpDir = FileUtils.mkdtemp('/tmp/goose_test');
      log.info(`Temp directory: ${tmpDir}`);
      const cmd = new Command(new ConfigProperties({
        homeDir: tmpDir,
      }));

      assert.isTrue(FileUtils.isDir(tmpDir), `temp ${tmpDir} direcoty exists`);
      await cmd.init();
      const files = FileUtils.files(tmpDir);
      log.info(`Init directory content: ${files}`);
      assert.isTrue(files.length > 0, 'Directory not empty');
      assert.isTrue(FileUtils.isFile(`${tmpDir}/config.json`), 'config.js file exists');
      assert.isTrue(FileUtils.isDir(`${tmpDir}/db`), '/db folder exists');
    });

    it('Initialize with YAML config', async () => {
      const tmpDir = FileUtils.mkdtemp('/tmp/goose_test');
      const cmd = new Command(new ConfigProperties({ homeDir: tmpDir }));

      assert.isTrue(FileUtils.isDir(tmpDir), `Temp ${tmpDir} direcoty exists`);
      await cmd.init('yaml');
      const files = FileUtils.files(tmpDir);
      log.info(`Init directory content: ${files}`);
      assert.isTrue(files.length > 0, 'Directory not empty');
      assert.isTrue(FileUtils.isFile(`${tmpDir}/config.yml`), 'config.js file exists');
      assert.isTrue(FileUtils.isDir(`${tmpDir}/db`), '/db folder exists');
    });
  });
});
