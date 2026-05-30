import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB, dbStatus } from "./db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "pharos-api",
    db: dbStatus(),
    timestamp: new Date().toISOString(),
  });
});

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Pharos API lighting the way on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
