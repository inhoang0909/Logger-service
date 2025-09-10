import mongoose from "mongoose";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL);
redisClient.on("error", console.error);
redisClient.ping().then(console.log);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export { redisClient };
export default connectDB;
