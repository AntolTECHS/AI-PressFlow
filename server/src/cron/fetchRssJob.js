// src/cron/fetchRssJob.js
import cron from "node-cron";
import { fetchAllConfiguredFeeds } from "../services/rssService.js";

export function startRssCron() {
  // every 5 minutes
  const task = cron.schedule("*/5 * * * *", async () => {
    console.log("[cron] Running RSS fetch job:", new Date().toISOString());
    try {
      const results = await fetchAllConfiguredFeeds();
      console.log("[cron] RSS fetch results:", results);
    } catch (err) {
      console.error("[cron] RSS fetch error:", err.message || err);
    }
  }, {
    scheduled: true,
    timezone: process.env.TZ || "UTC"
  });

  task.start();
  return task;
}
