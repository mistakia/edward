const GroupMe = require('groupme')
const API = GroupMe.Stateless

const config = require('../../config')

const sendDirectMessage = async ({ userId, type, message }) => {
  if (process.env.NODE_ENV !== 'production') return
  const res = await API.DirectMessages.create.Q(config.groupme.ACCESS_TOKEN, {
    source_guid: Math.round(Date.now() / 1000),
    recipient_id: userId,
    text: message
  })
  console.log(res)
  // TODO
}

module.exports = sendDirectMessage
