/* global describe before it */

const expect = require('chai').expect
const { wallet } = require('nanocurrency-web')
const BigNumber = require('bignumber.js')

const Edward = require('../src/index')
const db = require('../db')
const config = require('./config')
const constants = require('../constants')

describe('edward.tip', function () {
  this.timeout(config.timeout)

  before(async function () {
    await db.migrate.forceFreeMigrationsLock()
    await db.migrate.rollback()
    await db.migrate.latest()
  })

  it('tip', async () => {
    const edward = new Edward(config.seed)
    const senderId = '1'
    const receiverId = '2'
    const blocks = await edward.tip({
      senderId,
      type: constants.GROUPME,
      receiverIds: [receiverId],
      amount: new BigNumber('0.000001')
    })

    expect(blocks).to.be.an('array')
    expect(blocks.length).to.be.equal(1)

    // check database for transaction
    const rows = await db('transactions')
    expect(rows).to.be.an('array')
    expect(rows.length).to.be.equal(1)

    const row = rows[0]
    expect(row.hash)
      .to.be.equal('830B3244AB9B8E9C7A356D3FCE1A6B413CF13516C71CF6CAE20E139CA05A30E6')
    expect(row.address)
      .to.be.equal('nano_3ptedxrbnqjye1fmmim7kkr6dfbz1xyb43zkj74bhs8zth9fgera4qa45bw6')
    expect(row.amount).to.be.equal('1000000000000000000000000')
    expect(row.type).to.be.equal(constants.TRANSACTIONS.TIP)
  })

  describe('errors', function () {
    it('missing amount', () => {

    })

    it('invalid amount', () => {

    })

    it('missing recepient', () => {

    })

    it('insufficient funds - single recepient', () => {

    })

    it('unsufficient funds - multiple recepients', () => {

    })
  })
})
