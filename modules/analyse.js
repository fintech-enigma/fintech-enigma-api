const ExecRunner = require('./ExecRunner');

/**
 * @param {string} str 
 * @param {string} time_slot
 * @returns {Promise<{x: number[], y: number[]}>}
 */
const pasrePythonGraph = (str, time_slot) => new Promise((resolve, reject) => {
    try{
        
        const cleanStr = str.replace(/\[.*?\]\s*\d+\s*of\s*\d+\s*(completed|\d+\s*of\s*\d+)/i, "");
        const dates = cleanStr.match( /\s*(\d{4}-\d{2}-\d{2})/gm).map(e => new Date(e));
        const values = cleanStr.match(/-?\d+\.\d+/gm).map(e => +e);
        resolve({
            x: dates,
            y: values
        });
    }
    catch(error){
        reject(error);
    }
});

/**
 * @param {string[]} norsketickers 
 * @param {string} ticker 
 * @returns {Promise<string>}
 */
const makeTicker = (norsketickers, ticker) => new Promise((resolve, reject) => {
    try{
        const rensetTicker = ticker.replace(/[^\w\s]+.*$/gm, '');
        if(ticker.endsWith(".OL") && norsketickers.includes(rensetTicker)){
            resolve(ticker);
            return;
        }
        else if(norsketickers.includes(rensetTicker)){
            resolve(rensetTicker + ".OL");
            return;
        }
        else{
            resolve(ticker);
            return;
        }
    }
    catch(error){
        reject(error);
        return;
    }
})

module.exports = { pasrePythonGraph, makeTicker };