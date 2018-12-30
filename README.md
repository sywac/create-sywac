# create-sywac

> npm init sywac

This package is used to scaffold your sywac-powered CLI project when you run `npm init sywac`.

## Recommended Usage

```console
$ mkdir <project>
$ cd <project>
$ git init
$ git remote add origin <blah>
$ npm init
$ npm init sywac
```

## Details

This tool sets up the following:

- Makes sure the project directory exists, if specified via `npm init sywac <dir>`
- Creates or modifies a `package.json` file:
  - Adds `sywac` and `sywac-style-basic` as production dependencies, if missing
  - Defines `"bin"` to be `"cli.js"`, if not defined
  - Defines `"main"` to be `"index.js"`, if not defined
  - Adds `"cli.js"` and `"index.js"` to `"files"`, if missing
  - Adds dev dependencies, if missing:
    - `coveralls`
    - `standard`
    - `standard-version`
    - `tap`
  - Adds scripts, if missing:
    - `"pretest": "standard"`
    - `"test": "tap --cov test.js"`
    - `"coverage": "nyc report --reporter=text-lcov | coveralls"`
    - `"release": "standard-version"`
- Creates an executable `cli.js` file, if missing
- Creates a default `.gitignore` file, if missing
- Creates a default `.npmrc` file, if missing
- Creates a default `.travis.yml` file, if missing
- Creates a default ISC `LICENSE` file, if missing
- Creates a default `README.md` file, if missing
- Creates an empty `index.js` file, if missing
- Creates an empty `test.js` file, if missing

## License

MIT © Andrew Goode
