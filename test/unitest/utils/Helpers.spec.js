import { assert } from 'chai';
import Logger from '../../../src/utils/Logger';
import { makeDDLName } from '../../../src/utils/Helpers';

const log = Logger(__filename);

describe(__filename, () => {
  describe('#makeDDLName', () => {
    it('Create name with default parameter', () => {
      const name = makeDDLName();
      log.info(`DDL name: ${name}`);
      assert.isTrue(/^\d{4}_\d{2}_\d{2}_\d{13}_DDL$/.test(name));
    });

    it('Create name with custom prefix', () => {
      const name = makeDDLName('users');
      log.info(`DDL name: ${name}`);
      assert.isTrue(/^\d{4}_\d{2}_\d{2}_\d{13}_users$/.test(name));
    });
  });
});
