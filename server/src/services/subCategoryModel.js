import natural from "natural";

const subCategories = {
  world: ["diplomacy", "conflict", "climate", "migration"],
  business: ["markets", "economy", "crypto", "finance"],
  sports: ["football", "basketball", "tennis", "olympics"],
  tech: ["ai", "software", "cybersecurity", "gadgets"],
  politics: ["elections", "policy", "government"],
  entertainment: ["movies", "music", "celebrities"]
};

export function subCategorize(text, mainCategory) {
  const keywords = subCategories[mainCategory] || [];

  let highest = { label: null, score: 0 };

  for (const kw of keywords) {
    const score = natural.JaroWinklerDistance(text.toLowerCase(), kw);
    if (score > highest.score) {
      highest = { label: kw, score };
    }
  }

  return highest.score > 0.5 ? highest.label : null;
}
