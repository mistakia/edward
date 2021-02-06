const GroupMe = require('groupme')
const debug = require('debug')
const API = GroupMe.Stateless

const Edward = require('./index')
const constants = require('../constants')
const config = require('../config')
const { parseMessage, sendDirectMessage, sendGroupMessage } = require('./utils')

const log = debug('groupme')
const edward = new Edward(config.seed)

const incoming = new GroupMe.IncomingStream(
  config.groupme.ACCESS_TOKEN,
  config.groupme.USER_ID,
  null
)

// This waits for the IncomingStream to complete its handshake and start listening.
// We then get the bot id of a specific bot.
incoming.on('connected', () => {
  log("[IncomingStream 'connected']")
})

// This waits for messages coming in from the IncomingStream
// If the message contains @BOT, we parrot the message back.
incoming.on('message', async (msg) => {
  const validTypes = ['line.create', 'direct_message.create']
  if (!validTypes.includes(msg.data.type)) return

  if (!msg.data.subject.text) {
    return
  }

  log("[IncomingStream 'message'] Message Received")
  log(msg)

  /* if (message.group_id !== config.groupme.GROUP_ID) {
   *   return
   * }
   */

  const parsed = parseMessage(msg.data.subject.text)
  if (!parsed.valid) {
    if (parsed.message === constants.MISSING_KEYWORD) return

    switch (parsed.message) {
      case constants.INVALID_ADDRESS:
      case constants.MISSING_ADDRESS:
        await sendDirectMessage({
          type: constants.GROUPME,
          message: parsed.message,
          userId: msg.data.subject.user_id
        })
        break

      case constants.MISSING_AMOUNT:
      case constants.INVALID_AMOUNT: {
        const groupId = msg.data.subject.group_id
        if (!groupId) {
          // TODO - send notification
          return
        }

        await sendGroupMessage({
          type: constants.GROUPME,
          message: parsed.message,
          groupId: groupId
        })
        break
      }
    }

    return
  }

  log(`[groupme][${parsed.command}]`)
  switch (parsed.command) {
    case 'register': {
      await edward.register({
        userId: msg.data.subject.user_id,
        type: constants.GROUPME,
        address: parsed.params.address
      })
      break
    }

    case 'rain': {
      const groupId = msg.data.subject.group_id
      if (!groupId) {
        // TODO - send notification
        return
      }

      const res = await API.Groups.show.Q(config.groupme.ACCESS_TOKEN, groupId)
      log(res)
      // const blocks = await edward.rain({ userId, type: constants.GROUPME, to })
      break
    }

    case 'tip': {
      // get all mentions
      log(msg.data.subject.attachments)
      const blocks = await edward.tip({
        senderId: msg.data.subject.user_id,
        type: constants.GROUPME,
        receiverIds: []
      })
      log(blocks)
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

// This listens for the bot to disconnect
incoming.on('disconnected', () => {
  log("[IncomingStream 'disconnect']")
  // TODO - reconnect
})

// This listens for an error to occur on the Websockets IncomingStream.
incoming.on('error', (message, payload) => {
  log("[IncomingStream 'error']", message, payload)
  // TODO - reconnect
})

module.exports = incoming
