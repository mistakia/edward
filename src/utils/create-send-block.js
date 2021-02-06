const debug = require('debug')
const nanocurrency = require('nanocurrency')

const log = debug('send-block')

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
  const work = await nanocurrency.computeWork(frontier, {
    workThreshold: 'fffffff800000000'
  })

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
