#!/usr/bin/env node

const cli = require('sywac')
  .style(require('sywac-style-basic'))
  .outputSettings({ maxWidth: 100 })
  .showHelpByDefault()
  .help('-h, --help')
  .version('-v, --version')

module.exports = cli

if (require.main === module) cli.parseAndExit()
