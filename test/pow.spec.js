/* global describe it */

const expect = require('chai').expect

const config = require('./config')
const Edward = require('../src/index')
const pow = require('../src/utils/work')

describe('pow', function () {
  this.timeout(60000)
  const hash = 'EB827A42FCB1CCC1952C967FE91F4FEDD4A12354ECBCC5A80586A96D1B41AC7B'

  it('compute', async () => {
    const promise1 = pow.compute(hash)
    const promise2 = pow.compute(hash)
    const promise3 = pow.compute(hash)
    const work = await promise3

    expect(work).to.equal('x')
  })
})
