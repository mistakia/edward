const express = require('express')
const morgan = require('morgan-debug')
const bodyParser = require('body-parser')
const debug = require('debug')
const GroupMe = require('groupme')

const config = require('../config')
const pkg = require('../package.json')

const API = GroupMe.Stateless
const app = express()

app.locals.log = debug('server')
if (process.env.NODE_ENV !== 'test') debug.enable('server*')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('server:request', 'combined'))
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.post('/groupme', async (req, res) => {
  const message = req.body

  if (!message.text) {
    return
  }

  if (message.group_id !== config.groupme.GROUP_ID) {
    return
  }

  if (message.text.substring(0, 7) !== '/edward') {
    return
  }

  // TODO parse command
  const command = message.text
  app.local.log(`[groupme][${command}]`)
})

app.get('/', (req, res) => {
  res.status(200).send({ version: pkg.version })
})

app.get('*', (req, res) => {
  res.status(404).send({ message: 'invalid path' })
})

module.exports = app
