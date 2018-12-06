const Parser = require('pdf2json');

const replaceAll = (str, what) => str.replace(what.find, what.replace);
const translateTable = [
  { find: /%20/g, replace: ' ' },
  { find: /%2C/g, replace: ',' },
  { find: /%2F/g, replace: '/' },
  { find: /%3A/g, replace: ':' },
  { find: /%40/g, replace: '@' },
  { find: /%C2%A0/g, replace: '' },
  { find: /%C3%81/g, replace: 'A' },
  { find: /%C3%9A/g, replace: 'U' },
  { find: /%C3%A1/g, replace: 'a' },
  { find: /%C3%AD/g, replace: 'i' },
  { find: /%C3%BA/g, replace: 'u' },
  { find: /%C3%BD/g, replace: 'y' },
  { find: /%C4%8C/g, replace: 'C' },
  { find: /%C4%9B/g, replace: 'e' },
  { find: /%C4%8D/g, replace: 'c' },
  { find: /%C5%88/g, replace: 'n' },
  { find: /%C5%99/g, replace: 'r' },
  { find: /%C5%A0/g, replace: 'S' },
  { find: /%C5%A1/g, replace: 's' },
  { find: /%C3%A9/g, replace: 'e' },
  { find: /%C5%AF/g, replace: 'u' },
  { find: /%C5%BE/g, replace: 'z' }
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
    let total = 0;
    data.formImage.Pages.forEach(page => {
      const pageStrings = [];
      page.Texts.forEach(text => {
        const obj = {
          x: text.x,
          y: text.y,
          w: text.w
        };
        text.R.forEach(run => pageStrings.push({
          ...obj,
          text: translate(run.T)
        }));
      });
      strings.push(pageStrings);
      total += pageStrings.length;
    });
    console.info(`Found ${total} strings in PDF file`);
    callback(strings);
  });
  parser.loadPDF(filename);
};
