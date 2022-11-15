const ws = require('puppeteer');
const { readFileSync, writeFileSync } = require('fs');

const URL = "https://investor.dn.no/?fbclid=IwAR0dqOi6a42ISJbc_-woEiF-gvcyywLtJRa9IhODHMlWche-__QO_uQG1HU#!/Fantasyfond/Profil/100593";

// CSS for å vise grafen
const CSS = `
element.style {
    text-anchor: middle;
}
.xaxis text {
    fill: #999;
    font-size: 12px;
}
.axis text {
    fill: #666;
    font-size: 12px;
}
svg text {
    font-size: 18px;
    font-family: "Guardian Sans Cond Web","Helvetica Neue",Helvetica,Arial,sans-serif;
    font-weight: 400;
    cursor: default;
}

.dnchart-yaxis text {
    fill: #999;
    font-size: 12px;
    transform: translateX(5px);
}
svg text {
    font-size: 18px;
    font-family: "Guardian Sans Cond Web","Helvetica Neue",Helvetica,Arial,sans-serif;
    font-weight: 400;
    cursor: default;
}


g[Attributes Style] {
    transform: translate(0, 63.5714);
}

.dnff-group-container svg {
    fill: #5babda;
}
svg {
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
}
.dnff-group-container .dnff-dark-section {
    background-color: #222;
    color: #fff;
    padding: 30px 0;
}
.dnff-group-container {
    font-family: "Guardian Sans","Helvetica Neue","FontAwesome",Helvetica,Arial,sans-serif;
    font-size: 17px;
    background-color: #f0f0f0;
}
svg{
    position: relative;
    left: 2rem;
    fill: none; 
}
.tchart-closeline {
    fill: none;
    stroke: #f2f2f2;
    stroke-width: 1.5;
}
`;

/**
 * @return {Promise<{svg: string, CSS: string}>}
 */
const DNscrape = async () => new Promise(async (resolve, reject) => {
    const browser = await ws.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"],
    });
    const page = await browser.newPage();
    try{    
        await page.goto(URL, {
            waitUntil: "networkidle2",
        });
        
        await page.waitForTimeout(2000);
        
        await page.waitForXPath(`/html/body/div[3]/div[1]/div/div[2]/div/div/div[2]/div[1]/div[2]/button[2]`, {
            visible: true,
        });
        
        // Klikker på `HISORISK` knappen for å vise hele historikken
        const [ HISTORSK ] = await page.$x(`/html/body/div[3]/div[1]/div/div[2]/div/div/div[2]/div[1]/div[2]/button[2]`);
        if(HISTORSK) 
            await HISTORSK.click();
    
        try{
            const svg = await page.evaluate(() => document.querySelector(`#dninvestor-content > div:nth-child(1) > div > div:nth-child(2) > div > div > div.graph-group > div.dnff-semidark-card.fund-graph > div.ng-scope > div > fantasy-fund-chart > div > svg`).outerHTML);

            // Må få tak i en DB s.a vi kan skrive nåværende graf til DB. 
            // Kan da i tilfelle av en error hente ut den og vise. 
            // writeFileSync("./backupgraph.txt", svg);
            
            const data = { svg, CSS };
            
            resolve( data );
        }
        catch{
            // Backupfil dersom vi ikke klarer å hente grafen fra DN
            // Dette blir da en eldre verskjon av grafen. 
            const backup = readFileSync('./backupgraph.txt', 'utf-8');
            const data = { svg: backup, CSS };

            resolve( data );
        }

        browser.close();

        return;
    }

    catch(error){
        browser.close();
        reject(error);
        return;
    }
});

module.exports = DNscrape;