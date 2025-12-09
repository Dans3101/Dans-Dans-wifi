const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./src/utils");
const { stkPush } = require("./src/mpesa");
const { generateVoucher } = require("./src/wifi");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Dans WiFi API is running...");
});

// Start M-Pesa payment
app.post("/pay", async (req, res) => {
    const { phone, amount } = req.body;

    try {
        const response = await stkPush(phone, amount);
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Callback URL
app.post("/callback", (req, res) => {
    const data = req.body.Body.stkCallback;

    const status = data.ResultCode === 0 ? "SUCCESS" : "FAILED";
    const receipt = data.CallbackMetadata?.Item?.[1]?.Value || null;
    const phone = data.CallbackMetadata?.Item?.[4]?.Value || null;

    db.run(
        "INSERT INTO payments(phone, amount, mpesa_receipt, status) VALUES (?, ?, ?, ?)",
        [phone, "20", receipt, status]
    );

    if (status === "SUCCESS") {
        const voucher = generateVoucher();
        return res.json({ message: "Payment successful", voucher });
    }

    res.json({ message: "Payment failed" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));