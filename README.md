# Goose CLI
A very simple database migration CLI tool for Mysql, Sqlite and PostGres. Most migration tools require developers to use a specific DML framework, the idea is to make migration portable between vendors. In reality people don't really change database and since SQL is not standardized across vendor sometimes you find yourself hacking those libraries to support unsupported edge cases. Goose prefers raw SQL file approach, you write the exact SQL statements for your database.

### Install

Goose.js is written in Node.js so make sure you have installed latest stable [version](https://nodejs.org/en/download/).

```Bash
$ npm install -g goose.js
```

### Get started

Create a new folder for your project migration. Ideally it's better to have separate migration folder per project, goose creates a default config file in the root of your project directory.
```Bash
$ mkdir my_project
$ cd my_project
$ goose.js init
```

By default, this config file is named `goosefile.json`, but you can use the `--format or -f` command line option to specify either `yaml` or `json`. Configure your environment with the correct credentials:

```
goosefile.json

{
  ...
    "default_database": "development",
    "development": {
      "adapter": "mysql",
      "host": "localhost",
      "user": "test",
      "pass": "test",
      "port": 3306,
      "charset": "utf8"
    }
  },
  ...
}
```
To know more about the configuration options look into the **Configuration file parameter** section

##### Create migration
Let’s create a new goose migration. Run goose.js using the `create` command:

```Bash
$ goose.js create users
```

This will create a new migration directory in the format `YYYY_MM_DD_<MILLISECOND>_users`, inside the `db/migrations` folder. Alose, goose creates two skeleton migration files `up.sql` and `down.sql`.

##### Migrate up
The `up.sql` file is automatically run when you are migrating up and it detects the given migration hasn’t been executed previously. You should use the `up` command to transform the database with your intended changes. Example:
```SQL
-- Inside up.sql

CREATE USERS (
    id INT,
    name VARCHAR(200)
);
```

##### Migrate down
The `down.sql` file is automatically run by Phinx when you are migrating down and it detects the given migration has been executed in the past. You should use the `down` command to reverse/undo the transformations described in the `up.sql`.
```SQL
-- Inside down.sql

DROP TABLE users;
```

### Configuration File Parameter
When you initialize your project using the `init` Command, goose creates a default file in the root of your project directory. By default, this file uses the json data serialization format, but you can use the --format command line option to specify yaml.

```YAML
  environments: 
    default_migration_table: "goose_migrations"
    default_database: "development"
    development: 
      adapter: "mysql"
      host: "localhost"
      user: "test"
      pass: ""
      port: 3306
      charset: "utf8"
  paths: 
    migrations: "db/migrations"
```
goose auto-detects which language parser to use for files with *.yml, *.json extensions.

If a `--conf` command line option is given, goose will load the specified file. Otherwise, it will attempt to find `goosefile.json`.

#### Environments
One of the key features of goose is support for multiple database environments. You can use goose to create migrations on your development environment, then run the same migrations on your production environment. Environments are specified under the environments nested collection. For example:
```json
"environments": {
    "default_migration_table": "goose_migrations",
    "default_database": "development",
    "development": {
        "adapter": "mysql",
        "host": "localhost",
        "user": "test",
        "pass": "test",
        "port": 3306,
        "charset": "utf8",
   "production": {
       "adapter": "mysql",
       "host": "prod.server.com",
       "user": "SECRET_USER",
       "pass": "SECRET_PASSWORD",
       "port": 3306,
       "charset": "utf8", 
}
```

##### Supported Adapters
Goose currently supports the following database adapters natively:

- MySQL: specify the `mysql` adapter.
    ```javascript 1.8
    "adapter": "mysql",
    "host": "localhost",
    "user": "test",
    "pass": "test",
    "port": 3306
    ```
- Sqlite: specify the `sqlite` adapter.
    ```javascript 1.8
    "adapter": "sqlite",
    "filename": "./data/derby.db"
    ```
    
- PostgreSQL: specify the `sqlite` adapter.
    ```javascript 1.8
    "adapter": "pgsql",
    "host": "localhost",
    "user": "test",
    "pass": "test",
    "port": 3306,
    ```

#### Migration Paths
Goose uses `db/migrations` by default as the path to your migrations directory. In order to overwrite the default location, you need to add the following to the yaml configuration.

```javascript 1.8
"paths": {
    "migrations": "db/custom/path/migrations",
  }
```

> INPORTANT: The migration path is always relative to the project root

### Commands

##### Init command
The Init command (short for initialize) is used to prepare your project for goose. This command generates the `goosefile.json` file in the root of your project directory.
```Bash
$ cd yourapp
$ goose.js init
```

Optionally you can specify a custom location for goose’s config file:
```Bash
$ cd yourapp
$ goose.js init ./custom/location/
```

You can also specify a custom file name:

```Bash
$ cd yourapp
$ goose.js init custom-config.yml
```

##### Up command
The up command runs all of the available migrations, optionally up to a specific version.

```Bash
$ goose.js up -e development
```
To migrate to a specific version then use the --timestamp parameter or -t for short.

```Bash
$ goose.js migrate -e development -t 20110103081132
```

##### Down command
The up command is used to undo previous migrations executed by goose. It is the opposite of the up command.

```Bash
$ goose.js down -e development
```
To rollback to a specific version then use the --timestamp parameter or -t for short.

```Bash
$ goose.js down -e development -t 20110103081132
```

Specifying 0 as the target version will revert all migrations.

```Bash
$ goose.js rollback -e development -t 0
```

To rollback all migrations to a specific date then use:

```Bash
$ goose.js down -e development -t 2012
$ goose.js down -e development -t 201201
$ goose.js down -e development -t 20120103
$ goose.js down -e development -t 2012010312
$ goose.js down -e development -t 201201031205
$ goose.js down -e development -t 20120103120530
```

##### Status command
The Status command prints a list of all migrations, along with their current status. You can use this command to determine which migrations have been run.

```Bash
$ goose.js status -e development
```
