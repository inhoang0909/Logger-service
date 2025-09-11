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
      time: new Date(),
    };

    axios.post("http://localhost:4000/logs", logData, {
      headers: { "x-source-service": "fake-api-service" },
    })
      .then(() => {
        console.log("Log sent via HTTP:", logData.endpoint, logData.status);
      })
      .catch(err => {
        console.error("Failed to send log:", err.message);
        if (err.response) console.error('Response data:', err.response.data);
        if (err.code) console.error('Error code:', err.code);
      });
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
  console.log(`Server running at http://localhost:${port}`);
});
