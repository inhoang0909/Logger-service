import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export default redisClient;
