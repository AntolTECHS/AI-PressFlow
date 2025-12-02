// src/services/rssService.js
import Parser from "rss-parser";
import { addUrlToIngestQueue } from "../jobs/ingestQueue.js";
import Source from "../models/Source.js"; // optional: your Source model

const parser = new Parser({
  // you can set custom headers here if needed
  headers: { "User-Agent": "NewsAggregatorBot/1.0 (+https://yourdomain.example)" }
});

/**
 * fetchRssFeed(url) - fetches entries from one RSS feed
 * and enqueues each item for processing.
 */
export async function fetchRssFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    const items = feed.items || [];

    for (const item of items) {
      const payload = {
        title: item.title,
        link: item.link || item.guid,
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        source: {
          name: feed.title || null,
          feedUrl: url,
        },
        raw: item
      };

      // Add to background ingestion queue (deferred processing)
      await addUrlToIngestQueue(payload);
    }

    return { success: true, count: items.length };
  } catch (err) {
    console.error("fetchRssFeed error:", err.message || err);
    return { success: false, error: err.message || err };
  }
}

/**
 * fetchAllConfiguredFeeds() - iterate your Sources collection (recommended)
 * or accept a list; here we try reading from your Source DB collection.
 */
export async function fetchAllConfiguredFeeds() {
  try {
    const sources = await Source.find({ type: "rss" }).lean();
    const results = [];

    for (const s of sources) {
      const res = await fetchRssFeed(s.endpoint);
      results.push({ source: s.name || s.endpoint, result: res });
    }
    return results;
  } catch (err) {
    console.error("fetchAllConfiguredFeeds error:", err);
    throw err;
  }
}
