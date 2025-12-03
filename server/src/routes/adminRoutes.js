import express from "express";
import {
  getApprovedArticles,
  publishArticle,
  getAllUsers,
  deleteUser,
  updateUserRole // <-- import the new controller
} from "../controllers/adminController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all routes and allow only admin
router.use(protect);
router.use(authorize("admin"));

// Articles
router.get("/articles/approved", getApprovedArticles);
router.put("/articles/:id/publish", publishArticle);

// Users
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id", updateUserRole); // <-- new PATCH route

export default router;
