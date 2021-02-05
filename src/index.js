const { wallet } = require('nanocurrency-web')
const fetch = require('node-fetch')

const config = require('../config')
const Accounts = require('./accounts')

class Edward {
  constructor (seed) {
    this.seed = seed
    this.wallet = wallet.fromSeed(seed)
    this.accounts = new Accounts(seed)
  }

  async _rpc (action, params) {
    const response = await fetch(config.api, {
      method: 'post',
      body: JSON.stringify({ action, ...params }),
      headers: { 'Content-Type': 'application/json' }
    })
    return response.json()
  }

  async register ({ userId, type, address }) {
    return this.accounts.register({ userId, type, address })
  }

  send ({ userId, type, address, amount }) {
    // TODO
    // broadcast transaction
    // notify recepient
    // save to db
  }

  withdraw ({ userId, type, amount }) {
    // TODO
    // broadcast transaction
    // notify user
  }

  rain ({ userId, type, to }) {
    // TODO
    // call send
  }

  async info ({ userId, type }) {
    const { address } = await this.accounts.get({ userId, type })
    return this._rpc('account_info', { account: address })
  }

  leaderboard () {
    // TODO
    // query db
    // respond to message
  }
}

module.exports = Edward
