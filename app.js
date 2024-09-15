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
const fetch = require('node-fetch');
const ExecRunner = require('./modules/ExecRunner');
const UpdatePortefolje = require('./modules/StockPrices');
const { pasrePythonGraph, makeTicker } = require('./modules/analyse');

const loginHTML = require('./modules/loginhtml');
const updateFunds = require('./modules/FantacyFond');
const adminHTML = readFileSync('./modules/adminHTML.html', 'utf8');
const blogHTML = readFileSync('./modules/blogHTML.html', 'utf8');
const norsketickers = require('./modules/norsketickers.json');

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true})); // Endre til ture hvis bruk av cookie-parser
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

// Henter data fra DN fantacy fond hvert 30-ene minutt
const rule = new scedule.RecurrenceRule();
rule.minute = new scedule.Range(0,59, 30);
const job = scedule.scheduleJob(rule, async () => {
    try{
        // Siden server kan være plassert i annen tidssone bruker vi dato API.
        const getDate = await fetch("https://www.timeapi.io/api/Time/current/zone?timeZone=Europe/Oslo");
        const dateData = await getDate.json();
        const DATE = new Date(dateData.dateTime);
        const HOUR = DATE.getHours();
        const DAY = DATE.getDay();
        console.log(DAY);
        console.log(DATE);
        // Sjekker at det er en ukedag (man-fre) mellom kl. 09:00 og 17:00. 
        if(HOUR >= 9 && HOUR <= 16 && DAY >= 1 && DAY <= 5){
            // I produksjon tas med!
            await updateFunds(client, process.env.MEMBERS.split(","));
            console.log("Getting funds...");
        }
    }
    catch(err){
        console.log(err);
    }
});



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

});

app.get('/newBlogpost', (req, res) => {
    if(!req.session.admin_user){
        res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley');
        return;
    }
    else if (req.session.admin_user.username === process.env.ADMIN_UNAME && req.session.admin_user.key === process.env.ADMIN_KEY){
        res.send(blogHTML);
        return;
    }
})

app.get('/getPortefolje', async (req, res) => {
    try {
        const portefoljeData = (await client.db('Cluster0').collection('Portefolje').find({}).toArray());
        // const FondetsVerdi = Number(process.env.INNSKUDD)*((await getNordnetFond()).pop().value)/100;
        const nyPortefoljeData = await UpdatePortefolje(portefoljeData);

        res.send({status: "OK", portefoljeData: nyPortefoljeData}) // , FondetsVerdi})
    }
    catch(err){
        res.send({status: "Klarte ikke hente dataset, vennligst oppdater siden."});
        console.log(err)
    }
});

app.post('/saveNewStock', async (req, res) => {
    try{
        if(!req.session.admin_user){
            res.send({status: "Du er ikke admin!"});
            return;
        }
        const { stockName, tickerName, buyPrice, quantity, buyDate } = req.body;
        const andel = buyPrice*quantity;

        console.log(stockName, tickerName, buyPrice, quantity, buyDate)
    
        await client.db('Cluster0').collection('Portefolje').insertOne({
            aksje: stockName,
            tickerName,
            kostpris: buyPrice,
            andel,
            antall_aksjer: quantity,
            dato: new Date(buyDate)
        })
        res.send({status: "OK"})
    }
    catch(err){
        res.send({status: "Klarte ikke lagre aksjekjøp, vennligst oppdater siden."});
        console.log(er)
    }
});

app.get('/delteStock/:stock', async (req, res) => {
    try{
        if(!req.session.admin_user){
            res.send({status: "Du er ikke admin!"});
            return;
        }
        const akjse = req.params.stock;

        await client.db('Cluster0').collection('Portefolje').deleteOne({aksje: akjse});
    
        res.send({status: "OK"});
    }
    catch(err){
        res.send({status: "Klarte ikke slette aksjekjøp, vennligst oppdater siden."});
        console.log(err);
    }
})


// GET request for å sende fondsdata til client
app.get('/getFantacyFunds', async (req, res) => {
    try{
        const dataset = await (await client.db('Cluster0').collection('Fintech_fantacy_konk24').find({}).toArray());
        const fundsDataset = {};
        for(let i=0; i<dataset.length; ++i){
            const data = dataset[i];
            if (fundsDataset[data.name]){
                fundsDataset[data.name].push(data);
            }
            else{
                fundsDataset[data.name] = [data];
            }
        }

        const keys = Object.keys(fundsDataset);

        for(const key of keys){
            fundsDataset[key] = fundsDataset[key].sort( (a, b) => b.date - a.date );
        }
        res.send({status: "OK", fundsDataset});
    }
    catch(err){
        res.send({status: "Klarte ikke hente dataset, vennligst oppdater siden."});
        console.log(err);
    }
});

app.get('/newSession', async (req, res) => {
    console.log("Ny besøkende!");
    res.send({status: "OK"})
})

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
});

// Kontakt fra Enigma sin side:
app.post('/EnigmaKontakt', async (req, res) => {
    const { tittel, melding } = req.body;
    try{
        const msg = {
            to: 'enigma.forening@gmail.com', // Change to your recipient
            from: 'fintechenigma@gmail.com', // Change to your verified sender
            subject: `Ny anonym melding | ${tittel}`,
            html: `
                <strong>${tittel}</strong>
                <p>${melding}</p>
                <br>
                <p>Sendt fra Anonym student</p>
            `,
          }
          sgMail.send(msg)
          .then(() => console.log("Anonym melding sendt!"))
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
});

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
});

app.post('/analyse', async (req, res) => {
    const { ticker, time_slot, index } = req.body;

    const exeFiles = "Norm, Vlt, VaR, Corr, Risk-Vlt".split(", ");

    const data = {};

    try{
        const sikkerTicker = await makeTicker(norsketickers, ticker);
        await Promise.all(exeFiles.map(async exeFile => {
                try{
                    const args = [ sikkerTicker, time_slot ];
                    if (exeFile === "Corr") args.push(index);
                    const res = (await ExecRunner(exeFile, args));
                    if (exeFile === "Vlt" || exeFile === "Norm"){
                        const xy = await pasrePythonGraph(res, time_slot);
                        data[exeFile] = await xy;
                    }
                    else if(exeFile === "Corr"){
                        data[exeFile] = +res.replace(/\[.*?\]\s*\d+\s*of\s*\d+\s*(completed|\d+\s*of\s*\d+)/gm, "").replace(/[\r\t\n\v\f]/gm, '');
                    }
                    else if(exeFile === "VaR"){
                        const svg = res.match(/<svg(?:[^>]+)?>([\s\S]*?)<\/svg>/gm) ||  [`<h3>${time_slot} Value at risk: ${res.match(/<valueatrisk>([-\d.]+)<\/valueatrisk>/)[0]}</h3>`];
                        data[exeFile] = svg[0];
                    }
                    else if(exeFile === "Risk-Vlt"){
                        data[exeFile] = res.replace(/\[.*?\]\s*\d+\s*of\s*\d+\s*(completed|\d+\s*of\s*\d+)/gm, "");

                        const regex = /\{(?:\s*'(\w+)'\s*:\s*(-?\d+(\.\d+)?)\s*,?)+\}/gm;

                        const matches = data[exeFile].match(regex);

                        data[exeFile] = matches.map(match => {
                            const keyValuePairs = match.match(/'(\w+)'\s*:\s*(-?\d+(\.\d+)?)\s*/g);
                            const obj = {};
                            keyValuePairs.forEach(pair => {
                                const [key, value] = pair.split(':').map(s => s.trim().replace(/'/g, ''));
                                obj[key] = parseFloat(value);
                            });
                            return obj;
                        })[0];
                    }
                    
                    return {exeFile, data: res};
                }
                catch(err){
                    console.log(err);
                    console.log(exeFile);
                    if(exeFile === "Vlt" || exeFile === "Norm") data[exeFile] = {x: [], y: []};
                    else if(exeFile === "Risk-Vlt") data[exeFile] = { dev: 0, ret: 0 };
                    else if(exeFile === "VaR") data[exeFile] = "<h3>Kunne ikke hente Value at Risk</h3>";
                    else if(exeFile === "Corr") data[exeFile] = 0;
                }
        }));
    }
    catch(error){
        res.send({status: "Noe gikk galt, vennligst oppdater siden. Ta kontakt om feilen vedvarer."});
        console.log(error);
        return;
    };


    res.send({status: "OK", data});
});
