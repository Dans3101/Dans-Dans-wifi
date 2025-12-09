const axios = require("axios");
const db = require("./utils");
require("dotenv").config();

async function getToken() {
    const key = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_CONSUMER_SECRET;

    const response = await axios.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        { auth: { username: key, password: secret } }
    );

    return response.data.access_token;
}

async function stkPush(phone, amount) {
    const token = await getToken();

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;

    const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14);

    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    const res = await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount,
            PartyA: phone,
            PartyB: shortcode,
            PhoneNumber: phone,
            CallBackURL: process.env.CALLBACK_URL,
            AccountReference: "DansWifi",
            TransactionDesc: "WiFi Access Payment"
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data;
}

module.exports = { stkPush };