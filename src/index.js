const { block, wallet } = require('nanocurrency-web')
const BigNumber = require('bignumber.js')
const debug = require('debug')

const {
  rpc,
  createSendBlock,
  sendDirectMessage,
  sendGroupMessage,
  sendGroupImage,
  randomGif,
  work
} = require('./utils')
const Accounts = require('./accounts')
const db = require('../db')
const constants = require('../constants')
const config = require('../config')

const log = debug('edward')

class Edward {
  constructor (seed) {
    this.seed = seed
    this.wallet = wallet.fromSeed(seed)
    this.accounts = new Accounts(seed)
  }

  _hasFunds ({ accountInfo, amountRaw }) {
    const balance = new BigNumber(accountInfo.balance)
    log(`checking if ${balance} is greater than ${amountRaw}`)
    return balance.isGreaterThanOrEqualTo(amountRaw)
  }

  _getWallet (uid) {
    const accountWallet = wallet.accounts(this.seed, uid, uid)
    return accountWallet[0]
  }

  async _send ({
    senderId, type, amountRaw, receiverId, accountInfo, transactionType, senderName
  }) {
    if (receiverId === config.groupme.USER_ID) {
      // TODO send notification
      return
    }
    log(`sending ${amountRaw} RAW from ${senderId} to ${receiverId}`)
    const senderAccount = await this.accounts.findOrCreate({ userId: senderId, type })
    const receiverAccount = await this.accounts.findOrCreate({ userId: receiverId, type })
    const data = await createSendBlock({
      balanceRaw: accountInfo.balance,
      fromAddress: senderAccount.custody,
      toAddress: receiverAccount.address || receiverAccount.custody,
      representativeAddress: accountInfo.representative,
      frontier: accountInfo.frontier,
      amountRaw: amountRaw.toFixed(0)
    })
    const accountWallet = this._getWallet(senderAccount.uid)
    const signedBlock = block.send(data, accountWallet.privateKey)

    if (process.env.NODE_ENV !== 'production') return

    log(`broadcasting send block: ${signedBlock}`)
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

    work.add([senderAccount.custody])

    await db('transactions').insert({
      uid: senderAccount.uid,
      hash: res.hash,
      address: data.toAddress,
      amount: data.amountRaw,
      timestamp: Math.round(Date.now() / 1000),
      type: transactionType
    })

    const messages = [`Received ${amountRaw.toFixed()} RAW tip from ${senderName}. https://nanolooker.com/block/${res.hash}`]
    if (!receiverAccount.address) {
      messages.push('Register a wallet address to receive tips directly in the future. Type "/edward help" for more info')
      messages.push('A good beginner wallet is https://natrium.io/. Visit https://nanowallets.guide/ for a comprehensive list of wallets.')
    }
    await sendDirectMessage({ userId: receiverId, type, messages })
  }

  async register ({ userId, type, address }) {
    if (!userId || !type || !address) return
    log(`register ${address} for ${userId}:${type}`)
    const accountEntry = await this.accounts.register({ userId, type, address })
    // TODO - like command message
    await sendDirectMessage({
      userId,
      type,
      messages: [
        `Successfully registered receive address: https://nanolooker.com/account/${address}`,
        `Your tip account address: https://nanolooker.com/account/${accountEntry.custody}`,
        'Tips will be sent from your tip account address, ' +
          'while tips received will go directly to your registered receive address.' +
          'To send tips deposit nano to your tip account address.'
      ]
    })

    return accountEntry
  }

  async tip ({ senderId, type, receiverIds, amountRaw, senderName, groupId }) {
    if (!senderId || !type || !amountRaw) return
    if (!receiverIds || !receiverIds.length) return

    log(`tip from ${senderId} to ${receiverIds} for ${amountRaw}`)
    const account = await this.accounts.findOrCreate({ userId: senderId, type })
    const totalRaw = amountRaw.multipliedBy(receiverIds.length)
    const accountInfo = await rpc('account_info', {
      account: account.custody,
      representative: true
    })
    log('sender account info', accountInfo)

    const hasFunds = !accountInfo.error && this._hasFunds({ accountInfo, amountRaw: totalRaw })
    if (!hasFunds) {
      log(`${senderId} has insufficient funds`)
      await sendGroupMessage({
        groupId,
        type,
        messages: ['Insufficient Funds']
      })
      return
    }

    for (const receiverId of receiverIds) {
      await this._send({
        senderId,
        type,
        amountRaw: amountRaw,
        receiverId,
        accountInfo,
        senderName,
        transactionType: constants.TRANSACTIONS.TIP
      })
    }

    // TODO - like command message
    await sendGroupImage({
      type,
      groupId,
      image: randomGif()
    })
  }

  async rain ({ senderId, type, receiverIds, amountRaw, senderName, groupId }) {
    if (!senderId || !type || !amountRaw) return
    if (!receiverIds || !receiverIds.length) return

    log(`rain from ${senderId} to ${receiverIds} for ${amountRaw}`)
    const account = await this.accounts.findOrCreate({ userId: senderId, type })
    const accountInfo = await rpc('account_info', {
      account: account.custody,
      representative: true
    })
    log('sender account info', accountInfo)

    const hasFunds = !accountInfo.error && this._hasFunds({ accountInfo, amountRaw })
    if (!hasFunds) {
      log(`${senderId} has insufficient funds`)
      await sendGroupMessage({
        groupId,
        type,
        messages: ['Insufficent funds']
      })
      return
    }

    const eachRaw = amountRaw.dividedBy(receiverIds.length)
    for (const receiverId of receiverIds) {
      await this._send({
        senderId,
        type,
        amountRaw: eachRaw,
        receiverId,
        accountInfo,
        senderName,
        transactionType: constants.TRANSACTIONS.RAIN
      })
    }

    // TODO - like command message
    await sendGroupImage({
      type,
      groupId,
      image: randomGif()
    })
  }

  async balance ({ userId, type }) {
    const accountEntry = await this.accounts.findOrCreate({ userId, type })
    const accountInfo = await rpc('account_info', {
      account: accountEntry.custody
    })

    const balanceRaw = !accountInfo.error ? accountInfo.balance : '0'
    const balance = new BigNumber(balanceRaw)

    // TODO - like command message
    await sendDirectMessage({
      userId,
      type,
      messages: [`Tip balance of ${balance.toFixed()} RAW`]
    })
  }

  stats () {
    // TODO
    // query db
    // respond to message
  }

  async help ({ groupId, userId, type }) {
    if (!groupId && !userId) return
    log(`sending help message to ${groupId || userId}`)
    const messages = ['Commands start with /edward.\n/edward help\n/edward register [nano_address]\n/edward tip [amount] @user\n/edward balance']

    if (groupId) {
      messages.push('Please ask edward for help via direct messages')
      await sendGroupMessage({
        groupId,
        type,
        messages
      })
    } else if (userId) {
      await sendDirectMessage({
        userId,
        type,
        messages
      })
    }
  }
}

module.exports = Edward
