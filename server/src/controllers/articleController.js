// src/controllers/articleController.js
import Article from "../models/Article.js";

/* ----------------------------------------------
   PUBLIC ROUTES
----------------------------------------------*/

// GET /api/articles  → Public articles only
export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: "published" })
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/articles/:id → Public view, unless author/editor/admin
export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article)
      return res.status(404).json({ message: "Article not found" });

    // If not published, only author/editor/admin can view
    if (
      article.status !== "published" &&
      (!req.user ||
        (req.user.id !== article.authorId?.toString() &&
         req.user.role !== "editor" &&
         req.user.role !== "admin"))
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ----------------------------------------------
   JOURNALIST ROUTES
----------------------------------------------*/

// POST /api/articles → Create new article (journalist)
export const createArticle = async (req, res) => {
  try {
    const { title, content, summary, images, category, tags } = req.body;

    const newArticle = new Article({
      title,
      content,
      summary,
      images,
      category,
      tags,
      authorId: req.user.id,
      authorName: req.user.name,
      status: "pending",   // journalist submits for editor review
    });

    const savedArticle = await newArticle.save();
    res.status(201).json(savedArticle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET /api/articles/mine → Journalist sees ONLY their articles
export const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({ authorId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/articles/:id → Journalist edits ONLY if not approved/published yet
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article)
      return res.status(404).json({ message: "Article not found" });

    if (article.authorId?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your article" });

    if (["approved", "published"].includes(article.status))
      return res.status(400).json({
        message: "Cannot edit an approved or published article",
      });

    Object.assign(article, req.body);

    const updated = await article.save();
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ----------------------------------------------
   EDITOR ROUTES
----------------------------------------------*/

// GET /api/articles/pending → Editor sees review queue
export const getPendingArticles = async (req, res) => {
  try {
    const articles = await Article.find({ status: "pending" })
      .sort({ createdAt: 1 });

    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/articles/:id/approve
export const approveArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article)
      return res.status(404).json({ message: "Article not found" });

    article.status = "approved";
    article.editorNotes = req.body.editorNotes || "";
    article.approvedAt = new Date();

    await article.save();
    res.json({ message: "Article approved", article });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// PUT /api/articles/:id/reject
export const rejectArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article)
      return res.status(404).json({ message: "Article not found" });

    article.status = "rejected";
    article.editorNotes = req.body.editorNotes || "";

    await article.save();
    res.json({ message: "Article rejected", article });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};


/* ----------------------------------------------
   ADMIN ROUTES
----------------------------------------------*/

// PUT /api/articles/:id/publish
export const publishArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article)
      return res.status(404).json({ message: "Article not found" });

    article.status = "published";
    article.pubDate = new Date();

    await article.save();
    res.json({ message: "Article published", article });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE /api/articles/:id (admin only)
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article)
      return res.status(404).json({ message: "Article not found" });

    await article.deleteOne();
    res.json({ message: "Article deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
