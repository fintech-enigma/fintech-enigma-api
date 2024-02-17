const { readFileSync, writeFileSync } = require('fs');

const tickers = readFileSync('./Euronext_Equities_2024-01-29.csv', 'utf-8').split("\n").map(e => e.split(";"))
.slice(4).map(e => e[2]);

writeFileSync('norsketickers.json', JSON.stringify(tickers, null, 2));