import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const LOG_QUEUE_KEY = process.env.LOG_QUEUE_KEY || "log_queue";
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redisClient = new Redis(REDIS_URL, {
  retryStrategy: () => 2000,
  reconnectOnError: () => true,
  keepAlive: 10000,
  connectTimeout: 10000,
});

redisClient.on("connect", () => console.log("🔌 Redis connected"));
redisClient.on("ready", () => console.log("✅ Redis ready"));
redisClient.on("error", (err) => console.error("❌ Redis error:", err));
redisClient.on("close", () => console.warn("⚠️ Redis connection closed"));
redisClient.on("reconnecting", () => console.log("♻️ Redis reconnecting..."));

setInterval(async () => {
  try {
    await redisClient.ping();
    console.log("📡 Redis ping OK");
  } catch (err) {
    console.error("🚨 Redis ping failed:", err);
  }
}, 30000);

export default redisClient;
export { LOG_QUEUE_KEY };