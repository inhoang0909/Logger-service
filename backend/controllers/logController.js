import Redis from "ioredis";
import Log from "../models/Log.js";
import dotenv from "dotenv";
dotenv.config();
const LOG_QUEUE_KEY = process.env.LOG_QUEUE_KEY || "log_queue";

const redisClient = new Redis(process.env.REDIS_URL, {
  retryStrategy(times) {
    return Math.min(times * 50, 2000); 
  },
});
export const enqueueLog = async (req, res) => {
  try {
    console.log("Received logData:", req.body);

    const logData = req.body;
    if (!logData || typeof logData !== "object") {
      return res.status(400).json({ error: "Invalid log format" });
    }

    console.log("➡️ Pushing to Redis queue:", LOG_QUEUE_KEY);
    const result = await redisClient.rpush(
      LOG_QUEUE_KEY,
      JSON.stringify(logData)
    );
    console.log(`📤 Enqueued log to ${LOG_QUEUE_KEY}, new length=${result}`);

    res.status(200).json({ success: true, message: "Log enqueued" });
  } catch (error) {
    console.error("❌ enqueueLog failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// POST /logs/direct → Ghi log trực tiếp vào MongoDB (không qua Redis)
export const createLogDirect = async (req, res) => {
  try {
    const {
      service,
      endpoint,
      method,
      status,
      ip,
      duration,
      errorMessage,
      errorStack,
      payload
    } = req.body;

    const log = await Log.create({
      service,
      endpoint,
      method,
      status,
      ip,
      duration,
      date: new Date().toISOString().slice(0, 10),
      error: {
        message: errorMessage || null,
        stack: errorStack || null,
        payload: payload || null
      },
      createdAt: new Date()
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    console.error("createLogDirect failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /logs/stats → Trả về thống kê log
export const getLogStats = async (req, res) => {
  try {
    const stats = await Log.aggregate([
      {
        $group: {
          _id: {
            service: "$service",
            endpoint: "$endpoint",
            method: "$method",
            status: "$status",
            ip: "$ip",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          totalCalls: { $sum: 1 },
          successCalls: {
            $sum: {
              $cond: [{ $lt: ["$status", 400] }, 1, 0]
            }
          },
          errorCalls: {
            $sum: {
              $cond: [{ $gte: ["$status", 400] }, 1, 0]
            }
          }
        }
      },
      { $sort: { "_id.date": -1 } }
    ]);

    res.json({
      success: true,
      data: stats,
      message: "Log stats fetched successfully"
    });
  } catch (error) {
    console.error("getLogStats failed:", error);
    res.status(500).json({
      success: false,
      data: [],
      message: error.message
    });
  }
};

// GET /logs/errors → Trả về log lỗi theo ngày
export const getErrorLogs = async (req, res) => {
  try {
    const { date } = req.query;
    const logDate = date || new Date().toISOString().slice(0, 10);
    const key = `log_errors:${logDate}`;

    const logs = await redisClient.lrange(key, 0, -1);

    const parsedLogs = logs.map((log) => {
      try {
        return JSON.parse(log);
      } catch {
        return { raw: log };
      }
    });

    res.json({
      success: true,
      data: parsedLogs,
      message: `Fetched error logs for ${logDate}`
    });
  } catch (error) {
    console.error("getErrorLogs failed:", error);
    res.status(500).json({
      success: false,
      data: [],
      message: error.message
    });
  }
};
//GET monthly stats
export const getMonthlyStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();

    const targetMonth = parseInt(month) || now.getMonth() + 1; // JS month 0-11
    const targetYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const stats = await Log.aggregate([
      {
        $match: { timestamp: { $gte: startDate, $lte: endDate } },
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$timestamp" },
            month: { $month: "$timestamp" },
            year: { $year: "$timestamp" },
          },
          totalCalls: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const formatted = stats.map((s) => ({
      date: `${s._id.year}-${String(s._id.month).padStart(2, "0")}-${String(
        s._id.day
      ).padStart(2, "0")}`,
      totalCalls: s.totalCalls,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}