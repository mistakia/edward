const path = require('path')

module.exports = {
  api: 'https://api.nanex.cc',
  groupme: {
    GROUP_ID: '',
    ACCESS_TOKEN: '',
    BOT_ID: '',
    USER_ID: ''
  },
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
