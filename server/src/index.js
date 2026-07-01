import express from "express";
import cors from "cors";
import "dotenv/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

import { connectDB, dbStatus } from "./db.js";
import authRouter from "./routes/auth.js";
import mentorsRouter from "./routes/mentors.js";
import slotsRouter from "./routes/slots.js";
import bookingsRouter from "./routes/bookings.js";
import paymentsRouter from "./routes/payments.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(mongoSanitize());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error : "Too many requests"}
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error : "Too many requests"}
});

app.use("/api", generalLimiter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "pharos-api",
    db: dbStatus(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authLimiter, authRouter);

app.use("/api/mentors", mentorsRouter);

app.use("/api/slots", slotsRouter);

app.use("/api/bookings", bookingsRouter);

app.use("/api/payments", paymentsRouter);

app.use("/api/admin", adminRouter);

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
