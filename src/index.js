const { block, wallet, tools } = require('nanocurrency-web')
const BigNumber = require('bignumber.js')
const debug = require('debug')

const { rpc, createSendBlock, sendDirectMessage, sendGroupMessage } = require('./utils')
const Accounts = require('./accounts')
const db = require('../db')
const constants = require('../constants')

const log = debug('edward')

class Edward {
  constructor (seed) {
    this.seed = seed
    this.wallet = wallet.fromSeed(seed)
    this.accounts = new Accounts(seed)
  }

  async _hasFunds ({ accountInfo, amount }) {
    const balance = new BigNumber(accountInfo.balance_decimal)
    log(`checking if ${balance} is greater than ${amount}`)
    return balance.isGreaterThanOrEqualTo(amount)
  }

  _getWallet (uid) {
    const accountWallet = wallet.accounts(this.seed, uid, uid)
    return accountWallet[0]
  }

  async _send ({ senderId, type, amount, receiverId, accountInfo, transactionType }) {
    log(`sending ${amount} from ${senderId} to ${receiverId}`)
    const senderAccount = await this.accounts.findOrCreate({ userId: senderId, type })
    const receiverAccount = await this.accounts.findOrCreate({ userId: receiverId, type })
    const { data, hash } = await createSendBlock({
      balanceRaw: accountInfo.balance,
      fromAddress: senderAccount.custody,
      toAddress: receiverAccount.address || receiverAccount.custody,
      representativeAddress: accountInfo.representative,
      frontier: accountInfo.frontier,
      amountRaw: tools.convert(amount, 'NANO', 'RAW')
    })
    const accountWallet = this._getWallet(senderAccount.uid)
    const signedBlock = block.send(data, accountWallet.privateKey)

    if (process.env.NODE_ENV === 'production') {
      log(`broadcasting send block: ${hash}`)
      const res = await rpc('process', {
        json_block: true,
        subtype: 'send',
        block: signedBlock
      })
      log('node response', res)

      if (res.error) {
        // TODO send notification
        return
      }
    }

    await db('transactions').insert({
      uid: senderAccount.uid,
      hash,
      address: data.toAddress,
      amount: data.amountRaw,
      timestamp: Math.round(Date.now() / 1000),
      type: transactionType
    })

    // TODO use sender name
    let message = `Received ${amount.toString()} NANO tip from ${senderId}.`
    if (!receiverAccount.address) {
      message += ' Register your wallet address to collect your tip. Type "/edward help" for more info'
    }
    await sendDirectMessage({ userId: receiverId, type, message })
  }

  async register ({ userId, type, address }) {
    if (!userId || !type || !address) return
    log(`register ${address} for ${userId}:${type}`)
    const accountEntry = await this.accounts.register({ userId, type, address })
    await sendDirectMessage({
      userId,
      type,
      messages: [`Successfully registered receive address: ${address}.`, `Your tip account address is ${accountEntry.custody}.`, 'Tips will be sent from your tip account address, while tips received will go directly to your registered receive address. To send tips deposit nano to your tip account address.']
    })

    return accountEntry
  }

  async tip ({ senderId, type, receiverIds, amount }) {
    if (!senderId || !type || !amount) return
    if (!receiverIds || !receiverIds.length) return

    log(`tip from ${senderId} to ${receiverIds} for ${amount}`)
    const account = await this.accounts.findOrCreate({ userId: senderId, type })
    const total = amount.multipliedBy(receiverIds.length)
    const accountInfo = await rpc('account_info', {
      account: account.custody,
      representative: true
    })
    log('sender account info', accountInfo)

    const hasFunds = !accountInfo.error && this._hasFunds({ accountInfo, amount: total })
    if (!hasFunds) {
      log(`${senderId} has insufficient funds`)
      return { message: constants.INSUFFICENT_FUNDS }
    }

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
  }

  async rain ({ senderId, type, receiverIds, amount }) {
    if (!senderId || !type || !amount) return
    if (!receiverIds || !receiverIds.length) return

    log(`rain from ${senderId} to ${receiverIds} for ${amount}`)
    const account = await this.accounts.findOrCreate({ userId: senderId, type })
    const accountInfo = await rpc('account_info', {
      account: account.custody,
      representative: true
    })
    const hasFunds = this._hasFunds({ accountInfo, amount })
    if (!hasFunds) return { message: constants.INSUFFICENT_FUNDS }

    const each = amount.dividedBy(receiverIds.length)
    for (const receiverId of receiverIds) {
      await this._send({
        senderId,
        type,
        amount: each,
        receiverId,
        accountInfo,
        transactionType: constants.TRANSACTIONS.RAIN
      })
    }

    // TODO - send make it rain gif
    /* await sendGroupMessage({
     *   type,
     *   groupId
     * })
     */
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

  async help ({ groupId, userId, type }) {
    if (!groupId && !userId) return
    log(`sending help message to ${groupId || userId}`)
    const message = `Commands start with "/edward".\n- /edward help\n- /edward register [nano_address]\n- /edward tip [amount] @user\n- /edward rain [amount]`

    if (groupId) {
      await sendGroupMessage({
        groupId,
        type,
        messages: [message, 'Please ask edward for help via direct messages']
      })
    } else if (userId) {
      await sendDirectMessage({
        userId,
        type,
        messages: [message]
      })
    }
  }
}

module.exports = Edward
