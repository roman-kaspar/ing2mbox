# ing2mbox

Small command line utility to convert ING Bank savings account transaction history (exported from their online banking,
as a PDF file) to a CSV file compatible with sMoneybox import. It uses a small configuration file to map (transaction)
variable symbols to (sMoneybox) categories.

## Installation

```
$ git clone git@github.com:roman-kaspar/ing2mbox.git
$ yarn
```

## Configuration

In case you want to map (bank account transaction) variable symbols to (sMoneybox) categories, create a simple JSON file
with the mappings and pass it as command line option.

JSON configuration file format:
```
{
  "mapping": {
    "1001": "Vacation",
    "1002": "Car",
    "1003": "House"
  }
}
```

## Usage

```
$ ing2mbox/bin/ing2mbox --in=transactions.pdf --out=transactions.csv --config=mapping.json

Options:
  -i | --in       mandatory: PDF file to convert
  -o | --out      mandatory: resulting CSV file
  -c | --config   optional:  JSON file with configuration

  -v | --version  optional:  prints version and exits
  -q | --quiet    optional:  surpresses all output
  -d | --debug    optional:  more verbose output
```

For convenience you can add `ing2mbox/bin` to your PATH. By default the utility is looking for `mapping.json` file
in current working directory. Unless `--quiet` option is provided, the utility prints out information about its activities.
With `--debug` you'll get more detailed reports. The exit code is 0 on success, 1 on failures.
