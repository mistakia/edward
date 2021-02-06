const debug = require('debug')
const nanocurrency = require('nanocurrency')

const log = debug('compute-work')

const computeWork = async (workHash) => {
  if (process.env.NODE_ENV !== 'production') return 'x'

  log(`computing work against ${workHash}`)
  return nanocurrency.computeWork(workHash, {
    workThreshold: 'fffffff800000000'
  })
}

module.exports = computeWork
