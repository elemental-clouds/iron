module.exports.command = 'bucket';

module.exports.describe = 'inventory and controls';

module.exports.builder = function (yargs) {
  return yargs.commandDir('inventory').commandDir('controls').demandCommand(1);
};
