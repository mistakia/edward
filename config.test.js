const path = require('path')

module.exports = {
  api: 'https://api.nanex.cc',
  seed: '4f740316f0a5b0c47b9cab0f12618af1fd52312a18999618034b3d172647b94e4272608a343a5019d5a065a56bcbecc1934630803ab3c078dcec235b3e5f6033',
  representativeAddress: 'nano_1stofnrxuz3cai7ze75o174bpm7scwj9jn3nxsn8ntzg784jf1gzn1jjdkou',
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
