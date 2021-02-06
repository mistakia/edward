const GroupMe = require('groupme')
const debug = require('debug')

const API = GroupMe.Stateless
const log = debug('groupme:direct-message')

const config = require('../../config')

const sendDirectMessage = async ({ userId, type, messages }) => {
  if (process.env.NODE_ENV !== 'production') return
  if (!messages || !messages.length) return
  if (!userId) return

  log(`sending ${messages.length}  messages to ${userId}`)

  for (const message of messages) {
    try {
      await API.DirectMessages.create.Q(config.groupme.ACCESS_TOKEN, {
        direct_message: {
          recipient_id: userId,
          text: message
        }
      })
    } catch (err) {
      log(err)
    }
  }
}

module.exports = sendDirectMessage
