// API for Fintech Enigma Liga:
// https://investor.dn.no/FantasyFunds/LeagueFundList?leagueId=971

const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');

const ID = 1091;
const URL = `https://dnpulse-fantasy6-prod.azurewebsites.net/FantasyFunds/LeagueFundList?leagueId=${ID}`;

const DAYS = "Søndag,Mandag,Tirsdag,Onsdag,Torsdag,Fredag,Lørdag".split(",");
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

        const dateStr = `${DAYS[DAY]} ${DATE}. ${MONTHS[MONTH]} ${YEAR}, kl. ${HOUR}:${MINUTE}`;
    
        const get = await fetch(URL);
        const data = (await get.json()).result;

        const dataset = [];
        for(let i=0; i<data.funds.length; ++i){
            const f = data.funds[i];
            dataset.push({
                time: dateStr, 
                price: f[3], 
                date: DATEObj,
                name: f[4]
            })
        }

        console.log(`Henter data fra Liga:${ID}`);

        await client.db('Cluster0').collection('ITOK_fantacy_konk23').insertMany(dataset);
        await resolve(true);
    }
    catch(err){
        reject(err);
    }
});

module.exports = updateFunds;