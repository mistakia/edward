const GroupMe = require('groupme')
const debug = require('debug')

const API = GroupMe.Stateless
const log = debug('groupme:group-message')

const config = require('../../config')

const sendGroupMessage = async ({ groupId, type, messages }) => {
  if (process.env.NODE_ENV !== 'production') return
  if (!groupId) return
  if (!messages || !messages.length) return

  log(`sending ${messages.length}  messages to ${groupId}`)
  for (const message of messages) {
    try {
      await API.Messages.create.Q(config.groupme.ACCESS_TOKEN, groupId, {
        message: { text: message }
      })
    } catch (err) {
      log(err)
    }
  }
}

module.exports = sendGroupMessage
