module.exports = {
  api: 'https://api.nanex.cc',
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
