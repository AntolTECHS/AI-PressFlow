// src/services/hfProcessArticle.js
import fetch from "node-fetch";
import nlp from "compromise";
import dotenv from "dotenv";
import NodeCache from "node-cache";

dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;
if (!HF_API_KEY) throw new Error("Hugging Face API key not set in .env");

const HF_BASE_URL = "https://api-inference.huggingface.co/models";

// Recommended Hugging Face models
const MODELS = {
  summarization: "facebook/bart-large-cnn",
  sentiment: "distilbert-base-uncased-finetuned-sst-2-english",
  ner: "dbmdz/bert-large-cased-finetuned-conll03-english",
  paraphrase: "Vamsi/T5_Paraphrase_Paws",
};

// In-memory cache to reduce API calls
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

async function queryHF(model, input) {
  const cacheKey = `${model}:${input.slice(0, 200)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${HF_BASE_URL}/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: input }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    cache.set(cacheKey, json); // store in cache
    return json;
  } catch (err) {
    console.error(`HF API error for model ${model}:`, err.message);
    return null;
  }
}

/* ------------------ NLP FUNCTIONS ------------------ */

export async function summarizeText(text) {
  const res = await queryHF(MODELS.summarization, text);
  return res?.[0]?.summary_text || text.slice(0, 300);
}

export async function analyzeSentiment(text) {
  const res = await queryHF(MODELS.sentiment, text);
  return res?.[0]?.label || "NEUTRAL";
}

export async function extractEntities(text) {
  const res = await queryHF(MODELS.ner, text);
  const entities = { people: [], locations: [], organizations: [] };
  if (!res) return entities;

  res.forEach((e) => {
    if (e.entity_group === "PER") entities.people.push(e.word);
    if (e.entity_group === "LOC") entities.locations.push(e.word);
    if (e.entity_group === "ORG") entities.organizations.push(e.word);
  });

  return entities;
}

export async function paraphraseText(text) {
  const res = await queryHF(MODELS.paraphrase, text);
  return res?.[0]?.generated_text || text;
}

/* ------------------ LOCAL PROCESSING ------------------ */

export function extractKeywords(text) {
  const doc = nlp(text);
  const terms = doc.nouns().out("array");
  const freq = {};
  terms.forEach((t) => (freq[t] = (freq[t] || 0) + 1));
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k]) => k);
}

export function generateTags(keywords, entities) {
  const tags = new Set();
  keywords.forEach((k) => tags.add(k));
  entities.people.forEach((p) => tags.add(p));
  entities.organizations.forEach((o) => tags.add(o));
  return [...tags].slice(0, 12);
}

export function removeDuplicateParagraphs(text) {
  const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  return [...new Set(paragraphs)].join("\n\n");
}

export function detectToxicity(text) {
  const toxicWords = [
    "kill", "hate", "racist", "scam", "fraud", "idiot",
    "terror", "bomb", "extremist", "fake news"
  ];
  const lower = text.toLowerCase();
  return toxicWords.some((w) => lower.includes(w)) ? "toxic" : "clean";
}

export function estimateReadingTime(text) {
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200);
}

export function seoScore(text, title, keywords) {
  let score = 0;
  if (text.length > 300) score += 20;
  if (keywords.some((k) => title.toLowerCase().includes(k))) score += 20;
  if (keywords.length >= 5) score += 20;
  if (text.includes(".")) score += 20;
  if (text.length > 1000) score += 20;
  return Math.min(score, 100);
}

/* ------------------ MASTER PIPELINE ------------------ */

export async function processArticle(article) {
  const raw = article.textContent || "";
  const cleaned = removeDuplicateParagraphs(raw);

  // Run HF API calls in parallel
  const [summary, sentiment, entities, rewritten] = await Promise.all([
    summarizeText(cleaned),
    analyzeSentiment(cleaned),
    extractEntities(cleaned),
    paraphraseText(cleaned)
  ]);

  const keywords = extractKeywords(cleaned);
  const tags = generateTags(keywords, entities);
  const readingTime = estimateReadingTime(cleaned);
  const seo = seoScore(cleaned, article.title, keywords);
  const toxicity = detectToxicity(cleaned);

  return {
    ...article,
    cleanedContent: rewritten,
    summary,
    sentiment,
    entities,
    keywords,
    tags,
    readingTime,
    seoScore: seo,
    flaggedToxicity: toxicity
  };
}
