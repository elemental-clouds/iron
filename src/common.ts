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
import assert from 'assert';
import titanium from '@elemental-clouds/titanium';

export const commandDirOptions = {
  /** ts needed for ts-node dev time testing, js for production */
  extensions: ['js', 'ts'],
};

type Scanner = new (args: CredentialedClassArgs) => Common;

export interface IronArgs {
  json: boolean;
  profile?: AWSProfileName;
  regions: AWSRegionName[];
  resourceIds?: ResourceName[];
}

interface IronHandlerInterface extends IronArgs {
  Scanner: Scanner;
  service: Service;
  global?: boolean;
}

type Service = { [key: string]: ControlProcedure };

export class IronHandlerStatic {
  static getService(service: object) {
    return service as Service;
  }

  static setupBuilder(controls: object) {
    const service = IronHandler.getService(controls);
    const _controls = Object.keys(controls);

    const builder: CommandBuilder = {};

    for (const control of _controls) {
      const controlName = service[control]?.name;
      const description = service[control]?.description;

      assert(service[control], `unknown control ${control}`);
      assert(controlName, 'missing control name');
      assert(description, 'missing control description');

      builder[controlName] = {
        description,
      };
    }

    return builder;
  }
}

export class IronHandler extends IronHandlerStatic {
  Scanner: Scanner;
  args: IronHandlerInterface;
  controlNames: string[];
  global: boolean | undefined = false;
  inventory: CommonInventoryItem[] = [];
  profile?: AWSProfileName;
  regions: AWSRegionName[];
  resourceIds?: ResourceName[];
  controlResults: FinalControlValidationResult[] = [];
  service: Service;

  constructor(args: IronHandlerInterface) {
    super();
    this.Scanner = args.Scanner;
    this.args = args;
    this.controlNames = Object.keys(args.service);
    this.global = args.global;
    this.profile = args.profile;
    this.regions = args.regions;
    this.resourceIds = args.resourceIds;
    this.service = IronHandler.getService(args.service);
  }

  async scan() {
    for (const region of this.regions) {
      this.inventory.push(...(await this.getInventory(region)));
    }

    for (const controlName of this.controlNames) {
      if (controlName in this.args) {
        const control = this.service[controlName];
        assert(control, `unknown control ${controlName}`);
        for (const item of this.inventory) {
          this.controlResults.push(titanium(item, control));
        }
      }
    }

    return this;
  }

  displayResults() {
    if (this.controlNames.length === 0) {
      if (this.args.json) {
        for (const item of this.inventory) {
          console.log(JSON.stringify(item, null, 2));
        }
      } else {
        for (const item of this.inventory) {
          console.log(item.urn);
        }
      }
    } else {
      if (this.args.json) {
        for (const result of this.controlResults) {
          console.log(JSON.stringify(result, null, 2));
        }
      } else {
        for (const result of this.controlResults) {
          console.log(
            result.controlProcedure.name.padEnd(30),
            result.result.padEnd(15),
            result.item.resourceId
          );
        }
      }
    }
  }

  async getInventory(region: AWSRegionName) {
    const scanner = new this.Scanner({ region, profile: this.profile });

    if (this.resourceIds) {
      scanner.addResource({ resources: this.resourceIds });
    }

    await scanner.enumerate();

    return scanner.inventory as unknown as CommonInventoryItem[];
  }
}
