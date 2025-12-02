// src/controllers/editorController.js
import Article from "../models/Article.js";
import { cleanText, contentHash } from "../utils/textCleaner.js";

// Get all articles for editorial dashboard
export const getAllArticlesForEditor = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Create a new article
export const createArticle = async (req, res) => {
  try {
    const { title, content, images, source, category, pubDate } = req.body;
    const hash = contentHash(content || title);

    const article = await Article.create({
      title,
      content: cleanText(content),
      summary: cleanText(content).slice(0, 500),
      contentHash: hash,
      images: images || [],
      source: source || {},
      category: category || "uncategorized",
      pubDate: pubDate || new Date(),
      status: "published",
    });

    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message || err });
  }
};

// Update an article
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    Object.assign(article, req.body);
    await article.save();

    res.json(article);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete an article
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
