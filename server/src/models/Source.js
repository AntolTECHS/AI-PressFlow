// src/models/Source.js
import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["rss", "api", "scrape"], default: "rss" },
    endpoint: { type: String, required: true },
    category: { type: String, default: "general" },
    credibilityScore: { type: Number, default: 0.8 },
    lastFetchAt: { type: Date, default: null },
    fetchInterval: { type: Number, default: 300 },
  },
  { timestamps: true }
);

const Source = mongoose.model("Source", sourceSchema);

export default Source; // ✅ Make sure this line is present
