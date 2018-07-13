import { assert } from 'chai';
import FileUtils from '../../../src/utils/FileUtils';
import Logger from '../../../src/utils/Logger';
import { FileNotDirectory } from '../../../src/Error';

const log = Logger(__filename);

describe(__filename, () => {
  describe('#exists', () => {
    it('File does not exist', () => {
      const f1 = 'path/to/file';
      const bool = FileUtils.exists(f1);
      assert.equal(false, bool, 'exist === false');
    });
    it('File exist', () => {
      const f2 = './test/resources/dummy.txt';
      const bool = FileUtils.exists(f2);
      assert.equal(true, bool, 'exist === true');
    });
  });
  it('#isDir', () => {
    const d1 = 'path/to/file';
    const d2 = './test/resources';
    assert.equal(false, FileUtils.isDir(d1), 'isDir === false');
    assert.equal(true, FileUtils.isDir(d2), 'isDir === true');
  });
  it('#isFile', () => {
    const d1 = 'path/to/file';
    const f1 = './test/resources';
    const f2 = './test/resources/dummy.txt';
    assert.equal(false, FileUtils.isFile(d1), 'isDir === false');
    assert.equal(false, FileUtils.isFile(f1), 'isDir === false');
    assert.equal(true, FileUtils.isFile(f2), 'isDir === true');
  });
  describe('#files', () => {
    it('Path to missing directory', () => {
      try {
        FileUtils.files('path/to/file');
      } catch (e) {
        log.error(e);
        assert.isTrue(e instanceof FileNotDirectory, 'error is instance of FileNotDirectory');
      }
    });
    it('Path to non directory', () => {
      try {
        FileUtils.files('./test/resources/dummy.txt');
      } catch (e) {
        log.error(e);
        assert.isOk(e instanceof FileNotDirectory, 'error is instance of FileNotDirectory');
      }
    });
    it('Path to directory', () => {
      const list = FileUtils.files('./test/resources');
      log.info(`Directory listing: ${list}`);
      assert.isTrue(list.length > 0, 'Directort content files');
    });
    it('Read directory with filter', () => {
      const list = FileUtils.files('./test/resources', /\.json$/);
      log.info(`Directory listing: ${list}`);
      assert.isTrue(list.length > 0, 'Directort content files');

      list.forEach((file) => {
        assert.isTrue(/\.json$/.test(file));
      });
    });
  });
  /*
  describe('#rm', () => {
    it('Delete path file', () => {
      assert.isTrue(!FileUtils.exists('dummy_file'));
      assert.isFalse(FileUtils.rm('dummy_file'));
    });
  });
  */
});
