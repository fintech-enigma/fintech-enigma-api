/**
 * @param {string} ids 
 * @returns {HTMLElement[]}
 */
const $ = ids => ids.split(" ").map(id => document.getElementById(id));

const [ appDiv, avkastH1 ] = $("app avkast");

const getPortefolje = async () => {
    const get = await fetch('/getPortefolje');
    const res = await get.json();
    avkastH1.innerHTML += `${res.FondetsVerdi}kr (${((res.FondetsVerdi/4000 -1)*100).toFixed(2)}%)`
    const parsed = [];
    res.portefoljeData.forEach(e => {
        parsed.push({
            stockName: e.aksje,
            buyPrice: e.kostpris,
            quantity: e.antall_aksjer,
            buyDate: e.dato
        })
    })
    return parsed;
}

const months = "Jan,Feb,Mars,Apr,Mai,Jun,Jul,Aug,Sep,Okt,Nov,Des".split(",");

document.addEventListener('DOMContentLoaded', async function () {
    const portefolje = await getPortefolje();

    // Stock data array to store added stocks
    let stocks = portefolje;
  
    // Function to render the stock table
    function renderStockTable() {
      const tableBody = document.getElementById('stockTableBody');
      tableBody.innerHTML = '';
  
      stocks.forEach((stock, index) => {
        const row = `<tr>
          <td>${stock.stockName}</td>
          <td>${stock.buyPrice}</td>
          <td>${stock.quantity}</td>
          <td>${(stock.buyPrice * stock.quantity).toFixed(2)}</td>
          <td> ${new Date(stock.buyDate).getDate()}. ${months[new Date(stock.buyDate).getMonth()]} ${new Date(stock.buyDate).getFullYear()}</td>
          <td><button class="btn btn-danger deleteStock" id="${stock.stockName}" data-index="${index}">Delete</button></td>
        </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
      });
    }
    renderStockTable();
  
    // Event listener for "Add Stock" button
    const addStockBtn = document.getElementById('addStockBtn');
    addStockBtn.addEventListener('click', function () {
      const addStockModal = document.getElementById('addStockModal');
      addStockModal.classList.add('show');
    });
  
    // Event listener for "Save" button in the add stock form
    const saveStockBtn = document.getElementById('saveStock');
    saveStockBtn.addEventListener('click', async function () {
      const stockName = document.getElementById('stockName').value;
      const buyPrice = parseFloat(document.getElementById('buyPrice').value);
      const quantity = parseInt(document.getElementById('quantity').value);
      const buyDate = document.getElementById('buyDate').value;
  
      if (stockName && !isNaN(buyPrice) && !isNaN(quantity) && buyDate) {
        const newStock = { stockName, buyPrice, quantity, buyDate };
        stocks.push(newStock);
        const sendNewStock = await fetch('/saveNewStock', {
            method: "POST",
                    credentials: "include",
                    body: JSON.stringify({ stockName, buyPrice, quantity, buyDate }),
                    headers: {
                        "Content-Type": "application/json"
                    }
        });
        const response = await sendNewStock.json();
        if (response.status !== "OK") alert(response.status);
        renderStockTable();
        const addStockModal = document.getElementById('addStockModal');
        addStockModal.classList.remove('show');
        // Clear the form inputs
        document.getElementById('addStockForm').reset();
      }
    });
  
    // Event listener for "Delete" buttons in the table
    const stockTableBody = document.getElementById('stockTableBody');
    stockTableBody.addEventListener('click', async function (event) {
      if (event.target.classList.contains('deleteStock')) {
        const index = event.target.getAttribute('data-index');
        const delAksje = await fetch(`/delteStock/${event.target.id}`);
        const resDelAksje = await delAksje.json();
        if (resDelAksje.status !== "OK") alert(resDelAksje.status);
        stocks.splice(index, 1);
        renderStockTable();
      }
    });
  });
  