const fetch = require('node-fetch');

const URL = `https://www.shareville.no/api/v1/portfolios/610411/performance`;

const getNordenetFond = async () => new Promise( async (resolve, reject) => {
    try{
        const getData = await fetch(URL);
        const allData = await getData.json();
        const labels = Object.keys(allData);
        var data = allData[labels[0]];
    
        for(let i=0; i<labels.length; ++i){
            if(data.length < allData[labels[i]].length){
                data = allData[labels[i]];
            }
        }
        resolve(data);
        return
    }
    catch(error){
        reject(error);
        return;
    }
})

module.exports = getNordenetFond;