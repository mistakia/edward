const path = require('path')

module.exports = {
  api: 'https://api.nanex.cc',
  mysql: {
    client: 'mysql',
    connection: {
      host: '127.0.0.1',
      user: 'root',
      database: 'league_test',
      multipleStatements: true
    },
    migrations: {
      directory: path.resolve(__dirname, './db/migrations'),
      tableName: 'league_migrations'
    },
    seeds: {
      directory: path.resolve(__dirname, './db/seeds/test')
    }
  }
}
