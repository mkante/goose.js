import dateformat from 'dateformat';

const uniqScriptName = (defaultSuffix, suffix) => {
  const nameSuffix = !suffix ? defaultSuffix : suffix.trim();
  const date = new Date();
  const millisec = date.getTime();
  const name = `${dateformat(date, 'yyyy_MM_dd')}_${millisec}_${nameSuffix}`;
  return name;
};

const makeDDLName = suffix => uniqScriptName('DDL', suffix);

const makeSeedLName = suffix => uniqScriptName('SEED', suffix);

export { makeDDLName, makeSeedLName };
