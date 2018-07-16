import dateformat from 'dateformat';
import _ from 'lodash';

const uniqScriptName = (defaultSuffix, suffix) => {
  const nameSuffix = !suffix ? defaultSuffix : suffix.trim();
  const date = new Date();
  const millisec = date.getTime();
  const name = `${dateformat(date, 'yyyy_MM_dd')}_${millisec}_${nameSuffix}`;
  return name;
};

const makeDDLName = suffix => uniqScriptName('DDL', suffix);

const makeSeedLName = suffix => uniqScriptName('SEED', suffix);

const migrationInfo = (fileName) => {
  const matches = fileName.match(/^\d{4}_\d{2}_\d{2}_(\d{13})_(.*)/);
  return {
    id: _.get(matches, '[1]', null),
    name: _.get(matches, '[2]', null),
  };
};

const isoFormat = date => dateformat(date, 'isoDateTime');

export {
  makeDDLName,
  makeSeedLName,
  migrationInfo,
  isoFormat,
};
