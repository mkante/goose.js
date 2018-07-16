import dateformat from 'dateformat';
import _ from 'lodash';

const DDL_NAME_MATCHER = /^\d{4}_\d{2}_\d{2}_(\d{13})_(.*)/;

const uniqScriptName = (defaultSuffix, suffix) => {
  const nameSuffix = !suffix ? defaultSuffix : suffix.trim();
  const date = new Date();
  const millisec = date.getTime();
  const name = `${dateformat(date, 'yyyy_MM_dd')}_${millisec}_${nameSuffix}`;
  return name;
};

const makeDDLName = suffix => uniqScriptName('DDL', suffix);

const makeSeedLName = suffix => uniqScriptName('SEED', suffix);

const migrationNameParser = (fileName) => {
  const matches = fileName.match(DDL_NAME_MATCHER);
  return {
    id: _.get(matches, '[1]', null),
    name: fileName,
    suffix: _.get(matches, '[2]', null),
  };
};

const isoFormat = date => dateformat(date, 'isoDateTime');

export {
  makeDDLName,
  makeSeedLName,
  migrationNameParser,
  isoFormat,
  DDL_NAME_MATCHER,
};
