import redisClient from "../config/redis.js";
import {
  createLogDirectService,
  getLogStatsService,
  getMonthlyStatsService,
} from "../services/loggerService.js";
import dotenv from "dotenv";

dotenv.config();
const LOG_QUEUE_KEY = process.env.LOG_QUEUE_KEY || "log_queue";

export const enqueueLog = async (req, res) => {
  try {
    const logData = req.body;
    if (!logData || typeof logData !== "object")
      return res.status(400).json({ error: "Invalid log format" });

    if (logData.endpoint === "/favicon.ico")
      return res.status(200).json({ success: false, message: "Skipped favicon" });

    await redisClient.rpush(LOG_QUEUE_KEY, JSON.stringify(logData));
    res.status(200).json({ success: true, message: "Log enqueued" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createLogDirect = async (req, res) => {
  try {
    if (req.body.endpoint === "/favicon") {
      return res.status(200).json({ success: false, message: "Skipped /favicon" });
    }

    const log = await createLogDirectService(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getLogStats = async (req, res) => {
  try {
    const stats = await getLogStatsService();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, data: [], message: err.message });
  }
};

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
      message: `Fetched error logs for ${logDate}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, data: [], message: err.message });
  }
};

export const getMonthlyStats = async (req, res) => {
  try {
    const stats = await getMonthlyStatsService(req.query.month, req.query.year);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
