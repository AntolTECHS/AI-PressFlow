import natural from "natural";

export function summarize(text, maxSentences = 4) {
  const tokenizer = new natural.SentenceTokenizer();
  const sentences = tokenizer.tokenize(text);

  const tfidf = new natural.TfIdf();
  sentences.forEach(s => tfidf.addDocument(s));

  return sentences
    .map((sentence, i) => ({
      sentence,
      score: tfidf.tfidf(sentence, i)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map(s => s.sentence)
    .join(" ");
}
