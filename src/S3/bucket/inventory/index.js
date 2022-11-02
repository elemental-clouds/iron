module.exports.command = 'inventory';
module.exports.describe = 'returns an inventory of AWS S3 buckets';

module.exports.handler = function (argv) {
  console.log('inventory', argv);
};
