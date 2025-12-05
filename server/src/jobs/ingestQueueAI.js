// src/jobs/ingestQueueAI.js
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { extractArticle } from "../utils/extractArticle.js";
import Article from "../models/Article.js";
import { contentHash, cleanText } from "../utils/textCleaner.js";
import * as hf from "@huggingface/inference";
import compromise from "compromise";

const client = new hf.HfInference(process.env.HF_API_KEY);

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

export const ingestQueue = new Queue("ingestQueueAI", { connection });

// Add job to queue
export async function addUrlToIngestQueue(payload) {
  const jobId = payload.link || `${Date.now()}-${Math.random()}`;
  await ingestQueue.add(
    "ingest",
    payload,
    {
      jobId,
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
  return true;
}

// Worker
export function startIngestWorkerAI() {
  const worker = new Worker(
    "ingestQueueAI",
    async (job) => {
      const payload = job.data;
      const url = payload.link || payload.originalUrl;

      if (!url) throw new Error("No URL in payload");

      const extracted = await extractArticle(url);
      if (extracted.error) {
        console.error("Extraction failed:", url, extracted.message);
        return { failed: true };
      }

      const title = cleanText(payload.title || extracted.title || "");
      const rawContent = extracted.textContent || payload.content || "";
      const content = cleanText(rawContent);

      // --- Duplicate detection ---
      const hash = contentHash(content || title);
      const existing = await Article.findOne({
        $or: [{ originalUrl: url }, { contentHash: hash }],
      }).lean();
      if (existing) {
        console.info("Duplicate detected → skipping:", url);
        return { skipped: true, existingId: existing._id };
      }

      // --- NLP / AI processing ---
      const cleanedText = content;

      // 1️⃣ Summarization
      const summaryRes = await client.summarization({
        model: "facebook/bart-large-cnn",
        inputs: cleanedText,
        parameters: { max_length: 200 },
      });
      const summary = summaryRes[0]?.summary_text || cleanedText.slice(0, 300);

      // 2️⃣ Sentiment
      const sentimentRes = await client.sentiment({
        model: "nlptown/bert-base-multilingual-uncased-sentiment",
        inputs: cleanedText,
      });
      const sentiment = sentimentRes[0]?.label || "neutral";

      // 3️⃣ Toxicity / Spam
      const toxicityRes = await client.classification({
        model: "unitary/toxic-bert",
        inputs: cleanedText,
      });
      const flaggedToxicity = toxicityRes.some(r => r.label.toLowerCase() === "toxic") ? "toxic" : "clean";

      // 4️⃣ Entity extraction
      const entitiesDoc = compromise(cleanedText);
      const entities = {
        people: entitiesDoc.people().out("array"),
        locations: entitiesDoc.places().out("array"),
        organizations: entitiesDoc.organizations().out("array"),
      };

      // 5️⃣ Keyword / Tag generation (combine entities + top words)
      const keywordsRes = await client.feature_extraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: cleanedText,
      });
      const tags = [...entities.people, ...entities.organizations].slice(0, 12);

      // 6️⃣ Fake-news detection
      const fakeNewsRes = await client.classification({
        model: "mrm8488/bert-tiny-finetuned-fakenews",
        inputs: cleanedText,
      });
      const fakeNewsScore = fakeNewsRes[0]?.label === "FAKE" ? 1 : 0;

      // 7️⃣ AI vs Human writing detection
      const aiDetectionRes = await client.classification({
        model: "roberta-large-openai-detector",
        inputs: cleanedText,
      });
      const aiGenerated = aiDetectionRes[0]?.label === "AI" ? true : false;

      // 8️⃣ Reading time
      const readingTime = Math.ceil(cleanedText.split(/\s+/).length / 200);

      // 9️⃣ Category
      const category = payload.category || "misc";

      // --- Save Article ---
      const doc = new Article({
        title,
        summary,
        content: cleanedText,
        contentHash: hash,
        originalUrl: url,
        source: payload.source || {},
        images: extracted.images || payload.images || [],
        status: "staged",
        pubDate: payload.pubDate || new Date(),
        category,
        keywords: tags,
        tags,
        entities,
        sentiment,
        flaggedToxicity,
        fakeNewsScore,
        aiGenerated,
        readingTime,
      });

      await doc.save();
      console.log("Saved staged article (AI pipeline):", doc._id, title);

      return { id: doc._id };
    },
    { connection, concurrency: 2, timeout: 60000, lockDuration: 120000 }
  );

  worker.on("completed", (job) => console.log("Ingest job completed:", job.id));
  worker.on("failed", (job, err) => console.error("Job failed:", job?.id, err?.message || err));

  console.log("Ingest AI worker started with concurrency = 2");
  return worker;
}
