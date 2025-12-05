// src/services/topicClassifier.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;
if (!HF_API_KEY) throw new Error("Missing HF_API_KEY in .env");

// Recommended pretrained topic classification model
// Multi-label: can return more than 1 category
const MODEL = "bhadresh-savani/distilbert-base-uncased-news-category";

const HF_URL = `https://api-inference.huggingface.co/models/${MODEL}`;

/**
 * Hugging Face request wrapper
 */
async function queryHF(inputs) {
  const res = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs }),
  });

  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

/**
 * 1️⃣ Classify topic using Hugging Face model
 */
export async function classifyTopic(text) {
  try {
    const result = await queryHF(text);

    // Output looks like: [{label: "politics", score: 0.82}, ...]
    if (!Array.isArray(result[0])) return ["general"];

    const sorted = result[0].sort((a, b) => b.score - a.score);

    const top = sorted.slice(0, 2).map((x) => x.label.toLowerCase());

    return top.length ? top : ["general"];
  } catch (err) {
    console.error("Topic Classifier Error:", err.message);
    return ["general"];
  }
}

/**
 * 2️⃣ Normalize topic names to your system categories
 */
export function normalizeTopic(rawTopics = []) {
  const mapping = {
    politics: "politics",
    government: "politics",
    election: "politics",

    sports: "sports",
    football: "sports",
    soccer: "sports",

    business: "business",
    finance: "business",
    markets: "business",
    economy: "business",

    tech: "technology",
    technology: "technology",
    ai: "technology",
    science: "science",

    entertainment: "entertainment",
    movies: "entertainment",
    culture: "entertainment",

    world: "world",
    international: "world",
    global: "world",

    health: "health",
    medicine: "health",
    covid: "health",

    environment: "environment",
    climate: "environment",
  };

  const normalized = rawTopics
    .map((t) => t.toLowerCase())
    .map((t) => mapping[t] || "general");

  return [...new Set(normalized)]; // remove duplicates
}

/**
 * 3️⃣ Full pipeline wrapper
 */
export async function getArticleTopics(text) {
  const raw = await classifyTopic(text);
  return normalizeTopic(raw);
}

export default {
  classifyTopic,
  normalizeTopic,
  getArticleTopics,
};
