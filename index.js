const fs = require('fs')
const path = require('path')

const logUpdate = require('log-update')
const figures = require('figures')

const MAIN = 'index.js'
const BIN = 'cli.js'
const GITIGNORE = 'gitignore' // npm turns .gitignore into .npmignore on publish or install ಠ_ಠ https://github.com/npm/npm/issues/1862
const LICENSE = 'LICENSE'
const README = 'README.md'

function mkdir (pathToDir) {
  return new Promise((resolve, reject) => {
    require('mkdirp')(pathToDir, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

function readFile (pathToFile) {
  return new Promise((resolve, reject) => {
    fs.readFile(pathToFile, 'utf8', (err, data) => {
      if (err && err.code !== 'ENOENT') return reject(err)
      resolve(data)
    })
  })
}

async function readJsonFile (pathToFile) {
  let fileContents = await readFile(pathToFile)
  if (fileContents) fileContents = JSON.parse(fileContents)
  return fileContents
}

async function loadDefault (fileName) {
  if (fileName === ('.' + GITIGNORE)) fileName = GITIGNORE
  return readFile(path.join(__dirname, 'defaults', fileName))
}

function writeFile (pathToFile, contents, mode) {
  return new Promise((resolve, reject) => {
    let opts = { encoding: 'utf8' }
    if (mode) opts.mode = mode
    fs.writeFile(pathToFile, contents, opts, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

let _execa
function execa () {
  if (!_execa) _execa = require('execa')
  return _execa
}

// function logFile (name, data) { // TODO remove this
//   console.log('-----------------------------------------------------------------')
//   if (!data) return console.log(`No ${name} found`)
//   console.log(`${name}:`, data)
// }

module.exports = async function createSywac (opts) {
  opts = opts || {}
  // console.log('parsed opts:', opts) // TODO remove this

  let baseDir
  if (opts.dir) {
    baseDir = path.resolve(process.cwd(), opts.dir)
    const reld = path.relative(process.cwd(), baseDir)
    logUpdate(`Making directory ${reld} ...`)
    await mkdir(baseDir)
    logUpdate(`Making directory ${reld} ... ${figures.tick}`)
    logUpdate.done()
  } else {
    baseDir = process.cwd()
  }

  const files = [
    'package.json',
    BIN,
    GITIGNORE,
    '.npmrc',
    '.travis.yml',
    LICENSE, // ISC by default, replace YYYY with new Date().getFullYear()
    README, // replace PKGNAME and PKGDESC
    MAIN,
    'test.js'
  ]
  logUpdate(`Checking project ...`)
  let loaded = await Promise.all(files.map(async name => {
    if (name === GITIGNORE) name = '.' + GITIGNORE
    const file = { name, path: path.join(baseDir, name) }
    if (name.endsWith('.json')) file.data = await readJsonFile(file.path)
    else file.data = await readFile(file.path)
    return file
  }))
  loaded = await Promise.all(loaded.map(async file => {
    // logFile(file.name, file.data) // TODO remove this
    if (!file.data) file.default = await loadDefault(file.name)
    if (!file.default && file.name.endsWith('.js')) file.default = '// TODO\n'
    return file
  }))

  let pkgChanged = false
  let pkgNew = false
  let pkg = loaded[0].data
  if (!pkg) {
    pkg = {}
    pkgChanged = true
    pkgNew = true
  }
  if (!pkg.name) {
    pkg.name = path.basename(baseDir)
    pkgChanged = true
  }
  if (!pkg.version) {
    pkg.version = opts.version || '0.1.0'
    pkgChanged = true
  }
  if (!pkg.description) {
    pkg.description = ''
    pkgChanged = true
  }
  if (!pkg.main) {
    pkg.main = MAIN
    pkgChanged = true
  }
  if (!pkg.bin) {
    pkg.bin = BIN
    pkgChanged = true
  }
  const pkgFiles = [].concat(pkg.files).filter(Boolean)
  if (!pkgFiles.includes(BIN)) {
    pkgFiles.push(BIN)
    pkgChanged = true
  }
  if (!pkgFiles.includes(MAIN)) {
    pkgFiles.push(MAIN)
    pkgChanged = true
  }
  pkg.files = pkgFiles.sort()
  pkg.scripts = pkg.scripts || {}
  if (!pkg.scripts.pretest) {
    pkg.scripts.pretest = 'standard'
    pkgChanged = true
  }
  if (!pkg.scripts.test || pkg.scripts.test === 'echo "Error: no test specified" && exit 1') {
    pkg.scripts.test = 'tap --cov test.js'
    pkgChanged = true
  }
  if (!pkg.scripts.coverage) {
    pkg.scripts.coverage = 'nyc report --reporter=text-lcov | coveralls'
    pkgChanged = true
  }
  if (!pkg.scripts.release) {
    pkg.scripts.release = 'standard-version'
    pkgChanged = true
  }
  if (!pkg.license) {
    pkg.license = 'ISC'
    pkgChanged = true
  }

  let prodDeps = []
  pkg.dependencies = pkg.dependencies || {}
  if (!pkg.dependencies.sywac) prodDeps.push('sywac')
  if (!pkg.dependencies['sywac-style-basic']) prodDeps.push('sywac-style-basic')

  let devDeps = []
  pkg.devDependencies = pkg.devDependencies || {}
  if (!pkg.devDependencies.coveralls) devDeps.push('coveralls')
  if (!pkg.devDependencies.standard) devDeps.push('standard')
  if (!pkg.devDependencies['standard-version']) devDeps.push('standard-version')
  if (!pkg.devDependencies.tap) devDeps.push('tap')
  logUpdate(`Checking project ... ${figures.tick}`)
  logUpdate.done()

  // do these concurrently
  let written = loaded.slice(1).filter(file => {
    if (file.default && !file.data) {
      file.rel = path.relative(process.cwd(), file.path)
      return true
    }
    return false
  })
  if (written.length) {
    const lines = written.map(file => `  ${file.rel} ...`)
    logUpdate('Creating project files:\n' + lines.join('\n'))
    await Promise.all(written.map(async file => {
      if (file.name === LICENSE) file.default = String(file.default).replace(/YYYY/g, String(new Date().getFullYear()))
      else if (file.name === README) file.default = String(file.default).replace(/PKGNAME/g, pkg.name).replace(/PKGDESC/g, pkg.description)
      await writeFile(file.path, file.default, file.name === BIN ? 0o755 : null)
    }))
    logUpdate('Creating project files:\n' + lines.join(' ' + figures.tick + '\n') + ' ' + figures.tick)
    logUpdate.done()
  } else {
    console.log('Project files already in place ' + figures.tick)
  }

  // do these serially
  if (pkgChanged || prodDeps.length || devDeps.length) {
    const verb = pkgNew ? 'Creating' : 'Updating'
    logUpdate(`${verb} package.json ...`)
    await writeFile(loaded[0].path, JSON.stringify(pkg, null, 2))
    logUpdate(`${verb} package.json ... ${figures.tick}`)
    logUpdate.done()
  } else {
    console.log('And package.json looks good ' + figures.tick)
  }
  if (prodDeps.length) {
    logUpdate(`Installing sywac ...`)
    await execa()('npm', ['i', '--save'].concat(prodDeps.map(d => d + '@latest')), { cwd: baseDir })
    logUpdate(`Installing sywac ... ${figures.tick}`)
    logUpdate.done()
  }
  if (devDeps.length) {
    logUpdate(`Installing devDependencies ...`)
    await execa()('npm', ['i', '--save-dev'].concat(devDeps.map(d => d + '@latest')), { cwd: baseDir })
    logUpdate(`Installing devDependencies ... ${figures.tick}`)
    logUpdate.done()
  }
}
