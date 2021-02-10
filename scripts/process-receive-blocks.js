const { block } = require('nanocurrency-web')
const debug = require('debug')
const log = debug('nano:pending-blocks')
const BigNumber = require('bignumber.js')

const db = require('../db')
const config = require('../config')
const constants = require('../constants')
const Edward = require('../src/index')
const { rpc, createReceiveBlock, sendDirectMessage, work } = require('../src/utils')

const run = async () => {
  const edward = new Edward(config.seed)

  const accounts = await db('accounts')

  const addresses = accounts.map(p => p.custody)
  const res = await rpc('accounts_pending', {
    accounts: addresses,
    source: true
  })

  log(`found pending blocks for ${Object.values(res.blocks).filter(Boolean).length} accounts`)

  for (const address in res.blocks) {
    if (!res.blocks[address]) continue

    log(`found ${Object.keys(res.blocks[address]).length} pending blocks for ${address}`)

    const accountInfo = await rpc('account_info', {
      account: address,
      representative: true
    })
    const isOpen = accountInfo.error === 'Account not found'
    const accountState = {
      balanceRaw: isOpen ? '0' : accountInfo.balance,
      representativeAddress: isOpen
        ? config.representativeAddress
        : accountInfo.representative,
      frontier: isOpen
        ? constants.EMPTY_FRONTIER
        : accountInfo.frontier
    }

    const accountEntry = await edward.accounts.getFromCustodyAddress(address)
    const accountWallet = edward._getWallet(accountEntry.uid)
    const processBlock = async (blockHash) => {
      log(`processing block ${blockHash} for ${address}`)
      const blockInfo = res.blocks[address][blockHash]

      const { balanceRaw, representativeAddress, frontier } = accountState
      const data = await createReceiveBlock({
        balanceRaw,
        representativeAddress,
        frontier,
        toAddress: address,
        transactionHash: blockHash,
        amountRaw: blockInfo.amount,
        isOpen: frontier === constants.EMPTY_FRONTIER,
        publicKey: accountWallet.publicKey
      })

      const signedBlock = block.receive(data, accountWallet.privateKey)
      if (process.env.NODE_ENV === 'production') {
        log(`broadcasting block ${blockHash} for ${address}`)
        const res = await rpc('process', {
          json_block: true,
          subtype: 'receive',
          block: signedBlock
        })

        log(res)
        if (!res.error) {
          // update account frontier
          accountState.frontier = res.hash
          // update account balance
          accountState.balanceRaw = signedBlock.balance

          const amountRaw = new BigNumber(blockInfo.amount)
          await sendDirectMessage({
            userId: accountEntry.userId,
            type: accountEntry.type,
            messages: [`Received ${amountRaw.toFixed()} RAW to tip address`]
          })
        }
      }
    }

    for (const blockHash in res.blocks[address]) {
      await processBlock(blockHash)
    }

    work.add([address])
  }
}

module.exports = run

const main = async () => {
  let error
  try {
    await run()
  } catch (err) {
    error = err
    console.log(error)
  }

  process.exit()
}

if (!module.parent) {
  main()
}
