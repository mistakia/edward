const debug = require('debug')
const nanocurrency = require('nanocurrency')

const log = debug('nano:send-block')
const constants = require('../../constants')
const pow = require('./work')

const createSendBlock = async ({
  balanceRaw,
  fromAddress,
  toAddress,
  representativeAddress,
  frontier,
  amountRaw
}) => {
  const hash = nanocurrency.hashBlock({
    account: fromAddress,
    balance: balanceRaw,
    link: toAddress,
    previous: frontier,
    representative: representativeAddress
  })
  log(`generating work against ${frontier} for send block ${hash}`)
  const work = await pow.compute(frontier, constants.BASE_DIFFICULTY)

  return {
    hash,
    data: {
      walletBalanceRaw: balanceRaw,
      fromAddress,
      toAddress,
      representativeAddress,
      frontier,
      amountRaw,
      work
    }
  }
}

module.exports = createSendBlock
