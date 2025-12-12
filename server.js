// =============================
// Dans WiFi API – Pesapal Version (With Time Control)
// =============================
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./src/utils");
const { generateVoucher } = require("./src/wifi");
const { getPesapalToken, submitPesapalOrder } = require("./src/pesapal");
const { activateWiFi, checkExpiredAccess, markExpired } = require("./src/wifiAccess");
const { blockDeviceOnRouter } = require("./src/router");

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
    res.send("Dans WiFi API is running... Pesapal version active with WiFi time control.");
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
        // Get Pesapal Token
        const token = await getPesapalToken(
            process.env.PESAPAL_CONSUMER_KEY,
            process.env.PESAPAL_CONSUMER_SECRET
        );

        // Order details
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

        // Submit order to Pesapal
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
// PESAPAL CALLBACK – Activate WiFi Time
// =============================
app.post("/pesapal/callback", async (req, res) => {
    const data = req.body;

    console.log("PESAPAL CALLBACK RECEIVED:", data);

    const status = data.payment_status;
    const phone = data.billing_phone;
    const amount = data.amount;
    const receipt = data.confirmation_code || null;
    const mac = data.mac_address || ""; // Optional if router sends it

    // Save payment
    db.run(
        "INSERT INTO payments(phone, amount, mpesa_receipt, status) VALUES (?, ?, ?, ?)",
        [phone, amount, receipt, status]
    );

    if (status === "COMPLETED") {

        // Generate voucher
        const voucher = generateVoucher();

        // Assign WiFi time (default 60 minutes)
        const minutes = 60;  
        activateWiFi(phone, voucher, mac, minutes);

        console.log("Voucher issued:", voucher);

        return res.status(200).json({
            message: "Payment successful",
            voucher,
            minutes
        });
    }

    return res.status(200).json({ message: "Payment failed" });
});

// =============================
// AUTO CHECK FOR EXPIRED USERS
// =============================
setInterval(() => {
    checkExpiredAccess(rows => {
        rows.forEach(user => {
            console.log("WiFi time expired for:", user.phone);

            // Auto-block or disconnect from router
            blockDeviceOnRouter(user.mac_address);

            // Update status
            markExpired(user.id);
        });
    });
}, 15000); // every 15 seconds

// =============================
// START SERVER
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
