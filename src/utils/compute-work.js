const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')
const debug = require('debug')
const nanocurrency = require('nanocurrency')

const log = debug('nano:compute-work')

const rpc = require('./rpc')
const db = require('../../db')

const createWorker = (hash, difficulty) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { hash, difficulty } })
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
  module.exports = async (hash, difficulty) => {
    if (process.env.NODE_ENV !== 'production') return 'x'

    const rows = await db('work').where({ hash })
    if (rows.length) {
      log(`found precomputed work (${rows[0].work}) against ${hash}`)
      return rows[0].work
    }

    const res = await rpc('work_generate', {
      difficulty
    })

    return res.work

    //return createWorker(hash, difficulty)
  }
} else {
  log(`computing work against ${workerData.hash} at ${workerData.difficulty} difficulty`)
  nanocurrency.computeWork(workerData.hash, {
    workThreshold: workerData.difficulty
  }).then((work) => {
    parentPort.postMessage(work)
  })
}
