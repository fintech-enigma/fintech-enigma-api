const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');

/**
 * @param {string} ticker 
 * @returns {Promise<{price: string} | PromiseRejectedResult>}
 */
const yahooAPI = async ticker => new Promise(async (resolve, reject) => {
    try{
        const URL = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}.OL?region=US&lang=en-US&includePrePost=false&interval=2m&useYfid=true&range=1d&corsDomain=finance.yahoo.com&.tsrc=finance`;
        const getData = await fetch(URL);
        const dataset = await getData.json();
        const price = dataset.chart.result[0].meta.regularMarketPrice;
        resolve({price});
    }
    catch(err){
        reject(err);
    }
});

const STARTPRICE = 106_088;
const CASH = STARTPRICE*0.06;

/**
 * @param {MongoClient} client 
 * @param {{currentValue: number, ticker: string, lastPrice: number}} stock 
 * @returns {Promise<Number | PromiseRejectedResult>}
 */
const updateFund = async ( client, stock ) => new Promise(async (resolve, reject) => {
    try{
        const priceNow = await yahooAPI(stock.ticker);
        const difference = priceNow / stock.lastPrice;
        const newValue = stock.currentValue*difference;
        await client.db('Cluster0').collection('Portfolio').updateMany(
            { ticker: stock.ticker },
            {$set: {currentValue: newValue, lastPrice: priceNow}},
            { upsert: true }
        );
        resolve(newValue);
    }
    catch (err) {
        reject(err);
    }
});

/**
 * @param {MongoClient} client 
 * @returns 
 */
const updateFintechFantacy = async client => new Promise(async (resolve, reject) => {
    try{
        const getDate = await fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=Europe/Oslo");
        const dateData = await getDate.json();
        const DATEObj = new Date(dateData.dateTime);
        const DAY = DATEObj.getDay();
        const DATE = DATEObj.getDate();
        const MONTH = DATEObj.getMonth();
        const YEAR = DATEObj.getFullYear();
        const HOUR = DATEObj.getHours();
    
        const minutes = 15;
        const ms = 1000 * 60 * minutes;
        
        var MINUTE = new Date(Math.round(DATEObj.getTime() / ms) * ms).getMinutes();
    
        if(MINUTE === 0) MINUTE = "00";
    
        const dateStr = `${DAYS[DAY-1]} ${DATE}. ${MONTHS[MONTH]} ${YEAR}, kl. ${HOUR}:${MINUTE}`;
    
        const currentProtfolio = await client.db('Cluster0').collection('Portfolio').find({}).toArray();
        var fundValue = CASH;
        await currentProtfolio.forEach(async stock => {
            fundValue += await updateFund(stock);
        });
    
        await client.db('Cluster0').collection('FintechFantacy').insertOne({
            time: dateStr,
            price: fundValue,
            date: DATEObj
        });
        resolve(true);
    }
    catch(err){
        reject(err);
    }
});

module.exports = updateFintechFantacy;