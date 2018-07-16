import Path from 'path';
import { mysql as mysqlConfig } from '../database';
import DatabaseHandler from '../../src/DatabaseHandler';
import ConfigProperties from '../../src/ConfigProperties';

const resetMigration = async (databaseHandler) => {
  await databaseHandler.dropTableIfExists('goose_migrations');
  return databaseHandler.initializeTable('goose_migrations');
};

const makeTestConfig = () => {
  const conf = new ConfigProperties({
    homeDir: '.',
    environments: {
      test: mysqlConfig,
    },
    paths: {
      migrations: Path.join('test', 'resources', 'db_migrations'),
    },
  });
  conf.environment = 'test';
  return conf;
};

const makeDatabaseHandler = async () => {
  const conf = makeTestConfig();
  const db = await DatabaseHandler.create(conf.database);
  return db;
};

export { resetMigration, makeTestConfig, makeDatabaseHandler };
