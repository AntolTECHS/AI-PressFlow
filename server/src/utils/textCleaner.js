// src/utils/textCleaner.js
import crypto from "crypto";

/**
 * cleanText - simple whitespace & bad-char cleanup
 */
export function cleanText(text = "") {
  if (!text) return "";
  // normalize whitespace & trim
  let t = text.replace(/\s+/g, " ").trim();
  // remove control characters
  t = t.replace(/[\x00-\x1F\x7F]+/g, " ");
  return t;
}

/**
 * contentHash - quick fingerprint for duplicate detection
 * Use later with more advanced similarity (MinHash/SimHash)
 */
export function contentHash(text = "") {
  const h = crypto.createHash("sha1");
  h.update(text.slice(0, 10_000)); // only hash prefix for speed
  return h.digest("hex");
}
