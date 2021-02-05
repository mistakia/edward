module.exports = {
  GROUPME: 1,

  COMMANDS: ['tip', 'register', 'rain', 'stats', 'info', 'help'],

  MISSING_KEYWORD: 'Message missing keyword',
  MISSING_COMMAND: 'Missing command, enter "/wisdom help" for more info',
  INVALID_COMMAND: 'Invalid command, enter "/wisdom help" for more info',

  MISSING_AMOUNT: 'Missing amount - /edward tip [amount]',
  INVALID_AMOUNT: 'Invalid amount - should be a whole number or a decimal',

  MISSING_ADDRESS: 'Missing address - /edward register [address]',
  INVALID_ADDRESS: 'Invalid address - should start with "nano_" followed by 60 characters',

  INSUFFICENT_FUNDS: 'Insufficent funds',

  TRANSACTIONS: {
    TIP: 1,
    RAIN: 2
  }
}
