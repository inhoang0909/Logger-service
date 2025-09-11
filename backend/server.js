import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import connectDB from "./config/database.js";
import logRoutes from "./routes/logRoutes.js";
import loggerMiddleware from "./middleware/loggerMiddleware.js";
import { startWorker } from "./worker/worker.js";

dotenv.config();
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"], // Add your frontend URL here
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-source-service"],
};

app.use(cors(corsOptions));
app.use(express.json());

const httpServer = createServer(app);

app.use(loggerMiddleware);
app.use("/logs", logRoutes);
app.use((err, req, res, next) => {
  res.locals.errorMessage = err.message;
  res.locals.errorStack = err.stack;

  res.status(500).json({
    error: err.message,
    timestamp: new Date()
  });
});
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    startWorker();
    httpServer.listen(PORT, () => {
      console.log(`Logger-service running at http://localhost:${PORT}/`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
  }
};

startServer();
