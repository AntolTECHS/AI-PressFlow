// src/controllers/ingestController.js
import { addUrlToIngestQueue } from "../jobs/ingestQueue.js";

/**
 * Enqueue a single URL for ingestion
 * POST /api/ingest/manual
 */
export const ingestUrl = async (req, res) => {
  try {
    const { url, title, source } = req.body;
    if (!url) return res.status(400).json({ message: "url is required" });

    await addUrlToIngestQueue({ link: url, title, source });
    res.json({ message: "URL enqueued for ingestion", url });
  } catch (err) {
    console.error("ingestUrl error:", err);
    res.status(500).json({ message: "Server error", error: err.message || err });
  }
};
