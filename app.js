const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// const updateFunds = require('./modules/FantacyFond.js');
// const updateFintechFantacy = require('./modules/Yahoo.js');
const getNordnetFond = require('./modules/Shareville');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const sgMail = require('@sendgrid/mail');
dotenv.config({path: './.env'});
const scedule = require('node-schedule');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({extended: false})); // Endre til ture hvis bruk av cookie-parser
app.use(bodyParser.json())
app.use('/', express.static('./dist'));

const uri = process.env.API_KEY;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const PORT = process.env.PORT || 5050;
app.listen(PORT, e => e ? console.log(e) : console.log(`Server running on http://127.0.0.1:${PORT}`));

// Koble til Database
client.connect()
.then(() => console.log(`Client connected`))
.catch(() => console.log(`Mangler API kobling, vennligst spesifiser i egen .env fil.`));

// Koble til SendGrid Epost API.
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Henter data fra DN fantacy fond hvert 15-ene minutt
/** Dette skal med i produksjon når det er nytt Fantacy fond konkuranse.
 * Skal også lage en egen liknende funksjon for å hente data fra shareville. 
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
            // await updateFintechFantacy(client);
            console.log("Getting funds...");
    }
    catch(err){
        console.log(err);
    }
});
*/

// GET request for å sende fondsdata til client
app.get('/getFantacyFunds', async (req, res) => {
    try{
        const dataset = await (await client.db('Cluster0').collection('FintechFantacy').find({}).toArray()).sort(( a, b ) => a.date - b.date);
        res.send({status: "OK", dataset});
    }
    catch(err){
        res.send({status: "Klarte ikke hente dataset, vennligst oppdater siden."});
        console.log(err);
    }
});

// Kontakte oss via forum på nettsiden.
app.post('/KontaktFintechEnigma', async (req, res) => {
    const { navn, epost, tittel, melding } = req.body;
    try{
        const msg = {
            to: 'fintechenigma@gmail.com', // Change to your recipient
            from: 'fintechenigma@gmail.com', // Change to your verified sender
            subject: `Ny kontakt fra ${navn} | ${tittel}`,
            html: `
                <strong>${tittel}</strong>
                <p>${melding}</p>
                <br>
                <p>Sendt fra: ${navn}</p>
                <p>Epost: ${epost}</p>
            `,
          }
          sgMail.send(msg)
          .then(() => console.log("Mail Sendt"))
          .catch(err => {
            const error = new ErrorEvent(err);
            throw error;
          });
    
          res.send({status: "OK"});
    }
    catch(error){
        console.log(error);
        res.send({status: "Det oppsto en feil, vennligst oppdater siden og prøv på nytt."});
    }
})

app.get('/getNordnetFunds', async (req, res) => {
    try{
        const data = await getNordnetFond();
        const labels = data.map(e => e.date);
        const dataset = data.map(e => (100 - e.value)/e.value);
        res.send({status: "OK", data, labels, dataset});
    }
    catch(error){
        res.send({status: "Kunne ikke hente data, vennligst oppdater siden."})
    }
})