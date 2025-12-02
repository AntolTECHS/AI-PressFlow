// src/models/Article.js (replace or extend existing)
import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, index: true },
    summary: String,
    content: String,
    contentHash: { type: String, index: true },
    category: String,
    tags: [String],
    relevanceScore: Number,
    source: {
      name: String,
      url: String,
      feedUrl: String
    },
    originalUrl: { type: String, index: true },
    images: [String],
    status: { type: String, default: "staged", enum: ["staged","approved","published","rejected"] },
    pubDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Article", articleSchema);
