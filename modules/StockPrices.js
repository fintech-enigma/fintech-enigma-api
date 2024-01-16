const fetch = require('node-fetch');

/**
 * @param {String} portefoljeData 
 * @returns {Promise<{_id, aksje, tickerName, kostpris, andel, antall_aksjer, dato, PriceToday}[]>}
 */
const UpdatePortefolje = async (portefoljeData) => {
    const nyPortefoljeData = await Promise.all(portefoljeData.map(async (stock, i) => {
        const getPriceToday = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stock.tickerName}.OL?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance`);
        const resPriceToday = await getPriceToday.json();
        if (resPriceToday.chart.result) {
            stock["PriceToday"] = resPriceToday.chart.result[0].meta.chartPreviousClose;
        }
        return stock;
    }));
    return nyPortefoljeData;
};

module.exports = UpdatePortefolje;