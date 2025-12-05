// src/utils/relevanceScore.js

import natural from "natural";
const tokenizer = new natural.WordTokenizer();

/**
 * Clean & normalize text
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Count how many keywords appear in text
 */
function keywordMatchScore(text, keywords = []) {
  if (!keywords.length) return 0;
  const lower = text.toLowerCase();
  let matches = 0;

  keywords.forEach((k) => {
    if (lower.includes(k.toLowerCase())) matches++;
  });

  return matches / keywords.length; // normalized 0 → 1
}

/**
 * Cosine similarity using TF-IDF (Natural library)
 */
function cosineSimilarity(textA, textB) {
  const tfidf = new natural.TfIdf();

  tfidf.addDocument(textA);
  tfidf.addDocument(textB);

  const vecA = [];
  const vecB = [];

  tfidf.listTerms(0).forEach((t) => vecA.push(t.tfidf));
  tfidf.listTerms(1).forEach((t) => vecB.push(t.tfidf));

  // pad vectors to equal length
  const maxLen = Math.max(vecA.length, vecB.length);
  while (vecA.length < maxLen) vecA.push(0);
  while (vecB.length < maxLen) vecB.push(0);

  let dot = 0,
    magA = 0,
    magB = 0;

  for (let i = 0; i < maxLen; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] ** 2;
    magB += vecB[i] ** 2;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Overlap score: shared words / total keywords
 */
function wordOverlapScore(text, keywords = []) {
  const words = new Set(tokenizer.tokenize(text.toLowerCase()));
  let overlap = 0;

  keywords.forEach((k) => {
    if (words.has(k.toLowerCase())) overlap++;
  });

  return overlap / Math.max(1, keywords.length);
}

/**
 * Main relevance scoring function
 */
export function computeRelevanceScore(article, query = {}) {
  const text = normalize(
    `${article.title || ""} ${article.cleanedContent || article.textContent || ""}`
  );

  const {
    category = "",
    keywords = [],
    topic = "",
  } = query;

  // Build a reference text based on the query (for cosine similarity)
  const referenceText = normalize(
    `${topic} ${category} ${keywords.join(" ")}`
  );

  // Individual components
  const cosine = cosineSimilarity(text, referenceText);       // semantic similarity
  const keywordScore = keywordMatchScore(text, keywords);     // direct keyword hits
  const overlap = wordOverlapScore(text, keywords);           // word overlap

  // Weighted scoring
  const finalScore =
    cosine * 0.55 +        // semantic similarity (55%)
    keywordScore * 0.30 +  // keyword match (30%)
    overlap * 0.15;        // lexical overlap (15%)

  return Number(finalScore.toFixed(4)); // normalized 0 → 1
}

export default computeRelevanceScore;
