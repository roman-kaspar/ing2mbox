// Module for pocessing command line options

const argv = require('argv');
const version = require('./version');

argv.info('Usage: ing2mbox --in=transactions.pdf --out=transactions.csv --config=mapping.json');
// command line options
argv.option([
  {
    name: 'in',
    short: 'i',
    type: 'path',
    description: 'mandatory: PDF file to convert'
  },
  {
    name: 'out',
    short: 'o',
    type: 'path',
    description: 'mandatory: resulting CSV file'
  },
  {
    name: 'config',
    short: 'c',
    type: 'path',
    description: 'optional: JSON file with configuration'
  },

  {
    name: 'version',
    short: 'v',
    type: 'boolean',
    description: 'prints version and exits'
  },
  {
    name: 'help',
    short: 'h',
    type: 'boolean',
    description: 'prints help and exits'
  },

  {
    name: 'quiet',
    short: 'q',
    type: 'boolean',
    description: 'surpresses all output but errors'
  },
  {
    name: 'debug',
    short: 'd',
    type: 'boolean',
    description: 'more verbose output'
  }
]);

module.exports = (params) => {
  const args = argv.run(params);

  // take care of help / versions
  if (args.options.help) { argv.help(); process.exit(0); }
  if (args.options.version) { console.log(version); process.exit(0); }

  // make sure input / output paramteres are set
  if (!args.options.in || !args.options.out) {
    console.log('\nERROR: Missing mandatory parameter(s).');
    argv.help();
    process.exit(1);
  }

  return args;
};
