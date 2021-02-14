const { tools } = require('nanocurrency-web')
const BigNumber = require('bignumber.js')

const constants = require('../../constants')
const invalid = (message) => ({
  valid: false,
  command: null,
  params: [],
  message
})

const parseMessage = (message) => {
  if (message.substring(0, 7).toLowerCase() !== '/edward') {
    return invalid(constants.MISSING_KEYWORD)
  }

  const re = /\/edward\s([^\s]*)/ig
  const reResult = re.exec(message)
  const match = (reResult && reResult.length) ? reResult[1] : undefined

  if (!match) return invalid(constants.MISSING_COMMAND)
  if (!constants.COMMANDS.includes(match.toLowerCase())) {
    return invalid(constants.INVALID_COMMAND)
  }

  const command = match.toLowerCase()
  const params = { args: message.toLowerCase().split(' ') }

  if (['tip', 'rain'].includes(command)) {
    const amountStr = params.args[2]
    if (!amountStr) return invalid(constants.MISSING_AMOUNT)

    const amount = new BigNumber(amountStr)
    if (amount.isNaN()) return invalid(constants.INVALID_AMOUNT)
    if (amount.isNegative()) return invalid(constants.INVALID_AMOUNT)

    params.amount = amount
  } else if (command === 'register') {
    const address = params.args[2]
    if (!address) return invalid(constants.MISSING_ADDRESS)

    const valid = tools.validateAddress(address)
    if (!valid) return invalid(constants.INVALID_ADDRESS)

    params.address = address
  }

  return { valid: true, command, params }
}

module.exports = parseMessage
