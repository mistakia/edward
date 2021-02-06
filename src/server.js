const express = require('express')
const morgan = require('morgan-debug')
const bodyParser = require('body-parser')
const debug = require('debug')

const groupmePubsub = require('./groupme')
const Edward = require('./index')
const config = require('../config')
const pkg = require('../package.json')

const app = express()

app.locals.log = debug('server')
app.locals.edward = new Edward(config.seed)
app.locals.groupme = groupmePubsub
if (process.env.NODE_ENV !== 'test') debug.enable('server*,groupme,edward')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('server:request', 'combined'))
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.get('/', (req, res) => {
  res.status(200).send({ version: pkg.version })
})

app.get('*', (req, res) => {
  res.status(404).send({ message: 'invalid path' })
})

module.exports = app
