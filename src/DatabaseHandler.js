import knex from 'knex';
import _ from 'lodash';
import { DBInvalidProvider } from './Error';
import Logger from './utils/Logger';
import FileUtils from './utils/FileUtils';
import { isoFormat } from './utils/Helpers';

const log = Logger(__filename);

/**
 * Returns provider connection settings.
 * @param provider
 * @param params
 * @returns {*}
 */
const getConnecionConfig = (provider, params) => {
  const map = {
    mysql: {
      client: 'mysql',
      connection: {
        host: _.get(params, 'host'),
        port: _.get(params, 'port'),
        user: _.get(params, 'user'),
        password: _.get(params, 'pass'),
        database: _.get(params, 'database'),
      },
    },
    pgsql: {
      client: 'pg',
      connection: {
        host: _.get(params, 'host'),
        port: _.get(params, 'port'),
        user: _.get(params, 'user'),
        password: _.get(params, 'pass'),
        database: _.get(params, 'database'),
      },
      searchPath: _.get(params, 'searchPath', ['public']),
    },
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: _.get(params, 'filename'),
      },
    },
  };
  return map[provider];
};

export default class Handler {
  /**
   * Create instance
   * @param provider
   * @param params
   */
  static async create(params) {
    const { provider } = params;
    if (!Handler.validProvider(provider)) {
      throw new DBInvalidProvider(`Wrong database provider ${provider}`);
    }

    const instance = new Handler();
    instance.provider = provider;
    instance.config = getConnecionConfig(provider, params);
    instance.mTable = 'goose_migrations';
    instance.knex = knex(instance.config);
    await instance.initializeTable();
    return instance;
  }

  /**
   * Validate database provider
   * @param provider
   * @returns {boolean}
   */
  static validProvider(provider) {
    return /(mysql)|(sqlite)|(pgsql)/.test(`${provider}`.toLowerCase());
  }

  async initializeTable(tableNameOverride) {
    const tableName = !tableNameOverride ? this.mTable : tableNameOverride;
    const exists = await this.tableExists(tableName);
    if (exists) {
      log.debug(`Table already exists ${tableName}`);
      return null;
    }
    return this.createMigrationTable(tableName);
  }

  get connection() {
    return this.knex.schema;
  }

  /**
   *
   * @param tableName
   * @returns {Promise<boolean>}
   */
  async tableExists(tableName) {
    let bool = false;
    try {
      bool = await this.connection.hasTable(tableName);
    } catch (e) {
      //
    }
    return bool;
  }

  /**
   * Drop table if exists.
   * @param table
   * @returns {Promise<void>}
   */
  async dropTableIfExists(table) {
    return this.connection.dropTableIfExists(table);
  }

  /**
   * Create migration table
   * @param tableName
   * @returns {Promise<void>}
   */
  async createMigrationTable(tableName) {
    return this.connection.createTable(tableName, (table) => {
      table.string('id').notNullable();
      table.string('name').notNullable();
      table.timestamp('start_time').notNullable();
      table.timestamp('end_time').notNullable();
      table.timestamp('created_at')
        .defaultTo(this.knex.fn.now())
        .notNullable();
    });
  }

  /**
   * Close the connection
   */
  async close() {
    return this.knex.destroy();
  }

  /**
   * Select all migrations
   * @param table
   * @returns {Promise<void>}
   */
  async allFiles() {
    return this.knex
      .orderBy('id', 'desc')
      .orderBy('name', 'desc')
      .orderBy('created_at', 'desc')
      .from(this.mTable);
  }

  /**
   * Execute a migration file
   * @param table
   * @returns {Promise<void>}
   */
  async truncate(tableName) {
    return this.knex(tableName).truncate();
  }

  /**
   * Execute a migration file
   * @param table
   * @returns {Promise<void>}
   */
  async exec(id, filePath, name) {
    const SQL = FileUtils.read(filePath);
    log.debug(`SQL file content: ${SQL}`);

    const lines = Handler.splitStatements(SQL);
    const startTime = isoFormat(new Date());
    for (const i in lines) { // eslint-disable-line
      const line = lines[i];
      await this.connection.raw(line); // eslint-disable-line
    }
    const endTime = isoFormat(new Date()); console.log(endTime);
    await this.knex.insert({
      id,
      name,
      start_time: startTime,
      end_time: endTime,
    }).into(this.mTable);
    return Promise.resolve(lines.length);
  }

  /**
   *
   * @param context
   * @returns {*}
   */
  static splitStatements(text) {
    if (!text) {
      return [];
    }
    const lines = text.trim().split(';'); // eslint-disable-line
    return _(lines).map(it => it.trim()).value(); // trim every line
  }
}
