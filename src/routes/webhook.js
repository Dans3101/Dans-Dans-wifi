import express from "express";
import { mpesaCallback } from "../controllers/webhookController.js";

const router = express.Router();
router.post("/", mpesaCallback);

export default router;