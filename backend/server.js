import express from "express";
import cors from "cors";
import { createServer } from "http";
import connectDB from "./config/database.js";
import logRoutes from "./routes/logRoutes.js";
import loggerMiddleware from "./middleware/loggerMiddleware.js";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from "./config/swagger.js";
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://10.13.32.51:8080",
  "http://10.13.34.179:5173",
  "http://10.13.34.179:4000",
  "http://0.0.0.0:4000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-source-service"],
}));
app.use(express.json());
const httpServer = createServer(app);

app.use(loggerMiddleware);
app.use("/logs", logRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


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

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Logger-service running at http://0.0.0.0:${PORT}/`);
    });

  } catch (err) {
    console.error("Failed to start server:", err.message);
  }
};
startServer();
