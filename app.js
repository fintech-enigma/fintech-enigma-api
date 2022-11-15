const express = require('express');
const cors = require('cors');
const DNscrape = require('./modules/DNscrape');
const dotenv = require('dotenv');

dotenv.config({path: './.env'});

const PORT = process.env.PORT || 5050;

const app = express();
app.use(cors());

app.use('/', express.static('./dist'));

app.listen(PORT, e => e ? console.log(e) : console.log(`Server running on http://127.0.0.1:${PORT}`));

app.get('/Fantacyfond_Historisk', async (req, res) => {
    try{
        const data = await DNscrape();  
        res.send({status: "OK", data});
    }
    catch(error){
        console.log(error);
        res.send({status: "Klarte ikke å hente grafen fra DN, vær snill å oppdater siden for å prøve på nytt!"});
    }
});
