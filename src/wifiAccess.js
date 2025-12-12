const db = require("./utils");

// minutes → milliseconds
function addMinutes(minutes) {
    return minutes * 60 * 1000;
}

function activateWiFi(phone, voucher, mac, minutes) {
    const start = Date.now();
    const end = start + addMinutes(minutes);

    db.run(
        `INSERT INTO wifi_access(phone, voucher, start_time, end_time, mac_address, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [phone, voucher, start, end, mac, "ACTIVE"]
    );

    return { start, end };
}

function checkExpiredAccess(callback) {
    const now = Date.now();
    db.all(
        `SELECT * FROM wifi_access WHERE status = 'ACTIVE' AND end_time <= ?`,
        [now],
        (err, rows) => {
            if (rows.length > 0) callback(rows);
        }
    );
}

function markExpired(id) {
    db.run(`UPDATE wifi_access SET status='EXPIRED' WHERE id=?`, [id]);
}

module.exports = {
    activateWiFi,
    checkExpiredAccess,
    markExpired
};