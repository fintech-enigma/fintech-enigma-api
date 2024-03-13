const fetch = require('node-fetch');
const { readFileSync } = require('fs');
const { makeTicker } = require('./analyse');
const norsketickers = JSON.parse(readFileSync('./modules/norsketickers.json'));

/**
 * @param {String} portefoljeData 
 * @returns {Promise<{_id, aksje, tickerName, kostpris, andel, antall_aksjer, dato, PriceToday}[]>}
 */
const UpdatePortefolje = async (portefoljeData) => {
    const nyPortefoljeData = await Promise.all(portefoljeData.map(async (stock, i) => {
        const sikkerTicker = await makeTicker(norsketickers, stock.tickerName);
        const getPriceToday = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sikkerTicker}?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance`);
        const resPriceToday = await getPriceToday.json();
        if (resPriceToday.chart.result) {
            stock["PriceToday"] = resPriceToday.chart.result[0].meta.chartPreviousClose;
        }
        return stock;
    }));
    return nyPortefoljeData;
};

module.exports = UpdatePortefolje;