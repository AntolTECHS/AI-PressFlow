// src/services/seoService.js

import nlp from "compromise";

/**
 * 1️⃣ Compute keyword density
 */
export function computeKeywordDensity(text, keywords = []) {
  if (!text || keywords.length === 0) return 0;

  const totalWords = text.split(/\s+/).length;
  if (totalWords === 0) return 0;

  const lower = text.toLowerCase();
  let count = 0;

  keywords.forEach((k) => {
    const regex = new RegExp(`\\b${k.toLowerCase()}\\b`, "g");
    const matches = lower.match(regex);
    count += matches ? matches.length : 0;
  });

  return ((count / totalWords) * 100).toFixed(2); // percentage %
}

/**
 * 2️⃣ Readability score (Flesch–Kincaid simplified)
 */
export function computeReadability(text) {
  if (!text) return 0;

  const sentences = text.split(/[.!?]/).length;
  const words = text.split(/\s+/).length;
  const syllables = text
    .toLowerCase()
    .replace(/(?:[^laeiouy]|ed|[^laeiouy]e)$/, "")
    .match(/[aeiouy]{1,2}/g)?.length || 0;

  if (sentences === 0 || words === 0) return 0;

  const score =
    206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

  return Math.max(0, Math.min(score, 100)); // Normalize
}

/**
 * 3️⃣ Title quality scoring
 */
export function scoreTitle(title = "", keywords = []) {
  let score = 0;

  const len = title.length;

  if (len >= 40 && len <= 70) score += 30;
  if (keywords.some((k) => title.toLowerCase().includes(k))) score += 40;
  if (/^\d+/.test(title)) score += 20; // numbered titles perform better
  if (/[!?]/.test(title)) score += 10;

  return Math.min(score, 100);
}

/**
 * 4️⃣ Meta description generation (best 155 chars)
 */
export function generateMetaDescription(text) {
  if (!text) return "";

  const clean = text.replace(/\s+/g, " ").trim();
  return clean.slice(0, 155) + (clean.length > 155 ? "..." : "");
}

/**
 * 5️⃣ Slug generator for URLs
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * 6️⃣ Check duplicate content possibility
 */
export function detectDuplicateContent(text = "", otherTexts = []) {
  const norm = (t) => t.toLowerCase().replace(/\s+/g, " ").trim();
  const target = norm(text);

  return otherTexts.some((t) => norm(t) === target);
}

/**
 * 7️⃣ Full SEO Score (composite)
 */
export function computeSeoScore(article) {
  const {
    title = "",
    cleanedContent = "",
    keywords = [],
    summary = "",
  } = article;

  let score = 0;

  // Title quality
  const titleScore = scoreTitle(title, keywords);
  score += titleScore * 0.25;

  // Keyword density % (1–3% is ideal)
  const kd = computeKeywordDensity(cleanedContent, keywords);
  if (kd >= 1 && kd <= 3) score += 25;

  // Readability
  const readability = computeReadability(cleanedContent);
  score += (readability / 100) * 25;

  // Summary presence
  if (summary && summary.length > 20) score += 25;

  return Math.round(score);
}

/**
 * 8️⃣ Combined SEO analysis report
 */
export function generateSeoReport(article) {
  return {
    titleScore: scoreTitle(article.title, article.keywords),
    keywordDensity: computeKeywordDensity(article.cleanedContent, article.keywords),
    readability: computeReadability(article.cleanedContent),
    metaDescription: generateMetaDescription(article.cleanedContent),
    slug: generateSlug(article.title),
    seoScore: computeSeoScore(article),
  };
}

export default {
  computeKeywordDensity,
  computeReadability,
  scoreTitle,
  generateMetaDescription,
  generateSlug,
  detectDuplicateContent,
  computeSeoScore,
  generateSeoReport,
};
