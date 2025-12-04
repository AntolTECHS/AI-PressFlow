import Rake from "rake-js";

export function extractKeywords(text) {
  return Rake.generate(text).slice(0, 10);
}
