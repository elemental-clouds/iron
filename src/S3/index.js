module.exports.command = 'S3';

module.exports.describe = 'simple storage service';

module.exports.builder = function (yargs) {
  return yargs.commandDir('bucket').demandCommand(1);
};
