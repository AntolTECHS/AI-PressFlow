// src/jobs/ingestQueue.js
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { extractArticle } from "../utils/extractArticle.js";   // ⬅ REPLACED
import Article from "../models/Article.js";
import { cleanText, contentHash } from "../utils/textCleaner.js";
import { categorizeText } from "../services/nlpService.js";

// Redis connection
const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  maxRetriesPerRequest: null,
  enableReadyCheck: true
});

// Queue
export const ingestQueue = new Queue("ingestQueue", { connection });

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
export function startIngestWorker() {
  const worker = new Worker(
    "ingestQueue",
    async (job) => {
      const payload = job.data;
      const url = payload.link || payload.originalUrl;

      if (!url) throw new Error("No URL in payload");

      // ⬇️ NEW ADVANCED EXTRACTION
      const extracted = await extractArticle(url);

      if (extracted.error) {
        console.error("Extraction failed:", url, extracted.message);
        return { failed: true };
      }

      // --- TITLE ---
      const title = cleanText(
        payload.title || extracted.title || ""
      );

      // --- CONTENT ---
      const rawContent = extracted.textContent || payload.content || "";
      const content = cleanText(rawContent);

      // --- SUMMARY ---
      const summary =
        extracted.summary ||
        (content.length > 500 ? content.slice(0, 500) : content.slice(0, 200));

      // --- IMAGES ---
      const images = extracted.images || payload.images || [];

      // --- DUPLICATE DETECTION ---
      const hash = contentHash(content || title);
      const existing = await Article.findOne({
        $or: [{ originalUrl: url }, { contentHash: hash }]
      }).lean();

      if (existing) {
        console.info("Duplicate detected → skipping:", url);
        return { skipped: true, existingId: existing._id };
      }

      // --- CATEGORY (NLP) ---
      let category = await categorizeText(content);
      if (!category) category = "misc";

      // --- SAVE ---
      const doc = new Article({
        title,
        summary,
        content,
        contentHash: hash,
        originalUrl: url,
        source: payload.source || {},
        images,
        status: "staged",
        pubDate: payload.pubDate || new Date(),
        category,
      });

      await doc.save();
      console.log("Saved staged article:", doc._id, title);

      return { id: doc._id };
    },
    {
      connection,
      concurrency: 5,
      timeout: 20000,
      lockDuration: 30000
    }
  );

  worker.on("completed", (job) =>
    console.log("Ingest job completed:", job.id)
  );

  worker.on("failed", (job, err) =>
    console.error("Job failed:", job?.id, err?.message || err)
  );

  console.log("Ingest worker started with concurrency = 5");
  return worker;
}
