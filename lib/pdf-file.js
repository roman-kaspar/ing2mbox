const Parser = require('pdf2json');

const replaceAll = (str, what) => str.replace(what.find, what.replace);
const translateTable = [
  { find: /%20/g, replace: ' ' },
  { find: /%3A/g, replace: ':' },
  { find: /%2F/g, replace: '/' },
  { find: /%2C/g, replace: ',' },
  { find: /%40/g, replace: '@' },
  { find: /%C4%8C/g, replace: 'C' },
  { find: /%C3%A1/g, replace: 'a' },
  { find: /%C3%AD/g, replace: 'i' },
  { find: /%C5%A1/g, replace: 's' },
  { find: /%C5%99/g, replace: 'r' },
  { find: /%C4%8D/g, replace: 'c' },
  { find: /%C5%AF/g, replace: 'u' },
  { find: /%C3%BA/g, replace: 'u' },
  { find: /%C3%BD/g, replace: 'y' },
  { find: /%C5%BE/g, replace: 'z' },
  { find: /%C5%88/g, replace: 'n' },
  { find: /%C3%A9/g, replace: 'e' },
  { find: /%C4%9B/g, replace: 'e' }
];
const translate = (str) => {
  translateTable.forEach(item => { str = replaceAll(str, item); });
  return str;
};

module.exports = (filename, callback) => {
  const parser = new Parser();
  parser.on('pdfParser_dataError', (err) => {
    console.error(`Cannot parse transactions file "${filename}"\n${err.data}`);
    process.exit(1);
  });
  parser.on('pdfParser_dataReady', (data) => {
    console.info('PDF file parsed successfully, collecting strings');
    const strings = [];
    data.formImage.Pages.forEach(page => {
      page.Texts.forEach(text => {
        text.R.forEach(run => strings.push(translate(run.T)));
      });
    });
    console.info(`Found ${strings.length} strings in PDF file`);
    callback(strings);
  });
  parser.loadPDF(filename);
};
