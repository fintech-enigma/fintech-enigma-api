/**
 * @param {string} ids 
 * @returns {HTMLElement[]}
 */
const $ = ids => ids.split(" ").map(id => document.getElementById(id));

const [ appDiv ] = $("app");

appDiv.innerHTML += `<h1>Du klarte det!</h1>`;