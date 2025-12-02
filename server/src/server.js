// src/server.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

// Connect to MongoDB
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server due to DB error:", err.message);
    process.exit(1);
  });

// Optional: Start scheduled tasks (enable later)
// import startCronJobs from "./cron/startCronJobs.js";
// startCronJobs();

// Optional: Start ingestion worker (Redis-powered)
// import startWorkers from "./jobs/startWorkers.js";
// startWorkers();
