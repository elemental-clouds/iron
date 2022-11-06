import _yargs from 'yargs';
import { commandDirOptions } from './common';
import yargs from 'yargs/yargs';

yargs(process.argv.slice(2))
  .options({
    regions: {
      type: 'array',
      description: 'A list of AWS region',
      default: [process.env['AWS_DEFAULT_REGION'] || 'us-east-1'],
    },
    profile: { type: 'string', alias: 'p', description: 'AWS profile' },
    resourceIds: {
      type: 'array',
      alias: 'i',
      description: 'AWS resource ID',
    },
  })
  .strict()
  .commandDir('s3', commandDirOptions)
  .demandCommand(1)
  .wrap(_yargs.terminalWidth())
  .help().argv;
