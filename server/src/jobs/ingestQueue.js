// src/jobs/ingestQueue.js
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { scrapeUrl } from "../services/scraperService.js";
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

      // Scrape
      const scraped = await scrapeUrl(url).catch(() => null);

      const title = (payload.title || scraped?.title || "").trim();
      const rawContent = (scraped?.content || payload.content || "").trim();
      const content = cleanText(rawContent);

      const summary = scraped?.summary ||
        (content.length > 500 ? content.slice(0, 500) : content.slice(0, 200));

      const images = scraped?.images || payload.images || [];

      // Duplicate detection
      const hash = contentHash(content || title);
      const existing = await Article.findOne({
        $or: [{ originalUrl: url }, { contentHash: hash }]
      }).lean();

      if (existing) {
        console.info("Duplicate detected, skipping:", url);
        return { skipped: true, existingId: existing._id };
      }

      // NLP Category
      let category = await categorizeText(content);
      if (!category) category = "misc";

      // Save staged article
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
      concurrency: 5,           // NEW
      timeout: 20000,           // NEW
      lockDuration: 30000       // NEW
    }
  );

  worker.on("completed", (job) => console.log("Ingest job completed:", job.id));
  worker.on("failed", (job, err) => console.error("Job failed:", job?.id, err?.message || err));

  console.log("Ingest worker started with concurrency = 5");
  return worker;
}
