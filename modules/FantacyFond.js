// API for Fintech Enigma Liga:
// https://investor.dn.no/FantasyFunds/LeagueFundList?leagueId=971

const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');

const ID = 971;
const URL = `https://investor.dn.no/FantasyFunds/LeagueFundList?leagueId=${ID}`;
const FUND = "Fintech Enigma";

const DAYS = "Mandag,Tirsdag,Onsdag,Torsdag,Fredag".split(",");
const MONTHS = "Januar,Februar,Mars,April,Mai,Juni,Juli,August,September,Oktober,November,Desember".split(",");

/**
 * @param {MongoClient} client 
 * @returns {Promise<Boolean | PromiseRejectionEvent>}
 */
const updateFunds = async client => new Promise(async (resolve, reject) => {
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
    
        const get = await fetch(URL);
        const text = String(await get.text());
        const newTxt = text.split("");
        newTxt.shift();
        const fixedText = newTxt.join("");
    
        const data = JSON.parse(fixedText);
        const [ fundID ] = data.result.funds.find(fund => fund.includes(FUND));

        console.log(`Henter data fra fond:${fundID}`);
    
        const returnNow = data.result.ress[fundID];

        await client.db('Cluster0').collection('FantacyFondDates').insertOne({time: dateStr, price: returnNow, date: DATEObj});
        await resolve(true);
    }
    catch(err){
        reject(err);
    }
})

module.exports = updateFunds;