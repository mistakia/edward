const server = require('./src/server')

const port = process.env.PORT || 8000
server.listen(port, () => server.locals.log(`API listening on port ${port}`))
server.locals.groupme.connect()
