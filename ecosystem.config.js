module.exports = {
  apps: [{
    script: 'bin/server.js',
    watch: '.',
    env_production: {
      NODE_ENV: 'production'
    },
    max_memory_restart: '1G'
  }]
}
