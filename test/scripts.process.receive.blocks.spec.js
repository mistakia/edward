/* global describe before it */

const expect = require('chai').expect

const db = require('../db')
const config = require('./config')
const constants = require('../constants')
const run = require('../scripts/process-receive-blocks')
const Edward = require('../src/index')

describe('scripts process receive blocks', function () {
  this.timeout(360000)

  before(async function () {
    await db.migrate.forceFreeMigrationsLock()
    await db.migrate.rollback()
    await db.migrate.latest()
  })

  it('process', async () => {
    const edward = new Edward(config.seed)
    for (let i = 1; i < 5; i++) {
      await edward.accounts.create({ userId: `${i}`, type: constants.GROUPME })
    }

    let error
    try {
      await run()
    } catch (err) {
      error = err
    }

    expect(error).to.equal(undefined)
  })
})
