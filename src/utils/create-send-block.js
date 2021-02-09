const debug = require('debug')

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
  log(`generating work against ${frontier} for send block`)
  const work = await pow.compute(frontier, constants.BASE_DIFFICULTY)

  return {
    walletBalanceRaw: balanceRaw,
    fromAddress,
    toAddress,
    representativeAddress,
    frontier,
    amountRaw,
    work
  }
}

module.exports = createSendBlock
