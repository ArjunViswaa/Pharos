import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "pharos-api",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Pharos API lighting the way on http://localhost:${PORT}`);
});
