/* global describe it */

const expect = require('chai').expect

const config = require('./config')
const Edward = require('../src/index')

describe('constructor', function () {
  this.timeout(config.timeout)

  it('create an instance', () => {
    const edward = new Edward(config.seed)

    expect(edward.wallet.seed).to.equal(config.seed)
    expect(edward.wallet.accounts).to.be.an('array')

    expect(edward.tip).to.be.a('function')
    expect(edward.register).to.be.a('function')
    expect(edward.rain).to.be.a('function')
    expect(edward.stats).to.be.a('function')
    expect(edward.help).to.be.a('function')
    expect(edward.balance).to.be.a('function')

    const account = edward.wallet.accounts[0]
    expect(account.accountIndex).to.equal(0)
    expect(account.privateKey).to.equal('ebef4efd53393f6fd614bebd463502afa57229b7f8009e1106dc6c659ffead52')
    expect(account.publicKey).to.equal('5cf664138933b06672766029a95f471d0297affebbbaefaebabefb504a979d62')
    expect(account.address).to.equal('nano_1q9peibrkexiess9er3bo7hng9a4kyqzxgxtxyqdohquc37bh9d4aiyt36zs')
  })
})
