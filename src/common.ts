import {
  AWSProfileName,
  AWSRegionName,
  CommonInventoryItem,
  ControlProcedure,
  CredentialedClassArgs,
  FinalControlValidationResult,
  ResourceName,
} from '@elemental-clouds/hydrogen';

import { CommandBuilder } from 'yargs';
import { Common } from '@elemental-clouds/osmium/lib/Common';
import { S3 as Service } from '@elemental-clouds/oxygen';
import assert from 'assert';
import titanium from '@elemental-clouds/titanium';

export const commandDirOptions = {
  /** ts needed for ts-node dev time testing, js for production */
  extensions: ['js', 'ts'],
};

export interface IronArgs {
  regions: AWSRegionName[];
  profile?: AWSProfileName;
  resourceIds?: ResourceName[];
}

interface IronHandlerInterface extends IronArgs {
  Scanner: new (args: CredentialedClassArgs) => Common;
}

export class IronHandler {
  args: IronHandlerInterface;
  regions?: AWSRegionName[];
  profile?: AWSProfileName;
  resourceIds?: ResourceName[];
  results: FinalControlValidationResult[] = [];

  static getService(service: object) {
    return service as { [key: string]: ControlProcedure };
  }

  static getServiceControls(service: object) {
    return Object.keys(service);
  }

  static setupBuilder() {
    const service = IronHandler.getService(Service);
    const controls = IronHandler.getServiceControls(Service);

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

  constructor(args: IronHandlerInterface) {
    this.args = args;
    this.regions = args.regions;
    this.profile = args.profile;
    this.resourceIds = args.resourceIds;
  }

  getFirstRegionInArgs(regions: AWSRegionName[] | undefined) {
    assert(Array.isArray(regions));
    assert(regions.length === 1);

    const region = regions[0];

    assert(region, 'unable to determine region');
    return region;
  }

  async getInventory() {
    const { regions, profile, resourceIds, Scanner } = this.args;
    const region = this.getFirstRegionInArgs(regions);

    const scanner = new Scanner({ region, profile });

    if (resourceIds) {
      scanner.addResource({ resources: resourceIds });
    }

    await scanner.enumerate();

    return scanner.inventory as unknown as CommonInventoryItem[];
  }

  async getControlResults() {
    const controls = IronHandler.getServiceControls(Service);
    const service = IronHandler.getService(Service);

    for (const control of controls) {
      if (control in this.args) {
        for (const item of await this.getInventory()) {
          const procedure = service[control]?.procedure;
          assert(procedure, `unknown control ${control} procedure`);
          this.results.push(
            titanium(item, procedure) as unknown as FinalControlValidationResult
          );
        }
      }
    }

    for (const result of this.results) {
      console.log(JSON.stringify(result, null, 2));
    }
  }
}
