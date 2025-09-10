import { redisClient } from "../config/database.js";
import Log from "../models/Log.js";

export const createLog = async (req, res) => {
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
      }
    });

    res.status(201).json(log);
  } catch (error) {
    console.error("createLog failed:", error);
    res.status(500).json({ error: error.message });
  }
};

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
          totalCalls: { $sum: "$count" },
          successCalls: {
            $sum: {
              $cond: [{ $lt: ["$status", 400] }, "$count", 0]
            }
          },
          errorCalls: {
            $sum: {
              $cond: [{ $gte: ["$status", 400] }, "$count", 0]
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

export const getErrorLogs = async (req, res) => {
  try {
    const { date } = req.query;
    const logDate = date || new Date().toISOString().slice(0, 10);
    const key = `log_errors:${logDate}`;

    // Lấy log lỗi từ Redis
    const logs = await redisClient.lrange(key, 0, -1);

    // Parse JSON an toàn
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
