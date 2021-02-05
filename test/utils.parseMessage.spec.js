/* global describe it */

const expect = require('chai').expect

const constants = require('../constants')
const config = require('./config')
const { parseMessage } = require('../src/utils')

describe('parse message', function () {
  this.timeout(config.timeout)

  describe('errors', function () {
    it('missing keyword', function () {
      const res = parseMessage('help')
      expect(res.valid).to.equal(false)
      expect(res.message).to.equal(constants.MISSING_KEYWORD)
    })

    it('missing command', function () {
      const res = parseMessage('/edward ')
      expect(res.valid).to.equal(false)
      expect(res.message).to.equal(constants.MISSING_COMMAND)
    })

    it('invalid command', function () {
      const res = parseMessage('/edward .0001')
      expect(res.valid).to.equal(false)
      expect(res.message).to.equal(constants.INVALID_COMMAND)
    })

    it('tip - missing amount', function () {
      const res = parseMessage('/edward tip ')
      expect(res.message).to.equal(constants.MISSING_AMOUNT)
    })

    it('tip - invalid amount', function () {
      const res1 = parseMessage('/edward tip 11.00,01')
      expect(res1.message).to.equal(constants.INVALID_AMOUNT)

      const res2 = parseMessage('/edward tip 11d01')
      expect(res2.message).to.equal(constants.INVALID_AMOUNT)
    })

    it('tip - negative amount', function () {
      const res = parseMessage('/edward tip -11.0001')
      expect(res.message).to.equal(constants.INVALID_AMOUNT)
    })

    it('register - missing address', function () {
      const res = parseMessage('/edward register')
      expect(res.message).to.equal(constants.MISSING_ADDRESS)
    })

    it('register - invalid address', function () {
      const res = parseMessage('/edward register test')
      expect(res.message).to.equal(constants.INVALID_ADDRESS)
    })
  })
})
