import * as osmium from '@elemental-clouds/osmium';

import { IronArgs, IronHandler } from '../../common';

import { Arguments } from 'yargs';

export const command = 'control';
export const describe = 'S3 bucket public access control toggles';
export const builder = IronHandler.setupBuilder();

export const handler = async function (args: Arguments<IronArgs>) {
  const iron = new IronHandler({
    ...args,
    Scanner: osmium.S3.Buckets,
  });

  await iron.getControlResults();
};
