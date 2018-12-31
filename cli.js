#!/usr/bin/env node

const cli = require('sywac')
  .style(require('sywac-style-basic'))
  .outputSettings({ maxWidth: 63 })
  .preface(null, [
    'Create a sywac CLI project in an idempotent way. This will add',
    'sywac to your project with a default cli.js file. It will touch',
    'package.json but will not overwrite files that already exist.'
  ].join('\n'))
  .positional('[dir]', {
    paramsDesc: 'Optional path to project directory'
  })
  .boolean('-a, --all', {
    group: 'Scaffolding Options:',
    desc: 'Scaffold all basic project files and dev dependencies'
  })
  .string('-d, --desc "Some desc"', {
    group: 'Scaffolding Options:',
    desc: 'Define project\'s initial description'
  })
  .string('-w, --wersion <x.y.z>', { // workaround for `npm init sywac -v x.y.z`
    group: 'Scaffolding Options:',
    desc: 'Define the project\'s initial version',
    defaultValue: '0.1.0'
  })
  .help('-h, --help', {
    group: 'Help Options:',
    implicitCommand: false
  })
  .version('-V, --VERSION', {
    group: 'Help Options:',
    desc: 'Show create-sywac version number',
    implicitCommand: false
  })
  .check((argv, ctx) => {
    if (argv._.includes('--help') || argv._.includes('-h')) ctx.deferHelp()
    else argv.version = argv.wersion
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
