// src/controllers/ingestController.js
import { addUrlToIngestQueue } from "../jobs/ingestQueue.js";

export const ingestUrl = async (req, res) => {
  try {
    const { url, title, source } = req.body;
    if (!url) return res.status(400).json({ message: "url is required" });

    const payload = {
      link: url,
      title,
      source
    };

    await addUrlToIngestQueue(payload);
    return res.json({ message: "URL enqueued for ingestion", url });
  } catch (err) {
    console.error("ingestUrl error:", err);
    return res.status(500).json({ message: "Server error", error: err.message || err });
  }
};
