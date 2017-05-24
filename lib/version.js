const fs = require('fs');
const path = require('path');

let data;

try {
  let realpath = fs.realpathSync(process.argv[1]).split(path.sep);
  realpath.splice(-2);
  realpath.push('package.json');
  realpath = realpath.join(path.sep);
  const pkg = fs.readFileSync(realpath);
  data = JSON.parse(pkg.toString());
} catch (e) {
  console.error('Cannot read package.json, broken installation.');
  process.exit(1);
}

module.exports = data.version;
