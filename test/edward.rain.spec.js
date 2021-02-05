/* global describe before it */

const expect = require('chai').expect
const { wallet } = require('nanocurrency-web')

const Edward = require('../src/index')
const db = require('../db')
const config = require('./config')
const constants = require('../constants')

describe('edward.rain', function () {
  this.timeout(config.timeout)

  before(async function () {
    await db.migrate.forceFreeMigrationsLock()
    await db.migrate.rollback()
    await db.migrate.latest()
  })

  it('rain', async () => {
    const edward = new Edward(config.seed)
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
