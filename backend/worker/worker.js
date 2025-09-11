import 'dotenv/config';
import connectDB from "../config/database.js";
import Redis from "ioredis";
import Log from "../models/Log.js";

const LOG_QUEUE_KEY = process.env.LOG_QUEUE_KEY || "log_queue";
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient;
let buffer = [];
const BATCH_SIZE = 100;
const FLUSH_INTERVAL = 1000;
let isShuttingDown = false;

/** Sleep helper */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/** Flush logs to DB + Redis counter */
const flushLogs = async () => {
  if (buffer.length === 0) return;
  const logs = buffer.splice(0, buffer.length); // clone & clear
  try {
    await Log.insertMany(logs);
    const multi = redisClient.multi();
    logs.forEach((log) => {
      const counterKey = `log_counter:${log.date}`;
      const field = `${log.service}:${log.method}:${log.endpoint}:${log.status}:${log.ip}`;
      multi.hincrby(counterKey, field, 1);
    });
    await multi.exec();
    console.log(`✅ Flushed ${logs.length} logs`);
  } catch (err) {
    console.error("❌ flushLogs error:", err.message);
    buffer.unshift(...logs); // put back nếu fail
  }
};

/** Connect to Redis with retry (ioredis auto-reconnect nhưng thêm retry cho chắc) */
const connectRedis = async () => {
  while (true) {
    try {
      redisClient = new Redis(REDIS_URL, {
        retryStrategy(times) {
          const delay = Math.min(times * 1000, 5000);
          console.log(`⏳ Redis reconnect in ${delay / 1000}s`);
          return delay;
        },
      });

      redisClient.on("connect", () => console.log("🔌 Redis connecting..."));
      redisClient.on("ready", () => console.log("✅ Redis ready"));
      redisClient.on("error", (err) => console.error("Redis error:", err.message));
      redisClient.on("end", () => console.log("❌ Redis disconnected"));

      // test connection
      await redisClient.ping();
      console.log("✅ Redis connected (ping ok)");
      break;
    } catch (err) {
      console.error("❌ Redis connect failed:", err.message);
      console.log("⏳ Retry in 5s...");
      await sleep(5000);
    }
  }
};

/** Worker loop: pull log from queue */
const startWorker = async () => {
  console.log("🚀 Worker started");
  setInterval(flushLogs, FLUSH_INTERVAL);

  while (!isShuttingDown) {
    try {
      const data = await redisClient.blpop(LOG_QUEUE_KEY, 0);
      if (data && data[1]) {
        const logEntry = JSON.parse(data[1]);
        buffer.push({
          service: logEntry.service || "unknown",
          endpoint: logEntry.endpoint || "unknown",
          method: logEntry.method || "UNKNOWN",
          status: logEntry.status || 0,
          ip: logEntry.ip || "unknown",
          date: (logEntry.time || new Date()).toString().slice(0, 10),
          createdAt: new Date(logEntry.time || Date.now()),
        });
        console.log(`📥 Pulled log, buffer size=${buffer.length}`);
        if (buffer.length >= BATCH_SIZE) {
          await flushLogs();
        }
      }
    } catch (err) {
      console.error("❌ Error in BLPOP:", err.message);
      console.log("⏳ Retry BLPOP in 2s...");
      await sleep(2000);
    }
  }
};

/** Graceful shutdown */
const shutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log("🛑 Shutting down worker...");
  try {
    await flushLogs();
    if (redisClient) await redisClient.quit();
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err.message);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

(async () => {
  try {
    await connectDB();
    await connectRedis();
    await startWorker();
  } catch (err) {
    console.error("Worker startup failed:", err.message);
    process.exit(1);
  }
})();
