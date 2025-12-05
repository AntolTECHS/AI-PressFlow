// src/services/nlpService.js

import {
  summarizeText,
  analyzeSentiment,
  extractEntities,
  paraphraseText,
  extractKeywords,
  generateTags,
  removeDuplicateParagraphs,
  detectToxicity,
  estimateReadingTime,
  seoScore,
  processArticle as hfPipeline,
} from "./hfProcessArticle.js";

import computeRelevanceScore from "../utils/relevanceScore.js";

/**
 * Normalize and clean article input
 */
function normalizeArticle(article) {
  return {
    title: article.title || "",
    textContent: article.textContent || "",
    author: article.author || null,
    source: article.source || null,
    url: article.url || null,
    publishedAt: article.publishedAt || new Date(),
  };
}

/**
 * FULL NLP PROCESSOR
 * Runs all models and enriches article
 */
export async function runNlpPipeline(article, options = {}) {
  const normalized = normalizeArticle(article);

  const cleanedText = removeDuplicateParagraphs(normalized.textContent);

  // 1️⃣ HuggingFace NLP processing
  const {
    summary,
    sentiment,
    entities,
    keywords,
    cleanedContent,
    tags,
    readingTime,
    seoScore: seo,
    flaggedToxicity,
  } = await hfPipeline({
    ...normalized,
    textContent: cleanedText,
  });

  // 2️⃣ Compute Relevance Score
  const relevance = computeRelevanceScore(
    {
      title: normalized.title,
      cleanedContent,
      textContent: cleanedText,
    },
    {
      keywords: options.keywords || [],
      topic: options.topic || "",
      category: options.category || "",
    }
  );

  // 3️⃣ Return enriched article package
  return {
    ...normalized,
    cleanedContent,
    summary,
    sentiment,
    entities,
    keywords,
    tags,
    readingTime,
    seoScore: seo,
    flaggedToxicity,
    relevanceScore: relevance,
  };
}

/**
 * QUICK OPERATIONS (Optional utilities)
 */

export function quickSummary(text) {
  return summarizeText(text);
}

export function quickSentiment(text) {
  return analyzeSentiment(text);
}

export function quickKeywords(text) {
  return extractKeywords(text);
}

export function quickEntities(text) {
  return extractEntities(text);
}

export default {
  runNlpPipeline,
  quickSummary,
  quickSentiment,
  quickKeywords,
  quickEntities,
};
