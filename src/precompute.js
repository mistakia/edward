const { default: PQueue } = require('p-queue')
const debug = require('debug')

const queue = new PQueue({ concurrency: 1 })
const log = debug('precompute')

const { computeWork, rpc } = require('./utils')
const db = require('../db')

const init = async () => {
  const accounts = await db('accounts').select('custody')
  log(`checking precompute status for ${accounts.length} accounts`)
  const addresses = accounts.map(a => a.custody)
  await check(addresses)
}

const check = async (addresses) => {
  const res = await rpc('accounts_frontiers', {
    accounts: addresses
  })

  log(res)

  for (const address in res.frontiers) {
    const frontier = res.frontiers[address]
    const rows = await db('work').where({ hash: frontier })
    if (!rows.length) add(frontier)
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
      add(publicKey)
    }
  }
}

const add = (hash) => {
  log(`queueing precompute work for ${hash}`)
  queue.add(async () => {
    const work = await computeWork(hash)
    log(`saving precomputed work ${work} for ${hash}`)
    await db('work').insert({ hash, work }).onConflict().ignore()
  })
}

module.exports = {
  check,
  init
}
