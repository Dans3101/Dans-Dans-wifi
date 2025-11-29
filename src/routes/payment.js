import express from "express";
import { startPayment } from "../controllers/paymentController.js";

const router = express.Router();
router.post("/", startPayment);

export default router;