const express = require("express");
const router = express.Router();
const db = require("./utils");

router.post("/validate", (req, res) => {
    const { voucher } = req.body;

    db.get("SELECT * FROM vouchers WHERE code = ?", [voucher], (err, row) => {
        if (err) return res.json({ status: "ERROR", message: "Server error" });

        if (!row) {
            return res.json({ status: "FAIL", message: "Invalid voucher" });
        }

        if (Date.now() > row.expire_at) {
            return res.json({ status: "FAIL", message: "Voucher expired" });
        }

        return res.json({
            status: "OK",
            message: "Connected successfully!",
            redirect: "http://connectivitycheck.gstatic.com/generate_204"
        });
    });
});

module.exports = router;