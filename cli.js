#!/usr/bin/env node

const cli = require('sywac')
  .style(require('sywac-style-basic'))
  .outputSettings({ maxWidth: 65 })
  .positional('[dir]', {
    paramsDesc: 'Optional path to project directory'
  })
  .string('-v, --version <string>', {
    desc: 'Define the project\'s initial version',
    defaultValue: '0.1.0'
  })
  .help('-h, --help', {
    implicitCommand: false,
    group: 'Help:'
  })
  .version('-V, --VERSION', {
    implicitCommand: false,
    group: 'Help:'
  })

module.exports = cli

if (require.main === module) {
  cli.parseAndExit().then(argv => {
    return require('./index')(argv)
  }).catch(err => {
    console.error('Unexpected error:', err)
    process.exit(1)
  })
}
