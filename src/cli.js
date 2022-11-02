#!/usr/bin/env node

const yargs = require('yargs');

yargs(process.argv.slice(2))
  .options({
    regions: {
      type: 'array',
      alias: 'r',
      description: 'AWS region',
    },
    profile: { type: 'string', alias: 'p', description: 'AWS profile' },
    resourceId: {
      type: 'string',
      alias: 'i',
      description: 'AWS resource ID',
    },
  })
  .strict()
  .commandDir('S3')
  .demandCommand(1)
  .wrap(yargs.terminalWidth())
  .help().argv;
