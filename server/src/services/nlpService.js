// src/services/nlpService.js
/**
 * categorizeText(text) - returns a simple category based on keywords
 * Replace this with an actual NLP model (HuggingFace, spaCy, etc.) later
 */

export async function categorizeText(text) {
  if (!text || text.length < 1) return "general";

  const txt = text.toLowerCase();

  if (txt.includes("politics") || txt.includes("election") || txt.includes("government")) return "politics";
  if (txt.includes("sport") || txt.includes("football") || txt.includes("cricket")) return "sports";
  if (txt.includes("tech") || txt.includes("ai") || txt.includes("software")) return "technology";
  if (txt.includes("market") || txt.includes("economy") || txt.includes("finance")) return "economy";
  if (txt.includes("movie") || txt.includes("entertainment") || txt.includes("music")) return "entertainment";

  return "general";
}
