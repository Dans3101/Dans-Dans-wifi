async function loadActiveUsers() {
    const res = await fetch("/wifi/active");
    const users = await res.json();

    const table = document.querySelector("#activeUsersTable tbody");
    table.innerHTML = "";

    users.forEach(u => {
        const row = `
            <tr>
                <td>${u.phone}</td>
                <td>${u.mac_address}</td>
                <td>${u.minutes_left} min</td>
                <td>${u.voucher}</td>
                <td><button onclick="disconnect('${u.mac_address}')">Disconnect</button></td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

async function loadPayments() {
    const res = await fetch("/wifi/payments");
    const history = await res.json();

    const table = document.querySelector("#paymentTable tbody");
    table.innerHTML = "";

    history.forEach(p => {
        const row = `
            <tr>
                <td>${p.phone}</td>
                <td>${p.amount}</td>
                <td>${p.mpesa_receipt}</td>
                <td>${p.status}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

async function disconnect(mac) {
    await fetch(`/wifi/disconnect/${mac}`, { method: "POST" });
    alert("Device disconnected");
    loadActiveUsers();
}

loadActiveUsers();
loadPayments();
setInterval(loadActiveUsers, 5000);