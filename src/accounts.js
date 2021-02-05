const { wallet } = require('nanocurrency-web')

const db = require('../db')

class Accounts {
  constructor (seed) {
    this.seed = seed
  }

  async register ({ userId, type, address }) {
    const entry = await this.get({ userId, type })
    if (entry) return entry

    const res = await db('accounts').insert({ user_id: userId, type, address })
    const uid = res[0]
    const accounts = wallet.accounts(this.seed, uid, uid)
    const account = accounts[0]

    await db('accounts').update({ custody: account.address }).where({ uid })

    return this.get({ userId, type })
  }

  async create ({ userId, type }) {
    const res = await db('accounts').insert({ user_id: userId, type })
    const uid = res[0]
    const accounts = wallet.accounts(this.seed, uid, uid)
    const account = accounts[0]

    await db('accounts').update({ custody: account.address }).where({ uid })
    return this.get({ userId, type })
  }

  async get ({ userId, type }) {
    const rows = await db('accounts').where({ user_id: userId, type })
    return rows[0]
  }

  async findOrCreate ({ userId, type }) {
    const account = this.get({ userId, type })
    if (account) return account
    return this.create({ userId, type })
  }
}

module.exports = Accounts
