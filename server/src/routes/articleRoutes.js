import express from "express";
import {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getMyArticles,
  getPendingArticles,
  approveArticle,
  rejectArticle,
  publishArticle,
} from "../controllers/articleController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------------------------
   PUBLIC ROUTES
----------------------------------------------*/
router.get("/", getAllArticles); // published only

/* ----------------------------------------------
   JOURNALIST ROUTES
----------------------------------------------*/

// fetch own articles — must come BEFORE /:id
router.get(
  "/mine",
  protect,
  authorize("journalist", "editor", "admin"),
  getMyArticles
);

// fetch single article by ID
router.get("/:id", getArticleById);

// create
router.post(
  "/",
  protect,
  authorize("journalist", "editor", "admin"),
  createArticle
);

// edit own articles
router.put(
  "/:id",
  protect,
  authorize("journalist", "editor", "admin"),
  updateArticle
);

/* ----------------------------------------------
   EDITOR ROUTES
----------------------------------------------*/

// list pending articles
router.get(
  "/review/pending/list",
  protect,
  authorize("editor", "admin"),
  getPendingArticles
);

// approve an article
router.put(
  "/:id/approve",
  protect,
  authorize("editor", "admin"),
  approveArticle
);

// reject an article
router.put(
  "/:id/reject",
  protect,
  authorize("editor", "admin"),
  rejectArticle
);

/* ----------------------------------------------
   ADMIN ROUTES
----------------------------------------------*/

// publish an article
router.put(
  "/:id/publish",
  protect,
  authorize("admin"),
  publishArticle
);

// delete an article
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteArticle
);

export default router;
