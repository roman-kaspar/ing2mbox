const findY = (strings, y) => {
  const res = [];
  strings.forEach((item) => {
    if (((item.text !== ' Kc') && Math.abs(item.y - y) < 0.3)) { res.push(item); }
  });
  return res;
};

const createTx = (data) => {
  const limits = [
    { key: 'date', xmin: 2.2, xmax: 3.2 },
    { key: 'symbol', xmin: 16.2, xmax: 18.5 },
    { key: 'amount', xmin: 26.4, xmax: 29.8 }
  ];
  const res = {};
  data.forEach((item) => {
    limits.forEach((limit) => {
      if ((limit.xmin < item.x) && (limit.xmax > item.x)) { res[limit.key] = item.text; }
    });
  });
  return res;
};

const translateType = {
  'Odchozi uhrada': 'out',
  'Prichozi uhrada': 'in',
  'Kreditni urok': 'cred'
};
const translateTypeArr = Object.keys(translateType);

const zero = (str) => ((str && (str.length < 2)) ? `0${str}` : str);

const formatDate = (str) => {
  if (!str) { return str; }
  const arr = str.split('.');
  return `${arr[2]}-${zero(arr[1])}-${zero(arr[0])}`;
};

const amountRx = /,/g;
const formatAmount = (str) => (str.replace(amountRx, '.'));

const processPage = (strings) => {
  const txs = [];
  strings.forEach((item) => {
    if (translateTypeArr.includes(item.text)) {
      const tx = createTx(findY(strings, item.y));
      tx.type = translateType[item.text];
      if (tx.type === 'cred') { tx.symbol = 'interest'; }
      tx.date = formatDate(tx.date);
      tx.amount = formatAmount(tx.amount);
      txs.push(tx);
    }
  });
  return txs;
};

module.exports.get = (pages) => {
  let txs = [];
  pages.forEach((page) => {
    txs = txs.concat(processPage(page));
  });
  console.info(`Compiled ${txs.length} transactions`);
  let s = 'List of transactions:';
  txs.forEach((tr, idx) => { s = s + `\n#${idx + 1}: ${JSON.stringify(tr)}`; });
  console.log(s);
  return txs;
};

const incrStats = (stats, symbol) => {
  if (!stats[symbol]) { stats[symbol] = 0; }
  stats[symbol]++;
};

module.exports.translate = (transactions, mapping) => {
  console.info('Translating symbols into categories using config mapping');
  const stats = {};
  transactions.forEach((tr) => {
    if (tr.symbol) {
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
  Object.keys(stats).forEach(key => { str = str + `\n${key}: ${stats[key]}`; });
  console.log(str);
};
