const logger = require('./logger');
const cmdline = require('./cmdline');
const version = require('./version');
const cfgFile = require('./cfg-file');
const pdfFile = require('./pdf-file');
const transactions = require('./transactions');
const csvFile = require('./csv-file');

const log = (data) => {
  console.log(data);
}

class Client {
  run(args) {
    const options = cmdline(args.slice(2)).options;
    logger.install();
    if (options.quiet) { logger.level('error'); }
    if (options.debug) { logger.level('log'); }
    console.info(`ing2mbox (version ${version})`);
    console.log(`Command line arguments:\n${JSON.stringify(options, null, 4)}`);
    const config = cfgFile(options.config);
    console.log(`Mappings from configuration file:\n${JSON.stringify(config.mapping, null, 4)}`);
    const entries = pdfFile(options.in, strings => {
      const found = transactions.get(strings);
      if (!found.length) {
        console.error('No transaction found!');
        process.exit(1);
      }
      transactions.translate(found, config.mapping);
      csvFile(found, options.out);
      console.info('Success!');
    });
  }
};

module.exports.Client = Client;
