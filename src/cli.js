const meow = require('meow');

const cli = meow(`
  Usage
    $ api2s3 --src=./docs/api.yaml --s3-path=bucket/prod/accounts --label=$(date +%s) --only-diff

    $ openapi-to-s3 --src=./docs/api.yaml --s3-path=bucket/dev/reports --label=latest --keep-only=1

  Options
    --src=./docs/api.yml              The path to the source file
    --s3-path=bucket/stage/service    The description path on AWS S3
    --label=v1.0.3                    The label of the source file
    --only-diff                       Upload only if there are some difference between previous file
    --keep-only=2                     Keep only N latest documents (default: unlimited)
    --verbose                         Show errors etc.
`, {
  flags: {
    src: {
      type: 'string',
      isRequired: true,
    },
    s3Path: {
      type: 'string',
      isRequired: true,
    },
    label: {
      type: 'string',
      isRequired: true,
    },
    verbose: {
      type: 'boolean',
      default: false,
    },
    onlyDiff: {
      type: 'boolean',
      default: false,
    },
    keepOnly: {
      type: 'number',
      default: 0,
    },
  },
});

if (cli.flags.keepOnly < 0) {
  cli.flags.keepOnly = 0;
}

module.exports = cli;
