/* global describe it */
const chai = require('chai')
const chaiHTTP = require('chai-http')

const config = require('./config')
const server = require('../src/server')
const pkg = require('../package.json')

chai.use(chaiHTTP)
const expect = chai.expect

describe('server', function () {
  this.timeout(config.timeout)

  it('/', async () => {
    const res = await chai.request(server).get('/')
    expect(res.status).to.equal(200)
    expect(res.body.version).to.equal(pkg.version)
  })

  describe('errors', () => {
    it('invalid path', async () => {
      const res = await chai.request(server).get('/invalid')
      expect(res.status).to.equal(404)
      expect(res.body.message).to.equal('invalid path')
    })
  })
})
