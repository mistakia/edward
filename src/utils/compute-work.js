const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')
const debug = require('debug')
const nanocurrency = require('nanocurrency')

const log = debug('nano:compute-work')

const db = require('../../db')

const createWorker = (hash) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { hash } })
    worker.on('message', resolve)
    worker.on('error', reject)
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}

if (isMainThread) {
  module.exports = async (hash) => {
    if (process.env.NODE_ENV !== 'production') return 'x'

    const rows = await db('work').where({ hash })
    if (rows.length) {
      log(`found precomputed work (${rows[0]}) against ${hash}`)
      return rows[0]
    }

    return createWorker(hash)
  }
} else {
  log(`computing work against ${workerData.hash}`)
  nanocurrency.computeWork(workerData.hash, {
    workThreshold: 'fffffff800000000'
  }).then((work) => {
    parentPort.postMessage(work)
  })
}
