// src/services/pretrainedProcessArticle.js
import * as hf from '@huggingface/inference';
import compromise from 'compromise';
import { contentHash, cleanText } from '../utils/textCleaner.js';

const client = new hf.HfInference(process.env.HF_API_KEY); // optional local if GPU

export async function processArticle(article) {
  const cleaned = cleanText(article.content || article.textContent);

  // --- 1. Summarization ---
  const summaryResult = await client.summarization({
    model: 'facebook/bart-large-cnn',
    inputs: cleaned,
    parameters: { max_length: 200 }
  });
  const summary = summaryResult[0].summary_text;

  // --- 2. Sentiment ---
  const sentimentRes = await client.sentiment({
    model: 'nlptown/bert-base-multilingual-uncased-sentiment',
    inputs: cleaned
  });
  const sentiment = sentimentRes[0].label;

  // --- 3. Entity extraction ---
  const entities = compromise(cleaned);
  const ner = {
    people: entities.people().out('array'),
    locations: entities.places().out('array'),
    organizations: entities.organizations().out('array')
  };

  // --- 4. Keyword / tag extraction ---
  const keywordRes = await client.feature_extraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: cleaned
  });
  const tags = Object.keys(ner)
    .flatMap(k => ner[k])
    .slice(0, 12);

  // --- 5. Duplicate hash ---
  const hash = contentHash(cleaned);

  return {
    ...article,
    cleanedContent: cleaned,
    summary,
    sentiment,
    entities: ner,
    tags,
    contentHash: hash,
  };
}
