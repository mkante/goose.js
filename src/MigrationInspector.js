import _ from 'lodash';
import FileUtils from './utils/FileUtils';
import { DDL_NAME_MATCHER } from './utils/Helpers';

/**
 * Sort array
 * @param array
 * @param direction, default to asc
 * @returns {*}
 */
const sortByDate = (array, direction = 'asc') => _.orderBy(array, [_.identity()], [direction]);

export default class {
  constructor(databaseHandler, migrationFolder) {
    this.db = databaseHandler;
    this.folder = migrationFolder;
  }

  /**
   * Returns local migration files
   */
  async localFiles() {
    const files = FileUtils.files(this.folder, DDL_NAME_MATCHER, false);
    // sort files
    return sortByDate(files);
  }

  /**
   * Returns cached migrations
   */
  async cachedFiles() {
    const rows = await this.db.allFiles();
    return _(rows).map(it => it.name).value();
  }

  /**
   * Returns recent migrations
   */
  async freshFiles() {
    const cachedFiles = await this.cachedFiles();
    const localFiles = await this.localFiles();
    return _(localFiles).filter(it => !cachedFiles.includes(it)).value();
  }
}
