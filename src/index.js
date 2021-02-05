const { block, wallet, tools } = require('nanocurrency-web')
const nanocurrency = require('nanocurrency')
const BigNumber = require('bignumber.js')

const { rpc } = require('./utils')
const Accounts = require('./accounts')
const db = require('../db')
const constants = require('../constants')

class Edward {
  constructor (seed) {
    this.seed = seed
    this.wallet = wallet.fromSeed(seed)
    this.accounts = new Accounts(seed)
  }

  async _hasFunds ({ accountInfo, amount }) {
    const balance = new BigNumber(accountInfo.balance_decimal)
    return balance.isGreaterThanOrEqualTo(amount)
  }

  _getWallet (uid) {
    const accountWallet = wallet.accounts(this.seed, uid, uid)
    return accountWallet[0]
  }

  async _send ({ senderId, type, amount, receiverId, accountInfo, transactionType }) {
    const senderAccount = await this.accounts.findOrCreate({ userId: receiverId, type })
    const receiverAccount = await this.accounts.findOrCreate({ userId: receiverId, type })
    const hash = nanocurrency.hashBlock({
      account: senderAccount.custody,
      balance: accountInfo.balance,
      link: receiverAccount.address || receiverAccount.custody,
      previous: accountInfo.frontier,
      representative: accountInfo.representative
    })
    const work = await nanocurrency.computeWork(hash)
    const data = {
      walletBalanceRaw: accountInfo.balance,
      fromAddress: senderAccount.custody,
      toAddress: receiverAccount.address || receiverAccount.custody,
      representativeAddress: accountInfo.representative,
      frontier: accountInfo.frontier,
      amountRaw: tools.convert(amount, 'NANO', 'RAW'),
      work
    }
    const accountWallet = this._getWallet(senderAccount.uid)
    const signedBlock = block.send(data, accountWallet.privateKey)

    if (process.env.NODE_ENV === 'production') {
      // broadcast transactions
      await rpc('process', {
        json_block: true,
        subtype: 'send',
        block: signedBlock
      })
    }

    await db('transactions').insert({
      uid: senderAccount.uid,
      hash,
      address: data.toAddress,
      amount: data.amountRaw,
      timestamp: Math.round(Date.now() / 1000),
      type: transactionType
    })

    return signedBlock
  }

  async register ({ userId, type, address }) {
    return this.accounts.register({ userId, type, address })
  }

  async tip ({ senderId, type, receiverIds, amount }) {
    const account = await this.accounts.findOrCreate({ userId: senderId, type })
    const total = amount.multipliedBy(receiverIds.length)
    const accountInfo = await rpc('account_info', {
      account: account.custody,
      representative: true
    })

    const hasFunds = !accountInfo.error && this._hasFunds({ accountInfo, amount: total })
    if (!hasFunds) return { message: constants.INSUFFICENT_FUNDS }

    const blocks = []
    for (const receiverId of receiverIds) {
      const block = await this._send({
        senderId,
        type,
        amount,
        receiverId,
        accountInfo,
        transactionType: constants.TRANSACTIONS.TIP
      })
      blocks.push(block)
    }

    return blocks
  }

  async rain ({ senderId, type, receiverIds, amount }) {
    const account = await this.accounts.findOrCreate({ userId: senderId, type })
    const accountInfo = await rpc('account_info', {
      account: account.custody,
      representative: true
    })
    const hasFunds = this._hasFunds({ accountInfo, amount })
    if (!hasFunds) return { message: constants.INSUFFICENT_FUNDS }
    // TODO
  }

  async info ({ userId, type }) {
    const { custody } = await this.accounts.get({ userId, type })
    return rpc('account_info', { account: custody, representative: true })
  }

  stats () {
    // TODO
    // query db
    // respond to message
  }

  help () {

  }
}

module.exports = Edward
