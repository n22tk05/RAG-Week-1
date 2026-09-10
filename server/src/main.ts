import express from "express";
import cors from "cors";
import { config, validateConfig } from "./config.js";
import { ingestRouter } from "./routes/ingest.route.js";
import { chatRouter } from "./routes/chat.route.js";
import { documentsRouter } from "./routes/documents.route.js";

try {
  validateConfig();
} catch (err: any) {
  console.warn("⚠️ [Config Warning]:", err?.message);
}

const app = express();
const PORT = config.port;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Mount API Routes
app.use("/api/ingest", ingestRouter);
app.use("/api/chat", chatRouter);
app.use("/api/documents", documentsRouter);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Minimal RAG Engine Server",
  });
});

// Root fallback
app.get("/", (_req, res) => {
  res.send("Minimal RAG Engine API is running. Access endpoints via /api/*");
});

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 Minimal RAG Engine Server is running on http://localhost:${PORT}`);
  });
}

export default app;