const { parentPort, workerData } = require('worker_threads')
const debug = require('debug')
const nanocurrency = require('nanocurrency')

const log = debug('nano:compute-work')

log(`computing work against ${workerData.hash} at ${workerData.difficulty} difficulty`)
nanocurrency.computeWork(workerData.hash, {
  workThreshold: workerData.difficulty
}).then((work) => {
  parentPort.postMessage(work)
})
