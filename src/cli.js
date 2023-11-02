const meow = require('meow');

const cli = meow(`
  Usage
    $ api2s3 --src=./docs/api.yaml --s3-path=bucket/prod/accounts --label=$(date +%s) --only-diff

    $ openapi-to-s3 --src=./docs/api.yaml --s3-path=bucket/dev/reports --label=latest --keep-only=1

  Options
    --src=./docs/api.yml              The path to the source 'OpenAPI' file
    --s3-path=bucket/stage/service    The destination path on AWS S3
    --label=v1.0.3                    The label for the current version of the 'OpenAPI' file
    --region=us-east-1                The bucket region on S3
    --only-diff                       Checks the previously uploaded file and uploads a new one only if there are any differences between them
    --keep-only=2                     Keeps only N the latest documents on AWS S3 (default: unlimited)
    --verbose                         Shows errors, warnings, etc.
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
    region: {
      type: 'string',
      isRequired: false,
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
