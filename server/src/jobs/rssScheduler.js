// src/jobs/rssScheduler.js
import cron from "node-cron";
import { fetchAllConfiguredFeeds } from "../services/rssService.js";

export const startRssScheduler = () => {
  // run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("Fetching all configured RSS feeds...");
    const results = await fetchAllConfiguredFeeds();
    console.log("RSS fetch results:", results);
  });

  console.log("RSS scheduler started (every 5 minutes)");
};
