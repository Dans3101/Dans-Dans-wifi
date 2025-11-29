import db from "../utils/db.js";

export const mpesaCallback = async (req, res) => {
  console.log("M-Pesa Callback Received:", req.body);

  const checkoutID = req.body.Body.stkCallback.CheckoutRequestID;

  await db.run(
    "UPDATE sessions SET status = ? WHERE checkoutID = ?",
    ["paid", checkoutID]
  );

  res.status(200).send("OK");
};