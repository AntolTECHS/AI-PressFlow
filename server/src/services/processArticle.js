// src/services/processArticle.js
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import nlp from 'compromise';
import hsearch from 'heuristic-search';

const wink = winkNLP(model);
const { its, as } = wink;

/**
 * 1️⃣ CLEAN DUPLICATE PARAGRAPHS
 */
export function removeDuplicateParagraphs(text) {
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const unique = [...new Set(paragraphs)];
  return unique.join("\n\n");
}

/**
 * 2️⃣ SIMPLE ABUSIVE / SPAM DETECTION
 */
export function detectToxicity(text) {
  const toxicWords = [
    "kill", "hate", "racist", "scam", "fraud", "idiot",
    "terror", "bomb", "extremist", "fake news"
  ];

  const lower = text.toLowerCase();

  return toxicWords.some(w => lower.includes(w)) ? "toxic" : "clean";
}

/**
 * 3️⃣ KEYWORD EXTRACTION (wink-nlp)
 */
export function extractKeywords(text) {
  const doc = wink.readDoc(text);
  const terms = doc.tokens().filter(t => t.out(its.type) === 'word')
    .filter(t => !t.out(its.stopWordFlag))
    .out(its.normal);

  const freq = {};
  for (const t of terms) freq[t] = (freq[t] || 0) + 1;

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);
}

/**
 * 4️⃣ ENTITY EXTRACTION (compromise)
 */
export function extractEntities(text) {
  const doc = nlp(text);

  return {
    people: doc.people().out('array'),
    locations: doc.places().out('array'),
    organizations: doc.organizations().out('array')
  };
}

/**
 * 5️⃣ TAG GENERATION
 */
export function generateTags(keywords, entities) {
  const tags = new Set();

  keywords.forEach(k => tags.add(k));
  entities.people.forEach(p => tags.add(p));
  entities.organizations.forEach(o => tags.add(o));

  return [...tags].slice(0, 12);
}

/**
 * 6️⃣ SMART SUMMARY (free local heuristic)
 */
export function smartSummary(text) {
  const sentences = text.split(/(?<=[.!?])\s+/);

  if (sentences.length <= 3) return text;

  // Score sentences using heuristic search
  const scores = sentences.map(s => ({
    sentence: s,
    score: hsearch.score(s)
  }));

  const best = scores.sort((a, b) => b.score - a.score)
    .slice(0, Math.min(3, scores.length))
    .map(s => s.sentence)
    .join(" ");

  return best;
}

/**
 * 7️⃣ READING TIME (for UI)
 */
export function estimateReadingTime(text) {
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200); // 200 wpm
}

/**
 * 8️⃣ SEO SCORE
 */
export function seoScore(text, title, keywords) {
  let score = 0;

  if (text.length > 300) score += 20;
  if (keywords.some(k => title.toLowerCase().includes(k))) score += 20;
  if (keywords.length >= 5) score += 20;
  if (text.includes(".")) score += 20;
  if (text.length > 1000) score += 20;

  return Math.min(score, 100);
}

/**
 * MASTER PIPELINE
 */
export function processArticle(article) {
  const processed = {};

  const cleaned = removeDuplicateParagraphs(article.textContent);

  const toxicity = detectToxicity(cleaned);
  const keywords = extractKeywords(cleaned);
  const entities = extractEntities(cleaned);
  const tags = generateTags(keywords, entities);
  const summary = smartSummary(cleaned);
  const readingTime = estimateReadingTime(cleaned);
  const seo = seoScore(cleaned, article.title, keywords);

  return {
    ...article,
    cleanedContent: cleaned,
    keywords,
    entities,
    tags,
    summary,
    readingTime,
    seoScore: seo,
    flaggedToxicity: toxicity
  };
}
