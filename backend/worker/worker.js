import { redisClient } from "../config/database.js";
import Log from "../models/Log.js";

const LOG_QUEUE_KEY = process.env.LOG_QUEUE_KEY || "log_queue";
let buffer = [];
const BATCH_SIZE = 100;
const FLUSH_INTERVAL = 1000;

// Flush logs ra DB + update counter
const flushLogs = async () => {
  if (buffer.length === 0) return;
  const logsToInsert = buffer;
  buffer = [];

  try {
    console.log(`📦 Flushing ${logsToInsert.length} logs to MongoDB...`);
    await Log.insertMany(logsToInsert);

    const multi = redisClient.multi();
    for (const log of logsToInsert) {
      const counterKey = `log_counter:${log.date}`;
      const field = `${log.service}:${log.method}:${log.endpoint}:${log.status}:${log.ip}`;
      multi.hincrby(counterKey, field, 1);
    }
    await multi.exec();
    console.log(`✅ Successfully inserted ${logsToInsert.length} logs`);
  } catch (err) {
    console.error("❌ Failed to flush logs:", err.message);
  }
};

// Flush định kỳ
setInterval(flushLogs, FLUSH_INTERVAL);

// Heartbeat
setInterval(() => console.log(`❤️ Worker alive, buffer size=${buffer.length}`), 10000);

export const startWorker = async () => {
  console.log("🚀 Log worker started, waiting for logs...");

  const loop = async () => {
    try {
      const data = await redisClient.blpop(LOG_QUEUE_KEY, 0);
      console.log("📥 BLPOP raw data:", data);

      if (data && data[1]) {
        const logEntry = JSON.parse(data[1]);
        const logTime = logEntry.time || logEntry.timestamp || new Date().toISOString();

        buffer.push({
          service: logEntry.service || "unknown-service",
          endpoint: logEntry.endpoint || "unknown-endpoint",
          method: logEntry.method || "UNKNOWN",
          status: logEntry.status || 0,
          ip: logEntry.ip || "unknown-ip",
          duration: logEntry.durationMs || null,
          date: logTime.slice(0, 10),
          error: {
            message: logEntry.errorMessage || null,
            stack: logEntry.errorStack || null,
            payload: logEntry.payload || null,
          },
          createdAt: new Date(logTime),
        });

        console.log(`📥 Pulled log, buffer size=${buffer.length}`);
        if (buffer.length >= BATCH_SIZE) await flushLogs();
      }
    } catch (err) {
      console.error("⚠️ Worker error:", err.message);
    } finally {
      // gọi lại chính nó → tránh block event loop
      setImmediate(loop);
    }
  };

  loop();
};

