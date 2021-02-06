const { block } = require('nanocurrency-web')
const debug = require('debug')
const log = debug('scripts:process-receive-blocks')

const db = require('../db')
const config = require('../config')
const constants = require('../constants')
const Edward = require('../src/index')
const { rpc, createReceiveBlock } = require('../src/utils')

const run = async () => {
  const edward = new Edward(config.seed)

  const accounts = await db('accounts')

  log(`getting pending blocks for ${accounts.length} length`)

  const addresses = accounts.map(p => p.custody)
  const res = await rpc('accounts_pending', {
    accounts: addresses,
    source: true
  })

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

    // get account info if there are blocks
    console.log(res.blocks[address])
    for (const blockHash in res.blocks[address]) {
      log(`processing block ${blockHash} for ${address}`)
      const blockInfo = res.blocks[address][blockHash]

      const { balanceRaw, representativeAddress, frontier } = accountState
      const { data, hash } = await createReceiveBlock({
        balanceRaw,
        representativeAddress,
        frontier,
        toAddress: address,
        transactionHash: blockHash,
        amountRaw: blockInfo.amount,
        isOpen: frontier === constants.EMPTY_FRONTIER,
        publicKey: accountWallet.publicKey
      })

      console.log(data)

      const signedBlock = block.receive(data, accountWallet.privateKey)

      console.log(signedBlock)

      if (process.env.NODE_ENV === 'test') {
        log(`broadcasting block ${blockHash} for ${address}`)
        // broadcast transaction
        const res = await rpc('process', {
          json_block: true,
          subtype: 'receive',
          block: signedBlock
        })
        console.log(res)
        console.log(hash)
        // update account frontier
        accountState.frontier = res.hash
        // update account balance
        accountState.balanceRaw = signedBlock.balance
      }
    }
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
