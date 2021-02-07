module.exports = {
  GROUPME: 1,

  RECEIVE_DIFFICULTY: 'fffffe0000000000',
  BASE_DIFFICULTY: 'fffffff800000000',

  COMMANDS: ['tip', 'register', 'rain', 'stats', 'info', 'help'],

  MISSING_KEYWORD: 'Message missing keyword',
  MISSING_COMMAND: 'Missing command, enter "/wisdom help" for more info',
  INVALID_COMMAND: 'Invalid command, enter "/wisdom help" for more info',

  MISSING_AMOUNT: 'Missing amount - /edward tip [amount]',
  INVALID_AMOUNT: 'Invalid amount - should be a whole number or a decimal',

  MISSING_ADDRESS: 'Missing address - /edward register [address]',
  INVALID_ADDRESS: 'Invalid address - should start with "nano_" followed by 60 characters',

  INSUFFICENT_FUNDS: 'Insufficent funds',

  EMPTY_FRONTIER: '0000000000000000000000000000000000000000000000000000000000000000',

  TRANSACTIONS: {
    TIP: 1,
    RAIN: 2
  },

  gifs: [
    'https://i.groupme.com/498x210.gif.b489d6f373cb4a3484c2fb03956c9480',
    'https://i.groupme.com/498x306.gif.2ba0e3ca8699498c96ab35bf016f05db',
    'https://i.groupme.com/640x360.gif.30d3722b728847179e0778d99fcd5cd1',
    'https://i.groupme.com/498x370.gif.1b32f077cde74716a6ce96b51b2bc9bb',
    'https://i.groupme.com/498x370.gif.afaa2ebdfb194bfd8fb92a49cf35eb01',
    'https://i.groupme.com/498x272.gif.3cf4901c33ca45b3b8b5a4fc7ef89329',
    'https://i.groupme.com/476x498.gif.130e3c7f78c34574ab1d01844937a9f6',
    'https://i.groupme.com/480x274.gif.d63969c6da834de48f077164b25c08ee',
    'https://i.groupme.com/283x498.gif.7a8a661cd7a54649b400a5b6f297a47a',
    'https://i.groupme.com/498x330.gif.a5b19f6842de4cdb846346ee5f0f9100',
    'https://i.groupme.com/480x270.gif.e8f8dd4c39624dc5abdd5de25e2e7bd3',
    'https://i.groupme.com/640x500.gif.3c10216e9c3a4684a43ab00cc8f827aa'
  ]
}
