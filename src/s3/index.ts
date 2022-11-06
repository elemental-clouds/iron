import { Argv } from 'yargs';
import { commandDirOptions } from '../common';

export const command = 's3';
export const desc = 'Simple Storage Service (S3)';

export const builder = (yargs: Argv) => {
  return yargs
    .commandDir('buckets', commandDirOptions)
    .demandCommand(1)
    .help()
    .option({
      global: {
        type: 'boolean',
        desc: 'aws global service',
        default: true,
      },
    });
};
