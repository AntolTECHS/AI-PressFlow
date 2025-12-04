import similarity from "string-similarity";

export function isDuplicate(a, b, threshold = 0.85) {
  const score = similarity.compareTwoStrings(a, b);
  return score >= threshold;
}
