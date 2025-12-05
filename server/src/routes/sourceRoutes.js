// src/routes/sourceRoutes.js
import express from "express";
import {
  getAllSources,
  getSourceById,
  createSource,
  updateSource,
  deleteSource,
} from "../controllers/sourceController.js";
import { authMiddleware, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllSources);
router.get("/:id", getSourceById);

// Admin routes
router.post("/", authMiddleware, adminOnly, createSource);
router.put("/:id", authMiddleware, adminOnly, updateSource);
router.delete("/:id", authMiddleware, adminOnly, deleteSource);

export default router;
