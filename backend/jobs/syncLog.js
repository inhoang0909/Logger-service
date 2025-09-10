import cron from "node-cron";
import { redisClient } from "../config/database.js";
import Log from "../models/Log.js";

const syncLogs = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("⏳ Cronjob: syncing logs from Redis to MongoDB...");

    try {
      const keys = await redisClient.keys("log_counter:*");
      for (const key of keys) {
        const counts = await redisClient.hGetAll(key);

        if (counts && Object.keys(counts).length > 0) {
          const bulkOps = [];

          for (const field in counts) {
            const [service, method, endpoint, status, ip] = field.split(":");
            const count = parseInt(counts[field], 10);

            bulkOps.push({
              updateOne: {
                filter: {
                  service,
                  endpoint,
                  method,
                  status: parseInt(status, 10),
                  ip,
                  date: new Date().toISOString().slice(0, 10),
                },
                update: {
                  $inc: { count },
                  $setOnInsert: {
                    timestamp: new Date(),
                  },
                },
                upsert: true,
              },
            });
          }

          if (bulkOps.length > 0) {
            await Log.bulkWrite(bulkOps);
          }

          await redisClient.del(key);
        }
      }

      console.log("Sync complete");
    } catch (error) {
      console.error("Error syncing Redis to MongoDB:", error.message);
    }
  });
};

export default syncLogs;
