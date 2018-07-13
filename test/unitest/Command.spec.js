import { assert } from 'chai';
import Command from '../../src/Command';
import ConfigProperties from '../../src/ConfigProperties';

describe(__filename, () => {
  describe('#init', () => {
    const conf = new ConfigProperties();
    const cmd = new Command(conf);
    it('Template directory copied', async () => {
      
    })
  });
});
