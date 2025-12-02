// src/routes/editorRoutes.js
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createArticle,
  updateArticle,
  deleteArticle,
  getAllArticlesForEditor,
} from "../controllers/editorController.js";

const router = express.Router();

// Only authenticated users with role 'editor' or 'admin'
router.use(protect);

router.get("/", authorize("editor", "admin"), getAllArticlesForEditor);
router.post("/", authorize("editor", "admin"), createArticle);
router.put("/:id", authorize("editor", "admin"), updateArticle);
router.delete("/:id", authorize("editor", "admin"), deleteArticle);

export default router; // ✅ default export
