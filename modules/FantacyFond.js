// API for Fintech Enigma Liga:
// https://investor.dn.no/FantasyFunds/LeagueFundList?leagueId=971

const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');

const ID = 665;
// const URL = `https://dnpulse-fantasy6-prod.azurewebsites.net/FantasyFunds/LeagueFundList?leagueId=${ID}`;
const URL = `https://www.dn.no/investor/fantasy/liga/${ID}`;

const DAYS = "Søndag,Mandag,Tirsdag,Onsdag,Torsdag,Fredag,Lørdag".split(",");
const MONTHS = "Januar,Februar,Mars,April,Mai,Juni,Juli,August,September,Oktober,November,Desember".split(",");

/**
 * @param {MongoClient} client 
 * @param {string} members 
 * @returns {Promise<Boolean | PromiseRejectionEvent>}
 */
const updateFunds = async (client, members) => new Promise(async (resolve, reject) => {
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
        const data = (await get.text())
        const parsed = await data.split(`"Fintech Enigma Liga",`)[1].split(`"leagues",`)[0].split(",");
        const dataset = [];

        for(let i=0; i<parsed.length; i++){
            for(let j=0; j<members.length; j++){
                if (parsed[i] === `"${members[j]}"`){
                    dataset.push({
                    time: dateStr, 
                    price: Number(parsed[i+3]),
                    date: DATEObj,
                    name: members[j].replace(" ", "")
                    })
                    
                }
            }       
        }

        console.log(`Henter data fra Liga:${ID}`);

        await client.db('Cluster0').collection('Fintech_fantacy_konk24').insertMany(dataset);
        await resolve(true);
    }
    catch(err){
        reject(err);
    }
});

module.exports = updateFunds;