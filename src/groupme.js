const IncomingStream = require('groupme').IncomingStream

const config = require('../config')

const incoming = new GroupMe.IncomingStream(
  config.groupme.ACCESS_TOKEN,
  config.groupme.USER_ID,
  null
)

// This waits for the IncomingStream to complete its handshake and start listening.
// We then get the bot id of a specific bot.
incoming.on('connected', function() {
  console.log("[IncomingStream 'connected']")
})

// This waits for messages coming in from the IncomingStream
// If the message contains @BOT, we parrot the message back.
incoming.on('message', function(msg) {
  console.log("[IncomingStream 'message'] Message Received")
  console.log(msg)
})

// This listens for the bot to disconnect
incoming.on('disconnected', function() {
  console.log("[IncomingStream 'disconnect']")
  // TODO - reconnect
})

// This listens for an error to occur on the Websockets IncomingStream.
incoming.on('error', function() {
  var args = Array.prototype.slice.call(arguments)
  console.log("[IncomingStream 'error']", args)
  // TODO - reconnect
})

module.exports = incoming
