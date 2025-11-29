import express from "express";
import { authorizeDevice } from "../controllers/authorizeController.js";

const router = express.Router();
router.get("/", authorizeDevice);

export default router;