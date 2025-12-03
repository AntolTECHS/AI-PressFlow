// src/models/Article.js
import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },

    summary: String,
    content: { type: String, required: true },

    /** HASH FOR AUTO-FEED DEDUPLICATION */
    contentHash: { type: String, index: true },

    category: String,
    tags: [String],

    relevanceScore: Number,

    /** FEED INGESTION METADATA */
    source: {
      name: String,
      url: String,
      feedUrl: String,
    },
    originalUrl: { type: String, index: true },

    /** JOURNALIST INFO */
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    authorName: String,

    /** EDITOR WORKFLOW */
    status: {
      type: String,
      default: "staged",
      enum: ["staged", "pending", "approved", "published", "rejected"],
    },

    editorNotes: String,
    approvedAt: Date,   // ← ADD THIS

    /** OPTIONAL IMAGES */
    images: [String],

    /** FEED OR MANUAL PUBLICATION DATE */
    pubDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Article", articleSchema);
