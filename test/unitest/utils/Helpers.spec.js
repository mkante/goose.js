import { assert } from 'chai';
import Logger from '../../../src/utils/Logger';
import { makeDDLName, migrationNameParser } from '../../../src/utils/Helpers';

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
  describe('#migrationNameParser', () => {
    it('Invalid names', () => {
      const v = migrationNameParser('more_like_this');
      assert.isNull(v.id);
      assert.isNull(v.name);
    })

    it('Valid names', () => {
      const v = migrationNameParser('2018_06_15_1234567890123_DDL201');
      assert.equal('1234567890123', v.id);
      assert.equal('DDL201', v.name);
    });
  });
});
