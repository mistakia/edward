const nanocurrency = require('nanocurrency')

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
  const work = await nanocurrency.computeWork(hash, { workThreshold: 'fffffff800000000' })

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
