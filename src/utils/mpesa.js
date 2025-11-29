import axios from "axios";

export const stkPush = async (phone, amount) => {
  const token = "GENERATE_MPESA_TOKEN_HERE";

  const url =
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const res = await axios.post(
    url,
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: process.env.MPESA_PASSKEY,
      Timestamp: "20250425010101",
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: "WiFiAccess",
      TransactionDesc: "WiFi Payment"
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  return res.data;
};