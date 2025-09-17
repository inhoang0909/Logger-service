import 'dotenv/config';
import connectDB from "../config/database.js";
import redisClient, { LOG_QUEUE_KEY } from "../config/redis.js";
import Log from "../models/Log.js";

let buffer = [];
const BATCH_SIZE = 100;
const FLUSH_INTERVAL = 1000;
let isShuttingDown = false;

/** Sleep helper */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/** Flush logs to DB + Redis counter */
const flushLogs = async () => {
  if (buffer.length === 0) return;
  const logs = buffer.splice(0, buffer.length);
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
    buffer.unshift(...logs); // rollback buffer
  }
};

/** Worker loop: BLPOP with timeout */
const startWorker = async () => {
  console.log("🚀 Worker started");
  setInterval(flushLogs, FLUSH_INTERVAL);

  while (!isShuttingDown) {
    try {
      // BLPOP timeout 5s thay vì block vô hạn
      const data = await redisClient.blpop(LOG_QUEUE_KEY, 5);
      if (data && data[1]) {
        const logEntry = JSON.parse(data[1]);
        console.log('Log entry before buffer push:', logEntry);
        buffer.push({
          service: logEntry.service || "unknown",
          endpoint: logEntry.endpoint || "unknown",
          method: logEntry.method || "UNKNOWN",
          status: logEntry.status || 0,
          ip: logEntry.ip || "unknown",
          date: new Date(logEntry.time || Date.now()),
          createdAt: new Date(logEntry.time || Date.now()),
        });
        console.log(`📥 Pulled log, buffer size=${buffer.length}`);
        if (buffer.length >= BATCH_SIZE) {
          await flushLogs();
        }
      }
    } catch (err) {
      console.error("❌ Error in BLPOP:", err.message);
      await sleep(2000);
    }
  }
};

/** Ping Redis định kỳ để giữ kết nối sống */
const startHeartbeat = () => {
  setInterval(async () => {
    try {
      await redisClient.ping();
      console.log("💓 Redis heartbeat ok");
    } catch (err) {
      console.error("⚠️ Redis heartbeat failed:", err.message);
    }
  }, 30000); // 30s
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
    // await connectRedis(); // not needed
    startHeartbeat(); // bắt đầu ping Redis
    await startWorker();
  } catch (err) {
    console.error("Worker startup failed:", err.message);
    process.exit(1);
  }
})();
