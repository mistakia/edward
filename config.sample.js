module.exports = {
  api: 'https://api.nanex.cc',
  seed: '4f740316f0a5b0c47b9cab0f12618af1fd52312a18999618034b3d172647b94e4272608a343a5019d5a065a56bcbecc1934630803ab3c078dcec235b3e5f6033',
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
