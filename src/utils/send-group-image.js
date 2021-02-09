const GroupMe = require('groupme')
const debug = require('debug')

const API = GroupMe.Stateless
const log = debug('groupme:group-message')

const config = require('../../config')

const sendGroupImage = async ({ groupId, type, image }) => {
  if (process.env.NODE_ENV !== 'production') return
  if (!groupId) return
  if (!image) return

  log(`sending image ${image} to ${groupId}`)
  try {
    await API.Messages.create.Q(config.groupme.ACCESS_TOKEN, groupId, {
      message: { attachments: [{ type: 'image', url: image }] }
    })
  } catch (err) {
    log(err)
  }
}

module.exports = sendGroupImage
