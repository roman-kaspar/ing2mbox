const fs = require('fs');

module.exports = (transactions, filename) => {
  let str = '"Date","Category","Name","Description","Amount"\n';
  transactions.forEach(tr => str = str + `"${tr.date}","${tr.category}","","","${tr.amount}"\n`);
  console.info('Writing output CSV file');
  try {
    fs.writeFileSync(filename, str);
  } catch (e) {
    console.error(`Cannot write output file "${filename}"`);
    process.exit(1);
  }
};
