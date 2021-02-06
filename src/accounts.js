const { wallet } = require('nanocurrency-web')

const db = require('../db')

class Accounts {
  constructor (seed) {
    this.seed = seed
  }

  async register ({ userId, type, address }) {
    const entry = await this.get({ userId, type })
    if (entry && (address === entry.address || !address)) return entry

    if (!entry) {
      const res = await db('accounts').insert({ userId, type, address })
      const uid = res[0]
      const accounts = wallet.accounts(this.seed, uid, uid)
      const account = accounts[0]

      await db('accounts').update({ custody: account.address }).where({ uid })
    } else if (address && address !== entry.address) {
      await db('accounts').update({ address }).where({ userId, type })
    }

    return this.get({ userId, type })
  }

  async create ({ userId, type }) {
    const res = await db('accounts').insert({ userId, type })
    const uid = res[0]
    const accounts = wallet.accounts(this.seed, uid, uid)
    const account = accounts[0]

    await db('accounts').update({ custody: account.address }).where({ uid })
    return this.get({ userId, type })
  }

  async get ({ userId, type }) {
    const rows = await db('accounts').where({ userId, type })
    return rows[0]
  }

  async getFromCustodyAddress (address) {
    const rows = await db('accounts').where({ custody: address })
    return rows[0]
  }

  async findOrCreate ({ userId, type }) {
    const account = await this.get({ userId, type })
    if (account) return account
    return this.create({ userId, type })
  }
}

module.exports = Accounts
