const debug = require('debug')

const server = require('../src/server')
const precompute = require('../src/precompute')
const processReceiveBlocks = require('../scripts/process-receive-blocks')

const log = debug('nano:pending-blocks')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const processReceiveBlocksWorker = async () => {
  while (true) {
    try {
      await processReceiveBlocks()
    } catch (err) {
      log(err)
    }

    // sleep for 10 secs
    await wait(10000)
  }
}

const port = process.env.PORT || 8000
server.listen(port, () => server.locals.log(`API listening on port ${port}`))
server.locals.groupme.connect()

precompute.init()
processReceiveBlocksWorker()
