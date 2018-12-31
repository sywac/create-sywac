# create-sywac

> npm init sywac

This package is used to scaffold your sywac-powered CLI project when you run `npm init sywac`.

## Recommended Usage

To create a project from scratch:

```console
$ mkdir <project>
$ cd <project>
$ git init
$ git remote add origin <blah>
$ npm init
$ npm init sywac --all
```

To just add sywac to an existing project:

```console
$ cd <project>
$ npm init sywac
```

To see all options:

```console
$ npm init sywac -- --help
```

## Details

This tool sets up the following:

- Makes sure the project directory exists, if specified via `npm init sywac <dir>`
- Creates an executable `cli.js` file, if missing
- Creates or modifies a `package.json` file:
  - Adds `sywac` and `sywac-style-basic` as production dependencies, if missing
  - Defines `"bin"` to be `"cli.js"`, if not defined
  - Optionally defines `"main"` to be `"index.js"`, if not defined
  - Optionally adds `"cli.js"` and `"index.js"` to `"files"`, if missing
  - Optionally adds dev dependencies, if missing:
    - `coveralls`
    - `standard`
    - `standard-version`
    - `tap`
  - Optionally adds scripts, if missing:
    - `"pretest": "standard"`
    - `"test": "tap --cov test.js"`
    - `"coverage": "nyc report --reporter=text-lcov | coveralls"`
    - `"release": "standard-version"`
- Optionally creates a default `.gitignore` file, if missing
- Optionally creates a default `.npmrc` file, if missing
- Optionally creates a default `.travis.yml` file, if missing
- Optionally creates a default ISC `LICENSE` file, if missing
- Optionally creates a default `README.md` file, if missing
- Optionally creates an empty `index.js` file, if missing
- Optionally creates an empty `test.js` file, if missing

## License

MIT © Andrew Goode
