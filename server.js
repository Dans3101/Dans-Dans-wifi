import express from "express";
import dotenv from "dotenv";
import paymentRoute from "./src/routes/payment.js";
import webhookRoute from "./src/routes/webhook.js";
import authorizeRoute from "./src/routes/authorize.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/pay", paymentRoute);
app.use("/api/callback", webhookRoute);
app.use("/api/authorize", authorizeRoute);

app.get("/", (req, res) => {
  res.send("WiFi Payment Bot Running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));