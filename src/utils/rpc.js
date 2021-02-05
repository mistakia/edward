const fetch = require('node-fetch')

const config = require('../../config')

const rpc = async (action, params) => {
  const response = await fetch(config.api, {
    method: 'post',
    body: JSON.stringify({ action, ...params }),
    headers: { 'Content-Type': 'application/json' }
  })
  return response.json()
}

module.exports = rpc
