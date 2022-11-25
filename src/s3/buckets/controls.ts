import { IronArgs, IronHandler } from '../../common';

import { Arguments } from 'yargs';
import { S3 } from '@elemental-clouds/osmium';
import { S3 as service } from '@elemental-clouds/oxygen';

export const command = 'controls';
export const describe = 'S3 bucket public access control toggles';
export const builder = IronHandler.setupBuilder(service);

export const handler = async function (args: Arguments<IronArgs>) {
  const scanner = await new IronHandler({
    ...args,
    service,
    Scanner: S3.Buckets,
  }).scan();

  console.log({
    'scanner.controlResults.length': scanner.controlResults.length,
    'scanner.inventory.length': scanner.inventory.length,
  });

  scanner.displayResults();
};
