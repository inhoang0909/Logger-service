import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    const logData = {
      service: "fake-api-service",
      endpoint: req.originalUrl,
      method: req.method,
      status: res.statusCode,
      ip: req.ip,
      timestamp: new Date(),
    };

    try {
      await axios.post("http://localhost:4000/logs", logData, {
        headers: { "x-source-service": "fake-api-service" },
      });
      console.log("Log sent via HTTP:", logData.endpoint, logData.status);
    } catch (err) {
      console.error("Failed to send log:", err.message);
    }
  });

  next();
});

app.get("/api/data", (req, res) => {
  res.json({ message: "This is some fake data", timestamp: new Date() });
});

app.post("/api/data", (req, res) => {
  const received = req.body;
  res.status(201).json({ message: "Data received", received, timestamp: new Date() });
});

app.get("/api/error", (req, res) => {
  res.status(500).json({ error: "Something went wrong!", timestamp: new Date() });
});

app.listen(port, () => {
  console.log(`🚀 Fake API server running at http://localhost:${port}`);
});
