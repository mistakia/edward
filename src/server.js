const express = require('express')
const morgan = require('morgan-debug')
const bodyParser = require('body-parser')
const debug = require('debug')
const GroupMe = require('groupme')

const Edward = require('./index')
const config = require('../config')
const constants = require('../constants')
const pkg = require('../package.json')
const { parseMessage, sendDirectMessage, sendGroupMessage } = require('./utils')

const API = GroupMe.Stateless
const app = express()

app.locals.log = debug('server')
app.locals.edward = new Edward(config.seed)
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

  const msg = parseMessage(message.text)
  if (!msg.valid) {
    if (msg.message === constants.MISSING_KEYWORD) return

    switch (msg.message) {
      case constants.INVALID_ADDRESS:
      case constants.MISSING_ADDRESS:
        await sendDirectMessage({
          type: constants.GROUPME,
          message: msg.message,
          userId: message.user_id
        })
        break

      case constants.MISSING_AMOUNT:
      case constants.INVALID_AMOUNT:
        await sendGroupMessage({
          type: constants.GROUPME,
          message: msg.message,
          groupId: message.group_id
        })
        break
    }

    return
  }

  app.locals.log(`[groupme][${msg.command}]`)
  switch (msg.command) {
    case 'register': {
      await app.locals.register({
        userId: message.user_id,
        type: constants.GROUPME,
        address: msg.params.address
      })
      break
    }

    case 'rain': {
      const res = await API.Groups.show.Q(config.groupme.ACCESS_TOKEN, message.group_id)
      console.log(res)
      // const blocks = await app.locals.rain({ userId, type: constants.GROUPME, to })
      break
    }

    case 'tip': {
      // get all mentions
      const blocks = await app.locals.tip({
        senderId: message.user_id,
        type: constants.GROUPME,
        receiverIds: []
      })
      console.log(blocks)
      break
    }

    case 'info':
      break

    case 'stats':
      break

    case 'help':
      break
  }
})

app.get('/', (req, res) => {
  res.status(200).send({ version: pkg.version })
})

app.get('*', (req, res) => {
  res.status(404).send({ message: 'invalid path' })
})

module.exports = app
