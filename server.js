// =============================
// Dans WiFi API – Pesapal Version
// =============================
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./src/utils");
const { generateVoucher } = require("./src/wifi");
const { getPesapalToken, submitPesapalOrder } = require("./src/pesapal");

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// =============================
// SERVE PUBLIC LOGIN PAGE
// =============================
app.use(express.static("public"));

// =============================
// WIFI ROUTES (voucher validation)
// =============================
app.use("/wifi", require("./src/wifiRoute"));

// =============================
// HOME ROUTE
// =============================
app.get("/", (req, res) => {
    res.send("Dans WiFi API is running... Pesapal version active.");
});

// =============================
// START PESAPAL PAYMENT
// =============================
app.post("/pay", async (req, res) => {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
        return res.status(400).json({
            error: "Phone and amount are required"
        });
    }

    try {
        // 1. Get Pesapal Token
        const token = await getPesapalToken(
            process.env.PESAPAL_CONSUMER_KEY,
            process.env.PESAPAL_CONSUMER_SECRET
        );

        // 2. Prepare order details
        const order = {
            id: `wifi-${Date.now()}`,
            currency: "KES",
            amount: amount,
            description: "Dans WiFi Access Payment",
            callback_url: process.env.PESAPAL_CALLBACK_URL,
            billing_address: {
                email_address: "",
                phone_number: phone,
                country_code: "KE",
                first_name: "Customer",
                last_name: ""
            }
        };

        // 3. Submit order
        const result = await submitPesapalOrder(token, order);

        return res.json({
            status: "PENDING",
            redirect_url: result.redirect_url,
            order_tracking_id: result.order_tracking_id
        });

    } catch (err) {
        console.error("Pesapal payment error:", err);
        res.status(500).json({ error: "Payment initiation failed" });
    }
});

// =============================
// PESAPAL CALLBACK
// =============================
app.post("/pesapal/callback", async (req, res) => {
    const data = req.body;

    console.log("PESAPAL CALLBACK RECEIVED:", data);

    const status = data.payment_status;
    const phone = data.billing_phone;
    const amount = data.amount;
    const receipt = data.confirmation_code || null;

    // Save payment
    db.run(
        "INSERT INTO payments(phone, amount, mpesa_receipt, status) VALUES (?, ?, ?, ?)",
        [phone, amount, receipt, status]
    );

    if (status === "COMPLETED") {
        const voucher = generateVoucher();
        console.log("Voucher:", voucher);
        return res.status(200).json({ message: "Payment successful", voucher });
    }

    return res.status(200).json({ message: "Payment failed" });
});

// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});