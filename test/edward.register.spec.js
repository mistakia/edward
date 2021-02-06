/* global describe before it */

const expect = require('chai').expect
const { wallet } = require('nanocurrency-web')

const Edward = require('../src/index')
const db = require('../db')
const config = require('./config')
const constants = require('../constants')

describe('edward.register', function () {
  this.timeout(config.timeout)

  before(async function () {
    await db.migrate.forceFreeMigrationsLock()
    await db.migrate.rollback()
    await db.migrate.latest()
  })

  it('register', async () => {
    const edward = new Edward(config.seed)

    const address = 'nano_3x4ui45q1cw8hydmfdn4ec5ijsdqi4ryp14g4ayh71jcdkwmddrq7ca9xzn9'
    const userId = '1'
    const account = await edward.register({ userId, type: constants.GROUPME, address })
    expect(account.uid).to.equal(1)
    expect(account.address).to.equal(address)

    const accounts = wallet.accounts(config.seed, 0, 1)
    const accountWallet = accounts.find(a => a.accountIndex === 1)
    expect(account.custody).to.equal(accountWallet.address)

    const rows = await db('accounts').where({ uid: accountWallet.accountIndex })
    expect(rows).to.be.an('array')
    expect(rows.length).to.be.equal(1)

    const row = rows[0]
    expect(row.uid).to.equal(1)
    expect(row.userId).to.equal(userId)
    expect(row.address).to.equal(account.address)
    expect(row.type).to.equal(constants.GROUPME)
  })

  it('duplicate', async () => {
    const userId = '1'

    const address = 'nano_3x4ui45q1cw8hydmfdn4ec5ijsdqi4ryp14g4ayh71jcdkwmddrq7ca9xzn9'
    const edward = new Edward(config.seed)
    const account = await edward.register({ userId, type: constants.GROUPME, address })
    const rows = await db('accounts')
    expect(rows).to.be.an('array')
    expect(rows.length).to.be.equal(1)

    const row = rows[0]
    expect(row.address).to.equal(account.address)
  })

  it('update', async () => {
    const userId = '1'

    const address = 'nano_3p6umrmtyj8ofk3yfk549oscjd86puyaftonmcejoia33bf398oym31tdoq4'
    const edward = new Edward(config.seed)
    const account = await edward.register({ userId, type: constants.GROUPME, address })
    const rows = await db('accounts')
    expect(rows).to.be.an('array')
    expect(rows.length).to.be.equal(1)

    const row = rows[0]
    expect(row.address).to.equal(account.address)
  })

  /* it('account info', async () => {
   *   const account = 'nano_3x4ui45q1cw8hydmfdn4ec5ijsdqi4ryp14g4ayh71jcdkwmddrq7ca9xzn9'
   *   const edward = new Edward(config.seed)
   *   const accountInfo = await edward._rpc('account_info', { account, representative: true })

   *   expect(accountInfo).to.have.property('balance')
   *   expect(accountInfo).to.have.property('balance_decimal')
   *   expect(accountInfo).to.have.property('frontier')
   *   expect(accountInfo.representative).to.equal('nano_3mhrc9czyfzzok7xeoeaknq6w5ok9horo7d4a99m8tbtbyogg8apz491pkzt')
   * })
   */

  describe('errors', function () {
    it('register - missing address', () => {

    })

    it('register - invalid address', () => {

    })
  })
})
