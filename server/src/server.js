// src/server.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

// Ingestion & scheduler imports
import { startIngestWorker } from "./jobs/ingestQueue.js";
import { startRssScheduler } from "./jobs/rssScheduler.js";

// Connect to MongoDB
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Start Redis-based ingestion worker
    startIngestWorker();

    // Start RSS feed scheduler
    startRssScheduler();

  })
  .catch((err) => {
    console.error("❌ Failed to start server due to DB error:", err.message);
    process.exit(1);
  });
