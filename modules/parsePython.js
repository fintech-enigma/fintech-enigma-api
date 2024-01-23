const ExecRunner = require('./ExecRunner');

/**
 * @param {string} str 
 * @returns {Promise<{x: number[], y: number[]}>}
 */
const pasrePythonGraph = str => new Promise((resolve, reject) => {
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
})

module.exports = { pasrePythonGraph };