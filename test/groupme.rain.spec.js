/* global describe before it */

const config = require('./config')
const db = require('../db')

describe('groupme rain', function () {
  this.timeout(config.timeout)

  before(async function () {
    await db.migrate.forceFreeMigrationsLock()
    await db.migrate.rollback()
    await db.migrate.latest()
  })

  it('send message to callback api', async () => {
    // send register message to api

    // check database for entry
  })

  describe('errors', async () => {
    it('invalid group id', async () => {

    })

    it('missing amount', async () => {

    })

    it('invalid amount', async () => {

    })

    it('insufficient amount', async () => {

    })
  })
})
