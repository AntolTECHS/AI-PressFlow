// src/jobs/startWorkers.js
import { startIngestWorker } from "./ingestQueue.js";
import { fetchAllConfiguredFeeds } from "../services/rssService.js";

/**
 * Starts all background workers and scheduled tasks
 */
export default async function startWorkers() {
  console.log("🚀 Starting background workers...");

  // 1️⃣ Start Ingest Worker
  try {
    startIngestWorker();
    console.log("✅ Ingest Worker started");
  } catch (err) {
    console.error("❌ Failed to start Ingest Worker:", err.message || err);
  }

  // 2️⃣ Optional: Start RSS Scheduler (poll feeds every N minutes)
  const RSS_POLL_INTERVAL = parseInt(process.env.RSS_POLL_INTERVAL || "5", 10) * 60 * 1000; // default 5 min
  setInterval(async () => {
    try {
      console.log("📡 Fetching RSS feeds...");
      const results = await fetchAllConfiguredFeeds();
      results.forEach(r => console.log(`Fetched feed: ${r.source}, items: ${r.result.count || 0}`));
    } catch (err) {
      console.error("❌ RSS Scheduler error:", err.message || err);
    }
  }, RSS_POLL_INTERVAL);

  console.log(`🕒 RSS Scheduler running every ${RSS_POLL_INTERVAL / 60000} minutes`);
}
