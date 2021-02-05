const { block, wallet, tools } = require('nanocurrency-web')
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
    const senderAccount = this.accounts.findOrCreate({ userId: receiverId, type })
    const receiverAccount = this.accounts.findOrCreate({ userId: receiverId, type })
    const data = {
      walletBalanceRaw: accountInfo.balance,
      fromAddress: senderAccount.custody,
      toAddress: receiverAccount.address || receiverAccount.custody,
      representativeAddress: accountInfo.representative,
      frontier: accountInfo.frontier,
      amountRaw: tools.convert(amount.toString(), 'NANO', 'RAW'),
      work: ''
    }
    const accountWallet = this._getWallet(senderAccount.uid)
    const signedBlock = block.send(data, accountWallet.privateKey)
    console.log(signedBlock)
    // broadcast transactions
    await db('transactions').insert({
      uid: senderAccount.uid,
      hash: signedBlock.hash,
      address: data.toAddress,
      amount: data.amountRaw,
      timestamp: Math.round(Date.now() / 1000),
      type: transactionType
    })
  }

  async register ({ userId, type, address }) {
    return this.accounts.register({ userId, type, address })
  }

  async tip ({ senderId, type, receiverIds, amount }) {
    const total = amount.multipliedBy(receiverIds.length)
    const accountInfo = this.info({ userId: senderId, type })

    const hasFunds = this._hasFunds({ accountInfo, amount: total })
    if (!hasFunds) return { message: constants.INSUFFICENT_FUNDS }

    for (const receiverId of receiverIds) {
      await this._send({
        senderId,
        type,
        amount,
        receiverId,
        accountInfo,
        transactionType: constants.TRANSACTIONS.TIP
      })
    }

    // notify recepient
  }

  rain ({ senderId, type, receiverIds, amount }) {
    const accountInfo = this.info({ userId: senderId, type })
    const hasFunds = this._hasFunds({ accountInfo, amount })
    if (!hasFunds) return { message: constants.INSUFFICENT_FUNDS }
    // TODO
  }

  async info ({ userId, type }) {
    const { address } = await this.accounts.get({ userId, type })
    return rpc('account_info', { account: address, representative: true })
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
