import axios from "axios";

const baseUrl = "https://pay.pesapal.com/v3";

export async function getPesapalToken(key, secret) {
  try {
    const res = await axios.post(`${baseUrl}/api/Auth/RequestToken`, {
      consumer_key: key,
      consumer_secret: secret
    });
    return res.data.token;
  } catch (error) {
    console.error("Pesapal token error:", error);
    throw error;
  }
}

export async function submitOrder(token, order) {
  try {
    const res = await axios.post(
      `${baseUrl}/api/Transactions/SubmitOrderRequest`,
      order,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    return res.data;
  } catch (error) {
    console.error("Pesapal order error:", error.response?.data || error);
    throw error;
  }
}