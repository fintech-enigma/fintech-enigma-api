const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { readFileSync } = require('fs');
const getNordnetFond = require('./modules/Shareville');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');
const sgMail = require('@sendgrid/mail');
dotenv.config({path: './.env'});
const scedule = require('node-schedule');
const bcrypt = require('bcrypt');

const loginHTML = require('./modules/loginhtml');
const adminHTML = readFileSync('./modules/adminHTML.html', 'utf8');

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false})); // Endre til ture hvis bruk av cookie-parser
app.use(bodyParser.json());
app.use(session({secret: process.env.SECRET, saveUninitialized: false, resave: false}));
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

app.get('/signin/key/:key', (req, res) => {
    const key = req.params.key;
    if(key === process.env.ADMIN_KEY){
        res.send(loginHTML);
    }
    else{
        res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley');
    }
});

app.post('/signinAdmin', async (req, res) => {
    const { username, password } = req.body;
    try{
        if(username !== process.env.ADMIN_UNAME){
            res.send({status: "User doesn't exist"});
            return;
        }

        const pwdOK = await bcrypt.compare(password, process.env.ADMIN_PWD);


        if(await pwdOK){
            req.session.admin_user = {
                username, key: process.env.ADMIN_KEY
            }
            res.redirect('/adminpage');
        }
        else{
            res.redirect('/');
        }
    }catch(error){
        res.send({status: "En feil har oppstått"})
    }
});

app.get('/adminpage', (req, res) => {
    if(!req.session.admin_user){
        res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley');
        return;
    }
    else if (req.session.admin_user.username === process.env.ADMIN_UNAME && req.session.admin_user.key === process.env.ADMIN_KEY){
        res.send(adminHTML);
        return;
    }

})

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
          .then(() => console.log("Mail sendt to fintech enigma"))
          .catch(err => {
            const error = new ErrorEvent(err);
            throw error;
          });

          const senderMsg = {
            to: epost, // Change to your recipient
            from: 'fintechenigma@gmail.com', // Change to your verified sender
            subject: `Takk for at du tok kontakt`,
            html: `
                <strong>Hei ${navn}</strong>
                <p>Takk for at du tok kontakt med Fintech Enigma. Vi svarer deg så snart vi kan.</p>
                <br>
                <p>Med vennlig hilsen</p>
                <p>Styret i Fintech Enigma</p>
                <p> <a href="https://www.fintechenigma.no/" >fintechenigma.no</a> </p>
            `,
          }
          sgMail.send(senderMsg)
          .then(() => console.log("Mail sendt to sender"))
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
        const dataset = data.map(e => +(((e.value - 100)/100) * 100).toFixed(2));
        res.send({status: "OK", data, labels, dataset});
    }
    catch(error){
        res.send({status: "Kunne ikke hente data, vennligst oppdater siden."})
    }
})