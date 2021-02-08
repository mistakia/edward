const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const { rpc } = require('../src/utils')

const run = async (hash) => {
  if (!hash) {
    throw new Error('missing --hash')
  }

  const res = await rpc('work_generate', {
    hash
  })

  console.log(res)
}

run(argv.hash)
