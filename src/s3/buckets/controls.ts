import * as osmium from '@elemental-clouds/osmium';

import { Arguments, CommandBuilder } from 'yargs';

import { ControlProcedure } from '@elemental-clouds/hydrogen';
import { S3 as Service } from '@elemental-clouds/oxygen';
import assert from 'assert';
import titanium from '@elemental-clouds/titanium';

export const command = 'control';
export const describe = 'S3 bucket public access control toggles';

function getService(service: object) {
  return service as { [key: string]: ControlProcedure };
}

function getServiceControls(service: object) {
  return Object.keys(service);
}

function setupBuilder() {
  const service = getService(Service);
  const controls = getServiceControls(Service);

  const builder: CommandBuilder = {};

  for (const control of controls) {
    const _name = service[control]?.name;
    const description = service[control]?.description;

    assert(service[control], `unknown control ${control}`);
    assert(_name, 'missing control name');
    assert(description, 'missing control description');

    builder[_name] = {
      description,
    };
  }
  return builder;
}

function getFirstRegionInArgs(regions: string[] | undefined) {
  assert(Array.isArray(regions));
  assert(regions.length === 1);

  const region = regions[0];

  assert(region, 'unable to determine region');
  return region;
}

export const builder = setupBuilder();

export const handler = async function (
  args: Arguments<{
    regions: string[];
    profile?: string;
    resourceIds?: string[];
  }>
) {
  const { regions, profile, resourceIds } = args;
  const controls = getServiceControls(Service);
  const region = getFirstRegionInArgs(regions);
  const service = getService(Service);
  const results = [];

  const scanner = new osmium.S3.Buckets({ profile, region });

  if (resourceIds) {
    scanner.addResource({ resources: resourceIds });
  }

  await scanner.enumerate();

  for (const control of controls) {
    if (control in args) {
      for (const item of scanner.inventory) {
        const procedure = service[control]?.procedure;
        assert(procedure, `unknown control ${control} procedure`);
        results.push(titanium(item, procedure));
      }
    }
  }

  for (const result of results) {
    console.log(JSON.stringify(result, null, 2));
  }
};
