const constants = require('../../constants')

const randomGif = () => constants.gifs[Math.floor(Math.random() * constants.gifs.length)]

module.exports = {
  randomGif,
  parseMessage: require('./parse-message'),
  rpc: require('./rpc'),
  createSendBlock: require('./create-send-block'),
  createReceiveBlock: require('./create-receive-block'),
  sendDirectMessage: require('./send-direct-message'),
  sendGroupMessage: require('./send-group-message'),
  sendGroupImage: require('./send-group-image'),
  work: require('./work')
}
