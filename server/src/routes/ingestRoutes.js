// src/routes/ingestRoutes.js
import express from "express";
import { ingestUrl } from "../controllers/ingestController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manual ingestion (protected - editors/admins)
router.post("/url", protect, authorizeRoles("admin","editor","journalist"), ingestUrl);

export default router;
