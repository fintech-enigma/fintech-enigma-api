const express = require('express');
const cors = require('cors');
const updateFunds = require('./modules/FantacyFond.js')
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
dotenv.config({path: './.env'});
const scedule = require('node-schedule');

const app = express();
app.use(cors());
app.use('/', express.static('./dist'));

const PWD = process.env.PWD;
const uri = process.env.API_KEY.replace(/\<(.*?)\>/, PWD);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const PORT = process.env.PORT || 5050;
app.listen(PORT, e => e ? console.log(e) : console.log(`Server running on http://127.0.0.1:${PORT}`));

client.connect()
.then(() => console.log(`Client connected`))
.catch(() => console.log(`Mangler API kobling, vennligst spesifiser i egen .env fil.`));

// Henter data fra DN fantacy fond hvert 15-ene minutt
const rule = new scedule.RecurrenceRule();
rule.minute = new scedule.Range(0,59, 15);
const job = scedule.scheduleJob(rule, async () => {
    try{
        // Siden server kan være plassert i annen tidssone bruker vi dato API.
        const getDate = await fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=Europe/Oslo");
        const dateData = await getDate.json();
        const DATE = new Date(dateData.dateTime);
        const HOUR = DATE.getHours();
        const DAY = DATE.getDay();
        // Sjekker at det er en ukedag (man-fre) mellom kl. 09:00 og 17:00. 
        if(HOUR >= 9 && HOUR <= 16 && DAY >= 1 && DAY <= 5)
            // I produksjon tas med!
            // await updateFunds();
            console.log("Getting funds...");
    }
    catch(err){
        console.log(err);
    }
});

// GET request for å sende fondsdata til client
app.get('/getFantacyFunds', async (req, res) => {
    try{
        const dataset = await (await client.db('Cluster0').collection('FantacyFondDates').find({}).toArray()).sort(( a, b ) => a.date - b.date);
        res.send({status: "OK", dataset});
    }
    catch(err){
        res.send({status: "Klarte ikke hente dataset, vennligst oppdater siden."});
        console.log(err);
    }
});
