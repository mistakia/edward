const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const fetch = require('node-fetch')

const run = async (count) => {
  if (!count) {
    throw new Error('missing --count')
  }

  const response = await fetch('http://[::1]:7077', {
    method: 'post',
    body: JSON.stringify({
      action: 'benchmark',
      count
    })
  })

  const json = await response.json()
  console.log(json)
}

run(argv.count)
