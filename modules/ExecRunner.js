const { exec } = require('child_process');

/**
 * @param {string} file 
 * @param {string[]} args 
 * @returns {Promise<string>}
 */
const ExecRunner = (file, args = []) => new Promise((resolve, reject) => {
    try{

        const promt = `python3 ./python/${file}.py ${args.filter(e => e !== undefined).join(" ")}`;

        exec(promt, (error, stdout, stderr) => {
            if (error) reject(error);
            resolve(stdout);
            return;
            
        })
    }
    catch(error){
        reject(error);
        return;
    }
});

module.exports = ExecRunner;