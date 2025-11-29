import { stkPush } from "../utils/mpesa.js";
import db from "../utils/db.js";

export const startPayment = async (req, res) => {
  const { phone, mac, plan } = req.body;

  const amount = plan === "1_hour" ? 20 : 10;

  await db.run(
    "INSERT INTO sessions (mac, phone, status, minutes) VALUES (?, ?, ?, ?)",
    [mac, phone, "pending", plan === "1_hour" ? 60 : 30]
  );

  const mpesaRes = await stkPush(phone, amount);

  res.json({
    success: true,
    message: "Payment initiated",
    mpesa: mpesaRes
  });
};