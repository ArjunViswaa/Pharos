import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectDB, dbStatus } from "./db.js";
import authRouter from "./routes/auth.js";
import mentorsRouter from "./routes/mentors.js";
import slotsRouter from "./routes/slots.js";
import bookingsRouter from "./routes/bookings.js";
import paymentsRouter from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "pharos-api",
    db: dbStatus(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);

app.use("/api/mentors", mentorsRouter);

app.use("/api/slots", slotsRouter);

app.use("/api/bookings", bookingsRouter);

app.use("/api/payments", paymentsRouter);

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
