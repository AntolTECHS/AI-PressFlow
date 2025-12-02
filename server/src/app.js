// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Existing routes
import articleRoutes from "./routes/articleRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// New ingestion route
import ingestRoutes from "./routes/ingestRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/articles", articleRoutes);
app.use("/api/users", userRoutes);

// NEW: ingestion API
app.use("/api/ingest", ingestRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("News Aggregation Backend Running");
});

export default app;
