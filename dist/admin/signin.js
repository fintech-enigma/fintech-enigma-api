/**
 * @param {string} ids 
 * @returns {HTMLElement[]}
 */
const $ = ids => ids.split(" ").map(id => document.getElementById(id));

const [ usernameInpt, passwordInpt, send ] = $("username password send");

send.addEventListener("click", async () => {
    const username = usernameInpt.value;
    const password = passwordInpt.value;

    const sendData = await fetch('/signinAdmin', {
        method: "POST",
            credentials: "include",
            body: JSON.stringify({username, password}),
            headers: {
                "Content-Type": "application/json"
            }
    });

    const res = await sendData.json();
    console.log(res);
});

