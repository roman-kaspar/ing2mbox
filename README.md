[![Dependency Status](https://img.shields.io/david/roman-kaspar/ing2mbox.svg)](https://david-dm.org/roman-kaspar/ing2mbox)
[![devDependency Status](https://img.shields.io/david/dev/roman-kaspar/ing2mbox.svg)](https://david-dm.org/roman-kaspar/ing2mbox?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/roman-kaspar/ing2mbox/badge.svg)](https://snyk.io/test/github/roman-kaspar/ing2mbox)

# ing2mbox

Small command line utility to convert ING Bank savings account transaction history (exported from their online banking,
as a PDF file) to a CSV file compatible with sMoneybox import. It uses a small configuration file to map (transaction)
variable symbols to (sMoneybox) categories. Currently it is tailored for Czech language in the ING Bank transaction
history, but can be easily modified to any language (ping me if you are interested).

## Installation

```
$ git clone git@github.com:roman-kaspar/ing2mbox.git
$ cd ing2mbox
$ npm i
$ npm test  # optional to see everything is fine
```

## Configuration

In case you want to map (bank account transaction) variable symbols to (sMoneybox) categories, create a simple JSON file
with the mapping and pass it as `--config` command line option (or store it as `mapping.json` file in current directory
from where you are running the conversion utility).

Besides the individual symbols to map, there are some special keys in mapping object you can provide:
* `interest`: category where the savings account interests will be added to,
* `empty`: in case the variable symbol for given transaction was not set, this category will be used,
* `default`: in case there was no specific mapping found (individual symbol, `interest`, `empty`) this category will be used

In case `default` mapping is not used and there are any transactions that cannot be mapped, you'll receive a warning
and the sMoneybox category will be left empty.

JSON configuration file format / example:
```
{
  "mapping": {
    "1234": "Vacation",
    "5678": "Car",
    "9012": "House",
    "interest": "House"
  }
}
```

## Usage

```
$ ing2mbox/bin/ing2mbox --in=transactions.pdf --out=transactions.csv --config=mapping.json

Parameters:
  -i | --in       mandatory: PDF file to convert
  -o | --out      mandatory: resulting CSV file
  -c | --config   optional:  JSON file with configuration

Options:
  -v | --version  prints version and exits
  -h | --help     prints help and exits

  -q | --quiet    surpresses all output but errors
  -d | --debug    more verbose output
```

For convenience you can add `ing2mbox/bin` to your PATH. By default the utility is looking for `mapping.json` file
in current working directory. Unless `--quiet` option is provided, the utility prints out information about its activities.
With `--debug` you'll get more detailed reports. The exit code is 0 on success, 1 on failures.

## MIT License

Copyright (c) 2017, 2018 Roman Kaspar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
