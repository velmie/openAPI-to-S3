#!/usr/bin/env node

const fs = require('fs');
const util = require('util');

const chalk = require('chalk');
// const ora = require('ora');
const yaml = require('yaml');

const openAPIvalidator = require('oas-validator');

const cli = require('./src/cli');
const yamlLoader = require('./src/yaml-loader');
const S3Client = require('./src/s3-client');

const logger = console;

async function handle(callback) {
  try {
    await callback();
  } catch (e) {
    const errorMessage = chalk.redBright(e.message);
    logger.log(errorMessage);

    if (cli.flags.verbose) {
      logger.log(e.stack);
    }
    process.exit(1);
  }
}

handle(async () => {
  if (!cli.flags.label) {
    throw Error(`The "${chalk.underline.red('--label')}" flag should not be empty!`);
  }

  if (!fs.existsSync(cli.flags.src)) {
    throw new Error(`The source file ${chalk.underline.red(cli.flags.src)} doesn't exist!`);
  }

  const srcYaml = await yamlLoader.fromFile(cli.flags.src);

  try {
    await openAPIvalidator.validate(srcYaml, {});
  } catch (e) {
    throw new Error(`Invalid OpenAPI format: ${chalk.underline.red(e.message)}`);
  }

  const s3BitbucketFullPath = cli.flags.s3Path.split('/');

  if (s3BitbucketFullPath.length !== 3) {
    const msg = `Invalid S3 path: "${chalk.underline.red(cli.flags.s3Path)}". It should match the following structure: ${chalk.underline.red('"[BUCKET]/[STAGE]/[SERVICE]"')} !`;
    throw new Error(msg);
  }

  const s3Bucket = s3BitbucketFullPath[0];
  const s3ServicePath = `${s3BitbucketFullPath[1]}/${s3BitbucketFullPath[2]}`;

  const s3Client = new S3Client(s3Bucket, s3ServicePath);

  await s3Client.checkPermissions();

  if (cli.flags.onlyDiff) {
    try {
      const prevS3File = await s3Client.downloadPrevious();

      if (!prevS3File) {
        throw new Error('There is no previous file.');
      }

      const previousYml = yamlLoader.fromString(prevS3File.Body.toString('utf-8'));

      if (util.isDeepStrictEqual(srcYaml, previousYml)) {
        logger.log(chalk.blueBright('The current document is similar to the previous one. Finishing...'));
        process.exit(0);
      }
    } catch (e) {
      logger.log(chalk.yellow('Warning: '));
      logger.log(chalk.yellow(e));
      if (cli.flags.verbose) {
        logger.log(e.stack);
      }
      logger.log(chalk.green('continue...'));
    }
  }

  const newS3File = await s3Client.upload(cli.flags.label, yaml.stringify(srcYaml));

  logger.log(`${chalk.blueBright('The new document has been uploaded:')} ${chalk.underline.cyanBright(newS3File.Key)}`);

  if (cli.flags.keepOnly) {
    const docs = await s3Client.getAllItems();
    if (docs.length > cli.flags.keepOnly) {
      // remove cli.flags.keepOnly elements
      docs.splice(0, cli.flags.keepOnly);
      const result = await s3Client.deleteItems(docs);

      logger.log(`${chalk.blueBright('Outdated & deleted documents:')} ${chalk.underline.blue(result.Deleted.length)}`);
    }
  }
});
