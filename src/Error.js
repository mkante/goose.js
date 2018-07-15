import errors from 'errors';

const FileNotFound = errors.create({ name: 'FileNotFound' });
const FileNotDirectory = errors.create({ name: 'FileNotDirectory' });
const DBInvalidProvider = errors.create({ name: 'DBInvalidProvider' });
const DBTableExists = errors.create({ name: 'DBTableExists' });

export {
  FileNotFound,
  FileNotDirectory,
  DBInvalidProvider,
  DBTableExists,
};
