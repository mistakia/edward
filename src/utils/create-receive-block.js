const debug = require('debug')
const nanocurrency = require('nanocurrency')

const log = debug('receive-block')

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
  const hash = nanocurrency.hashBlock({
    account: toAddress,
    balance: balanceRaw,
    link: transactionHash,
    previous: frontier,
    representative: representativeAddress
  })
  const workHash = isOpen ? publicKey : frontier
  log(`generating work against ${workHash} for receive block ${hash}`)
  const work = await nanocurrency.computeWork(workHash, {
    workThreshold: 'fffffff800000000'
  })

  return {
    hash,
    data: {
      walletBalanceRaw: balanceRaw,
      toAddress,
      representativeAddress,
      transactionHash,
      frontier,
      amountRaw,
      work
    }
  }
}

module.exports = createReceiveBlock
