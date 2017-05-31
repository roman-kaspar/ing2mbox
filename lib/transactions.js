// machine states
const S_OUT = 0;
const S_IN = 1;

// event types
const T_START = 0;
const T_INTEREST = 1;
const T_DATE = 2;
const T_AMOUNT = 3;
const T_SYMBOL = 4;
const T_FAILED = 5;

// transaction types
const TT_NORMAL = 1;
const TT_INTEREST = 2;
const TT_FAILED = 3;

//
const YES = { ok: true };
const NO = { ok: false };

const logPrefix = 'PDF transaction module';

const pad = (what, len = 2, c = '0') => {
  let res = '' + what;
  while (res.length < len) { res = c + res; }
  return res;
};

const isStart = (string) => {
  return (string === 'Provedena') ? YES : NO;
};

const isInterest = (string) => {
  return (string === 'Kreditni urok') ? YES : NO;
};

const isFailed = (string) => {
  return (string === 'Neprovedena') ? YES : NO;
};

const rxDate = /^(\d+). (\d+). (\d{4})$/;
const isDate = (string) => {
  const arr = rxDate.exec(string);
  return (arr === null) ? NO : {
    ok: true,
    text: `${arr[3]}-${pad(arr[2])}-${pad(arr[1])}`
  };
};

const rxAmount = /^(-?)([\d ]+),(\d{2}) Kc$/;
const rxBlank = / /g;
const isAmount = (string) => {
  const arr = rxAmount.exec(string);
  return (arr === null) ? NO : {
    ok: true,
    text: `${arr[1]}${arr[2].replace(rxBlank, '')}.${arr[3]}`
  };
};

const rxSymbol = /^VS: (\d*), KS: \d*, SS: ?\d*$/;
const isSymbol = (string) => {
  const arr = rxSymbol.exec(string);
  return (arr === null) ? NO : {
    ok: true,
    text: arr[1]
  };
}

const assertState = (act, exp) => {
  if (act !== exp) {
    console.error(`${logPrefix}: state assertion error!`);
    process.exit(1);
  }
};

const reducer = (context, type, text) => {
  switch (type) {
    case T_START:
      assertState(context.state, S_OUT);
      context.state = S_IN;
      context.current = {};
      break;

    case T_FAILED:
      assertState(context.state, S_OUT);
      context.state = S_IN;
      context.current.type = TT_FAILED;
      break;

    case T_INTEREST:
      assertState(context.state, S_IN);
      if (context.current.tType) {
        console.error(`${logPrefix}: type already set!`);
        process.exit(1);
      }
      context.current.type = TT_INTEREST;
      break;

    case T_DATE:
      // ignore dates outside transactions
      if (context.state === S_IN) {
        if (context.current.date) {
          console.error(`${logPrefix}: date already set!`);
          process.exit(1);
        }
        context.current.date = text;
      }
      break;

    case T_AMOUNT:
      // ignore amounts outside transactions
      if (context.state === S_IN) {
        if (context.current.amount) {
          console.error(`${logPrefix}: amount already set!`);
          process.exit(1);
        }
        context.current.amount = text;
        // transaction done?
        if (context.current.type === TT_INTEREST) {
          if (!context.current.date) {
            console.error(`${logPrefix}: interest transaction without date!`);
            process.exit(1);
          }
          if (!context.current.type !== TT_FAILED) {
            context.found.push({
              date: context.current.date,
              amount: context.current.amount,
              symbol: 'interest'
            });
          }
          context.state = S_OUT;
          context.current = {};
        }
      }
      break;

    case T_SYMBOL:
      assertState(context.state, S_IN);
      if (context.current.type === TT_INTEREST) {
        console.error(`${logPrefix}: symbol detected for interest transaction!`);
        process.exit(1);
      }
      if (!context.current.date) {
        console.error(`${logPrefix}: transaction without date!`);
        process.exit(1);
      }
      if (!context.current.amount) {
        console.error(`${logPrefix}: transaction without amount!`);
        process.exit(1);
      }
      context.found.push({
        date: context.current.date,
        amount: context.current.amount,
        symbol: text
      });
      context.state = S_OUT;
      context.current = {};
      break;

    default:
      console.error(`${logPrefix}: unhandled event type (${type})!`);
      process.exit(1);
  }
};

const events = [
  { test: isStart, type: T_START },
  { test: isInterest, type: T_INTEREST },
  { test: isFailed, type: T_FAILED },
  { test: isDate, type: T_DATE },
  { test: isAmount, type: T_AMOUNT },
  { test: isSymbol, type: T_SYMBOL }
];

module.exports.get = (strings) => {
  const context = {
    found: [],
    current: {},
    state: S_OUT
  };
  let skipTest, res;
  strings.forEach(str => {
    skipTest = false;
    events.forEach(ev => {
      if (skipTest) { return; }
      res = ev.test(str);
      if (res.ok) {
        skipText = true;
        reducer(context, ev.type, res.text);
      }
    });
  });
  console.info(`Compiled ${context.found.length} transactions`);
  let s = 'List of transactions:';
  context.found.forEach((tr, idx) => s = s + `\n#${idx+1}: ${JSON.stringify(tr)}`);
  console.log(s);

  return context.found;
};

const incrStats = (stats, symbol) => {
  if (!stats[symbol]) { stats[symbol] = 0; }
  stats[symbol]++;
};

module.exports.translate = (transactions, mapping) => {
  console.info('Translating symbols into categories using config mapping');
  const stats = {};
  transactions.forEach((tr) => {
    if (tr.symbol.length) {
      // real symbol string or "interest"  >>>  default  >>>  not-set
      if (typeof mapping[tr.symbol] === 'string') {
        tr.category = mapping[tr.symbol];
        incrStats(stats, tr.symbol);
      } else if (typeof mapping.default === 'string') {
        tr.category = mapping.default;
        incrStats(stats, 'default');
      } else {
        tr.category = '';
        incrStats(stats, 'not-set');
      }
    } else {
      // empty  >>>  default  >>>  not-set
      if (typeof mapping.empty === 'string') {
        tr.category = mapping.empty;
        incrStats(stats, 'empty');
      } else if (typeof mapping.default === 'string') {
        tr.category = mapping.default;
        incrStats(stats, 'default');
      } else {
        tr.category = '';
        incrStats(stats, 'not-set');
      }
    }
  });
  if (stats['not-set']) { console.warn(`Proper mapping not found in ${stats['not-set']} case(s)!`); }
  let str = 'Category frequencies:';
  Object.keys(stats).forEach(key => str = str + `\n${key}: ${stats[key]}`);
  console.log(str);
};
