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
router.get("/:id", getArticleById);


/* ----------------------------------------------
   JOURNALIST ROUTES
----------------------------------------------*/

// create
router.post(
  "/",
  protect,
  authorize("journalist", "editor", "admin"),
  createArticle
);

// fetch own
router.get(
  "/mine/all",
  protect,
  authorize("journalist", "editor", "admin"),
  getMyArticles
);

// edit own
router.put(
  "/:id",
  protect,
  authorize("journalist", "editor", "admin"),
  updateArticle
);


/* ----------------------------------------------
   EDITOR ROUTES
----------------------------------------------*/

// list pending
router.get(
  "/review/pending/list",
  protect,
  authorize("editor", "admin"),
  getPendingArticles
);

// approve
router.put(
  "/:id/approve",
  protect,
  authorize("editor", "admin"),
  approveArticle
);

// reject
router.put(
  "/:id/reject",
  protect,
  authorize("editor", "admin"),
  rejectArticle
);


/* ----------------------------------------------
   ADMIN ROUTES
----------------------------------------------*/

// publish
router.put(
  "/:id/publish",
  protect,
  authorize("admin"),
  publishArticle
);

// delete
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteArticle
);

export default router;
