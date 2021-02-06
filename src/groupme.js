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
  if (!msg.data || !validTypes.includes(msg.data.type)) return

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
      // await edward.rain({ userId, type: constants.GROUPME, to })
      break
    }

    case 'tip': {
      // get all mentions
      const mentions = msg.data.subject.attachments.filter(m => m.type === 'mentions')
      const userIds = mentions.map(m => m.user_ids).flat()
      const receiverIds = Array.from(new Set(userIds))
      if (!receiverIds.length) {
        // TODO - send notification
        return
      }

      await edward.tip({
        senderId: msg.data.subject.user_id,
        type: constants.GROUPME,
        amount: parsed.params.amount,
        receiverIds
      })
      break
    }

    case 'info':
      break

    case 'stats':
      break

    case 'help':
      await edward.help({
        groupId: msg.data.subject.group_id,
        userId: msg.data.subject.user_id,
        type: constants.GROUPME
      })
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
