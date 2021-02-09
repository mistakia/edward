const { default: PQueue } = require('p-queue')
const debug = require('debug')
const path = require('path')
const { Worker } = require('worker_threads')

const queue = new PQueue({ concurrency: 1 })
const log = debug('nano:work')
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

const rpc = require('./rpc')
const db = require('../../db')
const constants = require('../../constants')

const createWorker = (hash, difficulty) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(__dirname, 'worker.js')
    const worker = new Worker(filepath, { workerData: { hash, difficulty } })
    worker.on('message', resolve)
    worker.on('error', reject)
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}

const init = async () => {
  const accounts = await db('accounts').select('custody')
  log(`checking precompute status for ${accounts.length} accounts`)
  const addresses = accounts.map(a => a.custody)
  await add(addresses)
}

const add = async (addresses) => {
  const res = await rpc('accounts_frontiers', {
    accounts: addresses
  })

  log(res)

  for (const address in res.frontiers) {
    const frontier = res.frontiers[address]
    const rows = await db('work').where({ hash: frontier })
    if (!rows.length) compute(frontier, constants.BASE_DIFFICULTY)
  }

  const openedAddresses = Object.keys(res.frontiers)
  const unOpenedAddresses = addresses.filter(a => !openedAddresses.includes(a))
  if (unOpenedAddresses.length) {
    log(`computing work for ${unOpenedAddresses.length} unopened addresses`)
    const rows = await db('accounts')
      .select('publicKey', 'custody')
      .whereIn('custody', unOpenedAddresses)
    for (const address of unOpenedAddresses) {
      const { publicKey } = rows.find(r => r.custody === address)
      compute(publicKey, constants.BASE_DIFFICULTY)
    }
  }
}

const compute = async (hash, difficulty) => {
  log(`queueing work for ${hash}`)
  return queue.add(async () => {
    if (process.env.NODE_ENV !== 'production') {
      await wait(1500)
      return 'x'
    }

    const rows = await db('work').where({ hash })
    if (rows.length) {
      log(`found precomputed work (${rows[0].work}) against ${hash}`)
      return rows[0].work
    }

    const work = await createWorker(hash, difficulty)
    log(`saving precomputed work ${work} for ${hash}`)
    await db('work').insert({ hash, work }).onConflict().ignore()
    return work
  })
}

module.exports = {
  add,
  init,
  compute
}
