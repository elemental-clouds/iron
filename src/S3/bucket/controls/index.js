const neptunium = require('@elemental-clouds/neptunium');
// const osmium = require('@elemental-clouds/osmium');
const oxygen = require('@elemental-clouds/oxygen');
// const titanium = require('@elemental-clouds/titanium');

// const controls = Object.keys(oxygen.S3);

module.exports.command = 'controls';

module.exports.describe =
  'returns the status of AWS S3 buckets for a given control';

module.exports.builder = function (yargs) {
  const controls = Object.keys(oxygen.S3);
  for (const control of controls) {
    yargs
      .command(
        oxygen.S3[control].name,
        oxygen.S3[control].description,

        async function () {
          console.log({
            controls,
            'yargs.argv': yargs.argv,
            'yargs.argv.profile': yargs.argv.profile,
          });

          /** start here, it i don't think the region lookup is getting credentials */
          const regions = await new neptunium.Regions({
            region: yargs.argv.regions[0],
            profile: yargs.argv.profile,
            // global: true,
          }).getRegions();

          console.log(regions);

          // const scanner = await new osmium.S3.Buckets({
          //   profile: yargs.argv.profile,
          //   region: 'us-east-1',
          // }).enumerate();
        }
      )
      .demandCommand(1);
  }
};
