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
      host: 'localhost',
      user: 'root',
      database: 'edward_development'
    },
    pool: {
      min: 2,
      max: 10,
      propagateCreateError: false
    }
  }
}
