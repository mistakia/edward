/* global describe before it */

const expect = require('chai').expect
const BigNumber = require('bignumber.js')

const Edward = require('../src/index')
const db = require('../db')
const config = require('./config')
const constants = require('../constants')

describe('edward.tip', function () {
  this.timeout(60000)

  before(async function () {
    await db.migrate.forceFreeMigrationsLock()
    await db.migrate.rollback()
    await db.migrate.latest()
  })

  it('tip', async () => {
    const edward = new Edward(config.seed)
    const senderId = '1'
    const receiverId = '2'
    let error
    try {
      await edward.tip({
        senderId,
        type: constants.GROUPME,
        receiverIds: [receiverId],
        amountRaw: new BigNumber('0.000001')
      })
    } catch (err) {
      error = err
    }

    expect(error).to.be.equal(undefined)

    // check database for transaction
    const rows = await db('transactions')
    expect(rows).to.be.an('array')
    expect(rows.length).to.be.equal(1)

    const row = rows[0]
    expect(row.uid).to.be.equal(1)
    expect(row.hash)
      .to.be.equal('63CB732692252D23612716C19B30FCED2AF95EF1F286175D61E23C76726B9D45')
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
