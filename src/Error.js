import errors from 'errors';

const FileNotFound = errors.create({ name: 'FileNotFound' });
const FileNotDirectory = errors.create({ name: 'FileNotFound' });

export {
  FileNotFound,
  FileNotDirectory,
};
