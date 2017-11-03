const fs = require('fs');

module.exports = (filename) => {
  const failOnMissing = (filename !== undefined);
  filename = filename || './mapping.json';
  let data;
  try {
    console.log(`Reading configuration file "${filename}"`);
    data = fs.readFileSync(filename);
  } catch (e) {
    if (failOnMissing) {
      console.error(`Cannot read configuration file "${filename}"`);
      process.exit(1);
    } else {
      console.warn(`Configuration file "${filename}" not found`);
      return { mapping: {} };
    }
  }
  try {
    console.log(`Parsing JSON data from configuration file`);
    const json = JSON.parse(data);
    return {
      mapping: json.mapping || {}
    };
  }  catch (e) {
    console.error(`Cannot parse JSON data from configuration file "${filename}"`);
    process.exit(1);
  }
};
