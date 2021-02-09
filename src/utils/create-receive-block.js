const debug = require('debug')

const log = debug('nano:receive-block')
const constants = require('../../constants')
const pow = require('./work')

const createReceiveBlock = async ({
  publicKey,
  isOpen,
  balanceRaw,
  toAddress,
  representativeAddress,
  transactionHash,
  frontier,
  amountRaw
}) => {
  const workHash = isOpen ? publicKey : frontier
  log(`generating work against ${workHash} for receive block`)
  const work = await pow.compute(workHash, constants.RECEIVE_DIFFICULTY)

  return {
    walletBalanceRaw: balanceRaw,
    toAddress,
    representativeAddress,
    transactionHash,
    frontier,
    amountRaw,
    work
  }
}

module.exports = createReceiveBlock
