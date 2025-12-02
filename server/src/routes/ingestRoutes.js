// src/routes/ingestRoutes.js
import express from "express";
import { ingestUrl } from "../controllers/ingestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manual ingestion (protected)
router.post("/manual", protect, ingestUrl);

export default router;
