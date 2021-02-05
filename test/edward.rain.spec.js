/* global describe before it */

const expect = require('chai').expect
const BigNumber = require('bignumber.js')
const { wallet } = require('nanocurrency-web')

const Edward = require('../src/index')
const db = require('../db')
const config = require('./config')
const constants = require('../constants')

describe('edward.rain', function () {
  this.timeout(240000)

  before(async function () {
    await db.migrate.forceFreeMigrationsLock()
    await db.migrate.rollback()
    await db.migrate.latest()
  })

  it('rain', async () => {
    const edward = new Edward(config.seed)
    const senderId = '1'
    const receiverId1 = '2'
    const receiverId2 = '3'
    const receiverId3 = '4'
    const blocks = await edward.rain({
      senderId,
      type: constants.GROUPME,
      receiverIds: [
        receiverId1,
        receiverId2,
        receiverId3
      ],
      amount: new BigNumber('0.000001')
    })

    expect(blocks).to.be.an('array')
    expect(blocks.length).to.be.equal(3)

    // check database for transaction
    const rows = await db('transactions')
    expect(rows).to.be.an('array')
    expect(rows.length).to.be.equal(3)

    const row = rows[0]
    expect(row.hash)
      .to.be.equal('63CB732692252D23612716C19B30FCED2AF95EF1F286175D61E23C76726B9D45')
    expect(row.address)
      .to.be.equal('nano_3ptedxrbnqjye1fmmim7kkr6dfbz1xyb43zkj74bhs8zth9fgera4qa45bw6')
    expect(row.amount).to.be.equal('333333333333330000000000')
    expect(row.type).to.be.equal(constants.TRANSACTIONS.RAIN)
  })

  describe('errors', function () {
    it('missing amount', () => {

    })

    it('invalid amount', () => {

    })

    it('missing recepients', () => {

    })

    it('insufficient funds', () => {

    })
  })
})
